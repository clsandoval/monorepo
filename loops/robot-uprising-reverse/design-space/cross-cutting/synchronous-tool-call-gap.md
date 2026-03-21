# 8.08c — The Synchronous Tool Call Gap

**Aspect:** 8.08c — The synchronous tool call gap: whether Robot Uprising should add a synchronous communication primitive (blocking call); TIS-100 blocking port model; how this changes information warfare dynamics; pedagogical cost vs. vocabulary completeness
**Wave:** 8 (Cross-Cutting Synthesis)
**Category:** Vocabulary Completeness
**Related aspects:** 8.08 (real-language vocabulary claim), 8.08a (Translate Your Architecture bridge), 8.08b (Codex Real-World Parallels), 3.09a (blocking hook semantics), 3.09 (hook chaining), 1.02 (TIS-100 minimal instruction set), 1.04d (blocking vs. queued hook semantics), 5.18 (first deadlock tutorial mission), 2.01 (fixed-slot buffer model), 3.10b (signal latency legibility), 4.07a (visual treatment of blocked vs. executing)

---

## The Mechanic: Synchronous Calls vs. Async Hooks

Robot Uprising currently has one communication primitive: the hook. Hooks are fire-and-forget. A trigger fires, a signal enters the network, it arrives (or doesn't) some ticks later. The sender never waits. The sender never knows if the signal arrived. The sender has already moved on to its next action by the time the signal reaches the first hop.

Blocking hooks (3.09a) added a second mode: the handshake. The sender freezes until the receiver is ready. This guarantees delivery but risks deadlock. The sender still doesn't get anything back — it just knows the signal landed. A blocking hook is a certified letter: you stand at the counter until the postal clerk signs the receipt. You know it was received. But you don't get a reply.

The gap is the third primitive: the **synchronous call**. Agent A invokes a specific skill on Agent B, passes input data, blocks until Agent B executes the skill and returns a result. The caller receives an answer. This is not a signal traversing a channel — it is a function call across the battlefield.

### What a Tool Call Looks Like in Robot Uprising

In the workbench, a synchronous call appears as a new hook type: **CALL**. The syntax in the rule editor:

```
CALL RELAY-B.compress(raw_signal) → result ON recon-net
```

The scout fires this from its rule chain. It sends `raw_signal` to RELAY-B, specifically targeting the `compress` skill. RELAY-B's current action queue is interrupted (or the call waits until RELAY-B is idle, depending on the preemption policy). RELAY-B executes `compress` on the input. The output travels back to the scout on the same channel. The scout's rule chain resumes with `result` available in its buffer.

**Timing model:** 1 tick for the call to travel to RELAY-B. 1 tick for RELAY-B to execute the skill. 1 tick for the result to travel back. Minimum round-trip: 3 ticks. The scout is frozen for all 3. If RELAY-B is busy when the call arrives, add wait ticks. If RELAY-B is out of range, the call fails immediately (no indefinite blocking — this is not a blocking hook).

**The critical difference from blocking hooks:** A blocking hook is a one-way handshake — guaranteed delivery, no response. A synchronous call is a round-trip — guaranteed delivery AND guaranteed response. The blocking hook maps to TCP SYN-ACK. The synchronous call maps to HTTP request-response. The fire-and-forget hook maps to UDP.

### The Real-World Mapping: tool_use in Agentic AI

This is where the vocabulary claim (8.08) faces its most direct test. In Claude's agent architecture, `tool_use` is the dominant communication pattern. An agent doesn't fire a signal into the void hoping another service picks it up. It calls a tool. It blocks. It receives a structured response. It uses that response in its next reasoning step.

```python
# Real Claude Agent SDK
result = await client.messages.create(
    model="claude-sonnet-4-20250514",
    tools=[compress_tool],
    messages=[{"role": "user", "content": raw_signal}]
)
# Execution blocks here until the tool returns
compressed = result.content[0].text
```

Without a synchronous call primitive, Robot Uprising's vocabulary covers pub/sub messaging (hooks), guaranteed delivery (blocking hooks), buffered state (context windows), reactive triggers (hook conditions), and lossy processing (compress/filter/amplify skills). It does NOT cover the most common communication pattern in modern agentic AI: the blocking function call with a return value.

The Translate Your Architecture bridge (8.08a) will hit this wall. A player exports their Mission 10 config to Claude Agent SDK Python. Every hook becomes a pub/sub topic. Every rule becomes an if-elif chain. But in real agent code, most inter-agent communication is synchronous tool calls, not pub/sub. The exported code will use a pattern the player never practiced in the game. The vocabulary bridge has a missing plank.

### Impact on Information Warfare

Synchronous calls are predictable. An enemy observing the battlefield sees the scout freeze for exactly 3 ticks every time it calls the relay's compress skill. The freeze duration is deterministic: 1 tick out + 1 tick execute + 1 tick return. An enemy scout running a timing analysis can deduce: "That unit freezes for 3 ticks at regular intervals. It is making synchronous calls. The relay it's calling is within 1-hop range. The relay is executing a 1-tick skill."

Fire-and-forget hooks produce no observable freeze on the sender. Blocking hooks produce an unpredictable freeze (depends on receiver readiness). Synchronous calls produce a predictable freeze with a deterministic minimum duration. Each primitive has a different EM signature — a different shape on the timing analysis display.

**The timing attack:** An enemy striker learns the scout's call cadence (every 8 ticks, freeze for 3 ticks). It times its approach to arrive during the freeze window. The scout cannot evade while blocked in a synchronous call. The call that was supposed to produce better intelligence becomes the vulnerability that kills the scout.

**The counter:** The player learns to stagger call timing, use fire-and-forget for routine signals and synchronous calls only for critical decisions, or build redundant callers so one scout's freeze is covered by another scout's patrol. The design space for defending synchronous calls is rich — and it maps directly to real concerns about API call latency in production systems.

**EM emissions and the meta-level:** Every synchronous call produces a distinctive EM pattern — two signal hops visible on the channel (outbound and return), with a gap between them equal to the callee's execution time. On the Inspector's EM emissions overlay, a synchronous call looks like a parenthesis: a bright dot traveling out, a dark gap, a bright dot traveling back. A fire-and-forget hook looks like a single dot. A blocking hook looks like a dot that stops. Three visually distinct signatures. An enemy with EM detection skills can classify the player's communication patterns and infer architectural topology from timing alone.

---

## Player Journeys

#### Journey: Tomoko, 14, Competitive Minecraft redstoner

**Context:** Mission 9, "The Callback." Tomoko has mastered fire-and-forget hooks and used one blocking hook in Mission 7. She runs a 2-scout, 1-relay, 2-striker architecture. Her scouts send raw observations to the relay, the relay compresses and forwards to strikers. All fire-and-forget. Her win rate is 71% but she keeps losing to enemy configurations that exploit the 2-tick latency gap between her scout's observation and her striker's response.

**Minute 0:00 — The Mission Briefing**
The terminal scrolls: *"New capability: CALL. Target a specific unit's skill. Block until the result returns. Syntax: CALL [UNIT].[SKILL](input)."* Below the text, an animated diagram: a cyan dot leaves a scout, reaches a relay, a magenta dot returns. A small clock icon shows "3 ticks round-trip." Tomoko reads it twice. She's seen blocking hooks freeze her units. This freezes them longer — but gives something back.

**Minute 0:30 — The Workbench Decision**
She opens her SCOUT-A blueprint. The current hook: `ON_OBSERVE → SEND raw ON recon-net`. She replaces it with: `ON_OBSERVE(threat_level > 3) → CALL RELAY-B.compress(raw) → compressed ON recon-net`. For low-threat observations (threat_level <= 3), she keeps the fire-and-forget hook. High-threat observations get the synchronous call — guaranteed compressed intel, returned directly to the scout's buffer, then forwarded as a single clean signal to the striker. The scout sacrifices 3 ticks of mobility for a single high-fidelity compressed signal instead of a raw dump.

The workbench renders the new hook differently. The channel line between SCOUT-A and RELAY-B shifts from a dashed line (fire-and-forget) to a double line — two parallel tracks with small arrows pointing in opposite directions. A tiny telephone handset icon sits at the midpoint. The color shifts from cyan to a warm amber. Tomoko drags the threat_level threshold slider. At 3, about 40% of observations will trigger the call. At 5, only 10%. She sets it to 4 — a middle ground.

**Minute 1:15 — First Engagement**
EXECUTE. The sealed watch begins. The board is a dense urban grid — narrow alleys, rooftop positions, three approach vectors. SCOUT-A patrols the eastern corridor. At tick 6, it spots a two-unit enemy squad. Threat level: 5. The synchronous call fires. On the battlefield, SCOUT-A's sprite shifts to a new stance: one arm raised, palm open, a faint amber ring around its chassis pulsing once per tick. The double-line channel between SCOUT-A and RELAY-B illuminates — a bright dot races along the upper track toward the relay. One tick. The dot arrives at RELAY-B. The relay's compress glyph activates — a brief animation of four signal pips becoming two. One tick. A return dot races along the lower track, back toward the scout. One tick. The scout's palm closes. The amber ring fades. SCOUT-A has a compressed signal in its buffer. It immediately forwards it on recon-net to STRIKER-A.

Total time: 3 ticks frozen + 1 tick forward = 4 ticks from observation to striker receipt. Her old fire-and-forget chain took 1 tick (scout→relay) + 1 tick (relay→striker) = 2 ticks, but the signal was raw and consumed 3 buffer slots on the striker. The new path takes 4 ticks but delivers a single compressed slot. The striker has 7 free buffer slots instead of 5.

**Minute 2:00 — The Timing Attack**
At tick 14, SCOUT-A spots another squad. Threat level: 4. The call fires again. SCOUT-A freezes. An enemy scout has been watching from across the alley. It noted the 3-tick freeze at tick 6-8. It sees the freeze begin again at tick 14. It fires a signal to an enemy striker: `target_frozen, position_E4, window_3_ticks`. The enemy striker rushes the alley. SCOUT-A is mid-call, arm raised, unable to evade. At tick 16, the enemy striker reaches engagement range. SCOUT-A is still blocked — the return signal hasn't arrived. Tick 17: the return signal arrives. SCOUT-A unfreezes. But the enemy striker is already adjacent. SCOUT-A's evade skill fires but the striker's engage resolves first (simultaneous-tick resolution favors the attacker in contested range). SCOUT-A is eliminated.

**Minute 2:30 — The Debrief Moment**
Tomoko watches the replay. The Inspector shows SCOUT-A's state timeline: active, active, CALL_BLOCKED (tick 14), CALL_BLOCKED (tick 15), CALL_BLOCKED (tick 16), ACTIVE (tick 17 — too late). The enemy striker's approach is visible on the spatial overlay. She sees it: the synchronous call created a predictable vulnerability window. She clicks the enemy scout's buffer — it contains a timing analysis: `target_call_pattern: period=8, duration=3, next_predicted=22`. The enemy learned her cadence.

**Minute 3:30 — The Redesign**
Tomoko returns to the workbench. She adds randomization: the threat_level threshold now varies between 3 and 5 per evaluation cycle (a jitter mechanic). She also splits calls across two relays so the freeze pattern is harder to predict. The double-line channel now branches — two amber lines diverging to RELAY-B and RELAY-C, with a load-balancing rule. The timing attack surface fragments.

**UI Annotations:**
- Synchronous call channel: double parallel lines, amber, bidirectional arrows, telephone handset icon
- CALL_BLOCKED state: raised-palm sprite pose, amber ring pulse, distinct from BLOCKED (extended-arm pose, amber padlock)
- EM emissions overlay: parenthesis-shaped signature (dot out, gap, dot back) vs. single-dot fire-and-forget
- Enemy timing analysis in buffer: visible as structured data with `period`, `duration`, `next_predicted` fields

---

#### Journey: Marcus, 29, Backend engineer, plays after work

**Context:** Marcus builds microservices for a living. He's in Mission 11, post-campaign, experimenting in the sandbox. He's been using synchronous calls since Mission 9 and has developed an architecture he calls "the service mesh" — every unit calls every other unit's skills as needed, no dedicated channels, no relay hierarchy.

**Minute 0:00 — The Cascade Failure**
Marcus deploys his service mesh into a 4v4 Gauntlet match. Six units, all wired with synchronous calls to each other. SCOUT-A calls RELAY-B.compress. RELAY-B calls RELAY-C.filter. RELAY-C calls STRIKER-D.engage (passing targeting data synchronously). The call chain is 3 units deep. Minimum latency: 9 ticks (3 per call, chained sequentially). During those 9 ticks, SCOUT-A, RELAY-B, and RELAY-C are all frozen.

At tick 4, the enemy destroys RELAY-C. RELAY-B's call to RELAY-C.filter never returns. RELAY-B enters an indefinite CALL_BLOCKED state (the callee is dead — no response will ever arrive). SCOUT-A's call to RELAY-B is also blocked — RELAY-B can't accept the call because it's stuck waiting for RELAY-C. Three units frozen. The enemy walks through the gap.

**Minute 1:00 — The Inspector Revelation**
The debrief shows the dependency chain as a call graph: SCOUT-A → RELAY-B → RELAY-C (DESTROYED). A red X on RELAY-C. A cascading amber "BLOCKED" propagating backward through the chain. Marcus recognizes the pattern immediately — this is a distributed systems cascade failure. A downstream service dies, callers waiting on it stack up, their callers stack up. He's seen this in production. Last Tuesday, actually.

He mutters, "I need timeouts." The workbench has a timeout parameter on CALL hooks: `CALL RELAY-B.compress(raw) TIMEOUT 2 → result ON recon-net`. If the result doesn't return in 2 ticks past the minimum round-trip, the call aborts and the caller resumes with a null result. The rule chain handles the null: `IF result == NULL → SEND raw ON recon-net` (fallback to fire-and-forget).

**Minute 2:00 — The Circuit Breaker**
Marcus builds a more sophisticated pattern. After 2 consecutive timeouts to the same unit, stop calling it for 5 ticks (a cooldown rule). This is a circuit breaker — the exact pattern from his production code. He implements it with a counter in the scout's context window: `relay_b_failures: 0`. Each timeout increments the counter. A rule checks: `IF relay_b_failures >= 2 → USE fire-and-forget FOR 5 TICKS`. After 5 ticks, reset the counter and try calling again.

The workbench renders the circuit breaker as a small switch icon on the channel line that flips between "closed" (calls flowing, amber double-line) and "open" (calls blocked, line greyed out, a small prohibition icon). Marcus watches it flip during the next match — closed, closed, timeout, timeout, OPEN, five ticks of fire-and-forget, CLOSED, call succeeds. The switch flips with a soft mechanical click.

**Minute 3:30 — The Vocabulary Moment**
Marcus opens the Blueprint Codex entry for CALL hooks. The Real-World Parallel section reads: *"What Engineers Call It: synchronous RPC — remote procedure call. Your CALL hook is gRPC, REST, or tool_use in Claude's agent SDK. The caller blocks, the callee executes, the response returns. Every LLM agent that calls a tool — web search, code execution, database query — is making a synchronous call."*

He reads the "Why It Matters" section: *"Your circuit breaker pattern is the same one Netflix built into Hystrix. Your timeout parameter is the same one every HTTP client has. The difference: in Robot Uprising, a blocked caller can be killed. In production, a blocked service just accumulates memory. The game makes the cost of synchronous coupling visceral — your scout dies when your relay is slow. In production, your service just throws a 504."*

Marcus screenshots the Codex entry and posts it in his team's Slack. "This game just taught me more about circuit breakers in 3 minutes than our last incident retrospective."

**UI Annotations:**
- Call graph in Inspector: directed edges with round-trip arrows, red X on destroyed callee, amber propagation backward
- Circuit breaker switch: small toggle icon on channel line, closed=amber, open=grey with prohibition icon
- Timeout parameter: numeric input on CALL hook editor, with a small clock icon
- Codex Real-World Parallel: parchment-textured card back, "gRPC / REST / tool_use" in professional typography

---

#### Journey: Dr. Lena, 42, Professor of distributed systems, playtesting for curriculum use

**Context:** Dr. Lena is evaluating Robot Uprising for her graduate distributed systems course. She's in the sandbox, building configurations that demonstrate specific distributed systems concepts. She has just discovered synchronous calls and is comparing them systematically against hooks and blocking hooks.

**Minute 0:00 — The Taxonomy Grid**
She opens three workbench tabs side by side. Tab 1: fire-and-forget hook architecture. Tab 2: blocking hook architecture. Tab 3: synchronous call architecture. Same topology in each — 2 scouts, 1 relay, 1 striker. Same mission scenario. She wants to observe the behavioral differences under identical conditions.

Tab 1 renders dashed cyan lines. Tab 2 renders solid lines with padlock icons. Tab 3 renders double amber lines with handset icons. The visual taxonomy is immediately legible — she can tell the communication model from a glance at the board. "Good," she writes in her notes. "Students will see the difference before understanding it."

**Minute 1:00 — The Three Runs**
She executes all three against the same enemy seed. Tab 1 (fire-and-forget): scout sends, relay may or may not have buffer space, some signals lost, striker acts on incomplete data. Match ends tick 45. Win. Sloppy but fast. Tab 2 (blocking hooks): scout freezes when relay is busy, no signal loss, but scout misses observations while blocked. Match ends tick 52. Win. Clean but slow. Tab 3 (synchronous calls): scout calls relay, gets compressed result back, forwards to striker. Tight coordination. But at tick 30, the relay is destroyed and the scout freezes for 6 ticks waiting for a response that never comes. Match ends tick 61. Loss.

**Minute 2:00 — The Teaching Insight**
Dr. Lena sees the curriculum structure. Fire-and-forget is Week 1: eventual consistency, lossy messaging, UDP. Blocking hooks are Week 3: TCP, guaranteed delivery, deadlock. Synchronous calls are Week 5: RPC, cascade failures, circuit breakers, timeouts. The game's three communication primitives map to three weeks of her syllabus. She didn't plan this — the game's vocabulary pacing accidentally mirrors distributed systems pedagogy.

She checks the Inspector across all three tabs. Tab 1 shows scattered signal dots — some arriving, some fading in transit. Tab 2 shows handshake pairs with occasional amber freeze indicators. Tab 3 shows paired parenthesis signatures on the EM overlay, the relay's destruction creating a visible break in the return path — a bright dot traveling out that never comes back, leaving a half-open parenthesis hanging in the air like an unanswered question.

**Minute 3:30 — The Exam Question**
She drafts an exam question: "Given the following Robot Uprising configuration, identify which communication primitive each channel uses. For each synchronous call, calculate the maximum freeze duration assuming the callee is busy for N ticks. Identify the cascade failure path if Unit C is destroyed at tick T." The game IS the exam.

**UI Annotations:**
- Three-tab sandbox comparison: identical topology, different channel line styles (dashed/solid/double)
- EM overlay comparison: single dots (fire-and-forget), stopped dots (blocking), parenthesis pairs (synchronous)
- Half-open parenthesis: outbound dot reaches destroyed callee, no return dot, the visual signature of a call-into-void

---

## Strengths and Weaknesses

### Strengths

**Vocabulary completeness.** The synchronous call closes the most glaring gap in the game-to-real mapping. Without it, Robot Uprising teaches pub/sub and event-driven architecture but not the dominant pattern in agentic AI (tool_use). The Translate Your Architecture bridge (8.08a) becomes dramatically more honest — the exported code will contain patterns the player actually practiced.

**Rich failure modes.** Cascade failures, timeout design, circuit breakers — these are among the most important distributed systems concepts and they only emerge from synchronous coupling. Fire-and-forget hooks can't cascade (the sender already moved on). Blocking hooks can deadlock but can't cascade across three or more units (only the sender freezes). Synchronous calls introduce N-depth cascade chains where a single failure propagates backward through every caller in the chain.

**Information warfare depth.** The predictable freeze window creates an entirely new attack surface. Timing attacks on synchronous callers, EM signature classification (distinguishing hooks from calls by observing signal patterns), and the counter-design space (jitter, load balancing, decoy calls) all add strategic depth without adding new unit types or skills.

**Natural difficulty scaling.** Fire-and-forget is the easiest primitive (Missions 1-4). Blocking hooks add deadlock risk (Missions 5-7). Synchronous calls add cascade risk and timing vulnerability (Missions 8-10). Each primitive is strictly harder than the last. The learning curve has three natural plateaus.

### Weaknesses

**Pedagogical cost.** The game now has three communication primitives instead of two. Each requires visual language (dashed line, solid line, double line), mental model (postal mail, certified letter, phone call), and failure mode understanding (loss, deadlock, cascade). The cognitive load of the hook system increases by 50%. Players who struggled with blocking hooks (3.09a analysis showed the first-deadlock mission has the highest retry rate) will face an even steeper wall.

**Complexity budget.** Robot Uprising already has skills, rules, hooks, context windows, channels, eviction policies, buffer management, and signal latency. Adding synchronous calls means adding: call syntax, timeout parameters, null-result handling in rules, circuit breaker patterns, call-graph visualization in the Inspector, and a new EM signature type. Each of these needs tutorial content, UI design, and Inspector support.

**Interaction surface explosion.** Synchronous calls interact with EVERY existing mechanic. How do calls interact with hook chaining (3.09)? Can a hook trigger a call? Can a call's result trigger a hook? What happens when a synchronous call crosses a hot cascade (3.09d)? What happens when a caller is hacked (5.14) — does the corrupted call poison the callee's skill? The interaction matrix grows combinatorially.

**The "just use blocking hooks" argument.** A blocking hook with a mandatory response hook on the receiver is functionally similar to a synchronous call — the sender blocks until the receiver is ready, the receiver processes and fires a return hook, the sender unblocks when the return signal arrives. The difference is that this pattern requires the player to wire it manually (two hooks, two channels, a rule that links them), while a CALL primitive does it atomically. The pedagogical argument: making players wire their own RPC from hooks teaches MORE than giving them a primitive. The convenience argument: professionals don't wire their own RPC from pub/sub — they use gRPC.

---

## Interaction Effects

### With Blocking Hooks (3.09a)

Synchronous calls and blocking hooks share the BLOCKED state but differ in critical ways. A blocking hook freezes the sender until the receiver accepts. A synchronous call freezes the sender until the receiver executes a skill AND returns a result. The BLOCKED state needs sub-states: `BLOCKED_SEND` (waiting for acceptance, blocking hook) vs. `BLOCKED_CALL` (waiting for return, synchronous call). The Inspector must visually distinguish these — the amber padlock (blocking hook) vs. the amber handset (synchronous call). A unit can be blocked by a hook and a call simultaneously if it has multiple hook slots — one slot in BLOCKED_SEND, another in BLOCKED_CALL. The interaction creates units frozen for multiple independent reasons, each requiring separate resolution.

**Deadlock expansion:** Blocking hooks create two-party deadlocks (A blocks on B, B blocks on A). Synchronous calls create chain deadlocks: A calls B, B calls C, C calls A. The cycle can be arbitrarily long. Deadlock detection in the Inspector must handle both types — the pairwise deadlock visualization from 3.09a needs to extend to cycle detection in a directed call graph.

### With Signal Latency (1 tick per hop)

The 1-tick-per-hop rule applies to both outbound and return signals in a synchronous call. A call to a relay 1 hop away costs 3 ticks minimum (1 out + 1 execute + 1 return). A call to a relay 3 hops away costs 7 ticks (3 out + 1 execute + 3 return). Distance penalizes synchronous calls quadratically (round-trip) vs. linearly for fire-and-forget hooks (one-way). This creates a strong spatial incentive: keep callers close to callees. The relay placement decision (already important for latency) becomes doubly important for synchronous architectures. A relay at the center of the board minimizes maximum round-trip to any scout. A relay at the edge minimizes round-trip to nearby scouts but makes distant scouts pay heavily.

### With EM Emissions

Synchronous calls produce a distinctive bidirectional EM signature — two signal hops on the same channel within a short window, with a gap between them. An enemy with EM detection can classify communication types by pattern: single pulse = fire-and-forget, sustained pulse = blocking hook, paired pulse with gap = synchronous call. The EM detection meta-game gains a third pattern to recognize and a third pattern to disguise. Advanced players might interleave fake fire-and-forget signals to mask their synchronous call timing, or use dummy calls to create false timing patterns that mislead enemy analysis.

### With the Meta-Level

The meta-level — where players reason about the game's systems rather than individual configurations — gains a new axis. Currently, the meta-question is "what ratio of fire-and-forget to blocking hooks is optimal?" With synchronous calls, the meta-question becomes a three-way resource allocation: what percentage of your communication budget should be fire-and-forget (fast, lossy), blocking (reliable, deadlock-prone), or synchronous (informative, cascade-prone)? The meta-level taxonomy shifts from a spectrum (loose→tight coupling) to a triangle (loose, tight, synchronous). Each competitive season will discover different meta-optimal ratios depending on map design, enemy archetypes, and the current timing-attack counter-meta.

---

## Comparable Games and Systems

### TIS-100 — Blocking Ports as the Only Primitive

TIS-100 has no choice between communication modes. Every port is blocking. `MOV ACC RIGHT` blocks until the neighbor reads. This produces elegant constraint-based puzzles where the player's job is to orchestrate timing so that no node blocks for long. The blocking IS the puzzle. Robot Uprising's hybrid model (choose your coupling per hook) is richer but less constrained. TIS-100 proves that blocking-only can sustain an entire game. Robot Uprising proves that choosing your coupling mode is itself a design decision worth teaching.

### Go Channels — Buffered vs. Unbuffered

Go's concurrency model offers unbuffered channels (blocking, like TIS-100 ports) and buffered channels (non-blocking until full, like Robot Uprising's fire-and-forget hooks with buffer). Go does NOT have a built-in synchronous call primitive across goroutines — you build request-response patterns from two channels (send request on channel A, receive response on channel B). This is exactly the "wire your own RPC from hooks" approach. Go's design philosophy argues this is a feature, not a limitation: composing primitives teaches more than providing compound operations. The counter-argument: Go developers overwhelmingly use gRPC (a synchronous call library) for inter-service communication because wiring your own request-response is tedious and error-prone.

### Function Calls vs. Message Passing in Distributed Systems

The synchronous call debate in Robot Uprising recapitulates the oldest argument in distributed computing. Message passing (hooks) is loosely coupled, fault-tolerant, and hard to reason about. Remote procedure calls (synchronous calls) are tightly coupled, brittle, and easy to reason about. The industry has oscillated between these models for decades: CORBA (RPC) → SOAP (message-ish) → REST (RPC-ish) → event streaming (message) → gRPC (RPC) → pub/sub + serverless (message). Robot Uprising doesn't need to pick a side. It needs to make both available so players experience the tradeoff firsthand.

### Claude Agent SDK — tool_use as Synchronous Call

In Claude's tool use protocol, the agent emits a `tool_use` block, the runtime executes the tool, and returns a `tool_result` block. The agent blocks during execution. This is exactly the synchronous call primitive. If Robot Uprising claims its vocabulary maps 1:1 to real agentic AI engineering, and the most common agentic AI communication pattern is tool_use, then the absence of synchronous calls is a vocabulary hole that undermines the claim.

---

## Sensory Signatures

**The synchronous call in motion.** The amber double-line channel pulses faintly at rest — two parallel tracks, close together, like a miniature rail line. When a call fires, a bright dot appears at the caller and races along the upper track toward the callee. The caller's sprite shifts: one arm raised, palm open, fingers spread, a warm amber ring forms around the unit's base and pulses slowly — once per tick, a lighthouse rhythm. The dot arrives at the callee. The callee's skill glyph ignites briefly — compress shows its four-pips-to-two animation, filter shows its sieve animation. Then a return dot appears at the callee and races back along the lower track. When it reaches the caller, the amber ring dissolves, the palm closes, the caller resumes movement. The whole sequence has a satisfying rhythmic completeness — out, pause, back — like a breath held and released.

**The call into void.** When the callee is destroyed mid-call, the outbound dot reaches the callee's last position and finds nothing. It hovers for one tick, flickers, then fades with a soft descending tone — a three-note minor chord, each note lower than the last, like a question left unanswered. The return track remains dark. The caller's amber ring shifts from warm amber to cold grey, pulsing faster — the heartbeat of a unit that will never receive its answer. If no timeout is set, the grey ring persists until the match ends. The half-open parenthesis on the EM overlay is the visual record: a bright arc that reaches out but never curves back.

**The cascade freeze.** When three units form a synchronous call chain and the deepest callee fails, the freeze propagates backward in slow motion. RELAY-C's ring goes grey first. Then, one tick later, RELAY-B's ring shifts from amber to grey as it realizes its call will never return. Then SCOUT-A's ring shifts. Three grey rings pulsing at slightly different rates — a visual arrhythmia, three broken heartbeats on the battlefield. The sound design layers three instances of the descending minor chord, each one tick offset, creating a three-part canon of failure. Players who have heard this sound once recognize it instantly the next time. "The cascade song," the community will call it.

**The circuit breaker flip.** When Marcus's circuit breaker trips open, the double-line channel between the caller and the unreliable callee dims from amber to grey in a fast wipe — left to right, like a switch being thrown. A small mechanical click sound accompanies the transition. The prohibition icon appears at the midpoint of the greyed line. For the next 5 ticks, the line stays grey while fire-and-forget signals travel on a separate dashed cyan line (the fallback path). When the breaker closes again, the grey line re-illuminates amber in the reverse direction — right to left — with a second click. The player watching the board sees the architecture healing itself: grey line brightens, prohibition icon dissolves, double-line resumes pulsing. The sound of the closing click is pitched slightly higher than the opening click — optimism in a half-tone.
