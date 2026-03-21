# 3.15 — Army Overview: How Does the Player See All Agents and Their Wiring at Once?

The single-blueprint workbench is the microscope. The army overview is the telescope. At some point — Mission 5 at the earliest, Mission 8 inevitably — the player has enough blueprints in their production queue that they need to zoom out and see the *whole system*. Not one agent's rules, but how every agent connects to every other. Not one channel, but the full communication topology. This is the moment where "I built three good agents" either becomes "I built a coherent army" or "I built three agents that happen to occupy the same battlefield."

The army overview is where the player becomes a systems architect instead of a unit designer.

---

## The Visualization Problem

By Mission 8, a player might have:
- 3-5 distinct blueprints (Scout, Striker, Relay, possibly Specialist and Command)
- 4-8 named channels (recon-net, threat-alert, flank-cmd, compress-relay, etc.)
- 12+ units on the field produced from those blueprints
- Hooks wiring blueprints together across channels in non-obvious topologies
- Rules referencing channel data that arrived from units the player configured hours ago

The army overview must answer these questions at a glance:
1. **What blueprints exist?** Names, types, slot usage, completeness.
2. **How are they wired?** Which blueprints talk to which, through what channels?
3. **Where are the bottlenecks?** Which relay is subscribed to 4 channels with a 12-slot buffer? Which scout is broadcasting on a channel nobody listens to?
4. **What's the production plan?** How many of each blueprint, in what order?
5. **What's missing?** Dead channels, unused skills, rules that reference nonexistent data.

This is simultaneously a graph visualization problem (nodes = blueprints, edges = channels), a resource management problem (slot budgets, production costs), and a diagnostic problem (find the broken wire before you execute).

---

## Option A: "The Topology Map" — Network Graph View

### How It Works

The army overview is a **force-directed graph** where each blueprint is a node and each channel is an edge. The player sees their entire communication architecture as a visual network diagram — the same kind of diagram you'd draw on a whiteboard when designing a microservices system.

**Node rendering:** Each blueprint is a rounded rectangle containing:
- Unit type icon (top-left corner: 👁 📡 ⚔ 🔧 🤖)
- Blueprint name (centered, bold)
- Mini slot-usage bar (horizontal strip showing skills/rules/hooks/context fill — four tiny colored segments)
- Production count badge (bottom-right: "×3" if 3 copies queued)

**Edge rendering:** Each channel is a colored line connecting the broadcasting node to all listening nodes:
- Line color = channel color (auto-assigned from a palette, player can override)
- Arrow direction shows data flow (broadcast → listen)
- Line thickness indicates signal volume (hooks that fire frequently = thicker)
- Dashed line = hook exists but no matching listener (dead channel warning)

**Layout:** Nodes arrange themselves using force-directed physics — heavily connected nodes cluster together, isolated nodes drift to edges. The player can drag nodes to rearrange manually; positions are saved. A "reset layout" button snaps back to auto-arranged.

**Zoom levels:**
- **Zoomed out:** Nodes are small icons with names. Edges are simple colored lines. The topology shape is immediately legible — star topology (command at center), chain (scout → relay → striker), mesh, etc.
- **Zoomed in:** Nodes expand to show full slot details. Edges show channel names and hook trigger conditions as inline labels. Hovering an edge highlights the source hook and the destination's context config listen toggle.

### Sensory Description

The topology map fills the right 60% of the Plan screen, replacing the single-blueprint workbench. The background is a dark slate grid — faint graph paper lines at 20px intervals, barely visible, giving the space a blueprint/schematic feel. Blueprint nodes float on this grid as slightly raised cards with a subtle drop shadow (2px, 20% opacity), their borders color-coded by unit type: cyan for Scout, amber for Relay, crimson for Striker, violet for Specialist, gold for Command.

Channel lines arc between nodes in smooth bezier curves, each a glowing thread. The `recon-net` channel pulses in seafoam green; `threat-alert` throbs in warning orange; `flank-cmd` hums in electric blue. When you hover a channel line, it brightens to full opacity and all other channels dim to 15% — the selected communication pathway leaps out of the noise. A tooltip appears at the midpoint of the arc: "recon-net: Scout Alpha → Relay Beta, Relay Beta → Striker Gamma" listing all connections.

Dead channels — hooks broadcasting to nobody — render as dashed red lines that terminate in a small ✕ icon, gently pulsing, begging for attention. They look like severed wires. An unlistened channel feels *wrong* before you even read the warning text.

Double-clicking any node opens the single-blueprint workbench for that blueprint, with a breadcrumb trail at the top: "Army Overview > Scout Alpha" — click "Army Overview" to zoom back out.

### Strengths

- **Topology is immediately legible.** Star, chain, mesh, tree — the shape of your army's communication architecture is visible at a glance. A player developing intuition can see "oh, everything routes through one relay — that's a single point of failure."
- **Dead wires are viscerally obvious.** Dashed red lines are impossible to ignore. The most common mistake (broadcasting on a channel nobody listens to) is caught before execution.
- **Scales to complexity.** A 2-blueprint army is two nodes with one line. A 6-blueprint army is a rich network. Both are readable.
- **Matches the mental model.** Agentic system architects already think in topology diagrams. This is the diagram they'd draw on a whiteboard.
- **Discovery tool.** Seeing the graph shape can reveal emergent structures the player didn't consciously design — "oh, my Specialist is actually a second relay, it receives from two sources and forwards to the Command."

### Weaknesses

- **Graph layout is hard.** Force-directed layouts are notoriously finicky. With 6+ nodes and 8+ channels, edges cross, nodes overlap, the layout jiggles. Manual repositioning is a band-aid, not a solution.
- **Edge spaghetti.** A Command agent with 6 hook slots might connect to 4 other blueprints across 6 channels. That's 6+ edges emanating from one node. At scale, the graph becomes a bowl of noodles.
- **No production information.** The graph shows *what* blueprints exist but not *how many* of each or *when* they spawn. The production queue is a separate concern that doesn't map naturally to a network graph.
- **Click-to-edit friction.** To modify a blueprint, you double-click a node and enter the workbench. Then you go back to the overview. Then you double-click another node. The ping-pong between views is expensive.
- **Misleading equality.** All nodes are the same size, but a Command agent with 14 context slots and 6 hooks is *far* more complex than a Scout with 6 slots and 2 hooks. The graph doesn't communicate this asymmetry.

### Comparable Games

- **Factorio's circuit network view:** Factorio lets you see wire connections between combinators and machines. Red and green wires are visible on the factory floor. The visual spaghetti is part of the charm, but also part of the problem — players build "spaghetti bases" that work but are unmaintainable. Robot Uprising's army overview needs to be more legible than Factorio's wire soup.
- **Blender's shader node editor:** Nodes with inputs/outputs connected by noodles. Handles spaghetti better with re-routing nodes and color-coded sockets. The "noodle" metaphor could translate — but Blender still suffers from layout chaos with complex graphs.
- **Draw.io / Miro:** Whiteboard diagramming tools. Excellent for manual layouts, terrible for auto-layouts. The player *should* have drag-to-rearrange, but the initial auto-layout needs to be good enough that most players never touch it.

---

## Option B: "The Barracks Roster" — Card Grid View

### How It Works

The army overview is a **horizontal card strip** — each blueprint rendered as a tall card, side by side, with channel wiring shown as colored ribbons running between cards.

**Card layout (per blueprint):**
```
┌─────────────────┐
│  👁 Scout Alpha  │
│─────────────────│
│ Skills:  ██░░   │  (2/4 slots filled)
│ Rules:   ███░   │  (3/4 slots filled)
│ Hooks:   ██     │  (2/2 slots filled)
│ Context: ████── │  (listen config bar)
│─────────────────│
│ 📡 recon-net  → │  (broadcast, arrow out)
│ 📡 threat-alt ← │  (listen, arrow in)
│─────────────────│
│ Cost: 3m 1e/t   │
│ Queued: ×2      │
│─────────────────│
│    [EDIT]        │
└─────────────────┘
```

**Channel ribbons:** Between the cards, colored ribbons arc from the broadcasting card's hook row to the listening card's context section. The ribbons run through a shared "channel gutter" — a vertical stripe between each pair of cards where wiring is visible. Ribbons that pass through multiple cards (Scout → Relay → Striker) visibly traverse the full width of the roster.

**Card ordering:** Cards are arranged left-to-right matching production queue order by default. The player can drag cards to reorder (which also reorders the production queue). Alternatively, cards can be sorted by unit type, cost, or channel count.

**Selection:** Clicking a card highlights it and dims others. The card expands slightly (~20% wider) to show more detail — full skill names instead of bars, full rule text previews, full hook configurations. Clicking [EDIT] opens the workbench for that blueprint.

### Sensory Description

The roster fills the right panel as a horizontally scrollable strip of blueprint cards, each about 180px wide and 450px tall. Cards are rendered as matte-finish panels — think the equipment screen in XCOM, each soldier's loadout on a card. The background behind the cards is a dark conveyor-belt texture that subtly scrolls left when the player adds a new blueprint, reinforcing the factory/production metaphor.

Each card's left edge has a thin vertical stripe in the unit type color — cyan for Scout, amber for Relay, crimson for Striker. Slot usage bars are rendered as segmented pip rows: filled slots glow solid in the type color, empty slots are dark outlines with dashed borders that whisper "fill me." A fully configured card's pips form a satisfying solid bar. A half-configured card looks visibly incomplete.

The channel ribbons are the star. They flow between cards as soft, curved bands — 8px wide, semi-transparent, color-coded per channel. Where ribbons cross (and they will, once you have 4+ channels), they layer with slight transparency so both colors remain visible. A ribbon that connects Scout Alpha's `recon-net` broadcast to Relay Beta's listen slots flows as a seafoam-green arc through the gutter, landing on Relay Beta's card with a small antenna icon (📡). Hovering a ribbon highlights it to full opacity, dims all others, and shows a tooltip: "recon-net: Scout Alpha broadcasts → Relay Beta listens."

When a card has warnings — dead channel, unfilled required slot, rule referencing missing data — a small amber triangle pulses in the card's top-right corner. The triangle contains an exclamation mark. Hovering it reveals a diagnostic tooltip: "Hook broadcasts on 'flank-cmd' but no blueprint listens on this channel."

### Strengths

- **Production integration is natural.** Cards are ordered left-to-right in production queue order. The overview IS the production plan. No separate production queue view needed.
- **Slot budgets are instantly legible.** Those segmented pip rows tell you at a glance: this Scout has 2/4 skills, this Command has 5/6 hooks. The visual incompleteness drives completion.
- **Scalable.** 2 cards = simple side-by-side comparison. 5 cards = scroll right. The pattern works from 1 to 8 blueprints.
- **Comparison-friendly.** Two scouts side by side? Easy to spot differences. Cards are uniform, so visual diff is natural.
- **Low cognitive load.** Cards are a universally understood pattern — Hearthstone collection, XCOM barracks, Pokémon party screen. No graph theory required.

### Weaknesses

- **Channel wiring is secondary.** The ribbons-between-cards pattern works for 2-3 channels but becomes a visual mess with 6+ channels crossing 5+ cards. The topology — the most important strategic information — is harder to read than in the graph view.
- **Linear layout forces ordering.** A network doesn't have a natural left-to-right order. The player must impose one. If Scout broadcasts to both Relay and Striker, which goes next to Scout? The linear strip can't represent branching topologies without crossing ribbons.
- **Card real estate is limited.** 180px width means abbreviation and truncation. Long rule descriptions get cut off. Long channel names get truncated. The card is a summary, not a full view.
- **Horizontal scrolling is unloved.** Most players don't think to scroll right. Cards that are offscreen are cards that are forgotten. Blueprints 4 and 5 may get less attention than 1 and 2 simply due to viewport bias.

### Comparable Games

- **XCOM 2's squad screen:** Soldiers in a horizontal row, each with a gear loadout card. Click a soldier to see details. Robot Uprising's blueprint cards are this — but with channel wiring ribbons that XCOM doesn't need.
- **Slay the Spire's deck view:** Cards in a grid, sortable by cost/type/rarity. The "sort by" affordance is directly applicable — sort blueprints by type, cost, or channel count.
- **Into the Breach's mech selection:** Three mechs, side by side, each with equipment slots. The cleanest version of this pattern, but it only works because Into the Breach has exactly 3 units. Robot Uprising might have 6.

---

## Option C: "The Wiring Diagram" — Hierarchical Swim Lane View

### How It Works

The army overview is a **swim lane diagram** — rows grouped by unit type, with columns representing channels. The intersection of a row and a column shows that blueprint's relationship to that channel (broadcast, listen, or none).

```
                 recon-net   threat-alert  flank-cmd   compress-relay
              ┌──────────┬──────────────┬───────────┬───────────────┐
  👁 Scouts   │ ●→       │              │           │               │
  Scout Alpha │ broadcast│              │           │               │
              ├──────────┼──────────────┼───────────┼───────────────┤
  📡 Relays   │ ←●       │ ●→           │           │ ●→            │
  Relay Beta  │ listen   │ broadcast    │           │ broadcast     │
              ├──────────┼──────────────┼───────────┼───────────────┤
  ⚔ Strikers  │          │ ←●           │ ←●        │               │
  Striker Gam │          │ listen       │ listen    │               │
              ├──────────┼──────────────┼───────────┼───────────────┤
  🤖 Command  │ ←●       │ ←●           │ ●→        │ ←●            │
  Cmd Omega   │ listen   │ listen       │ broadcast │ listen        │
              └──────────┴──────────────┴───────────┴───────────────┘
```

**Cell rendering:** Each cell is a small tile. A circle with an outgoing arrow (●→) means the blueprint broadcasts on that channel. A circle with an incoming arrow (←●) means it listens. Empty cells are blank. Cells glow in the channel's assigned color.

**Data flow tracing:** Clicking a broadcast cell highlights all listen cells in the same column — showing the complete signal path. Clicking a listen cell highlights the broadcast source. This makes it trivial to trace: "Who receives recon-net data?" → look down the recon-net column and see every ←● cell.

**Row expansion:** Clicking a row expands it vertically to show the blueprint's full configuration — skills, rules, hooks, context — inline. The table becomes a master-detail view.

**Column diagnostics:** A column with no ←● cells (all broadcast, no listeners) gets a red column header: "Dead channel." A column with no ●→ cells (all listen, no broadcast) gets an amber header: "Silent channel — no source."

### Sensory Description

The wiring diagram renders as a dark-on-darker matrix — cells are slightly raised panels on a charcoal grid. Channel columns have colored header bars: recon-net in seafoam green, threat-alert in warning orange, each strip 4px tall running the full height of the column. Broadcast cells contain a small glowing dot with an animated outward pulse — a tiny ripple expanding outward every 2 seconds, like a stone dropped in water. Listen cells contain a small glowing dot with an animated inward pulse — ripples contracting toward the center. The visual metaphor is unmistakable: outward = sending, inward = receiving.

When you hover a row, all cells in that row brighten, and every channel that row participates in highlights its full column in a dim wash of the channel color — you see the blueprint's entire communication footprint illuminated. When you hover a column, all cells in that column brighten, and every blueprint participating in that channel highlights its row — you see the channel's complete subscriber list.

Dead channels render their column header as a pulsing red strip with a ✕ icon. The emptiness of the column — no listen cells — is itself the diagnostic. You don't need a warning tooltip; the visual gap IS the warning.

The matrix feels like a mixing console or a patch bay — each row is a device, each column is a signal path, and the cells are patch points. Audio engineers will feel immediately at home. StarCraft players will see a unit composition matrix.

### Strengths

- **Channel health is instantly legible.** Dead channels = empty columns. Oversubscribed channels = full columns. The matrix makes signal flow a spatial property.
- **Data flow tracing is one click.** "Who listens to recon-net?" → scan down the column. "What does the Command agent listen to?" → scan across the row. No graph untangling needed.
- **Scales to complexity beautifully.** 2 blueprints × 2 channels = a tiny grid. 6 blueprints × 8 channels = a larger grid that's still perfectly readable. The matrix pattern scales linearly, not combinatorially like a graph.
- **Blueprint comparison is built-in.** Two Scouts in adjacent rows? Their channel subscriptions are visually aligned — differences jump out.
- **Diagnostics are spatial.** Empty columns, full rows, isolated cells — problems have visual shapes. A blueprint with no channel cells at all is an isolated unit. A channel with one broadcast and five listens is a bottleneck.

### Weaknesses

- **Signal latency is invisible.** The matrix shows who talks to whom but not the hop count. Scout → Relay → Striker is 4 ticks of latency, but the matrix just shows Scout broadcasts on A, Relay listens on A and broadcasts on B, Striker listens on B. The latency chain is only inferable.
- **Multi-hop paths are not visible.** The matrix shows direct connections. To see that data flows Scout → Relay → Striker, you must mentally trace: Scout broadcasts recon-net → Relay listens recon-net AND broadcasts threat-alert → Striker listens threat-alert. The indirect chain is implicit.
- **Production information is absent.** The matrix is about wiring, not about production order, cost, or queue position. A separate production view is still needed.
- **Row expansion creates scroll chaos.** Expanding one blueprint's row to see full details pushes all other rows down, losing the alignment that makes the matrix work. The master-detail pattern fights the matrix pattern.
- **Unfamiliar to non-engineers.** Swim lane diagrams and signal matrices are engineering tools. A 14-year-old who's never seen a spreadsheet won't immediately grasp rows × columns = communication topology.

### Comparable Games

- **Shenzhen I/O's component layout:** Components laid out on a board with visible wire connections. The spatial arrangement IS the program. The wiring diagram has the same property — position encodes relationships.
- **Logic Pro's mixer view:** Channels as vertical strips, sends/returns as connection points. The mixing metaphor is directly applicable: each blueprint is a channel strip, each communication channel is a bus.
- **Dwarf Fortress's military screen:** Squads, assigned weapons, patrol routes — a matrix of assignments. Complex, powerful, and terrifyingly opaque until you learn it.

---

## Player Journeys

### Journey: Maya, 16, Rhythm Game Player

**Context:** Mission 5 — the first factory mission. Maya has just been introduced to blueprints and production queues after 4 tutorial missions with pre-placed units. She has a Scout blueprint and a Striker blueprint. She's never seen a "system overview" in any game before. Her communication setup is minimal: one channel, `recon-net`, where the Scout broadcasts and the Striker listens.

**Minute 0:00 — First Glimpse**
Maya has been editing her Scout blueprint in the workbench. She notices a new button in the workbench's top toolbar: a grid icon labeled "Army" with a small badge showing "2" (the number of blueprints). She's finished tweaking the Scout and wants to check on the Striker, so she clicks the icon out of curiosity.

The screen transitions with a smooth zoom-out animation — the single Scout blueprint card shrinks and slides left while the Striker card appears beside it. The workbench transforms from a single-blueprint editor into the card roster view (Option B). Two tall cards sit side by side in the center of the right panel, with comfortable spacing between them. The left panel still shows the 8x8 board preview.

**Minute 0:15 — Reading the Cards**
Maya's eyes scan the two cards. The Scout card on the left has a cyan left-edge stripe and shows:
- Skills: ██░░ (2 of 4 — patrol, evade equipped)
- Rules: ██░░ (2 of 4 — "if enemy in range → evade", "if clear → patrol")
- Hooks: █░ (1 of 2 — broadcasting on recon-net)
- Context: a green-to-amber gradient bar at 40%

The Striker card on the right has a crimson stripe and shows:
- Skills: █░░░ (1 of 4 — engage equipped)
- Rules: █░░░ (1 of 4 — "if tagged enemy adjacent → engage")
- Hooks: ░░ (0 of 2 — no hooks)
- Context: a green bar at 20%

Between the two cards, a single seafoam-green ribbon arcs from the Scout's hook row to the Striker's context section, labeled "recon-net." The ribbon glows softly, its color matching the channel.

Maya immediately notices: the Striker has 0 hooks and lots of empty slots. The dashed outlines on the empty pip rows call out for filling. She thinks: *"My Striker is kind of dumb right now."*

**Minute 0:40 — Hovering the Ribbon**
Maya hovers over the green ribbon connecting the two cards. It brightens, and a tooltip appears: "recon-net: Scout Alpha broadcasts → Striker Gamma listens via context." On the board preview to the left, a faint green dashed line appears between the ghost Scout and ghost Striker positions, mirroring the ribbon. She can see the communication link both in the abstract roster AND on the physical battlefield.

She clicks the Scout card's [EDIT] button. The card zooms smoothly back into the full workbench view, with a breadcrumb at the top: "Army Overview > Scout Alpha." She adjusts a rule, clicks "Army Overview" in the breadcrumb, and zooms back out. The round-trip took 8 seconds.

**Minute 1:30 — Satisfaction**
Maya looks at her two-card army. It's simple. It's readable. She knows exactly what she has. She clicks EXECUTE.

**UI Annotations:**
- **Army button:** Top toolbar of workbench, grid icon with blueprint count badge. Toggles between single-blueprint workbench and army roster.
- **Card ribbon:** 8px wide, bezier-curved, semi-transparent colored band arcing between cards. Hover = full opacity + tooltip. Shows channel name and flow direction.
- **Breadcrumb trail:** Top of workbench panel, clickable path "Army Overview > [Blueprint Name]." Click "Army Overview" to zoom out.
- **Slot pip rows:** Segmented horizontal bars on each card. Filled = solid glow. Empty = dashed outline. Visual incompleteness drives action.

---

### Journey: Kai, 28, Software Engineer

**Context:** Mission 7 — full factory is online. Kai has 5 blueprints: Scout Alpha, Scout Bravo (with different rule sets), Relay Beta, Striker Gamma, and Command Omega. He's running 6 channels: `recon-net`, `recon-south`, `threat-alert`, `compress-relay`, `flank-cmd`, `override`. His army is getting complex enough that he's lost track of the full topology. He just added the Command Omega blueprint and needs to verify it's correctly wired to receive from all other agents.

**Minute 0:00 — Switching to Topology View**
Kai clicks the Army button and gets the roster view. Five cards, side by side, with 6 colored ribbons threading between them. The ribbons cross and overlap — it's getting busy. He notices a small toggle in the top-right corner of the army overview panel: two icons, one showing cards in a row (roster, currently active), and one showing a network graph (topology). He clicks the graph icon.

The cards smoothly rearrange — each card shrinks to a compact node (icon + name + slot summary bars) and repositions itself in a force-directed layout. The Command Omega node settles in the center, because it has the most connections (6 hook slots wired to 4 channels). The two Scouts float to the left periphery. Relay Beta positions between the Scouts and the Strikers. The colored channel lines redraw as bezier curves between nodes.

The topology immediately reveals something Kai didn't consciously realize: his architecture is a **star network** centered on Relay Beta, not on Command Omega. Four of the six channels route through the Relay. The Command agent is connected, but it's mostly listening — it only broadcasts on `flank-cmd` and `override`.

**Minute 0:30 — Tracing a Path**
Kai wants to verify: when Scout Alpha sees an enemy, how does the information reach Striker Gamma? He clicks on Scout Alpha's node. The node highlights with a cyan glow, and all channels originating from Scout Alpha brighten: `recon-net` (seafoam green) and `recon-south` (teal) glow at full opacity. All other channels dim to 15%.

He sees: `recon-net` flows from Scout Alpha to Relay Beta and to Command Omega. `recon-south` flows from Scout Alpha to Relay Beta only. But there's no direct connection from Scout Alpha to Striker Gamma.

He clicks Relay Beta. Now `recon-net` (incoming) and `threat-alert` (outgoing) and `compress-relay` (outgoing) highlight. The `threat-alert` line goes to Striker Gamma. *There* it is — the path is Scout Alpha → recon-net → Relay Beta → threat-alert → Striker Gamma. Four ticks of latency. Kai mutters: "That's slow."

He considers adding Scout Alpha directly to a channel that Striker Gamma listens to. But Striker Gamma only has 2 hook slots, both currently used for listening on `threat-alert` and `flank-cmd`. Kai would need to sacrifice one.

**Minute 1:15 — Finding the Dead Wire**
As Kai scans the topology, he notices a dashed red line emanating from Command Omega's node and terminating in a small ✕. The channel label reads `override`. He set up Command Omega to broadcast reassignment orders on the `override` channel, but — he checks — no other blueprint has a hook listening on `override`. The channel is dead. His Command agent has been shouting into the void.

Kai double-clicks Striker Gamma's node. The overview zooms into the workbench for that blueprint. He navigates to the Hooks tab, removes the `flank-cmd` listener (which he realizes the Command agent also never broadcasts on — another dead channel), and replaces it with a listener on `override`. He clicks the breadcrumb to return to the army overview.

The topology has changed: the `override` dashed red line is now a solid gold arc from Command Omega to Striker Gamma. The `flank-cmd` line, which previously connected to Striker Gamma, has now become a dashed red line — but Kai intentionally wants that channel dead for now. He'll wire it up later.

**Minute 2:00 — Switching to Matrix View**
Kai clicks a third toggle icon — a grid icon — and the army overview switches to the wiring diagram matrix (Option C). Now he sees the swim lane:

```
                   recon-net  recon-south  threat-alert  compress-relay  flank-cmd  override
Scout Alpha         ●→         ●→
Scout Bravo         ●→
Relay Beta          ←●         ←●          ●→            ●→
Striker Gamma                              ←●                                       ←●
Command Omega       ←●                     ←●            ←●                          ●→
```

In this view, the dead `flank-cmd` channel is obvious: the entire column is empty (no ●→ or ←●). Kai right-clicks the column header and selects "Delete Channel." The column disappears. Clean.

He also notices: Scout Bravo broadcasts on `recon-net` but Scout Alpha broadcasts on both `recon-net` and `recon-south`. Why does `recon-south` exist? He remembers — he intended Scout Alpha to cover the south flank with a separate channel so Relay Beta could filter it differently. But Relay Beta listens to both `recon-net` and `recon-south` without any differentiation in its rules. The separate channel is pointless overhead. He makes a mental note to either differentiate the rules or merge the channels.

**Minute 3:00 — Confident Architecture**
Kai has identified two bugs (dead `override` channel, redundant `recon-south`), fixed one, and noted the other. He switches back to the roster view for a final scan of production costs, confirms the production queue order, and hits EXECUTE. The army overview saved him from deploying a broken communication architecture.

**UI Annotations:**
- **View toggle:** Three small icons in the top-right of army overview panel — card roster, topology graph, wiring matrix. Click to switch. Smooth transition animation between views (400ms).
- **Node click in topology:** Highlights all outgoing channels from that node at full opacity. All other channels dim. Click another node to change focus. Click empty space to deselect.
- **Dead channel indicator:** Dashed red line terminating in ✕ icon in topology view. Empty column in matrix view. Amber warning triangle on card in roster view. Three visual languages for the same diagnostic.
- **Matrix right-click:** Context menu on column headers with "Delete Channel" option. Destructive action requires confirmation modal: "Delete 'flank-cmd'? This will remove all hooks using this channel."
- **Breadcrumb navigation:** "Army Overview > Blueprint Name" at top of workbench. Consistent across all three views. Click "Army Overview" returns to whichever view you came from.

---

### Journey: Dani, 35, Factorio Veteran, Mission 9

**Context:** Mission 9 — factory-vs-factory endgame. Dani has an army of 7 blueprints and 12 active units on the field. They're running a complex multi-tier architecture: two specialized Scout variants feeding a pair of Relay nodes which compress and route to three Striker types and a Command agent that dynamically reassigns Specialist units. There are 9 named channels. The production queue has 14 entries (multiple copies of key blueprints). Dani has been iterating on this army for 45 minutes across 6 failed attempts at this mission. They need the overview to diagnose why their army keeps falling apart around tick 30.

**Minute 0:00 — The Full Matrix**
Dani opens the army overview in matrix view — their preferred mode. The 7×9 grid fills the right panel. At first glance, the matrix is busy but structured. Their eyes immediately go to column density:

- `scan-primary`: Dense — 2 broadcasts, 3 listeners. This is the main information highway.
- `scan-flanks`: 1 broadcast, 1 listener. Dedicated scout-to-relay link.
- `threat-high`: 1 broadcast, 4 listeners. The "everyone panic" channel.
- `compress-out`: 1 broadcast, 2 listeners. Relay compression output.
- `cmd-reassign`: 1 broadcast, 2 listeners. Command agent orders.
- `cmd-override`: 1 broadcast, 1 listener. Emergency override.
- `specialist-intel`: 1 broadcast, 1 listener. Specialist extraction feed.
- `tag-broadcast`: 2 broadcasts, 0 listeners. **Dead channel — red column header.**
- `decoy-signal`: 1 broadcast, 0 listeners. **Dead channel — red column header.**

Two dead channels. Dani swears. They created `tag-broadcast` two iterations ago and forgot to wire listeners. And `decoy-signal` was an experiment they abandoned but never cleaned up.

**Minute 0:30 — Row Analysis**
Dani scans the rows. The Command agent's row has 6 cells filled — it's connected to 6 of 9 channels. That's correct; it's the central coordinator. But the Specialist row only shows 2 cells: listening on `cmd-reassign` and broadcasting on `specialist-intel`. That seems thin. The Specialist should also be listening on `scan-primary` for target data.

They click the Specialist's row to expand it. The row unfolds to show full blueprint details: skills (hack, extract), rules (3 of 4 slots filled: "if tagged enemy in range → hack", "if hacked enemy → extract", "if no target → move toward tagged tile"), hooks (1 of 2 slots used: broadcasting on `specialist-intel`). One hook slot is empty. One rule slot is empty.

Dani sees the problem: the Specialist has no *incoming* data feed. It relies entirely on its own medium-range perception (range 3) to find targets. If the enemy is beyond range 3, the Specialist wanders aimlessly until it stumbles into something. That's why the army falls apart at tick 30 — by then, the easy targets are eliminated and the Specialist can't find the remaining enemies hidden in the back line.

**Minute 1:00 — Wiring the Fix**
Dani clicks [EDIT] on the Specialist row. The workbench opens to the Specialist blueprint. They navigate to the Hooks tab and add a new hook in the empty slot: listen on `scan-primary`. Now the Specialist will receive scout reports and can navigate toward reported enemy positions.

They also add a fourth rule: "if context contains enemy position from scan-primary → move toward position." This rule goes at priority 3, below "hack" and "extract" but above the default "move toward tagged tile."

Back in the army overview matrix, the Specialist's row now shows 3 cells: `scan-primary` (←●), `cmd-reassign` (←●), `specialist-intel` (●→). The row is denser, more connected, more alive.

**Minute 1:45 — Topology Check**
Dani switches to topology view for a sanity check. The force-directed layout arranges the 7 nodes. The two Scout nodes float on the left periphery. The two Relay nodes cluster in the middle. The three combat nodes (2 Strikers + Specialist) sit on the right. The Command node floats slightly above center, connected to most nodes.

Dani notices the topology is now a proper **two-tier hierarchy**: Scouts → Relays → Combat units, with Command overseeing everything. Before the fix, the Specialist was dangling off the Command node like an appendage, disconnected from the main information flow. Now it has a `scan-primary` link pulling it into the main data pipeline.

The two dead channels (`tag-broadcast`, `decoy-signal`) show as lonely red dashed lines pointing nowhere from their source nodes. Dani right-clicks each and deletes them. The topology simplifies. Seven nodes, seven channels, clean hierarchical flow.

**Minute 2:30 — Production Queue Review**
Dani switches to roster view for a final production check. The 7 cards are arranged in production order. Each card shows cost at the bottom. The total mineral cost is displayed in the top toolbar: "142m / 180m budget." They have room for one more unit.

They drag the Command Omega card from position 7 to position 3 in the roster — they want the Command agent produced earlier so it can start coordinating sooner. The production queue conveyor belt below the roster updates to reflect the new order.

Dani scans the queued counts: Scout Alpha ×2, Scout Bravo ×1, Relay Beta ×2, Relay Gamma ×1, Striker Delta ×3, Striker Epsilon ×2, Specialist Sigma ×2, Command Omega ×1. Total: 14 units. The card badges show these counts clearly.

**Minute 3:15 — Execute with Confidence**
Dani hits EXECUTE. For the first time in 6 attempts, they feel confident the communication architecture is sound. Every channel has at least one broadcaster and one listener. The Specialist is connected to the scout data pipeline. The dead channels are cleaned up. The production order puts the Command agent online by tick 8 instead of tick 14.

**UI Annotations:**
- **Column density as diagnostic:** In matrix view, the visual density of a column instantly communicates channel health. A column with 4-5 cells is a healthy bus. A column with 1 cell is suspicious. A column with 0 listen cells is dead. No numbers needed — the spatial pattern IS the data.
- **Row expansion in matrix:** Clicking a row unfolds it to ~3× height showing full blueprint details. Other rows compress slightly to make room. A second click collapses it. Only one row expands at a time.
- **Production cost in roster:** Each card shows individual cost. Top toolbar shows total cost vs. budget with a progress bar. Over-budget = red bar, under-budget = green bar.
- **Drag-to-reorder in roster:** Cards are draggable. Dropping a card between two others inserts it. The conveyor belt production queue strip at the bottom mirrors the reorder with a smooth animation. Reordering cards = reordering production.
- **Dead channel deletion:** Right-click on dead channel (topology: dashed red line, matrix: red column header) → "Delete Channel" → confirmation modal → channel removed from all blueprints.

---

## Interaction Effects

- **With workbench layout (3.14):** The army overview is a *layer above* the workbench. The workbench edits one blueprint; the overview sees all blueprints. The zoom-in/zoom-out transition between them must feel fluid — breadcrumb navigation, smooth animation, state preservation (scroll position, tab selection in workbench).
- **With hooks UI (3.11):** The army overview makes channel wiring visible across blueprints. If the hooks UI uses a patch-bay metaphor for *within* a blueprint, the army overview extends that metaphor *across* blueprints — the patch bay becomes a wiring cabinet.
- **With channel color palette (3.13):** Channel colors assigned in the hooks UI carry through to the army overview. The ribbons, matrix cells, and graph edges all use the same channel colors. Consistency is crucial — if `recon-net` is seafoam green in the workbench, it must be seafoam green in every overview view.
- **With Inspector:** The Inspector shows post-battle signal flow. The army overview shows pre-battle intended wiring. Comparing the two — "I wired it this way, but the signals actually flowed that way" — is a core learning loop. The Inspector could offer an "overlay actual vs. intended" mode.
- **With signal latency (3.07):** The topology view could show hop counts on edges. Scout → Relay = "2 ticks." Scout → Relay → Striker = a chain with "2 ticks" + "2 ticks" labels. This makes latency a spatial property visible in the overview.
- **With production queue (conveyor belt):** The roster view naturally integrates production order. The topology and matrix views do not. A small conveyor belt strip at the bottom of all three views could maintain production queue awareness regardless of active view mode.
- **With Command agent design (3.03):** The Command agent's hooks dynamically reroute other agents' channels. The army overview shows the *static* wiring. The sealed watch / Inspector shows the *dynamic* wiring as the Command agent modifies it mid-battle. This distinction — plan vs. execution — is core to the game's identity.

---

## The TikTok Clip

A 15-second clip: the camera shows a chaotic roster of 6 cards with ribbons crossing everywhere. The player clicks the topology view toggle. The cards explode outward and rearrange into a beautiful star network — nodes orbiting, edges drawing themselves, a dead channel glowing red. The player right-clicks the dead channel, it dissolves, and the network diagram simplifies into a clean hierarchy. Cut to the sealed watch: the army executes flawlessly. Text overlay: "SEE your army. FIX your army."

---

## Recommendation

**Ship all three views behind a toggle.** The roster view is the default — accessible, production-integrated, scales from 2 to 8 blueprints. The topology view is the power user's diagnostic tool — reveals network shape, dead channels, bottlenecks. The matrix view is the engineer's spreadsheet — perfect for systematic channel auditing. Each view answers different questions:

| Question | Best view |
|----------|-----------|
| What do I have? | Roster |
| How are they connected? | Topology |
| Is anything broken? | Matrix |
| What should I produce next? | Roster |
| Why is my army slow? | Topology (shows hop chains) |
| Which channels are redundant? | Matrix (shows column similarity) |

The three views are not redundant — they're complementary lenses on the same underlying data. The toggle between them should be instant (under 200ms transition), and the player's preferred view should be remembered across sessions.
