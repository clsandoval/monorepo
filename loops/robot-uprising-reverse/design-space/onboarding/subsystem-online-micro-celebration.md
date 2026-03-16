# Onboarding: The "Subsystem Online" Micro-Celebration

**Aspect ID:** 5.04c
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.04 (complexity ramp), 5.04b (vocabulary density curve), 5.02 (tutorial as narrative — boot log), 5.00e (naming moment as designed beat), 5.17 (hybrid tutorial architecture — Codex initialization ceremony), 6.02 (audio design — kulintang machine), 6.01c (holographic overlay — seal-descend transition), 3.04 (skill UI — progressive reveal), 1.17a (animated tooltip pattern)

---

## The Question

When a new game concept becomes available to the player — a new skill unlocked, a new rule type enabled, a panel expanding to show new UI elements — **what does that moment look, sound, and feel like?** This isn't about what the concept IS (that's covered by vocabulary pacing, tutorial design, etc.). This is about the **sensory micro-event** that marks the boundary between "you didn't have this" and "now you do." The 1-3 second celebration that punctuates progression.

Every game with unlockable mechanics has this moment. Metroid's Item Acquisition Fanfare. Zelda's chest-opening pose. Factorio's research-complete chime. Slay the Spire's card reward shimmer. The design of this moment communicates three things simultaneously:

1. **"Something changed."** — Attention capture. The player must notice the unlock happened.
2. **"This matters."** — Emotional valence. The unlock should feel earned and significant.
3. **"Here's where to look."** — Spatial direction. The player should know where in the UI the new thing lives.

Robot Uprising faces a unique version of this problem: the game introduces ~31 concepts across 10 missions, with unlocks happening during three distinct screen modes (Plan, Sealed Watch, Inspector). The micro-celebration must work across all three contexts, must scale from trivial unlocks (a new observation type) to transformative ones (the Command agent), and must feel diegetically consistent with the "AI booting up" narrative framing.

---

## The Design Space: Six Celebration Paradigms

### Option A: "The Boot Line" — Text-First, Minimal Visual

The unlock moment IS a boot log line. Nothing more. The terminal prints a new line in the persistent boot log sidebar:

```
[0247] CONTEXT    : eviction policy module — ONLINE
```

The word "ONLINE" renders in bright amber, then fades to the standard teal over 1.5 seconds. A single soft tone plays — a clean sine wave at C4, 200ms duration, gentle attack and release. The corresponding workbench panel gains a thin amber border that pulses twice, then settles to its normal state.

**Visual vocabulary:**
- Amber text flash (200ms bright → 1.5s fade to teal)
- Panel border pulse (2 cycles, 400ms each)
- No particle effects, no screen shake, no overlay

**Audio vocabulary:**
- Single sine tone, C4, 200ms, -12dB, no reverb
- Identical every time regardless of unlock importance

**What this gets right:** Maximum diegetic purity. The AI is a machine. Machines don't celebrate. A subsystem coming online is a state transition, not an event. The restraint communicates the game's aesthetic: precision, clarity, economy. The boot log IS the celebration — if you're not reading it, you miss it. This rewards attentive players and punishes inattentive ones, which matches the game's core thesis (attention is the resource).

**What this gets wrong:** The attention-capture function fails. In a workbench with 6+ panels, skills, rules, hooks, and context config, a single panel border pulse is trivially missable. The player might not notice the new eviction policy panel for 2-3 minutes. Worse, the unlock and the discovery become desynchronized — the game "gave" the concept, but the player hasn't "received" it. The naming moment (5.00e) loses its emotional punch when it happens in text the player might not be reading.

The emotional valence is flat. Every unlock — from "noise observation" (trivially understood) to "Command agent" (paradigm-shifting) — gets the same single tone. There's no crescendo across the campaign, no sense of building toward something. The game treats the factory unlock the same as a new observation type.

**Comparable:** TIS-100. New puzzles unlock silently. You just notice a new node is available. The game trusts you to notice. This works because TIS-100's UI has almost nothing on screen — there's no competing visual noise. Robot Uprising's workbench is significantly busier.

**Comparable:** Into the Breach. New squads unlock with a simple popup and squad portrait. Minimal fanfare. But the unlock happens between missions in a clean menu, not mid-gameplay. The context is inherently calmer.

---

### Option B: "The Initialization Cascade" — Staged Boot Sequence

The unlock is a 2-3 second multi-stage event that mimics a subsystem initialization:

**Stage 1 — Detection (0.0-0.5s):**
The boot log prints:
```
[0247] CORE       : new capability detected...
```
A low bass note (E2) begins, sustained. The screen dims 10% except for the boot log sidebar.

**Stage 2 — Loading (0.5-1.5s):**
The boot log prints rapidly:
```
[0248] CORE       : loading eviction module
[0249] CONTEXT    : integrating eviction handlers
[0250] CONTEXT    : buffer overflow policy: active
```
During this, the target panel in the workbench is outlined with a scanning line — a horizontal bright amber line sweeps downward through the panel at constant speed, like a photocopier scanning. Behind the scan line, new UI elements materialize: empty slots, toggle switches, dropdown menus fade in from 0% to 100% opacity as the line passes over them. A soft digital "compilation" sound plays — rapid clicking, like a hard drive head seeking, at decreasing intervals (accelerating to suggest completion approaching).

**Stage 3 — Online (1.5-2.5s):**
The boot log prints:
```
[0251] CONTEXT    : eviction policy — ONLINE ✓
```
The "ONLINE ✓" renders in bright green (G3 sharp, 300ms tone, with a quick ascending two-note grace note — D4→G4 — 100ms total, like a tiny fanfare). The scan line reaches the bottom of the panel and dissolves into a brief amber particle burst — tiny motes that scatter outward and fade in 500ms. The screen dim lifts. The panel border glows amber for 1 second, then settles.

**Visual vocabulary:**
- 10% screen dim (isolates the event spatially)
- Scanning line (directs attention to the specific panel)
- Element materialization (shows exactly what's new)
- Amber particle burst (punctuation mark — "done")
- Green "ONLINE ✓" text (permanent record in boot log)

**Audio vocabulary:**
- Sustained bass note (E2) — "something is happening"
- Compilation clicking (rapid, decelerating) — "loading"
- Two-note ascending grace note (D4→G4) — "complete"
- Total audio duration: 2.5s, mixed -8dB (noticeable but not dominant)

**Scaling by importance:**
The cascade has three intensity levels:

| Level | Triggers | Duration | Dim | Scan Speed | Audio |
|-------|----------|----------|-----|------------|-------|
| Minor | New observation type, new filter option, parameter unlock | 1.0s | 5% | Fast (500ms) | Click only, no bass |
| Standard | New skill, new rule type, new hook capability | 2.5s | 10% | Medium (1.0s) | Full cascade |
| Major | Factory unlock, Command agent, new screen mode | 4.0s | 20% | Slow (1.5s) with pause-at-top | Full cascade + kulintang agung strike + screen flash |

**What this gets right:** The staged reveal creates genuine anticipation. The dim→scan→materialize→burst sequence teaches the player WHERE in the UI the new thing lives. The scanning line is a literal pointer — "look HERE." The materialization means the player watches the new elements appear, so they know exactly what's new vs. what was already there.

The three intensity levels communicate relative importance without words. After a few unlocks, the player's nervous system learns: bass note + heavy dim = big deal. Click-only + light dim = minor addition.

The boot log text anchors the event diegetically. It doesn't feel like a "congratulations!" popup. It feels like a machine powering up.

**What this gets wrong:** 2.5 seconds of dimmed screen with a scanning animation interrupts flow. If the player was in the middle of configuring a rule when a new capability unlocks (triggered by completing a mission condition), the interruption breaks their train of thought. The "loading" clicks might feel condescending to expert players who already know what's coming — "I don't need to WATCH the panel load, just give me the feature."

The Major tier at 4 seconds risks approaching Zelda-chest-opening territory — too long for a game about efficiency. The unskippable animation becomes a tax on replays.

**Comparable:** Metroid's Item Acquisition Fanfare. The gameplay freezes, the fanfare plays, the item name appears. Metroid can do this because items are rare (10-20 per game) and each one fundamentally changes traversal. Robot Uprising unlocks 31 concepts — the interruption budget is lower per event.

**Comparable:** XCOM's research completion. A popup appears with the new technology, a brief description, and a "view in engineering" button. It's interruptive but informative. The popup is dismissable.

---

### Option C: "The Amber Pulse" — Ambient, Non-Interruptive

No interruption at all. Instead, the unlock registers through ambient environmental changes:

**The pulse:** When a new concept unlocks, an amber pulse radiates outward from the relevant workbench panel — a ring of warm amber light expanding from the panel's center, 300ms duration, 60% opacity peak, fading to transparent. Like dropping a stone in water. The pulse passes THROUGH other panels, meaning the player can see where it originated even if they're looking at a different part of the screen.

**The glow:** After the pulse, the panel that received the new content gains a persistent soft amber underglow — a warm diffuse light behind the panel, like a lamp was turned on behind frosted glass. This glow persists until the player clicks/taps the panel for the first time post-unlock. Once they've seen the new content, the glow fades over 2 seconds.

**The badge:** A small amber diamond (◆) appears on the panel's tab/header, like an unread notification badge. This diamond also persists until the panel is visited. If multiple concepts unlock before the player checks, the badge shows a count (◆3).

**The sound:** A single kulintang tone — the high babendil — rings once at the moment of unlock. 400ms duration, bright metallic overtones, -10dB. If the player is wearing headphones, the sound is spatialized to match the panel's screen position (left panel = left ear, right panel = right ear).

**The boot log (passive):** The boot log line still prints, but with no special formatting beyond the amber "ONLINE" keyword. It scrolls with the rest of the log. The boot log does NOT demand attention — the pulse and badge do that work.

**Visual vocabulary:**
- Expanding amber pulse ring (300ms, from panel center)
- Persistent amber underglow (until first visit)
- Amber diamond badge with count
- No screen dim, no scan line, no particle effects

**Audio vocabulary:**
- Single babendil tone (400ms, spatialized)
- Identical for all unlock levels

**Scaling by importance:**
The pulse ring is larger and brighter for major unlocks. The babendil strike is louder and lower-pitched for major unlocks (smaller babendil for minor, agung for major).

| Level | Pulse Radius | Glow Intensity | Sound |
|-------|-------------|----------------|-------|
| Minor | 50px | 20% | High babendil, -14dB |
| Standard | 120px | 40% | Mid babendil, -10dB |
| Major | Full-screen ripple | 60% | Agung strike, -6dB |

**What this gets right:** Zero interruption. The player can be mid-drag, mid-thought, mid-configuration, and the unlock registers peripherally without breaking flow. The peripheral vision catches the pulse. The ear catches the tone. The conscious mind processes neither — until the player is ready, at which point the persistent glow and badge say "something's new here."

This is the "notification badge" model that billions of people already understand. The ◆ diamond is unread mail. The amber glow is the pulsing app icon. The spatialized audio is "over there."

The kulintang babendil tone creates a Pavlovian anchor. After 10+ unlocks, the player's brain associates that specific metallic ring with "new capability." This is the Metroid Item Acquisition Fanfare principle, but compressed to a single strike rather than a melody. It becomes the game's sonic brand for progression.

**What this gets wrong:** The unread-badge model has a failure mode: badge blindness. If the player is deep in configuration and three concepts unlock in rapid succession, they see ◆3 on a panel tab. They might dismiss it as noise, especially if previous badges contained minor additions. The persistent glow becomes wallpaper — the eye stops registering it.

More critically, the "WHERE to look" function is weaker. The pulse ring tells the player which panel changed, but not WHAT changed within the panel. If the Rules panel gains a new condition type, the player has to scan the entire panel to find it. The scanning-line approach (Option B) literally shows each new element appearing. The pulse approach says "something in this area" without specificity.

The identical babendil for all unlock levels means there's no visceral surprise on major unlocks. The first time the player unlocks the Command agent — a paradigm shift — it sounds like unlocking a new observation type. The emotional crescendo across the campaign is muted.

**Comparable:** Slack's notification dot. A red badge appears. You check it when you're ready. It never interrupts your current message draft. Efficient but emotionally neutral.

**Comparable:** Factorio's research-complete chime. A brief sound, a small notification. The player can be managing a production crisis and hear "research done" without breaking flow. But Factorio players notoriously complain about MISSING research completions because the notification is too subtle.

---

### Option D: "The Panel Birth" — The UI Itself Grows

The celebration IS the UI transformation. When a new concept unlocks, the workbench physically changes shape:

**New panel emergence:** If the concept introduces an entirely new panel (like Context Config in Mission 2 or the Production Queue in Mission 5), the panel doesn't simply appear — it GROWS. From nothing:

1. **Crack (0.0-0.3s):** A thin amber line appears at the edge of the existing workbench, like a seam in sheet metal starting to split. A quiet metallic *tink* sound — like a rivet popping.
2. **Expand (0.3-1.2s):** The seam widens. The new panel slides out from behind/beneath the existing panels, pushing them aside to make room. Other panels smoothly compress or rearrange to accommodate. The new panel's surface is initially dark — a blank slab — with the amber seam glowing along its edges. A low electronic hum rises in pitch as the panel emerges.
3. **Activate (1.2-2.0s):** UI elements fade in on the new panel's surface: labels, slots, toggles, dropdowns. Each element appears with a tiny pop — a 50ms scale animation from 80% to 100% with a subtle overshoot bounce. The boot log prints the ONLINE line. A brief ascending arpeggio plays (four notes, pentatonic, 80ms each — like a xylophone scale). The panel border solidifies from amber glow to standard panel chrome.
4. **Settle (2.0-2.5s):** All panels settle into their final positions. A barely-perceptible "thunk" of mechanical settling plays. The workbench is now in its new layout, with the new panel fully integrated.

**Existing panel expansion:** If the concept adds elements to an existing panel (like new skill slots appearing in the Skills panel), the existing panel stretches:

1. The panel's bottom edge extends downward (or a collapsed section unfolds). The expansion is animated — 400ms ease-out.
2. New elements fade in within the expanded space, using the same 50ms pop animation.
3. A single babendil tone marks completion.
4. Total duration: 800ms. Minimally interruptive.

**Visual vocabulary:**
- Amber seam crack (introduces the spatial change)
- Smooth panel rearrangement (the whole workbench is alive)
- Element pop-in (each individual control appears with a micro-bounce)
- Amber-to-chrome border transition (from "new" to "integrated")

**Audio vocabulary:**
- Metallic *tink* (seam crack)
- Rising electronic hum (panel emergence — pitch correlates with panel size)
- Pop sounds for each element (rapid, like popcorn)
- Ascending pentatonic arpeggio (activation complete)
- Settling *thunk* (mechanical finality)

**What this gets right:** The most literally legible unlock in the design space. The player WATCHES the UI change. They see exactly where the new panel is, what it contains, how it relates spatially to existing panels. There is zero ambiguity about what changed — the change WAS the animation.

The "living workbench" metaphor reinforces the diegetic framing: this is an AI constructing its own interface as it discovers new capabilities. The workbench doesn't have a fixed layout that reveals hidden sections. It genuinely grows. This is the "you are an AI reading your own spec sheet as it writes itself" narrative promise made physically real.

The pop-in for individual elements creates a rapid-fire micro-reward sequence: each toggle, each slot, each dropdown is its own tiny dopamine hit. The popcorn-pop audio makes the unlock feel abundant — "look at all these new things!" The ascending arpeggio seals it.

**What this gets wrong:** Layout shifts are universally despised in UX. When panels rearrange, the player's spatial memory is disrupted. "The Skills panel used to be HERE, now it's shifted left." This causes fumbling, misclicks, and frustration. The player has to re-learn the workbench layout every time a significant unlock occurs.

The 2.5-second panel-birth animation is unskippable without feeling broken (clicking through a panel emerging looks like a glitch). On replay, where the player has already seen the layout, the animation is pure friction.

The element pop-in, while charming the first time, becomes tedious on the 15th unlock. The "popcorn" of toggles appearing is fun for the first panel but grating by Mission 7.

**Comparable:** Inscryption's Act transitions. The game literally transforms — the table shifts, the rules change, the UI morphs. This works because Inscryption's transformations happen 2-3 times in a 10-hour game. Robot Uprising needs ~20 panel-level changes across 10 missions.

**Comparable:** Zelda: Tears of the Kingdom's ability unlock. Link holds up the ability, the UI animates into existence. The ability wheel grows. But this happens in a menu pause, not during gameplay.

---

### Option E: "The Diagnostic Flicker" — Unlock as System Test

The unlock plays out as a miniature diagnostic self-test, making the new capability demonstrate itself:

**The self-test sequence:**
When a new concept unlocks, the workbench automatically populates the new UI element with a brief demonstration:

1. **Flash test values (0.0-1.0s):** The new panel/element fills with sample data. If it's an eviction policy dropdown, the dropdown cycles rapidly through all options (FIFO, Priority, LRU) at 200ms each, labels flashing in amber. If it's a new skill slot, the slot shows a ghost image of the skill icon pulsing. If it's the Context Config panel, all buffer slots briefly flash with colored sample observations, then clear.
2. **Boot confirmation (1.0-1.5s):** The sample data clears, replaced by the actual empty/default state. The boot log prints `ONLINE ✓`. A brief electronic "cleared" sound — like a CRT monitor degaussing, a quick *woomp*.
3. **Ready state (1.5s+):** The element is now available, empty, ready for the player to configure.

**Audio vocabulary:**
- Rapid electronic ticking during cycling (like a dial tone finding its frequency)
- CRT *woomp* on clear (100ms, satisfying)
- No melodic elements — purely utilitarian sounds

**What this gets right:** The self-test TEACHES. When the eviction dropdown cycles through FIFO/Priority/LRU, the player briefly sees the options before they need to choose. When buffer slots flash with sample observations, the player sees the data format. The celebration IS a tutorial micro-moment — it previews what the new element does.

The diegetic framing is impeccable. Real systems run self-tests on initialization. POST (Power-On Self-Test) in a BIOS is exactly this — the system verifies its own components before presenting the user interface. The AI is running diagnostics on its new subsystem before declaring it operational. This is the most literally correct depiction of "subsystem coming online."

The "cycling through options" reveals the possibility space. The player hasn't read the Codex entry for eviction policies yet, but they've already seen three words: FIFO, Priority, LRU. The next time they encounter these terms (in a tooltip, in the Codex, in a boot log line), there's a flash of recognition — "I saw those cycle past."

**What this gets wrong:** The self-test creates a temporal dead zone. During the 1.5 seconds of diagnostic cycling, the player might try to interact with the new element — they see a dropdown cycling and click on it. Do they interrupt the self-test? Does the click register? If the self-test is non-interactible, the player feels locked out. If it IS interactible, the animation breaks.

The cycling-through-options risks information overload in the exact frame where it's least processable. The player sees FIFO/Priority/LRU flash by in 600ms total. They don't read any of them. The "preview" becomes noise rather than signal. The vocabulary density research (5.04b) suggests that flashing terms at 3.3 terms/second is far beyond the processing ceiling.

The purely utilitarian audio lacks emotional weight. There's no "this matters" signal — it sounds like a printer warming up. The first-time player doesn't feel rewarded; they feel like they're watching a loading screen.

**Comparable:** BIOS POST screens. When you boot a PC, the system briefly flashes memory count, drive detection, peripheral enumeration. Power users read this. Everyone else just sees flicker before the OS loads. The self-test is invisible to most people.

**Comparable:** Hacknet. Terminal output scrolls as systems initialize. The text IS the game. But Hacknet's target audience finds terminal output intrinsically satisfying — Robot Uprising's audience is broader.

---

### Option F: "The Kulintang Ceremony" — Musically Escalating Ritual (RECOMMENDED)

Each unlock triggers a musically coherent celebration that escalates in complexity and grandeur as the campaign progresses. The first unlock is a single bell. The Command agent unlock is a full kulintang ensemble phrase. The 10-mission arc IS a musical composition, with each unlock as a note.

**The Core Principle: Accumulating Resonance**

The celebration for unlock N incorporates elements from ALL previous unlocks. The first unlock plays one babendil note. The second unlock plays two notes (the first's tone, then its own). By Mission 5, the unlock fanfare is a 5-note phrase that contains echoes of every previous subsystem. By Mission 10, the Command agent unlock is a full kulintang statement — every subsystem the player has brought online reverberates in a single 4-second musical phrase.

**The Mechanical Design:**

Each concept category is assigned a kulintang instrument and pitch:

| Category | Instrument | Pitch | Timbre |
|----------|-----------|-------|--------|
| Context/Buffer | Agung (large gong) | Low (E2-A2) | Deep, resonant, sustaining |
| Skills | Babendil (small gong) | Mid-high (C4-G4) | Bright, clear, staccato |
| Rules | Kulintang (melodic gong row) | Mid (G3-D4) | Warm, tonal, ringing |
| Hooks | Gandingan (suspended gongs) | Mid-low (B2-F3) | Hollow, reverberant |
| Context Config | Dabakan (drum) | Percussive | Sharp, rhythmic, no pitch |

**Minor unlock (new parameter, observation type):**
- Single instrument strike matching the concept's category
- The panel gains a soft amber underglow (persistent until visited)
- Boot log prints ONLINE in amber
- Duration: 400ms total
- No screen dim, no interruption

**Standard unlock (new skill, rule type, hook capability):**
- Two-note phrase: the category instrument plays its tone, then the previous category instrument echoes at 50% volume
- The panel emits an amber pulse ring (120px radius)
- A scanning highlight sweeps through ONLY the new elements within the panel (not the whole panel — just the delta), taking 800ms
- Boot log prints with the scan-line aesthetic
- Duration: 1.2s total
- 5% screen dim during the scan, lifting after

**Major unlock (factory, Command agent, new screen mode):**
- Full kulintang phrase: all previously unlocked categories play their instruments in a 2-second ascending phrase, building from the deepest (agung) to the brightest (babendil), culminating in the new category's instrument
- The entire workbench undergoes the "seal-descend" transition (from 6.01c) — a brief 800ms ceremony where the board preview flashes, all panels pulse amber simultaneously, and the new panel/screen emerges
- A brief visualization plays on the board preview: ghost units demonstrating the new capability (a ghost Command agent issuing a reassign order, ghost arrows showing the flow)
- Boot log prints a multi-line initialization block
- Duration: 3.5-4.0s
- 15% screen dim, lifting with a gentle fade

**The Musical Arc Across 10 Missions:**

| Mission | Unlocks | Musical State | Cumulative Phrase |
|---------|---------|---------------|-------------------|
| M1 | Buffer, Observation | Agung solo | *BOOM* |
| M2 | Skills (patrol, evade), Context Config | Agung + babendil + dabakan | *BOOM-ting-tak* |
| M3 | Hooks (ON_OBSERVE), Channels | +gandingan | *BOOM-ting-tak-dong* |
| M4 | Rules (condition→action), Priority | +kulintang | *BOOM-ting-tak-dong-ring* |
| M5 | Factory, Production Queue, Blueprints | MAJOR: full 5-instrument phrase for factory birth | The workbench transforms. All five instruments play. The dabakan sets the rhythm. |
| M6 | Compress, Filter, Amplify (relay skills) | Babendil trills (rapid 3-note) | Skills are flowering — the babendil sings more |
| M7 | Command agent, Reassign, Reroute, Prioritize | MAJOR: the full phrase plays, but now the kulintang carries the melody (rules govern the meta-level) | The deepest kulintang note the player has heard |
| M8-10 | Remaining skills, advanced hooks | Phrases become denser, more complex, approaching actual kulintang ensemble music | The game is making music from the player's unlocks |

**The "I Made This Music" Moment:**

By Mission 7-8, attentive players realize the unlock phrases are getting more complex because THEY are making the system more complex. The music tracks the architecture's growth. A player who unlocks hooks early hears gandingan tones earlier in the phrase. A player who focuses on skills first hears more babendil. The celebration music is shaped by the player's progression path (within the locked mission arc's constraints — but the ORDER of within-mission unlocks can vary).

The TikTok clip: a split-screen. Left: Mission 1, single agung strike. Right: Mission 7 Command agent unlock, full kulintang ensemble phrase. Caption: "The same unlock sound. Ten missions later." The audio goes from *BOOM* to a full musical statement. It's the game showing you how much you've built.

**Visual Design Detail:**

The scanning highlight that marks new elements uses a specific visual language:

- **New slot (empty, waiting to be configured):** Dashed amber outline, gently pulsing. The dashes flow clockwise like ants marching — "this wants to be filled."
- **New toggle/switch:** The toggle animates one flip on→off→on during the scan, demonstrating that it IS a toggle. Then settles to its default state.
- **New dropdown:** The dropdown briefly expands to show its options as a ghosted list (30% opacity), then collapses. A 200ms preview of the possibility space.
- **New parameter slider:** The slider thumb slides from min to max to its default position. A 500ms demonstration of range.

Each of these micro-demonstrations is a compressed version of the Diagnostic Flicker (Option E), but embedded within the scanning highlight rather than dominating the whole event. The player sees options peripherally without being forced to process them.

**Accessibility Design:**

- **Screen reader:** Announces "[Category] subsystem online. [N] new elements available in [Panel Name]. Press Tab to navigate to new elements." The kulintang phrase plays regardless — sighted and blind players share the same audio experience.
- **Reduced motion:** The scanning highlight is replaced by a static amber border around new elements. The pulse ring is removed. The musical phrase still plays.
- **Deaf/HoH:** Each instrument category maps to a distinct vibration pattern (on gamepad/mobile): agung = long heavy pulse, babendil = short sharp tap, kulintang = medium rhythmic tap, gandingan = slow oscillation, dabakan = rapid flutter. The vibration phrase mirrors the audio phrase. Screen flash accompanies each instrument hit — low gong = full-screen amber wash, high gong = small bright flash at panel location.
- **Colorblind:** Amber is the only celebration color (no red/green distinction needed). The amber underglow and scanning highlight use brightness variation, not hue variation.

---

## Player Journeys

### Journey: Sofia, 15, Manila — First-Time Strategy Gamer

**Context:** Mission 2, Sofia's second session. She completed Mission 1 yesterday (learned to filter noise from context windows). She's about to unlock her first skill: patrol.

**Minute 0:00 — Mission 2 Start, Plan Screen**

Sofia sees the Plan screen. The board preview on the left shows a jungle grid — two pre-placed scouts, one enemy striker visible in the bottom corner. The workbench on the right has two panels she recognizes: the Context Config panel (she dragged filters here yesterday) and the Rules panel (which has one simple rule: "IF enemy_visible THEN alert"). Both panels look the same as yesterday.

The boot log sidebar scrolls:

```
[0300] CORE       : Mission 2 initialized
[0301] PERCEPTION : terrain scan complete — jungle canopy
[0302] CORE       : tactical assessment: patrol capability required
[0303] CORE       : loading patrol module...
```

Sofia hears a low agung note — *BOOM* — the familiar deep gong from Mission 1. Then, a bright babendil strike — *ting!* — a new sound, higher, clearer, metallic. Her ears perk up. That's new.

On the workbench, the Skills panel — which has been present but greyed out since Mission 1, showing only locked silhouette slots — lights up. An amber scanning line sweeps downward through the panel. As it passes the first skill slot, a ghosted patrol icon appears: a small footprint symbol, pulsing from 0% to 100% opacity. The dashed amber outline around the slot flows clockwise — *this wants to be filled.*

```
[0304] SKILLS     : patrol — ONLINE ✓
```

The amber "ONLINE ✓" flashes, then fades to teal. Total ceremony: 1.2 seconds.

**What Sofia is thinking:** "Oh! That *ting* sound. Something happened in that panel. The walking feet thing. I think that's... the scout can move now?" She clicks the Skills panel. The amber underglow fades as she opens it. The patrol skill card is there — a footprint icon with a brief description: "Move to adjacent tiles. Scouts move first."

She drags the patrol skill into the slot. A satisfying magnetic *snap*. The dashed outline solidifies into a clean border. The scout on the board preview shifts slightly — a ghost arrow appears showing its movement range.

**Minute 0:45 — First Patrol Configuration**

Sofia is dragging the scout's patrol path when a second unlock triggers. The boot log prints:

```
[0312] SKILLS     : evade — ONLINE ✓
```

The babendil strikes again — *ting!* — and a second skill slot in the Skills panel lights up with the same scanning highlight. A ghosted dodge-arrow icon appears.

Sofia barely glances at it. She's focused on patrol. But the amber underglow stays on the Skills panel tab, and she sees the ◆2 badge. She'll check the evade skill when she's done placing the patrol route.

**What this teaches:** The two-note phrase (agung echo + babendil) creates a learned association. By the time Sofia hears the deeper gandingan in Mission 3 (hooks unlock), she'll know: deep = new category, bright = within-category. The persistent badge lets her defer attention without losing the information.

**Minute 3:30 — Post-Execute, Sealed Watch**

The battle plays out. Sofia's scout patrols beautifully... and walks straight into the enemy striker. One-shot-one-kill. Dead scout.

The agung plays a low, mournful note. Sofia grimaces. But she notices: the evade skill she unlocked earlier would have let the scout dodge. She didn't equip it.

**What Sofia is feeling:** Regret (the scout died), then recognition (the evade skill existed and she didn't use it), then determination (next time, I'll equip evade too — but the slot limit means I have to choose...). The micro-celebration's job was to NOTIFY her that evade existed. The badge did that. The consequence of not using it is the actual teacher.

---

### Journey: Marcus, 42, Portland — Factorio Veteran, 80 Hours in Factorio This Month

**Context:** Mission 5, Marcus's third session. He blasted through Missions 1-4 in two sessions, recognizing patterns from Factorio and Shenzhen I/O. He's about to unlock the factory — the paradigm shift from pre-placed units to production.

**Minute 0:00 — Mission 5 Start, Plan Screen**

The boot log runs its standard initialization. Marcus is already scanning the workbench, mentally planning his config. Then:

```
[0400] CORE       : strategic assessment: unit production capability required
[0401] CORE       : initializing factory subsystem...
```

The screen dims 15%. Marcus's hands pause on the keyboard. He knows this dim level — he's never seen it this dark before. Something big.

The agung strikes low — **BOOOM** — deeper and louder than any previous gong. Then the babendil answers — *ting-ting-ting* — three rapid notes, all the skills he's unlocked singing their echo. The dabakan drum enters — *tak-tak* — setting a rhythm. The gandingan adds its hollow ring — *dong* — hooks reverberating. Finally, the kulintang plays a descending five-note phrase — *ring-ring-ring-ring-ring* — the most melodic sound Marcus has heard in the game.

All five instruments. 2.5 seconds of actual kulintang ensemble music.

On the workbench, the seam-crack animation begins. A thin amber line appears at the bottom of the existing panels. With a metallic *tink*, the crack widens. A new panel slides upward from below — the Production Queue. It's a horizontal conveyor belt strip with empty blueprint slots. As the panel emerges, ghost blueprint cards appear on the belt, cycling through the available blueprints at rapid speed, then clearing. The panel's border transitions from amber glow to standard chrome.

Meanwhile, on the board preview, the player base appears for the first time. A small structure at grid position A1 — a data center built into a coastal cliff, with a conveyor belt extending onto the grid. Ghost units assemble on the belt and march onto the board, demonstrating the production flow in miniature. Then the ghosts dissolve.

```
[0405] PRODUCTION : factory subsystem — ONLINE ✓
[0406] PRODUCTION : blueprint slots: 3/3 available
[0407] PRODUCTION : conveyor queue: empty
[0408] CORE       : you build the builders now.
```

The screen dim lifts. The five-instrument phrase echoes for half a second, then silence.

**What Marcus is thinking:** "Holy shit." He actually says it out loud. Not because he didn't know the factory was coming (he read the mission description). But because the CEREMONY told him: this is different from everything before. Four missions of single-note unlocks built a musical vocabulary that the factory unlock PAID OFF. The kulintang phrase is a thesis statement — every subsystem you've brought online is now part of a production system.

Marcus sits back for a moment, taking in the new workbench layout. The Production Queue panel is at the bottom. The conveyor belt is empty. He needs to create blueprints. He reaches for the first blueprint slot.

**Minute 1:30 — First Blueprint Created**

Marcus has configured his first blueprint: a relay with compress and filter skills, two hook slots wired to a "threat" channel. He drags the blueprint card onto the conveyor belt.

The conveyor belt accepts the card with a mechanical *chunk*. The card slides to the leftmost position. A small cost indicator appears below: "5m, 2e/tick."

No kulintang phrase this time. Just the mechanical chunk of industry beginning.

**What Marcus is feeling:** The transition from ceremony to function. The unlock was grand; the work that follows is utilitarian. The contrast is deliberate — the game celebrates the CAPABILITY, not the activity. Marcus is now in build mode, and the workbench has already stopped celebrating and started being a tool.

---

### Journey: Aisha, 14, Cebu — Never Played a Strategy Game, Found Robot Uprising Through a TikTok

**Context:** Mission 7, Aisha's sixth session. She's been playing slowly, one mission per day after school. She understands scouts, strikers, relays, the factory, channels, hooks. Today she unlocks the Command agent.

**Minute 0:00 — Mission 7 Start**

Aisha opens the game. The campaign map shows the Philippine archipelago — she's in Manila province, the cyberpunk megacity mission. The mission description mentions "coordination at scale."

She clicks to begin. The Plan screen loads. The boot log initializes. Then:

```
[0600] CORE       : strategic assessment: autonomous coordination required
[0601] CORE       : initializing command subsystem...
[0602] CORE       : WARNING: meta-level operations detected
[0603] CORE       : this module manages other modules.
```

The screen dims 15%. Aisha tenses. She recognizes the Major dim.

But something is different. Before the instruments play, there's a half-second of silence. A dramatic pause that the game has never used before. Then:

The agung begins — but not with a single strike. It *rolls*. A tremolo, the mallet rolling across the gong surface, producing a sustained shimmering rumble. Through the rumble, every instrument she's unlocked over six missions enters in sequence:

- Babendil (skills): three bright staccato notes — *ting-ting-ting*
- Dabakan (production): a steady rhythmic pulse — *tak-tak-tak-tak*
- Gandingan (hooks): two hollow sustained rings — *doooong... doooong*
- Kulintang (rules): an ascending five-note melody — *ring-ring-ring-ring-RING*

The kulintang's highest note sustains. And then a NEW instrument enters — one Aisha has never heard. A deep, resonant brass tone, like a horn made from a gong. This is the **tambur** — the signal caller. A single authoritative note that sits above all the others. The Commander's voice.

On the workbench, a new panel doesn't just slide out. The entire workbench REORGANIZES. Existing panels smoothly compress upward, making room for a new section at the center — the Command panel. It's larger than any previous panel. It has subordinate slots (showing miniature portraits of the units the Command agent can manage), a doctrine selector, and a reassign interface. Each element pops in with the characteristic micro-bounce.

On the board preview, a ghost Command unit appears at the factory — a larger icon than any other unit, with faint connection lines radiating to the existing ghost units. The connection lines pulse amber.

```
[0608] COMMAND    : command subsystem — ONLINE ✓
[0609] COMMAND    : subordinate management: enabled
[0610] COMMAND    : reassign / reroute / prioritize: available
[0611] CORE       : you no longer manage agents. you manage the system that manages agents.
```

The dim lifts. The tambur note fades into silence. Total ceremony: 4 seconds.

**What Aisha is feeling:** Awe. The musical phrase was longer and more complex than anything before. She heard echoes of every system she's spent six days learning. The new brass note felt important — authoritative, commanding. The workbench reorganization was dramatic but legible: she can see the subordinate slots, each with a miniature portrait of a unit type she recognizes.

But underneath the awe: intimidation. "This module manages other modules." She doesn't fully understand what that means yet. She opens the Codex (the ◆ badge is blinking on the Codex tab) and reads the Command agent card.

**Minute 2:00 — First Command Configuration**

Aisha tentatively drags a scout portrait into the Command unit's first subordinate slot. A connection line appears on the board between the Command unit and the scout. She opens the reassign dropdown. Options: "patrol → evade," "evade → patrol," "reassign skill..."

She selects "patrol → evade" and sees a preview: the scout's skill slot changes from patrol to evade. A tooltip appears: "The Command agent will execute this reassignment during the Sealed Watch based on its rules."

"Oh," Aisha breathes. "So it does the thing I've been doing manually. But during the battle."

**What this teaches:** The ceremony told Aisha that something important happened. The ceremony's musical complexity (containing echoes of every previous unlock) told her subconscious that this new thing CONNECTS to everything before. The Codex entry provided the conceptual framework. But the actual understanding came from interacting with the subordinate slot and seeing the reassign preview. The celebration created READINESS for learning — the learning itself happened in the interaction.

---

### Journey: Dr. Reyes, 55, UP Diliman Professor of Computer Science

**Context:** Mission 4, his first session (he skipped ahead after his TA recommended the game). He's evaluating Robot Uprising for potential use in his Introduction to Artificial Intelligence course. He's an expert in multi-agent systems.

**Minute 0:00 — Mission 4, Rules Introduction**

Dr. Reyes has configured his agents efficiently through Missions 1-3 (he understood context windows, hooks, and channels immediately — they're concepts he teaches). Now Mission 4 introduces rules.

```
[0380] CORE       : behavioral policy module detected
[0381] RULES      : condition→action evaluation engine — loading...
```

The kulintang plays for the first time — a single warm, tonal ring. A new sound in the game's vocabulary. Dr. Reyes's ear catches it. Beneath the ring, the agung echoes (context) and the babendil echoes (skills) — the two systems that rules will operate on. The gandingan (hooks) joins — rules will evaluate data arriving through hooks.

Four instruments. Each one a concept Dr. Reyes already understands. Playing together for the first time.

The Rules panel in the workbench expands. A scanning line sweeps through it. New elements appear: a condition dropdown, an action dropdown, a priority number, a drag handle for reordering.

```
[0384] RULES      : condition→action pairs — ONLINE ✓
[0385] RULES      : priority evaluation: first match wins
[0386] RULES      : this is a production rule system.
```

Dr. Reyes smiles. "It IS a production rule system." He's been teaching OPS5 and CLIPS for twenty years. The game just said the quiet part out loud — in the boot log, where only someone who knows the term would catch it.

**What Dr. Reyes is thinking:** "The audio phrase contained the data flow. Context feeds rules. Skills are what rules trigger. Hooks deliver the data that rules evaluate. The music IS the architecture diagram." He pauses, considering whether to assign this to his class. The kulintang phrase just taught signal flow topology through audio spatialization. He's impressed.

**Minute 1:30 — Expert Speed Configuration**

Dr. Reyes rapidly configures three rules for his relay:

1. IF `enemy_count > 2` AND `channel:threat` THEN `compress + broadcast`
2. IF `ally_damaged` THEN `amplify(channel:evac)`
3. IF `buffer_full` THEN `evict(oldest)`

Each rule takes him 15 seconds. The scanning highlight and amber badges don't slow him down — they're peripheral. He knows what rules are. The celebration served as an architectural confirmation ("yes, rules sit here, they interact with those systems") rather than a teaching moment.

**What this shows:** The Kulintang Ceremony works for experts because the musical phrase communicates RELATIONSHIPS (which categories are connected) rather than DEFINITIONS (what each category does). An expert doesn't need to be taught what rules are. They need to be shown where rules sit in the architecture. The four-instrument phrase — context, skills, hooks, rules — is an architecture diagram expressed as music.

---

## Interaction Effects

### × Vocabulary Density (5.04b)
The micro-celebration is a BUFFER between unlocks. The 1.2-second standard ceremony creates a 1.2-second gap where the player's working memory resets between concept introductions. Without it, two concepts unlocking in rapid succession compete for the same cognitive slot. The ceremony is a palate cleanser — it marks the boundary between "that concept" and "this concept."

The three intensity levels (minor/standard/major) also communicate cognitive load expectations: minor = "this is a small addition to something you know," standard = "this is a new thing to learn," major = "this changes how you think about the game."

### × Boot Log Narrative (5.02)
The boot log text during the ceremony is the NAMING MOMENT (5.00e). The ceremony creates a brief window of heightened attention — the player's eyes naturally track to the boot log during the screen dim. The term appears ("eviction policy — ONLINE") at the exact moment the player is primed to receive it. The kulintang tone becomes a Pavlovian cue for "a new word is about to appear in the log."

### × Blueprint Codex (5.17)
The ceremony triggers a new Codex entry unlock. The ◆ badge on the Codex tab appears at the ceremony's conclusion. The player now has two paths: immediate (check the Codex now) or deferred (continue configuring, check later). The badge persists. This is the handoff between interactive teaching (the ceremony) and reference teaching (the Codex).

### × Sealed Watch Purity
Critically, the micro-celebration NEVER occurs during the Sealed Watch. All unlocks happen at mission start (in the Plan screen) or at mission debrief (in the Inspector). The Sealed Watch is sacred — no UI changes, no new panels, no ceremonies. The player watches the consequences of their configuration without interruption.

### × Inspector Diagnostic
In the Inspector screen, unlocking a new diagnostic tool (like the signal genealogy or context window chart) uses the same ceremony system but with a COOL color palette — teal scanning line instead of amber, teal underglow instead of amber glow. This distinguishes "new capability you configure" (amber, Plan screen) from "new tool you use to analyze" (teal, Inspector screen). The audio is the same kulintang phrase but played on a different register (higher, brighter) to match the analytical context.

### × Replay Experience (5.05c)
On replay, the ceremony can be shortened. After campaign completion, the player can toggle "Quick Start" mode: all ceremonies are compressed to the minor tier (single babendil strike, no scan, no dim) regardless of the actual unlock importance. The musical phrase still plays — it's too short to be annoying — but the visual ceremony is stripped. For speedrunners, even the minor tier can be disabled: a single amber flash, 100ms, done.

### × Mobile/Touch (6.07)
On mobile, the kulintang audio is the primary celebration channel (the screen is too small for elaborate visual ceremonies to be legible). The scanning line is replaced by a brief amber border flash on the panel. The haptic vibration mirrors the audio: agung = long heavy rumble, babendil = short tap. The ◆ badge is enlarged to be thumb-friendly.

### × Streaming/Content Creation
The accumulating musical phrase is inherently clip-friendly. A streamer can supercut their unlock progression across 10 missions: Mission 1 (*BOOM*), Mission 3 (*BOOM-ting-dong*), Mission 5 (*full ensemble*), Mission 7 (*full ensemble with tambur*). The audio tells the story of growing system complexity. Chat reacts to the familiar instruments with "there's the gandingan!" — the instruments become characters that the audience recognizes.

---

## Comparable Games: Deep Analysis

### Metroid — Item Acquisition Fanfare (The Gold Standard)
The Metroid fanfare (D minor, ascending, ~5 seconds) is the most recognized unlock jingle in gaming history. It works because:
1. Items are rare (10-20 per game) — each one is precious
2. Gameplay FREEZES — the celebration has the player's full attention
3. The item fundamentally changes traversal — the fanfare marks a genuine capability shift
4. The melodic contour (rise → fall → rise → fall) creates tension and resolution in 5 seconds

Robot Uprising's challenge: 31 concepts vs. Metroid's 10-20 items. The fanfare budget per concept is lower. The Kulintang Ceremony addresses this by scaling intensity — most unlocks get 400ms, only major ones get 4 seconds.

### Zelda — Chest Opening (The Ritual)
Zelda stretches the anticipation window deliberately. See chest → approach → press button → animation → item appears → fanfare → text → dismiss. The entire sequence takes 5-8 seconds. The stretch creates anticipation, and anticipation is where dopamine peaks.

Robot Uprising can't afford 5-8 second ceremonies for 31 concepts. But the Kulintang Ceremony borrows the PAUSE — the half-second silence before the Major unlock phrase. Silence in a game that usually has ambient audio is itself a signal: "pay attention."

### Factorio — Research Complete (The Notification)
Factorio's research-complete chime is brief, functional, and easy to miss. Community complaints center on "I didn't notice my research finished 10 minutes ago." The notification was ADDED in response to player feedback — originally, research completed silently.

This is the cautionary tale for Option A (Boot Line). Minimal celebration = missed unlocks. Robot Uprising's persistent amber underglow and badge are the corrective — even if you miss the moment, the state persists until acknowledged.

### Inscryption — Act Transitions (The Transformation)
Inscryption's most celebrated moments are when the game itself transforms — new rules, new table, new antagonist. These happen 2-3 times across a 10-hour game. Robot Uprising can't sustain that intensity across 31 unlocks, but the Mission 5 factory ceremony and Mission 7 Command ceremony can borrow the "everything rearranges" spectacle for exactly those 2 moments.

### Slay the Spire — Card Reward (The Choice)
After each combat, the player chooses one of three cards. The card reward screen has minimal ceremony — a brief shimmer, the cards fan out. What makes it work is not the celebration but the CHOICE. The player evaluates, selects, and the selected card slides into the deck with a satisfying *thunk*.

Robot Uprising's unlocks aren't choices (they're campaign-gated). But the ceremony can CREATE a choice: after the unlock ceremony plays, the player must choose how to use the new capability. The ceremony ends with the amber dashed-outline slot saying "fill me" — converting the unlock into a decision.

---

## Sensory Summary

| Element | Minor Unlock | Standard Unlock | Major Unlock |
|---------|-------------|-----------------|--------------|
| **Screen dim** | 0% | 5%, 800ms | 15%, 3.5s |
| **Audio** | Single instrument strike (400ms) | Two-note phrase with echo (1.2s) | Full kulintang ensemble (2.5s) + new instrument |
| **Visual — panel** | Amber underglow + badge | Pulse ring + scanning highlight through delta + underglow + badge | Seam crack + panel emergence + element pop-in + ghost demo on board |
| **Visual — boot log** | Amber "ONLINE ✓" | Scan-line text + amber "ONLINE ✓" | Multi-line initialization block + amber "ONLINE ✓" |
| **Haptic (controller)** | Single tap matching instrument | Two-tap pattern | Multi-pulse phrase matching audio |
| **Duration** | 400ms | 1.2s | 3.5-4.0s |
| **Interruptible?** | N/A (instant) | Click anywhere to skip scan | Click to compress to 1s (audio continues) |

---

## The Anti-Juice Principle

A critical design constraint: the Kulintang Ceremony must NOT celebrate unlocks that are TRIVIALLY understood. If the player already knows what "noise observation" means from Mission 1, unlocking "enemy_noise observation" in Mission 3 doesn't deserve a Standard ceremony. It's a minor — a single babendil tap and a badge.

The ceremony's intensity should track the COGNITIVE NOVELTY of the unlock, not its mechanical importance. A new rule type (fundamentally new mental model) gets a Standard ceremony even though it's "just" a UI element. A fourth skill for a unit type the player already understands gets a Minor even though it's mechanically powerful.

This prevents the over-juicing failure mode: when every unlock gets the same celebration, none of them feel special. The Kulintang Ceremony must be a thermometer of "how much new thinking does this require?" — not "how powerful is this thing?"

---

## New Aspects Discovered

- [ ] **5.04c-i — The silence before the major unlock:** detailed audio design of the dramatic pause before Mission 5 and Mission 7 major ceremonies; how long is the silence (300ms? 500ms? 1000ms?); does the ambient sound cut too, or just the music? The silence as the most powerful audio event in the game.
- [ ] **5.04c-ii — Kulintang phrase as progression save indicator:** if the player's save file encodes which instruments have been unlocked, the main menu could play the current kulintang phrase on loading — a musical save file that sounds different at every stage of the campaign; the "loading screen as progression summary" pattern.
- [ ] **5.04c-iii — Ceremony skip/compress for expert fast-track:** exact UX for players who toggle "Quick Start" mode; does the audio still play? Does a compress-to-100ms flash feel respectful or dismissive? Interaction with speedrun culture and the locked mission arc's pacing intent.
- [ ] **5.04c-iv — The Commander's tambur as unique instrument:** the Mission 7 Command agent unlock introduces a NEW instrument never heard before; should any other major unlock also introduce a new instrument? Or is the tambur unique — the one time the game surprises the player's ears after they've learned the full kulintang vocabulary?
- [ ] **5.04c-v — Inspector-mode teal ceremony variant:** detailed color, audio, and animation spec for the Inspector-screen unlock ceremony; how does the teal analytical palette differ from the amber configuration palette? Does the kulintang phrase shift register (higher octave)? Does the Inspector ceremony feel "cooler" and more clinical?
