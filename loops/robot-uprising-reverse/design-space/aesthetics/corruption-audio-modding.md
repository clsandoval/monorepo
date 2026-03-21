# 6.10g — Player-Authored Corruption Audio Modding

## The Design Challenge

Robot Uprising's corruption audio system (6.10c, the hybrid vocabulary) produces one of the game's most distinctive sensory experiences: the creeping dissonance, the Geiger sweep, the heartbeat severity scaling, the whispered enemy presence, the all-clear chord. Players who spend 40+ hours with these sounds internalize them as bodily reflexes — the ambient perturbation triggers a cortisol spike before conscious recognition, the resolution chord releases it.

But after 40 hours, those reflexes can calcify into furniture. The sour kulintang note that once made your stomach clench becomes background hum. The Geiger clicks that once focused your attention become wallpaper. The corruption audio vocabulary — the game's most affectively powerful system — risks becoming the first thing veteran players tune out.

The question is not whether to let players change the corruption sounds. It is **how deep the modding surface goes** without breaking the layered information architecture that makes the corruption audio system functional rather than decorative. Every sound in the hybrid vocabulary carries semantic weight: ambient perturbation = "something is wrong," interaction clicking = "it's over there," event heartbeat = "it's this bad," resolution tone = "it's fixed." A sound pack that replaces the Geiger clicks with silence destroys detection. A pack that replaces the all-clear chord with a 30-second dubstep drop destroys pacing. A pack that replaces the whisper network with earrape screaming destroys trust.

The modding system must be **permissive enough to enable genuine creative expression** (horror packs, comedy packs, lo-fi packs, cultural reinterpretations) while **constrained enough to preserve the information hierarchy** that makes corruption audio mechanically functional.

---

## The Sound Pack Architecture

### Pack Structure

A corruption audio sound pack is a directory containing a JSON manifest and audio files:

```
my-corruption-pack/
  manifest.json
  ambient/
    perturbation-low.ogg      # integrity 90-99%
    perturbation-mid.ogg      # integrity 75-89%
    perturbation-high.ogg     # integrity 50-74%
    perturbation-critical.ogg # integrity below 50%
  interaction/
    click-bright.ogg          # visible corruption (2kHz default)
    click-mid.ogg             # subtle corruption (800Hz default)
    click-deep.ogg            # deep corruption (400Hz default)
  event/
    heartbeat-mild.ogg        # 60 BPM equivalent
    heartbeat-moderate.ogg    # 90 BPM equivalent
    heartbeat-severe.ogg      # 120 BPM equivalent
    heartbeat-critical.ogg    # 160 BPM + flatline
    whisper-loop.ogg          # enemy hook presence
  resolution/
    revert.ogg                # single corruption fix
    purge.ogg                 # enemy hook removal
    all-clear.ogg             # full integrity restored
  preview/
    thumbnail.png             # 256x256 pack art
    demo.ogg                  # 15-second audio preview
```

### The Manifest

```json
{
  "pack_id": "dread-machine-v2",
  "name": "Dread Machine",
  "author": "nightsignal",
  "version": "2.1.0",
  "description": "Industrial horror corruption vocabulary. Grinding metal, labored breathing, factory alarm.",
  "category": "horror",
  "tags": ["industrial", "dark", "immersive"],
  "license": "cc-by-nc-4.0",
  "base_audio_affinity": ["kulintang", "server-room"],
  "sounds": {
    "ambient.perturbation-low": {
      "file": "ambient/perturbation-low.ogg",
      "duration_ms": 4000,
      "loop": true,
      "peak_db": -18.2,
      "frequency_band": "low-mid"
    }
  }
}
```

Required manifest fields: `pack_id` (alphanumeric + hyphens, globally unique), `name`, `author`, `version` (semver), `category` (one of: `horror`, `comedy`, `minimal`, `lo-fi`, `cyberpunk`, `cultural`, `experimental`, `default`), `sounds` (mapping of slot IDs to audio metadata).

Optional fields: `description`, `tags` (freeform, max 8), `license`, `base_audio_affinity` (which of the four base audio options — kulintang, server-room, synthwave, adaptive-silence — this pack was designed to complement; informational, not enforced).

### Moddable Sound Slots

Every sound in the three-layer corruption vocabulary is moddable. The 15 slots map directly to the hybrid vocabulary layers:

| Layer | Slot ID | Default Sound | Semantic Role |
|-------|---------|---------------|---------------|
| Ambient | `ambient.perturbation-low` | Sour kulintang overtone, -30dB | "Something is slightly off" |
| Ambient | `ambient.perturbation-mid` | Rhythmic micro-stutter, 4s cycle | "Something is clearly wrong" |
| Ambient | `ambient.perturbation-high` | Timbre shift + low-freq rumble | "The system is compromised" |
| Ambient | `ambient.perturbation-critical` | Tempo flux, pitch waver, dropouts | "The system is failing" |
| Interaction | `interaction.click-bright` | 2kHz metallic tick, 15ms | "Visible corruption nearby" |
| Interaction | `interaction.click-mid` | 800Hz tick + 5ms noise tail | "Subtle corruption nearby" |
| Interaction | `interaction.click-deep` | 400Hz tick + 50ms distortion | "Deep corruption nearby" |
| Event | `event.heartbeat-mild` | 60 BPM synth pulse | "Low severity" |
| Event | `event.heartbeat-moderate` | 90 BPM elevated pulse | "Medium severity" |
| Event | `event.heartbeat-severe` | 120 BPM arrhythmic pulse | "High severity" |
| Event | `event.heartbeat-critical` | 160 BPM + flatline tones | "Critical — about to fail" |
| Event | `event.whisper-loop` | Processed vocal fragments, 2s loop | "Enemy presence detected" |
| Resolution | `resolution.revert` | 440Hz pure sine, 300ms fade | "One corruption fixed" |
| Resolution | `resolution.purge` | Sharp carrier → 440Hz sine | "Enemy hook removed" |
| Resolution | `resolution.all-clear` | 1s silence → major triad swell | "Full integrity restored" |

Packs may include a subset of slots. Missing slots fall back to the default hybrid vocabulary. A "minimal" pack might only replace the ambient layer, leaving interaction and event sounds stock.

### Non-Moddable Sounds

The following are explicitly **excluded** from corruption audio modding:

- **The agung tick clock.** The deep gong strike marking each tick is a temporal anchor, not a corruption signal. Modding it would desynchronize the player's sense of game time.
- **Dabakan combat strikes.** Elimination sounds are combat feedback, not corruption feedback. They live in a separate modding surface (future aspect).
- **Babendil signal pings.** Hook transmission chimes are communication feedback.
- **Inspector ambient.** The forensic analysis soundscape is structurally distinct from corruption audio.
- **The Predecessor's voice lines.** Narrative audio is not corruption audio, even when the Predecessor comments on corruption state.

### Pack Categories

| Category | Description | Example Packs |
|----------|-------------|---------------|
| `horror` | Dark, oppressive, dread-inducing. Corruption feels like a haunting. | "Dread Machine" (industrial grinding), "The Hive" (insect chittering), "Submerged" (underwater pressure) |
| `comedy` | Absurd, lighthearted, tension-breaking. Corruption is annoying, not threatening. | "Tech Support" (hold music perturbation, keyboard mashing clicks, Windows error chime all-clear), "Cat Mode" (hissing ambient, paw-tap clicks, purring resolution) |
| `minimal` | Stripped-back, clinical. Maximum information, minimum affect. | "Sine Only" (pure tones at specification frequencies), "Pulse" (single click, single beep, silence) |
| `lo-fi` | Warm, textured, analog. Corruption sounds vintage. | "Vinyl" (record crackle ambient, needle clicks, warm chord resolution), "Tape Deck" (wow and flutter, tape hiss, motor whir) |
| `cyberpunk` | Digital, glitchy, neon-soaked. Leans into the SE Asian cyberpunk aesthetic. | "Manila Neon" (jeepney horn dissonance, karaoke feedback clicks, videoke machine chime), "Data Rot" (bitcrushed noise, modem handshake clicks, defrag completion) |
| `cultural` | Rooted in specific musical traditions. Educational and immersive. | "Gamelan" (Javanese gong ambient, kempul clicks, saron resolution), "Taiko" (drum-only vocabulary, do-n resolution), "Erhu" (string dissonance, bow scrape clicks) |
| `experimental` | Rule-breaking, boundary-pushing. Art project territory. | "Silence" (near-silent pack, corruption as absence), "Reversed" (all sounds play backward), "Spectral" (frequency-shifted ghost tones) |

---

## Validation and Safety

### Automated Validation Pipeline

Every pack submitted to the sharing platform passes through five validation gates:

**Gate 1 — Format compliance.** Manifest parses as valid JSON. All referenced audio files exist. Files are `.ogg` (Vorbis) or `.webm` (Opus). No file exceeds 2MB. Total pack size under 15MB. Thumbnail is PNG, 256x256, under 500KB.

**Gate 2 — Duration constraints.** Interaction clicks: 5ms-200ms. Event heartbeats: 200ms-2000ms per beat. Whisper loops: 500ms-4000ms. Ambient perturbations: 2000ms-8000ms (loopable). Resolution sounds: 100ms-3000ms. All-clear: 500ms-5000ms. Demo preview: 10000ms-20000ms. Sounds outside these ranges are rejected with specific feedback ("interaction.click-bright is 450ms — maximum allowed is 200ms").

**Gate 3 — Loudness normalization.** All sounds are analyzed for peak and RMS loudness. No sound may exceed -6dBFS peak. No sound may exceed -18dBFS RMS (prevents sustained loud sounds). Sounds that fail are auto-normalized with headroom, and the author is notified of the adjustment. Critical: this gate prevents earrape packs — a 0dBFS square wave at 15kHz is physically incapable of reaching the player.

**Gate 4 — Spectral safety.** Frequency content is analyzed. No sound may contain >50% energy above 12kHz (prevents ultrasonic abuse). No sound may contain sustained content below 20Hz at significant volume (prevents infrasonic discomfort on subwoofers). Sounds with extreme spectral imbalance are flagged for manual review.

**Gate 5 — Semantic integrity.** The hardest gate. Automated heuristics check that sounds preserve the information hierarchy:
- Interaction clicks must have sharp transients (attack time <50ms) — they need to feel "pointable" for cursor-proximity scanning. A pad sound with a 500ms attack would destroy the Geiger sweep mechanic.
- Ambient perturbations must be loopable without audible seam (crossfade analysis).
- Resolution sounds must end cleanly (energy below -40dB in final 50ms) — lingering resolution audio bleeds into the next detection cycle.
- The four severity tiers of heartbeat/event sounds must be **perceptually ordered** — mild must be perceived as less intense than moderate, which is less intense than severe, which is less intense than critical. This is validated via a loudness/density heuristic, not a subjective judgment.

Packs that fail Gate 5 receive detailed feedback: "Your event.heartbeat-mild (78 LUFS) is louder than event.heartbeat-severe (82 LUFS) — severity ordering is reversed. The mild sound should be the quietest/calmest in the set."

### Community Moderation

Beyond automated validation:
- **Flagging system.** Players can flag packs as "earrape," "misleading category," "offensive content," or "breaks gameplay." Three independent flags trigger manual review.
- **Curated collections.** The development team maintains a "Staff Picks" collection updated monthly. Packs in Staff Picks receive a verification badge and priority placement.
- **Play-testing metrics.** Packs track anonymous aggregated stats: average corruption clear time when equipped, player retention (how long before switching back to default), and the critical metric — **false negative rate** (how often players fail to detect corruption that they would have detected with default sounds). Packs with false negative rates >20% above baseline receive a "Reduced Detection" warning label visible before download.

---

## Distribution Platform

### Web-Based Sound Pack Hub

The sharing platform is a web page accessible from the game's main menu ("Sound Packs" button in the Audio Settings panel). It is not a separate application — the browser-based game loads the hub as an in-game overlay.

**Browse view:** A grid of pack cards. Each card shows: thumbnail art, pack name, author, category badge (color-coded), star rating (1-5, aggregated), download count, and a small waveform visualization of the demo audio. Hovering a card auto-plays the 15-second demo preview. Cards are filterable by category, sortable by popularity/rating/newest, and searchable by name/tag/author.

**Pack detail view:** Full-screen overlay showing the thumbnail large, description, all 15 sound slot previews as individually playable waveform bars (click to audition each slot in isolation), author profile link, version history, compatibility notes (which base audio options it was designed for), community reviews, and the false-negative stat if available. A large "EQUIP" button installs the pack instantly — audio files are cached in the browser's IndexedDB (Web Storage API), no page reload required.

**Author dashboard:** Accessible after creating an account. Upload interface validates packs client-side (Gates 1-4) before submission. Version management. Download/rating analytics. A "Test in Sandbox" button loads a pre-built corruption scenario with the pack equipped, so authors can audition their work in context without playing through the campaign.

### Offline / Local Packs

Players can also load packs from local files via a "Load Custom Pack" button in Audio Settings. This bypasses the sharing platform's validation pipeline entirely — the player assumes responsibility. Local packs display a "Unverified" badge in the HUD. This path exists for:
- Pack authors testing before upload.
- Private packs shared via Discord/email.
- Packs that intentionally violate duration or loudness constraints (the player consents by loading locally).

---

## Player Journeys

#### Journey: Rin, 23, Sound Design Student in Bangkok

**Context:** Mission 9 complete. 60+ hours played. Rin studies sound design at Silpakorn University and has been obsessed with Robot Uprising's corruption audio since Mission 7. She records field audio around Bangkok — tuk-tuk engines, temple bells, street food sizzle, rain on corrugated tin — and hears corruption potential in all of it.

**Hour 0:00 — The Idea**
Rin is playing Mission 10 with headphones. The Geiger clicks sweep across the workbench and she catches herself thinking: "That click sounds like the relay in my grandmother's old rice cooker." The thought won't leave. She pauses the game and opens her field recording library. There it is — a recording from last Songkran, captured on her Zoom H6 outside a noodle stall. The vendor's rice cooker clicks when it switches from cook to warm. A dry, sharp, metallic tick. 12 milliseconds of attack, almost no decay. It sounds *exactly* like the Geiger click, but warmer. More human.

She opens Reaper and starts cutting.

**Hour 2:00 — The Ambient Layer**
The hardest part. She needs a loopable perturbation sound that says "something is wrong" without being musical. She experiments with a recording of a Bangkok BTS Skytrain announcement played through a broken speaker — the words are unintelligible, but the cadence is unmistakably *communication that has failed*. She pitches it down 40%, adds saturation, and loops a 6-second segment. It sounds like a public address system speaking through water. Eerie. Wrong. Perfect for `ambient.perturbation-high`.

For `perturbation-low`, she uses rain on tin, barely processed — just a faint rhythmic irregularity in the droplet pattern, like the rain is *stuttering*. At -30dB it's nearly subliminal.

**Hour 5:00 — The Resolution Chord**
She agonizes over the all-clear. The default is a major triad swell — warm, resolved, safe. She wants something that feels like Bangkok after a monsoon rain stops: the sudden silence, then the first bird, then the street sounds returning. She layers three sounds: a temple bell (ting — single strike, high and clear), a breath of silence, then the ambient hum of Sukhumvit Road at 2 AM recorded from her apartment balcony. The bell is the "clean" signal. The street hum is the "normal has returned" signal. Together they say: the storm passed.

**Hour 7:00 — Upload and Validation**
She zips the pack, opens the Sound Pack Hub from the main menu, drags the folder onto the upload area. Gates 1-4 pass. Gate 5 flags one issue: her `interaction.click-mid` has a 65ms attack time — above the 50ms transient threshold. The feedback reads: "This sound has a soft onset. Cursor-proximity detection works best with sharp attacks so players can 'feel' direction changes instantly." She trims the attack to 30ms, losing some warmth but gaining the snap. Re-upload. All gates pass.

She writes the description: "Bangkok Rain — corruption sounds from field recordings around Bangkok. Rain, rice cookers, broken speakers, temple bells. Designed for Kulintang base audio." Category: `cultural`. Tags: `thai`, `field-recording`, `organic`, `rain`.

**Hour 8:00 — The First Review**
A player named `relay_architect` downloads the pack and leaves a 5-star review: "The rain perturbation is genius. I kept looking out my window to check if it was actually raining. The rice cooker clicks feel MORE like corruption detection than the default Geiger — they're so mundane it makes the corruption feel domestic, personal. Like the enemy sabotaged your kitchen, not your army."

Rin reads the review three times. She starts recording sounds for pack v2.

#### Journey: Declan, 41, Twitch Streamer, Comedy Variety Channel

**Context:** 30 hours played, mid-campaign. Declan streams Robot Uprising twice a week to ~200 concurrent viewers. His community has been requesting a custom corruption pack since he first played Mission 7 and said on stream: "Imagine if the Geiger clicks were just a guy going 'uh oh' really fast."

**Stream Day 1 — The Bit**
Chat has been compiling a list of replacement sounds in a shared Google Doc. The community has voted:
- Ambient perturbation: hold music — the generic "please hold, your call is important to us" loop, progressively degraded at each severity tier (low = normal hold music, critical = the hold music played through a phone speaker in a washing machine)
- Interaction clicks: Declan saying "uh oh" at varying pitch (bright = chipmunk "UH OH!", mid = normal "uh oh", deep = slowed-down Barry White "uhhh ohhh")
- Event heartbeat: an increasingly frantic keyboard mashing sound (mild = gentle typing, critical = someone slamming a mechanical keyboard with both fists)
- Whisper: a passive-aggressive Slack notification chime looping every 2 seconds
- Revert: the Windows XP startup sound
- Purge: a toilet flush
- All-clear: "We Are the Champions" — the first two bars, chiptune version

Declan records himself saying "uh oh" forty times to get three usable takes. Chat is losing it.

**Stream Day 3 — Play-Testing Live**
He equips the pack on stream and loads a corrupted Mission 9 workbench. The hold music starts immediately — tinny, slightly too fast, instantly recognizable. Chat explodes: "NOT THE HOLD MUSIC" / "I'm having a work flashback" / "this is psychological warfare." He sweeps his cursor across the Scout panel. "UH OH UH OH UH OH UH OH" — the chipmunk voice firing at 15 clicks per second as he hits a corrupted zone. Declan wheezes. His facecam shows him crying with laughter. The clip gets 40,000 views on TikTok by morning.

He hovers the corrupted hook. The keyboard mashing starts — frantic, escalating. "The intern is debugging in production," someone types in chat. The passive-aggressive Slack chime loops underneath: *ding... ding... ding...* "I need to purge this before my manager sees it," Declan says. He clicks PURGE. A toilet flush plays. The Windows XP startup sound follows. He leans back. "Clean system, boys."

The pack — "Tech Support" — goes on the Sound Pack Hub the next day. It hits #1 in the comedy category within a week.

**The Interaction Effect:** The false-negative rate for "Tech Support" is actually 8% *below* baseline. The comedy sounds are so attention-grabbing that players detect corruption faster with them equipped. The hold music perturbation is more immediately noticeable than the subtle kulintang dissonance. The "uh oh" clicks are more directionally legible than the Geiger clicks because human voice has stronger spatial localization in the auditory system. Comedy, accidentally, is better than the default at conveying information.

#### Journey: Yuki, 19, Competitive Player, Diamond Rank Gauntlet

**Context:** 200+ hours. Top 500 Gauntlet player. Yuki plays with the "minimal" corruption pack she built herself — stripped to pure information, zero atmosphere. She treats the game as a competitive optimization problem.

**The Build Process**
Yuki's pack contains exactly 15 sounds, each under 100ms except the ambients:
- Ambient perturbation: a single 200Hz sine tone at four volume levels. No texture, no character. Pure state indicator.
- Interaction clicks: 1ms impulse (a single sample pop) at three pitches — 2000Hz, 800Hz, 400Hz. No tail, no resonance. Maximum temporal precision for sweep speed.
- Event severity: a metronome click at four tempos — 60, 90, 120, 160 BPM. No timbre variation. Pure rate information.
- Whisper: a 100ms square wave burst, 500Hz, every 2 seconds. Binary: enemy hook present or not.
- Resolution: a 50ms 440Hz ping. Identical for revert and purge.
- All-clear: a 100ms 880Hz ping. One octave up. Done.

She named it "Wire." Category: `minimal`. Description: "Information only. No aesthetics. No feelings."

**In Competition**
During a Gauntlet run, Yuki's corruption sweep takes 12 seconds average — 40% faster than the median Diamond player. Her false-negative rate is 0.3%. She has never missed a corruption in 47 consecutive Gauntlet missions. The "Wire" pack transmits corruption data with zero perceptual overhead — every millisecond of audio is information, none is atmosphere. Her sweep is a machine process: cursor velocity constant, ears parsing the three-pitch click vocabulary like a radar operator reading blips.

**The Controversy**
A community discussion erupts on the Robot Uprising subreddit: "Should minimal packs be allowed in competitive?" The argument: packs like "Wire" strip the game's intended friction — the atmospheric sounds aren't just aesthetic, they're meant to create cognitive load that's part of the challenge. Counter-argument: the modding system is opt-in; banning packs in competitive defeats the purpose.

The development team's response: corruption audio packs are allowed in all modes, including Gauntlet. The reasoning: the Geiger sweep is a learned skill regardless of which sounds play. A minimal pack doesn't give you faster reflexes or better spatial reasoning — it removes emotional interference, which is a legitimate player preference, especially for accessibility (some players find the heartbeat sound anxiety-inducing to the point of impaired performance). The competitive integrity concern is noted; if data shows minimal packs conferring >10% advantage in clear speed, the team will revisit with a "Competitive Audio Profile" option.

#### Journey: Kuya Roel, 55, Filipino Kulintang Musician, Cotabato City

**Context:** 15 hours played. Roel is a practicing kulintang musician in Mindanao who found Robot Uprising through a Facebook post about its Philippine audio direction. He was initially skeptical — "another game using our instruments as exotic texture" — but the Kulintang Machine audio (6.02 Option A) impressed him with its structural accuracy. Now he wants to push deeper.

**The Cultural Pack**
Roel records himself playing actual kulintang in his studio. Not synthesized — the real instruments, tuned in the Maguindanao tradition.

For ambient perturbation, he plays the kulintang melody from the game's Plan Phase, then deliberately introduces a *lagu* (melodic mode) that clashes with the established tonality. In Maguindanao practice, playing in the wrong lagu during a performance is a social signal of distress or protest. He layers four recordings at increasing degrees of modal clash — perturbation-low is a single note from the wrong lagu, barely noticeable; perturbation-critical is the full ensemble playing in two competing lagu simultaneously, a cacophony that any kulintang player would recognize as deeply wrong but that a non-Filipino listener experiences as uncanny dissonance.

For the all-clear, he records a *binalig* — a traditional closing pattern that signals the end of a performance. The musicians slow, the gongs ring out one last time, and the room falls quiet. It takes 4.2 seconds. It is the most culturally specific all-clear sound possible: literally the phrase that means "the music is over, we are finished, everything is resolved."

The pack is called "Kutang" — a Maguindanao word. Category: `cultural`. Tags: `kulintang`, `maguindanao`, `mindanao`, `traditional`, `acoustic`.

**The Reception**
The pack receives a small but devoted following. Filipino players message Roel through the platform: "I showed this to my lola, she recognized the binalig." Non-Filipino players leave reviews noting that the perturbation sounds make corruption feel "sacred, like you're violating something important, not just fixing a bug." A music journalist writes about the pack for a games culture website: "A retired kulintang master is teaching the world Maguindanao modal theory through a cyberpunk strategy game's modding system."

The development team features "Kutang" in Staff Picks with a special "Cultural Heritage" badge.

---

## Strengths

- **Extends the game's emotional range.** The default corruption vocabulary is excellent — but it is *one* emotional register (clinical-tense). Modding opens horror, comedy, serenity, cultural specificity, and registers the developers couldn't anticipate.
- **Community flywheel.** Sound packs are small (under 15MB), quick to create (a motivated designer can produce one in a weekend), and immediately shareable. The creation-to-feedback loop is tighter than custom missions or total conversions.
- **Accessibility through preference.** Players who find the default heartbeat anxiety-inducing can replace it. Players who are hard-of-hearing can install packs with louder, more distinct transients. Players with misophonia around specific frequencies can avoid them. The modding system becomes an accessibility tool without being labeled as one.
- **Streamer differentiation.** Every streamer's corruption audio becomes part of their brand identity. Viewers recognize a streamer's pack before reading the channel name. "Tech Support" is Declan's stream, "Wire" is Yuki's Gauntlet grind, "Bangkok Rain" is Rin's ASMR-adjacent chill stream.
- **Cultural expression vector.** The cultural category enables players worldwide to embed their own musical traditions into the corruption vocabulary. The game becomes a platform for cultural audio — gamelan corruption, taiko corruption, throat-singing corruption. Each pack teaches listeners about a tradition they might never otherwise encounter.
- **Low implementation cost.** The audio system already plays sounds from slot IDs (the hybrid vocabulary is already a slot-based system). Modding replaces the audio buffers behind those slot IDs. No new rendering, no new game logic, no new UI beyond the pack browser.

## Weaknesses

- **Quality floor.** Most user-created packs will be mediocre — poorly mixed, conceptually incoherent, or abandoned at v1.0. The sharing platform needs aggressive curation (Staff Picks, algorithmic sorting by quality signals) to surface the good packs. Without curation, the browse experience becomes a junk drawer.
- **Semantic drift.** Even with Gate 5 validation, creative packs will bend the information hierarchy. A comedy pack where "all sounds are funny" reduces the severity gradient — if mild and critical both make you laugh, the distinction is lost. The false-negative tracking mitigates this but doesn't eliminate it.
- **Platform maintenance burden.** The Sound Pack Hub requires hosting, moderation, abuse prevention, DMCA handling (someone will upload copyrighted music as their all-clear), and ongoing validation pipeline updates as the audio system evolves. This is a live service commitment on a premium strategy game.
- **Fragmented shared experience.** When every player hears different corruption sounds, the community loses a shared sensory vocabulary. "Did you hear the whisper?" becomes meaningless if half the players have replaced whispers with Slack chimes. Clip culture partially mitigates this — viewers hear the streamer's pack — but the campfire-story quality of a universal audio vocabulary is diluted.
- **Competitive integrity ambiguity.** Yuki's "Wire" pack demonstrates that information-optimized packs can improve performance. The current policy (allow all packs in all modes) is player-friendly but may need revision if the competitive community rejects it. Tournament organizers may mandate default audio, fragmenting the policy further.
- **Cultural sensitivity at scale.** The cultural category will attract packs using instruments, modes, and traditions from cultures the pack authors don't belong to. A non-Japanese player making a "Taiko Corruption" pack may produce something that ranges from respectful homage to offensive pastiche. The moderation team cannot evaluate cultural accuracy for every tradition on earth. Community flagging and cultural advisory (inviting practitioners to review packs, as with Kuya Roel) are partial solutions.

---

## Interaction Effects

### With Accessibility Modes (6.10d)

The multimodal stack (visual heatmap, haptic tremor, screen reader, captions) must remain functional regardless of equipped sound pack. Specifically:
- **Caption track.** The corruption captioner displays semantic labels ("perturbation — low severity"), not sound descriptions. A comedy pack's hold music still captions as "perturbation — low severity." The caption is about *meaning*, not *content*.
- **Haptic channel.** Haptic patterns are independent of audio packs — they mirror the *slot*, not the *sound*. A replaced heartbeat still triggers the same haptic pulse pattern.
- **Visual heatmap.** Completely independent. Amber glow fields render identically regardless of audio pack.
- **Screen reader.** ARIA live regions announce corruption state, not audio content. No interaction.

One positive interaction: players with partial hearing loss who struggle with the default sound profiles can install packs designed for their frequency sensitivity range. A pack with all interaction clicks in the 500-1500Hz band (where most hearing loss is minimal) is an accessibility tool that never needs to be labeled as one.

### With Intensity Config (6.10e)

The player-configurable intensity slider ("subtle" to "aggressive") applies *on top of* the equipped sound pack. Intensity controls volume scaling, layer count, and perturbation depth — not which sounds play. A "minimal" pack at "aggressive" intensity still sounds minimal, just louder and with more layers active. A "horror" pack at "subtle" intensity plays the horror sounds but at reduced volume and with fewer simultaneous layers. The two systems are orthogonal.

### With Streaming and Content Creation

Sound packs interact with streaming in three ways:
- **DMCA risk.** Packs containing copyrighted material (sampled music, recognizable voice clips) expose streamers to DMCA strikes. The upload pipeline rejects packs flagged for copyright, but local/unverified packs bypass this. Recommendation: a "Stream Safe" badge for packs that have passed copyright clearance, displayed prominently in the browser.
- **Audio identity.** As noted in strengths, packs become streamer branding. The sharing platform should support "Streamer Collections" — curated lists linked from Twitch panels.
- **Clip legibility.** Viral clips work best when audio tells the story to viewers unfamiliar with the game. Comedy packs (hold music, "uh oh" clicks) are more clip-legible than minimal packs (sine tones, impulse pops). The default hybrid vocabulary lands in the middle — identifiable but not immediately parseable by non-players.

### With Competitive Integrity (Gauntlet)

Three policy options:
1. **Unrestricted.** All packs allowed in Gauntlet (current recommendation). Maximum player freedom. Risk: information-optimized packs become mandatory at high ranks, homogenizing the competitive experience.
2. **Default-only in ranked.** Gauntlet forces default corruption audio. Preserves level playing field. Risk: alienates players who rely on modified packs for accessibility or comfort.
3. **Approved pool.** A curated set of packs allowed in Gauntlet, reviewed for information parity. Middle ground, but requires ongoing curation labor.

Recommendation: Option 1 with monitoring. If data shows >15% clear-speed advantage for any pack category versus default, introduce an opt-in "Competitive Audio Standard" toggle for ranked play.

### With the Predecessor Narrative

The Predecessor's voice lines about corruption ("I've seen this before," "They're inside your network") play independently of the audio pack. The Predecessor comments on the *situation*, not the *sound*. This is correct — the Predecessor should never say "Do you hear that clicking?" when the player has replaced clicking with rice cooker pops. Narrative references to corruption audio use abstract phrasing: "Your instruments are out of tune" (ambient perturbation), "Follow the signal" (interaction detection), "They left a mark" (event severity).

---

## Comparable Games

### Dota 2 Announcer Packs

Valve's announcer pack system (2012-present) replaces the default announcer voice with community or celebrity voices (GLaDOS, Rick and Morty, Bastion narrator). Key parallel: announcer packs change the *emotional wrapper* around game events without changing the events themselves. "First Blood" announced by GLaDOS is sardonic; by Rick Sanchez, chaotic; by the Bastion narrator, melancholic. The semantic content ("someone died first") is identical. Robot Uprising's corruption audio modding follows the same principle — the semantic slots (detection, severity, location, resolution) are fixed; the emotional coloring is modular.

Key difference: Dota 2 announcers are voice-acted by professionals and sold for revenue. Robot Uprising's sound packs are community-created and free. The quality floor is lower but the creative breadth is wider.

### CS:GO / CS2 Music Kits

Valve's music kit system replaces round-start, round-end, MVP, and bomb timer music. Critically, the **10-second bomb timer warning** is part of the kit — meaning modded audio carries gameplay information (how much time remains). Valve solved this by requiring all kits to preserve the tempo escalation pattern of the default timer, even with different instruments. Robot Uprising's Gate 5 validation (severity ordering, transient sharpness) applies the same principle: the information architecture is preserved, the timbre is free.

### Minecraft Resource Packs

Minecraft's resource pack system replaces every sound and texture in the game. The modding surface is total — no slot is protected, no validation exists. Result: packs range from "faithful HD" (better textures, same game) to "meme pack" (every sound is a goat scream) to "completely new aesthetic" (medieval, sci-fi, anime). The breadth is extraordinary but the quality variance is catastrophic. Robot Uprising's constrained modding surface (15 slots, validated) trades creative freedom for quality consistency.

### Beat Saber Custom Songs

Beat Saber's custom song community (via BMBF/ModAssistant) demonstrated that audio modding can be the primary driver of a game's longevity. The base game's soundtrack is finite; custom songs make it infinite. Robot Uprising's corruption audio is not the primary content loop (missions are), but the parallel holds: fresh sounds refresh the experience without new content. A new corruption pack makes Mission 9 feel different on the 20th replay.

### Overwatch 2 Sound Design Philosophy

Blizzard's approach to Overwatch audio is "silhouette audio" — every hero's footsteps, abilities, and ultimate callouts are designed to be identifiable by sound alone, and skins never alter gameplay-critical sounds. Robot Uprising's non-moddable sounds (agung, dabakan, babendil) follow this philosophy: temporal, combat, and communication audio are identity-locked. Corruption audio is moddable precisely because it is an *information layer*, not an *identity layer*.

---

## Sensory Descriptions

### Horror Pack: "Dread Machine"

You open the workbench and the air changes. Not a sound, exactly — a pressure. The ambient perturbation is a low, grinding drone, like metal dragging across concrete in a room you can't see. It lives in the sub-bass, below the kulintang, below the hum of your speakers — you feel it in your jaw more than hear it. At perturbation-high, the grinding develops a rhythmic quality: slow, deliberate, mechanical. Something is turning. Something shouldn't be turning.

You sweep. The interaction clicks are not clicks — they are the sound of a relay engaging inside a machine that has been running too long. Each one has a sticky, reluctant quality, like a switch that doesn't want to close. *Clk... clk-clk... clk...* The pitch drops as you near deep corruption: the relay sound becomes heavier, wetter, as if the machine's internals are corroding in real time.

You hover the corrupted hook. The heartbeat equivalent is a labored breathing sound — a bellows being squeezed by failing pneumatics. At mild severity, the breaths are slow and steady. At critical, the breathing becomes ragged, arhythmic, interrupted by mechanical grinding from the ambient layer bleeding through. It sounds like a life support system in a factory that has been condemned.

You click PURGE. The breathing stops — not gradually, but with a hard mechanical clamp, like a valve slamming shut. One beat of absolute silence. Then a single clear tone — not warm, not inviting, just *correct*. A machine returning to spec. The all-clear is a long, descending metallic chime — a factory bell signaling end of shift. The grinding stops. The pressure in your jaw releases. You didn't realize you were clenching it.

### Comedy Pack: "Tech Support"

The workbench loads and you hear it immediately: hold music. Smooth jazz, tinny, like it's coming through a telephone speaker from 1997. A saxophone noodles aimlessly over a drum machine. At perturbation-low, it's barely audible — you might think your browser has a tab open. At perturbation-critical, the hold music is playing through what sounds like a speaker submerged in a bathtub, pitch-warbling, cutting in and out, accompanied by a robotic voice periodically assuring you: "Your corruption is important to us."

You sweep. "Uh oh. Uh oh uh oh uh oh UH OH UH OH." Declan's chipmunk voice, sped up proportionally to proximity, rattling through your headphones like a concerned hamster. At deep corruption pitch, it drops to a bass register: "uhhh ohhh" — stretched, absurd, a cartoon villain discovering his evil plan has a bug.

The severity indicator is keyboard mashing. Someone typing furiously. At mild: gentle tapping, almost productive-sounding. At critical: both fists hammering a mechanical keyboard, spacebar abuse, the unmistakable sound of someone who has been debugging for nine hours and just found a null pointer exception.

You purge. A toilet flush — the long, gurgling, conclusive kind from an industrial bathroom. The all-clear is two bars of "We Are the Champions" in 8-bit chiptune, at exactly the volume that makes you grin instead of cringe. The hold music is gone. You are off hold. The ticket is closed.

### Minimal Pack: "Wire"

The workbench loads in near-silence. A 200Hz sine tone — not even a tone, really, more of a presence. A constant, unwavering frequency that says "state: compromised" with zero editorial comment. It has the emotional character of a voltmeter reading. It means exactly one thing.

You sweep. A single-sample pop — 1ms of audio, a mathematical impulse — fires at the proximity rate. No tail, no resonance, no personality. *pop pop pop pop pop.* At deep corruption pitch, the pop becomes a lower-frequency pop. That is the only difference. Your ears track the spatial position of the pops with mechanical precision; there is no atmosphere to parse, no emotion to filter. You are a radar dish.

Resolution is a 50ms ping at 440Hz. You hear it and your hand is already moving to the next corruption. The all-clear is the same ping, one octave higher. 880Hz, 100ms. Done. The 200Hz sine stops. Silence — actual silence, not dramatic silence. The absence of information, which is itself the information.
