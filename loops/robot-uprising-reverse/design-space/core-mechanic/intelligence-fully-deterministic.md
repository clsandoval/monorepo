# 2.00a — Fully Deterministic Intelligence: Can Scripted Agents Feel Smart?

## The Option

Every agent in Robot Uprising runs on a **fully deterministic** execution model. No randomness, no LLM calls, no probability distributions. Given the same world state and the same configuration, an agent always does the same thing. The player's entire job is composing four deterministic primitives — **skills, rules, hooks, and context config** — into architectures that produce emergent behavior through interaction, not through any hidden intelligence.

The unit doesn't "decide" to flank. The player wired a scout's `ENEMY_SPOTTED` hook to a relay's `COMPRESS` skill which forwards on channel `strike-west`, and the striker's rules prioritize `strike-west` signals over `patrol` signals. The flanking maneuver *emerges* from the wiring. The unit is a puppet. The puppeteer is the information architecture.

### Mechanical Specification

**Tick resolution order (deterministic):**
1. All agents read world state (frozen snapshot from end of previous tick)
2. All agents evaluate rules top-to-bottom against their buffer contents
3. First matching rule fires its action
4. All hooks triggered by actions are queued
5. All hook payloads delivered simultaneously (subject to buffer capacity)
6. All movement/combat resolved simultaneously
7. World state updates atomically → next tick

**No randomness anywhere:**
- No random tie-breaking (ties broken by agent ID, then by creation order)
- No random patrol variance (patrol paths are deterministic waypoint sequences)
- No random signal delay (all signals deliver in exactly 1 tick)
- No random enemy behavior (enemy AI follows same deterministic rules)

**The player controls:**
- Which skills are active (toggle on/off)
- Rule ordering (drag to reorder condition→action pairs)
- Hook wiring (event→channel→recipients)
- Context config (buffer size, listen/ignore toggles, eviction priority)

**The player does NOT control:**
- Moment-to-moment movement (rules determine this)
- Target selection beyond rule priority (first matching rule wins)
- Timing of actions (tick-synchronous, no scheduling)
- Communication content beyond channel selection (signals carry fixed-format data)

### What Makes It Feel Smart: The Gladiabots Lesson

Gladiabots proves this works. Sébastien Dubois built a game where every robot runs a deterministic behavior graph — no randomness, no learning, no hidden state — and players routinely describe watching their bots and thinking "how did it know to do that?" The intelligence isn't in the agent. It's in the **interaction between agents**, each following simple rules that collectively produce sophisticated behavior.

The key insight from Gladiabots: **the player's surprise at their own creation is the core emotional payload.** You built the thing. You understand every rule. And yet when four agents interact in a specific spatial configuration, something happens that you didn't explicitly program. That gap between "I understand every piece" and "I didn't predict the whole" is where the magic lives.

Robot Uprising amplifies this by adding the **context buffer** — agents don't just follow rules, they follow rules *about what they currently remember*. A scout with a full buffer of stale terrain data will behave completely differently from one whose buffer was just flushed by a relay's compression signal. Same rules, different buffer state, different behavior. The buffer is the soul.

### What Makes It Feel Dumb: The Exploitation Problem

Into the Breach's Matthew Davis identified the core risk: "When you remove the randomness from these games you're left with something that does feel more like a puzzle." Deterministic agents are **exploitable**. Once a player discovers the optimal configuration for a mission, there's no variance to make the next run different. The solution is a solution forever.

**The three failure modes of deterministic dumbness:**

1. **The Goomba Problem.** An agent walks into the same wall every time because its buffer doesn't contain the information it needs to route around it. The player watches and thinks "you're so stupid." This happens when the gap between expected and actual behavior is *legible* — the player can see why the agent failed, and the reason feels trivially avoidable.

2. **The Clockwork Problem.** After 3-4 replays, the player sees the exact same sequence play out and stops watching the sealed phase entirely. The agents aren't alive — they're a clock. This kills the sealed-watch tension mechanic entirely.

3. **The Solved Problem.** A veteran player finds a single configuration that beats missions 1-8 with zero modifications. The game collapses into a spreadsheet — there's nothing left to explore because the deterministic system has a dominant strategy.

### Mitigations Within Pure Determinism

Robot Uprising's locked design already addresses the Clockwork Problem: **invisible randomization varies scenarios within constraints**, and there are 100 randomized test cases per mission. The agent config is deterministic, but the *world it encounters* varies. This is the Zachtronics model: your program is fixed, but the inputs change.

Additional mitigations:

**1. Buffer State as Hidden Complexity.** Even with identical rules, agents with different buffer histories behave differently. Because buffer contents depend on the entire history of signal routing — which depends on spatial positions, which depend on prior movement, which depends on prior buffer states — the system has **sensitive dependence on initial conditions**. Two runs with slightly different enemy spawn positions can cascade into completely different agent behaviors by tick 30. The buffer is the chaos engine.

**2. Spatial Interaction Multiplier.** With 8+ agents on an 8x8 grid, the combinatorial space of possible spatial configurations is enormous. Each configuration produces different hook firing patterns, different signal routing latencies, different buffer fill orders. Two agents that are 2 tiles apart have a completely different interaction profile than the same agents at 4 tiles apart (if hooks have range constraints).

**3. Factory Variance.** The production queue produces agents over time. The timing of when agents appear on the board changes the spatial configuration, which changes everything downstream. The player designs the blueprint and the build order, but the resulting battle unfolds differently depending on which agents are alive at which ticks.

**4. Enemy Variety.** Each mission's 100 test cases can vary enemy composition, spawn timing, patrol routes, and initial positions. The player's deterministic config must handle all 100 — this is the Zachtronics robustness challenge. A config that works for 90/100 cases but fails on 10 is a config that needs architectural improvement, not parameter tuning.

---

## Player Journeys

### Journey 1: Kai, 14, Minecraft Redstone Builder — First Encounter with Determinism

**Context:** Mission 2 (tutorial). Kai has completed Mission 1 (single scout, just rules). Mission 2 introduces a scout + striker pair with hooks. The enemy is 2 static sentries guarding a base.

**Minute 0:00 — The Briefing**
The boot log scrolls: `SUBSYSTEM: hook_router v0.3.1 — ONLINE`. The plan screen shows the 8x8 board on the left — two green tiles (scout at B2, striker at F2) and two red enemy tiles (sentries at D5, E5) guarding the red base at D7. The workbench panel on the right shows the scout's blueprint. Kai sees four tabs: Skills, Rules, Hooks, Context. The Skills tab has `SCAN` toggled on (greyed out, locked for this mission). Rules shows one pre-configured rule: `IF enemy_in_range → RETREAT_1_tile`. Hooks is empty — a blinking cursor with the text "No hooks configured."

Kai hovers over the striker's blueprint. Its skills show `STRIKE` (locked on). Its rules show `IF enemy_adjacent → ATTACK` and `IF enemy_in_buffer → MOVE_TOWARD_enemy`. Context shows 4 buffer slots, all empty.

**Minute 0:30 — The Naive Attempt**
Kai doesn't add any hooks. Hits EXECUTE. The sealed watch begins. Tick 1: Scout moves toward center. Striker moves toward center. Tick 2: Scout scans, sees sentry at D5. Scout retreats (rule fires). Striker keeps advancing (nothing in its buffer — it has no information about enemies). Tick 5: Striker walks adjacent to sentry D5. `ATTACK` fires. One-shot kill — sentry D5 eliminated. Tick 6: Sentry E5 was adjacent to striker's new position. Sentry attacks. Striker eliminated. Scout is alone, retreating.

The sealed watch ends. Red overlay: MISSION FAILED. Kai's face scrunches. "The striker didn't know about the second sentry."

**Minute 1:00 — The Debrief Revelation**
Inspector mode. Kai clicks the striker at tick 4. Buffer panel: empty. All four slots show dim horizontal lines — nothing was ever received. The striker walked into a 2v1 because it literally couldn't see the second enemy. Kai clicks the scout at tick 2. Buffer shows: `[ENEMY@D5, range:3] [ENEMY@E5, range:4]`. The scout SAW both sentries. It just never told anyone.

Kai's eyes widen. This is the redstone moment. The scout has the information. The striker needs the information. They need a wire between them.

**Minute 1:30 — The First Hook**
Back to plan screen. Kai opens the scout's Hooks tab. The tutorial tooltip says: "Hooks fire when something happens. Try: WHEN scan_complete → SEND buffer TO channel [strike-intel]." Kai types `strike-intel` in the channel name field. A faint dashed line appears on the board between the scout and striker ghosts, labeled `strike-intel` in small monospace text.

Now the striker. Kai opens its Context tab. Under "Listen," a new channel has appeared: `strike-intel` with a toggle. Kai flips it on. The dashed line on the board turns solid cyan.

**Minute 2:00 — The Rewired Attempt**
EXECUTE. Tick 1: Same movement. Tick 2: Scout scans, sees both sentries. Hook fires — `scan_complete` → sends buffer contents on `strike-intel`. Tick 3: Striker's buffer now contains `[ENEMY@D5] [ENEMY@E5]`. Its rule `IF enemy_in_buffer → MOVE_TOWARD_enemy` fires. It moves toward D5 (first entry, deterministic tie-break). But now Kai watches differently — the striker isn't blindly advancing, it's *responding to intelligence*.

Tick 5: Striker eliminates sentry D5. Tick 6: Striker's buffer still contains `[ENEMY@E5]` from the scout's report. `MOVE_TOWARD_enemy` fires again — toward E5. Tick 7: Striker eliminates sentry E5. Tick 8: Striker's `IF enemy_in_buffer → MOVE_TOWARD_enemy` fires toward the now-unguarded base. Tick 10: Base destroyed. GREEN OVERLAY: MISSION COMPLETE.

Kai pumps fist. "It looked like it *planned* the whole thing." It didn't. The scout scanned, the hook forwarded, the rules resolved. But the *feeling* was of coordinated intelligence.

**Minute 3:00 — The Replay**
Kai watches again with the inspector. Clicks the striker at tick 3 — sees the buffer fill with scan data. Clicks at tick 6 — sees the first entry evicted (D5 enemy destroyed, position no longer valid), second entry promoted. "Oh — it *forgot* the first one and remembered the second one." The buffer eviction policy created the appearance of adaptive attention. Kai didn't program "attack the second sentry after the first." The buffer dynamics did it.

**UI Annotations:**
- Hook wiring line: dashed cyan when configured, solid cyan when both ends connected, pulses brightly on tick when hook fires
- Buffer bar on striker tile: 4 tiny horizontal pips at bottom, dim grey when empty, bright green when occupied, leftmost pip glows slightly brighter (most recent entry)
- Channel name: `strike-intel` rendered in 8px monospace above the wiring line, fades to 40% opacity after 2 seconds to reduce clutter
- Inspector buffer panel: vertical stack of 4 slots, each showing a one-line summary (`ENEMY@D5 age:2t` in monospace), occupied slots have bright left border, empty slots have dim dotted border

---

### Journey 2: Priya, 32, Staff Engineer at a Cloud Infrastructure Company — The Complexity Wall

**Context:** Mission 6. Priya has beaten missions 1-5 (tutorial arc). Mission 6 introduces the factory — she must design blueprints and a production queue, not just configure pre-placed units. The mission has 3 enemy scouts and 2 enemy strikers patrolling an L-shaped corridor. She needs to produce her own units and coordinate them.

**Minute 0:00 — The Factory Overwhelm**
Plan screen. The board shows her base at A1 (a small factory icon, pulsing gently) and the enemy formation across the board. The workbench panel now has a new section at top: **Production Queue** — a horizontal conveyor belt strip showing empty blueprint slots. Below it, three blueprint templates: Scout, Relay, Striker. Each has a cost indicator (Scout: 2, Relay: 3, Striker: 4) and the workbench panel for whichever blueprint she's editing.

Priya stares at the screen. In missions 1-5, she configured 2-3 units by hand. Now she needs to design *reusable blueprints* and decide the *build order*. She drags a Scout blueprint onto the conveyor. Then a Relay. Then a Striker. The board shows ghost previews — Scout spawning at A2 on tick 4, Relay at A2 on tick 7, Striker at A2 on tick 11. "The timing matters," she murmurs. The striker won't exist until tick 11. Her scout is alone for 10 ticks.

**Minute 1:00 — The First Architecture**
Priya configures her scout blueprint: `SCAN` skill on, rules are `IF enemy_in_range → RETREAT_1` and `IF no_enemy_in_range → MOVE_TOWARD nearest_unknown_tile` (exploration). Hook: `WHEN scan_complete → SEND buffer TO intel-feed`. Context: 6 slots, listen to nothing (scouts are producers, not consumers).

Relay blueprint: `COMPRESS` skill on. Rules: `IF buffer_above_75% → COMPRESS` and `IF buffer_below_75% → IDLE`. Hook: `WHEN compress_complete → SEND compressed_buffer TO strike-orders`. Context: 8 slots, listen to `intel-feed`, ignore everything else.

Striker blueprint: Rules: `IF enemy_in_buffer AND enemy_adjacent → ATTACK`, `IF enemy_in_buffer → MOVE_TOWARD_enemy`, `IF no_enemy_in_buffer → PATROL waypoint_list`. Context: 4 slots (small, tight), listen to `strike-orders`.

She steps back and reads the channel map panel (auto-generated, right side): `intel-feed: Scout → Relay` and `strike-orders: Relay → Striker`. A clean two-hop pipeline. The board shows wiring lines: green dashed from scout ghost to relay ghost, cyan dashed from relay ghost to striker ghost.

**Minute 2:00 — The Sealed Watch**
EXECUTE. Ticks 1-3: Empty board, factory pulsing. Tick 4: Scout spawns at A2, immediately begins exploring. The factory conveyor advances — relay icon slides left. Tick 6: Scout scans, sees an enemy scout at C4. Hook fires — `intel-feed` carries signal. But the relay doesn't exist yet (spawns tick 7). **The signal is lost.** No recipient. The `intel-feed` channel line on the board flashes briefly then dims — a micro-animation signaling undelivered.

Priya inhales sharply. She didn't account for the spawn timing gap. The scout found intelligence before the relay existed.

Tick 7: Relay spawns. Tick 8: Scout scans again — this time the relay is alive. `intel-feed` delivers. Relay's buffer fills. Tick 9: Relay compresses and forwards on `strike-orders`. But striker doesn't spawn until tick 11. **Signal lost again.**

Tick 11: Striker spawns. Tick 12: Scout scans. Relay receives. Tick 13: Relay compresses, forwards. Striker receives. Finally, the pipeline is flowing. But the enemy scouts have been patrolling for 12 ticks — one is now at B3, adjacent to her base. Tick 14: Enemy scout tags her base tile. Resource drain begins.

Tick 18: Her striker finally reaches the enemy at B3 and eliminates it. But two more enemies are deep in the L-corridor, and her single striker can't handle a 1v2.

Mission result: 62/100 scenarios passed. Orange grade.

**Minute 4:00 — The Debrief Diagnostic**
Inspector. Priya scrubs to tick 6. Clicks the scout — buffer full of `ENEMY@C4`. Clicks the nonexistent relay position — "No unit at this position at tick 6." She scrubs forward to tick 7 — relay appears. She scrubs back to tick 6. Forward. Back. The gap is 1 tick. One tick of missing relay cost her the early warning.

She opens the queue depth chart for the relay. It's flat at zero until tick 7, then jumps. "I need the relay out first," she says. "Or... I need the scout to *wait* until the relay exists."

**Minute 5:00 — The Redesign**
Back to plan screen. She reorders the production queue: Relay first (tick 4), Scout second (tick 7), Striker third (tick 11). Now the relay exists before the scout begins scanning. But wait — the relay has nothing to do until the scout starts producing data. It's idle for 3 ticks. Priya adds a rule to the relay: `IF buffer_empty AND tick_count < 10 → MOVE_TOWARD base_perimeter` — a soft patrol while waiting for data.

She also adds a second striker to the queue (tick 15, cost permitting). Two strikers can handle a 2v1.

EXECUTE again. This time the pipeline flows from tick 8 onward. Both strikers engage by tick 20. 89/100 scenarios pass. Blue grade. Priya grins. "It's a deployment ordering problem. The system is a pipeline and the pipeline has startup latency."

She recognizes this. It's her day job — deploying microservices with dependency ordering. The game just taught her something she already knows, but through a completely different interface.

**UI Annotations:**
- Production queue conveyor: horizontal strip at top of workbench, blueprint icons slide left as ticks advance, current-producing icon has a spinning gear overlay, next-up icon has a pulsing border
- Ghost preview on board: translucent unit icon at spawn position, with a small "t4" / "t7" / "t11" label showing spawn tick, connected by faint wiring lines to other ghosts
- Undelivered signal flash: channel wiring line briefly illuminates orange (not green) when a signal fires but has no living recipient, accompanied by a soft descending tone (two notes, major to minor)
- Queue depth chart: mini bar chart in debrief sidebar, x-axis = ticks, y-axis = buffer fill, color gradient (blue→amber→red at capacity), flat zero section clearly visible as "dead air"

---

### Journey 3: Marcus, 45, Retired Marine, Now Streams Puzzle Games — The Meta-Mastery Moment

**Context:** Mission 8. Marcus has beaten everything with clean architectures. He understands hooks, channels, buffer management, production timing. Mission 8 introduces the **command agent** — an agent whose skills include `REASSIGN_SKILL`, `REROUTE_HOOK`, and `ADJUST_RULE_PRIORITY` for subordinate agents. The enemy has adapted: 4 strikers and a jammer that can flood channels with garbage signals.

**Minute 0:00 — The Command Agent Blueprint**
Plan screen. Marcus drags a new unit type onto the conveyor: the Command agent. Its skill list is different from anything he's seen. Instead of `SCAN` or `STRIKE`, it has:
- `REASSIGN_SKILL(target_agent, skill_id, on/off)` — toggle a subordinate's skill remotely
- `REROUTE_HOOK(target_agent, old_channel, new_channel)` — rewire a subordinate's hook target
- `ADJUST_RULE_PRIORITY(target_agent, rule_id, new_position)` — reorder a subordinate's rule stack

Marcus reads each skill description twice. "So this unit doesn't fight. It manages." He sets up the rules:
1. `IF channel_noise_detected ON intel-feed → REROUTE_HOOK(scout_1, intel-feed, intel-feed-backup)`
2. `IF striker_count < 2 → REASSIGN_SKILL(relay_1, COMPRESS, off) AND REASSIGN_SKILL(relay_1, EMERGENCY_BROADCAST, on)`
3. `IF all_enemies_eliminated → ADJUST_RULE_PRIORITY(all_strikers, PATROL, position_1)` — switch from combat to mop-up

He sets the command agent's context config: 12 buffer slots (large — it needs to monitor everything), listen to ALL channels. Its hooks: `WHEN subordinate_eliminated → SEND alert TO command-channel`.

**Minute 2:00 — The Jammer Crisis**
EXECUTE. Ticks 1-8: Standard pipeline deployment. Scout, relay, two strikers. Clean. Tick 9: Enemy jammer activates. `intel-feed` channel floods with garbage — 20 fake `ENEMY@` signals per tick. The relay's buffer fills instantly with junk. Compression produces gibberish. Strikers receive nonsense coordinates — they jitter randomly, moving toward phantom enemies.

Marcus watches through the sealed phase. His strikers are confused, zigzagging across the board. The buffer bars on each striker flash angry red — full capacity, all garbage. "That's a DDoS," he says into his stream mic.

Tick 12: Command agent's rule 1 fires. `channel_noise_detected` — the command agent's own buffer (12 slots, listening to everything) detected that `intel-feed` has >80% unverified signals. It executes `REROUTE_HOOK(scout_1, intel-feed, intel-feed-backup)`. On the board, the green wiring line from scout to relay dims and disappears. A new line appears: `intel-feed-backup`, routing scout directly to command agent.

Tick 13: Relay stops receiving new intel (old channel is now empty). Its buffer begins to evict stale garbage entries. Command agent receives clean scout data on `intel-feed-backup`, compresses it locally (it has a `COMPRESS` skill that Marcus added as backup), and forwards on a new channel `verified-orders` that only connects to strikers.

Tick 15: Strikers receive clean coordinates again. They re-orient. By tick 20, they've eliminated 2 of 4 enemy strikers. By tick 30, the jammer is flanked and destroyed. `intel-feed` returns to normal, but Marcus's architecture has already adapted — the backup route stays active (no rule to revert it, and the command agent doesn't detect noise on a clean channel).

Tick 40: All enemies eliminated. Command agent's rule 3 fires: all strikers switch to `PATROL` mode and sweep the board. Mission complete. 94/100.

Marcus leans back on stream. "Chat. Chat. I just watched my own command agent run an incident response playbook. I didn't tell it to reroute in real time. I told it *under what conditions to reroute*. And then it did. That's... that's an SRE runbook. In a game."

**Minute 5:00 — The Stream Clip**
Marcus replays the sealed watch. At tick 12, the rerouting animation plays: the old wiring line dissolves in a shower of orange particles (disrupted), the new line traces itself in bright cyan from scout through command agent to strikers. The board briefly shows two networks overlapping — the broken one fading, the healthy one brightening. Marcus clips it. "ROBOT UPRISING: MY AI RUNS ITS OWN INCIDENT RESPONSE" — 47k views in 24 hours.

**UI Annotations:**
- Channel noise visualization: when a channel carries >50% unverified signals, the wiring line jitters and distorts (like static on a cable), intensifying with noise level; at >80%, the line turns orange and the channel name text scrambles briefly
- Rerouting animation: old line dissolves in a cascade of orange sparks (left to right, ~300ms), new line traces itself in cyan (origin to destination, ~400ms), briefly both visible during crossover
- Command agent tile: distinct icon (🧠 or circuit-board motif), buffer bar is wider than other units (12 slots visible), active skill name pulses when firing (`REROUTE` text flashes near the tile for 1 tick)
- Jammer enemy tile: distinct icon (📡 with red pulse), emits expanding concentric red rings on the board every tick it broadcasts (rings fade at ~3 tile radius)

---

## Strengths

### 1. Perfect Debuggability — "The Git Blame of Games"
Every agent action has a complete causal chain: world state → buffer contents → rule evaluation → action. The debrief can show *exactly* why any agent did anything. No black boxes. No "the AI decided." This is the core educational promise: the player learns to trace causation through information architectures, which is exactly the skill needed for real agentic AI engineering.

### 2. Reproducibility Enables the Inspector
The locked two-act debrief structure (sealed watch → inspector) works *because* the system is deterministic. The inspector can show the exact same state at every tick because there's only one possible history. Nondeterministic systems would require recording every random decision, adding complexity and storage.

### 3. The Combo Discovery Payload is Purer
When an emergent behavior arises from a deterministic system, the player knows *they* created it. There's no "the RNG got lucky." The flanking maneuver happened because of the architecture. This makes the eureka moment more satisfying and more educational — the player can trace the combo back to their design decisions.

### 4. Async Multiplayer is Trivially Fair
Gladiabots proves it: deterministic configs can be matched asynchronously without fairness concerns. Both configs are submitted, the battle is resolved on a deterministic engine, the result is canonical. No server-side randomness, no lag compensation, no desync risk. The Gauntlet mode is architecturally simple.

### 5. The Vocabulary is Honest
"Skills, rules, hooks, context" — the game's vocabulary maps 1:1 to real agentic AI engineering because the underlying model *is* real agentic AI engineering. There's no metaphorical layer. A deterministic rule engine with event hooks and a context buffer is literally what frameworks like LangGraph, CrewAI, and Claude's agent SDK implement (minus the LLM). The educational transfer is direct.

---

## Weaknesses

### 1. The Personality Ceiling
Deterministic agents can feel like vending machines. You put inputs in, outputs come out. There's no sense that the agent has *preferences*, *moods*, or *personality*. In a game about leading a robot uprising, the robots might feel too robotic — not in the charming sense, but in the lifeless sense. The player might not anthropomorphize them, which reduces emotional investment.

**Mitigation:** Named agents with visual personality (different idle animations, different "voice" in their signal formatting) can create the *illusion* of personality without touching the deterministic core. A scout named "Patches" that has a unique scan animation and whose signals include a slightly different format string feels different from "Scout-7" even though mechanically they're identical.

### 2. The Solved-Game Risk for Veterans
A sufficiently skilled player can eventually find a "universal config" — a blueprint set and production queue that handles most missions with minimal modification. At that point, the game becomes a solvable puzzle, not an endless sandbox.

**Mitigation:** The 100-variant test cases help enormously (from the Zachtronics robustness pattern, aspect 1.04e). But the real mitigation is the **Gauntlet** — asynchronous PvP where the opponent's deterministic config is the variable. No universal config beats all human opponents, because humans keep innovating. The campaign can be solved; the Gauntlet cannot.

### 3. The Debugging Tax
Full determinism means every failure is the player's fault. There's no "bad luck" to blame. For some players, this is liberating (Into the Breach players love it). For others, it's exhausting — every loss demands a diagnostic session in the inspector, every diagnostic session reveals a specific mistake, and the relentless accountability can feel punishing.

**Mitigation:** The game's mission difficulty curve must be carefully tuned to introduce one concept at a time (the locked 10-mission arc does this). And the debrief tools should surface *the most impactful change* rather than requiring the player to find it themselves (the Minimum Fix Explorer, aspect 4.20).

### 4. The Spectator Problem
Watching deterministic agents is less exciting than watching nondeterministic ones. A StarCraft pro game has moments where a player makes a split-second decision that changes the outcome. Robot Uprising's sealed watch has no such moments — every action was predetermined by the config. The tension comes from *not knowing what will happen*, not from the agents making dramatic choices.

**Mitigation:** The sealed watch mechanic (hiding the outcome until viewed) creates tension artificially. The false pivot phenomenon (aspect 4.69e-ext-A-ii) — replays where the outcome *appears* to reverse — provides dramatic moments even though they're predetermined. The game's drama is in the *reveal*, not the *decision*.

---

## Interaction Effects

### With Buffer Models (2.01–2.05)
Deterministic intelligence makes buffer design **the primary source of behavioral variety**. If agents were nondeterministic, the buffer would be one of many factors affecting behavior. With pure determinism, the buffer IS the variable. This elevates the entire Wave 2 buffer design space — every buffer model becomes a different "personality engine" for deterministic agents.

### With Building Block Paradigms (Wave 3)
The fully deterministic model strongly favors **visual, composable** building blocks over text-based programming. Because the player needs to reason about rule ordering, hook wiring, and buffer flow simultaneously, the workbench must make these relationships visible. A text editor would work (Screeps proves it), but the educational accessibility goal requires visual representation.

### With the Sealed Watch (Locked)
**Perfect synergy.** The sealed watch is designed for deterministic systems — the tension of watching comes from the gap between the player's expectations and the actual outcome. With nondeterministic agents, the player would expect unpredictability, reducing the sealed watch's impact. With deterministic agents, every surprise in the sealed watch is a *design surprise* — "my architecture did something I didn't predict" — which is exactly the emotional payload the game wants.

### With the Inspector (Locked)
**Enabler.** The inspector's click-to-inspect, tick-by-tick replay is only possible because the system is deterministic. The inspector can reconstruct any agent's state at any tick without recording every frame — it just re-executes the deterministic simulation up to that tick.

### With Command Agents (3.17–3.19)
Deterministic command agents create the game's deepest skill expression. A command agent that rewires hooks mid-battle is executing a **deterministic meta-program** — a program that modifies other programs. This is the "factory of factories" feeling the spec calls for. With nondeterministic agents, command agents would feel less precise — "I told it to reroute and it kind of did." With deterministic agents, the rerouting is exact and inspectable.

### With the Gauntlet (Async PvP)
**Architectural prerequisite.** The Gauntlet's deploy-once/watch-once model requires deterministic resolution. If agents had random elements, two players watching the same match could see different outcomes (unless seeded, but seeded randomness is functionally deterministic anyway).

---

## Comparable Games/Media

### Gladiabots — The Direct Ancestor
The closest comparable. Deterministic visual AI programming, asynchronous PvP tournaments, emergent behavior from simple rules. Robot Uprising extends Gladiabots by adding the buffer/context mechanic (Gladiabots agents have implicit memory, not explicit buffers) and the command agent meta-level.

### Into the Breach — The Deterministic Tension Template
Perfect information, deterministic resolution, puzzle-like feel. Into the Breach shows that determinism + known enemy intent = satisfying tactical decisions. Robot Uprising differs in that the player designs agents beforehand rather than controlling them in real-time, but the information-clarity philosophy transfers.

### TIS-100 / Shenzhen I/O — The Programming Satisfaction Model
Deterministic node-based computation. The satisfaction comes from watching your program execute correctly on test inputs. Robot Uprising translates this to the battlefield — watching your agent architecture handle 100 scenarios is the same feeling as watching your TIS-100 code pass all test cases, but with explosions and flanking maneuvers.

### Factorio — The Pipeline Optimization Feeling
Factorio's belts are deterministic. Items move at fixed speed, splitters divide deterministically, inserters pick up in fixed order. The satisfaction of a perfectly balanced production line is the same satisfaction Robot Uprising wants from a perfectly balanced agent pipeline. The difference: Factorio's items don't make decisions. Robot Uprising's signals affect agent behavior, adding a feedback loop.

### Baba Is You — Rules As Game Objects
Baba Is You makes the rules of the game into manipulable objects. Robot Uprising (with command agents) does the same — the command agent's skills manipulate the rules that govern other agents. Both games create a meta-level where understanding the rule system *is* the game.

---

## Sensory Description

### The Plan Screen
The workbench panel hums with quiet potential. Blueprint cards have a matte dark surface with hairline borders — steel grey for scouts, warm amber for relays, sharp red for strikers. Each card has a circuit-trace pattern etched into its background that brightens when the player hovers, revealing the internal wiring. Rule rows glow softly when active — a green left-border pip that pulses once per second, like a heartbeat. Hook wiring on the board is drawn as dashed lines that pulse with a traveling-dot animation (a signal packet moving from source to destination at 1 tile per 200ms), colored by channel — each channel gets a unique hue from a muted palette (teal, goldenrod, plum, slate blue). The channel name floats above the line in 9px monospace, fading to whisper-opacity after 3 seconds.

### The Sealed Watch
Tick. Snap. The clock at top center advances one pip — a bright white dot joining a row of dim ones. All units snap to their new positions simultaneously, with a subtle 50ms scale-bounce (scale from 0.9 to 1.05 to 1.0). No tweening between positions — the Into the Breach clarity of instant state changes. Signal delivery flashes as **green ring pulses** emanating from the receiving unit's tile (expanding ring, 150ms, fades to transparent). Combat flashes as **red cross bursts** on the target tile (four red lines extending from center, 200ms, with a sharp crackling sound like static discharge). Buffer bars at the bottom of each unit tile fill or drain visibly — each pip appearing as a tiny bright rectangle that slides in from the right, or disappearing with a quick fade when evicted. An overloaded buffer bar jitters — the entire bar vibrates 2px left-right at 30Hz for 500ms, accompanied by a soft crackling sound.

### The Inspector
Cold. Analytical. The color palette shifts: warm battle colors drain to a blue-grey monochrome with selective highlights. The scrubber bar replaces the tick clock — a horizontal track with a draggable handle, each tick marked as a vertical notch. Arrow keys step one tick at a time with a soft *click* sound (like an old slide projector advancing). Clicking a unit opens its buffer panel as a vertical stack of slots — occupied slots have bright white text on dark backgrounds, empty slots are hollow outlines. The queue depth chart renders in real-time as the scrubber moves — a small bar chart that animates as if being drawn, each bar rising or falling with a 100ms ease-out transition. Green bars for healthy buffer levels. Amber bars for >75%. Red bars for full.

### The Sound
The overall audio is **industrial ambient**: distant fan noise, the hum of electrical systems, occasional metallic clicks. Each tick has a signature sound — a crisp digital *tick* (like a metronome with a metallic overtone). Signal delivery has a soft ascending chime (two notes, minor third interval). Combat has a sharp static burst. Buffer overflow has a descending warble (three notes, diminishing). The factory producing a unit has a satisfying mechanical *chunk-whirr* (engagement of gears, then a brief servo spin). The inspector has near-silence — just the slide-projector click of tick advancement and the quiet hum of data.
