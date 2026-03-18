# 1.07a — The RAM-as-Context-Window Parallel: Static vs. Dynamic Resource Constraints

## Overview

Bitburner's RAM system and Robot Uprising's context window both constrain what an agent can "hold in mind" — but they constrain at fundamentally different moments. Bitburner's RAM is **static**: calculated at compile time by parsing the AST, before the script ever runs. Robot Uprising's context window is **dynamic**: slots fill and evict during battle execution, creating runtime drama. This temporal difference produces entirely different player tensions, optimization strategies, and emotional arcs.

Understanding this parallel illuminates what Robot Uprising gains (and loses) by choosing dynamic constraints. The two systems are close enough that lessons transfer directly, but far enough apart that the player experience diverges dramatically.

---

## The Mechanical Comparison

### Bitburner: Build-Time Optimization

Bitburner's RAM system works like this:

1. **Acorn AST parser** reads the script source code at deploy time
2. Every unique NS API function referenced in the script adds a fixed cost (e.g., `ns.hack()` = 0.10 GB, `ns.grow()` = 0.15 GB, `ns.weaken()` = 0.15 GB)
3. A **base cost of 1.6 GB** applies to every script regardless of content
4. The total is computed **before execution begins** — dead code paths still count
5. If the script's RAM exceeds the server's available capacity, it simply **won't run**. No partial execution. No degraded mode. Binary: fits or doesn't.
6. Running a script with N threads multiplies RAM cost by N
7. Multiple calls to the same function don't stack — using `ns.hack()` ten times in one script costs the same 0.10 GB as using it once

The player tension is architectural: *which functions do I include in this script?* A monolithic script (hack + grow + weaken = ~2.0 GB) costs more per thread than three separate single-function scripts (hack = 1.7 GB, grow = 1.75 GB, weaken = 1.75 GB). Split scripts run more threads on the same hardware. The optimization is about **software architecture** — dependency management, separation of concerns, module boundaries.

### Robot Uprising: Runtime Drama

Robot Uprising's context window works like this:

1. Each unit has a fixed number of **slots** (6 for Scout, 8 for Striker, 12 for Relay, 14 for Command)
2. Slots fill during battle as the unit **observes** (perception range) and **receives signals** (hook channels)
3. When all slots are full and new information arrives, the **eviction policy** (player-configured) determines what gets dropped
4. If eviction fails to make room in time, the unit enters **context overload** — stunned for 1 tick, sparking/jittering, unable to act
5. Decision logic evaluates only what's currently in the context window — no global memory, no history beyond what survived eviction
6. The player configures listen/ignore filters, eviction priorities, and buffer behavior **before battle**, but the constraint plays out **during battle**

The player tension is temporal: *what will this unit need to remember at the moment it matters?* A Scout with 6 slots listening to two busy channels might have its observation of an enemy overwritten by channel noise before a rule can act on it. The optimization is about **information architecture** — what to listen to, what to ignore, what to evict first, how much headroom to leave.

### The Core Divergence

| Dimension | Bitburner RAM | Robot Uprising Context Window |
|-----------|---------------|-------------------------------|
| **When constrained** | Compile/deploy time | Runtime (every tick) |
| **Failure mode** | Binary: won't start | Graceful degradation → stun |
| **Player emotion** | Frustration → clever refactor → satisfaction | Anxiety → watch overload → diagnosis |
| **What's optimized** | Code architecture (module boundaries) | Information architecture (filters, priorities) |
| **Feedback timing** | Immediate (deploy fails or succeeds) | Delayed (overload happens at tick 23) |
| **Debug experience** | Read error, read code, refactor | Watch battle, enter Inspector, trace causation |
| **Dead code penalty** | Yes (AST-scanned, unreachable paths count) | No (unused filters/rules cost nothing) |
| **Scaling** | Linear (threads × cost) | Temporal (fill rate × tick count vs. capacity) |
| **Mastery signal** | Smaller scripts, more threads | Cleaner context, fewer overloads |
| **Emotional register** | Quiet satisfaction (it fits!) | Drama (will it hold?) |

---

## What Robot Uprising Gains from Dynamic Constraints

### 1. The Sealed Watch Drama Arc

Bitburner's RAM constraint resolves instantly at deploy time. The player knows immediately whether the script fits. There's no suspense — just "yes" or "reconfigure." Robot Uprising's context window creates a *narrative arc within every battle*. The first few ticks are calm — buffers half-full, all information arriving cleanly. Then tick 12: a Scout spots three enemies simultaneously. Its 6-slot buffer fills. Tick 13: another signal arrives on the recon channel. The eviction policy kicks the oldest observation. Tick 14: the Scout's rule checks for enemy positions, but the one it needs was just evicted. The rule evaluates against stale or missing data. The Scout makes the wrong move.

This drama is impossible with static constraints. Robot Uprising trades Bitburner's clean binary certainty for a messy, temporal, suspenseful experience where the constraint *lives* in the battle.

### 2. The Diagnostic Depth

When a Bitburner script exceeds RAM, the fix is structural: remove a function call, split the script, or upgrade the server. The diagnosis is trivial — check the RAM readout, identify the expensive function, refactor. When a Robot Uprising unit overloads, the diagnosis is *forensic*. The Inspector shows: which slot had what at tick 22, which signal arrived at tick 23, which entry was evicted, which rule then failed to match because the evicted entry was the one it needed. The causal chain might span 10 ticks and 3 units. This is where Bitburner players spend 3 AM debugging sessions — but Robot Uprising provides purpose-built diagnostic tools instead of `console.log`.

### 3. The Eviction Policy as Expressive Space

Bitburner has no eviction. If the script doesn't fit, it doesn't run. Robot Uprising's eviction policy is itself a design space: evict oldest first? Evict by signal type? Evict lowest-priority entries? Each policy creates different failure modes. A "newest-first" eviction policy protects old observations (good for slow-changing environments) but drops fresh intel (catastrophic when an enemy appears suddenly). The eviction policy IS a game mechanic — a whole skill domain that Bitburner's static model can't express.

### 4. The Overload-as-Weapon Design Space

Because Robot Uprising's constraint is dynamic, enemies can exploit it. Flooding a Scout with noise to trigger context overload — forcing a 1-tick stun — is a viable tactic. This creates an entire dimension of information warfare: EM emissions, channel noise, signal jamming. Bitburner's static RAM can't be attacked by other scripts (within the game's mechanics). The constraint is a build-time gate, not a runtime vulnerability.

---

## What Robot Uprising Loses from Dynamic Constraints

### 1. The Instant Feedback Loop

Bitburner's static constraint gives immediate, unambiguous feedback. The script either runs or it doesn't. The player learns their mistake instantly and can iterate in seconds. Robot Uprising's feedback is delayed: you configure the context window in the Plan phase, hit Execute, watch 30+ ticks of battle, then diagnose in the Inspector. The delay between "I made a mistake" and "I understand the mistake" can be minutes. For learning, instant feedback is almost always superior to delayed feedback. This is Bitburner's biggest advantage.

Robot Uprising mitigates this with the animated tooltip system (hover a context config toggle and see a 3-5 tick micro-scenario preview) and the ghost unit preview (see perception radii and approximate signal flow before executing). But these are approximations — the actual fill/evict behavior only reveals itself during real battle.

### 2. The Transparency Ceiling

Bitburner's RAM is perfectly transparent. The player can see exactly how much RAM each function costs, calculate the total, and predict whether the script will fit. There's no hidden state. Robot Uprising's context window has emergent opacity — the fill rate depends on how many enemies are in perception range, how many signals arrive on subscribed channels, whether hooks from other units fire, and what the enemy does. The player can't predict the exact buffer state at tick 23 during the Plan phase. This opacity creates drama but also frustration: "I configured everything correctly, but the battlefield conditions were different from what I expected."

This is the fundamental tension: Bitburner's transparency enables confident optimization, while Robot Uprising's opacity forces adaptive design (build systems that work under a range of conditions, not just one predicted scenario).

### 3. The Refactoring Vocabulary

Bitburner players develop a rich vocabulary for RAM optimization: split scripts, reduce thread count, upgrade servers, use batching. These are transferable software engineering concepts. Robot Uprising's context window optimization vocabulary — listen/ignore filters, eviction priorities, buffer headroom — maps to real concepts too (attention management, context window tuning in LLM systems, sensor fusion in robotics), but the mapping is less immediately recognizable. A Bitburner player who says "I split my hack and grow scripts for better RAM efficiency" is speaking a language any developer understands. A Robot Uprising player who says "I narrowed my Scout's listen config to reduce buffer pressure" is speaking a language that's powerful but less culturally established.

---

## The "Dead Code Tax" — A Design Lesson

One of Bitburner's most instructive (and controversial) design decisions: RAM is charged for functions that appear in the source code but never execute at runtime. An `if (false) { ns.hack(target); }` still costs 0.10 GB for `ns.hack()`. The AST parser doesn't evaluate conditions — it scans references.

This creates a real software engineering lesson: your code's *dependencies* matter even when they're not used. Importing a library to use one function means paying for the library's entire weight. This maps to real-world concerns (tree-shaking, dead code elimination, bundle size optimization).

**Should Robot Uprising have an equivalent?** Consider: a rule that references `ENEMY_POSITION` in its condition but can never fire because the unit's perception range is 0 (a stationary Relay). Should the context window still "pay" for that rule? Three design positions:

1. **No dead-rule tax** (current locked spec): Rules that can't match cost nothing. The system only evaluates rules against current context contents. This is more intuitive but misses the teaching opportunity.

2. **Evaluation overhead tax**: Each rule, even if it can never match, consumes one tick of "evaluation time" — a minor processing delay that matters only when the unit has 15+ rules. This teaches that configuration complexity has a cost even when it's not doing anything.

3. **Configuration clarity warnings**: Not a tax, but a static analysis warning in the workbench: "Rule 7 references ENEMY_POSITION but this unit has perception range 0 — this rule can never fire. Remove it or add a signal source." This is the Bitburner lesson (your dependencies matter) delivered as a linter, not a constraint.

Option 3 aligns with the locked spec's shadow-warning system in rule conflicts (3.06) and creates a bridge to real software engineering without punishing players.

---

## The Progression Asymmetry: Growing vs. Shrinking

Bitburner's RAM progression goes in one direction: **up**. Players start with 8 GB and end with petabytes across 25 servers. The constraint loosens over time. The early game is tight; the late game is abundant.

Robot Uprising's context window does the opposite. Early missions have simple environments (few enemies, few signals, low information density). Late missions have complex environments (many enemies, busy channels, enemy noise attacks). The constraint **effectively tightens** even though the raw slot count doesn't change (a Scout always has 6 slots). What changes is the *demand* on those slots.

This is a crucial design asymmetry:

- **Bitburner:** Player skill grows AND resource capacity grows → compound empowerment
- **Robot Uprising:** Player skill grows BUT environment complexity grows → maintained tension

Robot Uprising's approach is better for sustained difficulty but risks frustration if the player's skill doesn't keep pace with environmental demand. The locked spec handles this with the Relay unit (12 slots, `compress` and `filter` skills) as the player's tool for managing information explosion. Building relay networks IS the game's answer to "more RAM" — but it's a strategic answer requiring planning, not a resource answer you can simply buy.

---

## The Thread Count Parallel

Bitburner's thread system creates a secondary optimization layer: a 1.7 GB script running with 10 threads on a 32 GB server produces 10x the income of 1 thread, but uses 17 GB. Robot Uprising doesn't have a direct "thread count" analog, but the production queue serves a similar function. The player decides how many Scouts vs. Relays vs. Strikers to build — and each additional unit adds demand to the channel system (more signals, more context pressure across all units).

The thread/production parallel:
- **Bitburner:** More threads of the same script = more throughput but more RAM consumed
- **Robot Uprising:** More units of the same blueprint = more battlefield coverage but more channel traffic and EM emissions

Both create a "scaling tax" — producing more agents doesn't linearly improve outcomes because the infrastructure costs grow with the agent count.

---

## Player Journeys

### Journey: Nadia, 24, Backend Developer

**Context:** Nadia has 200 hours in Bitburner. She's completed BitNodes 1-4, automated the full prestige loop, and understands RAM optimization intuitively. She's starting Robot Uprising's Mission 1 and immediately looks for the "RAM" equivalent.

**Minute 0:00 — The Plan Screen**
Nadia sees the workbench. A Scout blueprint is open on the right. She notices the context window section: 6 slots, visualized as small horizontal bars in a vertical stack. "That's my RAM," she thinks immediately. She sees listen/ignore toggles for different data types — ENEMY_POSITION, ALLY_POSITION, SIGNAL, TERRAIN. All are set to LISTEN. She toggles TERRAIN to IGNORE. The slot count doesn't change, but a tooltip says "Terrain observations will not fill context slots."

**Minute 0:30 — The Familiar Feeling**
She hovers over the eviction priority dropdown. Options: OLDEST_FIRST, LOWEST_PRIORITY, BY_TYPE. She selects OLDEST_FIRST — it reminds her of a FIFO queue. She thinks: "So the buffer is like RAM, but it fills up during the mission instead of at deploy time. And when it's full, something gets evicted instead of the script just not running." She grabs this immediately because she's spent hundreds of hours managing Bitburner RAM. The concept is identical; the timing is different.

**Minute 1:30 — The First "Where's My Thread Count?"**
She looks for a way to increase the Scout's context window size. There isn't one — it's always 6 slots. In Bitburner, she'd upgrade the server. Here, the slot count is fixed per unit type. She frowns briefly, then reads the Relay unit card: 12 slots, compress skill, filter skill. "Oh — the Relay IS the server upgrade. Instead of buying more RAM, I build a dedicated signal processing unit." The architectural parallel clicks. In Bitburner, she distributes work across servers to manage RAM. In Robot Uprising, she distributes information processing across unit types.

**Minute 3:00 — The Execute Button**
She hits EXECUTE. In Bitburner, this is instant — the script either runs or throws a RAM error. Here, the button launches the sealed watch. The battlefield appears. Her Scout starts moving. She watches the context bars: slot 1 lights up cyan (observation), slot 2 (another observation), slot 3 (ally position signal). Three of six slots filled after two ticks. She thinks: "In Bitburner this would already be resolved. The script is running. Here, I'm watching the RAM fill up in real-time." The temporal dimension hits her. This isn't a build-time constraint — it's a *live* constraint that could fail partway through the battle.

**Minute 4:00 — The Overload That Wasn't**
By tick 15, the Scout has 5 of 6 slots filled. An enemy appears. Slot 6 fills. The bar pulses amber. She holds her breath — in Bitburner, this would be the deploy-fail moment. But the Scout keeps working. Its rule evaluates the context, finds the enemy position, and the Scout evades. The oldest entry (a stale ally position from tick 3) gets evicted to make room. She exhales. "So instead of a hard failure, it just... manages? The eviction policy is like garbage collection. The old stuff gets swept out to make room." She's already mapping to programming concepts, but the *feeling* is entirely different from Bitburner — not the clean satisfaction of a well-sized script, but the anxious relief of a system that almost failed but recovered.

**Minute 6:00 — The Inspector Aha**
The mission ends. She enters the Inspector. She clicks her Scout and sees the full context history: every slot, every tick, every fill and eviction. She sees tick 15 where the eviction happened. She sees that the evicted entry was the ally position — harmless, because no rule needed it at that moment. But she thinks: "What if the eviction had hit the enemy observation? The Scout would have lost the enemy and walked into danger." She adjusts the eviction priority to BY_TYPE, pinning ENEMY observations as highest priority. In Bitburner, there's no equivalent to "this function is more important at runtime." RAM treats all functions equally. Robot Uprising's eviction priorities are a whole optimization dimension that static constraints can't express.

**What Nadia learned:** Dynamic constraints create runtime drama that static constraints can't. The eviction policy is a design space with no Bitburner equivalent. But she also misses Bitburner's instant feedback — having to watch an entire battle before diagnosing a configuration error feels slow.

---

### Journey: Carlos, 19, Community College CS Student

**Context:** Carlos played Bitburner for 30 hours, enough to write basic hack scripts and buy a few servers. He bounced when batch scripting got too complex. He's heard Robot Uprising is "Bitburner but visual." He's starting Mission 3 (hooks introduction).

**Minute 0:00 — "Where's the Code?"**
Carlos opens the workbench. No code editor. No terminal. Instead: a blueprint with labeled sections — Skills (toggle icons), Rules (draggable strips), Hooks (socket connectors), Context Config (sliders and toggles). He feels relief. In Bitburner, this is where he'd be staring at `export async function main(ns) {`. Here, he sees toggleable options with animated tooltip previews. He hovers over the `patrol` skill. The board preview shows a holographic Scout moving in a search pattern. "Oh — the skill IS the function, but I don't have to write it."

**Minute 1:00 — The RAM Parallel Emerges**
He looks at the Context Config section. Six slots shown as horizontal bars. Listen toggles for different data types. He thinks: "This is like... the RAM for the unit. Each slot is like a GB?" Not quite — but close enough that his Bitburner intuition helps. He sees the eviction priority setting and thinks: "In Bitburner, when I ran out of RAM, the script just didn't start. Here, when the slots fill up... something gets kicked out?" He reads the tooltip: "When the context window is full, the oldest entry is removed to make room. If too many entries arrive at once, the unit is stunned for 1 tick." He understands immediately: it's RAM, but with a garbage collector instead of a hard limit.

**Minute 2:30 — The Hook as the Batch Script**
He's configuring hooks for the first time. He drags a hook trigger (ON_ENEMY_SPOTTED) into a hook slot and types a channel name: "threats." He sees a tooltip: "When this unit spots an enemy, it sends a signal on the 'threats' channel. Other units listening to 'threats' will receive it in their context window." This is the HWGW batch pattern — but instead of timing `ns.exec()` calls with precise `ns.sleep()` delays, he's wiring a signal path visually. The Scout spots an enemy, sends on "threats," the Striker (on a separate tile, listening to "threats") receives it next tick and engages. Same coordination problem as batch scripting, but expressed as channel wiring instead of sleep delays.

**Minute 4:00 — The "It's Smaller" Realization**
Carlos notices the Scout has only 2 hook slots. He wants to add a third hook (ON_ALLY_DAMAGED → send on "help" channel). No room. In Bitburner, he'd split scripts across servers to free up RAM. Here, he can't add more hook slots to the Scout — it's a fixed hardware limit. But he can build a Relay that listens to the Scout's existing hooks and reprocesses the information. The Relay IS the "additional server" from Bitburner, but it's a unit on the battlefield with its own position, its own context window, its own vulnerability to attack. The "more servers = more capacity" pattern translates, but with physical-spatial consequences.

**Minute 6:00 — The Missing RAM Upgrade**
He asks himself: "Can I upgrade the Scout's context window?" No. In Bitburner, home RAM upgrades are the first purchase priority. Here, the 6-slot limit is permanent. This feels constraining at first — but then he realizes the constraint IS the game. In Bitburner, eventually you have so much RAM that constraints vanish. Here, the Scout will always have 6 slots. The game is about designing information flow that works within that limit, not about outgrowing it. He starts thinking about which listen toggles to disable — TERRAIN off, ALLY_POSITION off for Strikers — to keep the critical channels clear. This is dependency pruning, the same instinct as splitting Bitburner scripts, but expressed as filter configuration.

**What Carlos learned:** Robot Uprising translates Bitburner's programming concepts into visual configuration. The context window IS RAM, hooks ARE batch coordination, Relays ARE additional servers. But the fixed slot limits and runtime dynamics create a different kind of challenge — one where constraints never go away.

---

### Journey: Dr. Liang, 48, Distributed Systems Professor

**Context:** Dr. Liang uses Bitburner in her "Introduction to Distributed Computing" course. Students implement batch scripts to learn about coordination, timing, and resource management. She's evaluating Robot Uprising as a potential teaching tool for the same concepts.

**Minute 0:00 — The Syllabus Mapping**
Dr. Liang opens the game's documentation. She immediately maps Robot Uprising's vocabulary to her course:

- **Context window** → process memory / cache hierarchy
- **Eviction policy** → cache replacement algorithms (LRU, LFU, FIFO)
- **Signal latency (1 tick per hop)** → network propagation delay
- **Context overload / stun** → buffer overflow → process crash / garbage collection pause
- **Listen/ignore filters** → firewall rules / subscription filtering
- **Hook channels** → message queues / pub-sub topics
- **EM emissions** → side-channel information leakage

She's thrilled. Every concept maps. But then she notices something Bitburner lacks: the **eviction policy as a player choice**. In Bitburner, when RAM is exceeded, the script simply doesn't run — there's no "which function do I drop?" decision. In Robot Uprising, the player explicitly chooses an eviction policy, sees it execute during battle, and diagnoses whether it was the right choice in the Inspector. This is a direct implementation of cache replacement policy that students can configure, observe, and evaluate.

**Minute 2:00 — The Pedagogical Advantage**
She compares the feedback loops:

- **Bitburner:** Student deploys a script → RAM error → reads error message → refactors code → deploys again. The feedback is instant and textual. Fast iteration but no *observation* of the constraint in action.
- **Robot Uprising:** Student configures context window → Executes → Watches buffer fill during sealed watch → Sees overload happen → Enters Inspector → Traces which entry was evicted at which tick → Adjusts eviction policy → Re-executes.

The Robot Uprising loop is slower but includes something Bitburner can't provide: a **visual replay of the constraint operating in real-time**. Students don't just see "error: not enough RAM." They watch the cache fill entry by entry, see the eviction algorithm choose which entry to drop, and trace the downstream consequence of that choice. This is worth 10 lectures on cache replacement algorithms.

**Minute 4:00 — The Static vs. Dynamic Teaching Moment**
She designs a teaching comparison for her class:

"Today's assignment: configure a Scout with 6 context slots to survive a battle with 3 enemies that appear at different ticks. Try three eviction policies: OLDEST_FIRST (FIFO), BY_PRIORITY (manual priority assignment), and BY_TYPE (prefer keeping enemy observations). For each policy, use the Inspector to identify: (1) which entries were evicted, (2) whether the evicted entries were needed by any rule, and (3) whether the eviction caused a wrong decision."

This assignment is impossible in Bitburner. There's no equivalent of "try three garbage collection strategies and observe which one produces better cache hit rates in this specific workload." Bitburner's RAM is a gate, not a policy.

**Minute 6:00 — The Limitation She Notes**
Dr. Liang writes in her evaluation: "Robot Uprising's context window teaches cache management and eviction policies better than Bitburner teaches RAM management. However, Bitburner teaches *software architecture* — module boundaries, dependency management, code splitting — concepts that Robot Uprising's visual workbench abstracts away. The ideal curriculum uses both: Bitburner for code-level resource management, Robot Uprising for runtime information management."

**What Dr. Liang concluded:** Static constraints (Bitburner) teach build-time architecture. Dynamic constraints (Robot Uprising) teach runtime behavior. Both are real engineering skills. The visual diagnostic tools (Inspector, context history, eviction replay) make Robot Uprising's version dramatically more observable.

---

## Strengths and Weaknesses

### Strengths of Dynamic Constraints (Robot Uprising's Approach)

1. **Runtime drama** — the constraint creates narrative arcs within battles, not just binary pass/fail at deploy time
2. **Eviction as design space** — the player's choice of eviction policy is itself a strategic decision with no Bitburner equivalent
3. **Observable constraint** — the Inspector shows exactly how the context window behaved, making the constraint learnable through observation rather than just error messages
4. **Information warfare** — dynamic constraints can be attacked by enemies, creating an entire dimension of gameplay
5. **Maintained tension** — fixed slot counts mean the constraint never goes away, unlike Bitburner where eventually RAM is abundant

### Weaknesses of Dynamic Constraints

1. **Delayed feedback** — minutes between configuration and diagnosis, vs. Bitburner's instant deploy-time error
2. **Emergent opacity** — actual buffer behavior depends on runtime conditions the player can't fully predict
3. **Configuration complexity** — eviction policies, listen/ignore filters, and priority settings create many interacting knobs (high skill ceiling but also high confusion floor)
4. **Harder to explain** — "your script doesn't fit in RAM" is immediately comprehensible; "your context window filled at tick 23 because two signals arrived simultaneously while your eviction policy dropped the entry your rule needed" requires the Inspector to understand

---

## Interaction Effects

### × Building Blocks (Wave 3)
The context window configuration IS a building block. Listen/ignore filters are the player's tool for pre-emptive RAM management — deciding which "function imports" to include at design time. Eviction priority is a runtime optimization tool that has no Bitburner parallel. The building block paradigm (loadout-style blueprint editor) must make these context config settings feel as tactile as toggling skills and wiring hooks — not buried in an "advanced settings" submenu.

### × Onboarding (Wave 5)
Bitburner's RAM is intuitive because it's binary: fits or doesn't. Robot Uprising's dynamic context window requires understanding fill rates, eviction, and overload — concepts that take multiple missions to teach. The boot log tutorial must introduce the context window gradually: Mission 1 (context shows observations, simple), Mission 2 (context can fill up — stun introduced), Mission 3 (eviction policies introduced as a choice), Mission 4 (listen/ignore filters to manage demand).

### × Inspector (Wave 4)
The Inspector is Robot Uprising's answer to Bitburner's biggest weakness (no visual debugging). The context window history — showing every slot, every tick, every fill and eviction event — is the tool that makes dynamic constraints learnable. Without the Inspector, the context window would be an opaque runtime box. With it, every overload becomes a diagnosis opportunity. The Inspector transforms the weakness of delayed feedback into the strength of deep diagnostic engagement.

### × Competitive (Multiplayer)
Bitburner's RAM is a private, build-time constraint. Robot Uprising's context window is a runtime vulnerability visible to opponents — EM emissions reveal hook activity, and enemy noise attacks can trigger overload. In PvP, the opponent who understands context window dynamics can design attacks that specifically exploit buffer pressure. This is a design dimension Bitburner's static constraints can't express.

### × Campaign Progression (Wave 6)
Bitburner's RAM grows (server upgrades), loosening the constraint over time. Robot Uprising's context window stays fixed but environmental demand grows, tightening the effective constraint. The campaign must calibrate this tightening curve carefully — the player needs to feel that their growing skill (better filters, better eviction policies, better relay architectures) outpaces the growing environmental complexity. If the tightening outpaces the skill growth, the game becomes frustrating. If skill growth outpaces too quickly, the game becomes trivial.

---

## Comparable Games and Media

| Game | Resource System | Static/Dynamic | Parallel |
|------|----------------|----------------|----------|
| **Bitburner** | RAM (AST-parsed per script) | Static | Direct ancestor. Build-time budget, binary failure. |
| **Factorio** | Circuit network signals (fixed bandwidth per wire) | Semi-static | Circuits have a per-tick signal limit. Exceeding it causes undefined behavior. More dynamic than RAM but less dramatic than context overload. |
| **Screeps** | CPU time (100ms/tick bucket) | Dynamic | Runtime constraint with rollover. Exceeding bucket causes script suspension. Closer to context overload but measured in time, not information. |
| **Into the Breach** | Action points (1 per unit per turn) | Static | Binary constraint. No eviction, no overflow. But creates the same "what do I do with limited capacity" tension. |
| **Oxygen Not Included** | Duplicant schedule priority slots | Semi-dynamic | Fixed time slots, dynamic tasks competing for them. Eviction equivalent: lower-priority tasks simply don't get done. |
| **Dwarf Fortress** | Dwarf attention / task queue | Dynamic | Emergent constraint. Dwarves pick tasks from a global queue with priorities. "Tantrum spiral" is an emergent overload mechanic. |
| **Real LLM systems** | Context window (token limit) | Dynamic | The direct real-world analog. Token eviction, RAG as external memory, context compression — all Robot Uprising mechanics in production AI. |

---

## Sensory Description

### Bitburner RAM: The Cold Compile

Deploying a script in Bitburner looks like typing `run batcher.js` into a terminal. If it works, green text scrolls: `Running batcher.js with 8 threads.` If it fails, red text: `Error: insufficient RAM. Required: 14.4 GB. Available: 12.8 GB.` The sound is your keyboard clicking. The feeling is: did I get the math right? The emotional texture is a crossword puzzle — satisfying when it clicks, mildly frustrating when it doesn't, but always cerebral and quiet.

### Robot Uprising Context Window: The Living Constraint

During the sealed watch, the context bars on each unit glow cool blue at half capacity. Slot by slot, horizontal lines illuminate as information fills the window — each line a different hue (green for observations, blue for signals, amber for processed data). At 75% capacity, the bar shifts to amber. At 100%, it pulses red. When an eviction happens, one line fades out while a new one snaps in — a shuffle, a flicker, a tiny moment of violence in the data. When overload hits, the entire unit sprite jitters, sparks fly from the chassis, a discordant buzz-crackle sounds, and the context bar flashes white. The unit freezes for one tick — a full second of helplessness. Other units continue operating around it. The overloaded unit stands still, sparking, while the battle moves on.

The sound vocabulary: a soft ascending *ding* when a new entry arrives cleanly. A shuffling *click* when eviction swaps entries. A sharp *bzzt-crackle* on overload. The unit's ambient hum drops in pitch during overload — a mechanical groan of a system that hit its limit.

---

## The TikTok Clip

**The Bitburner version:** A terminal showing `Error: insufficient RAM` repeatedly while the player trims functions from a script, counting down GB by GB until finally: `Running. 25 threads.` Caption: "RAM optimization speedrun."

**The Robot Uprising version:** Split-screen. Left: a Scout's context bar climbing toward full during sealed watch, slot by slot, blue → amber → red → OVERLOAD → spark → stun → enemy approaches → Scout can't move → eliminated. Right: same battle but with a tighter listen config — the Scout ignores terrain, stays at 4/6 slots, sees the enemy, evades cleanly. Caption: "Less information, better decisions." The 15-second clip teaches the game's core thesis: **attention management beats information hoarding.**
