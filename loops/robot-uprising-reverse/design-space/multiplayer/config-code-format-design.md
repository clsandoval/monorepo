# Config Code Format Design

**Aspect:** 7.03a — Config Code format design: exact encoding format, compression strategy, version migration, URL scheme, QR code generation, backward compatibility when game primitives change between versions

**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis

---

## The Core Design Problem

Every piece of Robot Uprising's community infrastructure — Workshop sharing, async challenges, puzzle boxes, necropsy artifacts, Evolution Chains, Config Codes pasted in Discord, QR codes printed on stickers — depends on ONE thing: **a compact, portable, human-shareable encoding of a player's architecture.** The Config Code is the atom of the social game. If the encoding is too long, nobody pastes it. If it's fragile across versions, the community library rots. If it's opaque, modders can't build tools. If it's too simple, it can't represent the full game state.

This is the **Factorio blueprint string problem** applied to an attention-architecture game. Factorio solved it with version-byte + JSON + zlib + base64 and created one of the most successful community sharing ecosystems in gaming history. Hearthstone solved it differently — varint-encoded card IDs in a fixed binary structure, base64-wrapped, producing codes short enough to paste in Twitch chat. Legends of Runeterra used base32 with structured grouping by card count and faction. Each made tradeoffs between compactness, readability, extensibility, and tooling support.

Robot Uprising's challenge is HARDER than any of these because the shareable artifact isn't a flat list (deck of cards) or a spatial layout (Factorio blueprint). It's a **graph** — blueprints connected by named channels, each blueprint containing ordered rules, equipped skills, hook configurations, and context config. The encoding must capture topology, not just inventory.

---

## What Needs Encoding

A complete Robot Uprising "architecture" (the shareable unit) contains:

### Per-Blueprint Data
- **Unit type** (Scout/Striker/Relay/Specialist/Command — 5 values, 3 bits)
- **Equipped skills** (subset of unit's available skills, into limited slots — e.g., Scout has 2 skill slots from {patrol, evade})
- **Rules** (ordered list of condition→action pairs, order matters, limited count per unit type)
  - Each rule: condition type + parameters + action type + parameters
  - Rule count varies: 4-8 for basic units, 12-20 for Command
- **Hook configurations** (per hook slot: trigger type + trigger params + channel name + payload config)
  - Hook slot count varies: 2 (Scout/Striker/Specialist) to 6 (Command)
- **Context config** (buffer listen/ignore toggles per channel, eviction priority ordering, optional type filters)
- **Blueprint name** (player-assigned, freeform text)

### Architecture-Level Data
- **Blueprint list** (1-N blueprints, typically 3-8)
- **Production queue** (ordered list of blueprint references)
- **Channel namespace** (emergent from hooks — all unique channel names used across blueprints)

### Metadata
- **Config Code version** (for forward/backward compatibility)
- **Game version** (which primitives/skills/triggers existed when this was created)
- **Author** (optional — for Workshop attribution)
- **Mission context** (optional — which mission this was designed for)

### Size Estimate

A mid-game architecture (Mission 7, ~5 blueprints, ~25 rules total, ~12 hooks, 4-6 channels):
- Raw JSON: ~2-4 KB
- Compressed: ~400-800 bytes
- Base64 of compressed: ~550-1100 characters

A late-game architecture (Mission 10, ~8 blueprints, ~60 rules, ~30 hooks, 8-12 channels, Command agent):
- Raw JSON: ~6-12 KB
- Compressed: ~1-3 KB
- Base64 of compressed: ~1.4-4 KB characters

---

## Six Encoding Approaches

### Approach A: "The Factorio" (JSON + zlib + Base64)

**How it works:** Serialize the complete architecture as a JSON object. Compress with zlib deflate level 9. Base64-encode. Prepend a version byte.

**Format:** `R0<base64(zlib(JSON))>`

The `R` prefix identifies it as a Robot Uprising config. The `0` is the format version. Everything after is standard zlib+base64.

**Example JSON structure:**
```json
{
  "v": 1,
  "blueprints": [
    {
      "name": "Scout Alpha",
      "unit": 0,
      "skills": [0, 1],
      "rules": [
        {"c": [3, 1, 5], "a": [0, 2]},
        {"c": [1, 0], "a": [2, 1]}
      ],
      "hooks": [
        {"t": 2, "tp": [1], "ch": "threat-net", "p": 1},
        {"t": 0, "tp": [], "ch": "recon", "p": 0}
      ],
      "ctx": {"listen": ["threat-net", "orders"], "ignore": ["noise"], "evict": [2, 0, 1]}
    }
  ],
  "queue": [0, 0, 1, 2],
  "meta": {"mission": 7, "gv": "0.4.2"}
}
```

**Strengths:**
- **Trivially extensible.** Adding new fields to JSON is non-breaking. Old decoders ignore unknown keys. New decoders provide defaults for missing keys.
- **Tooling paradise.** Every language has JSON + zlib + base64. Community tools appear within days. Python one-liner to decode: `json.loads(zlib.decompress(base64.b64decode(code[2:])))`.
- **Human-debuggable.** Decode → pretty-print JSON → read it. No binary format reverse-engineering needed.
- **Factorio proved it works.** The Factorio blueprint ecosystem is the gold standard. Thousands of third-party tools, websites, bots, browser extensions — all because the format is simple, documented, and standard.

**Weaknesses:**
- **Verbose.** JSON keys like `"blueprints"`, `"rules"`, `"hooks"` repeat per blueprint. Even minified, JSON carries structural overhead. A 5-blueprint architecture produces 550-1100 character codes.
- **Too long for chat.** Discord message limit is 2000 chars, but a 1000-character code in a Discord message looks intimidating. Twitch chat limit is 500 chars — impossible for late-game configs.
- **No semantic compression.** zlib doesn't know that `"unit": 0` means Scout. A domain-aware encoder could use 3 bits.

**What it looks like when shared:**
```
R0eJxVUk1OwzAQvQrKghUV7k5pC0KC7hACsUCO...
(~800 characters for a mid-game config)
```

A grey monolith of characters. Players copy-paste it into Discord with a message like "try this relay chain for M7." The recipient pastes it into the game's Import field. The workbench populates. It works. It's not pretty, but it works.

---

### Approach B: "The Hearthstone" (Binary Varint + Base64)

**How it works:** Define a fixed binary schema. Encode each field as unsigned varints (variable-length integers). Group by structural similarity (like Hearthstone groups cards by copy count). Base64-encode the byte stream.

**Format:** `RU-<base64(binary)>`

**Binary structure:**
```
[version: varint]
[blueprint_count: varint]
for each blueprint:
  [unit_type: varint]
  [name_length: varint][name_bytes: UTF-8]
  [skill_count: varint][skill_ids: varint...]
  [rule_count: varint]
  for each rule:
    [condition_type: varint][condition_param_count: varint][params: varint...]
    [action_type: varint][action_param_count: varint][params: varint...]
  [hook_count: varint]
  for each hook:
    [trigger_type: varint][trigger_param_count: varint][params: varint...]
    [channel_name_ref: varint]  // index into channel string table
    [payload_type: varint]
  [listen_count: varint][listen_refs: varint...]
  [ignore_count: varint][ignore_refs: varint...]
  [eviction_order: varint...]  // one per signal type
[queue_length: varint][queue_refs: varint...]
[channel_count: varint]
for each channel:
  [name_length: varint][name_bytes: UTF-8]
```

**Key optimization: channel string table.** Channel names (like "threat-net", "recon-data", "orders") appear multiple times across blueprints. The binary format stores each unique channel name ONCE in a string table at the end, and references them by index (a single varint) everywhere else. This alone can save 30-50% over JSON.

**Strengths:**
- **Dramatically more compact.** A mid-game config: ~200-400 bytes raw → ~270-540 chars base64. Fits in a tweet. Fits in Twitch chat for simpler configs.
- **Canonical ordering built-in.** Sort blueprints by unit type, rules by condition type, hooks by trigger type → identical architectures always produce identical codes. Enables code comparison.
- **Efficient for the common case.** Most varints are 1 byte (values 0-127). A Scout with 2 skills, 3 rules, 2 hooks: ~40 bytes.

**Weaknesses:**
- **Brittle to schema changes.** Adding a new field requires a version bump and explicit migration logic. Can't just ignore unknown fields like JSON.
- **Hard to debug.** Decoding requires knowing the exact binary layout. No `jq` for binary varints.
- **Community tooling barrier.** Building a decoder requires understanding the spec. Factorio's JSON format spawned tools in days; a binary format takes weeks.
- **Channel names still eat space.** Even with string tables, "threat-intelligence-network" is 28 bytes. Long channel names bloat codes.

**What it looks like when shared:**
```
RU-AAICABBTb291dCBBbHBoYQIAAQIDAgEFAAIBAgA...
(~400 characters for a mid-game config)
```

Shorter. Still a wall of characters, but fits comfortably in Discord. The `RU-` prefix makes it recognizable.

---

### Approach C: "The Shortlink" (Server-Side Storage + 6-Character Code)

**How it works:** The full architecture is uploaded to a lightweight server. The server returns a 6-character alphanumeric code. Sharing is just the code. The game client resolves the code to the full architecture on import.

**Format:** `RU-X7K9P2`

**The alphabet:** 32 characters (A-Z minus confusables I/L/O/S + digits 2-9 minus 0/1). 32^6 = ~1 billion unique codes. At 1000 new codes per day, lasts 2.7 million days.

**Strengths:**
- **Maximally compact.** 6 characters. Fits ANYWHERE. Twitch chat, Twitter bio, spoken aloud, written on a napkin, tattooed on your forearm.
- **Memorable.** Players develop shorthand: "Have you tried X7K9P2?" becomes community vocabulary.
- **Analytics.** The server knows how many times each code is resolved. Popular configs surface naturally.
- **No version migration problem.** The server stores the full architecture JSON. When the game schema changes, a server-side migration updates all stored configs.

**Weaknesses:**
- **Requires a backend.** This directly violates the locked constraint: "React + Pixi.js + Vite, no backend." The shortlink server IS a backend. Even a static one (like a GitHub Gist-based lookup) requires infrastructure.
- **Offline-hostile.** No internet = no code resolution. The game becomes dependent on server availability.
- **Link rot.** When the server goes down (and it will), every shared code in every Discord message, Reddit post, and YouTube description becomes dead. The Factorio ecosystem survives because codes are self-contained.
- **Privacy.** Every code resolution is a server request. The server knows who imported what, when, from where.

**Mitigation: Hybrid approach.** Use shortlinks as an OPTIONAL convenience layer on top of Approach A or B. The shortlink resolves to a full self-contained code. If the server dies, codes still work via the embedded format. The game always accepts both `RU-X7K9P2` (shortlink) and `R0eJxVUk1...` (self-contained).

**What it looks like when shared:**
```
RU-X7K9P2
```

Six characters. Clean. Elegant. A player says in voice chat: "X-seven-K-nine-P-two" and their friend imports it live on stream. The audience can read it on screen and try it themselves. This is the dream. The backend requirement is the nightmare.

---

### Approach D: "The Emoji Code" (Human-Readable Symbolic Encoding)

**How it works:** Encode the architecture using a visual symbolic language. Unit types become emoji. Skills become single-character symbols. Rules use a compact notation. The code is human-readable — a player can LOOK at it and understand the architecture without importing.

**Format:**
```
👁[PT,EV]→recon{ON_SEE:!threat-net}|ctx:threat-net,orders/-noise/ev:2,0,1
📡[CM,FL]→hub{ON_RECV:!relay-out}|ctx:threat-net,recon/-/ev:0,1,2
⚔[EN,BR]→alpha{ON_RECV:!strike}|ctx:threat-net/-noise/ev:1,0,2
Q:👁👁📡⚔
```

**Strengths:**
- **Readable.** A player can glance at a code and understand the architecture's SHAPE — two scouts, one relay, one striker. The emoji immediately communicate composition.
- **Educational.** Reading other players' codes teaches architecture patterns. You learn by reading, not just by importing.
- **Aesthetic.** Emoji codes look GOOD in Discord. They're visually distinctive. They invite conversation: "Why two scouts?"
- **Streamable.** A streamer's overlay can show the emoji code and viewers can follow along.

**Weaknesses:**
- **Doesn't scale.** A 5-blueprint config with 30 rules becomes an unreadable wall of symbols. The "readable" property only holds for simple configs.
- **Fragile to copy-paste.** Emoji rendering varies by platform. 👁 on Windows vs. Mac vs. Android can differ. Some platforms strip or mangle emoji. Slack, Discord, and Twitch all handle emoji differently.
- **Requires a mini-language.** Players must learn the symbolic notation. `PT` for patrol, `EV` for evade, `CM` for compress — this is a language on top of a language.
- **Not compact for complex configs.** A Command agent with 6 hooks and 15 rules would be ~500 characters of dense symbolic text. Worse than binary encoding.
- **Internationalization.** Skill abbreviations are English-centric. `PT` for patrol doesn't localize.

**Best use: as a DISPLAY format, not a transport format.** The game generates emoji summaries for preview cards in the Workshop, Discord embeds, and social sharing — but the actual import/export uses a binary or JSON format underneath.

---

### Approach E: "The Layered Envelope" (Header + Compressed Payload + Checksum)

**How it works:** A structured format with distinct layers: a human-readable header (version, unit composition, mission context), a compressed binary payload (the actual config data), and a checksum for integrity verification.

**Format:**
```
RU1.S2R1K1.M7.aB3xQ9kL...checksum
```

**Structure:**
- `RU` — Robot Uprising identifier
- `1` — Format version
- `.` — Separator
- `S2R1K1` — Composition summary: 2 Scouts, 1 Relay, 1 striKer (human-readable at a glance)
- `.M7.` — Mission 7 context
- `aB3xQ9kL...` — Base64url payload (the actual compressed config)
- Last 4 chars: CRC32 checksum

**Strengths:**
- **Partially readable.** Even without decoding, `S2R1K1.M7` tells you "2 scouts, 1 relay, 1 striker, for mission 7." This is enormously useful in Discord conversations — you can evaluate composition before importing.
- **Integrity verification.** The checksum catches transcription errors, partial copies, and corruption. When a player copy-pastes half a code, the game says "Invalid code — checksum mismatch" instead of producing a corrupted architecture.
- **Version-aware.** The format version in the header allows the decoder to select the right parsing strategy without examining the payload.
- **Best of both worlds.** Readable header for humans, compact binary payload for machines.

**Weaknesses:**
- **Longer than pure binary.** The header adds 10-20 characters over Approach B.
- **Header can lie.** If the header is generated separately from the payload, they can desync. Must be validated on decode.
- **Custom format.** Not a standard encoding — community tools need to understand the envelope structure.

**What it looks like when shared:**
```
RU1.S2R1K1.M7.aB3xQ9kLmNpRsTuVwXy...4f2a
```

In Discord, someone asks "what's a good M7 config?" and another player posts `RU1.S2R1K1.M7.aB3xQ9...`. The reader can immediately see the unit composition without importing. "Two scouts? I usually run three. Let me try this."

---

### Approach F: "The DNA Strand" (Positional Encoding with Implicit Schema)

**How it works:** Every primitive in the game (unit types, skills, trigger types, action types, signal types) gets a fixed numeric ID. The architecture is encoded as a fixed-format byte sequence where position determines meaning. No field names, no length prefixes — pure positional data. Like DNA codons: position in the strand determines the gene.

**Format:** Byte positions are predetermined:
```
Bytes 0-1: version + flags
Bytes 2-3: blueprint count + queue length
For each blueprint (fixed-size blocks):
  Byte 0: unit type (3 bits) + skill mask (5 bits)
  Bytes 1-2: rule count + hook count
  Rules: fixed 4-byte encoding per rule (condition: 2 bytes, action: 2 bytes)
  Hooks: fixed 6-byte encoding per hook
  Context config: fixed 4-byte encoding
Queue: 1 byte per entry (blueprint index)
Channel string table: null-terminated strings
```

**Strengths:**
- **Maximally compact.** No structural overhead. Every byte is data. A 5-blueprint config: ~120-200 bytes → ~160-270 chars base64.
- **Fixed-offset parsing.** No varint decoding needed. Jump directly to any blueprint by computing its byte offset. Fast.
- **Deterministic size.** Given blueprint count and rule/hook counts, the total size is exactly calculable.

**Weaknesses:**
- **Extremely brittle.** Adding a new skill, trigger type, or rule parameter breaks EVERY existing code. No forward compatibility.
- **Wastes space on sparse configs.** A Scout with 2 rules uses the same fixed allocation as a Command with 20. Either you waste bytes or you need variable-length blocks (which loses the positional advantage).
- **Impenetrable to humans.** Pure binary with no structure markers. Community tooling requires the exact spec.
- **The "MP3 header" problem.** If one byte is corrupted or shifted, everything after it is garbage. No error recovery.

**Best use: internal save format, NOT sharing format.** The game's localStorage save file can use positional encoding for speed and compactness. The sharing format should be more resilient.

---

## Recommended Design: "The Uprising Envelope" (E + A hybrid)

**Primary format: Approach E (Layered Envelope) wrapping Approach A (JSON + zlib).**

The recommended format combines the human-readable header of Approach E with the extensible, tooling-friendly payload of Approach A:

```
RU1.S2R1K1.M7.eJxVUk1OwzAQvQrKghUV7k5pC0KC...
^  ^ ^       ^
|  | |       └─ zlib+base64 of minified JSON (no outer base64 — zlib output IS base64url-encoded)
|  | └─ Composition summary + mission context
|  └─ Format version
└─ Robot Uprising prefix
```

### Encoding Pipeline

1. **Serialize** the architecture to minified JSON with short keys (`b` for blueprints, `u` for unit type, `r` for rules, `h` for hooks, `s` for skills, `q` for queue, `c` for context config, `n` for name)
2. **Compress** with zlib deflate level 9
3. **Encode** compressed bytes as base64url (URL-safe: `-` and `_` instead of `+` and `/`, no `=` padding)
4. **Generate header** by scanning the JSON: count unit types, extract mission context
5. **Assemble:** `RU` + version + `.` + composition + `.` + mission + `.` + payload

### Decoding Pipeline

1. **Split** on `.` — parts[0] = `RU1`, parts[1] = composition, parts[2] = mission, parts[3+] = payload (rejoin with `.` in case payload contains `.`)
2. **Validate** version from parts[0]
3. **base64url-decode** → zlib inflate → JSON parse
4. **Validate** header matches payload (composition check)
5. **Apply defaults** for any missing fields (forward compatibility)
6. **Render** in workbench

### Version Migration Strategy

**The "Additive Schema" principle:** New game versions can ADD fields to the JSON but never REMOVE or RENAME existing ones. Old fields retain their meaning forever.

**When a new skill is added (e.g., "shield" in v0.5):**
- Old codes (v0.4) don't reference the new skill. They import fine — the new skill simply doesn't appear in the loaded config.
- New codes (v0.5) reference skill ID 12. Old decoders (v0.4 game clients) encounter unknown skill ID 12 and replace it with a placeholder "unknown skill" with a warning: "This config uses skills from a newer version. Update your game to load it fully."

**When a rule condition type changes (e.g., "ON_SEE" gains a new parameter in v0.6):**
- Old codes have 1 param for ON_SEE. New decoders fill in the missing param with a default.
- New codes have 2 params for ON_SEE. Old decoders read the first param and ignore the second (unknown extra data in the JSON array is ignored).

**When a primitive is REMOVED (nuclear option, avoid if possible):**
- The removed primitive ID is RETIRED, never reassigned. Decoders encountering a retired ID show a warning: "This config uses a feature that was removed in v0.7."
- The composition header still imports; the payload has gaps.

**Breaking changes (fundamental schema restructure):**
- Increment the version byte. `RU1` → `RU2`.
- Ship the old decoder alongside the new one. The game checks the version and dispatches to the right parser.
- Provide a one-time bulk migration tool: "Import old code → re-export as new format."

### QR Code Integration

**QR Code capacity (Error Correction Level M):**
- Version 10 (57×57 modules): 395 alphanumeric characters
- Version 15 (77×77 modules): 758 alphanumeric characters
- Version 20 (97×97 modules): 1249 alphanumeric characters
- Version 25 (117×117 modules): 1853 alphanumeric characters

A mid-game config (550-1100 chars) fits in a Version 15-20 QR code. A late-game Command architecture (1400-4000 chars) may require Version 25+ or compression improvements.

**QR code design:**
- **Branded frame.** The QR code is rendered with a Robot Uprising logo in the center (using error correction redundancy to survive the logo overlay). Cyan border. "SCAN TO IMPORT" text below.
- **Composition preview.** Below the QR code, the human-readable composition from the header: `S2R1K1 — Mission 7`. The recipient knows what they're scanning before they scan.
- **In-game scanner.** The game includes a camera-based QR scanner accessible from the Import screen. On mobile, this is native camera integration. On PC, it reads from clipboard (screenshot → QR decode) or a file drop.
- **Physical sharing.** Players print QR stickers for LAN events, conventions, and physical meetups. A business card with your best architecture's QR code. The **"trading card" fantasy** — collecting QR codes like Pokemon cards.

### URL Scheme

**Deep link format:** `https://robotuprising.game/c/RU1.S2R1K1.M7.eJxVUk1...`

- Clicking the link opens a web preview page showing: composition, author name, mission context, unit count, and a "Copy Code" button.
- If the game is installed, the link triggers a custom protocol handler: `robotuprising://import/RU1.S2R1K1.M7.eJxVUk1...`
- The web preview page also renders the QR code for mobile cross-device import.

**Short URL variant:** `https://robotuprising.game/c/X7K9P2` — optional shortlink backed by a CDN-cached key-value store (not a traditional backend). The shortlink resolves to the full config code via a static JSON lookup file deployed to a CDN. New codes are added via CI/CD. This bends but doesn't break the "no backend" constraint.

### Discord Embed Integration

When a Config Code URL is pasted in Discord, the server returns OpenGraph metadata:

```
Robot Uprising Config — "Relay Chain v3"
🔵🔵📡⚔⚔ — Mission 7
Author: stellarforge
Units: 2× Scout, 1× Relay, 2× Striker
```

The embed shows unit emoji, mission context, and author — making Discord channels browsable for configs without clicking every link.

---

## Player Journeys

### Journey: Sofia, 15, Mobile Casual Player

**Context:** Just beat Mission 5 (factory introduction). Excited about her first self-designed architecture. Wants to show her friend Mika.

**Minute 0:00 — The Export Moment**
Sofia taps the new "Share" icon in the top-right of the Plan screen — a small upward arrow inside a circle, colored cyan. A bottom sheet slides up with three options: "Copy Code," "QR Code," "Link." She taps "Copy Code."

The screen flashes briefly — a ripple effect emanates from the Share button, and a toast notification slides down from the top: "Config Code copied! — RU1.S1R1K1.M5" in a dark pill-shaped badge with a checkmark icon. The composition summary `S1R1K1.M5` appears in amber text, matching the game's terminal aesthetic.

Sofia switches to WhatsApp. Long-press. Paste. The code appears:
```
RU1.S1R1K1.M5.eJxNjkEOgCAQQ6_SuHclvgYnMA...
```

It's about 400 characters — fits comfortably in a WhatsApp message. She adds "try this!! the relay is the key 😭" and sends.

**Minute 0:30 — Mika Receives**
Mika opens WhatsApp on her phone. She sees Sofia's message. She copies the code. Opens Robot Uprising. Taps the "Import" icon on the Plan screen — a downward arrow inside a circle, positioned next to Share. A text field appears with a large paste area. She pastes.

The workbench BLOOMS. Blueprints materialize one by one — each card slides in from the right with a soft *thup* sound, populating the blueprint list. The production queue fills. Channel wiring lines draw themselves across the map preview. The whole process takes 1.5 seconds, and it feels like the architecture is ASSEMBLING itself.

A confirmation banner reads: "Imported 'Sofia's M5 Config' — 1 Scout, 1 Relay, 1 Striker." Below it, a subtle warning in amber: "This config was designed for Mission 5. You are currently on Mission 5. ✓"

Mika examines Sofia's relay config. She sees the compress skill equipped, the hook wired to "threat-net," the eviction priority set to age-first. "Oh THAT's how compress works," she thinks. She hits EXECUTE to watch it play out.

**Minute 2:00 — The Teaching Moment**
The sealed watch runs. Mika watches Sofia's relay compress scout reports and forward them to the striker. The striker receives clean, compressed intelligence and strikes precisely. Mission succeeds.

Mika goes back to Plan. She modifies one rule — changing the relay's eviction priority from age-first to urgency-first. She exports her modified version. Sends it back to Sofia: "i changed the eviction priority, try this version." A conversation emerges. They're doing code review via WhatsApp, trading config codes back and forth. Neither of them knows they're learning distributed systems design.

**UI Annotations:**
- Share button: top-right of Plan screen, cyan arrow-in-circle, 32×32px touch target (48×48 hitbox)
- Share bottom sheet: three options in vertical list, each with icon + label + one-line description
- Copy confirmation toast: 2-second duration, dark background, amber composition text, checkmark
- Import field: full-width text area, auto-detect on paste, "Paste config code" placeholder
- Blueprint materialization: 300ms staggered entry per blueprint, left-to-right, *thup* per card

---

### Journey: Marcus, 38, Factorio Veteran, PC

**Context:** 200 hours in. Deep into Mission 9. Has a complex 7-blueprint architecture with a Command agent managing two relay networks. Active on the Robot Uprising subreddit.

**Minute 0:00 — The Reddit Post**
Marcus opens Reddit on his second monitor. Someone has posted: "Can't beat M9 — my command agent keeps getting overloaded. Config code: `RU1.S3R2K2C1.M9.eJxVU01u...`"

Marcus copies the code. In-game, he opens Import. Pastes. The workbench loads a 7-blueprint architecture with a Command agent. He immediately opens the Command blueprint and examines the rules. He spots the problem in 10 seconds: the Command's context config listens to ALL channels. Every message from every unit floods the Command's 14-slot buffer.

**Minute 1:00 — The Fix and Re-Export**
Marcus modifies the Command's context config: ignore "recon-raw" and "terrain-data" channels — only listen to "threat-summary" (the relay's output) and "status" (unit health). He tests it. The Command stays clean. Mission succeeds.

He exports the fixed version. The Share screen on PC is a modal dialog (not a bottom sheet — this is desktop). Three columns: "Code" (the raw text, with a "Copy" button), "Link" (a clickable URL), and "QR" (a rendered QR code with the Robot Uprising logo watermark).

Marcus copies the code AND the link. He opens Reddit, replies to the post:

> Your Command is listening to everything. Fixed config — I set it to only listen to threat-summary and status:
>
> `RU1.S3R2K2C1.M9.eJxVU02O...`
>
> [Preview link](https://robotuprising.game/c/RU1.S3R2...)
>
> The key change: Command context config → ignore recon-raw, terrain-data. Let the relays do their job.

The preview link generates a Discord/Reddit embed showing the composition and his username. Other players can preview without importing.

**Minute 3:00 — The Comparison**
The original poster replies: "That worked! But why does your version use 3 scouts instead of 2?"

Marcus realizes the code comparison problem. He opens both configs side by side (his and the original) using the game's built-in DIFF view — accessible from the Import screen by holding Alt while pasting a second code. The diff highlights changes in amber (modified) and red (removed) overlaid on the blueprint cards. Rules that changed show the old value struck through above the new value. This diff view is the equivalent of `git diff` for attention architectures.

**UI Annotations:**
- PC Share modal: 600×400px centered dialog, three-column layout, dark background, cyan accent
- Code column: monospace text area with line numbers, "Copy" button glows on hover
- Link column: clickable URL with preview thumbnail, "Open in Browser" secondary action
- QR column: 200×200px QR code with logo overlay, "Save as PNG" button below
- Diff view: split-panel layout, original left / modified right, amber highlights for changes, red for removals, green for additions, rule-level granularity

---

### Journey: Kwame, 32, Streamer, PC + Stream Deck

**Context:** Streams Robot Uprising 3x/week. Running a "Community Config Challenge" segment where viewers submit configs via Twitch chat and Kwame plays them live.

**Minute 0:00 — The Chat Flood**
Kwame announces the segment. Twitch chat erupts with config codes. The codes are short enough to paste in chat because most viewers are on Missions 5-7 (mid-game configs, 400-600 characters). A few late-game codes get cut off by Twitch's 500-character limit — those viewers paste in the Discord channel linked in the stream description instead.

Kwame's custom Twitch bot (built using the documented Config Code format) detects codes starting with `RU` in chat. It automatically decodes the composition header and posts a summary:

> @stellarforge submitted: S2R1K1 — Mission 7 (2 Scouts, 1 Relay, 1 Striker)

The bot maintains a queue. Kwame sees the queue on his Stream Deck LCD screen.

**Minute 0:30 — The Import**
Kwame clicks the next entry on the Stream Deck. The bot sends the code to the game via a local WebSocket connection (the game exposes a localhost API for tool integration — documented in the modding spec). The workbench populates automatically. No copy-paste needed.

The stream overlay (built with the game's spectator API) shows the composition in large text: `stellarforge's Config — S2R1K1 — M7`. Below it, a simplified blueprint diagram generated by parsing the Config Code JSON.

**Minute 1:00 — Live Diagnosis**
Kwame hits EXECUTE. The sealed watch runs. The config fails — the striker never receives scout data because the relay's hook is misconfigured (wrong channel name). Kwame switches to Inspector. He traces the signal chain, finds the broken link, and narrates his diagnosis to 400 viewers.

He fixes the config, re-exports, and the bot posts the fixed code back to chat with a diff summary:

> @stellarforge's config FIXED: changed RELAY-A hook channel from "recon" to "threat-net" — [import code: RU1.S2R1K1.M7.eJx...]

**Minute 3:00 — The Highlight Clip**
The best moment — discovering the bug, the "oh!" reaction, the one-line fix — is clipped by a viewer and shared on Twitter. The clip includes the Config Code as an overlay. New players watching the clip can pause and copy the code. The code IS the content. The encoding format IS the viral medium.

**UI Annotations:**
- Twitch bot: regex pattern `RU\d\.[A-Z0-9]+\..+` for code detection in chat
- WebSocket import API: `ws://localhost:8764/import` — accepts raw Config Code string
- Stream overlay: composition + blueprint diagram auto-generated from decoded JSON
- Stream Deck integration: LCD shows queue with composition summaries, one-tap import
- Clip overlay: semi-transparent code bar at bottom of screen, 80% opacity, monospace font

---

### Journey: Dr. Reyes, 45, CS Professor, Classroom Setting

**Context:** Uses Robot Uprising as a teaching tool for a sophomore "Distributed Systems" course. 30 students, each on laptops. She wants to distribute a pre-configured architecture for a lab exercise.

**Minute 0:00 — The QR Code Handout**
Dr. Reyes has prepared a worksheet. At the top of the page, a large QR code — rendered by the game's "Export as QR" feature, with the Robot Uprising logo watermark in the center and "SCAN TO IMPORT" in angular terminal font below. The composition summary reads: `S2R2K1C1 — Mission 8 (Broken)`.

The lab exercise: "This architecture has 3 intentional flaws. Find and fix them. Export your fixed config as a code and submit via the course LMS."

Students scan the QR code with their phones (the mobile game's Import screen has a camera button that activates the QR scanner). The config loads. They see a 6-blueprint architecture with a Command agent. They begin hunting for bugs.

**Minute 10:00 — The Submission**
Student Anika finds all three flaws. She exports her fixed config. The code is `RU1.S2R2K1C1.M8.eJxVU...` — about 900 characters. She pastes it into the LMS text field.

Dr. Reyes has written a grading script (in Python, 30 lines) that:
1. Strips the header: `code.split('.', 3)[3]`
2. Decodes: `json.loads(zlib.decompress(base64.urlsafe_b64decode(payload + '==')))`
3. Compares the student's JSON to the reference solution JSON
4. Generates a diff report showing which rules/hooks/configs the student modified

The script runs in seconds. 30 submissions graded automatically. The format's openness (documented JSON schema) makes this possible. If the format were opaque binary, Dr. Reyes couldn't build this tool.

**Minute 15:00 — The Discussion**
Dr. Reyes projects three students' solutions side by side using the game's multi-import diff view. All three fixed the flaws differently. One student changed rules. Another changed hooks. A third rewired the entire relay topology. "This," Dr. Reyes says, "is why distributed systems have multiple valid architectures."

**UI Annotations:**
- QR export: "Export as QR" button in Share modal, generates 300×300px PNG with logo watermark
- QR scanner: camera button on Import screen, activates device camera, auto-detects and imports
- Grading script: Python stdlib only (json, zlib, base64), no game-specific library needed
- Multi-import diff: Import screen accepts multiple codes via tab-separated paste, renders side-by-side

---

## Interaction Effects

### With Workshop (7.03d)
The Config Code is the Workshop's storage unit. Every Workshop entry IS a Config Code plus metadata (title, description, tags, author, screenshots, ratings). The Workshop search indexes the decoded JSON — you can search for "configs using compress skill" or "configs with 3+ relays" because the format is structured and parseable.

### With Async Challenges (7.03)
Puzzle Box challenges embed a Config Code for the "broken" architecture plus constraint metadata (modification budget, allowed modifications). The challenge format wraps the Config Code: `RU-CHALLENGE.{budget:2,allow:["rules","hooks"]}.RU1.S2R1K1.M7.eJx...`

### With Config Necropsy (7.10)
Necropsy artifacts include the Config Code of the analyzed architecture plus annotated Inspector data. The code allows anyone reading a necropsy to import the exact architecture and reproduce the failure. "Here's the config that failed. Here's why. Import it and see for yourself."

### With Demo-to-Full Migration (6.11a)
The Config Code IS the migration format. Browser demo exports a code. Full game imports it. No server needed. The "Export Code" migration path (Model A from 6.11a) uses this exact format.

### With Leaderboards (7.05)
Each leaderboard entry includes the Config Code that produced the score. "How did rank #1 do it?" Click → code → import → study. Transparency breeds learning. This is the Opus Magnum histogram philosophy: scores are meaningless without the solution.

### With Version Migration
When the game ships an update that adds new skills or changes rule semantics, the question is: do old Config Codes still work? The JSON + additive schema approach means YES, with graceful degradation. Old codes load fine — new features simply aren't present. New codes on old clients show warnings for unrecognized elements. The composition header remains valid across versions because unit types are stable (locked).

### With Modding (7.04)
Custom skills, custom trigger types, custom unit types — mods extend the game's primitive vocabulary. Config Codes from modded games include mod-specific IDs. The format handles this naturally: unknown IDs in JSON are preserved on decode and can be re-encoded. A modded code imported into vanilla shows warnings but doesn't crash.

---

## Comparable Games

### Factorio Blueprint Strings
**Format:** `0` + base64(zlib(JSON)). The gold standard. Created one of gaming's richest community ecosystems. Key lesson: **the format's simplicity IS the feature.** Anyone with Python can decode a Factorio blueprint. This spawned FactorioPrints, blueprint.tmin10.ru, dozens of Reddit bots, browser extensions, and a culture of sharing. Robot Uprising's format should aim for this level of openness.

Factorio's format is ~2-10 KB for complex blueprints. Robot Uprising's architectures are simpler (no spatial layout, no belt/inserter placement) so codes should be shorter. But Factorio proved that "long" codes work — players don't mind 2 KB strings because the import UX is seamless.

### Hearthstone Deckstrings
**Format:** varint-encoded binary + base64. Compact enough for Twitch chat (~100-150 chars for a 30-card deck). Key lesson: **card IDs as integers enable extreme compression.** Hearthstone's design — flat list of IDs, grouped by copy count — is ideal for flat data but can't represent Robot Uprising's graph topology. The varint technique is worth borrowing for the binary payload variant.

### Legends of Runeterra Deck Codes
**Format:** varint binary + base32. Key innovation: **grouping by set + faction** before encoding. This creates runs of similar data that compress well. The Robot Uprising equivalent: group by unit type before encoding. All Scout blueprints together, all Relay blueprints together.

### Counter-Strike Share Codes
**Format:** custom alphanumeric encoding of match/crosshair data. Key lesson: **prefixed codes (`CSGO-`) enable auto-detection.** Robot Uprising's `RU` prefix serves the same purpose — bots, tools, and the game itself can detect codes in arbitrary text.

### Animal Crossing QR Codes
**Format:** QR-encoded pattern data for custom designs. Key lesson: **QR codes as physical sharing medium create real-world community moments.** Convention floors covered in QR stickers. Printed cards traded between players. Robot Uprising should lean into this — Config Code QR stickers as convention swag, printed worksheets for classrooms.

---

## Sensory Description

### The Export Moment
When the player taps "Share," a ripple animation emanates from the button — concentric cyan rings expanding outward, like a sonar pulse. The composition summary (`S2R1K1.M7`) appears letter by letter in amber terminal font, each character accompanied by a soft typewriter *click*. The full code materializes below in monospace, scrolling into view like a receipt printing. A final *ding* — the same tone as a completed signal delivery — confirms the code is on the clipboard.

The QR code generation, if selected, is theatrical: the QR modules appear one by one in a spiral pattern from center outward, each module snapping into place with a tiny percussive *tick*. The Robot Uprising logo fades in at the center. The whole animation takes 1.2 seconds and feels like the architecture is being **crystallized into a glyph.**

### The Import Moment
Pasting a code triggers the inverse ceremony. The text in the import field glows amber briefly, then dissolves — the characters scatter and reform as blueprint cards in the workbench. Each blueprint materializes with a *thup* sound and a brief holographic flicker, sliding into its slot. Channel wiring lines draw themselves between blueprints with the Subway Map animation — colored lanes extending tile by tile with a traveling capsule. The production queue fills left to right, each icon dropping into place with a mechanical *clack*.

If the code is invalid, the text field pulses red once. A single error tone — a low, buzzing *bwwwp* — and the text shakes horizontally 3 pixels for 200ms. An error message appears below in red: "Invalid config code — check for missing characters."

If the code is from a newer game version, the field glows amber (not red). A warning tone — a rising two-note *doo-dee* — and the message reads: "This config uses features from a newer version. Some elements may not load correctly. Update recommended."

### The QR Scan
On mobile, activating the QR scanner opens the camera with a cyan-bordered viewfinder. When a Robot Uprising QR code enters the frame, the viewfinder snaps tight around it — the border contracts to hug the QR code's edges — and a cyan pulse washes across the code from top to bottom. A *ping* sound confirms detection. The camera view dissolves into the workbench, and the blueprint materialization ceremony plays.

---

## The TikTok Clip

Split screen. Left half: someone at a convention reaches into their pocket and pulls out a small card. On the card: a QR code with the Robot Uprising logo. They hand it to a stranger.

Right half: the stranger's phone screen. They open Robot Uprising. Tap Import. Tap the camera icon. Point at the card. The cyan viewfinder snaps. *Ping.* The workbench BLOOMS — blueprints materialize, wiring draws itself, the production queue fills. The stranger's eyes widen.

Cut to: sealed watch. The imported architecture executes flawlessly — scouts scatter, relays compress, strikers eliminate. Mission complete.

Overlay text: "he just handed me a W"

15 seconds. The code IS the moment.

---

## Open Questions

1. **Maximum code length policy.** Should the game enforce a maximum code length (e.g., 4000 characters)? This caps architecture complexity for sharing purposes. Or should arbitrarily complex configs be shareable?

2. **Code signing.** Should Config Codes be signed to prevent tampering? A player could manually edit the JSON to create an "impossible" config (e.g., 20 skill slots on a Scout). Validation on import catches this, but signed codes could indicate "this was exported from a real game session."

3. **Partial configs.** Should the format support sharing a single blueprint (not a full architecture)? A "relay blueprint" shared independently, importable into any architecture? This requires a subset encoding format.

4. **Replay embedding.** Should a Config Code optionally embed a replay seed? "Import this config AND watch it run on the exact scenario I ran." The code becomes a complete reproducible experiment.

5. **Compression algorithm.** zlib is ubiquitous but not the most compact. Brotli achieves 20-30% better compression on small payloads. But Brotli browser support, while widespread, isn't universal. zlib is safer.

---

## New Aspects Discovered

- **7.03a-i — Partial blueprint sharing format:** encoding a single blueprint (not full architecture) for import into existing configs; template marketplace implications; "install this relay blueprint" as atomic community content unit
- **7.03a-ii — Config Code diff visualization:** side-by-side comparison of two Config Codes showing rule/hook/channel changes; the "git diff for attention architectures" design; integration with Inspector comparison views
- **7.03a-iii — Replay seed embedding in Config Codes:** optional replay seed + scenario ID appended to config code, enabling reproducible experiments; "import my config AND my exact battle" as a community debugging tool; interaction with invisible randomization (locked)
- **7.03a-iv — Config Code analytics and popularity tracking:** CDN-based resolution counting for shortlinks; import frequency as Workshop discovery signal; trending configs; privacy implications of tracking code resolution
- **7.03a-v — Config Code as pedagogical artifact format:** classroom-specific extensions (assignment metadata, constraint annotations, grading rubric hints embedded in code metadata); the "lab worksheet" Config Code variant for educational contexts
