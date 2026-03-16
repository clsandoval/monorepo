# 7.03e — Cross-Platform Sharing Infrastructure

## Overview

Robot Uprising's sharing ecosystem — Config Codes (7.03a), Workshop entries (7.03d), async challenge invitations (7.03), badge histories (6.11d-ii), and replay data — must work seamlessly across every platform the game runs on: Steam PC, web demo (PWA/TWA/Capacitor), mobile native, and eventually console. The game's "no backend" constraint (locked tech stack: React + Pixi.js + Vite, no server) transforms this from a standard cloud-sync engineering problem into a fundamentally different design challenge: **how do you build a shared content ecosystem where every node is a leaf?**

This document explores five architectural approaches to cross-platform sharing, each with different tradeoffs between friction, capability, and the locked no-backend constraint. The core tension: sharing wants a central hub, but the game's architecture is deliberately server-free.

---

## The Five Platform Contexts

Before exploring solutions, map what each platform can and cannot do:

| Capability | Steam PC | Web Demo (PWA) | Android (TWA/Cap) | iOS (Capacitor) | Console (Future) |
|-----------|----------|----------------|-------------------|-----------------|-----------------|
| Clipboard access | Full | Full | Full | Full | None |
| File system read/write | Full | Limited (downloads) | Scoped storage | Scoped storage | Sandboxed |
| QR camera scan | Via external | MediaDevices API | Native camera | Native camera | None |
| Deep linking | Steam protocol | URL | Intent filter | Universal link | Platform-specific |
| Push notifications | Steam | Service Worker (limited iOS) | FCM | APNs | Platform-specific |
| Local storage | Unlimited | 50MB Safari / ~unlimited Chrome | App storage | App storage | Platform-specific |
| Haptic feedback | Controller-dependent | Vibration API (no iOS) | Full | Full | Controller |
| Share sheet / OS integration | None native | Web Share API | Native share | Native share | None |
| Steamworks API | Full | None | None | None | None |

The asymmetry is stark. Steam has Steamworks but no share sheet. Mobile has share sheets but no filesystem. Web has URLs but no persistent storage guarantees. Console has nothing but controllers. **Every sharing mechanism must degrade gracefully across all five columns.**

---

## Approach A: "The Carrier Pigeon" — Config Code as Universal Primitive

### Philosophy

The Config Code (7.03a) is already designed as a self-contained, platform-agnostic string. Approach A leans into this maximally: **the Config Code IS the sharing infrastructure.** No server, no sync, no accounts. Just strings that encode complete game states, passed between humans through whatever channel they prefer — Discord, iMessage, email, handwritten on napkins.

### How It Works

**Sharing flow (any platform):**
1. Player taps SHARE in workbench or post-battle
2. System generates Config Code: `RU1.S2R1K1.M7.eJxVUk1OwzAQvQrKghUV7k5pC0KC...`
3. Platform-appropriate export options appear:
   - **Steam PC:** Copy to clipboard (Ctrl+C), save as `.uprising` file, generate QR code image
   - **Web demo:** Copy to clipboard, Web Share API (opens OS share sheet on mobile browsers), URL with code embedded (`robotuprising.game/c/RU1...`)
   - **Android:** Native share sheet (WhatsApp, Telegram, Discord, SMS, email, QR), clipboard, save file
   - **iOS:** Native share sheet (iMessage, AirDrop, WhatsApp, Discord), clipboard, save file
   - **Console:** Generate QR code displayed on TV screen (phone scans it), dictate 6-character shortcode

**Import flow (any platform):**
1. Player encounters Config Code in the wild (Discord message, Reddit post, friend's text)
2. Platform-appropriate import:
   - **Steam PC:** Paste from clipboard, drag-and-drop `.uprising` file, click `robotuprising://import/...` link
   - **Web demo:** URL auto-imports (`/c/RU1...`), paste into import field, camera QR scan
   - **Android:** Intent filter catches `robotuprising://` links from any app, paste, QR scan
   - **iOS:** Universal Link catches `robotuprising.game/c/...`, paste, QR scan
   - **Console:** Manual shortcode entry via on-screen keyboard, companion app QR relay

### The Shortcode Bridge

For console players and low-bandwidth scenarios, a **6-character alphanumeric shortcode** bridges the gap:

The shortcode `RU-X7K9P2` maps to a full Config Code via a static JSON lookup file hosted on a CDN. Generation works client-side: the game hashes the Config Code to produce the shortcode, uploads the mapping as a static file to a CDN-hosted key-value store (Cloudflare Workers KV, or a simple S3 bucket with predictable paths: `cdn.robotuprising.game/codes/X7K9P2.json`). No dynamic backend needed — just static file hosting.

**Shortcode lifecycle:**
- Generated on first share (deterministic hash, collision-checked)
- Stored as static file on CDN (write-once, read-many)
- 90-day TTL with access-based extension (CDN analytics track GETs)
- Expired codes return "Code expired — ask the author for a fresh one"
- No authentication required to generate or resolve

### Sensory Design

**Export moment:** The SHARE button pulses with a faint cyan glow — the same color as active signal channels. Tapping it triggers a 300ms animation: the current blueprint schematic compresses into a dense glowing cube (like compressing data into a Config Code), the cube rotates once, then dissolves into the platform-appropriate share options that fan out from where the cube was. A crisp, ascending three-note chime — `ping-ping-PING` — plays, the third note a perfect fifth above the first, signaling "message sent." The Config Code string appears in a monospace field with a subtle scan-line animation, like data being written to a terminal.

**Import moment:** When a Config Code resolves successfully, the inverse animation plays: a compressed cube materializes from the import field, expands, and unfolds into the blueprint schematic — skills popping into their slots, rules cascading down the priority list, hook wires snapping into place one by one with tiny spark effects. A descending `PING-ping-ping` chime mirrors the export sound. The Blueprint Codex checks for unknown vocabulary and fires tooltip explanations for any terms the importing player hasn't encountered yet (locked in 7.03d design).

**Failed import (invalid/expired code):** The cube materializes but stutters, fragments into red-tinted shards that scatter and fade. A low buzz — `bzzzt` — plays. The error message appears in amber monospace: `SIGNAL CORRUPTED — CODE UNRESOLVABLE`. No judgment, just a diagnostic framing consistent with the game's AI voice.

### Strengths

- **Zero infrastructure.** No accounts, no servers, no sync conflicts, no GDPR concerns. The game is a local application that generates portable strings.
- **Platform-universal.** Text works everywhere. Copy-paste is the most cross-platform protocol ever invented.
- **Community tool-friendly.** Config Codes are just strings — Discord bots, Reddit bots, fan sites, tier list generators can all parse and display them without any API access.
- **Offline-first.** Import/export works with zero internet (except shortcode resolution and CDN upload).
- **Privacy-preserving.** No tracking, no accounts, no behavioral data. The code IS the content.

### Weaknesses

- **No persistence.** Config Codes are fire-and-forget. If you lose the string, you lose the config. No "my shared configs" library unless the player manually saves them.
- **No social graph.** You can't follow a creator, see their latest uploads, or get notifications when they publish. The Workshop (7.03d) is a local cache of imported codes, not a live feed.
- **No discovery.** Finding interesting configs requires external platforms (Discord, Reddit, fan sites). The game itself can't show "trending configs" without a server.
- **Large configs struggle.** Late-game Command-agent architectures produce 1.4-4KB codes (7.03a). These are too long for comfortable copy-paste, too long for SMS, and borderline for QR codes (Version 25 needed, scanning reliability drops).
- **Console friction.** Typing a 6-character shortcode on a TV with a controller is painful. The QR-on-screen workaround requires a phone.

---

## Approach B: "The Dead Drop" — CDN-Backed Static Sharing Layer

### Philosophy

Extend Approach A with a minimal static infrastructure layer. **No backend server, but use CDN-hosted static files as a shared bulletin board.** Every shared config becomes a static JSON file at a predictable URL. The game's clients are the only writers (via presigned upload URLs or a tiny edge function). The CDN is the only reader-facing infrastructure.

### How It Works

**Architecture:**
```
[Game Client] → POST config.json → [Edge Function (Cloudflare Worker)] → [KV Store / R2 Bucket]
                                                                              ↓
[Any Client] ← GET config.json ← [CDN Edge Cache] ← ← ← ← ← ← ← ← ← ← ← ┘
```

The edge function is stateless — it validates the Config Code format, generates a shortcode, writes the file, and returns. No database, no user tables, no sessions. Total infrastructure: one Cloudflare Worker (~50 lines of code) and one R2 bucket.

**What gets hosted:**
- Config Code JSON files (keyed by shortcode)
- Workshop index files (per-mission, per-tag category listings — regenerated client-side on upload)
- Challenge metadata (scenario ID + constraint set + author shortcode)
- Replay seeds (optional, embedded in config or separate file)

**Workshop as distributed index:**
When a player uploads a config to the CDN, the edge function also appends the config's metadata to a category-specific index file (e.g., `workshop/mission-7/stealth-net.json`). These index files are what the Workshop browser reads. They're eventually consistent — two simultaneous uploads might briefly show stale data, but CDN cache TTLs (5 minutes) keep things fresh enough.

**Cross-platform Workshop experience:**
- **Steam PC / Web / Mobile:** Workshop browser loads index files from CDN, renders Config Cards, supports search/filter/sort locally. Import triggers CDN fetch of full config JSON.
- **Console:** Simplified Workshop with category browsing (no search — controller text entry is too slow). QR codes displayed for each config, allowing phone import. "Send to my game" button generates shortcode + QR for the player's companion device.

### The Companion App Pattern

For console players, a **lightweight companion web app** (`robotuprising.game/companion`) bridges the console's input limitations:

1. Console displays 4-digit pairing code on screen
2. Player visits companion URL on phone, enters pairing code
3. WebSocket connection established (via a relay — the one server-like component, but it's a 10-line WebSocket relay on Cloudflare Durable Objects, no state persistence)
4. Phone becomes a remote control: browse Workshop, scan QR codes, type shortcodes, manage configs
5. Selected configs appear on console within 1-2 seconds via the relay

The pairing code expires after 15 minutes. The relay stores zero data. This is the only component that behaves like a "server," and it's stateless and ephemeral.

### Sensory Design

**Workshop browsing (CDN-backed):** The Workshop loading state is a horizontal scan-line sweeping down the card grid — each row of Config Cards "develops" as the CDN response arrives, like a photograph developing in chemical solution. Cards that loaded from local cache appear instantly (no animation). Cards fetched from CDN have a faint blue loading shimmer. The distinction teaches the player: "this one you've seen before, this one is new from the network."

**Companion app pairing:** When the console displays the pairing code, four large digits glow in the center of a dark screen, surrounded by a slowly rotating circuit-board pattern. Each digit has a faint pulse animation, slightly offset — they look alive, waiting. When the phone connects, all four digits simultaneously flash green, collapse into a single dot, and the dot flies to the top-right corner to become a persistent "phone connected" indicator (a tiny phone icon with a green pulse). The console plays a connection tone — two ascending notes, the second a minor third above the first, warm and assured. The phone vibrates once (100ms).

### Strengths

- **Discovery exists.** Players can browse Workshop without external platforms. Trending configs, mission-specific recommendations, and search work natively.
- **Shortcodes are durable.** Codes resolve to CDN-hosted files, not ephemeral clipboard contents.
- **Community tools get an API for free.** The CDN files are public — any bot or fan site can read `cdn.robotuprising.game/workshop/...` directly.
- **Console is viable.** Companion app solves the input problem elegantly.
- **Costs almost nothing.** CDN reads are fractions of a cent per million. R2 storage is $0.015/GB/month. A 100K-player game's entire Workshop might cost $5/month to host.

### Weaknesses

- **Write coordination.** Multiple clients appending to the same index file simultaneously can cause lost writes. Mitigation: edge function uses conditional writes (If-Match headers), retries on conflict. Acceptable for a game, not for a bank.
- **No real-time.** CDN caches mean a newly uploaded config might not appear in Workshop browse for 5 minutes. Acceptable for a game — Workshop is browsed, not streamed.
- **The companion app is still a server.** Even a stateless WebSocket relay is infrastructure to maintain. If it goes down, console sharing degrades to QR-only.
- **No authentication.** Anyone can upload anything. Moderation relies on community flagging + edge function content validation (format check, size limit, rate limit per IP).
- **Index file size.** A popular mission's index file could grow to 10MB+ with thousands of configs. Pagination needed — index files split into pages of 100 entries each.

---

## Approach C: "The Mesh Network" — Peer-to-Peer Sharing via WebRTC

### Philosophy

If the game refuses to have a backend, make the players BE the backend. **WebRTC peer-to-peer connections allow direct device-to-device config transfer with no server involved** (except for initial signaling, which can use a lightweight STUN/TURN server or even a shared document like a Firebase Realtime Database entry).

### How It Works

**Direct transfer flow:**
1. Player A taps "Share Directly" and generates a session ID (random 6 chars)
2. Player B enters the session ID on their device
3. Both clients connect to a signaling server (Firebase, or a Cloudflare Durable Object) to exchange WebRTC offers/answers
4. Once connected: data channel transfers Config Code, replay data, blueprint thumbnails — any size, zero CDN cost
5. Connection closes after transfer

**"Nearby" sharing (same Wi-Fi):**
On platforms supporting mDNS/Bonjour (desktop, some mobile), the game discovers other Robot Uprising instances on the local network. A "Nearby Players" panel shows discovered peers. Tap to connect — no session ID needed. This enables classroom scenarios (Prof. Adaora's 38 students transferring configs in 60 seconds) and LAN party scenarios.

**Live spectating extension:**
The same WebRTC infrastructure enables live spectating — Player A shares their sealed watch in real-time to Player B's Inspector. The data is lightweight (board state diffs, ~500 bytes per tick). This is the foundation for tournament broadcasting without a streaming server.

### Sensory Design

**Peer discovery:** When "Share Directly" is tapped, the screen dims slightly and a sonar-like radial pulse emanates from the share button — a single expanding cyan ring that fades at the screen edges. Each pulse represents a signaling probe. When a peer connects, a second pulse appears from the opposite screen edge, converging with the first. Where they meet, a golden handshake icon appears with a soft metallic *click*. The two devices are linked.

**Data transfer:** A horizontal progress bar appears between the two connected device icons, filled with flowing cyan particles moving left-to-right (sender) or right-to-left (receiver). The particles look like signal pulses on a hook wire — the game's own visual language for data-in-transit. Transfer complete: the particles converge into a cube (the Config Code compression animation from Approach A), which settles into the recipient's blueprint inventory with a satisfying *clunk*.

**Nearby discovery:** Discovered peers appear as faint holographic unit silhouettes at the edges of the current screen — as if other players' games are physically adjacent. Hovering over a silhouette shows the peer's operator name and current mission. The silhouettes drift slowly, like units on patrol, creating an ambient "there are others here" presence. Audio: a barely-audible low hum when peers are detected, like distant radio chatter — the same frequency as the game's EM emissions system.

### Strengths

- **Zero ongoing cost.** P2P transfers cost nothing. The signaling server handles only the initial handshake (~1KB per connection).
- **Unlimited size.** Replay data (200KB+), screenshot bundles, full career histories — anything can transfer over a data channel with no CDN size limits.
- **Real-time capable.** Live spectating, real-time config collaboration, and tournament broadcasting all use the same infrastructure.
- **LAN-native.** Classroom and LAN party scenarios work even without internet (mDNS discovery + LAN WebRTC = fully offline sharing).
- **Privacy-maximal.** Data moves directly between devices. No server ever sees the content.

### Weaknesses

- **Both parties must be online simultaneously.** No async sharing. Player A can't leave a config for Player B to pick up later. This is the fundamental limitation — and it's severe for a game where sharing is primarily async (Discord, Reddit, Workshop).
- **NAT traversal.** WebRTC works ~85% of the time behind consumer NATs. The remaining 15% need a TURN relay (which IS a server, and TURN bandwidth costs money).
- **No discovery.** You can't browse configs from peers who aren't currently connected. No Workshop, no trending, no recommendations.
- **Console WebRTC support.** Unclear whether console WebViews support WebRTC data channels. May require native SDK integration.
- **Signaling still needs infrastructure.** Even a "serverless" P2P system needs somewhere for peers to exchange SDP offers. Firebase Realtime Database is the simplest option (~$0/month at game scale), but it's still a dependency.

---

## Approach D: "The Federation" — Platform-Native Sharing per Ecosystem

### Philosophy

Instead of one universal sharing system, **embrace each platform's native sharing infrastructure** and build bridges between them. Steam has the Steam Workshop. Mobile has app stores with review/share ecosystems. Web has URLs. Each platform gets its own native experience, and Config Codes are the bridge format that connects them.

### How It Works

**Steam PC:**
- Steam Workshop integration via Steamworks API
- Configs uploaded as Workshop items (thumbnail + Config Code + metadata)
- Full Steam Workshop features: subscribe, rate, comment, collections, curators
- Steam friend list integration: "Send config to friend" via Steam chat
- Steam Cloud sync for career data across machines

**Web Demo:**
- URL-based sharing: every config has a permalink (`robotuprising.game/c/...`)
- Social media embeds (Open Graph tags): Discord, Twitter, Reddit show preview cards with topology diagram + unit composition + mission context
- Browser-native Web Share API for mobile web users
- localStorage-backed personal library (with IndexedDB fallback)

**Android:**
- Google Play Games integration for achievements and social
- Native share sheet produces formatted text + QR image
- NFC tap-to-share (phones touching transfers Config Code via NDEF record)
- Google Drive backup for career data

**iOS:**
- Game Center integration for achievements and leaderboards
- AirDrop for local sharing (auto-opens in-game import)
- iCloud backup for career data
- Universal Links for deep linking from Safari/Messages/Mail

**Console:**
- Platform-specific clip sharing (Xbox Game DVR, PlayStation Share, Nintendo screenshots)
- QR codes on screen for cross-platform export
- Companion app for import (same as Approach B)

### The Bridge Protocol

Cross-platform sharing works because Config Codes are platform-agnostic strings. The bridge protocol defines how each platform's native sharing maps to Config Code operations:

```
Steam Workshop Item → extract Config Code → generate URL → share via any channel
URL → resolve Config Code → import to any platform's native library
QR Code → decode to Config Code → import to any platform
NFC NDEF → decode to Config Code → import to any platform
AirDrop file (.uprising) → extract Config Code → import to native library
```

**The "Send to Another Platform" flow:**
1. Player on Steam wants to share with a friend on mobile
2. Opens Workshop item → taps "Cross-Platform Share"
3. Options: Copy Config Code, Generate URL, Generate QR, Generate Shortcode
4. Friend on mobile: taps URL, scans QR, or enters shortcode
5. Config appears in mobile game's local library

### Sensory Design

**Platform-native share moments:** Each platform's share animation incorporates that platform's visual language while maintaining Robot Uprising's identity:

- **Steam:** The share action plays the standard Robot Uprising cube-compression animation, but the cube is stamped with the Steam logo before dissolving into the Workshop upload progress bar. A brief steam-whistle sound effect (1 second, stylized) acknowledges the platform.
- **iOS AirDrop:** The cube compresses and then radiates outward as concentric blue rings (matching AirDrop's visual language). The recipient sees the rings converging inward, delivering the cube.
- **Android NFC:** The cube compresses, then the screen shows a phone-shaped silhouette approaching from the edge — when the phones touch (NFC range), a spark-flash transfers the cube from one silhouette to the other. A sharp, tactile *tap* sound plays, distinct from the wireless share sounds.
- **QR generation:** The cube compresses, then *shatters* into a grid of black and white fragments that rearrange themselves into a QR code pattern — the data literally becoming its encoding. A mechanical ratcheting sound accompanies the rearrangement. The QR code pulses once with cyan at its center (the Robot Uprising logo).

### Strengths

- **Native-feeling on every platform.** Steam users get Workshop. iOS users get AirDrop. Android users get share sheets. Nothing feels bolted-on.
- **Platform discovery built-in.** Steam Workshop's existing discovery (trending, collections, curators) works immediately with no custom development.
- **Platform social graphs.** Steam friends, Game Center friends, Google Play contacts — each platform's existing social connections become sharing conduits.
- **Cloud save per platform.** Steam Cloud, iCloud, Google Drive each handle save persistence within their ecosystem.
- **NFC is magic.** Two friends at a café tapping phones to trade configs is an unforgettable moment — and a TikTok moment.

### Weaknesses

- **Implementation cost.** Five separate platform integrations, each with its own API, authentication, rate limits, and edge cases. The Steam Workshop API alone is significant development work.
- **Fragmented community.** Steam Workshop configs are invisible to mobile players (and vice versa). Cross-platform bridge protocol mitigates but doesn't eliminate this — Steam Workshop's search/browse doesn't include mobile-origin configs.
- **Platform dependency.** If Steam changes Workshop policies, or Apple rejects AirDrop integration, entire sharing paths break.
- **Inconsistent capabilities.** Steam Workshop supports comments and ratings; the web URL-based system does not. Mobile share sheets can't preserve context beyond the Config Code string itself.
- **Account requirements.** Steam Workshop requires a Steam account. Game Center requires an Apple ID. This contradicts the game's "no accounts" philosophy.

---

## Approach E: "The Mycelium" — Hybrid Federated + CDN Architecture (RECOMMENDED)

### Philosophy

Combine the best of all approaches: **Config Codes as the universal primitive (A), CDN-backed Workshop as the shared discovery layer (B), P2P for real-time and local scenarios (C), platform-native integration where it's free (D).** The result is a layered sharing stack where each layer handles what it's best at, and no single layer is required for the system to work.

### Architecture Layers

```
Layer 4: Platform Native (optional, additive)
         Steam Workshop, AirDrop, NFC, Game Center, Share Sheets
         ↓ bridges via Config Code extraction ↓

Layer 3: Discovery & Browse (CDN-backed)
         Workshop index files, trending algorithms, search
         Static files on CDN, edge function for writes
         ↓ populated by Config Code uploads ↓

Layer 2: Transport (multiple paths)
         Clipboard (universal), URL (web), QR (visual),
         Shortcode (manual), WebRTC (direct), File (.uprising)
         ↓ all carry Config Codes ↓

Layer 1: Config Code (the atom)
         Self-contained, versioned, compressed, platform-agnostic
         The only thing every platform MUST support
```

**Capability matrix by platform:**

| Layer | Steam PC | Web Demo | Android | iOS | Console |
|-------|----------|----------|---------|-----|---------|
| L1 Config Code | Full | Full | Full | Full | Full |
| L2 Clipboard | Yes | Yes | Yes | Yes | Shortcode only |
| L2 URL | Protocol handler | Native | Intent filter | Universal Link | Via companion |
| L2 QR | Generate + scan via webcam | Generate + scan | Full | Full | Generate only |
| L2 WebRTC | Yes | Yes | Yes | Yes | Via companion |
| L2 File | Full | Download only | Scoped | Scoped | USB? |
| L3 Workshop | CDN-backed | CDN-backed | CDN-backed | CDN-backed | CDN-backed |
| L4 Native | Steam Workshop | Web Share API | Share sheet + NFC | AirDrop + Share sheet | Clip sharing |

### Cross-Platform Account Linking

The game has no accounts. But players on multiple platforms need their Workshop uploads, challenge history, and reputation to follow them. Solution: **Operator Fingerprint.**

An Operator Fingerprint is a deterministic hash of the player's career data — mission completion order, first blueprint name, first Config Code hash. It's unique enough to identify returning players across platforms without ever creating an account. When a player imports their save to a new platform (via migration code from 6.11a), their Operator Fingerprint follows.

**Fingerprint usage:**
- Workshop uploads are tagged with the uploader's fingerprint
- Challenge completions are attributed to the fingerprint
- "Follow this creator" subscribes to a fingerprint, not an account
- Fingerprint collision rate: ~1 in 10^12 (effectively unique)

**No server stores fingerprints.** The CDN Workshop index files include uploader fingerprints. The game client computes "am I following this fingerprint?" locally. This is follow-by-polling, not push notification — the Workshop browse screen checks the followed fingerprints' latest uploads on each visit.

### Progress Sync Across Platforms

**Campaign progress** does not sync automatically across platforms. The game is intentionally single-platform-at-a-time:

1. Player plays Steam version, progresses to Mission 7
2. Player wants to continue on mobile
3. Player exports save via migration code (6.11a) — 6-character shortcode or `.uprising` file
4. Player imports on mobile — full campaign state transfers
5. **Conflict resolution:** If both platforms have progressed independently, import shows a diff: "Your Steam save has M7 complete. This device has M5 complete. Import Steam save? (This device's M5-M7 progress and replays will be archived, not deleted.)"

This is deliberately manual, not automatic. Automatic sync requires a server. Manual sync requires 30 seconds of player effort but zero infrastructure.

**Gauntlet rating** is platform-specific. A Steam Gauntlet rating and a mobile Gauntlet rating are separate. Cross-platform Gauntlet would require a central rating server — antithetical to the no-backend constraint. Players can display both ratings on their Operator profile card.

### Workshop Population Strategy

A CDN-backed Workshop needs critical mass to be useful. Strategy:

**Phase 1: Seed with AI-generated configs (pre-launch)**
Generate 200+ configs using the game's own AI benchmarks (from 2.00h variant stress testing). Each covers a specific mission × archetype combination. Tag with "Official" label. These ensure every Workshop category has content on day one.

**Phase 2: Demo Workshop (pre-full-launch)**
The web demo (6.11) shares the same CDN Workshop. Demo players' configs appear alongside full-game configs (tagged "Demo" to indicate limited mission range). This seeds the Workshop during the demo period before full launch.

**Phase 3: Organic growth**
Post-launch, the Workshop's five trending algorithms (7.03d) surface community content. "First upload" achievement encourages sharing. The import ceremony (sensory feedback on receiving a config) encourages trading.

### Offline Mode

When the device has no internet:

- **Layer 1 (Config Code):** Fully functional. Generate, copy, paste, share via physical means.
- **Layer 2 (Transport):** Clipboard, file, and QR work offline. URL and shortcode require connectivity. WebRTC works on LAN (mDNS discovery).
- **Layer 3 (Workshop):** Last-cached Workshop index files remain browsable. Stale data indicator: amber "LAST SYNCED: 2 HOURS AGO" in Workshop header. Uploads queue locally and push to CDN on reconnection.
- **Layer 4 (Native):** Steam Workshop requires Steam online mode. AirDrop/NFC work offline. Share sheets work offline (sharing to apps that cache locally).

**The "Isolated Node" experience:** A player on an airplane with no Wi-Fi can still: browse cached Workshop configs, generate Config Codes, trade via QR codes with a seatmate playing on another device, play challenges imported before takeoff. The game's theme — autonomous agents with unreliable communication — mirrors the player's own intermittent connectivity. This is a design feature, not a limitation.

### Moderation Without a Server

Community content hosted on CDN needs moderation. Without a server, moderation is reactive:

- **Client-side content validation:** Edge function rejects malformed Config Codes, oversized payloads (>10KB), and rapid-fire uploads (rate limit: 10/hour/IP).
- **Community flagging:** Any player can flag a Workshop entry. Flags are written to a CDN-hosted `flags/` directory. When an entry accumulates N flags (configurable, default 5), the edge function moves it to a `quarantine/` directory — invisible in Workshop browse but still resolvable by direct shortcode.
- **Operator-driven review:** Flagged content review happens via a simple admin web page that reads the `quarantine/` directory. One person with CDN write access can moderate the entire Workshop.
- **Naming filter:** The edge function runs config names and descriptions through a blocklist (hosted as a static file, updatable without code deployment). Blocked content is renamed to "Unnamed Config" with a note: "Name removed by content filter."

---

## Player Journeys

### Journey: Mika, 14, Manila — First Cross-Platform Share

**Context:** Mission 5 just completed on her older brother's PC (Steam version). She built a relay chain she's proud of — three relays in a line compressing scout data into a striker channel. She wants to show her classmate Ana, who plays on a budget Android phone (TWA version from Play Store).

**Minute 0:00 — The Impulse**
Mika's Inspector screen shows her relay chain working perfectly — three green pulse lines forming a crisp pipeline across the board. She screenshots it (Win+Shift+S, muscle memory from Discord). But then she sees the SHARE button in the workbench toolbar — a small cyan icon resembling a broadcast antenna, pulsing gently since she hasn't used it before.

**Minute 0:05 — Export**
She clicks SHARE. Her blueprint schematic — the three-relay pipeline — compresses into a glowing cube at the center of the screen. The cube rotates once, showing miniature skill icons on each face, then dissolves into four export options that fan out like cards:
- **Copy Code** (clipboard icon)
- **Save File** (.uprising icon)
- **QR Code** (grid icon)
- **Share Link** (chain icon)

She hovers over QR Code — the tooltip says "Generate a scannable code. Perfect for sharing in person." She hovers over Share Link — "Copy a web link anyone can open." She picks Share Link.

A URL appears: `robotuprising.game/c/RU1.R3S1K1.M5.eJx...` — long, but below it, in larger text, the shortcode: `RU-M7KP3X`. The ascending `ping-ping-PING` chime plays. She copies the shortcode and sends it to Ana on Messenger: "try this config!! RU-M7KP3X 🤖"

**Minute 0:20 — Ana's Import**
Ana opens Robot Uprising on her phone. In the workbench, she taps the IMPORT button (a small download arrow icon in the toolbar). A modal appears with two options: "Paste Config Code" and "Enter Shortcode." She taps "Enter Shortcode" and types `M7KP3X` (the `RU-` prefix auto-fills).

The phone vibrates briefly (50ms) as the CDN lookup begins. 400ms later: the compressed cube materializes from the import field, accompanied by the descending `PING-ping-ping` chime. The cube expands, unfolding into Mika's relay chain — three relay blueprints appearing one by one in the workbench, hooks snapping into channels with tiny spark effects, the production queue populating left to right. Each relay's context config (listen filters, eviction priorities) configures itself with a soft click.

A Codex notification slides in from the right: "New vocabulary detected: AMPLIFY — a Relay skill that boosts signal strength on a channel. [Tap to learn more]" Ana hasn't unlocked amplify yet — she's still on Mission 4 — but the config imports with amplify equipped, grayed out with a lock icon and a tooltip: "Unlocks at Mission 5. You can see the blueprint but can't deploy it yet."

**Minute 0:45 — The "How Did You Do That" Loop**
Ana screenshots the imported blueprint and sends it back to Mika: "omg how does the relay chain work?? mine just amplifies everything and the striker gets stunned." The cross-platform share has become a learning conversation — Mika explains context filters, Ana modifies the imported config, exports her modified version back. Two players on different platforms, passing Config Codes through Messenger, iterating on a design together.

**UI Annotations:**
- SHARE button: 24×24 cyan antenna icon, top toolbar right of UNDO, 300ms pulse animation on first availability, tooltip "Share this architecture"
- Export options: Fan layout from button position, 4 cards at 15° intervals, each 120×80px with icon + label + sublabel
- Shortcode display: 32px monospace, letter-spaced 4px, amber on dark, with "tap to copy" underline
- IMPORT button: 24×24 download arrow icon, top toolbar left of SHARE
- Import modal: centered 300×200px, dark background, two large tap targets (each 260×60px)
- Shortcode entry: 6-character field with auto-uppercase, `RU-` prefix grayed out and fixed
- Codex notification: right-edge slide-in, 200×60px, dark teal background, 4-second auto-dismiss with "tap to learn" CTA

---

### Journey: Derek, 31, Portland — Steam Workshop to Web Demo Bridge

**Context:** Derek is a Factorio veteran at Mission 8 on Steam. He streams on Twitch (small channel, ~40 viewers). A viewer in chat asks "can I try your config?" The viewer doesn't have Steam — they played the web demo at work.

**Minute 0:00 — The Stream Share**
Derek's Mission 8 config is complex: a Command agent orchestrating 4 blueprints across 3 channels, with a stealth doctrine and a self-replicating scout squad. He opens the Workshop in-game and hits "Upload." The Steam Workshop item creation overlay appears — he names it "PHANTOM LATTICE v3.2" and tags it [stealth-net, command-heavy, mission-8]. The upload completes instantly (Config Code is tiny). His stream overlay shows the Workshop URL.

But the viewer can't access Steam Workshop without Steam. Derek hits the Cross-Platform Share button on his uploaded item. The options appear — he copies the web URL: `robotuprising.game/c/RU1.C1R2S3K2.M8.eJy1Vk2O...`

He pastes it in Twitch chat. The URL has Open Graph metadata — Twitch renders a preview embed card showing the topology diagram (auto-generated from the Config Code), unit composition icons (1 Command, 2 Relays, 3 Scouts, 2 Strikers), and the config name.

**Minute 0:30 — The Viewer's Import**
The viewer clicks the link on their work laptop. The browser navigates to `robotuprising.game/c/...`. The web demo detects an incoming Config Code in the URL. If the viewer already has the web demo open, the config imports directly. If not, the page shows a landing screen:

```
╔══════════════════════════════════════╗
║  INCOMING TRANSMISSION               ║
║                                       ║
║  PHANTOM LATTICE v3.2                ║
║  by OPERATOR-D31K [Mission 8]        ║
║                                       ║
║  [topology diagram renders here]      ║
║                                       ║
║  ┌──────────────────────────────┐    ║
║  │  IMPORT TO WEB DEMO          │    ║
║  └──────────────────────────────┘    ║
║                                       ║
║  ┌──────────────────────────────┐    ║
║  │  IMPORT TO STEAM VERSION     │    ║
║  └──────────────────────────────┘    ║
║                                       ║
║  Config Code: RU-K9X2M7              ║
║  [Copy Code]                          ║
╚══════════════════════════════════════╝
```

The viewer taps "Import to Web Demo." The web demo loads (if not already running), and the config appears in their local library. They can inspect it in the blueprint editor — see Derek's rules, hooks, channel wiring — even though they're only on Mission 3 in the demo. All Mission 8 skills are shown but locked. The config serves as a preview of what's coming — a telescope into the game's depth.

**Minute 1:00 — The "I Need to Buy This" Moment**
The viewer clicks through Derek's Command agent config. They see rules like `IF subordinate_stunned THEN reroute_channel("backup")` — a concept they haven't encountered in Mission 3. They hover over `reroute` — the Codex tooltip explains the skill and shows the animated micro-scenario (from 1.17a) of a Command agent redirecting signal flow around a stunned relay. The viewer types in Twitch chat: "ok buying the full game tonight. this is insane."

The Config Code URL has become a **conversion funnel artifact** — a piece of sharable content that demonstrates the game's depth and drives purchases. Derek's stream has become an unpaid marketing channel, and the sharing infrastructure enabled it without any backend or account system.

**UI Annotations:**
- Cross-Platform Share button on Workshop item: small globe icon next to Steam share options
- Open Graph embed: 400×200px preview card with topology diagram (rendered server-side via edge function generating SVG from Config Code), unit icons, config name, mission indicator
- Landing page: centered 500×600px card, dark background with circuit-board pattern, CRT scan-line effect, two large import buttons
- Config preview in demo: full workbench with all elements visible but locked skills shown with dashed outlines and lock icons (16×16 padlock)

---

### Journey: Prof. Adaora, 52, Lagos — Classroom Config Distribution

**Context:** Prof. Adaora teaches a 38-student Introduction to Distributed Systems course at the University of Lagos. She's been using Robot Uprising as a teaching tool since Mission 1. Today's lab exercise: each student receives a deliberately broken relay configuration and must fix it. She needs to distribute 38 slightly different broken configs (each with a different bug) to 38 students on a mix of laptops and phones, in under 2 minutes.

**Minute 0:00 — Preparation (Night Before)**
Adaora creates 38 configs on her PC — all variants of a 3-relay chain, each with a subtle flaw (one has a wrong channel name, one has conflicting eviction priorities, one has a hook trigger that will never fire, etc.). She exports each as a Config Code and organizes them in a spreadsheet: Student Name | Config Code | Bug Description | Expected Fix.

She then batch-uploads all 38 to the CDN Workshop, tagged "educational" and "unilag-dis-sys-301". Each upload returns a shortcode. She copies all 38 shortcodes into a single QR code (via a free QR batch generator site — the shortcodes are short enough to fit 4 per QR code, or she generates 38 individual QR codes and prints them on a single page).

Alternatively, she uses a simpler approach: she creates a single web page (Google Doc, or a simple HTML file hosted on her university account) listing all 38 shortcodes with student names. Students find their name and copy their code.

**Minute 0:00 — Lab Session**
Adaora displays the QR code grid on the projector. "Find your name. Scan your QR code. Import the config. You have 45 minutes to find and fix the bug. Use the Inspector."

**Minute 0:15 — The Chaos**
12 students on laptops (web demo) scan QR codes using their webcam or type shortcodes. 20 students on phones (mostly Android TWA, some iOS Capacitor) point cameras at the projected QR codes. 6 students who arrived late type shortcodes manually from the projected list.

Each student's config loads within 2-3 seconds. The import animation plays — the cube unfolds into a broken relay chain. Students who got the "wrong channel name" bug see three relays with hook wires that don't connect (the wires end in empty space because the channel names don't match). Students who got the "conflicting eviction priority" bug see a config that looks correct in the editor but fails during execution (the sealed watch shows a relay stunned every 3 ticks from context overload).

**Minute 2:00 — Everyone is Loaded**
38 students, 38 different bugs, 3 different platforms, all loaded via shortcodes resolved from the same CDN. No accounts. No logins. No IT department involvement. Adaora's university firewall doesn't block CDN traffic (it would block game servers). The "no backend" architecture has become an educational feature — there's nothing to block except a CDN serving static JSON files.

**Minute 40:00 — Submission**
Students export their fixed configs as Config Codes and paste them into the university's LMS assignment submission form. Adaora can import each submission on her PC to verify the fix. The Config Code IS the assignment artifact — portable, inspectable, gradeable.

**Post-Session Reflection:**
Adaora writes in her teaching notes: "The cross-platform distribution worked flawlessly for the third week in a row. The shortcode system is the key — students on any device can import in seconds. The QR code projection method is faster than email attachments. I've started creating a library of broken configs organized by distributed systems concept (consensus, partition tolerance, leader election). This game is replacing 3 of my 5 lab exercises."

**UI Annotations:**
- QR scan on mobile: camera opens with Robot Uprising branded overlay (cyan grid lines on viewfinder, "SCANNING FOR TRANSMISSION" text at top)
- Batch import: no special UI — each student imports individually via standard shortcode/QR flow
- Educational tag on Workshop: mortarboard icon (🎓), distinct from gameplay tags, filterable in Workshop browse
- Export for submission: same SHARE flow, but "Copy Code" is the primary action (students paste into LMS text field)

---

## Interaction Effects

### × Config Code Format (7.03a)
The Config Code is the atomic unit of all sharing. Cross-platform infrastructure succeeds or fails based on Config Code portability. Key interaction: Config Code version migration must work across platforms — a v1.2 code from the web demo must import into the v1.3 Steam version. The additive-only schema strategy (7.03a) makes this robust: new fields are ignored by older clients, missing fields use defaults.

### × Workshop Discovery (7.03d)
The CDN-backed Workshop (Layer 3 in Approach E) is the same Workshop designed in 7.03d. Cross-platform adds: each Workshop entry includes a `source_platform` field (steam/web/android/ios/console) enabling platform-specific filtering ("show me configs from mobile players" for controller-friendly designs).

### × Demo-to-Full Migration (6.11a)
Save migration codes are Config Codes with extended payload (career metadata). Cross-platform sharing infrastructure reuses the same transport layer: shortcodes, URLs, QR codes, files all work for migration codes too. The migration ceremony (6.11a Model F) plays regardless of which platform pair is involved.

### × Demo Badge Migration (6.11d-ii)
Badge history transfers via the same Config Code extension mechanism. The Founding Badge tier is computed from the badge payload, not from a server lookup. Cross-platform: a demo veteran badge earned on web demo appears identically on Steam, mobile, or console after migration.

### × Async Challenges (7.03)
Challenge invitations are Config Codes with constraint metadata + scenario ID. Cross-platform: a challenge created on Steam and shared via URL can be played by a mobile user and scored against the same CDN-hosted leaderboard file. The Sealed Submission Window (7.03 Model 4 Daily Seed) uses CDN-synced timestamps.

### × PWA vs. Native Wrapper (6.07a)
The Progressive Ladder (URL→PWA→TWA→Capacitor) gains sharing capabilities at each step: URL = clipboard+links only; PWA = adds Web Share API; TWA = adds native share sheet; Capacitor = adds NFC, AirDrop, full camera QR. Each transition is a sharing upgrade.

### × Companion App (Approach B/E)
The companion web app for console is a stripped-down web demo instance. It can browse Workshop, scan QR codes, manage configs, and relay them to the console via WebSocket. This means the companion app is NOT a separate product — it's the web demo with a "console mode" flag.

### × Haptic Vocabulary (6.06a-c)
Sharing moments have haptic signatures: export = single firm pulse (100ms), import = double pulse (50ms-gap-50ms), failed import = long rumble (200ms descending). These exist only on platforms with haptic capability; audio cues carry the same information on platforms without.

### × Sealed Watch Purity
Sharing is NEVER available during sealed watch. The SHARE and IMPORT buttons are hidden during execution. This preserves the sealed watch's "no tools" principle. Sharing happens in Plan and Inspector phases only.

### × Streaming / Content Creation
Every export generates a stream-friendly moment. The cube compression animation, the topology diagram preview in URL embeds, and the import unfolding animation are all designed to be visually interesting on camera. Streamers sharing configs via their chat channel is a primary content creation loop — cross-platform infrastructure enables it by ensuring viewers on any platform can import.

---

## Comparable Games/Media

### Factorio Blueprint Strings
Factorio uses base64-encoded blueprint strings shared via clipboard, Discord, and fan sites (factorioprints.com). This is Robot Uprising's closest precedent:
- **What works:** Strings are trivially portable, community sites emerged organically (no Wube infrastructure needed), Discord bots decode and preview blueprints inline.
- **What doesn't:** No in-game discovery (factorioprints.com is the only browse experience), no cross-device sync, no mobile experience (Factorio is PC-only). Robot Uprising's CDN-backed Workshop solves the discovery gap.
- **Key lesson:** Community tool builders will fill infrastructure gaps. Design Config Codes to be easily parseable by third-party tools (documented format, no obfuscation).

### Wordle's URL-Based Sharing
Wordle pioneered the pattern of gameplay results shared as plain text (the colored grid emoji). The URL-based sharing became a cultural phenomenon:
- **What works:** Zero-friction sharing (copy text, paste anywhere). The shared format is both readable by humans and importable by the game.
- **What doesn't:** No persistent identity, no history, no community features.
- **Key lesson:** The shared artifact should be meaningful outside the game. Config Code shortlinks should render as preview cards (via Open Graph) showing the topology diagram — legible in a Discord message without clicking.

### Slay the Spire Seed Sharing
Slay the Spire players share run seeds for reproducible experiences:
- **What works:** Small string (8 chars), deterministic reproduction.
- **What doesn't:** Seeds don't encode player choices — only the scenario. Two players with the same seed have completely different runs.
- **Key lesson:** Robot Uprising's Config Code encodes the player's COMPLETE architecture, not just the scenario. The shared artifact is the player's creative work, not the game's procedural output. This makes it more valuable and more personal.

### Mario Maker Course IDs
Super Mario Maker uses short alphanumeric IDs (e.g., `K2V-TYC-WMG`) to share player-created levels:
- **What works:** Easy to type, dictate, print on T-shirts. The ID system became a community vocabulary.
- **What doesn't:** Requires Nintendo network services — courses are hosted on Nintendo's servers. If servers shut down, courses are gone.
- **Key lesson:** Robot Uprising's CDN-hosted approach is more resilient (CDN files are trivially backed up, mirrored, archived by community), but the shortcode format should have the same memorability as Mario Maker IDs. `RU-X7K9P2` is close — the `RU-` prefix and 6-character body are dictatable and printable.

### Pokémon Wonder Trade
Pokémon's Wonder Trade sends a random Pokémon to a random stranger and receives one in return:
- **What works:** The surprise element creates delight. Trading is the content, not a means to an end.
- **What doesn't:** Requires server infrastructure. Flooded with low-value Pokémon.
- **Robot Uprising application:** A "Blind Trade" Workshop feature where you upload a config and receive a random one from the pool. No server needed — the CDN-hosted pool is shuffled client-side using a deterministic seed. The delight of receiving an unexpected architecture and learning from it.

---

## New Aspects Discovered

- **7.03e-i — Blind Trade Workshop feature:** "Wonder Trade" for configs — upload a config, receive a random one from the CDN pool. Serendipitous discovery. Teaching through exposure to unfamiliar architectures. Interaction with Workshop discovery (7.03d) and onboarding.
- **7.03e-ii — Open Graph preview card rendering:** Edge function that converts Config Code to SVG topology diagram for Discord/Twitter/Reddit/Slack embed cards. The preview card IS the sharing experience for most recipients. Rendering pipeline, caching strategy, visual fidelity targets.
- **7.03e-iii — NFC tap-to-share detailed protocol design:** NDEF record format for Config Codes, maximum payload size (NFC Forum Type 4 supports ~32KB, more than enough), Android Beam replacement (deprecated in Android 10+, replaced by Nearby Share integration), iOS Core NFC limitations (read-only on some models), fallback to QR on NFC-incapable devices.
- **7.03e-iv — Offline Workshop cache strategy:** Cache invalidation, prefetch heuristics (download popular configs for current mission before going offline), storage budget (how much local storage to allocate for Workshop cache vs. career data vs. replays), stale data UX.
- **7.03e-v — CDN write coordination and consistency model:** Edge function conflict resolution for simultaneous Workshop index writes, eventual consistency implications for trending algorithms, split-brain scenarios when CDN edge nodes disagree, index file pagination strategy for popular categories.
