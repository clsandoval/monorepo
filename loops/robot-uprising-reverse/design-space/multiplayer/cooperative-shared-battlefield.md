# Co-Op: Shared Battlefield, Complementary Attention Architectures

**Aspect:** 7.02 — The foundational cooperative question: what does co-op look like when the game is about designing attention systems, not controlling units?

**Category:** multiplayer/cooperative
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising's co-op problem is fundamentally different from every cooperative game that exists. In most co-op games, players share control of *actions* — shoot this, build that, heal them. In Robot Uprising, players share control of *cognition* — what agents notice, remember, forget, and communicate. The cooperative unit is not a button press or a unit command. It is a design decision about information architecture.

This creates a design space that's almost entirely unexplored. No commercial game has shipped cooperative attention-system engineering. Gladiabots has no co-op mode at all. Screeps' cooperation is emergent (alliance diplomacy, not designed co-op). Factorio's co-op is spatial (different parts of the factory). StarCraft II's Archon Mode is temporal (macro player vs. micro player).

Robot Uprising needs co-op that is *architectural* — two brains designing one information system, where the division of labor isn't "you control the left half" but "you design the perception layer, I design the communication layer."

The fundamental question: **what is each player's unique, irreplaceable contribution to the shared attention architecture?**

---

## Six Co-Op Models

### Model A: "The Archon" (Shared Workbench, Full Access)

**How it works:** Two players sit at the same workbench with full access to every blueprint, every rule, every hook, every context config. Both cursors visible on screen. Both can edit anything. Like StarCraft II's Archon Mode but for configuration instead of real-time control.

**The session flow:**
1. Both players see the Plan screen simultaneously. The board is on the left. The workbench panel on the right shows a shared blueprint list.
2. Player A clicks on SCOUT-A's blueprint. Player B clicks on RELAY-B's blueprint. Both edit simultaneously in split config panels — Player A's panel occupies the top half of the workbench, Player B's the bottom half, each with a colored border (cyan for Player A, amber for Player B).
3. When Player A types a channel name in a hook config — say, "north-alert" — the channel immediately appears in Player B's autocomplete dropdown, glowing cyan to indicate it was just created by the other player. The channel map panel (auto-generated, read-only) updates in real time, showing wiring lines in both players' colors.
4. Either player can hit EXECUTE. A 3-second countdown gives the other player a chance to object (they see a pulsing "EXECUTE in 3... 2... 1..." overlay and can click CANCEL).
5. Sealed Watch plays identically for both — same board, same tick clock, same buffer bars. Both watch in silence. Both experience the same emotional arc.
6. Inspector is shared. Both players can click-to-inspect different units simultaneously. Player A's selection is highlighted cyan. Player B's is amber. If both click the same unit, their inspection panels stack.

**What the Plan screen looks like:**
The workbench panel is wider than single-player — it occupies 55% of the screen instead of 50%, with the board compressed slightly. Two blueprint tabs sit side by side at the top of the workbench: Player A's active blueprint (cyan tab, gently pulsing) and Player B's active blueprint (amber tab). Below, a shared production queue — both players can drag blueprints to reorder, with ghost units on the board color-coded to show which player placed them. A tiny avatar icon (Player A's profile pic / Player B's) appears in the bottom-left corner of each ghost unit.

The channel map panel — normally a quiet summary — becomes the co-op's central coordination tool. Every channel shows both the sender(s) and receiver(s), with color-coded lines: cyan for wiring Player A created, amber for Player B's, and a blended teal-gold for channels where both players contributed hooks. Hovering any channel name highlights ALL connected units on the board with a gentle pulse.

**Strengths:**
- **Zero learning overhead.** If you can play single-player, you can play Archon co-op. Same UI, same tools, just shared.
- **Emergent role division.** Like StarCraft II Archon Mode, players naturally gravitate to roles. One person becomes "the scout architect" and the other becomes "the relay network designer." This emerges from personality and preference, not enforced asymmetry.
- **Mentorship mode.** An experienced player can sit in the same workbench as a beginner, watching their configuration in real-time, offering suggestions without taking over. This is exactly how StarCraft II's Archon Mode was most valued — as a teaching tool that broke down the learning curve.
- **Full flexibility.** Any division of labor works. Split by unit type. Split by primitive (one player does rules, the other does hooks). Split by board region. Split by phase (one player configures, the other reviews).

**Weaknesses:**
- **Coordination overhead.** Two players editing the same channel namespace creates conflicts. Player A creates "alert" for scout-to-relay. Player B creates "alert" for relay-to-striker. Same channel name, different intended semantics. The architecture becomes confused.
- **Cursor chaos.** Two cursors on one workbench is visually noisy. Who's editing what? The colored borders help but don't solve the fundamental problem of shared mutable state.
- **Free-rider problem.** One player can do all the work while the other watches. In StarCraft Archon Mode, this manifested as one experienced player essentially soloing while the beginner observed.
- **No unique contribution.** Neither player has something only they can see or do. The co-op is purely social, not mechanical.

**The TikTok clip:** Split-screen of two friends on a couch, one leaning over the other's laptop, both pointing at the same screen. One types a channel name. The other's eyes widen as they see it appear in their autocomplete. They both turn to each other and start talking over each other excitedly. Text overlay: "We built the same idea from both ends and it connected."

**Comparable games:**
- **StarCraft II Archon Mode** — Shared army, shared base, emergent macro/micro split. Both players have full control. Works best as a mentorship tool. Population quickly fizzled for competitive play because the coordination overhead exceeded the benefit for equally-skilled players. The mode succeeded specifically for skill-gap pairs.
- **Factorio multiplayer** — Shared factory, emergent spatial division. One player builds the smelting array while the other designs the circuit network. No enforced roles. The game's complexity naturally distributes work across players.

---

### Model B: "The Specialist" (Asymmetric Primitive Access)

**How it works:** Each player controls a different subset of the four primitives. Player A controls **Skills** and **Rules** (what agents can do and how they decide). Player B controls **Hooks** and **Context Config** (how agents communicate and what they remember). Both see the full workbench, but the other player's primitives are read-only — visible, annotated, but not editable.

**The mechanical split:**

| Primitive | Player A ("The Behaviorist") | Player B ("The Networker") |
|-----------|-------------------------------|-------------------------------|
| Skills | ✅ Full control | 👁 Read-only |
| Rules | ✅ Full control | 👁 Read-only |
| Hooks | 👁 Read-only | ✅ Full control |
| Context Config | 👁 Read-only | ✅ Full control |

**The session flow:**
1. Both players see the Plan screen. The workbench splits vertically. Player A's half (left, cyan) shows Skills and Rules config panels. Player B's half (right, amber) shows Hooks and Context Config panels. A thin dividing line — a glowing seam, gently pulsing — separates them.
2. Player A selects SCOUT-A and toggles `patrol: ON`, then drags a rule into position: `IF enemy_detected → use evade`. They can see but not edit SCOUT-A's hooks and buffer config on Player B's side — shown in a muted amber with a small lock icon.
3. Player B notices Player A has given SCOUT-A an evade skill. They configure SCOUT-A's hooks: `WHEN evade_triggered → EMIT on channel "danger-north"`. They set the buffer to prioritize enemy observations (context config: `priority: [enemy, signal, terrain]`). Player A sees this appear on their read-only view — a muted cyan hook icon appearing next to the scout's evade rule.
4. The channel map becomes the diplomatic zone. Both players contribute to it — Player B creates channels through hooks, but Player A's rules determine *when* those hooks fire. The causal chain crosses the player boundary: Player A's rules trigger Player B's hooks.
5. Before EXECUTE, a "Ready Check" replaces the countdown. Both players must independently press READY. A split progress bar fills from both sides — cyan from left, amber from right — meeting in the middle with a satisfying *click* when both are ready.

**What the Plan screen looks like:**
The workbench panel is divided by a luminous seam — a vertical line of gently breathing light, thicker than a border, almost like a membrane between two cell halves. Player A's side has a cool cyan wash with Skills/Rules section headers. Player B's side has warm amber with Hooks/Context Config headers. When one player makes a change, the seam briefly ripples — a wave of light traveling from the active side toward the other, indicating "something changed over there."

Read-only panels are rendered at 70% opacity with a subtle diagonal hatch overlay — clearly visible and readable, but unmistakably not yours. Hovering a read-only element shows a tooltip: "Configured by [Player A/B]" with a timestamp.

On the board, ghost units show split feedback. Perception radii (set by context config — Player B's domain) render in amber. Patrol paths (set by rules — Player A's domain) render in cyan. Where they overlap — a scout's patrol path inside its own perception radius — the colors blend into a shimmering teal.

**Strengths:**
- **Genuine interdependence.** Player A's rules are meaningless without Player B's hooks to wire them to other agents. Player B's hooks fire on conditions that only exist because Player A wrote rules that create them. Like Deep Rock Galactic's class system, each player's contribution is *deliberately incomplete* without the other.
- **Forces communication.** "I'm giving the scout an evade rule, can you wire a hook that emits on 'danger' when it triggers?" This sentence IS the game. The conversation between players mirrors the conversation between agents.
- **Teaches the full primitive set.** In single-player, it's tempting to ignore context config or underuse hooks. In Specialist co-op, each player MUST master their half. This is inherently pedagogical.
- **Prevents free-riding.** Both players must actively contribute for the architecture to function. A config with skills and rules but no hooks is deaf. A config with hooks and context but no rules is paralyzed.
- **Natural to explain.** "You decide what they can do. I decide what they remember and who they talk to." One sentence describes the entire co-op structure.

**Weaknesses:**
- **The handoff problem.** Rules and hooks are deeply intertwined. A rule that says `IF signal_type == "enemy_spotted" → use engage` only works if a hook delivers that signal type. If Player A writes rules expecting signals Player B hasn't wired, the architecture fails silently. The failure only surfaces during Sealed Watch as confused agents — and the debrief becomes a blame-assignment exercise.
- **Asymmetric complexity.** Hooks and Context Config are arguably harder to understand than Skills and Rules. The "Networker" role requires more systems thinking. This creates a skill-gap within the co-op pair.
- **Fixed roles.** What if both players want to design hooks? The enforced split prevents natural interest-based collaboration. Mitigation: let players swap roles between missions.
- **Inspector tension.** In debrief, whose "fault" is a failure? If a scout saw an enemy but didn't report it, is that a missing rule (Player A's fault for not writing `IF enemy_detected → emit`) or a missing hook (Player B's fault for not wiring the emission)? The answer depends on whether you think emission is a rule consequence or a hook configuration — and the game's architecture says it's a hook, but the mental model says it's a behavior.

**The TikTok clip:** Two players sit side by side. Player A says "I made the scout run away from enemies." Player B says "I made it scream when it runs." Cut to Sealed Watch: a scout spots an enemy, evades, emits a signal, three strikers converge from different directions. Both players leap up, pointing at the screen. Text: "She built the legs. I built the voice. The army built itself."

**Comparable games:**
- **Keep Talking and Nobody Explodes** — Asymmetric information is the core mechanic. One player sees the bomb, the other reads the manual. The game IS communication. Robot Uprising's Specialist model creates a similar split: one player sees behavior, the other sees communication. Steel Crate Games' GDC talk emphasized that they refined puzzles to "keep players talking" — the communication IS the gameplay, not a side channel.
- **We Were Here** — Each player sees different halves of a puzzle. Neither can progress alone. The "answer" only exists in the space between them. Robot Uprising's Specialist model creates the same dynamic: the complete architecture exists in the space between Skills/Rules and Hooks/Context.
- **Lovers in a Dangerous Spacetime** — Multiple ship stations (engines, shields, weapons, map), not enough crew. Players must physically move between stations and implicitly negotiate who handles what. The role division is spatial and temporal, not permanent — but the feeling of "you're on shields, I'm on weapons" maps directly.

---

### Model C: "The War Room" (Asymmetric Information — Analyst + Architect)

**How it works:** Player A ("The Architect") has the Plan screen with full configuration access but NO access to the Inspector after battles. Player B ("The Analyst") has FULL Inspector access and debrief tools but CANNOT directly edit blueprints — they can only annotate, highlight, and suggest. The Architect builds. The Analyst diagnoses. Communication bridges the gap.

**The session flow:**
1. **Mission briefing:** Both players see the mission description and board layout.
2. **Plan phase:** Player A has the full workbench. Player B sees a read-only view of Player A's configuration plus a notepad panel where they can write freeform notes, circle areas on the board, and pin suggestions to specific blueprint fields. Player B's annotations appear as small amber pins on Player A's workbench — hovering reveals the note. Player A can dismiss or acknowledge each pin with a ✓ or ✗.
3. **Execute:** Both watch the Sealed Watch together. Same experience — no tools, no pause, pure observation.
4. **Debrief:** Player B enters the full Inspector — timeline scrubber, click-to-inspect, queue depth charts, signal genealogy, everything. Player A sees only the board replay with basic playback controls (play, pause, step) but NO analytical tools. Player A can watch the battle but can't see buffer states, signal traces, or diagnostic overlays.
5. **The Conversation:** Player B must verbally communicate their analysis to Player A. "Look at tick 34 — RELAY-B's buffer was full when the scout's signal arrived. It got dropped. The strikers never got the alert. We need to increase RELAY-B's buffer size or add a filter to drop low-priority terrain observations." Player A takes this information and redesigns.
6. **Next attempt:** Player A configures based on Player B's diagnosis. The cycle repeats. Build → Watch → Diagnose → Communicate → Rebuild.

**What Player A's Plan screen looks like:**
The standard Plan screen, but with a "suggestion tray" at the bottom — a horizontal strip showing Player B's annotation pins as small amber cards. Each card shows a brief note and points to a specific blueprint field or board location. A counter in the corner: "3 suggestions pending." When Player A hovers a pin, a dotted amber line extends from the pin to the relevant element on the workbench or board. Acknowledged pins (✓) dim to 30% opacity and slide to the right. Dismissed pins (✗) dissolve with a soft crumple sound.

**What Player B's Inspector looks like:**
The full Inspector with one addition: a "Share" button on every analytical element. Player B can tap Share on a queue depth chart, a buffer state snapshot, or a signal trace — this creates a "diagnostic card" that appears in Player A's suggestion tray on the next Plan phase. The diagnostic card is a static screenshot of the analytical element at that specific tick, with Player B's handwritten annotation overlaid. It's a visual artifact of the analysis — not interactive, just an image with notes.

**Strengths:**
- **"Keep Talking" energy.** This is the most verbally active co-op model. The Analyst must translate visual data into words. The Architect must translate words into configuration changes. The conversation IS the gameplay — exactly the dynamic that made Keep Talking and Nobody Explodes a phenomenon. Steel Crate Games found that asymmetric information "keeps players talking in ways that encourage tension, mistakes, hilarity, and camaraderie."
- **Teaches the debrief cycle.** Many single-players skip the Inspector or glance at it superficially. In War Room co-op, the entire second player's role IS the Inspector. They're forced to develop deep analytical skills because their partner depends on them.
- **Natural player archetypes.** Some people love building. Some people love analyzing. This co-op lets each player do what they're best at. The builder builds. The analyst analyzes. Neither has to do the thing they find tedious.
- **Emotional rollercoaster design.** The Sealed Watch is a shared emotional peak. Then the Inspector splits them — Player B dives into data while Player A anxiously waits for the diagnosis. Then the conversation reconnects them. This creates a rhythm: together → apart → together → apart, with each reunion carrying new information.
- **Streaming gold.** Two-camera stream setup: one camera on the Architect's face during the diagnosis conversation, one on the Analyst's Inspector screen. The audience sees the analysis happening while watching the Architect's reaction in real-time.

**Weaknesses:**
- **Player B might get bored during Plan phase.** If Player A is a slow deliberator, the Analyst sits waiting, making notes but unable to directly contribute. Mitigation: give the Analyst a "replay library" of previous attempts to re-analyze while the Architect works.
- **Miscommunication is punishing.** If the Analyst misidentifies the problem, the Architect redesigns the wrong thing, and the next attempt fails for the same reason. The failure feedback loop is slow (build → watch → diagnose → communicate → rebuild → watch again).
- **Hard to implement for remote play.** The model assumes voice communication. Without voice, the annotation pins become the only communication channel, which is too thin for complex diagnostic conversations.
- **Roles feel unequal.** The Architect has agency (they make changes). The Analyst has information (they see data). Many players will feel the Architect's role is "more fun" because it involves active creation, while the Analyst is "just watching and talking." This is the asymmetric co-op balance problem that plagues many such designs.

**The TikTok clip:** Player B is staring at the Inspector, eyes widening. They turn to Player A: "It's the relay. Tick 22. The buffer was full of terrain data. The enemy alert arrived at tick 23 and got DROPPED." Player A's hands fly across the keyboard, reconfiguring. Cut to: the next Sealed Watch. Same scout spots the same enemy. This time the relay compresses, forwards, and the strikers converge. Both players erupt. Text: "She's the eyes. I'm the hands."

**Comparable games:**
- **Keep Talking and Nobody Explodes** — The gold standard. One player sees the bomb (the "doing"). The other reads the manual (the "knowing"). Robot Uprising's War Room creates the same split: one player sees the data, the other does the building. 98% positive on Steam with 200k+ sales proves the asymmetric information co-op model has massive audience appeal.
- **Pandemic** — One player often becomes the "strategist" who sees the board state and suggests moves, while others execute. Pandemic's co-op is often criticized for "alpha player" problems — one dominant voice directing others. War Room model avoids this by making the "alpha" unable to touch the controls.
- **Blind accessibility co-op games** — Games like "A Blind Legend" where a sighted player guides a blind player. The information asymmetry IS the game. War Room creates a similar (voluntary) asymmetry — the Analyst can see but not touch, the Architect can touch but not see (the deep data).

---

### Model D: "The Divided Front" (Split Battlefield, Separate Architectures)

**How it works:** The 8x8 board is divided into two theaters. Player A controls units and blueprints on the west half (columns A-D). Player B controls the east half (columns E-H). Each player has their own workbench, their own blueprints, their own production queue. But the enemy doesn't respect the boundary — threats move freely across the whole board. The players' units CAN communicate across the boundary via shared channels.

**The mechanical split:**

| Element | Player A (West) | Player B (East) |
|---------|-----------------|-----------------|
| Board territory | Columns A-D | Columns E-H |
| Blueprints | Own set | Own set |
| Production queue | Own queue, own base | Own queue, own base |
| Resources | Own income (from tagged cells in own territory) | Own income |
| Channels | Can create + listen to any channel | Can create + listen to any channel |
| Units | Own units only (can't configure partner's) | Own units only |

**The session flow:**
1. **Plan phase:** Split screen. Player A's workbench on the left, Player B's on the right. The board is displayed twice — once in each player's view — but with different overlays. Player A sees their ghost units, perception radii, and patrol paths on their half. Player B sees theirs. The *other* player's existing units appear as dimmed silhouettes with a small "?" marker — you know they're there, but you can't see their configuration.
2. **The crucial decision:** Channels are shared. If Player A creates a hook on SCOUT-A that emits on channel "enemy-east", and Player B has STRIKER-B listening on "enemy-east", the scout will alert the striker across the boundary. But this only works if both players agree on the channel name and signal semantics. The channel map panel becomes a shared coordination space — the only UI element both players can see in full.
3. **Execute:** One shared Sealed Watch. Both players see the full board. Units from both players are visually distinct — Player A's units have cyan trim, Player B's have amber trim. When a cross-boundary signal fires, the delivery flash traces a visible arc across the board seam — a thin line of light connecting the sender to the receiver, crossing the faint boundary line between columns D and E.
4. **Inspector:** Both players can inspect any unit (theirs or the other player's). But when inspecting a partner's unit, they see the buffer state but NOT the full configuration (rules and hooks are hidden behind a "Classified" overlay). They can see *what* the unit did but not *why* it was configured to do that.

**What the shared Sealed Watch looks like:**
The board's center seam — between columns D and E — is rendered as a faint dashed line, barely visible, suggesting rather than enforcing the boundary. Player A's units have a subtle cyan underglow. Player B's have amber. When everything works — when a scout on the west detects an enemy moving east and emits a cross-boundary signal that reaches an eastern striker just in time — the signal's delivery arc traces a beautiful parabolic curve of light across the seam. Green flash on both sides. Both players feel it.

When it fails — when the eastern flank collapses because the western scout's signal arrived too late, one tick after the striker was already eliminated — the absence is visible as a grayed-out delivery arc that flickers and fades. A ghost of what should have been.

**Strengths:**
- **Scales the game's complexity.** A single player managing 8 columns of units is already complex. Two players each managing 4 columns keeps the cognitive load manageable while the total system grows.
- **Cross-boundary signals are the magic.** The moment two players' separate architectures start talking to each other through shared channels, emergent behaviors appear that neither player designed alone. This is the core Robot Uprising fantasy — "I didn't program this" — amplified by "WE didn't program this."
- **Teaches real distributed systems.** Two separate systems communicating via message channels, each with their own latency and failure modes. This is literally microservices architecture. The game teaches distributed systems thinking through play.
- **Independent but interdependent.** Each player can succeed on their half independently — for a while. But as enemies cross boundaries and threats escalate, cross-boundary communication becomes essential. The game starts independent and becomes interdependent as difficulty rises.

**Weaknesses:**
- **Board is too small.** An 8x8 grid divided into two 4×8 halves gives each player very little room. With multiple units, scouts patrolling, relays stationed — 32 cells per player is tight. Mitigation: increase board size for co-op (10x8 or 12x8).
- **Asymmetric difficulty.** If enemies concentrate on one half, that player faces the full assault while the other is idle. Mitigation: enemy AI that distributes pressure across both halves.
- **Channel naming coordination problem.** Same as Archon mode — players need to agree on channel names and signal semantics. But here it's worse because they can't see each other's configurations. A channel called "alert" might mean different things to each player.
- **The seam becomes a crutch.** Players might learn to be self-sufficient within their half, never bothering with cross-boundary communication. The game must create pressure that REQUIRES cross-boundary signals (enemies that can only be detected by one side but only killed by the other).

**The TikTok clip:** Top-down view of the full board. Left half, cyan units patrolling. Right half, amber units guarding. An enemy appears in column C (west). A cyan scout spots it, emits. A bright arc of light crosses the center seam. An amber striker on the east side pivots and charges west, crossing the boundary. Kill flash. Both players' camera feeds in picture-in-picture: simultaneous "YESSSS." Text: "My scout saw it. Her striker killed it. Neither of us told them to do that."

**Comparable games:**
- **Factorio multiplayer** — Players naturally split the factory spatially. "I'll handle smelting, you handle circuits." The factory's internal logistics (belts, trains) connect their separate work. Robot Uprising's channels are the equivalent of Factorio's transport belts connecting two players' sub-factories.
- **StarCraft II Allied Commanders (Co-op Missions)** — Each player picks a commander with unique units and abilities. Shared battlefield. Both armies fight the same enemies. Players naturally divide the map spatially. But unlike Robot Uprising, both players have real-time control — there's no "configure then watch" loop.
- **Portal 2 Co-op** — Separate characters on a shared map. Each player has their own portal gun. Solutions require both players' portals working together. The "separate tools, shared space" dynamic maps to "separate architectures, shared battlefield."

---

### Model E: "The Relay" (Asymmetric Screens — Commander + Observer)

**How it works:** Player A ("The Commander") has a full Plan screen but a degraded Sealed Watch — they see the board at reduced resolution, with fog of war covering areas outside their units' aggregate perception. Player B ("The Observer") has NO Plan access but sees a PERFECT Sealed Watch — full board visibility, all buffer bars, all signal deliveries, all emissions. During battle, Player B can send real-time pings and one-word annotations that appear as floating markers on Player A's degraded view.

This inverts the normal game loop: Player A designs blind to the full picture. Player B sees everything but controls nothing. Between battles, Player B describes what they saw and Player A redesigns.

**The session flow:**
1. **Plan phase:** Player A configures normally. Player B sees a "mission briefing" view — board layout, enemy placements, terrain — but NOT Player A's configurations. They can study the battlefield and prepare by marking zones: "enemies will likely come from here," "good relay position here." These marks appear as amber terrain annotations on Player A's board.
2. **Execute (Sealed Watch):** Player A's screen shows fog-of-war — they can only see what their units' aggregate perception covers. Areas outside vision are dark, covered by a noise-static overlay. Player B's screen shows EVERYTHING — full board, all units (friendly and enemy), all buffer states rendered as tiny colored bars, all signal arcs visible. Player B has a ping tool: click anywhere on the board to place a floating ping marker that appears on Player A's view for 3 seconds. They can also type one-word messages (max 8 characters) that float above the ping location.
3. **The tension:** Player A watches their units do something unexpected in fog. They hear a combat flash sound effect from off-screen. Was that their unit dying or killing? Player B knows — they saw it happen. Player B pings the location: "SAFE" floats above the fog. Or "LOST" floats there instead. Player A's gut drops.
4. **Inspector:** Both players enter the Inspector together. Now Player A sees the full picture for the first time. The fog lifts. They can scrub the timeline and see what was happening in the dark zones while they were blind. Player B can annotate the timeline: "WATCH THIS" markers at specific ticks.
5. **Redesign:** Player A reconfigures based on the full-information debrief. Player B prepares new battlefield annotations for the next attempt.

**What Player A's degraded Sealed Watch looks like:**
The board is partially obscured. Cells within friendly unit perception radii are bright, rendered normally — checkerboard tiles, unit icons, buffer bars visible. Cells OUTSIDE perception are dark, overlaid with animated static — television snow, but rendered in the game's pixel art style. The static isn't uniform; it's slightly denser near the fog boundary and thinner far away, creating a gradient of uncertainty. Sound effects from unseen events are audible but spatially indeterminate — a combat flash *somewhere* in the static, but where exactly?

Player B's pings appear as floating amber diamonds that phase through the static. A one-word message renders below the diamond in a blocky, degraded font — as if the message itself is fighting through the noise. Pings in visible areas are crisp and clear. Pings in fog are jittery, slightly misaligned, as if the communication channel has its own latency. The visual language mirrors the game's core theme: information degrades with distance and noise.

**What Player B's perfect Sealed Watch looks like:**
Everything. The full board in pristine clarity. Player A's units in cyan, enemies in red, with full buffer bars on every unit. Signal delivery arcs rendered as thin colored lines. EM emission clouds rendered as soft circles of noise around transmitting units. It's the "god view" — all information, zero interaction. Player B watches the same battle as Player A but sees the complete truth while Player A sees shadows.

The ping tool is a simple crosshair that follows Player B's cursor. Click to place. Type a word. The ping appears on both screens simultaneously — but pristine on Player B's screen and degraded on Player A's.

**Strengths:**
- **Maximum emotional asymmetry.** Player A is anxious, blind, hopeful. Player B is omniscient, helpless, desperate to communicate. The co-op creates emotional experiences that solo play CANNOT replicate. When Player A hears a combat flash in the fog and Player B urgently pings "RUN" — that moment is pure cooperative adrenaline.
- **Teaches information architecture viscerally.** Player A literally experiences what it's like to have limited perception. The fog-of-war IS the buffer constraint made real. "I didn't configure enough scouts and now I can't see the east flank" isn't an abstract debrief conclusion — it's a lived experience of blindness during the battle.
- **The reveal is cathartic.** When the Inspector loads and Player A sees the full board for the first time — everything they missed, every enemy movement in the dark, every signal that arrived just too late — the emotional impact is enormous. It's the sealed-replay tension mechanic, amplified by an entire session of uncertainty.
- **Ping communication mirrors signal design.** Player B's constrained pings (location + one word) mirror the game's own signal system. Messages are lossy. Bandwidth is limited. Player B must compress complex battlefield awareness into tiny packets — exactly the design challenge the player's units face. The co-op mechanic IS the core mechanic.

**Weaknesses:**
- **Player B may feel powerless.** Watching a disaster unfold with perfect information but zero ability to prevent it is frustrating. The pings help but can't solve fundamental configuration problems. Player B becomes a spectator of failures they can see but not fix.
- **Fog-of-war changes the game fundamentally.** The locked Sealed Watch design has no fog of war — the player sees everything. Adding fog for co-op creates a substantially different game that needs separate balancing, separate mission design, separate enemy AI.
- **Implementation complexity.** Dual rendering paths (fogged and clear) for the same battle. Ping networking. Spatial audio with fog occlusion. This is the most technically complex co-op model.
- **Only works with voice.** Without real-time voice communication, the ping-only channel is too thin for complex coordination. And voice adds latency — by the time Player B sees the threat and pings, the tick has already resolved.

**The TikTok clip:** Split screen. Left: Player A's fogged view, dark areas everywhere, a single scout visible in a bright patch. Right: Player B's full view, three enemies converging on the scout from different directions. Player B's hands slam the mouse: PING. "RUN." On Player A's screen, the amber diamond appears in the static. Player A's scout evades. Both players exhale simultaneously. Text: "She could see. I could only trust."

**Comparable games:**
- **Submarine games (UBOAT, Cold Waters)** — The captain sees instruments and sonar. The crew sees raw data. Communication between stations IS gameplay. Robot Uprising's Relay model creates a similar dynamic between full-information observer and limited-information operator.
- **Space Station 13** — Radically asymmetric roles where the AI player sees the full station and can communicate via text/PA system but has limited physical interaction. The tension between omniscience and impotence.
- **Escape room co-ops** — One player inside the room, one on comms with a walkie-talkie. The outside player has the manual/maps but can't touch anything. Pure information asymmetry.

---

### Model F: "The Shift" (Temporal Split — Designer + Tuner)

**How it works:** Players take turns. Player A designs the initial architecture from scratch. Then Player B receives it and can ONLY make tuning adjustments — reorder rules, adjust context config sliders, rename channels, toggle skills on/off. But Player B CANNOT add new rules, new hooks, new units, or new blueprints. Player B is a tuner, not a designer. Then they execute. In the debrief, roles swap — Player B sees the Inspector and designs fixes for the next attempt, while Player A becomes the tuner.

**The session flow:**
1. **Odd attempts (1, 3, 5...):** Player A has full Plan access. They design from scratch or rebuild. Player B watches (read-only) and can leave comments. Player A hits SUBMIT.
2. **Tuning phase:** Player B receives Player A's architecture. The workbench shows all configurations with a "TUNING" banner. Rules can be reordered (drag) but not added or deleted. Skills can be toggled but not replaced. Context config sliders can be adjusted. Channel names can be renamed. But no new hooks, no new rules, no new blueprints. Player B adjusts within the constraints of Player A's design.
3. **Execute.** Both watch Sealed Watch.
4. **Even attempts (2, 4, 6...):** Roles swap. Player B has full Plan access. Player A tunes.

**Strengths:**
- **Forces architectural respect.** The tuner must work within the designer's framework. They learn to appreciate WHY certain rules exist by trying to adjust rather than replace them. This teaches the difference between architectural decisions and parameter tuning — a real-world engineering skill.
- **Prevents "nuke and rebuild."** Many players' instinct after failure is to tear everything down and start over. The tuning constraint forces incremental improvement — change one thing, test, change another. This is better engineering practice.
- **Creates natural conversation.** "Why did you order the rules this way?" "Because if evade fires before patrol..." The designer must explain their reasoning to the tuner, which clarifies their own thinking.
- **Scales to any skill gap.** The experienced player designs, the beginner tunes. The beginner learns by adjusting rather than building from scratch. When roles swap, the beginner's design reveals what they've learned.

**Weaknesses:**
- **Tuning is boring.** If the architecture is fundamentally wrong, no amount of tuning saves it. The tuner can tell the design is broken but can't fix it. They wait until the next attempt when roles swap.
- **Turn-based is slow.** Each attempt requires two sequential phases (design then tune). Single-player iterates faster.
- **Role swap confusion.** Players build different mental models of the architecture. When Player B redesigns on their turn, they may contradict Player A's intentions. The architecture oscillates between two competing visions.

**The TikTok clip:** Player A builds an elaborate architecture. Hands it off. Player B stares at it, slowly moves one rule from position 3 to position 1. That's it. One change. EXECUTE. The battle plays out perfectly. Player A's jaw drops. Player B leans back: "You had the right pieces. Just the wrong order." Text: "The tuner saw what the designer couldn't."

**Comparable games:**
- **Turing Complete / MHRD** — Digital logic puzzle games where one player might design a circuit and another debugs/optimizes it. The "hand it off and tune" pattern is common in hardware design.
- **Music production** — Producer creates the track, mixing engineer refines levels and EQ without changing the composition. The Shift model is mixing engineering for attention architectures.

---

## Cross-Model Comparison Matrix

| Dimension | A: Archon | B: Specialist | C: War Room | D: Divided Front | E: Relay | F: Shift |
|-----------|-----------|---------------|-------------|-------------------|----------|----------|
| **Mechanical interdependence** | None (social only) | High (primitives split) | Medium (info split) | Medium (spatial + channels) | Low (info asymmetry) | Medium (design + tune) |
| **Communication intensity** | Low-Medium | High | Very High | Medium | Very High (during battle) | Medium |
| **Accessibility floor** | Very low | Medium | Medium | Low | High (fog changes game) | Low |
| **Skill ceiling** | Same as solo | Higher (coordination) | Much higher (diagnosis quality) | Higher (cross-boundary) | Different axis entirely | Slightly higher |
| **Streaming appeal** | Low (looks like solo) | Medium | Very High | High | Very High | Medium |
| **Implementation complexity** | Low | Medium | Medium | High (larger board) | Very High | Low |
| **Teaching effectiveness** | Low | High (forces mastery of half) | High (forces debrief) | High (distributed systems) | Very High (visceral perception) | High (design vs. tune) |
| **Fun for unequal skill levels** | Yes (mentorship) | Risky (harder role) | Yes (natural roles) | Yes (independent halves) | Yes (observer can be anyone) | Yes (tuner role is gentler) |
| **Preserves sealed watch** | ✅ Fully | ✅ Fully | ✅ Fully | ✅ Fully | ⚠️ Modified (fog) | ✅ Fully |
| **TikTok clip quality** | Medium | High | Very High | Very High | Extremely High | High |

---

## Interaction Effects

### Co-op × Building Blocks
- **Specialist model (B)** only works if the four primitives are clearly separable. If skills implicitly create rules (e.g., patrol auto-generates a movement pattern), the Behaviorist/Networker split blurs. The primitives must be cleanly orthogonal for Specialist co-op to function.
- **All models** benefit from visual building blocks (cards, drag-and-drop lists) because both players need to quickly read each other's configurations. Node-graph paradigms are harder to communicate verbally than priority lists.

### Co-op × Sealed Watch
- The locked "no skip, no pause, no tools" Sealed Watch rule is CRITICAL for co-op. It forces both players to share the same emotional experience simultaneously. If one player could skip ahead, the shared tension evaporates.
- **Model E (Relay)** modifies the Sealed Watch fundamentally with fog-of-war. This is the only model that breaks the "both players see the same thing" principle. It should be carefully evaluated — is the emotional asymmetry worth the departure from locked design?

### Co-op × Inspector
- **Model C (War Room)** makes the Inspector a first-class co-op mechanic instead of a solo analysis tool. The Inspector becomes a *communication interface* — the Analyst reads it and translates it into words. This elevates the Inspector's importance and might inform single-player Inspector design.
- **Model D (Divided Front)** creates an Inspector where you can spy on your partner's units' buffer states but not their configuration. This introduces a trust/transparency design question.

### Co-op × Campaign
- Co-op missions likely need separate design from single-player missions. A mission balanced for one brain managing 5 units is too easy for two brains managing 5 units each.
- **The handoff problem:** If players can only play co-op when both are available, campaign progress stalls. Solution options: allow either player to continue solo (with the co-op partner's last configuration frozen as a "ghost" partner), or separate co-op campaign from single-player campaign entirely.

### Co-op × Production (Factory Model)
- **Model D (Divided Front)** gives each player their own base and production queue. This scales naturally — each player manages their own economy.
- **Models A, B, C** share a single production queue. Who decides build order? The production queue becomes a negotiation space — both players want different units next.
- Resource sharing vs. splitting changes the co-op's economic dynamics completely. Shared resources create competition within cooperation (Factorio's classic "you used all the iron plates" moment). Split resources create independence but lose the "shared sacrifice" feeling.

### Co-op × EM Emissions
- In **Model D**, cross-boundary signals create EM noise that enemies can detect. Two players' combined emission footprint is louder than either alone. The co-op's communication architecture is also its vulnerability — talking across the boundary makes both players visible. This creates a beautiful design tension: communicate and risk detection, or stay silent and fight blind.

### Co-op × Onboarding
- Co-op could BE the tutorial. Model A (Archon) with an experienced player IS a tutorial — the mentor configures alongside the learner, demonstrating rather than instructing.
- Model C (War Room) naturally teaches the debrief cycle because the Analyst's ONLY job is to use the Inspector. After co-op sessions, players return to single-player with stronger debrief habits.
- The co-op vocabulary ("my channel," "your hook," "our architecture") reinforces the game's core terminology through social use.

### Co-op × PvP
- 2v2 co-op PvP is the natural extension. Each team uses one of the co-op models internally while competing against another team. This creates a meta-layer: not just "which architecture is better" but "which co-op model produces better architectures."
- **Model B (Specialist)** in 2v2 creates four distinct roles: two Behaviorists and two Networkers on opposite sides. The Behaviorist designs rules to exploit the enemy Behaviorist's patterns while the Networker designs hooks to intercept the enemy Networker's channels.

---

## Player Journeys

#### Journey: Tomás (22) and Kenji (24), College Roommates — Model B (Specialist) First Session

**Context:** Mission 5, first factory mission. Both have played the single-player tutorial (Missions 1-4) separately. This is their first co-op session. Tomás plays The Behaviorist (Skills + Rules). Kenji plays The Networker (Hooks + Context Config).

**Minute 0:00 — The Split Workbench Appears**
Tomás sees the Plan screen with the luminous seam dividing the workbench. His side (left, cyan) shows Skills toggles and Rules editor for SCOUT-A. Kenji's side (right, amber) shows Hooks and Context Config panels — currently empty for the new blueprint. The board on the left shows their base in the bottom-left corner and two enemy bases at the top-right and top-left. Ghost previews of the production queue float on the board — a scout outline pulsing at their base's spawn point.

Tomás: "Okay, I'll set up a basic scout. Patrol, evade, standard stuff."
Kenji: "Cool, I'll wire it to broadcast when it sees something."

Tomás clicks SCOUT-A's Skills panel. Toggles `patrol: ON`. Drags a rule into position 1: `IF enemy_detected AND distance > 3 → continue patrol`. Position 2: `IF enemy_detected AND distance ≤ 3 → use evade`. The ghost scout on the board projects a wide perception radius (5 cells) in cyan. A patrol path traces a dotted cyan line along columns A-D.

**Minute 1:30 — The First Cross-Boundary Moment**
Kenji configures SCOUT-A's hooks. He types a channel name: `danger-north`. The channel appears in the auto-generated channel map — a single amber line floating in space, connected to nothing on the other end yet. He sets the hook: `WHEN enemy_detected → EMIT on danger-north`. Then he opens Context Config: buffer size 6 (standard for scout), priority `[enemy, terrain, signal]`, eviction: `oldest-first`.

Tomás watches Kenji's hooks appear as muted amber icons next to his rules. He sees the `danger-north` channel in the shared channel map panel. "Wait — the scouts will only broadcast if they detect an enemy, right? What if I make the rule fire evade AND you make the hook fire the emission? Do both trigger on the same condition?"

Kenji pauses. Looks at the seam between their panels. "Uh... I think so? The hook fires when the condition is met. The rule fires when the condition is met. They're independent?"

This is the moment. They're discovering the primitive orthogonality through play. Rules control behavior. Hooks control communication. Both react to the same buffer state but produce different outputs. The seam between their panels isn't just visual — it represents a real architectural boundary.

**Minute 3:00 — The Relay Problem**
Tomás creates STRIKER-A. Skills: `engage: ON`. Rules: `IF signal_type == "enemy_detected" → move toward signal_source`. He looks at the channel map. His striker is configured to react to signals... but signals come through hooks, which are Kenji's domain. "Hey, the striker needs to listen to `danger-north`. Can you set that up?"

Kenji nods. Opens STRIKER-A's Context Config. Sets `listen: [danger-north]`. The channel map updates: a line now connects SCOUT-A to STRIKER-A through the `danger-north` channel, drawn half in amber (Kenji's hook on the scout) and half in amber (Kenji's listen config on the striker). But the STRIKER-A's rule — Tomás's cyan — expects a specific signal type. "What signal type does the scout emit? I need to match it in the rule."

They both stare at the screen. Tomás can see Kenji's hook configuration (read-only, amber, muted) on SCOUT-A. The hook says `EMIT on danger-north` with signal contents `{type: "enemy_detected", source: current_position}`. Tomás reads this and adjusts his rule on STRIKER-A: `IF signal_type == "enemy_detected" → move toward signal.source`. The types match. The architecture is coherent.

The channel map now shows a complete pipeline: SCOUT-A → `danger-north` → STRIKER-A. The line pulses gently. Both players feel it click into place.

**Minute 5:00 — The Ready Check**
They've configured three blueprints: a scout (patrol + danger broadcast), a relay (compress + forward), and a striker (engage on signal). The production queue has scout first, then relay, then striker. Both press READY. The split progress bar fills from both sides — cyan from left, amber from right. They meet in the middle with a soft *chime*. The board transitions to Sealed Watch.

**Minute 5:15 — The Sealed Watch**
Tick 1. Their scout spawns. It begins patrolling north. Buffer bar: one slot filled with terrain data.
Tick 4. Scout spots an enemy at D7. Buffer fills: two enemy observations. Tomás's rule fires: distance is 4, so `continue patrol` applies. Simultaneously, Kenji's hook fires: `EMIT on danger-north`. A green signal flash traces from the scout.
Tick 5. Signal travels. The relay hasn't spawned yet. The signal reaches... nothing. No receiver on `danger-north` yet. The signal dissipates. A dim amber flash where it dies — the visual language of an undelivered message.

Tomás: "Wait — the relay isn't built yet! The signal just went into nothing!"
Kenji: "I set the listen config but the unit doesn't exist on the board yet!"

This is the production timing lesson. They've designed a perfect architecture that fails because the units spawn in the wrong order. The fix is obvious: swap relay and scout in the production queue, or accept the early-game vulnerability.

**Minute 7:00 — The Inspector**
Both enter the Inspector. Tomás immediately clicks tick 5 in the timeline. He can see the signal delivery visualization — a dashed green line from SCOUT-A to... empty space. The queue depth chart shows SCOUT-A's buffer climbing steadily. By tick 12, it's nearly full.

Kenji inspects the relay (which spawned at tick 6). Its buffer is empty for the first 6 ticks. Then signals start arriving. But there's a gap — ticks 4-5, the critical period when the scout first spotted the enemy, has no record at the relay. "We need the relay to spawn first, or the scout needs to buffer the alert until the relay is ready."

Tomás: "Or I could add a rule to the scout: `IF no_listeners_on_channel → store instead of emit`. Is that a rule or a hook thing?"
Kenji: "That's... both? The storage is context config. But the 'no listeners' detection is... wait, can a hook check if a channel has listeners?"

They're discovering the edges of the primitive system. The seam between their panels forces them to have exactly this conversation — which primitive owns which capability. In single-player, they'd just try things. In co-op, they have to articulate the system model.

**Minute 9:00 — The Fix**
They reorder the production queue: relay first, then scout, then striker. Kenji adjusts the relay's buffer size from 12 to 10 to save resources. Tomás adds a new rule to the scout: `IF buffer_full → use evade` as a safety fallback. They press READY again. The second attempt plays out — the relay spawns first, the scout's first signal has a receiver, the striker arrives and converges on the flagged position.

It works. The cross-seam moment: scout detects, hook broadcasts (Kenji's work), rule-driven striker responds (Tomás's work). Both players contributed. Neither could have done it alone.

**Minute 10:00 — The Realization**
Kenji looks at the channel map. Three channels, five connections, two players' work interleaved. "This is literally what I do at my internship. The scout is a monitoring service. The relay is a message queue. The striker is an autoscaler. And we just configured a production incident response system."

Tomás: "Yeah but at your internship the message queue doesn't get eaten by robots."

**UI Annotations:**
- **Luminous seam:** 3px wide, animated gradient between cyan and amber, breathes at 0.5Hz, ripples when either player makes a change
- **Read-only panels:** 70% opacity, diagonal hatch overlay (45° lines, 1px, every 8px), lock icon (🔒) at top-right of each read-only section
- **Channel map:** Shared panel at bottom of workbench, full width, lines colored by creator, blended teal-gold for co-created channels
- **Ready check:** Split progress bar, 40px tall, fills from edges to center, cyan/amber, meeting point plays a chime + white spark animation
- **Ghost units on board:** Player-colored border glow (2px), small avatar icon at bottom-left corner (16x16px circular crop)

---

#### Journey: Dr. Amara (52) and her daughter Zara (16) — Model C (War Room) Mission 7

**Context:** Mission 7, command agent introduction. Dr. Amara is a retired epidemiologist who's never played a strategy game. Zara has completed the full campaign solo. Zara is The Analyst (Inspector only). Dr. Amara is The Architect (Plan screen only).

**Minute 0:00 — The Briefing**
The mission loads. Seven enemy units, two bases. The board shows terrain — jungle in the south, open field in the north. Dr. Amara sees the Plan screen with an empty workbench. Zara sees a read-only overview of the board with a notepad panel on the right.

Zara immediately starts marking the board. She places an amber zone marker on the northern open field: "enemies will patrol here." Another on the jungle edge: "good relay position, cover from strikers." These annotations appear as translucent amber overlays on Dr. Amara's board — subtle enough to not obscure the grid but visible enough to guide placement.

Dr. Amara: "What should I build first?"
Zara: "Start with two scouts, one north one south. Then a relay in the jungle. Give the scouts patrol and evade."

**Minute 2:00 — The Architect Builds**
Dr. Amara opens the blueprint editor. She creates SCOUT-NORTH. Skills: patrol, evade. She writes her first rule slowly, reading the condition dropdown carefully: `IF enemy_detected AND distance ≤ 2 → use evade`. She adds a second: `IF enemy_detected AND distance > 2 → continue patrol`. She configures a hook: `WHEN enemy_detected → EMIT on "north-alert"`.

Her hands are slow but deliberate. She double-checks each rule's order — she learned from Mission 4 that rule priority matters. Zara watches the read-only view, sees the rules appear one by one. She types a suggestion in her notepad: "Add a terrain observation to north scout — helps it navigate jungle." The suggestion appears as a small amber pin on Dr. Amara's blueprint editor, pointing at the Context Config section.

Dr. Amara clicks the pin. Reads it. Nods. Adjusts the context config: `priority: [enemy, terrain, signal]`.

**Minute 5:00 — The First Attempt**
Architecture complete: 2 scouts, 1 relay, 2 strikers, 1 command agent (Zara insisted, "trust me, you need it"). Dr. Amara hits EXECUTE with a small prayer.

Sealed Watch. Both watch together. The command agent spawns at the base. Scouts fan out. Tick 8: SCOUT-NORTH detects an enemy. The hook fires. Signal traces to RELAY-JUNGLE. The relay compresses and forwards to STRIKER-EAST on "east-engage." But STRIKER-EAST is still walking toward its patrol zone — it's at E2, and the enemy is at F7. Five cells away. The striker changes direction and starts walking north... slowly.

Tick 14: The enemy reaches the relay. One-shot kill. RELAY-JUNGLE eliminated. The channel dies. Remaining signals from SCOUT-NORTH emit into void. STRIKER-EAST is still walking, two cells short.

Dr. Amara: "The relay died. It was just... sitting there."
Zara: "I know. I'll figure out why."

**Minute 7:00 — The Analyst's Investigation**
Zara enters the full Inspector. Dr. Amara sees only the basic replay — board with play/pause controls. No buffer visualization, no signal traces, no queue depth charts.

Zara scrubs to tick 8. Clicks on RELAY-JUNGLE. Sees the buffer state: 8 of 12 slots filled. Six are terrain observations from adjacent cells. Two are the scout's compressed enemy signals. She checks the signal arrival: the enemy signal arrived at tick 9 (one-tick latency from the scout). The relay compressed and forwarded at tick 10. The striker received at tick 11. Four ticks of latency — too slow.

She checks the relay's context config. Buffer priority: `[signal, terrain, enemy]`. The terrain observations accumulated because the relay can see adjacent cells' terrain data, and terrain is second priority. The relay's buffer was 67% full of terrain data, leaving limited space for processing incoming signals.

Zara hits SHARE on the queue depth chart at tick 8. A diagnostic card appears: screenshot of the relay's buffer — six terrain slots, two signal slots. She handwrites an annotation: "Relay buffer was full of terrain junk. It needs: listen only to signals, ignore terrain." She shares two more cards: the signal trace showing 4-tick latency, and the striker's movement path showing it was too far away when called.

**Minute 9:00 — The Conversation**
Zara turns to Dr. Amara. "Okay. Three problems. One: the relay was storing terrain data it didn't need. Set its context config to ignore terrain — it's a relay, not a scout. Two: the striker was too far from the north zone. Either change its patrol starting position or add a second striker. Three: the signal took four ticks to reach the striker. That's too slow for the relay's position. Move it closer to the north."

Dr. Amara pulls up Zara's diagnostic cards from the suggestion tray. She sees the buffer visualization — six blue terrain slots, two red signal slots. "Oh! It's like triage. The relay was spending attention on low-priority information and the urgent signal got delayed."

"Exactly. Like an ER that's full of people with papercuts when an ambulance arrives."

**Minute 10:30 — The Fix**
Dr. Amara adjusts RELAY-JUNGLE's context config: `listen: [north-alert, south-alert]`, `ignore: [terrain]`. She moves the relay one cell north on the board. She repositions STRIKER-EAST to start at E5 instead of E2.

Second attempt. The relay's buffer stays clean — only signals. When SCOUT-NORTH detects the enemy at tick 8, the signal chain fires: scout→relay (tick 9)→striker (tick 10). The striker is now only 2 cells away. It engages at tick 12. Kill flash. Red cell.

Dr. Amara grabs Zara's arm. "IT WORKED. Your diagnosis was exactly right. The buffer was the problem!"

Zara grins. "That's literally what I tell the interns at my summer job about our monitoring dashboards."

**Minute 12:00 — The Meta-Moment**
In the debrief, Dr. Amara sees the full Inspector for the first time (the roles don't swap — War Room has fixed roles — but she can review the Inspector freely after the mission is complete). She clicks the relay at tick 9. Sees the clean buffer. Two signal slots. Zero terrain noise. "Oh my god. I can see the difference. The first time it was drowning in data. This time it only had what mattered."

She looks at Zara. "Is this what it's like being a data analyst? Cutting through noise to find the signal?"

**UI Annotations:**
- **Suggestion tray:** Horizontal strip, 80px tall, bottom of Plan screen. Amber card thumbnails (60x60px). Counter badge top-right. Cards slide left when acknowledged (dim to 30%), crumple-dissolve when dismissed.
- **Diagnostic cards:** 200x150px static screenshots with handwritten overlay text (amber, slightly wobbly font to look hand-annotated). Timestamp at bottom. "Shared by [Analyst name]" credit.
- **Board annotations (Analyst's):** Translucent amber zones (15% opacity fill, 60% opacity border), floating text labels in amber, visible on both players' boards.
- **Basic replay controls (Architect's Inspector):** Play ▶, Pause ⏸, Step Forward ⏭, Step Back ⏮. No scrubber timeline, no click-to-inspect, no analytical overlays. Just the board replaying.

---

#### Journey: Marcus (38) and Darius (38), Ex-StarCraft Diamonds — Model D (Divided Front) Mission 9

**Context:** Mission 9, penultimate mission. Both are experienced single-player campaign completionists. They've been playing Divided Front co-op since Mission 5 and have developed a "language" — shared channel naming conventions, standard signal formats, division of scouting responsibilities. This is their hardest mission yet: three enemy bases, two on Marcus's western half, one on Darius's east.

**Minute 0:00 — The Pre-Game**
The board loads. Marcus's west half shows dense jungle terrain (columns A-D) with two enemy bases at A8 and D8. Darius's east half is open field (columns E-H) with one enemy base at H5. The asymmetric terrain creates an asymmetric challenge: Marcus faces two bases through concealment; Darius faces one base across open ground.

Marcus: "I've got two bases in jungle. I need stealth. Scouts with low-emission hooks."
Darius: "I've got open field. One base but it'll see me coming from far away. I need speed. Strikers with compressed intel."

They each open their own workbench. The board renders twice — once in each player's view. Marcus sees his own units as full-detail ghosts and Darius's as dim silhouettes with "?" icons. Darius sees the reverse.

**Minute 2:00 — The Channel Negotiation**
This is their ritual. Before configuring units, they agree on shared channels. They've developed a naming convention over four co-op sessions:

- `xb-[direction]-alert`: Cross-boundary alert (enemy detected near the seam)
- `xb-[direction]-clear`: Cross-boundary all-clear
- `xb-request-[resource]`: Cross-boundary resource request
- `local-[player]-[purpose]`: Internal channels that don't cross the boundary

Marcus creates `xb-east-alert` on his relay. Darius creates `xb-west-alert` on his. Both set their border-adjacent units to listen to the other's cross-boundary channel. The channel map shows the connections spanning the D-E column boundary — two golden arcs crossing the faint dashed seam line.

Marcus: "I'm also going to set up `xb-assist-east` for if I can spare a striker to help you."
Darius: "Appreciated. I'll set a hook on my command agent to accept incoming strikers on that channel and integrate them into my formation."

**Minute 5:00 — The Architecture**
Marcus builds a stealth network: two scouts with minimal hook usage (low EM), one relay deep in the jungle (row 4, column B), two strikers that wait for compressed signals. His philosophy: see everything, emit nothing. His EM footprint is tiny.

Darius builds a speed network: one scout with maximum range patrol, two relays in series for signal amplification, three strikers in a tight formation. His philosophy: overwhelming force, rapid response. His EM footprint is large — but in open field, concealment is impossible anyway.

They compare channel maps side by side (the one shared UI element). Marcus's half shows sparse, thin lines — minimal wiring. Darius's shows dense, bright lines — heavy communication. The visual contrast captures their different philosophies at a glance.

**Minute 7:00 — Execute**
Both watch the shared Sealed Watch. The seam between columns D and E is faintly visible. Marcus's units (cyan trim) creep through jungle. Darius's units (amber trim) advance across open field.

Tick 6: Darius's scout spots the eastern enemy base. Signal chain fires — scout→relay1→relay2→striker formation. Heavy signal traffic. EM emissions bloom around Darius's units — soft amber clouds indicating detectable noise. The eastern enemy base responds: two enemy strikers vector toward Darius's relay chain.

Tick 9: Marcus's western scouts, operating silently, detect something unexpected. An enemy patrol moving EAST — from Marcus's territory toward the seam. Toward Darius's flank. Marcus's scout fires its minimal hook: EMIT on `xb-east-alert`. A thin green arc traces from C6 across the seam to Darius's command agent at F3.

Tick 10: The cross-boundary signal arrives at Darius's command agent. The command agent's rules fire: `IF xb-east-alert AND striker_available → reassign nearest striker to intercept`. STRIKER-D2, at F5, pivots west. It crosses the seam into Marcus's territory — amber trim unit crossing the dashed line into cyan territory. The visual is startling — a unit changing hemispheres.

Tick 12: The eastbound enemy patrol reaches E5 — exactly where Darius's relay chain is exposed. STRIKER-D2 arrives at E5 from the west at the same tick. Engagement. Kill flash. Red cell. The relay chain is saved.

Both players lose their minds. Marcus saved Darius's architecture with a scout that was supposed to be watching the western front. Darius's command agent integrated the cross-boundary intelligence seamlessly because they'd agreed on the channel protocol four sessions ago.

The golden arc across the seam — `xb-east-alert` — pulses bright on both screens. One signal. Two players. Three units. Zero pre-planning of that specific maneuver.

**Minute 9:00 — The Debrief**
Inspector loads. Both players can inspect any unit on the board. Darius clicks Marcus's SCOUT-WEST at tick 9. He can see the buffer state — three enemy observations, one terrain, two empty slots. But the scout's rules are hidden behind a "Classified" overlay (he can see WHAT the scout did, not HOW it was configured). He can see it emitted on `xb-east-alert` but not the exact condition that triggered the emission.

Marcus, meanwhile, inspects Darius's command agent at tick 10. He sees the buffer filling with the cross-boundary signal. He sees the reassignment cascade. But the command agent's rules — the complex priority logic Darius configured — are classified. He can see the result but not the implementation.

Darius: "Your scout detected the patrol at tick 9. But it only used one hook slot for the cross-boundary alert. What was the condition?"
Marcus: "Enemy detected moving east — I added a direction check to the detection rule last session. If the enemy's trajectory points toward the seam, it fires xb-east-alert instead of local-west-alert."
Darius: "That's genius. Your scout is smarter about MY flank than I am."

**Minute 11:00 — The Evolution**
They discuss next steps. Marcus wants to add a second cross-boundary channel: `xb-east-type` that includes enemy unit type information, not just "enemy detected." Darius wants to build a secondary relay at the seam — E4 — that bridges both networks, compressing cross-boundary signals before distributing them.

Marcus: "A seam relay. That's literally a VPN gateway."
Darius: "Yeah and the EM emissions are the VPN overhead. More intelligence costs more noise."

They've been building this cross-boundary protocol for four sessions. Each session adds a new channel, a new convention, a new capability. Their shared infrastructure — the golden arcs across the seam — is becoming more sophisticated than either player's internal architecture. The co-op's emergent complexity exceeds what either player would build alone.

**UI Annotations:**
- **Board seam:** 1px dashed line between columns D and E, 30% opacity white, barely visible during normal play. Brightens to 60% when a cross-boundary signal traverses it. Pulses gold when cross-boundary kill occurs.
- **Cross-boundary signal arc:** Parabolic curve, thicker than local signals (2px vs. 1px), gold color instead of green, takes 1.5 ticks to traverse (signal travels, crosses seam with a slight delay rendering). The arc apex is higher than local arcs — visually dramatic.
- **Player unit trim:** 2px border glow, cyan for Player A, amber for Player B. Units crossing the seam keep their trim color — visually marking them as "visitors" in the other player's territory.
- **Classified overlay:** Dark panel with diagonal lines, text "Configured by [Player]" in muted white, lock icon. Readable at a distance — clearly "off limits" but not hostile. Hovering shows tooltip: "You can see this unit's behavior but not its configuration."
- **Channel map crossing:** Lines that span the seam render in gold instead of player colors. A small bridge icon (🌉) appears at the crossing point.

---

#### Journey: Sofia (29) and her partner Alex (31) — Model E (Relay) First Encounter, Mission 3

**Context:** Sofia has completed Missions 1-2 solo. Alex has never played. They're trying co-op for the first time. Sofia is The Commander (Plan + degraded Sealed Watch). Alex is The Observer (perfect Sealed Watch + pings).

**Minute 0:00 — The Fog**
Sofia sees the Plan screen. She places a scout and configures basic patrol + evade. She's done this before — Missions 1-2 taught her the basics. Alex sees the mission briefing view: the full board layout, enemy placements visible, terrain clear. Alex places amber zone markers: "enemies here, here, and here." The markers appear on Sofia's board as translucent amber shapes.

Sofia: "I can see your markers. Three enemy groups?"
Alex: "Yeah. Two in the north, one southeast. The southeast group is closest to your base."

**Minute 2:00 — Execute Into Fog**
Sofia hits EXECUTE. The Sealed Watch begins. Sofia's screen: the board is partially visible. Her scout's perception radius — 5 cells — illuminates a circle around it. Beyond that: animated static. Television snow rendered in pixel art. She can see cells A1 through D5 (roughly). The north half of the board is dark.

Alex's screen: Everything. The full board. Sofia's scout in cyan, patrolling south. Three enemy groups clearly visible. One enemy in the southeast is moving toward the scout's patrol path. Alex can see the collision course. Sofia can't.

**Minute 2:30 — The First Ping**
Alex grabs the mouse. Clicks on E4 — just outside Sofia's visible range. Types: "ENEMY." An amber diamond phases through the static on Sofia's screen. The text "ENEMY" renders below it, jittery, degraded by the fog.

Sofia: "Enemy where? E4? I can't see that far."
Alex: "Moving toward your scout. Fast."

Sofia watches her scout approaching D4. In two ticks, the scout will reach the edge of its patrol zone and turn back. But the enemy at E4 is heading west — toward the scout's position. If the scout's evade rule works, it should dodge. If not...

**Minute 3:00 — The Collision**
Tick 12. The scout reaches D4. Its perception radius extends to E4. The enemy appears in Sofia's view — a red icon, sharp against the static. The scout's buffer fills: enemy detected. Evade rule fires. The scout retreats to C3.

But there's a second enemy that Alex could see and Sofia couldn't. At F3, another enemy was circling. When the first enemy pushed the scout west, the second enemy's patrol path would have intercepted — except Sofia configured the scout to evade SOUTH, not WEST.

Alex: "GO SOUTH! SOUTH!"
Alex pings C2: "SAFE." Then pings D3: "DANGER."

Sofia sees two pings flash through the static. SAFE below. DANGER at her level. She can't change anything — this is Sealed Watch, no controls. She watches the scout evade to C3 (its programmed direction, not Alex's suggested south). The second enemy arrives at D3 next tick. The scout is at C3 — one cell away. Adjacent. One-shot kill. Scout eliminated.

A red flash on Sofia's screen. The illuminated circle collapses. Where the scout was, the static rushes in. Sofia's visible area shrinks by 5 cells in every direction. The board goes dark.

**Minute 3:30 — The Darkness**
Sofia's screen is almost entirely static now. She has one remaining unit in view — a striker near her base. The rest of the board is fog. She can hear combat sounds — muffled, directionless, coming from somewhere in the static. Is that her units dying or enemies fighting each other?

Alex's screen shows everything. The enemy that killed the scout is now moving toward Sofia's relay. Another enemy is approaching from the north. Alex pings frantically: "RELAY" at B5. "RUN" at C6.

But the relay is stationary. It can't run. Sofia knows this. Alex doesn't — Alex has never configured a unit. The ping is useless advice, but the FEAR in Alex's voice is palpable.

**Minute 4:00 — The Aftermath**
The mission ends. Sofia's architecture collapsed when the scout died — the scout was the only unit with perception, and without it, no other units received intelligence. The strikers stood at their patrol positions, blind, while enemies walked past them.

Inspector loads. Sofia sees the full board for the first time. The fog lifts. She scrubs to tick 12 — sees both enemies converging on the scout. She can see the approach paths that were invisible during the battle. Alex points: "See? The second one was always coming from F3. Your scout evaded INTO its path."

Sofia: "If I'd configured the scout to evade south instead of west..."
Alex: "Or if you'd had a second scout to see the second enemy."
Sofia: "Or if the relay had been closer so the striker could have intercepted."

The failure is multi-causal. The fog made it terrifying. The debrief makes it educational. And Alex — who's never played a strategy game — just diagnosed a perception coverage gap. Because from the god-view, the gap was obvious.

**Minute 6:00 — The Rebuild**
Sofia redesigns. Two scouts now — one north, one south. Overlapping perception radii. Alex marks the board: "If you put the second scout at C6, their perception circles overlap at D5. No gap." Sofia places the scout exactly where Alex marks.

Second attempt. Two scouts, overlapping vision. The fog on Sofia's Sealed Watch is much smaller now — two bright circles instead of one, with a Venn diagram overlap in the middle. When the same enemy approaches from E4, BOTH scouts detect it. The evade direction matters less because there's a second scout watching the escape route.

Alex watches the full board. No panicked pings this time. "You're clear. Both enemies are tracked."

The mission succeeds.

**Minute 8:00 — The Conversion**
Alex, who has never played a strategy game, who was "just the observer," turns to Sofia: "I want to try the Commander next time."

"But you don't know how to configure—"

"I know where to PUT them. That's half the game."

**UI Annotations:**
- **Fog static:** Animated noise, 2-frame alternation, pixel-art styled (chunky 4x4 blocks), density gradient (100% at board edge, 60% at fog boundary, 20% immediately outside perception). Color: dark purple-gray (#1a1128) with occasional cyan flecks (representing ambient signal noise).
- **Perception circle:** Clear area with a subtle cyan border at the edge (1px, pulsing). Border transitions to static via a 2-cell gradient — not a hard line.
- **Pings in fog:** Amber diamond (12px), jittery (±1px random offset per frame), text below in degraded font (missing pixels, static interference). Pings in clear areas: clean, sharp, no jitter.
- **Combat sound in fog:** Low-pass filtered (muffled), no spatial positioning (ambiguous direction). Combat sound in clear areas: full frequency, stereo-positioned.
- **Fog collapse on unit death:** Perception circle shrinks over 0.5 seconds, static rushing inward like water filling a hole. Accompanied by a soft "power down" hum descending in pitch.

---

## Sensory Design Across Models

### Plan Phase Audio
- **Model B (Specialist):** When one player makes a change, the other hears a soft chime — a different pitch for each primitive type. Skills toggle: a click. Rules reorder: a wooden block shuffle. Hooks connected: a wire-snap sound. Context config adjusted: a dial turn. Players learn to read each other's activity through ambient sound.
- **Model C (War Room):** The Analyst's annotation pins produce a soft "tap" on the Architect's screen — like someone tapping on glass to get attention. Acknowledged pins chime. Dismissed pins make a soft crumple.
- **Model D (Divided Front):** Cross-boundary channel creation produces a unique sound — a resonant tone like plucking a string that spans the room. Both players hear it simultaneously. Channel deletion produces the string going slack — a descending *bwong*.

### Sealed Watch Audio
- **Model E (Relay):** The Commander hears everything through "fog audio" — low-pass filtered, ambiguous, anxiety-inducing. The Observer hears full-clarity audio. When the Observer pings, the Commander hears a crackling radio transmission — the ping sound itself is degraded, reinforcing the communication-through-noise theme.

### Inspector Audio
- Shared inspection: when both players click the same unit, a harmonic resonance plays — two notes that merge into a chord. Separate inspections: each player's selection makes its own tone. The audio tells you whether you're looking at the same thing or different things without checking the screen.

---

## Recommendations and Interactions

### For Campaign Co-op (Missions 1-10)
**Recommended: Model A (Archon) for Missions 1-4, Model B (Specialist) from Mission 5+.** The Archon model has zero learning overhead — perfect for co-op's first encounter. The Specialist model activates once players understand all four primitives, adding mechanical interdependence that the early missions can't support.

### For Post-Campaign / Gauntlet Co-op
**Recommended: Model D (Divided Front) or Model E (Relay).** These models add enough complexity and novelty to sustain co-op play beyond the campaign. The Divided Front's cross-boundary protocols evolve over many sessions. The Relay's fog-of-war creates a substantially different game that justifies replaying missions.

### For Streaming / Content Creation
**Recommended: Model C (War Room) or Model E (Relay).** Both create dramatic asymmetry that's entertaining to watch. The War Room's "diagnosis conversation" is inherently verbal and personal. The Relay's fog creates visible tension — the split-screen of fog vs. full-information is immediately comprehensible to an audience.

### For Skill-Gap Pairs (Parent/Child, Veteran/Newcomer)
**Recommended: Model A (Archon) or Model C (War Room) with the experienced player as Analyst.** Both let the experienced player guide without controlling. The War Room is particularly powerful because the experienced player's expertise is channeled through diagnosis and communication rather than direct configuration — they TEACH instead of DO.

---

## New Aspects Discovered

- **7.02a — Co-op channel naming protocols and emergent communication conventions:** how player-pairs develop shared vocabulary for cross-boundary signals; the "protocol layer" that emerges from repeated co-op sessions; comparable to software API versioning and team naming conventions
- **7.02b — Co-op production queue negotiation:** when two players share one production queue (Models A, B, C), build order becomes a diplomacy problem; resource allocation as cooperative tension; comparable to Factorio's "you used all the iron" conflict
- **7.02c — 2v2 co-op PvP mode combinations:** pairing co-op models with PvP models; Specialist co-op (4 distinct roles in a 2v2) as the deepest competitive format; mixed co-op models as asymmetric advantage
- **7.02d — Co-op Inspector as teaching tool:** War Room co-op (Model C) forces deep Inspector usage; how co-op debrief habits transfer to improved single-player analysis; co-op as the "Inspector tutorial" the game otherwise lacks
- **7.02e — Cross-boundary EM emission budget as cooperative resource:** in Divided Front co-op, both players' combined EM emissions create shared detection risk; the "emission budget" as a cooperative resource that neither player can individually control; comparable to shared radio frequency allocation
