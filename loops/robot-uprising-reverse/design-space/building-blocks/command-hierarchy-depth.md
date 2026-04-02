# 3.19 — Hierarchies of Command: How Deep Can It Go? When Does It Collapse?

## The Option

Command agents manage other agents. That is the locked premise. But the game permits a question the locked spec does not answer: **can a command agent manage another command agent?** And if so, can that second command agent manage a third? How deep does the hierarchy go before it stops being useful and starts being pathological?

This is not an abstract organizational theory question. It is a concrete mechanical question with specific costs, latencies, and failure modes determined by the game's locked systems: buffer sizes, hook slots, signal latency (1 tick per hop), EM emissions, production costs (10 minerals + 4 energy/tick per command unit), and the advisory nature of command overrides (subordinates must have "obey command" rules to respond).

The design space spans three configurations:

**1-deep hierarchy (flat):** One command agent managing scouts, strikers, relays, and specialists directly. This is the Mission 6 "Chain of Command" introduction. The command agent receives intel on its channels, evaluates rules, and fires reassign/reroute/prioritize messages to operational units. Every command decision travels one hop to its target.

**2-deep hierarchy (division):** A senior command agent manages two or more junior command agents, each of which manages a subset of operational units. The senior command receives strategic-level intelligence (compressed, filtered summaries from relays), makes high-level decisions ("shift focus to eastern flank"), and sends command overrides to junior commands. The junior commands translate these strategic directives into tactical instructions for their subordinates. Intel flows up two hops. Orders flow down two hops. Minimum latency for a reactive decision: 4 ticks (observation to junior command, junior to senior, senior decision back to junior, junior to operational unit).

**3-deep hierarchy (corps):** A general command agent manages senior commands, which manage junior commands, which manage operational units. The general operates on abstractions of abstractions. Minimum latency for a reactive decision: 6 ticks. On an 8x8 board where engagements resolve in 1-3 ticks, this is geological time.

The fundamental tension: deeper hierarchies enable more sophisticated organizational behavior (specialization, delegation, redundancy), but every additional layer adds latency, consumes resources, occupies buffer space with command traffic, and creates new points of failure. The question is where the crossover point lies — where the coordination benefit of another command layer is exceeded by its coordination cost.

---

## The Mechanical Costs of Depth

### Buffer Pressure Compounds Per Layer

A command agent has 14 buffer slots and 6 hook slots. In a 1-deep hierarchy, those 14 slots hold intel from the battlefield — scout observations, relay summaries, threat reports — and the 6 hooks connect it to the channels carrying that intel plus the channels carrying its orders.

In a 2-deep hierarchy, the senior command's buffer must hold two categories of information: battlefield intel (which it still needs to make strategic decisions) AND status reports from junior commands. A junior command that reports "eastern scouts reassigned to evade mode, 2 strikers committed to breach" generates a buffer entry that competes with raw battlefield data for those 14 slots. If the senior command listens to 2 junior commands, each reporting status every 2-3 ticks, that is 4-6 buffer entries per cycle consumed by internal management overhead — nearly half the buffer gone before any battlefield intel arrives.

The senior command faces the same context window catastrophe that afflicts any unit, but the information it is losing is not raw observations (which can be re-observed next tick). It is losing processed, compressed, strategic summaries that took multiple relay hops and junior command decisions to produce. When the senior command's buffer evicts a junior command's status report, it loses organizational memory that cannot be trivially regenerated.

### Signal Latency Is Multiplicative

The locked spec defines signal latency as 1 tick per hop through the hook network. In a 1-deep hierarchy:

- Scout observes enemy at tick 10
- Relay compresses and forwards at tick 11
- Command receives and decides at tick 12
- Command order reaches striker at tick 13
- Striker acts at tick 14

Total reaction time: 4 ticks. On an 8x8 grid where a fast unit moves 1 tile per tick, an enemy scout has moved 4 tiles in the time it takes a 1-deep hierarchy to respond. Tight but workable.

In a 2-deep hierarchy, add the senior-to-junior hop and the junior-to-senior status report:

- Scout observes at tick 10
- Relay forwards to junior command at tick 11-12
- Junior command forwards summary to senior at tick 13
- Senior decides at tick 14
- Senior order reaches junior command at tick 15
- Junior translates to tactical order at tick 16
- Order reaches striker at tick 17
- Striker acts at tick 18

Total reaction time: 8 ticks. The enemy has crossed the entire board. A 2-deep hierarchy cannot react to anything that moves. It can only react to slow-developing strategic situations: enemy force buildup, resource node contestation, gradual positional shifts.

In a 3-deep hierarchy, the math is catastrophic. 12+ tick reaction times. The battle is over before the general processes its first status report.

### Production Economy: Command Units Are the Luxury Tax

A command unit costs 10 minerals and 4 energy per tick. Compare: a striker costs 8 minerals and 3 energy/tick, a scout costs 3 minerals and 1 energy/tick.

A 1-deep hierarchy with 1 command unit: 10m + 4e/tick. Expensive but justifiable — the command unit's reassign/reroute/prioritize skills provide mid-battle adaptation that no other unit can.

A 2-deep hierarchy with 3 command units (1 senior, 2 junior): 30m + 12e/tick. That is the mineral cost of 3.75 strikers or 10 scouts. The 12 energy/tick is enormous — at standard income rates, a significant fraction of total energy production goes to command overhead. The player who builds a 2-deep hierarchy is making a stark economic bet: "the coordination value of 3 command units exceeds the combat value of 3 additional strikers."

A 3-deep hierarchy with 7 command units (1 general, 2 seniors, 4 juniors): 70m + 28e/tick. This is not viable in any realistic production scenario on the 10-mission arc. It might exist in theory, in the full game's late-stage tech tree, as a deliberately absurd endgame configuration.

### EM Emissions Scale With Command Traffic

Every hook transmission generates EM emissions that enemies can detect. Command hierarchies are chatty. A junior command that fires reassign at 3 subordinates generates 3 transmissions per decision cycle. A senior command that fires orders to 2 junior commands generates 2 more. A 2-deep hierarchy with 2 junior commands managing 3 units each generates roughly 8 transmissions per decision cycle, compared to 3 for a flat hierarchy.

EM emissions are not just detection risk — they are information leakage. An opponent observing a sudden spike in EM from a cluster of stationary units can infer: "that is a command node, those are relays, and the spike means they just issued orders — an attack is coming." Deep hierarchies are electromagnetically loud. They broadcast their decision-making rhythm to anyone listening.

---

## Player Journey 1: The Reluctant Manager (Mission 6-7, First Hierarchy)

**Player profile:** Kaori has completed Missions 1-5 with hand-configured units and just unlocked the command agent. She understands hooks, channels, and relay chains. She does not yet think in terms of organizational hierarchy.

**Tick 0 — Plan Phase.** The workbench shows her army: 3 scouts, 2 strikers, 2 relays, 1 specialist. She drags a command agent blueprint into the production queue. 10 minerals. She winces — that is more than a striker. The command agent's blueprint opens. Three skills: reassign, reroute, prioritize. She configures a simple rule: "IF buffer contains ENEMY_STRIKER count > 1 THEN reassign(ALL_SCOUTS, evade, ON)."

She wires the command agent to listen on `general-intel` (where relays dump compressed scout observations) and broadcast on `orders` (where scouts and strikers listen for command overrides). She adds "obey command" rules to her scout blueprints — a checkbox in the rules panel that adds a priority rule: "IF buffer contains command_override THEN execute override."

She places the command agent at B2, behind her relay line. Hits EXECUTE.

**Sealed Watch.** The battle unfolds. Scouts patrol, relays compress and forward. At tick 8, two enemy strikers appear on the eastern flank. Scout observations flow through relay chains to the command agent's buffer. At tick 11, the command agent's rule fires: buffer contains 2 ENEMY_STRIKER entries. It sends reassign messages on `orders`. At tick 12, the scouts receive the override. Their patrol skill deactivates; evade activates. They begin flinching away from the advancing strikers instead of holding patrol routes.

Kaori watches the scouts scatter and her strikers move to intercept based on the relay-forwarded threat data. The eastern flank holds. She feels it: she did not tell those scouts to evade. She told a system to tell them to evade when conditions warranted it. The system executed autonomously.

**Inspector.** She traces the command chain: scout observation at tick 8, relay compression at tick 9, command buffer receipt at tick 10, rule evaluation at tick 11, order transmission at tick 11, scout receipt at tick 12. Four ticks from observation to behavior change. She notices: by tick 12, the enemy strikers had already moved 3 tiles closer. If the scouts had been configured to self-evade (rules referencing their own buffer), they would have evaded at tick 9. The command hierarchy added 3 ticks of latency.

She sits with this. The command agent is slower than direct wiring. But it adapted ALL the scouts simultaneously, with one decision. And it freed the scouts from needing complex self-management rules — their blueprints became simpler. The command agent centralized the decision, at the cost of reaction time.

**She does not consider a 2-deep hierarchy.** The 1-deep hierarchy already feels expensive and slow. She files this away: command agents are for strategic adaptation, not tactical reflex.

---

## Player Journey 2: The Division Commander (Mission 8-9, Deliberate 2-Deep)

**Player profile:** Marcus is on his second playthrough, optimizing. He has read the debrief data obsessively. He understands that a single command agent managing 8+ units saturates its 14-slot buffer with cross-channel traffic. He wants to split his army into two semi-autonomous divisions with a senior command coordinating between them.

**Tick 0 — Plan Phase.** Marcus builds three command agents. He names them (in his head — the game does not support names, only blueprint IDs) "General," "East Wing," and "West Wing." The General sits at C3. East Wing at F2. West Wing at B5.

East Wing manages: 2 scouts (east patrol), 1 striker (east intercept), 1 relay (east compression). East Wing listens on `east-intel` and broadcasts on `east-orders`. East Wing also broadcasts status summaries on `strategic-feed` — a channel the General listens to.

West Wing manages: 2 scouts (west patrol), 1 striker (west intercept), 1 relay (west compression). Same pattern, `west-intel`, `west-orders`, `strategic-feed`.

The General listens on `strategic-feed` and broadcasts on `strategic-orders` — a channel both junior commands listen to. The General's rules are abstract: "IF buffer contains ENEMY concentration east > west THEN reroute(East Wing, add_listening: `reinforcement-channel`)" — a command that tells East Wing to start listening for reinforcement orders, which the General will send in a follow-up decision cycle.

The resource cost: 30 minerals for 3 command agents, 12 energy/tick. Marcus sacrifices 1 striker and 1 specialist to afford this. His army is command-heavy and combat-light.

**Sealed Watch — The Good Part.** Tick 15: enemy pushes east with 3 strikers and a relay. East Wing's scouts detect the push. East Wing's relay compresses and forwards to East Wing command. At tick 18, East Wing fires tactical orders: scouts evade, striker repositions to chokepoint. Simultaneously, East Wing reports the situation on `strategic-feed`.

At tick 20, the General receives the strategic summary. The General's rule fires: east concentration exceeds threshold. The General sends a reroute command to West Wing: "start listening on `east-reinforce`." At tick 22, West Wing receives the reroute. West Wing's rules now include the reinforcement channel. The General sends a follow-up: "reassign west striker to east-bound movement." At tick 24, West Wing's striker begins moving east.

The reinforcement arrives at tick 28. The eastern flank holds with 2 strikers instead of 1. Marcus watches this unfold and feels something genuinely new: his army reorganized itself across two theaters of operation without a single direct order from him. The General detected a strategic imbalance and transferred resources. The junior commands handled the tactical details. It worked.

**Sealed Watch — The Collapse.** Tick 30: the enemy, having committed east, now launches a fast scout raid on the west. West Wing's scouts detect it, but West Wing's striker is gone — rerouted east by the General's order. West Wing command sends a status report on `strategic-feed`: "west-wing under attack, no striker available." The report enters the General's buffer at tick 33. But the General's buffer is now 80% full — it still contains the east-reinforcement decision data, the east status reports, and the strategic feed history. The west-wing distress signal competes for buffer space.

At tick 34, the General's buffer evicts the original east-concentration report (the oldest entry) to make room. The General's rules evaluate. But the rule for "east concentration exceeds threshold" no longer fires — the evidence was evicted. The General does not realize that the east reinforcement was in response to a threat that may have dissipated. It does not send the west striker back.

By tick 38, the enemy scout raid tags 2 western resource nodes uncontested. Marcus loses the resource advantage. The western flank crumbled not because of a tactical failure but because the General forgot why it sent reinforcements east — its buffer lost the historical context needed to make the return decision.

**Inspector.** Marcus traces the failure. The General's buffer at tick 34 shows the eviction: the east-concentration report drops off the left edge of the buffer bar. A red eviction flash he missed during Sealed Watch. He realizes: the 2-deep hierarchy's strategic memory requirements exceed a 14-slot buffer. The General needs to remember not just current state but the REASONS for its past decisions. Those reasons age out of the buffer before the consequences of the decisions play out.

He considers: the prioritize skill could preserve strategic summaries longer. But prioritize itself consumes a buffer slot for the override message. The fix adds to the problem.

---

## Player Journey 3: The Theorist (Post-Campaign, 3-Deep Experiment)

**Player profile:** Dani has completed the campaign and is in sandbox mode, testing edge cases. They want to know if a 3-deep hierarchy is mechanically possible and what happens when you try.

**Tick 0 — Plan Phase.** Dani builds 7 command agents: 1 general, 2 senior commands, 4 junior commands. Cost: 70 minerals. They have almost no combat units — 2 scouts, 2 strikers. The rest of the army IS the command structure. The 8x8 board has 7 stationary command nodes and 4 mobile units. It looks absurd. The channel map is a dense web of golden lines connecting command nodes to each other and to the thin scattering of operational units.

Energy drain: 28 energy/tick for command alone, plus 8 for the 4 combat units. Total: 36 energy/tick. Standard income at game start is roughly 10-15 energy/tick. Dani will be energy-bankrupt within 20 ticks.

They hit EXECUTE anyway.

**Sealed Watch.** Tick 1-5: The hierarchy bootstraps. Junior commands listen for orders. Senior commands listen for junior status. The General listens for senior summaries. But there is nothing to summarize — the 2 scouts have barely started patrolling. The command hierarchy generates internal chatter (status reports, acknowledgments, channel handshakes) that consumes buffer space across all 7 command units. By tick 5, the General's buffer is half full of "no significant activity" reports from the senior commands. The buffer bar looks active — blue entries flowing in — but it is all organizational noise. No signal, all ceremony.

Tick 8: One scout spots an enemy striker. The observation enters the scout's buffer and fires on `east-patrol-intel`. The assigned junior command receives it at tick 9. The junior command's rules evaluate: threat detected, send status to senior. The senior receives it at tick 10 and evaluates: single threat, forward to general. The general receives it at tick 11. The general evaluates its strategic rules. A single enemy striker does not trigger the general's strategic threshold ("respond only to concentration > 2"). The general does nothing.

Meanwhile, the enemy striker, uncontested for 11 ticks, has reached the junior command at F4 and is now adjacent. Engage. The junior command is destroyed at tick 12. The destruction generates a signal that propagates up the hierarchy — but the chain is broken. The senior command that managed the destroyed junior now receives no status reports from the eastern sector. Silence. The senior command has a rule for silence: "IF no report from managed junior for > 3 ticks THEN escalate." At tick 15, the senior escalates to the general.

At tick 15, the general finally learns that a junior command was destroyed 3 ticks ago by a single enemy striker that was first observed at tick 8. Seven ticks of latency from observation to strategic awareness. In those 7 ticks, the hierarchy did nothing useful. A flat 1-deep hierarchy would have responded at tick 11. A direct-wired scout-to-striker chain would have responded at tick 10.

Tick 18: Energy reserves hit zero. The command hierarchy begins shutting down as units power off for lack of energy. The 7 command agents drain the economy dry. The 2 remaining scouts and 2 strikers keep moving, but their "obey command" rules fire on empty channels. No commands coming. They revert to their baseline behaviors — patrol and engage — which are what they should have been doing all along, without 70 minerals of command infrastructure.

**Inspector.** Dani scrubs through the timeline. The buffer history of the general tells the story: 14 slots, and for the entire battle, at least 9 were occupied by inter-command status traffic. The general's "strategic" decisions operated on a sliver of real battlefield data buried under layers of organizational overhead. The signal-to-noise ratio in the general's buffer was approximately 0.15 — 85% of its context window was consumed by managing the hierarchy itself.

Dani screenshots this for the community forum. Title: "I built the Pentagon on an 8x8 chessboard and it got killed by one guy."

---

## Strengths: When Depth Pays

**Specialization under sustained pressure.** A 2-deep hierarchy shines when the battlefield has distinct, persistent theaters of operation. If the east and west flanks face different enemy compositions for 20+ ticks, junior commands specialized to their theater make better tactical decisions than a single command agent juggling both. The junior command's buffer is not polluted with irrelevant cross-theater data.

**Graceful degradation.** If one junior command is destroyed, the other continues operating autonomously. In a flat hierarchy, losing the single command agent means the entire army loses adaptive capability. A 2-deep hierarchy has built-in redundancy — the cost of which is the senior command's existence.

**Strategic reallocation.** The Marcus journey demonstrates the power case: a senior command that detects a strategic imbalance and transfers resources between theaters. No flat hierarchy can do this because a single command agent managing everything has no concept of "theaters" — everything is one undifferentiated pool of subordinates.

**Deception.** A 2-deep hierarchy can execute feints. The senior command orders one junior command to generate EM-heavy activity (loud reassign/reroute cycles) on the western flank while the other junior command quietly repositions for an eastern attack. A flat hierarchy cannot compartmentalize its own EM signature.

---

## Weaknesses: When Depth Collapses

**Latency kills on small boards.** An 8x8 grid is tiny. Engagements develop and resolve in 3-5 ticks. A 2-deep hierarchy's 8-tick reaction time means it is always responding to the previous crisis, never the current one. On a 16x16 or 32x32 board (if the game ever scales up), the math changes — longer engagement timelines give deeper hierarchies room to breathe.

**Buffer saturation from internal traffic.** Every layer of hierarchy adds command-override messages and status reports that consume buffer space. A 14-slot buffer is not large enough to hold strategic context AND management overhead simultaneously. The command unit's buffer was sized for 1-deep management. Deeper hierarchies would need larger buffers or fundamentally different memory architectures (shared memory, persistent state — features in the "Architecture" tech tree branch that does not exist in the first playable).

**Economic infeasibility.** At 10 minerals and 4 energy/tick per command unit, a 2-deep hierarchy costs as much as 3 additional combat units. The coordination benefit must exceed the raw combat power of those forgone units. In most mission scenarios, it does not. The edge cases where it does — sustained multi-theater engagement with persistent asymmetric threats — are narrow.

**Debugging nightmare.** When a 2-deep hierarchy fails, the player must trace signals through 4+ hops across 3 command agents to find the failure point. The Inspector tools are designed for linear signal chains (scout to relay to command to striker). Branching, looping command hierarchies create inspection paths that double back on themselves. "The General told East Wing to reroute, which caused East Wing to tell Scout-A to change channels, which caused Scout-A to stop sending observations to Relay-C, which caused the General to stop receiving east intel" — this circular dependency is nearly impossible to diagnose in a post-hoc buffer trace.

**The advisory problem compounds.** Command overrides are advisory — subordinates can ignore them if their rules prioritize other actions. In a 2-deep hierarchy, this means a junior command can ignore the senior's strategic directive because its own rules prioritize local tactical conditions. This is emergently realistic (local commanders ignoring headquarters because they know the ground truth better) but mechanically infuriating for the player who spent 30 minerals on a hierarchy that does not obey itself.

---

## Interaction Effects

### With Production Economy

The production queue is a conveyor belt. Building 3 command agents means the queue is occupied for roughly 15-20 ticks producing zero combat units. During this window, the player has no army. If the enemy attacks during command buildup, there is nothing to defend with. The production timing of deep hierarchies creates a vulnerable window that does not exist with flat configurations.

### With EM Emissions

A 2-deep hierarchy with 3 command agents, 2 relays, and inter-command channels generates roughly 15-20 hook transmissions per decision cycle, compared to 5-8 for a flat hierarchy. This EM bloom is detectable from across the board. An opponent who sees a stationary cluster of high-EM-output nodes can deduce the command structure's position and target it with strikers. The hierarchy's organizational activity is its own targeting beacon.

### With the Specialist's Hack Skill

Hacking a junior command agent is devastating in a 2-deep hierarchy. The hacked buffer reveals not just the junior's tactical decisions but the senior's strategic directives — the overrides flowing down the chain expose the entire organizational strategy. A flat hierarchy's command agent, if hacked, reveals the same information. But in a deep hierarchy, hacking ANY node in the chain exposes the chain's logic. More nodes means more attack surface.

### With Dynamic Reconfiguration

The command agent's reroute skill — dynamically rewiring channels mid-battle — interacts dangerously with hierarchy depth. If a senior command reroutes a junior command's listening channels, the junior command may lose contact with its subordinates (if the rerouted channel was the one carrying subordinate reports). Reroute in a deep hierarchy is network surgery on a network you are also using to transmit the surgery instructions. One misconfigured reroute can sever the chain.

---

## Comparable Systems

### Military C2 (Command and Control) Doctrine

Real militaries use 3-5 levels of command hierarchy: squad, platoon, company, battalion, brigade. But real military hierarchies have two properties Robot Uprising lacks: (1) persistent memory — orders and status reports are written down, not evicted from a 14-slot buffer — and (2) human judgment that can override latency — a platoon leader who sees an imminent threat does not wait for battalion approval. Robot Uprising's advisory command model partially captures property (2), but buffer eviction makes property (1) impossible. This is the key insight: real hierarchies work because they have paper. Robot Uprising's hierarchies fail because every node has amnesia.

### Organizational Theory: Span of Control

Management theory suggests a span of control of 5-7 direct reports per manager. In Robot Uprising, a command agent with 6 hook slots managing 6 subordinates is exactly at this threshold. A 2-deep hierarchy doubles the effective span (1 senior managing 2 juniors, each managing 3-4 units = 6-8 effective subordinates per layer) while adding the coordination tax. The organizational theory prediction: hierarchies help when span of control would otherwise exceed 7. On an 8x8 board with 8-12 total units, a single command agent's span of control is 7-11. Right at the breaking point. This suggests 2-deep hierarchies become mechanically justified only when army size exceeds 12-15 units — boards or scenarios that may not exist in the first playable.

### Screeps: The Overmind Architecture

The Screeps community's Overmind bot uses a hierarchical architecture: a central Overmind object manages Colony objects, each of which manages Overlord objects, each of which manages individual creeps. This is a 3-deep hierarchy implemented in JavaScript, not constrained by buffer sizes or signal latency — it runs in a single tick's computation. The Overmind works because code has no context window limit (within CPU budget). Robot Uprising's in-game hierarchies face the constraint that Overmind's code does not: the management system itself competes for the same scarce resource (buffer space) that the managed system needs. Overmind is a hierarchy with infinite memory. Robot Uprising's hierarchies have 14 slots.

### Into the Breach: The Anti-Hierarchy

Into the Breach gives the player direct control of 3 mechs. There is no command hierarchy because there are no autonomous subordinates. The player IS the hierarchy — all 3-5 levels collapsed into one human brain. Robot Uprising occupies the space between Screeps (code-level hierarchy with no buffer constraint) and Into the Breach (no hierarchy, direct control). The game's unique contribution is hierarchy WITHIN the buffer constraint — organizational design as a resource management problem.

---

## Sensory: What Command Chains Look and Feel Like

**1-deep hierarchy in Sealed Watch.** The command agent at B2 is a golden hexagon, stationary, pulsing slowly. When its rules fire, a single golden ring expands outward — a pulse that touches every subordinate within 1 tick. The subordinate units briefly flash gold at their edges, acknowledging the override. Channel lines between the command agent and its subordinates glow brighter during transmission, then fade. The rhythm is steady: observe, compress, decide, transmit. A single heartbeat driving the army.

**2-deep hierarchy in Sealed Watch.** Three golden hexagons in a triangle. The junior commands pulse at a faster rhythm than the senior — tactical decisions are more frequent than strategic ones. When the senior issues an order, the golden ring expands only to the junior commands (the first hop), then a moment later, each junior fires its own golden ring to its subordinates (the second hop). The visual is a cascade: one large pulse, then two smaller pulses rippling outward from different positions. It looks like a slow-motion explosion of golden light, timed across ticks. When it works, it is beautiful — synchronized, deliberate, the visual signature of organized intelligence.

When it fails, the cascade stutters. A junior command whose buffer is saturated does not fire its subordinate ring on time. The golden pulses arrive at staggered intervals instead of in sync. One sector of the army responds. The other does not. The board shows a lopsided glow — half the army pulsing gold, half dark and unresponsive. The visual tells the story before the Inspector confirms it: the chain is breaking.

**3-deep hierarchy in Sealed Watch.** Seven golden hexagons. The board is more gold than battlefield. The cascade takes 3 ticks to propagate from general to operational units — during which new observations have already changed the battlefield state. The golden pulses overlap and interfere with each other, creating a visual noise floor of constant golden flickering. It no longer reads as organized intelligence. It reads as a Christmas tree — pretty, busy, and disconnected from reality.

**The sound of hierarchy depth.** A 1-deep command decision is a single clean chime — a clear bell tone when the command agent fires. A 2-deep cascade is a chord: the senior's chime followed by two lower-pitched tones from the juniors, a descending arpeggio of authority. A 3-deep cascade is cacophony: overlapping tones at different pitches and timings, the musical equivalent of an argument in a meeting room. The audio vocabulary teaches the player the hierarchy's health without them reading a single buffer.

---

## Design Recommendations

The game should **permit** 2-deep hierarchies as an advanced, expensive, situationally powerful configuration. It should not prevent them — the advisory command model and channel-based wiring already support them mechanically. The failure modes (buffer saturation, latency, cost) are natural consequences that teach organizational design lessons. A player who builds a 2-deep hierarchy and watches it collapse learns something true about real organizations.

The game should **discourage** 3-deep hierarchies through natural economics (impossible to afford on standard income) and board scale (8x8 is too small for 6+ tick latency to ever be acceptable). If the game scales to larger boards in post-campaign or multiplayer, 3-deep hierarchies might become viable — and that should be allowed to happen organically.

The Inspector should support hierarchy tracing. When the player clicks a command override in a subordinate's buffer, the Inspector should offer "trace command origin" — a button that walks backward through the relay chain to the originating command agent, highlighting each hop. For 2-deep hierarchies, this trace reveals the full decision chain. Without this tooling, deep hierarchies are undebugable, and undebugable systems are systems players abandon.

The debrief should surface hierarchy health metrics: "Command overhead: 43% of General's buffer consumed by inter-command traffic." This gives players a number to optimize against. The number teaches the lesson: hierarchy has overhead, and overhead has a cost.
