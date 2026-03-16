# 6.06c — Joy-Con Separated Asymmetric Co-Op: "Architect + Analyst"

**Aspect:** Two players on one Switch, each holding a single Joy-Con. One player owns the Plan screen (the Architect). The other owns the Inspector (the Analyst). The Sealed Watch is shared — the emotional core that bridges them.

**Category:** platform / multiplayer hybrid
**Wave:** 6 — Aesthetics & Platform

---

## The Core Fantasy

Two humans, one couch, one Switch, one uprising. Not "we're both doing the same thing side by side" — the Overcooked model — but "we literally cannot succeed without the other person's brain." The Architect builds the attention architecture. The Analyst diagnoses what went wrong. Neither can do the other's job. The Sealed Watch is the shared emotional experience that makes the handoff feel like a relay race baton pass.

This is **Keep Talking and Nobody Explodes** meets **StarCraft II Archon Mode** — but instead of one person reading a manual while the other defuses, one person builds the machine while the other reads the autopsy. The asymmetry isn't about information hiding (KTANE) or skill division (Archon). It's about **cognitive mode**: the Architect thinks in futures (what *should* happen), the Analyst thinks in pasts (what *did* happen). Same data, different temporal orientation.

The Joy-Con split makes this physical. The Architect holds the left Joy-Con — the one with the D-pad, the directional input, the forward-facing controller. The Analyst holds the right Joy-Con — the one with the face buttons, the selection input, the reactive controller. The asymmetry is in your hands.

---

## The Hardware Constraint

A single Joy-Con has:
- **1 analog stick** (also clickable)
- **4 directional buttons** (or face buttons, depending on which Joy-Con)
- **2 shoulder buttons** (SL / SR on the rail)
- **1 trigger** (L or R on top)
- **2 small buttons** (+/- and capture/home)
- **HD Rumble** motor
- **Gyroscope / accelerometer**

That's roughly 10 inputs per player. The full controller (both Joy-Cons combined) has ~20 inputs. Each player gets half.

**The critical constraint:** No radial wheel (requires two sticks). No simultaneous stick + D-pad input. Each player navigates with one stick OR D-pad equivalent — never both. This forces the UI to be simpler per player than the full console experience. That's not a bug — it's the design. Each player's UI is deliberately stripped down to match their role.

---

## Screen Ownership Model

### The Architect (Left Joy-Con)

**Owns:** The Plan screen workbench. Full control over blueprints, skills, rules, hooks, context config, production queue. The Architect designs the army.

**Controls during Plan phase:**
| Input | Action |
|-------|--------|
| Stick | Navigate focus ring within current panel |
| Up/Down/Left/Right (D-pad equivalent) | Switch between workbench panels (Skills → Rules → Hooks → Context) |
| SL | Previous blueprint |
| SR | Next blueprint |
| L (trigger) | Hold: show channel map overlay |
| Stick click | Confirm / Enter edit mode |
| - (minus) | Toggle production queue focus |

**What they see:** Full Plan screen — board preview on the left, workbench on the right. The Analyst's annotations appear as amber ghost markers on the board (see "The Feedback Loop" below). The Architect can see what the Analyst flagged but cannot access the Inspector tools.

**What they DON'T see:** The Inspector. No timeline scrubber. No decision traces. No context window charts. No event log. The Architect builds blind — informed only by the Analyst's verbal communication and the amber annotation markers.

### The Analyst (Right Joy-Con)

**Owns:** The Inspector. Full control over timeline scrubbing, unit inspection, context window examination, signal genealogy tracing, event log filtering.

**Controls during Inspector phase:**
| Input | Action |
|-------|--------|
| Stick | Navigate board (snap to units) |
| A | Inspect selected unit (open context window detail) |
| B | Back / close panel |
| X | Place annotation marker (amber flag on board) |
| Y | Toggle between context chart / event log / decision trace |
| SR | Next tick (scrub forward) |
| SL | Previous tick (scrub backward) |
| R (trigger) | Hold: fast scrub (4x speed through ticks) |

**What they see:** Full Inspector screen — board center with scrubable timeline, sidebar tools. The Architect's current blueprint edits appear as cyan ghost overlays on the board (the Analyst can see what the Architect is building but cannot modify it).

**What they DON'T see:** The workbench. No skill toggles. No rule editors. No hook configuration. No production queue. The Analyst can diagnose everything but fix nothing.

### The Sealed Watch (Shared — Both Joy-Cons)

**Both players watch the same screen.** The Sealed Watch is already a no-input phase (no skip, no pause, no tools). This is the shared emotional core — the moment both players experience the same battle together. Their robots succeed or fail together. Neither player can act. Both absorb.

**HD Rumble sync:** Both Joy-Cons feel the same haptic events — tick heartbeat (gentle pulse every second), combat impacts (sharp buzz on unit elimination), context overload (stuttering vibration when a unit stuns), EXECUTE confirmation (the escalating heartbeat from the trigger commitment ritual, translated to both Joy-Cons' HD Rumble). Even though the controllers are separated, the haptic channel binds them. They *feel* the same battle.

**The one asymmetric detail:** On the final tick (battle resolution), the Architect's Joy-Con delivers a single strong pulse (their creation succeeded or failed). The Analyst's Joy-Con delivers nothing — silence. A beat. Then a gentle, sustained vibration as the Inspector screen materializes. The torch passes. It's the Analyst's turn now.

---

## The Feedback Loop: How the Halves Communicate

The game's loop is:
1. **Architect builds** (Plan screen) — informed by Analyst's annotations from last round
2. **Both watch** (Sealed Watch) — shared emotional beat
3. **Analyst diagnoses** (Inspector) — places annotation markers for the Architect
4. **Repeat** until mission complete

### Annotation Markers — The Cross-Screen Communication Protocol

The Analyst's primary output is **annotation markers** — amber flags placed on the board during Inspector phase. When the Analyst identifies a problem ("RELAY-B's context window overloaded at tick 14 because it was listening to too many channels"), they place an amber flag on RELAY-B's position. The flag persists into the next Plan phase, appearing on the Architect's board preview.

**Flag types (Analyst selects with Y-cycle before placing):**

| Icon | Meaning | What the Architect sees |
|------|---------|------------------------|
| ⚠ | Unit problem — needs redesign | Amber warning triangle on unit's board position |
| 🔗 | Connection problem — hook/channel issue | Amber chain icon between two units, with a dashed line |
| 📊 | Context problem — overload/underuse | Amber bar graph icon on unit (context utilization direction arrow: ↑ overloaded, ↓ underutilized) |
| ✓ | Working well — don't change this | Green checkmark (the only non-amber marker — positive reinforcement) |

**The annotation limit:** Maximum 5 markers per debrief. This is critical — the Analyst must *prioritize*. "Everything is broken" is not useful feedback. The 5-marker limit forces the Analyst to identify the ROOT cause, not every symptom. This mirrors real engineering: the best bug reports are specific, not exhaustive.

**Verbal communication fills the gap.** The markers are structured shorthand. The real analysis is verbal — the Analyst talks through their findings while placing markers. "See that relay? It stunned at tick 14 because we had it listening to three channels but only gave it a 6-slot buffer. I'm marking it as a context problem. Maybe switch it to filter the terrain channel?" The game doesn't replace conversation — it scaffolds it.

### The Architect's Response Cycle

When the Architect sees annotation markers on their board, each marker has a tiny tooltip visible on hover (stick-navigate to the marker, press stick-click to read): a 12-character text label the Analyst typed using an on-screen keyboard during Inspector phase. Labels like "OVLD T14" or "HOOK DUP" or "NICE WIRING" — telegraph-style compression.

The Architect can **dismiss** markers (SL on a marker to acknowledge and fade it) or **pin** them (SR to keep visible through multiple Plan→Watch→Inspector cycles). Pinned markers accumulate across rounds, creating a shared history of known issues on the board.

---

## Five Modes of Joy-Con Co-Op

The Architect/Analyst split is the primary mode, but the same hardware supports variations:

### Mode A: "Classic Architect + Analyst" (Primary)

As described above. Clean role split. The Architect never sees raw debrief data. The Analyst never touches a blueprint. Communication flows through annotation markers and voice.

**Best for:** Friends of different skill levels. The experienced player takes Analyst (requires deeper understanding to diagnose), the newer player takes Architect (building is more intuitive than analyzing). The experienced player coaches through annotations and conversation.

### Mode B: "Hot Seat Swap"

After each Sealed Watch, both Joy-Cons are active on BOTH screens — but only one at a time. The Analyst debriefs first (their Joy-Con controls Inspector). When they're done placing markers, they press R to "pass the baton." The screen transitions to Plan. Now the Architect's Joy-Con activates. The Analyst's Joy-Con goes inert (a subtle dimming of HD Rumble confirms the swap).

**The twist:** During the Architect's Plan phase, the Analyst can press A on their (mostly inert) Joy-Con to "peek" — a 3-second read-only overlay of the current blueprint appears on the bottom of the screen, then fades. The peek is limited (one per 15 seconds) to prevent backseat driving. It lets the Analyst verify their annotation was understood without interrupting.

**Best for:** Couples or close friends who want structured turn-taking without rigid role locks. The "peek" mechanic adds a thread of connection without breaking the turn structure.

### Mode C: "Shared Inspector, Split Plan"

Both Joy-Cons control the Inspector together (each player can independently scrub and inspect different units — dual cursors on the Inspector board, one cyan, one amber). During Plan phase, the screen splits horizontally: top half shows the Architect's current blueprint edit, bottom half shows the Analyst's *proposed* annotation-to-fix suggestions (a simplified rule/hook change, using a subset of the full editor). The Architect can accept or reject each suggestion with one button press.

**The suggestion interface:** The Analyst doesn't get the full workbench. They get a constrained editor showing only the flagged unit's current configuration with toggle-able changes: "CHANGE rule priority from [evade > patrol] to [patrol > evade]?" (Y to suggest, B to skip). The Architect sees these suggestions as amber-highlighted changes on their full workbench, with (A = accept, B = reject) buttons.

**Best for:** Evenly-skilled players who both want analytical depth. The shared Inspector prevents the knowledge asymmetry that makes Mode A feel unbalanced between experts.

### Mode D: "The Announcer"

The Analyst's Joy-Con doesn't control the Inspector at all. Instead, it controls a **live commentary overlay** during the Sealed Watch. During the battle, the Analyst can:
- Press A to drop a "!" exclamation pip on the current board state (marks the tick for later review)
- Press Y to toggle between three emoji reactions displayed on the corner of the screen (😱 / 🎉 / 🤔)
- Gyroscope tilt triggers screen shake intensity (tilt the Joy-Con to emphasize moments — the more they react physically, the more the screen responds)

After the Sealed Watch, the "!" pips become bookmarks in the Inspector timeline. The Architect takes the Inspector this time (role reversal from Mode A), but the Analyst's emotional bookmarks guide where to look.

**Best for:** A player who doesn't want to learn the analytical tools + a player who wants the full loop. The Announcer role is accessible to anyone — even a non-gamer friend on the couch. They contribute *emotional intelligence* about which moments mattered, even without understanding the mechanics.

### Mode E: "The Relay" (3+ Player Party Mode)

Multiple Joy-Con pairs, each pair a 2-player team. On a single Switch, up to 4 Joy-Cons = 2 co-op teams playing **versus**. Team 1 (Joy-Cons 1+2) faces Team 2 (Joy-Cons 3+4) in a PvP match where each team has an Architect and an Analyst.

**The screen problem:** One Switch, one screen, four players. The Sealed Watch is shared (all four watch the same battle — both teams' armies on the same board). Plan and Inspector phases use split-screen: top half for Team 1, bottom half for Team 2. Each half shows that team's current phase screen (Plan or Inspector). Teams alternate phases — while Team 1 Plans, Team 2 Inspects, and vice versa.

**The information warfare layer:** During the shared Sealed Watch, all four players see the same battle. But during Inspector, each team only sees their own units' internal states — the enemy's decision traces, context contents, and hook wiring are hidden. The Analyst must infer enemy architecture from observed behavior. "Their scout moved toward our relay at tick 8 — they probably have a hook on our emission signature." This doubles the diagnostic challenge.

**Best for:** Game nights with 4 players. Rare setup but extremely memorable — the couch erupts when one team's architecture dismantles the other's. The TikTok clip writes itself.

---

## Player Journeys

### Journey 1: Mira (28, UX Designer) + Dante (31, Musician) — First Co-Op Session

**Context:** Mission 3 (hooks tutorial). Both have played 2 missions solo. First time trying co-op mode on their Switch.

**Minute 0:00 — The Split**

The title screen shows "Co-Op: Separated Joy-Cons" with an animation of two Joy-Cons sliding apart, each trailing a colored wake — cyan left, amber right. A text prompt reads: "Detach your Joy-Cons. Left Joy-Con = The Architect (builds). Right Joy-Con = The Analyst (diagnoses)."

Mira picks up the left Joy-Con. "I want to build." Dante takes the right. "Cool, I'll figure out what goes wrong." They each feel a single confirming pulse in their Joy-Con — Mira's is a firm *thunk* (construction), Dante's is a gentle *ripple* (analysis). The haptic handshake. They glance at each other — "did you feel that?"

The screen splits briefly: left half flashes cyan with a wireframe workbench silhouette, right half flashes amber with a magnifying glass icon. Then it resolves to the Plan screen — full workbench for Mira, with a small text in the top-right: "🎮 Architect: Mira's Joy-Con." Dante's Joy-Con is inert. A tiny amber eye icon in the corner of his screen pulses slowly — "waiting for Sealed Watch."

**Minute 0:30 — Mira Builds Alone (But Not Really)**

Mira navigates the workbench with her stick. D-pad equivalent cycles panels: Skills → Rules → Hooks. She's configuring SCOUT-A's hook: `WHEN enemy_detected → EMIT "danger" on channel threat-net`. She's done this in solo play. The motion is familiar.

Dante watches over her shoulder. His Joy-Con is inert but he can see the whole Plan screen. "Wait, are you hooking the scout to the same channel as the relay? Won't that create a loop?" He can't touch anything. He can only talk. This is the design's first gift — it forces verbal collaboration where solo play is silent internal monologue.

Mira pauses. "Oh. Good catch." She reroutes the hook to a different channel. The channel map panel updates — two separate colored lines instead of one circular loop.

**Minute 2:00 — EXECUTE**

Mira holds L (trigger) and presses stick-click: EXECUTE. Both Joy-Cons vibrate — a rising heartbeat translated from the DualSense commitment ritual into HD Rumble. Three pulses, quickening. Then silence. The Sealed Watch begins.

**Minute 2:05 — Shared Silence**

The board fills the screen. Tick clock at top. Both watch. Tick 1 — units spawn. Tick 2 — scout moves. Tick 3 — scout detects enemy. The green signal flash appears on screen; both Joy-Cons buzz gently (signal delivery). Tick 5 — the relay receives, compresses, forwards. Tick 8 — the striker moves toward the signaled enemy position. Tick 10 — the striker is adjacent. Red flash. Enemy eliminated. Both Joy-Cons deliver a sharp impact buzz.

"YES!" Dante pumps his fist. His Joy-Con's gyroscope detects the motion — nothing happens in Mode A, but he doesn't notice. He's in the moment.

Tick 14 — a second enemy approaches from the opposite side. The scout's buffer fills. Context overload. The scout freezes — sparking, jittering. Both Joy-Cons stutter with a scratchy, uncomfortable vibration. The stun lasts one tick. Tick 15 — the scout recovers, but the enemy striker is adjacent. Red flash. Scout eliminated.

"NO!" Mira grabs Dante's arm. "What happened??"

**Minute 3:30 — The Baton Pass**

Sealed Watch ends. Mira's Joy-Con delivers one strong downbeat pulse — the Architect's creation fell short. Then silence. A beat. Dante's Joy-Con begins a sustained, warm vibration as the Inspector screen materializes. The torch passes.

The screen transitions: Plan workbench fades out. The board stays center. A timeline scrubber appears at the top. Dante's Joy-Con is live. Mira's is inert. The asymmetry has flipped.

**Minute 3:45 — Dante Investigates**

Dante navigates to the scout's last position (stick snaps to grid). Presses A. The Inspector sidebar opens: SCOUT-A's full context window at tick 14. Six slots. All full. The entries: `enemy_north (T3)`, `terrain_jungle (T1)`, `signal_ack (T5)`, `enemy_south (T10)`, `terrain_coast (T1)`, `relay_echo (T12)`. The context bar glows angry red — maxed out.

"It was full of terrain data it didn't need," Dante says. He presses Y to switch to the decision trace. Tick 14: rule evaluation failed — no action taken because the incoming `enemy_south` entry couldn't fit in the buffer, triggering eviction cascade, triggering stun.

Dante places an annotation marker: stick to SCOUT-A's position, X to place. Y-cycle to 📊 (context problem), with the up-arrow for overloaded. He taps out a label on the quick-keyboard: "TERR FILL" — terrain is filling the buffer. He has 4 markers left.

He places a second marker on the relay: ✓ (working well). Label: "GOOD COMP" — the compression worked. Positive feedback matters.

**Minute 5:00 — Back to the Architect**

Dante presses R (trigger) to end Inspector and pass back to Plan. The screen transitions: Inspector fades, Plan materializes. Mira's Joy-Con pulses — her turn.

On the board preview, two annotation markers glow amber. The 📊↑ on the scout's position. The ✓ on the relay. Mira navigates to the scout's marker, presses stick-click. The tooltip reads: "TERR FILL."

"Terrain is filling the buffer?" She looks at Dante. He nods. "It had terrain observations taking up two slots it didn't need. Can you filter those out?"

Mira navigates to SCOUT-A's context config. She finds the listen/ignore toggles. She toggles `terrain` from Listen to Ignore. The change is immediate — the context preview shows the scout's projected buffer usage dropping from 6/6 to 4/6.

"Okay, let's try again."

**Minute 6:30 — Second EXECUTE**

The heartbeat rising. The silence. The ticks. This time, tick 14 arrives and the scout has room — enemy_south slots in cleanly. No overload. No stun. Tick 16 — the scout evades. Tick 18 — the striker flanks. Red flash. Enemy eliminated. Mission complete.

Both Joy-Cons deliver a triumphant final pulse — a resonant *BOOM* that hangs in the haptic space. They look at each other. Dante: "We fixed it." Mira: "YOU found it. I just flipped a toggle."

That's the feeling. Neither could have done it alone. The Architect builds. The Analyst sees.

---

### Journey 2: Kenji (42, Software Architect) + Yuki (39, Data Analyst) — Married Couple, Mission 7

**Context:** Mission 7 (command agent + production tuning). Kenji and Yuki have played every mission in co-op. Their roles are cemented: Kenji architects, Yuki analyzes. They've developed shorthand — Yuki's annotation labels have become a private language between them.

**Minute 0:00 — The Veteran's Shorthand**

Plan screen loads. Three annotation markers persist from last round (pinned by Kenji): 📊↓ on COMMAND-A ("UNDERFED" — context window has empty slots, wasting capacity), 🔗 between RELAY-B and RELAY-C ("DUP CHAN" — duplicate channel redundancy), ⚠ on STRIKER-D ("LATE ARR" — arriving too late to engagements due to slow signal chain).

Kenji doesn't need to ask. He knows Yuki's vocabulary. "UNDERFED" means the command agent needs more channel subscriptions. "DUP CHAN" means he should merge two relays into one with better hook config. "LATE ARR" means the signal latency path is too long — Scout→Relay→Relay→Striker = 6 ticks, too slow.

He starts redesigning. The command agent gets two more channel subscriptions (listen to `north-status` and `south-status` in addition to `threat-net`). He merges RELAY-C's hooks into RELAY-B's configuration, freeing a production slot. He adds a direct Scout→Striker hook on a new channel `fast-threat` — bypassing the relay chain entirely for urgent signals. Latency drops from 6 ticks to 2.

**Minute 3:00 — The Factory Problem**

This is Mission 7. The factory is live. Kenji has a production queue: Scout → Relay → Striker → Striker → Specialist. Resources are limited. He can't build everything he wants. The conveyor belt strip at the bottom shows his build order, with cost previews: 3m + 5m + 8m + 8m + 7m = 31 metal. He has 35. Tight.

"Yuki, last round, did the second striker ever engage?"

Yuki, sitting next to him with her inert Joy-Con: "Not once. It spawned at tick 20 and the battle ended at tick 24. Dead weight."

Kenji drags the second striker off the conveyor belt. Replaces it with a second relay. The total drops to 28m. More headroom. The second relay will extend the signal network's coverage area, compensating for the fast-threat direct channel he added (which has no compression — raw scout data, higher noise risk).

**Minute 4:30 — Sealed Watch: The Long Battle**

EXECUTE. The heartbeat. Silence.

This battle runs 30+ ticks. The factory produces units over time — the first scout spawns at tick 1, the relay at tick 5, the first striker at tick 10. Yuki and Kenji watch the network assemble itself in real-time. Green signal flashes cascade across the board as channels come alive. The command agent spawns at tick 15 and begins reassigning priorities — visible as brief amber flashes on subordinate units' context bars (the command agent's `reassign` skill adjusting their rule priorities mid-battle).

Tick 22 — an enemy wave spawns from the northeast. Three enemy strikers. The scout detects them and fires on `fast-threat`. The striker — not yet in position — receives the signal at tick 24 and pivots. But the enemy strikers are faster. Tick 26 — the relay at B4 is adjacent to an enemy striker. Red flash. RELAY-B eliminated.

Both Joy-Cons deliver the impact buzz. Kenji winces. That was his merged super-relay. The entire signal network fragments. Units downstream lose their signal source. Context bars start draining — no new data flowing in. The scout keeps reporting on `fast-threat`, but only the striker hears it now. The second relay (the one Kenji added) picks up some slack, but it's positioned on the west side — too far from the northeast engagement.

Tick 30 — the battle stabilizes. The striker eliminates two enemy strikers using the direct `fast-threat` channel. But the third enemy striker reaches the player's factory. Red flash on the base. Damage.

The battle continues. Tick 35 — a replacement relay spawns from the factory. The network partially recovers. Tick 40 — the specialist hacks the remaining enemy striker (the `hack` skill, delivered through the recovering network). Battle won, but barely.

**Minute 8:00 — Yuki's Deep Dive**

Inspector materializes. Yuki's Joy-Con activates. She immediately scrubs to tick 26 — RELAY-B's elimination. She clicks the empty tile where RELAY-B died. The Inspector shows its final context state: 12 slots, 11 occupied, no overload. The relay was healthy when it died. The problem wasn't the relay's configuration — it was its *position*. It was in the path of the enemy advance with no protection.

She scrubs forward to tick 27-35. Watches the network fragmentation cascade. Three units lose signal. Their context bars drain over 4 ticks as old data ages out without replacement. Two of them make suboptimal decisions based on stale context (the striker moves west — toward the last known enemy position from tick 20, not the current position at tick 28).

Yuki places her markers:
1. ⚠ on RELAY-B's former position. Label: "EXPOSED" — the relay needs to be behind the striker line, not in front.
2. 📊↓ on STRIKER-A at tick 28. Label: "STALE T28" — stale context led to wrong movement.
3. 🔗 between the two relays. Label: "NO REDUN" — no redundancy; when one relay dies, half the network goes dark.
4. ✓ on the `fast-threat` direct channel. Label: "SAVED US" — the direct channel kept the striker functional when the relay network collapsed.
5. ✓ on the specialist's hack at tick 40. Label: "CLUTCH" — the hack won the battle.

Two positive markers, three problems. Yuki's annotation philosophy: always acknowledge what worked. Kenji responds better to balanced feedback. They've been married 12 years. They know each other's debugging style.

**Minute 10:00 — The Conversation**

"So the direct channel saved us, but the relay being exposed almost killed us," Kenji says, reading the markers. "I need to put the relay behind the striker, or give it an evade skill so it can flee."

"Relays can't move though — they're static," Yuki reminds him.

"Right. So I need to place the factory so relays spawn in safer positions... or add a second relay with overlapping coverage so losing one doesn't cascade."

"That's what 'NO REDUN' means." Yuki smiles.

This is the loop at its deepest — two adults having a genuine engineering conversation about information architecture, mediated by a game about robots and rice terraces.

---

### Journey 3: Cass (15, High Schooler) + Their Mom, Patricia (48, Teacher) — Mission 1

**Context:** Patricia has never played a video game since Tetris. Cass bought Robot Uprising and wants to share it. First time playing co-op. Mission 1 (context tutorial — pre-placed units, no factory).

**Minute 0:00 — The Scary Part**

Patricia holds the right Joy-Con gingerly. "What does Analyst mean?" Cass, left Joy-Con already comfortable in hand: "You just watch the replay and tell me what went wrong. Like grading homework."

Patricia laughs. She's a teacher. She grades things. The metaphor lands.

The Plan screen loads. Patricia's Joy-Con is inert. She watches Cass navigate. Mission 1 has pre-placed units — a scout and a striker already on the board. The workbench shows their configurations. Cass adjusts the scout's context config: toggle `terrain` to Listen. Increases the context window priority for enemy observations.

"What are you doing?" Patricia asks.

"Making the scout pay attention to enemies more than terrain. Like... telling a student to focus on the test, not the window."

Patricia nods. Teacher metaphors work.

**Minute 1:30 — First Sealed Watch**

EXECUTE. The Joy-Cons pulse together. The board fills the screen. Two units, three enemies. Simple.

Tick 1 — scout moves. Tick 2 — scout detects enemy. Green flash. Both Joy-Cons buzz. Tick 3 — the scout's context bar fills a pip. Another pip. Tick 4 — the striker moves toward the detected position. Tick 6 — adjacent. Red flash. Enemy down. Both Joy-Cons impact.

"Oh!" Patricia felt the elimination through the controller. The haptic bridge works. She's in the battle even though she didn't build anything.

Tick 8 — second enemy approaches. The scout detects it. But the scout's context bar is filling up. Amber now. Tick 10 — overload. The scout sparks and freezes. Patricia feels the stuttering vibration — unpleasant, scratchy. "Something's wrong with the little eye one."

Tick 11 — scout recovers. But the enemy striker is adjacent. Red flash. Scout eliminated. Patricia's Joy-Con delivers the impact. She physically flinches.

The battle plays out — the remaining striker eliminates the second enemy but can't reach the third in time. Mission failed.

**Minute 3:00 — Patricia's Turn**

The Inspector materializes. Patricia's Joy-Con activates. She looks at Cass nervously.

"Just move the stick to the scout — the little eye on the board. Yeah, there. Now press A."

The Inspector sidebar opens. Patricia sees the scout's context window at tick 10: six colored slots, all full. She doesn't fully understand the data, but the visual is clear — every slot is bright, the bar is red, and there's a big "OVERLOADED" label in red text.

"It got overloaded," she says. "Too much information?"

"Exactly! Like when a student gets overwhelmed by too many instructions at once. Can you see what was in the buffer at that tick?"

Patricia looks at the context entries. Each slot shows a type label: `enemy_north`, `terrain_jungle`, `terrain_coast`, `signal_ack`, `enemy_east`, `terrain_mountain`. Three terrain entries out of six slots.

"There's a lot of terrain in here. Does the scout need to know about terrain?"

"THAT'S the bug. Mom, that's literally the bug. The scout doesn't need terrain. I should have turned off terrain listening."

Patricia beams. She places an annotation marker on the scout: 📊↑ (context overloaded). She hunts-and-pecks the label: "TERRAN" — she misspells terrain. It doesn't matter. Cass will understand.

**Minute 5:00 — The Fix**

Plan screen. Mira sees the amber marker. Reads "TERRAN." Laughs. Navigates to the scout's context config. Toggles terrain from Listen to Ignore. EXECUTE.

This time the scout has room. No overload. Mission complete. Both Joy-Cons triumphant.

Patricia puts down the Joy-Con. "That was... that was actually fun. I found the problem."

"You diagnosed an attention architecture failure," Cass says, grinning.

"I graded its homework and it was carrying too many textbooks."

---

### Journey 4: Alex (22, CS Student) + River (23, Art Student) — Mission 9, Late Campaign

**Context:** Deep campaign. Both are experienced. Alex architects, River analyzes. They're tackling Mission 9 — a factory vs. factory battle. The enemy has a command agent that reroutes its units' hooks mid-battle.

**Minute 0:00 — The Arms Race**

Alex has a complex architecture: two scout-relay chains covering north and south approaches, a central command agent managing priority reassignment, three strikers, and a specialist on disruption duty. The channel map shows 8 named channels — a dense web of colored subway-map lines.

River's annotations from last round are extensive — all 5 markers used:
1. ⚠ on the south scout: "JAM T18" — enemy noise jamming caused a false detection
2. 🔗 between command and north relay: "REROUTE LAG" — command agent's reroute skill takes 2 ticks to propagate, too slow
3. 📊↑ on the command agent: "14/14 T22" — command agent's own context window maxed out; it can't process its own reassignment decisions
4. 🔗 between specialist and enemy command: "HACK RANGE" — specialist couldn't reach enemy command; need closer positioning
5. ⚠ on enemy spawn point: "WAVE T25" — enemy second wave spawns at tick 25, need to be ready

Alex stares at the markers. This is a systems-level failure. The command agent — the meta-layer that manages other agents — is itself overloaded. The manager needs management.

"River, the command agent can't handle 8 channels and still think. What if I split it into two command agents? One for north, one for south?"

"That's 10 metal each. You can't afford two."

"Right. What if I strip channels? Give it only the 4 critical channels?"

"Which 4 are critical?"

This is the conversation the game exists to create — two people debating information architecture trade-offs. Which channels carry essential data? Which are redundant? How do you manage an agent whose job is managing other agents? The meta-level.

**Minute 2:00 — The Radical Redesign**

Alex makes a drastic change. Instead of one command agent managing everything, he creates a "hierarchical relay" — RELAY-A becomes a dedicated command-signal relay that only carries meta-instructions (reroute, reassign, prioritize commands). It doesn't carry battlefield data. The command agent's hooks now only connect to this meta-relay, not to individual combat units. The meta-relay distributes commands to units.

This reduces the command agent's channel count from 8 to 2 (meta-relay-north, meta-relay-south). Its context window drops from 14/14 to 6/14. Massive headroom.

But the architecture is now deeper: Command → Meta-Relay → Unit. That adds 2 ticks of latency to every command. The reroute lag that River flagged gets WORSE, not better.

"Hmm." Alex sees the problem. "Deeper is smarter but slower."

"The emissions problem too," River adds. "More hops = more EM noise. The enemy might detect the meta-relay."

Alex: "What if I give the meta-relay a `compress` skill? Smaller signals, less noise, but lossy — the reroute command might lose priority metadata."

This is the fractal decision space the game promises. Every fix creates a new trade-off. Every architecture has a shape, and every shape has blind spots.

**Minute 8:00 — River's Forensic Analysis**

After the Sealed Watch (a brutal 45-tick battle that they barely won), River takes the Inspector. She scrubs through the battle systematically — not looking at individual ticks, but at the context window chart for each unit across all 45 ticks.

The command agent's chart is the key exhibit: a sparkline that was previously a flat red line (constantly maxed) now shows a healthy green-amber oscillation — filling during enemy waves, draining during quiet ticks. The meta-relay architecture worked.

But the latency cost appeared at tick 31. The command agent issued a `reroute` at tick 31. It reached the meta-relay at tick 33. The meta-relay forwarded to STRIKER-B at tick 35. STRIKER-B changed course at tick 36. The enemy striker it was supposed to intercept reached the player's relay at tick 34 — two ticks before the reroute arrived. The latency killed a relay.

River places her markers:
1. 🔗 between command and meta-relay: "2TICK LAG" — confirming the latency problem persists
2. ✓ on command agent's context chart: "BREATHE" — the meta-relay architecture gave it room to breathe (positive!)
3. 📊 on meta-relay: "GOOD UTIL" — meta-relay at 8/12 utilization, healthy
4. ⚠ on STRIKER-B: "LATE T36" — arrived 2 ticks too late due to command latency
5. 🔗 direct from command to STRIKER-B: "FAST CMD?" — suggesting a direct emergency channel that bypasses the meta-relay for time-critical commands

That fifth marker — "FAST CMD?" — is River proposing architecture. She's not just diagnosing; she's suggesting a hybrid: meta-relay for routine commands, direct channel for emergencies. The Analyst is becoming a co-architect through the annotation system.

Alex reads the marker. Grins. "A priority override channel. The command agent hooks to STRIKER-B directly for WHEN threat_level=critical. Everything else goes through the meta-relay."

"Yeah. Like a 911 line that bypasses the operator."

They're building a hierarchical information network with emergency override channels. They're learning distributed systems architecture. They think they're playing a game about robots.

---

## Interaction Effects

### With Locked Three-Screen Loop
The Joy-Con split maps perfectly to the three-screen loop because the screens are already functionally asymmetric. Plan is for building (Architect's domain). Inspector is for analysis (Analyst's domain). Sealed Watch is deliberately passive (shared). The co-op mode doesn't require any new screens — it re-assigns ownership of existing ones.

### With Locked Sealed Watch Rules
"No skip, no pause, no tools" during Sealed Watch is even more powerful in co-op. Both players are forced to share the emotional experience without any escape valve. The Architect can't fast-forward past their mistakes. The Analyst can't pause to point things out. They sit together and absorb. This creates shared emotional memory that fuels the debrief conversation.

### With Haptic Vocabulary (6.06a)
HD Rumble becomes a shared sensory channel. Both players feel the same battle through haptic events, creating physical synchrony even when their visual attention diverges (the Architect might be looking at the board while the Analyst is reading a unit's context bar). The haptic channel is the "we're in this together" signal.

### With DualSense Trigger Commitment (6.06b)
This mode is Joy-Con only — no DualSense. The EXECUTE commitment ritual translates to HD Rumble heartbeat instead of trigger resistance. The Architect feels it alone (their trigger, their commitment). The Analyst feels a sympathetic pulse — present but not in control. This asymmetry is intentional: the Architect commits, the Analyst witnesses.

### With Mobile/Touch (6.07)
The Joy-Con split pattern translates to a **two-device mobile co-op**: one phone runs the Plan screen, the other runs the Inspector. Same asymmetric model, different hardware. This is a natural product extension.

### With Competitive PvP (7.01)
Mode E (The Relay — 2v2 split-screen) creates a team-based competitive format where the Analyst role becomes tactical intelligence: diagnosing the enemy's architecture from observed behavior. This is the information warfare layer the game's spec promises.

### With Onboarding (Wave 5)
The Analyst role is the best onboarding tool in the entire game. A new player (Analyst) learns by observing and diagnosing an experienced player's (Architect's) designs. They learn the vocabulary ("context overload," "hook latency," "channel redundancy") through diagnostic context rather than abstract tutorials. Journey 3 (Cass + Patricia) demonstrates this directly.

---

## Comparable Games

### Keep Talking and Nobody Explodes
The gold standard for asymmetric couch co-op. One player sees the bomb; the other reads the manual. The asymmetry is *informational* — one player has visual data, the other has procedural knowledge. Robot Uprising's asymmetry is *temporal* — one player designs the future, the other diagnoses the past. KTANE's insight: the communication between asymmetric roles IS the game. The bomb defusal is just a forcing function for communication quality. Same principle applies here — the battle is the forcing function; the real game is the conversation between Architect and Analyst.

### It Takes Two
Hazelight's "two players, two different mechanics" model. One player shoots while the other platforms. The asymmetry is mechanical (different abilities) rather than cognitive (different analytical modes). Robot Uprising's asymmetry is deeper — both players engage with the *same system* from different angles, rather than engaging with different systems.

### We Were Here Series
Asymmetric puzzle co-op where players are in different rooms with different information. Communication is the puzzle. Robot Uprising's annotation system is a structured version of WWHS's free-form voice communication — the 5-marker limit and emoji-labels constrain the communication channel, forcing signal compression (which is, delightfully, a mechanic in the game itself).

### Overcooked (Anti-Pattern)
Overcooked's co-op is symmetric — both players can do everything, and the challenge is spatial coordination. This is NOT what Joy-Con co-op should feel like. If both players can do everything, the role split feels artificial. The Architect must genuinely be unable to inspect, and the Analyst must genuinely be unable to build.

### Luigi's Mansion 3 — ScareScraper
Nintendo's own Joy-Con co-op showcase. Each player has limited capabilities (one Joy-Con = limited buttons). The game simplifies each role to match the input constraints. This is the key lesson: **don't try to cram the full game into half a controller.** Simplify each role so it feels complete with the inputs available. The Architect doesn't need radial wheels or complex shortcuts — they have one workbench and one stick. The Analyst doesn't need timeline scrubbing hotkeys — they have one stick and face buttons. Each role is a whole game that happens to need the other role to make progress.

---

## Sensory Description

**The split moment:** When Joy-Cons detach, a binaural audio effect plays — a stereo signal that starts centered and pans hard left/right, one channel per speaker (or headphone ear). A synthesized tone rises in the left speaker (Architect's theme — a clean, constructive hum like a 3D printer whirring up) while the right speaker plays a descending analytical tone (Analyst's theme — a sonar ping fading into reflective reverb). The two tones meet and harmonize for one beat before separating. Then silence. Ready.

**The Architect's haptic signature:** The left Joy-Con's HD Rumble during Plan phase has a low, steady undertone — almost subliminal — like holding a purring machine. Each configuration change (skill toggle, rule reorder, hook connection) produces a tiny satisfying *click* vibration, like a physical toggle switch engaging. The frequency of these clicks is the Architect's "productivity heartbeat."

**The Analyst's haptic signature:** The right Joy-Con's HD Rumble during Inspector phase has no undertone — clean silence. Each annotation placed produces a single *stamp* vibration, like a wax seal pressing into paper. The annotation placement is a deliberate, physical-feeling act. The gyroscope adds subtle positional feedback — scrubbing forward (tilting the Joy-Con right) adds a gentle forward pull, scrubbing backward (tilting left) adds backward resistance.

**The Sealed Watch shared haptic:** Both Joy-Cons sync to the tick heartbeat — a metronomic pulse, one per second. Combat impacts hit both simultaneously with matched intensity. Context overload stutters are uncomfortable in both hands. Signal deliveries are gentle buzzes. The haptic vocabulary during Sealed Watch is identical in both controllers — this is the "we are one" moment, undifferentiated, shared.

**The baton pass:** When the Sealed Watch ends and control passes to the Analyst's Inspector, there's a 0.5-second transition where the Architect's Joy-Con delivers a descending vibration (power down) and the Analyst's delivers an ascending vibration (power up). A crossfade in the hands. A relay race baton pass you can feel.

**The annotation placement sound:** When the Analyst places a marker, a soft *thock* plays — like a pushpin into corkboard. Each marker type has a variant: ⚠ has a slightly concerned minor-key *thock*, 📊 has a clinical neutral *thock*, 🔗 has a chain-link metallic *thock*, ✓ has a warm major-key *thock* that feels like relief. Over time, the Architect learns to recognize the marker type by its sound, even without looking at the screen.

**The board annotation glow:** Amber markers on the Architect's board preview have a gentle pulsing glow — like warning lights in a submarine. They brighten and dim on a 2-second cycle. Pinned markers (kept across rounds) dim their pulse rate to once per 4 seconds — they're still there, but they've become part of the landscape. Fresh markers from the current debrief pulse faster and brighter. The Architect's eye is drawn to the new information.

---

## The TikTok Clip

Split-screen: left shows someone's hand holding a single Joy-Con, navigating a complex blueprint. Right shows another hand holding the other Joy-Con, scrubbing through a timeline. They're sitting next to each other on a couch. The left player looks confused. The right player places a marker. The left player sees it appear, turns to the right player. A moment of eye contact. The left player flips one toggle. They EXECUTE. The battle plays. The same unit that failed before succeeds. Both hands in frame holding their Joy-Cons — both controllers buzz simultaneously as the enemy explodes. They fist-bump with Joy-Cons still in hand.

Text overlay: **"My girlfriend found the bug. I just flipped the switch."**

8 seconds. No game knowledge required. The emotional arc — confusion → diagnosis → fix → triumph → shared credit — reads immediately. The Joy-Cons in separate hands is visually novel. The fist-bump-with-controllers is the image that sticks.

---

## New Aspects Discovered

1. **6.06c-i — Annotation vocabulary evolution over long campaigns:** How the 5-marker / 12-character label system evolves as co-op partners develop shorthand; "emergent communication protocols" between players; does the game need to support custom marker types or does the 4-type system (⚠/🔗/📊/✓) suffice for 10 missions?

2. **6.06c-ii — Role-swap variant: alternating Architect/Analyst per mission:** What happens when players swap Joy-Cons every mission? Does the Architect become a better Architect after experiencing the Analyst role? The "walk in their shoes" learning hypothesis; mission-gated role swaps as campaign structure.

3. **6.06c-iii — Two-device mobile co-op as Joy-Con split descendant:** The same asymmetric model (one phone = Plan, other phone = Inspector) for mobile; synchronization architecture; shared Sealed Watch on one device or both devices simultaneously; latency tolerance.

4. **6.06c-iv — Spectator mode as a third Joy-Con role:** Can a third Joy-Con holder spectate with commentary tools (Announcer mode)? The "coach" role in esports; would a spectator Joy-Con create meaningful three-player asymmetric co-op or dilute the Architect/Analyst pair bond?

5. **6.06c-v — Co-op annotation history as post-campaign artifact:** Saving the full history of annotations across all missions as a shareable "co-op journal"; the annotation record tells the story of two players learning to communicate; community sharing of co-op journals as a narrative artifact.
