# 3.05a — Conditional Prefix as Expressive Primitive

## Overview

The conditional prefix is one of the most elegant primitives in programming language design: a single character (+/−) that gates whether an instruction executes, based on the result of the most recent test. Shenzhen I/O proved this works as a game mechanic. ARM's architecture proved it works for real silicon. The question for Robot Uprising: can the conditional prefix serve as the *atomic unit of expressiveness* — the minimal syntax that transforms a flat action list into a Turing-complete behavioral specification?

This document explores the conditional prefix NOT as one of six rules-language approaches (that's covered in `rules-language.md` Approach C), but as a **fundamental design primitive** — a single building block that, when composed with itself, yields boolean logic, branching, loops, and multi-agent coordination without any of those concepts being explicitly named.

The thesis: the prefix is the game's most powerful teaching tool BECAUSE it's so small. A player who learns "+", "−", and "TEST" has unwittingly learned predicated execution, boolean composition, and control flow. The vocabulary is three symbols. The design space those symbols open is infinite.

---

## The Primitive Itself

### Formal Definition

A **conditional prefix** is a unary modifier on an instruction that gates execution based on the state of an implicit boolean flag:

```
[prefix] [instruction] [parameters]
```

Where prefix ∈ { · (always), + (execute if flag = true), − (execute if flag = false) }

The flag is set by **test instructions**:

```
TEST [condition] [operands]
```

A TEST sets the flag to true or false. Every subsequent prefixed instruction reads that flag until the next TEST overwrites it.

### Why This Is Special

Most conditional systems require explicit `IF/THEN/ELSE` blocks with nesting, brackets, and scope management. The prefix system has **zero syntactic overhead** — no brackets, no nesting, no block delimiters. The TEST instruction sets a flag. The + and − prefixes read it. That's the entire conditional execution model.

This means:
- **No nesting depth.** The flag is a single bit. There's no stack of nested conditions to track.
- **No block boundaries.** A + instruction anywhere in the list reads the same flag. Conditions don't "end" — they persist until the next TEST overwrites them.
- **No explicit boolean operators.** AND, OR, and NOT emerge from prefix composition (see below).

### The ARM Parallel

ARM's original 32-bit instruction set (ARMv1-ARMv7) made the same design choice: every instruction carries a 4-bit condition field. Instead of `if (condition) { add r0, r1, r2 }`, ARM writes `ADDEQ r0, r1, r2` — "add, but only if the equal flag is set." This eliminated short branches entirely. For sequences of 1-3 conditional instructions, predication outperformed branching because it avoided pipeline flushes.

The parallel to Robot Uprising is exact: a unit evaluating its rule list is a tiny processor executing a program. Short conditionals (1-3 prefixed actions) are the common case. Full branching (JUMP) is rarely needed. The prefix model optimizes for the common case while still permitting the complex case.

ARM eventually dropped full predication in AArch64 (2011) because out-of-order execution made branch prediction cheap. Robot Uprising's tick-based evaluation is in-order by definition — making the prefix model permanently optimal for this domain.

---

## Boolean Composition Without Boolean Operators

The prefix's deepest power is that boolean logic is **implicit** — the player never writes AND, OR, or NOT. They emerge from sequencing.

### AND (Conjunction)

```
TEST buffer_has ENEMY_SPOTTED
+ TEST signal_age ENEMY_SPOTTED < 3
  + ENGAGE nearest
```

Line 1 sets the flag. Line 2 only evaluates if the flag is true (the + prefix). If line 2's TEST also passes, the flag remains true and line 3's + ENGAGE fires. If either test fails, the flag is false and ENGAGE is skipped.

**What the player learns:** "Put two + TEST lines in a row and both must pass." They've learned conjunction without the word "AND."

### OR (Disjunction)

```
TEST buffer_has ENEMY_SPOTTED
+ JUMP engage_routine
TEST buffer_has THREAT_DETECTED
+ JUMP engage_routine

engage_routine:
  ENGAGE nearest
```

Each TEST independently checks a condition. Either one can trigger the jump. The player discovers disjunction as "I can check for multiple things and jump to the same place."

**Simpler OR without JUMP:**

```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest
TEST buffer_has THREAT_DETECTED
+ ENGAGE nearest
```

Redundant ENGAGE calls — but if ENGAGE is idempotent (engage the same target twice = engage once), this "just works." The player writes OR by repeating the action.

### NOT (Negation)

The − prefix IS negation. `− ENGAGE nearest` means "engage if the last test FAILED." The player doesn't need a NOT keyword — they flip the prefix from + to −.

```
TEST buffer_has ALLY_SIGNAL
− PATROL default_path          ← no ally signal → patrol (you're alone)
+ HOLD_POSITION                ← ally signal → hold (wait for support)
```

### Nested AND-NOT-OR

```
TEST buffer_has ENEMY_SPOTTED
+ TEST signal_count ENEMY_SPOTTED >= 3
  + TEST signal_age ENEMY_SPOTTED < 2
    + ENGAGE nearest           ← 3+ fresh enemies → aggressive engage
    − EVADE nearest            ← 3+ stale enemies → evade (old data, risky)
  − PATROL cautious_path       ← fewer than 3 enemies → cautious patrol
− PATROL default_path           ← no enemies at all → default patrol
```

This is a nested decision tree, but it reads linearly. The player never sees a tree diagram. They see a list with indentation hints (the green/red left borders from the UI spec). The visual rhythm of yellow TEST lines followed by green + lines followed by red − lines creates a "question → yes → no" pattern that's immediately parseable.

---

## The Teaching Sequence

The conditional prefix has a natural **four-stage learning progression** that maps perfectly to the locked 10-mission campaign:

### Stage 1: Unprefixed Actions (Missions 1-2)

Rules are just action lists. No conditions. No prefixes.

```
PATROL default_path
```

The player learns: "Rules tell my unit what to do." The prefix slot exists in the UI but is greyed out — a visible dashed outline inviting future interaction.

### Stage 2: Single TEST + Prefix (Missions 3-4)

The first TEST instruction unlocks. The player learns the core primitive.

```
TEST buffer_has ENEMY_SPOTTED
+ MOVE_TOWARD freshest
− PATROL default_path
```

The player learns: "TEST asks a question. + happens when yes. − happens when no."

This is the **critical aha moment**. The three-symbol vocabulary (TEST, +, −) is complete. Everything after this is composition of these three symbols.

### Stage 3: Chained Tests (Missions 5-7)

The player discovers that + TEST composes — two tests in a row means "both must be true."

```
TEST buffer_has ENEMY_SPOTTED
+ TEST signal_count ENEMY_SPOTTED >= 2
  + ENGAGE nearest              ← both tests passed
  − MOVE_TOWARD freshest        ← enemy spotted but only 1 → approach
− PATROL default_path            ← nothing spotted → patrol
```

The expressive power doubles with each mission. By Mission 7, players are writing 8-12 line instruction sequences with nested conditional logic.

### Stage 4: JUMP + Full Expression (Missions 8-10)

JUMP enables loops and subroutines. The full assembly model is available for Command agents.

```
01  TEST buffer_count THREAT_DETECTED >= 3
02  + REASSIGN STRIKER-A engage_mode
03  + REROUTE RELAY-B priority_channel
04  + JUMP defensive_posture
05  TEST signal_age RESOURCE_TAGGED > 5
06  + PRIORITIZE economy
07  − PRIORITIZE military

defensive_posture:
08  REROUTE ALL defense_channel
09  AMPLIFY THREAT_DETECTED
```

This is microcontroller firmware. The player is programming a computer that programs other computers.

---

## Six Variations on the Prefix Primitive

### Variation A: "The Binary Toggle" (Locked Spec Baseline)

Exactly as specified in Shenzhen I/O. Two prefixes: + and −. One flag bit. TESTs overwrite the flag completely.

**Strengths:** Maximum simplicity. Proven by Shenzhen I/O and 50 years of real ISA design. Three symbols to learn.
**Weaknesses:** No way to remember the result of an earlier test — each TEST overwrites the flag. Complex conditions require careful sequencing.

### Variation B: "The Tri-State"

Three prefixes: +, −, and ? (uncertain). The ? prefix fires when the test condition couldn't be evaluated — e.g., testing `signal_age ENEMY_SPOTTED` when there are no enemy signals in the buffer.

```
TEST signal_age ENEMY_SPOTTED < 3
+ ENGAGE nearest              ← fresh enemy → engage
− EVADE nearest               ← stale enemy → evade
? PATROL default_path         ← no enemy data at all → patrol
```

**Strengths:** Handles the "missing data" case that the binary toggle conflates with "false." In Robot Uprising, the difference between "no enemy spotted" and "enemy spotted long ago" is strategically crucial. The tri-state makes this distinction first-class.
**Weaknesses:** Adds a third symbol to learn. The ? glyph is less immediately parseable than + and −. "Uncertain" as a concept requires explaining — "the test couldn't run because the data didn't exist" is more abstract than true/false.

**The TikTok clip:** A unit with ? PATROL calmly patrolling — then an enemy enters perception range, the ? prefix on PATROL dissolves and the + ENGAGE lights up in green, the unit snaps to attack posture. The visual of a calm "?" question mark hardening into a decisive "+" is instantly legible.

### Variation C: "The Accumulator"

The flag is not a single bit but a **counter**. Each passing TEST increments the counter; each failing TEST decrements it. Prefixes read the counter: `+` fires if counter > 0, `−` fires if counter ≤ 0, and a new prefix `++` fires only if counter ≥ N (a threshold prefix).

```
TEST buffer_has ENEMY_SPOTTED         ← counter: 0 → 1
TEST signal_count ENEMY_SPOTTED >= 2  ← counter: 1 → 2 (or 1 → 0 if fails)
TEST signal_age ENEMY_SPOTTED < 3     ← counter: 2 → 3 (or 2 → 1 if fails)
++ ENGAGE nearest                     ← only fires if counter ≥ 2 (at least 2 of 3 passed)
```

**Strengths:** Enables **majority voting** — "if at least 2 of these 3 conditions are true." This is a genuinely novel mechanic that doesn't exist in Shenzhen I/O or real ISAs. It maps to consensus protocols in distributed systems.
**Weaknesses:** The counter is invisible state that the player must track mentally. Debugging "why did ENGAGE fire?" requires knowing the counter value, which changes every TEST line. The ++ threshold prefix adds combinatorial complexity. Risk of being "clever" without being fun.

**Comparable:** Weighted voting in distributed consensus (Raft, Paxos). Majority-gate logic in circuit design. Bayesian evidence accumulation in neuroscience.

### Variation D: "The Named Flag"

Instead of one implicit flag, the player can name flags. TESTs write to named flags; prefixes read from named flags.

```
TEST:threat buffer_has THREAT_DETECTED
TEST:enemy buffer_has ENEMY_SPOTTED
+enemy MOVE_TOWARD freshest
+threat +enemy ENGAGE nearest       ← both flags must be true
−threat −enemy PATROL default_path  ← neither flag true
```

**Strengths:** Eliminates the sequencing constraint. The player can test multiple conditions and reference them later in any order. Named flags are variables — this is the minimal step toward a register machine.
**Weaknesses:** Named flags are variables. This is no longer "three symbols to learn" — it's a variable system with identifier naming, scoping (when do flags reset?), and composition rules (`+threat +enemy` = AND? OR?). The simplicity of the implicit flag is lost. Debugging requires a flag table visualization.

**Comparable:** Named registers in TIS-100. Condition code registers in SPARC (icc, xcc). Feature flags in software engineering.

### Variation E: "The Decay Flag"

The flag is not binary but **temporal**. A passing TEST sets the flag to a strength value that decays each tick. The + prefix fires only if the flag strength is above a threshold.

```
TEST buffer_has ENEMY_SPOTTED        ← flag strength = 1.0
[next tick]                          ← flag strength = 0.7
[next tick]                          ← flag strength = 0.4
+ ENGAGE nearest                     ← fires only if flag > 0.5
```

**Strengths:** Creates a "recency" dimension in decision-making without the player writing explicit age checks. A unit that tested for enemies two ticks ago will behave differently than one that tested just now. This maps to attention decay in cognitive science and TTL in network protocols.
**Weaknesses:** Invisible decaying state is even harder to debug than the accumulator. "Why didn't my + ENGAGE fire?" → "Because the flag decayed below threshold between the TEST and the ENGAGE" is a frustrating debugging experience. The tick-based decay rate is another parameter to tune.

### Variation F: "The Prefix Palette" (Recommended for Robot Uprising)

A hybrid that starts with Binary Toggle (Variation A) and progressively unlocks richer prefixes:

| Campaign Phase | Available Prefixes | New Concept |
|---|---|---|
| Missions 1-2 | · (always) | "Rules are instructions" |
| Missions 3-4 | · + − | "TEST, yes, no" — the core primitive |
| Mission 5 | · + − ? | "What if the data doesn't exist?" — missing data |
| Missions 6-7 | · + − ? (chained + TEST) | Boolean composition — AND from sequencing |
| Mission 8 | · + − ? + JUMP | Loops and subroutines |
| Missions 9-10 | Full expression | Command agent firmware |

Each mission's new prefix is introduced through the boot log ("LOGIC SUBSYSTEM: Uncertainty evaluation module... ONLINE. New prefix available: ?"), then demonstrated in a pre-placed unit's configuration, then required to solve the mission's central challenge.

**Strengths:** The learning curve is the campaign. No separate tutorial needed for prefix mechanics — each mission IS the tutorial for its prefix. The Binary Toggle's simplicity is preserved for the first playthrough; the Tri-State's nuance arrives exactly when the player's strategies demand it.
**Weaknesses:** The progressive unlock constrains early-game expression. A Shenzhen I/O veteran in Mission 2 will be frustrated by the missing + prefix. Mitigation: the "Advanced Rules Mode" unlockable (from rules-language.md) gives veterans access to the full prefix palette immediately.

---

## The Prefix in the UI: What It Looks, Sounds, and Feels Like

### Visual Design

The prefix slot is a **12×12 pixel square** to the left of each instruction line. Three states:

- **· (always):** A dim grey dot, barely visible. The instruction line has no left border accent. The dot pulses faintly on each tick when the instruction fires.
- **+ (conditional yes):** A bright green plus sign that glows with a subtle bloom when the flag is true. The instruction line has a 2px green left border. When the + instruction fires, the green intensifies for 200ms — a flash of affirmation.
- **− (conditional no):** A warm amber minus sign (not red — red is reserved for combat and danger). The instruction line has a 2px amber left border. When the − instruction fires, the amber brightens for 200ms.
- **? (tri-state uncertain):** A cool cyan question mark with a slow 2-second pulse. The instruction line has a 2px dashed cyan left border. When the ? instruction fires, the cyan stabilizes for 200ms — uncertainty resolving into action.

### The Prefix Toggle Interaction

Click the prefix slot to cycle: · → + → − → ? → ·. Each transition has a micro-animation:

- · → +: The grey dot expands into a plus, branches growing outward like a tiny plant sprouting. 150ms. A quiet "tik" sound — a light switch flipping on.
- + → −: The plus arms retract and one horizontal bar remains. 150ms. A softer "tok" — the same switch, but lower pitch.
- − → ?: The minus bar curls into a question mark hook. 200ms. A whispered "hmm?" — a rising two-note chime.
- ? → ·: The question mark deflates into a dot. 150ms. A tiny "pff" — air releasing.

This cycle is one of the most-touched interactions in the game. It must feel **physically satisfying** — like clicking a high-quality mechanical switch. The sound design follows the "small sound, frequent action" principle: quiet enough to be ambient, distinctive enough to be unconsciously learned.

### The TEST Line Highlight

TEST instructions have a **yellow-gold highlight** across their entire row — like a highlighted line in a code editor. The highlight is 8% opacity, just enough to visually separate "question" lines from "answer" lines. When a TEST evaluates during the sealed watch, the highlight flashes to 30% opacity for 300ms, then fades back.

The yellow-gold color was chosen because:
1. It's warm but not alarming (red = combat, amber = negative prefix)
2. It reads as "attention" — a highlighter pen marking something important
3. It contrasts with both green (+) and amber (−) without clashing

### The "Evaluation Waterfall" Animation

During the sealed watch, when a unit evaluates its instruction list, the evaluation plays as a **top-to-bottom waterfall**: each line lights up in sequence, the TEST line flashes yellow, the flag value visually propagates to subsequent lines (a thin colored line shooting downward from the TEST to the prefixed instructions), and the firing instruction pulses brightly while skipped instructions dim momentarily.

This waterfall takes 200-400ms total (depending on instruction count) and plays at the start of each tick for each unit. It's the game's signature animation — the visual proof that these rules ARE executing, that the units ARE thinking. On the battlefield, you see the context bars filling; in the instruction trace overlay (a compact version visible in a tooltip when hovering a unit during sealed watch), you see the waterfall.

**The TikTok clip:** Split screen. Left: isometric battlefield, scout moving through jungle. Right: the instruction list waterfall — TEST flashes, + ENGAGE lights up green, the scout snaps to attack posture. The synchronization between the abstract logic and the concrete action is viscerally satisfying. Caption: "I programmed that."

---

## Interaction Effects

### With the Context Window (Buffer)

The TEST instruction's conditions all reference buffer contents: `buffer_has`, `signal_count`, `signal_age`, `signal_fidelity`. This means the prefix system is **buffer-native** — every conditional decision is grounded in "what does this unit currently know?" The prefix doesn't test abstract game state; it tests the unit's subjective information.

This creates a powerful feedback loop:
1. Player configures context filters (what the unit pays attention to)
2. Buffer fills with filtered observations
3. TESTs read the buffer
4. Prefixed actions fire (or don't) based on buffer contents
5. Actions change the world, generating new observations
6. → back to step 2

The prefix system makes the buffer/context window the **central gameplay object**. You're not just filling a container — you're programming the input to a decision engine.

### With Hooks and Channels

Hook payloads land in the buffer. TEST instructions read the buffer. Therefore, hook messages become inputs to prefix-gated decisions. A scout's hook sending "ENEMY_SPOTTED at D4" arrives in a striker's buffer, where `TEST buffer_has ENEMY_SPOTTED` detects it and `+ ENGAGE nearest` fires.

The prefix system is what gives hooks their purpose. Without conditional logic, every signal would just fill space. With prefixes, every signal is a potential decision trigger. The player who understands this connection — hooks create signals, prefixes read signals — has grasped the entire game.

### With EM Emissions

More instructions = more processing = more EM noise. A unit with 12 instruction lines executing every tick is louder than a unit with 4 lines. But prefix-gated instructions that are SKIPPED (because the flag doesn't match) emit NO noise — they're invisible to enemy detection.

This creates a stealth mechanic within the prefix system: a tightly-written instruction list that uses prefixes to skip unnecessary processing is quieter than a verbose one. The player who writes `TEST threat; + ENGAGE; − HOLD` (3 lines, 1-2 actually executing per tick) is stealthier than the player who writes a 12-line fully-evaluated list.

### With the Inspector

The Inspector's decision trace shows the evaluation waterfall in detail: each tick's instruction-by-instruction execution, with the flag state after each TEST, and the fire/skip status of each prefixed instruction. This is the game's most powerful debugging tool, and it's only meaningful because the prefix system creates a linear, deterministic execution trace.

The prefix system IS the Inspector's content. Without conditionals, there's nothing to trace — every instruction always fires. With prefixes, the trace becomes a detective story: "Why did ENGAGE fire? Because TEST passed on line 3. Why did TEST pass? Because the buffer contained ENEMY_SPOTTED. Where did ENEMY_SPOTTED come from? Signal from SCOUT-A on tick 12 via recon-net channel." The causal chain is fully traceable because the prefix model is stateless (one flag, overwritten each TEST).

### With Command Agents

Command agents with 14-slot buffers and 6 hook slots need the richest conditional logic. Their instruction lists are the longest in the game (12-20 lines). The prefix system scales to this because:
- Chained TESTs provide arbitrarily deep boolean logic
- JUMP enables subroutines (a block of instructions for "defensive posture" and another for "aggressive push")
- The linear model avoids the visual spaghetti of behavior trees at this scale

A Command agent's instruction list IS its personality. Two players can build the same unit types with the same skills and hooks, but their Command agent's prefix logic creates entirely different army behavior.

---

## Comparable Games and Systems

### Shenzhen I/O (Zachtronics, 2016)

The direct ancestor. Shenzhen I/O's +/− prefix on the MC4000 (9 lines, 1 register) and MC6000 (14 lines, 2 registers) is the exact mechanic. Key differences for Robot Uprising:

- Shenzhen I/O is a puzzle game with one correct output. Robot Uprising is a strategy game with emergent outcomes. The prefix logic must handle ambiguity (enemy behavior varies), not just deterministic I/O.
- Shenzhen I/O's TEST compares registers and I/O values. Robot Uprising's TEST reads a buffer of observations — richer input, more uncertainty.
- Shenzhen I/O has no "missing data" case. Robot Uprising does (the buffer might not contain the signal you're testing for) — hence the ? prefix variant.

### ARM Architecture (1985-present)

Every ARM instruction (in the original 32-bit ISA) has a 4-bit condition field: EQ, NE, GT, LT, GE, LE, etc. The comparison instructions (CMP, TST) set the CPSR flags (N, Z, C, V), and all subsequent instructions can be conditioned on those flags. ARM's original predication was dropped from AArch64 because modern out-of-order CPUs can predict branches cheaply — but Robot Uprising's in-order tick evaluation makes predication permanently optimal. The game is, architecturally, a 1985 ARM processor executing behavioral firmware.

### Gladiabots (GFX47, 2017)

Gladiabots uses a visual behavior tree, not a prefix system. The comparison is instructive: Gladiabots' tree is immediately readable (visual hierarchy) but grows unwieldy at depth > 4. The prefix system trades visual hierarchy for linear compactness — a 12-line instruction list with prefixes is more compact than the equivalent 3-level behavior tree, but less immediately parseable to a newcomer.

### Production Rule Systems (OPS5, CLIPS, Drools)

Real AI systems use production rules: condition→action pairs evaluated in priority order, with conflict resolution when multiple rules match. Robot Uprising's prefix model IS a production rule system, but with the crucial simplification that conditions are evaluated sequentially (flag-setting), not in parallel (pattern matching). This makes the system deterministic and traceable — critical for a game where the player needs to understand exactly why their agent did what it did.

### Assembly Language Itself

The conditional prefix is, at its most fundamental, assembly-language conditional execution. The game's vocabulary claim ("1:1 with real agentic AI engineering") is literally true here: the player is writing conditional firmware for an autonomous agent. The skills transfer directly to understanding predicated execution, control flow, and the difference between branching and predication in real computer architecture.

---

## The Prefix as Pedagogy

### What Players Learn Without Knowing It

A player who completes the 10-mission campaign using the prefix system has unknowingly learned:

1. **Predicated execution** — the difference between branching (JUMP) and predication (+/−) and when each is appropriate
2. **Boolean composition** — AND from chaining, OR from repetition, NOT from the − prefix
3. **Linear vs. branching control flow** — and why linear is often simpler
4. **State machines** — a unit's instruction list with JUMPs IS a state machine
5. **The flag register** — a single-bit accumulator that stores the result of the most recent comparison
6. **Defensive programming** — the ? prefix teaches "handle the case where the data doesn't exist"
7. **Information-dependent decisions** — every TEST references the buffer, reinforcing that decisions are only as good as the data available

These concepts transfer directly to:
- Writing microcontroller firmware (Arduino, embedded systems)
- Configuring production rule systems (business rules engines, AI behavior trees)
- Understanding CPU architecture (condition codes, predication, branch prediction)
- Designing agentic AI systems (the game's stated educational goal)

### The "I Didn't Know I Knew That" Moment

The most powerful pedagogical outcome is when a player, months after completing Robot Uprising, encounters predicated execution in a university computer architecture course or a production rule system at work and thinks: "Wait — this is just + and −."

The prefix system's simplicity (three symbols) is its stealth educational power. Complex concepts are absorbed through play, not explanation.

---

## Player Journeys

#### Journey: Lena, 13, Has Never Programmed Anything

**Context:** Mission 3. Lena has been playing with unprefixed rules for two missions. She has one scout and one striker. The boot log just introduced TEST and the + prefix.

**Minute 0:00 — The New Symbol**
The workbench shows her scout's instruction list. A new row has appeared with a yellow-gold highlight: `TEST buffer_has ENEMY_SPOTTED`. Below it, a greyed-out instruction with a green + in the prefix slot: `+ MOVE_TOWARD freshest`. The boot log terminal at the bottom reads: "LOGIC SUBSYSTEM: Conditional evaluation module... ONLINE. The + prefix means: do this ONLY when the test passes."

Lena stares. She hovers over the + symbol. A tooltip appears: "This action happens when the test above says YES." She hovers over the TEST line. Another tooltip: "This asks: does SCOUT-A currently know about an enemy?"

She clicks EXECUTE without changing anything.

**Minute 0:15 — The First Conditional**
The sealed watch plays. Her scout patrols, sees nothing for 3 ticks. On tick 4, an enemy appears in perception range. The scout's context bar fills — a bright yellow pip for ENEMY_SPOTTED. On the instruction trace overlay (a compact column next to the scout's tile), the TEST line flashes yellow, and the green + on MOVE_TOWARD brightens. The scout moves toward the enemy.

On tick 5, the scout moves again. On tick 6, the scout is adjacent to the enemy and does nothing (no ENGAGE instruction). The enemy eliminates the scout.

**Minute 0:40 — The Debrief**
Inspector mode. Lena scrubs to tick 4. She clicks her scout. The instruction trace shows:
```
T4: TEST buffer_has ENEMY_SPOTTED  → ✅ (ENEMY_SPOTTED at D4, age 0)
    + MOVE_TOWARD freshest         → FIRED (moved to D3)
```

She scrubs to tick 6:
```
T6: TEST buffer_has ENEMY_SPOTTED  → ✅ (ENEMY_SPOTTED at D4, age 2)
    + MOVE_TOWARD freshest         → FIRED (already adjacent, no movement)
```

She realizes: "It moves toward the enemy, but then it doesn't do anything. I need an ENGAGE instruction." She goes back to the plan screen.

**Minute 1:10 — The First Authored Conditional**
She adds a new line below + MOVE_TOWARD: she clicks the prefix slot (cycling from · to +), selects ENGAGE from the action dropdown, and picks `nearest` as the parameter.

```
TEST buffer_has ENEMY_SPOTTED
+ MOVE_TOWARD freshest
+ ENGAGE nearest
```

She hits EXECUTE. The scout spots the enemy, moves toward it, and on the next tick — ENGAGE fires. The enemy is eliminated. The combat flash is red. Lena's eyes widen.

**Minute 1:45 — The Minus Discovery**
The second wave spawns two enemies from different directions. The scout spots one and engages, but the second enemy approaches from behind — outside perception range. The scout is eliminated.

Lena goes back to the plan screen. She stares at the prefix slot. She clicks it past + to −. The symbol changes to an amber minus. The tooltip reads: "This action happens when the test above says NO."

She writes:
```
TEST buffer_has ENEMY_SPOTTED
+ MOVE_TOWARD freshest
+ ENGAGE nearest
− PATROL default_path
```

"If you see an enemy, move and fight. If you don't see anything, keep patrolling." She hits EXECUTE. The scout patrols, spots an enemy, engages, eliminates it, then resumes patrolling (buffer clears after 2 ticks, no enemy signal, − PATROL fires). She finds the second enemy on the patrol loop and engages again.

**Minute 2:30 — The Feeling**
Lena has written a conditional program. She doesn't know the words "predicated execution" or "boolean flag." She knows + means "when yes" and − means "when no." She just programmed a seek-and-destroy behavior in four lines. The satisfaction is in the SCOUT's behavior matching her intent — not because she told it where to go, but because she told it how to decide.

**UI Annotations:**
- Prefix slot: 12×12 pixel square, left of each instruction line. Click to cycle ·/+/−.
- TEST line: full-width yellow-gold 8% opacity highlight. Tooltip on hover explains what's being tested.
- + prefix: bright green, 2px green left border on instruction line. Bloom glow when flag = true.
- − prefix: warm amber, 2px amber left border. Brightens when flag = false.
- Evaluation waterfall: 200ms top-to-bottom animation during sealed watch, visible in instruction trace overlay.

---

#### Journey: Raj, 35, Senior Software Engineer Who Writes Go for a Living

**Context:** Mission 7. Raj has been breezing through the campaign. He's running Advanced Rules Mode (full prefix palette from Mission 1). He's building a 3-unit team: scout, relay, striker. The mission has fast-moving enemies and EM-detection patrols.

**Minute 0:00 — The Architecture Problem**
Raj's scout has a tight instruction list:
```
01  TEST buffer_has ENEMY_SPOTTED
02  + TEST signal_count ENEMY_SPOTTED >= 2
03    + COMPRESS ENEMY_SPOTTED → recon-net    ← multiple enemies → compress and send
04    − EVADE nearest                          ← single enemy → evade (don't engage alone)
05  − PATROL stealth_path                      ← nothing spotted → stealth patrol
06  TEST signal_age THREAT_DETECTED > 4
07  + EVADE nearest                            ← threat is stale? It's probably close now. Evade.
```

His relay compresses and forwards. His striker engages on compressed signals. The system works — except the EM emissions from the relay's AMPLIFY are attracting EM-detection patrols. He needs the relay to go silent when there's nothing to amplify.

**Minute 0:30 — The Silence Prefix**
He edits the relay's instruction list:
```
01  TEST buffer_has COMPRESSED_SIGNAL
02  + AMPLIFY → strike-net                     ← signal exists → amplify and forward
03  + FILTER stale_signals                     ← signal exists → also clean up stale data
04  − HOLD_POSITION                            ← nothing to amplify → go silent (0 EM)
```

The − HOLD_POSITION on line 04 is the stealth mechanic: when there's nothing to process, the relay does nothing, emitting zero EM. The relay is only "loud" when it has work to do. Raj realizes this is exactly like a goroutine that blocks on an empty channel — it's not consuming CPU when there's nothing to process.

**Minute 1:00 — The Nested Composition**
He wants the striker to behave differently based on signal quality. High-fidelity signals (fresh, multiple sources) → aggressive engage. Low-fidelity (old, single source) → cautious approach. No signal → hold position near relay.

```
01  TEST buffer_has COMPRESSED_SIGNAL
02  + TEST signal_fidelity COMPRESSED_SIGNAL > 0.7
03    + ENGAGE nearest                          ← high-fidelity → full attack
04    − TEST signal_age COMPRESSED_SIGNAL < 3
05      + MOVE_TOWARD freshest                  ← low-fidelity but fresh → approach cautiously
06      − HOLD_POSITION                         ← low-fidelity AND stale → don't trust it, hold
07  − MOVE_TOWARD RELAY-B                      ← no signal at all → stay near the relay
```

Seven lines. Three levels of decision logic. No brackets, no nesting syntax, no indentation rules. Just TEST, +, and −. Raj's Go-trained mind sees the parallel to:

```go
switch {
case hasSignal && highFidelity:
    engage()
case hasSignal && fresh:
    approach()
case hasSignal:
    hold()
default:
    moveToRelay()
}
```

But the prefix version is more compact. And it's executing on a unit with a 8-slot buffer, constrained by what the unit currently knows. This isn't abstract programming — it's programming under uncertainty, with real-time consequences.

**Minute 2:00 — The EM Discovery**
He hits EXECUTE. The system works beautifully — scout spots, relay compresses and forwards, striker engages precisely. But on tick 14, the EM detection patrol spots his relay's amplification burst and moves toward it. The relay has no defensive capabilities. It's eliminated on tick 16.

In the Inspector, Raj sees the EM emission spike on tick 12 when the relay amplified three signals simultaneously. He realizes: his relay needs a **rate limiter** — amplify at most one signal per tick to keep EM low.

```
01  TEST buffer_count COMPRESSED_SIGNAL >= 2
02  + FILTER oldest_signal                     ← too many signals → drop the oldest first
03  TEST buffer_has COMPRESSED_SIGNAL
04  + AMPLIFY → strike-net
05  − HOLD_POSITION
```

Now the relay processes one signal per tick maximum. The EM footprint is 60% lower. The striker gets signals more slowly, but they're higher quality. Raj has just implemented backpressure — a core distributed systems concept — using nothing but prefix composition.

**Minute 3:00 — The Realization**
Raj opens Slack and messages his team: "I'm playing this game that's literally making me think about goroutine scheduling and backpressure. The 'rules' are assembly-language conditional execution. I just implemented rate limiting using three-line prefix logic."

**UI Annotations:**
- Advanced Rules Mode: full prefix palette available from Mission 1. Toggle in settings. Diegetic boot log: "ADVANCED LOGIC MODULE: Full conditional evaluation suite loaded."
- EM emission meter: thin bar below each unit's instruction list showing estimated EM output. Green (low), amber (medium), red (high). Updates live as the player edits instructions.
- Inspector EM overlay: heatmap showing EM emission intensity per tile per tick. Toggle in Inspector sidebar.

---

#### Journey: Abuela Carmen, 67, Retired Schoolteacher, Plays Candy Crush on Her iPad

**Context:** Mission 3. Carmen's granddaughter Sofia (15) set up the game for her. Carmen has completed Missions 1-2 with unprefixed rules — she understands "the little robot follows the list." The boot log just introduced the + prefix.

**Minute 0:00 — "What's This Green Thing?"**
The workbench shows a new element: a green + symbol next to one of the instruction lines. Carmen squints. The boot log text at the bottom says: "NEW: The + symbol means 'only do this when the answer is yes.'" She doesn't fully parse this.

She hovers over the +. A tooltip appears with an animation: a tiny robot icon next to a question mark → checkmark → the robot moves. Then: question mark → X → the robot stands still. The animation loops. No text needed.

Carmen watches the animation three times. "Oh — it only goes if the answer is yes." She nods.

**Minute 0:20 — The Guided First Use**
The mission has one pre-placed scout with a partially filled instruction list:

```
TEST buffer_has ENEMY_SPOTTED      ← pre-filled, yellow highlight
+ ???                               ← empty slot with green + prefix, pulsing gently
− PATROL default_path               ← pre-filled
```

The middle slot pulses. A whisper bar at the top reads: "What should SCOUT-A do when it spots an enemy?" The action dropdown is pre-opened showing three options: MOVE_TOWARD, EVADE, HOLD_POSITION. Each has a simple icon.

Carmen clicks MOVE_TOWARD. The slot fills in. The pulse stops. She feels the satisfaction of completing a pattern — like filling in a crossword.

**Minute 0:35 — Watching It Work**
EXECUTE. The sealed watch plays. The scout patrols (− PATROL firing). Tick 3: enemy appears. The scout's context bar gets a new pip. On the instruction trace overlay, the TEST line flashes yellow, and the green + MOVE_TOWARD brightens. The scout moves toward the enemy.

Carmen points at the screen: "It saw the bad guy and went after it! Because of the green plus!" She understands. The animation tooltip taught her the concept; the execution confirmed it.

**Minute 1:00 — The First Edit**
The scout moves toward the enemy but has no ENGAGE instruction. It stands there. The enemy eliminates it. Carmen frowns.

She goes back to the plan screen. She looks at her instruction list. She taps below the + MOVE_TOWARD line. A new empty row appears. She clicks the prefix slot — the grey dot appears. She clicks again — the green + appears. "Yes — I want this one to also happen when there's an enemy." She selects ENGAGE from the dropdown.

```
TEST buffer_has ENEMY_SPOTTED
+ MOVE_TOWARD freshest
+ ENGAGE nearest
− PATROL default_path
```

EXECUTE. The scout spots, moves, engages, eliminates. Carmen claps her hands once, sharply. "¡Así!"

**Minute 1:30 — Understanding the Pattern**
Carmen now sees the pattern: yellow line asks a question, green lines are "yes" answers, amber lines are "no" answers. She doesn't know the words "conditional execution" or "boolean flag." She sees a traffic light pattern: yellow = caution/question, green = go, amber = wait.

She tells Sofia later: "The yellow line asks the question. The green ones go when the answer is yes. The orange one goes when it's no. It's like a traffic light for the robot."

Sofia: "Abuela, you just described conditional execution."
Carmen: "I described a traffic light."

**UI Annotations:**
- Tooltip animation: 32×32 pixel animated loop showing robot + question → checkmark → action / X → no action. No text. Universal.
- Whisper bar: 14px text at top of workbench, fades in when player hesitates >3 seconds, fades out on interaction.
- Pre-opened dropdown: for the first conditional slot, the action dropdown is pre-opened to reduce friction.
- Traffic light color coding: yellow (TEST), green (+), amber (−) — chosen for universal cultural recognition.

---

## Strengths Summary

1. **Minimal vocabulary, maximum expression.** Three symbols (TEST, +, −) yield boolean composition, branching, loops, and multi-agent coordination.
2. **Linear readability.** No nesting, no brackets, no scope management. The instruction list reads top-to-bottom like a checklist.
3. **Proven at both ends of the skill spectrum.** Shenzhen I/O proves it works for experts. Carmen's traffic light proves it works for complete beginners.
4. **Buffer-native.** Every TEST references the context window, reinforcing the game's core theme.
5. **Stealth pedagogy.** Players learn predicated execution, boolean logic, and control flow without being taught those concepts.
6. **Inspector-friendly.** The linear execution trace is trivially debuggable — no tree traversal, no parallel evaluation, no ambiguity.
7. **EM-emission compatible.** Skipped instructions emit no noise, creating a stealth dimension within the rules system.

## Weaknesses Summary

1. **Sequencing dependency.** The flag is overwritten by each TEST. The player must think about instruction order carefully. Out-of-order edits can break logic.
2. **The +/− symbols are cryptic at first.** "Plus means if yes" requires explanation (or a really good tooltip animation).
3. **JUMP creates spaghetti.** Expert-level instruction lists with multiple JUMPs become as impenetrable as real assembly. The Inspector mitigates this but can't eliminate it.
4. **The "missing data" problem.** Binary +/− conflates "condition is false" with "condition can't be evaluated." The ? prefix (Variation B) solves this but adds complexity.
5. **Single flag bottleneck.** Complex conditions that need to remember multiple test results require careful chaining. Named flags (Variation D) solve this but sacrifice simplicity.

---

## New Aspects Discovered

- **3.05a-i — The ? (uncertainty) prefix as first-class game mechanic:** deep dive into Variation B's tri-state prefix — when does "I don't have data" differ strategically from "the data says no"? Mission design that forces the distinction. The defensive programming lesson.
- **3.05a-ii — Prefix composition as boolean algebra tutorial:** explicit mapping of player prefix patterns to boolean algebra (De Morgan's laws, short-circuit evaluation, truth tables) and when/whether to surface this mapping pedagogically vs. leaving it implicit.
- **3.05a-iii — The accumulator prefix as consensus mechanic (Variation C):** majority voting in agent decision-making. "At least 2 of these 3 conditions must pass." Mapping to distributed consensus protocols (Raft, Paxos). Mission design that teaches quorum.
- **3.05a-iv — Prefix-to-behavior-tree visual translation in Inspector:** showing the same instruction list as BOTH a linear prefix sequence AND an equivalent behavior tree diagram side-by-side. The "Rosetta Stone" view that bridges Gladiabots-style tree thinking and Shenzhen-style linear thinking.
- **3.05a-v — The evaluation waterfall as spectator sport:** detailed visual design for the instruction evaluation animation during sealed watch and its optimization for streaming/TikTok. Split-screen choreography between the waterfall trace and the battlefield consequence.
