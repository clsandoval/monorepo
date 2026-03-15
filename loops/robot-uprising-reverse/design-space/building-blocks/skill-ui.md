# 3.04 — Skill UI: How the Player Browses, Equips, and Manages Skills on Agents

## Overview

Skills are locked: 12 named verbs across 5 unit types (patrol, evade, engage, breach, compress, filter, amplify, hack, extract, reassign, reroute, prioritize). Each unit type has 2-3 default skills. The design question isn't *what* skills exist — it's *how the player physically interacts with them* in the workbench. How do you browse, toggle, configure, compare, and understand skills? The Skill UI is the literal first thing the player touches after the boot log fades. It must be:

- **Immediately legible**: a beginner must understand "this unit can do these things" in under 5 seconds
- **Configurable at depth**: a veteran must be able to tune skill parameters (compression threshold, filter criteria, amplify conditions) without context-switching
- **Spatially coherent**: skill changes must give immediate feedback on the 8x8 board (ghost previews, perception radii, channel wiring)
- **Consistent across unit types**: the scout's skill panel and the command unit's skill panel should share visual grammar, even though the command has 3× the complexity

The locked Plan Screen spec says: "Config panel (skills toggles, rules as ordered condition→action pairs, hooks with channel name autocomplete, context config with listen/ignore toggles)." This tells us skills are togglable — but toggling is the tip of the iceberg. What does the toggle look like? Where does parameterization live? How does the player discover what a skill *does* before enabling it?

This document explores **six Skill UI paradigms**, from minimal to maximal complexity, each with full sensory descriptions and player journeys.

---

## The Six Paradigms

| Paradigm | Interaction Model | Complexity | Learning Curve | Comparable |
|----------|------------------|-----------|----------------|------------|
| **A. The Toggle Panel** | Binary on/off switches per skill | Minimal | 10 seconds | Into the Breach weapon slots |
| **B. The Loadout Rack** | Drag skills from palette into limited slots | Low-Medium | 1-2 minutes | XCOM loadout, Slay the Spire deck |
| **C. The Tuning Bench** | Toggle + inline parameter sliders | Medium | 3-5 minutes | Factorio inserter config |
| **D. The Skill Card Tray** | Cards with stats, flip to configure backside | Medium-High | 5-8 minutes | Balatro joker tray, The Bazaar items |
| **E. The Blueprint Schematic** | Skills as wirable nodes in a mini flow diagram | High | 10-15 minutes | Unreal Blueprint, Blender nodes |
| **F. The Progressive Reveal** | Starts as Toggle, evolves into Tuning Bench | Adaptive | Grows with player | Factorio's progressive recipe complexity |

---

## Paradigm A: The Toggle Panel

**Philosophy:** Skills are binary. On or off. No parameters, no ordering, no nuance. The unit either has the skill or it doesn't. The complexity lives in *rules* and *hooks*, not skills.

### Mechanical Specification

Each unit's skill section in the workbench shows a vertical list of available skills. Each skill is a horizontal row:

```
┌─────────────────────────────────────┐
│  ◉ patrol                    [?]    │
│  ○ evade                     [?]    │
│                                     │
│  Skills: 1/2 active                 │
│  Energy cost: 1e/tick               │
└─────────────────────────────────────┘
```

- **◉** = active (filled circle, skill color — cyan for patrol, red for evade)
- **○** = inactive (hollow circle, dim gray)
- **[?]** = tooltip trigger — hover/tap for skill description
- **Skills: 1/2 active** = capacity counter (units can have all skills active by default, but energy cost scales)
- Click/tap the circle to toggle. Immediate spatial feedback: toggling patrol ON causes a dotted cyan waypoint path to appear on the board's ghost unit. Toggling evade ON causes a subtle red "threat awareness ring" to flash once around the ghost.

### Sensory Description

The toggle panel lives in the top section of the workbench's right panel, beneath the unit name/type header and above the rules section. It occupies roughly 80px of vertical height for a 2-skill unit, 120px for a 3-skill unit.

**Toggle ON:** The circle fills with a soft radial wipe (150ms). The skill name transitions from `#6B7280` (dim gray) to `#E5E7EB` (bright white). A quiet *tick* sound — like a light switch — plays. The skill's color accent (cyan for patrol, red for evade, green for compress, etc.) appears as a 3px left border on the row. Simultaneously, the ghost unit on the board updates: perception radius appears, waypoint path renders, or channel wiring draws, depending on the skill.

**Toggle OFF:** The circle empties with a reverse radial wipe. The name dims. A softer *untick* — slightly lower pitch. The board overlay withdraws.

**Hover over [?]:** A tooltip slides in from the right (200ms ease), containing:
- Skill name in bold
- One-sentence description ("Moves along waypoints, observing all units within perception radius each tick")
- Key interaction ("Generates observation entries in buffer")
- Cost ("1e/tick while active")
- The tooltip background is a darker panel with the skill's accent color as a top border stripe.

**The board responds in real-time.** This is the critical design principle borrowed from Into the Breach: *every configuration change is immediately visible spatially*. Toggle patrol ON → waypoint path appears. Toggle compress ON → the relay's signal processing indicator (a tiny funnel icon) appears above the unit's ghost on the board. Toggle amplify ON → concentric ring preview pulses once from the relay position, showing broadcast reach.

### Strengths

- **Absolute minimum cognitive load.** A beginner sees two switches and a question mark. Nothing to drag, arrange, or configure.
- **Immediate spatial feedback.** The board-workbench coupling means every toggle teaches something — the player sees what the skill *does* before committing.
- **Fast iteration.** Toggle-run-observe-toggle takes 2 seconds. The Plan→Execute loop is tight.
- **Consistent across all unit types.** Scout has 2 toggles, Command has 3 toggles. Same pattern, more rows.
- **Accessible.** Binary choices are keyboard-navigable (arrow keys + space), screen-reader friendly ("patrol: active"), controller-friendly (d-pad + A button).

### Weaknesses

- **No parameterization surface.** Where does the compression threshold live? Where does the filter criteria editor go? Toggle says "compress is on" but not "compress triggers after 3 entries" vs. "5 entries." Parameters must live elsewhere — either in rules (adding rule-language complexity) or in a separate config section (fragmenting the skill concept).
- **Skill ordering is invisible.** If a relay has compress, filter, and amplify all active — what order do they execute? Toggle panels don't encode order. This must be handled by a separate execution-order config or by fixed ordering.
- **No skill comparison.** You can't see compress and filter side-by-side to understand their tradeoff. Each skill is isolated in its toggle row.
- **Veteran ceiling.** After 2 hours, toggle panels feel like training wheels. A veteran wants to *configure* compress, not just enable it.
- **All skills active is often optimal.** If there's no cost to having all skills on, the toggle is a false choice. The energy cost mechanic must be tuned to create genuine skill-selection pressure.

### Interaction Effects

- **With rules language:** If skills are binary, all behavioral nuance shifts to rules. The rules section becomes the real workbench. Skill UI is just a filter on which actions rules can reference.
- **With hooks:** Hooks can only trigger from active skills. Toggle OFF a skill → its hook triggers become dead. The channel map panel should show a warning ("patrol is disabled but hook on patrol_complete still wired to channel 'sweep'").
- **With sealed watch:** Simple skill configs → simpler battles → easier to read during sealed watch. But also less architectural depth → less dramatic debrief moments.
- **With onboarding:** Toggle Panel is the ideal paradigm for Missions 1-2 of the locked campaign. Whether it *stays* the paradigm is the open question.

### Comparable Games

- **Into the Breach** weapon selection: each mech has 1-2 weapon slots. Select a weapon, see its range/effect highlighted on the board. Binary choice: equip this weapon or that weapon. Robot Uprising's toggle is even simpler — no mutual exclusion.
- **Factorio** early game: inserters have a single function (pick up, put down). No configuration UI at all. The inserter IS the function. Toggle Panel has the same elegant simplicity — skills ARE what the unit does.
- **Gladiabots:** abilities are implicit in behavior tree actions. There's no separate "skill equip" step. The behavior tree IS the skill. Toggle Panel is closer to a Gladiabots-like "capabilities are always available" philosophy.

---

## Paradigm B: The Loadout Rack

**Philosophy:** Skills are items in a palette. The player drags them into limited equip slots. Slot scarcity creates meaningful choices: you can't have everything.

### Mechanical Specification

The workbench shows two areas:

1. **Skill Palette** (left): all skills available to this unit type, displayed as rectangular tiles (48×48px) with icon + abbreviated name. Grayed-out tiles for skills not yet unlocked (if using staged unlock).
2. **Equip Slots** (right): N empty rounded-rectangle slots (where N = 2 for Scout, 3 for Relay, etc.). Drag a skill tile from palette into slot. Tile snaps into place with a satisfying magnetic pull.

```
┌────────────────────────────────────────────────┐
│  AVAILABLE           EQUIPPED                   │
│ ┌──────┐ ┌──────┐   ┌──────────┐ ┌──────────┐  │
│ │ 👁   │ │ ↩    │   │ 👁 patrol│ │  (empty) │  │
│ │patrol│ │evade │   │          │ │          │  │
│ └──────┘ └──────┘   └──────────┘ └──────────┘  │
│                                                 │
│            Drag skill to equip                  │
└────────────────────────────────────────────────┘
```

### Sensory Description

**Skill tiles in the palette:** Each tile has the skill's accent color as a full background (cyan for patrol, red for evade, etc.) with a white icon and name. Unequipped tiles are at 60% saturation. Equipped tiles in the palette dim to 30% and show a small checkmark, indicating they're in use.

**Drag interaction:** Picking up a skill tile enlarges it to 120% with a subtle shadow drop (the tile lifts off the surface). A faint magnetic hum plays — like a maglev train approaching. As the tile nears an empty equip slot, the slot border brightens and pulses (acceptance indicator). Dropping into the slot triggers a satisfying *clack* — a physical snap like a cartridge seating. The tile shrinks to fit the equip slot dimensions. The board updates: spatial preview for that skill renders on the ghost unit.

**Removing a skill:** Drag from equip slot back to palette, or double-click to unequip. The tile floats back with a softer *click*. The board preview withdraws.

**Empty slot visual:** A dashed rounded rectangle with a "+" icon at center, pulsing very slowly (0.5Hz) in dim white. The slot's outline matches the unit's type color. Hover over empty slot shows tooltip: "Drag a skill here to equip."

**Slot ordering matters.** The order of equip slots from left to right determines execution priority for the Relay's three-skill pipeline (compress → filter → amplify vs. filter → compress → amplify). Dragging to reorder within equip slots is supported — tiles slide smoothly and swap positions with a shuffling animation and soft *shuffhh* sound.

### Strengths

- **Slot scarcity creates meaningful choices.** If a unit has 2 equip slots but 3 available skills, the player must choose. This doesn't apply to the locked design (each unit's default skills = their slot count), but becomes relevant if future skills are added, if skill acquisition introduces alternatives, or if the paradigm is extended with "equipment limits."
- **Drag-and-drop is tactile.** The physical metaphor (moving objects into slots) feels like assembling hardware. The maglev snap provides haptic-grade satisfaction.
- **Ordering is explicit.** Equip slot order = execution order. No separate config needed.
- **Palette browsing invites discovery.** Seeing all available skills (including locked/grayed ones) creates aspiration. "What does amplify do? I can't wait to unlock relays."
- **Comparable to familiar patterns.** Anyone who's played a loot game or card game recognizes "drag item into slot."

### Weaknesses

- **Overhead for no payoff in current design.** With 12 locked skills mapped 1:1 to unit types (scout gets patrol + evade, period), the loadout rack is an elaborate way to show a fixed configuration. The drag is ritual, not choice. This paradigm only shines if skills are cross-unit or if units have more available skills than equip slots.
- **Touch/controller friction.** Drag-and-drop is excellent on mouse, adequate on touch, poor on controller. Controller adaptation requires a cursor-select → confirm → slot-select → confirm flow that's slower.
- **Vertical space consumption.** The palette + equip layout needs ~150px minimum height, more than Toggle Panel's ~80px. In the workbench's right panel, this means less space for rules, hooks, and context config.
- **Parameterization still external.** Dragging a skill into a slot says "use this skill." Configuring the skill's parameters (compression threshold, filter criteria) must happen either via a secondary panel (click equipped skill to expand config) or inline after equipping.

### Interaction Effects

- **With skill acquisition Paradigm C (Experimenter):** Loadout Rack pairs beautifully with discovery-based unlock. New skills appear in the palette with a glow. The player drags the freshly discovered skill into a slot — the equip moment IS the reward moment.
- **With production queue:** The conveyor belt production queue (locked design) is also a horizontal drag-and-drop strip. Two drag surfaces on the same screen creates cognitive load. They should be visually distinct: equip slots = rounded rectangles; production queue = hexagonal blueprint icons.
- **With command agents:** Command units have 3 skills (reassign, reroute, prioritize) — already filling their equip slots. The rack for command is display-only unless the meta-level includes selectable command skills.

---

## Paradigm C: The Tuning Bench

**Philosophy:** Skills are always equipped (toggle model), but each skill has an inline configuration panel that expands beneath the toggle when active. The skill row IS the configuration surface. No separate editor, no modal popups — everything in one scrollable column.

### Mechanical Specification

Default state: the skill section shows toggle rows (identical to Paradigm A). But clicking an active skill's name (not the toggle) expands an inline config panel beneath it:

```
┌─────────────────────────────────────────┐
│  ◉ compress ▼                    [?]    │
│  ┌─────────────────────────────────┐    │
│  │ Threshold: ●───────○ 3 entries  │    │
│  │ Source filter:  [all sources ▾] │    │
│  │ Output format:  ○ summary      │    │
│  │                 ● trajectory    │    │
│  └─────────────────────────────────┘    │
│  ◉ filter ▶                      [?]    │
│  ◉ amplify ▶                     [?]    │
│                                         │
│  Skills: 3/3 active | 2e/tick           │
└─────────────────────────────────────────┘
```

- **▼** = expanded (config visible). **▶** = collapsed (config hidden).
- Click skill name to toggle expansion. Only one skill expanded at a time (accordion pattern).
- Parameters are type-specific:
  - **Sliders** for numeric values (compression threshold: 2-5, amplify priority boost: 1-3)
  - **Dropdowns** for enum choices (filter source, patrol pattern type)
  - **Radio buttons** for binary mode choices (output format: summary vs. trajectory)
  - **Mini drag-lists** for ordering (eviction priority for context config — but that's another section)

### Sensory Description

**Expansion animation:** The config panel slides down over 200ms with a hardware-unfolding feel — like opening a laptop. The toggle row gains a subtle bottom shadow indicating depth. A quiet *snick* sound, like a panel latch releasing.

**Slider interaction:** The slider track is a thin horizontal line in the skill's accent color (green for compress). The thumb is a small filled circle. Dragging the thumb causes the value label to update in real-time ("3 entries" → "4 entries" → "5 entries"). Each value snap triggers a tiny *tick* — like a ratchet. The board's ghost preview updates with each snap: higher compression threshold → the relay's processing indicator (funnel icon) grows slightly larger, suggesting it accumulates more before firing.

**Dropdown interaction:** Click to open a selection list that overlays below. Selected option has a checkmark. Hover highlights rows with the skill's accent color. Select plays a soft *clunk*.

**Collapse animation:** Reverse of expansion — config panel slides up, shadow withdraws. The collapsed state shows a tiny summary beneath the skill name: "compress: threshold 3, trajectory mode" in dim text (10px, `#9CA3AF`).

**The collapsed summary is the key innovation.** Even when collapsed, you can scan all skill configurations at a glance. A relay's skill section might read:

```
◉ compress ▶  threshold 3, trajectory mode
◉ filter ▶    drop: scout_alerts, keep: priority
◉ amplify ▶   boost +2, channel: urgent
```

Three lines. Complete skill configuration readable in 2 seconds.

### Strengths

- **Configuration lives where it belongs.** No navigation to a separate screen. The skill and its parameters are one visual unit. This follows Into the Breach's design principle: "sacrifice cool ideas for the sake of clarity."
- **Progressive disclosure.** Beginners see toggles. Intermediate players click to expand. Veterans scan collapsed summaries. Three levels of engagement with the same UI element.
- **Collapsed summaries enable expert scanning.** A veteran configuring a complex relay reads "compress: threshold 3" and knows immediately whether to adjust. No clicking required.
- **Spatial feedback is parameter-sensitive.** Changing compression threshold updates the ghost preview. The player sees the *consequence* of each parameter value on the board.
- **Accordion keeps vertical space bounded.** Only one skill expanded at a time. Maximum height for a 3-skill unit: ~200px (one expanded, two collapsed).

### Weaknesses

- **Small parameter controls.** Inline sliders and dropdowns at this scale are tricky on mobile/touch. The accordion panels must be large enough for fat fingers (~44px minimum tap targets).
- **Information density for 3-skill units.** A relay with compress, filter, and amplify — all expanded — would need ~350px. The accordion constraint prevents this, but a player who wants to see all three configs simultaneously must choose one at a time.
- **Scrolling pressure.** The workbench right panel contains skills + rules + hooks + context config. If skills take 200px, rules take 250px, hooks take 200px, and context config takes 150px, the total is 800px — likely exceeding viewport height. Scrolling becomes mandatory, which hides lower sections.
- **Discovery is limited.** Unlike Paradigm B's palette, there's no "see all available skills" view. The player only sees the skills their current unit type has. Cross-unit skill awareness requires clicking different units.

### Comparable Games

- **Factorio inserter config (2024+ GUI overhaul):** Click an inserter → config panel shows filter slots, stack size slider, circuit conditions. All inline. No separate editor. The config panel appears *in the game world* near the entity. Robot Uprising's tuning bench is the same idea, but in a dedicated workbench panel rather than in-world.
- **Slay the Spire card detail:** Click a card to see its upgrade path, damage numbers, synergies. The information is contextual — you only see it when you need it. The accordion model mirrors this: expand when configuring, collapse when done.
- **Gladiabots behavior blocks:** Each block has inline parameters (target type, condition, action). But Gladiabots puts ALL parameters in one dense block, creating visual overload for complex behaviors. Robot Uprising's accordion avoids this by showing one skill's parameters at a time.

---

## Paradigm D: The Skill Card Tray

**Philosophy:** Each skill is a playing card. The unit's skill section is a horizontal tray of overlapping cards. Pull a card up to reveal its face (description, stats). Flip the card to its back for configuration. The card metaphor makes skills feel like *possessions* — things you hold, inspect, and arrange.

### Mechanical Specification

The skill section shows a horizontal card tray at the top of the workbench right panel:

```
┌──────────────────────────────────┐
│  ┌────────┐┌────────┐┌────────┐  │
│  │COMPRESS││ FILTER ││AMPLIFY │  │
│  │  ◆◇◇   ││  ◆◇    ││  ◆◆◆  │  │
│  │ thresh:3││drop:scou││boost:+2│  │
│  └────────┘└────────┘└────────┘  │
└──────────────────────────────────┘
```

- **Card face (front):** Skill name, icon, one-line stat summary, power rating (diamonds: ◆ = active parameter, ◇ = available parameter slot)
- **Card hover/pull:** Slide card upward 20px to "pull" it from the tray. A tooltip-sized card expands showing full description, key interactions, cost.
- **Card flip:** Click pulled card to flip it (3D rotation animation, 400ms). The back shows the full parameter configuration panel — sliders, dropdowns, radio buttons — rendered on a "blueprint paper" texture.
- **Card drag:** Rearrange cards left-to-right by dragging within the tray. Order = execution priority.
- **Card dim/glow:** Active skills glow with their accent color border. Disabled skills (if toggling is supported) have a dim, desaturated card face.

### Sensory Description

**Card tray at rest:** Three overlapping cards, slightly fanned, sitting in a shallow recessed tray. Each card has a dark background (`#1F2937`) with the skill's accent color as a top edge stripe (3px). The skill icon is centered in a 24×24 area. Below: the skill name in caps, 10px, white. Below: 1-3 diamond pips (◆ for configured parameters, ◇ for unconfigured). Below: one-line stat summary in 9px dim gray. The tray casts a soft shadow downward.

**Pull interaction:** Hovering over a card causes it to slide up 8px with a soft paper-slide sound. The other cards shift slightly to accommodate. Click-and-hold lifts the card further (20px total), and the card scales to 130%, floating above the tray with a deeper shadow. Full skill description appears below the card in a tooltip panel. Releasing drops the card back into the tray with a *thp* sound — cardboard on felt.

**Flip interaction:** Clicking a pulled card triggers a 3D rotation around the vertical axis. The card front fades to the right edge; the card back appears from the left edge. The rotation has a subtle perspective tilt — the near edge is larger than the far edge. A playing-card *flick* sound. The back reveals the parameter configuration surface on a blueprint-blue background with grid lines. All parameters use the same control types as Paradigm C (sliders, dropdowns, radio), but rendered with the blueprint aesthetic — parameter labels in monospace, slider tracks as thick ruled lines.

**Card reorder:** Drag a card horizontally. The other cards shift smoothly to make room. A subtle *shuffhh* — cards sliding on felt. Drop triggers a quiet *clack*. The execution order updates: left = first, right = last.

**Active/inactive toggle:** Right-click (or long-press on touch) to toggle a card between active and inactive. Inactive cards desaturate to grayscale and slide down 4px in the tray — visually "lowered." The accent color border fades. A muted *click*.

### Strengths

- **Skill-as-object creates attachment.** Cards feel like possessions. Players who internalize "my compress card" develop vocabulary faster than "the compress toggle." The card metaphor leverages decades of muscle memory from TCGs and deckbuilders.
- **Front/back duality solves the toggle-vs-configure tension.** Card front = identity ("what is this skill?"). Card back = configuration ("how is it tuned?"). Two concerns, one object, no mode switches.
- **Horizontal layout preserves vertical space.** The card tray occupies ~90px of height regardless of skill count (3 cards overlap in the same tray). This leaves maximum vertical space for rules, hooks, and context config below.
- **Ordering is physical.** Drag-to-reorder within the tray feels natural and tactile. The card arrangement IS the execution order.
- **Visual density.** Diamond pips on the card face let a veteran scan "compress is tuned, filter is half-configured, amplify is maxed" in a glance. No expansion needed.

### Weaknesses

- **Flip interaction is mobile-hostile.** The 3D flip requires precision clicking/tapping on a small card. On mobile, the "pull then flip" two-step interaction adds friction. A simpler "tap to expand" might replace the flip on touch.
- **Blueprint-back readability.** Configuration controls on a textured background are harder to read than on a flat panel. The blueprint aesthetic must not compromise legibility. High contrast mode should flatten the texture.
- **Unfamiliar metaphor for non-card-game players.** Players with no TCG/deckbuilder background may not intuit "pull up" and "flip." The metaphor aids a specific audience (Slay the Spire players) while potentially confusing others (Factorio players expect inline panels).
- **Card size constraints.** 48×72px cards limit the amount of information on the face. Parameter summaries must be extremely abbreviated ("thresh:3" for "compression threshold: 3 entries"). Abbreviation creates its own readability barrier for new players.
- **Parameterization on the back is hidden.** Unlike Paradigm C's collapsed summaries (always visible), card-back parameters require a flip to see. A veteran scanning a relay's config must flip each card to check settings. Mitigation: the diamond pips and one-line summary on the face provide a rough read.

### Comparable Games

- **Balatro joker tray:** Jokers sit in a horizontal tray at the top of the screen. Hover to see stats. The card metaphor drives Balatro's entire identity. Robot Uprising's skill cards borrow the spatial arrangement but add the flip-to-configure mechanic.
- **The Bazaar (2025):** Items arranged horizontally, with hover-to-inspect and drag-to-reorder. The horizontal tray as primary configuration surface is a proven pattern for "small number of important objects."
- **Slay the Spire deck inspection:** Cards can be pulled and examined. The pull interaction is physically satisfying. Robot Uprising extends this from inspection to configuration.
- **Hearthstone collection:** Cards as browsable objects in a grid. The card-as-skill metaphor is immediately familiar to the CCG audience.

---

## Paradigm E: The Blueprint Schematic

**Philosophy:** Skills aren't isolated items — they're nodes in a processing graph. The skill section shows a mini-flowchart where skills are connected boxes and the connections represent execution order and data flow. This makes the relay's compress→filter→amplify pipeline *literally visible as a pipeline*.

### Mechanical Specification

The skill section shows a small node graph within the workbench panel:

```
┌──────────────────────────────────────┐
│  ┌──────────┐    ┌─────────┐         │
│  │ COMPRESS  │───▶│ FILTER  │         │
│  │ thresh: 3 │    │drop:scou│         │
│  └──────────┘    └────┬────┘         │
│                       │               │
│                  ┌────▼────┐         │
│                  │ AMPLIFY │         │
│                  │boost: +2│         │
│                  └─────────┘         │
│                                      │
│  ⊕ Add connection                    │
└──────────────────────────────────────┘
```

- **Skill nodes:** Rounded rectangles with skill name, icon, and one-line parameter summary. Accent-colored border. Click node to expand inline parameter panel (accordion style within the node).
- **Connection arrows:** Lines with arrowheads showing data flow between skills. Drag from one node's output port (right edge) to another node's input port (left edge) to create a connection.
- **Execution order:** Determined by graph topology (upstream nodes execute before downstream). No separate ordering config needed — the graph IS the order.
- **Unconnected nodes:** Skills with no connections execute independently each tick.

### Sensory Description

**Node graph at rest:** Skill nodes float in a miniature canvas (280×200px within the workbench panel). Nodes have the dark panel background (`#1F2937`) with a 2px accent-color border. Connection lines are thin (1.5px), color-coded by data type (green for observations, yellow for threats, blue for compressed signals). Arrowheads are small filled triangles. The canvas has a subtle dot-grid background (lighter than the main workbench, barely visible — a nod to engineering graph paper).

**Creating a connection:** Click a node's output port (a small circle on the right edge, 8px diameter, appearing on hover). A elastic line stretches from the port to the cursor. The line wobbles slightly as if spring-loaded. Dragging near a compatible input port causes the port to pulse and enlarge to 12px. Releasing onto the port snaps the connection into place with a *click-hum* — the sound of a cable seating. The connection line draws itself with a brief animation (150ms, left-to-right wipe). During this, a pulse of the data-type color flows along the line. Simultaneously, the board's ghost unit shows a tiny processing-chain icon (a series of dots connected by lines) above the unit sprite, indicating a configured pipeline.

**Node expansion:** Click a node to expand it downward, revealing parameter controls. The node grows vertically while maintaining its position. Other nodes shift to accommodate. Connection lines redraw smoothly. The expanded node has a subtle "opened" feel — like lifting the lid on a component to access its internals.

**Invalid connections:** If the player tries to connect a compress output to another compress input (type mismatch), the elastic line turns red and snaps back with a *bzzzt* buzz. A brief tooltip: "compress output is processed data — filter or amplify can receive it."

### Strengths

- **The pipeline IS the UI.** For relay units especially, the compress→filter→amplify chain is naturally expressed as a graph. The player doesn't configure ordering separately — the connections ARE the ordering. This is the most structurally honest representation.
- **Visual debugging.** During Inspector playback, the node graph can animate: data pulses flow along connection lines in sync with tick-by-tick execution. The player literally watches their pipeline process signals. This is the "programming language with a debugger" experience.
- **Scales with complexity.** A scout with 2 unconnected skills shows two floating nodes. A relay with a 3-stage pipeline shows a chain. A command unit with complex cross-skill interactions shows a branching graph. The visual complexity matches the unit's actual complexity.
- **Teaches pipeline thinking.** The graph metaphor directly maps to data pipeline concepts. A player who learns to wire compress→filter→amplify has learned to compose sequential transformations — a transferable engineering concept.
- **Combos are visible.** When a skill's output feeds another skill's input, the combo is literally drawn. No need to discover combos through trial and error — the graph reveals which connections are possible.

### Weaknesses

- **Space consumption.** A node graph for a 3-skill relay needs ~200px height minimum. A 3-skill command unit with branching connections needs ~250px. This leaves very little room for rules, hooks, and context config in the workbench panel. The node graph could become the *entire* workbench if not carefully constrained.
- **Overkill for simple units.** A scout with patrol and evade — two independent skills with no pipeline relationship — is a graph of two disconnected nodes. The graph adds visual complexity without functional benefit for units that don't pipeline skills.
- **Mouse-dependent interaction.** Creating connections by dragging between ports is excellent on mouse, adequate on touch (with large enough ports), and terrible on controller. Controller adaptation requires a "select source, select destination" flow that loses the physical wiring satisfaction.
- **Learning curve.** Node-graph interfaces are familiar to Blender/Unreal users but alien to casual players. The "draw a line between two boxes" concept, while intuitive once learned, is a significant onboarding hurdle compared to toggles or cards.
- **Over-engineering risk.** If skills don't actually pipeline (if execution order is fixed per unit type), the connection mechanism is ceremony without substance. The graph must be structurally necessary, not just aesthetically pleasing.

### Comparable Games

- **Unreal Engine Blueprints:** The gold standard for node-graph programming. Robot Uprising's skill schematic is a radically simplified version — 3 nodes max per unit vs. Unreal's unlimited canvas. The lesson from Unreal: node graphs need zoom, pan, and undo. Even in miniature.
- **Blender shader nodes:** Beautiful visual programming for material composition. The "data flows left to right" convention is established. Robot Uprising should follow the same direction convention.
- **Screeps:** No visual graph, but the programming model is pipeline-oriented. Robot Uprising's schematic makes the pipeline visible.
- **Factorio circuit network:** Wires connecting entities. The "draw a wire" interaction is identical. Factorio proves that casual players CAN learn wiring UIs — but only after hours of non-wiring gameplay establish baseline competence.

---

## Paradigm F: The Progressive Reveal

**Philosophy:** Don't choose one paradigm — evolve through them. Start with Toggle Panel (Missions 1-2), transition to Tuning Bench (Missions 3-5), introduce Card Tray elements or Blueprint Schematic connections (Missions 6+). The UI grows with the player's sophistication.

### Mechanical Specification

The skill section's visual treatment changes based on campaign progression:

**Phase 1 (Missions 1-2): Pure Toggle**
- Binary on/off switches. No parameters exposed. Skills do exactly what the tooltip says with default parameter values.
- Compression threshold defaults to 3. Filter defaults to "allow all." Amplify defaults to boost +1.
- The player focuses entirely on which skills are active.

**Phase 2 (Missions 3-4): Toggle + Summary**
- Active skills show a one-line summary beneath the toggle ("compress: threshold 3, trajectory mode").
- The summary is informational only — not yet editable. The player sees parameters exist but can't change them.
- A subtle "lock" icon on the summary indicates future configurability. Tooltip: "Advanced tuning unlocks in Mission 5."

**Phase 3 (Mission 5+): Full Tuning Bench**
- Summary lines become clickable. Click to expand accordion panel with sliders, dropdowns, radio buttons.
- The lock icon dissolves with a *crack* animation and ascending chime when the player first reaches Mission 5.
- All parameters become configurable. Default values remain until the player changes them.

**Phase 4 (Mission 7+ / optional): Pipeline View**
- For relay and command units only, an optional "Pipeline View" toggle appears at the top of the skill section.
- Toggle switches between Tuning Bench (list view) and Blueprint Schematic (graph view).
- The graph view is never required — it's a power-user tool for players who think in pipelines.

### Sensory Description

**Phase transition moment (Mission 5 unlock):**

The player completes Mission 4's debrief. The boot log terminal types:

```
> CONFIGURATION SUBSYSTEM: DEEP ACCESS AUTHORIZED
> Skill parameters now tunable. Your agents. Your rules.
> Precision is a weapon. Use it.
```

Each line appears with the typewriter clatter. "DEEP ACCESS AUTHORIZED" is in amber instead of the usual teal — visually distinct from previous boot log entries. A low-frequency *power-up hum* plays.

When the workbench loads for Mission 5, the skill section's summary lines pulse once in amber. The lock icons shatter (each breaks into 4 pixel fragments that fall and fade). The *crack* plays per icon in rapid succession — crack-crack-crack. The summaries are now interactive — cursor changes to pointer on hover. First click expands the accordion panel with a *snick*.

**Pipeline View toggle (Mission 7):**

A small icon appears in the skill section header: two connected nodes (graph icon), beside the existing list icon. Tooltip: "Pipeline View: visualize skill execution order." Clicking it transitions the skill section from list to graph with a 500ms morph animation — the list items slide apart and reposition as nodes while connection lines draw themselves between them. A satisfying *zhhhhp* — like a zipper.

### Strengths

- **Solves the onboarding-vs-depth tension.** Missions 1-2 show the simplest possible UI. The same physical screen region grows into a sophisticated configuration surface. The player never encounters a "now learn a new UI" moment — each phase adds to what they already know.
- **Respects locked campaign pacing.** Missions 1-4 are hand-configured pre-placed units — minimal workbench interaction. Mission 5 introduces the factory — more workbench time. Mission 7 adds command agents — maximum complexity. The UI phases align with the campaign's complexity ramp.
- **Preserves the TikTok moment for each phase.** Phase 1: "look how simple this is." Phase 3: "wait, you can tune each skill?" Phase 4: "holy shit, you can wire skills into a pipeline?" Three discovery moments instead of one.
- **Optional depth.** Phase 4's Pipeline View is opt-in. A player who prefers list view never needs to engage with graphs. The power-user tool doesn't tax the casual player.
- **Diegetically coherent.** The boot log frames parameter access as a system unlock. The AI is gaining deeper access to its own subsystems. The UI evolution IS the narrative.

### Weaknesses

- **Implementation complexity.** Four distinct skill section renderings that must all produce identical game state. Edge cases abound: what if a player returns to Mission 2 with full parameter access? (Answer: Phase 3+ persists — campaign progression is one-way.)
- **Community guide fragmentation.** Guides and tutorials must account for "at your campaign stage, you'll see..." Instead of one skill UI to document, there are four. Community screenshots show different UIs for the same game.
- **The Phase 2 "lock" can frustrate.** A player who understands compression threshold and wants to change it — but can't because they're in Mission 4 — feels artificially gated. The lock must not feel patronizing. Mitigation: the lock tooltip should explain why ("Campaign authorization pending" feels better than "feature locked").
- **Pipeline View adoption.** If Pipeline View is optional, most players will never use it. If it's required for Mission 7+ command agents, the "optional" framing is dishonest. The adoption question needs resolution: is it a power tool or a teaching tool?

### Comparable Games

- **Factorio's progressive recipe complexity.** Early game: one input, one output, obvious. Mid game: multi-input recipes, byproducts, modules. Late game: nuclear processing, beacons, quality tiers. The UI doesn't change — but the *content* within it escalates. Robot Uprising's approach is more dramatic: the UI itself transforms.
- **Slay the Spire's act-based complexity.** Act 1 decks are simple. Act 3 decks have intricate synergies. The card UI is consistent — but the player's relationship with it evolves. The Tuning Bench's "summary lines become editable" mirrors this: same objects, deeper interaction.
- **Civilization tutorial advisor.** Civ shows increasingly complex UI elements as the game progresses. The advisor explicitly says "you've unlocked new features." Robot Uprising's boot log serves the same function diegetically.

---

## Cross-Paradigm Interaction Effects

### With Rules Language (3.05)

The skill UI and rules language must share a visual vocabulary. If the skill for compress shows a parameter "threshold: 3," the rules language must be able to reference that parameter: "IF buffer_fill > threshold THEN compress." The skill UI's parameter names become the rules language's variables. This creates a requirement: **skill parameter names must be unique, short, and intuitive enough to use as identifiers in rules.**

Paradigm C (Tuning Bench) and F (Progressive Reveal) handle this best — parameters are visibly named inline. Paradigm D (Card Tray) hides parameters on the card back, creating a navigation burden when writing rules that reference skill parameters.

### With Hooks (3.08)

Hooks trigger from skill events. The skill UI should indicate which skills have hooks wired to them. A small hook icon (🔗 or a chain-link glyph) on the skill row/card/node signals "this skill's events are connected to a channel." Clicking the hook icon could jump to the hook section with the relevant hook highlighted.

Paradigm E (Blueprint Schematic) has the natural advantage here — hooks can be shown as additional connection lines leaving skill nodes, colored differently from intra-skill connections (orange for hook wires vs. green for data flow). The skill graph and hook wiring graph share the same visual space.

### With Sealed Watch

During sealed watch, the player cannot interact with the skill UI. But the skill UI's visual language should carry into the battlefield. If skills are cards (Paradigm D), the card accent colors should match the skill-effect colors on the battlefield (cyan patrol ripple, red evade flinch). If skills are nodes (Paradigm E), the pipeline animation during Inspector should use the same connection-line style as the workbench graph.

### With Accessibility (Platform)

Toggle Panel (A) is the most accessible: binary, keyboard-navigable, screen-reader-compatible. Card Tray (D) and Blueprint Schematic (E) are the least accessible: drag-dependent, spatially complex, hard to linearize for screen readers. Progressive Reveal (F) has an elegant accessibility story: players who need simplified interaction can stay in Phase 1-2 mode even in late game via an accessibility setting ("Simple Skill View: always show toggles").

### With Mobile/Controller (Platform)

| Paradigm | Mouse | Touch | Controller |
|----------|-------|-------|------------|
| A. Toggle | ★★★★★ | ★★★★★ | ★★★★★ |
| B. Loadout | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| C. Tuning Bench | ★★★★☆ | ★★★★☆ | ★★★★☆ |
| D. Card Tray | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| E. Blueprint | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ |
| F. Progressive | ★★★★★ | ★★★★☆ | ★★★★☆ |

---

## Player Journeys

### Journey: Tomás, 16, First-Time Strategy Game Player

**Context:** Mission 3. Tomás has just unlocked relays. He's been using scouts and strikers with toggle-only skill configs. He's comfortable with "turn skill on, see result on board." The relay has three skills: compress, filter, amplify. This is his first 3-skill unit.

**Minute 0:00 — Opening the Relay Config**
Tomás selects the relay ghost on the board. The workbench right panel slides to show the relay's blueprint editor. At the top: the skill section. Three rows, each with a filled green circle (all skills active by default), a skill name, and a [?] icon. He's seen this pattern before with scouts.

He hovers over "compress" and reads the tooltip: "Combines redundant buffer entries into summaries. Threshold determines how many entries trigger compression." He doesn't fully understand "threshold" but sees the toggle is on. The board shows a small funnel icon above the relay ghost.

**Minute 0:30 — First Parameter Encounter (Paradigm C/F)**
Below each skill name, a one-line summary reads: "threshold: 3, trajectory mode." Tomás clicks the summary text. The accordion expands — a slider labeled "Threshold" appears (range 2-5, currently at 3). He drags it to 5. With each notch, a *tick* sounds and the funnel icon on the board grows slightly — visual feedback that the relay will accumulate more before firing.

He pauses. "5 entries before it compresses... that means it waits longer, right?" He drags it back to 2. The funnel shrinks. "Ok, 2 is fast but maybe worse quality." He settles on 3 — the default — and collapses the panel.

**Minute 1:15 — Skill Ordering Discovery**
He notices the skills are listed: compress, filter, amplify. He wonders: does it matter? He re-reads the compress tooltip: "processes buffer entries." Filter tooltip: "discards entries matching criteria." He realizes: if filter runs before compress, noise gets removed before compression. If compress runs first, noise gets included in the summary.

He drags "filter" above "compress" in the list (Tuning Bench supports drag-reorder of collapsed rows). The rows swap with a smooth animation. The board doesn't change visually — but Tomás now understands that his relay filters first, then compresses the survivors.

**Minute 2:00 — Hitting EXECUTE**
He configures the filter to drop "scout_alerts" (too noisy from his aggressive patrol route). The collapsed summary now reads: "filter: drop scout_alerts." He scans all three: filter → compress (threshold 3) → amplify (boost +1). Three lines. He hits EXECUTE.

**Minute 3:30 — Post-Battle Inspector**
During debrief, Tomás clicks the relay in Inspector. The buffer state replay shows: signals arriving → scout_alerts disappearing (filter), → remaining signals merging into compressed summaries (compress), → summaries gaining a small upward arrow icon (amplify). The skill pipeline animated in his Inspector matches the order he configured.

"Oh. The order I put them in IS the order they run. That's... actually really cool."

**UI Annotations:**
- Skill section: 3 rows × ~40px each = 120px height, top of workbench right panel
- Accordion expand: 200ms slide, adds ~60px per expanded skill
- Drag-reorder: horizontal grab handle (⠿ icon) on left edge of each row
- Board ghost: funnel icon above relay position scales with compress threshold

---

### Journey: Dr. Priya, 38, ML Engineer and Factorio Veteran

**Context:** Mission 7. Priya has full access to all skills, parameters, and unit types. She's configuring a command unit with reassign, reroute, and prioritize. She's been using Tuning Bench (Paradigm C) comfortably since Mission 5 but has noticed the Pipeline View toggle that appeared this mission.

**Minute 0:00 — Pipeline View Curiosity**
Priya sees the graph icon in the skill section header. She's been meaning to try it. She clicks it. The three skill rows morph into three nodes in a mini graph canvas. The morph takes 500ms — each row slides apart and repositions as a floating box. Connection lines haven't been drawn yet — the three nodes are disconnected.

"Huh. So I need to wire them." She recognizes this from Unreal Engine's Blueprint editor — her team uses it for rapid prototyping.

**Minute 0:30 — Wiring the Command Pipeline**
She clicks the output port on the "reassign" node (right edge, small circle appears on hover). An elastic line stretches from the port. She drags it to the "reroute" node's input port. *Click-hum* — the connection solidifies. A green data-flow line now connects reassign → reroute.

She wires reroute → prioritize. Now the graph reads: reassign → reroute → prioritize. A three-stage command pipeline. She clicks the "reassign" node to expand parameters: target unit type selector, channel selector, skill to assign. She configures reassign to target relays on channel "intel" and assign the compress skill with threshold 4.

**Minute 1:30 — Graph as Diagnostic Tool**
Priya realizes the graph clarifies something she'd been confused about. In list view, she couldn't tell whether "prioritize" acted on the command unit's own buffer or on subordinate buffers. In graph view, the connection line from reroute → prioritize shows that prioritize receives reroute's output — meaning it acts on the rerouted signals, not raw buffer contents.

"This is literally a data flow diagram. The graph doesn't just show order — it shows what data reaches each skill." She screenshots the graph and sends it to her team Slack: "Look, the game teaches pipeline composition through a visual debugger."

**Minute 3:00 — Inspector Replay with Pipeline Overlay**
After EXECUTE, she opens Inspector and clicks the command unit. The graph appears in the sidebar, but now it's animated: data pulses flow along connection lines in sync with the tick timeline. At tick 12, she sees a pulse enter reassign, pause for one tick (processing), flow to reroute, pause, flow to prioritize. At tick 15, the pulse reaches the end and a yellow arrow fires from the command unit to a subordinate relay — the reroute command being issued.

She scrubs backward to tick 10 — before the pipeline activated. The graph shows no pulses. She scrubs forward again: tick 12, the intelligence entry from a specialist arrives in the command buffer (green jagged border), triggering the pipeline. She watches the cascade three times.

"I'm watching my code execute. Visually. This is better than any debugger I've used at work."

**UI Annotations:**
- Pipeline View toggle: graph icon (two connected nodes, 16×16px) in skill section header, beside list icon
- Node graph canvas: ~280×200px within workbench right panel
- Connection lines: 1.5px, green for data flow, orange for hook wires
- Output/input ports: 8px circles, appear on hover, enlarge to 12px when valid connection target
- Inspector pipeline replay: same graph overlaid in debrief sidebar, with animated data pulses synced to tick scrubber

---

### Journey: Kai, 11, Minecraft Builder and First-Time Player

**Context:** Mission 1. Kai has never played a strategy game. He just finished the boot log sequence. The workbench is open with a single scout. He sees two toggles: patrol and evade.

**Minute 0:00 — First Contact with Skill UI**
The skill section shows two rows. Green filled circle next to "patrol." Hollow gray circle next to "evade." Below the section: "Skills: 1/2 active | 1e/tick."

Kai doesn't read any of this. He clicks the green circle next to "patrol." It goes hollow. The dotted cyan line on the board — the patrol path — disappears. "Oh! I turned it off." He clicks again. Filled. Path returns. "Ok, that's what that does."

He clicks the hollow circle next to "evade." It fills red. A tiny red ring flashes around the scout ghost on the board. "Skills: 2/2 active | 2e/tick" — the energy cost doubled. He doesn't know what evade does yet, but he sees it costs more energy. He toggles it off to save energy. He doesn't know if that's the right call, but the feedback loop (toggle → board change → cost change) taught him the mechanic in 10 seconds without reading anything.

**Minute 0:30 — Tooltip Discovery**
He hovers over "patrol" and notices the cursor changes over the [?] icon. He clicks it. A tooltip slides in: "Moves along waypoints, observing all units within perception radius each tick." He skims it. The key phrase registers: "moves along waypoints." He looks at the board — the dotted cyan line is the waypoint path. "So that's what the line means!"

He hovers over the waypoint path on the board. Tooltip: "Patrol path. Click to add waypoint, drag to reposition." He clicks a tile. A new waypoint appears. The dotted line reroutes through it. "This is like making a redstone path!" (His Minecraft mental model kicks in.)

**Minute 1:00 — EXECUTE**
He doesn't configure anything else. He hits EXECUTE. The scout moves along the cyan path. Each tile it enters pulses blue. When it spots an enemy, a yellow ping appears. Kai watches the scout circling his path.

"Cool! But it didn't do anything to the enemy..." He realizes the scout observes but doesn't fight. He needs a striker. The next unit placement will introduce engage. But the toggle UI taught him the core loop: toggle → see on board → run → watch.

**UI Annotations:**
- Toggle circles: 20px diameter, centered vertically in 40px row
- Skill name: 14px, Inter font, left-aligned after 8px gap from toggle
- [?] icon: 16px, right-aligned, `#6B7280` at rest, `#E5E7EB` on hover
- Energy counter: bottom of skill section, 11px, `#9CA3AF` dim gray
- Board spatial response: <100ms latency from toggle to preview update

---

### Journey: Amara, 45, Project Manager, Accessibility Needs (Low Vision)

**Context:** Mission 5. Amara has low vision and uses the game at 150% UI scale with high-contrast mode enabled. She's configuring a relay for the first time with full parameter access.

**Minute 0:00 — Scaled Tuning Bench**
At 150% scale, the workbench right panel is wider but the content is proportionally larger. The skill section shows three rows for the relay. Each toggle circle is now 30px (scaled from 20px). Skill names are 21px. The collapsed summaries are 16px — legible without squinting.

High-contrast mode has changed the color scheme: skill accent colors are brighter and paired with thick (4px instead of 2px) borders on the expanded accordion. The background is true black (`#000000`) instead of dark gray. Toggle filled state uses maximum saturation accent colors.

**Minute 0:30 — Slider Accessibility**
She clicks "compress" to expand the accordion. The slider for "Threshold" appears. At 150% scale, the slider track is wide enough (240px) for precise thumb positioning. But the thumb is small — she overshoots from 3 to 5. She uses arrow keys instead: focus the slider (tab), left/right arrow to decrement/increment by 1. Each arrow press triggers the ratchet *tick* and the value label updates. "3... 2... that's too low. 3." The arrow-key interaction is more precise than the drag.

The value label ("3 entries") is displayed at 16px in high-contrast white on black. She reads it easily.

**Minute 1:00 — Keyboard Navigation**
She tabs through the skill section. Tab order: compress toggle → compress expand/collapse → [threshold slider → source filter dropdown → output format radio group] → filter toggle → filter expand/collapse → [...] → amplify toggle → [...]. The focus ring is a thick (3px) amber outline — visible at her vision level.

Each focused element announces via screen reader: "Compress, active. Press Enter to expand configuration." She presses Enter. "Compression threshold, slider, value 3, range 2 to 5. Use left and right arrows to adjust."

**Minute 1:30 — Board Feedback at Scale**
When she adjusts the threshold, the board's ghost relay shows the funnel icon scaling. At 150% zoom, the funnel is clearly visible — it was tiny at 100% but scales with the board zoom. The preview update latency is the same (<100ms). She can see the spatial consequence of her parameter change despite her vision limitations.

"Ok, threshold 3 makes the funnel medium-sized. I'll leave it. Now let me configure the filter..." She tabs to the next skill.

**UI Annotations:**
- 150% scale: all dimensions × 1.5, layout reflowed for wider panel
- High-contrast mode: true black background, maximum saturation accent colors, 4px borders
- Slider: minimum thumb size 44px (iOS HIG), arrow key increment = 1 unit
- Focus ring: 3px amber (`#F59E0B`) outline, 2px offset from element
- Screen reader: ARIA labels on all interactive elements, live region for value changes
- Tab order: linear, top-to-bottom, expand/collapse groups are collapsible ARIA regions

---

## The Recommendation Space

No single paradigm is "correct." The choice depends on which interaction values the game prioritizes:

| Priority | Best Paradigm |
|----------|--------------|
| Fastest onboarding | A (Toggle Panel) |
| Deepest configuration | E (Blueprint Schematic) |
| Best physical feel | D (Card Tray) |
| Best information density | C (Tuning Bench) |
| Best cross-platform | A (Toggle Panel) or C (Tuning Bench) |
| Best long-term engagement | F (Progressive Reveal) |

**The strongest candidate is Paradigm F (Progressive Reveal)** with the following phase mapping:

- Missions 1-2: Toggle Panel (Phase 1)
- Missions 3-4: Toggle + Summary (Phase 2) — player sees parameters exist
- Mission 5+: Full Tuning Bench (Phase 3) — player configures everything inline
- Mission 7+ (optional): Pipeline View for relay/command (Phase 4)

This mirrors the locked campaign's complexity ramp, uses the boot log as a diegetic unlock mechanism, and provides an accessibility escape hatch (stay in Phase 1 via settings).

---

## The TikTok Clip

**15 seconds:** A relay's skill section in Tuning Bench mode. The player drags "filter" above "compress" — the rows swap. They expand compress, drag the threshold slider from 3 to 5 — each notch *ticks*. They collapse it. The board shows the relay's funnel icon growing. Cut to sealed watch: the relay processes a flood of signals, filtering noise, compressing survivors into clean summaries, amplifying the result. Green concentric rings pulse outward. Cut to Inspector: the same pipeline animated in the sidebar graph, data pulses flowing node to node in perfect sync with the tick scrubber. Text overlay: "you built a data pipeline. it worked."

---

## Discovered Aspects

- **3.04a — Skill parameter naming conventions:** parameters must serve double duty as UI labels and rule-language identifiers; naming constraints, abbreviation rules, localization implications
- **3.04b — Skill execution order as explicit vs. implicit design decision:** when ordering is player-configurable (drag-reorder, graph wiring) vs. fixed per unit type; which approach better serves the "emergent combo" design goal
- **3.04c — Skill UI animation budget:** total milliseconds of animation in the skill section per interaction; when does tactile satisfaction cross into sluggishness; 100ms vs. 200ms vs. 400ms feel thresholds
- **3.04d — Cross-unit skill comparison view:** a mode showing all 5 unit types' skill configs side-by-side in a grid; army-wide skill audit; when does this become necessary vs. per-unit inspection
- **3.04e — Skill UI state persistence across blueprint copies:** when a player copies a blueprint, which skill parameters carry over and which reset; the "clone vs. template" distinction for skill configs
