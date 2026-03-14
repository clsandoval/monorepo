# Mission Design: The Robustness Scenario Pattern

**Aspect:** 1.04e — The 100-test-case robustness pattern
**Category:** Campaign / Mission Design
**Wave:** 1 (Competitive Analysis Derivation)
**Source game:** EXAPUNKS (Zachtronics, 2018)

---

## The Core Insight

EXAPUNKS runs every player solution against **100 test cases** with randomized inputs. This single design decision is arguably the most important transferable mechanic for Robot Uprising — not because it's unique in games, but because it forces a specific cognitive mode: **thinking in distributions, not in specifics.**

When a player can hardcode a solution to the one example they see, they learn to solve *that instance*. When the game runs 100 variants, they must build a solution that handles the *space* of possible instances. That's the difference between "I killed the enemy" and "I designed an army that kills this class of enemy." That cognitive gap is exactly the gap between puppeting units and architecting attention systems.

The pedagogical claim: **the randomization design directly determines which abstraction skills the game teaches.** This is not incidental. The game designer choosing what to randomize is making a curriculum decision.

---

## The EXAPUNKS Baseline

In EXAPUNKS, the 100 test cases typically randomize:

- **File contents** — specific values in files the player must process (not the structure, just the data)
- **Account numbers and IDs** — identifiers vary but maintain predictable structure
- **Record counts** — how many entries a file contains (tests whether loops terminate correctly)
- **Hardware register initial states** — starting sensor readings, display states, etc.
- **File ordering** — files in different hosts may arrive in different orders

What's NOT randomized:
- Network topology (the graph is always the same)
- The objective type (always "move file X to host Y" or "write value Z to register")
- Code constraints (the instruction limit stays constant)

So EXAPUNKS tests: "does your EXA handle *any valid data of this type*?" but NOT "does your EXA handle a different type of problem?"

This is the minimum useful tier of robustness. It teaches **value-agnostic programming** — you can't hardcode `COPY 3847 X` when the account number varies. But it doesn't fully test *structural* generality.

---

## Translating to Robot Uprising: Three Tiers of Randomization

Unlike EXAPUNKS where the input is data in registers, Robot Uprising's "input" is a battlefield scenario — the configuration of enemies, terrain, timing, and signal conditions that the player's agent architecture must handle. What can vary?

### Tier 1 — Data Variation (EXAPUNKS-style): Values change, structure stays fixed

The simplest randomization. The mission shape is identical but specific parameters vary. Teaches: write architectures that don't depend on specific values.

Examples:
- Enemy patrol routes follow the same loop shape, but the loop is clockwise or counterclockwise (direction varies)
- Resource nodes exist in the same zone but at different exact coordinates
- The enemy squad has between 3 and 7 units (count varies within a range)
- The detection alarm fires between tick 15 and tick 40 (timing varies but always fires)
- The objective building is in the same sector but positioned slightly differently each run

**What this teaches:** Do not write hooks that fire only on specific coordinate values. Do not write rules that assume exactly 5 enemies. Design architectures that respond to categories of events (enemy detected, resource found) rather than specific instances (enemy at position 42,7).

### Tier 2 — Structural Variation: The problem shape itself changes

More demanding. The mission's fundamental geometry or dynamics shift across variants. Teaches: design architectures that abstract away structural assumptions.

Examples:
- The flanking approach the enemy uses: in 40% of variants they come from the north, in 30% east, in 30% south — your scout must cover all vectors
- Whether the mission has 2 or 3 possible infiltration routes (your architecture must cover all active ones)
- Whether the objective is stationary (easy) or moving (hard) — your striker assignment must work for both
- Whether the command signal arrives before or after the enemy arrival (order-independence problem)
- Whether there are 1 or 2 distinct threat types in play simultaneously (scales your hook tree)

**What this teaches:** Don't assume directional symmetry. Build commutative hook trees (hook fires regardless of arrival order). Build multi-vector coverage rather than single-assumption response.

### Tier 3 — Constraint Variation: Your own resources and limitations change

The hardest tier. The player's configuration tools, budget, or initial conditions vary. Teaches: design for graceful degradation, not peak-condition performance.

Examples:
- You have 3, 4, or 5 agents available (you designed for 5; can 3 still complete the objective?)
- Your buffer size is 4 slots (not the comfortable 6 you usually have)
- One of your hooks comes pre-installed from a previous operation but may have degraded fidelity
- Your command agent starts with partial intel already in buffer (foreign data consuming slots)
- Fabrication point budget varies: sometimes you can spawn 2 specialists mid-battle, sometimes none

**What this teaches:** Design for failure tolerance, not optimal-condition success. The strongest architectures work when missing a piece. Don't rely on any single agent as a single point of failure.

---

## The Failure Mode: Overfitting

The most interesting failure mode the robustness pattern creates is **overfitting** — when the player solves the preview run (the one scenario they can observe), and their solution fails on variants they never considered.

**EXAPUNKS example:** You see a file with 3 entries. Your EXA loops exactly 3 times, hardcoded. 60/100 test cases have different counts. Mission fails at 60%.

**Robot Uprising examples by tier:**

**Tier 1 overfit:**
> Your scout has a hook: `IF enemy_at_grid_position(42, 7) → alert_striker`
> On 40% of variants, the enemy is at (42, 8) or (43, 7). Hook never fires. Your striker waits forever.
> Debrief: *"SCOUT_01 hook triggered on 60/100 scenarios. The trigger condition is position-specific. Enemy patrol endpoints vary by ±2 grid units. Recommended fix: expand trigger radius or use category trigger (ENEMY_IN_ZONE_NORTH)."*

**Tier 2 overfit:**
> Your scout only watches the north approach. Architecture assumes all enemies come from north.
> 40% of variants have east-vector approaches. Scout never detects. Striker fires on predicted timing anyway, hits nothing.
> Debrief: *"No detection signal generated on 40/100 scenarios. SCOUT_01 coverage zone excludes eastern quadrant. Striker activated on schedule rule (tick 30) rather than detection hook. 0 confirmed eliminations on miss-cases."*

**Tier 3 overfit:**
> Your command agent spawns 2 specialists mid-battle (fabrication cost: 4 points). Works with 6-point budget.
> 30% of variants allocate only 3 fabrication points. Spawn fails silently. Specialists never arrive.
> Debrief: *"SPAWN_EVENT triggered at tick 42 on 70/100 scenarios. On 30/100, fabrication cost (4) exceeded available budget (3). Spawn blocked. Objective completion rate: 70%. Recommended: add budget-check rule before spawn trigger, or reduce spawn cost to 2."*

**The pedagogical perfection of this failure mode:** The game doesn't tell the player they failed because their hook was "too specific." It shows them exactly which scenarios failed and what state their agents were in when it happened. The player discovers the abstraction lesson by watching their architecture fail in slow motion.

---

## Named Failure Archetypes: The Curriculum of Robustness

Good mission design in the robustness scenario pattern requires intentionally crafting scenarios that expose specific failure archetypes. These are the "test case traps" — failure modes that every player should discover at least once.

### "The Invariant Trap"
A puzzle where 80% of test cases happen to have an invariant the player exploits. Enemy always arrives from the north — not because the mission specifies it, but because 80% of random cases generate north-arrival, and the player sees north-arrival in the preview. Their architecture works. Then the 20% of south-arrivals fails.

**Curriculum value:** Forces recognition that "worked on the preview" ≠ "is correct." Teaches probabilistic thinking — design for the whole distribution, not just the mode.

**EXAPUNKS analog:** "The file always starts with value 0 in the first 60% of test cases" — players who exploit this get bitten by the 40% where it doesn't.

### "The Count Problem"
Enemy count varies from 1 to 8. A player who designed their hook tree to handle exactly 5 enemies (the preview count) has: 5 striker assignments, 5 detection zones, 5 hook chains. With 6 enemies, one is unhandled. With 3, unused chains idle and waste buffer.

**Curriculum value:** Teaches *cardinality abstraction* — build assignment logic that scales to N, not a fixed number. In practice: use a "nearest available striker" dispatch rule rather than "striker #3 handles enemy #3."

### "The Timing Ambush"
A critical signal arrives anywhere between tick 10 and tick 50. An architecture that assumes early arrival (rule: "striker fires at tick 20 if scout has reported") fires correctly on early-signal cases. On late-signal cases, striker fires first (nothing to hit), then scout reports (striker is already done, no response). 0 effectiveness.

**Curriculum value:** Teaches *trigger-based vs. scheduled-based* action design. If your agent acts on a schedule rather than on a hook trigger, timing variation will break it. Fix: striker fires when hook receives detection signal, not when clock says "now."

### "The False Positive"
Some test cases present no actual threat. Enemy patrol reaches the perimeter and turns back without entering. An architecture with aggressive preemptive firing wastes fabrication resources and potentially fires on friendlies or objectives.

**Curriculum value:** Teaches *confirmation requirements*. Don't fire on prediction. Fire on detection. The distinction between "enemy is approaching" and "enemy has entered zone" is not academic — it costs resources when you get it wrong.

### "The Order Reversal"
Two signals must both arrive before a striker fires. The player's hook chain assumes Signal A then Signal B (because that's the order in the preview). 30% of test cases send Signal B first. A chain built as `A → armed_flag; B+armed_flag → fire` handles both orders. A chain built as `A → wait_for_B → fire` deadlocks when B arrives first (the "wait" fires before A sets the armed flag).

**Curriculum value:** Teaches *commutative hook design*. Any gate that requires multiple inputs must be order-independent. This maps directly to real distributed systems engineering — you can't assume message order in async networks.

### "The Orphaned Chain"
An agent that's essential to a 3-link hook chain is removed from the scenario (tier 3 randomization). The chain breaks silently. No signal is dropped — the signal simply never reaches its destination because the middle agent doesn't exist.

**Curriculum value:** Teaches *fault tolerance in hook chains*. Long chains have more failure points than short chains. Command agents should detect chain breaks (no acknowledgment within N ticks) and reroute.

---

## How Many Test Cases? The Design Parameter Space

EXAPUNKS uses 100. Why 100? Enough to surface most failure modes, not so many that individual failures are invisible. The player sees "passed 60/100" and that's immediately legible.

Options for Robot Uprising:

**10 test cases (fast feedback)**
- Shows pass/fail rate quickly
- 10% granularity can hide borderline solutions (90% pass might mean "accidentally works")
- Better for early campaign missions where exact robustness matters less
- Faster execution, lower cognitive load during debrief

**25 test cases (mid-range)**
- 4% granularity — distinguishable from 80% vs. 84%
- Balances feedback speed with statistical relevance
- May miss rare edge cases (a 5% failure mode might not appear in any of 25 cases)

**100 test cases (EXAPUNKS default)**
- 1% granularity — very precise about failure rates
- Statistical stability: even a 95% passing architecture will almost certainly fail at least once
- Appropriate for mid-to-late campaign missions with higher stakes
- Execution time matters more at scale — if each case is a 5-second sim, 100 cases = 8+ minutes

**Variable test counts as difficulty**
- Easy missions: 10 cases, narrow randomization range
- Medium missions: 25 cases, wider randomization
- Hard missions: 100 cases, tier 2-3 randomization
- Elite (optional) missions: 200 cases, cross-tier randomization
- This creates a natural progression from "mostly works" to "provably robust"

**Recommendation for Robot Uprising:**
Start at 10 cases in the tutorial arc (player learns the feedback loop without being overwhelmed). Ramp to 25 by mission 4, 50 by mission 6, 100 by mid-campaign. Make 100 the standard for post-campaign content and leaderboard submissions. Allow the player to see which specific cases they failed (not just the count) in the debrief.

---

## The Debrief as Robustness Teacher

The robustness scenario pattern is only as good as its debrief. If the player sees "passed 60/100" with no further information, they have a grade but no lesson.

The debrief for a robustness mission should show:
1. **Pass/fail grid** — 100 small squares, each colored green (pass) or red (fail). Immediately legible. Click any red square to load that scenario's replay.
2. **Failure clustering** — which variables caused the failures? If 38 out of 40 failed scenarios share "enemy arrived from south," the debrief highlights: *"Failure cluster: eastern/southern approach. Hook coverage gap detected."*
3. **Per-agent state on fail** — for the selected fail case, show each agent's buffer at the moment of failure. What were they thinking? What did they miss?
4. **Comparative pass overlay** — show one passing scenario and one failing scenario side-by-side. Watch the scout's hook fire in one and not the other. The difference is immediately visible.
5. **Repair suggestion** — optional (toggle off for purists): a text note from the "tactical analysis system" suggesting one specific change. Not the full fix — a hint. *"SCOUT_01's ENEMY_DETECTED hook has position-specific constraint. Consider generalizing trigger condition."*

This debrief design transforms the robustness pattern from a testing mechanic into a *teaching mechanic*. The player isn't graded and moved on — they diagnose their own architecture's failure modes.

---

## Interaction Effects with Other Design Categories

### With Hook Semantics (from 1.04d)

Blocking hooks are far more dangerous in robustness scenarios. If two agents must synchronize (blocking rendezvous) and one of them doesn't appear in 30% of test cases (tier 3 randomization), the other agent blocks forever. 30% failure rate from a hook semantic choice alone.

Queued hooks are more robust — the signal is dropped if no receiver, but the sender continues. In scenarios where receiver agents may not exist, fire-and-forget or bounded queues fail gracefully instead of deadlocking.

**Design implication:** The game should teach this connection explicitly — a mission that fails because of blocking + tier 3 randomization (missing agent) should show "DEADLOCK" clearly in the debrief, with a suggestion to switch to queued semantics for that hook.

### With Spawn Semantics (from 1.04c)

In tier 3 randomization (fabrication budget varies), spawn-dependent architectures are fragile. An agent that spawns 2 specialists on detection is great at 6-point budget and broken at 3-point. This teaches: spawning should be conditional on fabrication availability, not assumed.

A spawn-focused architecture should have a fallback path — if fabrication is too low to spawn a specialist, the command agent itself performs a degraded version of the specialist's job (less efficiently, but functional). This is a high-level design pattern — fault-tolerant spawn trees — that the robustness pattern forces players to discover.

### With Buffer Models

A large buffer is more robust to timing variation — it can hold observations from a wider time window before deciding. A small buffer (tier 3 randomization: buffer size varies) fails when timing variation causes relevant signals to arrive outside the buffer window and get evicted.

This creates a meaningful tradeoff: players who optimize for buffer efficiency (tight, minimum-size buffers) are more sensitive to robustness scenarios. Players who keep buffer headroom are less efficient but more robust. The robustness scenario is where buffer sizing decisions have visible consequences.

### With the Histogram System

Post-robustness-mission histograms should show *pass rate distributions*, not just optimization metrics. The histogram for a robustness mission might show: "pass rate distribution: 60% of players pass 80%+ of cases; 20% pass 100%; 20% pass <50%." This communicates that the mission has a tricky failure mode most players hit.

The histogram creates social learning — when your 70% pass rate appears in the lower half of the distribution, you know the 100%ers figured something out. When your pass rate jumps to 100% after a config change, and you see the histogram shift left, you feel the collective improvement.

---

## Player Journeys

### Journey: Maya, 24, Software Developer (Backend Infrastructure)

**Context:** Mission 4 — "Signal Relay." Maya has completed the first 3 tutorial missions and fully understands hooks. This is her first mission with robustness testing. Preview shows 5 enemy units entering from the north.

**Minute 0:00 — Configuration**
Maya's screen shows the familiar workbench: two scouts on the northern perimeter, one relay in the center, two strikers near the objective. She builds her hook chain: `SCOUT_01.ENEMY_DETECT → RELAY.forward_alert → STRIKER_01.engage`. She hardcodes the trigger: "fire when enemy enters northern sector." Works in her head. Feels clean.

She hits **[Execute]**.

**Minute 0:30 — The Preview Run**
The preview plays back. Enemy enters from north. Scout detects at tick 23. Hook fires. Relay receives at tick 24. Strikers engage at tick 25. Clean. Elegant. She leans back. This is satisfying.

**Minute 0:45 — 100-Case Grid Appears**
The pass/fail grid renders on the right half of the screen — 100 small squares, 10×10. Squares start green and flip to red as cases process. Most stay green. But 35 flip red, clustered in a specific pattern. 65/100.

*Maya: "Huh. 65%?"*

She's confused. Her solution worked perfectly on the preview.

**Minute 1:00 — Clicking a Red Square**
She clicks one of the red squares. The debrief loads case #37. A replay begins. Enemy enters — but from the east side. Her scouts are both positioned on the north perimeter. Neither one activates. No detection hook fires. The relay has nothing to forward. The strikers never engage. The enemy reaches the objective unopposed.

*Maya immediately understands.* She's a backend engineer. She knows what this is. "Oh, I hardcoded the coverage zone. Like selecting by IP address instead of by network mask." She already knows the fix before the debrief suggests it.

**Minute 1:30 — The Fix**
She opens the scout configuration, changes trigger from `ENEMY_IN_SECTOR(NORTH)` to `ENEMY_IN_ZONE(perimeter_any)`. But she also notices: her scout positions. Both are on the north wall. She moves one to the east wall.

*She's now making a structural change, not just a data change.* That's the tier 2 lesson.

**Minute 2:00 — Second Run: 94/100**
94 green squares. 6 red. She clicks one. Enemy enters from south-southwest, at a diagonal that her zone coverage barely misses. A corner case. She expands the zone slightly.

**Minute 2:45 — 100/100**
All green. The screen pulses briefly — a cool blue wash, like a system completing a handshake.

*What Maya learned:* Don't scope hooks to positions. Scope them to categories. Every "position-specific" rule is a latent bug waiting for a different starting condition. This feels *very* familiar from production engineering. She's now thinking about Robot Uprising in terms of coverage zones and failure distributions. Exactly right.

**UI Annotations:**
- **Pass/fail grid**: 100×1px squares in a 10×10 block. Green = pass (#3ddc97), red = fail (#e45c3a). Renders incrementally as cases process — the count animates up, red squares flicker in. Hovering any square shows "Case #XX: PASS/FAIL" tooltip. Clicking loads that case's replay.
- **Failure cluster annotation**: After all cases process, if 3+ red squares share a specific variable value (e.g., enemy approach direction = EAST), a bracket annotation appears on the grid: "35 failures: approach=EAST/SOUTH. Coverage gap detected." The annotation is highlighted amber, non-intrusive, dismissible.
- **Comparative replay**: A "Compare" button appears when looking at red square replays. Splits the view: green case on left, red case on right, both playing simultaneously from the same tick. The divergence point (where one scout fires and the other doesn't) glows briefly.

---

### Journey: David, 38, Middle-School Teacher, Casual Gamer, No Programming Background

**Context:** Mission 5 — "Ambush Protocol." David has been playing for two evenings. He's starting to understand hooks but still thinks of agents as units he's "giving orders to." He doesn't yet think in terms of architectures.

**Minute 0:00 — The Preview**
David watches the preview run once, then twice. The enemy comes from the left. His strikers need to go to the left. Simple. He drags his three strikers toward the left side, sets up a basic hook: "if enemy, then attack."

His solution feels obvious to him. He's happy.

**Minute 0:30 — The Grid**
47/100 green. Majority red. David stares at this.

*David: "...47? How? I watched it. I did it right."*

He doesn't click a red square. He sits there confused for a moment.

**Minute 0:45 — The Failure Cluster**
The bracket annotation appears: **"53 failures: enemy spawned from RIGHT side (52%), BOTH sides (1%)."**

David reads this carefully. He didn't know the enemy could come from the right. Nobody told him that. He assumed left.

He opens a red square. Watches the replay. Enemy enters from the right. His strikers go left. Everyone dies.

*David is now having his first real "ah" moment.* He wasn't wrong about what to do — he was wrong about what the problem was. He assumed one scenario. The mission has multiple scenarios.

**Minute 1:15 — Rebuilding**
David doesn't know how to write a hook that covers both sides. He reads the failure cluster annotation again: *"Coverage gap detected: enemy approach RIGHT."* He drags his three strikers to the center. If they're in the middle, they can go either way when the hook fires.

Then he adds a second hook — "if enemy from right, then go right." He didn't think of this before.

**Minute 1:45 — 71/100**
Better. Still red squares. He clicks one. Enemy came from both sides simultaneously. His strikers all went right (first hook fired, then nothing). Left side undefended.

David stares at this. His mental model shifts again. Not just "left or right" — "both at once."

**Minute 3:00 — A Different Strategy**
David tries something different: instead of pre-assigning strikers, he sets up a hook that assigns the nearest striker to each detection event. He doesn't know the vocabulary for this exactly — but he drags a "proximity assignment" rule he found in the rule browser onto the striker agents. He tries it.

98/100. Two failures (edge cases he can't figure out). He accepts it and moves on. The two failures feel okay. He'll try again later.

*What David learned:* The game isn't about solving the example you can see. It's about solving a type of problem. He went from "I see five enemies from the left" to "I need to handle enemies from anywhere." That's a large conceptual shift, delivered through failure, not instruction. He didn't read this — he discovered it by watching his soldiers fail.

**UI Annotations:**
- **Failure cluster annotation**: Written in plain language, not technical. "53 failures: enemy came from the right side" not "53 failures: `spawn_direction==RIGHT`." David needs human-readable feedback.
- **Rule browser**: A panel on the right of the workbench showing available rules as cards. "Proximity assignment" card shows a small animation — nearest striker icon moving toward a glowing enemy icon. David dragged this without knowing the exact mechanic. The animation conveyed enough.
- **Progress bar framing**: The pass/fail display should also show a progress message. At 47/100: *"Your architecture handles some of what the enemy can do. Keep refining."* At 71/100: *"Better coverage — but some approaches still caught you off-guard."* At 98/100: *"Near-complete coverage. Two rare scenarios fell through. Excellent architecture."* These messages prevent David from feeling like he's failing at math.

---

### Journey: Keiko, 19, Competitive Gamer / Speedrunner

**Context:** Mission 7 — "Full Spectrum Defense." Keiko has 12 hours in the game. She's optimizing everything. She's seen 100/100 pass rates on missions 1-6 and treats them as minimum bar, not achievement. This mission has tier 2-3 randomization: enemy count varies (3-9), approach direction varies (4 quadrants), AND fabrication budget varies (4-8 points).

**Minute 0:00 — The Preview Analysis**
Before she even configures anything, Keiko pauses the preview and reads the mission parameters. She's learned to look for what *varies*, not just what *is*. She finds: enemy_count: 3-9, approach: NSEW, fabrication_budget: 4-8.

*Keiko: "Three variables. I need to handle all their combinations. That's 7 × 4 × 5 = 140 distinct scenarios. 100 test cases is sampling from those 140."*

She starts sketching in the configuration not for the preview scenario, but for the *worst case*: 9 enemies, all quadrants simultaneously, 4 fabrication points.

**Minute 1:00 — Architecture Design (Tier 3 First)**
She starts with the constraint variation — fabrication budget. She builds the configuration assuming she might only have 4 points. Her spawn rule: `IF enemy_count > 5 AND budget >= 3 → spawn(specialist, 1)`. Below 3 points: no spawn. Above 5 enemies: try to spawn one. The specialist gets the "overflow assignment" role — handles any enemy that the primary strikers can't reach.

This is "graceful degradation design." She doesn't design for 8 points; she designs to still function at 4.

**Minute 2:00 — Architecture Design (Tier 2 Next)**
Four-quadrant coverage. She places scouts in all four corners. Hook: `ANY_SCOUT.ENEMY_DETECT → dispatch_nearest_available_striker`. The "dispatch nearest" rule is a single hook — it doesn't specify which striker, it queries availability.

This is "dynamic assignment" vs. "static assignment." Static assignment: striker #1 handles north. Dynamic: striker #1 handles whoever's closest and available.

**Minute 2:30 — Architecture Design (Tier 1 Finally)**
Enemy count. Her dispatch rule handles this naturally — if there are 9 enemies and only 4 strikers, the rule assigns strikers to first 4 detected, then waits for strikers to finish and reassign. She adds a "persistence" rule: striker doesn't return to standby until confirmation that assigned target is eliminated. This prevents two strikers chasing one enemy while another is ignored.

**Minute 3:00 — First Run: 91/100**
Not 100. She clicks red squares methodically. 9 of the red cases share a pattern: enemy count = 9, budget = 4, approach = all-quadrant simultaneously. All scouts fire at once, all hook dispatches fire at once, the dispatch rule tries to assign 9 targets with 4 strikers — but the assignment logic serializes the first assignment before making the second. Result: strikers 1-4 receive assignments at tick 5, 6, 7, 8 (sequential). Enemies 5-9 are unassigned for 5 additional ticks. They reach the objective.

*Keiko: "Race condition. The dispatch rule is synchronous internally."*

**Minute 3:30 — Parallel Dispatch Fix**
She adds a concurrent dispatch rule: each scout fires its dispatch hook independently, assignments can be processed in parallel (the rule system supports concurrent assignment if the targets don't conflict). She also adds a priority rule: assign to the enemy with highest threat level first (shortest time to objective), not first-detected.

**Minute 4:15 — 100/100**
All green. The blue wash fills the screen. A brief fanfare — a crisp ascending tone, then silence.

But Keiko is already looking at the metrics panel: 847 cycles (simulation ticks × active agents), 22-point buffer usage across all agents, 9 hooks executed. She's in the 63rd percentile for efficiency. She has work to do.

*What Keiko learned:* The tier 3 randomization forced her to think about worst-case scenarios first, not average-case. That's a rare cognitive discipline in games — most strategy games let you optimize for the expected case. The variable fabrication budget specifically forced graceful degradation design. The concurrency bug in her dispatch rule was a real distributed systems failure mode, and she diagnosed it correctly by reading the failure cluster data. This felt like real engineering, not a game.

**UI Annotations:**
- **Mission parameters panel**: Visible before configuration. Shows variable ranges as colored bars: `enemy_count: [3──────────9]`, `approach: ●N ●S ●E ●W`, `fabrication_budget: [4──────8]`. A "worst case scenario" button generates one test run using max-stress parameters.
- **Failure clustering (advanced)**: For Keiko, the annotation should show interaction effects: "9 failures: enemy_count=9 AND budget=4 AND approach=ALL4". Multi-variable clustering. This is the pattern she needs.
- **Efficiency metrics panel**: After 100/100, this panel unlocks. Shows histogram for cycles, buffer usage, hook activations. Keiko is looking at this immediately.
- **Achievement overlay**: "FULL COVERAGE — 100/100 scenarios handled" appears briefly in the center of the screen, white text on dark, then fades. No fanfare — just acknowledgment. The histograms are the real reward.

---

## Sensory Description

**The pass/fail grid rendering:**
A 10×10 grid of small squares, each about 8px, spaced 2px apart, appears in the right half of the debrief screen. As cases process (a progress bar shows "running 35/100"), squares light green immediately when a case passes — a crisp snap, like a switch clicking. When a case fails, the square lights red with a very brief pulse (100ms) of slightly brighter red before settling. If there are many failures, the red squares appear to *bleed* across the grid in a recognizable pattern — not random noise but a shape, which the brain immediately reads as "there's structure to this failure."

The moment 100 cases complete, the grid briefly brightens all squares simultaneously, then dims back. If 100/100, the entire grid turns cool teal-green and a single ascending tone plays — not triumphant, just clean. Resolved. If less than 100, the green squares stay green, the red squares pulse once more, and a quieter, unresolved tone sounds.

**The failure cluster annotation:**
A thin amber bracket appears to the right of the red square cluster. The bracket has a small "!" icon and one line of text in amber. It doesn't appear instantly — there's a 0.5-second delay, as if the system is "thinking." Then it fades in. The amber color is deliberately not red — it's diagnostic, not accusatory. "Here's what I noticed" not "here's what you did wrong."

**Clicking a red square for replay:**
The grid shrinks to 30% of its original size and anchors to the corner of the screen. The battlefield opens in the replay space. A dim countdown: "Loading Case #37..." then the sim starts. The replay runs at slightly faster-than-normal speed (1.5×). The moment the failure event occurs (the hook that doesn't fire, the striker that doesn't move), a dim red ring pulses briefly around the silent agent. Just once. Then the sim continues to completion.

**The 100/100 blue wash:**
When full coverage is achieved, the entire debrief screen washes with a cool blue-white light — not a flash, but a slow bloom, like a monitor waking up. The grid turns teal. A single clean tone plays (think: the sound of a correct answer in a well-designed puzzle game — satisfying but not overblown). Then it fades. The histogram panel appears. Work continues.

**The sound of a failing case:**
A very soft low-pitch click — like a relay switch not engaging. Not harsh. Not an error buzz. Just: "this one didn't connect." If you're watching the pass/fail grid and 40 cases fail, you hear 40 soft clicks, slightly irregular in timing. It sounds like rain on a tin roof. The density of failure has an auditory texture.

---

## Strengths

1. **Forces the right cognitive mode.** Players who can hardcode solutions never develop abstraction instincts. The robustness pattern makes abstraction mandatory. Every campaign mission that doesn't use it is a missed teaching opportunity.

2. **Failure is legible.** Unlike most game failures ("you lost, try again"), robustness failures carry detailed diagnostic data. The player isn't confused about why they failed — they can see exactly which scenarios they missed and what their agents were doing in those scenarios. Failure becomes curriculum.

3. **Multiple valid strategies remain valid.** A broad-coverage solution that passes 100/100 at 2000 cycles is as "correct" as an optimized solution that passes 100/100 at 800 cycles. The pattern doesn't force one correct answer — it sets a minimum bar (100%) with room for optimization above it.

4. **Scales with player sophistication.** Beginners can optimize for pass rate (get to 100/100). Veterans can then optimize efficiency. Two separate achievement spaces using the same mechanic.

5. **Teaches transferable skills explicitly.** Every abstraction lesson the robustness pattern teaches — value-agnostic triggers, commutative hooks, graceful degradation — has a direct real-world analog in distributed systems engineering. Robot Uprising players who internalize these lessons have learned something genuinely useful.

---

## Weaknesses

1. **Execution time.** If each test case is a 5-second simulation, 100 cases = ~8 minutes of automated testing. Players who iterate rapidly (try something → see results → adjust) need either fast simulation or a smaller default case count. Mitigations: step count caps per case, fast-forward mode, parallel case execution.

2. **Opacity of randomization ranges.** If the player doesn't know what's being randomized or across what range, they can't reason about edge cases. EXAPUNKS shows the test inputs in the debrief; Robot Uprising must show the scenario parameters clearly.

3. **Premature optimization trap.** A player who gets 95/100 on first try may spend hours trying to find the last 5% rather than moving to the next mission. The histogram helps here (shows 95% is a common stopping point) but some guardrails may be needed — perhaps a "continue with 90%+" override option.

4. **Cognitive overload in early campaign.** Presenting 100-case failure data to a player who doesn't yet have a mental model of their architecture is overwhelming. Tier the case count with the campaign — start with 10, show the pattern, then scale up.

---

## Comparable Games/Media

**EXAPUNKS (Zachtronics, 2018):** The reference implementation. 100 test cases with randomized file data. Forces value-agnostic EXA code. Players describe this as the mechanic that makes EXAPUNKS feel like "real programming."

**TIS-100 (Zachtronics, 2015):** Also uses test cases, but presents them as a fixed sequence shown to the player upfront. Less robust testing — players can hardcode to the specific sequence. The lack of randomization makes TIS-100 more puzzle-like and less engineering-like.

**Screeps (Screeps LLC, 2016):** Your code runs in an MMO world against other players' code. The "test cases" are the adversarial environment — you never know exactly what you'll face. This is the extreme version of robustness testing: your code must handle all possible strategies other players might deploy.

**Automated Testing in Software Engineering:** The professional practice this most directly mirrors. Unit tests, property-based testing (QuickCheck), fuzzing — all of these are "run your solution against N generated cases to find cases you didn't think of." Property-based testing explicitly explores input spaces rather than specific examples, which is exactly the cognitive shift Tier 2-3 randomization teaches.

**Magic: The Gathering Tournament Preparation:** Deck building for a tournament where you don't know the meta involves designing a deck that handles a *distribution* of opponents, not a specific opponent. The best decks are "robust" to many strategies, not just optimized against one. Same cognitive mode: thinking in distributions.

**Dark Souls / Elden Ring Boss Design:** A boss that attacks from many directions, at variable timings, with variable attack sequences forces the player to build a *general response system* (dodge at this timing, parry at that timing, run during this animation) rather than a hardcoded memorized sequence. Robustness required by design.

---

## Newly Discovered Aspects for the Frontier

1. **5.19 — The "pass-rate plateau" problem**: Players who get 80/100 and feel done — designing campaign gates that require 90% rather than 100% for progression, while reserving 100% for cosmetic/leaderboard rewards; the psychological difference between "good enough" and "provably correct"

2. **2.19 — Variable scenario seeds as difficulty axis**: Replacing a single difficulty slider with a "scenario variance" dial — narrow variance makes missions more deterministic (tutorial-friendly), wide variance makes them extremely randomization-dependent (expert challenge); the dial as an explicit player control, not just a behind-the-scenes setting

3. **4.14 — The scenario parameter panel**: A pre-execution panel that shows what will vary in the 100 cases — ranges, distributions, variable types — so players can reason about edge cases before configuring (informed design vs. trial-and-error); whether to show this panel always or require a "tactical briefing" skill to unlock it

4. **8.07 — Robustness vs. efficiency as fundamental tension**: In optimization games (Opus Magnum), you optimize for cycles/cost. In robustness games (EXAPUNKS), you optimize for pass rate. Robot Uprising must navigate the tension between these two goals — a highly efficient architecture may be brittle (works for 90% of cases, fast); a robust architecture may be inefficient (works for 100%, slow). How do the histograms communicate both dimensions simultaneously?

---

## Sources

- EXAPUNKS base analysis: see `competitive-analysis/zachtronics-exapunks.md` (this repository)
- EXAPUNKS 100-test-case mechanic: described in player reviews as "the mechanic that makes EXAPUNKS feel like real programming" — Steam community discussions and review corpus
- Property-based testing: QuickCheck (Haskell), Hypothesis (Python) — the software engineering practice this mirrors
- ZACH-LIKE (Zachtronics, 2019): annotated design documents, available as free PDF on Steam; discusses puzzle design philosophy including test case structure
- GDC 2019 — "Open-Ended Puzzle Design at Zachtronics": Barth & Messinger-Michaels; covers the design philosophy behind multiple valid solutions and no-intended-answer design
