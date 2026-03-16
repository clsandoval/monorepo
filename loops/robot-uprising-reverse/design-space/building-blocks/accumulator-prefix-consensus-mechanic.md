# 3.05a-iii — The Accumulator Prefix as Consensus Mechanic

## Overview

The conditional prefix system (3.05a) gives Robot Uprising a powerful atomic building block: `+` (if true), `−` (if false), `?` (if unknown). Boolean composition emerges from sequencing — two `+ TEST` lines in a row yield AND; two separate `TEST → + JUMP` blocks yield OR. But the existing system has a blind spot: **there is no native primitive for "at least K of N conditions must pass."**

This document explores a **quorum prefix** — an accumulator that counts how many preceding TEST instructions passed and fires when a threshold is met. The mechanic maps directly to distributed consensus protocols (Raft, Paxos, Byzantine fault tolerance) and introduces majority voting as a first-class agent decision primitive. The player doesn't learn the word "quorum" until the Blueprint Codex tooltip — but they learn the concept by composing TESTaccumulate-threshold triplets.

The thesis: **consensus is too important a concept — in distributed systems, in multi-agent AI, and in democratic governance — to leave it as an emergent hack from boolean composition.** A dedicated accumulator prefix makes quorum expressible in 4 lines instead of 12, makes the intent legible at a glance, and opens design space for missions that teach distributed decision-making.

---

## The Primitive

### Formal Specification

Two new instruction types extend the prefix system:

```
TALLY [reset]         ← Reset the accumulator to 0
TEST [condition]      ← If condition passes, accumulator += 1 (regardless of prefix)
QUORUM [threshold]    ← Set flag = true if accumulator ≥ threshold, else false
```

The accumulator is a **per-evaluation integer counter** (not boolean). It starts at 0 at the beginning of each tick's rule evaluation. `TALLY` explicitly resets it (useful for multiple quorum checks in one rule list). Each `TEST` that passes increments the accumulator by 1. `QUORUM N` reads the accumulator and sets the boolean flag to true if `accumulator ≥ N`, false otherwise. After QUORUM, the `+` and `−` prefixes work exactly as before.

```
TALLY
TEST buffer_has ENEMY_SPOTTED
TEST buffer_has ALLY_ENGAGED
TEST signal_age THREAT_DETECTED < 5
QUORUM 2
+ ENGAGE nearest          ← fires if at least 2 of the 3 tests passed
− PATROL cautious_path    ← fires if fewer than 2 passed
```

### Why Not Just Use Chained AND/OR?

The equivalent without an accumulator:

```
# "At least 2 of 3" using boolean prefix composition
TEST buffer_has ENEMY_SPOTTED
+ SET temp_count 1
− SET temp_count 0
TEST buffer_has ALLY_ENGAGED
+ ADD temp_count 1
TEST signal_age THREAT_DETECTED < 5
+ ADD temp_count 1
TEST temp_count >= 2
+ ENGAGE nearest
− PATROL cautious_path
```

This is 9 lines, requires the player to understand mutable variables, and buries the intent ("at least 2 of 3") inside arithmetic. The TALLY/QUORUM version is 6 lines, reads top-to-bottom, and the number `2` in `QUORUM 2` is the threshold — visible, adjustable, legible. More importantly, the TALLY/QUORUM version **names the concept**. The word "QUORUM" appears on screen. The Blueprint Codex entry explains it. The player has a word for the idea.

### Visual Representation in the Workbench

The rule list renders TALLY/TEST/QUORUM blocks with a distinctive visual treatment:

- **TALLY** displays as a horizontal line with a counter icon (a small abacus or tally-mark cluster) resetting to `0/N` where N is the next QUORUM threshold. The line is **cool silver**, separating this block from preceding rules.
- **Each TEST** between TALLY and QUORUM shows a **small pip** to the right of the condition text. The pip is hollow (○) in the editor, filled (●) during Inspector playback when the test passes, and crossed (⊘) when it fails. The pips form a horizontal row — a miniature vote tally.
- **QUORUM N** renders as a horizontal threshold bar spanning the width of the rule panel. Below the bar: the pip row from preceding TESTs. Above the bar: a bold number (the threshold). The bar glows green when the threshold is met, amber when not. In the Inspector, the bar animates — pips fill left to right as each TEST evaluates, and the bar color transitions at the moment the threshold is crossed (or not).

This visual language makes the quorum legible at a glance: "I see 5 pips, the bar says 3, so 3 of 5 need to pass." No mental arithmetic required.

### Audio Design

- **TALLY reset**: A soft mechanical click — like a counter being thumbed back to zero. Pitched slightly differently from the TEST evaluation click.
- **Each passing TEST**: A quiet ascending chime. The chimes rise in pitch with each successive pass — C, D, E — so the player hears the accumulator climbing.
- **QUORUM met**: A decisive two-note chord — a fifth interval (C-G). The resolution sound. Comparable to the "lock" sound in Into the Breach when you confirm a move.
- **QUORUM not met**: A descending minor second — E♭-D. Quiet, deflating, not punishing. The sound of "not enough."
- **During sealed watch**: When a unit's accumulator evaluates, the ascending chimes are spatialized to the unit's grid position. A player with headphones can hear quorum decisions happening across the battlefield — a scout in the north-west corner evaluating three tests, two chimes ascending, then the decisive chord. The audio becomes a diagnostic layer for experienced players who learn to count chimes.

---

## The Distributed Systems Parallel

### Raft Consensus

In the Raft protocol, a candidate node requests votes from other nodes. If it receives votes from a **majority** (⌊N/2⌋ + 1), it becomes leader. The key insight: a single node's vote is not decisive — the group decides collectively.

Robot Uprising's QUORUM instruction mirrors this exactly. Each TEST is a "vote" from a different information source (buffer entry, signal, observation). The threshold is the majority requirement. The action that fires is the "leader election outcome."

**What the player learns:** A single piece of evidence (one signal, one observation) may be unreliable. But when multiple independent sources agree, the conclusion is more robust. This is the foundation of fault-tolerant systems.

### Paxos Phases as Gameplay

Paxos has two phases: Prepare (propose a value, collect promises) and Accept (if majority promised, request acceptance). In Robot Uprising terms:

- **Prepare phase** = the TALLY block evaluation. Each TEST is a "promise" from the environment.
- **Accept phase** = the QUORUM check. If enough promises arrived, the agent commits to an action.

The parallel is approximate but pedagogically useful. The Blueprint Codex tooltip for QUORUM could read: *"Like a vote among your sensors. Each TEST that passes is one vote. QUORUM N means: 'Act only if at least N sensors agree.'"*

### Byzantine Fault Tolerance

The Byzantine Generals Problem asks: how do N generals agree on an attack when up to F of them may be traitors? The answer: you need N ≥ 3F + 1 generals.

In Robot Uprising, "traitors" are **stale data, enemy misinformation, and noise signals**. A scout's buffer might contain:
- A real ENEMY_SPOTTED from 2 ticks ago (fresh, reliable)
- A relayed THREAT_DETECTED that was compressed and may have lost fidelity (uncertain)
- A SECTOR_CLEAR from 8 ticks ago (stale, possibly wrong)

A `QUORUM 2` on three tests means the agent requires consensus from 2 of 3 information sources. If one source is "Byzantine" (stale, corrupted, adversarial), the other two can outvote it.

**Mission design opportunity:** A late-campaign mission where the enemy actively injects false signals into the player's channels. Without quorum-based decisions, units act on bad data. With QUORUM, units can tolerate a minority of corrupted inputs. The player learns that **redundancy and voting beats trusting any single source** — the core lesson of Byzantine fault tolerance.

---

## Design Variations

### Variation A: Simple Threshold ("The Vote")

The version described above. TALLY/TEST/QUORUM with a fixed integer threshold. Simplest to understand, most constrained.

**Strengths:** Immediately legible. The threshold number is visible in the rule list. Adjusting it is a single click. The mental model is "vote counting."

**Weaknesses:** Fixed threshold doesn't adapt. A `QUORUM 3` that was calibrated for 5 tests breaks if the player removes a test — now 3 of 4 is harder to meet. The player must manually recalibrate thresholds when modifying the test set.

### Variation B: Majority Keyword ("The Democracy")

Instead of `QUORUM 3`, the player writes `MAJORITY` — which automatically resolves to ⌊N/2⌋ + 1 where N is the number of TESTs since the last TALLY.

```
TALLY
TEST buffer_has ENEMY_SPOTTED
TEST buffer_has ALLY_ENGAGED
TEST signal_age THREAT_DETECTED < 5
MAJORITY
+ ENGAGE nearest
```

MAJORITY auto-calculates to 2 (majority of 3). If the player adds a 4th TEST, MAJORITY becomes 3 automatically.

**Strengths:** Self-adjusting. Adding or removing tests doesn't break the threshold. The word "MAJORITY" is evocative and teaches democratic decision-making.

**Weaknesses:** Less expressive. Can't do "at least 1 of 5" (that's ANY, not MAJORITY) or "all 5 must pass" (that's UNANIMOUS). Only one threshold option.

### Variation C: Named Thresholds ("The Constitution")

Three keyword thresholds: `ANY` (≥1), `MAJORITY` (>50%), `UNANIMOUS` (=N). The player picks from a dropdown. Advanced unlock: `QUORUM N` for arbitrary thresholds.

```
TALLY
TEST ...
TEST ...
TEST ...
ANY          ← at least one passed
MAJORITY     ← at least 2 of 3
UNANIMOUS    ← all 3
QUORUM 2     ← exactly 2+ (same as MAJORITY here, but explicit)
```

**Strengths:** Rich vocabulary. Each keyword teaches a distinct governance concept. `ANY` = permissive (like a Selector node in behavior trees). `UNANIMOUS` = strict (like a Sequence node). `MAJORITY` = democratic. `QUORUM N` = custom.

**Weaknesses:** Four keywords vs. one. Complexity cost. Players must learn which to use when. The dropdown in the rule editor needs clear tooltips.

**Recommendation:** Start with Variation A (QUORUM N) in Mission 6 when the factory is introduced. Unlock MAJORITY as a convenience alias in Mission 7. UNANIMOUS and ANY are never explicitly introduced — they're emergent from `QUORUM N` where N = count and N = 1 respectively. The Codex notes the equivalences.

### Variation D: Weighted Votes ("The Senate")

Each TEST carries a weight:

```
TALLY
TEST(2) buffer_has ENEMY_SPOTTED    ← worth 2 votes
TEST(1) buffer_has ALLY_ENGAGED     ← worth 1 vote
TEST(1) signal_age THREAT < 5       ← worth 1 vote
QUORUM 3                            ← need 3+ weighted votes
```

Fresh, high-priority signals count more. Stale or uncertain sources count less.

**Strengths:** Expressive. Models real-world weighted voting (shareholder votes, electoral colleges, signal confidence scores). Creates rich tuning space.

**Weaknesses:** Significant complexity jump. The player must reason about weights AND thresholds simultaneously. The rule list becomes harder to scan — `TEST(2)` vs `TEST(1)` is a subtle visual difference. Risk of over-engineering: does the gameplay actually require weighted votes, or is uniform voting sufficient for 95% of scenarios?

**Recommendation:** Out of scope for the first playable. Add as a Gauntlet-era unlock or community mod primitive if demand emerges. The unweighted version teaches the core concept; weights are a power-user extension.

### Variation E: Rolling Accumulator ("The Running Average")

The accumulator persists across ticks instead of resetting each evaluation cycle. TALLY doesn't zero it — it decrements by 1 (or by a configurable decay rate). A TEST that passes adds 1. Over time, the accumulator represents a running tally of "how often has this set of conditions been met recently?"

```
TALLY decay=1     ← accumulator -= 1 each tick (min 0)
TEST buffer_has ENEMY_SPOTTED
QUORUM 3          ← accumulator must have reached 3+
+ ENGAGE
```

If ENEMY_SPOTTED appears on 3 consecutive ticks, the accumulator reaches 3 and ENGAGE fires. If it appears intermittently, the accumulator never reaches threshold.

**Strengths:** Temporal consensus — "this must be true persistently, not just right now." Models hysteresis, debouncing, and trend detection. Prevents overreaction to transient signals.

**Weaknesses:** Much harder to reason about. The accumulator value is invisible unless the Inspector shows it. Players must simulate multi-tick sequences mentally to predict behavior. Debugging is painful.

**Recommendation:** This is a Wave 2/core-mechanic concept (temporal filtering), not a prefix primitive. If implemented, it should be a distinct Specialist skill ("trend analysis") rather than an extension to the prefix system. The prefix system should remain tick-local for simplicity.

---

## Interaction Effects

### With the ? (Uncertainty) Prefix (3.05a-i)

When a TEST in a TALLY block can't evaluate (data not in buffer), should it:
- **Increment the accumulator by 0** (unknown = abstention)
- **Decrement the accumulator by 1** (unknown = negative vote)
- **Trigger a separate ? handler for the entire QUORUM block**

Option 1 (abstention) is cleanest: the test simply doesn't contribute. The threshold becomes harder to meet with fewer "voters." This naturally models fault tolerance — if a sensor is offline, you need more agreement from the remaining sensors.

Option 3 (QUORUM ? handler) allows the player to write a fallback for "too many unknowns to reach quorum":

```
TALLY
TEST buffer_has ENEMY_SPOTTED
TEST buffer_has ALLY_ENGAGED
TEST signal_age THREAT < 5
QUORUM 2
+ ENGAGE nearest
− PATROL cautious_path
? HOLD_POSITION          ← not enough data to even vote on
```

The `?` on QUORUM fires when the number of evaluable tests is less than the threshold — meaning even if ALL evaluable tests pass, quorum can't be reached because too many sensors are down. This is the "inquorate meeting" case: not enough members present to hold a vote.

**Recommendation:** Both mechanics. Abstention by default (TEST with no data = +0), and `?` fires when `evaluable_count < threshold`. This teaches the concept of quorum as minimum participation, not just minimum agreement.

### With Hook Chains and Signal Latency

QUORUM decisions interact richly with signal latency (1 tick per hop). A striker's TALLY block might include:

```
TALLY
TEST buffer_has ENEMY_SPOTTED          ← from own perception (immediate)
TEST buffer_has RELAY_CONFIRMED        ← from relay (1 tick old)
TEST buffer_has COMMAND_APPROVED       ← from command agent (2+ ticks old)
QUORUM 2
+ ENGAGE
```

The three information sources arrive at different times. On tick 12, the striker might have ENEMY_SPOTTED (fresh) and RELAY_CONFIRMED (from tick 11), but COMMAND_APPROVED hasn't arrived yet. QUORUM 2 passes — the striker engages with 2/3 consensus. On tick 13, COMMAND_APPROVED arrives — but the striker already acted.

This creates a **latency-awareness design puzzle**: should the player wait for all votes (slower, more informed) or act on partial quorum (faster, riskier)? The threshold number IS the latency tolerance. `QUORUM 1` = act on any signal (fastest, least reliable). `QUORUM 3` = wait for full consensus (slowest, most reliable).

The parallel to real distributed systems is exact: this is the **CAP theorem** manifested as a game mechanic. Consistency (all sources agree) vs. Availability (act quickly) vs. Partition tolerance (some sources are delayed/unavailable).

### With Command Agent Meta-Rules (3.17)

A Command agent could use QUORUM to make organizational decisions:

```
TALLY
TEST subordinate_report SCOUT-A status=ENGAGED
TEST subordinate_report SCOUT-B status=ENGAGED
TEST subordinate_report SCOUT-C status=ENGAGED
QUORUM 2
+ REROUTE all_strikers channel=PRIORITY_ALPHA
```

"If at least 2 of my 3 scouts are engaged, this is a real threat — redirect all strikers." The Command agent is running a vote among its subordinates' reports. This is literally the Raft leader collecting votes from followers.

More complex: a Command agent whose QUORUM threshold adapts based on the situation:

```
# Peacetime: require majority before escalating
TALLY
TEST subordinate_report SCOUT-A status=ENGAGED
TEST subordinate_report SCOUT-B status=ENGAGED
TEST subordinate_report SCOUT-C status=ENGAGED
QUORUM 2
+ REROUTE all_strikers channel=PRIORITY_ALPHA

# Emergency: any scout engagement triggers response
TEST context_window_fill > 80%
+ REASSIGN quorum_threshold 1    ← lower the bar when overwhelmed
```

This models **adaptive consensus** — stricter quorum in peacetime, looser in emergencies. Real-world parallel: corporate governance requires board majority for routine decisions but empowers the CEO for emergency actions.

### With Enemy Information Warfare (2.16)

Enemies that inject false signals can attack quorum-based decisions. If a striker's TALLY block checks 3 sources and the enemy injects a fake ENEMY_SPOTTED into the buffer, the quorum now includes a corrupted vote. With `QUORUM 2`, one fake vote + one real vote = false engagement.

Counter-strategies the player can develop:
1. **Raise the threshold:** `QUORUM 3` (unanimous) means one fake vote can't trigger action. Cost: slower response.
2. **Add authentication tests:** `TEST signal_source = FRIENDLY` as part of the TALLY block. Cost: extra slot.
3. **Use the Specialist's "filter" skill** to sanitize signals before they enter buffers.
4. **Redundant sensing:** require multiple independent sources (perception + relay + hook) rather than trusting any single channel.

This interaction creates an entire **information warfare curriculum** in the late campaign:
- Mission 8: Enemy starts injecting false signals.
- Player's existing non-quorum configs break.
- Debrief shows the corrupted vote in the Inspector.
- Player learns to add QUORUM to critical decisions.
- Mission 9: Enemy learns to inject MULTIPLE false signals, overwhelming simple majority.
- Player raises thresholds and adds authentication tests.
- Mission 10: Enemy targets the authentication channel itself (Byzantine attack).
- Player must design redundant authentication — the final boss is a trust problem.

### With the Evaluation Waterfall (3.05a-v)

The sealed watch evaluation waterfall animation (the spectator-facing trace of instruction evaluation) gains a new element with TALLY/QUORUM: the **vote counter**. As the waterfall animates each TEST evaluation, a small pip fills on the right. When QUORUM evaluates, the accumulated pips are compared against the threshold bar. The threshold bar animates — rising from left, and either meeting or not meeting the filled pips.

For streamers and spectators, this creates a **countdown moment**: "Two of three tests passed... and the QUORUM needs two... IT FIRES!" The quorum evaluation is a micro-cliffhanger in every tick.

---

## Comparable Games and Systems

### Gladiabots: Parallel Condition Evaluation

Gladiabots' behavior trees use AND/OR composite nodes to combine conditions. An AND node with 3 children is functionally `QUORUM 3` (unanimous). An OR node is `QUORUM 1` (any). But Gladiabots has no "2 of 3" — no majority vote. The player must build explicit workarounds with nested trees. Robot Uprising's QUORUM fills this gap with a single instruction.

### XCOM: Probability as Implicit Quorum

XCOM's hit probability (65% to hit) is implicitly a quorum over random variables — "enough favorable factors must align." But the player has no control over which factors vote or what the threshold is. Robot Uprising makes the probability decomposition explicit: "these are your 5 sensors, and you need 3 to agree." Same uncertainty, but the player understands WHY and can tune it.

### Slay the Spire: Condition Stacking

Powers in Slay the Spire stack — Noxious Fumes deals 2 poison per turn, two copies deal 4. This is accumulation, but additive rather than threshold-based. Robot Uprising's QUORUM is threshold-based — the accumulator either meets the bar or doesn't. The discrete threshold creates a cliff (binary outcome) rather than a gradient.

### Raft (the consensus protocol, not a game)

Raft's leader election is the direct mechanical parallel. A candidate needs votes from a majority of nodes to become leader. In Robot Uprising, a unit's decision "candidate" (ENGAGE, PATROL, HOLD) needs "votes" from a majority of TESTed conditions. The mapping is 1:1. The Blueprint Codex could include a "Did you know?" panel: *"QUORUM works the same way distributed databases choose their leader. You just designed a Raft election."*

### Among Us / Social Deduction

Emergency meetings in Among Us require a majority vote to eject a player. The social dynamics — incomplete information, persuasion, deception — map to Robot Uprising's signal environment. The difference: in Among Us, humans vote with social reasoning. In Robot Uprising, sensors "vote" with data. But the mechanics are identical: majority threshold over unreliable inputs.

---

## Player Journeys

### Journey: Mika, 24, Computer Science Student

**Context:** Mission 6. Just unlocked the factory. Has been using simple TEST → + ACTION patterns. Three scouts and two strikers on the field. The scouts keep engaging enemies prematurely because a single ENEMY_SPOTTED signal triggers action.

**Minute 0:00 — The Failed Assault**
Sealed watch. Mika's scouts spot an enemy patrol. One scout sees an enemy at E4 and broadcasts ENEMY_SPOTTED. The two strikers immediately ENGAGE — charging toward E4. But the enemy at E4 was a decoy. The real assault comes from the north. Both strikers are out of position. The base falls.

**Minute 1:30 — Inspector Phase**
Mika clicks on STRIKER-A. The decision trace shows: "Tick 14: TEST buffer_has ENEMY_SPOTTED → TRUE → + ENGAGE nearest." One signal, one reaction. No verification. Mika sees that only SCOUT-A reported the enemy. SCOUT-B and SCOUT-C never confirmed.

**Minute 2:00 — The Boot Log Teaches**
On retry, the mission's boot log introduces TALLY and QUORUM: *"Subsystem loaded: CONSENSUS EVALUATION. Multiple sensors can now vote on a decision. TALLY resets the ballot. Each TEST that passes casts one vote. QUORUM sets the bar."* A pre-built example appears in the workbench tutorial panel:

```
TALLY
TEST buffer_has ENEMY_SPOTTED
TEST buffer_has ALLY_CONFIRMED_CONTACT
QUORUM 2
+ ENGAGE nearest
− PATROL standard_path
```

Mika reads it top to bottom. "Oh — it needs BOTH tests to pass before it engages." She hovers over QUORUM. The tooltip says: *"Act only if 2 sensors agree. Like taking a vote."*

**Minute 3:00 — Modifying the Striker Blueprint**
In the workbench, Mika opens STRIKER-A's blueprint. She replaces the single `TEST → + ENGAGE` with the TALLY/QUORUM block. As she types, the rule panel renders the two hollow pips (○ ○) next to each TEST and the threshold bar showing "2" in bold above them. She drags the QUORUM threshold handle from 2 to 1, watches the tooltip update ("Act if at least 1 sensor agrees — very permissive"), then drags back to 2.

**Minute 4:00 — The Second Attempt**
Execute. Sealed watch. Same enemy decoy at E4. SCOUT-A broadcasts ENEMY_SPOTTED. But this time STRIKER-A evaluates its TALLY block: TEST 1 passes (● ○ on the pip display), TEST 2 fails (no ALLY_CONFIRMED yet — ● ⊘). QUORUM 2 is not met. The threshold bar glows amber. STRIKER-A patrols instead. Two ticks later, SCOUT-B confirms: ENEMY_SPOTTED from C6 — the real threat. Now STRIKER-A's buffer has both signals. TALLY block: ● ●. QUORUM 2 = met. The bar flashes green. STRIKER-A engages the real threat.

Mika pumps her fist. "It waited for confirmation."

**Minute 6:00 — Inspector Deep Dive**
In the Inspector, Mika scrubs to tick 14. She clicks STRIKER-A. The decision trace shows the TALLY block evaluation: "Vote 1: ENEMY_SPOTTED ✓ (from SCOUT-A, age 0). Vote 2: ALLY_CONFIRMED ✗ (not in buffer). Result: 1/2 — quorum not met. Action: PATROL." She scrubs to tick 16: "Vote 1: ✓. Vote 2: ✓ (from SCOUT-B, age 1). Result: 2/2 — quorum met. Action: ENGAGE nearest (target: E6)."

**Minute 7:00 — The Insight**
Mika stares at the two vote tallies side by side. "The config didn't change between tick 14 and tick 16. The DATA changed. The same rules, the same threshold — but the environment provided enough evidence two ticks later." She opens a notebook and writes: *"QUORUM = don't act until you're sure enough. The number is how sure."*

**UI Annotations:**
- TALLY block: silver horizontal separator, counter icon (tally marks), "0/2" display
- TEST pips: 12px circles, hollow in editor, filled/crossed in Inspector, positioned right-aligned in rule row
- QUORUM bar: full-width horizontal bar, threshold number centered above, green when met (opacity pulse), amber when not
- Threshold handle: draggable circle on the QUORUM bar in edit mode, snaps to integers, tooltip shows "Act if at least N sensor(s) agree"
- Inspector vote trace: two-column layout, "Vote 1: [condition] [result]" per row, bottom row shows "Result: X/N — quorum [met/not met]"

---

### Journey: Datu, 38, Network Engineer

**Context:** Mission 8. Experienced player. Runs a 3-relay deep-chain architecture. Has used QUORUM since Mission 6. Now facing an enemy that injects false signals into his channels.

**Minute 0:00 — The Corrupted Vote**
Plan screen. Datu's STRIKER-B has a TALLY block with 3 tests: ENEMY_SPOTTED (own perception), RELAY_CONFIRMED (from relay chain), COMMAND_APPROVED (from Command agent). QUORUM 2. This has worked flawlessly for 2 missions.

Execute. Sealed watch. Tick 8: STRIKER-B's context bar flashes — a new entry arrives. The signal overlay shows a green dashed line from... nowhere? No, from an enemy Specialist. A fake RELAY_CONFIRMED signal injected into STRIKER-B's channel. STRIKER-B now has ENEMY_SPOTTED (from own perception of a decoy) and RELAY_CONFIRMED (fake). QUORUM 2 met. STRIKER-B charges into an ambush.

Datu watches, jaw tight. The ascending chimes play — C, D — the chord resolves. Green flash. STRIKER-B engages. Red flash. STRIKER-B destroyed.

**Minute 2:00 — Inspector Forensics**
Datu scrubs to tick 8. Clicks STRIKER-B. The vote trace shows: "Vote 1: ENEMY_SPOTTED ✓ (source: OWN_PERCEPTION, age 0). Vote 2: RELAY_CONFIRMED ✓ (source: **CHANNEL:relay-net**, age 0). Vote 3: COMMAND_APPROVED ✗ (not in buffer). Result: 2/3 — quorum met."

He clicks on Vote 2. The signal genealogy expands: "RELAY_CONFIRMED received on channel relay-net at tick 8. Origin: **ENEMY_SPECIALIST_C** at F7." Red highlight. The signal was hostile.

**Minute 3:00 — The Fix: Authentication Test**
Back in the workbench. Datu modifies STRIKER-B's TALLY block:

```
TALLY
TEST buffer_has ENEMY_SPOTTED
TEST buffer_has RELAY_CONFIRMED
TEST signal_source RELAY_CONFIRMED = FRIENDLY
TEST buffer_has COMMAND_APPROVED
QUORUM 3
```

He added a 4th test: `signal_source = FRIENDLY`. And raised the threshold from 2 to 3. Now even if the enemy injects a fake RELAY_CONFIRMED, the source check fails — only 2 of 4 tests pass, below the QUORUM 3 threshold.

**Minute 4:30 — The Counter-Counter**
Execute. The enemy now injects TWO fake signals: RELAY_CONFIRMED and COMMAND_APPROVED. Both from enemy sources. But Datu's source check catches both. Only 2 of 4 tests pass (own perception + the actual relay confirmation). QUORUM 3 not met. STRIKER-B holds position.

But wait — the enemy's real assault comes while STRIKER-B is holding. The real RELAY_CONFIRMED arrives 1 tick later. Now: ENEMY_SPOTTED ✓, RELAY_CONFIRMED ✓ (real, source check ✓), COMMAND_APPROVED ✗, signal_source check on RELAY_CONFIRMED ✓. That's 3 of 4. QUORUM 3 met. STRIKER-B engages — 1 tick late, but correctly.

Datu nods. "One tick of latency for authentication. Worth it."

**Minute 6:00 — The Insight**
In the Inspector, Datu compares the old and new configs side by side. The old config was fast but gullible. The new config is slower but resistant to one corrupted input. He adjusts the threshold to think about it: QUORUM 2 = fast, vulnerable. QUORUM 3 = slower, resilient. QUORUM 4 = unanimous, paralyzed if any sensor is down.

He opens the Codex and reads the "Did you know?" panel: *"In distributed systems, this is called Byzantine Fault Tolerance. A system that tolerates F faulty nodes needs at least 2F + 1 total nodes. Your QUORUM 3 from 4 tests tolerates 1 corrupted input."*

Datu, a network engineer, laughs. "I literally designed a BFT quorum at work last month. Same math."

**UI Annotations:**
- Signal genealogy popup: click-to-expand from vote trace, shows source chain with hostile sources in red
- Source check TEST: renders with a shield icon (🛡) prefix in the rule panel when testing signal_source
- QUORUM threshold adjustment: tooltip updates to show "Tolerates up to N−threshold corrupted inputs" — e.g., "4 tests, QUORUM 3 → tolerates 1 corrupted input"
- Codex "Did you know?" panel: collapsible sidebar in the Blueprint Codex, cyan border, technical cross-reference with real-world system

---

### Journey: Aira, 15, First Strategy Game

**Context:** Mission 6. Has never played a strategy game before. Struggled with hooks in Mission 4 but loved the sealed watch drama. She names all her units.

**Minute 0:00 — "Why Did Bantay Attack?"**
Previous attempt: her scout "Bantay" (named in Mission 2) spotted an enemy. Her striker "Talim" immediately attacked. Talim was destroyed. Aira is upset — not about the loss, but because Talim acted on one report.

She retries. The boot log introduces TALLY/QUORUM with a household analogy: *"Imagine three friends each look out a different window. One says 'I see rain.' Do you grab your umbrella? Or do you wait until two of them agree?"*

**Minute 1:00 — The Workbench**
Aira opens Talim's blueprint. The tutorial overlay highlights the rule list and says: *"Right now, Talim attacks when ANY scout says 'enemy.' Let's make Talim wait for agreement."*

A guided tutorial walks her through:
1. Click "Add TALLY" — a silver separator line appears with tally marks
2. Her existing TEST stays. She adds a second TEST from the dropdown: `buffer_has ALLY_CONFIRMED_CONTACT`
3. Click "Add QUORUM" — a threshold bar appears. The tutorial says: *"Drag the number to choose how many votes Talim needs."* She drags to 2.
4. Her existing + ENGAGE slides below the QUORUM bar. The − PATROL appears below that.

The workbench now shows two hollow pips and the "2" threshold bar. The tutorial says: *"Talim will now wait until 2 scouts agree before attacking. Like waiting for a second opinion."*

**Minute 2:30 — Naming the Pattern**
Aira hovers over QUORUM. The tooltip reads: *"Talim needs 2 votes to act. Right now: 0 votes."* She likes this. She opens the Blueprint Codex. The QUORUM card shows an illustration: three robot silhouettes, two with raised hands (green), one with a lowered hand (amber). The card title: *"QUORUM — When the team decides together."*

**Minute 3:30 — The Vote Plays Out**
Execute. Sealed watch. Tick 10: Bantay spots an enemy and broadcasts. Talim's context bar flickers — one entry arrives. The pip display on Talim's tile shows ● ○. One ascending chime. The threshold bar stays amber. Talim patrols.

Tick 12: Aira's second scout "Agos" confirms the enemy from another angle. Talim's pip display: ● ●. Second chime, higher pitch. The threshold bar flashes green. The decisive chord plays. Talim engages — toward the confirmed threat.

Aira grins. "Talim waited! She waited for Agos to agree!"

**Minute 5:00 — The Social Reading**
In the Inspector, Aira clicks Talim at tick 10. The vote trace shows: "Vote 1: Bantay says enemy ✓. Vote 2: Agos hasn't said anything yet ✗. 1/2 — not enough." She clicks tick 12: "Vote 1: Bantay says enemy ✓. Vote 2: Agos says enemy ✓. 2/2 — enough! Talim attacks."

Aira doesn't think about distributed consensus or Raft protocols. She thinks: "Talim trusts Bantay, but she wanted a second opinion from Agos before risking her life." The mechanic reads as social intelligence — a unit that doesn't rush into danger on one friend's word.

**Minute 6:00 — Experimenting**
Aira adds a third scout and a third TEST to Talim's TALLY block. She drags the QUORUM threshold to 2. Now Talim needs 2 of 3 scouts to agree. She runs it. The pip display now shows three circles. Two fill on tick 11. The chord plays. She drags the threshold to 3 — now all three must agree. She runs again. This time it takes until tick 14 for all three scouts to report. Talim engages much later, but with full confidence.

"Three is too slow," Aira decides. "Two is enough." She's just intuited the speed-accuracy tradeoff in distributed consensus.

**UI Annotations:**
- Tutorial overlay: semi-transparent panel pinned to right side of workbench, step-by-step with "Next" button
- Household analogy in boot log: three cartoon windows with rain/sun/cloud, two circled = "enough to decide"
- Codex QUORUM card: illustrated with anthropomorphized robots voting, accessible language, no technical jargon
- Pip display on unit tiles during sealed watch: 3px circles below context bar, visible at default zoom, colored per vote result
- Inspector vote trace: friendly language — "Bantay says enemy ✓" instead of "TEST buffer_has ENEMY_SPOTTED = TRUE (source: SCOUT-A)"

---

## The TikTok Clip

A 15-second clip: Three scouts on the board. Each one spots the enemy — chime, chime, chime, ascending pitch. Cut to the striker's QUORUM bar filling — one pip, two pips, the bar flashes green. The chord hits. The striker moves. Caption: *"My robots vote before they fight."*

Alternative: An enemy injects a false signal. Two chimes play. The QUORUM bar almost fills — then the third test fails (source check). The bar stays amber. The striker holds. The ambush misses. Caption: *"She saw through the lie. Because 2 out of 3 isn't 3 out of 4."*

---

## New Aspects Discovered

1. **3.05a-iii-a — Quorum visualization during sealed watch at scale:** When 6+ units each have TALLY/QUORUM blocks evaluating simultaneously, the battlefield fills with pip displays and chimes. Visual/audio prioritization: which units' quorum evaluations get full visual treatment vs. abbreviated? Camera proximity, decision significance (ENGAGE vs. PATROL), and player attention history as priority signals.

2. **3.05a-iii-b — Adaptive quorum thresholds via Command agent:** Command agent dynamically adjusting subordinate QUORUM thresholds mid-battle (raise in peacetime, lower in emergency). The "alert level" meta-mechanic where organizational consensus strictness responds to tactical pressure. Full UX of the Command agent's threshold-modification skill in the workbench.

3. **3.05a-iii-c — Quorum as enemy attack surface:** Designing enemy behaviors that specifically target quorum-based decisions — injecting exactly N−threshold+1 false signals to flip a quorum, timing fake signals to arrive at the same tick as real ones, and the "quorum flooding" attack pattern. Counter-play curriculum across Missions 8-10.

4. **3.05a-iii-d — The "hung jury" state:** When the accumulator equals exactly threshold−1 and one TEST is in ? state (unknown), the QUORUM is indeterminate — not met, not clearly failed. Should this trigger a distinct ? handler? The "hung jury" as a signal that the agent needs more information, distinct from "quorum failed" (which means "we voted no"). Mission design around engineering deliberate hung juries as information-gathering triggers.

5. **3.05a-iii-e — Cross-agent quorum (distributed vote):** Instead of one agent evaluating multiple TESTsin its own buffer, multiple agents each contribute one vote via hook channels, and a designated "tally agent" (usually a Relay) aggregates and evaluates QUORUM across the network. The distributed vote as a first-class multi-agent coordination pattern. Parallel to Raft's distributed leader election. UX for configuring distributed quorum in the workbench (hook-based vote publishing, relay-based vote counting).
