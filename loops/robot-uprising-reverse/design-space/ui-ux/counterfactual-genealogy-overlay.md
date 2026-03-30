# 4.103 — Counterfactual Genealogy Overlay: "The Phantom Circuit"

**Aspect:** 4.103 — Applying the pre-ranking fix as a counterfactual overlay on the signal genealogy — proposed-fix graph shown in a different color alongside the actual graph; if the fix changes signal routing, differences are highlighted; if the fix doesn't change the broken edge (STRIKER-A's buffer still fills up), the genealogy makes this visible immediately; interaction with 4.39 adversarial counterfactual mode and 4.20 counterfactual simulation.

**Parent:** 4.66 — Signal genealogy as pre-ranking source (cross-tool linking); 4.20 — Counterfactual simulation
**Siblings:** 4.39 — Adversarial counterfactual mode; 4.37 — Fork-and-deploy shortcut; 4.36 — Multi-scenario minimum fix explorer
**Related:** 4.16 — Signal genealogy visualization ("The Signal River"); 4.58 — Pre-ranking transparency panel; 4.40 — First-viable-fix vs. minimum-fix toggle; 4.38 — Counterfactual history as config evolution record; 8.09 — Diagnostic layer as teaching arc; 2.00a — Fully deterministic execution

---

## The Core Concept

The pre-ranking system (4.58) proposes fixes. The signal genealogy (4.16) shows signal flow. The counterfactual simulation (4.20) answers "would this change have mattered?" These three systems speak to each other through cross-tool links (4.66), but at the moment the player receives a proposed fix, they face a gap: **they cannot see what the fix would do to the signal network without running the full simulation first.**

The Phantom Circuit closes this gap. When the pre-ranking drawer proposes a fix — "increase RELAY-C's buffer from 4 to 5" — and the player hovers or clicks that fix, a second graph appears directly on the signal genealogy: the **phantom circuit**, rendered in a distinct color, showing the counterfactual signal flow that would have existed if the fix had been applied. The phantom circuit runs alongside the actual circuit. Where the two graphs agree, only the actual graph is visible. Where they diverge — a signal that would have survived instead of being dropped, a routing path that would have shifted, a buffer that would have held — the phantom circuit blooms into visibility, and the difference is highlighted.

This is the diagnostic equivalent of holding up tracing paper over a schematic. The original schematic is the match as it happened. The tracing paper is the match as it would have happened. Where the tracing paper shows the same lines, you see through it. Where the lines differ, the ghost drawing appears in a different color, and the architect immediately sees what the proposed change actually affects.

**The critical insight this feature delivers:** Not all fixes fix the thing the player thinks they fix. A pre-ranking suggestion that says "increase RELAY-C's buffer" might solve the buffer overflow at tick 52 but introduce a new bottleneck at tick 67 because the extra signal creates a downstream cascade. The Phantom Circuit makes this visible *before* the player commits to the fix, *before* they deploy, and *before* they lose another Gauntlet match on a "fix" that moved the failure rather than removing it.

Conversely, and more subtly: some fixes do nothing at the broken edge. The pre-ranking might rank RELAY-C highly because it was active at the pivot tick and recently modified. But the real failure was downstream — STRIKER-A's buffer was full regardless of what RELAY-C did. If the player overlays the fix on the genealogy and sees that the phantom circuit still shows a red X at STRIKER-A's buffer at tick 53, the genealogy is screaming: **wrong fix, wrong element, the break is downstream.** The player saves a deployment cycle and learns to read causal chains more carefully.

---

## The Dual-Graph Overlay: Mechanical Design

### Color Language

The actual signal graph uses the established channel color palette from 4.16: teal, coral, gold, lavender, lime, pink. Each channel has a consistent hue. Dropped signals are rendered at 20% opacity with a red X at the termination point. Delivered signals are at 80% opacity with a solid circle.

The phantom circuit uses a **luminous cyan** — a color not present in the standard channel palette, deliberately chosen to avoid collision with any existing signal color. The cyan is rendered at 60% opacity by default, rising to 90% at points of divergence. Phantom signals that match the actual graph are rendered at 0% opacity — completely invisible. Only differences are visible in the phantom layer.

The result: the standard genealogy looks exactly as it always does, with cyan apparitions appearing only where the fix would have changed something. If the fix changes nothing in the signal flow, no cyan appears. The absence of cyan is itself the diagnostic signal.

**Divergence highlighting:** At every point where the phantom circuit differs from the actual circuit, a subtle **divergence halo** appears — a soft glow (8px radius, cyan at 15% opacity) around the affected edge or node. The halo draws the eye without obscuring the underlying graph. Multiple divergences create a constellation of cyan glows across the genealogy, and the player can see at a glance how much of the network the fix affects.

**The break-point annotation:** If the fix resolves a dropped signal (the red X becomes a solid delivery circle in the phantom circuit), the transformation is animated: the red X fades to 50% and a cyan solid circle appears beside it, connected by a thin horizontal arrow labeled "fix resolves." If the fix does *not* resolve the break — the red X persists in both actual and phantom circuits — the annotation reads "fix does not resolve" in muted amber, and no cyan glow appears at that edge. This is the most important single annotation in the entire overlay: it tells the player whether the proposed fix actually addresses the broken path.

### Animation Sequence

When the player activates the phantom circuit (by hovering or clicking a proposed fix in the pre-ranking drawer), the overlay does not appear instantaneously. It materializes over 400ms in a sequence designed to guide the eye:

1. **0–100ms:** The fix origin node pulses once in cyan. If the fix is "increase RELAY-C's buffer from 4 to 5," RELAY-C's node in the genealogy pulses. This anchors the player's attention on where the change is being applied.

2. **100–250ms:** Cyan signal arcs propagate outward from the fix origin, following the counterfactual signal paths. The arcs animate as if the signals are flowing — small luminous particles travel along the phantom edges, echoing the particle animation from the standard genealogy but in cyan instead of channel colors. The propagation starts at the tick where the fix first affects the signal flow and extends forward in time.

3. **250–400ms:** Divergence halos bloom at each point where the phantom circuit differs from the actual circuit. The halos appear in order of temporal occurrence — earliest divergence first, latest last — so the player sees the cascade of consequences unfold in causal sequence.

4. **400ms+:** The overlay settles into its static state. Phantom edges remain visible at points of divergence. The player can scrub the timeline, and the phantom circuit updates in real time — at each tick, the overlay shows whether the fix has changed anything at that moment.

### Interaction with the Timeline Scrubber

The phantom circuit is fully synchronized with the board's tick scrubber (same sync mechanism as the standard genealogy's playhead). As the player scrubs through ticks:

- **Before the fix's first effect:** No cyan visible. The fix hasn't changed anything yet.
- **At the first divergence tick:** Cyan blooms. The player sees exactly when the fix first makes a difference.
- **Through the divergence cascade:** Cyan edges propagate, multiply, or collapse depending on how the fix's effects ripple through the network. Some fixes create a single divergence that persists. Others create a cascade that affects multiple agents over many ticks.
- **At the original break point:** The break-point annotation appears. Does the fix resolve it? The answer is visible.
- **After the break point:** If the fix resolved the break, the phantom circuit continues forward showing the counterfactual signal flow in cyan — signals that would have been delivered, decisions that would have been made. If the fix did not resolve the break, the phantom circuit shows the same dead-end as the actual graph, with no cyan beyond the break.

### River View vs. Topology View

In **River View** (the default horizontal swim-lane layout), phantom arcs appear as dashed cyan curves paralleling the actual signal arcs. Where they diverge, the dashed cyan arc separates from the solid actual arc — the visual metaphor is a river fork, two channels splitting from one.

In **Topology View** (the force-directed graph), phantom edges appear as cyan lines alongside actual edges. Where the fix introduces a new connection (a signal that would have been routed to a different agent), the phantom edge appears as a new line between nodes that have no actual-graph edge. This is visually striking — a line that exists only in the phantom layer, connecting two nodes that never communicated in the real match.

---

## The Three Diagnostic Outcomes

Every phantom circuit activation produces one of three diagnostic outcomes. The player learns to recognize them by visual pattern before they read any text:

### Outcome 1: "Fix Resolves" — Cyan at the Break

The phantom circuit shows cyan at the break point. The red X fades. A cyan delivery circle appears. The pre-ranking's proposed fix would have resolved the specific signal drop that caused the failure. This is the best case: the fix is correct, the diagnosis was accurate, the player can deploy with confidence.

**Visual signature:** Cyan glow concentrated at the break point, minimal divergence elsewhere. The fix is surgical — it changes one thing and that one thing was the problem.

### Outcome 2: "Fix Cascades" — Cyan Everywhere

The phantom circuit shows divergences across many nodes and edges. The fix resolved the original break, but it also changed signal routing downstream, introduced new signal paths, altered buffer fill patterns on other agents. The fix works, but it has side effects.

**Visual signature:** Cyan halos scattered across the genealogy. The player sees not just the fix but its blast radius. This is the "be careful" outcome — the fix is correct but may introduce new failure modes in future matches with different opponents.

### Outcome 3: "Fix Misses" — No Cyan at the Break

The phantom circuit shows some divergence near the fix origin (RELAY-C's buffer is bigger, so it processes one more signal) but the red X at STRIKER-A's buffer at tick 53 persists. The downstream break is not resolved. The pre-ranking identified the wrong element — or the right element at the wrong level of the causal chain.

**Visual signature:** Cyan glow near the top of the chain, but the break-point annotation reads "fix does not resolve" in amber. The genealogy is telling the player: **look further downstream.** The pre-ranking was wrong about what needed to change, or right about where the activity was but wrong about where the failure was.

This third outcome is the feature's most important contribution. Without the Phantom Circuit, the player would deploy the pre-ranking's suggested fix, lose the next match for the same reason, and blame the pre-ranking system. With the Phantom Circuit, they see the miss immediately and redirect their diagnostic attention downstream. The feature converts a wasted deployment cycle into a 3-second visual verification.

---

## Player Journeys

#### Journey: Tala, 24, UX Designer from Cebu

**Context:** Tala has 60 hours in the game. She's in mid-campaign, just unlocked the pre-ranking transparency panel two missions ago. She lost a factory defense mission where her STRIKER-A kept firing at the wrong targets. The pre-ranking drawer shows RELAY-C as the top-ranked suspect: "RELAY-C was active at tick 52, recently modified, volatility 0.71." The drawer proposes: "Increase RELAY-C buffer from 4 to 5 slots." Tala is about to accept and deploy.

**Minute 0:00 — The Drawer's Suggestion**
Tala reads the pre-ranking explanation. It makes sense — RELAY-C was busy at the pivot tick, she changed it two sessions ago, it was volatile. She's about to click "Apply fix" when she notices a new affordance she hasn't seen before: beneath the fix suggestion, a small button reads **"Preview on genealogy"** with a cyan circuit-board icon.

She hovers. Tooltip: "Show how this fix would change signal flow in the genealogy graph." She clicks.

**Minute 0:15 — The Phantom Materializes**
The signal genealogy panel is already open on the right (she's been using it since 4.66 linked the drawer to the genealogy). RELAY-C's node pulses once in luminous cyan — a color she hasn't seen in the genealogy before, distinct from the teal and coral of her signal channels. Cyan arcs propagate outward from RELAY-C, tracing the counterfactual signal paths.

She watches the propagation. At tick 52, a cyan arc extends from RELAY-C toward STRIKER-A — the signal that was dropped in the actual match. The arc reaches STRIKER-A's lane in the river view. And then: the red X remains. No cyan delivery circle. The annotation reads, in muted amber text: **"fix does not resolve — STRIKER-A buffer full at tick 53."**

Tala pauses. The fix gives RELAY-C more buffer. RELAY-C processes the signal. RELAY-C forwards the signal. But STRIKER-A's buffer was already full — the signal arrives and is dropped anyway, one tick later.

**Minute 0:40 — The Redirect**
She looks at STRIKER-A's node in the genealogy. She can see the buffer fill indicator — four slots, all occupied at tick 52. RELAY-C's fix gives RELAY-C more capacity, but STRIKER-A is the bottleneck. She hovers over STRIKER-A's buffer indicator and reads: "Buffer: 4/4 at tick 52. Oldest entry: terrain scan from tick 38 (stale, 14 ticks old)."

Fourteen ticks old. That terrain scan has been sitting in STRIKER-A's buffer since tick 38, occupying a slot, doing nothing. If the eviction policy had cleared it, there would have been room for RELAY-C's signal.

She goes back to the pre-ranking drawer. RELAY-C is ranked first. STRIKER-A is ranked fourth. The pre-ranking was measuring activity and recency at the pivot tick — RELAY-C was more active. But the actual break was at STRIKER-A, caused by a stale entry that should have been evicted.

She closes the phantom circuit, ignores the suggested RELAY-C fix, opens STRIKER-A's config, and changes the eviction policy: entries older than 8 ticks are evicted automatically. She runs a manual fork (4.20) from tick 50 with this change. Win at tick 64. The actual fix was downstream, and the Phantom Circuit showed her where.

**Minute 2:30 — The Learning Moment**
Tala writes in her session note: "Pre-ranking said RELAY-C. Phantom circuit said STRIKER-A. The pre-ranking finds who was busy. The genealogy finds where the signal died. They're not the same thing."

She's learned to distrust the pre-ranking's first suggestion — not because it's wrong, but because activity-at-pivot-tick is not the same as cause-of-failure. The Phantom Circuit taught this in 40 seconds without a tutorial screen.

**UI Annotations:**
- **"Preview on genealogy" button:** Below the fix suggestion in the pre-ranking drawer. Cyan circuit-board icon, 12px. Appears only when the signal genealogy panel is accessible (open or openable). Disabled with tooltip "Open signal genealogy first" if the genealogy is not available.
- **Break-point annotation:** "fix does not resolve" in muted amber (#d4a054), 10px font, positioned directly below the red X on the affected edge. Does not obscure the red X — sits 4px below it.
- **Buffer fill indicator on STRIKER-A:** Appears as a small stacked-bar micro-chart inside the node (4 segments, all filled = all cyan at 80%). Oldest entry is highlighted with a thin amber border when hovered, showing its age.

---

#### Journey: Jun-ho, 31, Systems Engineer from Seoul

**Context:** Jun-ho is a Commander-tier player with 200+ hours. He's doing a necropsy session on a narrow Gauntlet loss. EDT tick 38 of 90. The Minimum Fix Explorer (4.20) returned three solutions. He's already loaded the ghost overlay for solution 2 — a hook reroute that flips the outcome. Now he wants to understand *why* the hook reroute works by seeing its effect on the signal network. He knows about the Phantom Circuit from a patch note and has been waiting for an excuse to use it.

**Minute 0:00 — Loading the Phantom from MFE**
Jun-ho has solution 2 selected in the MFE results panel: "COMMAND hook 'alert-striker': reroute from STRIKER-B to STRIKER-A." The ghost overlay is running — original match in grey, fork in color. He sees STRIKER-A performing better in the fork. But the ghost overlay shows the battlefield view. He wants the signal view.

He clicks the genealogy tab. The river view loads, showing the actual match's signal arcs. In the MFE results panel, next to solution 2's entry, a small cyan icon reads **"Show on genealogy."** He clicks it.

**Minute 0:20 — The Dual Phantom**
The phantom circuit materializes. COMMAND's node pulses cyan. But this time, instead of a simple buffer change, the fix is a routing change — the hook's target shifts from STRIKER-B to STRIKER-A. The visualization shows this as a dramatic divergence:

In the actual graph, a coral arc flows from COMMAND to STRIKER-B at tick 36. In the phantom circuit, this arc does not exist. Instead, a cyan arc flows from COMMAND to STRIKER-A at the same tick. The actual and phantom arcs form a visible fork — one coral line going right to STRIKER-B, one cyan line going left to STRIKER-A. The divergence halo blooms on both the STRIKER-B lane (signal removed) and the STRIKER-A lane (signal added).

Jun-ho watches the cascade. After tick 36:
- **STRIKER-B (actual):** Receives the alert at tick 36, activates burst rule at tick 38, attacks the wrong cluster (the opponent's decoy formation).
- **STRIKER-A (phantom, cyan):** Receives the alert at tick 36, activates burst rule at tick 38, attacks the correct cluster (the opponent's real formation). Cyan arcs propagate from STRIKER-A's subsequent actions — threat tags dispatched to the relay chain, new routing signals back to COMMAND.

The cascade is extensive. Cyan halos appear on six of his eight agents' lanes by tick 45. This is Outcome 2: "Fix Cascades." The reroute works, but it changes the entire signal network's downstream behavior.

**Minute 1:00 — Comparing Two Phantoms**
Jun-ho wants to compare. He goes back to the MFE results and clicks solution 1: "SCOUT-B fidelity threshold 55% to 60%." A new phantom circuit materializes, replacing the previous one. This time: the fix origin is SCOUT-B. The phantom shows a subtle change at tick 34 — one signal that was previously forwarded (barely above the 55% threshold) is now filtered. The cascade from this is minimal — one fewer signal in RELAY-C's buffer, which gives RELAY-C room at tick 37, which means RELAY-C forwards a different signal to STRIKER-A at tick 38.

Two cyan halos. Three affected edges. This is Outcome 1, almost: the fix resolves the specific break, but through an indirect mechanism — not by fixing the break itself but by reducing upstream noise that freed a buffer slot downstream.

Jun-ho toggles between the two phantoms. Solution 2 (hook reroute): massive cascade, six agents affected, correct but invasive. Solution 1 (fidelity threshold): minimal cascade, three edges affected, correct and surgical.

He chooses solution 1. Smaller blast radius. Less risk of introducing new failure modes.

**Minute 2:00 — The Adversarial Check**
Before deploying, Jun-ho runs adversarial mode (4.39) on the match. He wants to know: does solution 1's minimal change leave him vulnerable to the improved-opponent attack vectors? He activates the adversarial MFE. Results: two attack vectors. He loads the first adversarial phantom.

The adversarial phantom uses a different color — **deep amber-red** instead of cyan, matching the adversarial mode's established color language (4.39). Now the genealogy shows three layers: the actual graph in channel colors, the fix phantom in cyan, and the adversarial phantom in amber-red. The three layers are visually distinct. Where only the fix and actual differ, cyan appears. Where only the adversarial and actual differ, amber-red appears. Where all three differ, both cyan and amber-red are visible — the fix changed one thing, the attack changed another, and the player can see whether the fix's change defends against the attack.

Jun-ho sees that the adversarial attack vector targets RELAY-C's compression timing — unrelated to the fidelity threshold fix. His fix doesn't defend against it, but it also doesn't make it worse. He makes a note: "v4.3 task: address RELAY-C compression timing vulnerability."

**UI Annotations:**
- **"Show on genealogy" icon in MFE:** Small cyan circuit icon (14px) to the right of each MFE result row. Appears when the genealogy panel is open. Clicking loads the phantom for that specific fix.
- **Phantom toggle memory:** The genealogy remembers which phantom is active. A small label in the genealogy panel header reads "Phantom: MFE Solution 1" or "Phantom: Adversarial Vector 1" in the appropriate color (cyan or amber-red).
- **Triple-layer rendering:** When both fix phantom (cyan) and adversarial phantom (amber-red) are active, edges are rendered in z-order: actual (bottom), fix phantom (middle), adversarial phantom (top). Where overlap occurs, a thin hairline separator (1px white) prevents color bleeding.
- **Phantom selector:** A small dropdown in the genealogy panel header lets the player toggle between "No phantom," "Fix phantom," "Adversarial phantom," or "Both." Default: whichever was most recently activated.

---

#### Journey: Bea, 17, High School Student from Davao, First Campaign Factory Mission

**Context:** Bea just failed Mission 5 — the factory introduction, her first time commanding more than five agents. She had eight units and the signal network overwhelmed her. The pre-ranking drawer opened for the first time (it was locked before Mission 5). It shows three ranked suspects. The top suspect, RELAY-B, has a suggested fix: "Reroute hook 'forward-alert' from STRIKER-C to STRIKER-A." Bea doesn't know if this is right. She doesn't know how to evaluate it. She sees the "Preview on genealogy" button.

**Minute 0:00 — Opening the Phantom for the First Time**
Bea has used the signal genealogy exactly once before, guided by the 4.66 cross-tool link. She clicked "active at tick 31" in the drawer and landed in the genealogy for the first time, saw three nodes and two arcs, understood the basic concept. Now she has eight agents and the genealogy looks dense — more arcs, more lanes, more color.

She clicks "Preview on genealogy." RELAY-B pulses cyan. Arcs propagate. She watches, not entirely sure what to look for.

**Minute 0:20 — Seeing the Fork in the River**
In the river view, the actual match shows a coral arc from RELAY-B to STRIKER-C at tick 28. The phantom shows a cyan arc from RELAY-B to STRIKER-A at the same tick. The two arcs form a visible split — coral going down to STRIKER-C's lane, cyan going up to STRIKER-A's lane.

Bea doesn't know the term "divergence" or "cascade." But she can see the fork. She can see that the fix sends the signal to a different unit. She follows the cyan arc to STRIKER-A and sees a cyan delivery circle — the signal would have arrived. She follows the coral arc to STRIKER-C and sees the red X — the signal was dropped because STRIKER-C was already dead at tick 29.

The fix reroutes a signal away from a dead unit and toward a living one. This makes immediate visual sense. Bea doesn't need to understand buffer management or eviction policies. She can see that STRIKER-C was dead and STRIKER-A was alive. The color fork in the river view told her everything.

**Minute 0:50 — Trusting the Fix**
She clicks "Apply fix." The hook reroutes. She reruns the mission. This time, STRIKER-A receives the alert, activates on time, and the factory defense holds.

Later, she tells her friend: "The game showed me a blue ghost line that went to the unit that was still alive instead of the dead one. That's how I knew the fix was right."

She didn't use the term "phantom circuit" or "counterfactual." She saw a blue line going to the right place and a regular line going to the wrong place. The feature communicated its diagnostic value through pure visual contrast.

**Minute 2:00 — The Next Mission Failure**
Mission 6 fails. Pre-ranking suggests a buffer increase for RELAY-A. Bea clicks "Preview on genealogy" again, now expecting to see cyan. The phantom materializes. RELAY-A pulses. Cyan arcs propagate from RELAY-A toward SCOUT-C. But at the break point — where SCOUT-C's signal was dropped — the red X remains. The annotation: "fix does not resolve."

Bea frowns. She remembers Mission 5: the cyan line went to the right place. This time, the cyan line goes to the right place but the red X is still there. Something else is wrong.

She looks at SCOUT-C's node. The buffer indicator shows 3/3 — full. She doesn't know what to change, but she knows the pre-ranking's suggestion isn't enough. She starts exploring SCOUT-C's config on her own. She's doing independent diagnosis for the first time, prompted by a visual that told her "not this."

**UI Annotations:**
- **First-time phantom tooltip:** On first activation, a brief tooltip appears above the genealogy: "Cyan lines show what would change with this fix. If the red X is still there, the fix doesn't solve the problem." Dismissed on click. Does not reappear after first use.
- **Dead-unit visual:** When a phantom arc targets a dead unit in the actual match, the dead unit's lane in the river view is rendered in 30% opacity with a thin diagonal hatch pattern. The visual "deadness" is obvious even to players who haven't memorized the unit status icons.
- **"Apply fix" button state:** When the phantom shows "fix resolves" at the break point, the "Apply fix" button in the drawer gains a subtle cyan border glow — visual reinforcement that the fix has been previewed and verified. When the phantom shows "fix does not resolve," the button border turns amber, and a small amber warning icon appears: "This fix may not address the primary failure."

---

#### Journey: Miko, 42, Network Engineer from Manila, Adversarial Phantom Expert

**Context:** Miko has 400+ hours. She's a top-50 Commander who uses adversarial mode (4.39) on every match, win or loss. She's discovered a workflow that combines the fix phantom and the adversarial phantom to stress-test proposed fixes against adversarial attack vectors before deploying. She calls this "the double ghost" and has posted about it in the community Discord.

**Minute 0:00 — The Workflow**
Miko loads a narrow win. EDT 0.68 — contested. Standard MFE: 0 improvements (she won). Adversarial MFE: 3 attack vectors. She loads adversarial vector 1 on the genealogy — amber-red phantom showing the attack path through her relay chain.

She sees the amber-red arc: the opponent's improved RELAY would have sent an additional signal at tick 61 that cascaded through Miko's defense line, overwhelming her STRIKER-B's buffer and causing a critical eviction at tick 65.

**Minute 0:30 — Finding the Counter, Then Previewing It**
She clicks "Find My Counter" (4.39). The blue-team MFE runs. One solution: "Your RELAY-A: add context filter, exclude terrain_class signals from opponent's RELAY." She loads this fix as a cyan phantom on the genealogy — now both phantoms are active.

The genealogy shows three layers. The actual graph shows normal signal flow. The amber-red adversarial phantom shows the attack path. The cyan fix phantom shows the counter-defense. And at tick 61, where the amber-red phantom's attack signal would have overwhelmed STRIKER-B, the cyan phantom intercepts: RELAY-A's new filter drops the terrain_class signal before it ever reaches STRIKER-B's buffer. The cyan arc terminates at RELAY-A with a hollow circle (signal filtered — intentionally dropped, not a failure), and the amber-red arc that would have continued to STRIKER-B is cut off.

Miko sees the amber-red attack path and the cyan defense path intersecting at RELAY-A. The filter catches the attack at the relay level before it reaches the buffer. She reads the visual as a network engineer would read a firewall rule: "incoming traffic from this source on this port is dropped at the perimeter, never reaches the application layer."

**Minute 1:15 — Checking for Collateral**
But Miko is thorough. She scrubs forward from tick 61. The cyan filter phantom shows a second effect she didn't expect: at tick 73, a legitimate terrain_class signal from her own SCOUT-A is also filtered by RELAY-A's new rule. The cyan phantom shows this as a hollow circle at RELAY-A — signal intentionally dropped. But this signal was useful. Her own SCOUT-A's terrain data is being caught by the filter that was designed to block the opponent's terrain noise.

She sees the friendly-fire. The fix defends against the adversarial attack but also blocks her own scout's data. She needs a more precise filter — exclude terrain_class signals *from the opponent's relay specifically*, not all terrain_class signals.

She adjusts the fix in the fork panel: instead of filtering all terrain_class, she adds a source filter: "exclude terrain_class from opponent agents only." She reloads the phantom. The cyan arcs update. At tick 61, the adversarial signal is still blocked. At tick 73, her own SCOUT-A's terrain signal passes through — no hollow circle, the cyan arc continues to STRIKER-B as a delivery.

The double-ghost workflow caught a friendly-fire error that a standard fork simulation would have missed — the fork would have shown a win (because the attack was blocked) without revealing that the filter was too broad.

**Minute 2:30 — Deploying with Confidence**
Miko deploys the refined fix. She writes in her session note: "Double-ghost caught friendly-fire on terrain_class filter. Narrowed to opponent-source-only. Without the overlay, I would have deployed a filter that blocked my own scouts and discovered the problem two matches later."

**UI Annotations:**
- **Friendly-fire detection:** When a cyan phantom shows a legitimate signal being blocked by the proposed fix, the hollow circle uses an amber tint instead of the standard neutral color. Tooltip: "This fix also affects your own signal: [SCOUT-A terrain_class at tick 73]." The amber color is a warning that the fix has unintended scope.
- **Dual-phantom legend:** When both phantoms are active, a small legend appears in the genealogy panel header: a cyan line labeled "Your fix" and an amber-red line labeled "Adversarial attack." The legend is 60px wide, positioned at the far right of the header bar.
- **Source-specific filter visualization:** When a context filter specifies a source constraint (e.g., "from opponent agents only"), the phantom arc is rendered with a dotted pattern at the filter node and solid beyond it — the dotted pattern indicates "conditional passage." Signals that pass the source check become solid; signals that fail become hollow circles.

---

## Strengths

**Prevents premature fix deployment.** The Phantom Circuit is the last checkpoint before the player commits to a change. It catches three categories of error: fixes that miss the break (Outcome 3), fixes with excessive blast radius (Outcome 2), and fixes that create friendly-fire (Miko's journey). Each of these would otherwise require a full deployment cycle to discover.

**Teaches causal chain reading.** The most important diagnostic skill in Robot Uprising is distinguishing "who was active at the failure" from "who caused the failure." The pre-ranking measures activity. The genealogy shows causation. The Phantom Circuit forces the player to evaluate the pre-ranking's suggestion against the genealogy's causal structure. Over time, players internalize the difference and start reading causal chains directly.

**Zero-cost verification.** The phantom circuit requires no simulation — it is a static overlay computed from the deterministic signal propagation rules applied to the modified config at the fork point. The computation is a single-pass traversal of the signal graph with one config field changed, taking <50ms. No progress bar, no wait, no budget cost. This makes it frictionless to preview every suggested fix before committing.

**Visual language is self-teaching.** Bea's journey demonstrates that the phantom circuit communicates through pure visual contrast — cyan vs. channel colors, cyan at the break vs. red X at the break — without requiring vocabulary or conceptual scaffolding. A player who has never heard the word "counterfactual" can use it.

**Bridges three existing systems.** The Phantom Circuit creates a direct visual connection between the pre-ranking system (which suggests fixes), the signal genealogy (which shows signal flow), and the counterfactual simulation (which verifies fixes). Previously, the player had to mentally bridge these systems. The phantom circuit makes the bridge visible.

---

## Weaknesses

**Only previews single-element fixes.** Like the Minimum Fix Explorer, the phantom circuit works on single-element config changes. Multi-element fixes (which the MFE flags as "this match required at least 2 changes to flip") cannot be previewed as phantoms because the interaction effects between two simultaneous changes are not captured by a single-pass signal graph traversal. The phantom circuit is silent on exactly the cases where the player most needs guidance.

**False confidence from "fix resolves" annotation.** Outcome 1 (cyan at the break, red X resolved) tells the player the fix addresses this specific signal drop. It does not tell the player the fix wins the match — the downstream consequences of resolving the break might create a new failure elsewhere. The player must still run the full counterfactual simulation (4.20) to verify the outcome. There is a risk that players interpret "fix resolves" as "fix wins" and skip the verification step.

**Visual complexity ceiling.** With three layers active (actual, fix phantom, adversarial phantom), the genealogy is rendering three overlapping signal graphs. At 10+ agents, the density of arcs in the river view can make the phantom edges hard to distinguish from the actual edges, even with distinct colors. The triple-layer rendering is only practical at 5-8 agents; above that, the player needs to toggle between phantoms rather than viewing both simultaneously.

**Phantom propagation is approximate.** The phantom circuit is computed by a single-pass signal propagation — it applies the config change and traces the signal paths forward. But the real counterfactual simulation (4.20) runs the full tick scheduler, which may produce different results because of second-order effects: a changed signal at tick 36 might cause an agent to take a different action at tick 37 that changes the board state at tick 38. The phantom circuit's propagation does not model these second-order effects. The phantom is a first-order approximation that is usually correct but can diverge from the full simulation in complex cascading scenarios.

**Pre-ranking dependency.** The Phantom Circuit only activates from a pre-ranking suggestion or an MFE result. Players cannot currently overlay an arbitrary config change on the genealogy — they must go through the fork panel (4.20) to test arbitrary changes, which shows the ghost overlay on the battlefield but not on the genealogy. Extending the phantom circuit to arbitrary manual changes would be natural but increases implementation scope.

---

## Interaction Effects

**4.20 Counterfactual simulation:** The Phantom Circuit is a lightweight preview of what the full counterfactual simulation verifies. The intended workflow is: (1) pre-ranking suggests a fix, (2) player previews the fix on the genealogy via phantom circuit, (3) if the phantom looks promising, player runs the full fork simulation to verify the outcome. The phantom circuit reduces the number of full simulations the player needs to run by filtering out obviously wrong fixes before they consume the fork slot.

**4.39 Adversarial counterfactual mode:** The adversarial phantom uses amber-red color language consistent with adversarial mode's established visual treatment. When both fix and adversarial phantoms are active, the player is seeing attack and defense simultaneously on the signal network. This is the "double ghost" workflow: red-team finds the attack path, blue-team finds the counter, phantom circuit verifies the counter intercepts the attack.

**4.66 Signal genealogy as pre-ranking source:** The Phantom Circuit extends 4.66's cross-tool linking. Where 4.66 links the drawer's text to the genealogy's nodes ("click 'active at tick 52' to highlight RELAY-C"), the Phantom Circuit links the drawer's *suggestions* to the genealogy's *edges* ("click 'Preview on genealogy' to see how this fix changes signal flow"). The first link shows what happened; the second shows what would change.

**4.58 Pre-ranking transparency panel:** The transparency panel explains *why* an element was ranked highly. The Phantom Circuit shows *whether* the suggested fix for that element actually addresses the failure. The transparency panel is the "here's what the heuristic thinks." The phantom circuit is the "here's what would actually happen." Together they teach the player to evaluate heuristic suggestions critically rather than accepting them as ground truth.

**4.38 Counterfactual history:** When a player previews a phantom and then runs the full fork simulation, both the phantom preview and the fork result are stored in the counterfactual history. Over time, the player accumulates a record of phantom-to-fork accuracy: "how often did the phantom circuit's first-order approximation match the full simulation's outcome?" This becomes a meta-diagnostic: if the phantom frequently disagrees with the full simulation, the player's architecture has complex cascading effects that require full simulation, and the phantom circuit is less trustworthy for that config.

**8.09 Diagnostic layer as teaching arc:** The Phantom Circuit is a teaching tool disguised as a verification tool. Its primary function — showing whether a fix addresses the break — teaches the player to evaluate fixes before deploying them. Its secondary function — showing the fix's blast radius — teaches the player to think about side effects. Its tertiary function — occasionally disagreeing with the full simulation — teaches the player that first-order reasoning has limits and full verification matters. Each function corresponds to a stage in the player's diagnostic maturity.

---

## Comparable Games/Media

**Git diff with syntax highlighting.** The phantom circuit is structurally identical to a diff view: the actual graph is the "before," the phantom graph is the "after," and only the differences are highlighted. The color coding (cyan for additions/changes, red X persistence for "still broken") maps directly to green/red diff highlighting. Developers who use `git diff` daily will find the phantom circuit instantly readable.

**Wireshark's follow-stream overlays.** Wireshark can display two packet captures simultaneously, highlighting differences in flow between them. Network engineers use this to compare "before and after" a firewall rule change. The Phantom Circuit is this exact workflow applied to an in-game signal network.

**Circuit board design tools (KiCad, Altium).** EDA software uses DRC (design rule check) overlays that highlight rule violations in a different color on top of the circuit layout. The phantom circuit is a DRC overlay for signal routing: "here is where the proposed change would alter the circuit, and here is where the original failure persists despite the change."

**Into the Breach's damage preview.** Into the Breach shows exactly what will happen before you commit to a move — enemies' intended targets, damage numbers, chain reactions. The Phantom Circuit provides the same preview fidelity for signal routing changes: before you commit to a fix, you see its effects on the network.

**Adobe Photoshop layer compositing.** The triple-layer rendering (actual + fix phantom + adversarial phantom) is functionally identical to Photoshop's layer system with blend modes. Each layer has a distinct color treatment, layers can be toggled on/off independently, and the composite shows the full picture. Players familiar with layer-based workflows will immediately understand the phantom toggle dropdown.

**Medical imaging overlays.** MRI and CT scans use false-color overlays to show areas of concern — a cyan or red wash over the anatomical grey. The phantom circuit's divergence halos function identically: a colored wash over the "healthy" signal graph indicating areas that the proposed change would affect. The "fix does not resolve" annotation is the diagnostic equivalent of "no change in the affected region after treatment."

---

## Sensory Description

**The moment the phantom activates.** The signal genealogy is a river of colored arcs — teal, coral, gold — flowing left to right across horizontal swim lanes. The density bar at the top pulses with the match's communication rhythm. The player clicks "Preview on genealogy." A single node — RELAY-C — flashes once in luminous cyan, the color of bioluminescent plankton in the Visayan Sea at night. The flash is brief, 100ms, but unmistakable against the warm channel palette. Then cyan arcs begin to propagate outward from the node, particles of light traveling along paths that don't exist in the actual match. The arcs are dashed where the actual graph has no corresponding edge — the dashes read as "this is hypothetical, this hasn't happened, this is the ghost of a signal that could have been."

**The divergence bloom.** Where the phantom circuit differs from the actual graph, halos appear. Each halo is a soft cyan glow, 8px radius, barely visible at the periphery but unmistakable when multiple halos cluster in the same region of the genealogy. A fix that cascades widely produces a constellation — cyan fireflies scattered across the river view, each one marking a node or edge where the counterfactual world differs from reality. The eye is drawn to the densest cluster. The densest cluster is usually the point of maximum impact.

**The break-point confrontation.** The player's gaze follows the cyan arcs downstream, tracking the proposed fix's propagation through the relay chain, through the routing logic, toward the break. The break is a red X — a sharp, angular icon, 6px, rendered in saturated crimson against the genealogy's dark background. The player arrives at the red X. If the phantom circuit resolves it, a cyan delivery circle appears beside the red X, and the red X fades to 50% opacity. The transformation is gentle — a held breath releasing. The annotation "fix resolves" appears in clean sans-serif, 10px, the color of new copper. If the phantom circuit does not resolve it, the red X remains at full opacity, stubbornly untouched by the cyan wash around it. The annotation "fix does not resolve" appears in amber. The red X is an immovable object. The phantom circuit proved the fix is not an irresistible force.

**The adversarial layer.** When the adversarial phantom activates alongside the fix phantom, the genealogy becomes a contested map. Cyan lines trace the defense. Amber-red lines trace the attack. Where they cross — where the fix intercepts the attack — the intersection point glows white for a single frame, then settles into a neutral color. The white flash is the moment of contact, attack meeting defense, visible for 50ms. Where they don't cross — where the attack bypasses the defense — the amber-red arc continues unchallenged, and no cyan is present to stop it. The unchallenged amber-red arc is the visual alarm: there is an open attack path that the proposed fix does not address.

**The triple-layer composite.** The full three-layer view — actual in channel colors, fix phantom in cyan, adversarial phantom in amber-red — creates a genealogy that looks like a neon-lit circuit board viewed through colored filters. The actual graph is the substrate. The cyan is the proposed modification. The amber-red is the threat model. Together they form a complete picture: here is what exists, here is what you'd change, here is what you'd face. The player who can read all three layers simultaneously is performing genuine systems-level threat analysis, and the visual density of the composite is the proof that the skill has been earned.

**The sound.** The phantom circuit's activation is accompanied by a soft, high-frequency tone — not a click, not a chime, but a sustained 200ms sine wave at 2400Hz, filtered through a light reverb that gives it the quality of a sonar ping bouncing off the walls of a submerged cave. The tone says: "new information has entered the diagnostic space." When the phantom settles and divergences are highlighted, a second tone — lower, 800Hz, 150ms — confirms the overlay is complete. The two-tone sequence becomes the auditory signature of "I'm previewing a fix." Players learn to listen for it the way they listen for the EDT gold diamond's materialization chime.

---
