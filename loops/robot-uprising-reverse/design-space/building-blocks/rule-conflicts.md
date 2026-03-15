# 3.06 — Rule Conflicts: What Happens When Two Rules Contradict?

## Overview

The locked spec says rules are **ordered condition→action pairs**. An agent has a finite list of rules, evaluated top-to-bottom each tick. But what happens when two rules in the list want the agent to do incompatible things? When Rule 2 says "MOVE_TOWARD nearest enemy" and Rule 5 says "MOVE_AWAY from any enemy within 2 tiles" — and both conditions are satisfied simultaneously?

This is not an edge case. This is the **central skill ceiling** of the game. The moment a player has more than three rules on an agent, contradictions become inevitable. How the game handles contradictions determines:

- Whether the game feels **debuggable** or **chaotic**
- Whether rule ordering is a **first-class skill** or a **footgun**
- Whether the Inspector can show a clear **causal chain** or only a murky "something happened"
- Whether beginners feel **empowered** or **confused**
- Whether veterans feel **deep** or **arbitrary**

The locked "ordered condition→action pairs" already implies a priority system (first match wins), but there are six distinct design philosophies for how far that goes, how the game communicates conflicts, and whether conflicts are a bug or a feature.

---

## The Design Spectrum

| Approach | Philosophy | Conflict Resolution | Player Skill | Comparable |
|----------|-----------|-------------------|-------------|------------|
| **A. Strict Priority** | First match wins, period | Top-to-bottom, first satisfied rule fires | Rule ordering IS the game | Gladiabots |
| **B. Priority + Warnings** | First match wins, but the game helps | Top-to-bottom + static analysis warnings | Ordering + diagnostic awareness | IDE linters |
| **C. Weighted Voting** | All matching rules contribute | Weighted sum of matching rule actions | Weight tuning | Utility AI systems |
| **D. Explicit Conflict Markers** | Player must annotate conflicts | "OVERRIDE" / "FALLBACK" / "MUTEX" annotations | Conflict architecture | Production rule systems |
| **E. Emergent Chaos** | Contradictions are the point | Simultaneous contradictory impulses → visible struggle | Reading emergent failure | Dwarf Fortress |
| **F. Progressive Disclosure** | Strict priority early, enriched later | Priority-only M1-4, add warnings M5-7, add weight M8+ | Growing awareness | Recommended hybrid |

---

## Approach A: Strict Priority (First Match Wins)

**Philosophy:** The rule list is a waterfall. Each tick, the agent scans its rules from top to bottom. The first rule whose condition is satisfied by the current buffer state fires. All other rules — including contradicting ones — are simply never reached. There is no conflict, because there's no mechanism for two rules to fire simultaneously.

### Mechanical Specification

```
TICK RESOLUTION FOR UNIT X:
1. Read buffer contents
2. For each rule (index 0 to N):
   a. Evaluate condition against buffer
   b. If condition TRUE → execute action → STOP evaluating
3. If no rule matched → execute DEFAULT action (hold position)
```

No rule ever "knows" another rule exists. Rule 5 might contradict Rule 2, but if Rule 2 matches, Rule 5 never executes. The player's only lever for managing contradictions is **the ordering of the list**.

### What It Looks Like

The workbench panel shows the rule list as a vertical stack of horizontal strips. Each strip has a condition on the left (colored filter pills: yellow diamond for ENEMY_SPOTTED, blue circle for CHANNEL_SIGNAL, red triangle for THREAT) and an action on the right (crosshair icon for ENGAGE, running figure for MOVE_TOWARD, shield for HOLD). Between them, a thin white arrow →.

Drag handles on the left edge of each strip. The player drags rules up and down to reorder. The strip being dragged lifts with a subtle shadow and a faint "maglev" hum. Other strips slide apart to make room, their gap glowing faintly cyan to indicate valid drop targets. When dropped, the strip snaps into place with a soft metallic *click*.

During sealed watch, the agent's behavior is the direct result of which rule fired. In the Inspector, clicking a unit at any tick shows which rule was evaluated, which conditions were checked (dimmed green checkmarks for passed, red X for failed), and which rule won (highlighted with a golden border). Rules below the winner are greyed out with a faint "UNREACHED" label.

### What It Sounds Like

- **Drag a rule:** Soft electromagnetic hum, pitch rises as the rule moves higher in the list
- **Drop a rule:** Metallic *tink*, like a circuit breaker engaging
- **Rule fires during sealed watch:** Subtle *ping* matching the action's color (warm amber for movement, cool blue for signal, sharp red for combat)
- **Inspector rule trace:** Each checked condition plays a soft tick-tick-tick as the evaluation waterfall descends; the winning rule plays its firing *ping*

### Strengths

1. **Maximum simplicity.** One rule fires. No ambiguity. No hidden state. The player can always answer "why did my agent do that?" by reading the list top to bottom.
2. **Ordering IS the game.** The difference between a novice and a veteran is how they order their rules. This is the same skill as writing CSS specificity, configuring firewall rules, or structuring exception handling — genuine transferable engineering knowledge.
3. **Debuggable.** The Inspector can show a perfect causal chain: "Rule 3 fired because conditions 1 and 2 were false and condition 3 was true."
4. **Gladiabots-proven.** Gladiabots uses exactly this model (depth-first traversal, first success stops) and has shipped successfully with an engaged competitive community. Players develop deep intuitions about rule ordering over hundreds of matches.
5. **Deterministic.** Given the same buffer state, the same rule always fires. Essential for replays, async PvP, competitive fairness.

### Weaknesses

1. **Shadow rules.** A poorly-ordered list can have rules that NEVER fire because an earlier rule always matches first. The player may not realize Rule 7 is dead code. In Gladiabots, discovering dead rules is a common source of frustration — players spend 20 minutes debugging why an agent "ignores" a rule, only to realize it's shadowed.
2. **No graceful blending.** An agent can't "mostly engage but sometimes retreat." It's binary — the first matching rule wins absolutely. This makes smooth behavioral transitions impossible without intricate condition design.
3. **Ordering sensitivity.** Moving one rule from position 3 to position 4 can completely transform agent behavior. This is powerful for veterans but terrifying for beginners who don't understand WHY order matters.
4. **The fallthrough problem.** If the player wants "engage enemies UNLESS outnumbered" they must explicitly encode the outnumbered check ABOVE the engage rule. The natural English reading ("engage, but not if outnumbered") maps poorly to the mechanical reality ("check outnumbered first, then engage").

### Interaction Effects

- **With rules language (3.05):** Strict priority works best with the Priority Queue (B) and Dispatch Table (A) approaches. It's awkward with the Sentence Builder (D) because natural language implies simultaneous interpretation, not waterfall evaluation.
- **With Inspector (locked):** Perfect fit. The Inspector can render the evaluation waterfall as a visual cascade — green checkmarks descending until one rule highlights gold.
- **With sealed watch (locked):** No visible conflict. The agent simply acts. Behavior looks decisive, never confused.
- **With command agents (locked):** Strict priority scales cleanly to meta-level command agents. A command agent's rules for when to reassign subordinate skills follow the same waterfall logic.
- **With buffer model (locked):** Buffer state determines which conditions are true. Buffer eviction changes which conditions match. Eviction priorities interact with rule ordering — the player must think about both stacks simultaneously.

---

## Approach B: Priority + Warnings (Static Analysis)

**Philosophy:** First match wins (same as A), BUT the game provides static analysis warnings in the Plan screen before execution. The workbench acts like an IDE with a linter — flagging potential conflicts, dead rules, and ordering issues.

### Mechanical Specification

Same resolution as Approach A. Additionally, during the Plan phase, the game runs a static analyzer over the rule list:

```
STATIC ANALYSIS WARNINGS:
1. SHADOW WARNING: "Rule 7 can never fire — Rule 2 matches all cases Rule 7 would match"
2. CONFLICT WARNING: "Rules 3 and 5 produce opposite actions (MOVE_TOWARD vs. MOVE_AWAY)
   for overlapping conditions. Rule 3 wins due to priority. Is this intentional?"
3. UNREACHABLE WARNING: "Rule 9 requires CHANNEL_SILENT, but this unit has no listen
   channels configured. Rule will never fire."
4. REDUNDANCY WARNING: "Rules 4 and 6 produce the same action for overlapping conditions.
   Rule 6 is redundant."
5. GAP WARNING: "No rule matches the condition [buffer empty + no enemies visible].
   Agent will use DEFAULT action (hold position)."
```

### What It Looks Like

The workbench rule panel has a narrow gutter on the left edge of each rule strip. Normally blank. When the analyzer detects an issue:

- **Shadow warning:** The shadowed rule's strip dims to 40% opacity. A yellow triangle ⚠ appears in the gutter. Hovering the triangle shows a tooltip: "This rule is shadowed by Rule 2 — it can never fire with any buffer state." A dashed yellow line connects the shadowed rule to its shadow source, pulsing gently.

- **Conflict warning:** Both conflicting rules get amber gutter markers. A dotted amber line connects them, with a small ⚡ icon at the midpoint. Hovering shows: "These rules produce opposite actions for similar conditions. Rule 3 wins due to position. Drag to reorder if this isn't intentional." The ghost unit preview on the board shows BOTH potential movement paths — the winning path as a solid arrow, the losing path as a dashed ghost arrow.

- **Gap warning:** A blank gap appears below the last rule strip, outlined in a pulsing grey dashed border. Inside, faint text: "+ no rule covers [empty buffer, no enemies]. Agent will hold position." Clicking the gap auto-generates a candidate rule for that scenario.

- **Unreachable warning:** The unreachable rule's strip gets a grey strikethrough effect. Gutter shows a ∅ icon. Tooltip: "This rule references channel 'alpha', but this unit doesn't listen to any channels. Configure context to add a listen channel, or remove this rule."

### What It Sounds Like

- **Warning appears (Plan phase):** A soft two-note descending chime (high→mid), like a gentle notification — NOT an error sound. More "hey, look at this" than "you broke something."
- **Hovering a warning:** Quiet sustained tone, the conflicting rules' strips vibrate gently (2px oscillation at 15Hz).
- **Dismissing a warning (click ✓):** Clean single-note resolution chime. The warning marker fades with a satisfied soft exhale sound.
- **Multiple warnings resolving in sequence:** Each resolution chime is pitched slightly higher than the last, creating an ascending melody. Clearing all warnings produces a brief triumphant three-note arpeggio.

### Strengths

1. **Best of both worlds.** Retains strict priority's simplicity and debuggability while preventing the #1 frustration source (invisible dead rules).
2. **Teaching tool.** Warnings educate new players about why rule ordering matters. The warning text is itself a tutorial: "Rule 3 wins due to position."
3. **Non-invasive.** Warnings don't prevent execution. The player can dismiss them and proceed. No gatekeeping.
4. **IDE familiarity.** Players who code will instantly recognize the linter pattern. Players who don't will learn it — transferable skill.
5. **Progressive engagement.** Beginners ignore warnings. Intermediates read them. Experts never trigger them.

### Weaknesses

1. **False confidence.** Zero warnings ≠ correct behavior. The analyzer can catch structural issues but not strategic mistakes. A player might clear all warnings and still have a terrible rule set.
2. **Warning fatigue.** If the analyzer is too aggressive, players learn to ignore ALL warnings. The "boy who cried wolf" problem. Calibration is critical.
3. **Analysis cost.** Complex rule sets with many conditions are expensive to statically analyze for all possible buffer states. Must be bounded to keep the Plan phase responsive.
4. **"Fix the warning" trap.** Players might reorder rules to silence warnings rather than to express strategic intent. The tool shapes the strategy instead of serving it.

### Interaction Effects

- **With onboarding (5.01–5.03):** Warnings can be gated by campaign progress. Mission 1-3: no warnings (let players discover conflicts naturally). Mission 4: introduce shadow warnings. Mission 5+: full analyzer.
- **With sealed watch (locked):** Warnings create anticipation. "The linter said Rules 3 and 5 conflict — let's see what happens." This enriches the sealed watch emotional experience.
- **With Inspector (locked):** The Inspector can reference Plan-phase warnings. "This moment was flagged as a conflict during planning. Rule 3 won."

---

## Approach C: Weighted Voting

**Philosophy:** Abandon the waterfall. ALL rules whose conditions are satisfied contribute to the agent's decision. Each rule has a weight (set by the player or derived from position). The winning action is the one with the highest total weight from matching rules.

### Mechanical Specification

```
TICK RESOLUTION FOR UNIT X:
1. Read buffer contents
2. For EACH rule (index 0 to N):
   a. Evaluate condition against buffer
   b. If condition TRUE → add (action, weight) to candidate pool
3. Group candidates by action type
4. Sum weights per action group
5. Execute action with highest total weight
6. Ties broken by rule index (lower index wins)
```

Weights can be:
- **Implicit (position-derived):** Rule at position 0 has weight N, position 1 has weight N-1, etc. This is strict priority with extra steps but opens the door for "strong prefer" vs. "weak prefer" via position.
- **Explicit (player-set):** Each rule has a weight slider (1-10 or 1-5). The player directly controls how much each matching rule contributes.
- **Dynamic (buffer-derived):** Weight scales with the strength of the match. "3 enemies in buffer" gives more weight to the retreat rule than "1 enemy in buffer."

### What It Looks Like

Each rule strip in the workbench now has a weight indicator on the right edge — a small vertical bar chart showing the weight value. Explicit weights render as a draggable pip on a 1-5 track (five small dots, filled dots = current weight, hollow = remaining capacity). The pips glow faintly with the rule's action color.

Below the rule list, a **Decision Preview** panel shows a horizontal stacked bar for each possible action. The bar lengths represent total weight assuming all conditions are satisfied simultaneously. The player can see at a glance: "If everything fires at once, ENGAGE has 12 weight and RETREAT has 8 — so the agent fights." This preview updates live as weights are adjusted.

During sealed watch, weighted voting manifests as subtle visual hesitation. When two strong candidates are close in weight, the agent's icon briefly flickers between the two movement directions (50ms flicker, barely perceptible) before committing. This is the game's way of saying "this was a close call."

In the Inspector, the weight breakdown is shown as a horizontal stacked bar at the selected tick. Each matching rule contributes a colored segment. The winning action's total bar is highlighted with a gold border. Near-miss actions (within 20% of the winner's weight) get a dotted amber border.

### What It Sounds Like

- **Adjusting a weight pip:** Soft click for each pip position, pitch rises with weight value (C4 for weight 1, E4 for 2, G4 for 3, B4 for 4, C5 for 5)
- **Decision preview changing:** A brief chord plays the "current winner" action's theme note whenever the dominant action changes
- **Close-call flicker during sealed watch:** A rapid two-note trill (the two competing action notes alternating at 8Hz) lasting 100ms before the winner's note sustains
- **Inspector weight breakdown:** Each rule segment of the bar emits its action note in sequence as the mouse sweeps across, creating a miniature chord that reveals the decision's composition

### Strengths

1. **Nuanced behavior.** An agent can have a "mostly engage but retreat if REALLY outnumbered" posture without complex condition logic. Just weight the engage rule at 4 and the retreat rule at 3, then add a "retreat when buffer shows 3+ enemies" at weight 5.
2. **No dead rules.** Every rule with a matching condition contributes. No shadowing, no unreachable code.
3. **Emergent behavioral gradients.** As battlefield conditions change the set of matching rules, the agent's behavior shifts smoothly rather than flipping discretely. A scout with balanced engagement/retreat weights becomes cautious when partially engaged — visible as the slight flicker.
4. **Tuning feel.** Adjusting weights feels like turning dials on a mixing board. Tangible, immediate, spatial — good workbench feel.

### Weaknesses

1. **Debugging nightmare.** "Why did my agent retreat?" becomes "Because Rules 2, 5, and 7 matched with weights 3, 4, and 2, giving RETREAT a total of 9 vs. ENGAGE's 7 from Rules 1 and 3 with weights 4 and 3." The causal chain is now a multi-factor equation, not a simple waterfall.
2. **Counter-intuitive behavior.** Adding a NEW rule can change the behavior of EXISTING rules by shifting the weight balance. This violates the principle of local reasoning — changes have non-local effects.
3. **Opaque to spectators.** A viewer watching the sealed watch can't understand why an agent acted without seeing the weight breakdown. This hurts streaming appeal and competitive readability.
4. **Weight meta-game.** Optimal play involves calculating weight distributions, not designing agent behaviors. The game becomes about math, not architecture.
5. **Breaks the locked spec.** The locked spec says "ordered condition→action pairs." Weighted voting de-emphasizes ordering in favor of weights. This may contradict the spec's intent.

### Interaction Effects

- **With rules language (3.05):** Works best with the Dispatch Table (A) where conditions are simple signal types. Becomes overwhelming with the Sentence Builder (D) where conditions are already complex.
- **With sealed watch (locked):** The hesitation flicker adds visual personality but may confuse beginners who think the agent is malfunctioning.
- **With Inspector (locked):** Requires a richer Inspector to show weight breakdowns. Adds complexity to an already data-dense screen.
- **With EM emissions (locked):** Weight computation itself could be a source of EM emission — an agent "deliberating" loudly. Thematically coherent (indecisive agents are noisy), mechanically interesting (quick decisive agents are stealthier).

---

## Approach D: Explicit Conflict Markers

**Philosophy:** The player must explicitly annotate how rules interact. When two rules could conflict, the player places a marker between them declaring the relationship: OVERRIDE (first always wins), FALLBACK (second only fires if first can't), MUTEX (only one may be active per tick), or BLEND (average the actions).

### Mechanical Specification

Rules are still ordered, but between any two rules the player can insert a **conflict annotation**:

```
Rule 1: IF enemy_spotted → ENGAGE
  [OVERRIDE Rule 3]          ← explicit annotation
Rule 2: IF ally_requesting → MOVE_TOWARD
  [MUTEX Rule 4]             ← only one of Rules 2 and 4 fires per tick
Rule 3: IF threat_level_high → RETREAT
  [FALLBACK from Rule 1]     ← only fires if Rule 1's condition is FALSE
Rule 4: IF buffer_full → COMPRESS
  [MUTEX Rule 2]
```

Without annotations, rules behave as strict priority (Approach A). Annotations are optional enrichments.

### What It Looks Like

Between each pair of rule strips in the workbench, a thin interaction zone appears when the player hovers between strips. Clicking opens a small radial menu with four annotation icons:

- **OVERRIDE** (↓ downward arrow): Gold. "This rule always beats that rule."
- **FALLBACK** (↑ upward arrow): Silver. "This rule only fires if that rule can't."
- **MUTEX** (⊕ circle-cross): Red. "Only one of these fires per tick."
- **BLEND** (≈ wavy lines): Blue. "Average these actions if both match."

Selected annotations render as small labeled connectors between the rule strips — colored lines with their icon at the midpoint. A complex agent might have a web of colored connections between its rules, visible at a glance as the agent's "conflict architecture."

### What It Sounds Like

- **Opening the annotation radial:** Quiet mechanical fan-out, like a camera aperture opening
- **Selecting OVERRIDE:** Decisive downward *thunk*, like a gavel
- **Selecting FALLBACK:** Soft upward chime, expectant, "waiting in the wings"
- **Selecting MUTEX:** Sharp click-click of a toggle switch, with a faint exclusion zone hum
- **Selecting BLEND:** Smooth merging tone, two notes gliding into a chord

### Strengths

1. **Maximum expressiveness.** The player can describe exactly how rules interact. No guessing, no emergent surprises.
2. **Self-documenting.** The annotation web IS the agent's behavioral architecture. A glance at the connectors tells you how the agent thinks.
3. **Transferable skill.** This maps directly to real-world systems: firewall rule priority, CSS specificity, exception handling hierarchies, production rule system conflict resolution strategies.
4. **Scales to complexity.** As agents get more rules (especially Command agents with 14-slot buffers and 6 hooks), explicit annotations prevent the combinatorial explosion of implicit priority from becoming unmanageable.

### Weaknesses

1. **Complexity cliff.** Beginners don't know what MUTEX means. The concept of explicitly managing rule interactions requires a sophistication level that may exceed the game's onboarding capacity.
2. **Annotation combinatorics.** With N rules, there are N×(N-1)/2 potential annotations. Even 6 rules = 15 potential annotations. This is a second configuration layer on top of the rules themselves.
3. **Over-specification.** Players might spend more time annotating rule relationships than designing the rules. The annotation meta-game overshadows the behavior design game.
4. **Breaks flow.** Having to pause and think "wait, does Rule 3 OVERRIDE or MUTEX with Rule 6?" interrupts the creative flow of building an agent.

### Interaction Effects

- **With building blocks (3.01–3.04):** Annotations add a fifth primitive type to the game (Skills, Rules, Hooks, Context Config, *Conflict Annotations*). This may overload the vocabulary.
- **With onboarding:** Annotations are a Mission 6+ concept at earliest. The first 5 missions must work without them.
- **With Inspector:** Annotations create richer Inspector data — the player can see not just which rule fired but which annotations constrained the evaluation.

---

## Approach E: Emergent Chaos

**Philosophy:** Contradictions are not a bug. They're the point. When two rules conflict, the agent *visibly struggles*. It doesn't cleanly resolve — it jitters, oscillates, or freezes. The player's job is to design agents that DON'T conflict, and the punishment for contradiction is visceral behavioral breakdown.

### Mechanical Specification

```
TICK RESOLUTION FOR UNIT X:
1. Read buffer contents
2. Collect ALL rules whose conditions are satisfied
3. If exactly 1 rule matches → execute normally
4. If multiple rules match:
   a. If actions are COMPATIBLE (same direction, complementary) → execute dominant
   b. If actions are INCOMPATIBLE (opposite directions, contradictory):
      - Agent enters CONFLICTED state
      - Agent does NEITHER action
      - Agent burns 1 buffer slot to "confusion" (wastes capacity)
      - Visual: agent icon jitters (±1px at 30Hz)
      - Agent's EM emission spikes (louder signal, detectable by enemies)
5. CONFLICTED state clears next tick if no contradiction exists
```

### What It Looks Like

A conflicted agent is unmistakable on the battlefield. Its icon vibrates rapidly — not a smooth animation but a harsh, mechanical jitter, like a motor trying to spin two directions. The agent's tile border flashes alternating colors matching the two conflicting actions (amber for MOVE_TOWARD, cyan for RETREAT). A tiny static-noise overlay appears on the agent's tile, like a TV between channels.

Buffer bars at the bottom of the unit tile show the "confusion" slot as a flickering white-and-black checkerboard pip — visual noise taking up real buffer space.

In the Inspector, conflicted ticks are marked with a prominent red ⚡ icon on the timeline. Clicking shows both matching rules side by side with a "CONFLICT" banner between them, both highlighted in angry red. The burnt buffer slot is visible in the buffer state panel as a corrupted entry.

### What It Sounds Like

- **Agent entering conflict:** A harsh electronic *bzzt-bzzt-bzzt*, like a servo fighting itself. Short, sharp, impossible to ignore.
- **Sustained conflict (multiple ticks):** The buzzing becomes a grinding whine, increasing in pitch. After 3 ticks of continuous conflict, a bass *thud* as the confusion slot consumes buffer space — the sound of wasted capacity.
- **Conflict resolving:** A clean *snap* as the jitter stops and the agent commits to a direction. Silence. Then the normal ambient hum resumes.
- **Enemy detecting a conflicted agent's EM spike:** A predatory *ping* from the enemy's direction, like sonar finding a target.

### Strengths

1. **Visceral feedback.** Conflict isn't an abstract warning in a menu — it's a visible, audible battlefield event. The player FEELS the mistake.
2. **Natural punishment.** Conflict doesn't just produce wrong behavior — it produces NO behavior AND wastes buffer space AND attracts enemies. Triple punishment creates strong incentive to design conflict-free agents.
3. **Teaching through pain.** The first time a player's scout jitters and gets killed because its EM spike attracted a striker, they understand rule ordering forever. Memorable failure is the best teacher.
4. **Spectator value.** A conflicted agent is dramatic. The stream clip writes itself: "OH NO, my relay is having a BREAKDOWN" as the little icon jitters and enemies close in.
5. **Thematic resonance.** An AI that receives contradictory instructions and FREEZES is deeply realistic. This is what happens to real autonomous systems with conflicting objectives. The game teaches a genuine engineering lesson.

### Weaknesses

1. **Unforgiving.** One rule ordering mistake → agent paralysis → cascading failure (dead agent → lost intel → other agents blind → cascade). This is potentially too punishing for the tutorial missions.
2. **Discourages experimentation.** If conflict is this painful, players become conservative — they use fewer rules, keep things simple, avoid risk. This undermines the "emergent combo discovery" goal.
3. **Snowball effects.** A conflicted agent wastes buffer slots, which means less information, which means worse decisions, which means more conflicts. Negative spiral.
4. **Ambiguous cause.** During sealed watch, the player sees an agent jitter but doesn't know WHY until the Inspector phase. The emotional beat is "something went wrong" without the satisfaction of understanding in the moment.

### Interaction Effects

- **With buffer model (locked):** The "confusion" slot mechanic directly consumes buffer capacity, creating a tangible cost. This interacts with eviction priorities — can the player set "evict confusion first" to auto-recover?
- **With EM emissions (locked):** Conflict = louder emissions. This creates a stealth tax on poor rule design. Well-designed agents are quieter, stealthier, more survivable. Beautiful mechanical symmetry.
- **With onboarding:** Must be introduced carefully. Mission 1-2 should have pre-configured agents that DON'T conflict. Mission 3 should introduce a single, deliberate conflict as a teaching moment.
- **With command agents:** A conflicted command agent is catastrophic — its subordinates receive no orders. High risk, high drama. Perfect for Mission 8-10 stakes.

---

## Approach F: Progressive Disclosure (Recommended Hybrid)

**Philosophy:** Start with strict priority (Approach A) in early missions. Layer in warnings (Approach B) as the player graduates. Introduce conflict consequences (elements of Approach E) in the mid-campaign. Never reach the full complexity of C or D. The conflict resolution system GROWS with the player.

### Mechanical Specification

| Campaign Phase | Conflict Resolution | New Elements |
|---------------|-------------------|--------------|
| **Missions 1-2** | Strict priority (A). No warnings, no conflict feedback. 2-3 rules max. | Rules are pre-configured. Player only reorders. |
| **Mission 3** | Strict priority (A). First editable rules. Player creates their first ordering mistake. | Inspector shows the evaluation waterfall for the first time — "Rule 2 fired, Rules 3-4 unreached." |
| **Mission 4** | Priority + shadow warning (B). First "⚠ This rule can never fire" warning appears. | Boot log introduces concept: "DIAGNOSTIC: Evaluating rule coverage. Unreachable rule detected." |
| **Mission 5** | Priority + conflict warning (B). Factory intro. Player has enough rules for real contradictions. | Ghost preview shows conflicting movement paths (solid + dashed arrows). |
| **Missions 6-7** | Priority + full analyzer (B). Command agents add meta-level rule conflicts. | Gap warnings. Redundancy warnings. "No rule covers this scenario" nudges. |
| **Missions 8-10** | Priority + analyzer + mild consequences (B+E hybrid). Unresolved analyzer warnings → agents jitter on FIRST TICK only (self-corrects). | EM spike on conflict tick. "Your agent hesitated" debrief annotation. Enemies exploit hesitation in Mission 10. |

### What It Looks Like

**Missions 1-2:** Clean rule strips, no gutter, no warnings. Drag to reorder. Inspector shows simple "Rule N fired" highlight.

**Mission 3:** First time the Inspector shows the full evaluation waterfall. Player clicks their relay unit, sees: Rule 1 (green ✓, fired) → Rule 2 (grey, unreached) → Rule 3 (grey, unreached). A subtle "aha" moment: "Oh, only one rule fires per tick."

**Mission 4:** The first warning triangle appears. A single yellow ⚠ in the gutter of Rule 4. Hovering shows: "This rule is shadowed by Rule 1. Drag Rule 4 above Rule 1 to activate it." The boot log says: "CONTEXT: Rule evaluation is top-to-bottom priority. Unreachable rules detected. Consider reordering." The player learns that order = meaning.

**Mission 5:** The player is designing their first factory blueprints. A scout blueprint has 5 rules. Rules 2 and 4 produce opposing movement actions for overlapping conditions. The ghost preview on the board shows TWO arrows from the scout's position — a solid green arrow (Rule 2's MOVE_TOWARD) and a dashed amber arrow (Rule 4's RETREAT). A conflict marker ⚡ appears between the rules in the workbench. Hovering: "These rules suggest opposite actions. Rule 2 wins due to position. Is this intentional? ✓ Dismiss / ↕ Reorder."

**Mission 8:** The player's command agent has 8 rules. Two unresolved conflict warnings. During sealed watch, the command agent's icon stutters for one tick — a brief 200ms jitter — before committing. In the debrief, a new annotation appears: "AGENT HESITATED (tick 14). Conflicting rules detected. 1 tick lost." The EM spike is visible in the emission overlay. The enemy scout detected the spike and altered course. A chain of consequences from one moment of indecision.

**Mission 10 (climax):** The enemy's factory produces agents that specifically target hesitating units. Unresolved conflicts aren't just wasteful — they're deadly. The player must achieve conflict-free architectures to survive. The final mission's difficulty is calibrated to assume the player has mastered rule ordering.

### What It Sounds Like

- **Missions 1-3:** Silent conflict system. Just the standard drag-reorder sounds.
- **Mission 4 (first warning):** The two-note descending chime (gentle, curious, not alarming). Boot log text-print includes: "DIAGNOSTIC... rule coverage analysis... ⚠ unreachable rule detected" with the characteristic boot log typing cadence.
- **Mission 5 (conflict warning):** A slightly sharper two-note chime with a brief overtone — "hey, this one's important." The ghost preview arrows appear with a faint directional hum that makes the spatial conflict audible (left ear = Rule 2's direction, right ear = Rule 4's direction, stereo mismatch).
- **Mission 8 (first hesitation):** The jitter sound is deliberately designed to be startling on first encounter — a harsh *bzzt* that breaks the sealed watch's ambient soundscape. The player's gut reaction is "what was THAT?" The debrief annotation is read aloud by the boot log voice: "Agent hesitated. Conflicting rules. One tick lost." Calm, clinical, devastating.
- **Mission 10:** Hesitation sounds are now familiar. The tension is in trying to PREVENT them. Silence (no jitter) during sealed watch = triumph.

---

## Player Journeys

### Journey: Sofia, 15, High School Student (First Strategy Game)

**Context:** Mission 4. She's completed Missions 1-3 with pre-configured agents. This is her first time editing rules. She has a scout with 3 rules and needs to add a 4th.

**Minute 0:00 — The Workbench**
Sofia sees her scout's rule panel. Three horizontal strips:
1. IF enemy_spotted → REPORT (channel: alpha)
2. IF threat_detected → EVADE
3. IF idle → PATROL

She needs to add "IF ally_requesting → MOVE_TOWARD ally." She taps the + button below Rule 3. A new blank strip appears. She selects condition: "ally_requesting" and action: "MOVE_TOWARD." The new rule slots in at position 4.

**Minute 0:30 — The Warning**
A yellow ⚠ appears next to her new Rule 4. She doesn't notice it at first — she's looking at the board preview, seeing the ghost scout's patrol path. Then the boot log types: "DIAGNOSTIC: Rule coverage analysis complete. ⚠ 1 unreachable rule detected." She looks back at the workbench. The ⚠ is pulsing gently.

**Minute 0:45 — Understanding**
She hovers over the ⚠. A tooltip appears: "This rule may rarely fire. Rule 3 (IF idle → PATROL) matches whenever no enemies or threats are present, which is also when allies are most likely to request help. Consider placing this rule ABOVE Rule 3."

She stares at this for five seconds. Then: "OH. It goes from the TOP." She grabs Rule 4 and drags it above Rule 3. The ⚠ disappears with a clean chime. The ghost preview updates — the patrol path now includes detours toward a simulated ally position.

**Minute 1:15 — The Aha**
She drags the rule up further, above Rule 2 (EVADE). The ⚠ appears on Rule 2 this time. She hovers: "Rule 2 (EVADE) may rarely fire — ally requests are checked first, even when threats are present." She drags it back below Rule 2. The ⚠ clears. She understands: evade is more important than helping allies. Priority IS strategy.

**Minute 2:00 — Execute**
She hits EXECUTE. During sealed watch, her scout spots an enemy, reports on channel alpha, then later receives an ally request and moves toward them — exactly as her rule ordering dictates. In the Inspector, she clicks the scout at tick 7 and sees the evaluation waterfall: Rule 1 ✓ (fired: REPORT), Rule 2 ✗ (no threat), Rule 3 ✗ (not idle, just reported), Rule 4 — (unreached). She now reads rule evaluation like reading a checklist.

**UI Annotations:**
- Warning triangle: 12px yellow ⚠ in left gutter, 2s pulse cycle (opacity 0.6↔1.0)
- Tooltip: 200px wide, appears 300ms after hover, dark background, white text, action suggestion in bold
- Drag feedback: lifted strip gains 4px drop shadow, other strips animate apart over 150ms
- Inspector waterfall: vertical column of rule strips with ✓/✗/— markers, gold highlight on winner

---

### Journey: Marcus, 42, Site Reliability Engineer

**Context:** Mission 8. He's a seasoned player with complex agent architectures. His command agent has 8 rules managing 4 subordinates. He's been ignoring analyzer warnings because "I know what I'm doing."

**Minute 0:00 — The Complex Config**
Marcus's command agent rule panel is dense:
1. IF scout_reports_enemy AND count > 2 → REASSIGN striker to ENGAGE
2. IF relay_buffer_full → REROUTE signals to backup relay
3. IF scout_reports_enemy AND count ≤ 2 → PRIORITIZE scout_evade
4. IF no_reports_3_ticks → REASSIGN scout to PATROL (wider radius)
5. IF striker_idle → REROUTE striker to scout's last_position
6. IF enemy_approaching_base → REASSIGN ALL to DEFEND
7. IF resource_low → PRIORITIZE production_pause
8. IF all_clear → REASSIGN to standard_patrol

Two ⚡ conflict markers: between Rules 1 and 3 (overlapping scout_reports_enemy conditions), and between Rules 5 and 6 (striker can't both go to scout position AND defend base). He dismisses both with "yeah yeah, priority handles it."

**Minute 1:00 — The Sealed Watch**
Tick 14. His command agent's icon — a 🤖 with a golden ring indicating command status — stutters. A brief *bzzt*. Marcus's eyes snap to the command agent. "What was that?" The icon stabilizes. The battle continues, but at tick 16, two strikers move toward the scout's last position instead of defending the base. An enemy scout detects the EM spike from tick 14 and sends a signal. By tick 22, an enemy striker breaches his perimeter.

**Minute 2:30 — The Debrief**
Inspector view. Marcus scrubs to tick 14. Clicks the command agent. The evaluation panel shows:

```
Rule 5: IF striker_idle → REROUTE to scout_last_position    ✓ MATCHED
Rule 6: IF enemy_approaching_base → REASSIGN ALL to DEFEND  ✓ MATCHED
⚡ CONFLICT: Rules 5 and 6 both matched. Rule 5 won (position priority).
CONSEQUENCE: 1-tick hesitation. EM spike +40%. Enemy scout detected spike.
```

A new annotation on the timeline: "HESITATION — tick 14. Cascade: EM detection → enemy reroute → base breach tick 22." The annotation draws a red dotted line from tick 14's jitter to tick 22's breach.

**Minute 3:00 — The Fix**
Marcus returns to the Plan screen. He drags Rule 6 (DEFEND) above Rule 5 (REROUTE). The conflict marker disappears. He also drags Rule 6 above Rule 1 — base defense should override offensive operations. He hovers over the ghost preview: the command agent's decision flowchart updates, showing DEFEND as the top priority.

He re-executes. This time: no jitter at tick 14. The command agent smoothly reassigns to DEFEND when the enemy approaches. His strikers hold position. The enemy scout finds no EM spike. The battle unfolds cleanly.

**Minute 4:00 — The Lesson**
Marcus mutters to himself: "It's like incident response runbooks. The most critical response goes at the top, not the most common one." He begins reorganizing ALL his command agents with the principle: emergency rules first, routine rules last. This is the same lesson he teaches junior SREs about alert priority.

**UI Annotations:**
- Hesitation jitter: 200ms, ±2px, 30Hz vibration on unit tile
- EM spike visualization: expanding concentric circles from the conflicted unit, amber, fading over 3 ticks
- Inspector cascade line: red dotted line connecting tick 14 to tick 22, arcing above the timeline, labeled "8-tick cascade"
- Conflict banner: red "⚡ CONFLICT" between two rule strips, both highlighted in red tint

---

### Journey: Dayo, 17, Aspiring Game Designer

**Context:** Mission 6. First time using Command agents. He's deliberately trying to make his agents behave "creatively" by adding contradictory rules to see what happens.

**Minute 0:00 — The Experiment**
Dayo has read the boot log's diagnostic about rule priority. He understands the system. Now he wants to BREAK it — to see what the game does with contradictions. He gives his striker two rules:
1. IF enemy_spotted → ENGAGE
2. IF enemy_spotted → EVADE

Same condition, opposite actions. He grins. "Let's see what happens."

**Minute 0:15 — The Warning**
An ⚡ conflict marker appears immediately. The tooltip says: "Rules 1 and 2 have identical conditions but opposite actions. Rule 1 (ENGAGE) will always win. Rule 2 (EVADE) will never fire." A shadow warning also appears on Rule 2. The ghost preview shows only the ENGAGE arrow — no ambiguity.

Dayo dismisses both warnings. He wants to see the sealed watch behavior.

**Minute 0:30 — The Execute**
Sealed watch. The striker spots an enemy and charges straight in. No hesitation. No jitter. Rule 1 fires; Rule 2 is dead code. The striker engages, eliminates the target, advances. Clean behavior.

Dayo is slightly disappointed. "It just... picked the first one?" He checks the Inspector. The evaluation waterfall confirms: Rule 1 ✓ (fired: ENGAGE), Rule 2 — (unreached). The system is boringly correct.

**Minute 1:00 — The Real Experiment**
He gets an idea. What if the conditions are ALMOST the same but not identical?
1. IF enemy_spotted AND distance ≤ 3 → ENGAGE
2. IF enemy_spotted AND distance > 2 → EVADE

The conditions overlap at distance = 3. The conflict marker appears with a more nuanced tooltip: "Rules 1 and 2 overlap when enemy distance = 3. At distance 3, Rule 1 (ENGAGE) wins due to position. At distance > 3, Rule 2 (EVADE) fires. At distance ≤ 2, only Rule 1 matches."

The ghost preview shows a fascinating spatial pattern: an engagement ring at distance ≤ 3 and an evasion zone at distance > 3, with a highlighted "contested zone" at exactly distance 3 where the behavior flips depending on rule order.

**Minute 1:30 — The Discovery**
He swaps the rules:
1. IF enemy_spotted AND distance > 2 → EVADE
2. IF enemy_spotted AND distance ≤ 3 → ENGAGE

Now the contested zone flips: at distance 3, the agent EVADES instead of engaging. The ghost preview updates — the engagement ring shrinks by one tile. One drag, completely different behavior at one specific distance. The game is teaching him about boundary conditions, about the exact tile where priority matters.

**Minute 2:00 — The Design Insight**
He adds a THIRD rule:
1. IF enemy_spotted AND distance > 2 → EVADE
2. IF enemy_spotted AND distance = 3 → REPORT (channel: bravo)
3. IF enemy_spotted AND distance ≤ 2 → ENGAGE

Now: evade from afar, report at medium range, engage up close. The ghost preview shows three concentric zones: cyan evasion ring, amber report ring (one tile wide), red engagement circle. The scout has behavior that varies by range — not because the game has a "range-based behavior" feature, but because of how rule ordering and conditions interact.

Dayo screenshots the three-zone preview. Posts it to Discord: "I made a kite pattern with just three rules 🤯." This is the TikTok clip.

**UI Annotations:**
- Overlapping condition visualization: ghost preview shows concentric colored zones on the board, one per rule's effective range
- Contested zone highlight: dashed border on the tiles where rule ordering determines behavior, slight glow pulse
- Ghost arrows: solid arrow for winning action at each position, dashed for losing action
- Screenshot mode: Ctrl+Shift+S captures the ghost preview with annotations as a clean PNG

---

## Comparable Games

### Gladiabots — The Strict Priority Benchmark

Gladiabots uses a depth-first graph traversal where the first successful action node terminates evaluation. This is Approach A in tree form rather than list form. The community has developed deep intuitions about node ordering — "always put shield-check before attack-check" is common wisdom. The main complaint is debugging shadowed nodes: "I spent an hour wondering why my bot never retreated, turns out the 'engage nearest' branch was catching everything first."

Key lesson: strict priority works, but dead-code detection would have saved thousands of player-hours of frustration.

### Baba Is You — Conflict as Core Mechanic

Baba Is You embraces rule conflicts as the central puzzle mechanic. "WALL IS STOP" and "WALL IS PUSH" coexist — PUSH overrides STOP. "BABA IS BABA" shields against transformation rules. "X IS NOT X" destroys the object. These are explicit priority hierarchies baked into the rule types themselves.

Key lesson: when conflict resolution has clear, learnable rules, conflicts become a source of puzzle depth rather than confusion. The player learns "PUSH beats STOP" and then uses that knowledge strategically.

### Production Rule Systems (OPS5, Drools) — The Academic Foundation

Real production rule systems use sophisticated conflict resolution strategies: specificity (most conditions wins), recency (most recent data wins), refraction (don't re-fire on same data), salience (explicit priority numbers). The Rete algorithm efficiently maintains the conflict set as facts change.

Key lesson: even formal AI systems need conflict resolution. The choice of strategy dramatically shapes system behavior. Robot Uprising's "ordered list = priority" is the simplest possible conflict resolution — equivalent to OPS5's "order" strategy. This is appropriate for a game.

### CSS Specificity — The Web Analogy

CSS resolves conflicting style rules through a specificity hierarchy: inline > ID > class > element. More specific selectors win. Equal specificity: last rule wins. `!important` overrides everything. This system is simultaneously powerful and widely hated.

Key lesson: the "importance override" mechanism (`!important` in CSS, Approach D's OVERRIDE annotation) solves individual conflicts but creates global chaos when overused. Better to have a clean ordering system than escape hatches.

### Dwarf Fortress — Emergent Behavioral Breakdown

Dwarf Fortress dwarves have competing needs (hunger, thirst, work, social) that can conflict. A dwarf trying to eat AND work simultaneously might oscillate between the kitchen and the workshop, accomplishing neither. This "tantrum spiral" where conflicting priorities cascade into breakdown is both the game's signature charm and its primary accessibility barrier.

Key lesson: emergent conflict is entertaining but must be bounded. Dwarf Fortress's tantrums are funny because they're one of many systems. In Robot Uprising, where rule design IS the game, unbounded emergent conflict would be more frustrating than charming.

---

## Interaction Effects Across All Approaches

| System | A: Strict | B: Priority+Warn | C: Weighted | D: Markers | E: Chaos | F: Progressive |
|--------|-----------|-------------------|-------------|------------|----------|----------------|
| **Rules Language (3.05)** | Perfect fit for Priority Queue | Best fit — warnings reference specific conditions | Needs simple conditions | Adds vocabulary overhead | Works with any | Grows with grammar |
| **Inspector (locked)** | Clean waterfall | Waterfall + warning references | Weight breakdown needed | Annotation graph view | Conflict timeline | Waterfall → enriched |
| **Sealed Watch (locked)** | Decisive behavior | Same as A | Hesitation flicker | Same as A | Visible jitter | Clean → rare jitter |
| **Command Agents (locked)** | Scales cleanly | Essential at 8+ rules | Weight tuning nightmare | Annotation overload | Cascading failures | Perfect fit |
| **EM Emissions (locked)** | No interaction | No interaction | Deliberation = noise? | No interaction | Conflict = noise spike | Conflict = noise M8+ |
| **Buffer Model (locked)** | Independent | Independent | Independent | Independent | Confusion burns slots | Confusion M8+ only |
| **Onboarding (5.01-5.03)** | Simple to teach | Warnings = teaching | Hard to introduce | Too complex early | Harsh punishment | By definition perfect |
| **Competitive/PvP** | Deterministic, fair | Same | Non-transparent | Same as A | Punishes imprecision | Consistent rules |

---

## Recommendation

**Approach F (Progressive Disclosure)** is the recommended design, using Approach A (Strict Priority) as the foundation and layering in Approach B (Warnings) gradually. Elements of Approach E (Emergent Chaos) should be introduced late-campaign as dramatic consequences, NOT as the core conflict model.

The rule conflict system should feel like this:

- **Missions 1-3:** "Rules go top to bottom. First match wins. Done."
- **Missions 4-5:** "The game helps you see when rules are shadowed or conflicting."
- **Missions 6-7:** "You can now read the full evaluation waterfall in the Inspector. You're debugging rule priority like debugging code."
- **Missions 8-10:** "Your agents HESITATE when they're conflicted. The enemy detects hesitation. Clean architectures are silent architectures."

This progression mirrors real engineering skill development: first you learn the rules, then you learn to use tools that check the rules, then you learn to build systems where the rules never conflict in the first place.

---

## New Aspects Discovered

- **3.06a — Warning calibration: the false positive problem.** How many warnings per rule-set is too many? What threshold triggers "warning fatigue" where players dismiss everything? A/B testing warning sensitivity with playtest data.
- **3.06b — Ghost preview conflict visualization.** The dual-arrow ghost preview (solid + dashed) showing conflicting movement paths is a powerful teaching tool. Full design spec for how the ghost preview renders overlapping conditions as colored spatial zones.
- **3.06c — Conflict cascade visualization in Inspector.** When a command agent hesitates and that hesitation causes downstream failures, how does the Inspector render the causal chain? The "cascade line" connecting the conflict tick to its consequences across multiple agents.
- **3.06d — Rule ordering as transferable skill.** The mapping from rule priority in-game to firewall rules, CSS specificity, exception handling, SRE runbook priority, and production rule system conflict resolution. Documenting the exact skill transfer.
- **3.06e — Competitive meta around conflict-free architectures.** In PvP, do top players ever use deliberate conflicts strategically (e.g., the EM spike from hesitation as a decoy)? Or is conflict-free always optimal? The "controlled chaos" strategy space.
