# 6.06a — Haptic Vocabulary as Game Design Language

## Overview

Strategy games almost never take haptics seriously. Civilization VI on Switch ships basic rumble. Into the Breach doesn't appear to use HD Rumble at all. The entire turn-based/tactics genre treats controller vibration as an afterthought — a buzz on selection, a buzz on confirm, silence everywhere else. This is a catastrophic missed opportunity for Robot Uprising, because **the game's core mechanic is invisible information flowing through invisible channels**, and haptics can make the invisible tangible.

The question isn't "what should vibrate?" The question is: **can the player read their controller like a second screen?** Can the DualSense's left motor tell them something different from the right? Can the adaptive trigger resistance on L2 communicate buffer fill while R2 communicates production queue depth? Can the Joy-Con's HD Rumble make the player *feel* the difference between a scout's sonar ping and a relay's compression hum?

This document maps the complete haptic design space for Robot Uprising across three axes:
1. **Event vocabulary** — what game events get haptic expression, and what vibration pattern encodes each
2. **Platform exploitation** — what DualSense, Joy-Con, Xbox, and generic controllers each uniquely offer
3. **Haptic pedagogy** — how haptics teach game mechanics, and when they transition from tutorialization to gameplay-relevant information

The core thesis: **haptics in Robot Uprising should not be decorative. They should be a parallel information channel that communicates game state the screen cannot.** The player's hands should learn to read signals the way an operator's ear learns to read radio static — unconscious pattern recognition built through hours of correlated visual-tactile experience.

---

## The Haptic Event Taxonomy

Every haptic event in Robot Uprising falls into one of five categories, organized by **information urgency** (how time-sensitive the information is) and **information type** (aesthetic vs. gameplay-relevant).

### Category 1: UI Confirmation (Low Urgency, Aesthetic)

Micro-pulses that confirm player actions. These exist on every platform and every controller. They're the baseline — without them, the game feels numb.

| Event | Pattern | Duration | Intensity | Notes |
|-------|---------|----------|-----------|-------|
| Focus ring moves to new element | Single tick, 5ms | 5ms | 15% | Like a keyboard key bottoming out. Barely perceptible. Must not fatigue during rapid D-pad navigation. |
| Skill toggle on/off | Sharp double-tap | 12ms total (5+2+5) | 30% | Distinct "click" feel. ON and OFF are the *same* pattern — the screen shows the state, the hands confirm the action. |
| Rule row reorder (drag) | Continuous low rumble while dragging | Duration of drag | 10% | The "sliding gravel" feel. Stops instantly on release. Comparable: Luigi's Mansion vacuuming. |
| Rule row drop into position | Single thud | 8ms | 40% | Heavy relative to the drag rumble. The contrast between light-drag and heavy-drop makes the "slot in" feel satisfying. |
| Hook channel name autocomplete | Ascending three-note sequence | 30ms total (8+4+8+4+8) | 20% → 25% → 30% | Each tap slightly stronger. The "rising confirmation" motif — the game is agreeing with you. |
| Production queue item placed | Solid clunk | 10ms | 35% | Mechanical "factory conveyor" feel. Heavier than UI taps. |
| EXECUTE button highlight | Slow pulse, 1Hz | Continuous while highlighted | 15% peak | Heartbeat. The game is alive and waiting. Comparable: Hollow Knight's save bench proximity pulse. |

**Sensory description — UI Confirmation layer active:**
You're navigating the Plan screen with D-pad. Each element you pass feels like stepping on a slightly different floor tile — a tiny crystalline *tick* as the focus ring moves. You drag a rule row downward and the left grip hums softly, like sliding your finger along a textured surface. You release — *thunk*. The rule locks into its new position. The controller falls silent. You navigate to the EXECUTE button and the controller begins to breathe — a slow, warm pulse in both grips, steady as a resting heartbeat.

### Category 2: Board Events (Medium Urgency, Aesthetic + Informational)

During Sealed Watch, the player cannot interact. Their only inputs are their eyes and their hands. The controller becomes a seismograph — an instrument that makes the invisible visible through touch.

| Event | Pattern | Duration | Intensity | Left/Right Split | Notes |
|-------|---------|----------|-----------|------------------|-------|
| Tick clock fires | Sharp snap, both grips simultaneously | 3ms | 50% | Symmetric | Metronome. The backbone of the haptic timeline. Must be precise — exactly synchronized with the visual tick pip lighting. |
| Unit movement (friendly) | Soft directional pulse | 8ms | 20% | Biased toward direction of movement (left grip for westward, right for eastward) | The player builds unconscious spatial awareness of their army's movement. |
| Unit movement (enemy) | Same as friendly but with 2ms vibrato | 10ms | 25% | Same directional bias | The vibrato is the "enemy" texture. Over time, the player learns to feel the difference without looking — "something moved on my left side, and it felt... wrong." |
| Signal delivery (green flash) | Rolling wave, left to right or right to left matching signal direction | 20ms | 30% | Sequential — starts in one grip, crosses to other | The player feels information flowing. If a scout sends a signal eastward to a relay, the wave rolls left-to-right. Multiple simultaneous signals create a brief "rain on the roof" texture. |
| Signal drop (buffer full) | Abrupt cut — vibration that starts and truncates | 8ms start + sudden stop | 35% | Grip nearest to the unit that dropped | The "choked" feel. A signal tried to arrive and was silenced. This is gameplay-relevant: if the player feels a lot of choked signals, they know buffer overflow is happening *before* they see it in the Inspector. |
| Combat (one-shot kill, friendly) | Heavy impact, single strike | 15ms | 70% | Both grips | The biggest haptic event in the game. Rare, violent, unmistakable. Comparable: Hollow Knight's nail strike. |
| Combat (one-shot kill, enemy) | Same heavy impact + descending buzz | 25ms (15 + 10 fade) | 70% → 20% | Both grips → left grip fade | The dying unit "falls left" in the haptic space. A unit was lost. |
| Cell tagged (presence control) | Warm sustained hum, 200ms | 200ms | 15% | Nearest grip | Territory gained. The warmth accumulates over multiple tags — three tags in a row creates a growing warmth in one hand. |
| Buffer overload on any unit | Staccato jitter, 4 rapid pulses | 40ms (4 × 10ms) | 45% | Grip nearest to overloaded unit | The "alarm" pattern. Four rapid pulses = buffer stress. This is the most important gameplay-relevant haptic event — it tells the player something is wrong before the visual buffer bar might be noticed. |

**Sensory description — Sealed Watch with full haptic layer:**
The first tick fires — a crisp *snap* in both hands, like a conductor's baton strike. Your scouts begin moving. A gentle pressure drifts across your left palm — two scouts heading west. Then a rolling wave, left to right, as the first signal reaches the relay. Another wave, then another. The controller feels like it's breathing, information flowing through your hands like water through pipes.

Tick three. *Snap.* A signal arrives at the striker — you feel the wave complete its journey, left grip to right grip. But then — a choked vibration in your right palm. A signal tried to arrive and was swallowed. Buffer full. You file this away. Tick four. *Snap.* The staccato alarm — four sharp jabs in your right hand. Overload. And then: the heavy *impact* that shakes both hands. Combat. A kill. Whose? The visual will tell you. But your hands already know something dramatic just happened.

### Category 3: Architecture Health (High Urgency, Gameplay-Relevant)

These are haptic signals that encode information about the player's *system* — not individual events, but aggregate states. They run as continuous background textures during Sealed Watch.

| State | Pattern | Location | Intensity | Notes |
|-------|---------|----------|-----------|-------|
| Channel healthy (signals flowing, no drops) | Very faint continuous warmth | Both grips, uniform | 5% | The baseline "everything is fine" — almost subliminal. The player only notices it when it stops. |
| Channel congested (signals queuing) | Low-frequency rumble, like distant thunder | Both grips | 10-20% (scales with congestion) | Congestion builds. The controller slowly starts to feel heavier. Not an alarm — a premonition. |
| Channel dead (no signals for 3+ ticks) | Silence in one grip | One grip (side nearest dead channel) | 0% | The most alarming haptic event is *no haptic event*. One hand goes dead. The asymmetry is immediately noticeable. Comparable: the unsettling silence when a machine you've been ignoring stops humming. |
| EM emissions rising | High-frequency buzz, like a phone vibration | Both grips, slight right bias | 15-30% (scales with EM level) | The "we're getting loud" warning. At maximum EM, the controller feels like holding a ringing phone. The enemy can hear you. |
| Production queue active | Rhythmic pulse matching factory tick rate | Left grip only | 10% | The factory heartbeat. Left hand = production. When production completes a unit, the pulse pauses (the conveyor delivers) then resumes. |
| Resource critical (minerals < 5) | Slow deep throb, 0.3Hz | Both grips | 25% | The "running out" signal. Deep, unsettling, organic. Like a heartbeat slowing. |

**Sensory description — Architecture health layer during a bad turn:**
You're watching a mission go sideways. Both hands feel warm — the baseline hum of a working network. Then the left hand's warmth fades. Gone. Silence. One of your channels just died — you feel it before you see it. The right hand starts to rumble, low and growing, like thunder approaching. Congestion. Signals are backing up. Then the high-frequency phone-buzz begins layering on top — your EM emissions are climbing. Your architecture is getting loud, congested, and partially deaf, all at once. Your hands tell the whole story before the buffer bars change color.

### Category 4: Inspector Events (Medium Urgency, Analytical)

During the Inspector phase, haptics shift from passive sensing to active exploration. The player is scrubbing through a timeline and clicking to inspect — haptics now respond to *player inquiry*, not autonomous game events.

| Event | Pattern | Duration | Intensity | Notes |
|-------|---------|----------|-----------|-------|
| Timeline scrub (each tick) | Detent-style tick, like a scroll wheel | 3ms per tick | 20% | Each tick in the scrubber has a physical notch. Scrubbing fast feels like running a finger along a ratchet. |
| Hovering over a unit (pre-click) | Faint echo of that unit's buffer state | Continuous while hovering | 10% | Scouts feel "quick" (short rapid pulses). Relays feel "thick" (sustained low hum). Strikers feel "sharp" (medium single pulse). Commands feel "heavy" (deep slow throb). The player can feel the difference between unit types through the controller. |
| Inspecting a full buffer | Tight, buzzing tension | Continuous while inspecting | 30% | The buffer is packed. The controller feels compressed, like the unit feels compressed. |
| Inspecting an empty buffer | Hollow, ringing tone | Continuous while inspecting | 15% | Light and empty. The contrast with a full buffer is stark. |
| Signal genealogy trace (following a signal's path) | Rolling wave replicating the original signal delivery | 200ms | 25% | You click "trace this signal" and feel it travel through the relay chain, same directional rolling as Category 2 but slowed down for analysis. |
| Pivot tick (EDT marker) | Heavy double-thud | 20ms | 60% | When you scrub to the tick the system identified as the effective determination tick, the controller gives you a "this is important" physical bookmark. |
| Dropped signal detail view | The choked-cut pattern from Category 2, replayed slower | 30ms | 35% | You're examining a dropped signal. The controller lets you *feel* the drop in slow motion. |

**Sensory description — Inspector deep-dive session:**
You enter the Inspector. The controller goes quiet — the autonomous hum of Sealed Watch is gone. Now it responds to you. You grab the timeline scrubber with the right stick and drag. *Click. Click. Click.* Each tick notches through your thumb like a physical dial. You hover over RELAY-C. A thick, sustained hum rises in your left palm — that's the relay's "voice." You click. The buffer detail opens. All 12 slots full. The controller buzzes tight, like holding a phone getting a rapid series of notifications. You trace a signal — and feel it flow, left grip to right grip, the same rolling wave from Sealed Watch but stretched out, examinable. You reach tick 47 and the controller *thuds* twice, hard. The pivot. Everything changed here.

### Category 5: Narrative/Emotional (Low Urgency, Aesthetic, Campaign-Only)

Reserved for story beats and milestone moments. Used sparingly — these are haptic punctuation marks.

| Event | Pattern | Duration | Intensity | Notes |
|-------|---------|----------|-----------|-------|
| Boot log text printing | Typewriter-style micro-taps | Duration of text | 5% per character | Each character that appears on the boot log delivers a tiny tap. The controller becomes a telegraph. This should feel like Morse code arriving. |
| Subsystem ONLINE | Rising three-note confirmation sequence | 50ms | 20% → 30% → 40% | Same pattern as hook autocomplete but grander. Each subsystem wakes up in the player's hands. |
| Mission victory | Sustained warm resonance, slow fade | 2000ms | 40% → 0% | Victory feels like warmth dissipating. Relief. The controller exhales. |
| Mission failure | Descending rumble + silence | 500ms + 500ms silence | 50% → 0% | The machine dying. The silence after is deliberate — the controller goes completely dead for half a second. |
| First sealed watch begins | Single heartbeat, then silence | 200ms | 35% | "We're alive. Now watch." |
| Predecessor voice lines (boot log narrator) | Faint arrhythmic pulse | Duration of voice line | 8% | The Predecessor's text gets an irregular heartbeat pattern — like a damaged system's uneven clock. It feels old, fragile, not-quite-stable. |

---

## Platform-Specific Exploitation

### DualSense (PlayStation 5)

The DualSense is the richest haptic platform available. Two independent linear haptic motors (left and right grip), two adaptive triggers (L2 and R2), a built-in speaker, and a microphone. Robot Uprising should treat it as four independent haptic channels.

**Adaptive Trigger — L2: The Architecture Reader**

L2's trigger resistance encodes the player's current architecture health on the Plan screen.

- **No issues detected:** L2 is loose, zero resistance. The trigger falls freely to full depression.
- **Warning (dead channel, congestion risk):** L2 develops a slight resistance zone at 50% depression. The player feels a "speed bump" halfway through the pull. This is the "something's not perfect" signal.
- **Critical (buffer overflow predicted, multiple dead channels):** L2 becomes stiff. The trigger fights back. The player must push through resistance to navigate past the warning. This doesn't *prevent* action — it physically communicates concern.

On the Sealed Watch screen, L2 resistance tracks aggregate buffer health across all units:
- Buffers under 50%: loose
- Buffers at 75%: medium resistance
- Buffers at 100% (overflow): heavy resistance, almost locked

The player's left index finger becomes a buffer-fill gauge. They don't need to scan every unit's buffer bar — they *feel* the system's information pressure.

**Adaptive Trigger — R2: The EXECUTE Gate**

R2 is the EXECUTE button on console (see also 6.06b for deep exploration). The resistance profile:

1. On the Plan screen, R2 has a **two-stage pull**.
2. First stage (0-50%): light resistance. The player enters the "commit zone."
3. A **tactile wall** at 50%. The trigger stops. The player must consciously push through.
4. Second stage (50-100%): heavy resistance, like drawing a bowstring. The trigger fights back.
5. Full depression: EXECUTE fires.

This creates a **physical commitment ritual**. Every launch is a deliberate act — the controller forces the player to push through a wall, building tension for the Sealed Watch that follows. Gran Turismo 7 uses this for braking. Ratchet & Clank uses it per-weapon. Robot Uprising uses it for the single most important action in the game.

**Speaker Integration:**

The DualSense's built-in speaker can play the boot log text as actual audio — tiny typewriter clicks coming from the controller itself, synchronized with the haptic typewriter taps. Signal delivery could play a faint directional *ping* from the speaker, spatially offset from the TV audio. The controller becomes a personal receiver — you're hearing your own network's signals.

**Full DualSense Haptic Map (Plan Screen):**

```
Left Motor: UI navigation feedback + architecture health background
Right Motor: Board interaction feedback + production queue pulse
L2 Trigger: Architecture health resistance (warnings → critical)
R2 Trigger: EXECUTE two-stage commitment gate
Speaker: Boot log typewriter + personal signal pings
```

### Joy-Con HD Rumble (Nintendo Switch)

The Joy-Con's HD Rumble uses Linear Resonant Actuators with wide frequency range — the "ice cubes in a glass" precision. The Switch 2's improved HD Rumble 2.0 adds micro-perforations for quieter operation and wider frequency sweep.

**Separated Joy-Con Mode (Tabletop/TV):**

With Joy-Cons separated, left and right hands become independent instruments.

- **Left Joy-Con = Architecture hand.** Channel health, production pulse, resource state. The left hand monitors the system.
- **Right Joy-Con = Battlefield hand.** Unit movement, combat impacts, signal delivery waves. The right hand tracks the board.

This split creates an extraordinary opportunity: during Sealed Watch, the player's two hands monitor two different dimensions of the game. The left hand tells them *how the system is doing* while the right hand tells them *what's happening on the board*. Information warfare plays out across both palms.

**Handheld Mode:**

In handheld mode, both actuators are in the Switch body. The haptic vocabulary shrinks — left/right split is barely perceptible through the device chassis. Compensation strategies:
- Replace left/right spatial encoding with **intensity variation** (light = architecture, heavy = battlefield)
- Use **frequency differentiation** instead of spatial: low-frequency = system state, high-frequency = board events
- Reduce background haptics (Category 3) to avoid masking important event haptics (Category 2)

**HD Rumble-Specific Techniques:**

- **The Marble Count.** In 1-2-Switch, HD Rumble lets players count virtual marbles by feel alone. Apply this to buffer state: when inspecting a unit, each buffer slot that's occupied produces a distinct "marble in a box" sensation. The player literally counts buffer contents by feel.
- **Texture differentiation.** Different unit types get different HD Rumble textures: Scout = quick, light taps (insect legs). Relay = smooth sustained hum (server fan). Striker = sharp metallic click (weapon mechanism). Specialist = irregular syncopated pattern (lock-picking). Command = deep, slow, authoritative pulse (mainframe heartbeat).

### Xbox Controller (Series X/S, PC via XInput)

Standard dual-motor rumble (large motor + small motor per grip) plus trigger rumble motors in each trigger. Less precise than DualSense or HD Rumble, but the trigger motors are unique to Xbox.

**Trigger Rumble Mapping:**

- **Left trigger motor:** Fires during signal delivery — a faint buzz in the trigger finger as information flows through the network.
- **Right trigger motor:** Fires during combat — a sharp buzz when a strike connects.

This is subtler than DualSense adaptive triggers — no resistance change, just localized vibration. But it still creates a two-channel system where the player's index fingers encode different information from their palms.

**Impulse Trigger Limitations:**

Xbox impulse triggers can't resist or stiffen. The EXECUTE commitment ritual must be purely haptic (escalating vibration as the button is held, not physical resistance). The two-stage pull becomes a two-stage *buzz*: soft rumble at 50%, intensifying to strong rumble at 100%, then sharp snap on activation.

### Generic / Steam Deck / Accessibility Controllers

For controllers with basic dual-motor rumble and no advanced features:

- **Essential vocabulary only:** Category 1 (UI confirms) + Category 2 (board events: tick snap, combat, signal delivery) + Category 5 (narrative beats).
- **No background textures** (Category 3) — basic motors can't maintain subtle continuous patterns without becoming annoying.
- **No Inspector haptics** (Category 4) — without precision motors, timeline scrubbing detents and buffer-state textures would feel like random buzzing.

The game must be fully playable with this reduced vocabulary. Haptics enhance but never carry essential information. Everything the controller communicates is also visible on screen. Haptics are a *redundant* channel, not an exclusive one.

**Steam Deck:**

The Steam Deck uses dual trackpad haptics (LRA-based, similar to HD Rumble quality) plus standard dual-motor rumble. The trackpads can deliver precision haptics when touched. This opens a unique opportunity:

- **Trackpad-as-minimap.** The left trackpad could deliver position-encoded haptics when the player rests their thumb on it — different vibration patterns in different zones of the pad corresponding to different board regions. Dragging a thumb across the trackpad "scans" the battlefield haptically.

This is highly experimental and probably a Phase 3 feature, but it's a unique haptic surface no other platform offers.

---

## Haptic Tutorialization: Teaching the Language

The haptic vocabulary is useless if the player doesn't learn to read it. The onboarding must teach haptics the same way it teaches every other mechanic — through correlation, not instruction.

### Phase 1: Correlation (Missions 1-2)

The player experiences haptics alongside strong visual cues. They don't know they're learning a haptic vocabulary.

- **Mission 1:** Buffer filter puzzle. Every time the player removes noise from a buffer (visual: blue slot dissolves), the controller gives the corresponding "rule drop" *thud*. The player's hands learn: thud = slot change.
- **Mission 1 Sealed Watch:** First tick snap. The metronome begins. By the end of the first sealed watch (maybe 8-10 ticks), the player's body has internalized the rhythm. They start anticipating the next snap before it fires.
- **Mission 2:** Signal delivery is introduced. The first time a signal flows from scout to relay, the player sees the green flash AND feels the rolling wave. Left grip to right grip. They don't think about it — their hands just record "information moved."

### Phase 2: Differentiation (Missions 3-4)

The player starts noticing that different haptic events feel different. The vocabulary develops contrast.

- **Mission 3:** First signal drop. The player has felt successful signal deliveries (smooth rolling waves) for two missions. Now, for the first time, a signal gets dropped — the choked cut-off. The *absence* of the familiar wave, replaced by a truncated stutter, registers physically before cognitively. "Something didn't work. It felt... wrong."
- **Mission 4:** First combat event. Heavy impact, both grips. The player has only felt light touches for three missions. The first kill is *loud* in the hands. The contrast teaches importance hierarchy — not everything vibrates equally.

### Phase 3: Reliance (Missions 5-7)

The player begins using haptics as a primary information source, even though they don't realize it.

- **Mission 5:** Factory introduced. Production queue pulse begins in the left grip. At first, it's just another sensation. But by mid-mission, the player is subconsciously tracking production timing by the left-hand pulse. When a unit completes, the pause-and-resume feels like a hiccup. They check the board. "Oh, a new scout spawned."
- **Mission 6-7:** Multiple channels active. The aggregate health background (Category 3) is running at full vocabulary. Channel death — one hand going silent — becomes the primary "something is very wrong" signal. The player doesn't need to scan the channel map panel. Their left hand tells them.

### Phase 4: Mastery (Missions 8-10, Gauntlet)

Expert players read the controller like a musical instrument.

- **Mission 8+:** The player can distinguish between scout movement (light directional pulse) and enemy movement (same pulse with vibrato) *without looking at the board*. They're tracking troop positions through two simultaneous sensory channels (visual + haptic). Their APM-equivalent goes up not because they act faster, but because they process information faster.
- **Gauntlet:** In competitive play, the aggregate health layer becomes a real-time dashboard. The player watches the board with eyes while monitoring channel health, buffer pressure, EM emissions, and production cadence through haptics. Five information streams, two sensory channels.

---

## Player Journeys

#### Journey: Tomás, 16, First Strategy Game — "The Hands That Learn"

**Context:** Mission 2. Tomás has played Mission 1 (buffer filter puzzle) and is now wiring his first hook. He's on PS5 with a DualSense.

**Minute 0:00 — Plan Screen, First Hook**
Tomás is on the Plan screen. He navigates the focus ring to the Hooks panel — each D-pad press delivers a tiny *tick* through both grips. He finds the channel name field and types "scout-data" using the on-screen keyboard. As autocomplete kicks in, three ascending taps play in his right palm — the "rising confirmation" motif. He doesn't consciously register it. His fingers just feel the game agreeing with him.

He drags the hook into position. A soft rumble accompanies the drag — like sliding a block across a textured surface. He releases. *Thunk.* The hook locks in. The contrast between the light drag and the heavy drop is satisfying. He does it again, wiring a second hook. *Slide... thunk.* He smiles without knowing why.

**Minute 1:30 — Pre-EXECUTE**
Tomás navigates to the EXECUTE button. The controller begins pulsing — slow, warm, rhythmic. A heartbeat. He hovers for three seconds, reading his channel map. The pulse continues. It feels alive. He presses R2.

The trigger resists at 50%. Tomás frowns and pushes harder. The trigger fights back — not enough to stop him, but enough that he *feels* the commitment. He punches through. EXECUTE fires.

**Minute 2:00 — First Sealed Watch with Haptic Layer**
The screen transitions. *Snap.* The first tick fires in both hands. Tomás watches his scout move. He feels a gentle drift in his left palm — the scout heading west. Then a rolling wave, left to right, as the scout's signal reaches the relay. It's subtle. Tomás doesn't think "signal delivery." He just feels something flowing.

Three ticks pass. Each *snap* is a heartbeat. His hands are learning the rhythm. Then — a new sensation. A choked vibration in his right palm. Cut off, strangled. Something didn't arrive. Tomás doesn't know what a "dropped signal" is yet. But his right hand just told him something went wrong on that side of the board.

**Minute 3:00 — Post-Watch**
The match ends. Tomás enters the Inspector. He scrubs the timeline — *click, click, click* — each tick notching through his thumb like a physical dial. He reaches tick 5 and feels a double-thud. The pivot. He stops scrubbing. "Something happened here." He clicks on the relay. The controller hums — thick and sustained. Relay voice. He sees the full buffer. The controller buzzes tight. He traces the dropped signal. The choked-cut plays again in slow motion. Now he understands: the sensation his right hand recorded during the match *was* the signal drop. He connects the physical memory to the visual explanation.

**Minute 4:00 — "Oh."**
Tomás goes back to the Plan screen. He adjusts the buffer eviction priority. Before pressing EXECUTE again, he hovers. The heartbeat pulse resumes. But this time, L2 feels different — there's a slight resistance bump at 50% that wasn't there before. Something in his architecture is flagged. He checks the channel map. Dead channel warning. He fixes it, and L2 loosens. Then he pushes through R2 again and watches.

**UI Annotations:**
- DualSense left grip: architecture health background, production queue pulse, UI navigation
- DualSense right grip: board events (movement, signals, combat), UI navigation
- L2 trigger: architecture warning resistance (0 = clean, resistance = warning, stiff = critical)
- R2 trigger: two-stage EXECUTE gate (wall at 50%, resistance to 100%)
- Controller speaker: boot log typewriter, personal signal pings

---

#### Journey: Dr. Priya, 38, ML Engineer — "The Dashboard in Her Hands"

**Context:** Mission 7, Command agent introduced. Priya has been playing for six hours. She's on Switch with separated Joy-Cons in TV mode.

**Minute 0:00 — Complex Architecture, Plan Phase**
Priya's architecture has 8 units across 4 channels. Her left Joy-Con hums faintly — the factory pulse. Her right Joy-Con is silent. She's in Plan mode; no board events yet.

She's configuring the Command agent. It has 6 hook slots and 14 buffer slots. She wires a `reassign` hook to channel "emergency" — and as she types "emergency," the left Joy-Con delivers the rising three-note confirmation. She's been hearing this for hours. It's muscle memory now. Confirmation comes through her hands, not her eyes.

**Minute 2:00 — EXECUTE and Sealed Watch**
She launches. The Joy-Cons go live.

The first 10 ticks feel familiar: *snap, snap, snap*, gentle directional pulses as scouts fan out, rolling waves as signals flow. Both Joy-Cons are alive with data. The left Joy-Con carries the factory pulse — rhythmic, steady, grounding. Every 4 ticks, a pause-hiccup as a unit completes. She tracks production by feel without looking at the base.

Tick 14: her left Joy-Con's warmth fades. Not all of it — but the "emergency" channel's contribution drops out. Something stopped. She knows before looking: the emergency channel has no traffic. Her command agent's emergency reassign hook hasn't fired because no emergency has occurred. This is actually fine. But her hands flagged it for consciousness.

Tick 22: the right Joy-Con delivers four rapid staccato pulses. Buffer alarm. She can't check — sealed watch. But she files the location: right side, so it's the eastern units. She watches the buffer bars on the board and sees RELAY-B's bar go amber. Her hands were 0.5 seconds ahead of her eyes.

Tick 31: enemy movement. She feels the vibrato-pulse in her left hand — enemy heading west. Normal movement would be smooth. This has texture. She's learned to feel the difference. She watches for the enemy on the board. There it is — enemy striker approaching from the west. Her left hand told her before her eyes scanned.

**Minute 5:00 — Inspector Deep Dive**
Priya enters the Inspector. Both Joy-Cons go quiet. She scrubs to tick 22 — *click click click* through the detents. She hovers over RELAY-B. The right Joy-Con produces a thick hum — relay voice. She clicks. Buffer full, 12/12. The Joy-Con buzzes tight. She traces the signals that filled it. Each trace replays the rolling wave in slow motion — she feels four signals arriving in sequence, each wave slightly different in speed (different source distances). The fifth signal — the one that overflowed — replays as the choked cut. She *felt* the drop in real-time at tick 22. Now she's *re-feeling* it in analysis. The tactile memory bridges both phases.

She scrubs to the EDT at tick 38. Double thud. She inspects the state. The command agent fired its reassign hook here — too late. She adjusts the rule priority and re-launches.

**UI Annotations:**
- Left Joy-Con: architecture hand (channel health, production pulse, EM emissions)
- Right Joy-Con: battlefield hand (unit movement, combat, signal delivery, buffer alarms)
- HD Rumble texture per unit type: scout (insect legs), relay (server fan), striker (metallic click), specialist (lock-picking), command (mainframe heartbeat)
- Separated Joy-Cons enable dual-information-stream reading during Sealed Watch

---

#### Journey: Marcus, 52, History Teacher & Accessibility Advocate — "The Vibration He Turned Off"

**Context:** Mission 3. Marcus is playing on Xbox Series X. He has mild nerve damage in his left hand from a car accident — reduced sensitivity. He's been playing with haptics on but is considering turning them off because the left-hand signals feel inconsistent.

**Minute 0:00 — Noticing the Asymmetry**
Marcus finishes Mission 2 and enters Mission 3. During Sealed Watch, he notices something: when signals flow westward, he's supposed to feel the rolling wave start in his right grip and move to his left. But his left hand barely registers the arrival. The directional information — a key part of the haptic vocabulary — is lost.

He pauses at the debrief. Settings menu. He finds "Haptic Configuration" and opens it.

**Minute 1:00 — The Haptic Accessibility Panel**
The panel isn't just an on/off toggle. It's a full customization surface:

- **Per-hand intensity scaling.** A slider for each grip: 0% to 200%. Marcus drags his left hand to 180%. The controller buzzes to preview. He can feel it now.
- **Per-category toggles.** He can disable Category 3 (background architecture health) while keeping Category 2 (board events). The background hum was using up his sensory bandwidth and masking the event pulses. He turns off background, keeps events.
- **Spatial encoding toggle.** "Convert directional pulses to intensity variation." He enables this. Instead of left/right spatial encoding, all directional information becomes lighter (westward) vs. heavier (eastward). Both hands get both signals, just at different strengths.
- **Visual haptic indicator.** A toggle that shows a tiny waveform visualization in the corner of the screen, making haptic events visible. For players who can't feel them at all.

**Minute 2:30 — Customized Haptic Experience**
Marcus re-enters the Sealed Watch with his adjusted settings. The tick snap is strong in both hands. Scout movement arrives as intensity variation — lighter pulses mean west, heavier mean east. He can parse this with just his right hand. Signal delivery is strong in both grips simultaneously rather than rolling. Combat impact is unchanged — both hands, full force.

The background architecture layer is off. His hands feel cleaner — fewer signals competing for attention. He's trading information density for clarity. But the event vocabulary still works. The choked signal drop. The staccato buffer alarm. The combat impact. The tick metronome. His hands carry the essential story.

**Minute 4:00 — "I'm Keeping Them On"**
Marcus finishes Mission 3. In the debrief, he realizes he identified the enemy combat event 0.3 seconds before seeing it — the heavy impact registered in his right hand while his eyes were tracking a scout. The haptics are working as a second attention channel even with reduced sensitivity. He keeps them on.

**UI Annotations:**
- Haptic Accessibility Panel: per-hand intensity (0-200%), per-category toggles (5 categories), spatial-to-intensity conversion, visual haptic indicator
- Xbox impulse triggers: left trigger = signal buzz, right trigger = combat buzz
- Essential vocabulary works on reduced-feature controllers
- Accessibility design: haptics are redundant (never exclusive), customizable per-hand, convertible between encoding schemes

---

#### Journey: Zara, 24, Competitive Gauntlet Player — "Reading the Controller Blind"

**Context:** Gauntlet Season 3, Commander tier. Zara is on PS5. She's developed a technique she calls "blind reads" — closing her eyes during the first 5 ticks of a Sealed Watch to gather information purely through haptics, then opening her eyes with a pre-formed mental model of what happened.

**Minute 0:00 — Pre-Match Ritual**
Zara is in the deploy queue. Her L2 trigger is loose — architecture clean. R2's heartbeat pulse is steady. She adjusts one final hook, feels the ascending confirmation taps, and pushes through R2's two-stage gate. The trigger resists. She punches through. The match begins.

**Minute 0:01 — Eyes Closed**
Zara closes her eyes. *Snap.* Tick 1. Her scouts are moving — she feels light directional pulses. Two going right (strong right-grip). One going left (light left-grip, confirmed by her tuned sensitivity at 130% left). Her factory pulse begins in the left grip — rhythmic, every-other-tick cadence matching her 2-tick production queue.

*Snap.* Tick 2. Rolling wave, left to right. First signal. A second rolling wave, almost simultaneous but slightly delayed — two scouts reporting at once. The "rain on the roof" texture. Both signals arrived. No choked cuts. Good.

*Snap.* Tick 3. Enemy movement. Vibrato-pulse in her right grip. Enemy heading east — toward her relay. She notes this. Her left grip still hums with healthy channel warmth. No dead channels. EM emissions are low — no high-frequency phone-buzz.

*Snap.* Tick 4. More signal deliveries. A choked cut in her right grip. One signal dropped. Her relay's buffer is getting full. And — there — a subtle increase in the left-grip congestion rumble. The architecture is straining.

*Snap.* Tick 5. Zara opens her eyes.

**Minute 0:06 — Eyes Open, Model Confirmed**
She opens her eyes with a mental model: "Two scouts right, one left. Enemy approaching east relay. Relay buffer approaching full. One signal already dropped. Architecture healthy otherwise." She scans the board. Correct on all counts. The haptic model matched reality.

She watches the remaining ticks with eyes open. The haptics continue enriching her perception — she processes information through two channels simultaneously, hands filling in details her eyes might miss while focused on a specific unit.

**Minute 2:00 — Post-Match, Streaming**
Zara is streaming. "Chat, I'm telling you — the blind read at tick 3 told me the relay was in trouble before I even looked. The choked signal in my right hand plus the congestion rumble building in my left. By the time I opened my eyes I already knew my game plan for the debrief." Chat is amazed. The clip — 15 seconds of her eyes closed, describing what she feels in her hands — gets 50K views.

**TikTok clip:** Zara's face, eyes closed, controller in hands. She narrates: "Scout right... scout right... enemy heading east... signal dropped, relay's filling up... [opens eyes] yep." The board confirms everything. Cut to slow-mo replay with haptic waveform overlay. Text: "She read the match with her hands."

**UI Annotations:**
- Expert haptic reading as emergent skill (not taught, discovered through mastery)
- DualSense full vocabulary: 5 categories active simultaneously
- L2 as continuous architecture gauge during Sealed Watch
- "Blind reads" as community-discovered technique and streaming content format
- Haptic waveform overlay in replay as spectator/streaming feature

---

## Strengths

1. **The Invisible Made Tangible.** Robot Uprising's core challenge is that the most important things — information flow, buffer states, channel health — are invisible. Haptics make them physically present without adding visual clutter.

2. **Two-Channel Information Processing.** Expert players will develop unconscious haptic monitoring that runs alongside visual attention, effectively doubling their information bandwidth. This is genuinely new — no strategy game has attempted it.

3. **Platform Differentiation.** DualSense adaptive triggers create experiences literally impossible on other platforms. This gives the PS5 version a genuine premium feel. Joy-Con separation enables the architecture-hand/battlefield-hand split. Each platform gets a unique haptic identity.

4. **Emergent Mastery.** "Blind reads" and haptic-first diagnosis are skills the game never teaches — they emerge from the vocabulary being consistent and rich enough to encode real information. This is the Factorio belt-throughput-intuition equivalent — a skill ceiling that rewards investment.

5. **Accessibility by Design.** Because the haptic vocabulary is redundant (all information is also visual), it naturally supports players with reduced sensation. The per-hand intensity scaling and spatial-to-intensity conversion are cheap to implement and solve real accessibility needs.

## Weaknesses

1. **The "Turn It Off" Problem.** Academic research (2025 SAGE narrative review) confirms: many players disable vibration in multiplayer games due to the effort required and slower response times. If Gauntlet players find haptics distracting, they'll disable them — and the game must be fully playable without them.

2. **Fatigue.** Continuous background haptics (Category 3) over a 10-minute Gauntlet session may cause hand fatigue or sensory habituation. The warmth fades from perception. Calibrating intensities to remain perceptible without causing fatigue is a hardware-dependent tuning nightmare.

3. **Hardware Fragmentation.** The gap between DualSense (4 haptic channels, adaptive triggers, speaker) and a generic USB gamepad (2 buzzy motors) is enormous. The "essential vocabulary" that works on generic controllers is dramatically less expressive than the full DualSense experience. Testing across all controllers is expensive.

4. **Haptic-Audio Interference.** If the player wears headphones, they won't hear the DualSense speaker. If they play in handheld Switch mode, the haptic spatial encoding degrades. Each physical setup requires different calibration.

5. **Tutorialization Delay.** The haptic vocabulary takes 3-5 missions to internalize. A player who tries the game for 15 minutes at a friend's house will experience mostly Category 1 (UI clicks) — the least interesting layer. The deep value of haptics requires investment the demo can't demonstrate.

---

## Interaction Effects

| System | Interaction |
|--------|-------------|
| **Sealed Watch (locked)** | Haptics are *most powerful* here because the player cannot interact — their hands become passive sensors. The sealed-watch-no-tools rule creates the design space for haptic monitoring. If the player could pause and inspect during watch, haptics would be redundant with visual tools. |
| **Two-Act Debrief (locked)** | Act 1 (sealed emotional) uses passive haptics. Act 2 (inspector analytical) uses active haptics. The haptic vocabulary shifts between acts, reinforcing the emotional → analytical transition. |
| **Buffer System (locked)** | Buffer fill is the primary continuous haptic metric (L2 resistance, background congestion rumble, tight buzz on inspection). The fixed-size buffer model is perfect for haptic encoding — a percentage fill maps cleanly to a percentage intensity. |
| **Signal Latency (locked)** | The 1-tick-per-hop latency means signal delivery waves have duration that depends on hop count. A 4-hop signal takes 80ms to roll across the controller; a 2-hop signal takes 40ms. Players can *feel* signal chain length. |
| **EM Emissions (locked)** | The phone-buzz escalation gives EM a tangible presence. Players can monitor stealth budgets through haptic intensity without checking the EM overlay. |
| **Building Blocks — Priority Queue (locked)** | Rule reordering on the Plan screen gets the drag-rumble → drop-thud pattern, making priority manipulation physically satisfying. |
| **Console Controller Adaptation (6.06)** | This document extends the controller adaptation by defining what each button/motor does across all three screens. The focus ring navigation and radial wheel from 6.06 get haptic accompaniment here. |
| **DualSense EXECUTE Gate (6.06b)** | R2 adaptive trigger resistance is sketched here but explored in depth in 6.06b. |
| **Accessibility (6.08)** | The per-hand customization, spatial-to-intensity conversion, and visual haptic indicator integrate with the accessibility framework. Haptics are always redundant with visual information. |
| **Mobile/Touch (6.07)** | Taptic Engine on iPhone and Android haptic APIs can deliver a subset of this vocabulary through the touchscreen — light taps for UI, medium for board events, heavy for combat. But the spatial encoding is impossible on a single device. |

---

## Comparable Games & Media

| Game/Medium | What It Does | What Translates |
|-------------|-------------|-----------------|
| **Hollow Knight** (Switch) | HD Rumble creates weight and impact for a 2D character — wall slides, double jumps, nail strikes all have unique haptic profiles. | The "haptic texture per action" approach. Every Robot Uprising event type should feel as distinct as Hollow Knight's nail strike vs. wall slide. |
| **Gran Turismo 7** (PS5) | L2 brake resistance stiffens under hard braking. R2 throttle fights back on traction loss. Haptic grips differentiate gravel from asphalt from grass. | L2-as-continuous-gauge and R2-as-commitment-gate are directly inspired by GT7's trigger profiles. The trigger as an analog information display, not just a button. |
| **Ratchet & Clank: Rift Apart** (PS5) | Every weapon has a unique adaptive trigger profile — a shotgun has a hard break at 50%, a rapid-fire gun has rhythmic pulses. | Different game elements getting different trigger profiles. The EXECUTE gate (heavy) vs. the UI navigation (light) contrast. |
| **1-2-Switch** (Switch) | Ball Count: count marbles by HD Rumble alone. No visual. Pure haptic information channel. | Proof that HD Rumble can encode discrete countable information. Buffer slots as "marbles in a box" — feel the count. |
| **Luigi's Mansion 3** (Switch) | Vacuum suction creates sustained directional rumble. Tracking hidden enemies through rumble "proximity pulse." | Sustained directional rumble for channel health. The "proximity" pulse concept for hovering over units in the Inspector. |
| **Control** (PS5) | DualSense haptics encode supernatural atmosphere — telekinetic blast, levitation hum, environmental resonance. Not informational, but *tonal*. | The Predecessor's irregular heartbeat pattern. Narrative/emotional haptics that establish tone through touch. |
| **Real-world: Morse code operators** | Trained operators read Morse by "feel" through the hand resting on the telegraph key, not by conscious decoding. Years of practice create unconscious pattern recognition. | Zara's "blind reads." The haptic vocabulary is designed to be learnable at the unconscious level through thousands of correlations over dozens of hours. |
| **Real-world: Surgical haptic feedback** | Surgeons receive tactile feedback through robotic instruments — tissue density, resistance, slip. Information that would be dangerous to encode visually (eyes on the field). | The "hands monitor while eyes analyze" model. Haptics as a parallel attention channel, not a replacement for visual attention. |

---

## Sensory Summary

**What it LOOKS like:** Nothing. Haptics are invisible. The optional visual haptic indicator (accessibility toggle) renders a tiny waveform in the screen corner — two thin lines (left/right motor) oscillating with intensity.

**What it SOUNDS like:** On DualSense, the built-in speaker emits faint clicks (boot log typewriter) and directional pings (personal signal receiver). On other platforms, silence — haptics are silent by definition. The audio design (6.02) and haptic design should be cross-referenced to ensure no frequency conflicts between controller speaker and TV audio.

**What it FEELS like:** At rest, the controller is warm and alive — a faint background hum. In action, it breathes with the tick rhythm, flows with signal deliveries, chokes on dropped data, throbs with resource scarcity, and slams on combat. At its best, it feels like holding the network itself — a physical artifact of the information architecture the player designed. The controller is the last mile of the game's core metaphor: you built a nervous system, and now you're holding the nerve endings.

---

## New Aspects Discovered

- **6.06a-i — Haptic fatigue testing and intensity curves:** empirical testing protocol for continuous haptic vibration over 5/10/30/60 minute sessions; per-category intensity decay curves to counteract habituation; "haptic loudness war" avoidance principles
- **6.06a-ii — Audio-haptic synchronization specification:** formal timing constraints between visual events, audio cues, and haptic pulses; acceptable latency windows per category; DualSense speaker + grip + trigger three-channel sync requirements
- **6.06a-iii — Haptic replay overlay for streaming/spectating:** visual waveform representation of haptic events overlaid on replay footage; "what the player felt" as a spectator feature; waveform rendering spec for Twitch/YouTube overlays
- **6.06a-iv — Cross-platform haptic parity testing matrix:** systematic comparison of the same game events across DualSense / Joy-Con / Xbox / Steam Deck / generic; acceptable degradation thresholds; the "minimum viable haptic experience" definition
- **6.06a-v — Haptic modding API for community-created vibration profiles:** user-configurable haptic event → pattern mapping; community-shared haptic "skins"; accessibility profiles as a sharing use case; competitive integrity concerns for custom haptic configurations
