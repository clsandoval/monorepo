# 2.24 — Buffer Miss Fallback Behaviors as a Design Vocabulary

## The Option

A unit's behavioral rules are ordered condition-action pairs evaluated top-to-bottom, first-match-wins. Each condition queries the buffer: "do I have a threat entry?", "is there a command signal?", "is my buffer more than half full?" But the buffer is not a database with guaranteed contents — it is a turbulent, eviction-prone, capacity-limited window onto a noisy world. The most common runtime failure in Robot Uprising is not a stun. It is a **buffer miss**: the unit evaluates its entire rule list, every condition queries the buffer, and *nothing matches*. The unit has instructions for situations it is not currently experiencing. It has a plan but no relevant data. What does it do?

This is the null pointer exception of Robot Uprising. The empty `default` case in a switch statement. The API call that returns 404. The moment a program reaches a code path the developer never considered. Every programmer has written code that crashes here. Every Robot Uprising player will build a unit that reaches this state. The question is what the game does about it — and what it teaches.

### The Four Fallback Models

**Model A: Skip (Do Nothing)**

The unit's rule evaluation returns no match. The unit takes no action this tick. It remains in its current position, does not move, does not attack, does not transmit. Its last action was whatever it did on the previous tick. It is idle.

Mechanical specification: When rule evaluation produces no match, the unit's action slot for this tick is set to `NOP`. The unit's state machine remains in its current state. No skill fires, no hook triggers, no movement occurs. The unit still perceives (buffer receives new data from observations and channels) and still ages (decay applies if enabled). It simply does not *act*.

**Model B: Suspend (Freeze 1 Tick)**

The unit's rule evaluation returns no match. The unit enters a 1-tick suspended state — functionally identical to a stun, but with a different cause and a different visual. The unit cannot act, cannot perceive, and cannot receive channel data for 1 tick. Its buffer contents are frozen. On the next tick, it resumes normal operation: perceive, receive, evaluate, act.

Mechanical specification: On buffer miss, the unit enters state `SUSPENDED`. During suspension, the perception phase is skipped (no new observations enter the buffer), the receive phase is skipped (incoming channel signals are dropped, not queued), and the evaluate phase is skipped. The unit resumes on the following tick in the `READY` state. Suspension is distinct from stun — it has a different visual treatment and a different cause code in the Inspector, but the mechanical effect (1 tick lost) is identical.

**Model C: Defensive Default (Configurable Fallback Action)**

The unit's rule evaluation returns no match. Instead of doing nothing or freezing, the unit executes a **fallback action** that the player configured in advance. This is the `default:` case in a switch statement — a catch-all behavior that fires when nothing specific applies.

Mechanical specification: The Blueprint Editor exposes a "Default Action" slot in the rules panel, visually positioned below the last rule and above the panel's bottom edge. The player drags a single action into this slot: `patrol`, `hold position`, `evade`, `retreat to spawn`, or any equipped skill. When rule evaluation produces no match, the engine executes the default action instead. The default action has no condition — it fires unconditionally as the last resort. If no default action is configured, the unit falls back to Model A (skip/NOP).

Per-rule granularity: The player can also attach a fallback action to individual rules rather than the entire blueprint. A rule reading `WHEN buffer.contains("threat"): MOVE toward threat.position [fallback: hold position]` means "if there is a threat, move toward it; if this specific rule cannot find a threat, hold position and stop evaluating further rules." Per-rule fallbacks short-circuit the evaluation — they fire instead of continuing to the next rule.

**Model D: Broadcast-Need (Request Data from Network)**

The unit's rule evaluation returns no match. Instead of acting or freezing, the unit broadcasts a signal on a designated channel: "I have no actionable data. I need information." Other units — particularly Relays and Command agents — can listen for these broadcasts and respond by routing relevant data to the requesting unit.

Mechanical specification: On buffer miss, the unit transmits a `NEED_DATA` signal on a player-configured channel (default: the unit's first subscribed output channel). The signal contains the unit's ID, position, and the *type* of data its first unmatched rule was looking for (extracted from the rule's condition — e.g., if the first rule checks `buffer.contains("threat")`, the need signal specifies `need_type: "threat"`). The unit takes no other action this tick. On subsequent ticks, if the needed data arrives via channel, normal rule evaluation resumes. If no data arrives within a configurable timeout (default: 3 ticks), the unit falls back to Model A (skip).

### Which Is Default?

**Model C (Defensive Default) should be the default, with the default action pre-set to `hold position`.** This means out-of-the-box, a unit that hits a buffer miss simply holds its ground. It does not freeze (avoiding the deadly 1-tick vulnerability of Model B), it does not silently do nothing (avoiding the invisible failure of Model A), and it does not flood the network with need signals (avoiding the complexity of Model D). The player sees the unit stop moving and recognizes something is wrong without being punished with death.

### Configuration Scope

Fallback behavior is configurable at two levels:

1. **Per-blueprint**: The Blueprint Editor's rules panel has a "Default Behavior" slot at the bottom. This applies to all instances of the blueprint. Most players will configure this once and forget it.

2. **Per-rule**: Advanced players can attach fallback actions to individual rules via a small dropdown on each rule card's right edge. Per-rule fallbacks override the blueprint default for that specific rule's miss case. This enables nuanced behavior: "if my threat-tracking rule misses, hold position; if my patrol rule misses, request data from command."

Players cannot configure fallback per-unit-instance at runtime — the blueprint is the template, and all instances share its fallback configuration. The Command agent can, however, override a unit's fallback by sending a directive signal that the unit's rules interpret as a temporary behavioral override.

---

## Player Journeys

#### Journey: Renz, 22, CS Student

**Context:** Mission 4. Renz has been building increasingly complex rule sets for his Scouts and Strikers. He understands the condition-action model and has been writing rules that reference specific buffer contents. His Scout has three rules: (1) IF buffer.contains("threat") -> broadcast on threat-net, (2) IF buffer.contains("command", value="retreat") -> move toward spawn, (3) IF buffer.contains("terrain", tag="unexplored") -> move toward unexplored terrain. He has not thought about what happens when none of these conditions match.

**Minute 0:00 — The Setup**
Plan screen. Renz reviews his Scout blueprint. Three rules, neatly ordered. He is proud of the logic — the Scout prioritizes threats, obeys retreat commands, and explores when idle. He has not configured a default action because he assumes one of the three rules will always match. "There's always *something* in the buffer," he thinks. He hits EXECUTE.

**Minute 1:30 — The Silent Failure**
Tick 12. The Scout has been patrolling effectively — its terrain observations trigger Rule 3, and it explores the northwest quadrant. Then it enters a cleared area. All terrain in perception range is already tagged "explored." No enemies visible. No command signals in the buffer. The buffer contains 4 entries: two stale terrain observations (explored, not unexplored), one expired relay heartbeat, one self-position datum. None of the three rules match. The Scout does... nothing. It stops moving. It stands in the middle of the cleared area, buffer bar showing four dimly lit pips, processing data that none of its rules care about.

**Minute 2:00 — The Confusion**
Renz watches the Scout sit still for three ticks. "Why isn't it moving?" He checks the buffer bar — it is not full, not stunned, not overloaded. The unit is not red, not sparking. It looks *fine*. But it is doing nothing. He cannot tell, during Sealed Watch, whether the unit is deliberately holding position or broken. The visual feedback for "no rule matched" is identical to the visual for "the unit's rule told it to hold position." Both look like a stationary unit. The failure is invisible.

**Minute 3:00 — The Consequence**
Tick 18. An enemy approaches from the east. The Scout is still frozen in the cleared area — it has been doing nothing for 6 ticks. The enemy enters the Scout's perception range. A threat observation enters the buffer. Rule 1 fires: broadcast on threat-net. The Scout signals the threat. But the enemy is already adjacent. Next tick: one-shot, one-kill. The Scout is destroyed. If it had been moving — patrolling, retreating, anything — it would have maintained distance. Six ticks of inaction killed it.

**Minute 4:00 — The Inspector Revelation**
Renz opens the Inspector. He clicks the Scout and scrubs to tick 12. The behavioral rule trace shows three rules, each with a red "NO MATCH" annotation. Below the rule list, a line reads: **"No rule matched. Fallback: NOP (no default action configured)."** The fallback line is rendered in dim amber — a warning color. Renz stares at it. "NOP? What's NOP?" He hovers. Tooltip: "No operation. The unit took no action this tick because no rule condition matched and no default behavior was set." He scrubs forward. Ticks 12 through 17: six identical "NO MATCH / Fallback: NOP" entries. Six ticks of doing nothing. He sees the gap now — his rules covered threat, retreat, and exploration, but not "nothing interesting is happening."

**Minute 5:00 — The Fix**
Renz returns to the Plan screen. He opens the Scout's rules panel and sees the "Default Behavior" slot at the bottom — a dashed-outline rectangle below his three rules, labeled "When no rule matches..." in dim text. He drags `patrol` into the slot. The rectangle fills with a card reading: `DEFAULT: patrol`. Now when no rule matches, the Scout patrols randomly instead of freezing. He also considers adding a fourth rule — `IF buffer has no threat AND no command: patrol` — but realizes the default action accomplishes the same thing without consuming a rule slot. The default is the implicit else-clause.

**Minute 6:30 — The Retry**
Second execution. Tick 12: same cleared area, same buffer state, same three rules fail to match. But now the fallback fires: `DEFAULT: patrol`. The Scout begins moving in a patrol pattern. Tick 15: it drifts northeast, toward unexplored terrain. New terrain observations enter the buffer. Rule 3 matches again. The Scout resumes purposeful exploration. Tick 18: the enemy approaches from the east, but the Scout is no longer in the cleared area — it patrolled away. It detects the enemy at range, broadcasts on threat-net, and evades. Zero casualties.

**UI Annotations:**
- **Default Behavior slot**: Dashed rectangle at the bottom of the rules panel, below all rule cards. Label: "When no rule matches..." in dim gray. When filled, shows a solid card with `DEFAULT:` prefix in amber.
- **Inspector NOP trace**: Dim amber text below the rule list when no rule matches. Hovering shows tooltip explaining NOP and suggesting default action configuration.
- **Idle unit visual during Sealed Watch**: When a unit executes NOP (no default configured), its tile border pulses with a very faint amber glow every 2 seconds — subtle enough to miss on first viewing, but learnable. Units executing a configured default action show no special visual — they just do the action normally.

---

#### Journey: Sofia, 31, QA Engineer

**Context:** Mission 7. Sofia has been using defensive defaults since Mission 5. Her standard default is `hold position` — safe, predictable. She has a multi-unit architecture with Scouts (default: patrol), Strikers (default: hold position), and a Relay (default: hold position). She has never used per-rule fallbacks or broadcast-need. This mission introduces an enemy that uses decoy signals — fake threat data that lures Strikers into ambushes. Sofia's Striker rules chase threats, and the decoys create situations where the threat data expires (decays or gets evicted) mid-pursuit, leaving the Striker with no matching rule.

**Minute 0:00 — The Lure**
Tick 8. A decoy signal enters Striker-1's buffer: "threat at G5, weight 3." Rule 1 fires: `WHEN buffer.contains("threat"): MOVE toward threat.position`. The Striker moves toward G5. Tick 9: the decoy signal decays to weight 1 and gets evicted by the Striker's eviction rule (evict entries below weight 2). The buffer no longer contains a threat. Rule 1 no longer matches. No other rule matches. The default fires: `hold position`. The Striker stops at E5, two tiles short of the ambush at G5. Sofia's conservative default saved it — the Striker did not blindly continue toward the last-known threat position. It stopped and waited for new information.

**Minute 1:30 — The Insight**
Sofia watches three Strikers get lured partway toward decoys, then stop and hold position when the decoy data expires. Each time, the Striker freezes in a random mid-board position — safe from the ambush but also useless. Three Strikers holding position in no-man's-land, doing nothing, while the real enemy flanks from the south. The default saved them from the ambush but left them strategically inert. "Hold position is safe but stupid," she mutters. "I need them to do something useful when they lose their target."

**Minute 2:30 — Per-Rule Fallback Discovery**
Sofia opens Striker-1's blueprint. She clicks the small dropdown arrow on the right edge of Rule 1 (`WHEN threat -> MOVE toward`). A dropdown appears: "On miss: [use blueprint default]." She changes it to "On miss: retreat to nearest Relay." Now when the threat-chasing rule loses its target (buffer miss on the threat condition), the Striker doesn't just hold position — it retreats to the nearest Relay, where it can receive fresh intelligence. She sets Rule 2 (patrol rule) to "On miss: broadcast-need on `strike-net`." If the Striker can't even patrol (no terrain data), it actively requests data.

**Minute 3:30 — The Layered Fallback**
She hits EXECUTE. Tick 8: decoy lures Striker-1 toward G5. Tick 9: decoy expires. Rule 1 misses. Per-rule fallback fires: retreat to nearest Relay. The Striker turns back toward the Relay at C3. Tick 11: the Striker reaches the Relay's signal radius. The Relay, which has been receiving real Scout data, forwards a compressed threat report: "actual enemy cluster at B7." The Striker's buffer now contains a real threat. Rule 1 matches. The Striker moves toward B7. Tick 14: engagement. Kill.

**Minute 4:00 — The Cascade Architecture**
Sofia realizes she has built a fallback cascade: primary action (chase threat) -> per-rule fallback (retreat to Relay) -> Relay provides new data -> primary action resumes. The fallback is not an endpoint — it is a recovery path. The Striker does not hold position and hope. It actively moves toward a data source. She applies the same pattern to all Strikers: "when you lose your target, go to where the information is."

**Minute 5:30 — The Broadcast-Need Experiment**
Emboldened, Sofia configures her third Striker to use Model D (broadcast-need) instead of retreat. When Rule 1 misses, the Striker broadcasts `NEED_DATA(type: "threat")` on `strike-net`. The Relay, listening on `strike-net`, receives the need signal and prioritizes forwarding threat data to that Striker's channel. This is a pull model — the Striker requests what it needs rather than going to find it. Sofia watches the Inspector: tick 9, Striker broadcasts need. Tick 10, Relay responds with threat data. Tick 11, Striker acts. One tick faster than the retreat-to-Relay approach because the Striker did not spend ticks moving.

**Minute 6:30 — The Trade-Off**
But the broadcast-need has a cost: the `NEED_DATA` signal consumes a buffer slot on the Relay. Under heavy load, these need signals compete with actual intelligence for buffer space. Sofia runs a stress test — 4 Strikers all broadcasting need simultaneously. The Relay's 12-slot buffer fills with 4 need signals plus Scout data. The need signals evict older Scout observations. The Relay's intelligence quality drops. "Pull is faster but noisier," she notes. "Push (retreat to Relay) is slower but doesn't pollute the network." She settles on a hybrid: frontline Strikers use broadcast-need (speed matters), rear-guard Strikers use retreat-to-Relay (network cleanliness matters).

**UI Annotations:**
- **Per-rule fallback dropdown**: Small chevron on the right edge of each rule card. Dropdown options: "Use blueprint default," "Hold position," "Retreat to nearest [unit type]," "Broadcast need on [channel]," "Patrol," "Evade."
- **Broadcast-need visual**: When a unit broadcasts NEED_DATA, a small radar-pulse animation emanates from the unit's tile — two concentric rings expanding outward in the channel's color, fading at 300ms. The Inspector shows the need signal as a hollow pill (outline only, no fill) to distinguish it from data signals.
- **Fallback cascade in Inspector**: Each fallback event shows a branching arrow from the missed rule to the fallback action. If the fallback leads to data acquisition that re-enables the original rule, a dotted return arrow connects them — a visual loop showing the recovery path.

---

#### Journey: Kuya Jun, 45, Retired Systems Administrator

**Context:** Mission 9. Kuya Jun plays slowly and methodically. He spent 20 years managing Linux servers and immediately recognized Robot Uprising's rule system as a production monitoring system. His blueprints are defensive — every unit has a default action, every rule has a fallback, every channel has a purpose. He has been using Model B (suspend) on his Scouts as a deliberate design choice, and this mission reveals why that choice is dangerous.

**Minute 0:00 — The Suspend Philosophy**
Kuya Jun's Scout blueprint uses `suspend` as its fallback behavior. His reasoning: "If the Scout doesn't know what to do, it should stop and wait. Better to lose one tick recalibrating than to wander into danger on a bad default." He configured this in the advanced settings panel: "On no rule match: suspend (1 tick)." His Scouts have been surviving missions 5-8 because enemy density was low enough that 1-tick suspensions rarely mattered.

**Minute 1:00 — The Ambush Corridor**
Mission 9 features narrow corridors with enemies positioned at chokepoints. Kuya Jun's Scout-Alpha enters a corridor. Its buffer fills with terrain observations (walls on both sides). No threat visible. No commands pending. No rule matches — the Scout's rules all reference threats or commands, and the corridor has neither. Suspension fires. The Scout freezes for 1 tick.

**Minute 1:30 — The Death Loop**
Tick 15: Scout resumes. Perceives: walls, walls, empty corridor. Same buffer state. No rule matches. Suspension fires again. Tick 16: frozen. Tick 17: resumes. Same data. No match. Suspension. The Scout is caught in a **suspend loop** — every time it resumes, it perceives the same environment, fails to match any rule, and suspends again. It oscillates between frozen and resuming without ever acting. It is not stunned (that would show red). It is not idle (that would show the amber NOP glow). It is flickering — active for one tick, suspended for one, active for one, suspended for one. A blinking cursor in an empty terminal.

**Minute 2:00 — The Enemy Arrives**
An enemy enters the far end of the corridor. Tick 19: Scout resumes from suspension. It perceives the enemy. Threat observation enters the buffer. Rule 1 matches: broadcast on threat-net. The Scout signals — but it has been oscillating in the corridor for 4 ticks, and the enemy is already close. Tick 20: suspension (the broadcast consumed the action, but next tick the threat observation has been evicted by new wall observations from the narrow corridor — too much terrain data in a confined space). No match. Suspend. Tick 21: enemy adjacent. Scout resumes. Perceives enemy at range 1. Rule 1 fires: broadcast. But it is too late. Tick 22: one-shot, one-kill.

**Minute 3:00 — The Inspector Autopsy**
Kuya Jun opens the Inspector with a grim expression. He scrubs to tick 14. The behavioral trace shows alternating lines: `No match -> SUSPEND` / `Resume -> Perceive -> No match -> SUSPEND` / `Resume -> Perceive -> No match -> SUSPEND`. Four cycles. The buffer state panel shows the same contents at each resume tick — 5 terrain observations and 1 self-position. The terrain observations never change because the Scout is not moving (it is suspended half the time and perceiving the same corridor the other half). "It is a livelock," he says. He recognizes the pattern from his sysadmin days — a service that restarts, crashes, restarts, crashes, never recovering because the restart does not change the conditions that caused the crash.

**Minute 4:00 — The Fix**
Kuya Jun changes the Scout's fallback from `suspend` to `defensive default: patrol`. Now when no rule matches, the Scout moves. Movement changes its perception. New perception generates new buffer contents. New buffer contents may match a rule. The patrol default breaks the livelock by changing the environment the unit observes. He also adds a rule: `WHEN buffer.count("terrain") > 4 AND NOT buffer.contains("threat"): move toward least-observed direction`. This gives the Scout something to do in terrain-heavy, threat-sparse environments — exactly the corridor scenario.

**Minute 5:30 — The Suspend Epitaph**
Kuya Jun reflects. Suspend made sense as a safety mechanism — "when confused, stop and think." But in a game where perception depends on movement and movement depends on rules, stopping creates a feedback loop: no action -> no new data -> no rule match -> no action. The only fallback that breaks the loop is one that *changes the unit's state* — moving, broadcasting, doing something that alters the buffer contents. Suspend preserves the exact conditions that caused the miss. It is a trap.

He writes in his notes app: "Suspend = restart without fixing the bug. Defensive default = exception handler that logs and continues. Broadcast-need = escalating the ticket. Skip = swallowing the exception silently." He has mapped every fallback model to a sysadmin pattern he has lived for 20 years.

**UI Annotations:**
- **Suspend visual**: When a unit suspends from buffer miss, its tile dims to 70% brightness (less than stun's 50%) and a small hourglass icon appears above it for 1 tick. The buffer bar turns pale gray (frozen, not receiving). Distinct from stun (red, sparking) but clearly indicating lost time.
- **Suspend loop detection**: If a unit suspends 3+ times in 5 ticks, the Inspector highlights the sequence with an amber bracket labeled "Suspend Loop Detected." This is a teaching moment — the game identifies the antipattern.
- **Livelock indicator during Sealed Watch**: After 3 consecutive suspensions, the unit's hourglass icon gains a subtle circular arrow overlay — the universal "loading/retrying" symbol. Players who have seen loading spinners on broken web pages will feel the discomfort immediately.

---

## Strengths and Weaknesses

### Model A: Skip (NOP)

**Strengths:** Zero risk of cascading failure. The unit simply does nothing — it cannot make a bad decision because it makes no decision. It still perceives, so new data may enable a rule match on the next tick. It is the least intrusive fallback. In dense, fast-moving environments where the buffer state changes every tick, a single NOP tick is barely noticeable.

**Weaknesses:** The failure is invisible. During Sealed Watch, a skipping unit looks identical to a unit that is deliberately holding position. The player cannot distinguish "my rule told it to stay" from "no rule matched and it defaulted to nothing." This is the silent exception — the `catch (Exception e) { }` block with no logging. The program does not crash, but the bug is hidden. Players who rely on Skip will miss buffer miss events entirely and blame downstream failures ("why didn't the Striker engage?") without realizing the upstream Scout was NOP-ing for 5 ticks.

### Model B: Suspend (Freeze 1 Tick)

**Strengths:** Makes the failure visible and punishing. The 1-tick freeze is a clear signal that something went wrong. In a one-shot-one-kill game, losing a tick is costly — players will fix buffer misses to avoid the penalty. This model teaches the hardest version of the lesson: unhandled cases are dangerous. It also provides the cleanest parallel to real null pointer exceptions — the program crashes (loses a tick), and the developer (player) must add error handling (default actions) to prevent the crash.

**Weaknesses:** The livelock problem described in Kuya Jun's journey. If the buffer state does not change between suspension cycles, the unit enters a death spiral. Suspend also makes small-buffer units (Scouts, 6 slots) disproportionately vulnerable — they are most likely to hit buffer misses (fewer rules, more homogeneous data) and least able to afford the lost tick (already fragile). Finally, suspend is mechanically identical to stun — the gameplay cost is the same. This conflates two different failure modes (overload vs. confusion) into the same punishment, which muddies the teaching.

### Model C: Defensive Default (Configurable Fallback Action)

**Strengths:** The Goldilocks fallback. It is visible (the unit does something, which the player can observe), recoverable (the default action may change the unit's state and enable future rule matches), and configurable (the player chooses the safety behavior). It maps directly to the `default:` case in a switch statement or the `else` clause in an if-else chain — the most common defensive programming pattern. It teaches the right habit: always have a catch-all. Players who internalize "configure a default" will write code that handles the else case.

**Weaknesses:** A poorly chosen default can be worse than NOP. A Striker with `default: patrol` will wander into enemy territory when confused. A Scout with `default: evade` will retreat from empty areas, wasting time. The quality of the fallback depends entirely on the player's judgment — the system enables good defaults and bad defaults equally. There is also a risk of over-reliance: if the default action is "good enough," the player may never bother writing the missing rules. The default becomes a crutch that prevents deeper system understanding.

### Model D: Broadcast-Need (Request Data from Network)

**Strengths:** The most architecturally sophisticated fallback. Instead of acting alone, the unit recruits help from the network. This teaches the principle of service discovery and dependency injection — when a component does not have what it needs, it asks the system to provide it. In multi-unit architectures with Relays and Command agents, broadcast-need enables self-healing information flow: gaps in one unit's knowledge are filled by the network's collective intelligence.

**Weaknesses:** Network dependency. If the network is down (Relay destroyed, channels jammed), the broadcast goes unanswered and the unit is stuck in NOP until the timeout expires. Broadcast-need also creates buffer pressure on receiving units — every need signal consumes a slot on the Relay or Command agent's buffer. In a crisis (multiple units broadcasting need simultaneously), the need signals themselves become a denial-of-service attack on the information infrastructure. Finally, broadcast-need is the most complex model for new players. It requires understanding channels, signal routing, and multi-unit coordination — concepts that are not available until Mission 3-4.

---

## Interaction Effects

### With Buffer Pressure and Eviction Policies

Buffer misses and buffer pressure are inversely related failure modes. A buffer under pressure (near full, high eviction rate) loses data rapidly — the conditions for rules evaporate as entries are pushed out. A buffer with no pressure (mostly empty, low eviction) may lack data entirely — the conditions for rules were never populated in the first place. The fallback model interacts with both:

- Under high pressure, **defensive default** is safest because the unit continues functioning while the buffer churns. Suspend would create a tick gap where new data arrives but is not perceived (perception skipped during suspend), potentially causing the unit to miss the very data that would resolve the miss.
- Under low pressure, **broadcast-need** is most effective because the unit's problem is information scarcity, and the network may have the data it lacks. But broadcast-need under high pressure adds to the pressure problem — the outgoing need signal competes for buffer space.

Eviction policy interacts specifically with the livelock problem. Under FIFO eviction, a suspended unit's buffer does not change (no new perception, no new signals), so FIFO has nothing to evict. The buffer is frozen. Under decay-based eviction, entries lose weight during suspension, and low-weight entries may be evicted even without new data arriving. This means decay can *break* livelocks that FIFO cannot — old data decays away, the buffer empties, and the resume tick produces a different buffer state. Decay-based eviction is a natural complement to suspend behavior, partially mitigating its worst failure mode.

### With Hook Reliability

Broadcast-need (Model D) depends entirely on hook reliability. If hooks are lossy (signals dropped due to range, interference, or channel congestion), need broadcasts may never reach a Relay. The unit broadcasts into the void, waits for a response that never comes, and times out to NOP. In environments with unreliable hooks, Model D degrades to Model A with extra latency (the timeout period). Players must assess hook reliability before choosing broadcast-need — a lesson that maps directly to choosing between synchronous and asynchronous error handling in distributed systems. You do not build a system that calls an unreliable API without a timeout and a local fallback.

### With the Teaching Arc

The four models form a natural teaching progression:

1. **Missions 1-2**: Skip (Model A) is the only available fallback. Buffer misses happen but are rare because rule sets are simple and environments are data-rich. The player may not even notice misses.
2. **Mission 3**: The boot log introduces the "Default Behavior" slot. The player configures their first defensive default (Model C). The mission includes a scenario where a unit with no default freezes in a cleared area (Renz's journey). The lesson: always handle the else case.
3. **Mission 5-6**: Per-rule fallbacks unlock. The player can attach different fallback behaviors to different rules. The lesson: different failure modes deserve different recovery strategies.
4. **Mission 7+**: Broadcast-need (Model D) unlocks with the Relay's full channel system. The player can build self-healing architectures where units request missing data from the network. The lesson: in a distributed system, error recovery is a network-level concern, not a unit-level concern.
5. **Mission 9+**: Suspend (Model B) is available as an advanced option for players who want maximum failure visibility. The boot log warns about livelock. The lesson: some error handling strategies create worse problems than the original error.

This arc mirrors the progression a junior developer follows: first they write code with no error handling (skip), then they add catch-all defaults (defensive default), then they learn about retry-with-dependency (broadcast-need), and finally they encounter the counterintuitive failure modes of retry logic itself (suspend/livelock).

### With the One-Shot-One-Kill Tempo

The one-shot-one-kill rule makes every lost tick potentially fatal. This amplifies the stakes of fallback choice:

- **Skip** loses zero ticks but produces zero recovery — the unit is alive but useless.
- **Suspend** loses one tick — in the worst case, this is the tick an enemy moves adjacent and attacks. The unit dies not because it was stunned, but because it was confused. This feels *worse* than a stun death, because stuns come from external pressure (buffer overload) while suspensions come from internal design failure (missing rules). The player feels responsible.
- **Defensive default** loses zero ticks and produces partial recovery — the unit does something, which may or may not help. The unit survives but may act suboptimally.
- **Broadcast-need** loses 1-3 ticks (waiting for response) but produces targeted recovery. In a one-shot-one-kill game, 3 ticks of waiting is an eternity. The unit must be positioned safely before broadcasting need.

---

## Comparable Games

### Programming: Exception Handling and Default Cases

The most direct parallel. A buffer miss is a runtime exception — the program reached a state the developer did not anticipate. The four fallback models map precisely:

- **Skip** = `catch (Exception e) { /* swallow */ }` — the silent exception. The program continues but the bug is invisible.
- **Suspend** = unhandled exception causing a crash/restart — the program stops, restarts, and may hit the same error again (livelock = crash loop).
- **Defensive default** = `catch (Exception e) { return defaultValue; }` — the program continues with a safe fallback. The `default:` case in a switch statement.
- **Broadcast-need** = `catch (Exception e) { retryWithFallbackService(); }` — the program calls a secondary service to recover. Circuit breaker pattern, retry with exponential backoff.

Every professional programmer has experienced every one of these patterns. Robot Uprising makes the consequences visceral — silent exceptions get your units killed, crash loops create livelocks, good defaults keep the army running, and retry logic only works when the network is healthy.

### Dwarf Fortress: Idle Behavior and Job Cancellation

Dwarf Fortress dwarves become idle when they have no valid job in their queue. An idle dwarf wanders randomly, drinks, socializes — a built-in default behavior that prevents the game from locking up. But idle dwarves are also wasted productivity. The "Idle" count in the fortress status bar is a key metric — too many idle dwarves means the player has not assigned enough jobs or has created impossible task dependencies. Robot Uprising's buffer miss is analogous to a dwarf's empty job queue. The defensive default (patrol) is analogous to the idle wander behavior. The broadcast-need is analogous to a dwarf requesting materials that are not available — the hauling system responds by delivering the materials if possible.

### StarCraft: Idle Unit Behavior and Rally Points

StarCraft units that have no orders stand still and will auto-attack nearby enemies but otherwise do nothing. This is effectively Model A (skip) with a reactive exception (auto-attack). Competitive players consider idle units a failure of macro management — every second a unit is idle is a second of wasted potential. The "idle worker" alert (a blinking icon showing the count of idle workers) is one of StarCraft's most important UI features. Robot Uprising could learn from this: a visible "units with no matching rule" counter during Sealed Watch would help players identify buffer miss problems without pausing.

### Real API Design: Fallback Patterns

Modern API design is built on fallback vocabulary. HTTP 404 (resource not found) triggers client-side fallback logic. Circuit breakers (Hystrix, Resilience4j) implement timeout-then-fallback patterns identical to broadcast-need. Default values in GraphQL schemas prevent null-pointer errors in client code. Kubernetes readiness probes mark pods as "not ready" (functionally a suspend) when they cannot serve traffic. Robot Uprising's four fallback models correspond to real patterns that players will encounter in production systems — and the game teaches the failure modes of each pattern before the player encounters them at 3 AM with a pager going off.

---

## Sensory Description

### The Look of a Buffer Miss

When a unit evaluates all its rules and nothing matches, the moment should be visually distinct from stun, from hold-position, and from normal action. The challenge: buffer miss is not a dramatic failure (like stun) but a quiet one — the absence of a plan.

**The "lost" shimmer:** When rule evaluation completes with no match, the unit's tile border produces a single brief shimmer — a wave of pale amber light that travels clockwise around the border in 400ms, then fades. It is not alarming. It is not red. It is the visual equivalent of a unit looking around and finding nothing relevant. Players who have seen the shimmer a few times learn to associate it with "that unit needs a default action." Players who have not noticed it yet are not punished — the game does not demand they understand buffer misses immediately.

**The NOP stance:** Under Model A (skip), after the shimmer, the unit enters a subtly different idle animation. Its movement stops, but its "thinking" indicator — a faint circular pulse beneath the unit, like sonar — also stops. Normal hold-position retains the thinking pulse (the unit is choosing to hold). NOP removes it (the unit has nothing to choose). The difference is subtle — visible to a player who is looking for it, invisible to one who is not. This is the design principle: buffer miss feedback is opt-in to notice, not forced.

**The suspend dim:** Under Model B (suspend), the unit dims to 70% brightness and the hourglass icon appears. The buffer bar turns pale gray — desaturated, frozen. The sound is a descending two-note *wah-wah*, pitched lower than the stun sound, at 40% volume. It says "pause," not "break." After 1 tick, the unit brightens back to full, the hourglass vanishes, and a tiny upward arrow pulses once — "resuming."

**The default action indicator:** Under Model C (defensive default), the shimmer plays, then the unit immediately begins executing its default action with a small visual annotation: a tiny "D" badge in the lower-right corner of the tile, rendered in dim amber, visible for the duration of the default action. The "D" tells attentive players "this action came from the default, not from a rule." In the Inspector, default-action ticks are marked with an amber "D" prefix on the action line, distinguishing them from rule-driven actions.

**The need pulse:** Under Model D (broadcast-need), the shimmer plays, then concentric radar rings pulse outward from the unit in the channel's color — two rings, expanding and fading over 600ms. The sound is a soft ascending chirp — *bwip* — like a sonar ping. The unit's tile shows a small antenna icon for the duration of the need timeout (1-3 ticks). When a response arrives, the antenna icon flashes the data-type color of the received signal and vanishes. When the timeout expires with no response, the antenna icon fades to gray and vanishes — the universal visual of "signal lost."

### The Inspector's Buffer Miss Panel

In the Inspector, buffer miss events are displayed in their own collapsible section: **"Unmatched Ticks"** in small caps, positioned between the buffer state panel and the behavioral rule trace. Each unmatched tick shows:

- **Tick number** in an amber circle (contrasting with the green circles of matched ticks)
- **Buffer state at evaluation time** — the full buffer rendered as a miniature pip strip
- **Each rule** listed with its condition and a dim red "NO MATCH" tag
- **Fallback action taken** — the model name and action in amber text
- **Outcome** — what happened as a result (unit held position, unit patrolled, unit suspended, unit broadcast need)

Hovering over an unmatched tick highlights the buffer entries that *were* present and cross-references them against the rule conditions, showing exactly which condition-field was missing. A tooltip reads: "Rule 1 needed `threat` data. Buffer contained: terrain, terrain, self-position, heartbeat. No `threat` entry present." This is the stack trace — the precise diagnostic that tells the player what data was missing and why the rule failed. Players who read these tooltips learn to write rules that match broader conditions or to configure defaults that cover the gaps.
