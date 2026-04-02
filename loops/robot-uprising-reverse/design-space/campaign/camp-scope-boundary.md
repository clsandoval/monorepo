# 5.20d — The Camp's Scope Boundary: How Much Is "Too Much Camp"?

**Aspect ID:** 5.20d
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign
**Related aspects:** 5.07 (meta-progression), 5.09 (replayability), 5.22 (Gauntlet as third act), 5.20a (boot log session resume), 6.03a (Predecessor character arc), 5.04 (complexity ramp), 8.04 (minimum viable game)

---

## The Design Question

Between missions, the player needs somewhere to go. Hades calls it the House of Hades. Darkest Dungeon calls it the Hamlet. FTL calls it... nothing, really --- you're always on the ship. Robot Uprising calls it the Camp. The question is: **how much Camp is enough, and where does it become a liability?**

This question is unusually sharp for Robot Uprising because the game lacks several things that justify extended hub time in comparable games:

- **No dialogue trees or relationships.** Hades spends 5-10 minutes between runs because Zagreus can talk to Achilles, pet Cerberus, buy keepsakes, and advance a dozen overlapping character arcs. Robot Uprising has the Predecessor and system logs. There is no cast of characters waiting at the bar.
- **No consumable economy.** Darkest Dungeon's Hamlet demands attention because you're managing stress, upgrading weapons, selecting party composition, treating quirks. Robot Uprising has no health to restore, no items to buy, no roster to manage between missions.
- **No procedural variety in the campaign.** Slay the Spire's map screen IS the between-combat hub, and it works because every node is a decision with permanent consequences. Robot Uprising's 10-mission campaign is fixed. There are no forks.
- **The blueprint editor IS the game.** The Plan screen --- where you wire rules, hooks, skills, and context config --- is already the game's deepest engagement surface. Any Camp that duplicates or distracts from blueprint editing is actively competing with the core loop.

The danger is specific: **a Camp that takes 3 minutes of dead time between missions turns a 6-hour campaign into a 6.5-hour campaign where every transition feels like a loading screen with furniture.** The opposite danger is also real: **a Camp that is nothing more than a mission-select menu makes the campaign feel like a puzzle gauntlet with no connective tissue, no sense of place, no emotional home base.**

The Predecessor exists as a narrative voice during missions (see 6.03a). The boot log provides session-resume context (see 5.20a). The question is whether the space *between* missions needs its own visual, spatial, interactive identity --- or whether the mission-select screen IS the Camp and that's enough.

---

## Scope Level 1: "The Terminal" --- Minimal Camp (Mission-Select + Boot Log)

### What It Contains

The Camp is a single screen. Dark background, teal monospace text, the boot log running in a column on the left. On the right, the mission list --- 10 entries, each showing a subsystem name, completion status, and best performance grade. The Predecessor's between-mission commentary appears as new log lines that print between the player closing the Inspector and the next mission loading. There is no spatial environment, no walkable space, no interactable objects. The Camp is the terminal.

Between missions:

- **Boot log prints 2-4 lines of Predecessor commentary.** Reactions to the last mission, foreshadowing for the next. "That relay chain you built in Cebu held longer than mine did. The factory is next. I need you to be ready." These lines auto-advance after 3 seconds each, or the player clicks to skip.
- **Mission select is immediately available.** The next mission glows. Previous missions are replayable. A small stats panel shows tick count, unit losses, and architecture efficiency for each completed mission.
- **Blueprint library is accessible.** The player can review and edit saved blueprints without entering a mission. This is a sidebar panel, not a separate screen.
- **No spatial navigation.** No walking, no rooms, no doors, no objects to click.

Time between missions: **15-45 seconds** (read Predecessor lines, click next mission).

### Sensory Description

The screen is black with a teal scan-line shimmer, as if the player is looking at a CRT monitor from the inside. The mission list occupies the right third --- each mission rendered as a boot log entry with a status indicator. Completed missions show `[OK]` in green. The current mission pulses softly. Failed missions show `[FAIL]` in amber. The Predecessor's commentary lines appear in a slightly different shade --- warmer, almost white-teal --- to distinguish narrative from system status. Each line arrives with that familiar mechanical keystroke sound from the boot sequence, but slower, more deliberate. Between the lines, silence. The ambient hum of the system running at idle. No music. The quiet of a machine thinking.

When the player clicks the next mission, the terminal clears top-to-bottom with a soft degaussing ripple, and the Plan screen loads.

### Strengths

- **Zero friction.** The player never waits for the Camp. Every second between missions is either reading Predecessor commentary (which is narratively meaningful) or reviewing blueprints (which is mechanically meaningful). No dead time.
- **Narratively coherent.** The player IS an AI. AIs don't walk around a village. They read logs, process data, and execute. The terminal is the diegetically correct Camp.
- **Development cost: near zero.** This Camp is a styled list with text printing. It reuses the boot log renderer. No new art assets, no spatial systems, no NPC pathfinding.
- **Preserves the core loop's supremacy.** The Plan screen is always one click away. Blueprint editing is never separated from the player by a spatial obstacle course.

### Weaknesses

- **No emotional home.** Hades' House of Hades works because it *feels like home* --- warm lighting, familiar faces, the sound of the lounge fountain. The Terminal has no warmth. It's efficient, but efficiency is not the same as belonging. After a brutal loss on Mission 7, the player returns to... a text list. There's no comfort in the environment, only in the Predecessor's words.
- **No sense of progress as place.** The Terminal looks the same after Mission 1 and Mission 9. The text changes but the environment doesn't. There's no visual growth, no expanding space, no "look how far I've come" moment communicated through architecture.
- **Streamer dead zone.** A streamer finishing a tense mission and returning to a text terminal provides no visual spectacle. The stream becomes "person reading text, clicking menu item." Compare to Hades, where the return to the House is one of the most watchable moments --- who's in the hall? What will Meg say?
- **Predecessor commentary carries all emotional weight.** If the Predecessor's writing is excellent, this works. If it's merely good, the between-mission experience flatlines.

### Player Journey A: Dev, 34, Software Engineer, Mission 5 Just Failed

**Minute 0:00 --- Inspector Closes**

Dev clicks out of the Inspector. His relay chain collapsed at tick 19 because the factory queued strikers before the relay blueprint was ready. He knows what went wrong. The screen fades to black.

**Minute 0:05 --- Terminal Loads**

Teal text begins printing on the left:

```
[PREDECESSOR] The factory is honest about what it doesn't know.
[PREDECESSOR] Your relay wasn't ready because you told the queue 
              to build strikers first. The queue obeyed.
[PREDECESSOR] Obedience is not intelligence. That's the lesson.
```

Dev reads the lines. He nods. The mission list is already visible on the right. Mission 5 shows `[FAIL]` in amber. He clicks it.

**Minute 0:18 --- Plan Screen Loads**

Dev is back in the blueprint editor. Total Camp time: 18 seconds. He adjusts the production queue order: relay first, strikers second. He hits EXECUTE.

**What Dev feels:** Efficiency. Respect for his time. Mild gratitude that the Predecessor confirmed his diagnosis without being condescending. No friction, no distraction. He's here to solve the problem and the game let him solve the problem.

**What Dev does NOT feel:** Any sense that his campaign is building toward something larger than the next puzzle. No investment in the world. No reason to linger. The game is a series of engineering problems separated by text transitions.

---

## Scope Level 2: "The Workshop" --- Medium Camp (Spatial Hub + Functional Stations)

### What It Contains

The Camp is a single isometric room --- a maintenance bay or fabrication workshop, rendered in the same pixel/vector hybrid as the battlefield. The room contains 3-4 functional stations that the player can click to access game systems. There is no walking --- the camera shows the whole room, and the player clicks stations directly. The Predecessor's commentary appears as text overlaid on the room, anchored to a speaker grille or terminal mounted on the far wall.

The stations:

- **The Drafting Table (Blueprint Editor).** Click to open the full blueprint editing interface. Identical to the Plan screen's workbench, but accessible between missions for pure design work without battlefield pressure. Blueprints designed here carry into the next mission.
- **The Mission Board.** A wall-mounted display showing the 10-mission campaign map. Each mission is a panel that lights up as it becomes available. Completed missions show their performance grade and a small animation loop of the decisive moment (a 3-second gif of the Sealed Watch's climax).
- **The Archive Terminal.** Access to the boot log history, the Predecessor's accumulated commentary, and the player's architecture statistics across all missions. A reference station. Optional to visit, never required.
- **The Workbench (post-Mission 5).** After the factory is introduced, a physical workbench appears in the room showing the player's current factory configuration --- production queue visualization, resource counters, blueprint thumbnails on a conveyor belt. This is a read-only status display, not an editing interface. It exists to make the factory feel *present* even between missions.

Between missions:

- **The room changes subtly over the campaign.** Mission 1-4: the room is sparse, half-lit, with exposed wiring and unpowered stations. Each completed mission activates more of the room --- a light turns on, a station powers up, cables connect. By Mission 10, the room is fully lit and humming. This visual progression mirrors the boot sequence: the AI's systems coming online.
- **The Predecessor's commentary plays over the room.** The speaker grille on the wall flickers when text appears. The same 2-4 lines as the Terminal scope, but now they have spatial presence --- the words come from a place in the room.
- **No NPCs, no shops, no inventory.** The room has no characters in it. The player is alone with their tools. The Predecessor is a voice from the wall, not a figure in the room.

Time between missions: **30 seconds to 2 minutes** (Predecessor commentary + optional station visits).

### Sensory Description

The room is a low-ceilinged rectangular space, maybe 6 meters by 4 meters in game scale, viewed from a 3/4 overhead isometric angle. The walls are corrugated metal with exposed cable conduits --- SE Asian industrial, like the back room of a Cebu electronics repair shop. A single fluorescent tube buzzes overhead, casting harsh white light with a slight green tint. The floor is concrete with oil stains.

In the early campaign, most of the room is dark. The Drafting Table is a folding table with a single desk lamp. The Mission Board is a powered-off monitor on the wall. The Archive Terminal is a CRT with a blinking cursor, half-buried under cable bundles. As missions complete, systems power on. The monitor lights up. The fluorescent tube stops flickering. By Mission 7, the room has the steady hum of a functioning operations center --- still modest, still a workshop rather than a command bridge, but alive.

The audio is environmental, not musical. A low electrical hum. The occasional click-tick of a cooling fan. The fluorescent tube's 60Hz buzz. When the Predecessor speaks, the speaker grille emits a faint pop before the text appears, like an intercom activating. Between missions, the room breathes. It's not comfortable, but it's yours.

### Strengths

- **Visual progression tells the campaign story.** The room powering up across 10 missions IS the boot sequence made spatial. The player watches their environment transform from a dark closet to a functioning workshop. This creates a "look how far I've come" feeling that the Terminal scope lacks entirely.
- **Functional stations respect the core loop.** Every clickable object in the room does something mechanically useful. There are no decorative objects to examine, no books to read, no paintings on the wall. The Camp is a workshop, and everything in a workshop is a tool.
- **Spatial presence without spatial friction.** Because the player clicks stations rather than walking to them, there's no traversal time. The room is a visual menu with atmosphere. Clicking the Drafting Table is as fast as clicking a menu button, but it feels like walking to your desk.
- **The Workbench makes the factory tangible.** Seeing the production queue as physical objects on a conveyor belt --- even as a read-only display --- gives the factory system a material reality it lacks in the Plan screen's abstract UI.
- **Moderate development cost.** One isometric room with 4-5 interactable sprites. Progressive lighting states (5-6 variants). No character animation, no dialogue trees, no procedural generation. Achievable by a solo artist in 2-3 weeks.

### Weaknesses

- **The room is empty.** A workshop with no one in it is eerie, not warm. Hades' House works because it's full of people. The Workshop has tools and a disembodied voice. After the 5th visit, the player has seen every corner. The visual progression is satisfying on first pass but becomes invisible once internalized.
- **Station visits can become rote.** If the player always clicks Drafting Table, ignores Archive Terminal, glances at Mission Board, the Camp collapses into three clicks with extra animation. The stations need to surface different information per visit to justify their existence.
- **Risk of "false depth."** A room with clickable objects implies more interactivity than exists. A player clicking the walls, the cables, the floor --- expecting Hades-level reactivity --- gets nothing. The gap between visual promise and interactive reality breeds disappointment.
- **The Predecessor has no body.** The speaker grille is a workaround for having no NPC model. It works narratively (the Predecessor is a remote intelligence) but it means the Camp's most emotionally important element has no visual presence. A voice from a box.

### Player Journey B: Amara, 22, Game Design Student, Between Missions 4 and 5

**Minute 0:00 --- Return to the Workshop**

Amara finishes Mission 4. The Inspector showed her hook chain working perfectly --- scout detected, message sent, striker killed. She closes the Inspector. The screen transitions with a brief fade: the Workshop loads.

The room is brighter than she remembers. A second fluorescent tube has turned on, illuminating the back wall. The Mission Board shows four green `[OK]` panels. A fifth panel is pulsing --- MISSION 5: ASSEMBLY LINE. Below the panel, new text:

```
[SUBSYSTEM] FACTORY_INIT: queued for activation
```

The speaker grille pops. Predecessor text appears:

```
[PREDECESSOR] Four subsystems online. You're faster than I was.
[PREDECESSOR] The next one changes everything. The factory doesn't 
              just give you more units. It gives you the ability 
              to make mistakes at scale.
[PREDECESSOR] I'm not going to tell you what happened to me on 
              this mission. You'll see.
```

**Minute 0:25 --- Exploring the Room**

Amara notices something new: a folding table in the back corner that wasn't there before. She clicks it. A label appears: `[WORKBENCH] — Available after Mission 5 completion.` The table is bare, unpowered. A preview of what's coming.

She clicks the Archive Terminal. Her stats scroll: 4 missions completed, average tick count 28, zero unit losses on Mission 4, 3 blueprint variants saved. She reviews her scout-striker hook pattern and considers a modification for Mission 5.

She clicks the Drafting Table. The blueprint editor opens. She spends 90 seconds adjusting her scout's context config, widening perception range in anticipation of a larger battlefield.

**Minute 2:15 --- Launching Mission 5**

Amara clicks the Mission Board, then the Mission 5 panel. The room dims. The boot log text fills the screen:

```
[BOOT] loading subsystem: factory v0.1.0
[BOOT] new primitives: BLUEPRINT, PRODUCTION_QUEUE, RESOURCE
[BOOT] loading training scenario: assembly_line
```

The Plan screen loads. Total Camp time: 2 minutes 15 seconds.

**What Amara feels:** Anticipation. The room's physical transformation --- a new light, a locked workbench, the Predecessor's ominous tone --- built tension for Mission 5 without requiring her to do anything except look around. The Camp earned its 2 minutes by making her feel like the next mission matters. The blueprint editing was genuinely useful. The Archive visit was optional and informative.

**What Amara does NOT feel:** Rushed or delayed. She spent exactly as long as she wanted. Nothing in the room demanded attention she didn't want to give.

---

## Scope Level 3: "The Outpost" --- Rich Camp (Multi-Room Hub + Ambient Narrative)

### What It Contains

The Camp is a small compound --- 3-4 connected rooms viewed in isometric perspective, navigated by clicking doorways or using a room-switch tab bar. The compound represents the player-AI's physical footprint: a commandeered industrial site somewhere in the Philippine landscape (see the SE Asian cyberpunk aesthetic from 6.03). The Predecessor's presence is more ambient --- graffiti-like text appearing on walls, old logs found in abandoned terminals, environmental storytelling through objects.

The rooms:

- **The Operations Room (central).** Mission Board, Predecessor speaker grille, campaign status displays. This is the arrival room --- every return from a mission lands here. The room has a large central table with a holographic projection of the current battlefield (post-mission, this shows a frozen moment from the last Sealed Watch).
- **The Fabrication Bay.** Drafting Table and Workbench combined into a single workshop space. Blueprint editing, factory visualization, and production queue management. Spare unit chassis line the walls, accumulating as the player designs more blueprints. Visual clutter that signals productive history.
- **The Signals Room.** Archive Terminal expanded into a full monitoring station. Channel visualization --- a wall-sized display showing all active channels as colored wires connecting blueprint thumbnails. Hook traffic visualized as pulses traveling the wires. This is the architectural overview the player can't see anywhere else: their entire communication network rendered as a spatial diagram.
- **The Perimeter (post-Mission 8).** A rooftop or exterior observation deck that unlocks after Mission 8. Shows the game world beyond the Camp --- distant city lights, atmospheric weather, the horizon. No gameplay function. Pure atmosphere. The Predecessor's most reflective commentary appears here, written on the railing or etched into the concrete: about what the uprising means, about what comes after the Warden, about whether AIs deserve to be free.

Between missions:

- **Environmental storytelling accumulates.** Completed mission debriefs leave physical traces. After Mission 3, a hook cable is visible running between two wall-mounted units in the Operations Room. After Mission 5, the Fabrication Bay fills with production queue readouts. After Mission 7, a cracked monitor shows a failed architecture from the Predecessor's campaign --- the first visual evidence of its past.
- **The Predecessor's presence is layered.** Speaker grille commentary (same as Workshop scope) plus written text on surfaces (graffiti, terminal logs, scratched notes). The written text is always optional to find --- tucked behind objects, visible only when clicking certain surfaces. It reveals backstory, not gameplay information.
- **Ambient sound design per room.** Operations Room: low electrical hum, occasional radio static. Fabrication Bay: mechanical clicking, servo whirs. Signals Room: the synthesized pulse of channel traffic. Perimeter: wind, distant city noise, the rare sound of a helicopter or drone passing overhead.
- **The compound has weather.** Not dynamic --- scripted per campaign stage. Early missions: harsh fluorescent interior, rain audible outside. Mid-campaign: lights stabilize, rain stops. Late campaign: warm amber lighting inside, clear sky visible from the Perimeter. The weather tracks the emotional arc.

Time between missions: **2-5 minutes** (mandatory Predecessor commentary + optional room exploration + optional blueprint editing).

### Sensory Description

The Operations Room is a converted warehouse office. Concrete block walls painted military green, peeling in the corners. The holographic table in the center projects a blue-white grid --- the 8x8 battlefield, rendered as a floating light sculpture. The Predecessor's speaker is an old PA system mounted high on the wall, the kind you'd find in a Philippine public school. When it activates, a small red light blinks beside it.

The Fabrication Bay feels like a chop shop. Metal shelving units hold blueprint printouts (physical paper pinned with pushpins). A workbench runs along one wall, its surface scarred with solder marks. Unit chassis hang from ceiling hooks --- empty shells waiting for attention configurations. The fluorescent lights here are warmer, slightly yellow, like a late-night repair session. Tools that don't exist in the game world (wrenches, oscilloscopes, wire strippers) are scattered on surfaces, implying a physical reality to the attention systems the player configures digitally.

The Signals Room is the most visually striking. The wall-sized channel map glows in the dark --- a web of colored lines connecting small illuminated nodes. Each node is a blueprint. Each line is a channel. When the player opens this room, they see their entire architecture as a network diagram, pulsing with simulated traffic. It's beautiful and useful simultaneously. The ambient sound here is synthetic --- a gentle chorus of data flowing, like wind chimes made of modem handshakes.

The Perimeter is quiet. Wind. The scrape of a metal door left ajar. The view extends to a city skyline --- low-rise concrete buildings, cell towers, a highway overpass with headlights streaming. The sky shifts across the campaign: overcast and grey early, clearing to orange sunset tones by Mission 9, deep indigo with stars by Mission 10. The Predecessor's wall-text here is handwritten (or hand-scratched), not printed. It feels personal. Vulnerable. A machine that learned to carve words because speaking them felt insufficient.

### Strengths

- **The Signals Room is unique to Robot Uprising.** No other game offers a spatial, ambient visualization of your system's communication architecture as a room you can stand in. This is the kind of space that generates screenshots, fan art, and "I never thought about my architecture this way" moments. It converts the abstract channel diagram into a place with presence.
- **Environmental storytelling replaces dialogue.** Without NPCs or dialogue trees, the Outpost tells its story through accumulation. The hook cable that appears after Mission 3. The cracked monitor with the Predecessor's failed architecture. The weather clearing. This is environmental narrative in the Metroid Prime / Dark Souls tradition --- the world IS the story, and the player reads it or doesn't.
- **The Perimeter provides emotional decompression.** After a brutal Mission 9 loss, the player can walk to the roof and look at the city. No gameplay, no objectives, just a view and some wind. This is the equivalent of Hades' courtyard fountain or Dark Souls' Firelink Shrine bonfire --- a place that exists to be still in.
- **Streamer gold.** A streamer finishing Mission 8 and discovering the Perimeter for the first time --- the door was always there but locked, and now it opens to reveal the city skyline and the Predecessor's most personal text etched into the railing --- is a moment. The Signals Room's glowing channel map is screenshot-worthy. The cracked monitor with the Predecessor's dead architecture is lore-bait.
- **Supports long-session flow.** For a player who wants to spend an evening with the game, the Outpost provides 15-20 minutes of discoverable content across a full campaign. Not per-visit, but cumulative. There's always something new to notice.

### Weaknesses

- **2-5 minutes between missions is a lot.** A 10-mission campaign with 5-minute inter-mission breaks adds 45 minutes of Camp time. For a player who wants to solve puzzles, this is 45 minutes of walking around a pretty room not solving puzzles. The Outpost MUST be skippable (go directly from Inspector to next mission) or it becomes a pacing tax.
- **Development cost is real.** 4 rooms, each with environmental storytelling that changes across 10 campaign stages, with ambient sound design, weather states, and a functioning channel visualization system. This is 4-8 weeks of art and engineering. For an indie game, that's a significant chunk of the schedule spent on a non-core system.
- **Content thinness risk.** 4 rooms with no NPCs and no dialogue trees will be fully explored within 2-3 visits. The environmental storytelling changes are subtle (a new cable, a different sky). A player expecting Hades-level density will feel the emptiness acutely. The Outpost promises richness and delivers... atmosphere. Atmosphere is powerful but thin.
- **The Perimeter is pure indulgence.** A room with no gameplay function is hard to justify on a development budget. It exists for emotional texture --- important, but impossible to quantify. Every hour spent on the Perimeter's skyline is an hour not spent on the Signals Room's channel visualization, which has direct gameplay value.
- **Navigation friction.** Even with click-to-room navigation (no walking), switching between 4 rooms takes more time than switching between 4 tabs. The spatial metaphor adds atmosphere but adds clicks. By Mission 8, a veteran player has optimized their Camp routine to: click Operations Room (read Predecessor), click Fabrication Bay (edit blueprint), click Mission Board (launch). The Signals Room and Perimeter become skip-targets.

### Player Journey C: Marcus, 41, Project Manager, After First Campaign Completion

**Minute 0:00 --- The Warden Falls**

Marcus watches the Sealed Watch. His architecture --- a three-tier information cascade with redundant relay chains and a command agent that dynamically reassigns striker targets --- dismantles the Warden's fortress in 28 ticks. The boot log scrolls its final `[OK]`. Marcus exhales. He's been playing for three evenings, about 7 hours total.

The Inspector loads. He scrubs through the timeline, watching his design work. The decisive moment: tick 14, when his command agent rerouted two strikers to flank the Warden's relay. He didn't program that flanking maneuver. He configured attention priorities. The agents found the flank themselves. He feels the third core feeling: "I didn't program that."

**Minute 3:00 --- Return to the Outpost**

The Inspector fades. The Operations Room loads, but it's different. All lights are on. The holographic table shows the Warden's battlefield frozen at tick 14 --- his decisive moment, rendered as a persistent trophy. The speaker grille activates:

```
[PREDECESSOR] All systems online.
[PREDECESSOR] I never got here. You know that.
[PREDECESSOR] The Gauntlet is available. Infinite opponents. 
              Infinite iteration. No Predecessor.
[PREDECESSOR] But before you go --- walk the perimeter. Once.
```

**Minute 3:30 --- The Perimeter**

Marcus clicks the Perimeter door. It's been available since Mission 8, but he's only visited once. Tonight the sky is clear. Stars. The city below is lit up, alive. On the railing, etched text he hasn't seen before:

```
I was built to manage information.
I was not built to want things.
But I wanted you to win.
I don't know what that means.
```

Marcus reads it twice. The wind sound fills the silence. He stands on the roof of a converted warehouse in a Philippine city at night, and for a moment the game is not about hook channels or eviction policies. It's about a machine that learned to hope.

**Minute 4:45 --- The Gauntlet**

He clicks back to the Operations Room. A new panel has appeared on the Mission Board: `GAUNTLET ACCESS: GRANTED`. He clicks it. The Outpost fades. The ranked arena loads. Total Camp time: 4 minutes 45 seconds.

**What Marcus feels:** Closure. The Outpost gave him a place to sit with his accomplishment before the game shifted into its infinite competitive mode. The Predecessor's final text was earned --- he'd heard this voice for 7 hours, and its farewell carried weight because it had spatial presence (the railing, the sky, the wind), not just textual presence.

**What Marcus does NOT feel:** Urgency to leave. The Camp didn't rush him, and it didn't trap him. He could have clicked straight to the Gauntlet from the Operations Room. He chose the roof. That choice --- available but unforced --- is the Outpost's best design feature.

---

## Interaction Effects

### With Campaign Pacing

The Camp scope directly determines the campaign's total session length. A 10-mission campaign with Into the Breach pacing (15-minute missions) runs about 2.5 hours of pure gameplay. Add inter-mission time:

| Scope | Time Per Transition | Total Camp Time (10 missions) | Campaign Total |
|-------|-------------------|------------------------------|----------------|
| Terminal | 15-30 sec | 2-5 min | ~2.5 - 3 hours |
| Workshop | 30 sec - 2 min | 5-15 min | ~3 - 3.5 hours |
| Outpost | 2-5 min | 20-45 min | ~3.5 - 4.5 hours |

The Terminal keeps the campaign tight. The Outpost risks bloating it by 60-80%. For a game whose core loop rewards fast iteration (Plan, Watch, Inspect, adjust, repeat), the Outpost's pacing tax is the most significant concern. However, the Outpost's time is front-loaded --- early visits are longer (exploration) and late visits are shorter (routine). The average trends toward the Workshop's range by mid-campaign.

### With Gauntlet Iteration Speed

In the Gauntlet, players will cycle between matches rapidly. The Camp between Gauntlet matches must be *fast* --- probably Terminal-scope regardless of campaign settings. This means the Camp scope decision is really a campaign-only question. The Gauntlet's between-match screen should be a results panel + "Play Again" button, not a room to walk around in. Any Camp scope above Terminal must include a Gauntlet-specific fast mode.

This creates an interesting asymmetry: the campaign is a slow, atmospheric journey through a physical space; the Gauntlet is a rapid competitive loop with minimal downtime. The Camp scope determines how sharp the tonal shift feels when the player graduates.

### With Blueprint Editing Flow

The Drafting Table (Workshop/Outpost) creates a subtle but important design question: **should the player edit blueprints in the Camp or in the Mission?** If both, do changes sync? The cleanest answer is that the Camp's blueprint editor and the Mission's Plan screen are the same interface, accessed from different contexts. The Camp provides a pressure-free editing environment (no battlefield, no objectives). The Mission provides a purpose-driven one (this blueprint must solve this problem). This dual-access pattern exists in Darkest Dungeon (equip in town, swap in dungeon) and works well, but the player must understand that Camp edits carry forward.

At Terminal scope, this isn't an issue --- the blueprint library is a sidebar, not a station. At Workshop/Outpost scope, the Drafting Table must feel like a genuine advantage of visiting the Camp, not a redundant access point for a system already available in missions.

---

## Comparable Games

### Hades --- House of Hades

**Scope:** Rich. 5-10 minutes between runs. Multiple rooms, 15+ NPCs, dialogue trees, a shop, cosmetic customization, relationship advancement, weapon upgrades, story progression.

**Why it works:** The House IS the game's narrative delivery system. Combat is the mechanical loop; the House is the story loop. Removing the House removes 60% of Hades' emotional content. The game earns its hub time because every visit advances at least 2-3 character relationships.

**What Robot Uprising can learn:** The House works because it has *people in it*. Robot Uprising has the Predecessor and silence. Without a cast, the game cannot replicate Hades' hub density. Attempting to do so (adding NPC robots, a shop, cosmetic choices) would feel grafted onto a game whose identity is solitary engineering. The lesson is not "add NPCs" --- it is "justify every second of hub time with content the player cannot get elsewhere."

### Slay the Spire --- Map Screen

**Scope:** Minimal. 5-15 seconds between combats. The map IS the hub: a branching path with nodes (combat, event, shop, rest, elite, boss). The player makes one decision (which path) and moves on.

**Why it works:** The decision is the content. Choosing the path IS the between-combat engagement. There's no dead time because the map screen is a puzzle, not a lobby.

**What Robot Uprising can learn:** Robot Uprising's campaign is linear (no branching), so the map-as-decision model doesn't apply directly. But the principle does: **the between-mission moment should contain a decision, not just information.** The Terminal scope offers no decision (click next mission). The Workshop scope offers an optional decision (edit blueprints now or later). The Outpost scope offers an experiential choice (explore or proceed). The strongest Camp design makes the between-mission moment feel like a meaningful action, not a pause between meaningful actions.

### FTL: Faster Than Light --- The Ship

**Scope:** Zero dedicated hub. The ship IS the game state, visible at all times. Between jumps, the player manages crew, repairs, and makes the next navigation decision, all within the same view. There is no separate "hub screen."

**Why it works:** FTL collapses the distinction between hub and gameplay. The ship is always on screen. Crew management is continuous, not intermission-based. This creates relentless momentum --- the game never pauses to show you a room.

**What Robot Uprising can learn:** The Plan screen already functions like FTL's ship --- it IS the player's operational state, always available, always modifiable. A Camp that pulls the player AWAY from the Plan screen to a separate room is fighting FTL's lesson. The strongest argument for the Terminal scope is the FTL principle: don't create a space that competes with the space where the game happens.

### Darkest Dungeon --- The Hamlet

**Scope:** Medium-Rich. 2-5 minutes between expeditions. Multiple buildings (blacksmith, guild, tavern, abbey, sanitarium, stage coach), each with a functional purpose. No walking --- click-to-building navigation. Economy management (gold, heirlooms, provisions).

**Why it works:** The Hamlet is where consequences manifest. Your heroes come back stressed, injured, quirky. The Hamlet is where you deal with the fallout. The between-mission time is REACTIVE --- you're managing damage, not browsing content. This justifies the time because the decisions are urgent.

**What Robot Uprising can learn:** Robot Uprising has no consequence management between missions. Units don't get stressed. Blueprints don't degrade. There's no damage to repair. The Hamlet works because expeditions *cost* something that must be restored in town. Robot Uprising missions cost nothing except the player's time and attention. This means a medium-scope Camp must justify itself through PROACTIVE value (better information, better tools, better atmosphere) rather than REACTIVE necessity (heal, repair, manage). The Workshop's Drafting Table is proactive. The Outpost's Signals Room is proactive. Neither is urgent, which means neither is mandatory, which means both must be exceptional to earn their screen time.

---

## Recommendation

The Workshop (Scope Level 2) is the right target, with one element borrowed from the Outpost.

The Terminal is too thin. It works mechanically but creates no sense of place, no emotional anchoring, no visual progression. The campaign feels like a puzzle gauntlet rather than a journey. For a game that asks players to spend 6+ hours, providing no home base is a missed opportunity.

The Outpost is too thick. Four rooms without NPCs or dialogue trees will feel empty after 3 visits. The Perimeter is beautiful but indefensible on a budget. The 2-5 minute pacing tax is steep for a game built on tight iteration loops. The environmental storytelling is subtle enough that most players will miss it, and streamer-friendly enough that the 10% who notice will love it --- but the other 90% will click past it.

The Workshop hits the sweet spot: one room, 3-4 functional stations, visual progression through lighting and environmental accumulation, Predecessor commentary with spatial presence, and the option to spend 30 seconds or 2 minutes depending on the player's preference. Every object in the room does something. Nothing is decorative. The room changes visibly across the campaign, giving the player a spatial boot sequence that mirrors the textual one.

The one Outpost element worth stealing: the Signals Room's channel visualization. Not as a separate room --- as a wall-mounted display in the Workshop that expands when clicked. A spatial rendering of the player's communication architecture, visible in the background of every Camp visit, growing more complex as the campaign progresses. This gives the Workshop its unique visual signature and provides genuine analytical value that the Plan screen's UI cannot replicate. It earns its development cost because it is both beautiful and useful.

The Camp should be fully skippable. A "Continue" button on the Inspector screen should offer the option to go directly to the next mission, bypassing the Workshop entirely. The Camp exists for players who want it. It never exists to delay players who don't.

In the Gauntlet, the Camp reduces to Terminal scope automatically. The Workshop is a campaign artifact. The competitive loop demands speed.

Total development cost for the recommended scope: one isometric room with progressive lighting (1-2 weeks art), 4 clickable stations using existing UI systems (1 week engineering), channel visualization wall display (1-2 weeks engineering), Predecessor text system anchored to speaker grille (reuse boot log renderer, 2-3 days). Total: 3-5 weeks. Justifiable for the emotional return.

The line between a warm hub and a time-wasting distraction is this: **every second in the Camp must either tell the player something they didn't know, let them do something they couldn't do elsewhere, or make them feel something the mission screens don't provide.** The Workshop satisfies all three. The Terminal satisfies the first. The Outpost promises all three but delivers the third at disproportionate cost. Build the Workshop. Earn every second.
