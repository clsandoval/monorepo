# 2.18 — Signal Acknowledgment as Optional Mechanic

**Aspect:** 2.18 — Signal acknowledgment as optional mechanic
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

Robot Uprising's locked communication model is fire-and-forget: hooks emit signals that travel at 1 tick per hop, and if the receiver's context window is full, the signal is silently discarded. The sender never knows. This is clean — no new state, no new failure modes — but it creates a diagnostic black hole. When a carefully designed flanking maneuver fails because STRIKER-B never received the threat coordinates SCOUT-A sent twelve ticks ago, the player discovers this only in the Inspector *after* watching their army stumble blindly into an ambush.

The opposite extreme — full blocking rendezvous, explored in aspect 1.04d — introduces deadlock risk and timing dependencies that are rich but punishing.

**Signal acknowledgment** is the middle ground. A lightweight "ACK" message that fires automatically when a receiver processes a signal. Not a handshake. Not a contract. A receipt — "I got your message, here's proof." The sender can optionally configure an ACK_TIMEOUT: if no receipt arrives within N ticks, continue anyway. This creates a new design axis: **how much does this sender care about delivery confirmation?**

The fundamental tension: acknowledgment adds a *reverse signal* to every hook transmission, doubling channel traffic, consuming additional context window slots, and generating extra EM emissions. The player is buying reliability at the cost of bandwidth and stealth. This is not a free upgrade — it is a trade-off with teeth.

---

## The Name: "The Ping-Back"

We call the acknowledgment signal **the Ping-Back** — a term that evokes sonar, network diagnostics, and the satisfying moment when you shout into a cave and hear your echo return. The Ping-Back is the echo that confirms the cave is real.

---

## Mechanical Specification

### The ACK Hook

A new hook configuration option: **Ping-Back Mode**, toggled per hook slot. When enabled on a sending hook:

1. The hook fires its signal normally (1 tick/hop travel time).
2. When the signal arrives at a receiver and is **successfully written into the receiver's context window**, the receiver automatically emits a Ping-Back signal on the same channel, traveling back toward the sender at the same 1 tick/hop rate.
3. The Ping-Back carries minimal payload: `{source: RECEIVER_ID, original_tick: T, status: ACK}`.
4. The Ping-Back occupies one context window slot on arrival at the sender.
5. If the original signal was **dropped** (receiver's context window full), no Ping-Back is generated. Silence IS the negative acknowledgment.

### ACK_TIMEOUT

Configurable per hook: 2-10 ticks (default: 4). After the timeout elapses without a Ping-Back:

- **Continue mode** (default): Sender proceeds normally. The timeout expiry itself becomes a context window entry: `{type: ACK_TIMEOUT, target: RECEIVER_ID, channel: X, tick: T}`. The player can write rules that react to timeouts.
- **Resend mode** (optional): Sender automatically re-transmits the original signal. Costs one additional hook firing (EM emission, bandwidth). Maximum 1 retry.
- **Escalate mode** (optional): Sender fires a timeout event on a *different* channel (configurable). This enables cascade architectures: "if STRIKER-B doesn't acknowledge, alert COMMAND-A on the `failures` channel."

### Slot and Resource Costs

- Enabling Ping-Back on a hook does NOT consume an additional hook slot. It is a toggle on an existing hook.
- Each Ping-Back signal consumes 1 context window slot on the sender when it arrives (or 1 slot for the timeout entry if it expires).
- Each Ping-Back signal generates EM emissions on the return trip — same cost as any 1-hop signal transmission.
- Resend mode doubles the original signal's EM cost on retry.

### What Ping-Backs Do NOT Do

- They do not confirm the receiver *acted* on the signal. Only that it was written into the context window. The receiver might evict it next tick.
- They do not carry any data about what the receiver did. No "I moved to E4" confirmation. Just "I received something."
- They do not create a bidirectional channel. The Ping-Back travels the reverse path on the same channel. No new channel is created.
- They do not block the sender. The sender continues acting normally while waiting. The timeout is passive — a context window entry appears, not a state change.

---

## Six Design Approaches

### Model A: "The Silent Post Office" — No Acknowledgment (Status Quo)

Fire-and-forget, as currently locked. Signals vanish into the void. The sender has zero delivery information. Failures are diagnosed exclusively in the Inspector post-match.

**When this is enough:** Early missions (1-4) where pre-placed units have short signal paths and small boards. Mission 1-2 architectures are simple enough that dropped signals are rare.

**When this breaks:** Mission 7+, where three-hop relay chains feeding a command agent mean a dropped signal at any hop silently collapses the entire information pipeline. The player watches COMMAND-A sit idle for 15 ticks and has no idea why until the Inspector timeline scrub reveals the drop at tick 23.

### Model B: "The Postcard" — Passive Ping-Back, No Timeout

Ping-Back enabled, but no timeout behavior. The sender receives ACKs when they arrive but has no rules governing what happens if they don't. This is purely diagnostic: the presence or absence of Ping-Backs in the sender's context window tells the player (in the Inspector) whether signals were delivered.

**The player value:** During the debrief, the Inspector shows Ping-Back entries alongside sent signals. A sent signal with a matching Ping-Back has a small green check mark. A sent signal with no Ping-Back has a dim red X. Instantly legible: "SCOUT-A sent 14 signals on `threats`. 11 were acknowledged. 3 were dropped." The diagnostic black hole is filled.

**The cost:** Each acknowledged signal consumes one extra context window slot on the sender. A Scout with a 6-slot window sending frequent threat reports gets its own window clogged with Ping-Backs. The diagnostic tool cannibalizes the very resource it monitors.

### Model C: "The Registered Letter" — Ping-Back with ACK_TIMEOUT

Full Ping-Back with configurable timeout. The sender's rules can now include conditions like `IF ACK_TIMEOUT from STRIKER-B → resend on threats` or `IF ACK_TIMEOUT from STRIKER-B → escalate to command-failures`. This is the TCP of Robot Uprising — reliable delivery with retry logic, built from the same primitives as everything else.

**The design depth:** ACK_TIMEOUT is itself a tuning parameter. Set it too short (2 ticks on a 3-hop path) and every signal generates a false timeout because the Ping-Back literally cannot arrive in time. Set it too long (10 ticks) and by the time you know the signal was dropped, the tactical window has closed. The player must understand their signal chain's latency budget and set timeouts accordingly. This is *exactly* the TCP retransmission timeout tuning problem, made visceral.

**The EM cost:** Every Ping-Back is a reverse-direction signal. Every retry doubles the original emission. A Registered Letter architecture on all hooks generates roughly 2x the EM signature of the equivalent Silent Post Office. Enemy units with detection capabilities find you faster.

### Model D: "The Heartbeat" — Periodic Liveness Ping

Instead of per-signal acknowledgment, units send periodic "I'm alive and listening" pings on their subscribed channels every N ticks (configurable: 3-8). This is not per-message delivery confirmation — it's connection health monitoring.

**What this catches:** A destroyed relay that silently breaks a three-hop chain. A stunned unit whose context window overloaded. A unit that moved out of signal range. The Heartbeat detects *link failure*, not *message loss*.

**What this misses:** Individual dropped signals. If the relay is alive but its buffer is full, the Heartbeat arrives normally even though it's dropping every forwarded signal. The Heartbeat says "I exist" but not "I received your last message."

**The interaction with context overload:** A unit that is context-overloaded (stunned for 1 tick) misses its Heartbeat window. The sender receives an absence — a gap in the expected ping cadence — which is itself useful information. "RELAY-B hasn't pinged in 6 ticks" means something is wrong.

### Model E: "The Read Receipt" — Processing Confirmation

A deeper acknowledgment: the Ping-Back fires not when the signal enters the context window, but when the signal is **used by a rule**. This confirms the receiver not only received the signal but *acted on it*. The payload includes which rule fired: `{source: STRIKER-B, original_tick: T, status: PROCESSED, rule: "engage_tagged"}`.

**The diagnostic power:** In the Inspector, the player sees not just delivery but causation. "SCOUT-A's threat signal was received by STRIKER-B at T14 and triggered the `engage_tagged` rule at T15." The full causal chain is visible without scrubbing.

**The timing problem:** Processing happens 1+ ticks after delivery (the signal must survive in the buffer until the next decision cycle). The Read Receipt's return trip adds more latency. By the time SCOUT-A receives confirmation that STRIKER-B acted on its T10 signal, it might be T16 — six ticks of uncertainty. For time-sensitive coordination, this is too slow.

**The context window tax:** Processing confirmations carry more data (which rule, what action) and consume more effective attention from the sender. A Scout whose entire context window fills with "STRIKER-B processed your signal using engage_tagged" is a Scout that can no longer see the battlefield.

### Model F: "The Graduated Receipt" — Progressive Unlock (RECOMMENDED)

Acknowledgment is not available from tick 1. It is introduced progressively across the mission arc:

| Mission | Available | Name |
|---------|-----------|------|
| 1-4 | Nothing | Silent Post Office (tutorial missions, short chains, failures are rare and educational) |
| 5 | Heartbeat | "The Pulse" — periodic liveness pings introduced alongside factory and relay chains |
| 6-7 | Passive Ping-Back | "The Postcard" — delivery confirmation, diagnostic-only, introduced alongside command agents |
| 8-10 | Full Registered Letter | "The Registered Letter" — ACK_TIMEOUT + retry/escalate, introduced for factory-vs-factory complexity |

**Why progressive:** Each acknowledgment tier teaches a different concept:
- **Heartbeat** teaches *connection monitoring* — is the network alive?
- **Passive Ping-Back** teaches *delivery verification* — did the message arrive?
- **Registered Letter** teaches *reliable delivery engineering* — what do I do when it doesn't arrive?

These map directly to real networking concepts (ICMP ping, TCP ACK, retry with exponential backoff) without ever naming them. The player builds intuition for distributed systems reliability through gameplay.

---

## Strengths

1. **Fills the diagnostic black hole.** The single biggest pain point of fire-and-forget is invisible signal loss. Any acknowledgment tier makes dropped signals visible, either in real-time (through rules) or in debrief (through Inspector annotations).

2. **Creates a new optimization axis.** Reliability vs. stealth vs. bandwidth. A fully-acknowledged architecture is robust but loud and context-hungry. A silent architecture is stealthy and lean but fragile. The player chooses where on this spectrum each signal chain lives.

3. **Teaches real distributed systems concepts.** ACK_TIMEOUT tuning, retry storms, the difference between "received" and "processed," heartbeat monitoring — all are industry concepts that transfer directly.

4. **Emerges from existing primitives.** Ping-Backs are just signals. ACK_TIMEOUT entries are just context window entries. Escalation is just another hook. No new primitive type is introduced — acknowledgment is composed from skills, rules, hooks, and context config.

5. **Enables the "retry storm" as designed failure mode.** If every hook has Ping-Back + Resend enabled and the relay goes down, every sender retries simultaneously. The relay comes back online and is instantly flooded with doubled traffic, overloading its context window, triggering a stun, missing the next round of signals, generating more retries. This is the **Thundering Herd** problem, and it's a magnificent teaching moment.

## Weaknesses

1. **Context window tax is steep on small-buffer units.** A Scout (6 slots) that enables Ping-Back on both hook slots could spend 2-3 slots on acknowledgment traffic, leaving only 3-4 for actual observations. The mechanic punishes the unit type that benefits most from delivery confirmation.

2. **Doubles effective EM emissions.** Every acknowledged signal generates a return signal. In missions where stealth matters, Ping-Back is a luxury that paints a target on the entire relay chain.

3. **False timeout complexity.** A player who sets ACK_TIMEOUT to 3 ticks on a 3-hop path will receive constant false timeouts because the round-trip time exceeds the timeout. This is realistic (misconfigured TCP timeouts cause real production outages) but potentially frustrating for players who don't understand signal latency math.

4. **Inspector overload risk.** With Ping-Backs and timeout entries populating context windows, the Inspector timeline becomes denser. More entries per tick, more causal chains to trace, more noise in the diagnostic view.

5. **Possible crutch effect.** Players who rely on Ping-Back may never develop intuition for "feeling" signal chain health through battlefield behavior. The best players of the Silent Post Office model learn to read unit behavior as a proxy for communication health — "STRIKER-B isn't moving toward the threat, so the signal probably didn't arrive." Ping-Back removes this skill-building pressure.

---

## Interaction Effects

**With context overload (locked):** Ping-Backs consume context window slots, making overload more likely. An acknowledged architecture runs closer to full capacity at all times. The irony: the mechanic designed to prevent communication failure *increases* the probability of context overload failure. This tension is rich — the player must balance diagnostic overhead against operational headroom.

**With EM emissions (locked):** Every Ping-Back is a detectable signal. Acknowledged architectures are roughly 2x as loud as silent ones. In missions with enemy detection units, the player faces a direct stealth-vs-reliability tradeoff.

**With relay chains (2.09, relay-as-SPOF):** Relays amplify the Ping-Back tax. A three-hop relay chain with full acknowledgment generates 6 signals per original transmission (3 forward hops + 3 return Ping-Back hops). The relay's 12-slot buffer and 4 hook slots can handle this, but only if the player budgets for it in context config.

**With counter-intelligence (2.16):** Enemy-injected hooks that fire acknowledged signals create a reverse information leak — the Ping-Back confirms to the enemy that their injected signal was received and processed. A player running counter-intelligence "hook judo" must disable Ping-Back on suspected enemy hooks to avoid confirming receipt.

**With the Thundering Herd:** If 4 Scouts all have Ping-Back + Resend enabled and the central Relay goes down for 2 ticks, all 4 retry simultaneously when the Relay recovers. The Relay receives 8 signals in one tick (4 originals + 4 retries) against a 12-slot buffer that may already be partially full. Context overload. Stun. Miss the next wave. More retries. The cascade is the most dramatic failure mode in the game and teaches exponential backoff without naming it.

**With the Inspector (locked):** Ping-Back entries and timeout entries in the context window give the Inspector new data to display. The decision trace can now show: "SCOUT-A sent threat signal at T10 → Ping-Back received at T14 → sender rule `confirm_delivery` matched → no action needed" or "SCOUT-A sent threat signal at T10 → ACK_TIMEOUT at T14 → sender rule `escalate_failure` fired → alert sent to COMMAND-A on `failures` channel at T15." The causal chain extends backwards through the acknowledgment layer.

---

## Comparable Games

**TCP/IP (the real world):** The entire Ping-Back mechanic is TCP's ACK/NACK/retransmit system made tactile. TCP's retransmission timeout (RTO) is ACK_TIMEOUT. TCP's SYN flood is the Thundering Herd. TCP's three-way handshake is what Model E (Read Receipt) approximates. The game teaches networking through play.

**Factorio — Logistics Network Alerts:** Factorio's logistics bots don't have acknowledgment, but the logistics network shows "items requested: 400, items available: 12" — a global dashboard of delivery health. Robot Uprising's Ping-Back is the per-signal version of this dashboard, distributed across individual agents rather than centralized.

**StarCraft — Unit Response Voicelines:** When you order a Marine to move, it says "Go go go!" This is an ACK — the unit confirms receipt of your command. When it says nothing (because it's dead or out of range), the silence IS the negative acknowledgment. Robot Uprising formalizes this into a mechanical system.

**Into the Breach — Damage Preview:** Into the Breach shows you exactly what will happen before you commit. The Ping-Back is the post-hoc version: not "this WILL be delivered" but "this WAS delivered." The preview is pre-commitment certainty; the Ping-Back is post-commitment verification.

**Screeps — Console Logging:** Screeps players inject `console.log` statements into their code to verify message delivery between creeps. This is manual instrumentation — the player builds their own acknowledgment system from raw code. Robot Uprising's Ping-Back is this pattern elevated to a first-class game mechanic with UI support.

---

## Sensory Description

### The Ping-Back Arrives

When a Ping-Back signal reaches the sender's context window, the sender's unit tile flashes with a quick **cyan pulse** — a single frame of soft blue light expanding outward from the unit's center, like a sonar ping in reverse. The context bar gains one slot with a distinctive **chevron icon** (a small "V" pointing left, indicating return traffic) colored in muted teal rather than the standard amber of regular signals. In the Inspector, Ping-Back entries appear in a lighter font weight than regular entries, with a dotted left border instead of solid — visually subordinate, diagnostic rather than operational.

### The Timeout Expires

When ACK_TIMEOUT elapses without a Ping-Back, the sender's hook slot icon — normally a steady amber glow — flickers **once** with a brief orange-to-red shift, like a warning light acknowledging a missed heartbeat. The context window gains a timeout entry marked with a small **hourglass icon** in muted red. In the Inspector, timeout entries have a dashed red left border and bold font — they demand attention. The decision trace highlights the timeout entry in warm amber when it triggers a rule, drawing the eye to the failure-response chain.

### The Thundering Herd

The most dramatic visual moment: a relay comes back online after being stunned, and four Ping-Back-enabled Scouts simultaneously retry. The relay's context bar — which had been dim grey during the stun — suddenly fills in a rapid left-to-right cascade, each slot lighting up amber in quick succession: *pip-pip-pip-pip-pip-pip-pip-pip*. The bar hits capacity. The last few signals stack against the cap. The overload triggers: the relay's tile **jitters** — a rapid 2-pixel oscillation left-right-left-right for one full tick, accompanied by a sharp crackling sound like static discharge. White sparks spray from the unit icon. The context bar flashes angry red for one frame, then dims as eviction kicks in, slots winking out in priority order. The Scouts, having received no Ping-Backs, all generate timeout entries simultaneously — four orange flickers in four corners of the board, synchronized, like warning lights in a control room. The player watches the cascade they designed, helpless during the sealed watch, already planning the fix: staggered retry timers, or maybe just... turning off Ping-Back on the forward scouts entirely.

### The Heartbeat Cadence

In Heartbeat mode, listening units emit a periodic pulse: a tiny **concentric circle** animation expanding from the unit every N ticks, colored in dim cyan, barely visible against the battlefield. When the heartbeat stops (unit destroyed or stunned), the absence is felt rather than seen — the steady rhythm breaks. In the Inspector, heartbeat entries appear as uniform, evenly-spaced teal dots in the timeline, and a gap in the dot pattern is immediately legible as "something went wrong at tick 34."

---

## Player Journeys

### Journey: Sofia, 15, Minecraft Redstone Veteran

**Context:** Mission 6. Sofia has just unlocked the Command agent and is building her first three-unit relay chain: SCOUT-A → RELAY-B → STRIKER-C. Last mission she watched STRIKER-C sit motionless for 20 ticks while enemies flanked from the east. The Inspector revealed the signal was dropped at RELAY-B (buffer full from ambient noise). She's determined to prevent this.

**Minute 0:00 — The Workbench**
Sofia opens SCOUT-A's blueprint in the workbench. The hook configuration panel shows two hook slots, both wired to the `threats` channel. She notices a new toggle she hasn't seen before: a small chevron icon next to each hook slot, greyed out, with a tooltip: "Ping-Back: receive delivery confirmation." She hovers. A tooltip expands: "When enabled, the receiver will send back an acknowledgment signal when your message arrives. Costs 1 context window slot per confirmation." She toggles it on. The chevron turns teal. Below the toggle, a new field appears: "ACK_TIMEOUT: 4 ticks" with a small slider (range 2-10).

**Minute 0:45 — The Math**
Sofia stares at the timeout slider. SCOUT-A is 1 hop from RELAY-B. Signal travel: 1 tick there, 1 tick back. Minimum round trip: 2 ticks. She sets ACK_TIMEOUT to 3 — one tick of margin. She notices the context window preview on SCOUT-A's blueprint now shows a projected capacity bar: "Estimated utilization: 4/6 slots (observations: 2, pending Ping-Backs: 2)." Two of her six slots are reserved for acknowledgment traffic. She frowns. That's a third of the Scout's memory spent on receipts.

**Minute 1:30 — The Rule**
She opens SCOUT-A's rules panel and adds a new rule: `IF ACK_TIMEOUT from threats channel → THEN resend signal on threats channel`. She drags it to priority 3, below "report threats" and "evade if adjacent enemy." She considers adding an escalation rule but decides to keep it simple for now.

**Minute 2:00 — The RELAY-B Problem**
She opens RELAY-B's blueprint. The relay has 12 buffer slots and 4 hook slots. She enables Ping-Back on RELAY-B's forwarding hook (the one that sends to STRIKER-C on `orders`). Now RELAY-B will also receive Ping-Backs from STRIKER-C, consuming 1-2 of its 12 slots for confirmation traffic. She adjusts the context config: Ping-Back entries get lowest eviction priority (keep them — they're diagnostic gold) but she caps them at 2 maximum retained. New entries evict old confirmations.

**Minute 3:15 — Execute**
She hits EXECUTE. The sealed watch begins. Tick 3: SCOUT-A spots an enemy at D6 and fires on `threats`. A green signal line streaks from SCOUT-A toward RELAY-B. Tick 4: RELAY-B receives, forwards to STRIKER-C on `orders`. A second green line. Tick 5: STRIKER-C receives the forwarded signal. A quick cyan flash on STRIKER-C — the auto-generated Ping-Back fires back toward RELAY-B. Simultaneously, RELAY-B's own Ping-Back fires back toward SCOUT-A. The board briefly shows two cyan dashed lines traveling in reverse alongside the green forward lines. Tick 6: SCOUT-A's tile pulses cyan. The Ping-Back arrived. Sofia exhales.

**Minute 4:00 — The Drop**
Tick 18: Enemy noise flooding begins. RELAY-B's context bar climbs — amber pips filling left to right. Tick 20: SCOUT-A sends another threat signal. The green line reaches RELAY-B at tick 21 — but RELAY-B's bar is full. The signal is dropped. No green line continues to STRIKER-C. No cyan flash. Tick 23: SCOUT-A's hook slot flickers orange-to-red. The ACK_TIMEOUT expired. Sofia sees the orange flicker during the sealed watch and *knows* — before the Inspector, before scrubbing, she knows the signal was lost. Tick 24: SCOUT-A's resend rule fires. A second green line shoots toward RELAY-B. This time RELAY-B has evicted old entries and has space. The signal lands. STRIKER-C moves toward D6 two ticks late — but alive, acting, not blind.

**Minute 5:30 — The Inspector**
In the debrief, Sofia opens the Inspector and clicks SCOUT-A. The context window timeline shows Ping-Back entries as teal chevrons interspersed with amber observation pips. At tick 23, a red hourglass icon: ACK_TIMEOUT. The decision trace shows: "Rule `resend_on_timeout` fired → resent threat signal on `threats` → delivered at T24 → Ping-Back received T25." She sees the complete retry cycle. She nods. The system worked. But she also sees: SCOUT-A's context window was at 5/6 capacity during the critical period. One more Ping-Back and the *Scout* would have overloaded. She opens her notebook and writes: "Need to filter Ping-Backs more aggressively. Or maybe disable Ping-Back on the Scout and only enable it on the Relay."

**UI Annotations:**
- **Ping-Back toggle:** Small chevron icon (▽) next to each hook slot in the workbench. Grey when off, teal when on. Tooltip on hover explains the mechanic in one sentence.
- **ACK_TIMEOUT slider:** Appears below the Ping-Back toggle when enabled. Range 2-10, default 4. Current value shown as digit next to the slider thumb.
- **Capacity preview:** Below the context config section, a projected utilization bar showing estimated slot allocation including Ping-Back overhead.
- **Cyan pulse:** Single-frame expansion animation on the unit tile when a Ping-Back arrives. Subtle enough to notice but not disruptive during sealed watch.
- **Orange flicker:** Brief color shift on the hook slot indicator when ACK_TIMEOUT expires. Visible during sealed watch as a real-time "something failed" signal.
- **Inspector Ping-Back entries:** Teal chevron icon, lighter font, dotted left border. Visually subordinate to operational entries.
- **Inspector timeout entries:** Red hourglass icon, bold font, dashed red left border. Visually prominent.

---

### Journey: Marcus, 42, Site Reliability Engineer

**Context:** Mission 9. Marcus has been building increasingly reliable architectures. His current design uses a dual-relay topology with full Ping-Back acknowledgment on all links. He's about to face the mission that introduces bidirectional enemy hacks — enemies that inject commands into his agents' hooks.

**Minute 0:00 — The Architecture Review**
Marcus's workbench shows five blueprints: SCOUT-A (forward observer), RELAY-B and RELAY-C (redundant relay pair), STRIKER-D (executor), COMMAND-E (orchestrator). Every hook has Ping-Back enabled. The channel map panel shows a dense web of teal-highlighted connections — forward signals in green, Ping-Back return paths in cyan. He notices the EM emission estimate at the bottom of the workbench: "Estimated EM signature: HIGH (2.4x base)." His acknowledged architecture is loud. He considers this acceptable — reliability over stealth.

**Minute 1:00 — The Hack Discovery**
The sealed watch begins. By tick 15, Marcus's architecture is humming: SCOUT-A reports, RELAY-B/C forward, STRIKER-D engages, COMMAND-E reroutes as needed. Cyan pulses ripple across the board with satisfying regularity. Then tick 22: an enemy specialist moves adjacent to RELAY-B. Tick 23: RELAY-B's hook configuration changes — a new hook appears, injected by the enemy's `hack` skill. Tick 24: RELAY-B begins forwarding enemy commands on the `orders` channel. STRIKER-D receives an order to move to A1 — the corner of the board, away from the fight.

**Minute 1:45 — The Ping-Back Betrayal**
Here's the devastating part: STRIKER-D processes the enemy-injected order and sends a Ping-Back. The Ping-Back travels back through RELAY-B to... the enemy specialist. The enemy now has *confirmation* that its injected command was received and acted upon. Marcus watches STRIKER-D march to A1 and realizes the Ping-Back — his reliability tool — just became an intelligence leak. The enemy knows exactly when its hack succeeds.

**Minute 2:30 — The Inspector Revelation**
In the debrief, Marcus scrubs to tick 24. He clicks STRIKER-D's context window. The decision trace shows: `[T24] Received on 'orders': MOVE A1 — source: RELAY-B (INJECTED) — Ping-Back sent to RELAY-B`. The Inspector flags the injected signal with a small red injection icon, but the Ping-Back was sent automatically — no rule checked whether the source was legitimate before acknowledging. Marcus leans back. "I built a system that confirms to the enemy that its attacks are working," he mutters. This is the read-receipt problem: in hostile environments, acknowledging receipt of a message tells the sender — even a malicious sender — that their message got through.

**Minute 3:30 — The Fix**
Back in the workbench, Marcus adds a new rule to STRIKER-D: `IF signal source is INJECTED → THEN suppress Ping-Back`. But wait — the agent doesn't know the signal is injected during processing. The INJECTED flag is only visible in the Inspector after the fact. The signal looks like a normal order from RELAY-B. Marcus realizes he needs a different approach: a context config filter that compares incoming signals against a whitelist of expected command patterns, suppressing Ping-Back for unrecognized patterns. He creates a new rule: `IF signal on 'orders' contains MOVE to grid edge → THEN ignore AND suppress ACK`. This is firewall logic — pattern-matching on signal content to distinguish legitimate orders from injected ones.

**Minute 5:00 — The Selective ACK**
Marcus redesigns his acknowledgment topology. SCOUT-A: Ping-Back OFF (Scouts are expendable; if they're lost, the absence of reports is signal enough). RELAY-B/C: Heartbeat only (periodic liveness ping, no per-message ACK — reduces EM signature while maintaining connection health monitoring). STRIKER-D → COMMAND-E: Full Registered Letter with escalation (critical path — COMMAND-E must know if STRIKER-D received its orders). COMMAND-E: Ping-Back OFF on outgoing, Ping-Back ON on incoming from STRIKER-D only. The EM estimate drops from 2.4x to 1.6x. The acknowledgment topology matches the trust topology — you acknowledge on the links you trust, not universally.

**UI Annotations:**
- **EM emission estimate:** Numerical readout at bottom of workbench showing total estimated EM signature as a multiplier of base (1.0x = no hooks, 2.0x = double). Updates live as Ping-Back toggles change.
- **Channel map Ping-Back overlay:** In the channel map panel, Ping-Back return paths shown as thin cyan dashed lines alongside green forward paths. Dense acknowledged architectures show a visible "echo" of every connection.
- **Injected signal flag:** In the Inspector, signals injected by enemy hacks show a small red syringe icon. Ping-Backs sent in response to injected signals are highlighted in warning orange.
- **Selective ACK rule:** A new rule action type: "suppress ACK" — prevents the auto-generated Ping-Back for signals matching the rule's condition. Shown in the rules panel as a teal chevron with a red slash through it.

---

### Journey: Anika, 14, First Strategy Game

**Context:** Mission 5. Anika just unlocked the factory and is building her first relay chain. She's never heard of TCP, acknowledgment protocols, or retry logic. She just wants her Scout to tell her Striker where the enemies are.

**Minute 0:00 — The New Icon**
Anika opens the workbench for her first factory-produced Scout blueprint. She's dragging hooks to connect `threats` channel between SCOUT and STRIKER when she notices a new element in the hook panel she hasn't seen before: a small heartbeat icon (a tiny EKG-style pulse line) next to the channel name. It's greyed out with a lock icon and text: "Unlocks: Mission 6." She ignores it — the tutorial boot log hasn't mentioned it yet.

**Minute 0:30 — The Silent Failure**
She hits EXECUTE. The sealed watch plays out: SCOUT spots enemies, sends on `threats`, STRIKER receives and engages. It works! Then tick 30: the enemy sends a noise burst. STRIKER's context window fills with junk. SCOUT sends a critical threat signal at tick 31, but STRIKER's window is full. The signal is silently dropped. STRIKER stands still while an enemy flanks from behind. STRIKER is eliminated. Anika groans. "Why didn't it MOVE?"

**Minute 2:00 — The Inspector Question**
In the Inspector, Anika clicks SCOUT at tick 31. She sees: "Sent on `threats`: enemy at F3." She clicks STRIKER at tick 31. The context window is full of noise entries. No threat signal. She scrubs forward. The signal never appears. "It just... didn't get there?" she says aloud. She clicks the SCOUT's sent signal. A tooltip appears: "Signal dropped — receiver context window full. Tip: In future missions, you'll unlock Ping-Back to detect dropped signals."

**Minute 3:00 — The Seed**
The tooltip plants a seed. She doesn't understand the mechanic yet, but she understands the problem: the signal vanished and nobody knew. She adjusts STRIKER's context config to filter noise (lowering noise eviction priority) so there's room for real signals. She replays. This time the signal gets through. But she remembers the tooltip. When Mission 6 arrives and the Heartbeat mechanic unlocks with a boot log entry — "SUBSYSTEM ONLINE: Connection Health Monitor. Units can now broadcast periodic liveness signals. If a relay goes silent, you'll know." — she immediately understands why it exists. She lived the failure that Heartbeat prevents.

**Minute 4:30 — Mission 6: The Pulse**
Two missions later. Anika enables Heartbeat on RELAY-B (the boot log walked her through it). Every 4 ticks, RELAY-B emits a tiny concentric circle animation — barely visible, a dim cyan ripple. It's almost subliminal. Tick 12: enemy Striker moves adjacent to RELAY-B. Tick 13: RELAY-B is eliminated. The ripple stops. Anika doesn't consciously notice the absence — but at tick 18, when STRIKER-C fails to engage, she thinks "RELAY is down" before checking. The rhythm trained her body to expect the pulse. Its absence is felt, not seen.

**Minute 6:00 — Mission 7: The Postcard**
Anika enables Passive Ping-Back on her SCOUT's threat hook. She watches the sealed execution. Every time STRIKER-C receives a threat signal and writes it to its context window, SCOUT-A gets a cyan flash. Anika starts counting the flashes unconsciously. Signal sent — *flash*. Signal sent — *flash*. Signal sent — no flash. "It dropped," she whispers, eight ticks before the consequences become visible on the battlefield. She's reading the communication health of her architecture in real-time, through a rhythm of light.

**UI Annotations:**
- **Locked mechanic preview:** Greyed-out icons with lock symbols in the workbench for mechanics not yet unlocked. Tooltip says which mission unlocks them. Builds anticipation without overwhelming.
- **Inspector drop tooltip:** When clicking a sent signal that was never received, a contextual tooltip explains the drop and teases the upcoming unlock. Pedagogical — teaches the problem before introducing the solution.
- **Boot log Heartbeat intro:** "SUBSYSTEM ONLINE: Connection Health Monitor" — three lines of diegetic text explaining Heartbeat in the AI's self-documenting voice. No tutorial pop-up.
- **Heartbeat ripple:** Tiny concentric circle animation, 3 frames, dim cyan, every N ticks. Subliminal rhythm. Its purpose is felt through absence, not presence.
- **Ping-Back flash cadence:** Cyan pulses on the sender's tile when acknowledgment arrives. Regular cadence during healthy communication. Broken cadence during failures. The player reads network health through visual rhythm.

---

## The TikTok Clip

Split screen. Left: a relay chain humming perfectly — green signal lines flowing left to right, cyan Ping-Back lines flowing right to left, a satisfying alternating rhythm of color. Right: the relay is destroyed. Green lines reach the dead relay and vanish. Cyan lines stop. Four Scouts' hook indicators flicker orange simultaneously — four corners of the board, synchronized warning lights. The Scouts all retry at once. The replacement relay spawns. Eight signals slam into it in one tick. The context bar fills in a rapid cascade — *pip-pip-pip-pip-pip-pip-pip-pip-pip-pip-pip-PIP* — overload. Jitter. Sparks. Stun. The player's face in the corner webcam: hands on head, laughing. Caption: "I built TCP and got the Thundering Herd problem. In a video game." 47K views.
