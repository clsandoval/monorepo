# 4.05 — The Combo Discovery Moment: How the UI Celebrates Emergent Interactions

## The Question

The core promise of Robot Uprising is emergent behavior — you wire agents individually, and something you didn't explicitly program happens when they interact. A scout's hook triggers a relay's compression, which forwards to a striker whose rules prioritize that signal, producing a flanking maneuver nobody designed. **This is the magic moment.** The question is: does the game know it happened? Does the UI celebrate? And if so, how — without breaking the sealed watch's no-tools covenant or patronizing the veteran who already sees the chain?

The tension is delicate. Too much celebration → the game tells you what's interesting instead of letting you discover it. Too little → players miss their own genius. The sweet spot: the game provides *visceral sensory feedback* that something unusual happened, without explaining *what* or *why*. The Inspector is for understanding. The sealed watch is for feeling.

---

## The "Dopamine Ladder" Problem

Most games that celebrate combos use escalating numerical feedback. Balatro's scoring chain is the purest example: chips flip, numbers jump, the multiplier grows, fire erupts from the scoring display, screen shake intensifies, and the audio pitch synchronizes with the rising score — all creating what designer analysis calls "an extremely efficient sensory stimulation package." The frequency of jumping numbers synchronizes with the pitch of background audio, creating audiovisual dual-channel synergy that massively amplifies satisfaction.

Robot Uprising **can't do this.** There's no score. There's no multiplier. The sealed watch has no numbers at all in the Fishbowl variant. The combo payoff isn't a bigger number — it's a *behavior that surprises the player*. The flanking maneuver isn't +500 points. It's "holy shit, my robots just did *that*?"

This means the celebration system must reward **complexity of emergent behavior** rather than **magnitude of numerical output**. The game needs to detect when something interesting happened and provide feedback that says "that was unusual" without saying "that was good."

---

## Approach A: "The Resonance Cascade" — Signal Chain Visual Amplification

### The Mechanic

During the sealed watch, signal chains are already visible as colored dashed lines between units. The Resonance Cascade approach amplifies the visual feedback when a signal passes through **3 or more nodes in a single chain** within a short tick window. The longer the chain, the more dramatic the visual.

**Escalation tiers:**
- **2-node chain** (scout→striker): Normal dashed line, single color, standard brightness. This is baseline.
- **3-node chain** (scout→relay→striker): The dashed lines thicken by 1px. The color shifts from the channel's base hue toward white at the terminus. A faint particle trail follows the signal path — tiny dots traveling along the dash line like electricity through a wire.
- **4-node chain** (scout→relay→relay→striker): Lines thicken to 3px. The particle trail becomes continuous. A gentle screen pulse (entire screen brightens by 5% for 100ms) when the chain completes. The final receiving unit's tile gets a brief radial shimmer — concentric rings expanding outward from the unit, like a stone dropped in water, in the signal's color.
- **5+ node chain**: Full resonance cascade. The signal path renders as a solid glowing line (not dashed) for 600ms. Every unit in the chain gets a brief halo. A subtle low-frequency audio thrum (pitched to the chain length — longer = deeper). Screen shake: 1px for 150ms. The board itself seems to respond to the chain — adjacent unoccupied tiles flicker in the chain's color, as if the signal's electromagnetic wake disturbed the local grid.

**Why it works:** The player didn't need the game to tell them "that was a 5-node signal chain." They SAW the glowing line trace from corner to corner of the board. They FELT the screen shake. They HEARD the thrum. The visceral feedback maps to chain length, which maps to architectural complexity, which maps to "you built something impressive." But the game never said "combo discovered!" — it just made the thing you built *feel powerful.*

### Sensory Description

Tick 14. The scout at A2 spots three enemies clustered at D5-E6. Its hook fires: a cyan dashed line shoots from A2 toward the relay at C4. The line thickens — 2px, not the usual 1px — because the relay is going to forward this. The relay's `compress` skill fires: the signal contracts (a brief visual where the cyan line segment near the relay shrinks and brightens, like squeezing toothpaste). A new line — now amber (relay's output color) — extends from C4 to the command at F3. The command receives it — and the command's `reroute` fires, splitting the signal to two strikers on different flanks. Two golden lines burst from F3 simultaneously, one to G2 and one to G6.

The moment both strikers receive the signal, the entire chain path lights up — A2→C4→F3→G2 and A2→C4→F3→G6 — as solid glowing lines. The glow holds for 600ms. A low thrum vibrates through the speakers — not a note, more like a subsonic pulse, the feeling of a power grid energizing. Both strikers pivot simultaneously. The board brightens 5% for 100ms. The glow fades. The next tick, both enemies are eliminated. Two red flashes. Screen shake.

The player exhales. They didn't design a coordinated two-striker assault. They designed a compression relay and a command rerouter. The assault emerged.

### Player Journeys

#### Journey: Rina, 24, Data Engineer, Mission 6

**Context:** First time with the full factory system (Mission 5 introduced it). She's been hand-placing units through Missions 1-4 and just unlocked the production queue. She configured a scout, relay, and two strikers, connected them through channels, but hasn't used a command agent yet. Her architecture is simple: scout spots, relay compresses, strikers respond.

**Minute 0:00 — Execute**
Rina hits EXECUTE with low expectations. Her production queue is basic: scout first, relay second, two strikers. The board shows the factory at A1, enemy spawner at H8. Rice terrace terrain. She watches the factory convey her units into existence — a brief conveyor animation as each blueprint icon slides left-to-right and a unit pops onto the board.

**Minute 0:30 — The Routine**
Scout patrols the eastern edge. Ticks pass. Standard dashed-line signals between units — cyan, then amber after relay compression. Strikers respond. She's seen this in Mission 4. Normal.

**Minute 1:15 — The Moment**
Enemy wave from the northeast. The scout sends three rapid signals (ticks 18, 19, 20) — each one a separate enemy spotted. The relay compresses all three into one packet (its `compress` skill fires). The compressed signal routes to both strikers simultaneously (she'd set both to listen on the same channel). The 3-node chain — scout→relay→striker — triggers the tier-2 visual: the dashed lines thicken to 2px, a faint particle trail follows the signal path. A gentle sparkle at each striker's tile when the signal arrives.

But then something she didn't plan: Striker-1 engages the nearest enemy (distance 1), and Striker-2's rules, evaluating the same compressed data but with different context (it has stale patrol data in slots 3-5, which pushed the threat to slot 6 instead of slot 1), moves *toward* the cluster instead of the nearest enemy. The different buffer states created different tactical responses from identical blueprints. Striker-2 flanks from the south. Both strikers converge on the enemy cluster from different angles.

The signal chain glows — not a 5-node cascade, but the *branching* pattern (one signal splitting to two different destinations) triggers a tier-2+ visual: the fork point at the relay shows an expanding amber ring, the two output paths pulse in alternating brightness like a heartbeat.

**Minute 1:45 — Aftermath**
Three enemies eliminated in two ticks. The board settles. Rina realizes: same blueprint, different buffer states, different behaviors. She didn't design a pincer attack — the information architecture created one. She immediately wants to get to the Inspector to understand WHY Striker-2 flanked instead of charging.

**Minute 3:00 — Inspector**
In the Inspector, she scrubs to tick 20 and clicks Striker-2. The context window shows: slot 1 = patrol(A4, tick 5), slot 2 = patrol(B5, tick 8), slot 3 = compressed_threat(D5-E6, tick 20). The patrol data is stale but hasn't been evicted because it was marked as waypoint data. Rule evaluation: Rule 1 (IF compressed_threat AND distance > 2 THEN move_toward) matched. Rule 2 (IF enemy_in_range THEN engage) didn't match because the nearest enemy was at distance 3. The stale patrol data took buffer slots that would have been filled with closer threat data, making the distant threat the only one visible.

"The patrol noise *helped,*" she whispers. She screenshots the decision trace.

**UI Annotations:**
- Signal chain lines: 2px thick during 3-node chain, 1px otherwise
- Particle trail: small dots (2px) traveling along signal line at 200px/s, in channel color
- Fork ring: expanding ring at branch point, 30px diameter expanding to 60px, fading over 400ms
- Inspector context window: 6 horizontal slot bars, each showing content type icon + source label + age
- Decision trace: indented tree showing Rule → Condition → Context entries evaluated → Action taken

#### Journey: Marcus, 42, VP of Engineering, Mission 8

**Context:** Missions 1-7 complete. Running complex factory configurations with Command agents. His architecture: two specialized scout squads (east and west), a central relay hub (3 relays with different compression algorithms), a command agent that dynamically reroutes based on threat density, and four strikers with role-specialized rules.

**Minute 0:00 — The Deployment**
Marcus's production queue is 9 units deep. He watches the factory churn them out over 12 ticks, each unit snapping to its assigned grid position (he's memorized optimal positioning from replaying Missions 6-7). The board is dense — 9 friendly units on an 8x8 grid, plus pre-placed terrain obstacles.

**Minute 0:40 — The Orchestration**
Tick 15: West scout spots enemy cluster. Signal fires. The west relay compresses. The command agent receives compressed intel AND simultaneously receives east scout data (nothing — clear). The command's Rule 1: "IF west_threat > east_threat THEN reroute strikers-3,4 to west_channel." Fires. Two strikers pivot.

Here's where the cascade begins. The reroute signal triggers hooks on Strikers 3 and 4. Each striker, upon receiving a reroute, fires its own hook: "announce_position" on the "logistics" channel. The relay hub hears these announcements and fires its own hook: "formation_update" on "command_awareness." The command receives the formation update — now it knows where all four strikers are positioned — and its Rule 3 fires: "IF formation_spread > 4 tiles THEN prioritize compressed_west."

This is a **7-node chain**: West Scout → West Relay → Command → Striker 3 → Relay Hub → Command (again, as listener) → Striker 4 (final reroute). The full resonance cascade triggers. The signal path lights up across the entire board — a golden river from the western edge through the central hub to the eastern deployment zone. Every unit in the chain gets a halo. The low thrum resonates. The board brightens. Adjacent tiles flicker gold.

Marcus's face splits into a grin. He didn't program a military logistics chain. He programmed a feedback loop — the command monitors the formation it just altered — and the result is a self-correcting deployment. When Striker 3 moved too far west, the relay noticed, told the command, and the command adjusted Striker 4's approach angle to compensate.

**Minute 2:00 — The Kill**
Both strikers converge. Four enemies eliminated in three ticks. The cascade visual has faded but the memory of that golden river across the board lingers. Marcus knows what he'll see in the Inspector: the feedback loop's second pass through the command created the correction. But for now, in the sealed watch, he just felt the system work.

**Minute 4:30 — Inspector**
He finds the loop. Command at tick 15 → reroute → position announcements at tick 16 → relay forward at tick 17 → command re-evaluates at tick 18 → adjusted reroute at tick 19. A 5-tick feedback cycle. The signal genealogy graph shows it as a loop — a literal cycle in the directed graph. The genealogy's cycle indicator pulses gently, flagging: "closed-loop feedback detected."

He screenshots it. This is the equivalent of discovering his CI pipeline auto-rolls back deployments. He built infrastructure, not a plan.

**UI Annotations:**
- 7-node cascade: solid glowing golden line tracing the full path, held 600ms
- Unit halos: 8px radial glow around each unit in chain, in chain color, pulsing once
- Subsonic thrum: 60Hz sine wave at -20dB, duration matched to chain length (7 nodes × 100ms = 700ms fade)
- Board brightening: 5% brightness increase, 100ms duration, smooth falloff
- Adjacent tile flicker: tiles touching the chain path flicker in chain color at 50% opacity, 200ms random offset per tile
- Signal genealogy cycle indicator: pulsing teal ring around the looped subgraph, tooltip: "closed-loop feedback detected"

#### Journey: Kai, 11, plays Minecraft and Roblox, first strategy game

**Context:** Mission 3. He's learned how to set rules and wire one hook (Mission 2 tutorial). He has a scout and a striker. He just learned about the relay unit and is being asked to wire a 3-unit signal chain for the first time.

**Minute 0:00 — The Wiring**
The boot log guided him through placing a relay and connecting scout→relay→striker. He understands it conceptually: "the relay makes the message smaller so the striker can fit it." He sets the relay to listen on "scout-reports" and output on "strike-orders." Basic.

**Minute 0:45 — First 3-Node Chain**
He hits EXECUTE. The scout patrols. Tick 8: enemy spotted. Cyan line to the relay. Then — the moment the relay fires compress and sends to the striker — the line thickens. Particle dots travel along the path. The striker's tile shimmers briefly when the signal arrives.

Kai's eyes widen. "Whoa, it did the sparkle thing!" He didn't know what triggered it. But he saw: longer chain = cooler visual. He immediately associates "more connections = more sparkle." The game just taught him that architectural depth produces emergent reward, without saying a single word.

**Minute 1:30 — The Want**
After the match, he doesn't care about the Inspector much (he's 11). But he knows he wants MORE sparkle. Next mission, he'll wire longer chains specifically because the visual feedback told him "that was cool." The combo discovery system is functioning as a learning incentive — longer chains (which are architecturally better) produce more visceral feedback.

**UI Annotations:**
- First-time 3-node chain: identical visual to standard tier-2, no special "first time!" badge
- The teaching signal is implicit: thicker lines + particles = "something happened" = "I want more of that"
- No text explanation during sealed watch — the visual IS the explanation

---

## Approach B: "The Audience Reaction" — Diegetic Commentary System

### The Mechanic

Instead of amplifying signal visuals, the game provides diegetic feedback from the *units themselves*. When an emergent interaction produces an unusual outcome (defined as: a unit performing an action it hasn't performed in the previous 5 ticks, triggered by a signal that traversed 3+ nodes), the affected units display brief **reaction glyphs** — small icons that float above the unit for 500ms.

**Reaction types:**
- **⚡ Surprise**: Unit received a signal that changed its planned action (was going to patrol, received threat data, switched to engage). Lightning bolt glyph, yellow.
- **🔗 Chain**: Unit is the terminal node of a 3+ signal chain. Chain-link glyph, the chain's color.
- **🔄 Feedback**: Unit received data that includes its own previous output (a loop). Circular arrow glyph, gold.
- **💀 Kill Chain**: Unit eliminated an enemy using data from a signal chain (not direct observation). Skull with signal trail glyph, red.
- **🫨 Overload Averted**: Unit's context window reached 80%+ capacity but eviction rules successfully cleared space before stun. Relief sigh — a brief "whew" particle (tiny sweat drop icon), teal.

The glyphs are small (16×16 pixels), float upward by 8px over their 500ms duration, and fade. They don't overlay the tactical board in any meaningful way. They're *garnish*, not information. A player who ignores them loses nothing tactical. A player who notices them starts to recognize patterns — "every time I see the chain glyph, something interesting happened."

### Sensory Description

Tick 22. The striker at G4 receives a compressed signal from the relay hub. It pivots and engages an enemy it couldn't see directly — the enemy was spotted by a scout 5 tiles away, compressed by a relay, and routed through a command agent. As the striker eliminates the enemy (red tile flash, pixel debris), a tiny 💀 skull-with-trail glyph floats above the striker's head — red, rising 8 pixels over half a second, fading into nothing. It's the size of the striker's own icon. Easy to miss if you're watching the kill animation. But if you're watching the striker specifically — which you are, because you designed it — you see it. Your agent just killed something it never saw, using someone else's eyes. The game acknowledged it with a whisper, not a shout.

### Strengths
- **Discoverable, not imposed.** New players may not notice glyphs for several missions. When they do, it's a mini-revelation: "wait, what was that little icon?"
- **Diegetic.** The units seem to *react* to their own behavior, reinforcing the AI-entity fantasy. The surprise glyph makes the unit feel alive — it didn't expect to change course either.
- **Lightweight.** 16px floating icons don't clutter the Fishbowl's minimal aesthetic. They're garnish.
- **Inspector bridge.** Glyphs give players a reason to inspect specific ticks — "I saw the chain glyph on Striker-2 at tick 22, let me check what happened."

### Weaknesses
- **Subtlety risk.** Glyphs may be TOO subtle. A casual player might never notice them. The resonance cascade (Approach A) is impossible to miss.
- **Icon literacy.** ⚡ vs 🔗 vs 🔄 requires learning a visual vocabulary. Some players will never bother.
- **Anthropomorphization tension.** The locked design spec uses 👁📡⚔🤖 as unit icons but the game's tone is AI engineering, not character. Reaction glyphs push toward character. This might conflict with the War Room/Clockwork configurations.

---

## Approach C: "The Heartbeat" — Audio-Only Feedback

### The Mechanic

No visual additions to the sealed watch at all. Instead, the game's audio design carries all combo feedback. The kulintang audio system (locked: agung tick clock as heartbeat) gains additional instruments that layer based on signal chain complexity.

**Audio escalation:**
- **Baseline (tick clock):** Deep agung strike every tick. This is always present.
- **2-node signal:** A single kulintang note (high-pitched metallic chime) on the tick the signal delivers. Pitch mapped to channel color.
- **3-node chain:** The kulintang note harmonizes — a second note plays 200ms after the first, creating a musical interval. Major third = scout→relay→striker. Perfect fifth = scout→command→striker. The interval tells the trained ear what kind of chain fired.
- **4-node chain:** Three-note arpeggio. Rising pitch = offensive chain (ends in combat). Falling pitch = defensive chain (ends in evade/reposition). The arpeggios compose a melody across ticks — if a player's architecture consistently fires 4-node chains, the sealed watch becomes *musical*.
- **5+ node chain:** Full gamelan flourish. A burst of kulintang, babendil, and agung in a 1-second crescendo. Unmistakable. The player's room fills with sound. This is the equivalent of Balatro's fire eruption — but instead of visual spectacle, it's an audio event that makes the player's body respond.
- **Feedback loop detected:** A subtle oscillating tone — the audio equivalent of a feedback whine, but pleasant. A gentle sine wave that rises and falls, suggesting a system cycling. Distinctive enough that a veteran hears "closed loop" instantly.

### Sensory Description

Tick 14. The agung strikes — BONG. One second of silence. Then: *ting* — a kulintang chime as the scout's signal reaches the relay. *Ting-ting* — two notes in quick succession as the relay compresses and forwards. *Ting-ting-ting* — three notes rising as the signal reaches the command and forks. Then the full flourish: five kulintang hits cascade with a babendil shimmer underneath, the agung adds a bass accent, and the combined sound fills the room like a wind chime caught in a sudden gust. The player's cat looks up from the couch. Something just happened. The player doesn't know exactly what — the board shows units moving, signals firing, an enemy eliminated — but the *sound* told them it was complex. It was a 6-node chain. Their architecture sang.

### Strengths
- **Preserves visual purity.** The Fishbowl aesthetic is untouched. No extra glyphs, no thicker lines, no halos.
- **Creates the "my game sounds different from yours" moment.** Two players with different architectures produce different music during the sealed watch. Streaming this makes every player's battle unique-sounding.
- **Culturally specific.** The kulintang ensemble is locked SE Asian cyberpunk aesthetic. Combo audio deepens cultural identity.
- **Teaches without words.** Rising arpeggio = offensive. Falling = defensive. Musical intervals = chain types. Over time, the player develops audio fluency — they *hear* what their architecture is doing without watching the board.

### Weaknesses
- **Accessibility.** Deaf or hard-of-hearing players get zero combo feedback. Must be paired with at least one visual approach.
- **Cognitive load.** Players are already watching the board, tracking units, reading signals. Adding a dense audio layer might cause sensory overload rather than celebrate combos.
- **Learning curve.** The musical vocabulary (intervals, arpeggios, flourishes) is rich but requires exposure. Many sessions before players "read" the audio.

---

## Approach D: "The Combo Archive" — Post-Hoc Discovery in the Inspector

### The Mechanic

The sealed watch provides **zero combo feedback**. No thicker lines, no glyphs, no extra audio. The watch is raw: you see what happens, you feel what happens, and you don't know what was interesting until the Inspector tells you.

In the Inspector, a new panel appears: **"Emergent Interactions"** — a list of detected combos from the match, each tagged with:
- Chain length and participants
- Whether this interaction has occurred in previous matches (new vs. recurring)
- A "novelty score" (how unlike the player's previous match patterns this interaction is)
- A "first discovery!" badge for interaction types the player has never seen

The panel is collapsible. Veterans who don't need it collapse it. New players discover it naturally during the guided debrief (if playing in Greenhouse mode).

**The "Combo Codex" extension:** Each discovered combo type gets an entry in the Blueprint Codex (the locked persistent reference). Over time, the player builds a collection of named combos — "The Pincer" (two strikers converging from branched signal), "The Echo Chamber" (feedback loop amplifying a signal), "The Long Arm" (5+ node chain producing a kill). These named combos are earned through play, not purchased. The Codex shows: combo name, chain diagram, first discovery date, frequency per mission.

### Sensory Description

The sealed watch ends. The Inspector opens. The timeline scrubber appears. But before the player starts scrubbing, a new panel slides in from the right edge — a clean list with a header: **"Emergent Patterns Detected."**

```
🔗 NEW: "The Long Relay" — 5-node chain (Scout-1 → Relay-A → Relay-B → Command → Striker-2)
   Tick 14-18. Signal traversed 5 nodes in 4 ticks. Terminal action: engage at G4.
   First time this chain length detected in your match history.
   [Scrub to Tick 14 →]

🔄 RECURRING: "Feedback Correction" — Command self-loop via Relay Hub
   Tick 15-19. Detected 3 times this match (also at ticks 28, 41).
   This pattern appeared in Missions 6 and 7 as well.
   [Scrub to Tick 15 →]

⚡ NEW: "Buffer Divergence" — Same blueprint, different actions from buffer state variation
   Tick 20. Striker-1 and Striker-2 received identical signals but took different actions.
   Cause: Striker-2 had stale patrol data in slots 3-5.
   [Scrub to Tick 20 →]
```

Each entry is clickable. Clicking "Scrub to Tick 14" jumps the timeline to that tick and highlights the relevant units. The player doesn't have to find the interesting moments themselves — the game curates them.

### Player Journeys

#### Journey: Priya, 28, UX Designer, Mission 5

**Context:** Just unlocked the factory. First time building blueprints rather than hand-configuring pre-placed units. She's experimental — tries weird configurations to see what happens. Her current setup: a scout with maximum perception and no hooks (oops), a relay listening on a channel nobody broadcasts to (oops), and a striker with rules but no signal input (oops again). She's going to learn from failure.

**Minute 0:00 — The Broken Watch**
She hits EXECUTE. The factory produces units. The scout patrols and sees enemies — but has no hooks, so no signals fire. No dashed lines appear. The relay sits idle — its context bar stays cool blue and empty. The striker patrols aimlessly using its default rule (no signals to override patrol). Enemies approach. The striker encounters one by chance, eliminates it (red flash). But two more enemies reach the base from the undefended north. Base takes damage.

The sealed watch is quiet. No signal lines at all. No kulintang chimes beyond the tick clock. Just the agung metronome and silent robots walking past each other. The absence of combo feedback IS the feedback — the watch is eerily empty compared to the tutorials where pre-configured units filled the air with signal chains.

**Minute 2:00 — The Inspector Revelation**
The Inspector opens. The Emergent Patterns panel slides in. It shows:

```
📭 NO EMERGENT PATTERNS DETECTED
   No signal chains, feedback loops, or buffer-state divergences observed.
   Tip: Signal chains require hooks. Check your scout's hook configuration.
```

One line. No combos to celebrate because no architecture exists to produce them. But the "Tip" line — subtle, not highlighted, small grey text — tells her exactly what went wrong. Not a tutorial popup. Not a highlighted error. Just a quiet observation in the post-mortem.

**Minute 2:30 — The Fix**
She goes back to the workbench. Adds a hook to the scout: ON_ENEMY_SPOTTED → "threats." Sets the relay to listen on "threats." Sets the striker to listen on the relay's output channel. Three changes. She hits EXECUTE again.

**Minute 3:30 — The First Chain**
This time, the sealed watch SINGS. The scout spots an enemy — cyan line to relay. Relay compresses — amber line to striker. The 3-node chain triggers the visual escalation (if Approach A is used). The striker pivots and engages. Kill.

After the watch, the Emergent Patterns panel shows:

```
🔗 NEW: "First Signal Chain" — 3-node chain (Scout-1 → Relay-A → Striker-1)
   Tick 8-10. Signal traversed 3 nodes in 2 ticks.
   🎉 FIRST COMBO DISCOVERED! Added to your Blueprint Codex.
```

The 🎉 only appears once — the very first time the player's architecture produces an emergent chain. After that, new combos get the calmer "NEW" badge. But this first one? This is the moment Priya understands what the game is about. She didn't program a kill. She programmed an information pipeline, and the kill was a consequence.

**UI Annotations:**
- Emergent Patterns panel: right sidebar, 320px wide, slides in over 300ms after Inspector opens
- Empty state: grey text, single tip line, no alarm colors
- First combo badge: 🎉 emoji + gold border on the entry, pulses once
- "Scrub to Tick N" link: teal underlined text, clicking it advances timeline and highlights units
- Codex entry creation: brief toast notification at bottom: "New Codex entry: First Signal Chain"

#### Journey: Viktor, 55, retired military strategist, Mission 9

**Context:** Deep into the factory-vs-factory endgame. His architecture is a complex hierarchy: 3 scout squads, 2 relay hubs, 1 command agent, 5 strikers. He's meticulous — every hook, every rule is there for a reason.

**Minute 0:00 — The Grand Battle**
He hits EXECUTE on what he considers his masterwork architecture. 12 units on the board. The sealed watch is dense — signal lines crisscrossing the board, multiple chains firing per tick, the kulintang creating a continuous musical texture.

**Minute 3:00 — Inspector**
The Emergent Patterns panel shows 14 entries. He scrolls. Most are RECURRING — chains and feedback loops he's seen before. But one entry catches his eye:

```
⚡ NEW: "The Dead Drop" — Relay-B forwarded stale data that Striker-4 treated as fresh
   Tick 34. Relay-B's compress output included an enemy position from tick 28 (6 ticks stale).
   Striker-4 engaged the now-empty tile. Wasted action.
   [Scrub to Tick 34 →]
```

This is an ANTI-combo — an emergent interaction that produced a bad outcome. The system detected it because it was novel (he'd never had a stale-data-induced misfire before). He scrubs to tick 34 and finds the cause: Relay-B's eviction policy kept the old data because it was tagged as high-priority, and the compress skill didn't check freshness.

The combo archive didn't just celebrate his wins — it surfaced his bugs. The same system that shows "The Long Relay" as a triumph shows "The Dead Drop" as a diagnostic finding. Positive and negative emergent interactions treated equally.

**UI Annotations:**
- Anti-combo entries: same visual treatment as combos but with amber left border instead of teal
- No judgment text ("bad combo!") — just factual description of what happened
- Stale data highlighted in the decision trace: slot content shows age in ticks, red text if > 3 ticks old

---

## Interaction Effects

**× Sealed Watch (4.02):** Approaches A (visual cascade) and C (audio heartbeat) add information to the sealed watch, potentially conflicting with the "no tools" covenant. The question: are visceral feedback effects "tools"? They don't provide actionable information (you can't change anything during the watch). They provide *emotional* information. The covenant's spirit is "no analysis during execution." Sensory feedback serves emotion, not analysis. Verdict: A and C are compatible with the sealed watch covenant.

**× Inspector (4.03):** Approach D (post-hoc archive) adds a new panel to the Inspector. It should integrate with the existing decision trace — clicking a combo entry should highlight the relevant units AND their decision traces simultaneously. The archive is a *layer* on the Inspector, not a separate tool.

**× Boot Log Tutorial (locked):** The boot log should introduce combo feedback diegetically. "SUBSYSTEM INITIALIZED: Emergent Pattern Detection. Note: complex signal architectures produce detectable resonance signatures. You will feel them." This frames the visual/audio feedback as part of the AI's sensory apparatus, not as gamification.

**× Buffer Visualization (4.01/4.07):** Combo chains that cause buffer overload create a dramatic collision — the resonance cascade's celebration glow *directly followed by* the overload stun's jitter and lightning particles. The emotional arc of "beautiful chain → oh no, it broke the recipient" is a powerful teaching moment about context window management.

**× Multiplayer/Streaming:** The resonance cascade (A) and audio heartbeat (C) create shareable moments. A 7-node cascade with the full gamelan flourish is a clip. The combo archive (D) creates post-match discussion: "look at the combos my architecture produced." Different approaches serve different sharing contexts.

## Comparable Games

- **Balatro:** Screen shake, jumping numbers, fire effects, audiovisual synchronization. Pure numerical escalation. Robot Uprising can't copy the formula (no numbers) but can copy the principle: the celebration should scale with complexity.
- **Opus Magnum:** The "running machine" satisfaction. No explicit celebration — the beauty IS watching it work. The Fishbowl approach is closest to this.
- **Noita:** Emergent physics interactions produce unexpected outcomes with no explicit celebration. The player's surprise IS the reward. But Noita's lack of post-hoc explanation makes learning hard. Robot Uprising's Inspector solves this.
- **Into the Breach:** No combos to celebrate — every outcome is player-chosen. But the "checkmark" when all buildings survive is a micro-celebration that validates the plan. Robot Uprising needs an equivalent for validating the architecture.
- **Marvel Snap:** Card combo animations escalate with synergy. Location + card + card interactions produce visual flourishes that teach synergy through spectacle. Closest to Approach A's visual escalation.

## Recommended Hybrid: A + C + D

The strongest design uses **all three non-conflicting approaches simultaneously**:
- **Visual cascade (A)** for visceral real-time feedback during the sealed watch
- **Audio heartbeat (C)** for atmospheric depth and cultural texture
- **Combo archive (D)** for analytical post-hoc discovery in the Inspector

Approach B (reaction glyphs) is the weakest — it's neither visceral enough for the watch nor analytical enough for the Inspector. It sits in an awkward middle ground. The recommended hybrid gives the watch its emotional payload (cascade + music) and the Inspector its intellectual payload (archive + codex).

---

## The TikTok Clip

A 15-second clip of the resonance cascade: the camera follows a signal from a scout at the board's edge, through two relays, to a command agent at the center, which forks it to three strikers. The signal path lights up as a golden river across the entire 8×8 board. The gamelan flourish fills the audio. Three simultaneous kills flash red. Screen shake. The golden glow fades. Caption: "I didn't program that. My robots figured it out."

The clip works because the visual is self-explanatory: signal traveled far, then something exploded. No game knowledge required to understand "that was cool." The audio sells the drama. The caption sells the fantasy.
