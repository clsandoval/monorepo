# The "First Deadlock" Tutorial Mission

**Aspect ID:** 5.18
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 1.04d (blocking vs. queued hook semantics), 3.09 (hook chaining), 5.04 (complexity ramp), 5.06 (failure and recovery), 5.04a (Mission 5 Wall), 5.22 (Gauntlet as third act), 4.20 (Inspector tools), 2.01 (fixed-slot buffer model), 6.03a (Predecessor character arc)

---

## The Design Question

**When should a player encounter their first deadlock — and how do you make a catastrophic system failure into a moment of insight rather than frustration?**

This aspect only activates in design configurations where **blocking hook semantics** exist (Model B: Blocking Rendezvous, Model E: Hybrid Per-Hook Configuration, or a variant where blocking is introduced as a late-game mechanic). In pure fire-and-forget configurations (Model A, the locked spec's default lean), deadlocks are mechanically impossible — signals either arrive or silently drop. This analysis explores the design space under the assumption that blocking IS available, whether as a default, an unlock, or an advanced option.

The core proposition: **Deadlock is the single most teachable failure in all of computer science.** Two agents waiting for each other, each convinced the other will go first, both frozen forever. It's visual, it's dramatic, it's diagnosable, and the fix is always architecturally interesting. If Robot Uprising includes blocking semantics at all, the first deadlock must be a *designed* moment — not an accident the player stumbles into and blames on the game, but a scripted encounter where failure is inevitable, diagnosis is guided, and recovery delivers a permanent "aha."

**The tension:** Deadlock is also the single most frustrating failure in all of computer science. "Nothing happens and I don't know why" is the opposite of Robot Uprising's sealed-watch spectacle. A frozen battlefield is boring to watch. The mission design must make the freeze *dramatic* — not by hiding the deadlock, but by making the seconds before it the most exciting thing the player has seen, and then making the silence deafening.

---

## Prerequisite: When Does Blocking Become Available?

Three timing options for introducing blocking hooks, each creating a different "first deadlock" moment:

### Option A: "Blocking from Birth" — Blocking Is the Default Hook Semantic

Hooks are blocking by default from Mission 1. The player encounters deadlock naturally, possibly as early as Mission 3 (when hooks are introduced). The "first deadlock" isn't a designed mission — it's a designed *possibility* within any mission.

**Problem:** Too early. Mission 3 players are still learning what hooks do. A deadlock at this stage teaches nothing because the player doesn't yet understand what hooks are supposed to do when they work correctly. You can't diagnose a malfunction in a system you don't understand.

**When this works:** Only in a Zachtronics-hardcore design where the audience is assumed to be engineers. TIS-100 throws blocking at you in puzzle 3 and expects you to figure it out. But TIS-100's audience self-selects for this.

### Option B: "The Late Unlock" — Blocking Introduced as Mission 6-7 Advanced Mechanic

The first four missions use fire-and-forget hooks. Mission 5 introduces the factory. Mission 6 introduces blocking hooks as a new hook type, alongside the Command agent. The "first deadlock" is Mission 6 itself — the mission where blocking is introduced IS the mission where it fails.

**Problem:** Mission 6 is already introducing the Command agent (locked spec: Missions 6-7 = Command agent + production tuning). Adding blocking hooks to the same mission that introduces the most complex unit creates a double wall.

**When this works:** If blocking hooks are framed as the Command agent's unique capability — "the Command agent can issue BLOCKING instructions that guarantee delivery, unlike fire-and-forget hooks." The deadlock emerges from the Command agent's power, making it a lesson about the cost of guaranteed coordination.

### Option C: "The Hybrid Revelation" — Fire-and-Forget Default, Blocking Unlocked Mid-Campaign

The first five missions use fire-and-forget hooks. At some point (Mission 6, 7, or 8), the player unlocks the ability to configure individual hooks as BLOCKING (Model E: Hybrid). The mission where this unlock occurs is designed so that:
1. The mission objective strongly incentivizes blocking (a scenario where dropped signals are catastrophic)
2. The naive blocking configuration creates a deadlock
3. The debrief shows exactly why

**This is the recommended timing.** It leverages the player's existing fire-and-forget mastery, introduces blocking as a solution to a real problem (signal loss), and then immediately demonstrates the cost of that solution (deadlock). The learning arc: "fire-and-forget drops signals → blocking guarantees delivery → but blocking creates deadlocks → the real skill is choosing which hooks block and which don't."

---

## The Mission: "Gridlock" (Mission 7)

**Setting:** Cebu — Urban cyberpunk megacity. Narrow streets, tall buildings blocking line-of-sight, multiple choke points. The terrain creates natural communication bottlenecks — units can see enemies but can't always reach each other directly. Relay placement matters.

**Campaign context:** The player has completed Mission 6 (Command agent introduction). They understand blueprints, production queues, channels, and all five unit types. They've been using fire-and-forget hooks for four missions. They've experienced signal loss — missed communications, stale data, scouts spotting threats that never reached the striker. The Predecessor has mentioned this frustration: *"Signals vanish into the grid. I lost an entire patrol that way — three scouts reporting, relay receiving, but the striker never got the word. By the time it did, the position was wrong."*

**The BLOCKING unlock:** The mission briefing introduces a new hook configuration option. The boot log prints:

```
[>>] HOOK_ENGINE: NEW SEMANTIC AVAILABLE
[>>] HOOK_MODE: BLOCKING
[>>] When enabled: sender WAITS until receiver processes signal
[>>] Guarantee: no signal loss. Cost: sender cannot act while waiting.
[>>] WARNING: mutual blocking → deadlock
[>>] DEADLOCK: two agents waiting for each other. Neither can proceed. Permanent.
```

The Predecessor adds: *"I never had this option. Blocking transmission — guaranteed delivery. It's powerful. It's also how I would have lost my entire army if I'd been careless. Use it where it matters. Not everywhere."*

**The trap:** The mission scenario is designed so that fire-and-forget hooks fail in an obvious, frustrating way. The enemy spawns from multiple directions in narrow street corridors. Scouts at the map edges spot enemies early, but the signals must traverse 2-3 hops to reach strikers in the center. With fire-and-forget, the relay in the middle is overwhelmed — its 12-slot buffer fills fast, and critical position data is lost. Strikers act on stale or missing intelligence. The player loses.

**The intended reaction:** "I need blocking hooks. That way the scouts will wait until the relay processes their signal. No more lost intelligence."

**The deadlock:** When the player switches scout-to-relay AND relay-to-striker hooks to BLOCKING, a specific scenario triggers:

- **Tick 14:** Scout-A spots an enemy at E7. Fires BLOCKING signal to Relay-B. Scout-A is now WAITING.
- **Tick 14:** Relay-B receives Scout-A's signal. Begins compress. Fires BLOCKING compressed signal to Striker-C. Relay-B is now WAITING.
- **Tick 14:** Striker-C is in the middle of an engage action (adjacent to an enemy). Its rule priority has ENGAGE above RECEIVE. Striker-C doesn't process the incoming signal this tick.
- **Tick 15:** Relay-B is still waiting for Striker-C to receive. Cannot accept new signals while waiting. Scout-D spots a DIFFERENT enemy at B3 and fires BLOCKING signal to Relay-B. Scout-D is now WAITING for Relay-B.
- **Tick 15:** Relay-B cannot receive Scout-D's signal because it's blocked waiting on Striker-C. Scout-D is blocked waiting on Relay-B. Relay-B is blocked waiting on Striker-C.
- **Tick 16:** Striker-C finishes engage. Now processes Relay-B's signal. Relay-B unblocks. But Relay-B now needs to process Scout-D's signal AND Scout-A's next signal AND... the queue of blocked senders grows faster than the single relay can drain it.
- **Tick 18-22:** The cascade stabilizes briefly, then collapses. Scout-A, Scout-D, and Relay-B form a permanent deadlock cycle when a new engagement occupies Striker-C's priority for multiple ticks. Three units are frozen. Enemies pour through the gap.

**The sealed watch experience:** This is where the mission's emotional design lives.

---

## Five Approaches to the Deadlock Teaching Moment

### Approach A: "The Hard Freeze" — Deadlock Happens, No Warning, Pure Discovery

**The philosophy:** The player should discover deadlock the same way engineers discover deadlock — by watching a system freeze and having no idea why. The debrief is the diagnostic tool. The sealed watch is the symptom. The Inspector is the cure.

**How it works:**

The sealed watch plays normally for ticks 1-13. Units move, scouts spot enemies, signals fly, strikers engage. The board is alive. Then tick 14 hits. Scout-A fires its blocking signal — a thick solid line (blocking visual language from hook-semantics analysis: thick, opaque, pulsing) extends from Scout-A toward Relay-B. Scout-A's movement stops. A tiny hourglass icon appears above Scout-A — sand falling grain by grain. The signal reaches Relay-B. Relay-B processes, fires toward Striker-C. Another thick line. Relay-B's cascade animation stops. Hourglass.

**Tick 15:** Scout-D fires at Relay-B. A third thick line — but this one hits an already-frozen Relay-B. The line turns amber, then red, pulsing. Scout-D's hourglass appears. Three units are now frozen on the board while enemies advance. No dramatic sound — just the absence of the sounds these units should be making. The relay's usual cascade blip is silent. The scout's scan ping is silent. The board's ambient sound thins as more units lock up.

**Tick 16-20:** Enemies walk past frozen units. The frozen units' context bars show the last state before freeze — half-full, not overloaded. They're not stunned from overload. They're just... stopped. The hourglasses keep falling. The player watches enemies destroy undefended positions. The tick clock continues. The sealed watch doesn't pause or highlight the deadlock. It just... happens.

**The debrief:** The Inspector opens. The timeline scrubber shows the full battle. When the player clicks a frozen unit, they see:

```
SCOUT-A — STATUS: BLOCKED (since T14)
Waiting for: RELAY-B to acknowledge signal on channel [recon-net]
RELAY-B current state: BLOCKED (since T14)
→ Waiting for: STRIKER-C to acknowledge signal on channel [target-feed]

DEADLOCK DETECTED: SCOUT-A → RELAY-B → STRIKER-C (ENGAGE priority > RECEIVE)
```

The Inspector's decision trace shows: "STRIKER-C: Rule priority at T14: ENGAGE (active) > RECEIVE (pending). ENGAGE persisted through T14-T16. By T16, RELAY-B accumulated 2 blocked senders. By T18, cascade collapse."

**Strengths:**
- Most authentic to real engineering experience — deadlock discovery is always "why did everything stop?"
- The silence is emotionally powerful. After 13 ticks of activity, the sudden freeze is viscerally wrong.
- Rewards players who are paying close attention during sealed watch (they might spot the exact moment).
- The Inspector debrief is the hero — it's the first time the Inspector *solves a mystery* rather than confirming what the player already suspected.

**Weaknesses:**
- Risk of "the game is broken" interpretation. Players unfamiliar with deadlock may think the game glitched.
- The sealed watch period between deadlock and mission end can be boring — frozen units doing nothing while enemies win.
- No emotional preparation. The player goes from excitement to confusion to frustration without warning.

**The TikTok clip:** A split screen. Left: the battlefield, three units frozen, enemies walking past. Right: the player's face, confusion slowly turning to realization as they scrub the Inspector timeline backward to the exact tick where it all stopped.

---

### Approach B: "The Predecessor's Warning" — Narrative Foreshadowing + Designed Failure

**The philosophy:** The Predecessor explicitly warns about deadlock. The player hears the warning, thinks "that won't happen to me," and it happens anyway. The designed failure is made palatable because the player was warned — the game isn't "unfair," the player made an identifiable mistake.

**How it works:**

During the Plan screen, after the player enables BLOCKING on their first hook, the Predecessor speaks:

*"Blocking. I used blocking on everything my first time. Guaranteed delivery — what's not to love?"*

A pause. The Predecessor's text shifts from amber to a slightly darker shade.

*"Two of my scouts froze on tick 19. They waited for a relay that was waiting for a striker that was mid-combat. I lost the northern corridor in eight ticks. By the time I understood what happened, the mission was over."*

The Predecessor's text fades. If the player configures ALL their scout-to-relay hooks as BLOCKING (the trap configuration), one more line appears:

*"...you're doing exactly what I did."*

**The sealed watch:** Plays identically to Approach A — the deadlock occurs, units freeze, enemies exploit the gap. But the player has been primed. When the freeze happens, they think: "Oh. That's what the Predecessor was talking about."

**The debrief:** Same Inspector tools as Approach A, but the Predecessor adds commentary during the scrubbing:

- When the player clicks the first frozen unit: *"There. That's the moment. Scout-A sent, Relay-B couldn't receive. The chain starts here."*
- When the player finds the deadlock cycle: *"Two agents waiting for each other. Neither will ever move again. I stared at this for an hour the first time. The fix is simple — not everything needs to block. Some signals can afford to be lost."*
- When the player returns to the Plan screen: *"Try mixing. Blocking for the signals that matter. Fire-and-forget for the rest. That's the architecture — knowing which is which."*

**Strengths:**
- Eliminates "the game is broken" confusion. The player was warned.
- Creates a narrative beat — the Predecessor's vulnerability (confessing their own failure) deepens the character arc (Phase 4: "Invested Collaborator" from aspect 6.03a).
- The "you're doing exactly what I did" line is a powerful emotional moment — the player and the Predecessor are making the same mistake, decades apart.
- The fix is explicitly stated: mix blocking and fire-and-forget. Clear direction for the retry.

**Weaknesses:**
- Reduced discovery satisfaction. The player didn't find the deadlock — it was handed to them.
- The Predecessor's warning might cause some players to avoid blocking entirely, missing the point that blocking is *useful* when applied selectively.
- Heavy narrative load. Not every player processes text-based warnings effectively.

**Sensory detail:** The Predecessor's "you're doing exactly what I did" line appears in a slightly different font weight — bold, where all other Predecessor text is regular weight. The text fades slower than usual, lingering on screen 2 seconds longer. A very subtle low-frequency hum accompanies it — the same hum that will later become associated with blocked units.

---

### Approach C: "The Two-Phase Mission" — Forced Success Then Forced Failure

**The philosophy:** The mission is split into two phases. Phase 1 is winnable only WITH blocking hooks (demonstrating their power). Phase 2 is unwinnable with the same blocking configuration (demonstrating their cost). The player experiences the full arc — blocking saves them, then blocking kills them — in a single mission.

**How it works:**

**Phase 1 — "The Corridor" (Ticks 1-30):**
A narrow urban canyon. Enemies approach from one direction. A single scout spots them, relays to a striker through a relay. With fire-and-forget hooks, the relay's buffer fills and critical position data drops — the striker fires at empty tiles. With blocking hooks, every signal is guaranteed: scout → relay → striker forms a perfect chain. The blocking hooks cause brief waits (Scout pauses for 1-2 ticks each time it reports), but the single-direction threat is manageable. The player wins Phase 1 cleanly.

The Predecessor: *"Clean coordination. No lost signals. Blocking held the line."*

**Phase 2 — "The Intersection" (Ticks 31-60):**
The map opens up. Enemies now approach from three directions. The player's same army — scouts on three flanks, one central relay, strikers at choke points — faces a fundamentally different information topology. Three scouts now report simultaneously to one relay. The relay can only process one blocking signal at a time. The other two scouts freeze. The scouts that freeze can't evade enemies in their corridors. The relay, processing one signal, tries to forward to a striker — but the striker is mid-combat. The relay freezes. Now nothing flows.

**Tick 38:** Full deadlock. All three scouts frozen. Relay frozen. Two strikers acting on stale data. The intersection falls.

**Phase 2 debrief:** The Inspector shows both phases side-by-side. Phase 1: one input source, linear topology, blocking worked. Phase 2: three input sources, star topology, blocking collapsed. The structural difference is visible in the channel map — Phase 1 is a chain (A→B→C), Phase 2 is a fan-in (A,D,E→B→C). The fan-in under blocking is the deadlock generator.

**Strengths:**
- The contrast between success and failure teaches the architectural lesson perfectly: blocking works in linear topologies, fails in concurrent topologies.
- Phase 1 validates blocking (the player doesn't think blocking is useless), Phase 2 shows its limits.
- The two-phase structure mirrors real engineering: "it worked in dev, it crashed in prod."
- The topology lesson (chain vs. fan-in) is transferable to real distributed systems.

**Weaknesses:**
- The two-phase structure adds mission length. If Phase 1 sealed watch is 30 ticks (30 seconds) and Phase 2 is 30 ticks (30 seconds), plus Plan time between phases, this mission could be 6-8 minutes. Long for a designed-failure mission.
- Phase 2's failure might feel unfair if the player thinks "I didn't change anything — why did it break?"
- The "it worked in dev, crashed in prod" lesson is real but might not feel like a *game* lesson to non-engineers.

**The TikTok clip:** Phase 1 — smooth signal chains, scouts report, striker eliminates threats like clockwork. Cut to Phase 2 — same configuration, different topology. Three scouts fire simultaneously. The relay jams. One by one, units freeze. The ticker keeps counting. The player's face goes from confident to horrified. Caption: "blocking hooks: they're perfect until they're not."

---

### Approach D: "The Deadlock Detector" — Inspector Tool as Reward

**The philosophy:** The deadlock happens without fanfare, but the mission rewards the player with a new Inspector tool: the **Deadlock Detector**. This tool, once unlocked, highlights deadlock cycles in any future mission's debrief. The first deadlock is the *teaching moment for the tool*, not just for the concept.

**How it works:**

The mission plays out — deadlock occurs somewhere between ticks 14-20. The sealed watch shows the freeze. The player enters the Inspector confused. Standard Inspector tools (decision trace, context window chart, event log) show symptoms but don't name the cause: units stopped acting, buffer states frozen, no error messages.

After the player spends 30-60 seconds scrubbing the timeline without finding the answer, a new panel materializes in the Inspector sidebar. The boot log prints:

```
[>>] DIAGNOSTIC_MODULE: DEADLOCK_DETECTOR — ONLINE
[>>] Analyzing tick history...
[>>] CYCLE FOUND: SCOUT-A ↔ RELAY-B ↔ STRIKER-C
[>>] Visualizing dependency graph...
```

A red overlay appears on the timeline — a band marking ticks 14-22, labeled "DEADLOCK ZONE." The three frozen units are connected by thick red arrows forming a cycle on the board. Each arrow is labeled with what the unit is waiting for:

```
SCOUT-A ──[waiting for RELAY-B to receive]──→ RELAY-B
RELAY-B ──[waiting for STRIKER-C to receive]──→ STRIKER-C
STRIKER-C ──[ENGAGE priority blocking RECEIVE]──→ (self)
                                                     ↑
SCOUT-D ──[waiting for RELAY-B to receive]──────────┘
```

The Deadlock Detector becomes a permanent Inspector tool. In all future missions, if any deadlock occurs (even a brief one that self-resolves), the detector highlights it in the timeline.

**Strengths:**
- The tool unlock is a reward for experiencing failure — failure gives you something permanent.
- The tool teaches the concept better than any narrative could: seeing the cycle graph IS understanding deadlock.
- Creates a "detective" moment — the player was struggling, then the tool appeared and solved the mystery.
- Future deadlocks are diagnosable without narrative intervention.
- Maps directly to real engineering tools: distributed tracing, deadlock detection in thread analyzers, dependency graph visualizers.

**Weaknesses:**
- The 30-60 second confusion period before the tool appears might be frustrating for some players.
- The tool appearing "magically" breaks immersion — why didn't the tool exist before?
- Risk of the tool becoming a crutch — players might not learn to *prevent* deadlocks if they know the tool will always detect them.

**Sensory detail:** The Deadlock Detector's visualization is distinctive: red arrows are not the standard signal-chain dashed lines. They're thick, solid, and pulsing at 0.5Hz — like a heartbeat monitor for a system in cardiac arrest. The cycle they form rotates slowly (one full rotation every 4 seconds), creating a visual sense of the circular dependency. When the player hovers over any unit in the cycle, the rotation stops and that unit's waiting-for relationship highlights in white, isolating the chain link.

---

### Approach E: "The Sandbox Deadlock Lab" — Pre-Mission Experimentation

**The philosophy:** Before the mission, the player enters a sandbox specifically designed to produce deadlocks. The sandbox has a pre-configured 3-unit system (scout, relay, striker) with blocking hooks already wired. The player hits EXECUTE and watches the deadlock form in a safe environment. Then they fix it. Then the real mission begins.

**How it works:**

The mission opens not with a battlefield but with a **Deadlock Lab** — a 3×3 subsection of the board containing three pre-configured units with blocking hooks. A floating panel explains:

```
DEADLOCK LAB
These three units are wired with BLOCKING hooks.
Press EXECUTE to observe what happens.
Then fix the wiring to prevent the deadlock.
When all three units operate for 20 ticks without freezing,
the mission begins.
```

**Execution 1:** The player hits EXECUTE. The three units start operating. Within 5-8 ticks, the deadlock forms. All three freeze. A "DEADLOCK" stamp appears over the board. An arrow key appears: "Press → to step through what happened."

The step-through is a guided Inspector experience — tick by tick, each unit's state is shown, and the moment one unit blocks is highlighted in amber. The moment the second unit blocks (creating the cycle) is highlighted in red. The cycle arrows appear. A text panel below explains: "Scout-A is waiting for Relay-B. Relay-B is waiting for Striker-C. Striker-C is busy. Nobody can move."

**The fix prompt:** "Change one hook from BLOCKING to FIRE-AND-FORGET to break the cycle." The player opens the simplified wiring panel (only three hooks visible). They change one hook. Hit EXECUTE again. If the deadlock still forms (wrong hook changed), they see it again. If it resolves, the units operate for 20 ticks, and the panel reads: "DEADLOCK RESOLVED. Mission 7: GRIDLOCK begins."

**The real mission:** Uses the full battlefield with the lesson internalized.

**Strengths:**
- Zero-risk learning environment. The sandbox isn't a real mission — failure has no emotional cost.
- The guided step-through is the most explicit teaching possible — the player sees the exact mechanism.
- The "fix it" challenge confirms understanding. The player doesn't just observe — they diagnose and repair.
- Fast iteration: the sandbox's 20-tick observation is only 20 seconds at 1× speed.
- The transition from sandbox to real mission creates a "now for real" emotional beat.

**Weaknesses:**
- Removes surprise and discovery. The player knows deadlock exists before they encounter it in a real scenario.
- The sandbox might feel like a tutorial worksheet — "finish this exercise before you can play."
- The 3×3 sandbox deadlock is trivially simple (3 units, 1 cycle). Real deadlocks in complex architectures look different. The lab might not prepare players for emergent deadlocks.
- Breaks the sealed-watch design philosophy. The lab lets you pause, step, and iterate — the opposite of the "watch helplessly" sealed watch experience.

**Sensory detail:** The Deadlock Lab has a distinct visual treatment: the board background is a deep navy blue (not the terrain tile art of a real mission), the three units are on a flat grid without terrain features, and the surrounding area is dark with thin gridlines — like an oscilloscope screen. The floating panel text is green monospace on dark background, evoking a diagnostic terminal. When DEADLOCK appears, it's in red blocky text that descends from the top of the screen, each letter arriving with a metallic clank, like a mechanical typewriter striking metal. The sound design is clinical — no music, just the blip of signals transmitting and the silence of frozen units.

---

## Recommended Hybrid: B + C + D — "The Warning, The Whiplash, The Tool"

The strongest teaching sequence combines three approaches:

1. **Predecessor's warning (B)** when the player first enables BLOCKING: sets narrative context, primes the player, connects to character arc.
2. **Two-phase mission structure (C)** as the mission itself: blocking succeeds in Phase 1 (linear), fails in Phase 2 (concurrent), teaching the *architectural* lesson.
3. **Deadlock Detector tool unlock (D)** in the debrief: rewards failure with a permanent diagnostic capability, teaches the cycle visualization.

**The full sequence:**

**Plan screen:**
- Player enables BLOCKING hooks. Predecessor speaks: warning about their own deadlock experience.
- Player configures army for narrow corridor (Phase 1 briefing visible).

**Phase 1 sealed watch (Ticks 1-30):**
- Blocking hooks work perfectly. Single corridor, single direction, no fan-in. Scout reports, relay compresses, striker eliminates. Clean. The signal chains are visible as thick solid lines, glowing steady green.
- Predecessor (quiet, pleased): *"Holding."*

**Transition:**
- Phase 2 briefing appears. Map opens to intersection. Three corridors converge. The player can adjust config between phases — but most players won't change what's working. "If it ain't broke..."

**Phase 2 sealed watch (Ticks 31-60):**
- First few ticks: signals from three scouts pour into the relay. The thick blocking lines multiply — three scouts reporting simultaneously.
- **Tick 38:** Scout-A's line turns amber (waiting). **Tick 39:** Scout-D's line turns amber. **Tick 40:** Relay-B's line turns amber. Three hourglass icons. The relay's cascade animation stops. The ticking continues but three units are silent.
- **Tick 42-50:** Enemies advance through the gap left by frozen scouts. Strikers, acting on stale data, fire at wrong positions. The intersection falls.
- The sealed watch's sound design is critical: the first 38 ticks have full battlefield audio — blips, pings, the relay's cascade shimmer. At tick 38, one sound drops out. Tick 39, another. By tick 40, the center of the board is silent while the edges are chaotic. The silence is the deadlock.

**Inspector (Debrief):**
- Player enters Inspector. Standard tools show frozen units but don't name the cause.
- After 20-30 seconds of scrubbing, the Deadlock Detector materializes:

```
[>>] DIAGNOSTIC: DEADLOCK_DETECTOR — INITIALIZING
[>>] Scanning execution history...
[>>] ⚠ CYCLE DETECTED: T38–T50
[>>] SCOUT-A → RELAY-B → STRIKER-C (→ self via ENGAGE priority)
[>>] SCOUT-D → RELAY-B (secondary block)
[>>] Rendering dependency graph...
```

The cycle visualization appears. The Predecessor adds:

*"The corridor was a chain. The intersection was a star. Blocking holds a chain together. Blocking tears a star apart."*

*"That's the architecture lesson. Not 'blocking is bad.' Not 'fire-and-forget is bad.' The question is: what shape is your network?"*

- **The fix is visible:** The channel map shows the Phase 1 chain topology alongside the Phase 2 star topology. The player can see that changing the scout-to-relay hooks to fire-and-forget while keeping the relay-to-striker hook blocking would preserve the critical guarantee (striker gets accurate data) while allowing scouts to report freely (even if some reports are dropped, the relay gets enough).

**Retry:**
- The player returns to Plan. Changes scout hooks to fire-and-forget, keeps relay-to-striker blocking. Replays. The intersection holds. Scouts report freely — some signals drop, but the relay's compress skill distills enough information. The single blocking link between relay and striker ensures the striker always acts on compressed, accurate intel. The hybrid architecture wins.

---

## Player Journeys

### Journey 1: Tomás, 16, First-Time Strategy Game Player

**Context:** Tomás has completed Missions 1-6 over two weeks. He understands hooks conceptually but hasn't built complex architectures. He's been using 2-3 channels. He lost signal data in Mission 6 and was frustrated — "the scouts saw the enemy but the striker didn't know." He's excited about BLOCKING because it sounds like it fixes his problem.

**Minute 0:00 — Plan Screen, Discovery**
The workbench opens with Mission 7 briefing. The map shows Cebu's narrow streets. Tomás sees a new option in the hook configuration panel — a toggle next to each hook labeled "MODE: [FIRE-AND-FORGET ▾]". He clicks the dropdown. Two options: FIRE-AND-FORGET and BLOCKING. A small "?" icon. He clicks it.

A tooltip appears: "BLOCKING: Sender waits until receiver processes the signal. Guaranteed delivery. Risk: if receiver is busy, sender freezes." The tooltip has a tiny animated diagram — two unit icons, one sending a thick line to the other, the sender showing an hourglass while the line pulses.

Tomás thinks: "Guaranteed delivery. That's what I need." He switches his scout-to-relay hook to BLOCKING. The hook line in the channel map preview thickens — it changes from a dashed line (fire-and-forget) to a solid opaque line (blocking). The visual difference is immediate.

The Predecessor appears: *"Blocking. I used blocking on everything my first time."* Tomás reads the warning. He thinks, "Yeah, I won't make that mistake." He switches ALL his hooks to BLOCKING anyway. The Predecessor's final line appears: *"...you're doing exactly what I did."*

Tomás hesitates. Considers switching some back. But the briefing shows enemies coming from one direction first (Phase 1). He decides to test it.

**Minute 2:30 — Phase 1 Sealed Watch**
Ticks 1-30. The corridor battle plays out. His scout spots enemies at the far end of a Cebu street. The blocking signal fires — a thick amber line extends from scout to relay, scout shows a tiny hourglass for 1 tick, then the relay acknowledges. Clean. The relay compresses and fires to the striker — another thick line, 1-tick wait. The striker eliminates the enemy on the next tick.

Tomás pumps his fist. "Blocking works!" The signals never drop. Every report arrives. The corridor is clear.

Predecessor: *"Holding."*

**Minute 3:00 — Phase 2 Opens**
The map expands. Three corridors converge at an intersection. Enemies now approach from three sides. Tomás sees his three scouts, one in each corridor, all reporting to the same central relay. He thinks briefly about changing something but decides to let it ride. "Phase 1 worked. Same config."

**Minute 3:30 — Phase 2 Sealed Watch**
Ticks 31-37: Fine. Scouts report one at a time. The relay processes each in sequence. No problems. But enemies are advancing faster now, and scouts are reporting more frequently.

**Tick 38:** Scout-A and Scout-D spot enemies simultaneously. Two thick blocking lines fire toward Relay-B at the same tick. Scout-A's arrives first (alphabetical ordering). Scout-D's signal reaches Relay-B and... can't enter. Relay-B is processing Scout-A's signal. Scout-D's line turns amber. An hourglass appears above Scout-D.

Tomás notices: "Wait, why is that scout stopped?"

**Tick 39:** Relay-B finishes processing Scout-A's signal. Fires a blocking signal to Striker-C. Relay-B is now waiting for Striker-C. Scout-D's signal still pending — Relay-B can't receive it while blocked on its outgoing signal. Scout-D is still frozen.

**Tick 40:** A third scout fires. Another amber line that can't connect. The relay node now has two queued senders and one outgoing block. Three hourglasses on the board.

Tomás: "No no no no no—"

**Tick 42-50:** The three scouts are frozen. The relay is frozen. Enemies walk through all three corridors unopposed. Strikers at the intersection, acting on whatever data they received before the freeze, fire at positions that are now empty. The intersection is overrun. Mission failed.

The silence hits Tomás hard. He had audio from three active scouts, the relay's compression cascade, and the strikers' engagement sounds. Now the center of the board is dead quiet. Just the tick clock advancing. And the enemies.

**Minute 4:30 — Inspector**
Tomás enters the Inspector. He scrubs to tick 38. Clicks Scout-D. The decision trace shows: "STATUS: BLOCKED. Waiting for RELAY-B." He clicks Relay-B: "STATUS: BLOCKED. Waiting for STRIKER-C." He clicks Striker-C: "ENGAGE priority active. RECEIVE pending."

He starts to see the chain. But the causality is complex — three units, multiple pending signals. He scrubs back and forth, trying to untangle.

After 25 seconds of scrubbing, the boot log prints:

```
[>>] DIAGNOSTIC: DEADLOCK_DETECTOR — ONLINE
[>>] CYCLE DETECTED...
```

The red cycle arrows appear on the board. Scout-A → Relay-B → Striker-C, with Scout-D as a secondary block. The visualization is immediately clear. Tomás says out loud: "Oh. They're all waiting for each other."

Predecessor: *"The corridor was a chain. The intersection was a star. Blocking holds a chain together. Blocking tears a star apart."*

Tomás gets it. He goes back to Plan. Switches scout-to-relay hooks back to fire-and-forget. Keeps relay-to-striker as blocking. Retries. The scouts report freely — some data drops, but the relay gets enough. The relay's blocking link to the striker ensures accurate targeting. The intersection holds.

**Minute 7:00 — Resolution**
Mission 7 complete. Tomás has learned: blocking is powerful in chains, dangerous in stars. The Deadlock Detector is now in his Inspector toolkit. He opens it to examine the successful run — no cycles detected. A green "NO DEADLOCKS" badge in the corner. He feels relief.

He texts his friend: "the game just taught me about deadlocks and I didn't even know what a deadlock was"

**UI Annotations:**
- Hook mode dropdown: 18px wide, positioned to the right of each hook's channel name in the hook configuration panel. Default shows "F&F" with a dashed line icon; "BLOCK" with a solid line icon. Color: fire-and-forget is cyan dashed; blocking is amber solid.
- Hourglass icon: 8×8px, positioned above unit sprite, sand grain animation at 2fps (one grain per 0.5s). Appears instantly when unit enters BLOCKED state.
- Deadlock Detector panel: materializes in Inspector sidebar below the Event Log. Red header bar with "⚠ DEADLOCK DETECTOR" label. Cycle graph uses red arrows 2px thick. Pulsing rotation animation.

---

### Journey 2: Dr. Priya, 38, ML Infrastructure Lead

**Context:** Priya has 15 years of distributed systems experience. She's been playing Robot Uprising for the engineering vocabulary mapping — she recognized context windows, hooks, and channels immediately as context windows, webhooks, and message buses. She's on Mission 7. She read the Predecessor's warning and immediately thought: "This is a distributed deadlock. I know this."

**Minute 0:00 — Plan Screen, Expertise**
Priya sees the BLOCKING option and immediately maps it: "Oh, this is synchronous RPC vs. fire-and-forget messaging. They're introducing sync calls." She reads the Predecessor's warning and thinks: "Classic mistake. They're going to make me deadlock."

She examines the Phase 1 map (single corridor) and Phase 2 map (intersection). She sees the topology immediately — Phase 1 is a pipeline, Phase 2 is fan-in. She knows fan-in with synchronous calls will deadlock under concurrent load.

**She deliberately configures the trap.** All hooks BLOCKING. She wants to see the deadlock happen. She wants to see how the game visualizes it. She wants to evaluate the Inspector's diagnostic quality against her professional experience with distributed tracing tools (Jaeger, Zipkin, DataDog).

**Minute 1:30 — Phase 1 Sealed Watch**
Priya watches the clean pipeline operation with professional appreciation. She thinks: "Yeah, this is a single-producer single-consumer channel. Blocking is fine here. The game is teaching the 'it works in dev' pattern."

**Minute 2:30 — Phase 2 Sealed Watch**
Priya watches for the deadlock with anticipation. When tick 38 hits and the first scout freezes, she nods. "There it is. Three producers, one consumer, all synchronous." She watches the cascade with clinical detachment, noting how the game visualizes it: the thick lines going amber, the hourglasses, the growing silence. She's evaluating the visual language, not the gameplay.

When the mission fails, she thinks: "Good. Now show me the trace."

**Minute 3:30 — Inspector, Professional Evaluation**
Priya enters the Inspector and scrubs directly to tick 38 (she noted the exact tick during sealed watch). She clicks the frozen relay. Reads the decision trace. "This is a simplified distributed trace. Source → intermediate → sink with blocking at each hop. The 'engage priority > receive priority' is the equivalent of a thread holding a lock."

When the Deadlock Detector materializes, Priya is impressed. The cycle graph with red arrows is exactly the dependency graph she'd draw on a whiteboard. She thinks: "This is better than most actual debugging tools. The game is rendering a dependency graph that most engineers draw by hand."

She takes a screenshot. Posts it to her team's Slack with the caption: "This game's deadlock detector is more intuitive than our Jaeger traces. I'm not kidding."

**Minute 4:30 — The Fix**
Priya goes back to Plan. She doesn't just switch scouts to fire-and-forget — she designs a proper architecture:

- Scout-to-relay: FIRE-AND-FORGET (multiple producers, lossy is acceptable, relay compresses anyway)
- Relay-to-striker: BLOCKING (single producer, guaranteed delivery for critical targeting data)
- She adds a second relay to handle the fan-in better — Relay-West and Relay-East, each serving a subset of scouts, both feeding the striker through separate blocking channels

She's not just fixing the deadlock — she's doing **horizontal scaling of the consumer** to handle concurrent producer load. Exactly what she'd do in production.

The mission succeeds with headroom. She opens the Inspector, confirms zero deadlocks, and examines her signal throughput. She maps the post-fix architecture to a real system: "Relay-West is a partition consumer. Relay-East is a second partition consumer. The scouts are producers writing to a partitioned topic. Striker is the downstream service reading from both partitions."

**Minute 7:00 — Resolution**
Priya has confirmed that Robot Uprising teaches real distributed systems concepts through gameplay. She recommends it to her team lead for onboarding new junior engineers. She Slacks: "New hire curriculum: 1) Read Designing Data-Intensive Applications. 2) Play Robot Uprising through Mission 7. 3) Build your first microservice."

**UI Annotations:**
- Channel map: shows topology type label (CHAIN, STAR, MESH) in small grey text above each cluster of connected units. Priya notices this and appreciates the vocabulary.
- Signal throughput overlay in Inspector: per-channel signals-per-tick graph. Priya uses this to verify her post-fix architecture handles Phase 2 load without drops OR deadlocks.

---

### Journey 3: Aisha, 14, First Strategy Game, Currently Struggling

**Context:** Aisha has been playing slowly — she took three attempts to beat Mission 5 (the factory introduction). She doesn't have engineering vocabulary. She thinks of hooks as "messages" and channels as "walkie-talkie frequencies." She's on Mission 7 and excited about BLOCKING because she's tired of her scouts' reports getting lost.

**Minute 0:00 — Plan Screen, Hope**
Aisha sees the BLOCKING option. She reads the tooltip: "Sender waits until receiver processes the signal." She thinks: "Finally! No more lost messages!" She imagines it like a phone call instead of a text message — the scout CALLS the relay, and the relay has to PICK UP before the scout continues.

She switches everything to BLOCKING. The Predecessor's warning appears. She reads it but doesn't fully understand the deadlock description. "Two of my scouts froze" — she thinks "froze" means they were destroyed, not literally frozen.

*"...you're doing exactly what I did."*

She hesitates but doesn't change anything. "I'm sure it'll be fine."

**Minute 3:00 — Phase 1 Sealed Watch**
Phase 1 goes smoothly. Aisha sees the thick lines and the brief pauses. She notices her scout pauses after sending — "Oh, it's waiting for the relay to pick up the phone. Like a real phone call." The metaphor clicks. She's happy.

**Minute 4:00 — Phase 2 Sealed Watch**
The intersection opens. Enemies from three directions. Aisha's three scouts start reporting. She sees the thick lines extending from all three scouts toward the central relay.

**Tick 38:** Two scouts freeze. Hourglasses appear. Aisha's eyes widen. "What's happening? Are they broken?"

**Tick 40:** The relay freezes. Three hourglasses. Enemies advance. Aisha is confused and alarmed. "They're all on hold! Nobody's moving!"

She watches the remaining ticks with growing distress. The silence is the worst part — she's used to the relay's compression sound, the scouts' scan pings. The center of the board is dead quiet while enemies pour through.

Mission fails. Aisha feels frustrated — not at the game, but at herself. She remembers the Predecessor's words: *"Two of my scouts froze."* "Oh. FROZE. Not destroyed. FROZEN. They literally couldn't move."

**Minute 5:00 — Inspector, Confusion**
Aisha enters the Inspector. She scrubs to where the scouts stopped. She clicks Scout-D. "STATUS: BLOCKED. Waiting for RELAY-B." She clicks Relay-B. "STATUS: BLOCKED. Waiting for STRIKER-C."

She's reading the words but the concept isn't clicking. "They're all waiting for each other? But why can't the relay just... do both at once?"

The Deadlock Detector appears. The red arrows form a cycle. She sees the visual:
```
SCOUT-A → RELAY-B → STRIKER-C
            ↑
SCOUT-D ───┘
```

She stares at it. Then says: "Ohhhh. It's like when you and your friend both hold a door for each other and neither of you goes through." The circle metaphor clicks.

The Predecessor: *"The corridor was a chain. The intersection was a star."*

She looks at the channel map. Phase 1: a line. Phase 2: a star shape. "When it's a line, they take turns. When it's a star, they all try at once and nobody can go."

**Minute 6:30 — The Fix**
Aisha goes back to Plan. She changes the scout-to-relay hooks back to fire-and-forget. "The scouts can text the relay. The relay can phone-call the striker." She's mixing metaphors but the concept is right: lossy upstream, guaranteed downstream.

She retries. The intersection holds. Some scout data drops, but the relay forwards enough. She wins.

**Minute 8:00 — Resolution**
Aisha texts her older cousin (a CS student): "I just learned about deadlocks in a GAME." Her cousin replies: "Wait, like actual deadlocks? As in concurrent programming?" Aisha: "I think so? Three robots were all waiting for each other and nobody could move. I had to change some of them to not wait."

Her cousin is impressed. Aisha doesn't know she just described the solution to the Dining Philosophers Problem.

**UI Annotations:**
- The "held door" metaphor: no in-game reference, but the Deadlock Detector's circular arrow visualization naturally evokes circular waiting. The game doesn't explain the metaphor — the visualization IS the explanation.
- Fire-and-forget visual: dashed cyan line, signals shown as small dots traveling along the line. Some dots reach the destination, some fade and disappear before arriving (visualizing signal loss). Blocking visual: solid amber line, signal shown as a continuous glow traveling from sender to receiver, sender's activity paused.

---

### Journey 4: Kwame, 32, Twitch Streamer, 847 Viewers

**Context:** Kwame streams strategy games. He's been playing Robot Uprising on stream since launch week. His chat is a mix of engineers, gamers, and students. He's on Mission 7, live. He reads chat's warnings about blocking ("DON'T USE ALL BLOCKING" — chat has seen this trap before from other streamers). He ignores them deliberately for content.

**Minute 0:00 — Plan Screen, Performance**
Kwame sees the BLOCKING option. Chat explodes:
- "oh no he's going to do it"
- "DONT DO IT KWAME"
- "he's totally going to blocking everything"
- "PepeLaugh he doesn't know"

Kwame reads the Predecessor's warning out loud. "Oh, the Predecessor deadlocked? That's rough." He grins. "But I'm built different." He switches everything to BLOCKING. Chat goes wild.

The Predecessor's *"...you're doing exactly what I did"* line appears. Kwame pauses. Reads it. Chat is scrolling with variations of "LMAO" and "he was warned."

"Nah, it'll be fine. Phase 1, let's go."

**Minute 2:00 — Phase 1 Sealed Watch (On Stream)**
Phase 1 goes perfectly. Kwame points at the thick blocking lines: "See? Clean signals. No drops. Chat was wrong." Chat sends copium emotes.

**Minute 3:00 — Phase 2 Sealed Watch (On Stream)**
The intersection opens. Kwame is confident. "Three corridors, same config, let's cook."

**Tick 38:** Scout freezes. Kwame doesn't notice immediately — he's narrating the enemy positions. Chat sees it first:
- "the scout LUL"
- "IT'S HAPPENING"
- "look at the hourglass"

**Tick 40:** Three units frozen. Kwame sees it. "Wait— why is the relay not— OH NO." His voice drops. "They're all blocked. They're all waiting for each other. It's a deadlock. CHAT WAS RIGHT."

Chat erupts. Emotes. "TOLD YOU" spam. A subscription notification chimes. Someone clips the moment.

**Tick 42-50:** Kwame narrates the collapse with theatrical despair. "The enemies are just... walking through. My scouts can see them but can't tell anyone. This is a distributed systems nightmare on live television."

A viewer donates with the message: "this is literally what happened at my company last week with our microservice mesh."

**Minute 4:00 — Inspector (On Stream)**
Kwame enters the Inspector. Chat types suggestions: "click the relay" "scrub to 38" "look at the dependency chain." Kwame scrubs to tick 38. Clicks Scout-D. "BLOCKED. Waiting for RELAY-B." Clicks Relay-B. "BLOCKED. Waiting for STRIKER-C."

"It's a circle of blame! They're all pointing at each other!"

The Deadlock Detector appears. The cycle graph materializes. Chat loses its mind:
- "THE GAME HAS A DEADLOCK DETECTOR"
- "this is better than our production monitoring"
- "certified distributed systems moment"

Kwame screenshots the cycle graph. "This is going on Twitter. 'A game just taught me more about deadlocks than my CS degree.'"

**Minute 5:30 — The Fix (On Stream)**
Chat debates the fix: "scouts F&F, relay blocking" vs. "add more relays" vs. "adjust rule priorities." Kwame reads the suggestions, picks the scout-F&F/relay-blocking approach. Retries. The intersection holds. Chat celebrates.

A viewer clips the full 6-minute sequence: setup → warning ignored → success → failure → Inspector revelation → fix → victory. The clip gets 180K views. The cycle graph screenshot gets 40K likes on Twitter.

**Minute 7:00 — Resolution**
Kwame's post-stream analysis: "Mission 7 is the best-designed tutorial I've ever played. It taught a concept from computer science through gameplay. The Predecessor's warning, the two-phase structure, the Deadlock Detector — everything was perfectly paced."

The clip becomes the most-shared Robot Uprising content. Engineering Twitter shares it. CS professors bookmark it for lectures.

**UI Annotations:**
- Streamer-friendly elements: the Deadlock Detector's cycle graph is high-contrast (red on dark background), reads well at 720p/1080p stream resolution. The "DEADLOCK DETECTED" text is large (24pt) and stays on screen for 5+ seconds. The hourglass animations are visible at stream compression quality.
- Chat interaction: the two-phase structure creates natural content beats — "Phase 1: success" and "Phase 2: disaster" are perfect stream narrative arcs.

---

## Interaction Effects

### With Hook Semantics (1.04d)
This mission only exists if blocking hooks exist. In Model A (fire-and-forget only), deadlocks are impossible and this mission has no equivalent. In Model E (hybrid), this mission is the teaching moment for the BLOCKING option. In Model B (blocking as default), this mission would need to teach the concept earlier and differently — possibly as Mission 3 or 4.

### With Hook Chaining (3.09)
The Relay Race model (1-tick-per-hop delayed chaining) amplifies deadlock risk because signals traverse multiple hops. A Scout→Relay→Striker chain with all-blocking hooks creates 3 potential blocking points. With same-tick chaining (Circuit Board model), the deadlock manifests differently — it might self-resolve within a tick or create instant-freeze without the gradual amber→red cascade.

### With Buffer Model (2.01)
The blocking hook's interaction with buffer state is critical: a unit in BLOCKED state doesn't evict buffer entries (it's frozen, not processing). This means a blocked unit's buffer represents its state at the moment of freeze — a forensic snapshot. The Inspector can use this: "Buffer contents at time of block" becomes a diagnostic tool.

### With Sealed Watch Design (Locked)
The sealed watch's "no skip, no pause, no tools" rule means the player MUST watch the deadlock play out without intervention. This is emotionally intense — watching units freeze while enemies advance, unable to fix it. The design must ensure the post-deadlock battle doesn't last too long (enemies should win within 10-12 ticks of the deadlock, not 30).

### With Predecessor Arc (6.03a)
This mission falls in the Predecessor's Phase 4: "Invested Collaborator." The Predecessor confessing their own deadlock experience is a vulnerability moment that deepens the relationship. The Predecessor is no longer a teacher — they're a peer who made the same mistake.

### With Deadlock Detector as Career Tool
If the Deadlock Detector becomes a permanent Inspector tool, it has implications for:
- **Gauntlet (5.22):** Advanced players might deliberately induce brief deadlocks in opponents via EM noise flooding (cause enemy units to trigger many simultaneous blocking signals). The Deadlock Detector helps diagnose whether a loss was caused by an adversarial deadlock attack.
- **Multiplayer (7.x):** In PvP, deadlock-inducing strategies become viable. The Deadlock Detector becomes a defensive diagnostic.
- **Community (7.10):** Config necropsy reports can include "Deadlock Frequency" as a metric, helping the community identify deadlock-prone architectures.

### With Mission Arc (Locked)
The locked spec says Missions 6-7 cover "Command agent + production tuning." If blocking hooks are introduced at Mission 7, they share the mission with Command agent mastery. This creates a natural synergy: the Command agent's REASSIGN and REROUTE skills can dynamically switch hooks between blocking and fire-and-forget mid-battle (in future missions). The deadlock lesson primes the player for this meta-level capability.

---

## Comparable Games

### TIS-100 — The Pure Deadlock Game
TIS-100 uses blocking communication exclusively. The `MOV` instruction between nodes blocks until both source and destination are ready. Deadlock is the primary failure mode — solutions that are "almost correct" run forever with no output. TIS-100 provides a step-through debugger that shows each node's read/write state, but no automatic deadlock detection. Players must identify deadlocks manually by finding pairs of nodes both in "WRITE" state waiting for each other.

**What Robot Uprising can learn:** TIS-100's step-through debugger is essential but insufficient — players need the cycle graph visualization that TIS-100 doesn't provide. Robot Uprising's Deadlock Detector surpasses TIS-100's tools.

### EXAPUNKS — Deadlock in Narrative Context
EXAPUNKS uses the same blocking M register as TIS-100 but frames it within hacker narrative. Deadlocks feel like "the hack went wrong" rather than "the program has a bug." The narrative context makes deadlock emotionally resonant rather than purely technical.

**What Robot Uprising can learn:** The Predecessor's narrative (confessing their own deadlock) serves the same function. Deadlock should feel like a strategic failure within the uprising's story, not a programming error in a game.

### Go (Programming Language) — Unbuffered Channels
Go's unbuffered channels block on both send and receive until both goroutines are ready. The Go runtime detects deadlocks and panics with an error message. This is the real-world engineering parallel most directly — Robot Uprising's Deadlock Detector is the game equivalent of Go's `fatal error: all goroutines are asleep - deadlock!`

**What Robot Uprising can learn:** Go's error message is terse and unhelpful for beginners. Robot Uprising's cycle visualization is what Go *should* have.

### Into the Breach — Perfect Information Failure
Into the Breach gives the player complete information about what will happen next turn. Failure is always "I saw it coming and couldn't prevent it." Robot Uprising's deadlock inverts this: the player CAUSED the deadlock through their configuration but couldn't predict when it would trigger during the sealed watch. The Inspector is the tool that makes the causal chain visible after the fact.

### Factorio — Belt Deadlock
Factorio's belt system can deadlock when inserters create circular dependencies (Assembler A needs output from Assembler B, which needs output from Assembler A). The fix is always the same: add a buffer (chest) to break the cycle. Robot Uprising's fix is analogous: switch a blocking hook to fire-and-forget (add lossiness to break the cycle).

---

## Sensory Summary

**The sound of deadlock:** The critical audio design is the *absence* of sound. During normal operation, each active unit contributes to the battlefield soundscape — scouts ping, relays cascade, strikers hum. When a unit enters BLOCKED state, its sound contribution stops. If three units deadlock simultaneously, three audio layers disappear at once. The remaining sounds — enemies moving, the tick clock, ambient terrain noise — continue, creating a "hole" in the soundscape. The hole IS the deadlock.

A low-frequency hum (40Hz, barely audible on laptop speakers, felt more than heard on headphones or subwoofers) begins when the first unit blocks. It intensifies as more units join the deadlock. This hum is the deadlock's sonic signature — later in the game, experienced players will hear it and immediately know something is wrong before they see the hourglasses.

**The look of deadlock:** Blocked units show their last frame of animation frozen in place. No idle animation cycling. The hourglass icon (8×8 pixels, positioned above the unit sprite) has animated sand grains falling at 2fps. The thick blocking lines connecting deadlocked units shift from amber to red over 3 seconds. The Deadlock Detector's cycle graph pulsates at 0.5Hz with a slow rotation — the visual sense of a circular dependency made literal.

**The feel of deadlock:** On controllers with haptic feedback, the deadlock produces a slow, heavy pulse (one beat per second) that gets faster as more units join the deadlock. It's a heartbeat that's accelerating — the system is dying. When the Deadlock Detector appears in the Inspector, the haptic pulse stops abruptly. Silence. The diagnosis replaces the symptom.

---

## New Aspects Discovered

- [ ] 5.18a — Deadlock-inducing enemy strategies: can enemy configurations deliberately create deadlocks in the player's architecture? An enemy unit that floods a relay with blocking requests, causing the relay to lock up. Deadlock as an adversarial weapon.
- [ ] 5.18b — Partial deadlock vs. total deadlock: when only 2 of 5 units deadlock, the remaining 3 might still win. The "how many units can I afford to lose?" calculation applied to deadlock tolerance. Deadlock as acceptable loss vs. catastrophic failure.
- [ ] 5.18c — Self-resolving deadlocks: if a unit's ENGAGE action completes and it cycles back to RECEIVE, the deadlock might break on its own after N ticks. Transient vs. permanent deadlocks as a spectrum. Should the Deadlock Detector distinguish between them?
- [ ] 5.18d — The Deadlock Detector as competitive intelligence: in PvP, the Deadlock Detector shows YOUR deadlocks but not the opponent's. Can you infer opponent deadlocks from their unit behavior (sudden freeze, stopped signal chains)? Deadlock detection as an observational skill.
- [ ] 5.18e — Deadlock prevention vs. deadlock recovery: the tutorial teaches prevention (use fire-and-forget to break cycles). An advanced mission could teach recovery — a Command agent's REROUTE skill that dynamically switches a hook from blocking to fire-and-forget mid-battle when it detects a deadlock forming. Prevention for beginners, recovery for veterans.
