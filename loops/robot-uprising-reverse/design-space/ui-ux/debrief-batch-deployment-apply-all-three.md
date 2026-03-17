# "Apply All Three" Batch Deployment

**Aspect:** 4.69f — "Apply All Three" batch deployment: detailed design of the multi-fix batch application — sequencing, conflict detection, rollback affordance, confirmation dialog.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a–4.69e (threshold configurability, combined coverage display, agent redesign mode, persistence tracking, adversarial poisoning)
**Related:** 4.37 — Fork-and-deploy shortcut; 4.69b — Combined agent coverage score display; 4.69c — Agent redesign mode; 4.36 — Multi-scenario fix explorer; 4.84 — "Both Valid, Apply Both" in agree-to-disagree

---

## The Core Problem

The multi-cluster detection panel surfaces three RELAY-C candidates:

```
⚠ RELAY-C appears in 3 of your top 5 candidates.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1  RELAY-C context buffer size    62%  (28/45)
#3  RELAY-C fallback filter        24%  (11/45)
#5  RELAY-C priority queue depth   17%   (8/45)

Combined coverage: 71%  (+9pp over top candidate alone)
```

The player has three choices: apply fixes one at a time (slow, iterative, safe), enter redesign mode (holistic but time-intensive), or — the subject of this analysis — **apply all three fixes at once**.

The one-at-a-time path is the pedagogically richest: apply #1, run 30 matches, re-analyze, apply the next visible symptom. But it costs 90+ matches of iteration to converge on a state that the combined coverage metric *already tells the player is achievable*. For experienced players who understand the diagnostic and trust the system's analysis, this iterative ceremony is friction without learning.

The redesign mode (4.69c) is the deepest response: enter the sandbox, rethink RELAY-C holistically, stress-test, commit. But it takes 15-30 minutes and sometimes the answer isn't a redesign — it's just three parameters that each need one notch adjusted. The player shouldn't need a full architectural review for what amounts to a config bump.

**"Apply All Three" fills the gap between surgical single-fix and full redesign: batch the cluster's fixes into one atomic config change.**

---

## The Sequencing Problem

Three fixes applied simultaneously are not three independent operations. They interact. The career analysis computed each fix's coverage *in isolation* — "if only this element changed, how many matches improve?" But applying all three changes the evaluation context for each fix:

```
Fix A: RELAY-C context buffer 12 → 14 slots
Fix B: RELAY-C fallback filter threshold 0.3 → 0.5
Fix C: RELAY-C priority queue depth 4 → 6

Applied in isolation:
  A alone: +28 matches improved
  B alone: +11 matches improved
  C alone: +8 matches improved

But A changes which signals reach the fallback filter (more buffer = more signals retained),
which changes B's impact. And B changes which signals are forwarded to the priority queue,
which changes C's impact.
```

The combined coverage of 71% (32/45 matches) was computed as a **union** — "at least one of these fixes would help this match." It was NOT computed as "all three applied simultaneously produce 71%." The actual result of simultaneous application could be higher (synergistic — fixes reinforce each other) or lower (antagonistic — Fix A changes the context such that Fix B's original recommendation is suboptimal).

This is the **batch interaction problem** and it determines the entire UI design.

---

## Option Space

### Option 1 — Naive Sequential Apply ("The Domino Drop")

Apply fixes in ranked order (#1, then #3, then #5) as three separate config mutations, with no re-evaluation between them.

**Mechanics:**
- Player clicks `[Apply All Three →]`
- Confirmation dialog shows the three fixes stacked vertically in rank order, each with a checkbox (all checked by default) and the individual coverage percentage
- Player confirms. The config mutates: A applied, then B applied, then C applied, creating config version v3.2 → v3.5 (three version bumps)
- The workbench flashes each changed element in sequence — coral glow walks from #1 to #3 to #5 over 1.5 seconds — then settles to standard teal
- Deploy queue auto-opens with v3.5 pre-staged

**Advantages:**
- Simple to implement. No re-evaluation needed.
- Clear audit trail: three distinct version bumps means rollback can be granular (revert to v3.3 = undo last two fixes)
- Fast — sub-second execution, feels instant

**Disadvantages:**
- Ignores fix interaction. The combined result might be worse than applying only #1 due to antagonistic interactions.
- Three version bumps for one player action is noisy in the config version history. "What changed in v3.3?" → "It was the second fix in a batch." The version history loses narrative coherence.

**Sensory description:** The confirmation dialog is a slim vertical card (280px wide, centered) with a dark navy (#1A1A2E) background. Three horizontal rows, each showing: a coral-bordered element icon on the left, the element name in medium-weight white text, the coverage percentage right-aligned in amber (#FFD93D). Below the rows, a combined coverage bar — a single horizontal thermometer showing 71% filled in gradient from teal to cyan, with "Combined: 71%" label. At the bottom: `[Apply All Three]` button in solid coral, `[Cancel]` in outline-only teal. When the player hovers `[Apply All Three]`, the three element icons pulse in sequence (top to bottom) at 200ms intervals, previewing the application order.

---

### Option 2 — Atomic Batch with Pre-Simulation ("The Proof Run")

Before applying, the system runs a quick simulation of the config with all three fixes applied simultaneously, computing the *actual* combined pass rate rather than the estimated union coverage.

**Mechanics:**
- Player clicks `[Apply All Three →]`
- A loading state appears: the three fix rows are visible, and below them a simulation progress bar fills over 2-4 seconds (re-running the 45 analyzed matches with the triple-modified config)
- Results appear: "Simulated pass rate with all three fixes: 68% (31/45)" alongside the original estimate "Estimated combined coverage: 71%"
- If simulation ≥ estimate: green checkmark, "Fixes are synergistic — actual result meets or exceeds estimate."
- If simulation < estimate but > top-candidate-alone: amber indicator, "Fixes interact — actual result (68%) is lower than estimate (71%) but still exceeds single-fix (62%)"
- If simulation < top-candidate-alone: red warning, "Fixes are antagonistic — applying all three produces a WORSE result (58%) than applying only #1 (62%). Recommend applying fixes individually."
- Player confirms or cancels based on the simulation result
- If confirmed, one atomic config version bump: v3.2 → v3.3 (single version representing the batch)

**Advantages:**
- Eliminates the batch interaction risk. The player knows the actual result before committing.
- The simulation/estimate comparison is itself a teaching moment — "estimation vs. measurement" is a core engineering concept (8.08 vocabulary claim).
- Atomic version bump is narratively clean: "v3.3 = the RELAY-C overhaul batch"

**Disadvantages:**
- Adds 2-4 seconds of latency to the "Apply All Three" flow. The player's momentum (diagnostic insight → action) is interrupted by a loading bar.
- May undermine trust in the combined coverage metric if simulated results frequently diverge. "Why show me 71% if it's really 68%?"
- Simulation cost interacts with 4.60 search budget — should the pre-simulation deduct from the player's compute budget?

**Sensory description:** The simulation progress bar is a horizontal strip beneath the three fix rows. It fills left-to-right in a gradient that shifts from teal to cyan to white as it progresses. Each fix row's element icon spins slowly (one rotation per second) while the simulation runs, giving a sense of "these elements are being tested." When complete, the results card slides up from below the progress bar: a green/amber/red background wash with large bold text showing the simulated pass rate. The sound is a low-frequency hum during simulation (evoking a server room computing), resolving to a bright chime (synergistic) or a dull clunk (antagonistic).

---

### Option 3 — Staged Apply with Checkpoint ("The Staircase")

Apply fixes one at a time, but with built-in re-evaluation between each step — essentially automating the "apply one, analyze, apply next" cycle that the manual path requires.

**Mechanics:**
- Player clicks `[Apply All Three →]`
- Confirmation dialog: "Batch mode will apply each fix in order, running a mini-analysis between each step. Estimated time: 8-15 seconds."
- Step 1: Apply Fix A (context buffer). Mini-analysis runs (2-3 seconds). Result: "Pass rate improved from 45% to 67%. Proceeding to Fix B."
- Step 2: Apply Fix B (fallback filter) *given the context of Fix A already applied*. Mini-analysis. Result: "Pass rate improved from 67% to 70%. Proceeding to Fix C."
- Step 3: Apply Fix C (priority queue depth) *given both A and B applied*. Mini-analysis. Result: "Final pass rate: 71%."
- Each step is displayed as a completed row that fills green from left to right as it resolves
- At any step, if the mini-analysis shows degradation ("Pass rate dropped from 67% to 63% after Fix B"), the system pauses: "Fix B appears antagonistic in this context. Skip it?" with `[Skip & Continue]` and `[Cancel Remaining]` buttons
- Three version bumps, but the staircase UI makes it feel like one coherent operation

**Advantages:**
- Maximum safety. Each fix is validated in context before the next is applied.
- The degradation detection auto-catches antagonistic interactions without requiring the player to understand fix interaction theory.
- The staircase progress visualization is satisfying — a mini-narrative of improvement visible in real time.
- Preserves the individual fix's meaning in version history.

**Disadvantages:**
- Slow. 8-15 seconds of sequential simulation. For 5-element clusters, this could take 30+ seconds.
- Overly cautious for experienced players who trust the combined coverage estimate and just want the result.
- The "Skip?" decision mid-staircase is an interruption in what the player intended as a batch action. They clicked "Apply All Three" to avoid per-fix decisions, and now the system is asking them per-fix decisions.

**Sensory description:** The dialog expands vertically as each step resolves. Three horizontal progress bars stacked vertically, each initially dimmed. Fix A's bar activates first — a thin teal line sweeps left to right over 2-3 seconds while computation runs. When complete, the bar fills solid green and a pass-rate number appears right-aligned. Fix B's bar activates. The vertical expansion feels like a tower growing upward, each brick placed after the previous one cures. The pause state (antagonistic fix detected) is a sharp amber flash across the entire dialog, the current fix's bar turning amber with a striped hazard pattern. A low two-tone alert sound — not alarming, but attention-getting. Like a seatbelt warning, not a fire alarm.

---

### Option 4 — Branch-and-Compare ("The Fork Garden")

Instead of applying all three to the live config, the system creates three branches — one per fix combination — and simulates all of them in parallel.

**Mechanics:**
- Player clicks `[Apply All Three →]`
- The system creates and evaluates the meaningful fix combinations:
  - Config + A only
  - Config + A + B
  - Config + A + B + C (all three)
  - Config + A + C (skip B)
  - Config + B + C (skip A)
- Results displayed as a decision tree or comparison grid:

```
Fix Combination          Pass Rate   Delta vs. Current
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current config           45%         —
A only                   67%         +22pp
A + B                    70%         +25pp
A + B + C (all three)    71%         +26pp
A + C (skip B)           69%         +24pp
B + C (skip A)           52%         +7pp
```

- Player selects the best combination and clicks `[Deploy This →]`
- One atomic version bump with the selected combination applied

**Advantages:**
- Maximum information. The player sees every meaningful combination and picks the best one.
- Catches cases where "all three" is suboptimal — maybe A + C without B actually performs better due to antagonistic interaction.
- The fork garden is itself a lesson in combinatorial thinking (directly transferable to real A/B testing).

**Disadvantages:**
- Exponential in cluster size. 3 elements = 7 combinations. 5 elements = 31 combinations. The UI and computation both struggle at scale.
- Information overload for casual players. They clicked "Apply All Three" for simplicity; now they're looking at a comparison grid.
- Simulation cost is 5-7x a single run. Interacts heavily with 4.60 search budget.

**Sensory description:** The comparison grid appears as a set of horizontal cards, each representing a combination. Each card has: a left-side icon cluster showing which fixes are included (lit icons for included, dim for excluded), center text showing pass rate in large bold numerals, and a right-side delta badge (green for positive, red for negative). The best-performing card has a subtle gold border pulse. Cards are sorted by pass rate descending. Hovering a card highlights the included fixes in the cluster panel above. Clicking a card expands it to show per-match detail. The overall feel is a "choose your path" fork in the road — the fork garden metaphor literalized as a branching visual.

---

## Conflict Detection

Regardless of which application strategy is chosen, the system must detect and handle three categories of conflict:

### Category 1 — Value Conflicts

Two fixes target the same parameter. Example: Fix A says "RELAY-C context buffer: 12 → 14" and Fix C says "RELAY-C context buffer: 12 → 16" (from a different career analysis run or a manually-triggered re-analysis). These are literally incompatible — you can't set the buffer to both 14 and 16.

**Detection:** Before applying, check whether any two fixes in the batch modify the same parameter path (agent.element.attribute). If so, flag:

> ⚠ **Conflict detected:** Two fixes modify RELAY-C context buffer size.
> Fix #1 recommends **14 slots**. Fix #5 recommends **16 slots**.
> `[Use 14 (Fix #1)]`  `[Use 16 (Fix #5)]`  `[Use higher (16)]`  `[Cancel batch]`

**Visual treatment:** The two conflicting rows turn amber, with a dashed line connecting them. The conflict icon (⚡) appears between them. The rest of the batch dims slightly to focus attention on the conflict.

### Category 2 — Dependency Violations

Fix B assumes the pre-fix state of a parameter that Fix A modifies. Example: Fix A increases the context buffer from 12 to 14 (more signals retained). Fix B was computed assuming the buffer was 12 (fewer signals reaching the fallback filter). With buffer at 14, Fix B's recommendation may be stale.

**Detection:** This is the batch interaction problem described above. Strictly, *every* multi-fix batch has potential dependency violations because each fix was computed in isolation. The question is whether the dependency is *material* — whether the second fix's target parameter is *downstream* in the signal flow from the first fix's target.

The system can detect this by consulting the agent's signal flow graph: if Fix A's target feeds data to Fix B's target (buffer → filter → queue), the dependency is material. If they are on independent branches (buffer size and patrol radius), the dependency is immaterial.

**Visual treatment:** A thin directional arrow drawn between dependent fix rows — teal arrow pointing from upstream fix to downstream fix. Tooltip: "This fix was computed assuming the pre-fix state of the element above. Results may differ when applied together."

### Category 3 — Budget Overruns

If the pre-simulation (Option 2) or fork garden (Option 4) is selected, the simulation cost may exceed the player's remaining search budget (4.60). For a 3-element cluster with 45 matches, a full pre-simulation costs roughly 1x the original career analysis. The fork garden costs 5-7x.

**Detection:** Before launching simulation, check remaining budget. If insufficient:

> ⚠ **Insufficient compute budget** for batch simulation.
> Cost: 45 tokens. Remaining: 22 tokens.
> `[Apply without simulation (risky)]`  `[Wait for budget refresh]`  `[Cancel]`

**Visual treatment:** The simulation progress bar appears but is partially filled with a red "budget exceeded" pattern (diagonal stripes). The cost/remaining numbers are displayed in the bar itself, red text on dark background.

---

## The Rollback Affordance

Every batch application needs an undo path. The design of rollback determines how safe the "Apply All Three" button feels — and feeling safe is what makes players use it.

### Rollback Model A — Per-Fix Granular Undo

Each fix in the batch creates its own version bump (v3.2 → v3.3 → v3.4 → v3.5). The player can revert any individual fix from the version history, peeling back the staircase one step at a time.

**Implementation:** Standard version history with labeled entries:
```
v3.5  [BATCH 1/3] RELAY-C priority queue depth 4→6
v3.4  [BATCH 2/3] RELAY-C fallback filter 0.3→0.5
v3.3  [BATCH 3/3] RELAY-C context buffer 12→14
v3.2  (pre-batch state)
```

A `[Revert Batch →]` button at the top of the version history sidebar undoes all three at once. Individual entries can be reverted independently via `[Revert This →]` on each row.

**Problem:** Reverting v3.4 (Fix B) while keeping v3.5 (Fix C) changes the context in which Fix C operates. The resulting config (A applied, B reverted, C applied) was never tested. Partial rollback creates untested states.

### Rollback Model B — Atomic Batch Undo

The batch is one version bump (v3.2 → v3.3). Rollback is all-or-nothing: revert the entire batch or keep it.

**Implementation:**
```
v3.3  [BATCH] RELAY-C overhaul: context buffer 12→14, fallback filter 0.3→0.5, priority queue 4→6
v3.2  (pre-batch state)
```

A single `[Revert Batch →]` button. No partial undo.

**Problem:** The player might discover that 2 of 3 fixes work great but the third is harmful. Atomic undo forces them to lose all three and reapply the two good ones manually.

### Rollback Model C — Snapshot with Selective Replay

The system takes a full config snapshot before the batch. After applying and running matches, the player can enter a "batch review" state that shows the three fixes individually and allows selective keeping/reverting.

**Implementation:** After 30+ post-batch matches, a notification appears: "Batch review available for RELAY-C overhaul (v3.3)." Opening it shows:

```
BATCH REVIEW — v3.3 RELAY-C Overhaul
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix A: context buffer 12→14    [Keep ✓]  [Revert ✗]
  Attribution: improved 24 of 30 post-batch matches

Fix B: fallback filter 0.3→0.5 [Keep ✓]  [Revert ✗]
  Attribution: improved 8 of 30 post-batch matches

Fix C: priority queue 4→6      [Keep ✓]  [Revert ✗]
  Attribution: improved 3 of 30 post-batch matches (⚠ marginal)

[Apply Selections →]  [Keep All →]  [Revert All →]
```

**Advantage:** Maximum flexibility. The player gets granular rollback with *post-application data* to inform the decision.
**Disadvantage:** Requires 30+ matches before review is available. The player lives with the full batch for a while before they can selectively undo.

---

## The Confirmation Dialog — Full Design

The confirmation dialog is the player's last moment of decision before committing. It must communicate: what will change, what the expected result is, what the risks are, and how to undo.

### Layout

A centered modal (360px wide, variable height) with a dark navy background (#1A1A2E) and thin coral (#FF6B6B) border. The modal casts a soft shadow over the dimmed workbench behind it.

**Header:** "Apply Cluster Fixes" in 16px semibold white, with the cluster agent's icon (📡 RELAY-C) to the left. A thin horizontal rule in teal (#4ECDC4) below.

**Fix List:** Three rows, each showing:
- Left: ordinal badge (#1, #3, #5 — matching the career analysis rank) in a small circle with white text on teal background
- Center: element name in 14px regular white ("context buffer size", "fallback filter", "priority queue depth")
- Center-right: the change in monospace — "12 → 14", "0.3 → 0.5", "4 → 6" — in amber (#FFD93D)
- Right: individual coverage in 12px muted grey ("62%", "24%", "17%")
- Each row has a checkbox (checked by default). Unchecking a fix removes it from the batch.

**Dependency Indicators:** Thin teal arrows between rows where dependency is detected (buffer → filter → queue). Hovering an arrow shows tooltip: "Changing buffer size may affect fallback filter behavior."

**Combined Metrics Bar:** Below the fix list, a horizontal bar showing:
- Left: "Combined coverage: 71%" in bold teal
- Center: small delta badge "+9pp over #1 alone" in green
- Right: "Config: v3.2 → v3.3" in muted grey

**Risk Warning (conditional):** If dependency arrows exist, a single-line amber warning beneath the metrics bar: "⚠ Fixes interact — simulated result may differ from estimate."

**Action Buttons:** Bottom row, full-width:
- `[Apply & Deploy →]` — solid coral background, white text, primary action
- `[Simulate First →]` — outline teal, for players who want the Option 2 pre-simulation
- `[Cancel]` — text-only, bottom-right, muted grey

**Rollback Notice:** Below the buttons, in 11px muted text: "Batch creates one version bump. Undo anytime from version history."

### Interaction Details

- **Checkbox unchecking:** When the player unchecks a fix, the combined coverage bar recalculates (1-second debounce animation — the bar smoothly contracts). If only one fix remains checked, the dialog smoothly transitions to the standard single-fix fork-and-deploy dialog (4.37).
- **Hover on fix row:** The element's location in the workbench blueprint is highlighted (visible through the semi-transparent modal backdrop, with a floating yellow pin on the element).
- **Keyboard shortcuts:** Enter = Apply & Deploy. S = Simulate First. Escape = Cancel. 1/2/3 toggle checkboxes.

---

## Player Journeys

### Journey: Zara, 28, Senior Platform Engineer

**Context:** Mission 8 (factory vs. factory). Zara is in her third season of Gauntlet ranked play. She just ran a 45-match career analysis that surfaced the RELAY-C multi-cluster flag. She has seen this pattern before — RELAY-C has been a persistent offender for two seasons (4.69d). Her compute budget is at 60% (mid-season).

**Minute 0:00 — The Cluster Flag**
Zara's career analysis result loads. The familiar amber bar appears at the top: "⚠ RELAY-C appears in 3 of your top 5 candidates." She sighs. Not RELAY-C again. She clicks `[View Agent Audit →]` and scans the combined coverage: 71% (+9pp). Higher than last season's cluster (which was 64%). RELAY-C is getting worse, not better.

She considers entering redesign mode (4.69c) but glances at the clock — she has 20 minutes before her next Gauntlet match deploys. A full redesign takes 30+. She needs a tactical patch now, strategic overhaul later.

**Minute 0:30 — Evaluating the Batch**
She clicks `[Apply All Three →]`. The confirmation dialog appears. Three rows: buffer 12→14, filter 0.3→0.5, queue 4→6. She sees the dependency arrows — buffer feeds filter feeds queue. She knows from experience that cascading dependencies sometimes degrade batch results.

She hovers over "Simulate First →" and checks her compute budget in the top-right — 60%, enough. She clicks `[Simulate First →]`.

**Minute 0:35 — Pre-Simulation**
The three element icons spin slowly. The progress bar sweeps teal-to-cyan over 3 seconds. Result card slides up: "Simulated pass rate: 69% (31/45)." Amber indicator: "Result (69%) is lower than estimate (71%) but exceeds single-fix (62%)." The 2pp gap tells Zara the dependency cascade is real but minor. She unchecks Fix B (fallback filter) experimentally — the combined coverage recalculates to 70%. Interesting: removing the middle fix actually *increases* the batch result by 1pp. The filter change was antagonistic.

She re-checks Fix B and notes the interaction for her post-session analysis. For now, 69% is good enough. She clicks `[Apply & Deploy →]`.

**Minute 0:50 — Post-Apply**
The workbench flashes three elements in sequence — coral glow walking down the agent config panel. The version history sidebar updates: "v3.3 [BATCH] RELAY-C cluster fix: buffer, filter, queue." The deploy queue opens with v3.3 pre-staged. She queues it for her next Gauntlet match and closes the panel.

She makes a mental note: "After this season, RELAY-C gets a full redesign. This is the third time I've patched it."

**Minute 1:10 — Resolution**
Zara's next 30 matches show a pass rate improvement from 45% to 66% — lower than the simulated 69%, but still a significant improvement. She runs career analysis again. RELAY-C no longer appears in the top 5. The cluster was genuinely patched. But she knows from 4.69d persistence tracking that it will likely resurface as the meta shifts.

**UI Annotations:**
- Confirmation dialog: 360px centered modal, coral border, navy background
- Dependency arrows: teal directed arrows between fix rows
- Pre-simulation: 3-second progress sweep, amber result card for partial-synergy
- Version history: "[BATCH]" tag prefix on atomic version entry

---

### Journey: Marcus, 14, First Strategy Game

**Context:** Mission 5 (factory just introduced). Marcus has been playing for 4 hours total. His career analysis just flagged his only relay unit for the first time. He doesn't know what "multi-cluster" means.

**Minute 0:00 — First Encounter with the Flag**
Marcus's career analysis (15 matches) shows:

```
#1  RELAY-A buffer size      53%  (8/15)
#2  SCOUT-A patrol range     40%  (6/15)
#3  RELAY-A signal filter    33%  (5/15)
#4  RELAY-A queue priority   27%  (4/15)
```

The amber bar appears: "⚠ RELAY-A appears in 3 of your top 4 candidates." Marcus reads it twice. Below the warning: "Individual fixes address symptoms. This agent may have a structural problem." He doesn't fully understand "structural problem" but the word "symptoms" makes him think of doctor visits — treating a cough when you have the flu.

He clicks `[View Agent Audit →]`. The audit panel shows combined coverage: 78% (+25pp over #1 alone). The plain-language tooltip (if 4.69o is implemented): "Fixing all three could improve 3 more matches (from 8 to 11 out of 15)."

**Minute 0:20 — Deciding to Batch**
Marcus sees `[Apply All Three →]` and `[Redesign RELAY-A →]`. He doesn't want to redesign — he just built RELAY-A two missions ago and he's proud of it. He clicks `[Apply All Three →]`.

The confirmation dialog appears. Three rows with checkboxes. He reads the changes: buffer 6→8, filter 0.2→0.4, queue 3→5. He doesn't know what these numbers mean individually, but the combined coverage bar shows 78% and that seems good. There are no dependency arrows (his relay is simple enough that the system doesn't detect material dependencies).

He sees `[Simulate First →]` and `[Apply & Deploy →]`. He doesn't know what simulation means in this context. He clicks `[Apply & Deploy →]` because it's coral and looks like the primary button.

**Minute 0:35 — The Glow Sequence**
Three elements flash coral in sequence on his workbench. He watches them light up — buffer, filter, queue — and for the first time notices that these three things are *connected*. The buffer feeds the filter which feeds the queue. The sequential glow animation accidentally teaches him the signal flow through his relay. "Oh, the buffer is like... what the relay hears. The filter is what it keeps. The queue is what it does with it."

**Minute 0:50 — Post-Deploy**
He runs 10 more missions. His relay performs noticeably better. He doesn't run another career analysis — he moves on to Mission 6.

But two missions later, his relay starts struggling again (new mission introduces enemy jamming). When the cluster flag appears again, this time he hesitates over `[Apply All Three →]`. He remembers the glow sequence. He thinks about *why* the buffer needed to be bigger. He's starting to develop the "think about the architecture, not just the parameters" instinct that the multi-cluster system is designed to cultivate.

**UI Annotations:**
- Plain-language tooltip on combined coverage: "could improve X more matches" (4.69o)
- No dependency arrows for simple configs — reduces visual noise for beginners
- Coral primary button draws the eye; simulation button is secondary/optional
- Sequential glow animation serves as accidental signal-flow tutorial

---

### Journey: Chen, 35, Twitch Streamer / Content Creator

**Context:** Gauntlet Season 4 ranked play, streaming to 400 viewers. Chen's career analysis after a losing streak surfaces a 5-element cluster on his COMMAND-A agent. Chat is roasting him.

**Minute 0:00 — The Five-Element Cluster**
Career analysis result: COMMAND-A appears in 5 of the top 8 candidates. Combined coverage: 84% (+22pp). Chat explodes: "COMMAND-A DIFF" "REDESIGN ANDY" "just delete it 4Head". Chen laughs. "Alright, alright, COMMAND-A is the problem, we know."

He clicks `[Apply All Three →]` — but it says `[Apply All Five →]` because the cluster has 5 elements. The confirmation dialog is taller than usual, scrolling slightly on his 1080p stream layout. Five fix rows with checkboxes. Two dependency arrows visible.

**Minute 0:15 — The Streamer Decision**
Chen wants to simulate first for the content — showing chat the simulation running is good TV. But his compute budget is at 15% (he burned most of it earlier in the stream on an MSMFE deep dive). The system shows the amber budget warning: "⚠ Insufficient budget for 5-element simulation. Cost: 85 tokens. Remaining: 22 tokens."

Chat: "just send it" "YOLO DEPLOY" "simulate deez". Chen deliberates for 30 seconds (good content — parasocial tension). He unchecks two of the five fixes — the two with lowest individual coverage (11% and 8%) — bringing it to a 3-element batch that fits his budget. He clicks `[Simulate First →]`.

**Minute 0:40 — The Reveal**
Simulation completes. 73% (vs. 84% estimated for all five, 62% for top candidate alone). The amber indicator says partial synergy. Chen reads it aloud for chat. "Seventy-three percent, that's pretty good. We're leaving the other two fixes on the table but budget's budget." He applies.

**Minute 1:00 — Resolution**
Post-batch, his next 5 Gauntlet matches go 4-1. Chat is happy. "COMMAND-A REDEMPTION ARC" — a viewer clips the moment the batch was applied with the sequential glow animation. The clip makes the rounds in the Robot Uprising subreddit.

**UI Annotations:**
- `[Apply All Five →]` — button text adapts to cluster size
- Scrollable confirmation dialog for 5+ element clusters
- Budget warning integrated into the dialog, not a separate popup
- Checkbox deselection as budget management creates streamer content

---

## Interaction Effects

### With 4.37 (Fork-and-Deploy Shortcut)
The batch deployment is essentially the multi-fix extension of fork-and-deploy. It inherits the same pedagogical tension: the more the system does for the player, the less the player learns about their own config geography. The batch amplifies this — applying three fixes at once means three config elements the player never manually navigated to. The sequential glow animation partially mitigates this by showing *where* each element lives.

### With 4.60 (Search Budget as Player Resource)
Pre-simulation costs scale linearly with cluster size. A 3-element simulation costs ~1x a standard analysis. A 5-element fork garden costs 15-31x. This creates a natural governor on batch ambition: budget-constrained players must choose between batch-simulating a smaller cluster or blind-applying a larger one. The budget interaction turns the batch size into a strategic decision, not just a convenience toggle.

### With 4.69c (Agent Redesign Mode)
Batch deployment and redesign mode are complementary responses to the same diagnostic. Batch = tactical patch (fast, shallow). Redesign = strategic overhaul (slow, deep). The player should feel a clear fork: "Is this a parameter problem (batch) or an architecture problem (redesign)?" The cluster coverage delta can signal which: if combined coverage is within 5pp of top-candidate-alone, it's a parameter problem. If the delta is 15pp+, it's architectural.

### With 4.84 ("Both Valid, Apply Both")
The agree-to-disagree "apply both" feature from 4.84 is a 2-fix batch. The "Apply All Three" is a 3+ fix batch. These should share the same underlying batch application infrastructure — confirmation dialog, dependency detection, rollback model, simulation. The UI should be visually consistent: same dialog shape, same coral-border style, same glow animation. The player should recognize "oh, this is the same thing but with more fixes."

### With 8.08 (Real-Language Vocabulary)
The batch deployment teaches: sequential vs. atomic deployment, dependency detection, rollback strategy, pre-simulation vs. blind deployment. All of these map directly to real software engineering practices — blue-green deploys, database migration ordering, rollback plans, staging environments. The game's batch deployment dialog is literally a simplified version of a CI/CD pipeline confirmation screen.

---

## Comparable Games & Media

### Slay the Spire — Deck Transformation Events
When Slay the Spire offers "transform 3 cards" at a rest site, the player commits all three transformations at once — no preview of what each card will become. This is the "blind batch" model. Players learn to evaluate the expected value of the batch *as a batch* rather than per-element. Robot Uprising's pre-simulation option gives the player something Slay the Spire doesn't: a preview of the batch result before committing.

### Factorio — Blueprint Application
Placing a Factorio blueprint is a batch operation: dozens of machines, inserters, and belts placed simultaneously. Conflicts (overlapping entities, insufficient resources) are shown as red ghost entities before the player confirms. Robot Uprising's conflict detection follows this pattern — show problems before committing, let the player adjust.

### Git — Interactive Rebase / Cherry-Pick
The batch deployment is structurally a git cherry-pick of three commits (fixes) onto a branch (config). Cherry-pick can have merge conflicts (value conflicts), can change the context for subsequent commits (dependency violations), and can be reverted atomically or individually. The rollback models map directly to `git revert` (individual) vs. `git reset --hard` (atomic).

---

## Recommendation

**Option 2 (Atomic Batch with Pre-Simulation) as default, with Option 1 (Naive Sequential) as budget-fallback.**

The pre-simulation is worth the 2-4 second cost because it transforms the batch from a leap of faith into an informed decision. The simulation/estimate comparison is a natural teaching moment. When budget is insufficient, fall back to Option 1 with an explicit warning: "Applying without simulation — results may differ from estimate."

Rollback Model C (Snapshot with Selective Replay) after 30+ post-batch matches, because it gives the player the most useful information at the most useful time.

The confirmation dialog should always show dependency arrows and conflict indicators, even when the player is applying without simulation — awareness of fix interaction is valuable independent of whether the interaction is pre-computed.
