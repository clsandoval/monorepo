# 3.10d — Wire Routing Algorithms for the Subway Map Paradigm

## Overview

The subway map paradigm — established in hook-visualization.md (3.10) as the recommended Plan screen rendering mode — draws channel wires as permanent colored lanes along the 8x8 grid's edges. Units are stations. Channels are transit lines. Signal capsules travel along the lanes at 1 tile per tick. The question this document explores is not *whether* to draw the subway map, but **how the wires find their paths**: the routing algorithm that determines which grid edges a wire follows between two connected units, how wires cross without becoming illegible, how multiple channels sharing a segment stack into parallel lanes, and whether the player can intervene in the routing with manual waypoints.

This is a visual infrastructure problem disguised as a game design problem. The locked spec establishes:
- **Channel wires** are colored dashed lines connecting all units subscribed to the same channel
- **Signal chains** are visible during sealed watch as traveling capsule segments
- **Channel map panel** is read-only, auto-generated — the player does not manually draw wires
- **8-color palette** with compound identity: color + dash pattern + shape marker (per 3.10c)
- **8x8 grid** means maximum Manhattan distance is 14 tiles (corner to corner), and maximum 8 channels can coexist before palette exhaustion triggers second-octave recycling
- **Inspector mode** traces signal paths with counterfactual ghost chains and latency pips

The routing algorithm must serve three masters simultaneously: **legibility** (the player can trace any single wire from source to destination), **density** (8+ channels with 6+ units each can coexist without visual collapse), and **performance** (routing must recompute in under 16ms when the player drags a unit to a new tile during the plan phase).

---

## The Routing Spectrum: Four Approaches

### Approach A: "The Clothesline" — Straight-Line Direct Routing

**Philosophy:** Draw a straight line from each sender to each receiver. No grid snapping. No path-finding. The wire goes point-to-point, cutting across tiles diagonally, ignoring the grid structure entirely.

**How it works:** For each channel, compute all unit-to-unit connections (or a spanning tree if the channel has 3+ subscribers). Draw a straight line segment between each connected pair. Lines use the channel's assigned color, dash pattern, and shape markers at each endpoint. Crossings are handled only by z-ordering — the most recently hovered channel floats to the top.

**Sensory description:** The plan screen looks like a conspiracy board. Colored threads criss-cross the grid at arbitrary angles — a cyan line from B2 to F7 slashes diagonally across five tiles, passing through the centers of C3, D4, E5, F6 without acknowledging them. A magenta line from A1 to H4 cuts at a shallow angle, crossing the cyan line somewhere around D4 with no visual separation. Where three or four channels converge in the middle of the board, the lines tangle into a colored knot — a cat's cradle of dashes, each technically a different color but perceptually merged into a vibrating mass. The grid beneath the wires feels irrelevant, like graph paper behind a child's drawing. Hovering over a wire highlights it — the hovered line thickens to 3px and glows while all others fade to 15% opacity — but the player must hover to read, and hovering requires knowing where to look.

During sealed watch, signal capsules travel along these diagonal paths. A capsule on a diagonal line moves at 1 tile per tick but covers more screen distance per tick than a capsule on an orthogonal line — the visual speed is inconsistent. The tick counter pips on the wire (per 3.10b) are unevenly spaced because the wire is not grid-aligned. The capsule arrives at the correct game-time, but the animation feels jittery, like a train on uneven track.

**Strengths:**
- Zero computational cost. No path-finding, no layout algorithm. O(n) in the number of connections.
- Honest. The wire shows the true geometric relationship between units. Distance is visually accurate.
- Simple to implement. A first-playable prototype can ship this in hours.

**Weaknesses:**
- Crossings are illegible. With 4+ channels, the center of the board becomes an unreadable tangle. No crossing handling means no way to trace a wire through a dense area without hover-highlighting.
- Violates the subway map metaphor. Transit maps exist precisely because straight-line geographic routing is illegible. The whole point of the subway map paradigm is to abandon geographic accuracy for topological clarity.
- Signal animation inconsistency. Diagonal wires create different visual speeds for the same game-time latency, undermining the latency legibility system (3.10b).
- Does not scale. At 8 channels with 6 units each, the board has up to 48 wire segments crossing freely. The visual noise overwhelms the grid, the units, and the channel identity markers.

---

### Approach B: "The Metro" — Manhattan Right-Angle Routing

**Philosophy:** Wires follow grid edges only. Every segment is horizontal or vertical. Turns are 90-degree right angles. The board IS the transit map — wires run along tile boundaries like subway lines running along streets. This is the true subway map paradigm.

**How it works:** For each channel connection (sender to receiver), compute a Manhattan-distance path along grid edges. The path-finding algorithm prefers edges that are not already occupied by other channels (to minimize shared segments and crossings). When multiple paths of equal length exist, prefer the path that runs along the board's perimeter (reducing central congestion). Each wire occupies a **lane** within the grid edge — a thin strip offset from the edge's center line. The first channel on an edge gets the center lane; additional channels stack outward in parallel lanes, each offset by 3px.

Right-angle turns use small rounded corners (2px radius) to soften the visual, matching real metro map aesthetics (the London Underground's 45-degree chamfers, adapted to pure 90-degree here). At grid intersections where two wires cross, the crossing is rendered with a small **bridge** graphic: the wire that arrived at the intersection first (by palette order) passes straight through, and the crossing wire shows a tiny 4px semicircular hop — a visual bump that reads as "this wire passes over that one." The bridge is colored to match the hopping wire.

**Sensory description:** The plan screen transforms into a circuit board. Clean colored lines run along the gaps between tiles — a cyan line leaves unit B2 heading east along the B-row edge, turns south at column E with a crisp rounded corner, and terminates at unit E6. The line is 2px wide, solid within its lane, with the channel's dash pattern applied (solid for cyan, slot 1). Where it crosses a magenta line running north-south along column D, the cyan line hops — a tiny semicircular bridge, like a freeway overpass rendered in miniature. The hop takes 4px of vertical space and is colored cyan, making it clear which wire is doing the crossing.

Parallel channels sharing a segment — say cyan and gold both running east along the B-row edge — stack into adjacent lanes. Cyan occupies the lane 2px north of the edge center; gold occupies the lane 2px south. The two lines run side by side like a dual-track railway, each in its own color, each with its own dash pattern. The shared segment reads as a transit corridor — two lines serving the same route, visually distinct but physically adjacent. At the point where gold diverges south and cyan continues east, the lanes peel apart with separate rounded corners, like highway exit ramps.

During sealed watch, signal capsules travel along the right-angle paths. A capsule moving east turns south at the corner with a brief deceleration-and-acceleration animation — not a pause, but a 50ms ease that makes the turn feel physical, like a real train rounding a bend. The tick counter pips are evenly spaced along the Manhattan path, each pip exactly one tile apart, making the 1-tick-per-hop latency visually consistent and countable. The pips look like station markers on a metro line.

When the player drags a unit to a new tile during the plan phase, all wires connected to that unit re-route in real-time. The routing algorithm runs in under 8ms for typical 6-channel configurations. The wires animate their new paths with a 200ms ease — the old path fades while the new path draws itself from source to destination, like a transit line being extended on a live construction map.

**Strengths:**
- Maximum legibility. Every wire follows grid edges, making each path traceable by eye. The player can follow a cyan line from B2 eastward, see it turn south at E, and arrive at E6 without ever losing track.
- Bridge crossings are unambiguous. The hop graphic makes it instantly clear which wire crosses over which. No z-order guessing.
- Parallel lane stacking handles shared segments gracefully. Two or three channels sharing a corridor remain individually distinguishable.
- Signal animation is consistent. Capsules travel at a uniform visual speed because all segments are grid-aligned. Latency pips are evenly spaced. The 1-tick-per-hop promise is visually honored.
- Matches the established subway map metaphor perfectly. Players who have seen a metro map anywhere in the world will instantly understand this visual language.

**Weaknesses:**
- Manhattan paths are longer than straight-line paths. A wire from A1 to H8 must travel 14 grid edges (7 east + 7 south) instead of a direct diagonal. The wire is visually longer than the actual signal travel time might suggest — though since game latency is already hop-based and Manhattan, this is actually accurate.
- Central congestion. On an 8x8 board, the center rows and columns carry disproportionate traffic. With 6+ channels, the edges around D4-E5 can accumulate 4-5 parallel lanes, consuming significant visual space.
- Lane stacking has a limit. With 5+ channels sharing a single grid edge, the parallel lanes extend beyond the tile boundary, overlapping with adjacent tile content. A practical limit is 4 lanes per edge before visual breakdown.
- Routing ambiguity. For a connection from A1 to C3, the algorithm must choose between two equal-length L-shaped paths (east-then-south or south-then-east). The choice affects which edges carry traffic and which crossings occur. Different heuristics produce different visual layouts, and the player cannot predict which path the algorithm will choose.

---

### Approach C: "The River" — Bezier Curve Routing

**Philosophy:** Wires flow as smooth curves between connected units. No grid snapping. No right angles. The path is an organic, flowing line that avoids obstacles and other wires through curvature rather than discrete turns. The aesthetic is biological — vascular networks, river deltas, neural pathways.

**How it works:** For each connection, compute a cubic Bezier curve from sender to receiver. Control points are placed to avoid crossing other wires where possible (using a force-directed repulsion model: wires push away from each other like charged particles). When crossings are unavoidable, the crossing angle is maximized — perpendicular crossings are clearer than shallow-angle crossings. The curve's curvature is bounded to prevent loops or extreme bends. A global layout pass adjusts all curves simultaneously, optimizing for minimum crossings and maximum inter-wire spacing.

**Sensory description:** The plan screen looks like a living organism's circulatory system. A cyan curve leaves unit B2, bowing gently northward to avoid a magenta curve crossing the center of the board, then swooping south in a long arc to reach unit E6. The curve has no sharp angles — every direction change is a smooth inflection, like a river bending around terrain. The line width varies subtly along the curve: 2px at the endpoints, swelling to 2.5px at the apex of each bend, giving the wire a sense of tension and elasticity, like a rubber band stretched between two pins.

Where curves cross, they intersect at near-perpendicular angles. The crossing point shows no bridge graphic — instead, the two wires pass through each other, relying on color and dash-pattern differentiation alone. At low channel counts (2-3), this is perfectly legible. At 5+, the crossings begin to blur — the eye cannot reliably determine which curve continues in which direction when two similarly-colored curves cross at a shallow angle.

During sealed watch, signal capsules glide along the curves with a fluid, almost organic motion. The capsule accelerates slightly on straight sections and decelerates into curves, like a ball rolling through a curved tube. The motion is beautiful but imprecise — the tick pips cannot be evenly spaced along a Bezier curve without distorting the curve's visual rhythm. The pips cluster at high-curvature regions and spread apart on straight sections, making latency counting harder than with Manhattan routing.

**Strengths:**
- Aesthetically distinctive. No other strategy game looks like this. The organic wire style creates a unique visual identity — part biological, part art installation.
- Crossings are minimized by the force-directed layout. The algorithm actively avoids crossings rather than just rendering them when they occur.
- No routing ambiguity. Each curve is uniquely determined by its control points. There is no "which path did it choose?" question — the path is the curve.
- Beautiful for screenshots and streaming. Curved wires read as sophisticated and premium.

**Weaknesses:**
- Harder to trace. The human eye follows straight lines and right angles more easily than curves. A cyan curve that bows northward before heading south to its destination forces the eye to track a non-intuitive path.
- Crossing handling is weaker. Without bridge graphics, crossings rely entirely on color/dash differentiation. At 5+ channels, this fails for colorblind players and fails in general for closely-spaced curves.
- Latency pips are unevenly spaced. The 1-tick-per-hop promise is visually distorted because Bezier arc length does not distribute evenly along the parameter.
- Performance cost. The force-directed layout is O(n^2) in the number of wire segments. With 8 channels and 6 units each, the layout pass may exceed the 16ms budget for real-time re-routing during unit drag.
- Violates the subway map metaphor. The whole design intent is a transit map. Curves are not transit maps. Rivers are not subways.

---

### Approach D: "The Architect" — Auto-Routed with Manual Waypoints

**Philosophy:** The system auto-routes wires using Manhattan routing (Approach B) as the default, but the player can drag waypoints onto any wire to force it through a specific path. Waypoints are small diamond handles on the wire that the player can grab and drag to a new grid edge, forcing the wire to route through that point.

**How it works:** Each wire starts with the same Manhattan path-finding as Approach B. The player can right-click (or long-press on mobile) any wire to place a waypoint — a small diamond-shaped handle that snaps to grid edges. Dragging the waypoint forces the wire to route through that edge. Multiple waypoints per wire allow arbitrary manual paths. Waypoints persist across plan phase edits. A "Reset routing" option removes all waypoints and returns to auto-routing. The channel map panel shows a small wrench icon next to any channel with manual waypoints, indicating player intervention.

**Sensory description:** The player has six channels wired in the default Manhattan layout. Most look clean, but the cyan and gold wires are stacking awkwardly along the D-column edge — four parallel lanes competing for space, making the corridor illegible. The player right-clicks the cyan wire. A context menu appears: "Add waypoint." They click. A small cyan diamond materializes on the wire at the clicked position, pulsing gently. They drag the diamond westward, to the C-column edge. The wire re-routes in real-time: the cyan line peels away from the congested D-column, arcs west through C, then continues south. The D-column drops from four lanes to three — suddenly legible. The diamond handle settles into its new position, a permanent marker of the player's routing intention.

The diamond waypoint is 8px, hard-edged, and colored to match the channel. It sits on the grid edge like a small jewel pinned to a rail line. When the player hovers over it, a tooltip reads: "Drag to reroute. Right-click to remove." The waypoint casts a faint colored shadow on the tile beneath it, grounding it in the grid's physical space. Multiple waypoints on the same wire connect with the same Manhattan routing rules — each segment between waypoints is independently routed.

**Strengths:**
- Best of both worlds. Auto-routing handles the 90% case; manual waypoints handle the 10% where the algorithm's choice creates congestion or confusion.
- Player expression without player burden. The default is fully automatic. The player who never touches waypoints gets clean Manhattan routing. The player who cares about layout aesthetics can fine-tune.
- Congestion relief. The player can manually spread wires across the board to avoid central bottlenecks — a form of visual load-balancing.
- Debugging tool. A player investigating a specific signal path can route the wire through a conspicuous path, making it easier to follow during sealed watch.

**Weaknesses:**
- Feature bloat for a read-only panel. The locked spec says the channel map panel is **read-only** and **auto-generated**. Manual waypoints introduce write access to the visual layer, which contradicts the spec's intent. The wires are a *display* of the underlying channel architecture, not a configurable element. Adding waypoints turns the map from a mirror into an editor.
- Maintenance burden. When the player drags a unit to a new tile, all waypoints on connected wires must be re-evaluated. A waypoint that was sensible when the unit was at B2 may create an absurd detour when the unit moves to G7. The system must either auto-remove obsolete waypoints (confusing) or preserve them (creating visual artifacts).
- Tutorial overhead. Waypoints are a power-user feature that beginners should never encounter. But they exist in the UI, creating affordance pressure — the waypoint diamond handles are visible on hover, tempting the curious beginner into a feature they don't need.
- Mobile awkwardness. Dragging a small diamond handle on a touch screen, on a dense 8x8 grid, with multiple overlapping wires, is a precision nightmare. The target area is approximately 8x8 pixels — below the recommended 44x44 minimum touch target.

---

## Player Journeys

#### Journey: Maya, 16, Minecraft Redstone Builder

Maya has spent two years building redstone circuits in Minecraft. She understands signal paths intuitively — redstone dust follows blocks, repeaters add delay, torches invert signals. When she opens Robot Uprising's plan screen for the first time, she has four units with two channels: `recon-net` (cyan, solid) and `strike-net` (magenta, dashed).

With Manhattan routing (Approach B), the wires snap to grid edges exactly like redstone dust snapping to block surfaces. Maya traces the cyan line from her Scout at B2 east along the B-row edge, watches it turn south at column F with a crisp rounded corner, and arrive at her Relay at F5. She nods — the path is three tiles east, three tiles south. She counts the tiny tick pips along the wire: six pips, six hops, six ticks of latency. "That's kinda far," she murmurs, and drags the Relay one tile north to F4. The wire re-routes instantly — now five pips. The animation is a smooth 200ms redraw, the old path dissolving while the new one traces itself forward. She grins. This is redstone, but prettier.

She adds a third channel (`alarm-net`, gold, dotted) and watches the wires multiply. Where cyan and gold share the F-column edge, they stack into parallel lanes — two thin colored lines running side by side, 3px apart. Maya leans closer. In Minecraft, two redstone lines on the same block would short-circuit. Here, they coexist peacefully, each in its own lane. She sees the bridge graphic where gold hops over magenta at intersection D4 — a tiny semicircular bump. "Oh, like a freeway overpass," she says. The crossing is immediately clear. She adds a fourth channel. A fifth. At five channels, the central corridor around D-E columns carries three parallel lanes plus two crossings. It is dense but readable — each wire has its own color, its own dash pattern, and bridges announce every crossing. Maya does not feel lost. She feels like she is building a transit system.

If the routing were Bezier curves (Approach C), Maya would be confused. Redstone does not curve. Signals do not arc. The organic lines would feel foreign and imprecise — she would not be able to count hops by eye because the pips cluster unevenly along the curves. The beauty of the curves would be wasted on her; she wants engineering clarity, not art.

#### Journey: Daniel, 34, Factorio Veteran and Amateur PCB Designer

Daniel has 2,000 hours in Factorio and a weekend hobby designing PCBs in KiCad. He understands routing at a professional level — auto-routers, design rule checks, via placement, differential pair routing. When he opens Robot Uprising's plan screen with six channels and eight units, his first instinct is to evaluate the routing algorithm's intelligence.

Manhattan routing (Approach B) impresses him with its lane stacking. He sees three channels sharing the E-row edge — cyan, gold, and lime running in parallel lanes, each offset 3px from center. "That's differential pair routing," he mutters approvingly. The bridge crossings are clean — he has seen the same graphic in KiCad's 3D board viewer, where traces hop over each other on different copper layers. He reaches for a waypoint handle instinctively, wanting to re-route the lime wire around the congested center. If Approach D's waypoints are available, he finds the diamond handle, drags it, and feels at home — this is KiCad's interactive router. If waypoints are absent (pure Approach B), he feels a brief frustration, then recognizes the design intent: this is a read-only map, not an editor. The routing is the system's job. His job is the architecture.

He opens the Inspector after a battle and traces a failed signal. The Inspector's signal chain timeline shows the exact path the signal took — each Manhattan segment, each hop, each tick. The routing algorithm's path choices are now diagnostic data. He notices that a signal from A1 to H8 routed east-then-south (14 hops) when south-then-east would have been 14 hops too but avoided a congested crossing at D4. He wonders if the routing algorithm considers signal density in its path selection. This is the kind of question that keeps Daniel engaged for hours — not the game's combat, but its infrastructure.

Bezier routing would frustrate Daniel. He has spent years learning that clean routing means right angles, minimum crossings, and consistent trace widths. Curves are what auto-routers produce when they give up on clean Manhattan paths. Seeing curves in a system that celebrates information architecture would feel like seeing a PCB designed by an artist instead of an engineer.

#### Journey: Lola, 62, Retired Transit Planner, New to Strategy Games

Lola spent her career designing bus routes for a mid-sized city's transit authority. She understands network topology from a human-services perspective — coverage areas, transfer points, route frequency, the politics of which neighborhoods get service. Her grandson installed Robot Uprising on her tablet. She has never played a strategy game.

She opens the plan screen and sees Manhattan-routed wires in the subway map style. Her breath catches. She knows this visual language. The colored lines running along grid edges, turning at right angles, stacking into parallel corridors — this is a transit map. She has drawn hundreds of these by hand on large paper sheets, tracing bus routes through city grids. The cyan line from B2 to F5 is the 42 crosstown. The magenta line from A1 to H4 is the express to the waterfront. The parallel lanes where cyan and gold share the E-row edge — that is a transit corridor, two routes serving the same street, offering passengers a choice.

She watches the sealed watch phase. Signal capsules travel along the wires like buses following routes. A cyan capsule leaves B2 heading east, pauses visibly at each tick pip — each pip is a stop. It turns south at F and arrives at F5 six ticks later. "Six stops," she says. "That's too many for an express." She drags the Relay from F5 to D3 — now the cyan wire is four hops. "Better. Direct service."

Lola discovers the bridge crossings and immediately understands them as grade-separated intersections — overpasses where two routes cross without conflicting. She has fought city council for funding for these. She sees the parallel lane stacking and understands it as a shared right-of-way. She adds a seventh channel and watches the central corridor swell to four parallel lanes. "That corridor needs a dedicated transitway," she says to no one. If waypoints were available, she would use them to spread routes across the board like she spread bus lines across underserved neighborhoods. Without waypoints, she works within the auto-routing, repositioning units to create cleaner paths — the same skill she used when a fixed rail line forced her to reroute three bus connections.

The subway map paradigm is not a metaphor for Lola. It is a professional tool she already knows how to read.

---

## Interaction Effects

### With Channel Colors (3.10c)

The routing algorithm directly determines how much visual real estate each channel color occupies. Manhattan routing creates long, grid-aligned segments where a channel's color is displayed at full strength — the eye can follow a solid cyan line for five tile-lengths without interruption. Bezier routing compresses the same connection into a shorter screen-space curve, reducing the color's exposure time and making it harder to distinguish from nearby channels. The compound identity system (color + dash pattern + shape marker) works best with Manhattan routing because the dash pattern repeats predictably along straight segments; along Bezier curves, the dash pattern distorts at high-curvature points, making the dash-dot pattern look like a solid line at tight bends.

Lane stacking in Manhattan routing places two channel colors side-by-side at 3px spacing. The 3.10c palette was designed for this: adjacent palette slots (cyan/magenta, gold/lime, coral/violet) have maximum perceptual distance. If the routing algorithm assigns lanes in palette order, adjacent lanes will always be maximally distinguishable. Bezier routing has no lane stacking — curves simply pass near each other, with no guarantee of consistent spacing.

### With Hook Range (3.10a)

If hook range is enabled (Approach B "Radio Tower" or C "Tuning Dial" from 3.10a), the routing algorithm must respect range boundaries. A wire should not be drawn between two units if the sender's broadcast range does not reach the receiver. The wire's visual path can include a **range boundary marker** — a small red X at the point where the Manhattan path crosses the sender's range limit, with the remaining segment drawn as a dashed grey ghost wire. This diagnostic rendering requires the routing algorithm to know the range geometry, not just the grid topology.

Manhattan routing handles this cleanly: the range boundary falls on a specific grid edge, and the red X sits precisely at that edge. Bezier routing places the boundary at an arbitrary point along a smooth curve, making the cutoff feel imprecise.

### With the 8x8 Grid

The grid's small size is both a blessing and a constraint. Manhattan paths between any two tiles are at most 14 segments long. This means the routing algorithm never faces the exponential complexity that plagues PCB auto-routers on large boards. A brute-force shortest-path search with congestion avoidance runs in under 2ms for any single connection. The entire board (8 channels, up to 48 connections) routes in under 16ms — well within the real-time budget for unit drag interaction.

However, the small grid also means that the center (D4-E5) is a natural bottleneck. Any Manhattan path that crosses the board passes through or near the center. With 6+ channels, the central edges accumulate 3-5 parallel lanes, consuming 12-20px of visual space in a region where units are also clustered. The routing algorithm must include a **congestion penalty** that pushes wires toward the perimeter when central edges are saturated.

### With Inspector Mode Signal Tracing

The Inspector's signal chain timeline (3.10b) replays signal travel along the routed path. Manhattan routing produces paths that are identical to the game's actual hop-by-hop signal delivery — each grid edge is one hop, and the Manhattan path length equals the hop count. This means the Inspector's animation is physically accurate: the signal dot moves one grid edge per tick, and the wire it follows is the exact path the signal took.

Bezier routing creates a visual path that does not correspond to the game's hop-by-hop delivery model. The signal travels along a curve, but the game engine delivers it along a grid-edge path. The Inspector must either show the "true" grid path (breaking the Bezier aesthetic) or animate along the curve (breaking physical accuracy). This is a fundamental tension that Manhattan routing avoids entirely.

### With Plan Screen Layout

The plan screen must accommodate the 8x8 board grid, the channel map panel (read-only sidebar), the unit workbench (configurable panel), and the wire overlay. Manhattan-routed wires occupy the gaps between tiles — the 4-6px spaces that separate tile sprites. This means wires do not overlap tile content. Lane stacking extends the wire corridor to 12-20px for congested edges, which may encroach on tile sprites if tiles are tightly packed. The plan screen layout must reserve sufficient inter-tile spacing for up to 4 parallel lanes — approximately 16px per grid edge, which on a 1920x1080 screen with an 8x8 grid allocates ~90px per tile plus ~16px per edge, fitting comfortably.

---

## Comparable Games

### KiCad PCB Routing

KiCad's interactive router is the gold standard for Manhattan routing with manual control. The router follows design rules (minimum trace width, clearance, via size) while the user guides the path by moving the mouse. Traces snap to a grid, turn at 45 or 90 degrees, and automatically push other traces aside to make room (the "shove" router). Robot Uprising's auto-routing is the simplified version: no user guidance during routing, no shove behavior, but the same grid-snapping, lane-stacking aesthetic. KiCad validates that Manhattan routing scales to hundreds of traces on large boards — on an 8x8 grid with 8 channels, it is trivially manageable.

### Factorio Belt and Pipe Routing

Factorio's transport belts follow grid edges exclusively. Players build belts tile-by-tile, creating Manhattan paths by hand. Underground belts solve the crossing problem — a belt dives underground, passes beneath another belt, and resurfaces. This is the physical analogy for the bridge crossing graphic: the hop is an "underground pass." Factorio proves that grid-aligned routing with explicit crossing handling scales to enormous complexity while remaining readable. The visual language is universal among Factorio's 4+ million players.

### Cities: Skylines Road Tools

Cities: Skylines offers free-form road drawing with optional grid snapping. Roads curve naturally, following Bezier splines when the player drags. The result is aesthetically beautiful but functionally challenging — intersections are unpredictable, road hierarchy is unclear, and traffic simulation exposes routing errors that the visual language conceals. The lesson: Bezier routing is for aesthetics, Manhattan routing is for comprehension. Robot Uprising prioritizes comprehension.

### SpaceChem Reactor Pipes

SpaceChem's reactors use fixed-grid routing with explicit path drawing. The player places individual path segments tile-by-tile, creating exact routes for atoms to follow. Two atoms on crossing paths collide and fail. SpaceChem proves that grid-based routing can be a core puzzle mechanic. Robot Uprising's auto-routing removes this puzzle (the routing is automatic, not player-designed) but inherits the visual clarity of grid-aligned paths.

### Mindustry Conveyors

Mindustry's conveyor belts are player-placed along grid edges with automatic corner rendering. Multiple conveyor types (belts, pipes, power lines) share the same grid, creating visual density comparable to Robot Uprising's multi-channel routing. Mindustry handles this by using distinct visual languages per resource type (belts are solid, pipes are transparent, power is dotted). Robot Uprising's compound identity system (color + dash + shape) serves the same purpose for channel differentiation.

---

## Recommendation: "The Clean Metro" — Manhattan Routing with Congestion-Aware Path Selection

**Approach B** is the clear choice. It honors the subway map metaphor, produces consistent latency visualization, scales to 8 channels on the 8x8 grid, and matches the mental models of the broadest player base — from transit riders to PCB hobbyists to Factorio veterans.

The specific implementation should include:
1. **Manhattan shortest-path routing** with a congestion penalty that avoids edges already carrying 3+ lanes
2. **Parallel lane stacking** at 3px offset per lane, maximum 4 lanes per edge, with palette-order lane assignment for maximum color contrast between adjacent lanes
3. **Bridge crossing graphics** — 4px semicircular hops, colored to match the hopping wire, with the lower-palette-number wire always passing beneath (deterministic z-order)
4. **200ms animated re-routing** when units are dragged during the plan phase
5. **No manual waypoints** — the channel map panel remains read-only per the locked spec; routing is the system's responsibility, architecture is the player's responsibility

Approach D's waypoints are deferred. If player feedback during first playable indicates routing frustration (wires consistently choosing unintuitive paths), waypoints can be added as an advanced feature gated behind Mission 7+ or an Options toggle. But the default must be fully automatic to preserve the "design the architecture, not the layout" philosophy.

Approach A (straight lines) is useful only as a debug mode — the Inspector could offer a "direct line" toggle for players who want to see true geometric distances. Approach C (Bezier) is reserved for a potential "organic" visual theme or accessibility option (some players may find curves easier to trace than right angles), but it is not the default.
