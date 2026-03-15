# 3.07 — Rules UI: How the Player Writes, Edits, and Reorders Rules

## Overview

The rules language (3.05) defines the grammar. The conflict model (3.06) defines what happens at runtime. This document explores the **physical interaction design** — how the player's hands, eyes, and attention move through the workbench as they build, modify, and debug a rule list.

The locked spec says: "rules as ordered condition→action pairs" in the Config panel. The Skill UI (3.04) established a precedent for progressive paradigms with immediate board feedback. The Rules UI must do more: rules are the most complex primitive. A Scout with 2 skills and 2 hooks might have 4-8 rules. A Command unit might have 12-20. The UI must scale from "first rule in 10 seconds" to "reorder 15 rules with full confidence in 2 seconds."

The core question: **how does the player physically construct a condition→action pair, and how do they physically reorder the priority list?**

---

## The Six Paradigms

| Paradigm | Construction Model | Reordering | Complexity | Learning Curve | Comparable |
|----------|-------------------|------------|-----------|----------------|------------|
| **A. The Sentence Strip** | Drag tokens into a sentence template | Drag strips vertically | Low-Medium | 30 seconds | Gladiabots, IFTTT |
| **B. The Dropdown Grid** | Select from cascading dropdown menus | Drag row handles | Low | 15 seconds | Spreadsheet data validation |
| **C. The Card Stack** | Assemble condition/action card halves | Drag cards in a vertical stack | Medium | 1-2 minutes | Slay the Spire deck order, MTG stack |
| **D. The Flow Lane** | Connect condition nodes to action nodes with wires | Vertical lane ordering | High | 5-10 minutes | Unreal Blueprint lite |
| **E. The Natural Language Bar** | Type quasi-natural-language, autocomplete parses it | Drag parsed strips | Medium | 2-3 minutes | Slack slash commands, VS Code command palette |
| **F. The Progressive Template** | Pre-built templates → editable strips → raw construction | Evolves with player | Adaptive | 10 sec → 5 min | Factorio copy-paste → custom |

---

## Paradigm A: The Sentence Strip

**Philosophy:** Each rule is a horizontal strip that reads like a sentence. The player builds the sentence by snapping tokens into slots. Left side = condition clause. Right side = action clause. The strip reads left-to-right as "WHEN [condition] → DO [action]." Priority is the vertical order of strips — top strip fires first.

### Mechanical Specification

Each rule strip has two zones:

```
┌─────────────────────────────────────────────────────────────┐
│  ≡  │ WHEN  [enemy_spotted ▾] [within 3 ▾]  →  DO [engage ▾] [nearest ▾] │  ⓘ  🗑 │
└─────────────────────────────────────────────────────────────┘
```

- **≡** — Drag handle. Grab to reorder vertically.
- **WHEN / DO** — Fixed labels, not editable. They anchor the sentence.
- **[token ▾]** — Clickable token slots. Click to open a radial menu of options. Each slot has a type: signal type, distance qualifier, action verb, target specifier.
- **ⓘ** — Info icon. Hover to see a natural-language expansion: "When an enemy is spotted within 3 tiles, engage the nearest one."
- **🗑** — Delete this rule.

Below the rule list: a **[+ Add Rule]** button that creates a new blank strip at the bottom with placeholder tokens pulsing gently.

### Token Radial Menu

Clicking a token slot opens a **radial menu** centered on the token. The radial has 4-8 wedges, each labeled with an option icon and short text. For condition signal types: ENEMY_SPOTTED (yellow diamond icon), ALLY_SIGNAL (green circle), RESOURCE_NEARBY (blue hexagon), THREAT_DETECTED (red triangle), BUFFER_FULL (orange thermometer), CHANNEL_MESSAGE (purple broadcast icon), NO_SIGNAL (gray dash).

The radial appears with a subtle pop animation (scales from 0→100% in 150ms, slight overshoot). Hovering a wedge makes it glow brighter and shows a tooltip with a one-sentence description. Selecting a wedge snaps the token into place with a satisfying magnetic click sound — a soft "tchk" like a Lego brick seating.

### What It Looks Like

The rules panel occupies the right side of the workbench, below the skills toggles and above the hooks config. The panel header reads "RULES" in the same monospace font as the boot log, with a small "4/8" indicator showing current count vs maximum.

Each strip is 40px tall with rounded corners. The background color shifts slightly by rule index — alternating charcoal (#2a2a3a) and slate (#32324a) — to visually separate strips. The WHEN zone has a faint left-edge accent line in amber. The DO zone has a faint right-edge accent in cyan. This color-coding reinforces the condition/action split without being distracting.

When the player drags a strip to reorder, the other strips animate apart — a smooth 200ms slide creating a gap where the dragged strip will land. A subtle blue insertion line appears. The ghost of the dragged strip is slightly transparent (70% opacity) and tilted 2 degrees to suggest motion. Dropping plays a soft "thunk" — like placing a tile on a wooden board.

### Board Feedback

Every rule change triggers an immediate ghost preview on the 8x8 board. If the player changes a rule's condition from ENEMY_SPOTTED to RESOURCE_NEARBY, the scout's ghost on the board shifts its patrol visualization from a combat-oriented path to a resource-seeking sweep. The ghost flickers briefly (300ms) to draw the eye, then settles into the new preview.

When the player reorders rules, the board shows the **dominant behavior** — the highest-priority rule that would fire in the "default" starting state — highlighted with a pulsing colored ring around the ghost unit. Reorder the rules and the ring color shifts to match the new top-priority action.

### Strengths
- **Reads like language.** Even non-gamers can parse "WHEN enemy_spotted within 3 → DO engage nearest."
- **Radial menus are fast.** Expert players can select tokens in sub-200ms with muscle memory.
- **Drag-to-reorder is intuitive.** Universal pattern from todo apps, playlists, kanban boards.
- **Sentence strips scale.** 4 rules feel breezy. 12 rules are a scrollable but readable list.

### Weaknesses
- **Token slot explosion.** Complex conditions (enemy_spotted AND buffer_not_full AND channel_quiet) need either multi-token conditions or nested strips.
- **Boolean logic is hard.** "WHEN A AND B" requires either a compound token (hiding complexity) or a second condition slot (UI clutter).
- **Radial menus on mobile** are tricky — fat fingers, small wedges.

### Interaction Effects
- Pairs well with **Strict Priority** conflict model (3.06A) — drag order IS priority, no ambiguity.
- Pairs well with **Progressive Disclosure** (3.06F) — early missions limit token vocabulary, later missions unlock compound conditions.
- Tension with **Weighted Voting** (3.06C) — sentence strips don't naturally express weights.
- Works beautifully with **Inspector** — each strip can be highlighted during replay to show "this rule fired at tick 14."

### Comparable Games
- **Gladiabots**: Hexagonal behavior tree with condition→action links. Similar philosophy but node-graph instead of linear strips. The strips are simpler.
- **IFTTT / Shortcuts**: "If this then that" as a UI pattern. Proven accessible to non-programmers.
- **Notion databases**: Drag-to-reorder rows. The interaction model is identical.

---

## Paradigm B: The Dropdown Grid

**Philosophy:** Rules are rows in a grid. Each row has three fixed columns: CONDITION, QUALIFIER, ACTION. Each cell is a dropdown select. The grid is the entire UI — no drag handles, no radial menus, just click-to-select cells. Maximum simplicity at the cost of visual charm.

### Mechanical Specification

```
┌─────────────────────────────────────────────────┐
│  #  │   CONDITION        │ QUALIFIER │  ACTION   │
├─────┼────────────────────┼───────────┼───────────┤
│  1  │ enemy_spotted   ▾  │ ≤3 tiles ▾│ engage  ▾ │
│  2  │ ally_signal      ▾  │ any      ▾│ move_to ▾ │
│  3  │ no_signal        ▾  │ —        ▾│ patrol  ▾ │
│  4  │ (empty)          ▾  │          ▾│         ▾ │
└─────┴────────────────────┴───────────┴───────────┘
      [▲] [▼] Move selected row     [+ Add]  [🗑 Delete]
```

- **# column** — Row number = priority. Top row fires first.
- **Dropdown cells** — Click to open a standard dropdown list. Options filtered by unit type (a Scout can't select "compress" as an action).
- **▲/▼ buttons** — Move the selected row up or down. Each press is one position.

### What It Looks Like

A compact spreadsheet embedded in the workbench panel. Column headers are a dark steel blue (#445566) with white text. Cell borders are thin (1px) in a dark gray (#444). When a dropdown is open, it overlays the grid with a scrollable list — white text on dark background, highlighted option in electric blue. The entire grid fits in roughly 200×160px for 4 rules, expanding to 200×320px for 8.

The grid has a faintly industrial feel — like a PLC programming interface or a factory control panel. Each cell has a tiny colored pip in the corner indicating what category the selected option belongs to (yellow = enemy signals, green = ally signals, blue = resource, etc.).

No animation on reorder — the rows simply swap positions. A brief flash on the swapped rows (white→normal in 200ms) confirms the change.

### Board Feedback

Minimal but functional. Selecting any row highlights the corresponding behavior on the board ghost. Changing any cell value triggers a board ghost update identical to the Sentence Strip paradigm.

### Strengths
- **Fastest to learn.** Dropdowns are the most universal UI pattern on earth.
- **Compact.** 8 rules fit in the space that 4 sentence strips need.
- **Unambiguous.** Every value is explicitly selected, no parsing required.
- **Keyboard-navigable.** Tab between cells, type to filter dropdown options.

### Weaknesses
- **Dry.** No personality, no tactile satisfaction, no juice. Feels like filling out a form.
- **Reorder friction.** ▲/▼ buttons are slow for large moves (moving rule 8 to position 1 requires 7 clicks).
- **Discovery gap.** Dropdowns show options but don't teach relationships between them.
- **Hostile to streaming.** A grid of dropdowns looks terrible on camera.

### Interaction Effects
- Best match for **early tutorial missions** where the player is learning vocabulary before expressiveness matters.
- Pairs with **Template system** (3.13) — pre-filled grids that the player modifies rather than builds from scratch.
- Conflicts with the **aesthetic vision** — the game's cyberpunk SE-Asian visual identity doesn't map onto a spreadsheet.

### Comparable Games
- **Factorio circuit conditions**: Dropdown-based condition→action. Functional but not beautiful.
- **Excel data validation**: The literal interaction pattern.
- **Paradox game event modding**: Condition→effect grids in Crusader Kings / Stellaris.

---

## Paradigm C: The Card Stack

**Philosophy:** Each rule is a physical card with two halves — left half is the condition (amber-tinted), right half is the action (cyan-tinted). Cards stack vertically. The player builds rules by combining condition cards with action cards, and priority is the stack order from top to bottom. The tactile metaphor: you're building a hand of playing cards, then ordering them.

### Mechanical Specification

Each card is a visual unit approximately 200×60px:

```
┌────────────────────┬────────────────────┐
│  ⚡ ENEMY SPOTTED   │  ⚔ ENGAGE NEAREST  │
│  within 3 tiles     │                    │
│  ● ● ○ ○  (freq)   │  ● ● ● ○  (cost)  │
└────────────────────┴────────────────────┘
```

- **Left half (amber)**: Condition card. Shows icon, condition name, qualifier, and frequency dots (how often this condition typically fires — a learning aid).
- **Right half (cyan)**: Action card. Shows icon, action name, and cost dots (energy per use).
- **The seam**: A vertical divider line between halves. The player can drag a new condition onto the left half without changing the right half, or vice versa. The card is composed of two independently swappable halves.

Construction: The player drags condition cards from a **condition palette** (a horizontal tray at the bottom of the rules panel) onto the left side of a blank card. Then drags action cards from an **action palette** onto the right side. The palettes are small scrollable strips showing available options as compact icons.

Reordering: Drag the entire card up or down in the stack. Cards animate apart to show the insertion point. The stack has a slight perspective tilt — top cards appear slightly larger, creating a depth cue.

### What It Looks Like

The card stack sits in the rules panel as a vertical column of overlapping cards. Each card overlaps the one below by ~10px, like a hand of cards fanned out. The top card is fully visible; lower cards show their top edge and drag handle.

Card surfaces have a subtle texture — a faint circuit-board trace pattern etched into the amber/cyan halves. When the player hovers over a card, it rises slightly (3px shadow increase) and the circuit traces illuminate with a soft glow. Dragging a card out of the stack makes it float with a paper-thin shadow, rotating slightly with mouse movement.

The condition palette at the bottom renders conditions as small square tiles (40×40px) with icons. Hovering a palette tile previews the condition on the board — a dotted circle appears around the ghost unit showing "this is what the unit would react to." The action palette is identical but for actions — hovering shows the action animation briefly on the ghost.

Audio: Placing a card plays a soft papery "fwip." Snapping a half-card into place plays the magnetic "tchk" from Paradigm A. Reordering makes a gentle shuffling sound — like sorting physical cards.

### Strengths
- **Physicality.** Cards feel like objects. The game already has a cyberpunk aesthetic; circuit-board-textured cards reinforce it.
- **Half-card swapping is powerful.** "Keep the same action, change what triggers it" is one drag. This rewards iterative experimentation.
- **The palette teaches vocabulary.** Browsing conditions/actions in the palette is browsing the design space.
- **Streamable.** Cards look great on camera. The stack is visually parseable at a glance.
- **Frequency/cost dots are learning aids.** Players intuit that high-frequency conditions at the top of the stack will dominate behavior.

### Weaknesses
- **Screen real estate.** Cards are larger than strips or grid rows. 8+ cards require scrolling.
- **Card stack metaphor implies randomness** to players from card games. They might expect draw mechanics.
- **Half-card mechanics add hidden complexity.** The seam interaction is non-obvious — some players will try to drag whole cards from the palette instead of halves.
- **Multi-condition rules are awkward.** A card has one condition half. "WHEN A AND B" would need a compound condition card or a multi-slot left half.

### Interaction Effects
- Pairs beautifully with **Slay the Spire-style combo discovery** — the card metaphor primes players to think about synergies between rules.
- Pairs with **The Card Tray** skill UI (3.04D) — consistent card language across skills and rules.
- Tension with **Priority + Warnings** (3.06B) — where do warnings appear on cards? A small warning icon on the card edge, a red glow on conflicting cards.
- Pairs well with **Inspector**: during replay scrubbing, the firing rule card glows in the rules panel, creating a clear causal link between "this card" and "this agent behavior."

### Comparable Games
- **Slay the Spire**: Cards as atomic units of behavior. The deck is the strategy. Ordering matters for draw probability.
- **The Bazaar**: Items on a horizontal tray that trigger left-to-right. Visual priority ordering.
- **Balatro**: Joker tray where card position determines trigger order. Robot Uprising's rules are the player's "joker" config.

---

## Paradigm D: The Flow Lane

**Philosophy:** Rules are nodes in a vertical flow diagram. Condition nodes on the left connect via wires to action nodes on the right. The vertical position of a condition node determines its priority. This is the most powerful paradigm — and the most complex.

### Mechanical Specification

The rules panel becomes a mini node graph:

```
     CONDITIONS                    ACTIONS
     ──────────                    ───────
  ┌──────────────┐          ┌──────────────┐
  │ ENEMY_SPOTTED │─────────▸│   ENGAGE      │
  │   ≤3 tiles    │          └──────────────┘
  └──────────────┘     ┌────▸┌──────────────┐
  ┌──────────────┐     │     │   MOVE_TO     │
  │ ALLY_SIGNAL   │─────┘     └──────────────┘
  │   any channel │───────────▸┌──────────────┐
  └──────────────┘            │   COMPRESS    │
  ┌──────────────┐            └──────────────┘
  │ NO_SIGNAL     │───────────▸┌──────────────┐
  └──────────────┘            │   PATROL      │
                              └──────────────┘
```

- **Condition nodes** are placed on the left. Vertical position = priority. Top = highest priority.
- **Action nodes** are placed on the right.
- **Wires** connect conditions to actions. One condition can wire to one action. But one action can receive multiple wires — meaning multiple conditions can trigger the same action.
- **Fan-out**: One condition can wire to multiple actions if the player unlocks this capability (Mission 6+). Only the first wire fires; others are fallbacks.
- **Boolean logic**: AND nodes and OR nodes can be placed between conditions, creating compound triggers.

Construction: Right-click the canvas to add a node. Drag from a condition node's output port (small circle on right edge) to an action node's input port (small circle on left edge). The wire draws as a smooth bezier curve, cyan with a flowing particle animation (dots traveling along the wire like data packets).

### What It Looks Like

The flow lane renders in a dark-background sub-canvas within the workbench panel. Condition nodes are amber rectangles with rounded corners, 120×50px. Action nodes are cyan rectangles, same dimensions. Wires are bezier curves with animated particles — small bright dots flowing from condition to action, creating a sense of data movement.

When a wire is being drawn (player is dragging from an output port), all compatible input ports glow brighter and pulse, while incompatible ports dim. This guides the player toward valid connections.

Node positions snap to a vertical grid with 60px spacing, ensuring clean priority ordering. Dragging a condition node up or down reorders priority — other nodes slide smoothly out of the way.

The canvas supports zoom (scroll wheel, range 50%-200%) and pan (middle-click drag or two-finger trackpad). A minimap in the bottom-right corner shows the full graph when zoomed in.

Audio: Connecting a wire plays a rising electronic tone — like plugging in a cable. Disconnecting plays the tone in reverse. Reordering nodes plays a subtle hydraulic hiss — like pneumatic tubes shifting.

### Strengths
- **Maximum expressiveness.** Boolean logic, fan-out, multi-trigger actions. The player can express anything.
- **Visual debugging.** During Inspector replay, active wires glow brighter. Inactive wires dim. The player literally sees which path the logic took.
- **Fan-in is powerful.** "Three different conditions all trigger ENGAGE" is visually clear — three wires converging on one node.
- **The flowing particles are beautiful.** This is the TikTok clip — a complex flow graph with data particles cascading through nodes during execution.

### Weaknesses
- **Steep learning curve.** Node graphs intimidate non-programmers. "Where do I click?" is a real first-reaction.
- **Spatial management burden.** The player must manage node layout AND rule logic simultaneously.
- **Overkill for simple configs.** A scout with 2 rules doesn't need a node graph. It needs two strips.
- **Canvas zoom/pan is a UI commitment.** The workbench panel needs to support a sub-canvas with its own navigation — complexity within complexity.

### Interaction Effects
- **Conflicts with the locked "ordered condition→action pairs" language.** The flow lane is more than ordered pairs — it's a graph. This paradigm might require loosening the locked spec.
- Pairs with **The Blueprint Schematic** skill UI (3.04E) — consistent visual language of wired nodes across skills, rules, and hooks.
- Tension with **mobile/touch adaptation** — node graphs on touchscreens are notoriously painful.
- Pairs well with **The Channel Map Panel** — the rules flow lane and the auto-generated channel map share visual grammar.

### Comparable Games
- **Unreal Engine Blueprints**: The gold standard of visual scripting. Node graphs with wires. Proven for complex logic.
- **Blender shader nodes**: Same pattern, different domain. Artists manage complex material logic via wired nodes.
- **vvvv / TouchDesigner**: Real-time visual programming environments used by artists. Data flows through wired nodes.

---

## Paradigm E: The Natural Language Bar

**Philosophy:** The player types a rule in quasi-natural language. An autocomplete parser interprets the input and renders it as a structured strip. The player never needs to know the formal grammar — they describe intent, and the system parses it. But under the hood, it's still condition→action pairs with strict ordering.

### Mechanical Specification

At the bottom of the rules panel is a text input bar:

```
┌─────────────────────────────────────────────────┐
│  ⌨  Type a rule: "when enemy near, engage"  ▸   │
└─────────────────────────────────────────────────┘
```

As the player types, an autocomplete dropdown appears:
- "when e..." → suggests "when **enemy_spotted**" / "when **energy_low**"
- "when enemy_spotted w..." → suggests "**within 2**" / "**within 3**" / "**within 5**"
- Completing a condition, the system prompts "→ do..." and suggests actions
- Pressing Enter commits the rule as a rendered strip (identical to Paradigm A's sentence strips)

The autocomplete is aggressive — after 2 characters, it shows the top 3-5 matches. Tab accepts the top suggestion. Arrow keys navigate. The system accepts abbreviations: "en sp" → "enemy_spotted", "eng" → "engage."

The rules list above the input bar shows the already-parsed rules as sentence strips. The player can click any strip to edit it (the strip dissolves back into text in the input bar), or drag strips to reorder.

### What It Looks Like

The input bar sits at the bottom of the rules panel with a monospace font and a blinking cursor. It has a dark background (#1a1a2a) with a subtle green glow on the left edge — like a terminal prompt. The placeholder text ("Type a rule: 'when enemy near, engage'") is in dim green (#4a7a4a), fading out as the player starts typing.

The autocomplete dropdown appears directly below the cursor position, floating over the panel. Each suggestion row shows the full expansion on the left and a small icon on the right (yellow diamond for enemy conditions, cyan crosshair for engage actions). The top suggestion has a bright background (#2a3a5a). A keystroke counter in the bottom-right shows "3 keystrokes → full rule" as a subtle encouragement.

Committed rules render as sentence strips above the bar, identical to Paradigm A. The transition is animated: typed text morphs into a structured strip with each token sliding into its slot over 300ms.

Audio: Typing plays soft key clicks (randomized between 3 slightly different tones, like a mechanical keyboard). Autocomplete selection plays a soft confirmation beep. Rule commit plays the "tchk" snap from Paradigm A.

### Strengths
- **Fastest for experts.** 5 keystrokes to create a full rule. Veterans can build a 12-rule config in 30 seconds.
- **Natural language discovery.** Players can type intent ("when no enemies, explore") and see what the system maps it to.
- **Feels like programming without code.** Resonates with the "agentic engineering workbench" identity. The boot log primes players for text-first interaction.
- **Fallback to visual.** After parsing, the rule is a visual strip. Players who hate typing can click to modify tokens in-place.

### Weaknesses
- **Typing is hostile to controllers/touch.** Console and mobile players need an alternative path.
- **Parsing ambiguity.** "When enemy, run" — does "run" mean MOVE_AWAY or PATROL? The parser must handle ambiguity gracefully.
- **Error states are dangerous.** If the parser rejects input, the player feels stupid. Error messages must be warmly corrective, not robotic.
- **Localization nightmare.** The parser must work in multiple languages or the game is English-only.

### Interaction Effects
- Pairs perfectly with the **boot log narrative** — the game establishes text-as-interface from the first screen.
- Conflicts with **Gladiabots-style visual programming** aesthetics — text input breaks the visual-only interaction model.
- Pairs with **VS Code command palette** muscle memory — players who use code editors will feel instantly comfortable.
- Tension with **accessibility** — screen readers handle text well, but the autocomplete overlay needs ARIA labels.

### Comparable Games
- **Screeps**: JavaScript as the input method. Robot Uprising's NL bar is Screeps made accessible.
- **Bitburner**: Terminal + autocomplete for hacking scripts. Same energy, less code.
- **VS Code command palette**: Ctrl+Shift+P → type intent → get action. The interaction is identical.
- **Slack slash commands**: "/remind me to..." — natural language parsed into structured action.

---

## Paradigm F: The Progressive Template

**Philosophy:** The player never starts from a blank canvas. Every agent comes with a **template** — a pre-built set of 2-4 rules that represent a sensible default behavior for that unit type. The player modifies, extends, reorders, and eventually replaces template rules with custom ones. The interaction starts as "tweak a template" and evolves into "build from scratch."

### Mechanical Specification

When a player creates a new blueprint for a Scout, the rules panel is pre-populated:

```
SCOUT — Default Template "Recon Patrol"
──────────────────────────────────────────
1. WHEN enemy_spotted within 5  → DO  evade + broadcast          [TEMPLATE]
2. WHEN resource_nearby         → DO  move_toward + tag           [TEMPLATE]
3. WHEN no_signal               → DO  patrol                     [TEMPLATE]
──────────────────────────────────────────
[+ Add Custom Rule]
```

- **[TEMPLATE]** badge: Dim gray label on the right edge of template rules. Indicates this rule came from the template, not the player.
- Template rules are editable — the player can click any token to swap it. Editing a template rule changes the badge from [TEMPLATE] to [MODIFIED] (amber badge).
- Template rules are deletable — the player can remove them to build fully custom configs.
- Custom rules (added via [+ Add Custom Rule]) have no badge — they're clearly the player's own.
- **Templates are per-unit-type**: Scout has "Recon Patrol," Striker has "Seek and Destroy," Relay has "Signal Hub," Specialist has "Infiltrator," Command has "Coordinator."

The custom rule builder uses **sentence strips** (Paradigm A) — the simplest full-featured paradigm. The progressive reveal is in the templates, not the interaction model.

### Template Discovery

The first time the player opens a Relay's rule panel, the template is "Signal Hub":

```
1. WHEN channel_message on "scout-reports"  → DO  compress + forward   [TEMPLATE]
2. WHEN buffer_full                         → DO  evict_oldest          [TEMPLATE]
3. WHEN no_signal for 5 ticks               → DO  amplify_last         [TEMPLATE]
```

The player reads the template and learns three things simultaneously: (1) what conditions exist, (2) what actions the Relay can do, (3) a working configuration they can immediately deploy. The template IS the tutorial.

### What It Looks Like

Template rules have a subtly different visual treatment from custom rules. The background is a darker shade (#222234 vs. #2a2a3a), and the left edge accent is a thin dashed line instead of solid — visually whispering "this is a starting point, not yours yet." The [TEMPLATE] badge is small, rounded, gray text on darker gray background.

When the player modifies a template rule, the background brightens to match custom rules, the dashed accent becomes solid, and the badge smoothly transitions from [TEMPLATE] to [MODIFIED] with a brief amber flash. This moment — "I changed something, and it's mine now" — is a designed emotional beat. A soft chime plays, ascending two notes.

When all template rules have been either modified or deleted, a subtle achievement toast appears: "Full Custom Config — no template rules remaining." The unit's ghost on the board briefly glows brighter, acknowledging the player's ownership.

### Strengths
- **Zero cold-start problem.** The player never faces a blank rules panel. There's always something to read, modify, or delete.
- **Templates teach the vocabulary.** By reading template rules, the player discovers condition types, action types, and meaningful combinations.
- **Gradual ownership transfer.** The player transitions from "using someone else's config" to "owning my config" naturally.
- **Excellent for onboarding.** Missions 1-4 can use progressively more complex templates that the player modifies.
- **Template badges create a visible skill ceiling.** "I have zero template rules on any unit" is a prestige signal.

### Weaknesses
- **Template dependency.** Some players will never modify templates, treating them as correct answers. The game must eventually force template departure (missions that template configs can't beat).
- **Template design is game design.** Each template must be good enough to work but flawed enough to invite modification. This is hard to balance.
- **The [TEMPLATE] badge might shame beginners.** "I still have template rules" could feel like failure rather than scaffolding.
- **Template vocabulary constrains discovery.** Players only learn conditions/actions that appear in templates. The palette/radial menu must also exist for full discovery.

### Interaction Effects
- Pairs perfectly with **Strict Priority** conflict model — template rules are already correctly ordered, teaching priority-as-design by example.
- Pairs with **Mission 1-4 hand-configured units** — template rules are the mechanism for hand-configuration.
- Pairs with **Context config presets** (3.13) — the template pattern can span all four primitives, not just rules.
- Pairs with **Community sharing** (7.03) — player-created templates uploaded as "blueprint recipes."

### Comparable Games
- **Factorio blueprints**: Community-shared factory layouts that players import and modify. Templates ARE the social loop.
- **Into the Breach squad presets**: Pre-built teams that teach mech synergies. The player learns by playing the preset, then customizes.
- **Slay the Spire starter deck**: You always start with the same cards. The game is about replacing them with better ones.

---

## Player Journeys

### Journey: Mika, 14, First Strategy Game

**Context:** Mission 1 tutorial. Has never played a strategy game. Just finished the boot log sequence. First time seeing the workbench.

**Minute 0:00 — The Rules Panel Appears**
The boot log fades and the Plan Screen materializes. The board (8x8 grid) is on the left with one ghost scout in tile D4. The workbench panel is on the right. The skills section shows PATROL ◉ and EVADE ◉ — both already active. Below that, the RULES header pulses gently, drawing Mika's eye.

The rules panel shows a Progressive Template (Paradigm F) with two pre-built rules:

```
1. WHEN enemy_spotted within 5  → DO  evade                      [TEMPLATE]
2. WHEN no_signal               → DO  patrol                     [TEMPLATE]
```

A tutorial tooltip floats next to rule 1: "This rule tells your scout to run away when it sees an enemy. Try clicking the distance to change it."

**Minute 0:15 — First Edit**
Mika clicks "within 5" on rule 1. A radial menu appears with options: within 2 / within 3 / within 5 / any distance. Each wedge shows a faint preview — the scout's perception radius on the board changes in real-time as Mika hovers each option. "Within 2" makes the radius tiny. "Any distance" makes it huge.

Mika selects "within 3." The token snaps into place — "tchk." The [TEMPLATE] badge transitions to [MODIFIED] with an amber flash. The tutorial tooltip updates: "Nice! Now your scout will wait until enemies are closer before running."

**Minute 0:30 — First Custom Rule**
The tutorial prompts: "What should your scout do when it finds a resource? Click [+ Add Rule] to create a new rule."

Mika clicks the button. A blank strip appears at position 3, tokens pulsing as dim placeholders. The condition token shows "WHEN [choose...]" and the action token shows "DO [choose...]". Mika clicks the condition token. The radial menu appears. Mika hovers RESOURCE_NEARBY — the board shows blue hexagons appearing near resource tiles. Mika selects it. Then clicks the action token, selects MOVE_TOWARD.

The strip now reads: "WHEN resource_nearby → DO move_toward." The tutorial tooltip: "Your scout now has a custom rule! But notice — it's below the patrol rule. Your scout will patrol BEFORE it moves to resources. Try dragging it higher."

**Minute 0:50 — First Reorder**
Mika grabs the drag handle (≡) on rule 3 and drags it up. Rules 1 and 2 slide apart, creating a gap between them. Mika drops the resource rule at position 2. The rules now read:

```
1. WHEN enemy_spotted within 3  → DO  evade                      [MODIFIED]
2. WHEN resource_nearby         → DO  move_toward
3. WHEN no_signal               → DO  patrol                     [TEMPLATE]
```

The board ghost updates — the scout's patrol path now includes a detour toward a resource node. The tutorial tooltip: "Now your scout checks for resources BEFORE defaulting to patrol. Order matters!"

**Minute 1:10 — The Execute**
Mika hits EXECUTE. The sealed watch begins. The scout patrols, spots a resource, moves toward it, then spots an enemy at 3 tiles and evades. Mika watches the rules fire in sequence, each rule flashing briefly in the rules panel sidebar during execution. The evade rule glows amber when it fires at tick 7. Mika grins — "It did what I told it to."

**UI Annotations:**
- **Rules panel**: Right side of workbench, below skills toggles. 280px wide, variable height.
- **Sentence strips**: 40px tall, full width minus 16px padding. Charcoal/slate alternating backgrounds.
- **Radial menu**: 180px diameter, centered on clicked token. 150ms pop animation. 6-8 wedges.
- **Tutorial tooltips**: Floating amber-bordered boxes, 200px wide, positioned adjacent to the relevant UI element. Arrow pointing to target.
- **Board ghost**: Semi-transparent unit preview at 60% opacity, with colored radius overlay.

---

### Journey: Dmitri, 28, Factorio Veteran, 500+ Hours in Automation Games

**Context:** Mission 7. Factory is unlocked. Dmitri is configuring a Relay blueprint that will serve as the communications backbone for a 3-scout, 2-striker attack formation. He has 40 minutes of experience with the game.

**Minute 0:00 — The Relay Blueprint**
Dmitri opens a new Relay blueprint in the workbench. The template "Signal Hub" appears:

```
1. WHEN channel_message on "scout-reports"  → DO  compress + forward   [TEMPLATE]
2. WHEN buffer_full                         → DO  evict_oldest          [TEMPLATE]
3. WHEN no_signal for 5 ticks               → DO  amplify_last         [TEMPLATE]
```

Dmitri snorts. "Evict oldest? Amateur hour." He clicks "evict_oldest" on rule 2 and swaps it to "evict_lowest_priority" — a condition qualifier he discovered in Mission 5. The badge flips to [MODIFIED].

**Minute 0:20 — Building the Custom Pipeline**
Dmitri deletes the template rule 3 ("amplify_last on silence"). He's building a Relay that processes and routes, not amplifies. He clicks [+ Add Rule] three times rapidly, creating three blank strips.

Using the Natural Language Bar (Paradigm E — Dmitri discovered he can toggle between strip-building and typing in the settings), he types rapidly:

```
> when scout-reports contains threat, forward to striker-orders priority high
```

The parser interprets this into:
```
3. WHEN channel_message on "scout-reports" contains THREAT  → DO  forward to "striker-orders" priority:HIGH
```

He types two more rules:

```
> when channel_message on "striker-confirm" → compress and forward to "command-feed"
> when buffer > 80% → filter by priority, evict below MEDIUM
```

**Minute 1:00 — The Priority Dance**
Now Dmitri has 5 rules. He stares at the order. Rule 1 (compress scout reports) fires before Rule 3 (threat forwarding). That means threats get compressed BEFORE being forwarded at high priority. "Wrong — threats should forward raw, uncompressed."

He drags rule 3 above rule 1. The board ghost updates — channel wiring lines on the board shift. The threat-forwarding wire now glows red (high priority) while the standard scout-report wire stays blue. Dmitri can see the routing hierarchy directly on the battlefield.

```
1. WHEN channel_message on "scout-reports" contains THREAT  → DO  forward to "striker-orders" priority:HIGH
2. WHEN channel_message on "scout-reports"                  → DO  compress + forward   [MODIFIED]
3. WHEN channel_message on "striker-confirm"                → DO  compress + forward to "command-feed"
4. WHEN buffer > 80%                                        → DO  filter by priority, evict below MEDIUM
5. WHEN buffer_full                                         → DO  evict_lowest_priority  [MODIFIED]
```

Dmitri nods. "Threats bypass compression. Everything else gets squeezed. Buffer management last." He's thinking about the system like a message queue with priority routing. The rules ARE the routing configuration.

**Minute 1:30 — The Priority Warning**
A small amber triangle appears on rule 4. Dmitri hovers it: "Warning: Rule 4 (filter at 80%) and Rule 5 (evict at full) may both fire in the same tick if buffer goes from <80% to 100% in one signal burst. Rule 4 will fire first due to priority." This is the Priority + Warnings system (3.06B) surfacing a potential issue.

Dmitri considers. "That's actually fine — filter first, then evict the survivors. Belt and suspenders." He dismisses the warning. In the Inspector after execution, he'll verify this was the right call.

**UI Annotations:**
- **Natural Language Bar**: Bottom of rules panel, 32px tall, monospace font, green terminal glow, blinking cursor.
- **Autocomplete dropdown**: 240px wide, 5 suggestion rows, appears after 2 characters typed. Tab accepts.
- **Priority warning**: Small amber triangle icon (16×16) on the right edge of the rule strip, between info and delete buttons. Hover shows tooltip with 200ms delay.
- **Channel wiring on board**: Colored bezier curves connecting unit ghosts. Blue = standard, red = high priority, gray = filtered. Animate with flowing dots.
- **Template badges**: "MODIFIED" in amber, "TEMPLATE" in gray. 8px font, rounded pill shape.

---

### Journey: Keiko, 35, Streamer, 2000 Followers, Playing Robot Uprising for Content

**Context:** Mission 9. Factory vs factory. Keiko is configuring a Command unit live on stream. Chat is active. She's using the Card Stack paradigm (Paradigm C) because she thinks it looks best on camera.

**Minute 0:00 — Card Stack on Camera**
The rules panel shows Keiko's Command unit card stack — 8 cards, fanned vertically. Chat can see the cards clearly: amber condition halves and cyan action halves, each with distinct icons. The circuit-board trace pattern on the cards catches the stream's color grading nicely.

Keiko hovers over card 3, which reads "WHEN subordinate_idle → DO reassign to nearest_active_channel." The card lifts with a subtle shadow. "Okay chat, this rule is the one that's causing problems. Watch—" She pulls the card out of the stack. The remaining 7 cards smoothly close the gap. She holds card 3 in the air (floating with her cursor) while she explains to chat.

"See, the problem is this fires BEFORE the threat-response rules. My Command reassigns idle scouts to active channels, but then a threat comes in and the scouts are busy on their new assignment. I need threats to ALWAYS take priority."

**Minute 0:25 — The Reorder as Content**
Keiko drags card 3 down to position 6. The other cards slide apart to accommodate. As she drops it, the board ghost updates — the Command unit's influence radius shifts, and the subordinate connection lines on the board rearrange. Chat explodes with "the wiring changed!!" and "that's so clean."

"Now threat rules fire 1 through 5, and reassignment only happens at 6, 7, 8. Idle scouts get reassigned AFTER all threats are handled."

**Minute 0:40 — Building a New Card Live**
"Chat wants to see me build a new rule from scratch. Okay—" She drags a condition half from the palette: SUBORDINATE_OVERLOADED (orange icon showing a unit with a full buffer bar). The half-card snaps onto the left side of a blank card with a "fwip." Then she browses the action palette: "What should I do when a subordinate is overloaded? Reroute? Reassign? Prioritize?"

Chat votes: "REROUTE" wins. She drags the REROUTE action half onto the right side. The card assembles with the magnetic "tchk." She reads it aloud: "When subordinate overloaded, reroute. Nice. Where should it go in the stack?"

She drags the new card to position 4 — below threat response, above idle reassignment. "Overloaded subordinates get attention before idle ones. That's triage."

**Minute 1:00 — The Execute Moment**
Keiko hits EXECUTE. During the sealed watch, the rules panel collapses into a small sidebar showing only card edges — like tabs. As each rule fires during execution, its tab briefly glows. Chat can see the firing pattern: cards 1, 1, 2, 1, 4, 4, 6 — the Command is mostly responding to threats (rules 1-2) with occasional triage (4) and reassignment (6). "See how it barely touches the bottom rules? That means my threat response is EATING ALL THE TICKS. I need to tune the cooldown."

**UI Annotations:**
- **Card Stack**: Vertical fan of cards, each overlapping by 10px. Full card is 200×60px. Stack starts 40px below panel header.
- **Card on camera**: Circuit-board traces are visible at 720p stream resolution. Amber/cyan split is high-contrast.
- **Floating card**: 70% opacity, 2-degree tilt, paper-thin shadow. Follows cursor with 30ms lag for fluidity.
- **Condition/Action palettes**: Horizontal scrollable trays at bottom of panel. Each tile 40×40px with icon.
- **Execution sidebar**: Collapsed card stack showing only 10px-wide edge tabs. Firing tab glows for 300ms.

---

## Cross-Paradigm Analysis

### The Accessibility Axis

| Paradigm | Keyboard | Mouse | Touch | Controller | Screen Reader |
|----------|----------|-------|-------|-----------|---------------|
| A. Sentence Strip | Good (Tab + radial) | Excellent | Fair (radial tricky) | Fair | Good (strip reads as text) |
| B. Dropdown Grid | Excellent | Good | Good | Excellent | Excellent |
| C. Card Stack | Fair | Excellent | Good (large targets) | Fair | Fair (spatial layout) |
| D. Flow Lane | Poor | Excellent | Poor | Poor | Poor (spatial graph) |
| E. NL Bar | Excellent | Good | Poor (typing) | Poor (typing) | Excellent |
| F. Progressive Template | Good (inherits strip) | Excellent | Fair | Fair | Good |

### The Recommended Hybrid: "Template Strips with Type-Ahead"

The strongest configuration combines:
- **Paradigm F** (Progressive Template) as the default experience — templates provide starting points
- **Paradigm A** (Sentence Strip) as the editing paradigm — tokens, radial menus, drag-to-reorder
- **Paradigm E** (Natural Language Bar) as an expert shortcut — type-ahead for fast rule creation
- **Paradigm C** (Card Stack) as an unlockable visual mode — for players who prefer the tactile card feel

This gives:
1. **Beginner**: Sees template rules as sentence strips. Modifies tokens via radial menus. Drags to reorder.
2. **Intermediate**: Starts building custom rules from scratch. Uses [+ Add Rule] with sentence strips.
3. **Expert**: Enables the NL bar in settings. Types rules in 5 keystrokes. Still uses drag-to-reorder.
4. **Aesthete**: Switches to Card Stack mode for the visual flair. Builds via palette drag.

The Flow Lane (Paradigm D) is deliberately excluded from the default experience — it's too complex for the locked "ordered condition→action pairs" constraint and too hostile to accessibility. It could exist as a **read-only visualization** in the Inspector, showing the rule evaluation flow during replay.

---

## New Aspects Discovered

- **3.07a — Rules panel layout at scale: what does 12-20 rules look like?** When a Command unit has 15+ rules, how does the panel handle vertical overflow? Scrolling vs. pagination vs. collapsible groups. The "wall of rules" readability problem.
- **3.07b — Rules copy-paste between blueprints:** Can the player copy a rule strip from one blueprint and paste it into another? What about cross-unit-type compatibility (a Scout rule pasted into a Relay)?
- **3.07c — Rules diff view in Inspector:** During debrief, show which rules have changed since last execute. "You added rule 4 and reordered rules 2-3" as explicit feedback.
- **3.07d — Rules panel keyboard shortcuts:** Expert-facing keyboard-only workflow for rule creation and reordering. Ctrl+N for new rule, Ctrl+Up/Down for reorder, Ctrl+D for delete. How much can be done without touching the mouse?
- **3.07e — The "rule graveyard" — disabled but preserved rules:** Instead of deleting a rule, the player can "gray it out" (disable without removing). Grayed rules stay in the list but don't fire. Useful for A/B testing rule configurations without losing work.
