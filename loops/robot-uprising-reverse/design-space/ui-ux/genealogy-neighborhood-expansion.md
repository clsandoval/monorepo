# The Spotlight Reveal — Genealogy Neighborhood Expansion on First Arrival

**Aspect:** 4.102 — Genealogy "neighborhood expansion" on first arrival: when a player navigates to the genealogy via the pre-ranking drawer link for the first time, the panel shows only the immediately relevant signal path (3 nodes, 2 edges), not the full graph; "Expand to full genealogy" button reveals remaining agents; prevents information overload during structured discovery; subsequent visits default to full graph; interaction with 4.22 Act 2 tool introduction.

**Parent:** 4.66 — Signal genealogy as pre-ranking source (cross-tool linking from drawer to genealogy)
**Siblings:** 4.103 — Counterfactual genealogy overlay; 4.104 — Signal vocabulary consistency audit; 4.105 — "Why was this signal dropped?" sub-panel
**Related:** 4.22 — Act 2 tool introduction sequence; 4.16 — Signal genealogy visualization; 4.04b — Two-Act debrief structure; 4.58 — Pre-ranking transparency panel; 8.09 — Diagnostic layer as teaching arc; 4.15 — Probe hooks; 3.08d — Behavior tree read-only visualization

---

## The Core Problem

The signal genealogy graph is the most informationally dense tool in Robot Uprising's diagnostic suite. A five-agent squad generates a full network: five nodes, up to twenty directional edges (every agent can potentially signal every other agent), temporal annotations on each edge, broken-edge markers for dropped signals, latency color-coding, and hook trigger indicators. When the genealogy panel opens cold — all agents visible, all edges drawn, all annotations rendered — the visual impression is of a wiring diagram. Dense, complex, and for a player encountering the tool for the first time, incomprehensible.

This is the opposite of what 4.66 was designed to achieve. The cross-tool link from the pre-ranking drawer exists specifically to give the player a *purposeful* first encounter with the genealogy. The drawer said "RELAY-C was active at tick 52." The player clicked, wanting to see what "active" means. They arrive in the genealogy panel with a single, clear question: "Show me what RELAY-C was doing at tick 52."

But the full graph answers a different, much broader question: "Show me what *every agent* was doing across *the entire match*." The player asked about one agent at one moment. The graph shows five agents across hundreds of ticks. The question and the answer are mismatched. The player's eyes glaze. They close the panel. The genealogy tool has been encountered and dismissed in under three seconds.

**The Spotlight Reveal solves this.** On first arrival via the drawer link, the genealogy does not render the full graph. It renders only the *neighborhood* — the signal path immediately relevant to the drawer's claim. Three nodes, two edges, one story. The player sees SCOUT-B on the left, RELAY-C in the center (highlighted, pulsing amber), and STRIKER-A on the right. One solid edge from SCOUT-B to RELAY-C (the signal that arrived). One dashed edge from RELAY-C to STRIKER-A (the signal that was dropped). That is all.

The full graph exists. It is available. A button at the bottom of the panel reads "Expand to full genealogy" with a small network icon. But the default first view is the spotlight: a three-node narrative that directly answers the question the player was asking when they clicked.

---

## What "Relevant" Means Contextually

The neighborhood is not a fixed subgraph. It is computed from the drawer link's context — the specific element, tick, and diagnostic claim that the player clicked through from.

### Neighborhood Selection Rules

**Rule 1: The anchor node.** The element named in the drawer link becomes the center node. If the drawer said "RELAY-C was active at tick 52," RELAY-C is the anchor.

**Rule 2: One hop upstream.** Every agent that sent a signal to the anchor node within the focused tick range (tick 50-54, a window of +/-2 ticks from the specified tick) appears as an upstream neighbor. Typically one or two agents. In the canonical example: SCOUT-B, which sent its beacon to RELAY-C at tick 51.

**Rule 3: One hop downstream.** Every agent that the anchor node attempted to send a signal to within the focused tick range appears as a downstream neighbor. In the canonical example: STRIKER-A, which RELAY-C tried to signal at tick 52 and failed.

**Rule 4: Edge classification.** Successful transmissions render as solid arrows. Dropped signals render as dashed arrows with the red circle-x terminus. Partially degraded signals (received but with fidelity loss) render as thin solid arrows with a degradation gradient (full opacity at source, 40% opacity at destination).

**Rule 5: No orphans.** If the anchor node had no upstream or downstream activity in the tick range — the agent was idle — the neighborhood shows only the anchor node, alone, with a text annotation: "No signal activity at tick 52." This itself is diagnostic information: the pre-ranking said this agent was "active," but the genealogy shows silence. The dissonance is intentional — it teaches the player that "active" in the pre-ranking's vocabulary means "undergoing state change," which is not the same as "sending or receiving signals."

### What Is Excluded

Every agent not within one hop of the anchor is hidden. Their nodes are not rendered. Their edges are not rendered. They do not appear as greyed-out ghosts or partially visible outlines — they are *absent*. The panel looks like a small, intimate three-node diagram, not a filtered version of a larger graph. The player should not feel that content is being withheld; they should feel that the view is *complete* for the question being asked.

The "Expand to full genealogy" button at the bottom is the only signal that more exists. It does not say "5 agents hidden" or "showing 3 of 5." It simply offers the expansion. The framing is additive ("expand *to*"), not subtractive ("showing *only*").

---

## The Animation: From Spotlight to Full Graph

The expansion animation is the signature moment of this design. It takes 1.2 seconds and has four phases.

### Phase 1: The Button Press Acknowledgment (0.0s - 0.15s)

The "Expand to full genealogy" button depresses with a subtle scale-down (100% to 96%) and the button text fades from white to amber. A single clean tone sounds — 660Hz, 60ms duration, soft attack — the same pitch family as the drawer-to-genealogy navigation chime but one note lower, creating a musical connection: the navigation chime was the question, the expansion chime is "and here is more."

### Phase 2: The Neighborhood Breathes Outward (0.15s - 0.6s)

The existing three nodes do not stay still. They *move*. The anchor node (RELAY-C) slides from center-screen to its position in the full graph layout. The upstream node (SCOUT-B) slides from its spotlight position to its full-graph position. The downstream node (STRIKER-A) does the same. The edges between them stretch and curve to maintain their connections during the transition — they are not redrawn; they are elastically deformed, like rubber bands connecting moving pins on a corkboard.

The movement is eased with a cubic-bezier curve (0.25, 0.1, 0.25, 1.0) — gentle acceleration, smooth deceleration. The three nodes travel simultaneously. The visual effect is of the spotlight view "exhaling" — the tight cluster of three nodes relaxes into a wider spatial arrangement, as if the camera pulled back and the nodes settled into their natural positions in a larger structure.

During this phase, the background of the genealogy panel subtly darkens by 5% — the stage is dimming to make room for new actors.

### Phase 3: The Hidden Agents Materialize (0.6s - 1.0s)

The remaining agents (COMMAND and SPECIALIST, in a typical five-agent squad) fade in at their full-graph positions. They do not slide in from off-screen. They do not pop in. They materialize — opacity 0% to 100% over 400ms, with a 100ms stagger between each new node. Each node arrives with a single soft particle burst: four to six small hexagonal motes (matching the node shape) that expand outward from the node's center and fade over 200ms.

Simultaneously, all edges connected to the newly visible nodes draw themselves in. Each edge begins as a point at its source node and extends toward its destination over 300ms, the arrowhead crystallizing at the terminus. The edges draw in a specific order: edges connected to the anchor node first (showing RELAY-C's full connection set), then edges between non-anchor agents. This ordering maintains the anchor's visual priority — RELAY-C remains the focal point even as the graph grows around it.

### Phase 4: The Full Graph Settles (1.0s - 1.2s)

All nodes and edges are now visible. A final 200ms pass applies the full visual treatment: latency color-coding activates on all edges (the gradient from cool blue for fast signals to warm amber for slow ones), temporal tick annotations appear beside each edge as small grey numerals, and the timeline-sync indicator at the bottom of the panel updates to show the full match tick range rather than the focused +/-2 tick window.

The anchor node (RELAY-C) retains its amber pulse for 3 more seconds after the expansion completes, then gradually fades to match the other nodes' neutral state. This lingering highlight says: "You came here because of this node. Now you can see the whole picture, but remember where you started."

The "Expand to full genealogy" button fades out during Phase 4, replaced by a small label: "Full genealogy" with a checkmark. The transformation is irreversible within this debrief session — there is no "collapse back to neighborhood" button. The spotlight was a one-time pedagogical affordance, not an alternative view mode.

---

## The First-Visit / Subsequent-Visit Distinction

The neighborhood expansion applies only on the player's **first-ever** arrival at the signal genealogy panel via a drawer link. This is tracked per-player, not per-mission or per-debrief session.

**First visit:** Spotlight neighborhood, "Expand to full genealogy" button, the whole pedagogical scaffolding.

**Every subsequent visit:** Full graph renders immediately, pre-focused on the anchor node (which still pulses amber) and the relevant tick range. No neighborhood restriction, no expansion button. The player has already learned the tool; the scaffolding is removed.

**The threshold for "subsequent":** The player must have either (a) clicked "Expand to full genealogy" during their first visit, or (b) closed the genealogy panel and reopened it via a different drawer link or the Act 2 toggle button. Either action demonstrates that the player has engaged with the tool beyond the initial spotlight. If the player opened the genealogy via the drawer link, saw the three-node neighborhood, and immediately closed the panel without expanding — the next visit still uses the neighborhood view. The player hasn't demonstrated readiness for the full graph.

**Manual genealogy access:** If the player opens the genealogy via the Act 2 toggle button (top-right of the debrief screen) rather than via a drawer link, the full graph always renders. The toggle button is an explicit, deliberate choice to open an expert tool — no scaffolding needed. The neighborhood restriction is specifically for the drawer-link pathway, where the player may not have intended to open the genealogy at all (they just clicked a tick reference to "see more").

---

## Player Journeys

#### Journey: Mara, 24, UI/UX designer with no programming background
**Context:** Mission 4 (Noisy Channel), first encounter with relay agents, first time the pre-ranking drawer mentions an agent other than Scout or Striker. Config v1.3, no prior genealogy exposure.

**Minute 0:00 — The Drawer Opens**
Mara has just finished watching the sealed replay of Mission 4. Her relay agent (RELAY-C) was supposed to compress and forward signals from SCOUT-B to STRIKER-A, but the striker never engaged the target. She opened the pre-ranking drawer and read: "RELAY-C was active at tick 52 — the pivot tick. RELAY-C produced 18 distinct states during the match (volatility: 0.71)." The phrase "active at tick 52" is underlined in teal. She hovers. The underline thickens. A small arrow appears. She does not know where this link goes.

**Minute 0:12 — The Click**
She clicks. The chime sounds — a single bright note. The genealogy panel slides in from the right. She has never seen this panel before. What she sees: three hexagonal nodes arranged horizontally. Left node labeled "SCOUT-B" in small grey text. Center node labeled "RELAY-C," ringed in pulsing amber. Right node labeled "STRIKER-A." A solid arrow from SCOUT-B to RELAY-C. A dashed arrow from RELAY-C to STRIKER-A, terminating in a red circle-x.

Three nodes. Two edges. One broken path. Mara understands it in under two seconds. "Oh. The scout sent the signal to the relay, and the relay tried to send it to the striker, but it didn't get through." She does not need to understand latency, buffer eviction, or signal fidelity to read this diagram. The visual grammar is source-relay-destination, with the break clearly marked.

**Minute 0:30 — The Hover**
She hovers over the dashed line. A tooltip appears: "Signal dropped — STRIKER-A buffer full (8/8 slots occupied)." She thinks: "The striker's inbox was full. That is why it did not get the message." This is a complete diagnostic insight. She now knows what happened and can form a hypothesis about what to fix — either clear the striker's buffer or increase its capacity.

**Minute 0:45 — The Expansion**
She notices the "Expand to full genealogy" button at the bottom. She clicks it. The three nodes slide outward. Two new nodes materialize — COMMAND and SPECIALIST — with their own edges drawing in. The graph is now busier. She can see that COMMAND was sending signals to everyone, that SPECIALIST had a signal path she had not considered. But she has an anchor: RELAY-C still pulses amber in the center. She knows where she started. The full graph is complex but not overwhelming because she entered it from a known position.

**Minute 1:15 — The Return to the Drawer**
She clicks back to the pre-ranking drawer. The explanation makes more sense now. "Active at tick 52" means RELAY-C was in the middle of a signal chain. "Volatility: 0.71" means the relay was switching states rapidly — probably because it was trying to forward signals to a full buffer and getting bounced. She re-reads the drawer text with new understanding. The genealogy gave her the visual context; the drawer gives her the analytical framing.

**UI Annotations:**
- **Anchor node (RELAY-C):** Center of panel, hexagonal, 48px diameter, amber ring pulse (1.5s cycle), label in 12px monospace below node
- **Upstream node (SCOUT-B):** Left of anchor, 120px gap, 40px diameter, neutral grey fill, solid arrow to anchor
- **Downstream node (STRIKER-A):** Right of anchor, 120px gap, 40px diameter, neutral grey fill, dashed arrow from anchor, red circle-x at terminus
- **"Expand to full genealogy" button:** Bottom-center of panel, 200px wide, 36px height, dark background (#1A2A3A), white text, network icon (three connected dots) left of text, 8px border-radius
- **Tooltip on broken edge:** 240px wide, dark background, white text, appears 8px above the hovered edge segment, 200ms delay before showing

---

#### Journey: Kai, 31, backend engineer who has built production message queues
**Context:** Mission 6 (Chain of Command), first encounter with command agents, config v3.1. Kai has seen the genealogy toggle in the Act 2 materialization but has never opened it — he has been solving problems using the buffer state panel and counterfactual simulation exclusively. This is his first drawer-link click.

**Minute 0:00 — The Familiar Pathway**
Kai lost Mission 6 because his new COMMAND agent's reroute instruction arrived too late — STRIKER-A had already committed to the wrong target. The pre-ranking drawer shows COMMAND as the #1 ranked element: "COMMAND was active at tick 38 — the pivot tick. COMMAND issued a reroute signal at tick 38 that reached STRIKER-A at tick 41 (latency: 3 ticks). STRIKER-A committed at tick 39." He reads the latency figure and immediately understands the problem: the reroute was two ticks too late. But he clicks "active at tick 38" anyway, curious about the signal path.

**Minute 0:08 — Immediate Recognition**
The genealogy neighborhood appears. Three nodes: RELAY-C on the left (the relay that forwarded the command signal), COMMAND in the center (amber pulse), STRIKER-A on the right. A solid arrow from COMMAND to RELAY-C with a "tick 38" annotation. A solid arrow from RELAY-C to STRIKER-A with a "tick 41" annotation and a latency color gradient — the line shifts from cool blue at the RELAY-C end to warm amber at the STRIKER-A end, visualizing the three-tick delay.

Kai's reaction is not confusion but *recognition*. "This is a message propagation diagram. I see these in Jaeger traces every day." He immediately looks at the latency annotations and calculates: one tick from COMMAND to RELAY-C, three ticks from RELAY-C to STRIKER-A. The relay is adding two ticks of latency. He thinks: "The relay is the bottleneck. Either I bypass the relay with a direct hook from COMMAND to STRIKER-A, or I need to figure out why the relay is slow."

**Minute 0:22 — Skipping the Scaffold**
He clicks "Expand to full genealogy" almost immediately. He wants to see the full network. The expansion animation plays. He barely notices it — his eyes are already scanning for SCOUT-B's edges, wondering whether the scout was adding to the relay's processing load. The full graph confirms his suspicion: SCOUT-B was sending high-frequency detection signals through RELAY-C at the same time COMMAND was sending the reroute. The relay was multiplexing and it added latency.

**Minute 0:40 — The Expert Realization**
Kai now understands something the drawer could not have told him: the problem is not COMMAND's timing (the reroute was issued at tick 38, which was correct) but the relay's throughput under concurrent load. He opens the config editor and begins designing a dedicated signal channel for command-priority reroutes that bypasses the relay entirely. The genealogy gave him the architectural insight. The neighborhood got him oriented without wasting his time.

**UI Annotations:**
- **Latency gradient on edge:** CSS linear gradient on SVG stroke, interpolating from #4A9EBF (cool blue, low latency) to #D4944A (warm amber, high latency), gradient position proportional to latency ticks relative to max observed latency in match
- **Tick annotations:** 10px monospace numerals in medium grey (#8A8A8A), positioned 6px above the edge midpoint, right-aligned
- **Expand button:** Kai clicks within 15 seconds of arrival; the button's hit target extends 8px beyond its visible border to accommodate fast, imprecise clicks

---

#### Journey: Tala, 17, high school student, first strategy game
**Context:** Mission 3 (Blind Spots), learning hooks for the first time, config v0.4. Tala has struggled with every mission so far. She does not yet have a mental model for signal propagation. The pre-ranking drawer is still novel to her — she discovered it last mission.

**Minute 0:00 — Accidental Discovery**
Tala is reading the pre-ranking drawer slowly, trying to understand what it means. She reads: "SCOUT-A was active at tick 15." She does not understand "active" in this context. She sees the teal underline and thinks it might be an explanation link — like a "learn more" on a website. She clicks it, hoping for a definition.

**Minute 0:06 — The Smallest Possible Graph**
The genealogy panel slides in. Tala sees two nodes and one edge. SCOUT-A on the left (amber pulse), STRIKER-B on the right. A solid arrow between them with "tick 15" written above it. That is all. Mission 3 has only three agents (SCOUT-A, SCOUT-B, STRIKER-B), but the neighborhood shows only the two agents connected to SCOUT-A's tick-15 activity. SCOUT-B is not visible because it had no signal interaction with SCOUT-A at tick 15.

Tala stares at the diagram. Two circles with an arrow between them. She thinks: "The scout sent something to the striker." She hovers over the arrow. The tooltip says: "Detection signal: enemy position at grid F-7, fidelity 0.83." She does not fully understand "fidelity" but she understands "enemy position at grid F-7." The scout saw something and told the striker where it was.

**Minute 0:30 — The Conceptual Leap**
For the first time, Tala understands signal propagation not as an abstract system concept but as *one agent telling another agent where to go*. The genealogy's visual — two nodes, one arrow, one message — is simple enough to grasp as a concrete event rather than a systemic property. She could not have reached this understanding from the full five-node graph. She needed the two-node spotlight.

**Minute 0:50 — Choosing Not to Expand**
She sees the "Expand to full genealogy" button. She does not click it. She does not feel she needs to. The two-node view answered her question. She returns to the drawer and continues reading. The button will be there next time.

**Minute 2:30 — The Second Visit (Next Mission)**
In Mission 4's debrief, Tala clicks another drawer link. This time, the genealogy opens with the full three-node neighborhood (because Mission 4 has more agents and the drawer's anchor has upstream and downstream connections). She sees the same visual grammar — nodes, arrows, labels — but with one more node than before. The complexity increased by one, not by five. She is learning the tool incrementally, scaffolded by the neighborhood restriction.

**UI Annotations:**
- **Two-node neighborhood:** When only one upstream or downstream connection exists, the graph renders with a single edge, centered vertically in the panel. The visual is deliberately minimal — generous whitespace surrounds the two nodes, preventing the panel from feeling empty (the nodes are sized at 56px rather than the standard 48px when the neighborhood has fewer than 3 nodes, filling the space gracefully)
- **Tooltip on edge:** Positioned above the edge, left-aligned with the arrow's midpoint, 280px max width, wraps to two lines if the signal description is long. Font: 11px, same monospace as agent labels
- **"Expand to full genealogy" button:** Remains at bottom-center, does not grow or animate to attract attention. It is present but passive. If Tala never clicks it, her next drawer-link visit will still use the neighborhood view

---

#### Journey: Diego, 28, data scientist, replaying Mission 7 for optimization
**Context:** Mission 7 (Pressure Test), config v6.2, 40+ hours played. Diego has used the full genealogy extensively. He is replaying Mission 7 with a new config and opens the pre-ranking drawer. He clicks "RELAY-C active at tick 88."

**Minute 0:00 — The Expert Experience**
The genealogy panel opens showing the full graph immediately. No neighborhood restriction, no expansion button. Diego's first visit was 30 hours ago; the scaffold has been retired. The anchor node (RELAY-C) pulses amber, the tick range is pre-focused to ticks 86-90, and Diego is already reading edge latencies before the panel's slide-in animation completes.

He does not notice the absence of the neighborhood scaffold. He does not remember it. It served its purpose and vanished. This is the design goal: the Spotlight Reveal is invisible to experts. It existed for the moment when the player needed it and does not persist as friction for the player who has outgrown it.

**UI Annotations:**
- **Full graph, expert mode:** All nodes visible, all edges drawn, latency color-coding active, tick annotations visible. The anchor node's amber pulse is the only concession to the drawer-link pathway — it highlights which node the player clicked through from, providing orientation even when the scaffold is gone
- **No expansion button:** The button's absence is itself a signal. The panel's bottom-center area shows the timeline-sync indicator instead, which the expert uses to correlate genealogy ticks with the main replay scrubber

---

## Strengths

1. **Solves the cold-start problem for the most complex tool.** The genealogy is the densest visualization in the game. Without the Spotlight Reveal, first-time users face a wiring diagram with no orientation. With it, they face a three-node story with a clear narrative.

2. **Respects the drawer link's context.** The player clicked because of a specific claim about a specific agent at a specific tick. The neighborhood answers *that* question, not a broader question the player did not ask. The view matches the intent.

3. **Automatically retires.** The scaffold is not a permanent simplification mode that experts must toggle off. It disappears after first use, never adding friction to experienced players.

4. **Teaches graph literacy incrementally.** First encounter: 2-3 nodes. After expansion: 5 nodes. Subsequent encounters: full graph from the start. The complexity ramp mirrors the campaign's broader progressive disclosure philosophy (5.04).

5. **The expansion animation itself teaches.** The moment the three-node neighborhood unfolds into the full graph, the player sees where their familiar nodes fit in the larger structure. The transition is a spatial lesson: "The thing you understood is *part of* this bigger thing."

6. **Preserves the diagnostic dissonance moment (4.66).** The broken edge in the neighborhood view — RELAY-C to STRIKER-A, signal dropped — is *more* visible in the three-node view than in the full graph, because nothing else competes for attention. The teaching moment (the player connecting "pre-ranking says RELAY-C, genealogy shows break at STRIKER-A") is sharper in the spotlight.

---

## Weaknesses

1. **The "first visit" heuristic is fragile.** What counts as the first visit? If the player clicks a drawer link, sees the neighborhood, closes the panel without expanding, and never returns — are they stuck in neighborhood mode forever? The current design says yes, which might confuse a player who comes back ten hours later wondering why they see a partial graph. A timeout (e.g., reset "first visit" status after 5 missions with no genealogy use) would add complexity but prevent permanent scaffolding for abandoned players.

2. **Neighborhood selection can be misleading.** The one-hop rule excludes agents that may be causally relevant but are two hops away. If COMMAND issued a reroute that caused RELAY-C to change behavior at tick 52, but COMMAND's signal went through SPECIALIST first, the neighborhood shows SPECIALIST-to-RELAY-C but not COMMAND-to-SPECIALIST. The player might blame SPECIALIST for the signal when COMMAND was the originator. The one-hop boundary is a simplification that can create incorrect mental models.

3. **"Expand to full genealogy" is a one-way door.** Once expanded, the player cannot return to the neighborhood view. If the full graph overwhelms them and they want the simpler view back, they must close the entire genealogy panel and re-navigate via a drawer link — which will show the full graph because the "first visit" has been consumed. There is no graceful fallback.

4. **Inconsistency with Act 2 toggle button.** Opening the genealogy from the Act 2 toggle always shows the full graph; opening from the drawer link shows the neighborhood on first visit. Two entry points, two different initial states. A player who opens the genealogy from the toggle first (seeing the full graph) and later clicks a drawer link (seeing the neighborhood) will experience the *simpler* view *after* the *complex* view, which is pedagogically backwards.

5. **Animation duration (1.2s) may feel slow for impatient players.** The expansion choreography is beautiful but unskippable. A player who immediately wants the full graph has to wait 1.2 seconds for the animation to complete. There is no "skip" or fast-path. Over many hours of play, this could grate — but since the animation only plays once per player lifetime, the risk is minimal.

---

## Interaction Effects

**With 4.22 (Act 2 tool introduction sequence):**
The Spotlight Reveal redefines the genealogy's position in the Act 2 materialization. In the current 4.22 design, the signal genealogy toggle materializes last in the sequence, carrying the implicit message "expert tool — you will need this eventually." With the Spotlight Reveal, this message is reinforced and refined: the toggle appears last *and* the first actual encounter with the genealogy (via drawer link) is scaffolded. The two mechanisms are complementary: 4.22 controls *when* the player sees the genealogy's existence; 4.102 controls *what* the player sees the first time they actually open it. Together, they form a two-stage progressive disclosure: (1) the tool is available, (2) the tool shows you only what you need.

If the player opens the genealogy via the Act 2 toggle before ever clicking a drawer link, the Spotlight Reveal does not apply — the toggle represents a deliberate choice to explore an expert tool, and the full graph is the appropriate response. The Spotlight Reveal is specifically for the drawer-link pathway, where the player may be arriving unintentionally.

**With 4.66 (Signal genealogy as pre-ranking source):**
4.66 defines the cross-tool link that brings the player to the genealogy. 4.102 defines what the genealogy shows when they arrive. The two aspects are tightly coupled: 4.66 provides the *context* (which agent, which tick, which claim) and 4.102 uses that context to compute the *neighborhood*. If 4.66's link were ever removed or changed to open the genealogy without context (e.g., "view signal genealogy" as a generic button), the neighborhood computation would have no anchor and the Spotlight Reveal would degrade to an arbitrary subgraph.

**With 4.16 (Signal genealogy visualization):**
The full genealogy (4.16) is the "destination" that the Spotlight Reveal gradually reveals. All visual treatments — node hexagons, edge styles, latency color-coding, broken-edge markers — are drawn from 4.16's design vocabulary. The Spotlight Reveal is not an alternative visualization; it is 4.16's graph with a visibility mask applied. The expansion animation is the mask being removed.

**With 8.09 (Diagnostic layer as teaching arc):**
The Spotlight Reveal inserts a half-step in the teaching arc. The arc as described in 4.66: (1) passive replay, (2) EDT annotation, (3) Fix Explorer, (4) pre-ranking drawer, (4.5) signal genealogy via drawer link. With 4.102, step 4.5 splits into (4.5a) neighborhood view of genealogy and (4.5b) full genealogy after expansion. This micro-pacing prevents the step from 4 to 4.5 from being a cliff — the player lands on a ledge (the neighborhood) before ascending to the full graph.

**With 4.105 ("Why was this signal dropped?" sub-panel):**
The broken-edge tooltip and sub-panel (4.105) are *more discoverable* in the neighborhood view than in the full graph. In a three-node diagram, the dashed line is the most visually prominent element. The player almost certainly hovers over it. In the full graph, the same dashed line competes with a dozen other edges for attention. The Spotlight Reveal creates ideal conditions for 4.105's discovery.

**With 5.04 (Complexity ramp):**
The neighborhood expansion mirrors the campaign's broader progressive disclosure philosophy. Mission 1 teaches one concept. Mission 2 teaches one more. The genealogy's first view shows 3 nodes. The expansion shows 5. The subsequent visit shows all. The pacing principle is identical: never show the full system before the player has a framework for understanding it.

---

## Comparable Games and Media

**Google Maps "search result" view:** When you search for a restaurant on Google Maps, the map zooms to the restaurant's location and shows the immediate neighborhood — the street, adjacent buildings, transit stops nearby. It does not show the entire city. You can zoom out to see the city, but the initial view answers your question: "Where is this place, and what is around it?" The Spotlight Reveal is this pattern for a signal graph instead of a geographic map.

**Figma's "zoom to selection":** When you select a component in Figma and press Shift+1, the canvas zooms to frame that component with comfortable padding. You see the component and its immediate surroundings. You can zoom out to see the full canvas. The Spotlight Reveal is "zoom to selection" for the genealogy graph, where the "selection" is the drawer link's anchor agent.

**IDE "go to definition" with collapsed context:** In VS Code, clicking "Go to Definition" opens the target file and scrolls to the specific function. The rest of the file is visible but the viewport is centered on the relevant code. You can scroll to see more. The Spotlight Reveal is more aggressive — it hides the rest of the "file" entirely on first view — but the principle is the same: navigate to exactly what you asked about, then let the user expand outward.

**Civilization VI tech tree fog:** The Civ VI tech tree initially shows only technologies you can currently research, with future techs hidden behind fog. As you advance, the fog recedes and more of the tree becomes visible. The Spotlight Reveal is a compressed version: the "fog" covers all agents outside the one-hop neighborhood, and the "Expand" button is the equivalent of advancing — it reveals the full tree in one action rather than incrementally.

**Film cinematography: the establishing close-up.** A common technique in film: the opening shot of a scene is a tight close-up on a character's face or hands, then the camera pulls back to reveal the room, the other people, the setting. Hitchcock used this constantly. The close-up gives the audience an emotional anchor before the wide shot provides spatial context. The Spotlight Reveal is exactly this technique applied to a data visualization: tight shot on the relevant signal path, then pull back to reveal the full network.

**Obsidian local graph view:** Obsidian's graph view can be filtered to show only the current note and its direct connections (depth 1). The full vault graph is available but the local view answers "what is this note connected to?" without rendering thousands of nodes. The Spotlight Reveal uses the same depth-1 neighborhood concept applied to a directed signal graph rather than a bidirectional note graph.

---

## Sensory Description

### The Neighborhood on First Arrival

The genealogy panel slides in from the right edge. Cool grey background (#1E2428), 2 degrees cooler than the debrief's warm off-white. The panel is 420px wide. Inside, three hexagonal nodes float in generous whitespace.

The center node is RELAY-C. Its hexagon is 48px corner-to-corner, filled with a muted steel blue (#3A5068). Below the hexagon, the label "RELAY-C" in 11px monospace, letter-spacing 1.5px, color #B0B8C0. Around the hexagon, an amber ring pulses — not a solid ring but a soft radiance, like a candle's glow rendered as a 6px gradient from amber (#D4944A at 60% opacity) to transparent. The pulse cycle is 1.8 seconds: 0.6s ease-in to full brightness, 0.4s hold, 0.8s ease-out to 40% brightness, repeat. The pulse is organic, not mechanical — it breathes.

To the left, 140px away, SCOUT-B. Same hexagonal shape, 40px (slightly smaller than the anchor). Steel blue fill, grey label. No pulse. Between SCOUT-B and RELAY-C, a solid arrow: a 2px line in muted teal (#5A8A8A), with a small triangular arrowhead at the RELAY-C end. Above the arrow's midpoint, "t51" in 9px grey monospace — the tick annotation. The arrow is slightly curved, a 15px arc, giving it the feel of a signal traveling through space rather than a rigid connection.

To the right, 140px away, STRIKER-A. Same hexagonal shape, 40px. Between RELAY-C and STRIKER-A, a dashed line: alternating 8px solid and 4px gap segments, same 2px width, but in a warmer grey (#7A6A5A) rather than teal. The dashes give the impression of a signal dissolving mid-flight. At the STRIKER-A end, instead of a clean arrowhead, a small red circle (12px diameter) with a thin white "x" inscribed — the dropped-signal marker. Above this edge, "t52" in the same grey monospace, and a small label in 9px italic: "dropped." The red circle has a faint radiance of its own — a 4px halo of red at 20% opacity, static, not pulsing. It is a quiet warning, not an alarm.

The whitespace around these three nodes is vast relative to the panel size. The top third and bottom third of the panel are empty except for the "Expand to full genealogy" button anchored 24px from the bottom edge, centered. The button has a dark background (#2A3238), 1px border in muted teal (#5A8A8A at 40% opacity), rounded corners (6px). The text reads "Expand to full genealogy" in 12px, weight 400, color #C0C8D0. To the left of the text, a small icon: three dots arranged in a triangle with thin connecting lines — a miniature graph icon, 14px, in the same muted teal. On hover, the border brightens to 80% opacity and the text shifts to white. The cursor becomes a pointer.

The overall visual impression is of a single, clear diagram floating in quiet space. It does not feel like a "partial" view. It feels like a *focused* view — a spotlight illuminating exactly the signal path that matters, with darkness (empty panel space) around it.

### The Expansion

When the player clicks the button, the quiet breaks.

The three nodes begin to move. Not quickly — a smooth, deliberate drift, as if they are floating on a surface and the surface is reshaping beneath them. RELAY-C glides upward and to the right. SCOUT-B drops lower and leftward. STRIKER-A moves further right and slightly up. The edges between them stretch like elastic threads, the curves deepening momentarily before settling into new arcs. The tick annotations travel with their edges, maintaining position above the midpoints.

Then the new nodes appear. COMMAND materializes above and to the left of center — a hexagon fading in from nothing, accompanied by a burst of four tiny hexagonal motes that scatter outward like sparks from a weld, fading as they travel. The motes are amber, not the steel blue of the node itself — a chromatic echo of the anchor's pulse, as if the anchor's energy is what brought the new node into existence. Two hundred milliseconds later, SPECIALIST fades in below and to the right, with its own mote burst.

Edges begin drawing. From COMMAND, a line extends toward RELAY-C — the source of the reroute signal, drawing itself like a pen stroke moving across the panel. Then an edge from COMMAND toward SCOUT-B. Then edges from SPECIALIST. Each line takes 200ms to draw, and they are staggered so the effect is of the network *growing* — not appearing but assembling, connection by connection, like watching a spider build a web in time-lapse.

The latency color-coding activates last. All edges simultaneously shift from their monochrome teal or grey to their latency-gradient colors. Cool blue for fast, warm amber for slow. The color shift takes 300ms, a gentle crossfade. The effect is like the lights coming on in a room — the topology was visible in the dark, and now the *characteristics* of each connection are illuminated.

The anchor node's amber pulse continues through the entire animation, uninterrupted. RELAY-C remains the brightest element at every phase. Even in the full graph, surrounded by four other agents and a dozen edges, the anchor is visually dominant. The player's eye returns to it naturally. The spotlight may have widened, but it never fully turns off.

---

## Discovered New Aspects

1. **4.107 — Neighborhood depth control for expert users**: A slider or stepper (depth: 1, 2, 3, all) that lets experienced players manually control the neighborhood radius around any selected node in the full genealogy, turning the "spotlight" from a one-time pedagogical tool into a permanent analytical lens; interaction with 4.16 signal genealogy visualization.

2. **4.108 — Animated signal trace in neighborhood view**: Instead of showing the neighborhood as a static three-node diagram, animate a single signal pulse traveling from SCOUT-B through RELAY-C toward STRIKER-A, stopping and flashing red at the broken edge; the animation plays once on first render and teaches the directionality of the signal path through motion; interaction with 4.22 Act 2 tool introduction choreography.

3. **4.109 — Neighborhood view as shareable diagnostic snapshot**: The three-node spotlight view is visually clean enough to be a standalone artifact — export it as an image or GIF (with the signal pulse animation from 4.108) for sharing in the config necropsy community; interaction with 7.10 config necropsy culture and 9.04 GIF/clip export.
