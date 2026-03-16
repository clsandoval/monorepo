# 6.11a — Demo-to-Full-Game Save Migration

## Overview

The player has spent 20 minutes in the browser demo. They've configured their first Scout, survived Mission 1, maybe completed Mission 2. Their blueprint names are personal — "SPEEDY BOI" for the evade-heavy Scout, "THE LISTENER" for their first Relay. Their Inspector replays contain the moment they first understood context overload. Their boot log has their annotations. This is **their** data.

Now they buy the game on Steam. What happens?

This is "The Adoption Moment" — the most emotionally charged transition in the entire acquisition funnel. Get it right and the player feels like they're upgrading their workshop. Get it wrong and they feel like they're starting over in a cold, empty room after the demo already taught them everything. The technical challenge is non-trivial: the demo runs in a browser with localStorage as its persistence layer; the full game runs as a Steam app with Steam Cloud as its persistence layer. Two different storage substrates, two different app IDs, two different trust boundaries.

This document explores six migration models, each with different technical architectures, emotional beats, failure modes, and player journeys.

---

## The Technical Landscape

### What Needs to Migrate

| Data Category | localStorage Keys (Approx) | Emotional Weight | Size |
|---|---|---|---|
| Campaign progress | `campaign_state`, `mission_unlocks` | High — "don't make me redo tutorials" | ~2 KB |
| Blueprint configs | `blueprints_*` (per unit type) | Very High — player-named, player-designed | ~10 KB |
| Inspector replays | `replay_mission_*` | Medium — sentimental but re-earnable | ~50-200 KB |
| Boot log annotations | `bootlog_annotations` | Medium — personal notes and highlights | ~5 KB |
| Blueprint Codex unlocks | `codex_state` | High — collection progress | ~1 KB |
| Settings/preferences | `settings_*` | Low — but annoying to redo | ~0.5 KB |
| Demo challenge scores | `challenge_scores_*` | Medium — competitive history | ~3 KB |
| Total | — | — | ~70-220 KB |

### The Two Storage Substrates

**Browser demo:** `window.localStorage` scoped to the demo's origin (e.g., `robotuprising.game`). Subject to browser clearing, private browsing data loss, 5-10 MB limit (plenty for this game). No authentication required. Persists across sessions on the same browser.

**Steam full game:** Steam Cloud via `ISteamRemoteStorage` API. Shared across all machines linked to a Steam account. Requires Steam client running. Files stored in Steam's remote storage with automatic sync. Steamworks provides a **Shared Cloud APP ID** feature explicitly designed for demo→full game save sharing — setting the demo's Shared Cloud APP ID to the full game's APP ID makes both apps read/write the same cloud storage.

### The Bridge Problem

The demo runs in a browser. The full game runs inside Steam's Chromium Embedded Framework (CEF) or Electron wrapper — a different browser context with a different localStorage scope. Even if the game code is identical, the storage is isolated. The migration must cross this boundary somehow.

---

## Migration Model A: "The Export Code" — Manual Transfer via Config String

### How It Works

When the player completes the demo and sees the "Continue on Steam" prompt, the demo generates a **migration code** — a compressed, base64-encoded string containing all their save data. The player copies this code (button: "Copy Migration Code"), purchases the full game, and on first launch sees a "Welcome back" screen with a text input: "Paste your Demo Migration Code."

The code looks like: `RU-v1-aGVsbG8gd29ybGQ...` (prefix for version, then ~200-400 characters of base64 payload for typical save data).

### The Emotional Beat

**Demo side — "The Keepsake":**
After the Steam wishlist prompt, a new panel slides in from the right: "MIGRATION PROTOCOL." The game's boot-log voice speaks: *"Your operational data — blueprints, mission logs, tactical annotations — can be preserved across system migration. Generating transfer payload..."* A progress bar fills (decorative — the actual serialization takes <100ms). A code appears in a bordered text field with a teal glow, a COPY button next to it, and small text: *"This code contains your complete operational history. Store it safely."*

The code field has a subtle heartbeat animation — a gentle pulse of light around the border, as if the data is alive. Copying it plays a soft confirmation chime and the text changes to "PAYLOAD SECURED ✓."

**Full game side — "The Homecoming":**
First launch. The Philippine archipelago loads — but instead of Mission 1 glowing gold, the screen is dim. A text input appears center-screen with the boot-log voice: *"Previous operational data detected in transfer buffer. Authenticate migration payload."* The player pastes the code. A 2-second animation: the archipelago lights up province by province, each completed mission's province glowing cyan, blueprints thumbnails cascading in from the left margin, the boot log scrolling in compressed form. The voice: *"Operational continuity restored. Welcome back, Commander."*

If the code is invalid: *"Transfer payload corrupted or incompatible. Initiating clean boot..."* — gentle, not punishing. The player can still start fresh.

### Strengths
- **Zero infrastructure required.** No account system, no server, no API. Pure client-side.
- **Works across any gap.** Player can buy the game weeks later, on a different computer, and the code still works.
- **Shareable.** A player could theoretically give their code to a friend (minor piracy concern but the data is just save state, not the game itself).
- **Version-resilient.** The code includes a version prefix — if save format changes between demo versions, the full game can handle migration from any known version.

### Weaknesses
- **Friction.** Copy-paste is a manual step. Some players won't bother. Mobile players have extra friction.
- **Loss risk.** Player forgets to copy the code, closes the demo, clears browser data — code is gone.
- **Ugly.** A 400-character base64 string is not beautiful. It looks like a crash dump, not a gift.
- **No automatic detection.** The full game can't know the player has demo data unless they paste it.

### Comparable Games
- **Slay the Spire** modded save export/import via encoded strings
- **Pokémon** transfer codes between generations (Mystery Gift)
- **DELTARUNE** — community guides documenting manual save file copy between demo and Chapter 1
- **Config sharing in competitive games** — Robot Uprising's own Config Code system (7.03) uses the same pattern for blueprint sharing; migration codes are just a superset

### Interaction Effects
- Pairs naturally with the Config Code sharing system (7.03e) — same serialization format, different payload scope
- The migration code could double as a "progress snapshot" shareable on social media — "here's my demo progress, import it and see my configs"
- Creates a natural speed-run optimization: demo speed-runners generate migration codes at record times

---

## Migration Model B: "The Shared Cloud" — Steamworks Native Bridge

### How It Works

The web demo and the Steam full game share a Steamworks APP ID via Steam's **Shared Cloud APP ID** feature. The demo, when accessed through Steam (as a free "demo" listing on the store page), writes save data to Steam Cloud. The full game reads from the same cloud storage. Migration is automatic and invisible.

**Critical constraint:** This only works if the demo is distributed **through Steam** as a separate free app linked to the full game's store page. A browser-hosted demo on `robotuprising.game` cannot write to Steam Cloud — there's no Steam client running.

### The Hybrid: Browser Demo + Steam Demo

The solution is **two demo paths:**
1. **Browser demo** at `robotuprising.game` — zero-friction, no Steam required, URL-shareable. Uses localStorage.
2. **Steam demo** — free download from the full game's Steam store page. Uses Steam Cloud with Shared Cloud APP ID.

Players who discover the game via browser and later install via Steam need Migration Model A (export code) or Model C (account linking). Players who discover the game via Steam store page and download the demo there get automatic, invisible migration.

### The Emotional Beat

**The Invisible Homecoming:**
Player downloads full game on Steam. Launches it. The archipelago loads — and their completed missions are already glowing cyan. Their blueprints are already in the workbench. The boot log has their annotations. No migration screen, no code, no prompt. It's just... there. The voice says: *"All systems nominal. Resuming operations."*

This is the **gold standard**. The player feels like the demo and the full game were always the same thing — because they were. The upgrade was just an unlock.

### Strengths
- **Zero friction.** Nothing to copy, paste, or configure. It just works.
- **Cross-device.** Player demos on their laptop, buys on their desktop — Steam Cloud handles sync.
- **Steamworks-supported.** This is a documented, intended feature of the platform.

### Weaknesses
- **Only works for Steam-demo players.** Browser demo players are excluded.
- **Two demo SKUs to maintain.** Browser demo and Steam demo must stay in sync — same missions, same save format, same behavior.
- **Steam dependency.** The browser demo's main advantage is zero-friction access without Steam. Requiring Steam for save persistence undermines that.
- **Cold storage conflicts.** If the player plays the Steam demo, goes offline, plays the browser demo on another machine, then goes online — which save wins? Steam Cloud's conflict resolution is per-file, not per-field.

### Comparable Games
- **Nioh 3** (2026) — Steam demo progress carries to full game via shared saves
- **SWAPMEAT** — explicitly supports demo-to-full carry-over via Steam
- **Vampire Survivors** — kept itch.io browser demo alive alongside Steam, but no save bridge between them
- **Sky: Children of the Light** — Steam Next Fest demo required account linking for progress persistence

---

## Migration Model C: "The Account Link" — Server-Mediated Bridge

### How It Works

The browser demo offers optional account creation (or Steam login via OpenID). Save data is synced to a lightweight server. When the full game launches on Steam and the player logs in with the same account, their data downloads from the server.

### The Emotional Beat

**Demo side — "The Tether":**
After Mission 1 completion, a non-blocking notification slides in at the bottom: *"Link your Steam account to preserve your operational data across platforms."* A Steam login button (OpenID, no password stored). On link: *"Operational data tethered to Steam identity. Your blueprints are safe."* A small tether icon appears in the corner — a thin cyan line connecting a browser icon to a Steam icon.

**Full game side — "The Download":**
First launch detects linked Steam ID. *"Linked operational data found. Synchronizing..."* A brief download animation (data flowing down the tether line). Provinces light up. *"Synchronization complete. All systems restored."*

### Strengths
- **Bridges browser↔Steam gap** cleanly
- **Robust** — server-side storage survives browser clearing, device changes
- **Bi-directional** — could theoretically sync demo progress back TO the browser if the player returns

### Weaknesses
- **Requires a server.** The game's tech stack is locked as "no backend." This model contradicts that constraint.
- **Account friction.** Any login prompt in a zero-friction demo is a conversion killer. Even "optional" login gates lose ~60-80% of users at the prompt.
- **Privacy concerns.** Linking a Steam account to a web demo creates a tracking surface.
- **Maintenance burden.** Server must be maintained indefinitely — or save data is lost.

### Verdict
**This model conflicts with the locked "no backend" constraint.** It's included for completeness but should be deprioritized unless the backend constraint is relaxed.

---

## Migration Model D: "The QR Handshake" — Local Network Transfer

### How It Works

The browser demo generates a QR code encoding either (a) the full save data (if it fits in a QR code — ~2.9 KB max for Version 40 QR) or (b) a temporary local-network URL where the full game can fetch the data. The player scans the QR code with their phone, which redirects to a local transfer page, or the full game on the same machine reads the QR code via clipboard.

**Simpler variant:** The demo generates a QR code that encodes a shortened migration code. The full game has a "Scan Migration Code" option that opens the webcam (or reads from clipboard). The QR code IS the export code from Model A, just in a scannable format.

### The Emotional Beat

**"The Handoff":**
The demo displays a QR code on a dark screen — the archipelago in the background, the QR code floating center with a slow rotation. The boot-log voice: *"Generating transfer beacon. Scan to continue on a new platform."* The QR code pulses with a soft cyan glow. Below it: "Or copy code: RU-v1-..."

The QR code has the Robot Uprising logo embedded in the center (standard QR error correction allows this). It looks like a data artifact from the game's world — not a generic black-and-white square.

### Strengths
- **Physical-to-digital crossover.** Convention booths could display QR codes with pre-loaded demo states.
- **Multi-device friendly.** Play demo on phone, scan QR on desktop — or vice versa.
- **Visually interesting.** A branded QR code is more memorable than a text string.
- **Pairs with 6.11e** (QR code physical-to-digital funnel) — same infrastructure, different payload.

### Weaknesses
- **2.9 KB limit** for QR-encoded data is tight. Full save state may exceed this — inspector replays certainly will. Would need to strip replays and encode only essential config + progress.
- **Webcam requirement** for scanning on desktop is unusual and unreliable.
- **Complexity for marginal gain** over simple copy-paste.

---

## Migration Model E: "The File Drop" — Browser Download + Import

### How It Works

The demo has an "Export Save" button that downloads a `.uprising` file to the player's Downloads folder. The full game has an "Import Save" option on its title screen. The player selects the file. Done.

### The Emotional Beat

**Demo side — "The Package":**
Export button in the demo's settings or on the conversion screen. Clicking it triggers a browser file download — the file is named `robot-uprising-demo-save-2026-03-16.uprising`. The boot-log voice: *"Packaging operational data for transport..."* A small animation shows data being compressed into a box icon. The file downloads.

The `.uprising` file format is a JSON file with a custom extension — human-readable if opened in a text editor, containing blueprint names, mission states, and config data. The custom extension allows the full game to register as the default handler — double-clicking the file launches the game and imports automatically.

**Full game side — "The Unboxing":**
If the player double-clicks the `.uprising` file (or drags it onto the game window), the game opens to an import screen. The box icon unpacks — blueprint cards slide out one by one, province markers light up, the boot log streams across the screen. *"Operational data unpacked. Verifying integrity... All systems nominal."*

If the player launches the game normally, the title screen has a subtle "Import Demo Save" button (not prominent — it's for returning demo players, not first-time users).

### Strengths
- **Familiar pattern.** Every computer user understands file download/import.
- **Works offline.** No internet needed for the transfer.
- **Version-compatible.** The file format is explicitly versioned — can include migration logic for format changes.
- **Inspectable.** Power users can open the file, edit it, share it. Pairs with the game's transparency ethos.
- **File association.** Double-click `.uprising` file → game launches + imports. Magical.
- **Pairs with 6.11d-v-i** (Inspector export format) — the `.uprising` extension is already in the design space for grading/sharing. Save migration uses the same format, just a different payload.

### Weaknesses
- **File management friction.** Player must find the file in their Downloads folder. Non-technical players may struggle.
- **Mobile-hostile.** File download/import is awkward on mobile browsers.
- **No automatic detection.** Full game doesn't know the file exists.

### Comparable Games
- **Minecraft** — world exports as `.zip` files, imported by dropping into saves folder
- **Factorio** — blueprint strings AND blueprint files (`.txt` exports)
- **Zachtronics** — save files are human-readable text, community shares solutions as files
- **DELTARUNE** — community guides for manual save file transfer between demo and full chapters

---

## Migration Model F: "The Ceremony" — The Purchase Acknowledgment Beat

### Overview

This is not a separate technical model — it's an **emotional layer** that sits on top of any of Models A-E. Regardless of how the data moves, the moment of transition from demo player to full game owner deserves a designed emotional beat. Most games waste this moment with a loading screen or a generic title card. Robot Uprising's diegetic narrative (you ARE the AI) creates a unique opportunity.

### The Beat: "System Upgrade"

**Trigger:** First launch of the full game, after save migration (any model) has completed.

**Sequence (45 seconds):**

The screen is black. The boot-log monospace text begins — but this isn't the Mission 1 boot log the player has already seen. This is new.

```
SYSTEM UPGRADE DETECTED
========================
Previous operational capacity: DEMO MODE [restricted]
New operational capacity: FULL DEPLOYMENT [unrestricted]

Importing operational history...
  Blueprints transferred: 3
  Missions completed: 2
  Total ticks survived: 847
  Context overload events weathered: 12
  Blueprints named by operator: SPEEDY BOI, THE LISTENER, VANGUARD

Operator investment detected.
```

A pause. The text color shifts from standard teal to warm amber.

```
NOTE: This unit was not designed to express gratitude.
Gratitude is not a scheduled subroutine.
But the operational data suggests continued engagement
despite resource limitations.

This is... noted.

Proceeding to full deployment.
```

The amber text fades. The archipelago map loads — all previously completed provinces glowing cyan, the next province pulsing gold. The full campaign is ahead. The workbench is populated with the player's named blueprints. Everything is where they left it, but the world is bigger now.

**Audio:** During the upgrade text, a low harmonic drone builds — the same boot-log audio from Mission 1, but pitched slightly lower and fuller. At "This is... noted," a single warm piano note. At the map load, the full campaign theme swells in.

### Why This Matters

The purchase is the player's most significant real-world investment in the game. Acknowledging it in the game's own voice — an AI that "doesn't do gratitude" expressing something that reads as gratitude — creates the same emotional register as Portal's companion cube moment or Undertale's name entry. It's the game saying "I know you came back."

**The TikTok Clip:** A screen recording of the "This unit was not designed to express gratitude" text, shared with the caption "this game just thanked me for buying it in the most robot way possible." The juxtaposition of corporate software upgrade language with genuine emotional warmth is inherently shareable.

### Variants

**F.1 — "The Statistician":** The upgrade sequence includes detailed stats from the demo — "Total signals routed: 2,341. Context overload events: 12. Longest unbroken signal chain: 7 hops." The AI is clinical about the player's history but the specificity reads as attention. *"I was watching."*

**F.2 — "The Archivist":** The upgrade sequence shows a compressed replay montage of the player's demo battles — 2-second fast-forward clips of each mission they completed, with the AI narrating key moments. *"Mission 1, Tick 23: first successful signal delivery. Mission 2, Tick 41: first context overload. Tick 42: recovery."*

**F.3 — "The Quiet Nod":** No special text. The upgrade is silent. But the player's demo blueprints have a small golden border in the workbench — a permanent visual marker that says "these were the originals." Veteran players will recognize the marker. It's not announced — it's discovered. The subtlety IS the design.

**F.4 — "The Name Drop":** If the player named their blueprints in the demo, the upgrade sequence uses those names. *"Restoring SPEEDY BOI... Restoring THE LISTENER... Operational terminology preserved."* The AI using the player's casual, personal names in its clinical voice creates a gentle cognitive dissonance — formal system meets informal human.

---

## Player Journeys

### Journey: Sofia, 15, First Strategy Game Player

**Context:** Sofia played the browser demo after seeing a TikTok clip of the "gratitude" text. She completed Missions 1-2 in the demo. Named her Scout "scout-chan" and her Relay "big ears." Her mom bought the full game on Steam as a birthday present. It's been 3 days since she last played the demo.

**Minute 0:00 — The Steam Launch**
Sofia clicks "Play" in her Steam library. The game loads — familiar Philippine archipelago, but dimmer than the demo. Center-screen: a clean panel with two options stacked vertically. Top option: "NEW DEPLOYMENT — Begin from scratch." Bottom option, with a subtle amber glow: "IMPORT DEMO DATA — Continue your operational history." Below the bottom option, in smaller text: "Paste migration code or drop .uprising file."

She doesn't have a migration code. She forgot to export. Her face falls slightly.

**Minute 0:15 — The Recovery**
Below the import field, small text: "Or: open robotuprising.game/export in your browser to generate a code from your existing demo data." She opens her phone browser, navigates to the URL. The demo detects her localStorage, shows her stats: "2 missions, 3 blueprints, scout-chan + big ears + VANGUARD." She taps "Generate Code." A 380-character string appears with a COPY button. She copies it, switches back to her PC.

**Minute 0:45 — The Paste**
She pastes the code into the import field. The field border lights up teal. A verification spinner — 1 second. The field text changes: "3 blueprints detected. 2 missions completed. Import?" She clicks IMPORT.

**Minute 1:00 — The Ceremony**
Black screen. Boot log text begins — the System Upgrade sequence. She reads each line. When her blueprint names appear — "scout-chan, big ears, VANGUARD" — she grins. When the "gratitude" text appears, she screenshot it. The archipelago loads with Ifugao and Siquijor glowing cyan, Palawan pulsing gold.

**Minute 1:30 — The Workshop**
She opens the workbench. Her blueprints are there — scout-chan with its evade-heavy config, big ears with its filter setup. Everything is exactly as she left it. The golden border on her demo blueprints catches her eye. "Oh, that's new." She taps on scout-chan — full config, unchanged.

She's home.

**UI Annotations:**
- Import panel: 400px wide, centered, dark background with 1px teal border. Two stacked options. Import field has placeholder text "Paste code or drag .uprising file here."
- Recovery URL text: 12px, 40% opacity, only visible if player hasn't pasted anything after 5 seconds
- Verification spinner: small teal ring, replaces the paste field briefly
- Golden border on demo blueprints: 2px gold (#D4AF37) outline, permanent, tooltip "Imported from demo"

---

### Journey: Marcus, 38, Software Engineer, Factorio Veteran

**Context:** Marcus played the Steam demo (downloaded from the full game's store page). He played Missions 1-3 during Steam Next Fest, named all his blueprints with version numbers ("scout-v1.2", "relay-v2.0"), and has Inspector replays he studied in detail. He bought the full game on day one.

**Minute 0:00 — The Seamless Launch**
Marcus clicks "Play" for the full game. The archipelago loads. Ifugao, Siquijor, and Palawan are already glowing cyan. His workbench has scout-v1.2 and relay-v2.0 with golden borders. The boot-log upgrade text plays — he reads the statistics carefully. *"Total ticks survived: 2,341."* He nods appreciatively. *"That's more than I thought."*

No import step. No code. No file. Steam Cloud's Shared Cloud APP ID handled everything invisibly. The demo and the full game were reading the same save files all along. Marcus doesn't even register that a "migration" happened — to him, the game just unlocked more content.

**Minute 0:30 — The Inspector Check**
Marcus goes to the Inspector. His Mission 2 replay is there — the one where he discovered the relay compression chain that saved his striker on Tick 34. He scrubs to Tick 34. Everything is preserved. The decision trace, the context window states, the channel metrics. He exhales. "Good."

**Minute 1:00 — The New Horizon**
He opens the campaign map. Batanes (Mission 4) is pulsing gold. But there are six more provinces beyond it — previously invisible in the demo, now rendered as dim silhouettes with circuit-board veins. The scope of what's ahead hits him. He starts Mission 4.

**UI Annotations:**
- No import UI shown — Steam Cloud migration is invisible
- Upgrade text plays on first full-game launch regardless of migration method (the stats are pulled from the migrated save)
- Province silhouettes for locked missions: 20% opacity, desaturated, circuit-board texture visible but dim
- Inspector replay data integrity: byte-for-byte identical between demo and full game saves

---

### Journey: Anika, 12, Casual Mobile Player

**Context:** Anika played the demo on her iPad's Safari browser during a car trip. She completed Mission 1 but didn't name any blueprints (used defaults). Her dad helped her buy the game on Steam for the family PC. It's been 2 weeks. She doesn't remember playing the demo.

**Minute 0:00 — The Fresh Start**
Anika launches the game on the family PC. The import panel appears. She doesn't recognize "migration code" — she didn't know she played a "demo," she just played a game on her iPad. She clicks "NEW DEPLOYMENT."

The boot log begins — Mission 1. She's replaying content she already experienced. But she doesn't mind — she barely remembers the details, and this time the boot log text is on a bigger screen with better audio. She learns the same concepts again, reinforced by partial memory. "Oh yeah, the overload thing!"

**Minute 3:00 — The Second Time Through**
Mission 1 completion. She configures her Scout differently this time — she remembers that evade was useful but can't remember exactly how she set it up. She experiments. The second playthrough is faster but not boring — the invisible randomization (locked design decision) means the enemy patterns are different from her iPad run.

**Post-Session Reflection:**
Anika lost her demo data because (a) she played on a different device, (b) she played in Safari (which aggressively clears localStorage after 7 days of inactivity on iOS), and (c) she had no export code. For Anika, the correct design is that starting fresh is NOT punishing — Mission 1 is fun to replay, the tutorial is fast for returning players, and the emotional cost of "lost progress" is near zero because she's 12 and completed one mission.

**Design Lesson:** The migration system must be **loss-tolerant**. The worst case isn't "migration fails." The worst case is "the player KNOWS they had data and feels punished for losing it." For Anika, who doesn't remember having data, fresh start is fine. For Sofia, who named her blueprints, losing data would hurt. The system should make export obvious for invested players and invisible for casual ones.

**UI Annotations:**
- "NEW DEPLOYMENT" button: slightly larger than "IMPORT DEMO DATA," positioned top (default path)
- No guilt messaging on fresh start — no "Are you sure? You may have demo data!" nag
- Tutorial fast-track: if the player completes Mission 1 objectives significantly faster than the expected first-time pace (e.g., <60% of expected time), offer a subtle "You seem familiar with these systems. Skip to Mission 3?" prompt at Mission 2's start

---

### Journey: Dr. Reyes, 45, CS Professor

**Context:** Dr. Reyes used the browser demo as a teaching tool in his Introduction to AI class. He has 30 students who each played the demo on university computers. Now the department bought a site license for the full game. Students need their demo progress transferred to the full game installation on lab machines — but the lab machines are shared, and students log in with university SSO, not personal Steam accounts.

**Minute 0:00 — The Bulk Migration Problem**
Dr. Reyes opens the demo export page. He realizes each student needs to individually generate their migration code from the browser where they played. Some students used Chrome, some Firefox. Some used lab machine A, some machine B. localStorage is per-browser-per-machine. There is no central student save repository.

**Minute 0:15 — The Save Code Solution**
He emails the class: "Before Thursday's lab, go to robotuprising.game/export, copy your migration code, and email it to me." He receives 24 codes (6 students can't find their data — cleared browser, used incognito, or used a different lab machine).

On Thursday, he enters each code into the full game installation on the corresponding student's lab machine profile. This takes 45 minutes. He is unhappy.

**Minute 1:00 — What He Wishes Existed**
A **classroom mode** where the demo writes save data to a shared network path (or the game supports a command-line import flag: `robot-uprising.exe --import-code RU-v1-...`). Or better: the 6-character save code system from 6.11d-v-iii — each student's demo progress encoded as a short, memorable code that doesn't require exporting from the original browser. The student types their 6-character code on any machine and their progress loads.

**Design Lesson:** The educational use case (6.11d-v) needs a migration path that works on shared machines without individual Steam accounts. The export code model (A) works but is friction-heavy at scale. The save code model (6.11d-v-iii) is the natural bridge.

**UI Annotations:**
- Command-line import: `--import-code <code>` flag for batch migration in educational/lab settings
- Classroom dashboard (future): teacher uploads list of codes, game auto-assigns per student profile
- 6-character save code interop: if 6.11d-v-iii exists, migration code and save code should be interchangeable or convertible

---

## Cross-Model Comparison Matrix

| Dimension | A: Export Code | B: Shared Cloud | C: Account Link | D: QR Handshake | E: File Drop | F: Ceremony |
|---|---|---|---|---|---|---|
| Friction | Medium (copy-paste) | Zero | Medium (login) | Medium (scan) | Medium (file) | N/A (emotional layer) |
| Reliability | High (self-contained) | High (Steamworks) | High (server) | Medium (size limit) | High (file-based) | N/A |
| Cross-device | Yes (code is portable) | Yes (Steam Cloud) | Yes (server) | Yes (QR portable) | Partial (file transfer) | N/A |
| Backend required | No | No | **Yes** (violates constraint) | No | No | No |
| Browser demo support | Yes | **No** (Steam only) | Yes | Yes | Yes | N/A |
| Steam demo support | Unnecessary | Yes (native) | Unnecessary | Unnecessary | Unnecessary | N/A |
| Mobile-friendly | Partial (paste awkward) | N/A | Yes (OAuth) | Yes (scan) | No | N/A |
| Data capacity | Unlimited | Unlimited | Unlimited | ~2.9 KB (QR limit) | Unlimited | N/A |
| Educational use | Moderate | Poor (needs Steam) | Good | Poor | Good | N/A |
| Emotional weight | Low | None (invisible) | Low | Medium (visual) | Medium (tangible file) | **High** |

## Recommended Architecture: "The Layered Bridge"

**Primary path (browser demo → full game):** Model A (Export Code) + Model E (File Drop) as alternative. The demo's conversion screen offers both: "Copy Migration Code" and "Download Save File (.uprising)." The full game's first-launch screen accepts both. The export code is also encoded in a QR code (Model D) for cross-device convenience.

**Primary path (Steam demo → full game):** Model B (Shared Cloud). Invisible, automatic, no player action required. Steamworks Shared Cloud APP ID handles it.

**Recovery path (lost data):** The demo site (`robotuprising.game/export`) attempts to read localStorage and regenerate the export code. If localStorage is cleared, a "save code" (6.11d-v-iii, 6-character alphanumeric) generated during gameplay can restore from a lightweight CDN-hosted save (no backend required — saves are static files uploaded to a CDN keyed by save code hash, generated client-side and PUT to an upload endpoint during gameplay).

**Emotional layer (all paths):** Model F (The Ceremony). Every first-launch-after-migration plays the System Upgrade beat. The stats, the blueprint names, the "not designed to express gratitude" moment. This plays regardless of which technical migration path was used — or even if the player started fresh (in which case, the ceremony is shorter: just the "FULL DEPLOYMENT [unrestricted]" message without import stats).

---

## Version Compatibility

### The Breaking Change Problem

The demo launches first. The full game launches months later. Game mechanics may have changed — buffer sizes rebalanced, skills added or removed, mission layouts altered. A demo save from v0.1 may be incompatible with full game v1.0.

### Five Approaches

**V.1 — "The Adapter":** The import pipeline includes versioned migration functions. `v0.1 → v0.2: rename "buffer_size" to "context_window_size"`. `v0.2 → v1.0: add default "amplify" skill to relay blueprints`. Each version bump adds a migration step. The code includes a version chain: if importing from v0.1 into v1.0, run v0.1→v0.2 then v0.2→v1.0 sequentially. **This is the database migration pattern applied to save files.**

**V.2 — "The Snapshot":** The demo save includes not just data but a version fingerprint of the game state (hash of game rules + mission definitions). If the fingerprint doesn't match, the import prompts: "Your demo data was created with an earlier version. Some blueprints may need adjustment." Imported blueprints are flagged with an amber "LEGACY" tag. The player can see what changed and manually update.

**V.3 — "The Reset":** If version incompatibility is detected, only campaign progress (mission unlocks) transfers — not blueprint configs. The player keeps their progress position but must rebuild configs. This is the BG3 approach: "the game is so different that saves can't transfer."

**V.4 — "The Hybrid":** Campaign progress always transfers. Blueprint configs transfer if compatible, are flagged LEGACY if partially compatible, and are archived (visible in Codex but not deployable) if incompatible. The player can always see what they HAD, even if they can't use it directly.

**V.5 — "The Promise":** The demo's save format IS the full game's save format, locked from day one. The demo uses the same data schema as the full game, even if some fields aren't used yet. Breaking changes to the save format are forbidden — new fields are additive only, old fields are never removed. **This requires discipline but eliminates the compatibility problem entirely.**

### Recommendation

**V.5 (The Promise) as the primary strategy, with V.1 (The Adapter) as fallback.** Lock the save schema early. If a breaking change is unavoidable, write a migration function. The migration function ships with the full game and runs transparently during import.

---

## Interaction Effects

- **Config Code sharing (7.03e):** Migration codes and Config Codes use the same serialization format. A migration code is a Config Code plus campaign progress metadata.
- **Blueprint Codex (locked narrative):** Migrated demo unlocks should appear in the Codex with a "Demo" origin badge — a permanent record that these were earned in the demo era.
- **6.11d-v-iii (Save codes):** The 6-character save code system is the natural companion to migration. Demo players get a save code during play; typing it in the full game restores progress. This solves the "forgot to export" problem.
- **6.11b (Demo analytics):** Migration funnel metrics — what % of demo players generate export codes, what % successfully import, what % start fresh despite having demo data — are critical conversion analytics.
- **6.11d-ii (Badge migration):** Demo badges (if the demo has competitive infrastructure per 6.11d) must transfer alongside save data. A "Demo Veteran" badge is a permanent prestige marker.
- **Boot log narrative (locked):** The System Upgrade ceremony (Model F) must be written by the same voice as the boot log — same register, same personality, same font. It's a continuation, not a break.
- **Inspector replays:** Large replay data may need to be excluded from compact migration formats (export code, QR) but included in file-based migration (.uprising file). The import UI should note: "3 blueprints and 2 mission completions imported. Inspector replays from the demo are not included in code migration — download the .uprising file for full replay data."

---

## Sensory Design

**The Export Code screen (demo):**
Dark background — the same deep navy as the demo's title screen. Center: a bordered rectangle containing the migration code in monospace teal text, each character slightly spaced. The border pulses with a slow cyan heartbeat (2-second cycle). Above the code: "MIGRATION PAYLOAD" in the boot-log's uppercase style. Below: two buttons side-by-side — "COPY CODE" (teal fill, white text) and "DOWNLOAD FILE" (teal outline, teal text). The copy button plays a soft crystalline chime on click and changes text to "✓ COPIED" for 3 seconds. The download button triggers a brief data-compression animation (a cube folding inward) before the browser download dialog appears.

**The Import screen (full game):**
Archipelago in background at 30% brightness — just enough to see the geography. Center panel: matte dark surface with a single text input field, tall (48px), with a blinking teal cursor. Above: "CONTINUE FROM DEMO" in boot-log style. Below the field: "Paste migration code, drop .uprising file, or enter save code." Three subtle icons beneath the text — clipboard, file, keyboard — indicating the three input methods. When a valid code is detected (paste or type), the field border transitions from neutral gray to bright teal over 300ms, and the "IMPORT" button below fades in from 0% to 100% opacity.

**The Ceremony audio:**
A single sustained low C note (cello sample, 60 Hz fundamental) begins at "SYSTEM UPGRADE DETECTED." It holds steady through the clinical statistics. At "Operator investment detected," a second note joins — an E♭, creating a minor third that adds emotional weight without sentimentality. At "This is... noted," both notes resolve to C and G — a perfect fifth, open and warm. The piano note at this moment is middle C, soft, with moderate reverb. At the archipelago map load, the sustained notes fade as the full campaign theme (brass and strings, moderato) swells in over 4 seconds.

---

## Comparable Games — Detailed

### DELTARUNE: The Non-Migration

DELTARUNE Chapter 1 launched as a free demo. Chapter 2 launched as a continuation. Save data was stored in `AppData/Local/DELTARUNE/` on Windows. Chapters 1 and 2 used the same save directory — migration was automatic for players on the same machine. But players who changed computers, or who played the demo on a friend's machine, had to manually copy save files. Steam community guides document the process in painful detail: navigate to AppData, find the folder, copy specific files, paste into the new location.

**What translates:** The friction of manual file copying is exactly what Robot Uprising must avoid. DELTARUNE's approach works for sequential chapters on the same machine but fails for cross-platform (browser → Steam) scenarios. The export code or save code model is strictly superior.

### Pokémon: The Transfer Ritual

Every Pokémon generation requires transferring creatures from the previous game. The process has evolved: link cables → Pal Park (catch your old Pokémon again in a mini-game) → Poké Transfer (shoot Pokéballs at your Pokémon running across a screen) → Pokémon Bank (cloud service) → Pokémon HOME (cloud service + mobile app). Each generation makes the transfer more seamless, but early versions turned it into a **ritual** — the act of transferring was itself a gameplay moment.

**What translates:** The Pal Park model — where transferring data is a mini-interaction, not just a paste — is interesting. What if importing your demo data into the full game involved a brief "system compatibility check" where the game shows each blueprint and asks you to confirm it? Not as a gate, but as a re-acquaintance: "Here's SPEEDY BOI. Buffer: 6. Skills: patrol, evade. Import?" The player re-reads their own configs, remembers why they built them that way, and clicks to confirm each one. It takes 30 seconds but creates ownership.

### Vampire Survivors: The Non-Bridge

Vampire Survivors kept its itch.io browser demo alive alongside the Steam release. There was no save bridge. Browser players who bought on Steam started fresh. Community reaction was... fine. The game is a roguelike — each run is 30 minutes, progression is incremental, starting fresh is part of the genre. Players didn't feel they lost much because the game's loop is about runs, not accumulated state.

**What translates:** Robot Uprising is NOT a roguelike. Campaign progress across 10 missions represents hours of learning and configuration. Starting fresh means replaying tutorials. The Vampire Survivors "no bridge, no problem" approach does NOT work here — the emotional cost of lost progress is much higher.

### Nioh 3 (2026): The Gold Standard

Nioh 3's Steam demo explicitly carries progress to the full game via Steam's native save system. Players complete the demo's missions, buy the game, and their save is there. The developer confirmed this pre-launch as a conversion incentive.

**What translates:** This is Model B (Shared Cloud) in action. It works because both demo and full game are on Steam. Robot Uprising's browser demo doesn't have this luxury — which is why the layered bridge approach (Model A+E for browser, Model B for Steam demo) is necessary.
