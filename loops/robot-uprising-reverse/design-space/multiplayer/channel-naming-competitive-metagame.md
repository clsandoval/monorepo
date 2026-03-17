# Channel Naming as Competitive Metagame

**Aspect:** 7.01c — Common channel names are predictable (hackable), unique names are harder to intercept but harder for teammates to guess in co-op; channel obfuscation as a competitive skill; automatic channel renaming as a defensive rule.

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Design Problem

In Robot Uprising, channels are named pipes. Type a name in a hook config, the channel exists. Every listener on a channel receives every signal. In single-player, channel names are private labels — "threats" or "north-alert" or "x7" all work identically. The name is a mnemonic for the player, not a game mechanic.

In PvP, channel names become **attack surface**.

The locked EM emissions model (hook transmissions emit detectable noise) means that enemy units can sense that *a signal was sent*. But the current spec doesn't address whether enemies can read channel names, intercept signal content, or exploit naming patterns. This gap is the design space this analysis explores.

The core tension: **legibility vs. security**. A well-named channel ("scout-forward-targets") makes the player's own architecture easier to debug and iterate on. But if opponents can observe or infer channel names, that legibility becomes vulnerability — "scout-forward-targets" tells the opponent exactly what information is flowing and to whom. This is the ARMA frequency management problem, the MTG deck-naming problem, and the Screeps public-segment problem, all collapsed into one mechanic.

---

## What Can Opponents See? (Five Interception Models)

The fundamental design decision: how much information does EM emission reveal?

### Model 1: "Noise Only" — Emissions Reveal Existence, Not Content

**Mechanical spec:** When a hook fires, the transmitting unit emits a detectable EM pulse. Enemy units within detection range observe: *something was transmitted from tile (3,4) at tick 12*. That's it. No channel name, no content, no intended recipient. The emission is a binary event — noise happened, or it didn't.

**What the opponent learns:** Signal density mapping. "That relay is transmitting 4 times per tick — it's a communication hub." "That corner of the board went silent — they lost their scout." Traffic analysis without content analysis. The NSA's "metadata, not data" model.

**Strategic naming implication:** Channel names are irrelevant to opponents. "threats" and "x7q9k" function identically. The player can name channels for maximum personal clarity with zero security cost.

**Strengths:** Simplest model. EM detection is already interesting (finding relays, mapping communication topology) without adding an interception mini-game. Keeps the game focused on architecture, not cryptography.

**Weaknesses:** No naming metagame. This analysis is moot — channels are just labels. No reason to ever obfuscate. The "information warfare" dimension stays shallow — you can detect activity but never understand it.

**Comparable:** Radio direction-finding in WWII — locating transmitters by triangulating their emissions without cracking the encrypted content. ARMA's basic signal detection (prolonged transmission reveals position, but not frequency or content).

---

### Model 2: "Channel Exposed" — Emissions Reveal Channel Name

**Mechanical spec:** When a hook fires, the emission event includes the channel name as metadata. Enemy Specialists with the `extract` skill (or Scouts with an upgraded perception hook) within detection range can read: *transmission on channel "scout-forward-targets" from tile (3,4) at tick 12*. Content remains opaque. The name is the only leaked information.

**What the opponent learns:** The communication taxonomy. "They have a channel called 'scout-forward-targets' — so they're running a scout-to-striker pipeline with a targeting relay." "Their channels are named 'a', 'b', 'c' — either they're obfuscating, or they're lazy." "They have 7 distinct channel names — that's a complex architecture with lots of inter-agent wiring."

**This is where the naming metagame ignites.**

**The Predictability Problem:** If community conventions emerge (and they will — see the co-op analysis in 7.02a where "scout-report," "relay-forward," and "striker-target" arise spontaneously), then channel names become readable strategic shorthand. An opponent who sees "relay-compress-fwd" knows exactly what information architecture they're facing: a relay compressing and forwarding scout data. They can predict the signal chain, estimate latency, and design counter-architectures before a single combat exchange.

This is the StarCraft build-order read. In StarCraft, seeing a supply depot at a specific timing tells you the entire next 3 minutes of the opponent's plan. In Robot Uprising, seeing channel names tells you the entire information architecture.

**The Obfuscation Response:** Players who understand the risk start naming channels opaquely. "a1", "zz", "🔴", random strings. This defeats channel-name reads but creates a personal debugging cost — your own Inspector shows "transmission on channel k8x → ..." and you've lost the mnemonic benefit.

**The Community Split:** Casual players use clear names (easier to build, easier to debug, don't care about competitive exposure). Competitive players use obfuscated names (harder to read, but deny intelligence). The community develops a vocabulary for this split: "labeled configs" vs. "stealth configs." Tournament casting has to explain: "We can see their channel names in spectator mode — 'relay-hub' and 'flanker-go' — but their opponent only sees the EM pulses..."

**Strengths:**
- Creates a genuine information warfare dimension that's unique to this game. No other strategy game has "your communication channel names are an attack surface."
- Naturally teaches OPSEC thinking. "Why did I lose? Because they read my channel names and designed a counter." This is a *transferable* lesson — naming conventions in real systems (API endpoints, Kafka topics, Slack channels) leak organizational structure.
- Generates community content. "Here are the 10 most common channel names and what they tell you about your opponent's architecture" — strategy guide material.
- Creates a skill ceiling around information concealment vs. clarity.

**Weaknesses:**
- Punishes new players who don't know that naming matters. A beginner with channels named "my-scout-tells-striker-where-enemies-are" is broadcasting their entire strategy.
- Could feel unfair — "I lost because of what I NAMED my channel, not because of how I DESIGNED my architecture?"
- Adds cognitive load to the Plan screen. Now the player must think about both the functional design (what signals flow where) AND the operational security (what names to use).
- Channel names might not be interesting enough to intercept — if the architecture is visible through behavior (scout moves, striker follows), the name adds little intelligence.

**Sensory description:** In the Sealed Watch, an enemy Specialist pauses for one tick, antenna array extending, and a faint cyan text floats above: `[ intercept: "scout-fwd" ]`. The player watching realizes their channel name just got read. In the Inspector, the interception event shows in the enemy's context window: a slot glowing amber with the captured channel name, the source tile marked with a tiny signal-wave icon.

---

### Model 3: "Content Interception" — Specialists Can Read Signal Payloads

**Mechanical spec:** The `extract` skill on Specialists allows full signal interception — not just channel name, but signal content. When an enemy signal passes through a tile adjacent to a Specialist with `extract` active, the Specialist captures a copy: channel name + full payload (observation data, compressed summaries, whatever the signal carries). The original signal still arrives at its intended destination — interception is passive eavesdropping, not jamming.

**What the opponent learns:** Everything. The actual intelligence flowing through the opponent's network. "Their scout reported an enemy at tile (6,2) three ticks ago and the relay compressed it and forwarded it as 'priority target north.'" This is full signals intelligence.

**Naming implication:** Channel names are now the LEAST important leaked information — the content itself is exposed. Obfuscating names does nothing when the payload is readable. The metagame shifts from naming to content encryption or signal routing (avoiding enemy Specialist detection zones).

**Strengths:** Creates the richest information warfare. "I positioned my Specialist to eavesdrop on their relay network and learned their entire tactical picture." This is the EVE Online spy-in-fleet-chat experience. Maximum intelligence depth.

**Weaknesses:** Potentially overwhelming. Players already need to manage their own architecture — now they must also analyze intercepted enemy signals? The cognitive load could be crushing. Also, this model makes the Specialist's `extract` skill enormously powerful, potentially warping the meta around "always bring a Specialist for SIGINT."

**Comparable:** EVE Online's spy metagame (reading fleet chat, intel channels). Barotrauma's radio channel scanning (tune to enemy frequency, hear everything). Android: Netrunner's Runner accessing Corporation servers (full information exposure once the ICE is breached).

---

### Model 4: "Channel Frequency" — Channels Have Discoverable Numeric IDs

**Mechanical spec:** Under the hood, each channel name maps to a numeric frequency (0-255). The mapping is deterministic: `hash(channel_name) % 256`. Players see their friendly names in the workbench, but the battlefield operates on frequencies. Enemy units detect EM emissions on specific frequencies, not names. Two different channel names that hash to the same frequency create cross-talk.

**The collision mechanic:** With 256 frequencies and typical configs using 3-8 channels, collisions are rare but consequential. If your "scout-report" and the enemy's "striker-orders" hash to the same frequency, both sides detect each other's signals on that frequency — a coincidental intelligence leak. Savvy players check their frequency mappings and rename channels to avoid collisions with common names.

**Naming implication:** The metagame becomes frequency management. Community tools calculate collision risks: "Don't use 'alert' — it hashes to frequency 42, which collides with 'danger,' 'threats,' and 'warning.' Use 'notify' instead — frequency 187, no known collisions." Competitive players memorize collision-free channel name sets. The naming convention becomes a frequency allocation strategy.

**Strengths:**
- Unique mechanic. No other game has "your channel names hash to frequencies that can collide with enemy channels."
- Creates emergent intelligence without explicit interception. You don't need a Specialist to eavesdrop — collision happens automatically.
- Frequency collision as a designed accident creates surprising moments in the Sealed Watch. "Why is my Striker acting on enemy data?" → Inspector reveals: hash collision.
- Community-generated frequency tables become a competitive resource.

**Weaknesses:**
- Deeply unintuitive. Players must understand hash functions to play competitively. The gap between "I typed a name" and "that name maps to a number that might collide" is a huge cognitive leap.
- Could feel arbitrary and unfun. "I lost because my channel name hashed to the same number as my opponent's" is a frustrating loss condition.
- Debugging hash collisions in the Inspector requires understanding a system that's invisible during the Plan screen.

**Comparable:** Real radio frequency allocation (the FCC assigns frequencies to avoid interference, but unlicensed bands like 2.4GHz are a free-for-all with collisions). ARMA's TFAR frequency system (units on the same frequency hear each other, deliberate or accidental).

---

### Model 5: "Encrypted Channels" — Encryption as a Configurable Skill

**Mechanical spec:** Channels are plaintext by default (Model 2 exposure). But the Relay unit has an `encrypt` variant of the `compress` skill. Encrypted signals appear to enemy interceptors as: *transmission on channel [ENCRYPTED] from tile (3,4) at tick 12*. No channel name, no content. The cost: encrypted signals take 2 ticks per hop instead of 1 (encryption overhead doubles latency).

**The encryption tradeoff:** Security vs. speed. An encrypted relay chain (Scout → Relay → Striker) takes 6 ticks instead of 4. In a game where one tick of stun can be fatal, 2 extra ticks of latency per hop is enormous. The player must decide: which channels carry sensitive information worth encrypting, and which can be left in plaintext for speed?

**Naming implication:** Unencrypted channels still expose names (Model 2). The metagame becomes: which channels do you encrypt? Encrypting "scout-report" tells the opponent "this channel carries something worth hiding" — the *act of encrypting* leaks strategic priority even if the content is hidden. This is the metadata problem: encrypted traffic is itself a signal.

**Strengths:**
- Elegant tradeoff. Speed vs. security is a real engineering decision that transfers directly to professional practice (TLS overhead, VPN latency, secure vs. plaintext protocols).
- Creates build diversity. "Stealth builds" (everything encrypted, slow but invisible) vs. "speed builds" (everything plaintext, fast but readable) vs. "selective encryption" (encrypt command channels, leave scout channels in plaintext).
- The act-of-encrypting-as-signal is a genuinely sophisticated game design insight. Players learn that security measures themselves communicate information.
- Interactions with buffer management: encrypted signals arrive later, meaning the recipient's buffer has more time to fill with other data before the encrypted signal arrives.

**Weaknesses:**
- Adds complexity to an already complex system. Players must now think about encryption per-channel on top of routing, compression, filtering, and eviction.
- The latency penalty must be precisely tuned. Too small and everyone encrypts everything. Too large and nobody encrypts anything. The sweet spot is narrow.
- Tutorial burden: explaining why signals are slow requires explaining encryption, which requires explaining interception, which requires explaining EM emissions.

**Comparable:** TLS/HTTPS in web development (the overhead is real but accepted as necessary). ARMA's TFAR encryption (available but costs setup time and can fail). The general principle from applied cryptography: "encryption is not free."

---

## The Recommended Model: "Layered Intelligence" (Model 2 + Model 5 Hybrid)

The richest design space comes from combining Channel Exposed (Model 2) as the default with Encrypted Channels (Model 5) as an opt-in defense. This creates the full naming metagame:

1. **Base layer:** EM emissions reveal channel names. Naming matters.
2. **Defense layer:** Relay `encrypt` skill hides names and content at a latency cost.
3. **Meta layer:** The pattern of what's encrypted vs. plaintext is itself intelligence.

This is the ARMA model — default channels are scannable, encrypted channels require deliberate setup and cost operational efficiency, and the decision of *what to encrypt* reveals strategic priorities.

---

## The Naming Metagame in Detail

Assuming Model 2+ (channel names are observable by opponents), here's how the metagame develops:

### Phase 1: "Naïve Naming" (Months 1-2 Post-Launch)

Players name channels descriptively. "scout-targets," "relay-forward," "striker-engage," "command-orders." The community hasn't yet realized names are strategically relevant. Strategy guides don't mention naming. Everyone's architecture is an open book.

**What games look like:** PvP matches are transparent. Both players' architectures are readable from EM interception. Counter-play is straightforward: "They have a channel called 'flanker-left' — so they're trying to flank left. Stack defense left." The game feels like both players are playing with their hands face-up.

### Phase 2: "The Naming Realization" (Months 2-4)

A community post — probably from a high-Elo player — explains: "Your channel names are leaking your strategy." The post includes screenshots from Inspector mode showing intercepted channel names and how they were used to design a counter-architecture. The community calls this "The Naming Post" and it becomes foundational.

**The immediate response:** Players start obfuscating. "a," "b," "c." Random strings. Emoji sequences. The pendulum swings to maximum opacity. Debugging becomes harder. Win rates for obfuscators don't noticeably improve because most opponents aren't reading channel names anyway.

### Phase 3: "The Codebook Era" (Months 4-8)

Players develop personal codebooks — private naming systems that are opaque to opponents but meaningful to themselves. Not random strings (too hard to remember) but encoded names that require a key to decode:

- **Numeric codes:** "ch-1" through "ch-8" with a personal legend. Opponents can see there are 8 channels but can't infer purpose.
- **Themed names:** One player names all channels after Philippine dishes ("adobo," "sinigang," "kare-kare," "lechon"). Thematic but non-functional — an opponent seeing "sinigang" gains no tactical intelligence.
- **Misdirection names:** "fake-flank-left" — is it a fake? Or did they name it "fake" to make you think it's a fake, when it's actually real? The naming becomes a bluffing layer.
- **Color codes:** "red," "blue," "green," "amber." Short, fast to type, mnemonic for the player (red = danger, blue = info), but generic enough that opponents can't decode the mapping.

**What the community produces:** "Channel Naming Guides" become a content genre. Some advocate full randomization. Others argue for thematic naming. A debate emerges: "Is misdirection naming worth the cognitive overhead?" Top streamers start explaining their naming philosophies mid-broadcast. Casters in tournaments add channel-name interception as a commentary element: "And we can see in the emission overlay — the challenger is running channels named 'a' through 'e,' completely opaque, while the champion is using 'perimeter,' 'core,' 'strike' — they're not bothering to hide."

### Phase 4: "Automated Obfuscation" (Months 8+)

The feature request arrives: "Can we have auto-randomize channel names at deploy?" Players want the clarity of descriptive names during design (in Plan screen) but the opacity of random names in battle.

**Design option:** The Plan screen shows player-chosen names ("scout-report," "relay-forward"). At DEPLOY/EXECUTE, the game scrambles all channel names to random strings. The mapping is stored locally so the player's Inspector still shows friendly names, but enemy interception only captures scrambled names.

This is **automatic channel renaming as a defensive rule** — the aspect description's own suggestion. It raises the question: should the game solve the naming problem for players, or should naming remain a player skill?

---

## Six Naming Strategies (Competitive Taxonomy)

### Strategy A: "The Transparent" — Descriptive Names, No Obfuscation

**Who uses it:** New players, casual players, players who don't care about competitive exposure, players who prioritize debugging speed.

**Channel examples:** `scout-report`, `relay-forward`, `striker-engage`, `command-reassign`

**Risk profile:** Maximum intelligence leakage. Opponents who intercept know everything.

**When it wins:** Against opponents who don't have Specialists or don't bother intercepting. In lower Elo brackets where interception isn't part of the meta. In campaign mode where it's always optimal.

**Comparable:** MTG players who announce their deck archetype in pre-game chat. StarCraft players who don't deny scouting.

### Strategy B: "The Codebook" — Themed but Non-Functional Names

**Who uses it:** Intermediate players, streamers (thematic names are entertaining), players who want mild obfuscation without losing mnemonics.

**Channel examples:** `adobo`, `sinigang`, `lechon`, `lumpia`, `halo-halo`

**Risk profile:** Channel names don't reveal purpose, but the NUMBER of channels, their connection topology, and signal volume on each still provide intelligence.

**When it wins:** Against opponents who rely on name-reading as their primary intelligence source. Fails against opponents who analyze signal patterns regardless of naming.

**Comparable:** MTG branded deck names ("Trix," "Fruity Pebbles") — culturally rich, tactically opaque.

### Strategy C: "The Minimalist" — Single-Character Names

**Who uses it:** Competitive players who want fast typing and minimal leakage.

**Channel examples:** `a`, `b`, `c`, `d`, `e`

**Risk profile:** Zero semantic leakage from names. But alphabetical ordering might reveal creation order (and therefore design priority). A player whose most-trafficked channel is "a" probably created their primary communication pipeline first.

**When it wins:** Against name-readers. Doesn't help against traffic analysis.

### Strategy D: "The Misdirector" — Deliberately Misleading Names

**Who uses it:** Advanced players who understand the meta enough to exploit it.

**Channel examples:** `flanker-left` (actually commands a right-side push), `retreat-signal` (actually a commit-to-attack trigger), `scout-rear` (actually forward scout communication)

**Risk profile:** If the opponent reads and believes the names, they counter the wrong strategy. If the opponent ignores names (because they know misdirection exists), the effort is wasted. If the opponent reads names AND accounts for possible misdirection, the mind game deepens — is "flanker-left" a real flanker-left that the player named honestly because they expected the opponent to assume misdirection?

**When it wins:** Against opponents in Phase 2-3 who read names and act on them literally. Creates spectacular blowouts when the misdirection lands.

**The Netrunner Parallel:** This is exactly Netrunner's trap-play advice: "Play your traps exactly as if they were agendas." In Robot Uprising: "Name your misdirection channels exactly as if they were real."

**Comparable:** StarCraft's fake builds (building a Spawning Pool at 12 supply to look like a rush, then canceling and going economic). EVE Online's honeypot operations (broadcasting fake fleet movements to identify spies).

### Strategy E: "The Auto-Scramble" — Use Descriptive Names, Scramble at Deploy

**Who uses it:** Players who want both clarity and security. Requires the auto-scramble feature.

**Channel examples (Plan screen):** `scout-report`, `relay-forward`, `striker-engage`
**Channel names (in battle):** `x7k2`, `m9p3`, `q1w4`

**Risk profile:** Near-zero from naming. Signal patterns and topology still visible.

**When it wins:** Always, if available. This is the dominant strategy, which is why implementing it is a design decision — does the game WANT naming to be a competitive axis?

### Strategy F: "The Frequency Farmer" — Names Chosen to Exploit Hash Collisions

**Who uses it:** Only relevant under Model 4 (frequency hashing). Deep meta players who study frequency tables.

**Channel examples:** Names chosen to hash to the same frequency as common enemy channel names, forcing cross-talk that pollutes the enemy's communication.

**Risk profile:** High complexity, high reward if it works, devastating if it backfires (your own channels get polluted too).

**When it wins:** Against players using common channel names. A meta-weapon that punishes convention.

---

## Player Journeys

### Journey: Kai, 22, Competitive Gladiabots Player

**Context:** Mission 8 completed. Kai has been playing Gauntlet PvP for two weeks, rating 1,650. Uses clean descriptive channel names because that's what the campaign taught. Just lost 3 matches in a row to a player named "EM_READER" and doesn't understand why.

**Minute 0:00 — The Post-Match Inspector**
Kai opens the Inspector after the third loss. The board shows the final state: all three of Kai's Strikers eliminated by tick 28. Far too fast. Kai clicks on the enemy Specialist — an unusual unit choice, positioned in the center of the board doing... nothing? No movement, no combat. Just sitting there with antenna extended.

The Specialist's context window at tick 8 shows entries Kai has never seen before:
```
[T8] INTERCEPT: channel "scout-forward" from (2,3)
[T8] INTERCEPT: channel "relay-compress-fwd" from (4,4)
[T8] INTERCEPT: channel "striker-engage-north" from (6,2)
```

Kai stares. Those are *his* channel names. The enemy Specialist was reading his entire communication topology.

**Minute 0:45 — The Realization**
Kai clicks through the enemy's decision trace. At tick 9, the enemy Command unit received a processed intelligence report from the Specialist: "Opponent running scout-forward pipeline. Striker engagement channel targets north. Recommended counter: stack south, exploit undefended flank." By tick 10, all enemy Strikers had repositioned south. By tick 14, they hit Kai's undefended relay. By tick 20, the chain collapsed. By tick 28, it was over.

Kai's descriptive channel names gave the opponent a complete strategic picture in 8 ticks.

**Minute 1:30 — The Redesign**
Kai returns to the Plan screen. Stares at his channel names. `scout-forward`. `relay-compress-fwd`. `striker-engage-north`. Each one a confession. He selects the first hook's channel field and types... what? He needs a name that means "scout forward observations" to himself but communicates nothing to an interceptor.

He types `ch1`. Then `ch2`. Then `ch3`. The channel map panel on the left, previously a readable diagram labeled with purpose, becomes a grid of opaque codes. Kai realizes he's lost something — the channel map was his architectural overview, and now it's illegible.

He opens a text file on his second monitor: "ch1 = scout fwd, ch2 = relay compress, ch3 = striker engage N." The external cheat sheet. The game's channel map has been replaced by a personal codebook.

**Minute 3:00 — The Next Match**
Kai deploys with obfuscated names. Watches the Sealed Watch. The enemy Specialist is there again, center board, antenna out. But this time, the interception yields: `ch1`, `ch2`, `ch3`. The enemy Command's decision trace shows uncertainty — "Channel names non-descriptive. Unable to determine signal architecture from naming alone. Defaulting to traffic analysis." The enemy plays a generic counter-strategy instead of a targeted one. Kai wins by 15 ticks.

**Minute 4:00 — The Insight**
In the debrief, Kai thinks about what just happened. He didn't change his architecture. Same units, same hooks, same rules, same channels. He only changed the *names*. And that single change — from transparent to opaque — converted three losses into a win. The game taught him that naming is security.

**UI Annotations:**
- **Channel field in hook config:** Text input, 32 char max, monospace font. When the player types, an emoji autocomplete suggests common names — suppressed in competitive mode.
- **Intercepted channel name display:** In the Inspector, intercepted names appear in a distinct amber monospace font with a `⚡ INTERCEPT:` prefix, differentiated from the unit's own channel entries (cyan).
- **Channel map panel:** In Plan screen, channels render as labeled nodes with connection lines. Descriptive names make a legible flowchart. Obfuscated names make it look like a circuit schematic with IC numbers — functional but not self-documenting.

---

### Journey: Rosa, 45, Systems Architect, First Week in Gauntlet

**Context:** Rosa finished the campaign and entered Gauntlet. She's a professional systems architect and named her channels after the actual system patterns they implement: `pub-sub-recon`, `req-resp-target`, `fanout-alert`. She thinks this is clever. It's about to backfire spectacularly.

**Minute 0:00 — The Lobby**
Rosa queues for a Gauntlet match. Rating 1,200 — starting bracket. The map loads: Cebu urban terrain, tight corridors, lots of cover. Good map for relay networks. Rosa's architecture is a three-relay mesh with pub-sub fanout, refined over 5 campaign replays.

**Minute 1:00 — The Battle**
Sealed Watch begins. Rosa watches her Scout patrol the north corridor, emitting on `pub-sub-recon`. Her relay network activates, signals flowing through `fanout-alert` to all three Strikers. Everything looks good for 15 ticks.

At tick 16, something strange. The enemy's two Specialists, which had been drifting aimlessly, suddenly converge on Rosa's central relay. They position on adjacent tiles. Rosa's relay, a stationary unit, can't evade. At tick 17, an enemy Striker advances from behind the Specialists and eliminates the relay. The central node of Rosa's mesh is gone in one move.

**Minute 2:00 — The Cascade**
Without the central relay, Rosa's fanout architecture fragments. The two remaining relays can't reach two of the three Strikers. Those Strikers, cut off from intelligence, default to their patrol rules — but without scout data, they patrol blind. The enemy picks them off one by one. By tick 35, Rosa's only surviving units are two relays with no one to relay to.

**Minute 3:00 — The Inspector Revelation**
Rosa enters the Inspector. She clicks on the enemy Specialist at tick 10. Its context window shows:
```
[T10] INTERCEPT: channel "pub-sub-recon" from (3,5)
[T10] INTERCEPT: channel "fanout-alert" from (4,4)
[T10] INTERCEPT: channel "req-resp-target" from (4,4)
```

Three channel names, all from the same tile — her central relay. The enemy's decision trace at tick 11: "Central relay at (4,4) identified as hub node via naming analysis: 'pub-sub-recon' (receives from scout), 'fanout-alert' (distributes to strikers), 'req-resp-target' (bidirectional with command). Relay is a single point of failure. Recommended: eliminate relay at (4,4)."

Rosa's professional naming conventions — the exact conventions she uses in real distributed systems — became a blueprint for her own destruction. The opponent didn't need to analyze traffic patterns. The NAMES told the entire story: what each channel does, how they connect, which node is critical.

**Minute 4:30 — The Professional Lesson**
Rosa leans back. In her day job, she names Kafka topics descriptively (`user-events`, `order-processing`, `payment-completed`) because her team needs to understand the system. She's never thought about whether those names would help an attacker. But they would — any attacker who could list her Kafka topics would understand her entire service architecture.

She opens the Plan screen and renames her channels: `net-a`, `net-b`, `net-c`. Then pauses. The channel map panel still shows the topology — three lines converging on one node. Even with opaque names, the *shape* reveals the single point of failure. She needs to redesign the architecture, not just rename the channels.

This is the moment the game teaches the lesson that naming obfuscation is the *first* layer of security, not the only one.

**UI Annotations:**
- **Naming analysis in enemy AI decision trace:** Displayed as a structured block with parsed channel names highlighted in cyan, connected by arrows to inferred topology. The AI's reasoning is legible: `"pub-sub-recon" → receives FROM scout → relay is downstream of scout`. This makes the interception feel analytical, not magical.
- **Channel topology visualization in Inspector:** After interception, the enemy's "mental model" of Rosa's architecture appears as a ghost overlay on the board — dotted lines showing inferred connections, with the intercepted relay highlighted as a bullseye target. The enemy built a map from her names.

---

### Journey: Marco, 16, First Strategy Game, Channel Naming Discovery

**Context:** Mission 6 — first factory mission. Marco has never played PvP yet. He's just learned hooks and channels in missions 3-4. His channel names are the tutorial defaults: "channel-1," "channel-2," "channel-3." He's about to discover that naming is a design choice, not just a label.

**Minute 0:00 — The Factory Screen**
Marco opens the Plan screen for Mission 6. Three blueprint slots. His Scout blueprint has a hook: "When enemy spotted → emit on channel-1." His Relay blueprint listens on channel-1 and emits on channel-2. His Striker listens on channel-2. A basic pipeline. The tutorial taught this chain.

The channel map panel shows: `channel-1: Scout → Relay` and `channel-2: Relay → Striker`. Simple.

**Minute 0:30 — The Problem**
Marco adds a second Scout blueprint. It also has "emit on channel-1." Both Scouts now share a channel. The Relay receives signals from both. But the Relay's compress skill has a rule: "When channel-1 has 2+ entries, compress to most recent." This means if both Scouts spot enemies simultaneously, one report gets evicted. Marco's buffer fills up and the Relay compresses away the flanking enemy.

In the Sealed Watch, the ignored flank costs him his base.

**Minute 1:30 — The Naming Fix**
In the Inspector, Marco sees the buffer collision. Two scout reports competing for the same channel. The decision trace shows the compress rule discarding the older report — which happened to be the more important one (the flank).

Marco returns to Plan and renames: Scout-A emits on `north-watch`, Scout-B emits on `south-watch`. The Relay now listens on both. He adds a new rule to the Relay: "If north-watch AND south-watch both have entries, compress south-watch first" (because the factory is in the north).

The channel names aren't just labels anymore. They're *semantic selectors* that the rule system operates on. "north-watch" doesn't just mean "the channel north scout uses" — it means "the priority tier of information coming from the north."

**Minute 3:00 — The Ah-Ha**
Marco beats Mission 6. In the debrief, he looks at his channel map: `north-watch`, `south-watch`, `relay-to-striker`. Three named channels that describe his information architecture. He realizes he DESIGNED this. The names are documentation of his system. Changing the name from "channel-1" to "north-watch" forced him to think about what the channel actually means.

This is the moment Robot Uprising teaches that naming is design — the same lesson software engineers learn when they name variables, functions, APIs.

**UI Annotations:**
- **Tutorial prompt at Mission 6:** When the player creates a second Scout, a boot-log message appears: `[SYSTEM] Multiple emitters on same channel detected. Consider: different channels for different purposes. Channel names shape how your rules can differentiate signals.` This nudge arrives at the exact moment the player encounters the multi-source problem.
- **Channel field placeholder text:** Changes from "channel-1" (default) to "name this channel" with a tooltip: "The name you choose becomes a selector in your rules. Choose a name that describes what this channel carries."

---

## Interaction Effects

### × Core Mechanic: EM Emissions (Locked)
The locked emissions model says "hook transmissions emit detectable EM noise." This analysis extends that to specify *what* the noise reveals. The channel-naming metagame only exists if emissions carry at least channel name metadata (Model 2+). If emissions are noise-only (Model 1), naming is strategically irrelevant.

### × Core Mechanic: Signal Taxonomy (2.10)
Under Model A "The Blob" (untyped signals), channel names ARE the type system. This makes naming *more* strategically significant — the name is the only way to differentiate signal types, so descriptive names carry maximum intelligence value. Under richer taxonomy models (typed signals), channel names matter less because the signal content already reveals type.

### × Multiplayer: Co-op Channel Naming (7.02a)
In co-op, descriptive names aid team coordination. In PvP, they leak intelligence. Players transitioning between modes face a cognitive switch: name channels clearly (co-op) vs. name channels opaquely (PvP). A possible design solution: the Plan screen shows a "mode" indicator (🤝 co-op / ⚔ PvP) that changes the channel field's placeholder text and tooltip guidance.

### × Building Blocks: All Paradigms
The channel naming UX depends on the input paradigm. In a text-field approach (current spec), naming is explicit — the player types a string. In a visual node-graph paradigm, channels might be color-coded wires rather than named strings, changing the interception mechanic from "read the name" to "detect the frequency/color."

### × Campaign: Tutorial Arc (Missions 1-4)
Missions 1-4 use pre-placed units. Channel names should be descriptive in tutorials (teaching what channels do) and transition to player-chosen names at Mission 5. The naming metagame doesn't activate until PvP, but the habit of descriptive naming established in the campaign creates the vulnerability that PvP exploits.

### × Competitive Analysis: Screeps Bot Detection
Screeps players identify bots by naming patterns. Robot Uprising could have an analogous dynamic: "I can tell they're running the meta build from TikTok because all their channels are named 'alpha,' 'bravo,' 'charlie' — that's the tutorial from the viral video."

---

## Comparable Games Deep Dive

### ARMA 3 TFAR — Frequency as OPSEC
ARMA's TFAR mod provides direct precedent. Default frequencies are "easily compromised." Advanced groups use randomized assignments. Frequency hopping (changing assignments per objective) is an OPSEC measure. Robot Uprising's channel naming maps directly: default names are easily compromised, advanced players randomize, and "channel rotation" (renaming channels between matches) prevents pattern accumulation.

### EVE Online — The Spy in Fleet Chat
EVE's espionage metagame is the extreme endpoint: embedded spies reading fleet channel names, understanding doctrines from fleet composition channel topics, and using GoonSwarm-style honeypots to identify leaks. Robot Uprising's interception is automated (Specialists do it) rather than social (humans infiltrate), but the intelligence loop is identical: capture signal → analyze naming → infer architecture → design counter.

### Android: Netrunner — Asymmetric Information Game
Netrunner's entire design is built on asymmetric information (Corp knows what's in servers, Runner doesn't). Robot Uprising's channel naming creates a similar asymmetry: the defender knows what their channels carry, the interceptor is guessing from names. The "play your traps like agendas" advice translates directly to "name your misdirection channels like real channels."

### MTG — Archetype Names as Metagame Signal
The lifecycle of MTG deck naming (descriptive → branded → obfuscated → meta-analyzed) predicts Robot Uprising's channel naming evolution. The key insight: eventually, the community develops enough pattern recognition that even obfuscated names carry signal ("they're obfuscating, which means they know what they're doing, which means they're probably running a non-standard architecture").

---

## The "Auto-Scramble" Design Decision

The highest-stakes design question: should the game offer automatic channel name randomization at deploy?

**Argument FOR:** Naming obfuscation is a solved problem — once everyone knows names leak, everyone obfuscates. The interesting game is in architecture design, not naming conventions. Auto-scramble removes busywork and equalizes the playing field.

**Argument AGAINST:** Naming IS the game. The decisions around what to reveal, what to hide, what to misdirect — that's a genuine competitive skill axis. Auto-scramble removes an entire dimension of play. It's like giving chess players automatic castling — it removes a choice that experts value.

**The Recommended Middle:** Offer auto-scramble as a **late-game unlock** (after Mission 8 or Gauntlet rank threshold). Early players must manually manage naming, learning the lesson that names carry information. Advanced players who've internalized the lesson can automate the defense and focus on architecture. This follows the game's general pattern of progressive automation — manual first, then tools to automate what you've mastered.

---

## The TikTok Clip

Split screen. Left: a player's Plan screen with channels labeled "flanker-left," "main-push," "retreat-signal." Right: the opponent's Specialist intercepting those names, the text floating up in amber. Cut to the battle: the opponent stacks defense exactly where "flanker-left" predicted. The flanker walks into a wall of Strikers. Text overlay: **"Your channel names are your opponent's strategy guide."** 🎤 drop.

---

## Open Questions

1. **Should interception require a dedicated skill?** Or should all units with perception detect channel names passively? Requiring Specialist `extract` makes interception a build choice; passive detection makes it universal.
2. **Should encrypted channels be visible in spectator mode?** Tournament casters want to explain both architectures. Full encryption defeats casting. Possible solution: spectators see names, players don't.
3. **Should there be a channel name character limit in competitive?** Longer names carry more information. A 4-character limit forces codebook strategies naturally.
4. **Should the game warn new PvP players?** A boot-log message: "ADVISORY: In competitive mode, channel names may be intercepted by enemy Specialist units. Consider operational naming practices." — diegetic security briefing.
