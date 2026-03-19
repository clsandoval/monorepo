# 3.07c — Rules Diff View in Inspector: The Change Ledger

## Overview

The Inspector is the analytical half of the two-act debrief. The player has watched their agents fail (or succeed) in the sealed watch, and now they scrub through the timeline, clicking units, reading decision traces. But one question the current Inspector design does not answer is: **what did I change since last time?**

The Rules UI (3.07) covers how the player constructs rules. The Panel at Scale (3.07a) covers readability of large rule lists. The Copy-Paste model (3.07b) covers cross-blueprint sharing. This document explores a different problem entirely: **the debrief reflection gap.** When a player executes a mission, watches the outcome, and enters the Inspector, their memory of what they changed is already degrading. Did they add rule 4, or was that always there? Did they reorder rules 2 and 3, or was it 3 and 4? Did they change the distance qualifier from 3 to 2 tiles, or was it always 2?

This is "The Change Ledger" — an Inspector panel that shows an explicit diff between the configuration that ran in the current execution and the configuration that ran in the previous execution. Not a version control system. Not a full edit history. A focused, readable summary: **what changed, and did it matter?**

The deeper question: **how does the game close the feedback loop between "I changed something" and "here is what happened because of that change"?**

---

## The Core Tension

Three forces collide:

1. **Diagnostic Clarity** — The player needs to know what they changed so they can attribute outcomes to decisions. "My scout survived this time — was that because I added the evasion rule, or because the enemy spawned in a different position?" Without a change ledger, this attribution is guesswork. With one, the player can trace causality: "I added rule 4 (evade when enemy_spotted within 2), my scout used rule 4 at tick 14, my scout survived. Rule 4 saved my scout."

2. **Cognitive Load** — The Inspector already shows decision traces, context window states, event logs, and timeline scrubbing. Adding another panel risks information overload. The diff view must be scannable in under 5 seconds, not another wall of data that the player learns to ignore.

3. **Pedagogical Framing** — The diff view is not just a convenience feature. It is a teaching tool for the scientific method. Change one variable, observe the result, attribute the outcome. If the game makes the "change" explicit and the "outcome" traceable, it is literally teaching experimental design. But if the diff is too detailed (showing every token-level edit), it drowns the lesson. If it is too abstract ("3 rules changed"), it does not teach.

---

## Five Diff View Models

### Model A: "The Redline" — Inline Diff in the Rules Panel

**How it works:** When the player opens the Inspector and clicks a unit, the rules panel in the sidebar shows the current rule list with inline diff annotations. New rules have a green left-edge bar and a faint green background tint. Deleted rules appear as a struck-through ghost strip with a red left-edge bar, positioned where they used to be in the priority order. Modified rules have an amber left-edge bar with the changed token highlighted — the old value shown in a tiny struck-through superscript above the new value. Reordered rules have a blue movement arrow: a thin curved line from the old position to the new position, with "was #5, now #3" in a small tooltip.

**Visual description:** The rules panel looks almost identical to the Plan screen's rules panel, but with a thin "CHANGES SINCE LAST EXECUTE" header in muted amber above the rule list. The header includes a count badge: "3 changes." Each annotation is subtle — the green/red/amber edge bars are 3px wide, barely more than an accent line. The struck-through ghost strips are at 40% opacity, clearly "not here anymore" without screaming for attention. The reorder arrows are thin dashed blue lines with a small circled number at each end showing old and new position.

Hovering any annotated rule strip opens a tooltip with natural language: "NEW — You added this rule before this execute." Or: "MODIFIED — You changed the distance from 3 to 2 tiles." Or: "REORDERED — This was rule #5, now it is rule #3 (moved up 2 positions)." Or: "REMOVED — This rule was in your previous config but you deleted it."

**The "Did It Fire?" Indicator:** Crucially, each diff-annotated rule also shows whether it was ever evaluated or triggered during the match. A small lightning bolt icon appears next to rules that fired at least once, with a count: "⚡ 7" means this rule fired on 7 ticks. A dimmed-out lightning bolt with "0" means the rule existed but never matched. This is the causal bridge — the player sees "I added rule 4" AND "rule 4 fired 7 times" in the same visual line.

**Strengths:**
- Zero new panels. Reuses the existing rules display with annotations overlaid.
- Scannable in 2-3 seconds — the color bars jump out immediately.
- The "did it fire?" indicator closes the feedback loop in one glance.
- Feels like a code review tool — familiar to anyone who has used GitHub diffs.

**Weaknesses:**
- Gets cluttered with many changes. If the player rewrote 8 of 12 rules, the panel is more diff than content.
- Reorder visualization is hard when multiple rules moved. Five arrows crossing each other becomes spaghetti.
- Does not show changes to other primitives (skills, hooks, context config). Rules-only.

### Model B: "The Change Card" — Standalone Summary Panel

**How it works:** A dedicated collapsible panel in the Inspector sidebar, above the decision trace, titled "CHANGE LOG." It does not show the full rule list — only the changes, summarized in natural-language sentences. Each change is a card with a category icon, a plain-English description, and a "trace" button.

**Example Change Cards:**

```
┌─────────────────────────────────────────┐
│  📋  RULE ADDED (Scout Alpha)           │
│  "IF enemy_spotted within 2 → evade"    │
│  Now rule #4 of 6                       │
│  ⚡ Fired 7 times  [Trace →]            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🔀  RULES REORDERED (Scout Alpha)      │
│  "engage nearest" moved from #2 → #3   │
│  "evade nearest" moved from #3 → #2    │
│  ⚡ Priority change affected 4 ticks    │
│  [Trace →]                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ✏️  RULE MODIFIED (Relay Beta)          │
│  Rule #2: distance changed 3 → 2 tiles │
│  Old: "IF ally_signal within 3 → comp" │
│  New: "IF ally_signal within 2 → comp" │
│  ⚡ Fired 3 fewer times (was 11, now 8) │
│  [Trace →]                              │
└─────────────────────────────────────────┘
```

Each card has a soft background matching the change type: green for additions, red for deletions, amber for modifications, blue for reorders. The "[Trace →]" button jumps the timeline scrubber to the first tick where this changed rule was evaluated, and highlights the relevant decision trace entry.

**The "Impact Delta" Footer:** Below all change cards, a summary line reads: "3 changes across 2 blueprints. Net impact: +7 rule firings, -3 rule firings, 4 ticks with different priority resolution." This is the 2-second glance line — the player does not even need to read the cards to know whether their changes mattered.

**Strengths:**
- Natural language is immediately comprehensible. No visual decoding needed.
- The "[Trace →]" button creates a direct link from "what I changed" to "what happened because of it."
- Works across all blueprints simultaneously — a single panel shows changes to Scout, Relay, and Striker.
- The Impact Delta footer is the fastest possible summary.
- Scales cleanly — 2 changes or 20 changes both work as a scrollable card list.

**Weaknesses:**
- A new panel competes for sidebar space with decision trace, context window chart, and event log.
- Natural language descriptions must be generated for every possible change type — combinatorial explosion of sentence templates.
- Does not show the full context of the rule list (where the new rule sits among the others).

### Model C: "The Before/After Split" — Side-by-Side Comparison

**How it works:** The Inspector sidebar gains a toggle: "Current Config" / "Split View." Toggling to Split View divides the rules panel into two columns — left column shows "LAST EXECUTE" (previous config, frozen, desaturated), right column shows "THIS EXECUTE" (current config, full color). Matching rules are connected by thin horizontal lines. New rules have no left-side partner and glow green. Deleted rules have no right-side partner and glow red. Modified rules are connected by an amber line with the specific changed tokens underlined.

**Visual description:** The split view is a 50/50 horizontal divide within the existing rules panel area. The left column has a faintly blue-tinted background (past), the right column has the standard dark background (present). A thin vertical divider line separates them, with "BEFORE" and "AFTER" labels at the top in muted text. Matching rules are connected by thin gray horizontal lines at their midpoint height. When the player hovers a line connecting a modified rule pair, the specific changed tokens pulse amber on both sides — the old value on the left, the new value on the right. Hovering a green orphan on the right (new rule) shows a tooltip: "Added before this execute." Hovering a red orphan on the left (deleted rule) shows: "Removed before this execute."

For reorders, the connecting lines cross each other. If rule #2 and rule #3 swapped positions, the lines form an X shape. The crossing point glows blue briefly when hovered, and a tooltip reads: "Priority swap — these two rules exchanged positions."

**Strengths:**
- Maximum spatial clarity for "what was, what is." The two-column layout is universally understood from merge tools.
- Reorders are instantly visible as crossed lines — no arrows, no text, just geometry.
- The frozen left column serves as a reference: "Oh right, THAT was my old config."

**Weaknesses:**
- Halves the horizontal space for each column. On small screens, the rule strips are compressed.
- Does not work well for units with 12+ rules — the split becomes a scrolling maze.
- Does not integrate the "did it fire?" data — it shows what changed but not whether the change mattered.
- The visual language (split columns, connecting lines) is familiar to developers but may confuse casual players.

### Model D: "The Narrator" — Spoken Natural-Language Summary

**How it works:** When the player first enters the Inspector after a new execution, a brief text-crawl appears in the top-center of the screen — the AI narrator voice (the player's own AI consciousness, per the locked narrative) summarizing the changes in first person. The text fades in line by line over 3-4 seconds, then gently fades out.

**Example narration:**

> "Before this execution, I modified 3 rules across 2 blueprints.
> I added an evasion trigger to Scout Alpha — it fired 7 times.
> I swapped the priority of engage and evade on Scout Alpha.
> I tightened Relay Beta's signal range from 3 to 2 tiles — it received 3 fewer signals.
> My most impactful change: the evasion trigger. Without it, Scout Alpha would have been eliminated at tick 14."

The narration is accompanied by a faint synthetic voice — a low, calm, slightly digital tone reading the text. Not a full voice actor — a text-to-speech-adjacent audio treatment that feels like the AI's internal monologue. Each line that appears highlights the corresponding unit on the board with a brief amber pulse.

After the narration fades, the text is preserved in a collapsible "Change Summary" drawer at the bottom of the Inspector, accessible anytime.

**Strengths:**
- Zero cognitive load. The player does not parse a panel — the game tells them what changed.
- The first-person voice reinforces the diegetic framing: "I am an AI reviewing my own modifications."
- The "most impactful change" line is the highest-value insight — automated attribution.
- Works beautifully for streamers: the text crawl is readable on camera.

**Weaknesses:**
- Automated attribution ("most impactful change") requires counterfactual simulation or at minimum a firing-frequency heuristic. False attribution is worse than no attribution.
- Fixed narration pace. Fast players who want to immediately start scrubbing will be annoyed by the 3-4 second text crawl.
- Narration text must be generated for every possible change combination — same combinatorial problem as Model B but harder because sentences must flow naturally as a paragraph.
- Removes player agency: the game decides what to highlight, not the player.

### Model E: "The Change Lens" — Toggle Overlay on Existing Panels (Recommended)

**How it works:** A small toggle button in the Inspector toolbar — a delta symbol (Δ) — that can be clicked to overlay change annotations on ALL existing Inspector panels simultaneously. When the Change Lens is active: the rules panel shows Model A-style inline diff bars, the decision trace highlights steps that involved changed rules with an amber badge, and the context window chart shows a thin amber line at the tick where a changed rule first fired.

The Change Lens is OFF by default. The player discovers it naturally by noticing the Δ button, or the game points it out in a Mission 3 boot log hint: "SUBSYSTEM ONLINE: Configuration delta overlay. Toggle Δ to see what changed since your last execution."

**Visual description:** The Δ button sits in the Inspector toolbar alongside timeline controls. When inactive, it is a muted gray outline. When active, it glows amber and a thin amber border appears around the entire Inspector sidebar, signaling "change overlay mode active." All diff annotations use the same amber accent color, tying them together visually. The button toggles with a soft click sound — a clean "tck" like a physical switch.

In Change Lens mode:
- **Rules panel:** Green/red/amber left-edge bars on changed rules (Model A). A small badge count: "Δ3" next to the rules header.
- **Decision trace:** Steps that evaluated a changed rule get a small amber diamond badge. The step text is unchanged, but the badge lets the player instantly spot "this decision involved something I modified."
- **Context window chart:** A thin vertical amber line appears at tick T where a changed rule first fired. Multiple changed rules = multiple amber lines. The player sees the temporal footprint of their changes on the sparkline.
- **Board:** Units whose blueprints were modified have a thin amber ring around their tile icon. Unmodified units have no ring. The player's eye immediately goes to the changed units.
- **Event log:** Events caused by changed rules get an amber prefix marker: "Δ T14 — Scout Alpha EVADE (new rule)."

The Change Lens does NOT add a new panel. It decorates every existing panel with change context. When toggled off, all amber annotations vanish instantly.

**Strengths:**
- No new panels. Zero additional screen real estate consumed.
- Cross-cutting: shows changes in rules, decision traces, timeline, board, and event log simultaneously.
- Discoverable but not intrusive. The Δ toggle respects the player's attention — they choose when to see diffs.
- The amber-ring-on-board feature is uniquely powerful: the player scrubs the timeline and instantly sees which units are running modified configs.
- Teaches the concept of "diff" as a lens/filter, not a separate view — a transferable mental model.

**Weaknesses:**
- Multiple overlapping annotation systems (the amber badges, bars, rings, lines) could create visual noise when many things changed.
- The toggle is easy to forget exists. Players who never click Δ never discover the feature.
- Implementation complexity: the overlay must be computed against every existing panel's rendering pipeline.

---

## Interaction Effects

**With Decision Trace (Inspector locked spec):** The Change Lens's amber badges on decision trace steps create a direct causal link: "this step used a rule I changed." Without the Change Lens, the decision trace shows what happened. With it, the trace shows what happened *because of what I changed.* This is the difference between observation and experimentation.

**With Timeline Scrubber (Inspector locked spec):** The amber vertical lines on the context window chart give the player temporal landmarks. "My changes first mattered at tick 14." They can scrub directly to those ticks. The timeline scrubber becomes not just a replay tool but a change-impact explorer.

**With Counterfactual Simulation (4.20):** The Change Lens naturally feeds into counterfactual mode. If the player sees "rule 4 fired 7 times and was new," the next question is "what if I hadn't added it?" The Δ overlay annotations could serve as direct entry points into counterfactual branches: click an amber-badged decision step → "Simulate without this rule change?"

**With Rules Copy-Paste (3.07b):** If a player copied a rule from another blueprint, the Change Lens should note the copy source: "Δ ADDED (copied from Relay Beta)." This creates an attribution chain for cross-blueprint sharing.

**With Sealed Watch (locked two-act debrief):** The Change Lens is explicitly for the Inspector, not the sealed watch. This is correct — the sealed watch is emotional, the Inspector is analytical. The player watches the battle not knowing whether their changes mattered, building suspense. Then in the Inspector, they toggle Δ and the answer is revealed. The temporal separation between "watching" and "understanding" is preserved.

**With Context Overload (locked mechanic):** If a rule change contributed to a context overload event (the stunned state), the Change Lens should make this painfully visible: the amber badge on the overload event in the event log, the amber line on the context chart right at the overload spike. "Your new rule generated signals that filled the buffer — your change caused the stun."

---

## Comparable Games

**Into the Breach — Damage Preview vs. Damage Actual:** Into the Breach shows predicted outcomes before you commit. Robot Uprising's Change Lens is the inverse — showing what you changed after you committed, and linking changes to outcomes. Both close the same feedback loop from different temporal directions: preview closes it before action, diff closes it after.

**Opus Magnum — Histogram Comparison:** Opus Magnum lets you compare your solution's cost/cycles/area against community histograms. The key insight: it does not just show your score — it shows your score *relative to* something. The Change Lens applies the same principle to configurations: not just "here is your config" but "here is your config *relative to your previous config.*" Relativity creates meaning.

**Factorio — Production Statistics Graph:** Factorio's production statistics show item production over time with clear trend lines. The amber vertical lines in the Change Lens's context window chart serve the same function: temporal landmarks that partition the timeline into "before this change mattered" and "after." Factorio veterans will intuitively read these lines as "something changed here."

**Git Diff / Code Review Tools:** The entire concept of the Change Lens maps directly onto code review tools — green for additions, red for deletions, amber for modifications, side-by-side comparison. This is a deliberate 1:1 vocabulary alignment with the game's agentic AI engineering teaching mission. The player is literally doing config diff review on their agent architectures. The skill transfers directly to reviewing pull requests.

---

## Sensory Description

**The Δ Toggle Click:** A crisp, clean mechanical switch sound — like flipping a metal toggle on a control panel. 50ms, dry, no reverb. The sound signals "I am changing my analytical lens," not "I am taking an action." It is the sound of putting on a different pair of glasses.

**The Amber Wash:** When the Change Lens activates, a very fast (200ms) amber tint wave ripples outward from the Δ button across the entire sidebar. Not a full color change — a barely perceptible warm shift in the panel backgrounds, like turning on a desk lamp in a dark room. The wave signals "something is now overlaid" without disrupting readability.

**The Badge Pulse:** Each amber diamond badge on decision trace steps pulses once when first revealed — a gentle 300ms brightness oscillation from 70% to 100% and back. The pulse draws the eye to the badges without requiring the player to scan. After the initial pulse, badges are static.

**The Board Rings:** The amber rings around modified units' tiles are 2px wide, concentric with the tile border, gently glowing with a slow (2s cycle) breathing animation. They do not pulse aggressively — they breathe. The visual effect is "these units are warm, the others are cool." The player's eye naturally drifts to warm things.

**The Vertical Timeline Lines:** The amber lines on the context window chart are hairline-thin (1px) with a soft glow halo (3px gaussian blur). They look like measurement marks on a ruler. When the player hovers one, it thickens to 2px and a tooltip appears: "Δ Tick 14 — First firing of new rule 'evade when enemy_spotted within 2'."

---

## Player Journeys

### Journey: Luz, 28, Game Developer (Cebu)

**Context:** Mission 4, teaching hooks. Luz has been iterating on her Scout blueprint for three executions. She just added a new evasion rule (rule #4: "IF enemy_spotted within 2 → evade nearest") and reordered her engage rule from priority #2 to #3 because she wants evasion to trigger first. This is her fourth execute of this mission.

**Minute 0:00 — The Sealed Watch**
The tick clock fires. Luz watches her Scout navigate the board. At tick 14, an enemy striker appears adjacent — but instead of being eliminated, the Scout snaps one tile away. "YES!" Luz pumps her fist. The Scout survived. She thinks: "That was the evasion rule... right? Or did the enemy just miss?" The sealed watch continues. Her Scout survives to tick 31, relaying information that enables a successful Striker flank. Mission complete. The transition to Inspector begins — the tick clock dissolves into the timeline scrubber, the sidebar panels slide in from the right.

**Minute 0:45 — Entering the Inspector**
Luz clicks her Scout on the board. The sidebar populates: decision trace, context window chart, event log. She scrolls the decision trace looking for tick 14. She finds it: "T14 — Rule #2 matched: IF enemy_spotted within 2 → evade nearest. Action: EVADE to C4." But wait — was that rule #2 before, or did she just move it to #2? She cannot remember. She notices the Δ button in the toolbar. It is a small gray delta symbol, slightly pulsing as if inviting attention. She has seen it before but never clicked it.

**Minute 1:10 — Activating the Change Lens**
Luz clicks the Δ button. A soft mechanical "tck" sound. The amber wash ripples across the sidebar. Immediately, the rules panel lights up with annotations. Rule #2 (evade) has a blue left-edge bar — it was reordered. A tiny tooltip on hover: "Was #3, now #2." Rule #4 (the new evasion fallback) has a green left-edge bar — it is new. The rules panel header now reads "RULES Δ3" — three changes total. In the decision trace, tick 14's entry gains an amber diamond badge. In the context window chart, a thin amber vertical line appears at tick 14. On the board, her Scout has an amber breathing ring around its tile.

**Minute 1:30 — The Attribution Moment**
Luz reads the amber-badged decision trace entry: "T14 — Rule #2 matched: IF enemy_spotted within 2 → evade nearest." The amber badge tells her: this decision involved a rule she changed. She hovers the badge — tooltip: "This rule was reordered from #3 → #2 before this execute." She realizes: the evasion rule existed before, but it was lower priority. By moving it above the engage rule, it fired first when the enemy appeared. If she had not reordered, rule #2 would have been "engage nearest" — the Scout would have tried to fight an adjacent Striker and been eliminated. The reorder saved her Scout. She understands priority ordering now. Not as an abstract concept — as a lived consequence.

**Minute 2:00 — Checking the New Rule**
She scrolls down the rules panel to rule #4, the new evasion fallback. Green bar. She hovers: "NEW — Added before this execute." But the lightning bolt shows "⚡ 0" — it never fired. She realizes: rule #2 (the reordered evasion) caught all the evasion cases, so rule #4 (the fallback) never triggered. She considers removing it — it is dead weight using a slot. But she decides to keep it for now as insurance.

**Minute 2:30 — Closing the Loop**
Luz toggles the Δ off. The amber annotations vanish. She now has a clear mental model: "I made three changes. One of them — the reorder — directly saved my Scout at tick 14. The other two did not fire. Next time, I should focus on one change at a time so I can isolate the effect." She has accidentally discovered the scientific method. She returns to the Plan screen to attempt Mission 5.

**UI Annotations:**
- **Δ button:** Inspector toolbar, right of timeline controls, 24x24px, gray outline when inactive, amber fill when active, "tck" toggle sound
- **Rules panel Δ3 badge:** Top-right of rules panel header, amber circle with white "3"
- **Blue reorder bar:** 3px left-edge accent on reordered rule strip, tooltip shows old→new position
- **Green addition bar:** 3px left-edge accent on new rule strip, tooltip shows "NEW"
- **Amber decision trace badge:** 12px diamond icon, left of the step text, pulses once on reveal
- **Amber board ring:** 2px concentric ring around modified unit tile, 2s breathing animation

---

### Journey: Marcus, 42, SRE at a Cloud Company (Manila)

**Context:** Mission 7, Command agent tuning. Marcus is building a complex Command unit with 14 rules. He has been iterating for six executions on this mission. This execute, he modified 5 rules on the Command unit and 2 on the Relay. He changed the distance thresholds on three rules, deleted one rule he considered redundant, and added a new reassignment trigger.

**Minute 0:00 — Post-Sealed-Watch Frustration**
The match went badly. His Command unit issued a reassignment at tick 22 that pulled his Striker away from a crucial engagement, and the enemy base survived. Marcus enters the Inspector already suspicious: "Was that the new reassignment rule? Or did I break something with the threshold changes?"

**Minute 0:15 — Immediate Δ Activation**
Marcus clicks the Δ button the moment the Inspector loads — he is a power user now, has been using it since Mission 4. The amber wash. His Command unit's tile glows with an amber ring. His Relay also has a ring. He clicks the Command unit.

**Minute 0:30 — The Change Cascade**
The rules panel shows 5 changes: one green (new rule #11), one red ghost (deleted rule #8, struck through at 40% opacity), three amber (modified thresholds on rules #3, #5, #9). He scans the lightning bolts: rule #11 (new reassignment trigger) shows "⚡ 3." Modified rule #3 shows "⚡ 12 (was 15)." Modified rule #5 shows "⚡ 0 (was 4)." The deleted rule ghost shows "was ⚡ 6." He realizes: the deleted rule used to fire 6 times, and now nothing covers those cases. Modified rule #5 dropped from firing 4 times to zero — his threshold change was too aggressive.

**Minute 1:00 — Tracing the Bad Reassignment**
He scrubs to tick 22 in the decision trace. The entry reads: "T22 — Rule #11 matched: IF no_striker_in_range AND threat_detected → reassign nearest_striker." Amber diamond badge. He hovers: "NEW — Added before this execute." His new rule. He clicks "[Trace →]" — but he does not need it. He already sees the problem. Rule #11 fires when there is no striker nearby AND a threat is detected. But the threat was on the opposite side of the board — his Striker was correctly positioned, just not "in range" of the Command unit's perception. The reassignment pulled the Striker across the board to address a threat that his Scout was already handling.

**Minute 1:30 — The Fix Plan**
Marcus mentally drafts the fix: add a condition checking whether any ally is already engaging the threat before reassigning. He toggles Δ off, takes one more look at the clean decision trace to confirm his theory, then returns to the Plan screen. He mutters "config review" as he goes — the exact words he uses at work when reviewing Kubernetes deployment manifests. The game has successfully mapped rule-priority debugging onto his professional vocabulary.

**Minute 2:15 — Return and Execute**
He modifies rule #11 to add the "no_ally_engaging" condition, makes no other changes, and executes again. In the next Inspector, the Δ shows exactly one change: rule #11 modified, amber bar, "⚡ 1 (was 3)." The reassignment fired once, correctly, at tick 38 when there was a genuine unaddressed threat. The Command unit's behavior improved. Marcus nods. One change, one result. Clean diff, clean attribution.

**UI Annotations:**
- **Red ghost strip:** 40% opacity, struck-through text, red 3px left-edge bar, positioned at old priority slot with a thin red dashed outline where the rule used to be
- **Firing count delta:** Lightning bolt shows "⚡ 12 (was 15)" — current count with previous count in parentheses, colored green if up, red if down
- **Multi-change scan:** The player's eye moves top-to-bottom through the rules panel, reading left-edge colors: green, red, amber, amber, amber. Five seconds for a complete situational awareness scan of 5 changes across 14 rules.

---

### Journey: Aisha, 14, High School Student and First-Time Strategy Player (Davao)

**Context:** Mission 2, teaching rules. Aisha has just completed her first execution of Mission 2 with a single Scout that has 3 rules. The boot log taught her about rules. She changed one rule — modifying "IF enemy_spotted → patrol random" to "IF enemy_spotted → evade nearest" — because the boot log hinted that running away might be smarter than random patrolling when enemies appear.

**Minute 0:00 — Entering the Inspector for the Second Time**
Aisha has used the Inspector once before (Mission 1 debrief), but only to scrub the timeline. She clicks her Scout. The sidebar shows the decision trace. She reads it but is not sure how to interpret the entries. She notices the Δ button in the toolbar. It is slightly pulsing — the game's subtle attention guide for new players. She thinks: "What does that triangle thing do?"

**Minute 0:20 — First Δ Discovery**
She clicks the Δ. The mechanical "tck." The amber wash ripples. Her Scout's tile gains an amber ring. In the rules panel, rule #2 has an amber left-edge bar. She hovers it — a tooltip appears: "MODIFIED — You changed the action from 'patrol random' to 'evade nearest'." She thinks: "Oh! It is telling me what I changed. That is smart." She reads the lightning bolt: "⚡ 4." She does not immediately understand what "4" means. She hovers the lightning bolt — tooltip: "This rule fired 4 times during the match."

**Minute 0:50 — Connecting Change to Outcome**
She scrolls the decision trace, now looking for amber badges. She finds one at tick 8: "T8 — Rule #2 matched: IF enemy_spotted → evade nearest." The amber badge. She remembers tick 8 — in the sealed watch, her Scout suddenly moved away from an enemy and survived. She thinks: "That is what I changed! And it worked!" The connection is concrete: she changed "patrol random" to "evade nearest," rule #2 fired at tick 8, and her Scout evaded at tick 8. One change, one outcome, visible in one glance.

**Minute 1:15 — The Amber Line on the Chart**
She looks at the context window chart — a sparkline she mostly ignores. But now there is a thin amber vertical line at tick 8. She hovers it: "Δ Tick 8 — First firing of modified rule 'evade when enemy_spotted'." The chart suddenly makes sense as a timeline, not just a squiggly line. The amber mark is a landmark — "my change happened here." She has learned to read the context window chart, not because the game taught her, but because the Change Lens gave her a reason to look at it.

**Minute 1:40 — Toggling Off and Back**
She clicks Δ off. The annotations vanish. The Inspector returns to its clean analytical state. She clicks Δ on again. The annotations return. She does this three times, watching the amber elements appear and disappear, building her mental model of "what is baseline information vs. what is change information." She grins. She gets it. She returns to the Plan screen to try Mission 3.

**UI Annotations:**
- **Pulsing Δ button:** For new players (Missions 1-4), the Δ button has a very gentle 4s breathing pulse (opacity 70%→100%) to guide attention. The pulse stops after the player clicks it for the first time.
- **First-time tooltip:** On first Δ activation ever, a one-line tooltip fades in below the button: "Shows what you changed since your last execute." Appears for 3 seconds, never appears again.
- **Hover-everything tooltips:** Every diff annotation has a hover tooltip in plain English. No jargon. "This rule fired 4 times" not "4 evaluations matched."

---

## The TikTok Clip

Split screen. Left: the Plan screen, a player dragging a rule from position #5 to position #2 — the reorder animation, strips sliding apart, the blue insertion line. Right: the Inspector, Change Lens active, the amber badge on the decision trace entry showing that the reordered rule fired at the critical tick. The board shows the Scout surviving an encounter it would have died in. Caption: "I moved one rule up three spots and my scout lived." Duration: 8 seconds. The viewer understands that order matters — that a single drag-and-drop changed the outcome. The game's core thesis in one clip.
