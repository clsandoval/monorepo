# 2.01d — Buffer Health as Spectator Readability Tool

## The Option

In a game with no HP bars, no damage numbers, and one-shot-one-kill combat, the **context bar** (the tiny colored pips at the bottom of each unit's tile showing context window fill) becomes the only persistent, tick-over-tick visual indicator of unit "health." But it is not health in the traditional sense — it is cognitive load. A full bar does not mean "about to die from damage." It means "about to be stunned from information overload, and in a one-shot-one-kill world, one stunned tick means death." This inversion — where the danger comes from knowing too much rather than being hit too hard — creates a fundamentally new spectator vocabulary.

For streamers, casters, tournament overlays, and esports production, this is both an opportunity and a design challenge. Traditional competitive games give spectators a health bar that maps directly to "how close to death." Robot Uprising's context bars tell a more complex story: how close to cognitive failure, which depends on enemy noise-flooding, the player's filter/compression architecture, eviction policy quality, and incoming signal volume. The spectator must learn to read a new kind of danger.

### The "Health Bar" Analogy and Where It Breaks

In StarCraft, a unit at 10% HP is in immediate mortal danger. In Robot Uprising, a unit at 6/6 context slots filled is in immediate danger of being stunned next tick — but the severity depends on what those 6 entries are. If 5 are high-priority tactical signals and 1 is noise, the eviction policy will handle incoming data gracefully. If all 6 are noise from an enemy flood attack and the unit has no compress skill, it is functionally paralyzed. The context bar tells you the quantity but not the quality of the cognitive load.

This creates a tiered spectator literacy model:
- **Tier 1 (casual viewer):** "Red bar = bad, green bar = good" — works for 80% of situations
- **Tier 2 (informed viewer):** "That relay's bar is full but it has compress — it will handle it" vs. "That scout's bar is full and it has no filter — it is about to stun-lock"
- **Tier 3 (expert viewer):** Reading the composition of the bar, predicting eviction cascades, understanding which signals will be lost and how that changes the agent's next decision

### Design Implications for Casting Vocabulary

The game needs to seed a casting vocabulary that maps onto the context bar system. Proposed terminology:

| Term | Meaning | Casting Usage |
|------|---------|---------------|
| **"Running hot"** | Context bar at 80%+ fill | "Both scouts are running hot — one more signal and they stun" |
| **"Clean buffer"** | Context bar under 50%, mostly relevant signals | "That relay has a beautifully clean buffer, perfect information flow" |
| **"Noise-flooded"** | Context bar full of enemy-generated garbage | "The enemy flooded the north scout — it is noise-locked" |
| **"Breathing room"** | Context bar at 30-50%, healthy headroom | "After that compress fired, the relay has breathing room again" |
| **"Stun-locked"** | Unit stunned for consecutive ticks due to sustained overload | "Three ticks stun-locked! That scout is effectively dead" |
| **"Eviction cascade"** | Important signals evicted to make room, breaking downstream hooks | "Eviction cascade on the command — it just lost the threat signal from the scout chain" |
| **"Cognitive collapse"** | Multiple units stun-locking simultaneously from a coordinated flood | "Cognitive collapse across the entire left flank!" |

### Overlay Design Principles

**The Broadcast Bar:** For streaming overlays, each unit's context bar should be expandable into a "broadcast bar" — a larger, horizontal representation showing not just fill level but signal composition. Color-coded segments: blue for scout observations, orange for relay-forwarded signals, red for enemy noise, green for command directives. This gives casters visual language to narrate what is happening inside the agents.

**The Army Heatmap:** A small overlay panel showing all friendly units as dots on a grid, each colored by their context bar state (green/amber/red). At a glance, a caster can say "the entire northern formation is running hot" without clicking individual units.

**The Signal Flow Diagram:** An overlay showing active channel communications as animated lines between units. When a channel is carrying heavy traffic, the line thickens and pulses faster. When a unit stun-locks, its incoming lines visually "pile up" at the node — signals arriving but not being processed.

---

## Strengths

1. **Genuinely novel spectator mechanic.** No other competitive game uses cognitive load as the primary spectator-readable state variable. This is inherently interesting for content creators looking for fresh games to cover.
2. **Narrative richness.** "The AI is overwhelmed" is a more compelling story than "the unit lost HP." It creates anthropomorphic empathy — viewers feel the cognitive strain.
3. **Strategic depth visible at surface level.** A viewer who understands that "red bar = about to stun" immediately appreciates noise-flood tactics, compress skills, and filter architecture without understanding the underlying mechanics.
4. **Natural dramatic tension.** Context bars rising toward full create slow-building tension (like a fuse burning), unlike HP which drops suddenly from combat. The danger is visible ticks before the consequence.
5. **Casting vocabulary writes itself.** "Running hot," "noise-flooded," "cognitive collapse" — these terms are immediately evocative and require no esports-specific knowledge to understand.

## Weaknesses

1. **Indirect death signal.** In traditional games, "unit at 1 HP" = "about to die." In Robot Uprising, "unit at 6/6 context" = "about to be stunned" = "might die if an enemy striker is adjacent next tick." The causal chain is longer, which makes moment-to-moment danger harder to read at a glance.
2. **Quality vs. quantity ambiguity.** The context bar shows fill level but not content quality. Two units at 5/6 fill may be in vastly different states depending on signal composition. Expert viewers will read this; casual viewers cannot.
3. **No "clutch HP" moments.** Games thrive on "survived with 1 HP!" moments. The context bar equivalent — "survived at 5/6 fill without stunning" — is less viscerally dramatic because the consequence (stun) is temporary, not lethal.
4. **Stun-lock is anticlimactic.** A unit that stun-locks just... stops for a tick. It does not explode dramatically. The spectacle of death in traditional games (explosions, ragdolls, death animations) is absent from the stun moment. The sparking/jittering visual must carry enormous weight.
5. **Enemy noise tactics are invisible.** When an enemy floods noise into a channel, the spectator sees the bar fill up but does not see the cause unless the signal flow overlay is active. The aggressor's action is architecturally hidden.

## Interaction Effects

- **With one-shot-one-kill combat:** The context bar is NOT the death indicator — proximity to a striker is. The context bar indicates vulnerability to death (stunned = cannot evade). This two-layer system (position danger + cognitive danger) is more complex than HP alone.
- **With the sealed watch phase:** During sealed watch, the player cannot intervene. The rising context bars create helpless tension — you see the overload coming and cannot fix it. This is excellent spectator drama.
- **With the inspector phase:** Post-battle, the inspector lets viewers (and casters) scrub back to the exact tick where a context bar hit full and understand why. This creates "replay analysis" content naturally.
- **With the emissions model:** Deeper hook architectures generate more EM noise, which means more complex (more interesting) agent networks are also louder (more vulnerable to detection). A spectator overlay showing emission levels alongside context bars tells a rich story: "Player A has a beautiful deep architecture but it is screaming noise into the battlefield."
- **With compress/filter skills:** These become spectator-readable "saves." A caster can call out "Compress fires! The relay drops from 12/12 to 7/12 — breathing room!" like a clutch heal in an MMO.

## Comparable Games

### StarCraft II Esports Production
SC2 overlays show unit HP bars, army supply counts, resource banks, and production tabs. The "production tab" is the closest analogue to Robot Uprising's context bars — it shows what the opponent is building, which is information architecture rather than combat state. SC2 casters developed vocabulary like "banking minerals" (inefficiency), "maxed out" (army supply full), "supply blocked" (can't produce). Robot Uprising needs equivalent shorthand for context states.

### Teamfight Tactics (Auto-battler Spectating)
TFT is the strongest analogue because the player does not control units during combat — they watch. TFT overlays show team compositions, item builds, and HP totals. The spectator reads the "board state" (unit positioning, synergies, items) before combat and then watches it play out. Robot Uprising's Plan→Watch→Inspect loop mirrors this exactly. TFT casters say "this comp is online" (synergies activated) or "bleeding out" (losing HP each round). Robot Uprising casters would say "this architecture is clean" or "noise-flooded."

### Into the Breach
ITB shows exact enemy intentions before the player acts. The spectator can read the board and know what will happen. Robot Uprising's context bars serve a similar function during sealed watch — a viewer who understands context mechanics can predict which units will stun and which will act. The bars ARE the "enemy intention indicators" but for the player's own units.

### Slay the Spire Streaming
StS is enormously popular on Twitch despite being single-player. Viewers engage by predicting decisions and debating optimal play. The context bar equivalent is the player's deck/draw pile — an information architecture that determines what "cards" (decisions) are available. StS streamers narrate their deck state constantly: "I have two Defends left in the draw pile." Robot Uprising streamers would narrate context state: "That command has 3 open slots — it can absorb the scout chain without stunning."

---

## Sensory Description

### The Context Bar in Default View (Sealed Watch)

At the base of each unit's isometric tile, a row of tiny rectangular pips stretches horizontally — one pip per context slot. A scout shows 6 pips. A command unit shows 14. Each pip is a 4x2 pixel rectangle with a 1-pixel gap between them.

**Empty slots** render as dark charcoal outlines against the tile shadow — barely visible, suggesting capacity but not demanding attention. **Filled slots** glow with color based on their content type: cool cyan for scout observations, warm amber for relay-forwarded signals, hot magenta for enemy-generated noise, soft white for command directives. The most recently filled slot pulses gently — a slow 1-second breathe cycle at 30% opacity variation — so the eye can track which slot just received data.

**At 50% fill**, the pips have no special treatment. **At 75% fill**, a subtle amber glow emanates from the bar as a whole — a 2-pixel soft bloom around the pip row that says "getting warm." **At 100% fill**, the bloom shifts to angry red and pulses at 2Hz — unmissable even in a crowded battlefield. The unit's sprite begins a barely perceptible jitter — 1-pixel random displacement per tick — foreshadowing the stun that comes if one more signal arrives.

**When overload triggers**, the unit's sprite freezes mid-jitter, a white flash radiates outward from the unit (1 tile radius, 200ms duration), and electric arc effects (thin white zigzag lines) crackle across the sprite for the duration of the stun tick. The context bar itself does a rapid "dump" animation — slots visually eject outward as tiny fading particles as the eviction policy fires, compacting the bar from full to roughly 60% fill. The entire sequence takes 400ms and produces a sharp crackling sound effect — short, percussive, like a capacitor discharge.

### The Broadcast Overlay (Streaming/Esports)

When a caster or streamer enables the broadcast overlay, each unit's context bar expands into a horizontal "vital signs" strip along the bottom of the unit's tile — larger, more detailed, designed for 1080p readability rather than in-game subtlety.

Each slot in the expanded bar shows a miniature icon indicating signal type: a tiny eye icon for observations, a tiny antenna for relayed signals, a tiny skull for enemy noise, a tiny star for command directives. The slot's background color matches the content type. Empty slots show dashed outlines. The bar has a small label showing current/max (e.g., "4/6") in a clean sans-serif font, white text with a dark drop shadow for legibility over any terrain.

### The Army Heatmap Overlay

In the top-right corner of the screen (or as a toggle panel), a miniaturized 8x8 grid shows each friendly unit as a colored dot. Dot color maps to context bar state: green (under 50%), yellow (50-75%), orange (75-99%), pulsing red (full/stunned). Eliminated units show as hollow gray circles. The minimap pulses when any unit transitions to red — drawing the caster's eye to developing crises.

### Audio Design for Context State

- **Ambient hum:** Each unit with a context bar over 75% contributes a low, rising electronic hum to the soundscape — the more overloaded units, the more oppressive the ambient sound. Think server room under load.
- **Stun crack:** The overload moment produces a sharp electrical discharge — like a transformer blowing. Distinct from combat sounds. A caster and viewer learn to associate this sound with "someone just stun-locked."
- **Compress relief:** When a compress skill fires and reduces context fill, a soft descending chime plays — like pressure releasing from a valve. Satisfying, brief, recognizable.
- **Noise flood ambience:** When an enemy is actively flooding a channel, the affected units' ambient hum gains a distorted, glitchy quality — digital artifacts in the audio. The viewer hears the attack before seeing the bars fill.

---

## Player Journeys

#### Journey: Marcus, 28, Twitch Streamer (200 viewers average, plays strategy games)

**Context:** Marcus is streaming his first playthrough of Robot Uprising, Mission 5 — the first factory mission. He has 200 viewers in chat. He has completed the tutorial missions and understands context windows, rules, and hooks. He is building his first blueprint from scratch.

**Minute 0:00 — Reading the Board Before Execute**
Marcus has placed three blueprints in his production queue: a scout with patrol + evade, a relay with compress + filter, and a striker with engage. His stream overlay shows the workbench on the right half of the screen, the small board preview on the left showing two enemy spawners on the east side of the 8x8 grid.

"Chat, look at this scout blueprint. Six context slots. I have listen enabled on the 'threats' channel and 'terrain' channel. If the relay forwards compressed signals, that is going to fill up fast..." He hovers over the context config section of the scout blueprint. The UI shows 6 slot indicators, each an empty dashed rectangle. Two channel labels are toggled ON with cyan highlights.

Chat responds: "you need a filter on that scout" / "eviction priority?" / "SEND IT."

Marcus drags the eviction priority slider to "oldest-first" — the safest default. He clicks EXECUTE.

**Minute 0:30 — Sealed Watch Tension**
The screen transitions to the sealed watch. The board fills the center. The tick clock appears at the top — 10 horizontal pips representing the first 10 ticks. Marcus's factory sits on the west edge, already producing his first scout.

"Okay chat, first scout is out. Watch the context bar at the bottom — those tiny pips. Six slots, all empty right now. Green territory."

The scout spawns on the factory tile. At the base of its isometric sprite, six tiny dark charcoal rectangles are barely visible. As the scout begins patrolling eastward, tick by tick, the first pip fills with a cool cyan glow — the scout's own observation of the adjacent tile.

"One slot filled. It saw something. Five to go."

**Minute 1:15 — The Rising Bars**
By tick 8, the scout has reached the center of the board. Three of its six context slots are filled — all cyan (observations). The bar looks healthy, a gentle glow but no amber bloom.

Then the enemy scout appears from the east spawner. Tick 9: the scout observes the enemy. Fourth slot fills. Tick 10: the scout's hook fires — it broadcasts "threat-detected" on the threats channel. The relay, stationed near the factory, receives the signal. On the relay's tile, one of its 12 context slots fills with amber (incoming relay signal).

"Chat, look at the relay — one slot just filled amber. That is the scout's threat signal arriving. One tick of latency. Signal latency is real."

**Minute 1:45 — Noise Flood**
Tick 12: the enemy spawner deploys two enemy scouts. They begin flooding the "threats" channel with noise. The scout's context bar ticks up: 5/6. The amber bloom appears around the scout's bar. Marcus leans forward.

"Oh no. Oh NO. Chat, the scout is at five out of six. One more and it stuns. The enemy is flooding noise into the channel..."

Tick 13: 6/6. The bar pulses red. The scout's sprite jitters.

Tick 14: A new signal arrives. The white flash radiates outward. Electric arcs crackle across the scout sprite. The context bar does its rapid dump animation — slots eject as fading particles. The scout freezes for one tick.

"STUNNED! Chat, it is stunned! And there is an enemy striker two tiles away. If that striker moves adjacent next tick..."

Marcus cannot do anything. Sealed watch. No pause, no skip. The chat explodes.

**Minute 2:00 — The Kill**
Tick 15: The scout's stun ends. Its context bar has been compacted to 3/6 by the eviction. But the enemy striker moved adjacent during the stun tick. One-shot, one-kill. The scout's sprite shatters — destroyed.

"DEAD. Chat, it died because the context bar was full. Not because it took damage — because it KNEW TOO MUCH. The enemy noise-flooded it, stunned it, and the striker walked up during the stun tick. I needed a filter on that scout. Or compress on the relay to pull data out faster."

Marcus is already thinking about his next blueprint iteration. Chat is debating filter vs. compress. The context bar told the entire story of that death without a single HP number.

**Minute 3:00 — Inspector Replay**
After the battle, the inspector opens. Marcus scrubs back to tick 12 and clicks the dead scout. The sidebar shows the full context window state: slots 1-3 are legitimate observations, slots 4-6 are enemy noise signals. The decision trace shows the scout's rule tried to fire "evade" but the stun prevented it.

"Look at this, chat. Three real signals, three noise signals. The enemy filled half the scout's brain with garbage. That is information warfare."

**UI Annotations:**
- **Context bar (sealed watch):** 6 horizontal pips at unit base, 4x2px each, 1px gap. Color by content type. Amber bloom at 75%, red pulse at 100%.
- **Stun animation:** White flash (1-tile radius, 200ms), electric arcs (duration of stun tick), dump animation on context bar.
- **Inspector context view:** Full sidebar showing each slot's content, source unit, arrival tick, and whether it influenced a decision.

---

#### Journey: Priya, 34, Esports Caster (casting a Robot Uprising tournament semifinal)

**Context:** Priya is casting a tournament semifinal between two top-ranked players. She has the broadcast overlay enabled — expanded context bars on all units, the army heatmap in the top-right, and the signal flow diagram active. She is joined by an analyst co-caster.

**Minute 0:00 — Pre-Battle Breakdown**
Both players have submitted their blueprints. The broadcast overlay shows each army's blueprint loadouts in a split-screen panel before the sealed watch begins.

"Welcome back to the Robot Uprising Invitational! We have Player Red versus Player Blue. Let me break down the architectures. Player Red is running a deep three-hop setup: scouts feeding into a relay cluster, compressed into a command agent. Beautiful architecture — but that is a LOT of signal traffic. If Blue can flood noise into those relay channels..."

The analyst co-caster jumps in: "Look at the relay's context config. Twelve slots, but only compress and filter equipped. No amplify. That relay is going to be running hot by mid-game. And the command agent — fourteen slots, but six hook slots all listening. That is a noise magnet."

"The army heatmap will tell the story. Watch for the relay cluster to go amber."

**Minute 1:30 — Mid-Battle Context Crisis**
Sealed watch is underway. Tick 18. The army heatmap in the top-right shows Player Red's formation: two green dots (scouts, healthy buffers), one yellow dot (relay, 7/12 fill), one green dot (command, 5/14 fill). Player Blue's army heatmap shows all green — their simpler two-hop architecture generates less internal traffic.

"Red's relay is at seven out of twelve — yellow on the heatmap. Not critical yet, but Blue just deployed a third scout on the north flank. Those scouts are going to start generating observation signals that flood into Red's relay chain."

Tick 22: The relay's dot on the heatmap shifts from yellow to orange (9/12). The expanded context bar on the relay unit shows 9 filled pips — five amber (forwarded signals), three cyan (observations from connected scouts), one magenta (enemy noise signal that slipped through the filter).

"Orange on the relay! Nine out of twelve! And look — one magenta pip in the bar. That is enemy noise that got past the filter. Blue's noise-flood tactic is working!"

**Minute 2:15 — The Compress Save**
Tick 25: The relay's compress skill fires. The bar does a satisfying contraction animation — 9 filled slots compact down to 5. The descending chime plays. The heatmap dot snaps from orange back to green.

"COMPRESS FIRES! Beautiful! Nine down to five in one tick. The relay has breathing room. That is the compress skill doing its job — it just saved Red's entire signal chain."

The analyst: "But look at the timing. Compress has a 4-tick cooldown. If Blue pushes another noise burst in the next 3 ticks, there is no compress available to save it."

"And Blue knows that. Watch the north flank — Blue's scouts are positioning for another flood. This is the mindgame. You flood, force the compress, then flood again during cooldown."

**Minute 3:00 — Cognitive Collapse**
Tick 28: Blue executes the second flood. Three enemy scouts simultaneously broadcast noise into Red's relay channels. The relay was at 7/12 (recovering from the last compress). The noise hits: 8, 9, 10, 11, 12 — full. The amber bloom is already there at 10. At 12, the red pulse kicks in. The relay's sprite jitters. Tick 29: new signal arrives. The white flash. The electric arcs. Stun.

But it cascades. The relay was the central hub. Its stun means the command agent stops receiving forwarded signals. The command's rules depend on relay data to issue orders. The command's context bar stalls — no new inputs, but the existing orders are stale. The command issues stale orders based on 3-tick-old data.

"COGNITIVE COLLAPSE! The relay is stunned and the entire chain goes dark! The command is making decisions on old data! This is the nightmare scenario for deep architectures!"

The army heatmap shows: relay = pulsing red, command = yellow (stale data filling slots), both scouts = green (still sending, but nobody is listening). The signal flow diagram shows the lines from scouts to relay piling up at the relay node — thick, pulsing, unprocessed.

"Blue played this perfectly. Force the compress, wait for cooldown, flood again. Three ticks of silence from Red's command structure. In a one-shot-one-kill game, three ticks is an eternity."

**UI Annotations:**
- **Broadcast overlay:** Expanded context bars (8px tall per slot, horizontal, type-coded colors, current/max label). Toggle via caster hotkey.
- **Army heatmap:** 8x8 minimap, top-right, 64x64px, dots color-coded by context state. Pulses on red transitions.
- **Signal flow diagram:** Animated lines between units on the main board. Thickness = traffic volume. Pile-up animation at stunned nodes.
- **Compress animation:** Bar contracts smoothly over 200ms, descending chime, glow pulse on the unit.

---

#### Journey: Dana, 22, Casual Viewer (watching a friend's stream, never played Robot Uprising)

**Context:** Dana clicked into her friend's Twitch stream. She has never played Robot Uprising and does not understand the mechanics. She is evaluating whether this game looks interesting.

**Minute 0:00 — First Impressions**
Dana sees an isometric board with small robot sprites on a grid. The art style is Southeast Asian cyberpunk — rice terraces in the background, neon highlights on the units. It looks distinct from anything she has seen.

At the bottom of each unit, she notices small colored bars. Some are mostly empty (dark rectangles). One unit near the center has a bar that is almost full, glowing amber. She does not know what these bars mean, but the visual language is clear: empty = calm, full = danger.

"What are those bars at the bottom?" she types in chat.

Someone responds: "context bars — like health bars but for their brain. When it fills up they freeze for a turn."

"Oh, so red = bad?" "Yeah, red = stunned = dead if an enemy is nearby."

This takes 10 seconds. Dana now has Tier 1 spectator literacy. She can read the bars.

**Minute 0:45 — Reading Without Understanding**
The streamer's scout on the east side has a bar at 4/6 — amber bloom visible. Dana sees it glowing and feels tension. She does not understand WHY it is filling up (signal traffic, enemy noise floods, channel architecture) but she understands THAT it is filling up and that full = bad.

The streamer narrates: "My scout is running hot — four out of six. If the enemy floods one more signal..."

Dana's eyes go to the scout. She watches the bar. Tick by tick. 4... 5... the amber deepens. She leans forward. Then the streamer's relay fires compress on a connected chain and the scout's downstream gets relief — bar drops to 3/6.

"Oh, that fixed it!" Dana types. She does not understand compress mechanics, but she saw bar go down and felt relief. The visual language communicated the narrative without mechanical knowledge.

**Minute 1:30 — The TikTok Moment**
Two minutes later, the enemy executes a coordinated noise flood. Three enemy units simultaneously broadcast garbage. Three of the streamer's units go from green to amber to red in rapid succession. The army heatmap (visible in the overlay) lights up like a Christmas tree — green dots flipping to yellow to orange to red in a wave across the formation.

Then the stun cascade. Flash. Crackle. Flash. Crackle. Flash. Crackle. Three units stunned in sequence. The streamer yells. Chat explodes. Dana does not need to understand context windows or eviction policies to feel the moment. She sees the bars filling in a wave. She hears the electrical cracks. She sees the units freeze. She understands: something terrible just happened, and it was caused by information, not combat.

"This game is sick," she types. She follows the streamer's channel.

This 15-second sequence — bars rising in a wave, triple stun cascade with synchronized crackle effects, the streamer's reaction — is the TikTok clip. It requires zero mechanical knowledge to read. Bars fill, units freeze, chaos ensues. The visual and audio language does all the work.

**Minute 2:30 — Deciding to Play**
The streamer enters the inspector phase and scrubs back to the stun cascade. Dana watches the slow-motion replay. The streamer clicks a stunned unit and the sidebar shows the context window: slots full of magenta (enemy noise). The streamer explains: "My brain was full of garbage. The enemy flooded it."

Dana understands the metaphor instantly. She has experienced information overload in real life. The game is about managing cognitive load for robots. The context bars are their stress levels. The stun is a panic attack. The compress skill is taking a deep breath.

She opens the game's store page in another tab.

**UI Annotations:**
- **First-time readability:** Empty bar pips must be visible but subtle (dark charcoal outlines). Filled pips must be vivid. The contrast between empty and full must be readable at 720p streaming resolution.
- **Amber bloom:** Must be visible even at small unit scale. 2-pixel soft glow around the pip row. Amber color chosen for colorblind accessibility (distinct from both red and green).
- **Stun flash:** White flash must be visible against any terrain. 1-tile radius ensures it does not get lost in visual noise. The crackle sound effect must be distinct from combat sounds.
- **Army heatmap:** Must be readable at stream overlay scale (64x64px minimum). Dot size must be large enough to distinguish color at 720p.

---

#### Journey: Kofi, 31, Tournament Organizer (designing the broadcast overlay package)

**Context:** Kofi runs a small esports production company. He has been hired to design the broadcast overlay package for the first Robot Uprising tournament. He is analyzing what spectator tools the game needs.

**Minute 0:00 — Inventory of Readable State**
Kofi lists what spectators need to see at a glance in a traditional competitive game: HP, resources, army composition, minimap, score. In Robot Uprising, the equivalent is:

| Traditional | Robot Uprising Equivalent | Overlay Element |
|-------------|---------------------------|-----------------|
| HP bars | Context bars | Per-unit pip bars (built into game) + broadcast expansion |
| Resources | Materials + Energy | Resource counter (top bar) |
| Army composition | Blueprint loadout | Blueprint icon strip (pre-battle) |
| Minimap | Army heatmap | 8x8 dot grid colored by context state |
| Score | Objectives / units remaining | Kill feed + objective tracker |

The context bar is the most novel element. Kofi realizes it needs three zoom levels for production:

1. **In-game default:** Tiny pips at unit base. Sufficient for the player but too small for 1080p broadcast at normal zoom.
2. **Broadcast enhanced:** Larger pip bars with type-color coding and current/max labels. Toggled by production hotkey.
3. **Focus view:** When a caster selects a specific unit, a large context bar appears in a dedicated panel — showing each slot's content type icon, source, and age. For detailed analysis moments.

**Minute 1:00 — Designing the "Context Dashboard" Overlay**
Kofi sketches a panel that sits at the bottom of the broadcast screen — a horizontal strip showing both players' armies. Each unit is represented by its icon (eye for scout, antenna for relay, sword for striker) with a small context bar beneath. Units are grouped by player (left = Player 1, right = Player 2). This gives the viewer an at-a-glance comparison of both armies' cognitive health.

Below each unit icon, the context bar shows fill percentage as both a colored bar and a numeric label. A unit at 5/6 shows a mostly-filled amber bar with "5/6" in tiny text. A stunned unit shows a red bar with a lightning bolt icon replacing the number.

**Minute 2:00 — The "Stun Predictor" Feature**
Kofi's most innovative idea: a predictive overlay that highlights units likely to stun in the next 1-3 ticks based on current signal traffic rates. The overlay shows a thin pulsing border around units whose context bars are projected to hit full. This gives casters advance warning to narrate the incoming crisis.

"Watch this relay — the stun predictor is flashing. If Blue pushes one more signal burst, that relay goes down and the entire chain with it."

The predictor uses simple math: current fill + incoming signals per tick (visible from active channels) vs. remaining capacity minus eviction/compress rates. It is a reading aid, not a cheat — all the information is already visible, just synthesized.

**Minute 3:00 — Audio Mixing for Broadcast**
Kofi notes that the game's audio design must support broadcast mixing. The context-related sounds — ambient hum of overloaded units, stun crackle, compress chime — need to be on a separate audio channel from combat sounds and music. This lets the production team mix context audio higher during tense moments and lower during calm phases.

He also designs a "context alarm" — a rising electronic tone that plays when any unit enters the 90%+ fill range. Subtle in-game, but mixable to be prominent in broadcast. The alarm's pitch rises with fill percentage, creating an audible tension ramp.

**UI Annotations:**
- **Context dashboard:** Bottom strip, full width, 80px tall. Unit icons 32x32, context bar 32x8 beneath each. Grouped by player with team color headers.
- **Stun predictor:** Thin animated border (2px, pulsing amber→red) around at-risk units. Toggle via production hotkey.
- **Focus panel:** 200x120px panel, top-left, shows selected unit's context bar at full detail. Each slot rendered as a 16x16 colored square with content type icon overlay.
- **Audio channels:** Context sounds (hum, crackle, chime, alarm) on dedicated mix bus for production control.

---

## The TikTok Clip

A 15-second sequence: camera pulls back to show the full 8x8 board. Army heatmap in the corner shows all green dots. An enemy scout formation pushes from the east. The dots start flipping — green to yellow. Then faster — yellow to orange. The ambient hum rises. Orange to red. The first stun crack. Flash. A second. Flash. A third. The heatmap is a line of pulsing red dots. Three units frozen. The enemy strikers walk into the gap. One-shot kills. The player's architecture crumbles in three ticks. Cut to black. Title card: "ROBOT UPRISING — Design their minds. Watch them break."

No HP numbers. No damage calculations. Just bars filling up, units freezing, and an architecture collapsing under cognitive load. The viewer understands the feeling without understanding the mechanics. That is the power of buffer health as spectator readability.
