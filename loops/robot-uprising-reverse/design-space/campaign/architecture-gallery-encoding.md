# Architecture Gallery Encoding Format: Shareable Strings Without a Backend

**Aspect:** 5.20e — Encoding a full architecture (blueprints + channels + production queue + context configs) as a shareable string without a backend; Factorio blueprint strings as model; length constraints for Discord/Reddit sharing; QR codes for physical sharing

**Category:** campaign
**Wave:** 5 — Campaign & Progression

---

## The Core Design Problem

Robot Uprising is a web-based game with no backend. No database, no server, no user accounts. The player's creative artifact — the attention architecture — lives in browser state. And yet the entire community layer (5.21 open-source architecture, 7.03 async challenges, 7.10 config necropsies) depends on architectures being portable. They must move from one browser to another, from one player's workbench to another's import dialog, through the narrow channels where communities actually live: Discord messages, Reddit posts, Twitter replies, Twitch chat, forum threads, text messages, and sometimes physical paper at meetups and conventions.

The encoding format is the connective tissue. Get it wrong and sharing is friction-heavy, error-prone, and ugly. Get it right and sharing becomes invisible — the string IS the architecture, portable as a URL, legible enough to skim, compact enough to paste.

The Factorio precedent is instructive. Blueprint strings are Base64-encoded, zlib-compressed JSON prefixed with a version byte. They range from a few hundred characters for a single assembler to tens of thousands for a megabase production line. The community built an entire ecosystem of sharing tools on top of this format: FactorioBin, Factorio.school, FactorioPrints, browser extensions that render blueprint previews inline. The format was never designed for beauty — it was designed for reliability, and the community handled everything else.

But Robot Uprising has a different constraint profile. Factorio blueprints encode spatial layouts — grid positions of hundreds of entities with their recipe and wiring connections. Robot Uprising architectures encode behavioral specifications — a handful of blueprints (5-8), each with a small rules set, a few hooks, a context config, and the channel topology connecting them. The data is structurally simpler but semantically denser. A relay's rule ordering matters. A channel name carries meaning. The production queue position implies strategic intent.

The question: what encoding format produces strings that are short enough for Discord, robust enough for copy-paste, and meaningful enough that advanced players can glance at the encoded form and extract information?

---

## The Data Model Being Encoded

Before choosing a format, the payload must be defined precisely. A full architecture contains:

**Per blueprint (up to 8 per architecture):**
- Unit type (1 of 5: Scout, Striker, Relay, Specialist, Command)
- Skills equipped (2-4 per unit, drawn from a catalog of ~20)
- Rules (ordered condition-action pairs, 2-8 per blueprint)
- Hooks (1-6 slots depending on unit type, each wired to a named channel with send/listen direction)
- Context config (buffer size allocation, priority weights, eviction policy)

**Architecture-level:**
- Channel definitions (named pipes, typically 3-8 channels)
- Production queue (ordered list of blueprint references with count)
- Optional metadata (name, author, target mission, version tag)

**Estimated uncompressed JSON size:** A mid-complexity architecture with 5 blueprints, 6 channels, 15 rules total, and a 7-unit production queue runs approximately 2-4 KB of minified JSON. A maximal architecture with 8 blueprints, 8 channels, 40 rules, and a 12-unit queue runs 6-10 KB.

---

## Four Encoding Approaches

### Approach A: Base64-Compressed JSON (The Factorio Model)

**How it works:** Serialize the architecture to JSON, strip whitespace, apply zlib/deflate compression, encode the result as Base64 with a version prefix byte.

**Example output:**
```
RU1:eJzNV8tu2zAQvBfoPyhA0YuBnBw7TpwEaFG0PRQo0DuXWpFrkVSWlG3/
fUmKlCzLidMi6MkSd2dnZpdcO0SY8sCviBTBDJYghBUSwfAB...
```

**Length analysis:**
- Simple architecture (3 blueprints, 4 channels): ~180-300 characters
- Medium architecture (5 blueprints, 6 channels): ~400-700 characters
- Complex architecture (8 blueprints, 8 channels, 40 rules): ~900-1500 characters
- Maximum theoretical: ~2000 characters

**Sharing channel fit:**
- Discord message limit: 2000 characters. Medium architectures fit. Complex ones are tight.
- Reddit comment: 10,000 characters. All architectures fit easily.
- Twitter/X post: 280 characters. Only the simplest single-blueprint exports fit.
- QR Code: Version 40 (largest) holds 4,296 alphanumeric characters. All architectures fit.
- Twitch chat: 500 characters. Only simple architectures or single blueprints.

**Strengths:**
- Battle-tested. Factorio proved this works for millions of players. The community knows how to handle Base64 blobs.
- Lossless. The architecture is perfectly reconstructed on import. No ambiguity, no parsing errors.
- Version-prefix allows format evolution. `RU1:` today, `RU2:` tomorrow with new fields, old strings remain importable.
- Compression handles repetitive structure well — identical rule patterns across blueprints compress significantly.
- Trivial to implement. Every browser has `btoa`/`atob`, `CompressionStream`, and `JSON.parse`.

**Weaknesses:**
- Opaque. The string is meaningless to human eyes. You cannot glance at `eJzNV8tu2zAQ` and know anything about the architecture it encodes.
- Copy-paste fragility. Base64 strings break on line wrapping. A Discord message that word-wraps in the middle of the string produces a broken import. Trailing whitespace, leading newlines, URL-unfriendly characters (`+`, `/`, `=`) all cause issues.
- No partial import. You either get the whole architecture or nothing. Cannot extract a single blueprint from the string without decoding the entire payload.
- Aesthetic hostility. Pasting a 700-character Base64 blob into a Discord channel feels like spam. It doesn't invite engagement — it looks like an error log.

### Approach B: Custom DSL (The Pokemon Showdown Model)

**How it works:** Define a human-readable domain-specific language where the architecture is encoded as structured text. Each blueprint is a named block. Rules are written in a compressed condition-action syntax. Channels appear as wiring declarations.

**Example output:**
```
=Whisper Net v2=
@mission:7 @ticks:9 @by:kai

[SCOUT "Ghost"] patrol,evade
  recon-net>send danger-ping<listen
  ?enemy.near → evade
  ?signal.recon-net → patrol
  ctx: buf=4 pri=threat evict=oldest

[RELAY "Hub"] compress,filter
  recon-net<listen strike-net>send cmd-net>send danger-ping<listen
  ?buffer.full → compress
  ?signal.danger-ping → filter+forward.strike-net
  ctx: buf=6 pri=recency evict=lowest-fidelity

[STRIKER "Fang"] engage,flank
  strike-net<listen kill-confirm>send
  ?signal.strike-net.target → engage
  ?enemy.visible+no-signal → flank
  ctx: buf=3 pri=proximity evict=oldest

queue: Ghost Ghost Hub Fang Fang
channels: recon-net, strike-net, cmd-net, danger-ping, kill-confirm
```

**Length analysis:**
- Simple architecture: ~300-500 characters
- Medium architecture: ~600-1200 characters
- Complex architecture: ~1500-3000 characters

**Sharing channel fit:**
- Discord: Medium architectures fit comfortably inside a code block. Complex ones may need two messages or a paste service.
- Reddit: All fit. The formatted text renders beautifully in code blocks.
- Twitter/X: Only the simplest single-blueprint blocks. But a screenshot of the DSL text is highly readable.
- QR Code: All fit in Version 40, but the string is longer than compressed JSON for the same payload.

**Strengths:**
- Human-readable. A player who knows the game's vocabulary can read a DSL-encoded architecture and understand its strategy without importing. "Two scouts on recon-net, one relay hub compressing into strike-net, two strikers." The string is the documentation.
- Community vocabulary. The DSL creates shared language. When someone says "I'm running a `?buffer.full -> compress` on my relay," everyone knows exactly what that means. The encoding format becomes the lingua franca for discussing configs.
- Partial extraction. You can copy just the `[SCOUT "Ghost"]` block and import a single blueprint. You can manually edit a rule in the DSL and re-import. The string is the config.
- Aesthetic. A DSL-encoded architecture in a Discord code block looks like it belongs there. It invites reading, discussion, and modification. It is not spam — it is content.
- Diff-friendly. Two DSL strings can be compared with standard text diff tools. Config necropsies (7.10) can show version evolution as text diffs. `git diff` works on architecture history.

**Weaknesses:**
- Parser complexity. A custom DSL requires a parser, and parsers have bugs. Edge cases in rule syntax, special characters in names, encoding of non-ASCII channel names — all require defensive parsing.
- Longer strings. The DSL is typically 2-3x longer than compressed Base64 for the same architecture. Complex architectures may exceed Discord's 2000-character limit.
- Versioning is harder. Adding a new game feature (a new skill, a new context config option) requires extending the DSL syntax without breaking existing strings. Compressed JSON handles this naturally with optional fields.
- Ambiguity risk. Does `?enemy.near+signal.recon-net` mean AND or OR? What does `→` do differently from `->` or `=>`? The DSL must be precise, and precision is hard to maintain as the game evolves.
- Player-authored errors. If players manually edit DSL strings before sharing (which the format invites), they may introduce syntax errors that produce confusing import failures.

### Approach C: Hybrid Header + Compressed Payload

**How it works:** Combine approaches A and B. A human-readable header provides glanceable metadata, followed by a compressed payload containing the full architecture specification.

**Example output:**
```
[RU1] Whisper Net v2 | 2S/1R/2K | ch:5 | M7:9t
eJzNV8tu2zAQvBfoPyhA0YuBnBw7TpwEaFG...
```

The header is not parsed for import — the compressed payload contains everything. The header is purely for human consumption: what's in this string before I import it?

**Header format:**
- `[RU1]` — version tag
- Architecture name
- Unit composition shorthand (`2S` = 2 Scouts, `1R` = 1 Relay, `2K` = 2 Strikers, `1P` = 1 Specialist, `1C` = 1 Command)
- Channel count
- Performance badge (mission and tick count)

**Length analysis:**
- Adds ~40-80 characters to the Base64 approach. Total strings run ~250-1600 characters.

**Sharing channel fit:**
- Discord: The header wraps naturally. The payload can go on a second line. Medium architectures fit. Complex ones are tight but workable.
- Reddit: Excellent. Header as text, payload in a code block.
- Twitter/X: The header alone is tweetable. Link to the full string in a reply.

**Strengths:**
- Best of both worlds. Glanceable metadata for scrolling through a Discord channel. Full lossless data for import.
- The header creates a micro-summary culture. Players start recognizing compositions at a glance: "Oh, a 3S/2R/1K — that's a heavy-intel build."
- The header can evolve independently from the payload. Add new metadata (author, Gauntlet rank, pattern tags) without touching the compression format.
- Low implementation cost. Same JSON+zlib+Base64 pipeline as Approach A, plus a simple string concatenation for the header.

**Weaknesses:**
- Redundancy. The header duplicates information in the payload. If they disagree (player manually edited the header), which is authoritative? The payload must always win, meaning the header can lie.
- Still opaque payload. The strategic content — rules, hooks, wiring — remains hidden in the compressed blob. You can see "2 Scouts, 1 Relay" but not what the relay does.
- Header format debates. The community will argue about what belongs in the header. Unit counts? Skill names? Channel names? Author? Mission? Every addition makes the header longer and noisier.

### Approach D: URL-Encoded State (The Playground Model)

**How it works:** Encode the architecture as URL query parameters pointing to a web-hosted architecture viewer. Since Robot Uprising is already a web app, the architecture string can be a URL fragment that the game's own page interprets.

**Example output:**
```
https://robotuprising.game/#arch=eJzNV8tu2zAQ...
```

Or with a URL shortener:
```
https://ru.gg/a/kW9xQ
```

**Length analysis:**
- The URL itself is ~50 characters plus the Base64 payload. Total: ~250-1650 characters.
- With a shortener service: ~25 characters regardless of architecture complexity.

**Sharing channel fit:**
- Discord: URLs auto-embed. If the game's web page supports Open Graph meta tags, the shared URL renders as a rich embed showing the architecture name, unit composition, and a preview image of the channel topology.
- Reddit: URLs render as clickable links with preview cards.
- Twitter/X: URLs fit in any tweet. Rich embed shows the architecture preview.
- QR Code: A shortened URL is trivially encodable as a small QR code (Version 2-3, easily printable on a business card).

**Strengths:**
- Richest sharing experience. URLs auto-preview on every platform. No copy-paste-into-import-dialog needed — click the link, the architecture loads in the viewer.
- QR codes for physical sharing. Print the QR on a sticker, a card, a con badge. Scan it, the architecture opens in your browser. This creates a physical-world sharing mechanic that no other encoding approach supports.
- Link shortener enables stable references. Community resources can reference architectures by short URL. Forum posts don't break when the format evolves because the URL redirects.

**Weaknesses:**
- Requires a web presence. The game must be hosted at a stable URL. If the domain expires, every shared link breaks. Every shared QR code becomes a dead end.
- Shortener requires infrastructure. The `ru.gg/a/kW9xQ` model requires a URL shortener service — which is a backend. The whole premise of this aspect is no backend. Without a shortener, the URL is just as long as the raw Base64 string.
- Platform-dependent rendering. Discord's embed preview works differently from Reddit's card from Twitter's unfurl. Testing and maintaining rich previews across platforms is ongoing work.
- Fragile under platform changes. When Discord changes its embed rendering (which it does regularly), architecture previews may break.
- Fragment-based encoding (`#arch=...`) doesn't survive all sharing channels. Some platforms strip URL fragments. Some URL shorteners don't preserve them.

---

## Three Player Journeys

### Journey 1: Mara, 19, Posts Her First Architecture to Discord

**Context:** Mara just beat Mission 7 in 11 ticks using a relay-chain architecture she's proud of. She wants to share it in the game's Discord `#architectures` channel. She's using the Hybrid Header + Compressed Payload format (Approach C).

MARA clicks the "Share" icon in the channel map panel — a small antenna icon in the top-right corner. The screen responds immediately: the channel topology diagram freezes, a subtle pulse of cyan radiates outward from the antenna icon, and a toast slides up from the bottom of the workbench: "Architecture encoded." Two elements are now on her clipboard: a topology diagram image and a text string.

She alt-tabs to Discord, navigates to `#architectures`, and pastes. The message appears:

```
[RU1] relay-chain-v3 | 2S/1R/2K/1C | ch:4 | M7:11t
eJzNV8tu2zAQvBfoPyhA0YuBnBw7TpwEaFGkPRQo0DuXS5FckaS2
/fclKVK2LCdui6AnS9yZnZldcq0QYcICv8JSBLNY...
```

The topology diagram auto-uploads as an attached image. Two scouts feed into a relay hub, which fans out to two strikers and a command agent. The wiring is clean — four channels, no crossing lines.

ANOTHER PLAYER, Dex, scrolls through `#architectures` fifteen minutes later. He sees Mara's post. The header tells him everything he needs to decide whether to import: two scouts, one relay, two strikers, one command. Four channels. Mission 7 in 11 ticks. The topology image shows the wiring shape. He knows from the composition alone that this is an intel-heavy build — two scouts feeding one relay is a compression bottleneck architecture. He's curious whether the relay can handle the throughput.

Dex triple-clicks the encoded string, copies it, alt-tabs to Robot Uprising, and clicks the import field at the bottom of the blueprint library. He pastes. A preview materializes — five blueprint cards appear in a vertical stack, each showing skills, rules, hooks, channel names. The channel map auto-draws itself on the left panel: nodes appear one by one with a soft pop, then channel lines trace themselves between them, colored by channel name. A cyan "Import All" button and a row of individual "Import" buttons beneath each blueprint card.

Dex doesn't want the whole architecture — he just wants Mara's relay config. He clicks "Import" on only the relay blueprint card. It slides into his library with a download-arrow badge in its corner and a tooltip: "Imported from relay-chain-v3."

The whole exchange took 40 seconds. No accounts, no friend requests, no file downloads. Clipboard in, clipboard out.

### Journey 2: Tomasz, 31, Shares a QR Code at a Local Meetup

**Context:** Tomasz runs a monthly board game night at a cafe. Three of the regulars play Robot Uprising. He printed a QR code of his tournament-winning Gauntlet architecture on a business card-sized piece of cardstock. The game uses URL-encoded state (Approach D) with the architecture embedded as a hash fragment.

TOMASZ slides the card across the table to Priya. The card has a clean design — the game's logo in the top-left corner, the architecture name ("Pressure Cooker v4") in a monospace font beneath it, a unit composition line ("3S/2R/1P/1C"), and the QR code filling the bottom two-thirds. The QR code is Version 10 — roughly 3cm square at print resolution. Dense but scannable.

PRIYA pulls out her phone and opens her camera. The QR code resolves instantly — modern phones are fast. Her browser opens to `robotuprising.game/#arch=eJzNV8tu2...`. The page loads the game's viewer in a lightweight mode: no workbench, no board — just the architecture preview. Five blueprint cards arranged in a column. The channel topology diagram rendered as an interactive SVG — she can tap channel lines to see which blueprints they connect. At the bottom, a green button: "Open in Workbench."

She taps it. The full game loads with Tomasz's architecture pre-imported. She navigates to Mission 7, hits Execute, and watches his Pressure Cooker in action. Three scouts flood the enemy's context windows with noise signals — that's the "pressure" in the name. The relay compresses confirmed threats and routes them to a specialist running hack. The command agent orchestrates the timing.

Priya looks up from her phone. "The three scouts on the same channel — that's deliberate noise flooding?" Tomasz grins. "It only works because the enemy's context config uses recency-based eviction. Against priority-based eviction, the noise gets filtered out. That's the meta read."

The card sits on the table between them. Other players at the table pick it up, scan it, and within five minutes all three have Tomasz's architecture in their browsers. The QR code is a physical artifact that spreads an architecture through meatspace — no Discord required, no typing, no passwords.

**What makes this work:** The URL is the format. The QR code is the transport. The phone's browser is the renderer. No app install needed because Robot Uprising is a web game. The entire flow — scan, view, import — happens in the browser. The business card becomes a collectible. Players who bring interesting architectures to meetups earn social capital. The game's community extends into physical space through a 3cm square of printed dots.

### Journey 3: Ren, 26, Imports a Corrupted String from a Reddit Thread

**Context:** Ren found a Reddit post titled "My 6-tick Mission 10 clear — architecture inside." The OP pasted a Base64-encoded architecture string (Approach A) in a code block. But Reddit's markdown renderer mangled the string — a line break appeared in the middle of the Base64 blob, and a trailing space was appended.

REN selects the code block text, copies it, and pastes it into the import field. The field accepts the text. A beat of silence — 300 milliseconds — then the import preview area flashes amber instead of the usual cyan. A validation message appears below the field in a warm amber font:

```
Import failed: invalid encoding at position 247.
Possible cause: line break or extra whitespace in string.
[Auto-fix] [Try anyway] [Cancel]
```

The "Auto-fix" button is the key interaction. Ren clicks it. The game strips all whitespace, newlines, and non-Base64 characters from the pasted string and re-attempts the decode. This time the preview materializes — six blueprint cards, the channel topology, the production queue. A small amber warning badge remains on the preview: "Auto-corrected — verify configuration before deploying."

Ren scans the preview. Everything looks right — the unit composition matches what the Reddit OP described, the channel names make sense, the rule count is plausible. She clicks "Import All."

**What if auto-fix fails?** If the string is truly corrupted (truncated, characters substituted), the auto-fix attempt produces a second error:

```
Import failed after auto-fix: payload integrity check failed.
The string may be truncated or corrupted.
Expected checksum: a7f3. Got: 0000.
[Request from author] [Cancel]
```

The "Request from author" button does nothing technical — it copies a pre-written message to the clipboard: "Hey, I tried importing your architecture string but got a checksum error. Could you re-export and share again? (Robot Uprising import error a7f3/0000)." Ren can paste this as a Reddit reply. The error codes help the author diagnose whether their original export was corrupted or the sharing medium mangled it.

**The sensory experience of failure:** Import failure is not a dead end — it is a diagnostic moment. The amber flash (not red — amber, meaning "correctable") sets the emotional tone: this is a hiccup, not a catastrophe. The auto-fix button feels like the game is helping, not punishing. The pre-written message for the author turns a frustrating dead end into a social interaction — Ren comments on the Reddit post, the author re-exports, the thread gets a second round of engagement. The failure state becomes a community touchpoint.

---

## Interaction Effects

### Community Building

The encoding format is the atomic unit of community. Every Discord channel dedicated to sharing architectures, every Reddit post containing a strategy breakdown, every forum thread arguing about the meta — all of them require architectures to be portable. The format determines the texture of community interaction.

**DSL-readable formats (Approach B) produce discussion-rich communities.** When a player posts an architecture and other players can read the rules inline, the discussion starts immediately: "Why is your relay running `?buffer.full -> compress` instead of `?signal.stale -> evict`?" The string IS the conversation starter. Pokemon Showdown's teambuilder format created exactly this dynamic — players discuss EV spreads and movesets by reading the team paste directly.

**Opaque formats (Approach A) produce screenshot-rich communities.** When the string is unreadable, players compensate by posting screenshots of the workbench, topology diagrams, and replay clips alongside the string. The string is the payload; the screenshots are the pitch. Factorio's community developed this pattern — blueprint strings are always accompanied by a screenshot showing the factory in action.

**Hybrid formats (Approach C) produce skimmable communities.** The header enables rapid scrolling — a player browsing `#architectures` can read twenty headers in thirty seconds and decide which ones to import. Headers become the community's index. Players start optimizing their headers for discoverability: descriptive names, accurate composition shorthand, impressive performance badges.

### Balance and Meta Implications

Architecture sharing accelerates meta convergence. When a dominant strategy exists, encoding portability means it spreads in hours, not weeks. This is the Netdecking Problem from collectible card games — if everyone can copy the best deck, why innovate?

**Mitigation through partial sharing:** The ability to import individual blueprints (possible with DSL and Hybrid formats) but not the full wiring diagram means players get components but must design their own topology. They get the relay config but must figure out where it fits in their architecture. This preserves creative agency while enabling learning.

**Mitigation through mission-specific encoding:** Performance badges in the header (`M7:9t`) bind architectures to specific missions. An architecture optimized for Mission 7 may fail on Mission 8. Sharing format metadata that includes the target mission teaches players that architectures are contextual, not universal.

**Mitigation through version tagging:** If the game's balance patches change skill values or rule semantics, the version prefix (`RU1:`) enables the import dialog to warn: "This architecture was designed for version 1.2. Current version is 1.4. Some rules may behave differently." This converts stale meta strategies into historical artifacts rather than active exploits.

### Campaign Spoiler Concerns

Architecture strings for late-game missions are inherently spoilery — they reveal unit types, skills, and challenge structures that early-game players haven't encountered. The encoding format intersects with this in two ways.

**Opaque formats are naturally spoiler-resistant.** A Base64 blob reveals nothing about its contents. A player scrolling past a Mission 10 architecture string in Discord won't be spoiled because they can't read it.

**DSL formats are naturally spoilery.** A DSL-encoded Mission 10 architecture reveals skill names, channel patterns, and unit compositions that a Mission 3 player has never seen. The string itself is a spoiler.

**Hybrid formats split the difference.** The header reveals composition and mission number (mildly spoilery) while the payload hides details (not spoilery). A player can choose not to read headers tagged with missions they haven't reached.

Community norms will develop regardless — Discord spoiler tags, Reddit flair, forum sections — but the encoding format determines how much information leaks from a glance. The hybrid approach of visible metadata plus opaque payload gives communities the tools to self-moderate without requiring the format itself to enforce spoiler policy.

---

## Comparable Games: Lessons and Divergences

### Factorio Blueprint Strings

Factorio's format is the direct ancestor of Approach A. Key lessons: the version byte prefix saved the game when the blueprint format changed in 0.16 — old strings remained importable through a versioned decoder chain. The community's biggest complaint was string length for large blueprints — some megabase blueprints produced strings exceeding 100,000 characters that crashed Discord bots and broke forum post limits. Robot Uprising's architectures are orders of magnitude smaller (the entire game state is behaviorally dense but data-sparse), so the length problem likely does not apply.

### Pokemon Showdown Teambuilder

Showdown's team export format is the purest example of Approach B. A team is a block of structured text listing each Pokemon's species, item, ability, EVs, nature, and four moves. The format is perfectly human-readable AND machine-parseable. The critical lesson: **the export format became the language of competitive discussion.** Players don't say "I put 252 speed EVs on my Garchomp." They say "Jolly 252 Spe Garchomp" — the DSL's vocabulary infiltrated natural language. Robot Uprising's DSL could achieve the same: "I'm running a `2S/1R/2K` with `compress+filter` on the relay" would become natural shorthand born from the encoding format.

### Slay the Spire Seed Sharing

Slay the Spire seeds are short alphanumeric codes that reproduce a run's random sequence. The format is trivially shareable — 12 characters fit anywhere. But seeds encode input randomness, not player decisions. The shared experience is "play the same hand I was dealt," not "use the strategy I designed." Robot Uprising's architecture strings are the opposite: they encode the player's design decisions with no randomness. The sharing intent is different — "use my solution" rather than "try my challenge."

### Minecraft Structure Blocks and Litematica

Minecraft's community developed multiple encoding formats for structures. NBT files for exact block-by-block reproduction. Litematica schematics for mod-based building guides. The key lesson is format fragmentation: when the game doesn't provide an official sharing format, the community creates multiple incompatible ones. Litematica schematics don't work in vanilla. WorldEdit schematics don't work in Litematica. Players waste time converting between formats. Robot Uprising should ship ONE canonical format from day one to prevent this fragmentation.

---

## Recommendation

**Ship Approach C (Hybrid Header + Compressed Payload) as the canonical format, with Approach D (URL-encoded state) as an optional enhancement if the web hosting is stable.**

The reasoning:

1. **The header gives communities what they need for browsing.** Discord channels become scannable. Reddit posts become skimmable. The header IS the elevator pitch for the architecture.

2. **The compressed payload gives the import system what it needs for reliability.** Lossless reconstruction, version-prefixed, checksummed, tolerant of whitespace corruption with auto-fix.

3. **The DSL (Approach B) is too risky as a canonical format** because it creates a parser maintenance burden and invites player-authored syntax errors. But DSL-style encoding could be offered as a secondary "developer view" in the export dialog — a read-only display showing the architecture in structured text for players who want to read and discuss configs without importing them.

4. **URL encoding (Approach D) is the highest-ceiling approach** but depends on infrastructure that may not exist. It should be implemented opportunistically — if the game has a stable web URL, architecture strings should also be expressible as links. QR codes for physical sharing are a genuine differentiator that no comparable game has explored seriously.

The format should be finalized before the community features (5.21, 7.03, 7.10) are designed in detail, because the encoding format constrains every sharing surface — the workbench export button, the import dialog, the config necropsy viewer, the async challenge publisher, the Gauntlet replay sharing flow. It is infrastructure, not feature. Build it once, build it early, build it right.
