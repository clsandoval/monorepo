# 3.09 — Hook Chaining: Can Hooks Trigger Other Hooks?

## Overview

The locked spec defines hooks as **fire-and-forget triggers wired to named channels**. A hook fires when its trigger condition is met, emitting a signal on its assigned channel. All listeners on that channel receive the signal. But the spec is silent on the most explosive design question in the entire wiring system:

**When a hook fires and delivers a signal to another unit's buffer, can that signal delivery itself trigger a hook on the receiving unit?**

If yes, hooks can chain: Scout observes enemy → fires `ON_OBSERVE` hook → sends signal on `recon-net` → Relay receives signal → fires `ON_RECEIVE` hook → compresses and forwards on `alert-net` → Striker receives compressed alert → fires `ON_RECEIVE` hook → moves toward threat. Three hooks, three units, one cascade — all resolving from a single observation event.

If no, hooks are strictly reactive to world state only — they fire from observations and skill activations, never from other hooks. The cascade above would require three separate ticks (Scout observes tick N, Relay processes tick N+1, Striker acts tick N+2) with each unit's rules evaluating buffer contents independently.

This is not a minor implementation detail. **Hook chaining determines whether the game is about building circuits or building filing cabinets.** Circuits have feedback, oscillation, cascading failure, emergent behavior. Filing cabinets have inputs and outputs. The entire character of the game changes based on this answer.

---

## The Six Approaches

### Approach A: No Chaining ("The Filing Cabinet")

**Philosophy:** Hooks fire only from world events (observation, combat, skill activation). Receiving a signal from a hook is NOT a trigger-worthy event — it just adds data to the buffer. The unit's rules process buffer contents on the next tick. Zero cascade risk. Zero emergent loops.

**Mechanical rules:**
- Hook triggers: `ON_OBSERVE`, `ON_THREAT`, `ON_ELIMINATE`, `ON_SKILL` (perception/combat/skill events only)
- `ON_RECEIVE` does NOT exist as a trigger
- Signals arrive in buffer → sit there → unit's rules evaluate next tick → unit acts
- Maximum signal propagation speed: 1 hop per tick (locked spec's signal latency)
- A 3-unit chain (Scout → Relay → Striker) takes 3 ticks minimum

**What it feels like:** The player wires up a beautiful multi-unit communication network. They hit EXECUTE. The sealed watch plays. Tick 1: Scout spots enemy, hook fires, signal appears on the wire as a green flash. Tick 2: nothing visible happens — the Relay's buffer received the signal but the Relay just... sits there processing. Tick 3: Relay's rules fire, compress skill activates, compressed signal sent. Tick 4: Striker's rules fire, movement begins. Four ticks from observation to action. Each hop is a separate evaluation cycle.

The board feels measured, deliberate. Each unit acts independently on its own tick. Information flows like postal mail — you send a letter, the recipient reads it on their schedule, writes a response, mails it back. There's a calm, orderly rhythm.

**Strengths:**
- **Zero infinite loop risk.** Without chaining, cycles are impossible. The tick scheduler simply evaluates each unit once per tick. Done.
- **Perfectly deterministic.** No cascade ordering ambiguity. Each tick's outcome depends only on the previous tick's state. Debugging is trivial — click any unit in the Inspector, see what its buffer contained, see which rule matched.
- **Legible during sealed watch.** Each unit acts once per tick. The spectator can follow each unit's decision independently. No "everything happens at once" confusion.
- **Teaches real-world async patterns.** Microservices communicate asynchronously. Messages sit in queues until consumers process them. This IS how distributed systems work.

**Weaknesses:**
- **Latency kills responsiveness.** Scout → Relay → Striker takes 3+ ticks. At 1 second per tick, that's 3 seconds from observation to action. An enemy Striker moves 1 tile per tick. In 3 ticks, it's adjacent and your unit is dead. One-shot-one-kill plus slow signal propagation means deep communication networks are a liability.
- **No emergent cascades.** The "flanking maneuver that nobody programmed" from the game's pitch requires hooks triggering hooks. Without chaining, every multi-step behavior is explicitly orchestrated through rules, tick by tick. Less magic.
- **The Relay problem.** Relays are stationary with no perception. Their entire purpose is signal processing. Without `ON_RECEIVE` as a trigger, Relays must use rules to check their buffer and conditionally fire skills. This means Relay behavior is rule-driven, not hook-driven — making hooks feel like a secondary system on the unit type most devoted to communication.
- **Information architecture feels passive.** The player designs a mailbox system, not a neural network. The pitch says "managing smart autonomous systems" — but without chaining, the systems aren't very autonomous. They're diligent mail sorters.

**Comparable games:**
- **TIS-100:** Nodes read from ports on their own clock cycle. No cascading. Each node executes one instruction per tick. A 5-node pipeline takes 5 ticks. Players build patience into their mental model.
- **Factorio (without combinators):** Inserters move items on their own cycle. Belts transport passively. No chain reactions in the logistics network — each machine processes independently.
- **Into the Breach:** No signal system at all, but the turn-based "each unit acts once" model creates the same measured pacing.

---

### Approach B: Same-Tick Chaining ("The Circuit Board")

**Philosophy:** When a hook delivers a signal that satisfies another unit's hook trigger, that second hook fires *within the same tick*. Cascades resolve fully before the tick advances. A single observation can trigger a chain of 2, 5, 10 hooks across multiple units — all in tick N.

**Mechanical rules:**
- `ON_RECEIVE` IS a valid hook trigger
- When a hook fires → signal delivered → receiving unit checks if any hook trigger matches → if yes, that hook fires immediately → its signal delivered → next receiver checks → cascade continues
- All cascade effects resolve within a single tick
- Maximum cascade depth: configurable (default 8, matching Command's max buffer)
- If cascade depth exceeded: chain terminates, remaining signals dropped, last unit enters context overload (stunned 1 tick)
- Evaluation order: breadth-first by signal latency (all 1-hop recipients resolve before 2-hop recipients)

**What it feels like:** The player wires up the same Scout → Relay → Striker chain. They hit EXECUTE. Tick 1: Scout spots enemy. Green flash on the wire from Scout to Relay. IMMEDIATELY, the Relay's hook fires — a second flash propagates from Relay to Striker. IMMEDIATELY, the Striker's hook fires — the unit pivots and begins moving toward the threat. All in tick 1. The entire network responds like a nervous system — stimulus to response in a single heartbeat.

The board feels electric. When the Scout spots something, the entire network LIGHTS UP with colored dashes racing along channel wires. It's a lightning bolt branching through the architecture. The player watches their creation come alive.

**Strengths:**
- **The game's pitch comes alive.** "You design their attention systems" means something visceral when a single perception event cascades through 4 units in one tick. The flanking maneuver EMERGES from wiring. The player didn't program "flank" — they wired observation to compression to routing to movement, and flanking fell out.
- **Relays become powerful.** A Relay with 4 hook slots becomes a signal router, transformer, and amplifier that processes instantly. Its purpose — sitting at a communication nexus — makes architectural sense when it can receive-and-forward in one tick.
- **The sealed watch is spectacular.** A well-designed network produces visible cascade explosions — green flashes racing through signal lines like electricity through a circuit diagram. The "TikTok clip" writes itself: Scout spots enemy, the screen lights up with branching signal paths, 4 units coordinate simultaneously, enemy is flanked in one tick.
- **Teaches event-driven architecture.** Real webhook systems cascade: Stripe payment → webhook → inventory update → webhook → shipping notification → webhook → analytics event. Same-tick chaining models this faithfully.
- **Command agents become powerful.** A Command agent with 6 hook slots can receive signals and instantly broadcast reassignment commands. The meta-level — building systems that build systems — requires this speed.

**Weaknesses:**
- **Infinite loops are possible.** Unit A hooks to channel X, Unit B listens on X and hooks to channel Y, Unit A listens on Y and hooks to channel X. Ping-pong loop. The depth limit catches this, but the player experiences it as a sudden stun with no obvious cause. Debugging "why did my Relay freeze?" requires tracing a cascade that happened instantaneously.
- **Cascade ordering matters and is invisible.** If a Striker listens on both `alert-net` and `recon-net`, and both receive signals in the same cascade, which processes first? The answer determines the Striker's buffer state when its rules evaluate. This ordering is a hidden mechanic that experts will exploit and beginners will stumble over.
- **Harder to follow during sealed watch.** When 5 signals cascade in one tick, the board flashes 5 times in rapid succession. Without careful animation pacing, it's visual noise. The spectator sees a burst of activity and can't trace causality.
- **EM emission burst.** Every hook in the cascade emits EM noise (per locked spec). A 5-hook cascade emits 5× the noise of a single action. Deep architectures become loud architectures. This is mechanically interesting but punishes complex wiring — potentially at odds with encouraging complex wiring.
- **Non-determinism risk under simultaneous triggers.** If two Scouts observe on the same tick and both trigger cascades through the same Relay, the cascade interleaving could produce different results depending on evaluation order. The breadth-first rule handles this, but the player needs to understand it.

**Cascade depth limit as teaching tool:**
The 8-depth limit is designed to catch infinite loops, but it also teaches a transferable engineering concept: **circuit breakers**. When a real microservice cascade goes too deep, circuit breakers trip. The game's cascade depth limit IS a circuit breaker. The stun effect when it trips IS the system degradation that follows a circuit breaker activation. The player learns: deep cascades are powerful but fragile.

**Comparable games:**
- **Magic: The Gathering's stack.** Triggered abilities fire other triggered abilities. The stack resolves LIFO. State-based actions check between each resolution. Mandatory infinite loops → draw. MTG's 30-year track record proves that cascading triggers create the deepest strategic gameplay in any card game — AND that they require careful rules to prevent degenerate states.
- **Yu-Gi-Oh chain links.** Effects chain onto effects, resolving in reverse order. SEGOC rules handle simultaneous triggers. The game's entire competitive depth lives in chain manipulation.
- **Factorio circuit networks.** Combinator output feeds to combinator input. Each combinator adds 1-tick delay. Feedback loops oscillate unless explicitly designed. Players build SR latches, memory cells, edge detectors — Robot Uprising's cascade system would produce analogous emergent constructions.

---

### Approach C: Delayed Chaining ("The Relay Race")

**Philosophy:** Hooks CAN trigger other hooks, but each hop introduces a mandatory 1-tick delay. A cascade still happens, but it plays out over multiple ticks — each link visible as a separate event on the timeline.

**Mechanical rules:**
- `ON_RECEIVE` IS a valid hook trigger
- When a hook fires → signal delivered to receiving unit's buffer at tick N+1 (per locked latency)
- At tick N+1, receiving unit evaluates: does any hook trigger match? If yes, fire → deliver at tick N+2
- Scout → Relay → Striker cascade takes 3 ticks (tick N: observe, tick N+1: relay processes, tick N+2: striker acts)
- **No cascade depth limit needed** — each hop costs a tick, so infinite loops cost infinite ticks and eventually run out of match length
- Loops are self-revealing: a ping-pong loop between two units shows as alternating signal flashes every tick — the player sees the oscillation

**What it feels like:** The player watches a cascade unfold like a slow-motion domino chain. Tick 1: Scout spots enemy, green flash to Relay. Tick 2: Relay hook fires, green flash to Striker. The player can watch the signal travel through their network tick by tick. It's visible, traceable, beautiful.

During the Inspector debrief, the player scrubs to tick 1 and watches the signal originate. Scrubs to tick 2, sees it arrive at the Relay and trigger the next hook. Scrubs to tick 3, sees the Striker respond. The causal chain is perfectly linear in time — each step is a separate event on the timeline. No cascade ordering ambiguity. No hidden simultaneous resolution.

**Strengths:**
- **The locked spec already says this.** "1 tick per hop" is in the locked decisions. Delayed chaining is the natural interpretation — signals take 1 tick per hop, and if receiving a signal triggers a hook that sends another signal, that also takes 1 tick per hop. Approach C is the most spec-compliant model.
- **Cascades are visible and debuggable.** Each link is a separate tick. The Inspector timeline shows them as discrete events. The player can step through and trace exactly what happened at each moment. No "everything happened at once" mystery.
- **Self-limiting loops.** A ping-pong loop between two units costs 2 ticks per oscillation. In a 60-tick match, it can only loop 30 times. The player sees the oscillation during sealed watch — the signal bounces back and forth visually. It's not hidden. It's not instant. It's an obvious pattern that teaches "you built an infinite loop." The match doesn't break — it just wastes those two units' buffer space on the loop.
- **EM emission is distributed.** Instead of 5 emissions in one tick (deafening), the cascade emits 1 per tick over 5 ticks. Each emission is individually detectable by enemies. The network "lights up" gradually, like a Christmas tree, giving enemies time to react to each signal — creating tactical counter-play.
- **Teaches latency tolerance.** Real distributed systems have propagation delay. AWS Lambda → SQS → Lambda → DynamoDB → Stream → Lambda = 3+ hops at hundreds of milliseconds each. The game teaches that deep architectures are powerful but slow, and that latency is a first-class design constraint.

**Weaknesses:**
- **Slow responsiveness for deep architectures.** Scout → Relay → Command → Relay → Striker = 5 ticks. At 1 second per tick, the enemy has moved 5 tiles. The Striker might be attacking a position the enemy vacated 4 ticks ago. Deep thinking is slow thinking.
- **Incentivizes flat architectures.** If every hop costs a tick, the optimal architecture is minimal hops: Scout → Striker directly, no Relay. Why route through a Relay (adding latency) when direct wiring is faster? The Relay becomes a luxury unit for late-game optimization, not a core building block.
- **Less visually dramatic.** The same-tick cascade produces an electric "lightning through the network" moment. Delayed chaining produces a gentle "domino chain" over several ticks. Less visceral. Less TikTok-able. The architecture feels methodical rather than electric.
- **Loops waste buffer space without drama.** A ping-pong loop silently fills both units' buffers with repeated signals, eventually causing context overload. The player might not realize why their Relay keeps stunning until they inspect the buffer and see 12 identical messages. The failure mode is quiet rather than loud.

**Comparable games:**
- **Factorio combinators.** Each combinator adds exactly 1 tick of delay. Feedback loops oscillate at 2-tick cycles. Memory cells use this deliberate delay to store state. Robot Uprising's delayed chaining would produce identical emergent patterns — and players who learn to exploit the tick delay for timing coordination will discover the same elegance Factorio players find in SR latches.
- **TIS-100 blocking ports.** Signal transfer between nodes takes 1 cycle. A pipeline of 4 nodes takes 4 cycles to propagate a value end-to-end. Pipeline throughput vs. latency is a core optimization challenge. Same trade-off applies here.
- **Real-world event sourcing.** Kafka topics → consumer group → produce to another topic → consumer group. Each hop is milliseconds-to-seconds of latency. The entire modern microservice architecture is a delayed chaining system.

---

### Approach D: Hybrid Depth-Limited Chaining ("The Fuse")

**Philosophy:** Hooks chain within the same tick, but with a configurable per-unit "chain budget." Each unit can participate in at most N cascade steps per tick. When the budget is exhausted, further signals queue for the next tick. The player explicitly manages cascade depth as a resource.

**Mechanical rules:**
- `ON_RECEIVE` IS a valid hook trigger
- Each unit has a **chain budget** (Scout: 1, Striker: 1, Relay: 3, Specialist: 2, Command: 4)
- When a hook fires within a cascade, the firing unit spends 1 chain budget
- When chain budget reaches 0, any further hook triggers on that unit are QUEUED for next tick (not dropped)
- Chain budget resets at the start of each tick
- If queued signals cause another cascade next tick, that's fine — the budget prevents infinite same-tick cascades

**What it feels like:** Scout spots enemy (costs 0 — observation triggers are free). Fires hook to Relay. Relay's `ON_RECEIVE` hook fires (chain budget: 3 → 2). Relay fires compressed signal to Relay-2 AND Striker simultaneously. Relay-2's `ON_RECEIVE` fires (budget: 3 → 2). Striker's `ON_RECEIVE` fires (budget: 1 → 0).

Now if Relay-2 tries to forward to Striker, the Striker's chain budget is exhausted — the signal queues for next tick. The cascade partially resolves instantly (3 hops) and partially spills to the next tick. The sealed watch shows a burst of activity that trails off into the next tick — like a firework that sparks, blooms, and then the last embers drift down.

**Strengths:**
- **Unit differentiation through cascade depth.** Relays and Commands can participate in deep same-tick cascades. Scouts and Strikers cannot. This mechanically encodes the difference between "networking units" and "field units" — Relays are DESIGNED for signal processing, so they get more cascade headroom.
- **Manageable infinite loop consequence.** A loop between two Relays exhausts both chain budgets (3 each = 6 total cascade steps) then stops until next tick. Next tick, 6 more steps. The loop is visible, bounded, and self-documenting: the Inspector shows "chain budget exhausted" on both units at the same tick.
- **Teaches resource budgeting.** The chain budget is a new resource the player manages. "My Command unit needs to process 3 incoming signals in one tick — its budget of 4 can handle this." "If I route through 2 Relays, I need 2 chain budget across the path." This mirrors real-world API rate limiting and compute budgets.
- **Graceful degradation, not hard failure.** When the budget exhausts, signals QUEUE rather than DROP. Nothing is lost. The cascade just takes an extra tick. The architecture slows down under load rather than breaking — exactly how back-pressure works in real message queues.

**Weaknesses:**
- **Another number to understand.** Players already track buffer size, hook slots, perception radius, speed, energy cost, and skills. Adding "chain budget" is another variable on every unit. The workbench needs another indicator (a tiny fuse icon? a chain-link counter?). Cognitive load increases.
- **Invisible budget accounting.** During sealed watch, the player sees a cascade happen and then stop partway. Why did it stop? Because Striker's chain budget ran out. But the player can't see chain budgets during the sealed watch — only context bars are visible. They'll need the Inspector to understand why a cascade was truncated.
- **Optimization becomes number crunching.** Advanced players will calculate: "this cascade path costs 1+3+1 = 5 chain budget, which exceeds Relay's 3, so I need to split into two paths." The strategic tension shifts from "what should my agents communicate?" to "can I fit this cascade into the budget?" Accounting isn't fun.
- **Unclear what "chain budget 1" even means for a Scout.** If a Scout's budget is 1 and it fires a hook that triggers an `ON_RECEIVE` on another unit, does the Scout spend a budget? Or only the receiver? The accounting rules get confusing at the edges.

**Comparable games:**
- **Screeps CPU bucket.** Each tick, player code gets a CPU budget. Exceed it and code pauses until next tick. Same concept — cascades have a per-tick compute budget that spills to the next tick when exceeded.
- **Slay the Spire energy system.** You can play N cards per turn. Some cards generate energy. But there's still a ceiling. The energy system constrains combo depth per turn — same as chain budget constraining cascade depth per tick.

---

### Approach E: Conditional Chaining ("The Spark Gap")

**Philosophy:** Not all signal receipts trigger cascading hooks. Only signals of a specific type or on specific channels are cascade-eligible. The player explicitly marks certain hooks as "hot" (cascade-capable) vs. "cold" (buffer-only). The naming creates a natural metaphor: hot wires carry current; cold wires carry data.

**Mechanical rules:**
- Each hook has a **mode** toggle: 🔥 HOT (cascade-eligible) or ❄️ COLD (buffer-only)
- HOT hooks: when signal arrives AND matches trigger, the hook fires within the same tick (cascade)
- COLD hooks: signal arrives in buffer normally, processed by rules next tick
- A unit can have a mix of hot and cold hooks
- Hot hooks emit 2× EM noise (the "spark" has a cost)
- Cold hooks emit no additional EM noise (silent delivery)
- Maximum same-tick cascade depth: 6 (the size of the smallest unit's buffer — Scout)
- If cascade exceeds depth 6: remaining hot hooks convert to cold for the rest of the tick

**What it feels like:** The player opens the hook editor on a Relay unit. Four hook slots. They configure:
- Slot 1: `ON_RECEIVE` from `recon-net` → compress → send on `alert-net` → 🔥 HOT
- Slot 2: `ON_RECEIVE` from `alert-net` → amplify → send on `broadcast` → ❄️ COLD
- Slot 3: `ON_RECEIVE` from `command-net` → reassign → local only → 🔥 HOT
- Slot 4: `ON_RECEIVE` from `diagnostic` → log → local only → ❄️ COLD

The first hook is hot because time-critical intelligence needs to cascade instantly. The second is cold because broadcast amplification can wait a tick — and going cold saves EM noise. The third is hot because command reassignment is urgent. The fourth is cold because diagnostics aren't time-sensitive.

During sealed watch, hot hooks produce visible **spark effects** — a bright white flash along the signal wire, like an electrical arc jumping a gap. Cold hooks produce the normal green flash. The visual distinction is immediate: the player can see which parts of their network are running "live" (same-tick cascade) and which are running "queued" (next-tick processing).

**Strengths:**
- **Player-controlled cascade.** The decision of whether to chain isn't a global rule — it's a per-hook design choice. The player explicitly decides which signal paths are urgent (hot) and which are background (cold). This IS the attention architecture design that the game promises.
- **EM noise trade-off.** Hot hooks are faster but louder. Cold hooks are slower but silent. This creates a fundamental strategic tension: do you want your network to respond instantly (and broadcast your architecture to enemies), or do you want stealth (and accept the latency)? "Dark networks" run all-cold. "Lightning networks" run all-hot. Most players mix.
- **Natural difficulty ramp.** Missions 1-4 (pre-placed units, tutorial) use COLD hooks only — the player learns basic wiring without cascade complexity. Mission 5 (factory introduction) unlocks HOT hooks as a new mechanic. The toggle adds one bit of complexity per hook, introduced when the player is ready.
- **Visual language reinforcement.** Hot = spark = danger = fast = loud. Cold = glow = safe = slow = quiet. The metaphor is deeply intuitive. A player who's never programmed instinctively understands that a "hot wire" is more reactive but more dangerous than a "cold wire."
- **Infinite loop prevention through player intent.** If the player builds a loop with all-cold hooks, it's harmless (signals cycle through buffers tick by tick, visible as oscillation). If they build a loop with hot hooks, the depth-6 limit catches it — AND the hot hooks are loud, attracting enemy attention to the looping units. Loops punish themselves through game mechanics, not arbitrary rules.

**Weaknesses:**
- **One more bit per hook.** Every hook now has trigger + channel + mode. The hook editor needs a toggle. The UI gets slightly more complex. Whether this is acceptable depends on how cluttered the workbench already is.
- **"Why is this cold?" confusion.** New players will sometimes set a hook to cold accidentally and wonder why their cascade doesn't propagate. Or set it to hot and wonder why enemies keep finding their Relay. The mode needs clear visual distinction and maybe a tooltip explaining the trade-off.
- **Asymmetric cascade behavior.** A chain where hook 1 is hot and hook 2 is cold produces a partial cascade: hop 1 resolves instantly, hop 2 waits. The player needs to understand that the cascade "pauses" at cold hooks. This is actually realistic (async pipeline stages have different latencies) but adds mental load.

**Comparable games:**
- **Factorio signal wires (red/green).** Two wire colors carry signals independently. Players choose which wire to use based on need. Red/green is a simple binary — hot/cold is an analogous binary applied to hooks instead of wires.
- **StarCraft hotkeys (queued vs. instant commands).** Shift+click queues commands for later. Regular click executes immediately. The player manages immediacy vs. planning — same conceptual axis as hot/cold.

---

### Approach F: Progressive Chaining ("The Awakening") — RECOMMENDED

**Philosophy:** Hook chaining ability unlocks progressively across the campaign, teaching each layer before adding the next. Early missions have no chaining. Mid-game introduces delayed chaining. Late-game unlocks same-tick chaining with hot/cold modes. The game literally awakens its signal processing capability over time — mirroring the narrative of an AI bootstrapping its own architecture.

**Mechanical rules:**

| Campaign Phase | Chaining Model | Player Experience |
|----------------|---------------|-------------------|
| Missions 1-3 | **No chaining** (Approach A) | Hooks fire from world events only. `ON_RECEIVE` doesn't exist. Signals arrive in buffer, rules process next tick. Player learns basic wiring without cascade complexity. |
| Mission 4 | **`ON_RECEIVE` introduced, COLD only** | The Relay unit is introduced or featured. `ON_RECEIVE` exists as a trigger but is always COLD (delayed, 1-tick-per-hop). The player learns that hooks can react to signals — but slowly. The domino chain plays out tick by tick. |
| Mission 5-6 | **Delayed chaining** (Approach C) | All `ON_RECEIVE` hooks are delayed (1 tick per hop). The player builds multi-unit communication networks and learns to account for latency. Signal chains are visible in the Inspector as linear sequences of events across ticks. |
| Mission 7 | **HOT mode unlocked** (Approach E) | The 🔥/❄️ toggle appears on hooks. The player can now make specific hooks cascade instantly. The boot log introduces it: "ATTENTION SUBSYSTEM: Same-tick reactive processing enabled. Warning: increased electromagnetic signature detected." First hot hook fires → the spark visual plays → the player feels the speed difference viscerally. |
| Missions 8-10 | **Full chaining** | Both hot and cold available. Chain budget per unit (Approach D) limits same-tick depth. Command agent (14 buffer, 6 hooks, 4 chain budget) can orchestrate deep cascades. The meta-level — building chains that manage chains — becomes possible. |

**The diegetic unlock:** Each chaining upgrade is narrated by the boot log as a subsystem coming online. "REACTIVE PROCESSING: offline" in Mission 1. "REACTIVE PROCESSING: delayed mode" in Mission 4. "REACTIVE PROCESSING: full spectrum" in Mission 7. The player isn't unlocking a game feature — the AI they're building is literally gaining new cognitive capabilities. The fiction and the mechanic are the same thing.

**Cascade visualization across the campaign:**

- **Missions 1-3:** No cascade visuals. Single green flashes for hook signals. Clean, simple.
- **Missions 4-6:** Delayed cascade visuals. Green flash hops from unit to unit across successive ticks. The player learns to read signal propagation as a slow wave across the network. A gentle pulse animation connects units that communicated in the last 3 ticks — a fading trail of pale green dots along the wire.
- **Missions 7-10:** Hot cascade visuals. White-hot spark flashes RACE along wires — instantaneous, electric, startling the first time. Cold hooks retain the gentle green flash. The player can visually distinguish "fast brain" (hot) from "slow brain" (cold) paths in their network. When a deep cascade fires, the wires light up in sequence so fast it looks like a lightning bolt — Scout to Relay to Command to Relay to Striker, white sparks chasing each other in a fraction of a second.

**Audio design:**

- Cold signal: soft *blip* — a rounded, warm tone. Like a notification chime. Reassuring. "Data received."
- Hot signal: sharp *tick* — a metallic snap. Like a relay closing. Urgent. "Processing NOW."
- Cascade (2 hops): two rapid *tick-tick* sounds. Staccato. "Two things just happened."
- Deep cascade (4+ hops): rapid-fire *tick-tick-tick-tick* blending into a brief electronic *sizzle*. Like a spark jumping across a gap. The audio communicates "complex cascade" even when the visual is too fast to track.
- Chain budget exhaustion: descending *bwwwp* — like a capacitor discharging. "The chain ran out of energy." Gentle, not punishing.
- Loop detection (cascade depth exceeded): harsh *bzzt* + the overload sparking visual. "Something went wrong in the wiring." Same audio vocabulary as context overload, reinforcing the connection: cascade overload IS a form of context overload.

---

## Player Journeys

### Journey: Mika, 14, First-Time Strategy Game Player

**Context:** Mission 4 (the mission that introduces `ON_RECEIVE`). Mika has completed Missions 1-3 and understands that hooks broadcast signals when something happens. She's configured her Scout's `ON_OBSERVE` hook to send on `recon-net`. Now Mission 4 gives her a Relay for the first time.

**Minute 0:00 — The New Unit**
The Plan screen loads. The board shows three pre-placed units: her familiar Scout at B2, a Striker at F6, and a NEW unit at D4 — a circular dish shape she hasn't seen before, magenta-accented, with a gentle 3-beat cascade animation (energy flowing top-to-bottom through its body). The boot log scrolls:

```
RELAY UNIT: online
  — perception: NONE (stationary signal processor)
  — buffer: 12 slots
  — hook slots: 4
  — skills: compress, filter, amplify

REACTIVE PROCESSING: delayed mode enabled
  New trigger available: ON_RECEIVE
  "When a signal arrives, I can react to it."
```

Mika reads "When a signal arrives, I can react to it" and immediately understands. The Relay doesn't see the world — it reacts to what other units tell it.

**Minute 0:45 — Wiring the Relay**
She clicks the Relay in the workbench. The hook editor opens — four empty dashed-outline slots. She drags `ON_RECEIVE` from the trigger palette into Slot 1. A dropdown appears: "From which channel?" She types `recon-net` — the channel her Scout already broadcasts on. Auto-complete shows it in green (existing channel). She selects it.

The action side asks: which skill? She picks `compress` from the Relay's skill list. Then: broadcast on which channel? She types `alert-net` (a new channel). The hook is configured: **ON_RECEIVE from `recon-net` → compress → send on `alert-net`.**

She wires the Striker to listen on `alert-net` (using a rule, not a hook — `ON_RECEIVE` is cold, but she doesn't know about hot/cold yet).

**Minute 1:30 — The Domino Chain**
She hits EXECUTE. Sealed watch begins.

Tick 1: Scout moves, spots enemy at E3. Green flash from Scout — signal appears on the wire to Relay. The Relay's buffer bar gains one pip (cyan glow indicating fresh data).

Tick 2: Relay's hook fires. The word **COMPRESS** floats briefly above the Relay in small magenta text. A green flash travels from Relay to Striker. The Striker's buffer bar gains a pip.

Tick 3: Striker's rules evaluate. The compressed alert matches its "move toward threat" rule. The Striker pivots toward E3.

Mika watches the signal travel Scout → Relay → Striker over three ticks. It's slow enough to follow. She can see the causal chain: "Oh, the Scout told the Relay, and THEN the Relay told the Striker." She didn't program a flanking maneuver. She wired three units together and the behavior emerged.

**Minute 2:15 — The Latency Lesson**
The enemy Striker was at E3 when the Scout spotted it. By tick 3, when Mika's Striker starts moving, the enemy has moved to E4. Her Striker arrives at E3 on tick 5 — the enemy is already at E5. The information is stale by the time it arrives.

Mika frowns. "It's too slow." She opens the Inspector after the match and scrubs to tick 1. She sees the signal at the Scout. Scrubs to tick 2. Sees it at the Relay. Scrubs to tick 3. Sees it at the Striker. The Inspector's event log shows:

```
T01: SCOUT → recon-net: "enemy at E3"
T02: RELAY → alert-net: "threat:E3 [compressed]"
T03: STRIKER: rule matched → move toward E3
```

She thinks: "What if I connected the Scout directly to the Striker? Then it's only 2 ticks instead of 3." She's learning about latency vs. processing — the fundamental trade-off of distributed systems — through the game's mechanics.

**Minute 3:00 — Resolution**
She replays Mission 4 with a direct Scout → Striker wire (bypassing the Relay). The Striker responds one tick faster and catches the enemy. She wins — but her architecture is simpler. She wonders: "When will the Relay be worth the extra tick?" The game has planted a seed. Three missions from now, when enemy density makes raw uncompressed signals overflow the Striker's 8-slot buffer, the Relay's compress skill will become essential — and the extra tick of latency will become the price of intelligence.

**UI Annotations:**
- Hook editor: `ON_RECEIVE` trigger appears with a small clock icon (⏱) indicating "processes next tick"
- Channel auto-complete: green for existing channels, grey for new channels
- Sealed watch: green flash with 1-tick delay between hops, visible signal "traveling" along the dashed wire
- Inspector event log: timestamped entries showing signal origin, channel, payload, and processing delay

---

### Journey: Diego, 31, Backend Engineer

**Context:** Mission 8 (full system available, hot/cold hooks unlocked). Diego has been playing since Mission 1 and has a strong mental model. He's designing an architecture for a factory-vs-factory battle on a large board with 8+ enemies.

**Minute 0:00 — The Architecture Blueprint**
Diego opens the Plan screen. His production queue has 5 blueprints: Scout-A, Scout-B, Relay-Primary, Relay-Backup, Striker-Alpha. He's already designed a sophisticated communication network on paper (literally — he has a notebook next to his laptop with a graph diagram).

His architecture: two Scouts patrol different sectors and send on `sector-east` and `sector-west`. Relay-Primary listens on both, compresses, and forwards on `intel-feed`. A Command agent listens on `intel-feed`, makes priority decisions, and sends deployment orders on `orders-net`. Strikers listen on `orders-net` and engage.

But the critical path is: Scout → Relay → Command → Striker = 4 hops. At 1 tick per hop (cold), that's 4 ticks of latency. Enemy Strikers move 1 tile per tick. In 4 ticks, a threat can cross half the board.

**Minute 1:00 — Going Hot**
Diego clicks on Relay-Primary's hook config. He sees the four hook slots. Next to each trigger, there's a new toggle he unlocked at Mission 7: a flame icon (🔥) and a snowflake icon (❄️). He clicks the flame on Hook Slot 1: `ON_RECEIVE from sector-east → compress → send on intel-feed → 🔥 HOT`.

The UI responds: the hook strip gains a warm orange border. A tiny EM indicator appears: "+2 EM" (hot hooks emit double noise). The workbench's channel map updates — the wire from `sector-east` to `intel-feed` changes from a dashed green line to a bright amber line with tiny animated sparks flowing along it.

He makes Hook Slot 2 (from `sector-west`) hot as well. Then makes the Command's `ON_RECEIVE from intel-feed → prioritize → send on orders-net` hook HOT. And the Striker's `ON_RECEIVE from orders-net → engage` hook HOT.

His entire intelligence pipeline is now hot. Scout → Relay → Command → Striker should cascade within a single tick.

**Minute 2:00 — The First Hot Cascade**
EXECUTE. Sealed watch.

Tick 3: Scout-A spots an enemy at G2. A white spark RACES from Scout-A to Relay-Primary — not the gentle green flash of Missions 4-6, but a sharp, instantaneous lightning bolt. Before the tick clock advances, another spark jumps from Relay to Command. And another from Command to Striker-Alpha. *tick-tick-tick* — three metallic snaps in rapid succession. The Striker pivots toward G2 on the SAME TICK the Scout spotted the enemy.

Diego involuntarily grins. His 4-unit architecture responded in 1 tick. The entire sealed watch board lit up like a circuit diagram for half a second — amber wires flashing white as signal raced through the pipeline. He built a nervous system.

**Minute 2:30 — The Noise Problem**
Tick 5: an enemy Scout appears at the edge of the board. It wasn't heading toward Diego's units — it was patrolling. But the enemy pauses, turns toward Diego's Relay. The Relay's EM signature — amplified by 3 hot hooks firing in cascade — was like a lighthouse in the dark. The enemy now knows exactly where the information nexus is.

Tick 8: Two enemy Strikers converge on Relay-Primary. The Relay, stationary and unarmed, is eliminated. One-shot-one-kill. The entire intelligence pipeline goes dark. Scouts continue observing, but their signals hit a dead channel. Strikers stop receiving orders. The architecture collapses.

Diego watches his network die in 3 ticks. The sealed watch shows the signal wires going dim one by one — first the `intel-feed` wire fades to grey (Relay destroyed), then `orders-net` (Command receives no data to forward), then Strikers stand idle, buffer filling with stale observations from direct channels they're not even monitoring.

**Minute 3:30 — The Inspector Diagnosis**
Inspector opens. Diego scrubs to Tick 3 — the cascade tick. He clicks the Relay. The buffer view shows: 1 signal from `sector-east`, immediately processed and forwarded. Chain budget: 3 → 2 (1 spent). He clicks the EM overlay button. A heat map appears over the board. His Relay is a bright red dot — the loudest emitter on the field. Three hot cascades per observation event = 6 EM emissions per tick when both Scouts report.

The decision trace shows: "Enemy SCOUT-E evaluated perception at tick 5. EM signal from tile D4 (strength: 6) exceeded detection threshold (4). Target acquired."

Diego nods. "I need to make the Scout-to-Relay hop cold and keep only the Relay-to-Command-to-Striker chain hot. That reduces EM by 2 per observation and adds only 1 tick of latency to the pipeline." He's learned that every hot hop has an electromagnetic cost, and the optimal architecture mixes hot (for speed where it matters) and cold (for stealth where it matters).

**Minute 4:30 — The Redesign**
Back in Plan. He flips Relay's `ON_RECEIVE from sector-east` to ❄️ COLD. The wire changes from amber to green. EM indicator drops to +1 per cascade. He also designs a Relay-Backup blueprint that listens on the same channels — if Relay-Primary dies, Relay-Backup takes over (it's been idle on a different channel, accumulating signals in cold mode).

He's now building redundant information infrastructure with mixed hot/cold paths — a pattern directly analogous to real distributed systems with hot standby replicas and cold backup nodes.

**UI Annotations:**
- Hot/cold toggle: 🔥/❄️ icons on each hook strip, orange border for hot, blue border for cold
- EM indicator: "+N EM" badge per hook, summed per unit in the unit header
- Channel map: hot channels render as amber animated wires with spark particles, cold channels render as green dashed lines
- EM overlay in Inspector: heat map showing per-tile electromagnetic emission strength, red hotspots on high-emission units
- Chain budget display: in Inspector's unit detail panel, shows budget spent/remaining per tick

---

### Journey: Prof. Adaora, 52, Computer Science Department Chair

**Context:** Post-campaign, experimenting in the Architect's Workshop sandbox. Adaora is designing a deliberately loopy architecture to understand the game's cascade limits, and to create a teaching example for her distributed systems course.

**Minute 0:00 — The Loop Experiment**
Adaora creates two Relay units on an empty board. Relay-A and Relay-B. She configures:
- Relay-A: `ON_RECEIVE from channel-B → amplify → send on channel-A → 🔥 HOT`
- Relay-B: `ON_RECEIVE from channel-A → amplify → send on channel-B → 🔥 HOT`

She creates a Scout with a single hook: `ON_OBSERVE → send on channel-A → 🔥 HOT`.

The architecture is a deliberate feedback loop: Scout → Relay-A → Relay-B → Relay-A → Relay-B → ... forever. Each hop amplifies the signal. She wants to see what happens.

**Minute 0:45 — The Cascade Explosion**
EXECUTE. Tick 1: Scout spots the test enemy she placed on the board. White spark to Relay-A. Relay-A's hook fires — *tick*. Spark to Relay-B — *tick*. Relay-B's hook fires — spark back to Relay-A — *tick*. Relay-A fires again — *tick-tick-tick-tick* — the sparks accelerate into a strobe between the two Relays, white flashes bouncing back and forth faster than she can follow.

Then: *BZZT*. Cascade depth 6 reached. Both Relays' chain budgets exhausted. The strobe stops. Both Relays show a brief jittering animation — identical to context overload — and a small amber caution triangle appears above each. The remaining signals queue for next tick.

Tick 2: Queued signals arrive. Budgets reset. The cascade begins again — *tick-tick-tick-tick-BZZT*. Same pattern.

Tick 3: Same. The two Relays are locked in a visible oscillation, stuttering every tick. Their buffer bars are completely full — 12 slots of amplified copies of the same original signal, growing louder with each amplification pass. The EM overlay would show them as twin supernovae.

**Minute 1:30 — The Inspector Autopsy**
Adaora opens the Inspector. She scrubs to Tick 1 and clicks Relay-A. The buffer view is extraordinary: 12 slots, all filled with the same signal at progressively higher amplification levels. Slot 1: `{source: SCOUT, signal: "enemy at D5", amplification: 1}`. Slot 6: `{source: RELAY-B, signal: "enemy at D5", amplification: 6}`. Slot 12: `{source: RELAY-B, signal: "enemy at D5", amplification: 12}`.

The chain budget trace shows: "Budget: 3/3 → 2/3 (hop 1) → 1/3 (hop 3) → 0/3 (hop 5) → EXHAUSTED. 2 signals queued for T02."

The decision trace shows: "Rule evaluation: buffer full. 0 slots available. Context overload triggered. Unit stunned for 1 tick." Wait — the Relay wasn't just cascade-exhausted. It was also context-overloaded because the amplification loop filled all 12 buffer slots in a single tick.

**Minute 2:15 — The Teaching Moment**
Adaora smiles. She screenshots the buffer view — 12 slots of exponentially amplified identical data — and writes in her lecture notes:

*"This is a broadcast storm. Two nodes amplifying each other's output without rate limiting. Compare to the 1980 ARPANET collapse: a single status message was amplified by routing loops until it consumed all available bandwidth. Robot Uprising's chain budget is a circuit breaker — it limits cascade depth per tick. The context overload mechanic is back-pressure — the buffer is full, no more data can be processed. Both defenses fired, and both are insufficient: the loop resumes next tick because the ARCHITECTURE is the problem, not any single tick's behavior."*

She creates a second architecture: the same loop, but with Relay-A's hook set to ❄️ COLD. Now the cascade doesn't loop — the signal goes Scout → Relay-A (hot, instant) → Relay-B (cold, next tick) → Relay-A (cold, tick after). The oscillation becomes a slow heartbeat instead of a strobe. Both Relays function normally because the per-tick signal load is exactly 1.

She screenshots both architectures side by side: the loopy hot strobe vs. the measured cold heartbeat. Her lecture slide title: "Why Back-Pressure Exists: A 30-Second Demonstration."

**Minute 3:30 — Resolution**
Adaora exports both configurations as shareable Config Codes. She'll assign them as a lab exercise: "Run both configs. Explain why Relay-A is stunned in Config 1 but not Config 2. Propose a third architecture that uses both hot and cold hooks to achieve amplification without oscillation."

The answer she's looking for: a single hot hop from Scout to Relay-A, a cold forward from Relay-A to Relay-B, and Relay-B's output on a DIFFERENT channel that nothing listens to in a loop. Linear pipeline. No feedback. Maximum amplification. Zero oscillation.

**UI Annotations:**
- Cascade strobe: rapid white flashes between looping units during sealed watch, audible rapid *tick-tick-tick* blending into electronic *sizzle*
- Chain budget exhaustion: amber caution triangle above unit, brief jitter animation
- Context overload from cascade: same red sparking as normal overload, but Inspector shows "overload cause: cascade loop" in the decision trace
- Buffer view in Inspector: scrollable list of 12 entries, each showing source, payload, amplification level, and tick-created; identical entries highlighted with a "repeated signal" badge
- Config Code export: shareable alphanumeric string encoding full architecture (units, hooks, rules, channels)

---

## Interaction Effects

### With Buffer Model (2.01)
Hook chaining directly affects buffer pressure. Hot cascades can fill a unit's buffer in a single tick (as Prof. Adaora's loop demonstrates). The FIFO eviction policy means a hot cascade can push out ALL previous context in one tick — the "context window catastrophe." Cold chaining distributes buffer pressure across ticks, allowing eviction to function normally.

### With EM Emissions
Each hot cascade hop emits EM noise. A 4-hop hot cascade emits 8 EM units per trigger (4 hops × 2 EM per hot hop). This creates a discoverable stealth-vs-speed trade-off that becomes a major strategic axis in Missions 8-10 and Gauntlet play.

### With Signal Latency (Locked: 1 tick per hop)
The locked spec says "1 tick per hop." Progressive chaining reconciles this: cold hooks respect the 1-tick-per-hop spec exactly. Hot hooks are the exception — explicitly presented as an upgrade that breaks the default latency model. The boot log can frame this: "OVERRIDE: reactive processing bypass enabled. Standard latency protocols suspended for marked channels."

### With Rules Language (3.05)
Rules evaluate buffer contents. In a hot cascade, buffer contents change DURING the tick — potentially between when rules were first evaluated and when they'd be evaluated again. Question: do rules re-evaluate after a cascade modifies the buffer? If yes, a cascade can change a unit's behavior mid-tick. If no, rules evaluate once per tick on pre-cascade buffer state, and cascade-delivered signals are only processed next tick by rules (but processed this tick by hooks).

### With Sealed Watch Pacing
Hot cascades compress multi-tick events into single ticks. This makes individual ticks more visually dense but reduces the total number of "interesting ticks." The sealed watch might feel like long stretches of nothing punctuated by bursts of cascading activity — heartbeat pacing rather than steady tempo.

### With Inspector / Decision Trace
The Inspector must render cascade sub-steps within a single tick. Instead of a flat timeline (one event per tick), tick N might expand to show: "T05.0: Scout observes → T05.1: Relay-A receives (hot) → T05.2: Command receives (hot) → T05.3: Striker receives (hot)." Sub-tick timestamps become necessary for hot cascades.

### With Command Agent Meta-Level
Hot chaining is what makes Command agents viable as real-time orchestrators. A Command that receives intelligence and instantly reassigns subordinate hooks/skills within the same tick is genuinely managing its team. A Command that receives intelligence tick N and acts tick N+1 is merely reacting. The meta-level — "building the factory that builds the factory" — requires same-tick cascade capability.

### With Onboarding (Vocabulary Pacing)
Progressive chaining adds the following concepts across the campaign:
- Mission 4: `ON_RECEIVE` (1 new concept)
- Mission 7: hot/cold toggle (1 new concept, but it's a BINARY — minimal cognitive load)
- Mission 8+: chain budget (1 new concept, number per unit type)
Total: 3 new concepts, spread across 4 missions. Well within the 2-concepts-per-mission cognitive budget.

---

## Comparable Games: Deep Parallels

### Magic: The Gathering — The Stack
MTG's triggered ability stack is the gold standard for cascading game mechanics. When a creature enters the battlefield and triggers three "whenever a creature enters" abilities, all three go on the stack. Each resolution can trigger more abilities. The stack can grow to 20+ entries in competitive play. MTG's solution to infinite loops: mandatory loops with no game-ending potential → draw. Loops containing "may" abilities → player must choose to stop.

**Translation to Robot Uprising:** Hot hook cascades are the stack. Chain budget is the cascade depth limit. "May" abilities are cold hooks (the player chose to make them non-cascading). The parallel is direct enough that MTG veterans will instantly grok the system.

### Factorio — Combinator Tick Delay
Factorio's combinators introduce exactly 1 tick of delay. Output feeds back to input → oscillation. Players learn to use the delay deliberately: SR latches (state memory), edge detectors (pulse on change), clock generators (periodic signals). These emergent circuit patterns aren't taught — they're discovered.

**Translation to Robot Uprising:** Cold hooks with 1-tick delay ARE Factorio combinators. Players will discover analogous patterns: heartbeat generators (periodic hook firing for freshness signals), edge detectors (hook that fires only when buffer contents CHANGE), memory locks (self-referential hook that maintains a flag until cleared). These emergent patterns should be discoverable, not taught.

### Yu-Gi-Oh — SEGOC (Simultaneous Effects Go On Chain)
When multiple triggered effects activate simultaneously, Yu-Gi-Oh's SEGOC rules dictate ordering: mandatory before optional, turn player before non-turn player. This prevents ambiguity when cascades produce simultaneous triggers.

**Translation to Robot Uprising:** When multiple units' hot hooks trigger in the same cascade step, resolution order matters. The game needs a SEGOC-equivalent: evaluate by unit production order (first-built first), then by hook slot number (slot 1 before slot 2). This ordering should be visible in the Inspector and deterministic for competitive play.

---

## The TikTok Clip

**Setup:** Mission 9. The player has designed a beautiful 6-unit network with mixed hot/cold hooks. Two Scouts, two Relays (primary + backup), one Command, two Strikers.

**The clip (12 seconds):**
0:00 — Board view. Units positioned across the map. Enemy approaches from the east. Quiet.
0:02 — Scout-East spots three enemies. A white spark EXPLODES from the Scout, racing along amber wires to Relay-Primary. *tick*.
0:03 — The spark splits at the Relay — one branch races to Command, another directly to Striker-East. *tick-tick*. Two simultaneous sparks.
0:04 — Command's hook fires. Sparks race to BOTH Strikers. *tick-tick*. The entire right side of the network lights up like a lightning bolt.
0:05 — Both Strikers pivot east. The Striker closest to the enemies advances. One-shot-one-kill: enemy eliminated.
0:06 — Camera pulls back to show the full signal chain: Scout → Relay → Command → Striker-East and Striker-West. The wires are still faintly glowing amber, afterimage of the cascade.
0:07 — Text overlay: "I didn't program 'flanking.' I wired attention."

The clip works because it's FAST (entire cascade in 2 seconds of real time), VISIBLE (white sparks on amber wires against dark board), and the result is dramatic (coordinated flanking maneuver from a single observation).

---

## Recommendation

**Approach F (Progressive Chaining) is the clear winner.** It:

1. Respects the locked spec's "1 tick per hop" as the default (cold hooks)
2. Introduces cascading as a mid-game upgrade that feels like the AI genuinely gaining new cognitive capabilities
3. Uses the hot/cold binary to create a fundamental strategic axis (speed vs. stealth)
4. Produces the most spectacular sealed watch visuals (white sparks racing through hot wires)
5. Teaches transferable engineering concepts progressively (async messaging → event-driven cascading → circuit breakers → back-pressure)
6. Scales from "zero cascade complexity" (Missions 1-3) to "deep cascade architecture" (Missions 8-10) without front-loading cognitive overhead
7. Makes the Command agent's meta-level viability contingent on hot chaining — creating a natural "aha" when the player unlocks it and their Command unit suddenly becomes a real-time orchestrator

The key insight: **chaining is not a binary (on/off) — it's a spectrum (cold → hot), and the player's skill in mixing hot and cold paths IS the game's attention architecture design.**

---

## New Aspects Discovered

- **3.09a — Cascade ordering semantics:** When multiple units' hot hooks trigger in the same cascade step, what determines evaluation order? Unit production order? Spatial proximity? Hook slot number? The ordering rule determines which cascades "win" when two signals compete for the same buffer slot.
- **3.09b — Cascade visualization design:** The specific animation, timing, and audio design for hot cascades racing through the network. How fast do sparks travel? Do they visually split at branch points? What happens when two cascades cross paths on the same wire?
- **3.09c — Hot/cold as enemy design lever:** Enemy architectures can use hot/cold strategically. An enemy with all-hot hooks is fast but detectable (EM noise reveals their network structure). An enemy with all-cold hooks is stealthy but slow. Boss enemies might dynamically switch between hot and cold modes mid-battle.
- **3.09d — Emergent patterns from delayed chaining:** Catalog the "Factorio combinator" patterns that emerge from 1-tick-delay cold hooks: heartbeat generators, edge detectors, memory locks, priority arbiters, load balancers. These are the "advanced techniques" that veterans discover.
- **3.09e — Cascade depth as competitive meta:** In Gauntlet play, the optimal cascade depth for an architecture becomes a strategic variable. Shallow-and-fast (2-hop hot) vs. deep-and-slow (4-hop mixed) architectures create distinct competitive archetypes.
