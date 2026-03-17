# The Debrief Screen: Timeline Scrubbing, What-If Analysis, Failure Diagnosis

**Aspect:** 4.04 — The debrief screen as the primary post-match learning surface: how timeline navigation, unit inspection, what-if analysis, and failure diagnosis are presented as a unified analytical workspace

**Related:** 4.04b — Two-Act Debrief Structure; 4.04a — Debrief as Debugger; 4.03 — Buffer Visualization; 4.02 — Sealed Watch; 4.16 — Signal Genealogy; 4.13 — Latency Visualization; 4.20 — Counterfactual Simulation

---

## The Core Design Problem

The debrief screen must serve two fundamentally different audiences simultaneously: a player who just watched their architecture fail and needs emotional closure, and a diagnostician who needs to trace a causal chain across 60-120 ticks of simultaneous agent behavior. Every strategy game with a replay system has confronted this tension. Most resolve it badly — either the debrief is an emotional reward screen that teaches nothing (Slay the Spire's score breakdown), or it's a powerful analytical tool that nobody uses because it's overwhelming (StarCraft 2's replay viewer with 8+ statistical overlays).

Robot Uprising's debrief must be neither. It must be **the game's primary teaching surface** — the screen where players actually learn to think in systems. The sealed watch generates questions ("why did my scout freeze?"); the debrief provides answers ("because its context window was full of stale relay noise from tick 14"). This isn't a stats screen. It's a debugger wearing the skin of a game.

The two-act structure (4.04b) is locked: Act 1 sealed watch (emotional, linear, no tools) → seal break → Act 2 inspector (analytical, non-linear, full tools). This analysis explores **what Act 2 looks like** — the physical layout, the tools, the interaction design, the moment-to-moment experience of diagnosing an agent architecture.

---

## Six Debrief Screen Paradigms

### Paradigm A: "The Debugger" — IDE-Modeled Vertical Stack

**Layout:** Board occupies the top 55% of the screen. Below it, a horizontal timeline scrubber bar (the full match as a waveform). Below that, a vertical stack of collapsible panels: Context Window State, Decision Trace, Signal Genealogy, Event Log. Click any unit on the board to populate the panels with that unit's data at the current tick.

**Visual language:** Dark navy background (#0a0e1a). Panels have thin cyan borders, 1px, with rounded corners. Active panel header glows softly. Collapsed panels show a one-line summary ("SCOUT-A: Rule 3 matched — EVADE north"). The timeline scrubber is a horizontal bar showing tick numbers, with a gold playhead line. Above the scrubber, a miniature evaluation graph (like a chess evaluation bar turned horizontal) shows "army health" — number of surviving units over time. Dips in the graph are visually obvious loss moments.

**Interaction model:** Arrow keys step through ticks. Click the timeline to jump. Click a unit on the board to select it (cyan highlight ring). Selected unit's panels update instantly. Panels can be reordered by dragging headers. Each panel has a "pin" icon to keep it visible while scrolling through others.

**The killer feature:** The Decision Trace panel. For the selected unit at the current tick, it shows:
1. All rules evaluated this tick, in priority order
2. For each rule: which conditions were checked, which passed (green), which failed (red), which returned ? (amber dashed)
3. The winning rule highlighted with a gold bar
4. The action taken, with a "because" annotation linking to the context entries that satisfied the condition

This is literally a step-through debugger. Each tick is a breakpoint. The player is reading a stack trace of their agent's decision.

**Strengths:** Maximum analytical power. Players who use this will genuinely understand why their architecture did what it did. The IDE metaphor maps directly to the "transferable engineering skills" goal — this IS a debugger, and using it teaches debugging. The vertical stack is familiar to anyone who's used Chrome DevTools, VS Code debug panels, or a logging dashboard.

**Weaknesses:** Overwhelming for new players. The panel stack creates scroll fatigue on small screens. The board shrinks to 55% and loses the visceral connection to the battlefield. Players who don't already think in terms of debuggers won't know what to look at first. Risk of "spreadsheet syndrome" where the debrief feels like work, not play.

**Sensory description:** The transition from sealed watch to Debugger is clinical. The battlefield dims slightly as panels slide up from the bottom edge, accompanied by a soft mechanical ratcheting sound — like a server rack sliding open. The gold playhead on the timeline pulses gently, once per second, inviting interaction. When you click a unit, the selection ring appears with a brief cyan flash and a soft electronic "lock-on" tone. Panel expansion has a 200ms accordion animation with a quiet paper-unfolding sound. The overall feeling is: you've entered a control room after the crisis. The emergency is over; now you study the data.

---

### Paradigm B: "The Crime Scene" — Click-to-Inspect Board-Dominant

**Layout:** Board fills 85% of the screen, exactly as during the sealed watch. The timeline scrubber sits at the very top, thin (32px), with tick numbers and the gold diamond marking the pivot tick. The only other persistent UI element is a small toolbar in the top-right corner (4 icon buttons: Signal Overlay, Context Overlay, Heatmap, Event Log toggle). Everything else appears **on demand** when you click a unit.

**Visual language:** The board IS the debrief. When you click a unit, a translucent panel materializes next to it — tethered to the unit with a thin gold line, floating like a speech bubble. This panel shows the unit's context window at the current tick (each slot as a colored rectangle with a one-line text summary), the rule that matched this tick (highlighted in gold), and the action taken. The panel follows the unit if you scrub the timeline. Multiple units can have panels open simultaneously, creating a constellation of floating diagnostic windows across the battlefield.

**Interaction model:** Click unit = open/close inspection panel. Scrub timeline = all open panels update. Right-click a context entry = expand to full detail (source, age, channel). Right-click the matched rule = show the full decision trace. Hover over a signal line (colored dashed lines between units) = show signal content, age, and channel name. The board is scrubable — drag left/right anywhere on the board to scrub the timeline.

**The killer feature:** Spatial context. The diagnostic information lives ON the battlefield, next to the units it describes. When you see that SCOUT-A's context window is full of stale relay noise, you can look over at RELAY-B sitting three tiles away and click it to see what it was sending. The spatial relationship between units and their information flows is preserved in the diagnostic view. You're investigating a crime scene, not reading a report about it.

**Strengths:** Board-dominant means the player never loses the battlefield context. Multiple simultaneous inspection panels let you trace signal flows visually — click the scout, see its incoming signal, look at the relay that sent it, click the relay. The "crime scene" metaphor is intuitive: walk around, click things, understand what happened. Low cognitive overhead for first encounter. The board-as-scrubber gesture means you never need to find a specific UI element to navigate time.

**Weaknesses:** Floating panels occlude the board at scale. With 8+ units and multiple panels open, the screen becomes cluttered. No good place for global metrics (army health over time, resource graphs, overall signal flow statistics). The tethered-panel approach struggles on mobile/small screens. Deep diagnostic chains (trace a signal through 4 hops) require clicking 4 units sequentially, which is slower than a single panel showing the full chain.

**Sensory description:** The seal breaks, and the battlefield freezes — units stop mid-action, signal lines crystallize into static dashed patterns, the tick clock pauses. A beat of silence. Then the gold diamond materializes at the pivot tick with a soft chime, and the timeline scrubber slides down from the top edge like a shade being pulled. The board brightens slightly, as if the lights came on in a room. When you click a unit, the inspection panel fades in over 200ms with a quiet "click-open" sound — like opening a dossier. The gold tether line draws itself from unit to panel over 150ms. When you scrub, the board state snaps between ticks with the same discrete snap as the sealed watch, but now each snap is accompanied by a subtle data-refresh sound — a quiet "tick" like a clock, different from the sealed watch's louder tick pulse. Multiple open panels gently bob in place, as if floating on water. The feeling is: you're walking through a frozen moment, turning over evidence.

---

### Paradigm C: "The Mission Control" — Split-Screen Dashboard

**Layout:** Board on the left (50%), dashboard on the right (50%). The dashboard has three fixed sections stacked vertically:
1. **Timeline + Army Health** (top 25% of right panel): Timeline scrubber with army health sparkline below it. Gold diamond visible.
2. **Unit Inspector** (middle 50%): Shows the selected unit's full state — portrait, context window (visual slots), decision trace, current position, skills active. Tabs at the top for "Context," "Rules," "Hooks," "History."
3. **Global Metrics** (bottom 25%): Channel activity bar chart, resource graph, signal flow count over time. Tab-switchable to Event Log.

**Visual language:** Clean two-column split. A thin vertical divider between board and dashboard, draggable to resize (snap points at 40/60, 50/50, 60/40). The dashboard uses a dark card-based layout — each section is a rounded-corner card with a subtle shadow. The selected unit on the board has a bright cyan ring; its portrait appears at the top of the Unit Inspector section. Tabs are pill-shaped, cyan when active, dim when inactive.

**Interaction model:** Click unit on board = populate Unit Inspector. Arrow keys = step timeline. Tab key = cycle inspector tabs. The "Context" tab shows the full context window as a vertical list of slots, each colored by data type (observation = green, signal = blue, command = magenta, stale = grey with strikethrough). Click any slot = expand to full detail. The "Rules" tab shows the priority queue with this tick's matched rule highlighted. The "History" tab shows the unit's action history across all ticks as a compact timeline (colored dots: green = move, red = attack, blue = signal, amber = stunned).

**The killer feature:** The History tab. A horizontal strip of colored dots, one per tick, for the selected unit. Hover a dot to see the action. Click to jump to that tick. Patterns become instantly visible — you can see that RELAY-B was stunned on ticks 14, 18, and 22 (three amber dots in a cluster) and investigate why. The dot strip is essentially a per-unit heartbeat monitor. When viewed for all units simultaneously (toggle in the Global Metrics section), you get a matrix of dot strips — a "raster plot" of your army's behavior, like a neuroscience spike train diagram.

**Strengths:** The split-screen gives each information type a permanent home. No floating panels to manage. The unit History tab provides a unique analytical view not available in any other paradigm — seeing patterns across ticks is something no other paradigm does as well. Global metrics are always visible, supporting system-level thinking. The draggable divider accommodates different screen sizes and player preferences.

**Weaknesses:** Board at 50% feels small, especially on a laptop screen. The spatial relationship between units is harder to read at 50% scale. Four tabs in the Unit Inspector means information is hidden behind clicks. The dashboard can feel "spreadsheet-y" — the card-based layout is clean but clinical. Risk of analysis paralysis with so many sections demanding attention.

**Sensory description:** The seal breaks, and the board smoothly slides to the left over 400ms — like a door opening to reveal a room behind it. The dashboard materializes section by section, top to bottom, each card fading in with a soft "snap" sound like a binder clicking open. The army health sparkline draws itself left-to-right as the timeline scrubber appears. The gold diamond on the timeline chimes once. When you click a unit, its portrait slides into the inspector with a magnetic "thunk." Tab switching has a subtle horizontal slide transition. The global metrics charts animate in as bar charts grow from zero. The feeling is: mission control after the mission. Banks of monitors, each showing a different view of the same event. Calm, structured, comprehensive.

---

### Paradigm D: "The Time Machine" — Scrubber-Dominant Cinema

**Layout:** Board fills 75% of the screen, centered. At the bottom, a prominent timeline scrubber (80px tall) — not just tick numbers but a rich waveform showing signal density, combat events (red spikes), and context overload events (amber pulses) as a visual "heartbeat" of the match. Above the scrubber, a thin information ribbon (24px) showing the current tick's summary ("T47: SCOUT-A detects ENEMY-3, RELAY-B compresses, STRIKER-C engages"). Click any unit on the board for a minimal popup (context window + matched rule only, 200px wide).

**Visual language:** The timeline is the protagonist. It's rendered as a waveform that looks like an audio editor timeline — peaks for high-activity ticks, valleys for quiet ones. Combat events are red vertical lines. Overload events are amber vertical lines. The gold diamond sits on the waveform at the pivot tick. The current position is shown by a glowing vertical playhead line with a subtle trail. The board dims slightly behind the timeline, making the timeline the visual anchor.

**Interaction model:** Drag the timeline playhead to scrub. Click anywhere on the waveform to jump. Space bar to play/pause at 1x/2x/4x speed. The information ribbon auto-narrates each tick's key events. Hold Shift + hover over the waveform to see a tooltip preview of that tick's board state (like video scrubbing thumbnails). Click a unit for a minimal popup; right-click for a deep dive panel (which replaces the information ribbon with a full decision trace).

**The killer feature:** The waveform itself. Before you click anything, the shape of the match tells a story. A long quiet stretch followed by a spike cluster tells you "scouting phase, then sudden contact." Two simultaneous red spikes with an amber overload pulse between them says "flanking attack triggered overload." The waveform IS the debrief's thesis statement — you read it like a cardiogram, and the peaks tell you where to investigate. Veterans will glance at the waveform and know which tick to jump to before clicking anything.

**Strengths:** The waveform provides the fastest high-level match summary of any paradigm — a single visual artifact that encodes the entire match's rhythm. The "audio editor" metaphor is widely understood. The scrubber-dominant design puts timeline navigation front and center, encouraging the non-linear exploration that makes debriefs valuable. The minimal popup keeps the board uncluttered. The Shift+hover preview is a power-user feature that rewards exploration.

**Weaknesses:** Deep diagnostic work is awkward — the minimal popup doesn't have room for full decision traces or signal genealogy. The right-click deep dive replaces the information ribbon, creating modal confusion. No permanent space for global metrics. The waveform requires learning to read (what do peaks mean? what do the colors mean?). First-time users may find the waveform beautiful but opaque.

**Sensory description:** The seal breaks with a dramatic "film reel rewinding" sound — a rapid descending whir. The board state snaps back to tick 0, and the timeline waveform draws itself left-to-right over 2 seconds, each peak accompanied by a tiny audio cue from the corresponding event (a distant combat crack for red spikes, a muffled electronic buzz for amber pulses). The gold diamond appears last, with a clear bell tone. The playhead glows warm white, leaving a faint trail as you drag it. Scrubbing is accompanied by a subtle "tape shuttle" sound — pitch-shifted audio from the match itself, like scrubbing audio in a DAW. Playing back at speed, each tick produces a soft mechanical "tick" that becomes a rhythmic pulse. The feeling is: you're an editor in a cutting room, reviewing footage. The match is your raw material. You're looking for the story.

---

### Paradigm E: "The Autopsy Table" — Failure-First Diagnosis

**Layout:** The screen opens NOT on tick 0 but on the tick where the player lost (or the pivot tick if they won). The board shows the decisive moment. A large, centered panel (60% width, 40% height) overlays the bottom of the board, titled "WHAT HAPPENED" in clean sans-serif. This panel shows: (1) the unit(s) that died or failed this tick, (2) the immediate cause (enemy striker adjacency, context overload stun), (3) a "trace back" button for each cause. Clicking "trace back" rewinds the timeline to the earlier tick where the causal chain began, and the panel updates to show the next-earlier cause. The player follows a breadcrumb trail backward through time until they reach the root cause.

**Visual language:** The decisive moment is rendered in high contrast — the dead/failing unit is shown in red outline, the killer in bright hostile red, everything else dimmed to 30% opacity. The "WHAT HAPPENED" panel uses a warm dark background (#1a1210) with amber text — the forensic analysis color palette. Each traced-back step adds a node to a growing causal chain visualization in the panel: a horizontal chain of events connected by arrows, growing leftward (backward in time) as you trace. By the time you've traced 4-5 steps back, you have a complete causal chain displayed as a horizontal story: "T8: RELAY-B received noisy signal → T12: SCOUT-A's buffer filled → T14: SCOUT-A stunned → T18: SCOUT-A couldn't evade → T19: SCOUT-A eliminated."

**Interaction model:** The player doesn't manually scrub — the system guides them. "Trace back" rewinds to the relevant earlier tick. "Trace forward" follows the chain forward. At any point, the player can exit guided mode and free-scrub. But the default experience is a guided backward walk through causation. The panel shows "WHY?" buttons next to each causal step, expanding to show the context window or rule state that produced the outcome.

**The killer feature:** The causal chain visualization. When complete, it's a horizontal flowchart showing the full story of a failure — from root cause to final outcome, each node a tick with an event, each arrow a causal link. This is the single most pedagogically powerful artifact in any debrief paradigm. A player who reads one causal chain learns more about their architecture's failure mode than 10 minutes of free scrubbing. The chain can be saved, shared, and compared across retries.

**Strengths:** Failure-first design matches the player's emotional state ("I lost — why?"). The guided backward trace is more structured than free exploration, reducing analysis paralysis. The causal chain visualization is a unique artifact that no other paradigm produces. The "trace back" button removes the need to know which tick to investigate — the system finds it for you. Excellent for new players who wouldn't know where to start in a free-scrub debrief.

**Weaknesses:** Guided mode can feel restrictive for experienced players who want to explore freely. The system must correctly identify causal chains, which is computationally complex (which of many concurrent events was THE cause?). Biased toward failure analysis — doesn't naturally support "what went right?" exploration. The causal chain can be wrong or misleading if the game's causality detection is imperfect. Risk of players following the guided path and never learning to investigate independently.

**Sensory description:** The seal breaks, and instead of rewinding to tick 0, the screen freezes on the final moment. A beat of silence — then the "WHAT HAPPENED" panel slides up from the bottom with a heavy, deliberate mechanical sound, like an autopsy drawer opening. The failing unit pulses red. The first "trace back" click triggers a dramatic rewind — the board state rushes backward through ticks with a "tape rewind" sound, stopping abruptly at the causal tick with a sharp "stop" sound. Each traced-back step adds a node to the chain with a small "click" sound and a connecting arrow that draws itself over 200ms. The chain grows leftward like a timeline being constructed in reverse. When complete, the full chain briefly pulses gold, and a soft ascending chime plays — the "diagnosis complete" sound. The feeling is: forensic pathology. You're conducting an autopsy, peeling back layers until you find the bullet.

---

### Paradigm F: "The Growing Lens" — Progressive Complexity Debrief

**Layout:** The debrief starts simple and grows more complex across the campaign, mirroring the workbench's progressive disclosure pattern.

**Phase 1 (Missions 1-4):** Board fills the screen. A simple text box at the bottom shows "Your scout was eliminated at tick 19 because it couldn't evade — its context window was full." One sentence. One lesson. The player can scrub the timeline (arrow keys) but has no other tools. The gold diamond is present but unexplained.

**Phase 2 (Missions 5-6):** The Crime Scene (Paradigm B) unlocks. Click-to-inspect panels appear on units. The player discovers the context window viewer and the decision trace. A boot log entry announces: "INSPECTOR MODULE: diagnostic subsystems online. Click any unit to inspect."

**Phase 3 (Missions 7-8):** Mission Control panels (Paradigm C) unlock. The split-screen option appears. The History tab becomes available. Channel metrics appear. The gold diamond is explained in the boot log: "PIVOT DETECTION: I can now identify the tick where the outcome was determined."

**Phase 4 (Missions 9-10):** Full analytical suite. Signal genealogy, counterfactual simulation (what-if), waveform timeline, causal chain tracer. The complete Paradigm A + B + C + D + E toolkit is available, with the player free to choose their preferred layout.

**Visual language:** Each phase unlocks with a diegetic boot log entry and a brief (1-second) animation showing the new tools materializing on the screen — panels sliding in, buttons appearing, overlays fading up. The unlocked tools have a "new" badge (a small cyan dot) that disappears after first use. Previously unlocked tools remain available in all future missions.

**The killer feature:** The player NEVER sees the full debrief complexity on their first encounter. By Mission 9, they're fluent with tools they've been using for 5 missions. This solves the fundamental tension between power and accessibility. The debrief grows as the player grows. Each new tool arrives exactly when the campaign demands it — click-to-inspect unlocks when units become complex enough to need inspection, the History tab unlocks when production creates enough units that patterns matter, signal genealogy unlocks when hook chains become deep enough that signal tracing is necessary.

**Strengths:** Solves the "too overwhelming for beginners, too simple for veterans" problem completely. Each tool arrives when it's needed, creating a "just in time" learning curve. Diegetic boot log framing maintains narrative consistency. By endgame, the player has the full power of any other paradigm but arrived there gradually.

**Weaknesses:** Requires 4 distinct debrief UIs to implement and maintain. Players who replay early missions with full tools unlocked may find the early debrief too simple. The unlock schedule must be precisely tuned to campaign difficulty — if tools arrive too late, players are frustrated; too early, they're overwhelmed. Returning players after a break may not remember which tools they have.

**Sensory description:** Each unlock phase has its own sonic signature. Phase 1: the debrief opens with a single quiet tone, like a tuning fork. Phase 2: a pair of electronic beeps, like a diagnostic tool powering on. Phase 3: a brief three-note ascending phrase, like a system completing a boot sequence. Phase 4: a full chord that resolves satisfyingly, like an orchestra tuning then hitting the first note — the complete instrument is ready. Between phases, each new tool materializes with a brief CRT-scan-line animation (a horizontal bright line sweeping down the new panel, leaving the rendered UI in its wake). The feeling is: upgrading your equipment. Each phase makes you feel more capable, more prepared for harder challenges.

---

## Cross-Paradigm Comparison

| Dimension | A: Debugger | B: Crime Scene | C: Mission Control | D: Time Machine | E: Autopsy Table | F: Growing Lens |
|-----------|-------------|----------------|--------------------|-----------------|--------------------|-----------------|
| Board prominence | 55% | 85% | 50% | 75% | 70% (dimmed) | 55-85% (varies) |
| First-use accessibility | Low | High | Medium | Medium | High | Very High |
| Diagnostic depth | Very High | Medium | High | Medium | High (guided) | Very High (at endgame) |
| Spatial reasoning | Low | Very High | Medium | Medium | Low | Varies |
| Temporal reasoning | Medium | Low | High (History tab) | Very High | High (causal chain) | Varies |
| Global metrics | Via panels | None | Always visible | Waveform only | None | Grows |
| Screen real estate | Heavy | Light | Heavy | Medium | Medium | Grows |
| Mobile/touch adaptation | Poor | Good | Poor | Good | Good | Good |
| Streaming value | Low (code-y) | High (visual) | Medium | High (cinematic) | Very High (narrative) | High |
| Implementation cost | High | Medium | Very High | High | Very High (AI causality) | Extreme |

---

## Recommendation: "The Growing Autopsy" Hybrid

**The recommended debrief combines F's progressive disclosure with E's failure-first guidance and B's board-dominant inspection.**

**Phase 1 (M1-4): Guided Autopsy Lite.** Board fills screen. After the seal breaks, a single "WHAT HAPPENED" text appears at the bottom with one sentence explaining the outcome. The player can scrub (arrow keys) and click units to see their context window at the current tick (simple popup: just the colored slots, no rule trace). The gold diamond marks the pivot but isn't explained yet.

**Phase 2 (M5-6): Guided Autopsy + Crime Scene.** The "trace back" button appears in the WHAT HAPPENED panel. Click-to-inspect popups now show the decision trace (which rule matched). Signal lines between units become visible and hoverable. The guided backward trace teaches players to think causally.

**Phase 3 (M7-8): Full Crime Scene + Mission Control option.** The player can toggle between board-dominant (B) and split-screen (C) layouts. The History tab appears. Channel metrics unlock. The gold diamond is explained. The waveform timeline replaces the simple tick scrubber.

**Phase 4 (M9-10): Complete Suite.** Signal genealogy graph. Counterfactual simulation. Causal chain visualization. Full waveform with event annotations. Everything from all paradigms, player-configurable layout.

**Why this hybrid:** It matches the campaign's teaching arc. Early missions teach one concept at a time — the debrief should teach one diagnostic tool at a time. The failure-first approach (Autopsy) matches the player's emotional state after a loss and provides structure. The Crime Scene's board dominance preserves spatial context, which is essential when the game's core mechanic is about spatial signal flows. The Mission Control option gives analytical players a permanent dashboard when they need one. By Phase 4, the player has built fluency with every tool individually before they're combined.

---

## Player Journeys

#### Journey: Mei, 28, Software Engineer (First Debrief, Mission 2)

**Context:** Mei just completed the sealed watch for Mission 2. She configured her scout to patrol and her striker to engage enemies, but the scout walked into two enemies and was eliminated before it could send a signal. She's frustrated — she expected the scout to evade. This is her first debrief.

**Minute 0:00 — The Freeze**
The sealed watch ends. The board freezes on tick 23 — SCOUT-A's elimination tick. The tick clock stops. A beat of silence, then the faintest hum of electronics powering up.

The WHAT HAPPENED panel slides up from the bottom: a dark warm-toned card, 400px wide, centered.

> **SCOUT-A was eliminated at T23.**
> An enemy striker was adjacent. SCOUT-A had the `evade` skill but did not use it.
> *Click any unit to inspect its context window at this tick.*

Mei stares. "It HAD evade. Why didn't it use it?" She clicks SCOUT-A on the board.

**Minute 0:20 — The Context Window**
A translucent popup materializes next to the scout's last position, tethered by a thin gold line. It shows the context window: 6 slots, all filled. Slot 1: "observation: enemy-1 at D4" (green). Slot 2: "observation: enemy-2 at E5" (green). Slot 3: "observation: wall at C3" (green). Slot 4: "observation: resource node at F6" (green). Slot 5: "observation: terrain change at D6" (green). Slot 6: "observation: ally STRIKER-B at B2" (green).

Every slot is an observation. No signal data. The context window is full of raw sensory data — walls, terrain, allies, everything the scout could see. Its wide perception radius (5 tiles) flooded it with observations.

**Minute 0:40 — The Aha**
Mei scrolls back (left arrow key) to tick 21, tick 20, tick 19. The context window is always full. Different observations, but always 6/6 slots occupied. She notices the one labeled "observation: enemy-1 at D4" appears at tick 18. Before tick 18, the slot that enemy observation now occupies held "observation: grass at D4."

"Wait — the buffer was FULL. When the enemy appeared, it evicted the grass observation. But the scout already had too much to process." She looks at the skill list in the popup. Evade is listed, but the rule says `IF enemy_adjacent THEN evade`. The condition checks for enemy data in the context window.

She scrubs forward to tick 22. SCOUT-A's context has enemy-1 in slot 1. The rule matched — `evade` was selected. But by tick 23, a second enemy was adjacent. The scout tried to evade but moved into the other enemy's range.

"It saw the enemy one tick too late because its buffer was full of junk. If I had fewer observations..." She wants to replay immediately with a narrower listen config. She hits the EXECUTE button — back to the plan screen.

**Minute 1:30 — Resolution**
Mei adjusts the scout's context config: ignore terrain observations, ignore ally positions. Keep only enemy observations and signal data. The context window usage drops from 6/6 to 2/6 on the preview. She hits EXECUTE again.

This time, SCOUT-A spots the enemy at tick 16 (two ticks earlier), evades successfully, and sends a signal to STRIKER-B. Mission complete.

**What Mei learned:** Context window capacity is the game. The scout had the right skill and the right rule — it failed because irrelevant observations consumed its limited attention. The debrief showed her the exact mechanism: full buffer → late detection → failed evasion. She never needed a signal genealogy graph or a causal chain visualization. One click, one popup, one lesson.

**UI Annotations:**
- WHAT HAPPENED panel: 400px wide, centered bottom, warm dark background (#1a1210), amber text, 14px sans-serif
- Context window popup: 200px wide, positioned right of selected unit, translucent dark navy (rgba(10,14,26,0.9)), gold tether line to unit
- Context slots: 24px tall horizontal bars, colored by type (green=observation, blue=signal, magenta=command), content text in 11px monospace
- Arrow key scrubbing: board state snaps between ticks, tick number updates in top-left, popup content refreshes with 100ms fade

---

#### Journey: Marcus, 42, DevOps Engineer (Mission 7, Split-Screen Debrief)

**Context:** Marcus is on Mission 7, the first Command agent mission. He built an architecture: 2 scouts feeding a relay, which compresses and forwards to 2 strikers and a command unit. The command unit has rules to reroute hooks if a relay dies. His army was destroyed by a noise flood — enemy units emitted so much signal noise that his relay's context window overloaded, the relay was stunned for 3 consecutive ticks, and his strikers went blind.

**Minute 0:00 — The Waveform**
The sealed watch ends with the last striker eliminated at tick 67. Marcus watches the timeline waveform draw itself. He sees the match's shape immediately: a calm stretch (ticks 1-30), a gradually rising signal density (ticks 30-45), then a violent spike cluster (ticks 46-55) followed by silence (ticks 56-67 — his units dying one by one without coordination).

"The spike cluster. That's where it went wrong." He clicks on the waveform at tick 46. The gold diamond is at tick 52 — six ticks after the spike begins.

**Minute 0:30 — The Split Screen**
Marcus toggles to Mission Control layout (50/50 split). Board left, dashboard right. He clicks RELAY-B on the board. The Unit Inspector populates:

**Context tab:** At tick 46, RELAY-B's context window shows 12/12 slots full. Slot types: 4 compressed scout reports (blue), 3 raw scout observations that weren't compressed yet (green), and 5 enemy noise signals (red, labeled "EM_INTERCEPT: decoy at G7", "EM_INTERCEPT: decoy at H6", etc.).

"Five enemy noise signals. That's almost half the buffer." He switches to the **History tab**. RELAY-B's dot strip shows: green dots (normal operation) from T1-T45, then amber-amber-amber at T46-T48 (stunned three consecutive ticks), then a red dot at T49 (eliminated).

**Minute 1:00 — The Channel Metrics**
Marcus looks at the Global Metrics panel. The channel activity chart shows "recon-net" (his scout-to-relay channel) with consistent 2 signals/tick from T1-T30. But from T30 onward, the chart shows a second channel — unnamed, enemy-sourced — ramping from 1 to 6 signals/tick by T45. RELAY-B was listening to everything. It had no listen/ignore filters.

"The relay was picking up enemy emissions because I didn't configure its listen filters. It was literally listening to the enemy's noise." He clicks on the channel in the chart — a tooltip shows: "Channel: [unlabeled-EM], Source: ENEMY units, Signals received by: RELAY-B (12 total), SCOUT-A (3), COMMAND-C (1)."

**Minute 1:30 — The Decision Trace**
Marcus scrubs to tick 46 (first stun) and switches to the Rules tab for RELAY-B. The decision trace shows:

```
T46 — RELAY-B
  Rule 1: IF has_uncompressed THEN compress  ✓ condition met
  → BUT: context window FULL (12/12). New entry cannot be added.
  → OVERLOAD: 1-tick stun triggered.
  Action: NONE (stunned)
```

"The compress skill tried to add a compressed entry to the buffer, but there was no room because enemy noise had filled the remaining slots. The compression output had nowhere to go." Marcus exhales. He can see exactly what happened: enemy noise → buffer fill → compression blocked → stun → three ticks of silence → strikers received no intelligence → elimination.

**Minute 2:00 — The Fix**
Marcus opens RELAY-B's context config from the debrief (read-only view — he can't edit here, but he can see what he set). Listen filters: ALL CHANNELS. Eviction priority: FIFO (oldest first).

"I need to ignore unlabeled channels — only listen to 'recon-net' and 'command-net'. And I need eviction to prioritize enemy noise over scout reports." He notes this mentally and returns to the plan screen.

**What Marcus learned:** Information warfare. The enemy flooded the EM spectrum with noise, which his relay ingested because it had no channel filters. The debrief showed him the exact mechanism through four distinct views: the waveform (when the spike happened), the context window (what filled the buffer), the channel metrics (where the noise came from), and the decision trace (how the overload triggered). Each view answered a different question. Together, they told the complete story.

**UI Annotations:**
- Mission Control layout: 50/50 split with draggable divider, board left, dashboard right
- Unit Inspector tabs: pill-shaped, 80px wide, cyan when active ("Context" | "Rules" | "Hooks" | "History")
- History tab dot strip: 400px wide horizontal row of 8px circles, colored (green=action, amber=stunned, red=eliminated, blue=signal sent, grey=idle)
- Channel metrics: horizontal stacked bar chart, one row per channel, width proportional to signals/tick, enemy channels rendered in red
- Decision trace: monospace text, 12px, conditions green (✓) or red (✗), actions gold, system messages amber

---

#### Journey: Aiko, 14, First Strategy Game (Mission 1, Minimal Debrief)

**Context:** Aiko just played Mission 1. She has one scout and one striker, pre-placed. She modified the scout's context config to reduce listen radius (the tutorial's lesson). Her scout survived and the mission succeeded. This is her very first debrief.

**Minute 0:00 — Simple Victory**
The sealed watch ends with the enemy eliminated at tick 15. The board freezes. The WHAT HAPPENED panel slides up:

> **Mission Complete.**
> STRIKER-B eliminated the enemy at T15.
> SCOUT-A detected the enemy at T8 and signaled STRIKER-B.
> Your signal arrived 3 ticks before the enemy reached STRIKER-B.
> *Use ← → to step through the match. Click any unit to see its context window.*

Aiko reads the summary. "Three ticks early. Cool." She presses the right arrow key once. Tick 1. The scout moves forward. She presses again. Tick 2. The scout continues patrolling. She keeps pressing — it's like a slideshow of the battle, one frame per tap.

**Minute 0:20 — Curiosity Click**
At tick 8, she sees the moment: SCOUT-A's perception cone touches the enemy. A brief green flash. She clicks SCOUT-A. The popup shows the context window: 3/6 slots filled. Slot 1: "observation: enemy at F5" (green, pulsing slightly). Slot 2: "observation: wall at E4" (green, dim). Slot 3: empty.

"Only 3 things. Because I narrowed the listen radius." She clicks the enemy observation. It expands: "Source: direct observation. Age: this tick. Used in decision: YES — triggered Rule 1: IF enemy_detected THEN signal recon-net."

**Minute 0:35 — Forward**
She steps forward to tick 9. The scout's context shows the same enemy observation, now aged 1 tick. A new entry: "signal: recon-net SENT" (blue). She clicks STRIKER-B. Its context shows: "signal: recon-net — enemy at F5" (blue). "The signal traveled!" She keeps pressing forward, watching the striker move toward F5, one tick at a time. At tick 15, engagement. Victory.

**Minute 0:50 — Done**
Aiko has no more questions. She understood the whole match by stepping through it. The debrief took less than a minute. She didn't need channel metrics or signal genealogy or decision traces. The minimal popup and arrow-key scrubbing was enough.

"I wonder what happens if I make the scout listen to MORE things..." She returns to the plan screen, curious to experiment.

**What Aiko learned:** Signal propagation — that a scout's observation becomes a signal that travels to another unit. The debrief's minimal interface (arrow keys + click popup) was sufficient. She experienced the debrief as a "replay slideshow" rather than an analytical tool, which is exactly appropriate for Mission 1. The curiosity to experiment ("what if I listen to more?") means the teaching worked.

**UI Annotations:**
- Phase 1 debrief: board fills screen, WHAT HAPPENED panel centered bottom, 400px wide
- Arrow key stepping: board snaps per tick with soft "tick" sound, tick counter in top-left updates
- Unit popup: minimal version showing only context window slots (no rules, no history), 180px wide
- Context slot expansion on click: slides open 60px revealing source/age/decision-used fields

---

#### Journey: Dr. Reyes, 45, CS Professor (Mission 9, Full Suite Teaching Demo)

**Context:** Dr. Reyes is preparing a lecture on "Information Overload in Distributed Systems." She's running Mission 9 (Mindanao jungle) to generate a debrief artifact showing how context overload cascades through a network. She has the full Phase 4 debrief unlocked.

**Minute 0:00 — The Setup**
Dr. Reyes deliberately configured a suboptimal architecture: scouts with wide perception, relays with no channel filters, strikers with small buffers. She wants the cascade failure to be dramatic for her students.

The sealed watch delivers. Her relay chain overloads at tick 34, causing a cascade: relay stun → scout signals unprocessed → strikers blind → elimination wave from tick 40-55.

**Minute 0:15 — Waveform Analysis**
She toggles to Time Machine layout (Paradigm D). The waveform shows a textbook cascade: gradual signal buildup (ticks 1-30), critical threshold crossing at tick 31 (the waveform spikes), three rapid amber pulses (relay stuns at T34-T36), then a cluster of red spikes (eliminations T40-55).

She screenshots the waveform. "This is slide 3 — the shape of a cascade failure."

**Minute 0:40 — Signal Genealogy**
She switches to the full Signal Genealogy view. A network graph appears: nodes are units, edges are signal paths, edge thickness proportional to signal volume. She scrubs to tick 30 (pre-cascade). The graph is clean — thin lines, organized flow. She scrubs to tick 35 (mid-cascade). The relay nodes are bloated, signal lines are thick and tangled, several lines are red (blocked signals).

She exports the before/after genealogy as a side-by-side image. "Slide 5 — network topology under load."

**Minute 1:00 — Causal Chain**
She clicks the Autopsy mode button. The "WHAT HAPPENED" panel appears, focused on STRIKER-C's elimination at tick 42. She traces back:

```
T42: STRIKER-C eliminated (adjacent enemy)
← T40: STRIKER-C did not engage (no enemy data in context window)
← T37: RELAY-B signal to STRIKER-C dropped (relay stunned)
← T34: RELAY-B context overload (12/12, 5 noise signals)
← T31: Enemy noise flood began (3 enemy units entered relay perception range)
← T28: RELAY-B listen config: ALL CHANNELS (root cause)
```

She screenshots the causal chain. "Slide 7 — root cause analysis. Notice the root cause is a configuration decision made before the match started."

**Minute 1:30 — Counterfactual**
She opens the counterfactual simulator (4.20). She selects T28 and changes RELAY-B's listen config to "recon-net only." The simulator runs forward from T28: RELAY-B never overloads, signals flow cleanly, STRIKER-C engages successfully, mission succeeds.

She exports the counterfactual comparison. "Slide 9 — the minimum fix. One configuration change would have prevented the cascade."

**Minute 2:00 — Export and Done**
Dr. Reyes exports the full debrief artifact: waveform, signal genealogy before/after, causal chain, counterfactual comparison. Total preparation time for her lecture: 2 minutes of gameplay, 2 minutes of debrief navigation, 10 minutes of lecture slides.

**What Dr. Reyes demonstrates:** The debrief is a fully-featured distributed systems diagnostic tool. The same workflow she used — waveform shape analysis → topology inspection → root cause tracing → counterfactual verification — is the exact workflow her students will use to debug production microservice failures. The game taught it through play.

**UI Annotations:**
- Full suite toolbar: 6 icon buttons (Signal Genealogy, Causal Chain, Counterfactual, Waveform, Heatmap, Export) in top-right, 32px icons with tooltips
- Signal genealogy: force-directed graph, nodes as unit portraits (48px), edges as animated signal lines, thickness = volume, color = channel, red = blocked
- Causal chain: horizontal flowchart, nodes as rounded rectangles (120px wide) with tick + event text, connected by arrows, root cause node has red border
- Counterfactual panel: split-screen showing original timeline (top) vs. modified timeline (bottom), divergence point marked with gold vertical line
- Export: dropdown menu with format options (PNG, Annotated Replay, Share Link), exported artifact includes all visible panels as composed image

---

## Interaction Effects

**× Building Blocks (Rules/Hooks/Context Config):** The debrief's Decision Trace directly exposes the player's rule configuration — which rules fired, which conditions passed/failed, which hooks triggered. This creates a tight feedback loop: configure in the workbench → execute → diagnose in the debrief → reconfigure. The debrief must render rules/hooks/context using the same visual language as the workbench, so the player recognizes their own configuration in the diagnostic view.

**× Sealed Watch (4.02):** The two-act structure means the debrief UI must be clearly distinct from the sealed watch UI. The sealed watch is sparse and cinematic; the debrief must signal "analysis mode" through color palette shift (warm amber + analytical navy vs. the sealed watch's battlefield palette), different ambient audio, and the appearance of chrome (panels, buttons, overlays) that was absent during the watch.

**× Buffer Visualization (4.03):** The context window display in the debrief must be MORE detailed than the in-battle buffer bars. During battle, a thermometer or pip display shows fill level. In the debrief, each slot's content is readable — type, source, age, channel, whether it was used in a decision. The debrief is where the buffer becomes transparent.

**× Signal Genealogy (4.16):** The genealogy graph is an advanced debrief tool. It needs its own screen region and should be available as an overlay OR as a dedicated panel. Interaction: click a signal in the genealogy → board jumps to the tick that signal was sent → context window highlights that entry.

**× Campaign Progression (5.04):** The Growing Lens paradigm (F) means debrief complexity must be synchronized with campaign difficulty. If Mission 5 introduces the factory (new cognitive load), the debrief should NOT simultaneously introduce three new tools. One tool per mission transition.

**× Streaming/Content (6.09):** The Crime Scene (B) and Time Machine (D) paradigms are most streaming-friendly — board-dominant, visually dramatic, minimal chrome. The Debugger (A) is the least streaming-friendly. The Autopsy (E) creates the best narrative content — the guided backward trace IS a story that viewers can follow.

**× Competitive/Gauntlet:** The debrief in PvP mode must handle information asymmetry — should you see the opponent's full decision traces, or only your own units' perspective? Recommendation: own units only in the standard debrief; opponent inspection unlocked in a "post-season" detailed analysis view (with opponent consent in ranked play).

---

## Comparable Games — Key Lessons

| Game | Debrief Approach | Key Lesson for Robot Uprising |
|------|-----------------|-------------------------------|
| **Into the Breach** | No debrief — analysis is front-loaded | Robot Uprising's analysis is back-loaded; debrief IS the teaching surface |
| **Slay the Spire** | Simple score breakdown, no replay | Score screens don't teach — diagnostic tools do |
| **XCOM 2** | Emotional soldier lineup, no combat log | The emotional beat (sealed watch) should precede the analytical beat |
| **Frozen Synapse** | Opponent plan toggle post-match | The opponent plan reveal is the gold standard for "learning from mistakes" |
| **Zachtronics** | Multi-axis histograms | Multi-metric comparison prevents "single best" fixation |
| **StarCraft 2** | Full replay with perspective switching, 8+ stat overlays | Perspective switching is transformative; stat overload is real |
| **Chess (Lichess)** | Evaluation graph + move classification + branching analysis | The evaluation graph is the fastest match summary ever designed |
| **Factorio** | Real-time production graphs, primitive replay | Multi-timescale analytics (Factorio's 5s → 1000h) should inform signal analysis |

**The single most influential comparable:** Lichess's evaluation graph. A horizontal line showing advantage over time, with clickable navigation to any move. Robot Uprising's waveform timeline (Paradigm D) is the direct descendant of this design. The difference: Lichess evaluates positions; Robot Uprising evaluates signal flow, context pressure, and army coherence. The waveform is an evaluation graph for distributed systems.

---

## The TikTok Clip

**Paradigm E (Autopsy):** The clip opens on a dramatic elimination — three units die in two ticks. The "WHAT HAPPENED" panel slides up. The player clicks "trace back" — the board rewinds with a dramatic whoosh. Click again — further back. Click again — and there it is: a single misconfigured relay listening to the wrong channel, 20 ticks before the disaster. The causal chain renders: six nodes, six arrows, from "wrong listen config" to "total wipe." Text overlay: *"One wrong checkbox. Twenty ticks later, everything died."* The clip ends on the player returning to the workbench and unchecking one listen toggle. 15 seconds. The story writes itself.

**Paradigm D (Time Machine):** The waveform draws itself — calm, calm, calm, then SPIKE. The player drags the playhead to the spike. Board state shows the cascade. Cut to the player dragging the playhead back and forth across the spike, watching units flash in and out of existence. The scrubbing sounds like a record scratch. Text overlay: *"Finding the exact second my AI army fell apart."* Satisfying, visual, immediate.
