# 6.10b — Corruption Audio in Competitive/PvP Context

## The Design Challenge

The corruption audio vocabulary (6.10, 6.10a, 6.10c) was designed for a solo campaign where the only audience is the player. The Sour Note, the Beetle Click, the Heartbeat Monitor, the Whisper Fragment — these sounds exist in a private acoustic space. But in PvP (Gauntlet mode, ranked matches, streamed tournaments), a second player enters the equation, and every sound becomes a potential intelligence vector.

Three questions define the design space:

1. **Does the opponent hear YOUR corruption audio?** If Player A's system is compromised (by Player B's injected hooks, EMP buffer degradation, or pre-match corruption), does Player B hear the Sour Note in Player A's workbench? Can they hear the Geiger clicking as Player A sweeps for corrupted elements? Can they hear the Revert Tone when Player A fixes something?
2. **Can EM emissions carry corruption detection signatures?** The locked emissions model says hook transmissions emit detectable EM noise. If corruption detection itself produces detectable signals — the Geiger sweep, the integrity scan, the purge command — does *detecting* corruption become an EM event that the enemy can intercept?
3. **Is corruption audio a competitive intelligence leak?** In a tournament setting with shared physical space (LAN, streamed split-screen), can a skilled opponent extract tactical information from the *sounds* coming from the other player's headphones or speakers? Can audio bleed reveal corruption state, detection progress, or resolution timing?

These questions map directly to the locked EM emissions model: "Hook transmissions emit detectable EM noise. Deeper architectures are smarter but louder." Corruption detection is itself an information-processing activity. If the system is consistent, detecting corruption should have an EM cost — and that cost should be audible to someone listening on the right frequency.

---

## The Five Models

### Model 1: "The Soundproof Room" — Complete Audio Isolation

Each player's corruption audio is entirely private. Player B hears nothing about Player A's corruption state — no ambient dissonance, no Geiger clicks, no heartbeat, no resolution chords. The two audio streams are hermetically sealed. Corruption detection has zero EM signature.

**Mechanical specifics:** The audio engine renders two independent mix buses. Each player's corruption layer (ambient + interaction + event) routes only to their own output. In spectator mode, the caster can toggle between Player A audio, Player B audio, or a neutral mix with neither corruption layer.

**The metaphor:** Each player's workbench is a Faraday cage. What happens inside stays inside.

### Model 2: "The Thin Walls" — Leaked Ambient Layer Only

Player B hears a *faint, unlocalized* version of Player A's ambient corruption layer — the Sour Note, the static spectrum — but NOT the interaction or event layers. They know *something* is wrong with the opponent's system, but not what, where, or how bad. The leak is passive and omnidirectional, like overhearing a neighbor's alarm through a shared wall.

**Mechanical specifics:** Player A's ambient corruption layer is mixed at -24dB into Player B's audio bus. It arrives as a barely perceptible tonal shift in Player B's own ambient — not as a distinct sound from "the other side." Player B must have deeply internalized their own clean ambient to notice the foreign dissonance layered beneath it. The interaction layer (Geiger clicks) and event layer (heartbeat, resolution tones) remain private.

**The metaphor:** Corruption is a disease, and diseases have a smell. You can't diagnose from across the room, but you can tell something is off.

### Model 3: "The Emission Echo" — Corruption Detection as EM Event

Corruption detection activities generate detectable EM emissions. When Player A sweeps their workbench with the Geiger cursor, the sweep itself produces a faint EM pulse on each click — detectable by Player B's Specialists with the hack skill. When Player A purges an enemy-injected hook, the purge command broadcasts a brief EM spike. Player B doesn't hear Player A's audio directly — but Player B's units on the battlefield can *detect* the EM signature of Player A's diagnostic activity.

**Mechanical specifics:**
- **Geiger sweep EM:** Each Geiger click generates a 0.1 EM unit pulse at Player A's base position. At maximum sweep rate (20 clicks/sec), this produces 2.0 EM/sec — roughly equivalent to a Relay's amplify skill. A Specialist within detection range of Player A's base sees these as rapid micro-blips in the EM overlay.
- **Purge/revert EM:** Purging an enemy hook generates a 0.5 EM spike (equivalent to a hook transmission). Reverting a corrupted config generates a 0.2 EM spike. These are one-shot events, not sustained.
- **Integrity scan EM:** If the game includes an explicit "scan for corruption" action, each scan generates 1.0 EM at the base — the loudest diagnostic event, equivalent to a Command agent rerouting.
- **Player B's detection:** These EM events appear in Player B's Inspector as "DIAGNOSTIC EMISSION" entries on the EM overlay, timestamped and located at Player A's base. Player B cannot determine *what* was detected or fixed — only that diagnostic activity occurred, and its intensity.

**The metaphor:** Debugging is computation. Computation generates heat. Heat is detectable. The act of looking for bugs tells the world you have bugs.

### Model 4: "The Broadcast Wound" — Corruption State as Persistent EM Signature

Player A's corruption state itself — not just detection activity, but the *existence* of corruption — produces a continuous, measurable EM signature that Player B can detect. A compromised system leaks. Foreign hooks are radio transmitters. Degraded buffers emit noise. The corruption IS the signal.

**Mechanical specifics:**
- **Foreign hook EM:** Each enemy-injected hook transmits 0.3 EM/tick continuously, in addition to any hook transmission EM. This is the hook "phoning home" — maintaining its connection to the enemy network. Player B sees this as a persistent low-level EM glow at Player A's base, distinct from normal hook EM because it has no corresponding channel activity (it's a "ghost channel" — EM without a message).
- **Buffer degradation EM:** EMP-degraded buffers emit 0.1 EM/tick per degraded slot. This manifests as broadband noise — audible to Player B's Specialists as a faint static hiss emanating from Player A's affected units. The hiss is spectrally shaped to match the degradation type: low-frequency rumble for reduced capacity, high-frequency crackle for corrupted slot contents.
- **Corrupted config EM:** Modified configs do NOT emit EM (they're passive data, not active transmitters). This creates an asymmetry: hooks and buffer damage are detectable, but sabotaged rules and fields are invisible. Player B can tell "the enemy has foreign hooks" but not "the enemy has modified patrol radii."
- **Detection threshold:** Player B needs a Specialist within 4 tiles of the affected unit to detect corruption EM. This is the same detection range as normal EM, but the corruption EM signature has a distinctive spectral shape that the Inspector labels differently.

**The metaphor:** A compromised system bleeds. The bleeding is visible to anyone with the right diagnostic tools. Foreign hooks are parasites that emit their own radio frequency. Your enemy's corruption is your intelligence.

### Model 5: "The Mirror Match" — Bidirectional Corruption as Audio Warfare

Both players can corrupt each other (via injected hooks, EMP attacks, config sabotage), and both players hear the *results* of their own offensive corruption on the enemy's system — but filtered through the EM emissions model. When Player B injects a hook into Player A's Scout, Player B hears a faint "confirmation chirp" — a pitched-up version of Player A's Sour Note — confirming the injection landed. When Player A later purges that hook, Player B hears a faint "disconnection tone" — a descending minor third — telling them the infiltration was discovered and removed.

**Mechanical specifics:**
- **Injection confirmation:** When Player B successfully injects a hook into Player A's unit, Player B hears a quiet ascending major second (200ms, +6dB above ambient) stereo-panned to the battlefield position of the target unit. This is the "it's in" sound.
- **Corruption persistence tone:** While the injected hook remains active, Player B's ambient layer gains a barely perceptible warm undertone — a faint humming that represents the active connection to their planted hook. Multiple active injections layer the humming into a richer texture. This is "the wiretap drone."
- **Discovery notification:** When Player A begins actively inspecting the corrupted element (Geiger clicking detected by EM), Player B hears the humming waver — a momentary pitch instability, like a radio signal being jammed. "They're looking."
- **Purge notification:** When Player A purges the injected hook, Player B's humming drops out for that element. A descending minor third plays (200ms, -6dB). "They found it."
- **Full purge silence:** When Player A achieves 100% integrity (all of Player B's injections removed), Player B hears a distinctive "line dead" tone — a 500ms silence in their own ambient, then a cold, flat 1kHz tone for 300ms. This is the inverse of Player A's warm All-Clear Chord. Player A's triumph IS Player B's setback, sonified.

**The metaphor:** Every act of aggression creates a bond between attacker and target. The attacker can *feel* their hooks working. They can *feel* them being pulled out. Corruption is a two-way radio.

---

## Player Journeys

### Journey: Reyes, 24, Competitive Gauntlet Player (Diamond III)

**Context:** Gauntlet ranked match, Round 3 of a best-of-5. Reyes has won the first two rounds with an aggressive hook-injection strategy — her Specialist plants foreign hooks in the opponent's Scout early, flooding their context window with false position data. She wears Beyerdynamic DT 770 headphones in a quiet room. The game uses Model 5 ("The Mirror Match").

**Minute 0:00 — Plan Phase Opens**
The workbench loads. Her own system is clean — 100% integrity, kulintang ambient is pure. But layered beneath her own audio is a faint warm hum: her two active injections in the opponent's network from the carry-over of Round 2's mid-battle hacks are gone (hooks don't persist between rounds). Silence. No drone. She needs to plan a fresh injection vector.

She opens her Specialist blueprint. Three hook slots. Slot 1: ON_ADJACENT_ENEMY → hack (offensive). Slot 2: ON_HACK_SUCCESS → inject_hook (the planted wiretap). Slot 3: ON_TAGGED → extract. The injection combo: get adjacent, hack, plant. She's run this config for 40 matches.

**Minute 0:45 — Scanning for Opponent Patterns**
She reviews the pre-match Briefing panel. Her opponent, "NullPointer," ran a heavy Relay architecture last round — four Relays forming a signal mesh. That means lots of hook slots for her injections to land in. But Relays are stationary — her Specialist needs to get adjacent. She adjusts her Scout's patrol route to sweep NullPointer's likely Relay positions, tagging as she goes. Her Specialist will follow tagged targets.

The plan screen shows ghost units on the board. She places her Specialist's spawn adjacent to the east corridor — the path to NullPointer's probable Relay farm. The workbench clicking is quiet. No corruption on her side. Clean system, clean audio.

**Minute 1:30 — EXECUTE**
She hits EXECUTE. The board expands. The sealed watch begins.

**Minute 1:45 — Tick 3: First Contact**
Her Scout slides east. NullPointer's Scout appears in her Scout's perception radius — a red glow on tile E4. Her Scout's hook fires: ON_ENEMY_DETECTED → broadcast on "threat-east." The signal chain lights up — green dashed lines from Scout to Relay to Specialist. The Specialist begins moving east.

**Minute 2:15 — Tick 8: The Injection**
Her Specialist reaches tile F5. NullPointer's Relay-2 is on F6 — adjacent. The hack skill fires. A brief cyan pulse on the tile boundary. Then the second hook triggers: ON_HACK_SUCCESS → inject_hook. A foreign hook slithers into NullPointer's Relay-2.

In her headphones: a quiet ascending major second. *Bwip.* The injection confirmation. The wiretap drone begins — a barely-there warm hum beneath her own ambient audio. The drone has a specific stereo position: slightly right of center, matching Relay-2's battlefield coordinates. She's in.

**Minute 2:30 — Tick 10: The Wiretap Pays Off**
NullPointer's Relay-2 is now broadcasting its legitimate traffic *and* Reyes's injected hook's EM signature. In her Inspector (post-match, but she knows the pattern from 40 matches), the foreign hook will show up as a ghost channel — EM without a matching channel name in NullPointer's architecture. Right now, during sealed watch, she can only hear the drone and watch the EM fog thicken slightly around NullPointer's base cluster.

**Minute 3:45 — Tick 18: "They're Looking"**
The wiretap drone in her right ear *wavers*. A momentary pitch instability, like the signal is being jammed. NullPointer is inspecting their Relay-2. They've noticed the corruption — maybe the Sour Note tipped them off, maybe the Beetle Click led them to the hook. Reyes tenses. If they purge before Tick 20, her Specialist won't have extracted enough intelligence to justify the 7m + 2e/tick cost.

**Minute 4:00 — Tick 20: The Purge**
The drone drops out. A descending minor third in her right ear: *bwee-bwoh.* NullPointer purged the injected hook. Twelve ticks of wiretap data — enough to map NullPointer's signal routing topology for this match, but not enough to cause context overload. She heard the discovery at Tick 18 and the purge at Tick 20 — a 2-tick diagnostic window. NullPointer is fast.

**Minute 4:15 — Assessment**
Reyes files the intelligence: NullPointer detected in 8 ticks and purged in 10 ticks after injection. That's a 2-tick detection-to-purge latency — extremely fast. Next round, she'll need to inject into a less-monitored unit, or inject multiple hooks simultaneously to overwhelm NullPointer's diagnostic bandwidth.

The wiretap drone is silent now. Her ambient is clean on both sides. The rest of the match plays out on pure architecture merit.

**UI Annotations:**
- **Injection confirmation:** Ascending major second, 200ms, stereo-panned to target unit position on battlefield
- **Wiretap drone:** Continuous warm hum at -24dB, stereo-positioned to match injected unit's tile, layers with multiple active injections
- **Discovery waver:** Drone pitch instability for 500ms when opponent begins inspecting the corrupted element
- **Purge notification:** Descending minor third, 200ms, same stereo position as drone. Drone cuts out immediately.

---

### Journey: Tomás, 16, First-Time PvP Player (Bronze I)

**Context:** First Gauntlet match ever. Tomás has completed the 10-mission campaign and is entering PvP for the first time. He plays on laptop speakers in a noisy living room. The game uses Model 2 ("The Thin Walls") — the simplest competitive audio model where only the ambient corruption layer leaks faintly to the opponent.

**Minute 0:00 — Gauntlet Queue**
The queue animation plays — two circuit-board silhouettes facing each other, connected by a golden wire that pulses as matchmaking runs. A match is found: "MangaFan_22." Tomás has never played against a human.

**Minute 0:15 — Plan Phase**
The workbench opens. It looks the same as campaign — his five blueprints from Mission 10, slightly modified. He adjusts his Scout's patrol route for the new map (Cebu province, urban terrain). The ambient kulintang plays cleanly. No corruption — this is PvP Round 1, no carry-over effects.

He hits EXECUTE without much thought. He's still playing campaign habits — optimizing against AI patterns.

**Minute 0:45 — Sealed Watch, Tick 5**
MangaFan_22's units move *differently* from campaign enemies. The opposing Scout takes an unusual path — hugging the west wall instead of the expected patrol route. Tomás's own Scout spots it and reports via hook. His Relay compresses and forwards. Normal operation.

But then — Tick 8. An enemy Specialist appears adjacent to his Relay-1. A cyan pulse. His Relay-1's context bar flickers. Something has been *injected*.

**Minute 1:15 — Sealed Watch Ends. Plan Phase, Round 2**
The workbench reopens. The kulintang melody plays. But there's... something. A note that doesn't belong. Tomás doesn't consciously notice it — the living room TV is on, his sister is talking. But his hands pause on the keyboard for a moment. Something feels different.

He looks at the integrity indicator. 94%. One corruption. The amber highlight pulses on Relay-1's hook panel. He hovers — *tick... tick-tick... tick...* The Beetle Click. He remembers this from Mission 7. He follows the clicking to the corrupted hook. An enemy-injected foreign hook on channel "???" — a channel name he didn't create.

He clicks [PURGE]. The clicking stops. The Revert Tone rings. The Sour Note in the ambient resolves. 100% integrity.

But here's what Tomás doesn't know: on MangaFan_22's side, under Model 2, MangaFan_22 could hear a *faint* tonal shift in their own ambient while Tomás's system was compromised — the leaked ambient layer at -24dB. MangaFan_22, an experienced player, recognized it immediately: "My injection landed." When the tone resolved, MangaFan_22 knew: "They found it and purged it."

Tomás doesn't know he's been read. He doesn't know the audio leaked. He won't learn about this mechanic until he watches a tournament VOD weeks later and hears the caster say, "Listen — you can hear the opponent's corruption in MangaFan's ambient. That faint dissonance? That's confirmation the hook is still active."

**Minute 2:00 — The Learning Moment (Post-Match)**
Tomás loses the match. In the debrief, the Inspector shows MangaFan_22's injection timeline — Tick 8 injection, Tick 22 purge (Round 2 plan phase). 14 ticks of active wiretap. The Inspector notes: "Enemy hook on RELAY-1 forwarded 6 signals to opponent before purge." Six signals. Six pieces of his architecture leaked to the enemy.

Tomás stares at the screen. He opens the Blueprint Codex and reads the corruption detection entry. He reads about EM emissions. He doesn't yet understand the audio leak — that comes later, when he plays with headphones for the first time and hears the Thin Walls for himself.

**UI Annotations:**
- **Ambient leak (Model 2):** Player B's ambient gains Player A's corruption dissonance at -24dB. Imperceptible on laptop speakers. Detectable on headphones by experienced players.
- **Integrity indicator:** Top-left percentage badge, amber pulse when below 100%, returns to teal at 100%.
- **Foreign hook display:** Channel name shown as "???" for enemy-injected hooks with no matching player channel.

---

### Journey: StreamerChef_TTV, 28, Diamond Gauntlet Streamer, 847 Average Viewers

**Context:** Weekly "War Room Wednesday" stream. StreamerChef is playing a show match against "IronClad," a top-10 Gauntlet player, using Model 3 ("The Emission Echo") — the tournament standard where corruption detection activities generate EM signatures detectable by opponent Specialists. 1,200 concurrent viewers. StreamerChef uses an Audio-Technica AT2020 mic and Sennheiser HD 600 headphones. The game is running in Tournament Mode with spectator audio showing both players' corruption layers.

**Minute 0:00 — Pre-Match**
StreamerChef addresses chat: "Okay chat, IronClad is known for the 'Silent Scalpel' — she plants one hook, extracts maximum intel, and purges her own footprint before you know she was there. I'm running a noise-heavy mesh with four Relays specifically to drown out injection EM. If she plants a hook, my Relay EM should mask it."

Chat scrolls: "copium" "4Head relay mesh vs ironclad" "this is going to be a 3-0 lmao"

**Minute 1:30 — Sealed Watch, Tick 12: The Injection**
IronClad's Specialist ghosts through the east flank — Tomás's Relay mesh has a gap between tiles D6 and D8. The Specialist slides into D7. Adjacent to StreamerChef's Relay-3. Cyan pulse. The hook is planted.

StreamerChef doesn't notice during sealed watch — his Relay-3's context bar barely flickers (the injected hook is small, consuming only 1 context slot). The EM overlay shows a slight thickening around Relay-3, but StreamerChef's four-Relay mesh already produces heavy EM. The injection EM is lost in the noise. IronClad's Silent Scalpel strategy works exactly as designed: hide the injection EM inside the target's own EM noise.

**Minute 3:00 — Plan Phase, Round 2: The Sweep**
Workbench opens. StreamerChef checks integrity: 96%. One corruption. "Chat, we got hit. Let me sweep."

He begins the Geiger sweep — cursor moving left to right across the blueprint panels. *Tick... tick... tick-tick-tick...* The clicking finds Relay-3's hook panel. StreamerChef hovers. The clicking becomes rapid. "Found it. Hook panel, slot 3. Foreign hook on... no channel name. Classic IronClad."

But here's the competitive consequence of Model 3: every Geiger click generated a 0.1 EM pulse at StreamerChef's base position. His rapid hover sweep — 20 clicks per second for 3 seconds — generated a 6.0 EM burst. IronClad's Specialist, repositioned to tile C5 after the injection, is within detection range of StreamerChef's base. In IronClad's Inspector replay (and visible to her during the next sealed watch via EM overlay), she sees: "T22-T25: DIAGNOSTIC EMISSION — 6.0 EM burst at enemy base."

IronClad now knows:
1. StreamerChef detected the injection (the diagnostic emission confirms active corruption scanning)
2. StreamerChef found it quickly (3-second sweep = experienced player)
3. StreamerChef will purge before execution (the purge will generate another 0.5 EM spike)

StreamerChef clicks [PURGE]. A 0.5 EM spike radiates from his base. On IronClad's side: "T26: DIAGNOSTIC EMISSION — 0.5 EM spike. Hook purged." IronClad's intelligence picture is complete: injection landed Tick 12, detected Plan Phase 2, purged Plan Phase 2. StreamerChef's diagnostic response time is 1 plan phase — fast enough to prevent sustained eavesdropping but slow enough that the 10-tick window yielded signal routing data.

**Minute 3:30 — StreamerChef's Realization**
StreamerChef purges the hook. The All-Clear Chord plays. He's clean. But chat is already ahead of him:

"SHE CAN SEE YOUR SWEEP EM" "you just told her you found it KEKW" "the sweep is an EM event chat" "Model 3 is brutal"

StreamerChef reads chat. Pauses. "Wait. The Geiger sweep generates EM? My *diagnostic* is detectable?" He opens the Codex corruption section. Reads the EM emission table. "Oh. Oh no. Every click is 0.1 EM. I just blasted 6 EM units doing that sweep. She knows exactly when I found it and exactly when I purged it."

Chat: "HE JUST LEARNED ON STREAM" "content" "tactical corruption detection when"

StreamerChef leans back. "Okay chat. New plan. I need to sweep *slower*. Fewer clicks per second. Or... I could not sweep at all. Just purge blind from the integrity panel without hovering. Does blind purge generate less EM?"

He checks. Blind purge (reverting all corruptions from the integrity panel without Geiger-sweeping each one) generates a single 0.5 EM spike — versus the 6.0 EM + 0.5 EM = 6.5 EM of a full sweep-then-purge. But blind purge doesn't tell you *what* was corrupted — you lose the diagnostic information.

"The tradeoff," StreamerChef says to camera, "is diagnostic intelligence versus diagnostic stealth. If I sweep, I know exactly what she changed. But she knows I know. If I blind purge, she doesn't know whether I even noticed. But I don't learn anything about her strategy."

Chat: "GALAXY BRAIN" "this game teaches opsec" "corruption detection metagame PogChamp"

**Minute 4:30 — The Counter-Play**
Round 3. StreamerChef has a new strategy. He configures a "decoy sweep" — he moves his cursor across the workbench at sweep speed but NOT over the corrupted element. This generates Geiger clicks (his cursor passes near, but not over, non-corrupted elements — producing zero clicks, actually). He realizes: if there's no corruption along the sweep path, there's no clicking, and thus no EM. The Geiger EM is coupled to actual corruption proximity, not cursor movement.

"Chat, I can't fake a sweep. The EM only fires when the Geiger actually clicks, which only happens near real corruption. I can't generate decoy EM."

This is a critical design property of Model 3: the EM emission is information-theoretically honest. You can't fake diagnostic activity. The EM signature truthfully reports "diagnostic activity occurred near corruption." This prevents degenerate strategies where players spam fake sweeps to obscure real diagnostic activity.

**UI Annotations:**
- **Diagnostic EM (Model 3):** Each Geiger click = 0.1 EM at base position. Purge = 0.5 EM spike. Visible in opponent's EM overlay as "DIAGNOSTIC EMISSION" entries.
- **Blind purge button:** Integrity panel "PURGE ALL" button. Single 0.5 EM spike regardless of corruption count. No per-element diagnostic data.
- **Tournament spectator audio:** Both players' corruption layers mixed at equal volume. Casters hear injection confirmations, detection sweeps, purge events from both sides simultaneously.

---

## Strengths and Weaknesses

### Model 1: The Soundproof Room
**Strengths:** Zero intelligence leakage. Clean competitive fairness — audio cannot become a pay-to-win axis (better headphones = more information). Simple to implement. No balance concerns.
**Weaknesses:** Misses the thematic opportunity entirely. The locked EM emissions model says "deeper architectures are louder." Corruption detection is information processing. Exempting it from EM rules creates an inconsistency. Removes an entire layer of competitive depth.

### Model 2: The Thin Walls
**Strengths:** Minimal information leakage with high skill ceiling for interpretation. Creates the "oh, they can hear that?" learning moment. Easy to balance (ambient leak at -24dB is ignorable on bad audio setups, meaningful on good ones). Thematically consistent: corruption is a system disease, diseases have detectable symptoms.
**Weaknesses:** Creates an equipment advantage axis — headphone quality matters. The ambient leak is binary (corruption exists / doesn't exist) with no granularity. May be too subtle to ever matter in practice outside tournament play.

### Model 3: The Emission Echo
**Strengths:** Maximally consistent with the locked EM model. Creates the "diagnostic stealth vs. diagnostic intelligence" tradeoff — a genuinely novel competitive mechanic. Information-theoretically honest (can't fake diagnostic EM). Generates the "sweep EM metagame" — experienced players learn to minimize diagnostic footprint. Teaches real-world OPSEC principles (your monitoring tools have observability costs).
**Weaknesses:** Punishes careful play — the player who thoroughly investigates corruption generates more EM than the player who blind-purges. This inverts the intended reward structure (thoroughness should be rewarded, not penalized). Complex to implement and explain. May discourage corruption detection entirely (players skip diagnosis, blind-purge everything, lose diagnostic value).

### Model 4: The Broadcast Wound
**Strengths:** Corruption becomes a persistent tactical advantage for the attacker — injected hooks "phone home" with continuous EM. Creates target priority for Specialists (detect the ghost channel, you find the compromised unit). Distinguishes between hook corruption (detectable) and config corruption (invisible), creating an asymmetry that rewards architectural knowledge.
**Weaknesses:** May make hook injection too powerful (it provides both intelligence AND a persistent detection advantage). The "ghost channel" EM signature concept requires explaining a new EM sub-type. Combined with Model 3, the total EM information available to skilled players may create an overwhelming intelligence advantage for experienced players over newcomers.

### Model 5: The Mirror Match
**Strengths:** The richest competitive audio design — every injection creates a bidirectional audio bond between attacker and target. The wiretap drone, discovery waver, and purge notification create a complete narrative arc of infiltration → detection → removal, heard from the attacker's perspective. Turns corruption into a conversation between two players. Generates the strongest streaming/spectating content (casters can narrate the injection timeline in real-time via audio cues).
**Weaknesses:** Most complex to implement and mix. The wiretap drone creates a permanent ambient element that scales poorly with many simultaneous injections (5 active hooks = 5 layered drones = muddy audio). The purge notification gives the attacker precise timing intelligence for free (they know the exact tick of removal). May create a psychological advantage for the attacker (hearing your hooks working is satisfying and calming; hearing them removed is demoralizing).

---

## Interaction Effects

- **x EM emissions model (locked):** Models 3-5 extend the locked EM principle to diagnostic activities. Model 3 is the most natural extension: if computation generates EM, and corruption detection is computation, then detection generates EM. Models 4-5 extend further by making corruption itself emit EM (Model 4) or creating a bidirectional EM channel (Model 5).

- **x Corruption audio learning curve (6.10a):** The PvP corruption audio layer is introduced AFTER the campaign teaches the base vocabulary. Players learn "what corruption sounds like to ME" in Missions 7-10, then learn "what my corruption sounds like to THEM" in their first PvP matches. This is a natural second-act reveal — the audio vocabulary they learned in campaign has a competitive dimension they didn't know about.

- **x Counter-intelligence (2.16):** Model 5's "discovery waver" creates a counter-intelligence feedback loop. The attacker hears "they're inspecting my hook." The attacker can then decide to inject a *second* hook while the target is distracted with the first — the diagnostic activity itself creates a window of vulnerability.

- **x Channel naming as competitive metagame (7.01c):** In Models 4-5, the "ghost channel" EM from foreign hooks creates a new channel-naming consideration. If players name channels functionally ("threat-east"), and the enemy can detect EM from those channels, the channel name itself might be inferrable from EM pattern analysis. Renamed channels or auto-scrambled names (from 7.01c) gain additional value as EM obfuscation.

- **x Sealed watch (locked):** During sealed watch, players cannot sweep or purge — they can only watch. Under Model 3, this means zero diagnostic EM during sealed watch, creating a "safe period" where the attacker's injections operate undetected and undetectable. The plan phase is the dangerous period — the moment the workbench opens, the diagnostic EM risk begins.

- **x Inspector (locked):** Post-match Inspector shows EM emission timeline including all diagnostic emissions. In tournament review, analysts can reconstruct exactly when each player detected corruption, how long they swept, and whether they blind-purged or sweep-purged. This creates a "diagnostic efficiency" metric for competitive analysis.

- **x Streaming/spectating:** Model 5 is strongest for streaming. Casters can follow the injection narrative in real-time: "Listen — that ascending tone? IronClad just planted a hook. Now we wait... there's the drone. It's active. StreamerChef hasn't noticed yet. The drone is steady... steady... oh! Pitch waver! StreamerChef is inspecting! And — descending tone, the hook is purged. 14 ticks of intelligence."

---

## Comparable Games

**StarCraft: Brood War — Sound as Intelligence.** Professional StarCraft players famously extract intelligence from audio cues. The sound of a Terran building lifting off, the drone of Protoss warp-in, the screeching of Zerg larva morphing — all audible to nearby enemy units. Sound IS the fog of war in StarCraft. Robot Uprising's corruption audio leak directly parallels this: the sounds your system makes reveal your state to observant opponents.

**Counter-Strike — Footstep Economy.** CS players manage their audio signature by walking (silent) versus running (audible). This creates the "movement speed vs. stealth" tradeoff. Model 3's "sweep speed vs. diagnostic stealth" tradeoff is the direct equivalent: fast sweep = more EM = more information leaked, slow sweep = less EM = less leaked but slower diagnosis.

**Submarine Warfare — Active vs. Passive Sonar.** The canonical real-world example. Active sonar (ping) reveals the target's position but also reveals YOUR position. Passive sonar (listen) is silent but slower and less precise. Model 3 recreates this exactly: Geiger sweep (active sonar) finds corruption fast but emits EM. Blind purge (passive sonar) reveals nothing but sacrifices diagnostic data. The submarine metaphor is the deepest thematic match — you are a system hunting for foreign intrusions in your own architecture, and the act of hunting makes you visible.

**Among Us — The Emergency Meeting as Information Leak.** Calling an emergency meeting in Among Us reveals that someone suspects an impostor. The information content of the meeting call itself — separate from what's discussed — is intelligence ("someone noticed something"). Model 2's ambient leak functions similarly: the opponent knows "something is wrong over there" without knowing what.

**Poker — Tells.** Corruption audio leakage is a form of audio tell. The Sour Note leaking through Thin Walls is equivalent to a poker player's involuntary physical reaction to a bad hand. Skilled opponents read it. Unskilled opponents miss it. The skill gap is in perception, not mechanical advantage.

---

## Sensory Descriptions

### The Wiretap Drone (Model 5)
A warm, continuous hum in the mid-frequency range — 200-400Hz — like a distant transformer or a sleeping amplifier. It sits beneath your ambient audio, not competing with it but enriching it. When you have multiple active injections, the drones layer: two create a dyad, three create a quiet chord, five create a cluster that has an almost biological warmth, like a hive. The drone is stereo-panned to match the battlefield position of the infiltrated unit. When you turn your head (headphone tracking, if available), the drone stays fixed in space — the infiltrated unit IS the speaker. The warmth is important: this is not an alarm sound. This is the sound of successful infiltration. It should feel good. You are inside their system. You are listening.

### The Discovery Waver (Model 5)
The warm drone stutters. For 500ms, its pitch oscillates ±10 cents — a microtonal waver, like a radio signal passing through interference. The warmth cools slightly — the harmonic content shifts toward a thinner, more nasal timbre. The stuttering is irregular, not rhythmic — it feels biological, like a heartbeat disrupted. Then it resolves back to the steady drone. The moment of waver is a tiny shot of adrenaline: *they're looking.* You don't know if they'll find it. You don't know if they'll purge it. You only know they're searching. The waver is the sound of your cover being tested.

### The Diagnostic EM Burst (Model 3, Spectator View)
The spectator overlay shows Player A's base position pulsing with each Geiger click — rapid cyan flickers, like a strobe at the base of the board. The EM overlay labels each burst: "DIAGNOSTIC 0.1" "DIAGNOSTIC 0.1" "DIAGNOSTIC 0.1" — a machine-gun of tiny EM events. On the audio channel, each burst is a faint metallic pip — not the full Geiger click from Player A's perspective, but a compressed, distant echo of it, as if heard from across the battlefield through walls of signal noise. The pips increase in rate as Player A's sweep intensifies. A skilled caster can hear the sweep rhythm and narrate: "They're closing in — the pips are getting faster — they've found it."

### The Line Dead Tone (Model 5)
Your last injection has been purged. The wiretap drone — which has been your companion for 14 ticks, a warm background presence confirming your presence inside the enemy system — cuts to silence. Not a fade. A cut. The silence lasts 500ms — long enough to feel like a held breath. Then a flat, clinical 1kHz tone, 300ms, no warmth, no harmony, no reverb. It is the opposite of the target's All-Clear Chord. Where they hear warmth and resolution, you hear cold and disconnection. The line is dead. You are outside. You must begin again.

---

## Recommendation

**"The Graduated Wiretap" — Model 2 (default) + Model 3 (ranked) + Model 5 (tournament)**

Three competitive tiers, each adding audio intelligence depth:

1. **Casual/Unranked PvP:** Model 2 (Thin Walls). Ambient leak only. Low-stakes, low-information. Players learn that corruption has a faint audio presence without being punished for poor audio awareness.

2. **Ranked Gauntlet:** Model 3 (Emission Echo). Diagnostic activities generate EM. The "sweep stealth vs. sweep thoroughness" tradeoff becomes a competitive axis. Players develop diagnostic OPSEC habits — slower sweeps, blind purges when speed matters more than diagnosis, strategic timing of diagnostic activity to plan phases when opponent Specialists are likely out of detection range.

3. **Tournament/Custom:** Model 5 (Mirror Match). Full bidirectional corruption audio. The wiretap drone, discovery waver, and purge notifications create the richest spectating experience and the deepest competitive interaction. Reserved for high-skill play where both players understand the full audio vocabulary and can process three simultaneous audio layers (their own system, their infiltration feedback, and their strategic audio) without overload.

This tiered approach mirrors the campaign's progressive disclosure pattern: learn the sounds alone (campaign) → learn they leak faintly (casual PvP) → learn detection has EM cost (ranked) → learn the full bidirectional vocabulary (tournament). Each tier teaches a lesson about information security that the next tier builds on.

The TikTok clip: split-screen tournament footage. Left side: IronClad's face, eyes closed, listening. The wiretap drone hums. Right side: StreamerChef sweeping frantically, Geiger clicking rapid-fire. Center overlay: EM burst counter climbing — 2.0, 4.0, 6.0 EM units. IronClad opens her eyes. Smiles. She heard everything. Text overlay: "your debugging is my intelligence." 15 seconds. Every competitive player downloads the game.
