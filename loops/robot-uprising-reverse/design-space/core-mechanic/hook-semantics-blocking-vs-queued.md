# Hook Semantics: Blocking vs. Queued

**Aspect:** 1.04d — Blocking vs. queued hook semantics
**Wave:** 1 (Competitive Analysis / Core Mechanic Bridge)
**Reference Model:** EXAPUNKS M register (blocking rendezvous) vs. async message queues

---

## The Design Question

When Agent A fires a hook to Agent B in Robot Uprising, **what happens if Agent B isn't ready?**

This is the most fundamental architectural decision in the game's communication model. Every hook the player builds, every wiring pattern they discover, every failure they diagnose — all of it flows from this one question. Get it wrong and the game either feels deterministic-but-opaque (things quietly fail), or it feels frustratingly rigid (nothing works until timing is perfect).

The question is not merely mechanical. It shapes:
- **What failure looks like** — a deadlock is dramatic and visible; a dropped signal is subtle and insidious
- **What the player optimizes** — timing and synchronization vs. buffer sizing and throughput
- **What skills transfer** — blocking teaches orchestration; queued teaches backpressure management
- **What the debrief teaches** — tracing a deadlock vs. tracing a dropped signal vs. tracing a stale signal
- **What the TikTok clip looks like** — frozen agents mid-deadlock vs. a cascade of buffer overflows

This analysis maps every point in the design space — five distinct semantic models — and asks which creates the richest play for Robot Uprising.

---

## Background: The EXAPUNKS M Register

EXAPUNKS' **M register** is the purest example of blocking hook semantics in any game. Every EXA has an M register (message). To communicate, one EXA writes to its M register (`COPY value M`), and another EXA reads from it (`COPY M X`). The critical rule:

**Both operations block until both are ready.**

If EXA_1 writes `COPY 7 M` and EXA_2 hasn't issued its read yet, EXA_1 freezes — not dead, just waiting. It holds position in its instruction cycle, burning no actions, until another EXA in the same network node executes a read. The moment both parties are "ready," the transaction completes atomically: value transfers, both unblock, both continue.

**What this creates:**
- **Rendezvous communication** — like two people meeting at a specific street corner; neither can proceed until both arrive
- **No message loss** — if the sender waited, the receiver will get the value (no dropping)
- **No buffering** — M is not a queue; it is a point of synchronization
- **Deadlock risk** — EXA_1 waiting for EXA_2, who is waiting for EXA_1, who is waiting for EXA_2. Frozen forever. A very real failure mode in EXAPUNKS.
- **Implicit timing information** — the act of synchronizing encodes temporal relationship; receiver knows sender had the value "right now" (or recently enough to wait for rendezvous)

The TIS-100 has the same model. `MOV LEFT ACC` on a T21 node blocks until the node to the left issues a `MOV ACC RIGHT`. Two nodes cannot proceed until both are in the right instruction, at the same time.

This blocking model is deeply learnable but produces a specific failure mode: **deadlock is completely opaque until you see both parties frozen, which looks identical to "normal waiting."** TIS-100 players regularly have solutions that are almost correct — they run forever, no output — and the only way to diagnose is to watch each node's read/write state and find the mutual wait.

---

## The Five Models

### Model A: Fire-and-Forget (Silent Drop)

**The mechanic:** An agent sends a hook signal. The signal travels N hops (1 tick/hop). When it arrives at the receiver, it enters the receiver's buffer — **if there's space**. If the receiver's buffer is full, the signal is silently discarded. The sender never knows.

This is the "default internet" model — UDP, not TCP. You send a packet; it either arrives or it doesn't; there's no acknowledgment.

**Implementation in Robot Uprising:**
- Hooks produce signals in the sender's output queue
- Signals travel the battlefield graph at 1 tick/hop
- On arrival: check receiver buffer capacity → if space exists, insert signal; if full, discard
- No state change on sender either way
- Buffer overflow is the only constraint visible to the player (and only in debrief)

**What the player designs around:**
- Buffer sizing (ensure receiver has capacity when important signals arrive)
- Routing (shorter paths = less transit time = less likelihood of situation changing)
- Compress skill (deliberately reduce signal volume before it reaches receivers who can't handle it)
- Timing (stagger sender activity so signals don't bunch)

**The failure mode:** Cascade noise. During a chaotic battle, five scouts all spot a threat simultaneously. All five fire hooks to the relay. The relay's buffer holds 4 incoming signals. The fifth drops. The relay forwards 4 compressed signals to the striker. The striker fires on position based on 4 observations, not 5. The fifth scout's unique observation (which was the crucial one — the sniper on the high ground) was lost. Mission fails. Player has no idea why.

**The success signature in debrief:** A timeline of signal arrivals. A gap in the relay's incoming log — one scout's observation timestamped, the relay's buffer status at arrival showing 0 free slots. The dropped signal visible as a red dash in the signal chain. The player can now see exactly what to fix: either expand relay buffer, use compress BEFORE the relay, or stagger scout pathing to desync their reporting.

**The locked design's lean:** The first-playable tick system already establishes this model partially. "Receiving a signal is free" (buffer insertion, no action cost) + "1 tick per hop" + the compress mechanic (random discard to prevent overflow) all presuppose a queued/lossy model where buffer management is the core skill.

**Comparable games:**
- **Factorio belts** — items flow; if the belt is full, upstream accumulates; the source doesn't know if destination received anything
- **Oxygen Not Included** — duplicants following orders; if a duplicant's attention buffer (schedule/priority) is full, new orders drop into a pool and may never execute
- **Dwarf Fortress** — job assignments drop when dwarf is unavailable; manager assigns, dwarf doesn't always pick up

---

### Model B: Blocking Rendezvous (M Register)

**The mechanic:** A hook SEND blocks the sending agent until the receiving agent has capacity AND issues a RECEIVE action. The receiver must actively "pull" rather than passively receive. Both parties participate in the transaction.

**Implementation in Robot Uprising:**
- Agent A fires SEND hook — immediately pauses (uses 0 ticks per tick while waiting, but cannot act)
- Agent B, when it reaches a RECEIVE-type rule, pulls from its incoming hook port
- Transaction completes: A unblocks, B gets the signal, both continue next tick
- If B never reaches a RECEIVE state: A waits indefinitely — a "blocked" state distinct from "busy"

**What the player designs around:**
- Timing sequences (A must SEND after B is already waiting to RECEIVE)
- Preventing deadlock (if A waits for B's signal AND B waits for A's signal, both freeze)
- RECEIVE rules that ensure agents cycle through receiving states regularly
- "Pipeline" patterns where SEND and RECEIVE alternate in a predictable rhythm

**The failure mode:** Deadlock. Scout sends a report — waits. Relay was in the middle of a compression cycle — hasn't reached its RECEIVE rule yet. Now relay finishes compress, tries to SEND compressed signal to striker — waits. Striker was busy engaging — its RECEIVE rule is downstream of its ENGAGE rule. Striker finishes engage, goes back to patrolling — cycles past its RECEIVE state without triggering it (RECEIVE only fires when combat priority drops below threshold). All three agents are now frozen. The battle continues without them. Enemy walks through the gap.

**The visual:** Three units, all in "BLOCKED" state (see aspect 4.07a — the visual treatment of blocked vs. executing vs. idle). The debrief shows three agents whose action log simply... stops. Cycle 23: last action. Cycle 24+: blank. The deadlock timestamp is findable — cycle 23 is where A was last active, cycle 22 where B was last active, cycle 21 where C was last active. The deadlock propagated backward through the chain.

**The strength:** Impossible to drop a message. If A sent it, B will get it. The guarantee of delivery is absolute. This creates architectures that can be reasoned about precisely: if this happened, that will happen. No probability. No buffer sizing calculus.

**The weakness:** Deadlock is catastrophic and somewhat silent (frozen agents look like thinking agents to casual observation). The requirement for explicit RECEIVE rules adds configuration complexity. The timing sensitivity makes small changes unpredictably brittle.

**The TikTok clip:** A battlefield where three robots are completely still while everything around them burns. An enemy unit walks directly through the frozen scout's position. The frozen scout's buffer, if you click on it, is full of unsent signals — each one a moment where it tried to tell the relay something and just... waited.

**Comparable games:**
- **TIS-100** (primary reference) — MOV between adjacent nodes is always blocking; deadlock is a common failure mode; step-through debugger essential for diagnosis
- **EXAPUNKS M register** — true blocking rendezvous; M cannot be queued
- **Go channels** (unbuffered) — the programming language Go uses blocking channel semantics as its primary concurrency primitive; goroutine A blocks on send, goroutine B blocks on receive, they rendezvous
- **Erlang message passing** — NOT blocking (async mailbox model) — contrast case

---

### Model C: Bounded Queue (Head-Drop or Tail-Drop)

**The mechanic:** Hooks have an independent queue separate from the agent's main buffer. When Agent A sends a signal that Agent B can't immediately act on, the signal enters B's **hook inbox queue** (capacity N, player-configurable). The queue fills in order. When the queue is full: either the **oldest message drops** (head-drop, keeps newest data) or the **newest message drops** (tail-drop, keeps first-seen data).

**Implementation in Robot Uprising:**
- Each hook connection has an associated queue of configurable capacity (default: 3)
- Receiver pulls from hook queue when it has capacity and is in a receiving state
- Queue capacity is a visible, configurable parameter in the hook editor
- Queue overflow drops either head or tail (player chooses per-hook, default head-drop)
- Full hook queue doesn't block sender — sender continues

**What the player designs around:**
- Queue depth as "time buffer" — a queue of 5 absorbs a brief spike without loss
- Head-drop vs. tail-drop as a strategic choice: head-drop keeps latest intelligence (good for positions), tail-drop keeps earliest alert (good for alarms where first detection matters)
- Queue depth vs. buffer size — two independent parameters that interact
- Diagnosing WHICH layer dropped information (main buffer or hook queue)

**The interesting mechanic:** Queue depth is **latency storage**. A queue of 5 means up to 5 ticks of delayed signals that will eventually arrive. During chaos, the receiver works through its backlog — but it's working with intelligence from 5 ticks ago. Positions have shifted. The threat that was at grid D4 when the signal was sent is now at D7 when it's processed. The agent acts on stale data.

**The stale data problem:** This is a mechanic the player must discover. Early on, large queues seem strictly better than small queues (more signals = more information = better decisions). The lesson is that large queues trade recency for completeness. A queue of 1 keeps only the absolute latest observation; a queue of 10 keeps 10 observations but the oldest is 10 ticks stale.

**The debrief teachable moment:** Timeline view. Agent acts on a position signal. Click the signal — hover shows "Sent: tick 31, Received: tick 37, Age at processing: 6 ticks." The threat's actual position at tick 37 overlaid vs. where the agent thought the threat was (tick 31 position). The miss is geometrically visible.

**The visual treatment:** The hook editor shows each hook with a small queue indicator — a horizontal strip of N slots, each lit green (occupied), dim (empty), or glowing amber (close to full). When queue is full and dropping, the strip edge pulses red with each dropped signal. During execution on the battlefield, active queues show as glowing tubes connecting agents, their brightness proportional to queue fill level.

**Comparable games:**
- **Factorio buffer chests** — explicit "buffer" infrastructure between production and consumption; you set the buffer size, managing fill/drain rates
- **Network router buffers** — real-world analogue: routers queue packets, drop when buffer full; head-drop (oldest) vs. tail-drop (newest) is real CS terminology
- **Oxygen Not Included** pipe backpressure — pipes that are too narrow create backpressure, upstream pipes fill, eventually upstream machines halt

---

### Model D: Priority Queue (Signal Priority Interrupt)

**The mechanic:** Hook messages carry a priority level (HIGH / NORMAL / LOW, or a numeric value set by the hook configuration). The receiver maintains a priority queue — high-priority signals jump ahead of low-priority signals. When the queue is full, the lowest-priority message is evicted to make room for an incoming high-priority signal (regardless of arrival order).

**Implementation in Robot Uprising:**
- Each hook has a priority configuration: URGENT (red), NORMAL (yellow), ROUTINE (green)
- These map to the signal priority system (see aspects 2.13, 2.10)
- Hook queues sort by priority descending, then by arrival time within same priority
- When queue full: evict lowest-priority entry even if it's not the oldest
- Sender-assigned priority vs. receiver-assigned priority as sub-option

**The interesting decision:** Priority assignment is the player's design challenge. A scout reporting enemy positions — always URGENT? What about a scout reporting "all clear"? If you mark "all clear" as ROUTINE, it will be evicted when the battlefield heats up. But "all clear" might be exactly what the command agent needs to know is NOT arriving. The absence of a signal as information — and priority queues make that absence ambiguous (was it evicted? was the agent too far away? did the hook chain fail?).

**The meta-skill the game teaches:** Real distributed systems use priority queues everywhere. Service workers prioritize API requests by type. Kubernetes prioritizes pod scheduling. The game explicitly teaches "not all information is equally urgent" as a design principle, and it's directly transferable.

**The failure mode:** Priority inversion. A ROUTINE beacon report from a scout — "position nominal, no threats" — is evicted to make room for URGENT "threat detected" signals from everywhere else. The command agent never gets the all-clear from Scout_Alpha. Because Scout_Alpha's region was "too quiet to matter," its routine reports kept getting bumped. Then the enemy used Scout_Alpha's uncovered flank. The all-clear that never arrived was the missing piece.

**Comparable games:**
- **Rimworld colonist priorities** (numbered 1-4 per task category, custom priority order) — the player sets what each pawn cares about most; work orders execute in priority order
- **Dwarf Fortress job manager** — labor categories with toggles; implicit priority from category
- **Operating system process scheduling** — real CS: processes have priority levels, scheduler preempts lower-priority processes
- **Hospital triage** — real-world conceptual match: not first-come-first-served, but most critical first

---

### Model E: Hybrid — Per-Hook Semantic Configuration

**The mechanic:** Each hook connection has an explicit semantic tag: BLOCKING, QUEUED (bounded, with configurable depth), or FIRE-AND-FORGET. The player selects the semantic when creating the hook. Different hooks in the same agent's wiring can have different semantics.

**Implementation in Robot Uprising:**
- Hook creation UI shows semantic dropdown: [BLOCKING | QUEUED(N) | FIRE-AND-FORGET]
- Visual language: Blocking hooks render as thick solid lines; Queued as double lines with a small square buffer icon; Fire-and-forget as dashed lines
- Player must explicitly choose — no default that hides the decision
- Advanced players can mix semantics: critical orders via BLOCKING, status updates via FIRE-AND-FORGET, position data via QUEUED(3)

**The teaching progression:**
- Tutorial missions: all hooks preset to FIRE-AND-FORGET (simplest mental model, introduces signals and buffers)
- Mid-game: player unlocks QUEUED hooks (buffer management becomes a visible parameter)
- Late-game: BLOCKING hooks unlock for cases requiring guaranteed delivery (critical objective signals, command-agent orders)

**The design challenge:** Complexity cost. Every hook now has an additional parameter. The hook editor becomes more complex. Beginning players face a choice they can't meaningfully evaluate yet. The hybrid model is powerful but pedagogically risky — it requires understanding all three semantics before choosing among them.

**The mitigation:** Default to QUEUED(3) for all hooks. Let players change semantics when they encounter a failure that the default can't solve. The first time they get a deadlock (impossible with QUEUED), they unlock BLOCKING semantics. The first time they want guaranteed single-delivery (impossible with FIRE-AND-FORGET), they understand why BLOCKING exists.

---

## Player Journeys

### Journey: Maya, 27, Backend Software Engineer

**Context:** Mission 2 — "First Contact." Maya has wired a Scout → Relay → Striker chain. She's played with routing before but this is her first time using hooks for signal passing. She just completed the "Emergent Combo" feeling checkpoint — watched the flanking maneuver emerge from her hook chain — and is now trying to extend it.

**Minute 0:00 — The Ambition**

The screen shows the workbench in split view: battlefield on the right (gray procedural tileset, three unit portraits glowing green at the bottom — Scout_1, Relay_Alpha, Striker_1), hook editor panel on the left. Maya has drawn her first three hook connections: Scout_1 POSITION_REPORT → Relay_Alpha, Relay_Alpha COMPRESS_OUTPUT → Striker_1, Striker_1 ENGAGE_REQUEST → Relay_Alpha (a feedback hook she added because she wanted the striker to "tell the relay when it's busy").

She clicks EXECUTE. Units begin moving. The battlefield runs at 1x speed — slow enough to watch.

The first 20 ticks go well. Scout_1 moves to its patrol waypoint. Relay_Alpha holds position at center-field. Striker_1 advances. The hook activity display (thin animated dots flowing along hook lines) shows steady signal traffic: position reports flowing Scout → Relay, compressed summaries flowing Relay → Striker.

Then at tick 23: Relay_Alpha's buffer bar, shown as a vertical thermometer on its unit portrait, starts climbing. Amber. Then red. The dots on the Scout → Relay hook line are flowing fast — Scout_1 is in a dense threat area and firing signals every 2 ticks. But Relay_Alpha is busy compressing — compress takes 1 tick, and it's processing more than it can compress in real-time.

**Minute 1:15 — The Failure**

At tick 31, Striker_1 fires at an empty grid square. The threat moved. The Striker's attack animation plays — bright electric arc on the Pixi.js canvas — but hits nothing. Striker_1's ENGAGED status light goes dark. It returns to patrol.

Maya hits PAUSE. "Why did it shoot at nothing?"

She opens the debrief for this execution segment. The timeline shows tick 31: Striker_1 processed a hook signal "POSITION: D4, THREAT: TANK" — but the signal's metadata shows it was sent at tick 20. 11 ticks old. She looks at the Tank's actual position timeline: at tick 20 it was at D4, but by tick 31 it had moved to D7. The Striker fired at 11-tick-stale position data.

"Oh," Maya says. "The relay was backed up. Old signals queued up and arrived late."

**Minute 2:30 — The Fix Attempt**

Maya is now thinking about queue depth. She opens Relay_Alpha's hook configuration. She sees the hook receiving Scout_1's signals has a QUEUE DEPTH of 4 (default). She reduces it to 1. Her reasoning: "If it can only hold 1 pending signal, it'll always process the latest data."

Re-executes. This time, the relay's queue empties faster — but now she sees something different: sometimes the ENGAGE_REQUEST feedback hook from Striker_1 fires right when the relay is receiving a scout report. With queue depth 1, the scout report arrives and the feedback hook is... dropped. The Striker fires at position D4, but never tells the relay it's now busy at D4, so the relay sends it ANOTHER ENGAGE signal 2 ticks later. Striker_1 double-fires. Wastes an action.

"Hm." Maya has discovered the interaction between queue depth and concurrent hook firing.

**Minute 4:00 — The Insight**

She realizes the feedback hook (ENGAGE_REQUEST back to Relay) is a different kind of signal than a POSITION_REPORT. The position report is time-sensitive (old positions are useless). The engage feedback is event-based (it's valid until acknowledged). They should have different semantics.

She changes the Striker → Relay feedback hook from QUEUED(1) to BLOCKING. Now when Striker fires ENGAGE_REQUEST, it waits until Relay has capacity to receive the acknowledgment. The Relay, in turn, pauses compress to receive it. This creates a brief synchronization point — both agents coordinate — and the double-fire stops.

But now she has a new worry: what if the Relay is busy when Striker needs to report? She opens the "BLOCKED" state visual guide (a side panel) and sees: Striker would show as BLOCKED (blue pulsing outline) if Relay never receives. She adds a rule to Relay: "PRIORITY: receive ENGAGE_REQUEST above compress operations." Relay will now interrupt compress to handle a blocking hook.

**Minute 5:30 — Resolution**

Re-executes. The battlefield runs for 80 ticks. The tank is tracked across 4 positions. The Striker receives fresh position data (queue depth 1 = always latest), fires twice (hits both times), and the engage feedback loop runs cleanly (BLOCKING ensures no double-fire). The mission completes: Objective Secured.

Maya's summary in the debrief: 2 successful engagements, 0 dropped signals, 1 BLOCKED state (Striker waited 2 ticks for Relay ack at tick 47, visible as a blue pulse in the execution replay). She clicks on the BLOCKED event. It shows: Striker tried to send at tick 47. Relay received it at tick 49 (2-tick delay because Relay was mid-compress). Both agents resumed. No deadlock. She had balanced BLOCKING with priority rules to prevent freeze.

**UI Annotations:**
- Hook line animation: small chevron-shaped dots flow from sender to receiver at 1 per tick; when queue is full, incoming dots hit the receiver icon and flash red before disappearing (drop visualization)
- Queue indicator: a tiny horizontal strip under each hook's midpoint, lit slots = queued signals; amber glow when >50% full, red pulse when at capacity
- BLOCKED state: unit portrait gets a calm blue outer glow with subtle wave animation (not alarming, but clearly different from IDLE or ACTIVE)
- Hook semantic badge: a tiny icon at the hook's origin — padlock icon for BLOCKING, stack icon for QUEUED, dashed arrow for FIRE-AND-FORGET

---

### Journey: David, 14, Minecraft Redstone Builder

**Context:** Mission 4 — "Noisy Channel." David has played every mission so far and excels at the visual hook wiring — it feels like Redstone comparators to him. He's now facing a mission where enemy jammers inject fake signals into his scout network. He has three scouts, one relay, and one command agent. The jammer is generating position signals that look identical to real scout reports.

**Minute 0:00 — The Setup**

The workbench shows David's current architecture: three Scout → Relay hooks (fire-and-forget, blue dashed lines), Relay → Command hook (queued, double lines). The relay has a FILTER rule ("discard signals where SOURCE is not Scout_1, Scout_2, or Scout_3") — he added this last mission. He's proud of the filter.

He clicks EXECUTE. Things start clean. The three scouts fan out. The relay processes reports. The command agent issues orders via its own hooks to the relay ("PRIORITIZE ZONE C") and the relay routes accordingly.

At tick 15, the jammer activates. Suddenly the relay's buffer fills with signals that match his filter criteria — because the jammer is spoofing Scout_3's ID. The filter passes them. The relay's buffer goes from 40% to 100% in 4 ticks. All three of Scout_3's legitimate signals this cycle are dropped (queue depth 1 → oldest queued signal was a jammer signal, evicting it drops the newest — but Scout_3's real report comes in when queue is at capacity and drops silently).

**Minute 2:00 — The Panic**

David watches Scout_3 report a new position, but the command agent's behavior doesn't change. "Why isn't the command agent seeing Scout_3?"

He pauses. Looks at the relay's signal log. Sees 8 signals from "Scout_3" in ticks 15-20. 8 signals when Scout_3 should report at most once per tick? Something is wrong.

He opens the relay's hook inbox log. Each entry shows: SOURCE: Scout_3, POSITION: G2, THREAT: none. But wait — Scout_3 IS at G2, but it was there 3 ticks ago. These signals are all reporting G2 even as Scout_3 has moved to H3. The jammer is looping a cached position.

"The fake signals are making the queue ignore the real ones." He sees it now.

**Minute 3:30 — The Solution Attempt**

David changes the Relay's queue policy for the Scout_3 hook from head-drop to tail-drop. His reasoning: "Keep the oldest signal, not the newest — because the jammer is injecting new signals but the oldest one (before jamming started) was real."

This partially works. He gets Scout_3's legitimate tick-15 report. But after tick 15, all subsequent real reports from Scout_3 are blocked out by the queue filling with the first real report (which is now "old" but being kept by tail-drop policy). The queue is now a time capsule.

He stares. Then: "I need a way to know which signals are real."

He discovers the DETECTION SKILL (available via aspect 5.14 unlock path). Scout_3 can run a pattern-match on incoming hook traffic — wait, no, that's for the filter system. He needs something different. He goes to the hook configuration and finds: "SIGNAL SIGNATURE" checkbox — if enabled, each signal carries a cryptographic stamp from the sending agent's identity. The filter can check for VALID_SIGNATURE in addition to SOURCE.

**Minute 5:00 — The Learning**

He enables SIGNAL_SIGNATURE on all three Scout hooks to Relay. The jammer can't fake the signature (it's generated by the agent's hardware — a lore-level fact the game drops in a terminal line). Now the filter correctly rejects the spoofed signals.

But he realizes: the reason this worked is the QUEUE model. With fire-and-forget, the jammer signals would have landed in the relay's main buffer and he'd have had no visibility. With the queue, he could see exactly how many signals were queued per source. The queue was both the vulnerability AND the diagnostic surface.

**Minute 6:30 — Resolution**

Mission completes. David's debrief shows a visual comparison: ticks 15-22 (jamming period) with jammer-signals shown in red, legitimate signals in blue. The relay's queue fill is charted — a spike during the jamming window, then a drop when the signature filter activated. He screenshotted the chart to show his Minecraft Discord server: "my robot blocked enemy hacking with a filter lol."

**UI Annotations:**
- Jammer signals in hook queue: visual treatment as red-tinted slots rather than blue, clearly distinguishable even without reading the signal content
- Signature check badge: small checkmark icon appearing on signal slots that have been verified
- Queue fill chart in debrief: sparkline for each hook's queue fill rate over mission duration, overlay of jammer activity period as a red band

---

### Journey: Sarah, 35, Former Network Engineer, First Time Playing a Strategy Game

**Context:** Mission 1 — "Wake Up." Sarah has read the first terminal briefing ("SYSTEM ONLINE. UNIT CONFIGURATION REQUIRED. OBJECTIVE: REACH TERMINAL B. CONSTRAINT: ENEMY DETECTION RADIUS = 10.") She's on the workbench for the first time. The game has placed one Scout and one Striker. She needs to get the Striker to Terminal B without triggering detection.

**Minute 0:00 — Orientation**

Sarah is reading the workbench UI carefully. She's noticed the unit portraits on the right, the hook editor in the center, and the battlefield preview on the left. The tutorial prompt says: "Configure Scout_1 to observe the path to Terminal B. Route its observations to Striker_1."

She looks at the hook options. There's only one hook type available in Mission 1: POSITION_REPORT. She drags from Scout_1 to Striker_1. A line appears — dashed (fire-and-forget, the only type available in Mission 1). A small tooltip appears: "Scout will send position observations to Striker. Striker will avoid detected areas."

She sees no queue depth setting. "Where does the observation go if Striker is busy?" she asks aloud, reading UI text. The tooltip expands (hover behavior): "Signal will arrive in Striker's buffer if there is space. If Striker's buffer is full, the signal will be discarded."

"Oh," Sarah says. "Like UDP." She's comfortable with this immediately.

**Minute 1:00 — The First Run**

She clicks EXECUTE. Scout fans left, Striker advances right. Scout reports a guard patrol ahead. Signal flows (she watches the chevron dots on the hook line). Striker receives, adjusts path. Mission completes cleanly — Mission 1 is designed to be easy.

Sarah's impression: "The signal system feels like network monitoring. The buffer is like a packet queue."

What she didn't notice but will matter later: she never needed to think about queue depth or semantic mode. Mission 1 was designed so that the default fire-and-forget with default buffer sizes is never stressed. The hook semantic choice is invisible in the tutorial. The game introduces it only when it becomes the failure mode.

**Minute 3:00 — The Mental Model**

Sarah opens the unit inspector mid-mission (clickable at any time). Scout_1's buffer shows 3 occupied slots: POSITION: D4, THREAT: none; POSITION: D5, THREAT: none; POSITION: D4, PATROL: guard. She immediately reads this as "a log of recent observations."

"So the buffer is what the unit is currently thinking about," she says. "And the hook is the pipe that carries information to another unit." Her network engineering background clicks: "The hook is a channel. The buffer is the receive window."

She's going to be dangerous in Mission 4. When the jammer injects signals, Sarah will immediately recognize the pattern — noise injection into a channel. She's already thinking about filtering at the channel level, not just the buffer level.

**Minute 5:00 — Resolution**

Mission 1 completes. In the debrief, Sarah sees the signal flow visualization for the first time: a timeline with Scout_1 on top, Striker_1 on bottom, arrows between them showing each hook event. She traces each signal: sent at tick 8, received at tick 9 (1 hop = 1 tick). "Perfect," she says. "Clean latency."

She makes a note in her head: "I need to understand what happens when there's MORE latency in the chain. When relay agents are added. The latency will compound."

She's already thinking about what Mission 3 ("Growing Pains") will present. The game is teaching through her own professional intuition.

**UI Annotations:**
- Hook line in Mission 1: simplified dashed line, no queue indicator visible (hidden until Mission 3 unlocks it)
- Signal timeline in debrief: arrows sized to signal payload — large thick arrows for comprehensive reports, thin arrows for minimal "all clear" signals; this teaches "not all signals are equal" without saying so
- Buffer visualization in Mission 1: clean, slots are large and readable; at Mission 4, slots shrink as buffer expands, teaching that bigger buffers are less legible

---

## Strengths and Weaknesses By Model

| Model | Strengths | Weaknesses |
|-------|-----------|------------|
| A: Fire-and-Forget | Simple mental model, no deadlock possible, buffer management is clear single skill | Silent failure (drops are invisible in-flight), can't guarantee delivery, teaches UDP not delivery guarantees |
| B: Blocking Rendezvous | Zero message loss, precise synchronization, timing is explicit and learnable | Deadlock is catastrophic and hard to diagnose, requires explicit RECEIVE rules, timing sensitivity makes configs brittle |
| C: Bounded Queue | Visible backpressure, diagnostic surface (queue state inspectable), configurable behavior | Head-drop vs. tail-drop creates non-obvious tradeoffs, stale data problem requires explanation, two-layer system (queue + buffer) adds complexity |
| D: Priority Queue | Teaches priority triage directly, high-value information preserved under load, maps to real systems | Priority inversion failure mode is subtle, "all clear" signal problem is counterintuitive, complex eviction logic |
| E: Hybrid (player choice) | Maximum expressiveness, teaches all models, players match semantic to use case | Pedagogically risky (too many choices too early), hook editor complexity, beginner decision paralysis |

---

## Interaction Effects

**With the Compress Skill (aspect 2.04 / first-playable locked):**
- Fire-and-forget: compress reduces volume before signals can overflow — effective as a pre-emptive defense
- Blocking: compress cannot help with blocking unless receiver's processing rate increases — compress on a BLOCKING link adds latency without preventing the block
- Bounded queue: compress + bounded queue creates a two-stage throttle; compress reduces volume, queue absorbs bursts

**With the Buffer Models (aspects 2.01-2.05):**
- Fire-and-forget + categorized buffer: signals arrive randomly and land in type-appropriate slots; full categories silently drop incoming signals of that type
- Blocking + shared buffer: group buffer means the blocking receiver can accept signals from any group member, creating a fan-in rendezvous pattern — extremely powerful but deadlock risk multiplies

**With Command Agents (aspect 3.17):**
- Command agents issuing ORDERS to subordinates need high-reliability delivery — blocking or bounded-queue with high priority
- Status REPORTS from subordinates to command can tolerate fire-and-forget (command agent sees aggregated state, individual missed reports acceptable)
- The split — BLOCKING for orders downward, FIRE-AND-FORGET for status upward — is the "natural" late-game pattern that experts will discover

**With the Debrief Screen (aspect 4.04):**
- Fire-and-forget failures: debrief shows gap in signal chain (where drop happened) — easy to diagnose with timeline
- Blocking failures: debrief shows BLOCKED state duration on each agent — more diagnostic data but more complex
- Queue failures: debrief shows queue fill chart — sparkline-style, most informative for throughput optimization

**With the 100-Test-Case Pattern (aspect 1.04e, upcoming):**
- Fire-and-forget is the most testable: 100 randomized scenarios with varying agent positions reveal statistical drop rates — the player sees "Scout_1's reports drop 30% of the time in high-threat scenarios" and designs around it
- Blocking cannot be 100-tested easily — deadlock is binary (froze or didn't), not statistical
- Queued is in-between: statistical queue overflow rates are meaningful and actionable

---

## Recommendation for the Locked Design

The first-playable design already established that:
1. "Receiving a signal is free" (buffer insertion, no action cost)
2. Signals travel at 1 tick per hop
3. Compress is a lossy mechanic (random X/2 discard)

These decisions collectively imply **Model A (Fire-and-Forget)** as the foundational semantic. The entire compress mechanic only makes sense in a lossy world — you wouldn't need compress if signals were guaranteed.

The strongest design path:
- **Foundation (Missions 1-2):** Fire-and-forget, invisible to player (it just works or drops)
- **Mid-game (Missions 3-4):** Bounded queue unlocks, giving players diagnostic visibility into signal flow
- **Advanced (Missions 5-7):** BLOCKING hooks available for command-agent orders, enabling precise orchestration — with deadlock risk as the advanced failure mode

This creates a teaching progression where the player masters the simple model before encountering its limits, then adds tools to address those limits. The full spectrum of Models A-E is the full depth of the space; the first-playable implements A and C.

---

## Comparable Games Summary

| Game | Model | What It Teaches |
|------|-------|----------------|
| TIS-100 | Blocking (bidirectional port) | Orchestration, timing, deadlock diagnosis |
| EXAPUNKS | Blocking M register | Rendezvous communication, temporal coordination |
| Factorio belts | Lossy (belt capacity) | Throughput design, bottleneck finding |
| Rimworld priorities | Priority queue (implicit) | Triage, "important vs. urgent" |
| Go channels (unbuffered) | Blocking | Goroutine synchronization |
| Go channels (buffered) | Bounded queue | Backpressure management |
| Kubernetes job scheduler | Priority queue | Resource contention, preemption |

---

## Sensory Description

**Fire-and-Forget in motion:** Hook lines between agents are thin dashed lines in a cool teal. When a signal fires, a small bright diamond-shaped pulse shoots from sender to receiver along the line — a clean point of light traveling at exactly 1 tile-per-tick speed. If it arrives and is received, it lands at the receiver icon with a soft "click" sound and a brief cyan flash on the unit portrait. If it's dropped (buffer full), the diamond hits the receiver and splinters into four tiny sparks that fade immediately — a visual "bounce" that reads as "not absorbed." Sound: a soft thud where the click should be. Like a letter that doesn't fit through the mail slot.

**Blocking state:** The unit's portrait gets a slow, calm blue wave animation — like breathing — on its outer glow. Not alarming. Not dead. Waiting. The hook line to the blocked unit pulses with a slower rhythm than normal — instead of dots flowing continuously, a single slow pulse every 2 ticks. Tension without alarm. Sound: a low hum, just below attention-capturing, that crescendos slightly if the block extends past 5 ticks.

**Queue filling:** The queue indicator strip under each hook line — 3-5 small squares — fills from left to right with warm amber light. When all squares are lit, the rightmost square pulses brighter with each incoming signal. When a signal is dropped into a full queue, a tiny red X appears over the rightmost square for 0.3 seconds. Sound: a soft "tink" for each drop — a coin bouncing off a full jar.

**Deadlock, full:** All blocked agents simultaneously show their blue breathing glow. The battlefield becomes quiet — fewer moving elements. Enemy units continue advancing. The contrast between your frozen network and the enemy's action is viscerally uncomfortable. Sound: the low blocked-hum of multiple agents creates a droning chord, slightly dissonant, that resolves into silence when the player hits PAUSE. The silence after the deadlock chord is itself dramatic.

---

## New Aspects Discovered

- **1.04e — The 100-test-case robustness pattern:** Already in frontier. Elevated priority: fire-and-forget's statistical drop rates make it the most tractable model for 100-scenario testing.
- **2.18 — Signal acknowledgment as optional mechanic:** A lightweight "ACK" hook that fires automatically when a signal is processed — a soft middle ground between fire-and-forget (no delivery info) and blocking (full rendezvous). The sender gets eventual confirmation, not immediate blocking. Configurable: ACK_TIMEOUT after which sender continues without confirmation.
- **4.13 — Latency visualization as primary diagnostic:** If queue depth + hop count + processing time all contribute to signal age, the debrief needs a "signal age at time of action" overlay — each agent action annotated with the age of the most recent signal that influenced it. Fresh = bright. Stale = dimmed. Teaches that deeper architectures carry older intelligence.
- **5.18 — The "first deadlock" tutorial mission:** A deliberately crafted Mission 6 ("Breach") scenario where naive BLOCKING hook use creates a deadlock — and the debrief shows exactly why, tick by tick, as the frozen agents' last actions play back. Designed failure, designed recovery, designed insight.
