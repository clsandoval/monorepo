# 6.10h — Cross-Player Corruption Audio in Spectator Mode

## The Design Challenge

Every corruption audio document so far designs for a single listener with a single perspective. The Plan screen (6.10, 6.10c) serves one player diagnosing their own system. The sealed watch (6.10f) serves one player witnessing their own architecture under fire. The PvP intelligence leak model (6.10b) governs what one player hears of the *other* player's corruption. But spectator mode introduces a fundamentally different listener: someone who owns neither system, controls neither cursor, and needs to understand *both* corruption states simultaneously — or at least know where to direct their attention at any given moment.

In PvP Gauntlet mode, both players have independent corruption states. Player A's Relay might be suffering EMP buffer degradation while Player B's Command unit is fighting a context overload stun. On their own screens, each player hears only their own corruption vocabulary (per the 6.10b model). The spectator hears... what? Two simultaneous corruption soundscapes layered on top of the already-dense sealed watch battlefield audio? One player's corruption, selected manually? An intelligently mixed composite that highlights the most dramatic corruption event at any moment?

This document designs the spectator corruption audio system — the acoustic experience for tournament casters, casual viewers, competitors reviewing their own replays, and the streaming audience consuming Robot Uprising as entertainment rather than as a puzzle to solve.

---

## The Mechanic: Three Approaches

### Approach A: "The Camera" — Follow Selected Player's Corruption Only

The spectator selects a player perspective (Player A or Player B), and the corruption audio stream routes exclusively from that player's system. The spectator hears exactly what that player would hear — the same bitcrusher degradation, the same choked babendil, the same context overload stun — spatialized to that player's board position. Switching players is a hard cut: the spectator clicks Player B's portrait in the spectator UI, and the corruption audio stream swaps entirely. Player A's degrading Relay goes silent; Player B's overloading Command unit fades in over 200ms.

**Mixing specifics:** The selected player's corruption audio routes through the spectator's mix bus at the same levels defined by 6.10f (sealed watch vocabulary), modified by the spectator's own intensity config (6.10e). The unselected player's corruption audio is fully muted — zero crossbleed. The spectator's battlefield audio (kulintang, agung, dabakan, babendil pings) remains unified across both boards; only the corruption layer switches.

**Spectator UI:** A persistent bar at the top of the spectator view shows two player portraits with corruption integrity percentages. The currently selected player's portrait has a bright amber border pulse at 0.5Hz — the same pulse frequency used for the Predecessor's emotional state indicator (6.03a), creating timbral continuity in the spectator UI language. Clicking the other portrait switches the corruption audio feed. A keyboard shortcut (Tab) toggles between perspectives. The currently active corruption audio source is indicated by a small waveform icon animating beneath the selected portrait — the spectator can see at a glance whose corruption they are hearing.

**The sound of switching:** When the spectator switches from Player A to Player B, the outgoing corruption audio does not cut instantly. A 200ms exponential fade-out on the outgoing stream overlaps with a 200ms exponential fade-in on the incoming stream. During the 200ms overlap, both corruption streams are audible at -12dB each — a brief, dissonant moment of superposition before the new perspective resolves. This crossfade is short enough to feel responsive but long enough to avoid a jarring audio pop. If the outgoing player's corruption is at critical severity (integrity below 30%), the crossfade extends to 400ms and the outgoing stream fades with a descending pitch shift — a "pulling away" sensation, like tuning away from a distress signal.

### Approach B: "The God View" — Merged Audio Showing Both Corruption States

The spectator hears both players' corruption simultaneously, stereo-separated. Player A's corruption audio is panned 70% left. Player B's corruption audio is panned 70% right. The spectator's stereo field becomes a diagnostic map: corruption on the left is Player A's problem; corruption on the right is Player B's. Both streams play concurrently, using the sealed watch vocabulary (6.10f), each at -6dB relative to the single-player default (to prevent combined loudness from exceeding the mix ceiling).

**Mixing specifics:** Each player's corruption stream occupies a distinct stereo position AND a distinct frequency sub-band to minimize masking:

| Player | Stereo Pan | Frequency Emphasis | Character |
|--------|-----------|-------------------|-----------|
| Player A | 70% Left | Sub-100Hz + 4-6kHz | Deeper rumble, lower crunch |
| Player B | 70% Right | 100-200Hz + 6-8kHz | Higher buzz, brighter crunch |

The frequency separation is achieved through subtle EQ shelving on each player's corruption bus — not enough to change the timbral identity of the corruption sounds, but enough that a bitcrusher degradation from Player A (emphasizing sub-bass distortion) sounds distinct from the same degradation on Player B (emphasizing mid-bass granularity). A spectator wearing headphones can localize "left crunch = A is hurting, right crunch = B is hurting" within the first 30 seconds of exposure.

**Conflict resolution:** When both players experience simultaneous corruption events (Player A's hook chain fails at the same tick as Player B's unit overloads), the god view plays both. The agung tick clock remains center-panned and sacred (per 6.10f Principle 3). The 200ms sidechain duck applies to BOTH corruption buses simultaneously, ensuring the tick boundary marker cuts through even a worst-case dual-corruption moment. In practice, simultaneous critical corruption on both sides is rare — the god view's dual-stream approach sounds cluttered perhaps 5% of ticks, which is tolerable for the narrative payoff of hearing both systems deteriorate in real time.

**Visual sync:** The spectator's split-screen view (both boards visible simultaneously) maps to the stereo audio panning. Player A's board is on the left, Player B's on the right. The corruption audio's stereo position matches the visual layout — spatial audio reinforces spatial video, creating a unified left/right information map.

### Approach C: "The Director" — Alternating Focus with Smooth Crossfade

An automated mixing system tracks both players' corruption severity in real time and directs the spectator's audio attention toward the player experiencing the more dramatic corruption event. The system continuously evaluates a "corruption drama score" for each player based on:

- **Integrity delta**: Fastest-dropping integrity gets priority (a player losing 15% in 3 ticks is more dramatic than stable 60%)
- **Event novelty**: First occurrence of a corruption event type in the match gets +20 drama points (first hook chain failure is more interesting than the fifth)
- **Severity tier**: Critical events (overload stun, alarm cascade) always override moderate events (single degradation tick)
- **Narrative arc**: If one player has been the corruption focus for >10 ticks, the system adds a +15 "underdog bonus" to the other player's drama score, creating natural cut-rhythm

The higher-scoring player's corruption audio plays at full level. The lower-scoring player's corruption audio ducks to -18dB — audible as a faint background texture but not demanding attention. When the drama score flips (the other player's corruption becomes more interesting), a 500ms cosine crossfade transitions the focus. During the crossfade, both streams briefly equalize at -9dB before the new focus player rises to full and the old focus ducks.

**The caster override:** A physical broadcast console input (or keyboard shortcut) allows the tournament caster to manually lock the corruption focus to a specific player, overriding the automated drama score. The lock is indicated by a padlock icon on the spectator UI. The caster can release the lock at any time, returning to automated switching. This gives casters the same editorial control that a television director has when cutting between cameras — the algorithm suggests, but the human decides.

**Transition sound design:** The crossfade is not just a volume change. When focus shifts from Player A to Player B, Player A's corruption audio undergoes a 500ms low-pass filter sweep (16kHz down to 800Hz), making it sound like it is receding behind a wall — the corruption is still there, but muffled, distant, belonging to the background. Simultaneously, Player B's corruption audio undergoes a reverse high-pass filter sweep (800Hz up to 16kHz), brightening and clarifying, as if a window is opening onto Player B's system. The transition sounds like the spectator's ear is physically moving between two rooms — one door closing, another opening.

---

## The Broadcast Mix: Audio Engineering for Streaming

Regardless of which approach (A, B, or C) the spectator uses, the broadcast output requires additional mixing considerations:

**Caster voice ducking:** Tournament broadcasts overlay voice commentary. The corruption audio must not compete with the caster's voice (typically 200Hz-4kHz, peaking at 2-3kHz). A sidechain compressor on the corruption bus, keyed to the caster's microphone input, ducks corruption audio by 6-9dB whenever the caster speaks. The duck has a 10ms attack and 300ms release — fast enough to react to speech onset, slow enough to avoid pumping artifacts during rapid commentary.

**Loudness normalization:** Broadcast audio targets -16 LUFS (YouTube/Twitch standard). The corruption audio layer is budgeted 15% of the total loudness ceiling, with the battlefield soundtrack at 40%, combat SFX at 30%, and caster voice at 15%. This means corruption audio in broadcast is quieter than in solo play — but its distinctive timbral character (distortion, bitcrushing, ring modulation) ensures it cuts through even at reduced volume. Corruption sounds in spectral bands above 4kHz are particularly broadcast-resilient because caster voice and soundtrack rarely occupy that range.

**Highlight replay:** When a broadcast switches to replay mode (caster rewinding to show a key moment), the corruption audio for the replayed segment plays at +3dB relative to live broadcast levels. The heightened corruption audio during replay serves the same function as a sports broadcast increasing crowd noise during an instant replay — it amplifies the drama of the reviewed moment.

---

## Player Journeys

#### Journey: Jake, 29, Tournament Caster and Content Creator

**Context:** Grand finals of the SEA Regional Gauntlet Championship, streamed to 12,000 viewers on Twitch. Jake is casting solo from his home studio with a Shure SM7B microphone and Beyerdynamic DT 990 Pro headphones. The broadcast uses Approach C ("The Director") with caster override. Both finalists — a hook-injection specialist and a defensive architecture player — are deep in a best-of-5, tied 2-2. Jake's OBS scene shows the split-screen spectator view with both boards visible.

**Tick 0 — Match Start:** The boards deploy. Jake narrates loadouts. The corruption audio is silent — both players start at 100% integrity. The kulintang sets tempo. Jake's voice occupies the mix cleanly; the sidechain ducker has nothing to duck.

**Tick 4 — First Blood:** The hook-injection specialist plants a foreign hook in the defender's Relay. Jake does not hear a corruption sound on his end — the injection itself is silent in spectator mode (per 6.10b, the attacker hears a confirmation chirp but the spectator is not the attacker). What Jake DOES see is the defender's integrity bar on the spectator UI tick down from 100% to 94%. He marks it mentally. "And the injection is in — we should hear that Relay start to complain any second now."

**Tick 8 — The Director Activates:** The defender's Relay fires its corrupted outbound hook. In spectator mode, the Director's drama score spikes for the defender (first hook chain failure of the match = maximum novelty bonus). Jake hears the choked babendil — the clean metallic attack collapsing into a descending flanging glissando, panned slightly right to match the defender's board position. The silence gap. The dry click. His chat explodes: "THE RELAY IS COMPROMISED." Jake leans into the mic: "And there it is — the chain just broke. The defender's Strikers are blind on the right flank." As Jake speaks, the sidechain ducker pulls the choked babendil's lingering resonance down by 8dB, keeping his voice clear and present above the corruption audio. The combination — Jake's urgent narration layered over the muffled, dying bell sound — creates a broadcast moment where voice and game audio complement rather than compete.

**Tick 14 — Dual Corruption:** The defender retaliates with EMP attacks. Now BOTH players have corruption. The Director's drama score oscillates between them. The attacker's Scout is suffering buffer degradation (bitcrusher filter creeping in from the left side of the stereo field), while the defender's Relay chain is still failing (choked babendils panning right). The Director crossfades between them every 3-4 ticks, following the action. Jake hears the room-transition effect — the defender's corruption muffles behind a closing low-pass filter as the attacker's degradation brightens through an opening high-pass sweep. "Both sides taking hits now. Listen to that — you can hear the Scout degrading on the attacker's side."

**Tick 22 — Caster Lock:** The defender's Command unit hits context overload. Jake sees the drama score spike and hears the ascending chromatic run begin — *dit-dit-dit-DIT-DIT-DIT* — but the automated Director is about to crossfade back to the attacker's side. Jake hits his lock key. The padlock icon appears. The corruption audio stays on the defender. POP. The capacitor discharge. The 60Hz buzz fills the right channel. Sparks crackle. Jake holds silence for two full seconds, letting the overload stun play out in full for his audience. Then, as the recovery chime whispers, he speaks: "Context overload on the Command unit. That is the match. The defender's coordination is gone." The chat fills with waveform emojis. The broadcast moment works because Jake controlled the audio focus — the Director would have switched away, but Jake's editorial override kept the audience locked on the most narratively significant sound.

---

#### Journey: Priya, 34, Casual Viewer Watching on Phone

**Context:** Priya watches a Gauntlet tournament VOD on YouTube during her commute, phone speaker in one hand, standing on the MRT in Manila. She has played Robot Uprising's campaign through Mission 6 but has never touched competitive mode. She is watching because her coworker told her the finals were "insane."

**Minute 0:00 — Ambient Discovery:** The broadcast uses Approach C with caster narration. Priya's phone speaker compresses the audio to mono and clips anything below 200Hz. This means the sub-bass corruption rumble (Player A's frequency emphasis band) is completely inaudible to her. What she CAN hear: the mid-range and upper-range corruption sounds — the choked babendil's flanging descent (200Hz-4kHz), the bitcrusher's granular texture (2-8kHz), the context overload stun's spark transients (4-8kHz). The frequency band separation designed for the god view (Approach B) becomes irrelevant on her phone speaker; but the Director's approach (C) still works because it focuses on one stream at a time, and the timbral character of corruption — distortion, wrongness, grabbed resonance — translates even through a 40mm phone driver.

**Minute 3:12 — The Babendil Moment:** The defender's hook chain fails. The choked babendil plays through the broadcast. Priya recognizes it — not consciously, not by name, but the sound of a bell being grabbed mid-ring triggers an instinctive "something went wrong" response. She has heard clean babendil pings during her own campaign gameplay. This sound starts like those pings and then DIES. The caster confirms: "The chain just broke." Priya nods. She understood the audio cue before the caster named it. The corruption audio vocabulary she absorbed during Missions 1-6 (the Whisper Curriculum from 6.10a) transferred to spectator comprehension without any additional tutorial.

**Minute 7:45 — Confusion Point:** Both players are taking corruption damage. The Director crossfades between them. Priya cannot distinguish which player's corruption she is hearing — the room-transition effect (low-pass fade out, high-pass fade in) is subtle on a phone speaker, and she is not wearing headphones so the stereo panning is collapsed to mono. She relies entirely on the caster's narration to track whose corruption is active. "Player A's Scout is degrading" — she hears the crunch and maps it to the caster's words. Without the caster, the god view would be confusing on mono phone audio; the Director approach with narration remains legible.

**Minute 11:30 — The Context Overload:** The overload stun plays. Even through the phone speaker, the ascending chromatic run is unmistakable — that rapid *dit-dit-dit-DIT-DIT* is one of the most distinctive sounds in Robot Uprising's vocabulary, and its spectral content (pure tones in the 400Hz-4kHz range) survives phone speaker compression perfectly. The POP. The buzz (the 60Hz fundamental is lost, but the 120Hz and 180Hz harmonics survive as a rough, pulsating distortion). Priya actually pulls the phone closer to her ear. The sound is alarming, even on a 40mm driver in a noisy train car. The caster's two-second silence after the stun — the same editorial choice Jake made — lets the game audio carry the moment. Priya does not need to understand the mechanical implications. She hears a machine breaking down, and the caster's silence tells her it matters.

---

#### Journey: Datu, 26, Diamond II Competitor Reviewing His Own Replay

**Context:** Datu lost a ranked Gauntlet match 30 minutes ago and is watching the replay in spectator mode, locked to his own perspective (Approach A, "The Camera"). He is wearing Audio-Technica ATH-M50x headphones in his bedroom in Cebu City. The replay system renders the full spectator audio mix for the selected player, including corruption audio at the intensity level Datu had configured during the live match (Standard intensity, 6.10e).

**Tick 0 — Self-Scouting:** Datu scrubs to the moment he thinks the match turned — around Tick 11, when his Striker walked into an ambush. He has a hypothesis: the enemy injected a hook into his Scout's broadcast channel, and the corrupted broadcast fed false position data to his Striker. He needs to confirm this by listening.

**Tick 8 — The Hook Injection:** Datu scrubs back further. At Tick 8, he watches his Scout's outbound hook fire. In the replay, the babendil ping plays clean — bright, metallic, correct. But Datu notices something he missed during the live match: the replay's corruption integrity bar ticks down by 6% at this exact moment. Something was injected. He did not hear a corruption sound because the injection itself is silent to the victim (6.10b Model 2 — only the ambient leak would have been audible at -24dB, and during a live match with combat sounds, he never noticed).

**Tick 9 — Switching Perspective:** Datu presses Tab to switch to his opponent's perspective. The 200ms crossfade transitions the corruption audio. Now he is hearing HIS OWN system's corruption from the OUTSIDE — through the attacker's Model 5 ("Mirror Match") audio. He hears the faint "wiretap drone" — the warm humming in his opponent's ambient that represents the active injected hook. His opponent heard this during the live match. The drone is barely perceptible at Standard intensity, a subliminal confirmation that the hook is alive and feeding data. Datu's jaw tightens. His opponent KNEW the injection was active. The drone told them.

**Tick 11 — The Moment of Truth:** Datu switches back to his own perspective. At Tick 11, his Scout broadcasts again. This time, the babendil does not choke (the hook was not sabotaging the transmission mechanism — it was modifying the signal CONTENT). The ping sounds clean. But the data it carried was corrupted — false position data, invisible to the ear because content corruption has no audio signature during sealed watch (6.10f only covers structural failures: buffer degradation, hook failures, context overload). Datu realizes: the corruption audio system told him everything about his Relay's degradation and his hook chain's structural integrity, but it was SILENT about data-level sabotage. The injected hook was a content attack, not a structural one. He heard nothing because there was nothing to hear.

**Post-Replay:** Datu opens the Inspector for the replay (available in spectator mode as a post-match debrief tool). He scrubs to Tick 8, activates the channel data overlay, and sees the modified payload — enemy position coordinates swapped, sending his Striker east when the threat was west. The Inspector provides the analytical proof. The spectator replay provided the temporal context. But the audio? The audio was honestly, correctly, informatively SILENT about this attack vector. Datu makes a mental note: in future matches, he needs to cross-reference corruption integrity bar drops with the ABSENCE of corruption audio during sealed watch. A drop without a sound means content corruption — the most dangerous kind, because you cannot hear it happening.

---

## Strengths and Weaknesses

### Strengths

**Spectator mode as narrative engine.** Corruption audio transforms competitive matches from abstract positional strategy into audible drama. A tournament viewer does not need to understand buffer capacities or hook trigger conditions — they hear a bell being strangled and know something went wrong. The corruption audio vocabulary functions as an emotional soundtrack layer that communicates system health through visceral sonic quality rather than numerical readouts.

**Approach diversity matches viewer diversity.** Approach A serves the analytical viewer who wants deep understanding of one player's corruption state. Approach B serves the experienced spectator who can parse dual-stream stereo information. Approach C serves the broadcast audience and casters who need automated editorial direction. The three approaches are not competing — they serve different spectator contexts, and the game can default to C for broadcasts while offering A and B for personal spectating.

**Corruption audio transfers from player to spectator.** A player who completed the campaign has already internalized the corruption audio vocabulary through the Whisper Curriculum (6.10a). When they watch a tournament, the choked babendil, the bitcrusher degradation, and the overload stun are immediately recognizable. The spectator does not need a separate tutorial — the campaign IS the tutorial for spectator comprehension.

**Caster-audio synergy.** The Director approach (C) with caster override creates a two-channel information system: the game audio communicates WHAT is happening (corruption sounds), and the caster communicates WHY it matters (strategic implications). The sidechain ducker ensures these two channels never fight for spectral space.

### Weaknesses

**Mono and low-quality playback degrades Approaches A and B.** The stereo panning that makes Approach B legible (Player A left, Player B right) collapses entirely on phone speakers and laptop speakers in mono mode. Approach A's perspective switching is inaudible without stereo (the 200ms crossfade becomes a volume dip). Only Approach C, with its full-frequency-range crossfade filter sweeps, retains legibility in mono — the room-transition effect is audible as a timbral change, not just a spatial change.

**Content corruption is invisible to spectators.** Data-level sabotage (modified payloads, false position data) produces no corruption audio during sealed watch. A spectator watching a match where one player wins through content injection may see the integrity bar drop but hear nothing. The most sophisticated competitive strategies are the hardest to spectate acoustically.

**Automated Director can miss narratively significant moments.** The drama score algorithm prioritizes severity and novelty, but it cannot understand narrative context. A minor corruption event that the caster knows is strategically pivotal (e.g., the first sign that a player's defensive architecture is cracking) may score lower than a dramatic but inconsequential overload stun on a unit that was about to die anyway. The caster override mitigates this, but requires an experienced caster who can anticipate the audio focus needs.

**Dual corruption in Approach B risks cacophony.** When both players experience simultaneous critical corruption events (rare but possible in aggressive mirror matches), the god view plays both at -6dB each. Two choked babendils, or a choked babendil overlapping with an overload stun, can produce a wall of distorted noise that communicates "everything is broken" without telling the spectator which player is in worse shape. The frequency band separation helps, but cannot fully resolve two concurrent critical events.

---

## Interaction Effects

### With Intensity Config (6.10e)

The spectator has their own independent intensity slider, separate from both players' settings. A spectator at Whisper hears minimal corruption audio even if both players are at Aggressive — the spectator's experience is their own. Tournament broadcast defaults to Standard intensity, but the production team can adjust. Casters often prefer a notch above Standard (60-65% on the slider) to ensure corruption events are audible above their own narration without reaching Aggressive territory where the distortion competes with speech.

### With Accessibility (6.10d)

A deaf spectator using the Visual Heatmap modality sees corruption overlays on BOTH boards simultaneously in split-screen view — no stereo panning required, no approach selection needed. The heatmap approach is inherently "god view" because it is spatial, not auditory. A spectator using the Screen Reader captioner receives per-tick corruption announcements prefixed with the player name: "Player A Tick 8: Relay buffer at 50%. Player B Tick 8: Command hook chain failure." The screen reader approach is inherently "god view" because it can list both players' events sequentially within a single tick announcement.

### With Sealed Watch (6.10f)

The spectator's corruption audio uses the sealed watch vocabulary exclusively during battle ticks — bitcrusher degradation, choked babendil, overload stun. The Plan screen diagnostic vocabulary (Geiger clicks, heartbeat monitor) is NOT available to spectators even when viewing a player's Plan phase, because the Plan screen diagnostic sounds are cursor-responsive (they react to the player's mouse position), and the spectator's cursor is not on the player's board. Instead, during Plan phase spectating, the spectator sees the corruption heatmap visual overlay on the player's workbench and hears only the ambient corruption perturbation layer — the diffuse wrongness — without the interactive diagnostic sounds. This means spectators cannot audio-diagnose a player's corruption; they can only witness its consequences during sealed watch.

### With Streaming and Recording

OBS/Streamlabs capture the spectator's audio output, including corruption audio. The sidechain ducker requires the caster's microphone to be routed through the game's audio engine (via a virtual audio cable or the game's built-in broadcast mode). Without this routing, the corruption audio plays at full level during commentary, competing with the caster's voice. The game's broadcast mode provides a one-click "Enable Caster Duck" toggle that routes the default microphone input as a sidechain key signal. For non-caster streamers (viewers streaming their own spectating), the duck is disabled and the standard intensity slider controls corruption loudness.

### With Corruption Audio Modding (6.10g)

In spectator mode, the audio mod pack is the SPECTATOR'S choice, not the players'. A spectator using the horror "Dread Machine" pack hears industrial-grinding corruption sounds during a match between two players who both use the default cultural kulintang-based corruption audio. Tournament broadcasts use the default pack exclusively — modded packs are disabled in official broadcast mode to ensure consistent audio identity. Replay spectating uses the spectator's pack, creating the possibility that Datu reviewing his own replay with a different audio pack hears corruption events with different timbral character than he experienced live — a deliberate design choice, because the spectator's pack reflects their current listening preference, not the historical match state.

---

## Comparable Games

### StarCraft II Observer Mode — The Gold Standard for Competitive Spectating Audio

StarCraft II's observer mode lets casters switch between player perspectives, view "everyone" mode, and hear all game audio unified into a single stream. Crucially, SC2 does NOT separate corruption-like audio per player — there is no per-player audio state to manage. Every sound (unit death, ability activation, base under attack) is global. Robot Uprising's corruption audio introduces a problem SC2 never faced: two independent, concurrent, player-specific audio states that need to be mixed for a third-party listener. The Director approach (C) is Robot Uprising's answer to SC2's observer — an automated camera that the caster can override, extended from visual framing to audio mixing.

### League of Legends Spectator — Fog of War as Audio Metaphor

LoL's spectator mode lifts the fog of war, showing both teams' vision simultaneously. This is the visual equivalent of Approach B (god view). But LoL's spectator audio does not separate per-team — all sounds play at once. The result in chaotic teamfights is cacophony that the casters narrate over. Robot Uprising's corruption audio, with its frequency-band separation per player and sidechain ducking for caster voice, directly addresses LoL's cacophony problem. The lesson from LoL: god-view audio works only if the two streams are spectrally differentiated, not simply summed.

### Fighting Game Tournament Audio — The Venue Problem

In fighting game tournaments (EVO, CEO), both players share a single audio output through the venue speakers. There is no per-player audio stream. The crowd hears hit confirms, combo sounds, and KO effects for both players simultaneously, and the audio design makes this legible because fighting game sound effects are temporally separated — only one player is getting hit at a time. Robot Uprising's PvP corruption, unlike fighting game damage, can be SIMULTANEOUS and SUSTAINED (both players degrading at the same time across multiple ticks). The fighting game model (temporal separation) does not apply. Instead, Robot Uprising must rely on spectral separation (frequency bands) and spatial separation (stereo panning) — tools that fighting games never needed because the problem never arose.

### Dota 2 Caster Experience — The Observer Controls Precedent

Dota 2's observer toolkit gives casters direct control over camera position, fog of war visibility, and replay speed. The caster IS the director. Robot Uprising's caster override in Approach C follows this model: the algorithm handles the default, but the caster can lock focus, switch perspectives, and control the audio editorial. Dota 2's lesson is that professional casters will always want manual override, but will also appreciate intelligent defaults for the 80% of moments where manual control is unnecessary.

---

## Sensory Descriptions

### The Sound of Approach A: Following One Player Through Their Corruption

You are watching a Gauntlet match. You have selected the defender's perspective. The attacker's board is visible on your left screen, but acoustically silent — no corruption from that side, no diagnostic information. Your audio world is the defender's world. The kulintang drives at 120 BPM, shared between both boards, but the corruption sounds come only from the right — the defender's Relay, center-right in your stereo field, where the babendil just choked. You heard the clean metallic attack — that bright, familiar 30ms of bell resonance — and then the pitch sagging, flanging downward like a record dragged to a stop by a hand pressed against the platter. The descending glissando warps through 150ms of sickening frequency distortion, and then silence. A silence so conspicuous it has weight. You are inside one player's acoustic reality. The attacker's Scout is degrading on the other board, but you hear nothing of it. Your headphones contain one story, one system, one unraveling architecture. Tab. Click. The 200ms crossfade pulls you out — the choked resonance fades through a descending pitch shift, a radio signal receding — and the attacker's audio blooms in. Now you hear the bitcrusher: the Scout's movement sounds have acquired a gritty, sandpaper edge, a 12-bit granularity laid over what should be clean footfall audio. You are in a different room, hearing a different patient's symptoms.

### The Sound of Approach B: The God View, Both Players at Once

Both boards fill your headphones. The stereo field is a map. Left: the attacker's system. Right: the defender's system. Center: the shared battlefield — agung, kulintang, dabakan. You hear the attacker's Scout degrading in your left ear — a low, rumbling bitcrusher that emphasizes the sub-bass, making the unit's movement sounds feel like they are being transmitted through a concrete wall. Simultaneously, in your right ear, the defender's Relay fires a corrupted hook. The choked babendil plays — but in the god view, its frequency emphasis is shifted slightly upward, its flanging distortion brighter, more metallic, sitting above the attacker's rumble in the spectral hierarchy. Two corruptions, two ears, two distinct textures. You can close your left eye and hear only the attacker's degradation. Close your right eye and hear only the defender's broken chain. Open both and the two streams coexist — not fighting, not masking, but cohabiting the stereo field like two instruments in an orchestra seated on opposite sides of the stage. Then, at Tick 14, both players experience critical corruption simultaneously. The god view plays both: the attacker's overload stun in the left channel (ascending chromatic run, POP, 60Hz buzz with sub-bass emphasis) and the defender's second hook chain failure in the right channel (choked babendil, silence, click). For one tick, your headphones contain a duet of breaking systems. It is dissonant, cluttered, overwhelming — and it communicates exactly what it should: everything is falling apart on both sides at once.

### The Sound of Approach C: The Director Choosing for You

You are watching the broadcast. The caster is narrating. The corruption audio exists in the background of the mix — present, legible, but not dominant. The Director has been tracking the defender for three ticks; the defender's Relay degradation plays at full level, the bitcrusher's granular crunch audible beneath the caster's voice (the sidechain ducker has pulled it down 7dB during speech, but the 4-8kHz crunch frequency cuts through even at reduced volume). Then the attacker's Command unit overloads. The drama score flips. You hear the transition: the defender's corruption audio — the Relay's crunchy, degraded sound — passes through a low-pass filter sweep, losing its high-frequency detail over 500ms, becoming muffled, distant, like hearing it through a closing door. Simultaneously, the attacker's overload stun brightens: a high-pass filter sweeps upward, revealing the ascending chromatic run in increasing clarity — *dit-dit-dit-DIT-DIT* — the sound emerging from behind a wall, opening like a window, the stun's metallic staccato sharpening into full presence. POP. The capacitor discharge fills the center-left. The 60Hz buzz arrives, full and crackling, the spark transients bright and sharp. The caster pauses. The game audio carries the moment. Two seconds of overload stun, unnarrated, playing through your speakers with the authority of a sound that demanded the Director's attention and won. Then the caster speaks, and the sidechain ducker gently pulls the buzz down beneath the voice. You heard the transition — one room closing, another opening — and you understood it as editorial. Someone (or something) decided you needed to hear the attacker's overload more than the defender's degradation. The Director chose well.
