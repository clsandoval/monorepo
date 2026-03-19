# 3.05b — SWIZ-Style Value Packing as Design Primitive

## Overview

EXAPUNKS' SWIZ instruction is one of the most idiosyncratic primitives in any programming game. It rearranges the decimal digits of an integer by a positional mask: `SWIZ 5678 3214 X` produces `7218` — digit 3 (hundreds), digit 2 (tens), digit 1 (ones), digit 4 (thousands), reassembled left-to-right. A mask digit of 0 inserts a literal zero. This single instruction enables players to **pack multiple pieces of information into one integer value** and **unpack specific fields** without arithmetic — no division, no modulo, no bit shifting. It is the game's compression primitive, its data structure primitive, and its most hated instruction all at once.

The question for Robot Uprising: signals between units currently carry information across hook channels, but the spec doesn't define the **internal structure of a signal's payload**. Is there an analogous primitive — a way for players to pack compound information into a single signal slot, and unpack specific attributes on the receiving end? And if so, what does that look like in a visual/tactile workbench instead of a text-based assembly language?

The thesis: value packing is not just a compression trick. It is a **vocabulary expansion primitive** — a way to say more with fewer messages. In EXAPUNKS, SWIZ lets one register do the work of four. In Robot Uprising, an analogous primitive would let one context window slot carry the information density of three, fundamentally changing the economics of the context window constraint. This is a lever that connects the building-block layer (how players construct signals) to the core-mechanic layer (how context windows fill and evict) to the combat layer (how quickly information propagates under fire).

---

## SWIZ in EXAPUNKS: What It Actually Does

### The Mechanics

SWIZ operates on decimal digits by position (1-indexed from the right):

```
Value:    5 6 7 8
Position: 4 3 2 1

SWIZ 5678 1    X  →   8       (extract digit 1 = ones)
SWIZ 5678 32   X  →  76       (extract digits 3,2 = hundreds-tens)
SWIZ 5678 4321 X  → 5678      (identity — all digits in order)
SWIZ 5678 1234 X  → 8765      (reverse)
SWIZ 5678 1100 X  → 8800      (extract + zero-pad)
SWIZ 5678 2211 X  → 6688      (duplicate digits)
```

A mask digit of 0 produces a literal 0 in that position. A mask digit referencing a position that doesn't exist in the source also produces 0. Negative source values preserve the sign.

### What Players Actually Do With It

In practice, EXAPUNKS players use SWIZ for three things:

1. **Coordinate packing.** A 2D position (x=3, y=7) becomes the integer 37. SWIZ with mask 1 extracts y (7). SWIZ with mask 2 extracts x (3). One register stores two values. One M-register message transmits two coordinates.

2. **Multi-attribute encoding.** A file record might encode [type, quality, owner] as a three-digit number: 294 = type 2, quality 9, owner 4. Reading specific attributes is one SWIZ instruction instead of division chains.

3. **Signal protocol design.** When two EXAs need to communicate structured data through the blocking M register, packing reduces the number of send/receive pairs. Instead of sending x, then y, then type as three blocking exchanges, pack them as xyt and send once.

### Why Players Hate It (And Why That Matters)

SWIZ is the most complained-about instruction in EXAPUNKS. Reddit threads, Steam discussions, and community guides consistently flag it as unintuitive. The reasons:

- **Digit position is backwards** from reading order (position 1 = rightmost digit, but mask is read left-to-right)
- **Mental model conflict**: players think in binary/hex from programming backgrounds; decimal digit manipulation feels arbitrary
- **No visual feedback**: the instruction operates on numbers, and numbers look the same before and after unless you know the positional encoding scheme
- **Debugging is painful**: a packed value like 4729 means nothing unless you remember the schema — is it [type=4, x=7, y=2, flag=9] or [x=47, y=29]?

This is critical for Robot Uprising: SWIZ's power comes at an **readability cost** that compounds in debugging. The Inspector's click-to-inspect philosophy demands that packed information be legible at a glance, not mentally decoded.

---

## The Robot Uprising Analog: Six Approaches to Compound Signals

### The Design Space

Robot Uprising's signals travel through hook channels. A signal occupies one context window slot. The question is: how much information can one slot carry, and how does the player control that density?

### Approach A: "The Flat Signal" (No Packing)

Every signal carries exactly one piece of information: a type tag and a value. `ENEMY_SPOTTED at (3,5)` is one signal. `ENEMY_TYPE is STRIKER` is a second signal. `THREAT_LEVEL is HIGH` is a third. Three context window slots consumed to describe one enemy.

**Strengths:** Maximum legibility. Each slot in the Inspector shows one clear fact. No decoding required. The context window constraint is transparent — three facts cost three slots, period.

**Weaknesses:** Context windows fill fast. A Scout observing one enemy generates 2-4 signals about it (position, type, distance, threat assessment). A relay forwarding three scouts' observations about three enemies consumes 9-12 slots in a 12-slot buffer. The context window becomes a bottleneck not because of information volume but because of information **granularity**.

**The SWIZ parallel:** This is EXAPUNKS without SWIZ — sending x, then y, then type as separate M-register exchanges. It works, but it's wasteful. Players who hit the context window ceiling will instinctively want to compress.

### Approach B: "The Signal Packet" (Structured Packing)

Signals carry structured payloads with named fields. A single signal might be: `{ type: ENEMY_SPOTTED, position: (3,5), unit_type: STRIKER, threat: HIGH }`. One context window slot, four pieces of information.

The player configures signal structure in the hook editor. When creating a hook, the player doesn't just choose a trigger and a channel — they choose which **fields** to include in the outgoing signal. A hook configured as:

```
TRIGGER: enemy_in_range
CHANNEL: recon-net
PAYLOAD: [position, unit_type, threat_level]
```

...produces one signal carrying all three fields. The receiving unit's rules can reference individual fields: `IF recon-net.threat_level = HIGH THEN engage`.

**Strengths:** Explicit, visual, self-documenting. The workbench shows exactly what each signal contains. The Inspector renders each field as a labeled row inside the slot. No mental decoding — the field names are right there.

**Weaknesses:** The packing decision happens at design time, not runtime. A hook either includes `threat_level` or it doesn't. There's no equivalent of SWIZ's runtime flexibility — you can't dynamically choose which digits to extract based on a TEST result. The complexity is in the hook editor, which is already the densest part of the workbench.

**Visual design:** In the context window Inspector, a packed signal slot is rendered as a **micro-card** — slightly taller than a flat signal, with a thin border in the channel's color. Inside, each field is a row: `📍 (3,5)  ⚔ STRIKER  🔴 HIGH`. The card has a subtle accordion chevron — click to expand for metadata (source unit, tick sent, hop count). Collapsed, it shows the channel name and a field-count badge: `recon-net [3]`.

### Approach C: "The Compression Skill" (Relay-Mediated Packing)

Packing is not a universal capability — it's the Relay's **compress** skill. Raw signals from scouts arrive as flat, one-fact-per-slot entries. The Relay's compress skill folds multiple related signals into a single compound entry, freeing context window space downstream.

This is the locked spec's compress skill made concrete. A Relay receiving three signals about the same enemy:
```
Slot 1: ENEMY_SPOTTED at (3,5)
Slot 2: ENEMY_TYPE STRIKER at (3,5)
Slot 3: ENEMY_DISTANCE 2 at (3,5)
```

...applies compress and produces one compound entry:
```
Slot 1: CONTACT_REPORT { pos:(3,5), type:STRIKER, dist:2 }
```

Two slots freed. The compound entry persists in the relay's buffer and is forwarded as a single packed signal.

**Strengths:** Compression has a **cost** — it requires a relay unit, which has its own buffer and takes a tick to process. The player must decide: is the buffer savings worth the latency? This is the SWIZ parallel with teeth — packing is not free, it requires infrastructure. It also makes the Relay's value proposition concrete and visceral. Without relays, your strikers drown in raw data. With relays, they receive crisp intelligence briefings.

**Weaknesses:** If compress is the only packing mechanism, the game forces a specific architecture: scout → relay → striker. Players who want to skip the relay (direct scout-to-striker channels for speed) pay the full flat-signal context cost. This might be a feature (architectural tradeoff) or a straitjacket (only one viable topology).

**The SWIZ parallel:** SWIZ is a single instruction any EXA can execute. Compress-as-skill is more like a dedicated coprocessor — packing requires routing through a specific unit type. This changes the optimization question from "how do I pack this value?" to "where do I place my relay to optimize packing throughput?"

### Approach D: "The Signal Schema" (Player-Defined Encodings)

The player defines **signal schemas** — named templates that specify what fields a signal type carries. Schemas are created in a dedicated editor (or inline in the hook editor) and referenced by name.

```
SCHEMA: contact_report
  FIELDS: position, unit_type, threat_level, distance
  SIZE: 1 slot (packed)

SCHEMA: movement_order
  FIELDS: destination, priority, formation
  SIZE: 1 slot (packed)
```

Hooks reference schemas: `ON enemy_in_range → SEND contact_report ON recon-net`. Rules reference schema fields: `IF recon-net.contact_report.threat_level > MEDIUM THEN engage`.

**Strengths:** Maximum player agency. The player designs the signal vocabulary from scratch. This is the closest analog to EXAPUNKS' SWIZ — the player decides the encoding scheme. It also parallels real API design: you're defining the message contract between services.

**Weaknesses:** Schema design is a **meta-game** that sits between the player and the actual gameplay. Designing schemas is designing data structures, which is programming-adjacent work that could feel like homework. The Zachtronics audience loves this. The broader accessibility audience will bounce hard. Also, schema versioning becomes an issue — if you change a schema mid-campaign, do old blueprints break?

**Visual design:** The schema editor renders as a **postcard builder**. A blank cream-colored card with a channel-colored header bar. Drag field tiles from a vocabulary tray onto the card. Each field tile shows its icon, name, and data type. The card's size visually scales with field count — more fields = bigger card = more context window cost. A "COST: 1 SLOT" badge in the corner turns amber at 4+ fields and red at 6+ (diminishing returns — packing too much into one slot makes the slot's eviction catastrophically expensive).

### Approach E: "The Digit Wheel" (Direct SWIZ Homolog)

The most literal translation: signals carry integer values, and players configure **digit extraction rules** to unpack them. A signal value of `3527` might encode [enemy_type=3, x=5, y=2, threat=7]. The receiving unit's rules reference specific digit positions.

```
RULE: IF signal.digit(4) = 3 THEN engage    // enemy_type = STRIKER
RULE: IF signal.digit(1) > 5 THEN evade     // threat > 5
```

The hook editor includes a **digit wheel** — a visual dial per digit position where the player assigns meaning (dropdown: "position-x", "position-y", "enemy-type", "threat-level", "unused"). The wheel shows the encoding schema visually: four concentric rings, each labeled.

**Strengths:** This IS SWIZ, made visual. The digit wheel makes the encoding scheme legible without memorization. Zachtronics veterans will immediately recognize the pattern. The mechanic teaches positional encoding, which is a genuine CS concept (bit fields, struct packing, network protocol headers).

**Weaknesses:** Decimal digit manipulation is arbitrary and un-intuitive for most players (EXAPUNKS' most common complaint). The digit wheel helps, but the underlying model is still "a number encodes four things by position." Why decimal? Why not named fields? The answer — because it's one instruction, one register, one slot — is an optimization argument, not an accessibility argument. Also, digit extraction errors (off-by-one position) produce **silent wrong behavior** that's extremely hard to debug.

**Sensory design:** The digit wheel renders as a **rotary combination lock**. Four concentric dials, each with 10 positions (0-9), each tinted a different color (teal for position, amber for type, coral for threat, lavender for distance). Spinning a dial clicks with a satisfying ratchet sound — each notch a crisp *tick*. When a signal arrives in the Inspector, the packed integer displays above its digit wheel decomposition: `3527` with colored digit underlines matching the wheel colors. Hover over any digit and its meaning label floats up in the corresponding color.

### Approach F: "The Compound Glyph" (Visual Packing — RECOMMENDED)

**Named: The Signal Stamp.**

Signals are not integers and not flat strings. They are **visual compound tokens** — small iconic stamps that encode multiple attributes simultaneously through visual channels: shape, color, size, and an optional numeric value. The player designs signal stamps in the hook editor by layering visual attributes.

A stamp for "dangerous striker spotted nearby" might be:
- **Shape:** diamond (= enemy contact)
- **Border color:** red (= high threat)
- **Fill:** solid (= confirmed, not speculative)
- **Size:** large (= close range)
- **Pip count:** 1 (= single enemy)

One context window slot. Five attributes. No numbers to decode, no digit positions to memorize. The encoding is **perceptual** — the player reads the stamp the way a traffic sign is read, not the way a number is decoded.

**The Stamp Workshop.** In the hook editor, when configuring a signal's payload, the player enters the Stamp Workshop — a small panel showing a blank square stamp with four attribute layers:

1. **Shape selector** — row of 6 shapes (circle = observation, diamond = contact, triangle = warning, square = status, hexagon = command, star = priority). Click to select.
2. **Border color** — 5 color swatches (green = safe, amber = caution, red = danger, teal = information, purple = command). Click to select.
3. **Fill pattern** — 4 fills (solid = confirmed, hatched = uncertain, hollow = speculative, pulsing = urgent). Click to cycle.
4. **Size** — 3 sizes (small/medium/large, mapped to distance thresholds or intensity levels). Click to cycle.
5. **Pip count** — 0-5 small dots inside the shape (enemy count, squad size, repetition count). Click +/-.

The resulting stamp previews live in the center of the panel: a 32x32 pixel icon that looks like a wax seal or postage stamp. Below it, a human-readable summary auto-generates: "Red diamond, solid, large, 2 pips → CLOSE CONFIRMED ENEMY, COUNT: 2."

**Receiving units read stamps through visual pattern matching.** Rules reference stamp attributes:

```
RULE: IF stamp.shape = DIAMOND AND stamp.border = RED THEN engage
RULE: IF stamp.fill = PULSING THEN prioritize
RULE: IF stamp.pips > 3 THEN evade
```

**In the Inspector**, context window slots show the actual stamp icon rather than text. A row of tiny colored shapes instantly communicates the buffer's contents — a scout's buffer might show three green circles (observations), one red diamond (enemy contact), and two teal squares (relay status updates). The visual density is dramatically higher than text, and the pattern is readable without clicking.

**Strengths:**
- **Zero decoding cost.** A red diamond with 3 pips means "3 dangerous enemies" without any number-to-meaning translation. The encoding IS the visualization.
- **Accessibility-native.** Shape + color + pattern + size = four independent visual channels. Colorblind players still have shape, pattern, and size. Low-vision players can use enlarged stamps. Screen readers can announce the auto-generated summary text.
- **Memorable vocabulary.** Players will develop stamp fluency the way they develop emoji fluency. "Red diamond" becomes shorthand in community discussions. "He sent a pulsing star to the striker" is a sentence a streamer would say.
- **Designable.** Creating stamps is a satisfying creative act — you're designing a visual language for your army. This taps into the same satisfaction as designing blueprints, but at a finer grain.
- **Inspector-native.** The context window display transforms from a wall of text into a mosaic of glyphs — instantly readable at a glance.

**Weaknesses:**
- **Expressiveness ceiling.** 6 shapes x 5 colors x 4 fills x 3 sizes x 6 pip counts = 2,160 unique stamps. That's enormous, but continuous values (exact coordinates, precise distances) can't be encoded without falling back to numeric fields. Position `(3,5)` doesn't have a natural stamp representation.
- **Schema proliferation.** Without guardrails, players might create 40 stamp designs and lose track of which means what. A stamp dictionary panel becomes necessary.
- **Unfamiliar paradigm.** No existing game uses visual glyph packing as a signal primitive. There's no player intuition to build on — the concept must be taught from scratch.

**Interaction Effects:**
- **× Context window (core mechanic):** Stamps make the context window display visually rich. A buffer full of stamps looks like a painter's palette, not a log file. Overload feels like a mosaic shattering — stamp icons scattering and fading during the stun animation.
- **× Compress skill (Relay):** A relay's compress skill becomes stamp merging — three separate "enemy spotted" stamps from three scouts merge into one stamp with pip count 3 and border color escalated from amber to red. The merge animation shows three stamps sliding together and fusing.
- **× Inspector:** The timeline scrubber shows stamp flow through the system as a visual ribbon — tiny colored shapes flowing along channel lines. Patterns become visible: "every time a red diamond appears, there's a 2-tick gap before the striker receives it."
- **× Sealed watch:** During battle, signal chain visualization shows stamps traveling along dashed channel lines — colored shapes sliding from unit to unit. The board becomes a visual data-flow diagram with moving glyphs.
- **× EM emissions:** Stamps with more attributes (more filled layers) generate louder EM signatures. A pulsing red star with 5 pips is the equivalent of screaming on an open radio channel. A hollow green circle with 0 pips is a whisper. This creates a stealth-vs-intelligence tradeoff within the stamp design itself.
- **× Campaign progression:** Mission 1-3 use pre-made stamps. Mission 4 introduces the Stamp Workshop with 2 attribute layers unlocked. Mission 5 unlocks all layers. Mission 7+ introduces enemy stamps (red-tinted, angular shapes) that the player must learn to read in the Inspector.

---

## Three Comparable Games

### 1. Slay the Spire — Card Text as Compound Information

Every Slay the Spire card packs multiple attributes: damage value, energy cost, type (attack/skill/power), keywords (exhaust, ethereal, innate), and conditional effects. Players read this compound information at a glance through visual hierarchy — large damage number, small energy pip, keyword tags. The card IS the packed signal, and the player's literacy with card reading IS the unpacking skill.

**What transfers:** The stamp is Robot Uprising's card. Fluency with stamp reading is the same skill as fluency with card reading. The visual vocabulary should be learnable in the same timeframe — 10-20 games for basic literacy, 100+ for instant pattern recognition.

### 2. Among Us — Visual Shorthand in Time-Pressure Communication

Among Us players developed visual/verbal shorthand for compound information under time pressure: "Red sus near reactor" packs identity, suspicion level, and location into five words. The game didn't design this encoding — players invented it because the communication constraint (limited discussion time) demanded compression.

**What transfers:** Robot Uprising's context window constraint is the same pressure that Among Us's timer creates. Players will naturally want to pack more meaning into fewer signals. The stamp system provides a designed vocabulary for what Among Us players invented organically.

### 3. Naval Signal Flags — Real-World Visual Packing

The International Code of Signals uses colored flags where each flag encodes a letter, and specific flag combinations encode compound messages: "NC" (November + Charlie) = "I am in distress." The system packs rich meaning into minimal visual tokens, readable at distance without any decoding equipment beyond flag literacy.

**What transfers:** Stamps are digital signal flags. Shape = flag identity. Color = urgency modifier. The naval metaphor also works narratively — these are autonomous units communicating across a battlefield, and their signal vocabulary determines their combat effectiveness.

---

## Player Journeys

### Journey: Mika, 14, Minecraft Redstone Builder

**Context:** Mission 4. Mika has two scouts and one striker. She's just unlocked hooks and needs her scouts to tell the striker where enemies are. Previous missions used pre-configured setups.

**Minute 0:00 — The Overloaded Striker**
Mika's on the Plan screen. Workbench right, board left showing the Ifugao rice terrace tileset. She's wired both scouts to the striker via a channel called `enemies`. She hits EXECUTE. The sealed watch plays out: both scouts spot enemies simultaneously and flood the striker's 8-slot context window with flat signals — `ENEMY_SPOTTED (2,3)`, `ENEMY_TYPE STRIKER`, `ENEMY_SPOTTED (6,1)`, `ENEMY_TYPE SCOUT`, `DISTANCE 3`, `DISTANCE 1`... The striker's context bar fills to amber, then red, then the unit sparks and jitters — stunned for a tick. An enemy striker walks adjacent and eliminates it.

Mika groans. "Too much stuff." She enters the Inspector.

**Minute 0:45 — The Inspector Lesson**
She clicks the dead striker. Its context window at tick 8 shows 8 slots packed with flat signals — a wall of text. She scrolls through: four signals from Scout-A about enemy at (2,3), four signals from Scout-B about enemy at (6,1). The decision trace shows the striker's rule `IF ENEMY_SPOTTED THEN engage` matched on the first entry, but before it could act, tick 9 brought four more signals and triggered overload. "It knew too much about too many things."

She goes back to Plan. She notices the boot log has added a new entry: "SIGNAL PROCESSING: Compound signal stamps available. Encode multiple attributes in a single context slot."

**Minute 1:30 — The Stamp Workshop**
Mika clicks on Scout-A's hook. The hook editor shows the trigger (enemy_in_range) and channel (enemies). Below the channel name, a new section: STAMP DESIGN. She clicks it and the Stamp Workshop opens — a small panel with a blank white square in the center.

She sees the shape selector. Six shapes in a row. She hovers over the diamond — tooltip: "Contact report." She clicks it. The blank square becomes a diamond outline. She picks red for border color (danger), solid fill (confirmed), medium size (mid-range), and 1 pip (single enemy). The preview shows a clean red diamond with a single dot. Below: "Red diamond, solid, medium, 1 pip → CONFIRMED ENEMY CONTACT, RANGE: MEDIUM, COUNT: 1."

"Oh! It's like making an emoji." She configures Scout-B's hook with the same stamp design. Now each scout sends one stamp instead of four flat signals.

**Minute 2:30 — The Payoff**
She updates the striker's rule: `IF stamp.shape = DIAMOND AND stamp.border = RED THEN engage`. She hits EXECUTE. This time, the striker's context window fills cleanly — two red diamond stamps, one from each scout. The context bar stays cool blue. The striker reads the first stamp, engages the nearest enemy, eliminates it, then reads the second stamp and moves toward the second target. No overload. No stun.

Mika's eyes widen. "Wait, that's like... making a better language for them to talk in."

**Minute 3:00 — Resolution**
The mission completes. Mika's striker survived because two stamps used two slots instead of eight flat signals using eight slots. She opens the Stamp Workshop again and starts experimenting — what if the fill is `pulsing` for enemies that are moving? What if pip count shows how many ticks since spotted?

She's designing a communication protocol. She doesn't know the word yet.

**UI Annotations:**
- **Stamp Workshop**: 200x250px panel, appears below hook channel config. Light background with thin channel-colored border. Shape selector as horizontal icon row (32px icons). Color swatches as 24px circles. Fill/size/pip controls as click-to-cycle toggles.
- **Stamp preview**: 48x48px centered in workshop, updates live as attributes change. Subtle bounce animation on attribute change.
- **Auto-summary**: 12px monospace text below preview, updates in real-time, wraps to 2 lines max.
- **Context window (Inspector)**: Slots show 24x24px stamp icons instead of text rows. Hover expands to full summary tooltip.

---

### Journey: Dr. Amara, 38, ML Researcher and Distributed Systems Engineer

**Context:** Mission 7. Amara has a full army with command agent, three relays, scouts, and strikers. She's building a multi-tier intelligence pipeline and hitting EM emission problems — her signals are too loud and enemies are homing in on her relay cluster.

**Minute 0:00 — The Emission Problem**
Amara's in the Plan screen, studying her Stamp Workshop configurations. Her scouts send full-detail stamps — diamond shapes with all 5 attribute layers filled (shape, border, fill, size, pips). She opens the EM overlay on the board preview and sees angry red fog around her relay positions. "The stamps are too rich. Every attribute layer is adding to the emission signature."

She remembers the boot log note from Mission 6: "EMISSION MODEL: Signal complexity correlates with electromagnetic signature. Each stamp attribute layer adds +0.5 EM units to the transmission."

**Minute 1:00 — The Compression Protocol**
Amara designs a two-tier stamp system. Scout-to-relay stamps are **minimal**: circle shape (observation), no border color, hollow fill, small size, 0 pips. Just a bare observation token. Cost: 1 attribute layer = +0.5 EM. Nearly silent.

The relay's compress skill then merges multiple bare observation circles into a single rich stamp: diamond shape (contact report), red border (confirmed threat), solid fill (multiple sources corroborate), medium size (averaged range), pip count = source count. This rich stamp goes relay-to-striker on a different channel.

The scout-to-relay leg is quiet. The relay-to-striker leg is louder, but the relay is positioned behind terrain cover, reducing effective EM range.

**Minute 2:15 — The Schema Table**
She opens the Stamp Dictionary panel — a reference grid showing all her stamp designs. She's created 8 distinct stamps across 4 channels. She names each one: `whisper-ping`, `full-contact`, `flash-warning`, `all-clear`, `movement-order`, `priority-target`, `hold-position`, `status-ok`. The dictionary shows each stamp's icon, auto-summary, EM cost, and context window slot cost (all 1 slot, but the relay's compressed stamps show "replaces N" annotations).

She drags the dictionary panel to a second monitor. It's become her API documentation.

**Minute 3:30 — The Stealth Architecture**
She hits EXECUTE. The sealed watch shows a dramatically different EM profile than her previous attempts. Scout signals are nearly invisible — faint teal circles sliding along dashed channel lines, no fog emanating. The relay processes them in its 12-slot buffer, compresses, and transmits rich red diamonds on the striker channel. The relay's position behind terrain means the EM fog doesn't reach enemy scouts.

Enemies patrol past her scouts without detecting them. The striker receives clean, rich intelligence and eliminates targets methodically.

**Minute 4:30 — The Inspector Debrief**
In the Inspector, she clicks the relay at tick 12. Its context window shows a beautiful progression: three bare circles arrive in slots 1-3, then compress fires and they merge into one red diamond in slot 1, freeing slots 2-3. The sparkline shows buffer utilization as a sawtooth wave — fill, compress, fill, compress. She annotates this pattern: "batch compression pipeline with 3-tick processing window."

She realizes she's designed a **message queue with batch processing and format transformation** — the same architecture she builds professionally with Kafka and Protocol Buffers. The stamp designs are her protobuf message definitions. The relay compress skill is her stream processor. The EM constraint is her network bandwidth budget.

"This is literally my job, but with shapes instead of JSON schemas."

**UI Annotations:**
- **EM overlay**: Semi-transparent red-to-transparent radial gradient around emitting units, radius proportional to total EM output. Stamp complexity (attribute layer count) annotated as small numbers next to each unit during overlay.
- **Stamp Dictionary**: Sortable/filterable grid, 4 columns (Icon | Name | Summary | EM Cost), collapsible by channel, total EM budget shown at bottom.
- **Compress animation (Inspector)**: Three stamp icons slide horizontally toward each other, overlap, flash white, resolve into single merged stamp with upward starburst particle.
- **Sawtooth sparkline**: Context utilization chart with sharp rises (signal arrival) and sudden drops (compress events), green-to-amber color gradient.

---

### Journey: Kwame, 28, Twitch Streamer and Former StarCraft Semi-Pro

**Context:** Mission 9. Kwame is streaming a "no relay" challenge run — proving that direct scout-to-striker wiring can work if the stamp vocabulary is designed correctly. Chat has bet him 500 channel points he can't do it.

**Minute 0:00 — The Vocabulary Challenge**
Kwame's in the Plan screen. No relays. Six scouts, four strikers, one command agent. The challenge: scouts must communicate directly to strikers, but strikers only have 8 context window slots. Without relay compression, every scout message eats a slot.

"Chat, the problem isn't the number of messages. It's the information density per message. If I can make every stamp carry maximum intel, I only need one stamp per enemy instead of four flat signals."

He opens the Stamp Workshop and designs what he calls the "KWAME-9" stamp: diamond shape (contact), border color mapped to threat level (green/amber/red), fill mapped to confidence (solid = visual confirmed, hatched = suspected from EM detection, hollow = old data), size mapped to distance (large = adjacent, medium = 3 tiles, small = 5+ tiles), pip count = number of turns since last confirmed position.

**Minute 1:30 — The Rule Precision**
His striker rules reference stamp attributes with surgical precision:

```
Rule 1: IF stamp.shape = DIAMOND AND stamp.size = LARGE AND stamp.border = RED → engage
Rule 2: IF stamp.shape = DIAMOND AND stamp.size = MEDIUM AND stamp.pips < 2 → move_toward
Rule 3: IF stamp.shape = DIAMOND AND stamp.fill = HOLLOW → ignore (evict first)
Rule 4: IF stamp.shape = DIAMOND AND stamp.pips > 3 → evict (stale data)
```

"See chat? Rule 3 and 4 are the secret sauce. Hollow fill = unconfirmed sighting. Pips > 3 = old data. The striker auto-cleans its own context window by evicting low-confidence and stale stamps. No relay needed — the eviction policy IS the compression."

Chat explodes: "actual galaxy brain" / "he turned the striker into its own relay" / "stamps are broken"

**Minute 2:45 — The Sealed Watch**
EXECUTE. The Taal volcano battlefield. Six scouts fan out. Small colored shapes — diamonds with varying borders, fills, and pip counts — slide along channel lines from scouts to strikers. No relay processing delay. Signals arrive in 2 ticks (scout → striker) instead of 4 (scout → relay → striker).

A red solid large diamond arrives at Striker-1. It engages immediately — 2 ticks faster than a relay architecture would allow. The enemy falls. Chat: "SPEED IS THE META."

But then three scouts spot the same enemy cluster simultaneously. Striker-2 receives six stamps in two ticks. Its 8-slot buffer goes from 3 to 9 entries — overload. It sparks and freezes. An enemy striker walks adjacent.

"NO NO NO — eviction rule should have caught the duplicates but they're all from different scouts with different timestamps..." Striker-2 is eliminated. Kwame's face contorts. Chat: "F F F F F"

**Minute 3:30 — The Diagnostic**
In the Inspector, Kwame clicks Striker-2 at the fatal tick. Six diamond stamps from three different scouts, all about enemies in the same grid area. Three are solid-fill (confirmed) and three are hatched (EM-detected). His eviction rule `IF stamp.fill = HOLLOW → evict` doesn't catch hatched fills.

"I need a DUPLICATE DETECTION rule. Same enemy, multiple reports. The stamp doesn't encode source identity — I can't tell Scout-A's report from Scout-B's."

He realizes the stamp's weakness: **no provenance field**. He can't deduplicate without knowing who sent it. He redesigns: pip count now encodes scout ID (1-6) instead of age. Age is communicated through fill pattern decay (solid → hatched → hollow over time, handled automatically by context window aging).

"The stamp vocabulary is a design space. Every attribute you allocate to one meaning, you lose for another. Pip count can't be both age AND source. You have to choose."

Chat: "this is literally API design" / "someone clip this for the CS subreddit"

**Minute 4:15 — Resolution**
Second attempt. The deduplication works — strikers receiving multiple stamps from different scouts (different pip-count IDs) about the same area keep only the most recent solid-fill stamp, evicting older or less-confident duplicates. The no-relay run succeeds with a 42-tick completion time versus his relay architecture's 38 ticks. Faster signals but more fragile.

"Relay architectures are safer. No-relay is faster but you need PERFECT stamp vocabulary. There's no free lunch."

Chat clips the overload death and the diagnostic sequence. The clip hits 12K views in an hour.

**UI Annotations:**
- **Stamp preview in rule editor**: When a rule references stamp attributes, the rule strip shows a miniature stamp icon updating in real-time as the player specifies conditions — the stamp filters down from "any shape" to "red diamond, solid, large."
- **Duplicate stamp highlight (Inspector)**: When two stamps in the same buffer encode similar information (same shape, same border, positions within 2 tiles), a thin amber connector line links them and a "DUPLICATE?" badge appears. This is a diagnostic hint, not an automatic deduplication.
- **Provenance absence**: Stamps intentionally do NOT carry source-unit identity by default. This is a design cost — if you want source tracking, you spend pip count on it, losing that dimension for other data.

---

## Strengths and Weaknesses Summary

| Dimension | Flat Signal (A) | Signal Packet (B) | Compress Skill (C) | Signal Schema (D) | Digit Wheel (E) | Signal Stamp (F) |
|-----------|----------------|-------------------|--------------------|--------------------|-----------------|------------------|
| **Readability** | Excellent | Good | Good (post-compress) | Good (with names) | Poor | Excellent |
| **Compression ratio** | 1:1 | 3-5:1 | 3-5:1 (delayed) | 3-5:1 | 4:1 | 5:1 |
| **Learning curve** | Zero | Low | Medium | High | Very High | Low-Medium |
| **Debug experience** | Clear | Clear | Clear (Inspector) | Clear (with schema) | Opaque | Glanceable |
| **Creative expression** | None | Low | Medium | High | Medium | High |
| **EM interaction** | N/A | Possible | Natural | Possible | Possible | Natural |
| **SWIZ equivalence** | None | Partial | Indirect | Full | Direct | Spiritual |

## Recommendation

**Approach F "The Signal Stamp"** as the primary packing primitive, with **Approach C "The Compression Skill"** as the Relay's value-add. Stamps handle the per-hook encoding question (what does this signal mean?). Compress handles the volume question (too many stamps, merge them). Together they create a two-layer signal processing pipeline that teaches message design (stamps) and stream processing (compression) as distinct but complementary skills.

The Digit Wheel (E) is the most faithful SWIZ translation but inherits SWIZ's biggest problem: opaque numeric encoding that requires mental decoding. The Signal Stamp achieves SWIZ's goal — compound information in one slot — through visual rather than numeric encoding, which aligns with Robot Uprising's workbench-first, visual-tactile design philosophy.

---

## The TikTok Clip

A striker's context window, shown in the Inspector at the moment of overload, rendered as a mosaic of colored stamps — red diamonds, amber triangles, green circles — cascading in too fast, the bar flashing red, the stamps shattering and scattering as the stun triggers. Cut to the replay where the player has redesigned the stamps to be minimal whisper-pings for scouts and rich compound reports for relays. Same battle, clean blue context bars, methodical elimination. "Same army. Better vocabulary."

15 seconds. The visual makes the concept self-evident.
