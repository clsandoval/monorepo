# 3.09a — Blocking Hook Semantics: The Handshake Protocol

**Aspect:** 3.09a — Blocking hook semantics: hooks that require both sender and receiver to be "ready" (not busy, in range, buffer not full) — implicit timing without a global clock (from TIS-100 blocking port model)
**Wave:** 3 (Building Blocks)
**Category:** Hook Mechanics
**Related aspects:** 1.04d (blocking vs. queued hook semantics), 3.08 (hook taxonomy), 3.09 (hook chaining), 3.10 (hook visualization), 3.10b (signal latency legibility), 5.18 (first deadlock tutorial mission), 2.01 (fixed-slot buffer model), 4.07a (visual treatment of blocked vs. executing)

---

## The Mechanic: Handshake Hooks vs. Fire-and-Forget

Fire-and-forget hooks are postal mail. You write a letter, drop it in the box, and walk away. Maybe it arrives. Maybe the mailbox at the other end is full and the postman shoves it in the gutter. You never know. You've already moved on.

Blocking hooks are a handshake. You extend your hand. You stand there, arm outstretched, until the other person grips it. Neither of you can do anything else until the shake completes. If they never reach out — you stand there forever, arm extended, frozen mid-gesture, while the world moves on around you.

In TIS-100, this is the fundamental communication model. `MOV ACC RIGHT` on Node A blocks until Node B executes `MOV LEFT ACC`. Both nodes halt their instruction cycle. Both burn zero compute. The moment both are in position — sender offering, receiver ready — the value transfers atomically and both resume. No buffer. No queue. No loss. No ambiguity about timing. The rendezvous IS the synchronization.

**Applied to Robot Uprising, a blocking hook works like this:**

1. **Sender fires a hook.** The trigger condition is met (ON_OBSERVE, ON_THREAT, etc.). The hook attempts to transmit a signal on its named channel.
2. **Readiness check — sender side.** The sender must not be executing another action (not mid-skill, not stunned, not already blocked on a different hook). If the sender is busy, the hook trigger is deferred until the sender is idle.
3. **Readiness check — receiver side.** The intended receiver must satisfy three conditions simultaneously: (a) not busy (not mid-skill, not stunned, not already blocked), (b) in range (within the hook's spatial radius, if range mechanics from 3.10a apply), and (c) buffer not full (at least one free slot in the incoming buffer).
4. **If both ready: The Handshake.** Signal transfers atomically. Both agents continue executing on the next tick. The signal occupies one buffer slot on the receiver. The sender's hook slot is freed.
5. **If either NOT ready: The Wait.** The sender enters a **BLOCKED** state. It cannot execute any other action — no skills, no movement, no other hooks. It stands there, arm extended, waiting. The hook remains "pending" on the sender's hook slot, occupying it. The sender will remain blocked until the receiver becomes ready, or until a timeout expires (if timeout mechanics exist), or until the match ends.

**"The Handshake Hook"** — the community name for this pattern. Two units reaching for each other across the battlefield. The moment their timing aligns, information flows instantly and perfectly. The moment it doesn't, one of them freezes.

### How Blocking Interacts with the Tick System

The tick-based execution model (1 tick per hop, each unit acts once per tick) creates specific interactions with blocking:

- **Blocking costs zero ticks but burns all of them.** A blocked unit doesn't "use" its tick — it simply doesn't act. It is not idle (idle units evaluate rules); it is not busy (busy units are mid-skill). It is BLOCKED — a third state, mechanically distinct, where the unit's entire decision loop is suspended waiting for an external condition.
- **Blocking is NOT the same as "slow."** A fire-and-forget signal through a Scout-Relay-Striker chain takes 3 ticks but all units remain active during transit. A blocking hook between Scout and Relay takes 1 tick (if Relay is ready immediately) but if Relay is busy, the Scout is completely offline. The trade-off is not latency vs. speed — it is guaranteed delivery vs. guaranteed availability.
- **Blocking interacts with signal latency.** The locked spec says 1 tick per hop. With blocking, does the sender block for the transit duration PLUS the receiver readiness wait? Or does blocking only apply at the receiver endpoint? Design sub-question: does the signal travel to the receiver's tile (1 tick/hop) and THEN check readiness, or does the sender pre-check readiness before sending? The former is "late blocking" (signal travels, then waits at the door); the latter is "early blocking" (sender waits before transmitting, signal doesn't enter the network until the receiver is confirmed ready). Early blocking is TIS-100's model. Late blocking is TCP's model (packet arrives, SYN-ACK handshake at the receiver).

### The Hybrid Model: "The Selective Handshake"

The most promising design variant: hooks are fire-and-forget by default, but individual hooks can be configured as BLOCKING by the player. This is a per-hook toggle in the workbench — a small lock icon that the player clicks to switch between fire-and-forget (open padlock, signal streams freely) and blocking (closed padlock, handshake required).

**Why hybrid matters:** It lets the player choose their failure mode. Fire-and-forget risks signal loss. Blocking risks deadlock. The player's job is to decide which signals are critical enough to guarantee (blocking) and which are routine enough to tolerate loss (fire-and-forget). A scout's routine position report? Fire-and-forget — if the relay misses one, the next report will arrive in a few ticks. A command unit's "ALL UNITS RETREAT" order? Blocking — this must arrive, even if the command unit freezes waiting for confirmation.

The decision of which hooks to block becomes one of the deepest strategic choices in the game. It is the Robot Uprising equivalent of choosing TCP vs. UDP for each connection in a distributed system.

### Deadlock: The Handshake That Never Completes

**"The Deadlock Dance"** — the community name for this failure mode. Two agents, each with a blocking hook targeting the other, both entering BLOCKED state simultaneously. Agent A extends its hand toward B. Agent B extends its hand toward A. Both are waiting. Neither can accept the other's handshake because accepting requires being in a "ready" state, and a BLOCKED agent is not ready.

Deadlock conditions (the Coffman conditions, transplanted into Robot Uprising):
1. **Mutual exclusion** — a blocked agent cannot accept incoming signals (it is not "ready")
2. **Hold and wait** — the blocked agent holds its hook slot occupied while waiting for the receiver
3. **No preemption** — a blocked hook cannot be forcibly canceled (unless the player designs a timeout rule)
4. **Circular wait** — A blocks on B, B blocks on A

The simplest deadlock: Scout has a blocking hook to Relay on `recon-net`. Relay has a blocking hook to Scout on `feedback-net`. Scout spots an enemy and fires its blocking hook. Simultaneously, Relay finishes a compression cycle and fires its feedback hook to Scout. Both enter BLOCKED. The battlefield has two frozen units and a gap in the perimeter that the enemy walks through.

More insidious: the **transitive deadlock chain**. Scout blocks on Relay-A. Relay-A blocks on Relay-B. Relay-B blocks on the Scout (circular dependency through three units). Each unit appears individually functional — "it's just waiting for the next unit in the chain." The circularity is only visible when you trace the entire dependency graph. This is the Robot Uprising version of a distributed deadlock in a microservice mesh.

---

## Player Journeys

#### Journey: Kai, 16, High School Student — The First Deadlock

**Context:** Kai has completed Missions 1-6 using fire-and-forget hooks exclusively. He's experienced signal loss — a scout's critical observation dropped because the relay's buffer was full during a chaotic battle. Mission 7 ("Gridlock") has just unlocked blocking hooks. Kai is eager to "fix" his signal loss problem by making everything blocking.

**Minute 0:00 — The Workbench, Mission 7 Briefing**
The mission briefing scrolls across the terminal: *"New capability unlocked: BLOCKING HOOKS. Toggle the lock icon on any hook to guarantee delivery. Warning: blocking agents cannot act while waiting."* Kai reads this, shrugs. "Obviously I want guaranteed delivery." He opens his Scout blueprint. The hook editor shows `ON_OBSERVE → SEND position ON recon-net`. Next to the channel name, a tiny open padlock icon. Kai clicks it. The padlock snaps closed with a satisfying metallic *clk*. The hook line in the editor shifts from a dashed line to a solid line with a small handshake icon at the midpoint. He does the same for the Relay's forwarding hook and the Relay's feedback hook to the Scout. Three hooks, all blocking.

**Minute 1:30 — Deploy**
Kai places his units on the Cebu city map. Narrow streets, tall buildings. Scout at the south chokepoint, Relay on a rooftop, Striker behind cover to the north. He hits EXECUTE. The sealed watch begins.

**Minute 2:00 — Tick 1-4, Everything Works**
Scout patrols the chokepoint. No enemies yet. The network is quiet. Kai watches the battlefield — the solid hook lines glow faintly between his units, pulsing with a slow heartbeat rhythm. "Those look cool," he thinks. The padlock icons are visible as tiny glints on the lines.

**Minute 2:15 — Tick 5, First Contact**
The Scout spots two enemies entering the chokepoint simultaneously. Its `ON_OBSERVE` hook fires — the solid line between Scout and Relay flashes bright cyan, and a luminous dot races toward the Relay. But simultaneously, the Relay has finished compressing old data and fires its feedback hook toward the Scout. A gold dot races the opposite direction along `feedback-net`. The Scout, having just fired its blocking send, enters BLOCKED — arm extended, waiting for the Relay to accept. The Relay, having just fired its blocking feedback, enters BLOCKED — arm extended, waiting for the Scout to accept.

**Minute 2:20 — Tick 6, The Freeze**
Both dots reach their destinations. Both recipients are BLOCKED. Neither can accept. The dots... stop. They hover at the receiving end of each line, pulsing, unable to enter. The Scout's unit sprite shifts from its patrol animation to a new pose: arm extended forward, a faint amber glow around its chassis, completely still. The Relay does the same. A low, discordant hum begins — two notes a half-step apart, beating against each other. The BLOCKED indicator appears on both units: a small amber padlock icon above each one, pulsing in alternation. Scout pulses. Relay pulses. Scout pulses. Relay pulses. Out of sync, like two clocks that will never align.

Kai leans forward. "Wait — why did they stop?"

**Minute 2:30 — Tick 7-9, The Consequence**
The two enemies advance through the unmonitored chokepoint. The Striker, receiving no signal from the relay (nothing is coming — the relay is frozen), continues its idle patrol pattern. The enemies flank the Striker. One-shot-one-kill. Striker down at tick 9. Kai watches his Striker explode while his Scout and Relay stand motionless ten tiles away, hands outstretched toward each other.

**Minute 2:45 — Tick 10, The Alarm**
A new sound: a sharp, two-tone klaxon — *dah-DIT, dah-DIT* — the deadlock alarm. The two frozen units flash red-amber simultaneously. The amber padlock icons above them connect with a thin red line, forming a visible cycle: Scout→Relay→Scout. The cycle pulses. The sound is impossible to ignore. Kai knows something is deeply wrong.

**Minute 3:00 — Mission Failed, Debrief**
The sealed watch ends. Mission failed. Kai enters the Inspector. He clicks the Scout at tick 5. The action log reads: `HOOK FIRED: recon-net [BLOCKING] → RELAY-A | STATUS: WAITING (receiver BLOCKED)`. He clicks the Relay at tick 5: `HOOK FIRED: feedback-net [BLOCKING] → SCOUT-A | STATUS: WAITING (receiver BLOCKED)`. The dependency graph appears as a sidebar visualization: two nodes, two arrows, a perfect circle. The label reads: **DEADLOCK DETECTED — Tick 5.** The Inspector highlights the fix with a gentle tooltip: *"Both agents tried to send at the same time. Consider making one of these hooks fire-and-forget."*

**Minute 4:00 — The Fix**
Kai returns to the workbench. He stares at his two blocking hooks. He clicks the padlock on the Relay's feedback hook — *clk* — it opens. The solid line becomes dashed again. The feedback hook is now fire-and-forget. The recon hook stays blocking. He redeploys. This time, when the Scout sends its blocking observation, the Relay's feedback fires but doesn't block — the feedback signal drops if the Scout is busy, and that's fine. The Scout's critical observation reaches the Relay without deadlock. The Striker gets the alert. Mission complete.

Kai leans back. He gets it now. Not everything deserves a handshake.

---

#### Journey: Priya, 28, Backend Developer — The Reliable Scout-Striker Coordination

**Context:** Priya is on Mission 9, deep in the campaign. She's a professional software engineer who recognized the blocking/async pattern immediately. She's building a precision strike configuration where a Scout spots a high-value target and the Striker must act on EXACTLY that signal — no stale data, no dropped messages. She wants TCP reliability for her kill chain.

**Minute 0:00 — The Workbench, Architecture Planning**
Priya sketches her wiring on paper before touching the workbench. She draws: Scout → [blocking, `target-lock`] → Striker. One hop. No relay. She deliberately avoids a relay in the kill chain — every hop is latency, and blocking already guarantees delivery. The relay handles routine position updates on a separate fire-and-forget channel (`area-scan`). She labels her diagram: "Hot path: blocking. Cold path: fire-and-forget." She grins — this is exactly how she architects microservices at work.

**Minute 1:00 — Hook Configuration**
She opens the Scout blueprint. Two hook slots. Slot 1: `ON_OBSERVE [enemy_striker] → SEND target_position ON target-lock [BLOCKING]`. She clicks the padlock closed. The solid line appears. Slot 2: `ON_OBSERVE [any] → SEND area_data ON area-scan [FIRE-AND-FORGET]`. Open padlock. Dashed line. The Striker's hook config: Slot 1: `ON_RECEIVE [target-lock] → ACTIVATE intercept_skill`. Slot 2: `ON_RECEIVE [area-scan] → UPDATE context`.

**Minute 2:00 — Deploy and First Sealed Watch**
Map: open terrain with scattered cover. Priya places the Scout forward, Striker two tiles behind. She hits EXECUTE. Tick 3: Scout spots an enemy striker at range. The `target-lock` hook fires. A solid cyan line blazes between Scout and Striker — a single luminous dot, brighter than the dashed-line signals, races from Scout to Striker. The Striker is idle (not mid-skill, not stunned, buffer has space). The handshake completes instantly. The Striker snaps to action — intercept skill activates, movement begins. One tick from observation to response. Meanwhile, the Scout also fires its fire-and-forget `area-scan` hook — a dimmer dot on a dashed line floats toward the relay. The relay might get it, might not. Doesn't matter.

**Minute 2:30 — The Critical Moment**
Tick 7: The Scout spots a second threat while the Striker is mid-engagement (busy executing intercept skill). The `target-lock` blocking hook fires. The Scout extends its hand — solid cyan line pulses. But the Striker is busy. The Scout enters BLOCKED. Its amber glow appears. Priya watches: the Scout is frozen, unable to report the second enemy on `area-scan` (both hook slots are effectively offline — slot 1 is BLOCKED, and the Scout's entire action loop is suspended). The second enemy advances undetected for two ticks.

Tick 9: The Striker finishes its engagement. It becomes ready. The handshake completes — the second target position transfers. The Striker pivots to the new threat. Two ticks of blindness, but the signal was guaranteed. No stale data. The Striker acts on a position that is exactly 2 ticks old (transit time + block wait), not 5 ticks old from a dropped-and-retried fire-and-forget chain.

**Minute 3:30 — Debrief Analysis**
Priya scrubs the Inspector to tick 7. She sees the Scout's BLOCKED state. She sees the two ticks of lost `area-scan` coverage. She nods — this is the cost. The blocking hook guaranteed the kill chain's integrity, but it created a coverage gap during the block. She notes: "Need a second Scout so area coverage doesn't depend on a single unit that might block." She adds to her architecture: two Scouts, staggered patrol timing, so one is always free to report while the other might be blocked. Redundancy as deadlock mitigation. The same pattern she uses with redundant service instances at work.

---

#### Journey: Zara, 34, Competitive Player — The Synchronized Relay Chain

**Context:** Zara is building a Gauntlet configuration for the current season. She's designing a four-unit relay chain that uses blocking hooks to create an implicit clock — a synchronized data pipeline where each relay processes exactly one signal per tick, in sequence, without any global timing mechanism. She calls it "The Peristaltic Pump" — data moves through the chain like food through a digestive tract, each segment contracting in sequence.

**Minute 0:00 — Architecture on the Whiteboard**
Zara's design: Scout → Relay-A → Relay-B → Relay-C → Command. Each relay has a specific skill: Relay-A compresses, Relay-B filters, Relay-C amplifies. The critical insight: she uses blocking hooks between each pair, but stagers the initial timing so that each relay is "receiving" when its upstream neighbor is "sending." The pipeline flows because the readiness windows overlap by design, not by accident.

She configures each relay's rules to cycle: RECEIVE (1 tick) → PROCESS (1 tick) → SEND (1 tick) → RECEIVE (1 tick). Three-tick cycle per relay. She offsets the cycles: Relay-A starts at tick 0 (RECEIVE), Relay-B starts at tick 1 (RECEIVE), Relay-C starts at tick 2 (RECEIVE). When Relay-A finishes processing and sends at tick 2, Relay-B is entering its RECEIVE phase at tick 2. Handshake completes. Relay-B processes at tick 3, sends at tick 4 — Relay-C enters RECEIVE at tick 4. Perfect pipeline.

**Minute 2:00 — The First Test**
She deploys against a Gauntlet practice opponent. Sealed watch begins. The relay chain activates on the Scout's first observation at tick 3. The signal enters the pipeline. Tick 3: Scout → Relay-A (handshake, cyan flash on the solid line). Tick 4: Relay-A compresses (amber glow, compression particles). Tick 5: Relay-A → Relay-B (handshake, gold flash). Tick 6: Relay-B filters (green glow, filter particles). Tick 7: Relay-B → Relay-C (handshake). Tick 8: Relay-C amplifies (white glow, amplification particles). Tick 9: Relay-C → Command (handshake, the signal arrives at full strength, compressed, filtered, amplified).

Six ticks from observation to command. Slow — but the signal is pristine. No loss, no corruption, no stale data. The Command unit receives a single, high-quality intelligence packet. In a long match (60+ ticks), this pipeline processes 8-9 observations reliably. Zara's opponent, using fire-and-forget with a flat Scout→Striker topology, gets faster responses but frequently acts on stale or incomplete data.

**Minute 3:30 — The Pipeline Stall**
Tick 22: An enemy EMP skill hits Relay-B. Stunned for 2 ticks. Relay-A finishes processing at tick 23 and tries to send to Relay-B. Relay-B is stunned (not ready). Relay-A enters BLOCKED. Its amber glow appears. Now Relay-A can't receive from the Scout. The Scout fires its blocking hook at tick 24 — BLOCKED. The entire pipeline is frozen, propagating backward from the stun point.

Zara watches the chain light up with amber padlocks, one after another, like dominoes falling in reverse. Scout → Relay-A → (stun) Relay-B. Three units frozen because one relay got stunned. The enemy, reading the sudden silence (no EM emissions from the chain for 2+ ticks), advances aggressively.

Tick 25: Relay-B recovers from stun. Its RECEIVE phase activates. The handshake with Relay-A completes — Relay-A unblocks. Next tick, Scout's handshake with Relay-A completes — Scout unblocks. The pipeline flushes in 2 ticks and resumes. But during those 3 ticks of silence, the enemy repositioned. The Command unit's next order is based on 6-tick-old intelligence. The configuration recovers but the position is compromised.

**Minute 5:00 — The Debrief and Iteration**
Zara opens the Inspector. She traces the stall propagation: tick 22 (stun) → tick 23 (Relay-A blocks) → tick 24 (Scout blocks). She measures: 3 ticks of total pipeline stall from a 2-tick stun. The stall propagated upstream faster than the stun resolved. She opens her workbench and makes one change: the Scout→Relay-A hook becomes fire-and-forget. The rest of the pipeline stays blocking. Now when the pipeline stalls, the Scout keeps observing and reporting — its signals might drop, but it doesn't freeze. Only the relay chain stalls. The Scout maintains area coverage even during a pipeline disruption. She calls this pattern **"The Decoupled Intake"** — the front of the pipeline is fire-and-forget (cheap, lossy, always active), the middle and back are blocking (reliable, synchronized, but stall-vulnerable). The pattern mirrors a real-world architecture: an API gateway (fire-and-forget, always accepts requests) feeding into a transactional backend (blocking, consistent, but can stall).

She redeploys. The pipeline now recovers from stuns in 2 ticks instead of 3, and the Scout never stops scouting. She climbs 40 Elo points with this configuration over the next week.

---

## Strengths and Weaknesses

### What Blocking Enables

**"The Guaranteed Delivery Promise"** — Blocking hooks are the only mechanism in Robot Uprising that guarantees a signal reaches its destination with zero loss. Fire-and-forget hooks can drop signals silently (buffer full, receiver destroyed, signal decayed in transit). Blocking hooks will either deliver or visibly freeze trying. There is no silent failure — only loud, diagnosable waiting.

**"The Implicit Clock"** — Blocking hooks create synchronization between agents without any global timing mechanism. Two agents that communicate via blocking hooks implicitly coordinate their execution timing — the sender waits for the receiver, creating a temporal dependency that functions as a local clock. Zara's pipeline works because blocking hooks force the relays to alternate send/receive in lockstep. No scheduler. No tick-counter rule. The synchronization emerges from the blocking semantics alone. This is CSP (Communicating Sequential Processes) made tangible.

**"The Signal Integrity Guarantee"** — When a blocking hook delivers, the receiver knows the signal is fresh. The sender was alive and ready at the moment of transfer. There's no question of stale data sitting in a buffer for 5 ticks. The handshake is a temporal proof: "I had this information at the moment we synced."

**"The Architecture Differentiator"** — Blocking vs. fire-and-forget per hook is a rich strategic axis. Every hook in the player's configuration becomes a decision point: guaranteed delivery at the cost of availability, or availability at the cost of reliability. This maps directly to the CAP theorem in distributed systems — you cannot have Consistency AND Availability under network partitions. Robot Uprising's version: you cannot have signal reliability AND agent availability under blocking semantics.

### What Blocking Costs

**"The Deadlock Dance"** — Any configuration with two or more blocking hooks that form a cycle can deadlock. The probability of deadlock scales with the number of blocking hooks in the system. A configuration with 1 blocking hook cannot deadlock. A configuration with 6 blocking hooks across 4 units has dozens of potential deadlock patterns. The combinatorial explosion of deadlock analysis is the steepest skill cliff in the game.

**"The Throughput Tax"** — A blocked agent produces zero output. Zero observations, zero skill activations, zero signal emissions. In a 60-tick match, an agent that blocks for 10 ticks has lost 16% of its effective lifetime. A Scout that blocks frequently is a Scout that isn't scouting. The player must weigh the value of guaranteed delivery against the opportunity cost of blocked ticks.

**"The Cascade Vulnerability"** — Blocking propagates backward through chains. A stun on one unit can freeze an entire pipeline (as Zara discovered). The stall propagation rate is 1 unit per tick — fast enough to freeze a 4-unit chain in 4 ticks. Deep blocking architectures are fragile in exactly the way that deep fire-and-forget architectures are robust (fire-and-forget degrades gracefully under load; blocking degrades catastrophically).

**"The Complexity Ceiling"** — Debugging deadlocks requires understanding dependency graphs, cycle detection, and temporal reasoning. These are genuinely difficult computer science concepts. Players who haven't internalized Coffman's conditions will struggle to diagnose transitive deadlocks. The Inspector's deadlock visualization helps, but the underlying reasoning is hard.

---

## Interaction Effects

### Blocking + Context Overload / Stun

Context overload (buffer overflow causing a 1-tick stun) interacts with blocking in two dangerous ways:

1. **Stun breaks blocking readiness.** A stunned unit is not "ready" — it cannot accept incoming blocking hooks. This means context overload on a receiver cascades into a block on the sender. A relay overwhelmed by too many fire-and-forget signals on other channels becomes unable to accept blocking hooks on its critical channel. Fire-and-forget noise creates blocking stalls. The two hook types interact destructively.

2. **Blocked units can still receive fire-and-forget signals.** A unit in BLOCKED state has a suspended action loop but its buffer is still physically present. Fire-and-forget signals continue to arrive and fill the buffer. If the buffer fills while the unit is blocked, it enters context overload AND is blocked simultaneously — a "double stun" where the unit must recover from both the stun AND the blocking wait. The visual: the amber blocked glow overlaid with the red overload flash. The sound: the blocking hum overlaid with the overload crackle. Chaos.

### Blocking + Signal Latency

Signal latency (1 tick per hop) and blocking semantics compound: a 3-hop blocking chain doesn't just cost 3 ticks of transit — it costs 3 ticks PLUS the cumulative wait time at each hop. If each receiver is busy for 1 tick when the signal arrives, the total latency is 6 ticks (3 transit + 3 wait). Worst case for a long chain: transit time + (N hops x max busy duration per hop). The player must reason about both spatial distance AND temporal availability when designing blocking chains. This double optimization — topology AND timing — is the deepest strategic layer blocking hooks create.

### Blocking + The Meta-Level (Command Agents)

Command agents (6 hook slots) managing subordinates via blocking hooks face a unique challenge: **"The Manager's Dilemma."** A Command agent that sends blocking orders to 3 subordinates must wait for each to accept before sending the next (serial blocking) or send simultaneously and risk deadlock if two subordinates try to report back at the same time (parallel blocking). The Command agent becomes a bottleneck — exactly like a single-threaded manager in a real organization who can only talk to one person at a time.

Design implication: Command agents should probably use blocking hooks for critical orders (retreat, reposition) and fire-and-forget for routine updates (status requests, area assignments). The Command agent's hook slot allocation becomes a TCP/UDP portfolio decision.

### Blocking + The Sealed Watch

**What does a blocked unit look like?** This is a critical visual design question.

A blocked unit is not idle (idling units sway gently, scanning their surroundings). A blocked unit is not busy (busy units show skill-activation animations). A blocked unit is not stunned (stunned units spark and flicker). A blocked unit is *waiting* — actively, intentionally, with purpose.

**The visual:** The unit extends one arm forward, palm open, toward the receiver. A thin amber line connects the outstretched hand to the receiver's position. The unit's body is still but not rigid — a subtle breathing animation continues, and the unit's "eye" (sensor array) tracks the receiver, not the battlefield. The amber glow is warm, not threatening — it says "waiting" not "broken." The glow pulses slowly, once per second, like a heartbeat.

**The sound:** A low, sustained tone — a cello holding a single note. Not alarming. Patient. When a second unit blocks (potential deadlock forming), a second cello joins a half-step apart. The dissonance is subtle but unmistakable. A third blocked unit adds a third note. The chord becomes increasingly tense. When deadlock is confirmed (circular dependency detected), the cellos resolve into the deadlock alarm: a sharp, staccato two-tone klaxon — *dah-DIT, dah-DIT* — that cuts through the battlefield soundscape.

**The deadlock alarm:** Two (or more) blocked units flash amber-red in alternation. A thin red cycle line connects them, tracing the circular dependency. The red line pulses like a warning label. The alarm sound is designed to be memorable and slightly distressing — the player should FEEL the system failure in their chest. It is the Robot Uprising equivalent of a pager going off at 3 AM.

### Blocking + Mission Difficulty

Blocking hooks create a natural difficulty ramp:

- **Early missions (1-5):** Fire-and-forget only. The player learns hooks, channels, buffers. Signal loss is the primary failure mode.
- **Mid missions (6-7):** Blocking unlocked. The player immediately encounters deadlock (Mission 7 "Gridlock" per aspect 5.18). The learning: blocking solves signal loss but creates deadlock. The skill: choosing which hooks to block.
- **Late missions (8-10):** Complex blocking topologies. Pipeline architectures, redundant paths, decoupled intakes. The skill: designing systems that are both reliable AND available.
- **Gauntlet:** Blocking as meta-strategy. Opponents can exploit blocking patterns — an enemy that detects a blocked Scout (via the EM silence) knows the Scout's channel is occupied and the area is temporarily unmonitored. Blocking creates predictable vulnerabilities that skilled opponents read.

---

## Comparable Games

### TIS-100 — Blocking Ports (The Direct Ancestor)

TIS-100's T21 Basic Execution Nodes communicate exclusively via blocking ports. `MOV ACC RIGHT` blocks until the right neighbor reads. `MOV LEFT ACC` blocks until the left neighbor writes. There is no buffer, no queue, no fire-and-forget. Every communication is a rendezvous. Players must design pipelines where each node's read/write timing aligns with its neighbors. The result: TIS-100 puzzles that seem simple ("just move numbers through four nodes") become timing puzzles where the player must mentally simulate the blocking behavior of every node simultaneously.

**What Robot Uprising takes from TIS-100:** The core insight that blocking communication creates implicit synchronization. The failure mode (deadlock as frozen system). The pedagogical value of blocking as a concept that transfers to real engineering.

**Where Robot Uprising diverges:** TIS-100 has no fire-and-forget option — blocking is the only model. Robot Uprising's hybrid approach (per-hook toggle) gives the player a richer design space. TIS-100's deterministic puzzle format eliminates the chaos of real-time multi-agent combat that makes blocking feel risky and exciting.

### Go Channels — Typed Blocking Communication

Go's channels are the programming language most directly analogous to Robot Uprising's blocking hooks. `ch <- value` blocks until a receiver calls `<-ch`. Buffered channels (`make(chan int, 5)`) add queue capacity — blocking only when the buffer is full. Go's `select` statement allows a goroutine to wait on multiple channels simultaneously, proceeding with whichever is ready first.

**What Robot Uprising takes from Go:** The buffered channel concept (buffer size as a strategic resource). The idea that blocking and buffering are points on a spectrum, not binary opposites. A hook with a large receiver buffer acts like a buffered Go channel — blocking only when capacity is exhausted.

**Where Robot Uprising diverges:** Go's `select` allows multiplexing — a goroutine waiting on 3 channels takes whichever fires first. Robot Uprising's hook model (per-slot trigger) doesn't natively support this. A unit with 2 hook slots listening on 2 channels processes them in slot order, not arrival order. This is a potential design gap — or an intentional simplification.

### Erlang Message Passing — The Fire-and-Forget Counterpoint

Erlang's actor model is the polar opposite of blocking: every message is fire-and-forget into a mailbox (unbounded queue). The receiver processes messages when it's ready. No blocking. No deadlock (from message passing alone). The failure mode is mailbox overflow — memory exhaustion from too many unprocessed messages.

**What Robot Uprising learns from Erlang:** That pure fire-and-forget with bounded buffers (Robot Uprising's default) creates its own failure modes (signal loss, buffer overflow, context overload). Blocking is the cure for lossy communication — but it introduces deadlock, which Erlang deliberately avoids. The game's hybrid model lets the player experience both failure modes and choose.

### CSP (Communicating Sequential Processes) — The Theory

Tony Hoare's CSP formalism describes systems where processes communicate via synchronous (blocking) channels. CSP's key insight: blocking communication makes processes composable — you can reason about a system of blocking processes algebraically. The FDR model checker can prove that a CSP system is deadlock-free. Robot Uprising's blocking hooks are CSP channels implemented as game mechanics. The player who learns to reason about blocking is learning CSP without knowing it.

**The pedagogical claim:** A player who masters blocking hooks in Robot Uprising has internalized the core concepts of CSP: synchronous rendezvous, channel composition, and deadlock analysis. This is a transferable skill to Go, Rust (channels), and any concurrent systems design.

### Factorio — Inserter Blocking

Factorio's inserters block when the output inventory is full — they hold the item in their claw, arm extended, waiting for space. This is visually striking: a factory floor of inserters frozen mid-swing, arms outstretched, each waiting for downstream capacity. The visual language of "frozen arm holding an item" directly inspired the blocked-unit visual described above (unit arm extended, holding a signal, waiting for the receiver).

**What Robot Uprising takes from Factorio:** The visceral visual of a machine frozen mid-action. The "backpressure propagation" pattern where downstream bottlenecks freeze upstream producers. The player's moment of realization: "my whole factory is frozen because one assembler is full."

---

## Sensory Description: The Texture of Waiting

**The battlefield during normal operation:** Units move, scan, fire. Dashed lines pulse with traveling signal dots. The soundscape is a low hum of activity — mechanical footsteps, the whisper of compressed signals, the occasional sharp crack of combat. The board feels alive, purposeful, chaotic.

**A single blocked unit:** One unit stops. Its arm extends forward, palm open. An amber filament connects its outstretched hand to the distant receiver. The unit's body breathes but doesn't move. Its sensor eye tracks the receiver, ignoring threats that pass within its perception radius. A single cello note enters the soundscape — warm, sustained, patient. The unit is not broken. It is *devoted*. It has committed everything to this one communication and will wait as long as it takes.

**Two units in deadlock:** Two amber filaments, crossing. Two units facing each other, arms extended, neither able to complete the handshake. The cellos harmonize in dissonance — a minor second interval that sets teeth on edge. The units pulse amber in alternation, never in sync. A red cycle line traces the dependency: A→B→A. The battlefield continues around them — combat, movement, other signals flowing on fire-and-forget channels — but these two are locked in a private stasis, a dance where neither leads.

**The deadlock alarm triggers:** The alternating amber pulses accelerate. The dissonant cellos crescendo. Then — *dah-DIT, dah-DIT* — the klaxon cuts through. The red cycle line flashes. The two blocked units' amber glow shifts to amber-red. The sound is sharp, urgent, impossible to ignore over headphones. Every viewer, whether player or stream audience, knows something is deeply wrong. The alarm doesn't explain what happened — it announces that the system has failed, and the silence where there should be action is the loudest sound on the battlefield.

**A pipeline stall propagating backward:** This is the most visually distinctive blocking pattern. A 4-unit relay chain, running smoothly — signals flowing left to right, each handshake completing in sequence. Then the rightmost relay gets stunned. The next upstream relay extends its arm — blocked. Amber glow, cello note. One tick later, the next relay upstream blocks. Another amber glow, another cello note (different pitch). One tick later, the Scout blocks. Three amber glows, three cellos, a chord building from right to left across the chain. The stall crawls backward through the pipeline like frost creeping up a windshield. The sound builds from a single note to a three-note cluster over three ticks — a sonic representation of cascading failure. When the stun recovers and the chain unfreezes, the ambers resolve in forward order — left to right, each handshake completing with a bright flash and a released cello note, the chord dissolving back to silence. The "thaw" is as satisfying as the "freeze" was alarming.

**The expert's blocked network under load:** Zara's Gauntlet configuration during a chaotic mid-game: twelve units, eight channels, five blocking hooks. At any given moment, 1-2 units are briefly blocked (normal pipeline operation). The amber glows flicker on and off like turn signals — routine, expected, part of the architecture's rhythm. The cellos enter and exit the soundscape in brief phrases, like a jazz musician trading fours. The expert reads the amber pattern: "Relay-B is waiting for Relay-C's compression cycle to finish — normal. Scout-2 just blocked — Striker-A must be mid-engagement. It'll clear next tick." The blocked units aren't failures. They're the visible heartbeat of a synchronized system. The amber glow becomes, for the expert, a signal of health — the pipeline is flowing, the handshakes are happening, the architecture is working as designed.
