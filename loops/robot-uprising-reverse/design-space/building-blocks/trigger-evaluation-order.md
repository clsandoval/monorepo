# 3.08d — Trigger Evaluation Order: Simultaneous vs. Sequential Hook Resolution Within a Single Tick

**Aspect:** 3.08d — Trigger evaluation order within a single tick: simultaneous vs. sequential evaluation when multiple hooks match; can one hook's firing affect another hook's trigger?
**Wave:** 3 (Building Blocks)
**Category:** Hook Mechanics / Evaluation Semantics
**Dependencies:** 3.08 (hook taxonomy — defines trigger events), 3.09 (hook chaining — determines whether hooks can trigger other hooks), 3.09a (blocking hook semantics — BLOCKED state interacts with evaluation), 2.01 (fixed-slot buffer model — buffer state is a trigger condition), 3.08c (hook slot economy — slot ordering may determine evaluation order)
**Related:** 3.05 (rules language — rules also have an evaluation order question), 1.04d (blocking vs. queued hook semantics), 4.13 (signal latency visualization), 4.04a (debrief as debugger — the Inspector must render evaluation traces)

---

## The Design Question

A Relay unit sits at a crossroads. It has 4 hook slots:

- Slot 1: `ON_RECEIVE [recon-net] -> SEND compressed ON alert-net`
- Slot 2: `ON_RECEIVE [command-net] -> SEND reassignment ON squad-net`
- Slot 3: `ON_BUFFER [full] -> SEND overflow-warning ON diagnostic`
- Slot 4: `ON_IDLE -> SEND heartbeat ON status-net`

Tick 14 arrives. A recon signal lands in the buffer from `recon-net`. A command signal lands in the buffer from `command-net`. Both arrivals push the buffer to capacity. The Relay has no pending skill execution, so it is technically idle at evaluation start.

**Four hooks match simultaneously.** Slot 1 matches (signal on recon-net). Slot 2 matches (signal on command-net). Slot 3 matches (buffer now full). Slot 4 matches (unit was idle at tick start).

What happens?

This is not a corner case. Any Relay with 3-4 hooks will encounter multi-match ticks regularly in mid-campaign missions. The evaluation semantics determine whether the player's hook ordering is a meaningful design choice or cosmetic decoration. The answer shapes three things:

1. **Whether slot position matters.** If hooks evaluate sequentially top-to-bottom, slot 1 fires before slot 4. If simultaneously, they all fire "at once." Slot ordering becomes either a core strategic lever or irrelevant.
2. **Whether hooks can interfere with each other.** If Slot 1 fires and consumes the recon signal from the buffer, does the buffer drop below full? If so, Slot 3's `ON_BUFFER [full]` condition is no longer true by the time it evaluates. One hook's side effect invalidated another hook's trigger.
3. **Whether the system is snapshot-based or mutation-based.** Does every hook evaluate against the state at tick start (snapshot), or does each hook evaluate against the state as modified by previously-fired hooks (mutation)?

This is the fundamental question of evaluation semantics in any reactive system. Verilog simulators face it (blocking vs. non-blocking assignments). Spreadsheet engines face it (circular reference resolution). Database triggers face it (BEFORE vs. AFTER, statement-level vs. row-level). Game rule engines face it (Magic: The Gathering's state-based actions vs. triggered abilities). The answer determines whether the system is predictable, expressive, or both — and how much the player needs to understand to use hooks effectively.

---

## The Four Approaches

### Approach A: Snapshot Evaluation ("The Freeze Frame")

**Philosophy:** At the start of each tick, the game engine takes a snapshot of the unit's complete state — buffer contents, buffer fullness, idle status, perception data, everything. ALL hooks evaluate against this frozen snapshot. Every hook that matches fires. No hook's firing can affect another hook's trigger, because triggers read from the snapshot, not from live state.

**Mechanical rules:**
- At tick start: capture snapshot of unit state (buffer contents, buffer count, idle flag, perception results, skill status)
- Evaluate all hook triggers against the snapshot simultaneously
- Collect the set of all matching hooks
- ALL matching hooks fire, in slot order (top to bottom), but their TRIGGERS were evaluated against the same frozen state
- Side effects of firing (buffer changes, signal emissions, EM noise) apply to the LIVE state, not the snapshot
- Live state becomes the starting state for rule evaluation later in the tick

**What it feels like:** The player opens the Inspector at tick 14. They click the Relay. The evaluation trace shows:

```
TICK 14 — SNAPSHOT CAPTURED
  buffer: [recon-signal, cmd-signal, old-data, old-data-2] (4/4 = FULL)
  idle: true
  
HOOK EVALUATION (against snapshot):
  Slot 1: ON_RECEIVE [recon-net] → MATCH (recon-signal present)
  Slot 2: ON_RECEIVE [command-net] → MATCH (cmd-signal present)
  Slot 3: ON_BUFFER [full] → MATCH (4/4)
  Slot 4: ON_IDLE → MATCH (idle = true)
  
RESULT: 4 hooks fire
```

All four hooks fire. The buffer was full at snapshot time, so the overflow warning fires — even though the act of processing the recon and command signals might logically "consume" buffer slots. The unit was idle at snapshot time, so the heartbeat fires — even though firing 3 other hooks means it is clearly "doing something." The snapshot freezes the evaluation moment.

**The name:** Players call this "The Freeze Frame" — the game pauses reality, examines every hook against the paused state, decides what fires, then unpauses and lets everything happen.

**Strengths:**
- **Completely deterministic and order-independent.** It doesn't matter if the engine evaluates Slot 1 first or Slot 4 first — the result is identical, because all triggers read from the same snapshot. No hidden ordering dependency. No "my hook didn't fire because slot 2 ate the buffer slot first" surprises.
- **Maximum expressiveness.** Every matching hook fires. The player gets the full output of their design. If they wired 4 hooks and all 4 conditions are true, they get 4 signals. No wasted hooks.
- **Easy to explain.** "All your hooks check at the same time. If the condition is true when the tick starts, it fires." One sentence. Done.
- **Perfect for the Inspector.** The snapshot is a discrete, inspectable object. The player can see exactly what the game saw when it evaluated hooks. No hidden intermediate states.

**Weaknesses:**
- **Can produce logically impossible states.** The unit fires an `ON_IDLE` heartbeat AND processes 3 signals in the same tick. Was it idle? It was idle at the snapshot moment, but its behavior this tick is anything but idle. Players with programming intuitions will feel this is "wrong" — the heartbeat should not fire when the unit is busy.
- **Buffer overflow paradox.** If all 4 hooks fire and each emits a signal, that's 4 outgoing signals in one tick. If any of those signals target this unit's own buffer (unlikely but possible in feedback architectures), the buffer state diverges wildly from the snapshot. The snapshot said "full" — but after hook resolution, the buffer might be empty (if hooks consumed signals) or overflowing (if hooks deposited new ones).
- **No priority possible.** The player cannot express "fire the command hook INSTEAD of the recon hook." All matching hooks fire. There is no suppression, no priority, no mutual exclusion. If the player wants only one hook to fire per tick, they must design non-overlapping trigger conditions — which is hard when `ON_IDLE` matches any tick where the unit has no pending action.
- **Burst noise problem.** 4 hooks firing in one tick = 4 EM emissions. A Relay at a busy crossroads will emit a wall of noise every tick. Enemies with EM detection will lock onto it instantly. The Relay's utility as a communication hub makes it the loudest unit on the field — a contradiction with stealth architectures.

**Comparable systems:**
- **Verilog non-blocking assignments.** All `<=` assignments read from the current state and write to the next state. No assignment sees another assignment's result within the same timestep. Hardware designers rely on this for determinism.
- **Spreadsheet recalculation (non-circular).** When you change a cell, all dependent formulas recalculate against the new value simultaneously. No formula sees another formula's intermediate result.
- **Unity's `FixedUpdate`.** All physics updates evaluate against the state at the start of the physics step. Collision detection happens against the snapshot, not against partially-moved objects.

---

### Approach B: Sequential Mutation ("The Domino Stack")

**Philosophy:** Hooks evaluate one at a time, top to bottom, in slot order. Each hook that fires immediately mutates the unit's live state. Subsequent hooks evaluate against the mutated state. One hook's firing can invalidate — or newly satisfy — another hook's trigger.

**Mechanical rules:**
- At tick start: no snapshot captured
- Evaluate Slot 1 trigger against current live state. If match → fire, apply side effects to live state.
- Evaluate Slot 2 trigger against current live state (which may have been mutated by Slot 1). If match → fire, apply side effects.
- Continue through all slots in order.
- Slot order IS evaluation order. The player controls it by dragging hooks up and down in the workbench.

**What it feels like:** Same Relay, same tick 14. But now the evaluation trace looks different:

```
TICK 14 — SEQUENTIAL EVALUATION

Slot 1: ON_RECEIVE [recon-net] → MATCH
  ACTION: compress recon-signal, emit on alert-net
  SIDE EFFECT: recon-signal consumed from buffer → buffer now 3/4
  
Slot 2: ON_RECEIVE [command-net] → MATCH
  ACTION: emit reassignment on squad-net
  SIDE EFFECT: cmd-signal consumed from buffer → buffer now 2/4
  
Slot 3: ON_BUFFER [full] → NO MATCH (buffer is 2/4, not full)
  SKIPPED
  
Slot 4: ON_IDLE → NO MATCH (unit already acted this tick)
  SKIPPED
```

Only 2 hooks fire instead of 4. Slot 1 consumed a buffer slot, dropping fullness below the threshold. Slot 2 consumed another. By the time Slot 3 evaluates, the buffer is half-empty — the overflow warning never fires. By the time Slot 4 evaluates, the unit has already fired two hooks — it is not idle. The heartbeat never fires.

The player's slot ordering determined the outcome. If they had placed the `ON_BUFFER [full]` hook in Slot 1, it would have fired first (while the buffer was still full), and the overflow warning would have gone out. **Slot order is strategy.**

**The name:** "The Domino Stack" — each hook falls and changes the landscape for the next one. The order you stack them determines which dominoes fall.

**Strengths:**
- **Slot order is a meaningful design decision.** The player drags hooks up and down in the workbench, and the order matters. This creates a new strategic dimension: "Which hook should fire first?" For the Relay above, placing `ON_BUFFER [full]` in Slot 1 guarantees the overflow warning fires before anything consumes buffer space. This is a real choice with real consequences.
- **Logically consistent state.** The unit never fires an `ON_IDLE` heartbeat in a tick where it is clearly doing things. The unit never fires a buffer-full warning when the buffer ends up half-empty. Each hook's firing reflects the unit's actual state at the moment of evaluation.
- **Natural priority system.** Higher slots have implicit priority — they evaluate first, and their side effects can suppress lower slots. The player expresses "command signals are more important than recon" by putting the command hook in Slot 1. No explicit priority number needed. The UI IS the priority.
- **Teaches imperative programming.** Sequential evaluation with mutation is how most imperative code works. Variable assignment, if/else chains, early returns. Players absorb this mental model naturally. A Relay's hook stack reads like a function: "First check for commands. Then check for recon. Then check if overloaded. Then send heartbeat if nothing happened."
- **Fewer emissions per tick.** Later hooks that don't match due to state mutation don't fire and don't emit EM noise. A Relay that processes one signal and suppresses its heartbeat emits 1 signal instead of 4. Quieter architectures emerge naturally from proper ordering.

**Weaknesses:**
- **Hidden ordering dependency.** Two players wire the exact same 4 hooks to the exact same channels. One puts `ON_BUFFER [full]` in Slot 1, the other puts it in Slot 3. Radically different behavior. During sealed watch, they see different outcomes. During competitive play, slot ordering becomes an invisible meta-skill that separates experts from novices — but the game never explicitly teaches "order your hooks carefully." Players discover it by accident when their overflow warning "randomly" stops working after they rearranged their hooks.
- **The Inspector must show mutation traces.** The debrief can't just show "these hooks matched" — it needs to show the state before each evaluation, the mutation after each firing, and why each subsequent hook did or didn't match. This is a more complex visualization than the snapshot model.
- **Fragile to hook rearrangement.** The player adds a new hook in Slot 2, pushing everything down. Suddenly their entire network behaves differently because every hook below Slot 2 now evaluates in a different state context. Moving one hook can cascade behavioral changes across the entire unit's logic. This is realistic (code insertion changes program behavior) but frustrating for players who think of hooks as independent modules.
- **`ON_IDLE` becomes nearly useless.** In sequential evaluation, any hook that fires before `ON_IDLE` makes the unit "not idle." If `ON_IDLE` is in the last slot (which is natural — it's the fallback behavior), it only fires when NO other hook matches. This effectively turns `ON_IDLE` into a "default" hook rather than a "heartbeat" hook. This might be the right semantics, but it differs from the snapshot model where `ON_IDLE` fires based on the unit's state at tick start.

**Comparable systems:**
- **CSS cascade.** Rules apply top-to-bottom. Later rules override earlier rules. The order of your stylesheet IS the priority system. Developers learn this the hard way when they rearrange `@import` statements and their entire layout breaks.
- **iptables / firewall rules.** Packets are evaluated against rules sequentially. The first matching rule wins. Rule ordering IS the security policy. Sysadmins who get the order wrong create security holes. The same "ordering is invisible strategy" dynamic.
- **Gladiabots behavior trees.** Rules evaluate top-to-bottom. The first matching rule executes. Lower rules are skipped. Gladiabots players spend significant time optimizing rule order — it is a primary skill in the game.

---

### Approach C: Snapshot Triggers, Sequential Execution ("The Ballot Box")

**Philosophy:** A hybrid. Trigger evaluation uses a snapshot (all hooks check against the same frozen state). But hook EXECUTION is sequential — hooks fire in slot order, and each firing's side effects accumulate. The difference from Approach A: all matching hooks are identified simultaneously, but they execute one at a time, and later hooks CAN be suppressed if earlier hooks' side effects make execution invalid or redundant.

**Mechanical rules:**
- At tick start: capture snapshot
- Evaluate all hook triggers against snapshot → produce a "match set" of hooks
- Execute hooks in the match set sequentially (slot order, top to bottom)
- Before each execution: check a lightweight "still valid?" condition against live state
  - For `ON_RECEIVE`: is the signal still in buffer? (an earlier hook might have consumed it)
  - For `ON_BUFFER [full]`: is buffer still full?
  - For `ON_IDLE`: has any hook already fired this tick?
- If "still valid?" fails → hook is SUPPRESSED (logged but not fired)
- If "still valid?" passes → hook fires, side effects apply to live state

**What it feels like:**

```
TICK 14 — BALLOT BOX EVALUATION

SNAPSHOT: buffer full, idle, recon + cmd signals present
MATCH SET: [Slot 1, Slot 2, Slot 3, Slot 4] — all matched

EXECUTION PHASE:
  Slot 1: still valid? YES (recon-signal present) → FIRE
    Side effect: buffer 3/4
  Slot 2: still valid? YES (cmd-signal present) → FIRE
    Side effect: buffer 2/4
  Slot 3: still valid? NO (buffer 2/4, not full) → SUPPRESSED
    Inspector note: "Matched at snapshot, suppressed: buffer no longer full"
  Slot 4: still valid? NO (unit already acted) → SUPPRESSED
    Inspector note: "Matched at snapshot, suppressed: unit no longer idle"
```

The player sees that Slots 3 and 4 WOULD have fired — they matched at snapshot time — but were suppressed because earlier hooks changed the world. The Inspector shows this explicitly: matched hooks appear in a green list, suppressed hooks appear in an amber list with a one-line explanation. The player can see the difference between "never matched" (grey) and "matched but suppressed" (amber).

**The name:** "The Ballot Box" — every hook casts a vote at the same time (snapshot matching), but votes are counted one at a time (sequential execution), and some votes are invalidated during the count.

**Strengths:**
- **Best of both worlds for the Inspector.** The snapshot captures "what could have fired." The sequential execution captures "what actually fired and why." The suppression log bridges the gap. This produces the richest debrief data — the player sees both the potential and the actual.
- **Slot order matters, but transparently.** Suppressed hooks are visible and explained. The player doesn't have to guess why Slot 3 didn't fire — the Inspector tells them "buffer was full at tick start, but Slot 1 consumed a signal before Slot 3 could execute." This teaches ordering through explicit feedback rather than silent failure.
- **No logically impossible states.** Unlike pure snapshot (Approach A), a hook can't fire on a condition that is no longer true at execution time. The buffer-full warning doesn't fire when the buffer is half-empty. The idle heartbeat doesn't fire when the unit is busy.
- **Matched-but-suppressed is a diagnostic signal.** If a hook repeatedly shows as "matched but suppressed" in the Inspector, the player knows: "This hook's trigger is real, but something higher in the stack keeps invalidating it." This is actionable — move it up in slot order, or redesign the trigger to be more specific.
- **Gradual teaching opportunity.** The game can introduce this model in two stages. Mission 3-5: only 1-2 hooks per unit, multi-match is rare, snapshot and sequential produce identical results. Mission 6+: 3-4 hooks, multi-match begins, the suppression mechanic teaches itself through Inspector logs.

**Weaknesses:**
- **Two-phase evaluation is harder to explain.** "All hooks check at the same time, then they fire one at a time, and some get canceled" is a longer sentence than "all fire" (snapshot) or "one at a time" (sequential). The tutorial needs a metaphor. The ballot box metaphor works — but it's an extra concept.
- **The "still valid?" check is a hidden rule per trigger type.** What does "still valid?" mean for `ON_OBSERVE`? For `ON_THREAT`? For `ON_SKILL`? Each trigger type needs its own validity check, and the player can't see the rules unless they read the codex. The system has more hidden complexity than either pure model.
- **Suppression order is still slot-dependent.** The player who puts `ON_BUFFER [full]` in Slot 1 gets the overflow warning and suppresses nothing (buffer starts full, warning fires, buffer is still full after — no, wait: the warning fires but doesn't consume buffer data, so it doesn't change buffer fullness). The interaction between "which hooks have side effects on shared state" and "which hooks' validity checks read shared state" is a complex dependency graph that the player must internalize.

**Comparable systems:**
- **Database BEFORE triggers.** All triggers that match the condition are identified, then executed in a defined order, and each can see the effects of previous triggers. A BEFORE UPDATE trigger on row X fires in order of trigger creation time; each trigger's changes are visible to subsequent triggers.
- **Magic: The Gathering state-based actions.** After a spell resolves, ALL state-based actions are checked simultaneously (snapshot). Then they are processed (execution). Then triggered abilities from those state-based actions go on the stack in APNAP order (sequential). The two-phase model is exactly the Ballot Box.

---

### Approach D: All-Fire with Conflict Resolution ("The Parliament")

**Philosophy:** All matching hooks fire unconditionally (snapshot-style), but when multiple hooks produce conflicting actions (e.g., two hooks trying to send on the same channel, or total EM emission exceeding a threshold), a conflict resolution layer arbitrates. The player designs the resolution rules as part of the unit's configuration.

**Mechanical rules:**
- At tick start: capture snapshot
- All matching hooks fire unconditionally — no suppression
- Collect all fired hooks' intended actions into a "pending actions" queue
- **Conflict detection:** check for conflicts:
  - Two hooks sending on the same outgoing channel → conflict
  - Total EM emission exceeds unit's noise budget → conflict
  - Total buffer consumption exceeds available slots → conflict
- **Resolution:** The player configures a resolution policy per unit:
  - **Priority (default):** higher slot wins, lower slot's action is dropped
  - **Merge:** signals on the same channel are combined into one composite signal
  - **Throttle:** only the first N actions execute, rest are queued for next tick
- Non-conflicting actions execute normally

**What it feels like:** The player opens the Relay's unit config. Below the hook slots, a small panel labeled "Conflict Policy" shows three radio buttons: Priority, Merge, Throttle. The player selects "Priority." Now when all 4 hooks fire and Slots 1 and 2 both want to send on outgoing channels while the EM budget is tight, Slot 1 wins. The player sees the resolution in the Inspector: "Slot 2 action deferred: EM budget exceeded. Slot 1 took priority."

**The name:** "The Parliament" — every hook has a voice, every hook speaks, but when they disagree, parliamentary procedure decides who is heard.

**Strengths:**
- **Every hook always evaluates.** No suppression, no ordering dependency on trigger evaluation. The player's hooks are all "alive" every tick. This feels fair — you wired 4 hooks, all 4 are considered.
- **Conflict resolution is an explicit, visible mechanic.** The player chooses their policy. They can see it in the workbench. They can change it. The resolution rules are not hidden — they are a first-class design decision.
- **Merge policy enables signal compression.** Two hooks that both want to send on `alert-net` can have their signals combined. This is mechanically interesting — the merge produces a richer signal than either individual hook. Players who discover merge behavior can build units that synthesize information from multiple triggers into a single compound message.
- **Natural for Command units.** A Command unit with 6 hooks receiving from 6 subordinates needs all 6 hooks to fire every tick. Suppression would lose data. Parliament ensures all inputs are heard, and the conflict policy determines how the Command unit's outgoing orders synthesize the inputs.

**Weaknesses:**
- **Highest complexity.** The player now manages hooks, slot order, AND a conflict resolution policy. The workbench needs more UI. The tutorial needs more explanation. The Inspector needs to show conflict detection and resolution traces. Every layer adds cognitive load.
- **Merge semantics are deep.** What does it mean to "merge" two signals? If one says "enemy at (3,4)" and another says "retreat to (7,7)", what's the merged signal? The merge function needs to be defined per signal type, or it becomes a blunt "latest wins" rule disguised as something smarter.
- **Conflict detection rules are implicit.** "Two hooks sending on the same channel" is a clear conflict. But what about two hooks consuming from the same buffer slot? Or two hooks that both toggle a mode flag? The boundary between "conflict" and "sequential side effect" is blurry.
- **Competitive play becomes policy optimization.** Expert players will min-max conflict policies the way card game players min-max deck ratios. The meta shifts toward "which policy works best for Relays in open terrain" rather than "how should I wire my communication network." The game's focus drifts from architecture design to parameter tuning.

**Comparable systems:**
- **Linux process scheduling.** All runnable processes "want" CPU time. The scheduler's policy (CFS, FIFO, Round-Robin) determines who runs. The user configures nice values and scheduling classes. Same structure: everyone fires, policy arbitrates.
- **Redstone (with comparators).** Multiple redstone signals feeding into the same wire produce conflicts. Comparators and repeaters resolve signal strength. The player builds resolution circuits.

---

## Player Journeys

### Journey 1: Mika, 14, First-Time Strategy Player — The Heartbeat That Wouldn't Stop

**Context:** Mika is on Mission 4. She's just unlocked a second hook slot on her Scout. She configures Slot 1 as `ON_OBSERVE [any] -> SEND sighting ON recon-net` and Slot 2 as `ON_IDLE -> SEND heartbeat ON status-net`. She expects: when the Scout sees something, it reports. When it sees nothing, it sends a heartbeat so the Relay knows it's alive.

**The system uses Approach A (Snapshot Evaluation).**

**Minute 0:00 — Deploy.** Mika places her Scout at the south edge. Relay on the rooftop. She hits EXECUTE. The sealed watch begins with a low electronic hum. The grid pulses with tick markers — faint vertical lines sweeping left to right across the 8x8 board like a slow radar sweep.

**Minute 0:30 — Tick 1-3, Patrol.** The Scout moves north along the left column. No enemies in sight. Each tick, two signal lines flash from the Scout: nothing on the recon wire (no observation), but a soft blue pulse on the status wire — the heartbeat. One signal per tick. The Relay's buffer indicator ticks up gently: one blue dot per tick. Mika nods. "It's alive."

**Minute 0:45 — Tick 4, Contact.** An enemy striker appears two tiles north. The Scout's perception radius lights up — a translucent cyan circle briefly flashes around the unit. Slot 1 fires: a bright green signal races along the recon wire toward the Relay. But here's the issue: the Scout also fires Slot 2. A blue heartbeat pulse races along the status wire simultaneously. Both signals arrive at the Relay. Two EM emissions ping outward from the Scout — concentric rings of faint static, expanding, fading.

Mika frowns. "Why did the heartbeat fire? It saw something — it's not idle."

**Minute 1:00 — Tick 5-8, The Noise.** Every tick, the Scout fires BOTH hooks. It observes the enemy (Slot 1 fires). It was idle at the start of the tick before observation (Slot 2 fires). Two signals per tick. Two EM emissions per tick. The enemy, drawn by the double emissions, triangulates the Scout's position. Tick 8: enemy striker closes distance. One-shot-one-kill. Scout down.

**Minute 1:15 — Debrief.** Mika enters the Inspector. She scrubs to tick 4. The evaluation trace shows:

```
SNAPSHOT: idle = true, perception = [enemy_striker at (3,5)]
Slot 1: ON_OBSERVE → MATCH → FIRED
Slot 2: ON_IDLE → MATCH → FIRED
```

The note reads: "Unit was idle at snapshot time. Both hooks evaluated against the same snapshot." Mika stares at this. She wanted ON_IDLE to mean "nothing is happening." But the snapshot captured the instant BEFORE the observation was processed. The Scout was technically idle when the engine checked.

**Minute 2:00 — The Fix.** Mika considers. She wants heartbeats ONLY when nothing is observed. Under snapshot evaluation, she can't suppress Slot 2 based on Slot 1's result. She needs to change her trigger. She replaces `ON_IDLE` with a more specific condition — perhaps a rule-based heartbeat instead of a hook. Or she accepts the noise cost and adjusts her Relay's filtering to ignore heartbeats when recon signals are present. She's learning: in a snapshot system, hooks are independent. If you want dependency, use rules.

**Under Approach B (Sequential Mutation), this problem doesn't exist.** Slot 1 fires first (the Scout observes), and Slot 2's `ON_IDLE` check sees a unit that already acted — no heartbeat. But Mika would never learn about the snapshot/mutation distinction. The heartbeat would "just work," silently.

**Under Approach C (Ballot Box), the heartbeat would match at snapshot but be suppressed at execution.** Mika would see "ON_IDLE: matched but suppressed — unit already acted." She'd understand both what her intent was and why the system overrode it.

---

### Journey 2: Dev, 25, Software Engineer — Slot Order as Architecture

**Context:** Dev is on Mission 8, building a Relay that serves as a signal router for three squads. He has 4 hook slots and needs them all. He's realized that under sequential mutation (Approach B), slot order IS priority. He's deliberately designing his hook stack.

**Minute 0:00 — The Workbench, Slot Ordering Session.** Dev's Relay has:
- `ON_RECEIVE [emergency-net]` — immediate relay to all squads (highest priority)
- `ON_RECEIVE [recon-net]` — compress and forward to command
- `ON_BUFFER [full]` — send overflow warning
- `ON_IDLE` — heartbeat

Dev drags the emergency hook to Slot 1. His reasoning: if an emergency signal arrives alongside a recon signal, the emergency must fire first. Under sequential mutation, emergency fires → consumes buffer → recon might still match if its signal is in buffer → fires too. But the emergency went out first. In a scenario where the Relay's outgoing channel can only carry one signal per tick (bandwidth constraint), Slot 1's emergency beats Slot 2's recon.

**Minute 1:30 — Deploy.** Dev places the Relay at a central rooftop. Three squads fan out in a triangle. The sealed watch begins. The Relay sits dark, a quiet hub with four hook wires extending to the squads like a spider's web. Each wire is a different color — red for emergency, green for recon, amber for diagnostic, blue for heartbeat.

**Minute 2:00 — Tick 6, The Storm.** All three squads make contact simultaneously. Emergency signals from Squad A and recon signals from Squads B and C arrive at the Relay in the same tick. The Relay's buffer fills from 1/4 to 4/4 in a single tick. Four signals in, four hooks potentially active.

The sequential evaluation begins. The Relay's chassis glows as each hook fires in sequence — a visible animation: a ring of light starts at the top of the unit sprite and sweeps downward, illuminating each hook slot's icon as it evaluates.

Slot 1: Emergency from Squad A. The red wire blazes. Emergency signal relayed to all squads. One buffer slot consumed. Buffer now 3/4.

Slot 2: Recon from Squad B. The green wire pulses. Compressed signal forwarded to command. Another slot consumed. Buffer now 2/4.

Slot 3: ON_BUFFER [full]. The light reaches the third icon... and dims. The amber wire stays dark. The buffer was 4/4 at tick start but is now 2/4. The overflow warning doesn't fire.

Slot 4: ON_IDLE. The light reaches the fourth icon... and dims. Blue wire stays dark. The unit already fired twice.

**Minute 2:30 — Dev's Reaction.** "Exactly right." The emergency went out first. Recon was processed second. The overflow warning correctly suppressed — by the time Slot 3 checks, the Relay has already relieved the pressure by processing two signals. The heartbeat correctly suppressed — the unit is not idle.

But then Dev pauses. Squad C's recon signal is still sitting in the buffer, unprocessed. The Relay only has 4 hook slots. Slots 1 and 2 each consumed one incoming signal. But Squad C's signal didn't match any remaining hook's trigger (Slot 3 and 4 were suppressed). It will sit in the buffer until next tick, when the Relay's rules process it — adding 1 tick of latency.

Dev considers: should he add a second `ON_RECEIVE [recon-net]` hook? No — that would consume a slot. Instead, he redesigns: Slot 2 becomes `ON_RECEIVE [recon-net, emergency-net]` with a multi-channel trigger, processing ANY incoming signal in priority order. One hook, multiple channels. The slot economy forces architectural thinking.

**Minute 4:00 — Debrief Comparison.** Dev opens the Inspector and toggles between "Sequential" and "Snapshot" evaluation views (a diagnostic option in the settings menu). Under snapshot mode, ALL 4 hooks would have fired: emergency, recon, overflow warning, AND heartbeat. Four EM emissions. The Relay would have been the loudest unit on the board. Dev shakes his head: "Snapshot turns my Relay into a lighthouse."

---

### Journey 3: Sana, 32, Competitive Player — The Suppression Exploit

**Context:** Sana is in ranked play, Mission 12. She's discovered a non-obvious interaction under the Ballot Box model (Approach C). She's building a "dark Relay" — a unit that processes signals without emitting EM noise by exploiting suppression mechanics.

**Minute 0:00 — The Theory.** Sana's insight: in the Ballot Box model, suppressed hooks don't fire and don't emit EM noise. If she can design a hook stack where Slot 1 always fires (doing the real work) and Slot 1's side effects cause Slots 2-4 to be suppressed, her Relay emits only 1 EM pulse per tick instead of 4. The suppressed hooks are "silent" — they matched at snapshot but never executed.

Her Relay config:
- Slot 1: `ON_RECEIVE [any]` — process incoming signal, compress, forward on alert-net (consumes buffer, makes unit "not idle")
- Slot 2: `ON_IDLE` — sends a DECOY signal on a fake channel (this hook exists only to be suppressed — it never fires because Slot 1 always fires first)
- Slot 3: `ON_BUFFER [full]` — sends a DECOY signal on another fake channel (suppressed whenever Slot 1 consumes a buffer slot, dropping below full)
- Slot 4: `ON_RECEIVE [diagnostic]` — self-check (suppressed because the diagnostic signal is consumed by Slot 1's broad `[any]` filter first)

**Minute 1:00 — The Match.** Sana deploys against an opponent whose strategy relies on EM triangulation — detecting Relay positions through emission patterns. Her opponent's Scouts are configured to track high-emission sources.

Sana's Relay processes signals every tick. Slot 1 fires, producing 1 EM emission. Slots 2, 3, and 4 match at snapshot but are suppressed at execution. Zero additional emissions. Her Relay is 75% quieter than a naive Relay running the same 4 hooks under snapshot evaluation.

Her opponent's Scouts sweep the board. They detect her Scout (2 emissions per tick) and her Striker (1-2 emissions when engaging). But the Relay — the high-value target, the communication nexus — reads as a 1-emission source. The opponent mistakes it for a lone Scout. They don't target it.

**Minute 3:00 — The Pivot.** Tick 18: Sana's Scout goes down. No more incoming recon signals. The Relay's buffer drains. Slot 1 has nothing to process. It doesn't fire. Suddenly, Slot 2 (`ON_IDLE`) is no longer suppressed — the unit IS idle. It fires. Slot 3 (`ON_BUFFER [full]`) doesn't match (buffer is nearly empty). But the decoy signal from Slot 2 emits on the fake channel — 1 EM pulse. The Relay's emission pattern shifts from "1 real signal per tick" to "1 decoy signal per tick." The EM signature looks identical to the opponent.

But Sana designed this. The decoy channel is named `heartbeat-echo`. Her remaining units know to ignore it. The opponent's units, scanning for channel activity, detect the emission and categorize it as a live unit — sending their forces toward the "active" Relay while Sana's Striker flanks from the other side.

**Minute 4:00 — Post-Match Analysis.** Sana shares her config on the community forum. Title: "Dark Relay — Suppression-Stacked EM Reduction." The thread explodes. Players who hadn't considered suppression as a stealth mechanic begin experimenting. A counter-strategy emerges within a week: Scouts configured to detect suppression PATTERNS — units that consistently emit exactly 1 signal per tick are suspiciously quiet. The meta evolves.

---

## Interaction Effects

### With 3.09 — Hook Chaining
If hooks can trigger other hooks (same-tick chaining), evaluation order becomes exponentially more important. Under sequential mutation, Slot 1 fires, triggers a cascade on the receiving unit, the cascade resolves, THEN Slot 2 evaluates. The cascade result (signals sent, buffer changes on remote units) is fully resolved before the next local hook checks. Under snapshot evaluation, all hooks fire simultaneously, and all cascades interleave — requiring a global cascade resolution order across ALL units, not just local slot order.

### With 3.08c — Hook Slot Economy
If slot order determines priority (sequential/ballot box models), the hook slot economy gains a new dimension. Players must allocate not just WHAT goes in each slot, but WHICH POSITION. A 2-slot Scout has less priority expressiveness than a 6-slot Command. This reinforces unit differentiation — Command units don't just have more hooks, they have more PRIORITY LEVELS.

### With 2.01 — Fixed-Slot Buffer Model
Buffer state is both a trigger condition (ON_BUFFER [full]) and a side effect target (hooks that consume signals reduce buffer count). Evaluation order directly determines how these interact. In snapshot mode, buffer triggers fire based on tick-start state regardless of consumption. In sequential mode, consumption changes the state mid-evaluation. This makes the buffer model inseparable from evaluation semantics.

### With 1.04d — Blocking Hook Semantics
A blocked hook occupies its slot. Under sequential evaluation, if Slot 1 is BLOCKED (from a previous tick), does the sequential evaluator skip it and proceed to Slot 2? Or does the block prevent ALL subsequent slots from evaluating? If the latter, a single blocked hook shuts down the entire evaluation pipeline — making blocking even more dangerous than the 3.09a analysis suggests.

### With 4.04a — Inspector / Debrief
Each approach produces different Inspector data. Snapshot: show the snapshot and the full fire set. Sequential: show the mutation trace. Ballot Box: show match set, execution trace, and suppression log. Parliament: show match set, conflict detection, and resolution trace. The Inspector's complexity scales with the evaluation model's complexity. The Ballot Box produces the richest debrief data; the Snapshot produces the simplest.

---

## Sensory Design: How Evaluation Order Becomes Visible

### The Sweep Animation
During the sealed watch, when a unit evaluates its hooks, a ring of light sweeps downward across the unit's sprite — from the top hook slot to the bottom. Under snapshot evaluation, the sweep is instantaneous: a flash that illuminates all slots simultaneously, like a camera flash. Under sequential evaluation, the sweep is visible: a band of light moves from top to bottom over ~200ms, pausing briefly at each slot. Slots that fire glow their channel color (green, red, amber, blue). Slots that are skipped or suppressed dim to grey as the sweep passes them.

### The Suppression Flicker (Ballot Box only)
When a hook matches at snapshot but is suppressed at execution, its slot icon briefly flashes its channel color (matched!) then dims to grey with a small downward-fading particle effect — like a spark that tried to ignite but was smothered. The player sees the intention (flash) and the suppression (dim). Over time, they read the flicker pattern: "Slot 3 keeps trying to fire but keeps getting suppressed."

### The Priority Glow (Sequential only)
Under sequential evaluation, the currently-evaluating slot has a bright white border. As evaluation moves to the next slot, the border shifts downward. Fired slots retain a soft glow in their channel color. Skipped slots show a momentary grey pulse. The overall effect is a top-to-bottom "reading" of the hook stack — reinforcing that order matters.

### Audio Coupling
Each hook that fires produces a short pitched tone — higher slots are higher pitched, lower slots are lower pitched. Under snapshot evaluation (all fire simultaneously), the tones play as a chord. Under sequential evaluation, they play as a rapid descending arpeggio. The player can HEAR evaluation order. A fully-firing Relay under snapshot plays a four-note chord every tick. Under sequential with suppression, it plays two notes and two muted thuds. The acoustic signature of a unit's evaluation model becomes recognizable — experienced players can hear whether a unit is snapshot-firing or sequentially-evaluating by its tick sound.

### EM Emission Visualization
Each fired hook emits a concentric ring of faint static from the unit's position. Under snapshot (all fire at once), the rings overlap into a single thick burst — a bright, opaque ripple. Under sequential (fired over ~200ms of animation), the rings emit in sequence — thin, distinct ripples expanding one after another, like dropping pebbles into water at 100ms intervals. Enemies with EM detection see the difference: a single thick pulse (snapshot unit) vs. a rapid series of thin pulses (sequential unit). This visual difference is perceptible during the sealed watch and becomes a tactical tell in competitive play.

---

## Comparable Games and Systems

- **Factorio circuit networks:** Combinators evaluate simultaneously within a tick. All inputs are read before any outputs are written. This is pure snapshot evaluation. Feedback loops using this model create stable oscillators because no combinator sees another's output within the same tick.
- **Minecraft Redstone:** Redstone updates propagate sequentially in a specific block update order (BUD). Two pistons wired to the same signal fire in block-update order, not simultaneously. Players exploit this ordering for zero-tick pulses and quasi-connectivity. The hidden evaluation order IS the advanced mechanic.
- **Magic: The Gathering triggered abilities:** When multiple triggered abilities trigger simultaneously, the active player puts them on the stack in any order (player-controlled ordering). Each resolves sequentially, and resolution can trigger new abilities. This is almost exactly the Ballot Box model with player-controlled slot order.
- **Verilog simulation:** Non-blocking assignments (`<=`) are snapshot: all reads happen before writes. Blocking assignments (`=`) are sequential: each assignment's result is visible to subsequent assignments. Verilog explicitly supports both models and teaches designers that the choice matters for correctness. Robot Uprising could learn from this: make the evaluation model a visible, choosable, teachable distinction.
- **Excel recalculation order:** Cells recalculate in dependency order. If A1 depends on B1 and B1 depends on C1, then C1 recalculates first. No snapshot — each cell sees the previous cell's new value. Circular references trigger iterative calculation with a convergence limit. This is sequential mutation with cycle detection — close to Approach B with a depth limit.
- **Screeps intent system:** All creeps declare their intended actions simultaneously (snapshot), then all actions resolve simultaneously. Conflicts (two creeps trying to move to the same tile) are resolved by a collision system. This is closest to Approach D (Parliament) — simultaneous declaration, conflict resolution layer.

---

## The TikTok Clip

**Title:** "The Dark Relay"

**0:00** — Overhead view of the 8x8 grid, dim blue lighting. Three enemy Scouts sweep the perimeter, their perception circles glowing orange. EM detection mode: the board pulses with concentric rings wherever a unit emits. The player's Scout and Striker are visible — pulsing green rings, 2 per tick. Easy targets.

**0:03** — Camera zooms to the center rooftop tile. A Relay sits there. It's processing signals constantly — the green wire from the Scout flickers with data every tick. But its EM signature is... quiet. One thin ring per tick. The three enemy Scouts sweep past, categorize it as a low-value target, continue hunting.

**0:06** — Text overlay: `HOOK STACK: SLOT ORDER IS STEALTH`. The workbench flashes briefly — four hook slots, three of them marked with a small grey "SUPPRESSED" tag. Only Slot 1 glows active.

**0:08** — The player's Scout goes down. The Relay's wires go dark. A beat of silence. Then Slot 2 ignites — the decoy heartbeat fires. Same EM signature. Same single pulse. The enemy Scouts don't flinch. Text overlay: `THEY DON'T KNOW IT'S ALONE`.

**0:11** — The player's Striker flanks from the east, silent, unhooking from the network to minimize emissions. Three enemy Scouts are stacked in the west, chasing the decoy's EM shadow. The Striker reaches the enemy's undefended Command unit.

**0:13** — One shot. Command down. The enemy network collapses — signals go dead across the board, wires flickering out one by one. The Relay on the rooftop pulses once more — the final heartbeat echo, alone in the silence.

**0:15** — Smash cut to the Inspector. The evaluation trace scrolls: `Slot 1: FIRED. Slot 2: SUPPRESSED. Slot 3: SUPPRESSED. Slot 4: SUPPRESSED.` Repeated for 14 ticks. Then tick 15: `Slot 1: NO MATCH. Slot 2: FIRED.` The suppression pattern shifts at the exact moment the Scout died. Text: `They read the suppression. They saw the shift. They still couldn't react in time.`

**0:18** — End card: ROBOT UPRISING. The Relay's single heartbeat pulse fades into black.
