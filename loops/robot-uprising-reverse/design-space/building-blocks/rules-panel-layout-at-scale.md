# 3.07a — Rules Panel Layout at Scale: The Wall of Rules Problem

## Overview

The locked spec gives a Command unit 14 buffer slots and 6 hook slots — making it the most complex blueprint in the game. A Command unit might easily have 12-20 rules (ordered condition→action pairs). The Rules UI (3.07) explores six paradigms for *constructing* rules. This document explores a different question: **what happens to the panel when there are too many rules to see at once?**

This is the "wall of rules" problem. A Scout with 4 rules fits on one screen. A Command unit with 16 rules does not. The rules panel must scale from 2 rules (Mission 1) to 20 rules (Mission 10 endgame) without breaking readability, reorderability, or the player's sense of control.

The stakes are high: rules are evaluated top-to-bottom, so **spatial position IS semantic meaning**. Any layout that obscures position obscures priority. A rule at position 3 behaves fundamentally differently from the same rule at position 12. The player must always know where every rule sits in the stack.

---

## The Core Tension

Three forces pull against each other:

1. **Visibility** — The player needs to see all rules simultaneously to understand the full decision chain. Hiding rules behind scroll or collapse means the player can't reason about the whole system at once.

2. **Readability** — Each individual rule needs enough vertical space to be parsed: condition on the left, action on the right, priority number, and any decorations (active/inactive indicators, debug overlays). Cramming rules into tiny rows makes them unreadable.

3. **Manipulability** — The player needs to drag rules to reorder them. Drag targets must be large enough for comfortable interaction. Dragging across a scrolled list is notoriously frustrating (the "scroll-while-dragging" problem).

At 4 rules, all three coexist. At 12 rules, you must sacrifice one. At 20, you must sacrifice two. The question is which.

---

## Six Layout Strategies

### Strategy A: "The Infinite Scroll" — Vertical Scrolling List

**How it works:** Rules stack vertically in a scrollable container. Each rule maintains full height (~48-64px). A scrollbar appears when the list exceeds the panel height. The panel shows approximately 8 rules at once; rules beyond that require scrolling.

**Visual description:** A vertical strip occupying the right half of the workbench. Each rule is a horizontal bar spanning the full panel width. A numbered priority badge sits on the left edge (white circle, black number — "1", "2", "3"). The condition clause fills the left portion (e.g., "IF enemy_in_buffer AND distance < 3"), the action fills the right ("THEN engage"). A thin 1px separator line between each rule. A scrollbar track on the right edge, with a proportional thumb showing how much of the list is visible. When the player scrolls to the middle, rules above and below the viewport are hidden.

**Drag reordering:** The player grabs a rule's drag handle (three horizontal lines icon on the far left). As they drag upward, the list auto-scrolls when the dragged item approaches the viewport edge. A blue insertion line shows where the rule will land. Rules below shift down with a 150ms ease-out animation.

**Strengths:**
- Simplest implementation. Every web/app framework supports scrollable lists natively.
- Each rule gets full visual treatment — no compression needed.
- Familiar pattern from every email client, task manager, and settings panel.
- Works identically at 4 rules and 40 rules.

**Weaknesses:**
- **The priority blindness problem.** When the player can only see rules 5-12, they cannot see that rule 1 (the highest-priority rule) is catching all the cases they think rule 8 should handle. This is THE critical failure mode for a game where rule ordering IS the mechanic. The player debugs rule 12 when the bug is in rule 3, which is off-screen.
- **The scroll-drag nightmare.** Dragging rule 15 to position 2 requires holding the drag, auto-scrolling up through 13 rules, and hitting a precise insertion point. This is the most hated interaction pattern in UI design. Factorio's combinator community explicitly complained about this at scale.
- **Loss of gestalt.** The player can never see the complete decision architecture. They lose the "at a glance" understanding that the locked spec demands.

**Comparable:** Email clients (Gmail, Outlook), Trello card lists, any scrollable to-do list. Gladiabots' behavior tree when it exceeds one screen. Factorio's combinator signal list before 2.0 improvements.

**Verdict:** Acceptable for casual play up to ~10 rules. Breaks badly for Command units with 15+ rules. The priority blindness problem directly undermines the core mechanic.

---

### Strategy B: "The Accordion" — Collapsible Rule Groups

**How it works:** Rules are organized into player-defined or auto-suggested groups. Each group has a header bar that collapses/expands to show/hide its member rules. Groups might be named "Movement Rules," "Combat Rules," "Communication Rules." Collapsed groups show a summary (e.g., "3 rules — highest: IF enemy_tagged THEN engage").

**Visual description:** The rules panel shows group headers as dark charcoal bars spanning the full width, with a chevron (▸ collapsed / ▾ expanded) on the left, the group name in the center ("COMBAT — 4 rules"), and a colored dot on the right indicating whether any rule in the group fired last execution (green = fired, dim = dormant). Expanding a group reveals its rules indented slightly, each with the standard condition→action layout. The collapsed state shows a single-line summary: the highest-priority rule's condition, truncated with "…" if too long.

**Drag reordering:** Rules can be dragged within a group (standard vertical reorder) or between groups (drag to a different group header to move). Groups themselves can be reordered, which moves all contained rules as a block.

**Strengths:**
- **Reduces visual noise.** A 16-rule Command unit might show 4 group headers instead of 16 rules, fitting on one screen.
- **Named groups add semantic meaning.** "Movement Rules" and "Combat Rules" help the player organize their thinking.
- **Group reordering is powerful.** Moving all combat rules above all movement rules with one drag is a huge quality-of-life feature for large configs.
- **Progressive disclosure.** New players see simple flat lists; experts organize into groups as complexity grows.

**Weaknesses:**
- **Groups are a lie.** Rules are evaluated top-to-bottom as a flat list. Groups are a visual convenience, not a semantic boundary. Rule 3 in "Combat Rules" might evaluate before Rule 1 in "Communication Rules" if the combat group is higher. This creates a mental model mismatch: the player thinks in groups, the engine thinks in flat priority.
- **The cross-group priority problem.** If "Combat" group is expanded showing rules at positions 5-8, and "Communication" group is collapsed, the player can't see that Communication rule at position 4 actually has higher priority than Combat rule at position 5. The grouping obscures the global ordering.
- **Auto-grouping is hard.** What heuristic assigns rules to groups? By action type? By condition type? By the agent it references? Any automatic grouping will feel wrong 30% of the time, forcing manual reorganization.
- **Group overhead.** Group headers consume vertical space without conveying rule information. At 4 rules, groups are worse than no groups.

**Comparable:** VS Code's collapsible editor sections. Photoshop layer groups. Obsidian's collapsible headings. Multi-expand accordions (recommended by Nielsen Norman Group for this exact use case).

**Verdict:** Appealing in theory, but the mental model mismatch between "groups" and "flat priority ordering" is dangerous. Groups imply encapsulation; priority lists require total ordering. Could work if the UI makes the global position number absolutely prominent on every rule regardless of grouping.

---

### Strategy C: "The Minimap" — Compressed Overview + Detail Panel

**How it works:** Two synchronized panels. The left panel is a compressed "minimap" showing ALL rules as thin horizontal bars (8-12px height each), color-coded by type. The right panel shows the currently selected rule(s) in full detail. Clicking a minimap bar selects it and shows full detail on the right. The minimap always shows the complete rule stack, ensuring the player can always see the global ordering.

**Visual description:** The minimap occupies a narrow column (~120px wide) on the left side of the rules panel. Each rule is a thin horizontal bar: a small priority number on the left (6pt font), then a color stripe indicating rule type (blue for movement, red for combat, green for communication, amber for meta/command), then a truncated 2-3 word summary ("enemy near → engage"). The bars are stacked top-to-bottom with 2px gaps. All 16 rules of a Command unit fit in ~200px of vertical space. The right panel (~300px wide) shows the selected rule in full resolution: complete condition tree, action details, execution statistics from last run, and context slot references.

**A faint horizontal highlight bar tracks across both panels when hovering. When the player hovers over minimap bar 7, the detail panel smoothly cross-fades to show rule 7's full contents. A blue outline marks the currently "pinned" selection (click to pin, hover to preview).**

**Drag reordering:** The player drags bars in the minimap. Because all rules are visible simultaneously, the "scroll-while-dragging" problem vanishes entirely. The dragged bar lifts with a slight shadow, other bars shift to make room, and the insertion line is always visible. Drag distance is short (moving rule 15 to position 2 requires ~150px of mouse travel in the minimap, vs. potentially 800px+ of scroll-dragging in Strategy A).

**Strengths:**
- **Solves the priority blindness problem.** All rules are always visible. The player can always see the global ordering.
- **Solves the scroll-drag problem.** Drag reordering in a compact view is fast and precise.
- **Preserves detail.** The detail panel gives full resolution for the selected rule.
- **Color-coding adds pattern recognition.** At a glance, the player sees "my first 4 rules are all combat (red), then 3 communication (green), then more combat" — revealing structural patterns in their rule ordering.
- **Execution overlays scale.** Each minimap bar can show a small pip indicating "this rule fired last tick" (bright) vs. "this rule was skipped" (dim), giving an instant visual of which rules are actually active across the whole stack.

**Weaknesses:**
- **The detail panel is one-at-a-time.** The player can't see rule 3 and rule 14 simultaneously in full detail. Comparing two distant rules requires clicking back and forth.
- **Minimap readability.** At 8-12px per bar, the summaries are tiny. Players with vision difficulties may struggle. The minimap is a reference, not a reading surface.
- **Split attention.** The player must mentally map between minimap position and detail content. This is a learned skill — not immediately intuitive for new players.
- **Doesn't help with construction.** The minimap is great for reordering and overview, but adding a new rule still happens in the detail panel. The question of WHERE in the priority order to insert requires switching attention to the minimap, finding the right position, clicking to create a gap, then switching back to the detail panel to define the rule.

**Comparable:** Code editors with minimap (VS Code). Photoshop layer panel with preview. Audio DAW track overview (Ableton's arrangement view vs. session view). Into the Breach's attack order preview.

**Verdict:** The strongest candidate for solving the wall-of-rules problem. The minimap solves both priority blindness and scroll-drag simultaneously. The one-at-a-time detail limitation is real but manageable. **This is "The Cartographer" paradigm** — you always see the whole map, and you zoom in to edit one region.

---

### Strategy D: "The Zoom Lens" — Semantic Zoom with Continuous Scale

**How it works:** A single panel that smoothly transitions between compressed and expanded views. Scroll-wheel or pinch-to-zoom changes the detail level. At maximum zoom-out, all 20 rules fit on screen as thin bars (like the minimap). At maximum zoom-in, one rule fills the entire panel with full editing UI. Intermediate zoom levels show rules at proportional detail: medium zoom shows condition keywords and action names; high zoom shows full condition trees.

**Visual description:** Imagine the rules panel as a vertical column. At zoom level 1 (most compressed): each rule is a 12px bar showing priority number and a color pip. At zoom level 2: each rule is 24px, adding a truncated condition summary ("IF enemy AND near"). At zoom level 3: each rule is 48px, showing full condition→action text in small font. At zoom level 4 (default): each rule is 64px with full-size text and drag handles. At zoom level 5 (editing): the selected rule expands to 200px+ with inline editing controls, condition dropdowns, and action configuration. The zoom transitions are smooth CSS animations (~200ms ease-in-out).

**The "focus follows mouse" variant:** As the player hovers over a rule, it smoothly expands to full detail (zoom level 4-5) while surrounding rules compress to accommodate. Rules far from the cursor compress to zoom level 1-2. This creates a "fisheye lens" effect where the player always sees the full context while getting detail at the cursor position.

**Drag reordering:** At compressed zoom levels, drag reordering works identically to the minimap. At expanded zoom levels, the panel behaves like Strategy A (scrollable list). The fisheye variant allows dragging with full context: the dragged rule is at full size, destination rules are compressed, making the target visible.

**Strengths:**
- **Continuous control over the visibility/readability tradeoff.** The player chooses exactly how much detail they need at any moment.
- **The fisheye variant is magical for experts.** Seeing full detail at cursor while maintaining global context is the holy grail of the visibility/readability tension.
- **Natural mapping to mouse wheel.** Zoom is an intuitive metaphor. Pinch-to-zoom works on trackpads and touch.
- **Graceful scaling.** 4 rules at default zoom. 12 rules? Zoom out one notch. 20 rules? Zoom out two notches. The panel never "breaks."

**Weaknesses:**
- **Fisheye is disorienting.** The fisheye lens effect causes surrounding rules to shift position as the player moves their cursor. This means the priority number of rule 8 might be at pixel 200 one moment and pixel 180 the next. Spatial memory breaks when positions aren't stable.
- **Zoom level management is cognitive load.** The player must now manage BOTH their rule configuration AND their view configuration. In a game that's already about managing attention systems, adding view management is meta-ironic but potentially overwhelming.
- **Implementation complexity.** Smooth semantic zoom with variable-height elements, drag reordering, and fisheye effects is a significant engineering challenge in React.
- **Screenshot/streaming unfriendly.** A fisheye view looks bizarre in a screenshot. Viewers can't easily read the rules panel in a stream if it's constantly shifting.

**Comparable:** macOS Dock magnification. Google Maps semantic zoom (buildings appear at certain zoom levels). Prezi's infinite canvas. Research paper: "Table Lens" by Rao & Card (1994) — the original fisheye table.

**Verdict:** The fisheye variant is too chaotic for a game where spatial position is semantic. The manual zoom variant is workable but adds cognitive overhead. Best used as a secondary feature ("Ctrl+scroll to zoom the rules panel") rather than the primary interaction model. **This is "The Microscope" paradigm** — powerful but requires the player to manage their own optics.

---

### Strategy E: "The Priority Ruler" — Fixed-Position Numbered Slots

**How it works:** The rules panel has a fixed number of visible slots (e.g., 16), always displayed, regardless of how many are filled. Empty slots show dashed outlines. Each slot has a prominent priority number baked into the panel layout. Slots are not scrollable — they are fixed positions in a grid. If the player needs more than 16 rules, they cannot have them. The slot count IS the constraint.

**Visual description:** A vertical ruler runs down the left edge of the rules panel, with numbered positions: 1, 2, 3, ... 16. Each position is a fixed-height row (40px). Filled slots show the rule content: condition→action text with type color-coding. Empty slots show a dashed outline with a "+" icon centered in the row. The ruler numbers are always visible, always stable, never moving. The font for priority numbers is larger (18pt bold) than the rule content (12pt regular), emphasizing position.

**The visual weight hierarchy is: position number (heaviest, always visible) > rule type color (second, always visible) > rule content text (third, visible at default view) > execution stats overlay (lightest, visible on hover).**

At 16 slots × 40px = 640px total. This fits comfortably in a standard 1080p workbench panel (the panel is approximately 400-500px wide, 700-900px tall). At 20 slots the vertical space tightens — 800px. Each rule row must compress to 36px to fit, which is tight but workable.

**Drag reordering:** The player grabs a filled slot and drags to another position. Because all positions are fixed and visible, the interaction is identical to reordering items in a visible numbered list — no scrolling, no hidden targets. When a rule is dragged from position 5 to position 2, rules 2-4 shift down by one position with a cascading 100ms animation. The priority numbers re-assign instantly.

**Strengths:**
- **Position is always visible.** The player never loses track of priority ordering. The numbered ruler is the panel's backbone.
- **No scroll, no collapse, no zoom.** One interaction model for all rule counts. Maximum simplicity.
- **Empty slots communicate capacity.** The player sees "I have 3 empty slots left" immediately. This dovetails with the locked spec's hard slot limit philosophy.
- **The constraint is the mechanic.** Having a maximum of 16 rules forces the player to write concise, well-ordered rules rather than exhaustive rule lists. This echoes Shenzhen I/O's instruction limit — the constraint IS the puzzle.
- **Stable spatial memory.** Rule 7 is always at the same vertical position. After 10 minutes of play, the player develops muscle memory: "my main combat rule is about 40% down the panel."

**Weaknesses:**
- **40px per rule is tight.** A complex condition→action pair might need 80px to display comfortably. Truncation is inevitable for long conditions. The player may need to click/hover to see the full rule text.
- **Fixed count is arbitrary.** Why 16? Why not 12 or 20? The number must be justified by game design, not UI convenience.
- **Wasted space for simple units.** A Scout with 4 rules wastes 12 empty slots. This might feel barren rather than inviting.
- **Doesn't scale to truly massive configs.** If a future expansion adds unit types with 30+ rules, the paradigm breaks.

**Comparable:** Shenzhen I/O's instruction editor (fixed 14-line programs). TIS-100's 15-instruction limit per node. Guitar Hero's note highway (fixed lanes, scrolling content). A physical card holder with numbered pockets.

**Verdict:** The most opinionated design, and potentially the most elegant. By making the slot count a hard game mechanic (not just a UI decision), Strategy E turns the layout problem into a design feature. The Scout gets fewer rule slots because it's a scout. The Command unit gets more because it's a commander. **This is "The Rack" paradigm** — fixed slots, visible capacity, constraint as design.

---

### Strategy F: "The Split Screen" — Top/Bottom Priority Zones

**How it works:** The rules panel is divided into two visible zones: a "high priority" zone (top half, always visible, showing rules 1-8) and a "low priority" zone (bottom half, always visible, showing rules 9-16). A visual divider separates them — a thicker line with a label like "FALLBACK RULES BELOW." The zones communicate that high-priority rules are the main decision logic, and low-priority rules are fallbacks that fire only when nothing above matches.

**Visual description:** The rules panel has two stacked sub-panels separated by a 4px amber line with the text "— FALLBACK —" centered in small caps. The top zone has a slight warm-white background tint; the bottom zone has a slightly cooler gray tint. Priority numbers in the top zone are bold; in the bottom zone they are regular weight. The visual distinction teaches the player that position matters — rules near the top of the panel fire first, and the division reinforces the priority cascade concept.

Each zone scrolls independently if needed (4+ rules per zone start scrolling within that zone). This limits scroll-drag distance: the worst case is dragging from position 8 to position 1 (within one zone), never from position 16 to position 1 (across the full list).

**Cross-zone promotion/demotion:** A rule can be promoted from the fallback zone to the priority zone via a context menu action ("Move to High Priority") or by dragging across the divider. The divider line briefly pulses amber when a rule crosses it, and the moved rule gets a 300ms entrance animation (slide-in from below or above).

**Strengths:**
- **The priority/fallback distinction is pedagogically powerful.** New players immediately understand that top rules matter more. The visual hierarchy teaches the core mechanic without explanation.
- **Limits scroll distance.** Two shorter scrollable zones are better than one long one. The scroll-drag problem is halved.
- **Independent scrolling preserves partial context.** The player can scroll through fallback rules while keeping high-priority rules visible, maintaining the most important context.
- **Natural difficulty ramp.** Missions 1-4 might only use the high-priority zone. The fallback zone unlocks when Command agents appear, adding depth without front-loading complexity.

**Weaknesses:**
- **The boundary is arbitrary.** Rules 8 and 9 have adjacent priority, but the visual treatment implies a significant gap. This can mislead players into thinking there's a functional barrier between zones.
- **Two scroll contexts are confusing.** "Am I scrolling the top zone or the bottom zone?" depends on cursor position. Accidental scrolling in the wrong zone is likely.
- **Doesn't solve the fundamental problem.** At 10 rules per zone, each zone has the same scroll issues as Strategy A. The split only helps if each zone stays under ~8 rules.
- **The "fallback" framing may be wrong.** Not all low-priority rules are fallbacks. Rule 12 might be a critical safety net ("IF about_to_die THEN evade") that's low priority because it should only trigger when nothing else matches. Calling it a "fallback" diminishes its importance.

**Comparable:** Email inbox with "Priority" and "Other" tabs (Outlook Focused Inbox). Kanban boards with "To Do" and "Backlog" columns. Music production with "main" and "aux" tracks.

**Verdict:** Pedagogically interesting but mechanically misleading. The hard boundary at a specific position number creates a false dichotomy. Could work as a visual hint (subtle color gradient from warm to cool as you go down the list) rather than a hard split. **This is "The Horizon" paradigm** — above the line is foreground, below is background.

---

## The Recommended Hybrid: "The Cartographer's Rack"

The strongest design combines **Strategy C (Minimap)** with **Strategy E (Fixed Slots)**:

**The main panel** uses fixed numbered slots (Strategy E). Command units get 16 slots. Scouts get 6 slots. The slot count is a game mechanic, not a UI limitation. Each slot is 40px tall with truncated condition→action text.

**The minimap sidebar** (Strategy C) shows all slots as color-coded thin bars in a narrow column (~80px) to the left of the main panel. The minimap is redundant with the main panel at low rule counts, but becomes essential at 12+ rules when the main panel's fixed-height slots pack tightly.

**The detail flyout** appears when the player clicks a rule in either the main panel or the minimap. It opens as a right-side overlay panel (~350px wide) showing full rule editing UI: condition builder, action selector, execution history, and context slot references. The flyout doesn't displace the main panel — it overlays the blueprint editor's other sections temporarily.

**Execution overlay:** After each sealed watch + inspector cycle, the minimap bars show execution heat: bright bars for rules that fired frequently, dim bars for rules that rarely fired, and a red outline for rules that NEVER fired across the entire match. This "dead rule" indicator is the player's first diagnostic: "Why didn't rule 14 ever fire?"

**Visual description of the complete Cartographer's Rack at 16 rules:**

The left edge of the rules panel has an 80px minimap column. Sixteen thin bars (10px each, 2px gap) stack vertically, each showing a priority number (6pt) and color stripe (blue/red/green/amber). A faint blue highlight follows the cursor vertically across the minimap.

To the right of the minimap, the main panel has 16 numbered slots spanning ~350px. Each slot is 40px tall: a large priority number (18pt bold) on the left edge, then the rule content in medium text (12pt). Long conditions are truncated with "…" — hover reveals a tooltip with the full text. Empty slots at the bottom show dashed outlines with "+" icons.

The minimap's execution heat overlay: after battle, each bar glows proportionally to how often it fired. Bar 1 might be bright white (fired every tick). Bar 8 might be medium blue (fired 30% of ticks). Bar 14 might be barely visible (fired once). Bar 16 might have a pulsing red outline (never fired — dead rule alert).

---

## Player Journeys

### Journey: Tomás, 16, First Time Building a Command Unit

**Context:** Mission 6. Tomás has been playing for 3 hours across missions 1-5. He's comfortable with Scouts (4 rules) and Strikers (6 rules). This is the first mission that introduces the Command unit with its 14-slot context window and 6 hook slots. The boot log has just explained "Your Command unit doesn't fight — it thinks about fighting."

**Minute 0:00 — The Empty Rack**
Tomás opens the Command blueprint editor. The rules panel appears on the right side of the workbench. It's... enormous. Sixteen numbered slots, mostly empty, stretching down the panel. The minimap on the left shows sixteen thin dashed outlines. Only slots 1-3 are pre-filled (the mission's starter rules: "IF tick = 1 THEN reroute scout-alpha to north," "IF enemy_count > 3 THEN reassign striker to engage," "IF ally_damaged THEN prioritize heal signal").

He reads the three starter rules. They're longer than Scout rules — two conditions each, and the actions reference other units by name. The priority numbers 1, 2, 3 are large and bold on the left. The remaining 13 slots are dashed outlines, each with a small "+" icon. The minimap shows three bright bars at the top and thirteen dim dashed lines below.

"That's... a lot of empty slots."

**Minute 0:30 — First Rule Addition**
Tomás clicks the "+" in slot 4. The detail flyout slides in from the right, showing the rule builder. He constructs: "IF buffer_full THEN compress." The flyout shows a preview — a condition dropdown (IF), a context selector (buffer_full), an action dropdown (THEN compress). He confirms, and slot 4 fills in. The minimap's fourth bar turns green (communication type). The main panel shows "IF buffer_full → compress" in medium text.

He adds two more rules in slots 5 and 6. The panel now has 6 rules — same as a Striker. Comfortable. The minimap shows 6 colored bars: the pattern is red, red, green, green, blue, blue. "Two combat, two communication, two movement."

**Minute 2:00 — First Reorder**
Tomás realizes his "IF ally_damaged THEN heal" rule should be higher priority than his combat rules. It's currently at position 3. He grabs the drag handle on rule 3 in the main panel and drags it up — past rule 2 (which shifts down with a satisfying slide animation) — and drops it at position 1. The priority numbers reassign: what was rule 3 is now rule 1. The minimap bars rearrange simultaneously, the green bar jumping to the top.

"Oh — that changes which one runs first. The top one always gets checked first." The penny drops about priority ordering.

**Minute 4:00 — The Growth Spurt**
Over the next few minutes, Tomás adds rules 7 through 11. The panel fills up. The minimap becomes useful for the first time — he can see the color pattern at a glance. "Lots of red at the top [combat], green in the middle [communication], blue at the bottom [movement]." He notices rule 9 and rule 11 are both blue movement rules but separated by a green rule at position 10. He wonders if that matters.

He clicks rule 10 in the minimap. The detail flyout shows it's "IF signal_received(recon-net) THEN relay to command-net." He decides this should be lower priority. He drags minimap bar 10 down to position 12 — a short, precise drag with no scrolling needed. The bars rearrange. Now his movement rules (9 and 11) are adjacent. "Better."

**Minute 6:00 — The First Execute**
Tomás hits EXECUTE with 12 rules configured. The sealed watch plays. Afterward, in the Inspector, he returns to the workbench. The minimap has changed: rules 1, 2, 5, and 7 glow bright — they fired frequently. Rules 3, 8, 10, and 11 are medium brightness. Rules 4, 6, 9, and 12 are dim — they barely fired. And rule 12, the one he just moved down, has a faint red outline: it never fired at all.

"Wait — rule 12 never ran? Did I put it too low?" He clicks the red-outlined bar. The detail flyout shows: "0 activations. Condition never matched: no signal_received(recon-net) events occurred." The problem isn't priority — it's that the signal channel doesn't exist yet. He needs to set up the hook first.

**Minute 7:00 — Resolution**
Tomás grins. The dead rule indicator taught him something about hooks and rules interacting. He opens the hook editor to create the missing channel, then returns to rules. He has 12 rules on a Command unit and it feels manageable — the minimap shows the whole structure, the main panel shows the details, and the execution overlay tells him what's working.

**UI Annotations:**
- Minimap column: 80px wide, left edge of rules panel. Each bar 10px tall, 2px gap. Color-coded by rule type.
- Main panel: 350px wide, right of minimap. Fixed 40px slots with 18pt bold priority numbers.
- Detail flyout: 350px wide overlay from right edge. Slides in on click (200ms ease-out). Contains rule builder UI.
- Drag interaction: Either panel supports drag. Minimap drags are shorter distance. Both panels update simultaneously.
- Execution overlay: Post-battle, minimap bars show brightness proportional to activation count. Red outline = 0 activations (dead rule).

---

### Journey: Dr. Suki, 42, Information Architect, Mission 9 Veteran

**Context:** Mission 9. Dr. Suki has been playing for 15 hours. She builds elaborate Command architectures with 18-20 rules. She treats rule ordering as an art form — her Command units have carefully crafted priority chains where the top 5 rules handle emergencies, the middle 8 handle normal operations, and the bottom 5 are cleanup/fallback logic. She thinks in terms of "rule tiers."

**Minute 0:00 — The Maximalist Setup**
Dr. Suki opens her Mission 9 Command blueprint. 18 rules. The main panel is packed — each slot at 40px means 720px of rules. The minimap is essential: she barely looks at the main panel anymore. The minimap shows her rule structure as a recognizable pattern: five bright red bars at the top (emergency tier), a thin visual gap, eight mixed-color bars in the middle (operational tier), another gap, five green/blue bars at the bottom (fallback tier).

She's memorized the pattern. "The silhouette is right." She can tell if her Command config is healthy just by glancing at the minimap's color distribution — the way a doctor reads a waveform.

**Minute 0:15 — The Diagnostic Pass**
Before today's iteration, she reviews last mission's execution overlay. The minimap still shows heat from Mission 8's final run. She studies the brightness distribution: rules 1-3 (emergency) are medium-bright — "Good, emergencies happened but not constantly." Rules 6-8 (core operations) are blazing bright — "As expected, the workhorse rules." Rule 13 is dead (red outline). Rule 17 is dead.

Two dead rules. She clicks rule 13 in the minimap. The detail flyout shows: "IF command_override_active THEN suppress ally_signals." Zero activations because she never activated command_override in Mission 8. This is intentional — it's a contingency rule. She right-clicks and marks it "Expected Dormant" (a small ❄️ icon replaces the red outline). The minimap bar turns cool blue instead of red.

Rule 17 is different: "IF tick > 80 THEN switch_to_aggressive." The mission ended at tick 67. The rule was never reached. She decides to lower the tick threshold: clicks rule 17, edits in the flyout, changes 80 to 50. The flyout confirms. She doesn't move it in priority — position 17 is correct for a late-game stance shift.

**Minute 1:00 — The Priority Inversion Fix**
She spots something in the minimap: rule 11 (amber/command color) and rule 12 (red/combat) are adjacent. She knows from experience that command-type rules and combat-type rules shouldn't be adjacent at this priority level — command rules are expensive (4 energy/tick) and might prevent the cheaper combat rule from firing if they share trigger conditions.

She clicks rule 11 in the minimap to read it. Then clicks rule 12. Back to 11. Back to 12. This is the "comparing two rules" workflow — the detail flyout shows one at a time, and she's clicking between them rapidly.

"I wish I could pin two rules for comparison." She can't — this is the one-at-a-time limitation of the Cartographer design. Instead, she uses a workaround: she memorizes rule 11's condition ("IF enemy_cluster_detected AND relay_count > 2 THEN deploy_jammer"), then clicks rule 12 ("IF enemy_cluster_detected AND striker_available THEN coordinate_strike"). They DO share a trigger condition. She swaps them — dragging rule 12 above rule 11 in the minimap (one bar of mouse travel). Now the cheaper combat response has priority over the expensive command action.

**Minute 2:30 — The New Rule Insertion**
She needs to add a new rule between positions 6 and 7. She clicks the empty slot 19 (the first available empty slot). The detail flyout opens, she builds the rule: "IF scout_eliminated AND no_vision_north THEN reassign relay to scout_role." She confirms. The rule appears at position 19.

Now she drags it from the minimap — position 19 to position 7. A long drag (12 positions), but in the minimap it's only ~130px of mouse travel. The bars between 7 and 18 each shift down by one slot. The cascade animation plays like dominoes falling. The new rule settles into position 7, bright and fresh among the established operational tier.

"Twelve positions in one drag. No scrolling." She smiles.

**Minute 4:00 — Resolution**
Dr. Suki runs EXECUTE. During the Inspector debrief afterward, she checks the minimap overlay. The new rule 7 fired twice — both times when a scout was eliminated. "Good. It works." The dead rules from before are now categorized: one expected-dormant contingency, one threshold-adjusted late-game rule. Her silhouette is clean.

She screenshots the minimap for her personal design notes. The color pattern is her architectural signature — recognizable at thumbnail size.

**UI Annotations:**
- Expected Dormant marker: Right-click context menu on dead-rule-outlined minimap bars. Shows ❄️ icon, bar turns cool blue. Player acknowledges the rule is intentionally dormant.
- Cross-rule comparison: Currently one-at-a-time in detail flyout. Workaround: rapid clicking between two bars. Gap: no "pin two for side-by-side" feature.
- Cascade drag animation: When a rule moves many positions, each displaced bar shifts down with staggered 50ms delay, creating a domino cascade effect. Total animation time: 50ms × displaced count. 12 displaced bars = 600ms total cascade.
- Minimap screenshot: The minimap's compact, colorful format is naturally screenshot-friendly and shareable.

---

### Journey: Leo, 28, Twitch Streamer, First Look at a Viewer-Submitted Config

**Context:** Leo is a variety streamer doing a "community configs" segment where viewers submit Command unit configurations and Leo analyzes them on stream. He's looking at a viewer-submitted 19-rule Command unit for Mission 10.

**Minute 0:00 — The Import**
Leo loads the viewer's config. The rules panel populates: 19 of 20 slots filled. The minimap lights up — it's a wall of color. Leo leans back from the screen, squinting at the minimap.

"Chat, look at this minimap. Red, red, red, red, amber, red, red, green, amber, blue, red, green, green, red, blue, amber, green, blue, red. That's NINETEEN rules. And look at the pattern — red is scattered EVERYWHERE. This person has combat rules at positions 1, 2, 3, 4, 6, 7, 11, 14, 19. Chat, why would you put a combat rule at position 19? That's LAST. It will literally never fire."

The chat explodes with speculation. Leo clicks rule 19 in the minimap: "IF surrounded AND no_escape_route THEN self_destruct." Chat goes wild: "IT'S A LAST RESORT SELF-DESTRUCT!"

**Minute 0:45 — The Diagnostic Read**
Leo runs the config against Mission 10's scenario. After the sealed watch, the execution overlay loads on the minimap. He reads it top to bottom for the stream:

"Rule 1 — blazing bright. Rule 2 — medium. Rule 3 — bright. Rules 4 through 7 — medium. Rule 8 — DIM. Rule 9 — dim. Rules 10 through 14 — most of these are dim. Rule 15 through 18 — ALL dead, chat. Four dead rules with red outlines. And rule 19 — the self-destruct — it actually FIRED ONCE. It's brighter than the four above it!"

He clicks the dead rules one by one in the minimap, reading their conditions to chat. "Rule 15: 'IF victory_imminent THEN celebrate.' Chat, it's a CELEBRATE rule and they were LOSING. Rule 16: 'IF all_enemies_tagged THEN full_assault.' They never tagged all enemies. Rule 17: 'IF relay_count > 5 THEN create_mesh_network.' They only had 2 relays!"

The chat sends alternating "KEKW" and genuinely insightful suggestions. A viewer points out: "rule 17 should be an aspiration rule that triggers the production queue to BUILD more relays, not a rule that waits for relays that don't exist."

**Minute 2:00 — The Live Fix**
Leo decides to fix the config on stream. He starts with the dead rules. "Chat, we're keeping the self-destruct — that's iconic. But these other four dead rules? We're either fixing or deleting."

He deletes rules 15 and 16 by clicking the "×" button on their main panel slots. The slots clear to dashed outlines. The minimap bars disappear, and rules below shift up. 19 rules → 17.

He edits rule 17 (formerly 17, now 15 after deletion): changes "IF relay_count > 5" to "IF relay_count < 3 THEN request_relay_production." Now it's an actionable early-game rule. He drags it from position 15 up to position 8 in the minimap — "this should fire EARLY, not late."

"Look at the minimap now, chat. Cleaner. The combat red is still scattered but the dead rules are gone. Let's run it again."

**Minute 4:00 — Resolution**
Second run. The execution overlay shows a healthier distribution: fewer dead rules, more even brightness across the stack. The modified rule 8 fired three times. "Chat, that relay request rule is actually working. The viewer's config just needed some pruning."

Leo screenshots the minimap before and after. "Look at this glow-up. Left side is the original — four dead rules at the bottom. Right side is our fix — no dead rules and a better spread." Chat votes on which fix was best. Leo names the fixed config "ChatGPT's Revenge" and uploads it to the community workshop.

**UI Annotations:**
- Delete affordance: Small "×" button appears on hover, right edge of main panel slot. Click to delete with confirmation ("Delete rule 14? Priority numbers will shift."). Minimap bar fades out (200ms), lower bars slide up (150ms cascade).
- Slot renumbering: After deletion, all lower rules renumber instantly. Minimap bars shift position. No "gaps" in the priority sequence — deletion always compacts.
- Before/after screenshot: The minimap's compact visual format makes side-by-side comparison natural. A "snapshot" button could save the current minimap state for comparison after changes.

---

## Interaction Effects

### With Rule Conflicts (3.06)
The minimap can visualize rule conflicts: when two rules have overlapping conditions but different actions, a thin red connection line appears between their minimap bars. At 16+ rules, conflict visualization in the minimap becomes a tangle — but the minimap is small enough that tangles are visible rather than hidden.

### With Inspector (Locked — Inspector Screen)
The Inspector's "decision trace" shows which rule fired at each tick. The minimap's execution overlay is the PLAN-SCREEN VERSION of this same data — a preview that says "here's what happened in aggregate" before the player opens the Inspector for tick-by-tick detail.

### With Hook Visualization (3.10)
Rules reference hook channels. The detail flyout should show which hooks a rule depends on (conditions that check for signal_received) and which hooks it triggers (actions that send signals). This connects the rules panel to the hook/channel visualization.

### With Context Config
Rules evaluate context window contents. The detail flyout should indicate which context slots a rule's conditions reference. If a rule checks "IF enemy_in_buffer," the flyout shows which buffer slot types could satisfy this condition. This makes the rules panel a lens into the context config.

### With Sealed Watch
During sealed watch, the player cannot interact with the rules panel. But AFTER sealed watch, returning to the plan screen reveals the execution overlay on the minimap — the first thing the player sees is which rules worked and which didn't. This creates a natural diagnostic flow: see the problem (sealed watch) → see the symptoms (execution overlay) → investigate (Inspector) → fix (edit rules).

### With Onboarding (Missions 1-4)
Missions 1-4 use pre-placed units with pre-filled rules. The rules panel in these missions is read-only, but the minimap still shows the pattern. The player learns to read the minimap's color pattern before they learn to write rules. This is the "read before write" principle from Gladiabots' onboarding.

---

## Comparable Games Deep Dive

### Gladiabots' Behavior Tree at Scale
Gladiabots allows arbitrarily large behavior trees, but the community discovered that keeping AIs simple is critical for maintenance. The Steam discussion thread "Not So Fun For People That Program For A Living" highlights that experienced programmers try to build complex trees and lose track of execution flow. The game's tree view works at small scale but becomes "visual spaghetti" at 30+ nodes. Robot Uprising's fixed-slot approach avoids this by making complexity a constrained resource.

### Factorio's Combinator GUI
Factorio's combinator system suffered from scaling issues — community discussions on "Combinator scalability and maintainability" describe the physical size of combinator chains becoming unmanageable. Factorio 2.0 addressed this with multi-condition combinators (compressing chain length) and inline signal value display (reducing the need to close the GUI to check state). Robot Uprising should learn: inline state display in the rules panel prevents the "close panel, check state, reopen panel" cycle.

### Shenzhen I/O's Fixed Instruction Editor
The closest precedent. Shenzhen I/O gives each chip a fixed number of instruction lines (14). The editor is a fixed-height panel. Empty lines are visible. The instruction count IS the constraint. Players learn to write tight, efficient code because the editor makes waste visible. Robot Uprising's "Rack" paradigm directly inherits this design principle.

### Into the Breach's Attack Order
Into the Breach shows the complete enemy attack order in a compact sidebar. Each enemy action is a small icon with an arrow showing the target. The player can see all 5-8 pending attacks simultaneously. This "small but complete" approach is the minimap philosophy applied to turn planning.

---

## Sensory Description

**The Cartographer's Rack at rest (0 rules executed):** The rules panel is a calm, structured grid. Dark background (#1a1a2e). The minimap column on the left is a vertical track of thin dashed outlines — like an empty DNA gel lane waiting for samples. The main panel's numbered slots march down the right side, each number in a cool silver (#8892b0) that doesn't compete for attention. Empty slots have a subtle dotted border (#2a2a4e) that implies "fill me." The "+" icons in empty slots are the same silver, barely visible until hovered, when they brighten to white.

**The Cartographer's Rack under construction (8 of 16 filled):** The top half of the minimap glows with activity — blue and red and green bars stacked like a tiny flag. The bottom half remains dashed outlines. Each filled bar has a faint inner glow matching its type color. The main panel shows rule text in a clean monospace font: conditions in a slightly brighter white, actions in a slightly dimmer cyan. The "→" arrow between condition and action pulses once when a rule is newly added (a heartbeat of creation).

**The Cartographer's Rack after battle (execution overlay active):** The minimap transforms. Bright bars burn like a spectral analyzer — rule 1 is white-hot, rule 5 is warm amber, rule 12 is barely a smolder. Dead rules have a slow-pulsing red outline (1Hz pulse, like a warning light). The overall effect is an EKG readout: you can see the heartbeat of your decision architecture. Healthy configs have a smooth falloff from top to bottom (high-priority rules fire most). Sick configs have dead zones in the middle (rules that should fire but don't) or surprisingly bright low-priority rules (fallbacks doing too much work).

**Audio:** When adding a rule to an empty slot: a soft "click" like a circuit board component seating into its socket. When dragging a rule in the minimap: a subtle "slide" sound, pitch rising when moving to higher priority, falling when moving to lower. When the execution overlay loads post-battle: a quiet "reveal" sound — a rising shimmer, like pulling back a curtain — as the brightness values fade in over 500ms. Dead rule pulse: a low, soft warning tone, barely audible, like a heart monitor flatline heard through a wall.

---

## The TikTok Clip

A 15-second clip: The screen shows a Command unit's minimap after a catastrophic loss. The bottom 6 rules all glow red (dead). The player grabs the dim rules in the minimap and drags them up — one by one — past the bright rules, reordering the entire priority chain in rapid succession. Each drag triggers the domino cascade animation. The minimap's color pattern transforms from "scattered mess" to "clean gradient." Cut to: the same battle replayed with the fixed config. Victory. The minimap post-battle glows evenly — no dead rules. Text overlay: "Same rules. Different order. Different outcome."

The message: **In this game, the order of your thoughts determines whether you win or lose.**

---

## New Aspects Discovered

- **3.07a-i — Cross-rule comparison in the detail flyout:** The Cartographer's Rack shows one rule at a time in the detail panel. Dr. Suki's journey reveals the pain of comparing two distant rules. Design a "pinned comparison" mode that shows two rules side-by-side in the flyout — split-screen detail view, diff highlighting for shared conditions, conflict indicator.
- **3.07a-ii — The "Expected Dormant" rule annotation system:** Dr. Suki marks contingency rules as intentionally dormant to suppress false dead-rule alerts. Full design: annotation types (expected dormant, threshold-dependent, aspirational), visual markers, persistence across sessions, interaction with Inspector diagnostics.
- **3.07a-iii — Execution overlay as difficulty-adaptive teaching tool:** The overlay teaches different things at different player stages. New players learn "dead rules exist." Intermediate players learn "priority ordering affects firing frequency." Experts learn "activation distribution reveals architectural health." How does the overlay's visual vocabulary evolve across 10 missions?
- **3.07a-iv — The minimap as shareable "config silhouette":** Streamers and community members screenshot minimaps as architectural signatures. Design a formal "silhouette export" — a compact image of the minimap state (pre- or post-battle) that serves as a thumbnail for shared configs. The silhouette as the "album cover" of a blueprint.
- **3.07a-v — Adaptive slot counts per unit type as balance lever:** The Rack paradigm makes slot count a game mechanic. What if slot counts are unlockable? A Scout starts with 4 rule slots and unlocks up to 8 through campaign progression. Interaction with skill acquisition (3.03) and meta-progression (5.04).
