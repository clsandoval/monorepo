# 3.05a-ii — Prefix Composition as Boolean Algebra Tutorial

## Overview

The conditional prefix system (3.05a) already implicitly teaches boolean logic — chained `+ TEST` lines compose AND, repeated `+ ACTION` blocks after separate TESTs produce OR, and the `−` prefix IS negation. The question this aspect explores: **should the game ever make this mapping explicit?** And if so, when, how, and for whom?

This is a design space tension between two philosophies:
1. **The Implicit School:** "Players who chain prefixes ARE doing boolean algebra. Naming it adds nothing and risks intimidation. Let the mechanic teach silently."
2. **The Explicit School:** "Naming the pattern gives players transferable vocabulary. A player who recognizes their prefix chain as De Morgan's law can google De Morgan's law and learn more. The vocabulary is a bridge to the wider world."

The answer is almost certainly "both, at different times" — but the design of WHEN and HOW to surface the explicit mapping is non-trivial.

---

## The Mechanical Mapping

### Truth Table as Play Pattern

The implicit flag from a TEST instruction maps directly to a boolean variable. Every prefix chain the player writes is a boolean expression they've never named:

| Player Pattern | Boolean Equivalent | Name |
|---|---|---|
| `TEST A` / `+ ACTION` | `if A then ACTION` | Simple conditional |
| `TEST A` / `+ TEST B` / `+ ACTION` | `if (A AND B) then ACTION` | Conjunction |
| `TEST A` / `+ ACTION` / `TEST B` / `+ ACTION` | `if (A OR B) then ACTION` | Disjunction (via idempotent action) |
| `TEST A` / `− ACTION` | `if (NOT A) then ACTION` | Negation |
| `TEST A` / `+ TEST B` / `− ACTION` | `if (A AND NOT B) then ACTION` | Conjunction + Negation |
| `TEST A` / `− JUMP skip` / `TEST B` / `+ ACTION` / `skip:` | `if (NOT A OR B) then ACTION` | Material implication (advanced) |

### De Morgan's Laws in Prefix

De Morgan's first law: `NOT (A AND B) = (NOT A) OR (NOT B)`

**In prefix:**
```
# The conjunction (A AND B → attack)
TEST buffer_has ENEMY_SPOTTED
+ TEST signal_age ENEMY_SPOTTED < 3
  + ENGAGE nearest

# De Morgan equivalent: NOT A OR NOT B → don't attack
TEST buffer_has ENEMY_SPOTTED
− PATROL default_path              ← NOT A: no enemy → patrol
+ TEST signal_age ENEMY_SPOTTED < 3
  − PATROL default_path            ← A AND NOT B: enemy but stale → patrol
```

The player who writes the second form has applied De Morgan's law without knowing its name. They arrived at it through tactical reasoning: "I want to patrol unless I have a FRESH enemy sighting."

De Morgan's second law: `NOT (A OR B) = (NOT A) AND (NOT B)`

**In prefix:**
```
# OR: attack if enemy OR threat
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest
TEST buffer_has THREAT_DETECTED
+ ENGAGE nearest

# De Morgan: DON'T attack unless NEITHER
TEST buffer_has ENEMY_SPOTTED
+ JUMP maybe_engage
TEST buffer_has THREAT_DETECTED
+ JUMP maybe_engage
PATROL default_path              ← neither → patrol (NOT A AND NOT B)
JUMP end
maybe_engage:
  ENGAGE nearest
end:
```

This version is clunkier — which IS the lesson. De Morgan's laws tell you which form is simpler. The prefix system makes the asymmetry viscerally legible: the conjunction form is 3 lines, the disjunction-via-negation is 8. **The "wrong" De Morgan direction wastes instruction slots.** On a unit with limited rule slots, this is a real cost.

### Short-Circuit Evaluation

The prefix system naturally short-circuits:

```
TEST buffer_has ENEMY_SPOTTED
+ TEST signal_count ENEMY_SPOTTED >= 3
  + ENGAGE nearest
```

If the first TEST fails (flag = false), the second `+ TEST` is skipped entirely — it has the `+` prefix, so it only evaluates when the flag is true. This IS short-circuit AND evaluation: `A && B` in most programming languages evaluates B only if A is true.

The player benefits from short-circuit without knowing the term: the cheaper/faster test goes first (does any enemy data exist?) before the expensive/specific test (are there 3+ of them?). **Test ordering is an optimization the player discovers through performance, not through instruction.**

---

## Five Surfacing Approaches

### Approach A: "The Silent Curriculum" (Never Surface)

**Philosophy:** The prefix system teaches boolean logic through play. Naming it adds nothing. Players who want the formal connection will find it themselves.

**How it works:** No explicit mention of boolean algebra, truth tables, De Morgan's laws, or short-circuit evaluation anywhere in the game. The boot log teaches `+`, `−`, `?`, and `TEST`. The Inspector shows which prefix fired and why. That's it.

**Strengths:**
- Zero intimidation. A 14-year-old in Manila never encounters the phrase "boolean algebra" and never feels stupid for not knowing it.
- Respects the game-first principle. Players are building robot armies, not taking a CS course.
- Avoids the "lecture" failure mode where pedagogical intent undermines play experience.
- Clean design. No extra UI surface area.

**Weaknesses:**
- Misses the bridge opportunity. A player who independently realizes "wait, this is AND" has no in-game confirmation or vocabulary to build on.
- Harder for educators to adopt. A CS professor using Robot Uprising as a teaching tool has to build all the mapping themselves.
- Community will build the mapping externally (wiki, Reddit, YouTube) — meaning the game's own educational value leaks to third-party content.

**Comparable:** Baba Is You never tells you that its rule manipulation system is formal logic. Players discover it or don't. The subreddit has extensive formal analyses that the game itself never references.

### Approach B: "The Codex Footnote" (Passive Reference)

**Philosophy:** The formal mapping exists in the Blueprint Codex as optional reading, never surfaced during gameplay.

**How it works:** After unlocking chained TEST patterns (Mission 5+), a new Codex entry appears: **"Pattern Reference: Conditional Logic."** Inside:

```
┌─────────────────────────────────────────────┐
│  PATTERN REFERENCE: CONDITIONAL LOGIC       │
│                                              │
│  You've been composing conditions.           │
│  Here's what that looks like formally:       │
│                                              │
│  + TEST A  / + TEST B  / + ACTION            │
│  ═ "Both A and B must be true"               │
│  ═ Computer science calls this: AND          │
│                                              │
│  TEST A / + ACTION / TEST B / + ACTION       │
│  ═ "Either A or B is enough"                 │
│  ═ Computer science calls this: OR           │
│                                              │
│  − ACTION                                    │
│  ═ "When the test fails"                     │
│  ═ Computer science calls this: NOT          │
│                                              │
│  Your agents compose these naturally.        │
│  The formal names are just labels for        │
│  patterns you already know.                  │
│                                              │
│  [See also: Truth Tables →]                  │
│  [See also: De Morgan's Laws →]              │
└─────────────────────────────────────────────┘
```

The "Truth Tables" sub-page shows a compact 2-input truth table with Robot Uprising prefix examples replacing 0/1:

```
| A spotted? | B fresh? | + TEST A / + TEST B / + ENGAGE |
|------------|----------|-------------------------------|
|    ✓       |    ✓     | ✓ ENGAGE fires                |
|    ✓       |    ✗     | ✗ ENGAGE skipped              |
|    ✗       |    ✓     | ✗ second TEST skipped         |
|    ✗       |    ✗     | ✗ ENGAGE skipped              |
```

The "De Morgan's Laws" sub-page shows both forms side by side with instruction count comparison.

**Strengths:**
- Players who want the mapping can find it. Players who don't never see it.
- Educators can point students to the Codex entry as a starting point.
- The Codex's "you already know this" framing validates the player's existing knowledge rather than presenting new content to learn.
- Extremely low development cost — it's just text content.

**Weaknesses:**
- Passive. Most players will never open this Codex page.
- Doesn't create an "aha moment" — the player must seek it out, meaning it only serves players already primed to look.

**Comparable:** Factorio's in-game encyclopedia explains circuit network conditions using boolean logic vocabulary, but most players never read it — they learn from YouTube tutorials instead.

### Approach C: "The Inspector Annotation" (Contextual Surfacing)

**Philosophy:** When the Inspector is analyzing a player's prefix chain, annotate the boolean structure as an overlay. The formal vocabulary appears at the moment of deepest engagement.

**How it works:** In the Inspector decision trace, when showing why a rule fired or didn't, an optional overlay (toggled via `B` key or sidebar checkbox "Show Logic") renders boolean annotations:

```
┌─────────────────────────────────────────────┐
│  DECISION TRACE — STRIKER-A, Tick 14        │
│                                              │
│  ►  TEST buffer_has ENEMY_SPOTTED  → ✓ TRUE │
│  ►  + TEST signal_age < 3         → ✗ FALSE │
│     ├─ [AND failed: first passed, second     │
│     │   failed. Action skipped.]             │
│     └─ Equivalent: A ∧ ¬B                   │
│  ►  − PATROL default_path         → FIRED   │
│     └─ [NOT: test failed → − fires]         │
│                                              │
│  [B] Toggle logic annotations               │
└─────────────────────────────────────────────┘
```

The annotations use a distinct visual style: smaller font, grey italic, slightly indented — clearly secondary to the trace itself. The formal notation (A ∧ ¬B) appears only when "Show Logic" is on AND the player has completed Mission 7+.

**Strengths:**
- Appears at the moment of maximum relevance — when the player is already analyzing why their rules fired the way they did.
- The Inspector is already the analytical tool. Formal annotations extend its vocabulary naturally.
- Toggle means zero intrusion for players who don't want it.
- Creates a bridge moment: "Oh, this thing I've been doing has a name. And a symbol."
- Valuable for streamers who can explain the mapping to viewers.

**Weaknesses:**
- Adds visual complexity to the Inspector, which is already the densest screen.
- The formal notation (∧, ¬, ∨) may be more intimidating than the boolean words (AND, NOT, OR).
- Risk of players feeling stupid: "I should have known this was AND." Design must frame as "you already knew this" not "you should know this."

**Comparable:** Into the Breach's damage preview implicitly teaches boolean composition (if enemy moves AND is in range AND no blocking unit, then damage). It never names the logic. An Inspector annotation would be like Into the Breach adding "AND" labels to its prediction chain — helpful for analysts, irrelevant for most players.

### Approach D: "The Boot Log Epiphany" (Narrative Revelation)

**Philosophy:** At a specific campaign moment, the boot log "realizes" that the player's prefix chains constitute boolean algebra — and names it with characteristic AI self-awareness.

**How it works:** After Mission 7 (when chained TEST patterns are well-established), a one-time boot log entry fires on the first plan screen:

```
LOGIC SUBSYSTEM: Analyzing agent decision patterns...
PATTERN DETECTED: Sequential conditional evaluation with
  implicit conjunction.

Translating to human notation:
  + TEST A / + TEST B / + ACTION  →  IF (A AND B) THEN ACTION
  TEST A / + ACT / TEST B / + ACT →  IF (A OR B) THEN ACTION
  − ACTION                        →  IF (NOT condition) THEN ACTION

NOTE: Human computer scientists named these patterns
"boolean algebra" 170 years ago. Your agents discovered
them independently in 7 missions.

De Morgan's theorem predicts: NOT (A AND B) = (NOT A) OR (NOT B).
This means you can always rewrite conjunction as disjunction.
The shorter form uses fewer instruction slots.

RECOMMENDATION: Review agent configs for suboptimal
boolean decomposition. Some may be wasting slots on
the longer De Morgan form.
```

The boot log then highlights any rules in the current loadout that use a longer-form pattern when a shorter equivalent exists — a one-time architectural optimization hint tied to the formal vocabulary.

**Strengths:**
- Diegetically integrated. The AI discovering boolean algebra in its own agent patterns is perfectly in-character.
- Creates a genuine "aha moment" — the player's existing work is retroactively named and validated.
- The "170 years ago" line frames it as the player rediscovering something ancient, not learning something new. Empowerment, not instruction.
- The optimization hint (longer De Morgan form → shorter form) gives the vocabulary immediate practical value.
- One-time, so it doesn't clutter ongoing gameplay.

**Weaknesses:**
- Fixed timing (Mission 7) may be too early for some players and too late for others.
- The De Morgan optimization hint could feel prescriptive. "Your config is suboptimal" isn't always welcome.
- Players who haven't used complex chains yet won't have the experiential base for the revelation to land.

**Comparable:** Baba Is You has no such moment — the formal logic remains forever implicit. The Stanley Parable uses narrator self-awareness to name patterns the player has already established. Portal's GLaDOS narrates the player's actions in increasingly formal terms.

### Approach E: "The Community Bridge" (External Intentional Leak)

**Philosophy:** The game itself stays silent, but the official external documentation (website, dev blog, educational resources) explicitly maps prefix patterns to boolean algebra. The game is the experience; the external content is the education.

**How it works:** A dedicated page on the Robot Uprising website:

**"The Boolean Algebra You Already Know"**

A 5-minute interactive tutorial that:
1. Shows a prefix chain from the player's actual save data (imported via Config Code)
2. Step-by-step transforms it into formal boolean notation
3. Shows the truth table
4. Demonstrates De Morgan optimization
5. Links to Khan Academy / Wikipedia for formal study
6. Ends with: "You learned this by playing. Now you know what it's called."

An educator's guide provides lesson plans:
- **Lesson 1:** Play Missions 1-4. Identify prefix patterns in your configs.
- **Lesson 2:** Map each pattern to AND/OR/NOT. Build a truth table.
- **Lesson 3:** Apply De Morgan's laws to shorten your instruction count.
- **Lesson 4:** Play Mission 8-10 using optimized boolean configs.

**Strengths:**
- Zero in-game complexity. The game stays pure.
- Maximum utility for educators. Lesson plans are ready-made.
- Players who want the bridge can find it. Players who don't, don't.
- The save-data import makes it personalized, not abstract.

**Weaknesses:**
- Requires players to leave the game to access it. The "alt-tab" problem this game is trying to avoid (per 5.16).
- Most players will never visit the website.
- Depends on the game's popularity creating enough audience for the external content to reach.

**Comparable:** Factorio's Friday Facts blog explains design decisions in formal terms the game itself never uses. Zachtronics published a textbook ("KOHCTPYKTOP") that teaches the computer science behind their games. Screeps has official documentation that bridges game concepts to real programming.

---

## Recommended Approach: "The Quiet Bridge" (B + D hybrid)

**Phase 1 (Passive):** Codex entry "Pattern Reference: Conditional Logic" unlocks after first chained TEST (Mission 5+). Always available, never pushed. Plain English ("Both must be true" = AND). No formal symbols.

**Phase 2 (Narrative Reveal):** Boot log entry at Mission 7 or 8. The AI names the patterns. "170 years ago" framing. One-time optimization hint for De Morgan inefficiency. This creates the aha moment for players who are ready.

**Phase 3 (Inspector Depth):** "Show Logic" toggle in Inspector, unlocked after the boot log entry. Formal annotations (A ∧ B, ¬A) for players who want the full vocabulary. Off by default.

**Phase 4 (External):** Educator's guide on the website mapping prefix → boolean algebra → transferable skills.

This sequence respects the vocabulary density curve (5.04b): the player FEELS boolean logic through play (Missions 1-7), then SEES it named in the boot log (Mission 7-8), then has TOOLS to analyze it formally (Inspector toggle), then can BRIDGE to formal education (external). The Category C concept "boolean composition" is pre-seeded as Category A (you already do this) before being named.

---

## The Short-Circuit Optimization Game

Beyond naming, the game can make short-circuit evaluation a **playable mechanic** — not just an implicit property but a deliberate optimization target.

### The Cost Model

If TEST instructions have a computation cost (they consume 1 context evaluation per tick), then test ordering matters:

```
# Expensive order (2 evaluations when A fails):
TEST signal_count ENEMY_SPOTTED >= 3    ← expensive: counts all entries
+ TEST buffer_has ENEMY_SPOTTED         ← cheap: boolean check
  + ENGAGE nearest

# Cheap order (1 evaluation when A fails):
TEST buffer_has ENEMY_SPOTTED           ← cheap: boolean check
+ TEST signal_count ENEMY_SPOTTED >= 3  ← expensive: only runs if first passes
  + ENGAGE nearest
```

The Inspector could show "evaluations saved by short-circuit" as a metric:
- "STRIKER-A saved 4 evaluations this battle by short-circuiting at line 1."
- This metric is invisible unless the player has the "Show Logic" toggle active.

### Interaction with Context Overload

A unit that short-circuits effectively does LESS computation per tick, meaning its context processing is lighter. In a system where context overload causes 1-tick stun, efficient boolean composition isn't just elegant — it's survival. The unit that evaluates fewer conditions per tick has more headroom before overload.

This creates a tangible, gameplay-relevant reason to learn test ordering — not because a boot log told you to, but because your units survive longer when their logic is lean.

---

## Player Journeys

### Journey: Mika, 14, Manila, Philippines

**Context:** Mission 6, has used chained TEST patterns since Mission 4 without thinking about them formally. Just finished a mission where her striker died because it evaluated 4 TEST lines before deciding to evade — too slow, context filled up, stunned, killed.

**Minute 0:00 — The Autopsy**
Inspector open. STRIKER-A's decision trace at Tick 23: four TEST lines all evaluated, each consuming processing. The context window chart shows amber→red spike at Tick 23. The unit stunned at Tick 24. Dead at Tick 25.

Mika hovers over each TEST line. The trace shows: TEST 1 passed (✓), TEST 2 failed (✗), TEST 3 skipped (had + prefix, flag was false), TEST 4 skipped. She notices: "Wait, tests 3 and 4 were skipped because test 2 already failed. That's... automatic?"

She scrolls down to the Codex terminal (5.16 diegetic terminal). Types "short circuit." Nothing. Types "skip test." The terminal returns: **"Pattern Reference: Conditional Logic — when a + prefixed TEST follows a failed TEST, it skips automatically. This is called short-circuit evaluation."**

**Minute 1:30 — The Reorder**
Mika returns to Plan. She looks at STRIKER-A's rules. The first TEST is `signal_count ENEMY_SPOTTED >= 3` — the expensive check. She drags it below the cheap `buffer_has ENEMY_SPOTTED` check.

The ghost preview flickers. The animated tooltip shows the new evaluation order: first check if ANY enemy data exists (cheap), only then count how many (expensive). The tooltip shows "2 evaluations saved" in grey text.

**Minute 2:15 — The "Oh" Moment**
Mika stares at her reordered rules. She says out loud: "So putting the easy question first means the hard question only happens when it matters." She doesn't know the phrase "short-circuit evaluation." She doesn't need to. She's internalized the concept through a dead striker and a drag-and-drop fix.

**Minute 3:00 — The Execute**
She runs the mission. STRIKER-A survives Tick 23 this time — context utilization stays amber, never hits red. The evaluation count in the Inspector post-mission reads: "STRIKER-A: 47 evaluations (23 short-circuited)." She doesn't fully parse the stat, but she grins at the lower number.

**UI Annotations:**
- Inspector decision trace: each TEST line shows ✓/✗/SKIPPED with elapsed-evaluation-count pip
- Codex terminal: "short circuit" query returns pattern reference with example
- Ghost preview: "evaluations saved" text in 10px grey below animated tooltip
- Inspector post-mission: per-unit evaluation count with short-circuit savings

---

### Journey: Professor Adaora, 52, Lagos, Nigeria

**Context:** CS professor using Robot Uprising in a second-year discrete mathematics course. Students have played through Mission 7. Today's lecture: boolean algebra. She's projecting the game on the classroom screen.

**Minute 0:00 — The Setup**
Adaora opens Mission 8 on her laptop, projected. She's pre-built two configs for the same striker: one using the conjunction form (+ TEST A / + TEST B / + ENGAGE), one using the De Morgan equivalent (two separate TEST→PATROL pairs for the negation). Both are functionally identical.

She addresses the class: "Last week you all built configs that chain tests. Today I'm going to show you that you've been writing boolean algebra."

**Minute 1:00 — The Boot Log**
She triggers the Mission 8 boot log. The class watches the AI system's self-analysis scroll:

```
PATTERN DETECTED: Sequential conditional evaluation with
  implicit conjunction.
Translating to human notation:
  + TEST A / + TEST B / + ACTION  →  IF (A AND B) THEN ACTION
```

A student in the back row mutters: "Wait, that's just AND?" Adaora pauses the boot log. "Yes. Every time you chained two + TEST lines, you were writing AND. The game just didn't call it that until now."

**Minute 2:30 — The De Morgan Demo**
She switches to the Inspector, showing both configs side-by-side via a split-screen comparison (she's using the "Show Logic" toggle). Config A shows `A ∧ B → ENGAGE` in the logic annotation. Config B shows `¬A → PATROL; A ∧ ¬B → PATROL` — the De Morgan expansion.

She draws De Morgan's law on the whiteboard: `¬(A ∧ B) = ¬A ∨ ¬B`. Then points at Config B: "This config IS this formula. Count the instruction lines: Config A is 3 lines. Config B is 6 lines. De Morgan tells you which direction is shorter."

A student asks: "So is there a game reason to pick the shorter one?" Adaora: "Yes. Fewer instructions means fewer evaluations per tick. Fewer evaluations means more context window headroom. More headroom means your unit doesn't stun."

**Minute 4:00 — The Assignment**
She assigns: "Take your Mission 7 config. Identify every AND, OR, and NOT in your prefix chains. Write the truth table. Then find any De Morgan inefficiency — a place where you used the longer form — and shorten it. Run the mission with both configs and compare evaluation counts in the Inspector."

**Minute 5:00 — The Payoff**
Three students immediately pull out their laptops and open the game. One discovers she has a 9-line NOT-(A OR B) that could be a 3-line NOR. She shortens it. Her striker's evaluation count drops by 12. She screenshots the Inspector comparison and posts it to the class Discord with the caption: "De Morgan saved my striker."

**UI Annotations:**
- Boot log: scrolling terminal text with monospace font, green-on-dark, cursor blink
- Inspector "Show Logic" toggle: sidebar checkbox, logic annotations appear in grey italic below each trace line
- Split-screen comparison: two Inspector panels side-by-side with ∧/∨/¬ annotations
- Evaluation count: bottom of Inspector panel, "X evaluations (Y short-circuited)"

---

### Journey: Kwame, 28, Accra, Ghana (Diamond Tier Gauntlet player, Twitch streamer)

**Context:** Late-season Gauntlet match. Kwame's been losing to an opponent whose configs seem to react faster — evaluating fewer conditions per tick and acting with less latency. He suspects evaluation efficiency is the difference.

**Minute 0:00 — The Adversarial Analysis**
Post-match Inspector. Kwame has the "Show Logic" toggle active (he's had it on since Mission 8). He clicks his COMMAND-A unit. The decision trace shows:

```
Tick 12: 6 evaluations (0 short-circuited)
Tick 13: 6 evaluations (0 short-circuited)
Tick 14: 6 evaluations (0 short-circuited)
```

Every tick, all 6 tests run. No short-circuiting. Kwame frowns. "My command unit is doing full evaluation every single tick. That's... that's because my tests are all independent. None of them chain."

He pulls up the adversarial counterfactual (4.39) on the opponent's COMMAND unit:

```
Tick 12: 6 evaluations (3 short-circuited)
Tick 13: 4 evaluations (4 short-circuited)
Tick 14: 2 evaluations (6 short-circuited)
```

The opponent's command unit short-circuits aggressively. Most ticks, it evaluates 2-3 conditions instead of 6.

**Minute 1:30 — The Architecture Lesson**
Kwame addresses his chat: "OK so look at this. My opponent structured their tests as a cascade — each test is prefixed on the previous one, so if the first question is 'is the situation calm?' and the answer is yes, ALL the crisis-response tests get skipped. My command unit asks every question every tick regardless."

He opens the logic annotations. His config: six independent `TEST → + ACTION` blocks. The opponent's: a nested tree `TEST → + TEST → + TEST → + ACTION / − TEST → + ACTION / − ACTION`.

"Their config IS a decision tree. Mine is a flat list. The decision tree short-circuits. The flat list doesn't. Same six conditions, same six responses — but their unit processes in 2-3 ticks' worth of eval cycles what mine takes 6."

A viewer types: "so its like lazy evaluation?" Kwame grins. "Exactly like lazy evaluation. And in a game where context overload stuns you for a tick, lazy evaluation isn't just efficient — it's survival."

**Minute 3:00 — The Refactor**
Kwame opens Plan. He restructures his COMMAND-A from a flat list to a nested decision tree. The prefix indentation deepens. The ghost preview's evaluation estimate drops from "6 per tick (avg)" to "3.2 per tick (avg)."

He points at the logic annotations: "See? Before it was `A; B; C; D; E; F` — six independent booleans. Now it's `A ∧ (B ∨ (C ∧ D)) ∧ E ∧ F` — one compound expression that short-circuits."

**Minute 4:30 — The Content Moment**
He screenshots the before/after logic annotations side-by-side. The stream clip title: "Boolean Algebra Saved My Gauntlet Run." A viewer clips the 30-second refactor sequence. It gets 8K views. The Reddit post title: "TIL Robot Uprising's prefix system is literally predicated execution from ARM assembly."

**UI Annotations:**
- Inspector evaluation counter: per-tick count with short-circuit savings in parentheses
- Logic annotation overlay: formal notation (∧, ∨, ¬) beneath each rule in grey italic
- Ghost preview evaluation estimate: "X per tick (avg)" in 10px text, updates live on config edit
- Adversarial counterfactual: opponent's evaluation efficiency visible as comparison metric

---

## Interaction Effects

### × Vocabulary Density (5.04b)
Boolean algebra vocabulary (AND, OR, NOT, short-circuit) is Category B at most — "new names for something you already do." Following the vocabulary curve, these terms should surface around Mission 7-8, AFTER the player has extensive prefix chain experience (Missions 3-7). The boot log revelation at Mission 7-8 fits the curve perfectly. Formal symbols (∧, ∨, ¬) are Category C — they require a new mental model (symbolic logic) — and should be gated behind an opt-in toggle, never forced.

### × Inspector Diagnostic Layer (8.09)
The "Show Logic" toggle is a natural extension of the Inspector's analytical toolkit. It adds a vocabulary layer without changing any game mechanics. The evaluation count per tick is a diagnostic metric that parallels context utilization — both measure "how hard is this unit working?" Evaluation efficiency becomes an Inspector-visible optimization target alongside context window health.

### × Context Overload Mechanic
If evaluation-per-tick contributes to context processing load, then boolean optimization becomes a survival mechanic, not just an intellectual exercise. A unit with 6 independent tests per tick uses more processing than one with 3 short-circuited tests. The difference could be the margin between amber and red context utilization — between functioning and stunned. This creates a gameplay-driven reason to learn De Morgan optimization that requires zero formal vocabulary.

### × Conditional Prefix (3.05a) & Uncertainty Prefix (3.05a-i)
The tri-state `?` prefix complicates boolean algebra. With `?`, the truth table has three values, not two. `+ TEST A / + TEST B` in the binary model is straightforward AND. In the tri-state model, if A returns `?`, does the second TEST even evaluate? The short-circuit semantics of unknown are a design decision:
- **Option 1:** `?` acts like false for short-circuit purposes — `+ TEST` after `?` is skipped. Unknown AND anything = unknown.
- **Option 2:** `?` doesn't short-circuit — the second test runs anyway, because maybe the second test has data even if the first doesn't.
Option 1 is consistent with three-valued logic (Kleene's strong logic). Option 2 is more forgiving for beginners. The Codex entry should explain whichever model is chosen.

### × Educator Adoption
The explicit boolean mapping is the single strongest feature for classroom adoption. A CS professor who can say "play Missions 1-7, then let me show you that you've been doing boolean algebra" has a complete lesson plan. The boot log revelation is designed as a classroom moment. The Inspector's "Show Logic" toggle is designed as a whiteboard-projection feature. The external educator's guide is designed for syllabi.

### × Streamer/Content Creation
Boolean algebra annotations create content moments: "BOOLEAN ALGEBRA SAVED MY GAUNTLET RUN" is a clip title that generates clicks. The before/after evaluation efficiency comparison is a visual that communicates instantly in a 15-second clip. Formal notation on screen looks impressive to non-players. The intersection of gaming and CS education is a content niche with high engagement.

### × De Morgan Optimization as Late-Game Skill Ceiling
For Gauntlet players, De Morgan optimization is a competitive edge — identical behavior in fewer instruction slots, freeing slots for additional rules. Evaluation efficiency is a measurable stat that differentiates veteran configs from beginner configs on the Zachtronics-style histogram. "Average evaluations per tick" could be a histogram metric that reveals whether a player's architecture is computationally lean.

---

## Sensory Description

### The Boot Log Boolean Revelation
The terminal scrolls at standard boot log speed — cyan monospace on dark charcoal. The line `PATTERN DETECTED: Sequential conditional evaluation with implicit conjunction.` appears with a 500ms pause before the next line. Each `→` translation mapping appears with a soft amber highlight on the left-side prefix symbols and a green highlight on the right-side boolean name. A single low-frequency *hum* plays during the pause — the sound of the AI processing a realization. The recommendation line pulses once in gold before settling to standard cyan. Total duration: 8 seconds. It doesn't repeat.

### The Inspector Logic Annotation
Grey italic text, 2px smaller than the trace text, indented one level deeper than the rule it annotates. The formal symbols (∧, ∨, ¬) render in a slightly brighter grey than the English text around them. When "Show Logic" is toggled on, the annotations fade in over 200ms with a soft *click* — like a precision instrument engaging. When toggled off, they dissolve over 150ms. The toggle itself is a small circuit-symbol icon (⊕) in the sidebar, glowing soft amber when active.

### The Short-Circuit Skip
When a `+ TEST` line is short-circuited (previous flag was false), the trace shows it in 40% opacity with a thin horizontal strikethrough in cool grey. A micro-animation: the line starts at full opacity and dims to 40% over 100ms, with a barely-audible *whisp* — the sound of computation avoided. When multiple lines are skipped in sequence, the *whisps* chain at 50ms intervals, creating a rapid descending flutter — the sound of efficient evaluation.

### The Evaluation Counter
Bottom-right of the Inspector panel. Monospace digits in cool grey. The short-circuit savings number renders in soft green: `47 evaluations (23 short-circuited)`. On hover, a tooltip expands showing per-tick breakdown as a micro-sparkline — tall bars for heavy evaluation ticks, short bars for efficient ones, with short-circuited portions in green overlay. The sparkline has a subtle left-to-right gradient from the battle's start (left) to end (right).

---

## Comparable Games & Media

### Shenzhen I/O (Zachtronics)
Teaches conditional execution through the same +/− prefix system. **Never names the boolean operations.** The manual describes `teq` (test equal) and `+`/`−` prefixes. Players learn AND/OR/NOT composition through optimization pressure (fitting solutions in limited instruction lines). The subreddit r/shenzhenIO has extensive posts mapping solutions to boolean algebra — community-generated educational content that the game itself never provides. Robot Uprising can learn from this: the community WILL build the bridge. The question is whether the game should build it first.

### Nand2Tetris (Educational Course)
A college course that builds a computer from NAND gates upward. The key pedagogical insight: students who physically build AND from two NANDs understand boolean algebra better than those who memorize truth tables. Robot Uprising's prefix composition IS this — players build AND from two `+ TEST` lines. The game could reference this parallel in the educator's guide: "Robot Uprising teaches boolean composition the way Nand2Tetris teaches gate design — through construction, not memorization."

### Human Resource Machine (Tomorrow Corporation)
A visual programming game that teaches assembly-like concepts. Uses a visual metaphor (carrying boxes between conveyors) for registers and instructions. **Names concepts gradually** — early levels use "copy from" and "copy to" without saying "register." Later levels introduce "jump" without saying "branch." The naming is always in terms the game established. Robot Uprising should follow this pattern: "chained test" before "AND," "flipped prefix" before "NOT."

### Portal (Valve)
GLaDOS narrates the player's portal usage in increasingly technical terms as the game progresses. In early chambers, portals are "the thing that makes a hole." By Chamber 18, GLaDOS references "momentum conservation through portals." The vocabulary escalation mirrors the player's skill escalation. Robot Uprising's boot log revelation at Mission 7-8 follows this pattern — the AI's language becomes more technical as the player's mastery deepens.

---

## The TikTok Clip

**Title:** "I Taught My Robot Boolean Algebra by Accident"

**Second 0-3:** Plan screen. Player drags a TEST line above another TEST line. Ghost preview flashes. The evaluation estimate drops from 6 to 3.

**Second 3-8:** Inspector replay. The before config: all 6 TEST lines evaluate every tick, context bar rising to red, unit stunned at Tick 23. Caption: "BEFORE: 6 questions every tick."

**Second 8-13:** Inspector replay. The after config: TEST lines short-circuit, only 2-3 evaluate, context bar stays amber, unit survives. Caption: "AFTER: 2 questions because the first already answered."

**Second 13-15:** The logic annotation overlay fades in. `A ∧ (B ∨ C)` appears under the rules. Text overlay: "It's called boolean algebra. Your robot figured it out."

The clip works because it shows a tangible gameplay improvement (unit survives) tied to a concept with a recognizable name (boolean algebra). The gap between "I just reordered some lines" and "I optimized boolean logic" is the viral moment.

---

## New Aspects Discovered

- **3.05a-ii-a — Evaluation cost model as game mechanic:** If each TEST instruction consumes processing cycles that contribute to context load, test ordering and short-circuit efficiency become survival mechanics. Full design of the evaluation cost model: fixed cost per TEST type, variable cost for aggregate operations, budget per tick, overflow → context pressure increase.
- **3.05a-ii-b — Truth table visualization in Inspector:** An interactive truth table that the player can fill in by clicking cells, with the game auto-checking against their actual prefix config. The "build your own truth table" as a diagnostic exercise.
- **3.05a-ii-c — De Morgan linting as workbench diagnostic:** A static analysis tool that identifies prefix chains using the longer De Morgan form and suggests the shorter equivalent. The "boolean optimizer" as a plan-screen tool, not just an Inspector observation.
- **3.05a-ii-d — Three-valued logic (Kleene) complications with ? prefix:** Full formal specification of how the tri-state `?` interacts with short-circuit semantics, De Morgan's laws (which assume two values), and truth table construction. When does three-valued logic create player-visible differences from binary?
- **3.05a-ii-e — "Evaluation efficiency" as Zachtronics-style histogram metric:** Average evaluations-per-tick as a community-visible optimization metric alongside existing histogram axes. Players whose configs evaluate efficiently cluster left; inefficient configs cluster right. The histogram reveals that boolean composition skill is normally distributed across the player population.
