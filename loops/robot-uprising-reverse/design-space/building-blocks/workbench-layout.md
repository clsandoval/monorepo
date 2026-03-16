# 3.14 — Workbench Layout: The Full Agent Configuration Screen

The workbench IS the game. Every other screen — sealed watch, inspector, campaign map — exists to show the consequences of what you built here. This analysis explores six fundamentally different layout paradigms for how skills, rules, hooks, context config, production queue, and channel map coexist in a single screen. The locked spec says "board left, workbench right" — but the workbench's internal organization has enormous design space.

---

## The Layout Problem

The Plan screen must display, simultaneously or on-demand:
- **Tactical map preview** (8×8 board with spawn points, terrain, enemy spawners)
- **Blueprint editor** with four subsystems:
  - Skills (toggle/equip, limited slots)
  - Rules (ordered condition→action pairs, drag-to-reorder)
  - Hooks (channel wiring, trigger→action)
  - Context Config (buffer listen/ignore, eviction priority)
- **Production queue** (conveyor belt of blueprint icons)
- **Channel map** (auto-generated read-only summary)
- **Blueprint selector** (which blueprint you're editing)
- **Resource display** (minerals, energy budget)
- **EXECUTE button** (top-right, locked position)

That's 8+ distinct information regions competing for screen space. The average player monitor is 1920×1080. The board consumes ~40% of the left side. The remaining ~60% right side must house everything else.

The core tension: **depth vs. breadth**. Show all four subsystems simultaneously (shallow but comprehensive) or focus on one at a time (deep but requires navigation)?

---

## Option A: "The Tabbed Workbench"

### Layout Description

The right 60% is a single-panel editor with a **tab bar** across the top:

```
┌──────────────────────┬───────────────────────────────┐
│                      │ [Scout▾] [Skills|Rules|Hooks|Ctx] │
│                      │ ┌─────────────────────────────┐│
│    8×8 BOARD         │ │                             ││
│    (preview)         │ │   ACTIVE TAB CONTENT        ││
│                      │ │   (full height, full width)  ││
│                      │ │                             ││
│                      │ │                             ││
│                      │ └─────────────────────────────┘│
│                      │ ┌─────────────────────────────┐│
│  [Channel Map]       │ │  ◀ ▶ Production Queue ▶▶    ││
│                      │ └─────────────────────────────┘│
│                      │                    [EXECUTE ▶]  │
└──────────────────────┴───────────────────────────────┘
```

**Blueprint selector** is a dropdown at top-left of the workbench. **Tab bar** switches between Skills, Rules, Hooks, Context Config. Each tab gets the full vertical space (~500px at 1080p) — no cramming. Production queue is a fixed horizontal strip at the bottom. EXECUTE button is anchored top-right.

### How It Works

- **One tab visible at a time.** Player clicks "Rules" → sees full rule list with drag-reorder handles, condition→action strips, priority numbers. Clicks "Hooks" → sees all hook slots with channel inputs, trigger selectors, payload config.
- **Tab badge indicators** show configuration completeness: a green dot on "Skills" means all slots filled, amber dot on "Rules" means rules exist but warnings detected, empty circle on "Hooks" means no hooks configured yet.
- **Keyboard shortcut: 1-2-3-4** to switch tabs instantly. Tab to cycle forward.
- **Blueprint dropdown** shows all blueprints with tiny status icons (✓ complete, ⚠ warnings, ○ empty).
- **Board preview** responds to tab: hovering a skill shows its perception radius on the board; hovering a hook shows the channel wiring; hovering a rule shows the ghost unit's predicted behavior path.

### Sensory Description

The tab bar sits in a brushed-metal tray, each tab a raised rectangular button with an icon: ⚡ Skills, 📋 Rules, 🔗 Hooks, 🧠 Context. The active tab glows with a thin cyan underline that slides smoothly between tabs (200ms ease-out). Switching tabs triggers a subtle mechanical *click* — like flipping a hardware switch — and the content area cross-fades (150ms). The tab bar has the feel of a physical electronics workbench with labeled sections.

### Strengths

- **Maximum vertical space** for each subsystem. Command agents with 20 rules can display all of them without scrolling.
- **Simple mental model.** Four tabs, four things. No hidden panels.
- **Scales to small screens.** Works on laptops, tablets, even phones (tabs become a bottom nav).
- **Clean screenshots.** Each tab is self-contained — streamers can show one clear view.
- **Proven pattern.** IDE-style tab navigation is universally understood.

### Weaknesses

- **Cross-subsystem blindness.** When editing rules, you can't see hooks. This is the fatal flaw for a game about *wiring systems together*. A player might write a rule that references a channel they forgot to configure in the Hooks tab.
- **Tab-switching tax.** Players bounce between tabs constantly. "Wait, what channel did I put on that hook?" → click Hooks → read → click Rules → continue. Death by a thousand clicks.
- **No gestalt view.** You never see the full agent configuration at once. Impossible to develop intuition for "what makes a good agent" because you can only see 25% at a time.
- **Anti-discovery.** Beginners may not realize tabs exist. "I equipped skills and hit execute. Where are the rules?"

### Interaction Effects

- **With rules language (3.05):** Excellent for sentence strips — full width available for long rule chains.
- **With hooks UI (3.11):** Patch bay paradigm works beautifully in dedicated full-size panel.
- **With Inspector:** Inspector's decision trace shows "rule 4 fired because hook on channel 'recon-net' delivered data" — but if the player edited rules and hooks in separate tabs, reconstructing this chain requires mental assembly.
- **With mobile (6.07):** Natural portrait-mode adaptation — tabs become bottom navigation.
- **With tutorial (5.00):** Tab unlocking creates clean progressive disclosure — Mission 1 shows only Skills tab, Mission 3 adds Rules tab, Mission 4 adds Hooks tab.

### Comparable Games

- **VS Code / any IDE:** Tab-based editors are the default for managing multiple file types. But IDEs also have split panes — which this option lacks.
- **Gladiabots:** Uses a single canvas for the behavior tree. No tabs needed because there's one paradigm (node graph). Robot Uprising's four primitives demand more structure.
- **Factorio:** Entity GUI is a single panel with sections. No tabs — everything visible at once. But Factorio entities have fewer configuration dimensions.

---

## Option B: "The Dashboard"

### Layout Description

All four subsystems visible simultaneously in a **quadrant grid**:

```
┌──────────────────────┬───────────────┬───────────────┐
│                      │  ⚡ SKILLS    │  📋 RULES     │
│                      │  ┌─┬─┬─┐     │  1. IF→THEN   │
│    8×8 BOARD         │  │■│■│○│     │  2. IF→THEN   │
│    (preview)         │  └─┴─┴─┘     │  3. IF→THEN   │
│                      ├───────────────┼───────────────┤
│                      │  🔗 HOOKS    │  🧠 CONTEXT   │
│                      │  ☐→recon-net │  Size: [■■■○] │
│  [Channel Map]       │  ☐→cmd-bus   │  Listen: ✓✓✗  │
│                      │  ☐→alert     │  Evict: LRU   │
│                      ├───────────────┴───────────────┤
│                      │ ◀ ▶ Production Queue ▶▶       │
│                      │                    [EXECUTE ▶] │
└──────────────────────┴───────────────────────────────┘
```

Each quadrant is ~300×200px at 1080p. All four subsystems always visible. Clicking any quadrant **expands** it to take the full workbench area (with a smooth 300ms zoom animation), clicking again collapses back to quadrant view.

### How It Works

- **Bird's eye default.** Player sees their entire agent configuration at a glance. Skills are filled/empty slots, rules are numbered rows, hooks show channel names, context shows the buffer gauge.
- **Click-to-zoom.** Click any quadrant → it smoothly expands while others shrink to icon-sized strips along the edge. Full editing capability appears. Click the collapse icon or press Escape → zooms back to overview.
- **Cross-quadrant highlighting.** Hovering over a hook's channel name highlights the matching rule conditions that reference that channel (in the Rules quadrant) AND the listen/ignore toggle in Context Config. The four panels are **live-linked**.
- **Blueprint selector** is a strip above the quadrant grid showing all blueprint icons. Click to switch. Active blueprint's icon has a cyan ring.
- **Production queue** is below the quadrant grid.

### Sensory Description

The quadrant grid feels like a mission control dashboard — four screens in a 2×2 array, each with its own border glow (skills = electric blue, rules = amber, hooks = green, context = purple). When the player hovers over a hook, a thin green thread visually connects from the Hooks quadrant to the matching filter in the Context quadrant and the matching condition in the Rules quadrant — like laser tripwires linking across the dashboard. The zoom animation is satisfying: the selected quadrant rushes forward while others recede with a motion blur, accompanied by a soft *whoosh* and a mechanical *lock* when it reaches full size.

### Strengths

- **Gestalt view.** The player sees the whole agent. "I have 3 skills, 5 rules, 2 hooks, and my buffer is set to 8." Instant architecture assessment.
- **Cross-reference heaven.** The live-linking between quadrants teaches how subsystems interact — the core lesson of the game.
- **Scalability signal.** A beginner's quadrants are sparse (1 skill, 2 rules, 0 hooks). A veteran's quadrants are dense. The visual density itself communicates architectural complexity.
- **Screenshot-friendly.** A single screenshot captures the full agent spec. Perfect for sharing, streaming, community discussion.

### Weaknesses

- **Cramped at scale.** A Command agent with 14 buffer, 6 hooks, and 12+ rules cannot display everything in a 300×200px quadrant. The overview becomes illegible.
- **Click-to-zoom disruption.** Expanding one quadrant hides the others — losing the gestalt benefit during the exact moment you're doing detailed work.
- **Information overload for beginners.** Four panels of unfamiliar content is overwhelming. "What are all these boxes?"
- **Priority ordering difficulty.** Rules need full-height drag reordering — hard in a short quadrant. Drag-reorder in 200px means fitting maybe 4 rules visible at once.

### Interaction Effects

- **With rules panel at scale (3.07a):** The Cartographer's Rack minimap could serve AS the quadrant overview, with click-to-zoom revealing the full rack. Natural synergy.
- **With animated tooltips (1.17a):** Hovering a skill in the Skills quadrant triggers the animated tooltip on the board. The quadrant-board spatial relationship makes this natural — the preview is always visible.
- **With sealed watch:** The quadrant layout pre-teaches the player to read four information streams simultaneously — preparation for reading the battlefield with buffer bars, signal chains, and tick clock.
- **With co-op (6.06c):** Two players could each "own" different quadrants on shared screens.

### Comparable Games

- **PagerDuty / Grafana dashboards:** Real-world operations dashboards use exactly this pattern: overview tiles that expand to detail on click.
- **Oxygen Not Included:** Overlay modes let you see one system at a time, but the base is always visible. Similar "multiple systems on one entity" problem.
- **XCOM 2 soldier loadout:** Shows weapon, armor, accessories, perks simultaneously in a character sheet view. But fewer configuration dimensions than Robot Uprising.

---

## Option C: "The Vertical Stack"

### Layout Description

All four subsystems stacked vertically in a **single scrollable column**:

```
┌──────────────────────┬───────────────────────────────┐
│                      │ [Scout▾]          [EXECUTE ▶]  │
│                      │ ┌─ ⚡ SKILLS ────────────────┐│
│    8×8 BOARD         │ │ [■patrol] [■evade] [○    ] ││
│    (preview)         │ └────────────────────────────┘│
│                      │ ┌─ 📋 RULES ────────────────┐│
│                      │ │ 1. IF enemy_near → evade   ││
│                      │ │ 2. IF signal → move_toward ││
│                      │ │ 3. → patrol (default)      ││
│                      │ └────────────────────────────┘│
│  [Channel Map]       │ ┌─ 🔗 HOOKS ────────────────┐│
│                      │ │ ☐ ON_ENEMY → recon-net     ││
│                      │ └────────────────────────────┘│
│                      │ ┌─ 🧠 CONTEXT ──────────────┐│
│                      │ │ Size: 6  Listen: recon-net ││
│                      │ └────────────────────────────┘│
│                      │ ┌─ Production Queue ──────────┐│
│                      │ │ ◀ 🤖🤖📡⚔ ▶              ││
│                      │ └────────────────────────────┘│
└──────────────────────┴───────────────────────────────┘
```

A long-form single column showing Skills → Rules → Hooks → Context Config in **top-to-bottom reading order**. Sections can be collapsed (click the header to toggle). The visual metaphor is a **spec sheet** — a technical document you scroll through.

### How It Works

- **Scroll to navigate.** Mouse wheel or touch swipe scrolls through the agent's full configuration. The board stays fixed on the left.
- **Collapsible sections.** Click a section header to collapse/expand. By default, all sections are expanded for the current blueprint.
- **Sticky headers.** As you scroll past a section, its header pins to the top of the workbench panel, showing which section you're in and providing a navigation breadcrumb.
- **Section height is dynamic.** Skills section is short (3 slots for Scout). Rules section is tall (12+ slots for Command). The layout adapts to the blueprint's needs.
- **Board hover cross-reference.** Hovering anything in the column highlights the corresponding element on the board — same as all options.

### Sensory Description

The vertical stack feels like reading a blueprint document — a technical spec sheet with labeled sections. Each section header is a dark cyan bar with the section icon and title, running the full width. Between sections, a 1px separator line with a slight glow. Scrolling is smooth with momentum, and the collapsing animation is a 200ms accordion fold with a soft *clack* when sections snap shut. Expanded sections have a subtle left-border accent in the section's color (blue/amber/green/purple). The overall feeling is **paper on a clipboard** — industrial, readable, authoritative.

### Strengths

- **Natural reading order.** Skills define what the unit can do. Rules define when. Hooks define communication. Context defines memory. The vertical sequence IS the cognitive flow of designing an agent.
- **Unlimited vertical space.** Rules can be as tall as needed. No cramping. 20 rules? Just scroll.
- **Progressive disclosure built-in.** Collapse unused sections. Beginners see Skills only. Veterans see everything.
- **Mobile-native.** This IS how mobile apps work. The vertical stack translates to phones with zero layout redesign.
- **Familiar pattern.** Settings pages, form builders, document editors — everyone knows how to scroll.

### Weaknesses

- **Scroll fatigue.** On a Command agent, the full spec might be 3-4 "screens" tall. Scrolling back and forth between Rules and Hooks is tedious.
- **Context loss.** When deep in the Rules section, Skills and Hooks are off-screen. No gestalt view.
- **Passive feeling.** Scrolling through a document doesn't feel like *building* something. It feels like *filling out a form*. The game should feel like an engineering workbench, not a tax return.
- **Priority ordering challenge.** Long drag operations (reordering rule 15 from bottom to top) in a scrollable container are notoriously frustrating (the "scroll-while-dragging" problem).

### Interaction Effects

- **With rules language (3.05):** Sentence strips work well — full width available.
- **With skill UI (3.04):** Progressive Reveal paradigm maps naturally to collapsible sections — Skills section evolves from simple toggle to full tuning bench.
- **With Inspector:** Inspector's decision trace is ALSO a vertical scrollable stack (event log, context state, rule match). Consistent layout language across Plan and Inspector.
- **With onboarding:** Section-by-section reveal across missions is trivially implemented — just don't render locked sections.

### Comparable Games

- **Slay the Spire deck view:** Scrollable vertical list of cards. Works for browsing, bad for complex editing.
- **XCOM 2 / Darkest Dungeon character sheets:** Vertical scroll through stats, equipment, abilities. Familiar and functional.
- **iOS Settings app:** The definitive vertical stack UI. Universally understood.
- **Shenzhen I/O:** The code editor for each chip IS a vertical list of instructions. But it's tiny (9-14 lines max) and doesn't scroll.

---

## Option D: "The Sidebar Drawer"

### Layout Description

A **minimized sidebar** showing section icons, with a **flyout drawer** that opens to reveal full editing for the selected section:

```
┌──────────────────────┬──┬────────────────────────────┐
│                      │⚡│                            │
│                      │📋│  ← ACTIVE DRAWER           │
│    8×8 BOARD         │🔗│     (Rules panel,          │
│    (preview)         │🧠│      full editing)          │
│                      │──│                            │
│                      │📦│                            │
│                      │  │                            │
│  [Channel Map]       │  │                            │
│                      │  │                            │
│                      │  │ Production Queue            │
│                      │  │                  [EXECUTE ▶]│
└──────────────────────┴──┴────────────────────────────┘
```

The sidebar is a narrow (48px) icon strip between the board and the drawer. Each icon represents a subsystem. Clicking an icon opens its drawer. Clicking the same icon again or pressing Escape closes it. The sidebar icons show **status badges** (green/amber/red pips).

### How It Works

- **Sidebar is always visible.** Five icons stacked vertically: Skills, Rules, Hooks, Context, Production. Each icon has a tiny status indicator — filled slots count, warning count, etc.
- **Click to open drawer.** A smooth slide-in animation (250ms) reveals the full editing panel for that subsystem. The drawer takes the remaining width (~45% of screen).
- **Multiple drawers (advanced).** Hold Shift+click to open a second drawer in split mode — side-by-side Rules and Hooks editing. Maximum two drawers open simultaneously.
- **Board auto-responds.** Opening the Hooks drawer dims the board and shows channel wiring overlays. Opening Skills shows perception radii. The board is an extension of whatever drawer is open.
- **Drawer width is resizable.** Drag the drawer edge to make it wider or narrower. Preferences persist per section.

### Sensory Description

The sidebar feels like a **tool rack on the edge of a workbench** — vertical strip of rounded square icons with subtle emboss. The active icon lights up cyan while its drawer slides out with a satisfying mechanical *snap*. The drawer panel has a slight drop shadow on its left edge, creating the illusion of a physical sliding panel emerging from behind the board. When two drawers are open in split mode, a thin divider bar between them pulses gently, inviting the player to notice both panels.

### Strengths

- **Board stays large.** When no drawer is open, the board takes ~95% of the screen. Opening one drawer reduces it to ~55%. The board is never tiny.
- **Progressive disclosure.** Beginners might only open Skills. The other icons sit there as invitations, not obligations.
- **Split mode enables cross-reference.** Rules + Hooks side-by-side is exactly the view needed to wire an agent's communication architecture.
- **Minimal chrome.** The sidebar is 48px. Almost all screen space goes to content.
- **Power-user friendly.** Keyboard shortcuts (1-4) open drawers instantly. Power users never touch the sidebar.

### Weaknesses

- **Hidden by default.** If all drawers are closed, the player sees... just a board. "Where do I configure my agents?" Discoverability problem.
- **No overview state.** Unlike the Dashboard, there's no moment where you see all four subsystems at once (unless using split mode, which only shows two).
- **Split mode complexity.** Teaching two-drawer split mode is an extra cognitive step. Most players won't discover it.
- **Icon legibility.** 48px icons must communicate "Skills," "Rules," "Hooks," "Context Config" at a glance. Hard without labels.

### Interaction Effects

- **With command agent (3.17):** The Control Room paradigm (three-column dashboard) could be a special Command-only drawer layout — when editing a Command blueprint, the drawer shows the org chart.
- **With mobile (6.07):** Drawers become bottom sheets on mobile — swipe up from bottom icons. Natural touch adaptation.
- **With streaming:** The board-dominant default (no drawers open) is perfect for sealed-watch-like streaming moments. Open a drawer for analysis, close it for drama.
- **With EXECUTE ritual (6.06b):** The transition from "drawers open" to "all drawers close → board expands to full → EXECUTE" is a satisfying pre-battle ceremony.

### Comparable Games

- **Figma / Photoshop:** Left toolbar with flyout panels. The standard creative tool pattern.
- **Into the Breach:** Hover tooltips expand to show attack info. Not a drawer, but the "expand on demand" principle is the same.
- **Discord:** Server icons on left, channel panel slides out, chat takes the rest. Same sidebar-drawer topology.

---

## Option E: "The Blueprint Schematic"

### Layout Description

A **single unified visual canvas** where all four subsystems are rendered as interconnected visual elements, not separate panels:

```
┌──────────────────────┬───────────────────────────────┐
│                      │ [Scout Blueprint]   [EXECUTE ▶]│
│                      │                               │
│                      │    ┌─patrol─┐   ┌──────────┐ │
│    8×8 BOARD         │    │ ⚡     ├──→│ IF enemy  │ │
│    (preview)         │    └─evade──┘   │ → evade   │ │
│                      │                 │ IF signal  │ │
│                      │    ┌─recon──┐   │ → move    │ │
│                      │    │ 🔗     ├──→│ → patrol  │ │
│                      │    └────────┘   └────┬──────┘ │
│  [Channel Map]       │                      │        │
│                      │    ┌─buffer──────────┘        │
│                      │    │ 🧠 [■■■■■○]             │
│                      │    └─────────────────         │
│                      │ ◀ ▶ Production Queue ▶▶       │
└──────────────────────┴───────────────────────────────┘
```

Skills, rules, hooks, and context are rendered as **nodes on a canvas** with visible connections between them. The layout is a visual schematic — a circuit diagram of the agent's mind.

### How It Works

- **Skills are input nodes** on the left. Each skill is a rounded rectangle with its icon and name.
- **Rules are the central processing column.** Each rule is a card showing condition→action. Rules are connected to skills (which skills they reference) and hooks (which channels they check).
- **Hooks are connection nodes** linking to channels. Wires run from hook nodes to the channel map.
- **Context Config is the memory node** at the bottom, with buffer size visualization and connections showing what feeds into the buffer.
- **Drag to rearrange.** Players can drag nodes around the canvas to organize their schematic. Auto-layout button snaps to a clean arrangement.
- **Wires between nodes** show data flow: skill→rule (what conditions reference), hook→buffer (what signals arrive), buffer→rule (what data rules read).

### Sensory Description

The canvas has a dark charcoal background with a subtle grid pattern — like an electronics CAD program. Nodes are rounded rectangles with colored header bars (blue for skills, amber for rules, green for hooks, purple for context). Wires between nodes are thin dashed lines with flowing particles (like electrons) that travel from source to destination. The particles' speed indicates signal frequency — fast particles for busy channels, slow for quiet ones. Hovering a wire highlights the full path in bright cyan. The whole canvas can be panned (middle-click drag) and zoomed (scroll wheel) like a map. The aesthetic is somewhere between a Figma canvas and an Unreal Blueprint editor — professional, dense, powerful.

### Strengths

- **Relationships are visible.** You can SEE that Hook A feeds into Buffer which feeds into Rule 3. The architecture IS the UI.
- **Matches the game's core metaphor.** The game is about building information architectures. The workbench should look like an architecture diagram.
- **Self-documenting.** A screenshot of the canvas IS a complete specification of the agent. No tab-switching, no scrolling, no hidden state.
- **Scales visually.** A simple Scout has 4-5 nodes and 3-4 wires. A complex Command has 20+ nodes and a dense web. The visual complexity directly communicates the agent's actual complexity.
- **Expert satisfaction.** Zachtronics players describe deep satisfaction in creating clean, well-organized node layouts. The canvas layout rewards aesthetic engineering.

### Weaknesses

- **Steep learning curve.** What is a "node"? What do "wires" mean? The metaphor requires learning a new visual language before you can configure anything.
- **Canvas management tax.** Players must manually arrange nodes (or rely on auto-layout). This is busywork that doesn't improve the agent.
- **Small screens are hostile.** At 1080p, 20 nodes + wires in half the screen is unreadable without zooming. Zooming means losing the gestalt.
- **Accessibility nightmare.** Screen readers cannot parse a freeform canvas. Keyboard navigation through a 2D layout is undefined.
- **Contradicts locked spec.** The locked spec describes "Skills (toggle/equip into limited slots), Rules (ordered condition→action pairs, drag to reorder priority), Hooks (reactive triggers wired to named channels), Context Config (buffer listen/ignore toggles)." These are structured, list-based interactions — not freeform canvas operations.

### Interaction Effects

- **With Inspector:** The Inspector's decision trace could animate on the same canvas — highlight the path from hook→buffer→rule→action. Plan-to-Inspector visual continuity.
- **With hook visualization (3.10):** The subway map paradigm on the board mirrors the wire paradigm on the canvas. Consistent visual language.
- **With rules UI (3.07):** Flow Lane paradigm (Unreal Blueprints) is essentially this option applied to rules specifically. Combining with a canvas layout for the whole workbench creates double-nesting — wires within wires.
- **With onboarding:** Difficult. Canvas editors have the highest barrier to entry. Requires extensive tutorial.

### Comparable Games

- **Unreal Blueprints / Unity Shader Graph:** The gold standard for node-based visual programming. Powerful, learnable, but require investment.
- **Factorio circuit network:** Players build logical circuits by wiring combinators. But this is in-world, not a separate editor.
- **Screeps:** No visual editor at all — pure code. The canvas would be a middle ground between code and structured UI.
- **Miro / FigJam:** Collaborative whiteboards with connected elements. Similar canvas interaction model.

---

## Option F: "The Evolving Workbench" (RECOMMENDED)

### Layout Description

A **progressive hybrid** that changes shape across the 10-mission campaign:

**Missions 1-2: Single Panel (Skills only)**
```
┌──────────────────────┬───────────────────────────────┐
│                      │ [Scout]           [EXECUTE ▶]  │
│    8×8 BOARD         │                               │
│    (preview)         │  ⚡ SKILLS                    │
│                      │  [■patrol] [■evade] [○    ]   │
│                      │                               │
│                      │  (nothing else visible yet)    │
│                      │                               │
└──────────────────────┴───────────────────────────────┘
```

**Missions 3-4: Stack grows (Skills + Rules)**
```
┌──────────────────────┬───────────────────────────────┐
│                      │ [Scout]           [EXECUTE ▶]  │
│    8×8 BOARD         │ ┌─ ⚡ SKILLS ────────────────┐│
│    (preview)         │ │ [■patrol] [■evade] [○    ] ││
│                      │ └────────────────────────────┘│
│                      │ ┌─ 📋 RULES ────────────────┐│
│                      │ │ 1. IF enemy → evade        ││
│                      │ │ 2. → patrol                ││
│                      │ └────────────────────────────┘│
└──────────────────────┴───────────────────────────────┘
```

**Missions 4-6: Full stack (Skills + Rules + Hooks + Context)**
Uses the Vertical Stack layout (Option C) with collapsible sections.

**Missions 7+: Dashboard mode unlocked**
Player can toggle between Vertical Stack (default) and Dashboard view (Option B) using a layout toggle in the top bar. Power users unlock the Sidebar Drawer (Option D) as a third layout option.

**Mission 5+: Production queue appears at bottom**

### The Layout Toggle

```
┌─────────────────────────────────────────────────┐
│ [Scout▾]  [≡ Stack] [⊞ Dashboard] [EXECUTE ▶] │
└─────────────────────────────────────────────────┘
```

Two (eventually three) small layout icons in the top bar. Active layout is highlighted cyan. Switching layouts triggers a 400ms morph animation where sections rearrange from vertical stack to quadrant grid (or vice versa). The animation itself teaches that these are the SAME four panels in different arrangements.

### How It Works

- **Missions 1-2:** Only Skills visible. The workbench is spacious and calm. The player focuses entirely on skill selection and skill-to-board preview. The board takes 60% of the screen.
- **Mission 3:** Rules section slides in below Skills with a "RULES SUBSYSTEM: ONLINE" boot-log moment (kulintang babendil strike). The workbench grows. The board shrinks slightly to 50%.
- **Mission 4:** Hooks and Context Config sections appear. Full vertical stack. The player now sees all four subsystems for the first time.
- **Mission 5:** Production queue conveyor belt appears at the bottom. Blueprint selector becomes a tabbed strip instead of a single dropdown. The workbench is now "full size."
- **Mission 7:** After introducing Command agents (which have many more rules/hooks), the game detects the player scrolling excessively and offers: "Your architecture has grown. Would you like to try Dashboard view?" If accepted, the Dashboard layout becomes available.
- **Mission 8+:** Players who demonstrate proficiency (using keyboard shortcuts, editing multiple blueprints per planning phase) unlock the Sidebar Drawer as a power-user option. The three layouts are always switchable from this point.

### Sensory Description

Each layout transition is a **ceremony**. When Rules first appears in Mission 3, the workbench panel literally *grows taller* — the board compresses upward with a satisfying mechanical stretch sound, and the Rules section rises from the bottom like a new drawer being installed in a workbench. The section header materializes from static into solid text: `RULES SUBSYSTEM: INITIALIZING... ONLINE`. The babendil strike punctuates the moment.

When switching from Stack to Dashboard in Mission 7, the four sections *detach* from their vertical positions and *float* briefly before snapping into the 2×2 grid — like magnetic tiles finding their positions on a whiteboard. The reverse animation shows sections *falling* back into a stack like cards being dealt into a pile.

The layout toggle icons in the top bar pulse gently (1 cycle, 5 seconds) when a new layout is unlocked, drawing attention without demanding it. After the player tries the new layout once, the pulse stops permanently.

### Strengths

- **Zero-to-hero cognitive ramp.** Mission 1 is trivially simple. Mission 10 offers three layout options. Complexity arrives exactly when the player needs it.
- **Respects locked progressive disclosure.** The four-subsystem unlock across Missions 1-4 is literalized in the UI — the workbench physically grows.
- **Multiple layout options for different thinking modes.** Stack for deep editing of one subsystem. Dashboard for architecture overview. Sidebar Drawer for focused comparison. The player chooses their workflow.
- **The growth IS the narrative.** The workbench expanding mirrors the AI's awakening. "Your systems are coming online." The UI is diegetic.
- **Best of multiple worlds.** Combines the strengths of Stack (scalable, mobile-friendly, readable), Dashboard (gestalt, cross-reference), and Drawer (board-dominant, comparison) without forcing any single tradeoff.

### Weaknesses

- **Three layout codepaths.** Implementation cost is 3× a single layout. Each layout needs to handle every subsystem, every blueprint type, every screen size.
- **Player confusion on layout switch.** "Where did my rules panel go?" when switching from Stack to Dashboard. The sections are the same, but spatial memory resets.
- **Late layouts feel artificial.** If Dashboard is genuinely better than Stack, why gatekeep it until Mission 7? If Stack is sufficient, why offer alternatives? The unlock might feel patronizing.
- **Testing matrix explosion.** Every feature must work in 3 layouts × 5 screen sizes × 2 orientations.

### Mitigation for weaknesses

- **Shared component architecture.** Each subsystem (Skills, Rules, Hooks, Context) is a self-contained React component. The layout only changes their arrangement — flex row vs. flex column vs. absolute positioning. Shared components mean shared code.
- **Layout switch animation.** The morph animation explicitly shows sections moving from one arrangement to another. "Your rules panel is HERE now" — the animation teaches spatial mapping.
- **Opt-in framing.** "Your architecture has grown. Would you like to try Dashboard view?" frames it as a suggestion, not an unlock gate. The player can decline and stay on Stack forever.

### Interaction Effects

- **With tutorial (5.00):** Each mission's workbench growth IS the tutorial. No separate tutorial needed for the workbench — the workbench IS the progressive disclosure.
- **With sealed watch:** After the workbench expands over missions, the sealed watch's "board center, no tools" feels like a dramatic narrowing. The contrast is sharper because the player has gotten used to an increasingly complex workbench.
- **With Inspector:** Inspector can use the same layout toggle — Stack view for event log, Dashboard view for multi-panel analysis. Consistent layout language.
- **With mobile (6.07):** Stack is the default mobile layout. Dashboard becomes a 2×2 grid on tablets. Sidebar Drawer not available on phones (too narrow).
- **With accessibility (6.08):** Stack is the most accessible layout (linear, screen-reader-compatible). Players using accessibility features can stay on Stack forever without missing any functionality.
- **With streamer culture:** Streamers can choose the layout that best suits their content — Dashboard for architecture reviews, Stack for detailed builds, Drawer for tutorial-style walkthroughs.

---

## Cross-Option Comparison Matrix

| Dimension | A: Tabs | B: Dashboard | C: Stack | D: Drawer | E: Schematic | F: Evolving |
|-----------|---------|-------------|----------|-----------|-------------|-------------|
| Gestalt view | ✗ | ✓✓ | ✗ | ✗ | ✓✓✓ | ✓ (Dashboard mode) |
| Deep editing | ✓✓✓ | ✓ | ✓✓ | ✓✓✓ | ✓ | ✓✓ (varies by mode) |
| Beginner friendly | ✓✓ | ✗ | ✓✓✓ | ✓ | ✗ | ✓✓✓ |
| Expert ceiling | ✓ | ✓✓ | ✓ | ✓✓ | ✓✓✓ | ✓✓✓ |
| Cross-reference | ✗ | ✓✓ | ✗ | ✓ (split) | ✓✓✓ | ✓✓ |
| Mobile/touch | ✓✓ | ✓ | ✓✓✓ | ✓✓ | ✗ | ✓✓✓ |
| Screen reader | ✓✓ | ✓ | ✓✓✓ | ✓✓ | ✗ | ✓✓✓ |
| Implementation cost | Low | Medium | Low | Medium | High | High |
| Board prominence | Medium | Medium | Medium | High | Medium | Varies |
| Spec alignment | ✓✓ | ✓✓ | ✓✓✓ | ✓✓ | ✗ | ✓✓✓ |

---

## Player Journeys

### Journey: Mika, 14, First Strategy Game Ever

**Context:** Mission 1. Mika has played Minecraft and Fortnite but never a strategy game. She just finished the boot log intro and is seeing the Plan screen for the first time. Evolving Workbench is in its simplest state — Skills panel only.

**Minute 0:00 — First Contact**
The screen loads. Left side: a colorful 8×8 isometric board showing rice terraces, with a Scout unit icon (👁) on tile C3 and a red enemy (🤖) on tile F6. Right side: a clean panel titled "SCOUT-A" with a subtitle: "Skills." Three rectangular slots are arranged horizontally — two filled with icons (a shoe icon labeled "patrol" and a zigzag icon labeled "evade"), one empty with a dashed outline.

Mika's eyes go to the board first. The Scout is gently bobbing in idle animation. The enemy is across the board, pulsing red. She moves her mouse to the Scout on the board — a hover tooltip shows "SCOUT-A: 2 skills equipped."

She thinks: "Okay, it's like equipping items in Minecraft."

**Minute 0:30 — Exploring Skills**
She clicks on the "patrol" skill in the right panel. The board immediately plays a 3-tick animated tooltip: the Scout ghost moves in a patrol pattern across three tiles, its perception cone sweeping the area, a thin dotted circle showing how far it can see. The enemy is just outside the cone's edge.

"Oh, it walks around and looks for stuff." She hovers "evade" — the tooltip shows the Scout dodging sideways when an enemy approaches, leaving a green afterimage trail. The empty slot pulses gently with a "+" icon.

She thinks: "Should I add another skill? Wait, there's only one slot left and I have two skills already."

**Minute 1:00 — EXECUTE**
She looks at the EXECUTE button — a large amber rectangle in the top-right corner with a subtle glow. She clicks it. The workbench smoothly slides away, the board expands to fill the center, the tick clock appears at the top. Sealed watch begins.

The workbench was so simple she spent less than 60 seconds on it. This is correct — Mission 1's workbench should be trivially fast.

**Minute 3:00 — Mission 3: Rules Arrive**
After completing Missions 1-2, Mika loads Mission 3. The board appears as usual. The Skills panel appears — familiar. Then, a new animation: the workbench *stretches downward*. A new section header materializes from a brief burst of static: `RULES SUBSYSTEM: INITIALIZING... ONLINE`. A babendil strike sounds — a bright metallic *ting* she hasn't heard before. Below Skills, a new "Rules" section has appeared with a single pre-placed rule: `IF enemy_detected → evade`.

Mika's eyes widen. "Oh, now I can tell it WHAT to do." She reads the rule. It makes sense — if it sees an enemy, dodge. She hovers the rule, and on the board, the Scout ghost acts out the rule: an enemy appears, the Scout dodges. Same animated tooltip pattern she learned for skills, now applied to rules.

She thinks: "Wait, what if I add another rule? What happens if both match?"

She notices the "+" button below the rule. Clicks it. A new empty rule strip appears with dropdown menus. She selects "IF enemy_near AND moving_toward → evade" as her second rule. The first rule (priority 1) has a "1" badge. The second has a "2" badge. She wonders what happens if both match...

**UI Annotations:**
- Skills section: 200px tall, full width of workbench panel, 3 horizontal slots
- Rules section: Initially 120px (1 pre-placed rule), grows dynamically with added rules
- Section header: Dark cyan bar, 32px height, section icon + title + collapse arrow
- "+" button: 40×40, dashed outline, centered below last rule, pulses once every 5s
- Board: 50% of screen width in Mission 3 (was 60% in Mission 1)

---

### Journey: Derek, 31, Senior DevOps Engineer, Factorio Veteran (800+ hours)

**Context:** Mission 7. Derek has steamrolled through Missions 1-6 using aggressive relay networks. He just unlocked Command agents. His current architecture involves 4 blueprints (Scout, Relay, Striker, Command). The workbench is in full Vertical Stack mode.

**Minute 0:00 — The Overwhelm Moment**
Derek selects his COMMAND-A blueprint. The Vertical Stack unfurls: Skills (3 equipped of 3: reassign, reroute, prioritize), Rules (8 rules and growing), Hooks (5 of 6 slots filled), Context Config (buffer size 14, listening to 4 channels). He scrolls down... and down... and down. The Rules section alone takes two full screens of scrolling.

"This is getting annoying," he mutters. He's been scrolling back and forth between Rules and Hooks for the last two missions, checking that his hook channels match his rule conditions. His mouse is wearing out.

**Minute 0:45 — The Dashboard Offer**
A subtle notification appears below the layout toggle in the top bar — a small speech bubble: "Your architecture has grown complex. Try Dashboard view for a wider perspective?" with two buttons: [Try Dashboard] [Not now].

Derek clicks [Try Dashboard]. The four sections *lift off* from their vertical positions and float for 400ms, then snap into a 2×2 grid. Skills (top-left) and Rules (top-right), Hooks (bottom-left) and Context (bottom-right). The transition animation shows exactly where each section landed.

He immediately sees the problem he's been scrolling to diagnose: Hook slot 3 publishes to "cmd-override" but none of his 8 rules check for "cmd-override" signals. It's a dead channel. In Stack mode, these were 3 scroll-lengths apart. In Dashboard mode, they're adjacent.

"Oh. OH. That's why my reroute wasn't firing."

**Minute 1:30 — Cross-Referencing**
He hovers over Hook slot 3 ("ON_SIGNAL from recon-net → publish to cmd-override"). In the Rules quadrant, a thin green line extends from the hover point to... nothing. No rule references "cmd-override." The cross-quadrant highlighting makes the missing link obvious.

He clicks the Rules quadrant to expand it. It zooms to full size, and he adds Rule 9: `IF cmd-override signal_type=priority → reroute(STRIKER-A, target)`. He collapses back to Dashboard view.

Now, hovering Hook slot 3 shows the green line connecting to Rule 9. The architecture is wired.

**Minute 3:00 — Power-User Discovery**
Derek presses "1" on his keyboard — Skills quadrant expands. Presses "2" — Rules expands. He's switching between quadrants at speed. He presses Ctrl+1 — the sidebar drawer mode appears, with Skills as the open drawer. He drags the drawer boundary wider.

"Wait, is this a third layout?" He toggles between all three using the top-bar icons. Stack for reading, Dashboard for overview, Drawer for focused editing. He settles on Drawer for his current task — deep-editing Command rules while keeping the board large for tactical preview.

**UI Annotations:**
- Dashboard quadrants: Each ~300×250px at 1080p, with 4px gaps between
- Cross-quadrant highlighting: 1px dashed green lines connecting related elements across quadrants
- Layout toggle: Three icons (≡ Stack, ⊞ Dashboard, ☰ Drawer), 24×24 each, 8px gap, top-right bar
- Quadrant expand: Click → 300ms zoom, others shrink to icon strips along edge
- Notification bubble: 200px wide, 60px tall, appears below layout toggle, auto-dismisses after 30s

---

### Journey: Abuela Rosa, 62, Retired Teacher, Mission 5 (First Factory)

**Context:** Rosa has been slowly working through the campaign with her grandson's help. She's comfortable with Skills and Rules but still finds Hooks confusing. Mission 5 just introduced the factory and production queue. The workbench is in full Vertical Stack mode — she's never seen a layout option because she's pre-Mission 7.

**Minute 0:00 — The New Bottom Section**
The Mission 5 boot log has just explained the factory: "PRODUCTION SUBSYSTEM: ONLINE. Your base will build units from blueprints." Rosa's workbench now has a new element she hasn't seen before — a horizontal strip at the very bottom showing a conveyor belt graphic with three blueprint icons on it: 👁 Scout, 📡 Relay, ⚔ Striker.

She stares at the conveyor belt. The leftmost icon (Scout) has a subtle shimmer — it's "building." A thin progress bar underneath shows 60% filled. To the right, the Relay and Striker icons wait in line, slightly dimmer.

"It's like a factory line," she says aloud. "First the Scout, then the Relay, then the fighter."

**Minute 0:30 — Blueprint Navigation**
Above the workbench, the blueprint selector has changed from a single dropdown to a **tabbed strip**: three tabs showing [👁 Scout-A] [📡 Relay-A] [⚔ Striker-A]. She clicks "Relay-A" — the workbench panel smoothly cross-fades to show the Relay's configuration. Skills: compress, filter, amplify. Rules: 4 relay-specific rules. Hooks: 3 channel subscriptions.

She clicks back to "Scout-A." The workbench returns to the Scout's familiar configuration. She's been editing this Scout for 4 missions — it feels like an old friend.

"Ay, now I have THREE to manage?" She sighs, but the vertical stack is comfortable. She scrolls through each blueprint one at a time, making small adjustments.

**Minute 2:00 — Production Queue Reordering**
Rosa notices the mission briefing mentions "fast enemies that rush from the east." She looks at her production queue: Scout → Relay → Striker. "If they rush, I need the fighter first." She grabs the Striker icon on the conveyor belt and drags it to the left position. The conveyor belt icons shuffle with a satisfying mechanical *clank-clank* animation, like boxes on a real conveyor changing order. The belt now reads: ⚔ Striker → 👁 Scout → 📡 Relay.

She hovers the queue and sees a cost tooltip: "Total: 16 minerals. Est. build time: 3 ticks per unit." She has 20 minerals. Enough.

**Minute 3:00 — The Gestalt Anxiety**
Rosa has now reviewed all three blueprints. She sits back and realizes: she has no way to see all three blueprints at once. She's been clicking between tabs. "How do I know if my Scout's hooks match my Relay's hooks?" She clicks back and forth: Scout has `ON_ENEMY → recon-net`. Relay has `LISTEN: recon-net`. OK, they match.

This is where the Dashboard would help — but Rosa is on Mission 5, and the Dashboard doesn't unlock until Mission 7. For now, the Stack is sufficient because her architecture is simple. By Mission 7, when she has 4-5 blueprints with 8+ channels, the Dashboard offer will arrive just in time.

**UI Annotations:**
- Blueprint tabs: 120×36px each, flush horizontal strip, active tab has cyan bottom border
- Production queue conveyor: Full width of workbench, 64px tall, icons are 48×48 with progress bars
- Drag-reorder: 200ms settle animation, mechanical sound, ghost icon follows cursor during drag
- Cost tooltip: Appears below conveyor on hover, shows mineral cost and build time per unit

---

### Journey: Kwame, 28, Twitch Streamer, Mission 9 (Factory vs. Factory)

**Context:** Kwame streams strategy games to 2,000 viewers. He's on Mission 9, deep in the factory-vs-factory endgame. He has 6 blueprints and uses Dashboard mode for architecture reviews and Sidebar Drawer for live editing. His chat is active.

**Minute 0:00 — Architecture Review**
Kwame switches to Dashboard mode. All four quadrants for his COMMAND-A blueprint light up. He hovers over the screen sharing his view and narrates: "Chat, look at this. Rules quadrant — 14 rules. Hooks — all 6 slots filled. Context buffer maxed at 14. This Command is LOADED."

Chat: "that's a chonky boi" / "rules 11 and 13 look redundant?" / "why no filter on recon-net?"

He notices chat's observation about rules 11 and 13. He clicks the Rules quadrant to expand it and scrolls. Rules 11 and 13 both trigger on `enemy_count > 3`, but with different actions. "Oh, rule 13 is shadowed by 11 — it'll never fire because 11 is higher priority." He deletes rule 13.

**Minute 1:30 — Multi-Blueprint Comparison**
Kwame wants to compare his two Striker variants. He switches to Sidebar Drawer mode, opens the Rules drawer for STRIKER-A, then Shift+clicks the Rules icon to open a second drawer for STRIKER-B. Side-by-side Rules panels.

"STRIKER-A has aggressive engage rules. STRIKER-B is more cautious — it waits for tagged targets. Let me show chat the difference." He hovers Rule 1 on each side. The board shows two ghost Strikers — one charging forward (A's behavior) and one holding position (B's behavior). The animated tooltip previews play simultaneously.

Chat: "B is cracked" / "A would die in 2 ticks against this comp" / "USE B IN SLOT 1"

He drags STRIKER-B to position 1 in the production queue.

**Minute 3:00 — The EXECUTE Ceremony**
Kwame closes all drawers. The board expands to fill the screen. He hovers the EXECUTE button — it glows brighter. "Chat, we're sending it." He presses and holds — the DualSense trigger resists (he's playing on PC with a controller for the haptic EXECUTE ritual). The fill ring around the button grows. The production queue flashes once. He releases.

Sealed watch begins. The workbench is gone. Just the board, the tick clock, and the buffer bars.

**UI Annotations:**
- Sidebar Drawer split mode: Two drawers, each ~35% of screen width, divider bar between them
- Ghost comparison: Two ghost units on board from different blueprints, different colors (cyan vs. gold)
- EXECUTE hold: 800ms hold with fill ring, trigger resistance on controller, keyboard long-press equivalent
- Stream overlay: Layout toggle visible in top bar; chat can see which mode streamer is using

---

## The TikTok Clip

**"The Brain Surgeon."** 15-second clip. Dashboard mode, zoomed to fill the screen. A Command agent's four quadrants are dense with configuration. The player hovers a single hook — green threads shoot across all four quadrants, connecting the one hook to three rules, the buffer's listen config, and a skill's trigger condition. The player deletes the hook. All green threads vanish. Three rules go amber (dead conditions), the buffer's listen list shrinks, the skill grays out. The board preview shows the army stumbling. Text overlay: "One wire. The whole architecture."

**"The Growth."** 10-second timelapse. Mission 1: tiny workbench, one skills panel. Mission 3: rules section grows in. Mission 5: factory conveyor belt appears. Mission 7: the sections lift and rearrange into Dashboard mode. Mission 9: all three layouts cycling. Text overlay: "Your workbench grows as your AI awakens."

---

## New Aspects Discovered

- **3.14a — Multi-blueprint comparison view:** When managing 4-6 blueprints simultaneously, how does the player compare configurations across blueprints? Side-by-side drawers, army overview screen, diff highlighting between similar blueprints?
- **3.14b — Workbench layout persistence and per-blueprint preferences:** Should layout choice persist per blueprint? (Command always in Dashboard, Scout always in Stack.) Per-player global preference? Per-session?
- **3.14c — The "blueprint switching tax" in production-heavy missions:** Late-game missions with 5-6 blueprints require constant switching. Tab strip vs. overview panel vs. spatial arrangement (blueprints as tiles on a wall). The switching cost compounds.
- **3.14d — Workbench micro-animations and interaction juice:** The exact animations for section reveal, layout morph, collapse/expand, cross-quadrant highlighting, and drag operations. Animation timing budget for maintaining 60fps in React.
- **3.14e — The workbench-to-sealed-watch transition ceremony:** The precise animation sequence when EXECUTE is pressed — workbench panels retracting, board expanding, UI chrome dissolving. How long (500ms? 1000ms?), what sound, what visual metaphor (shutting a briefcase? Launching a rocket?).
