# 6.11d-v-iii — Save Code for Shared Computer Labs

## Overview

Thirty students in a Manila computer lab. Fifteen Chromebooks. Two students per machine on alternating lab periods. Every Friday at 3 PM, the browser cache might be wiped by the IT admin's group policy. On Monday, a student opens `robotuprising.game` and their blueprints — "SPEEDY BOI," the evade-heavy scout they spent 20 minutes tuning — are gone. localStorage was cleared. Their progress, their named channels, their breakthrough moment with the relay→striker hook chain that finally won Mission 3 — erased.

This is the **shared computer lab problem**, and it's the single biggest obstacle between Robot Uprising's web-native zero-install advantage and real educational adoption. The game runs anywhere with no download, no account, no installation — but if progress can't survive a cache clear, device swap, or lab rotation, the zero-install advantage becomes a zero-persistence liability.

The solution: a **6-character alphanumeric save code** that encodes the player's full progress state. No accounts. No servers. No login. Just six characters the student can write on their hand, stick in their notebook, or tape to the Chromebook's bezel. Type it on any machine, any browser, any time — and the game restores.

This document explores five encoding architectures, three persistence backends (including zero-backend), collision avoidance strategies, the QR display variant, and the full round-trip from localStorage to code and back.

---

## The Encoding Problem

### What Needs to Be Encoded

From the existing save migration analysis (6.11a):

| Data Category | Size | Criticality |
|---|---|---|
| Campaign progress (mission unlocks, stars) | ~2 KB | Must have — don't make them redo tutorials |
| Blueprint configs (skills, rules, hooks, context config, names) | ~10 KB | Must have — this is the player's creative work |
| Blueprint Codex unlocks | ~1 KB | Should have — collection progress |
| Settings/preferences | ~0.5 KB | Nice to have — annoying to redo but low emotional weight |
| Inspector replays | ~50-200 KB | Cannot fit — too large for compact code |
| Boot log annotations | ~5 KB | Nice to have — personal notes |

**The hard constraint:** A 6-character alphanumeric code has 36⁶ = 2,147,483,648 possible values (~31 bits of entropy). That's enough to be a *key* (a lookup address) but nowhere near enough to *contain* the save data. Even base64-encoding the most minimal save state (campaign progress + blueprint configs ≈ 12 KB) would produce a ~16,000-character string. Six characters can't hold it. Six characters can only *point to it*.

This means the save code is necessarily a **reference**, not a payload. The question becomes: what does it reference, and where is the data stored?

---

## Architecture A: "The CDN Locker" — Client-Side Upload to Static Storage

### How It Works

When the player first generates a save code, the game:

1. **Serializes** the save state (campaign + blueprints + codex + settings) into a compressed JSON blob (~5-8 KB gzipped).
2. **Generates** a 6-character code from a deterministic hash of the blob + a random salt.
3. **Uploads** the blob to a lightweight CDN endpoint: `PUT https://saves.robotuprising.game/{code}.json.gz`
4. **Displays** the code to the player.

When the player enters the code on a different machine:
1. **Fetches** `GET https://saves.robotuprising.game/{code}.json.gz`
2. **Decompresses** and deserializes into localStorage.
3. **Restores** the game state.

### The "No Backend" Question

The locked tech stack says "no backend." But a CDN upload endpoint isn't really a backend — it's a static file host with a write API. Options:

**Option A1: Cloudflare R2 with Workers** — A Cloudflare Worker (10ms edge compute) accepts PUT requests, validates the payload (size limit, format check), writes to R2 (S3-compatible object storage). Reads are free and cached globally. Cost: ~$0.015 per million writes, ~$0.36/GB stored. For 10,000 students with monthly saves: ~$0.15/month writes, ~$0.50/month storage. Effectively free.

**Option A2: AWS S3 + CloudFront with pre-signed URLs** — The game requests a pre-signed PUT URL from a Lambda@Edge function (stateless, no server). The URL is valid for 60 seconds and targets a specific S3 key. The game uploads directly to S3 from the browser. Reads through CloudFront (CDN). Same cost range.

**Option A3: Firebase Storage** — Google's managed storage with client-side SDK. No server code required — security rules enforce the write-once, read-many pattern. Free tier covers 1 GB storage, 5 GB/day bandwidth. Sufficient for educational deployment.

### Save Code Format

```
[A-Z0-9]{6}
```

Six characters from the 36-character alphanumeric set (uppercase only for readability — no ambiguity between `l` and `1`, `O` and `0` when handwritten). Total keyspace: 36⁶ = ~2.1 billion codes.

**Confusable character exclusion:** Remove `0`, `O`, `I`, `1`, `L` from the alphabet → 31 characters. 31⁶ = ~887 million codes. Still enormous for the use case (realistically under 1 million save codes ever generated). The reduced alphabet prevents the "is that a zero or an O?" problem when students write codes by hand.

Final alphabet: `A B C D E F G H J K M N P Q R S T U V W X Y Z 2 3 4 5 6 7 8 9` (31 characters)

### Collision Avoidance

With 31⁶ = 887 million possible codes and a realistic population of <1 million saves, birthday-problem collision probability is negligible (~0.06% at 1M saves). But defense-in-depth:

1. **Check-before-write:** Before uploading, the game fetches the target URL with a HEAD request. If the code already exists, regenerate with a different salt. Retry up to 3 times.
2. **Code includes a checksum digit:** Actually make it 5 random characters + 1 check digit (Luhn mod 31). This catches typos — the game can reject an invalid code *before* making a network request. Display: `HXKM7-P` where P is the check digit, separated by a dash for readability. Player writes "HXKM7P" or "HXKM7-P" — the game strips the dash.

### Update Semantics

When the player makes progress and re-saves:

**Option U1: Overwrite** — The same code always points to the latest save. The player remembers one code forever. But if the CDN caches aggressively, stale reads are possible. Solution: cache-busting headers or versioned keys (`{code}-v{n}.json.gz` with a redirect from `{code}.json.gz` to latest).

**Option U2: New code per save** — Each save generates a new code. The old code still works (points to old state). The player must remember the latest code. Advantage: every code is immutable — no stale-cache risk, no overwrite race conditions. Disadvantage: student forgets which code is current.

**Recommendation: Option U1 (Overwrite)** with `Cache-Control: no-cache` on the CDN. Educational context prioritizes "one code, always works" over immutability. Students tape one code to their notebook. It always loads their latest progress.

### Strengths
- **No accounts, no login, no email.** Six characters. That's it.
- **Works across any device, any browser.** Type the code on a Chromebook in Manila, a Mac in the library, your phone on the bus.
- **Survives cache clears.** The data lives on the CDN, not in localStorage.
- **Minimal infrastructure.** A Cloudflare Worker + R2 bucket costs cents per month.
- **Interoperable with migration (6.11a).** The save code can also be entered in the full Steam game's import screen, loading from the same CDN.

### Weaknesses
- **Requires internet.** Offline play can't restore from a save code. The game should still write to localStorage as primary storage; the save code is a *backup*, not a replacement.
- **Privacy.** Anyone who knows your code can load your save. No authentication. For educational contexts this is acceptable — the save data contains no PII, just game state. For competitive contexts (Gauntlet configs), this is a risk. Solution: save codes exclude competitive configs; competitive data uses a separate authenticated system.
- **Upload endpoint is a write surface.** Abuse risk: someone scripts millions of garbage uploads. Mitigation: rate limiting (10 writes/minute per IP), size limit (50 KB per payload), format validation (must parse as valid save JSON).
- **CDN dependency.** If the CDN goes down, save codes stop working. localStorage still works locally. The game should attempt CDN restore first, fall back to localStorage, and show a clear message: "Save code service temporarily unavailable. Your local progress is intact."

---

## Architecture B: "The Deterministic Seed" — Zero-Backend, Code IS the Save

### How It Works

What if the 6-character code isn't a lookup key but a *seed* that deterministically generates the save state? This only works if the save state can be reduced to ≤31 bits of meaningful data.

**What fits in 31 bits:**
- Campaign progress: 10 missions × 2 bits (locked/unlocked/completed/3-star) = 20 bits
- That's it. 11 bits left for nothing meaningful.

**What doesn't fit:** Blueprint configurations (skills, rules, hooks, context config). A single blueprint's rule set alone can have hundreds of possible configurations. No encoding can compress this to 11 bits.

### The "Progress-Only" Variant

The code encodes *only* campaign progress. Blueprints, names, and configs are lost. The code says "you've completed Missions 1-5" and unlocks those missions, but the player must rebuild their blueprints from scratch.

**Encoding:**
- 10 missions × 3 states (locked=0, unlocked=1, completed=2, 3-star=3) = 10 × 2 bits = 20 bits
- 20 bits = 1,048,576 values → 4 characters from the 31-char alphabet (31⁴ = 923,521 — close enough with one wasted bit)
- Add 1 check digit → **5-character code** encodes full mission progress
- Remaining character could encode a "difficulty signature" (which eviction policy the player last used, which unit types they've unlocked)

### The Emotional Problem

"Type your save code." *Types HXKM7.* The game loads. Missions 1-5 unlocked. But the workbench is empty. "SPEEDY BOI" is gone. "THE LISTENER" doesn't exist. The relay→striker hook chain that took 20 minutes of experimentation — gone.

This is the demo-to-full-game problem (6.11a) all over again, but worse — because the player expects their *work* to be there, not just their *progress*. Mission unlocks are administrative. Blueprint configs are creative artifacts. Losing them feels like losing a painting.

### Strengths
- **True zero-backend.** No CDN, no upload, no network call. The code is self-contained.
- **Works offline, forever.** The code will restore progress in 10 years with no infrastructure.
- **No privacy risk.** The code contains mission progress, not personal configs.

### Weaknesses
- **Blueprints lost.** The player's creative work — names, configs, hook wirings — does not survive.
- **Emotionally hollow.** "Your progress was saved but your work was erased" is a betrayal of the save-code promise.
- **Limited to progress data.** Cannot encode any configuration state.

**Verdict:** Architecture B is only acceptable as a **fallback** when the CDN is unreachable. "We couldn't reach the save server. Here's a progress-only code: HXKM7. This will restore your mission unlocks but not your blueprints. Connect to the internet to generate a full save code."

---

## Architecture C: "The Peer Relay" — WebRTC/QR Transfer, No Server

### How It Works

Instead of uploading to a CDN, the save code is a rendezvous key for a direct peer-to-peer transfer between the student's old machine and new machine.

1. **Old machine:** Player clicks "Generate Save Code." The game displays a 6-character code and starts listening on a WebRTC signaling channel (using a free TURN/STUN service or a lightweight WebSocket relay).
2. **New machine:** Player enters the code. The game uses it to find the old machine on the signaling channel. Direct peer-to-peer connection. Full save data transfers.
3. **Both machines must be online simultaneously.**

### Why This Doesn't Work for Shared Labs

The old machine is a shared Chromebook that was wiped last night. It doesn't exist anymore. The peer isn't available. The entire point of the save code is to survive machine turnover.

**Verdict:** Architecture C fails the core requirement. Eliminated.

---

## Architecture D: "The Hybrid" — CDN Primary, Deterministic Fallback

### How It Works

Combines Architecture A and B:

1. **Primary:** CDN-backed save codes (Architecture A). Full save state uploaded. 6-character code is a CDN key.
2. **Fallback:** If CDN upload fails (offline, rate limited, CDN outage), generate a progress-only code (Architecture B). Display both: "Full save code: HXKM7-P (requires internet to restore)" and "Progress-only code: TQWN4 (works offline, blueprints not included)."
3. **Restore logic:** When a code is entered, the game first checks if it's a valid CDN key (6-character + check digit). If fetch fails, checks if it's a valid progress-only code (5-character).

### The Two-Code Problem

Displaying two codes is confusing. "Which one do I write down?" Students will write the wrong one or mix them up.

**Solution: Make the progress-only code invisible** unless CDN upload fails. Primary flow: player gets one code (CDN-backed). Only if upload fails: "Couldn't save to the cloud. Here's a backup code that preserves your mission progress (but not blueprints): TQWN4." The backup code is explicitly framed as degraded.

### Strengths
- **Best of both worlds.** CDN when available, offline fallback when not.
- **Graceful degradation.** The promise is "you'll never lose everything" — at worst, you lose blueprints but keep progress.
- **Single primary code.** Students interact with one code in the normal case.

### Weaknesses
- **Complexity.** Two code formats, two restore paths, two failure modes.
- **The fallback still loses blueprints.** The emotional problem of Architecture B exists in the degraded path.

**Verdict:** Architecture D is the recommended approach. The CDN path covers 99% of use cases; the deterministic fallback catches the remaining 1%.

---

## Architecture E: "The Classroom Bucket" — Teacher-Managed Shared Storage

### How It Works

The teacher creates a "classroom" at setup time, generating a classroom code (e.g., `AGENT-SCOUT-RELAY`, reusing the existing class code system from 6.11d-v). Every student in the classroom saves to a shared namespace: `saves.robotuprising.game/{classroom_code}/{student_code}.json.gz`.

The student code is a 4-character personal identifier (e.g., initials + 2 digits: `MK42`). The teacher can see all student saves in a lightweight dashboard at `robotuprising.game/teacher/{classroom_code}`.

### The Student Identifier Problem

Who assigns the student code? Options:

**E1: Student self-assigns.** First time: "Enter a 4-character identifier (your initials + two digits work well):" Student types `MK42`. This becomes their permanent code within the classroom. Risk: two students pick `COOL`. Solution: uniqueness check within the classroom namespace.

**E2: Teacher pre-assigns.** Teacher uploads a student roster (just names or IDs). The system generates codes for each. Teacher distributes codes. More orderly but requires teacher setup time.

**E3: Auto-generated on first play.** The game assigns a random 4-character code on first load with the classroom URL. The student writes it down or photographs the screen. No choice, no collision.

**Recommendation: E3 (auto-generated)** with the option for the student to replace it with a memorable code later (Settings → "Change your save code"). First encounter is zero-friction; personalization is available but not required.

### Restore Flow

Student sits down at any machine. Opens `robotuprising.game/play?class=AGENT-SCOUT-RELAY`. Screen: "Welcome. Enter your save code or start fresh." Input field for 4-character code. Alternatively: "Scan your QR code" (see QR section below). The game fetches from the classroom namespace. Progress restored.

### Teacher Dashboard

At `robotuprising.game/teacher/AGENT-SCOUT-RELAY`:
- List of all student codes with last-save timestamp
- Per-student: missions completed, last mission attempted, total play time
- Bulk export: download all student saves as a zip
- **No student names.** The system never collects names. The teacher maps codes to names in their own gradebook.

### Strengths
- **Organized per-classroom.** Teacher has visibility without managing individual codes.
- **Short student codes.** 4 characters (within a classroom namespace) instead of 6 globally unique characters.
- **Dashboard for pedagogy.** Teacher can see who's stuck on Mission 3 and intervene.

### Weaknesses
- **Requires teacher setup.** The classroom must be created before students can save. Adds friction for the teacher.
- **Namespace scoping.** A student's code only works within their classroom. If they want to play at home outside the classroom context, they need a separate (global) save code.
- **Cross-classroom portability.** Student transfers classes? Different classroom code → different namespace. Data doesn't follow automatically.

---

## The QR Display Variant

Regardless of which architecture backs the save code, the code can be displayed as a QR code for frictionless machine-to-machine transfer.

### How It Works

When the save code is generated, the game renders a QR code alongside the text code. The QR encodes:
- Architecture A/D: `https://robotuprising.game/restore?code=HXKM7P`
- Architecture E: `https://robotuprising.game/restore?class=AGENT-SCOUT-RELAY&code=MK42`

The QR code is a URL — scanning it with any phone camera opens the game and auto-fills the restore code.

### The Physical Artifact

A student can:
1. **Screenshot** the QR code on their phone.
2. **Print** it from the save screen (small "Print QR" button → browser print dialog → sticky label or paper slip).
3. **Tape** a printed QR to their notebook, laptop lid, or locker.

The QR becomes a **physical game artifact** — a tangible save file. Students in Manila taping tiny QR codes to their Chromebook bezels. A wall of QR codes in the CS lab. The teacher could even print QR labels at the start of the semester and hand them out.

### Sensory Description

The save code screen appears as a modal over the campaign map (map dims to 20% brightness). Center panel: matte dark surface with rounded corners. Top: "SAVE CODE" in boot-log monospace, teal on dark.

Left half: the 6-character code in large (48px) monospace characters, each letter in its own bordered cell — like an airport departures board. The cells have a subtle depth effect (1px inner shadow), and each character is white on dark charcoal. Below the code: a "COPY" button (teal outline, clipboard icon) and a note in small gray text: "Write this down or take a screenshot."

Right half: a QR code, 180×180px, white-on-black with the Robot Uprising AI eye glyph in the center dead zone (QR codes have enough redundancy to survive a small logo). Below the QR: "Scan to restore on any device" in small text.

Bottom of the panel: a progress indicator showing what's included — "✓ 5 missions · ✓ 3 blueprints · ✓ 12 codex unlocks · ✗ Inspector replays (too large)" in a compact horizontal list, green checks and red crosses. The player knows exactly what survives the save code.

When the code is successfully generated and uploaded to CDN: a confirmation strip slides in at the bottom of the panel — "SAVED TO CLOUD ✓" in green monospace, with the CDN status icon (tiny cloud with checkmark). If CDN upload fails: "OFFLINE BACKUP ONLY — blueprints not included" in amber, with a retry button.

The modal dismisses on outside click or ESC key. A subtle exit animation: the code characters scatter like tiles being shuffled, then the panel fades.

---

## Restore Flow Design

### The Cold Start

Student sits down at a wiped Chromebook. Opens the game URL. The campaign map loads — but all missions are locked. A first-time-player screen appears.

**Without save codes:** "Welcome, Commander. Begin your first mission." → Start from scratch.

**With save codes:** The welcome screen has a second option. Layout:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ╔══════════════════════════════════════╗   │
│   ║  WELCOME, COMMANDER                 ║   │
│   ╚══════════════════════════════════════╝   │
│                                             │
│   [ BEGIN NEW OPERATION ]                   │
│                                             │
│   ─── or ───                                │
│                                             │
│   [ RESTORE FROM SAVE CODE ]    ← teal     │
│                                             │
│   Scan QR code or enter 6-character code    │
│                                             │
└─────────────────────────────────────────────┘
```

Tapping "RESTORE FROM SAVE CODE" transitions to the restore input screen.

### The Restore Input

Center of screen: a 6-cell input (one cell per character, like a verification code). Each cell is a bordered square (56×56px) with a blinking teal cursor in the active cell. Characters snap into cells as the player types — uppercase conversion automatic. After 6 characters, the check digit validates instantly:

- **Valid format:** The cell borders flash teal. A "RESTORING..." animation plays (the archipelago map in the background begins lighting up provinces one by one, matching the saved progress). 1-2 second fetch from CDN. Success: the map is fully lit to the player's progress state, blueprints are loaded, and a brief confirmation: "OPERATIONAL STATE RESTORED — 5 missions, 3 blueprints, 12 codex entries." The confirmation text types out in boot-log style, one character at a time, then fades after 3 seconds.

- **Invalid format (bad check digit):** The cells shake horizontally (120ms, 8px amplitude) and borders flash amber. Small text below: "Invalid code. Check for typos." The input clears for retry. No network request was made — the check digit caught it client-side.

- **Valid format, code not found on CDN:** Cells flash teal (format valid), but after the fetch: "Code not recognized. It may have expired or never been saved to the cloud." Below: "Try a different code, or start a new operation." No shaming, no panic.

- **Valid format, CDN unreachable:** "Save service unavailable. Try again later, or start a new operation. Your code will work when the service is back." Importantly: the game does NOT suggest the code is wrong. The message clearly attributes the failure to infrastructure, not the player.

### QR Restore

If the player clicks "Scan QR code" (or the game detects a camera-equipped device), a camera viewfinder appears (using `navigator.mediaDevices.getUserMedia`). The player holds their phone/printout up to the webcam (or uses the device's camera if on mobile). QR decoded → code auto-fills → restore proceeds.

**On devices without cameras** (typical classroom Chromebooks without webcams): the "Scan QR" option is hidden. Only the text input appears. The QR is useful for phone-to-phone or phone-to-laptop transfers, not Chromebook-to-Chromebook.

### Auto-Save Cadence

The game auto-saves to CDN (updating the existing code's blob) at:
- Every mission completion
- Every blueprint save
- Every settings change
- On browser `beforeunload` event (last-chance save when the tab closes)

A tiny cloud icon in the bottom-right of the campaign map shows sync status: ☁✓ (synced, green), ☁↑ (uploading, amber pulse), ☁✗ (failed, red, tap for details).

---

## Collision Avoidance — Deep Dive

### The Birthday Problem at Scale

With 31⁶ = 887,483,681 possible codes and N saves:

| N (saves) | Collision probability |
|---|---|
| 1,000 | 0.000056% |
| 10,000 | 0.0056% |
| 100,000 | 0.56% |
| 1,000,000 | 43.3% |

At 1 million saves, collisions are near-certain without mitigation. But Robot Uprising will realistically have <100K active save codes. At that scale, the raw birthday-problem collision rate is 0.56% — meaning ~560 codes would collide if generated naively.

### Mitigation: Check-and-Retry

The generation flow:
1. Generate random 5 characters + check digit.
2. HEAD request to CDN: does this code exist?
3. If yes: regenerate (new random characters, new check digit). Retry up to 5 times.
4. If all 5 retries collide (astronomically unlikely at <100K codes): fall back to 7-character code or error.

The check-and-retry approach reduces collision probability to effectively zero at any realistic scale.

### Mitigation: Sequential Allocation with Shuffle

Instead of random generation, pre-generate a shuffled list of all 887M codes and allocate sequentially. Each new save gets the next unused code. Zero collisions by construction.

**Problem:** This requires a central allocator (server state). Violates the "minimal backend" principle. And the shuffled list would need to be stored somewhere persistent.

**Verdict:** Random generation with check-and-retry is sufficient. Sequential allocation is overengineered for this population size.

---

## Player Journeys

### Journey: Mika, 14, High School Freshman in Manila

**Context:** Mika has been playing Robot Uprising in Mr. Santos's Friday CS lab for 3 weeks. She's on Mission 4. Her scout blueprint is named "SWIFT" with custom hooks and a tight context config. She sits at a different Chromebook each week — the lab doesn't have assigned seats.

**Minute 0:00 — Friday 2:30 PM, Week 3**

Mika opens `robotuprising.game/play?class=AGENT-SCOUT-RELAY` on Chromebook #7. The campaign map loads — but only Mission 1 is glowing gold. Everything else is locked. Her heart sinks. This isn't her Chromebook from last week. Her progress is gone.

But wait — the welcome screen has changed. Below "BEGIN NEW OPERATION" there's a second option: "RESTORE FROM SAVE CODE." And she remembers: last Friday, after she beat Mission 3, a modal appeared. "SAVE CODE: HXKM7-P." She wrote it on the inside cover of her notebook in blue pen.

**Minute 0:15 — The Restore**

She taps "RESTORE FROM SAVE CODE." Six empty cells appear, like a PIN entry. She opens her notebook. H-X-K-M-7. She types each character. The cells fill: `H` `X` `K` `M` `7`. She types `P` — the check digit. All six cells flash teal simultaneously. The background archipelago starts lighting up. Ifugao — cyan. Siquijor — cyan. Palawan — cyan. Three provinces lit in 1.5 seconds.

Then: "OPERATIONAL STATE RESTORED — 3 missions · 2 blueprints · 8 codex entries." The text types out character by character in teal monospace. Her workbench loads. "SWIFT" is there — patrol, evade, tight context config, the hook to "danger-channel." Everything.

"It WORKED!" she says. Mr. Santos smiles. He designed the class around save codes. He told every student to write their code in their notebooks on day one.

**Minute 0:30 — Playing Mission 4**

Mika dives into Mission 4. The new mechanic: multiple channels. She needs to wire two scouts to a relay, each on a different channel. She experiments for 15 minutes, fails twice (her scouts broadcast on the same channel, causing the relay to overload), then discovers she needs separate channels — one for threat detection, one for patrol reports.

**Minute 1:00 — Auto-Save**

She beats Mission 4. The tiny cloud icon in the bottom-right pulses amber briefly (☁↑), then settles to green (☁✓). Her save code — still HXKM7-P — now includes Mission 4 completion and her new relay blueprint "THE ROUTER."

She doesn't think about the save code. It just works. Next Friday, different Chromebook, same six characters, same progress.

**UI Annotations:**
- **Save code prompt timing:** Appears as a post-modal after first mission completion. "Your save code is HXKM7-P. Write it down — you'll need it to continue on another device." Dismissible but re-accessible from Settings → Save Code.
- **Notebook code:** Handwritten blue pen on lined paper, slightly messy teenager handwriting. The confusable-character exclusion means no O/0/I/1/L ambiguity.
- **Cloud sync icon:** 16×16px, bottom-right of campaign map, semi-transparent until hovered.

---

### Journey: Jun, 13, Mika's Seatmate, Not Tech-Savvy

**Context:** Jun plays FIFA and watches TikTok. He's in Mr. Santos's class because it's required. He didn't write down his save code.

**Minute 0:00 — Friday 2:30 PM, Week 4**

Jun opens the game on Chromebook #12. Welcome screen. He doesn't have a save code — he forgot to write it down, or maybe he dismissed the save code modal without reading it. He taps "BEGIN NEW OPERATION." Missions 1-3 are locked. He was on Mission 3 last week.

"Mr. Santos, my stuff is gone." Mr. Santos walks over. "Did you write down your save code?" "My what?" "After you finished Mission 1, a screen appeared with a 6-character code. Did you write it down?" "...no."

**Minute 0:10 — The Recovery Attempt**

Mr. Santos checks: "Which Chromebook were you on last Friday?" Jun doesn't remember. Mr. Santos opens Chromebook #3 (the one Jun usually sits at) and loads the game. localStorage might still be there — the IT admin runs cache clears on Sundays, so Friday's data might survive until Monday.

The game loads on Chromebook #3. Jun's progress is there! Mr. Santos navigates to Settings → Save Code → "VIEW YOUR SAVE CODE." The code appears: `TQWN4-R`. "Write. This. Down." Jun writes it on the back of his hand in marker.

Mr. Santos returns to Chromebook #12. Jun enters TQWN4-R. Progress restored.

**Minute 0:20 — The Lesson**

Mr. Santos addresses the class: "If you haven't written your save code in your notebook, do it now. Settings → Save Code. Write it on the first page. If you lose it and your Chromebook gets wiped, I cannot help you."

Every student in the room opens Settings. The lab goes quiet for 30 seconds as 15 students write 6-character codes in their notebooks.

**Minute 0:25 — Jun's Realization**

Jun looks at TQWN4-R written on his hand. "Is this like a password?" "Sort of," Mr. Santos says. "It's more like an address. It tells the game where your save file lives." Jun thinks about this. "So the game sent my stuff to the internet?" "Yes. When you complete a mission, the game uploads your progress to a server. The code is the address." "Huh." Jun isn't thinking about CDN architecture. But the concept of addressable cloud storage just entered his mental model through a Sharpie on his hand.

**UI Annotations:**
- **Settings → Save Code:** A dedicated panel showing the current code in large monospace, with COPY and PRINT QR buttons. If no code has been generated yet (player has never completed a mission), the panel shows: "Complete a mission to generate your save code."
- **Post-mission save code prompt:** First occurrence is persistent (stays until acknowledged). Subsequent occurrences are a brief toast: "Progress saved ☁✓" — no code display needed because the student already has the code.
- **Teacher intervention pattern:** Teacher navigates to Settings → Save Code on the student's last-known machine. This only works if localStorage hasn't been cleared.

---

### Journey: Prof. Adaora, 42, CS Professor, 35 Students

**Context:** Prof. Adaora is using Robot Uprising in her "Introduction to Multi-Agent Systems" course (6.11d-v). She chose Architecture E (Classroom Bucket). She needs save codes that work reliably for 35 students on 20 shared lab machines over a 15-week semester.

**Minute 0:00 — Semester Setup (Week 0)**

Prof. Adaora navigates to `robotuprising.game/teacher`. She clicks "CREATE CLASSROOM." A classroom code generates: `AGENT-SCOUT-RELAY` (three words, easy to say aloud and write on a whiteboard). She copies the student play URL: `robotuprising.game/play?class=AGENT-SCOUT-RELAY`.

She writes the URL on the course syllabus and projects it on the first day: "Bookmark this URL. Every lab session, open this link."

**Minute 0:15 — First Lab Session (Week 1)**

Thirty-five students open the URL on lab Chromebooks. Each sees the welcome screen with the classroom identifier at the top: `[AGENT-SCOUT-RELAY]` in small teal text — a subtle reminder they're in a managed classroom. Below, the game auto-generates a 4-character save code for each student (Architecture E3): `MK42`, `JR17`, `AQ88`, etc.

A prominent modal: "YOUR SAVE CODE: MK42. Write this down — you'll need it every lab session." A QR code sits beside it. Students snap photos of the QR with their phones.

**Minute 0:30 — The Dashboard**

Prof. Adaora opens `robotuprising.game/teacher/AGENT-SCOUT-RELAY` on her laptop. A dashboard loads:

```
CLASSROOM: AGENT-SCOUT-RELAY
35 students enrolled · Last activity: 2 minutes ago

┌──────┬───────────────┬────────────┬──────────┐
│ Code │ Last Save     │ Missions   │ Playtime │
├──────┼───────────────┼────────────┼──────────┤
│ MK42 │ 2 min ago     │ ██░░░░░░░░ │ 12m      │
│ JR17 │ 5 min ago     │ █░░░░░░░░░ │ 4m       │
│ AQ88 │ 1 min ago     │ ██░░░░░░░░ │ 15m      │
│ ...  │               │            │          │
└──────┴───────────────┴────────────┴──────────┘
```

Mission progress is a mini bar chart (10 segments for 10 missions). She can see at a glance: MK42 and AQ88 are on Mission 3; JR17 just started. She spots a cluster of students stuck on Mission 2 (hooks tutorial). She walks to that section of the lab and helps.

**Week 8 — The Payoff**

By Week 8, the dashboard tells a story. Every student has a unique progression curve. Some blazed through to Mission 7. Some spent 3 sessions on Mission 3 (context overload — always the hardest). One student (code: ZX99) has played 6 hours total, far more than required. Prof. Adaora makes a note to ask what they're building.

She clicks ZX99's code on the dashboard. A detail view shows: 7 missions completed, 5 named blueprints ("WHISPER" — a scout with minimal EM emissions, "MEGAPHONE" — a relay with maximum amplification, "ASSASSIN" — a striker with tight context filters). She smiles. This student is building an architecture.

**UI Annotations:**
- **Teacher dashboard:** Table view, sortable by any column. Click a row to expand detail panel. No student names — just codes. Teacher maps codes to names externally.
- **Classroom code display:** Three hyphenated words at the top of the student play URL and in the dashboard header. Generated from a curated word list (game-themed: RELAY, SCOUT, SIGNAL, BUFFER, HOOK, etc.).
- **Bulk export button:** Downloads a ZIP of all student saves (for backup or LMS upload). Each file named `{code}.uprising`.

---

### Journey: Wei, 28, Self-Taught Developer Practicing on Café Computers

**Context:** Wei doesn't own a laptop. He codes at internet cafés in Cebu, paying ₱25/hour. He found Robot Uprising through a Reddit thread about games that teach real engineering concepts. He plays during breaks between freelance work sessions. Each café visit might be a different machine.

**Minute 0:00 — First Encounter**

Wei opens `robotuprising.game` in Chrome at Café Horizon. He plays through Missions 1-3 in one sitting (90 minutes). He's fast — he recognizes the patterns from his work with message queues and pub-sub systems. His blueprints are named with professional vocabulary: "SENTINEL-alpha" (scout), "BACKBONE-01" (relay).

After Mission 3, the save code modal appears. `RVFX8-N`. He opens his phone's Notes app and types it. He also takes a screenshot of the QR code. He's been burned by café cache clears before.

**Minute 1:30 — Two Days Later, Different Café**

Wei is at Café Horizon's competitor across the street. Different Chromium browser, different machine. He opens the game. "RESTORE FROM SAVE CODE." He types RVFX8-N from his phone's Notes app. One second. Everything loads. "SENTINEL-alpha" and "BACKBONE-01" are there. Mission 4 is glowing.

He plays Mission 4 in 20 minutes, designs a command agent ("ORCHESTRA-01"), and the cloud icon pulses green. His save code didn't change — still RVFX8-N — but the data behind it now includes Mission 4 and the new blueprint.

**Minute 2:00 — The Realization**

Wei thinks: "This is basically what I build for clients. A stateless client with a CDN-backed persistence layer. The save code is a short hash key. The game is doing object storage with content-addressed retrieval." He opens the browser dev tools (Force of habit). He sees the PUT request to `saves.robotuprising.game/RVFX8N.json.gz`. He nods. "Clean."

**UI Annotations:**
- **Phone Notes app:** The most reliable save code storage for users without fixed machines. The code is short enough to be memorized after a few uses — RVFX8N becomes muscle memory, like a PIN.
- **Dev tools visibility:** The save system is transparent. The PUT/GET requests are visible. The JSON is readable. This isn't a locked vault — it's an open system. For Wei, seeing the mechanics reinforces the game's "real engineering" claim.

---

## Interaction Effects

### With Demo-to-Full-Game Migration (6.11a)
The save code is a natural bridge. The Steam full game's import screen (6.11a) accepts save codes alongside migration codes. Typing HXKM7-P in the full game fetches from the same CDN. The save code IS the migration code for most users. The longer migration code (base64 payload) is the offline fallback; the 6-character code is the online fast path.

### With Educational Integration (6.11d-v)
Architecture E (Classroom Bucket) is the educational variant of the save code. The class code creates a namespace; the student code creates an address within it. The teacher dashboard extends the save code from a personal persistence mechanism to a classroom management tool.

### With Config Sharing (7.03e)
Save codes and config codes serve different purposes but share infrastructure. A save code points to a full game state (progress + all blueprints). A config code points to a single blueprint. Both use the same CDN backend and similar code formats. The game must distinguish them — perhaps by prefix: `S-HXKM7P` for save, `C-RVFX8N` for config. Or by context: the restore screen accepts save codes; the workbench import accepts config codes.

### With PWA Installation (6.07a)
PWA persistence on iOS has a 7-day eviction risk for unused apps. Save codes are the safety net. If the PWA's IndexedDB is evicted after inactivity, the save code restores from CDN on next open. The auto-save cadence ensures the CDN is never more than one play session behind.

### With Competitive Infrastructure (6.11d)
Save codes for casual/educational play must be firewalled from competitive data. A save code should NOT include Gauntlet configs, match history, or competitive badges — these require authenticated profiles. The save code covers campaign progress, blueprints, and codex only.

### With the "Boot Log" Narrative (locked)
The save code generation moment is a diegetic opportunity. The boot log voice: *"Generating persistence key... RVFX8-N. This identifier encodes your operational state. Record it."* The language is clinical, AI-to-AI. The player isn't "saving their game" — they're exporting their operational state for transfer to another chassis.

---

## Comparable Systems

### Nintendo Switch Online — Save Data Cloud
Nintendo's cloud save system is the AAA version of what we're doing. It requires a subscription ($20/year), works automatically, and is invisible when it works. When it doesn't (Splatoon 3 disables cloud saves to prevent save scumming), players are furious. Lesson: save persistence is a hygiene factor — invisible when present, infuriating when absent.

### Animal Crossing: New Horizons — Island Transfer Tool
When ACNH launched, there was no way to transfer island saves between consoles. Players who upgraded their Switch lost hundreds of hours. Nintendo eventually released a dedicated Island Transfer Tool. Lesson: save portability is not optional — if you don't build it, the community will demand it, and the delay will cost goodwill.

### Wordle — The Daily Streak Problem
Wordle's daily puzzle stores your streak in localStorage. When the NYT acquired Wordle and moved domains, many players lost their streaks. The solution: a one-time migration prompt that transferred localStorage from the old domain to the new one. Lesson: localStorage-only persistence is fragile. Any domain change, cache clear, or device switch breaks it.

### Pokémon Mystery Dungeon — Rescue Passwords
Players could generate a text password (24 characters) that encoded their rescue state — dungeon floor, team, inventory. Another player would enter the password to accept the rescue mission. The password wasn't a lookup key — it was a deterministic encoding of game state. Robot Uprising's progress-only code (Architecture B fallback) is the same pattern, but our primary code (Architecture A) is a lookup key, which is strictly more capable.

### Kahoot — Game PINs
Kahoot's 6-digit game PINs are the closest UX precedent. A teacher creates a quiz, gets a PIN, writes it on the board. Students type the PIN on their devices. Same flow as our classroom save codes. Kahoot proves that 6-digit codes work in classroom settings — students can read them off a whiteboard, type them on phones, and the whole class is connected in under a minute.

---

## Sensory Description — The Full Save Code Experience

### First Generation (Post-Mission-1 Completion)

The Inspector debrief finishes. The player taps "CONTINUE" to return to the campaign map. Before the map loads, a new modal slides in from the bottom — smooth, 400ms ease-out.

Dark matte panel with a subtle border glow (teal, 1px, 30% opacity). Top: the boot-log voice types: *"PERSISTENCE PROTOCOL INITIALIZED."* Beat. *"Generating operational state key..."* A brief animation: six empty cells in a row, each filling with a random character cascade (like a slot machine) before settling on the final character. Left to right, 200ms per cell, each cell's cascade lasting 500ms. The effect takes ~1.8 seconds total.

The final code appears: **H X K M 7 - P**. Large (48px), monospace, white on dark charcoal cells. The check digit after the dash is slightly smaller (36px) and in a lighter shade — visually distinguished as "the verification bit."

Below the code: a QR code (if screen is wide enough — hidden on phones narrower than 375px). Below the QR: the data manifest: "✓ 1 mission · ✓ 1 blueprint · ✓ 4 codex entries" in gray text.

The boot-log voice types one final line: *"Record this identifier. It is your only persistence guarantee."*

Two buttons at the bottom: "COPY CODE" (teal fill) and "I'VE WRITTEN IT DOWN" (teal outline). Tapping COPY plays the crystalline chime (same as migration code export from 6.11a) and changes button text to "✓ COPIED" for 3 seconds. Tapping "I'VE WRITTEN IT DOWN" dismisses the modal with the tile-scatter animation.

**The sound:** During the slot-machine character cascade, a soft clicking sound — mechanical, like an old telephone exchange routing a call. When the final character settles, a single resonant tone: a bell (C5, 523 Hz), clean and clear, with 2-second decay. The "persistence confirmed" sound.

### Subsequent Saves (Auto-Save)

No modal. Just the tiny cloud icon (☁↑) pulsing amber for 500ms, then settling to green (☁✓). A barely audible whisper of the persistence tone — 20% volume, 200ms duration. The player doesn't notice unless they're looking for it. The save is invisible when working.

### Restore (Code Entry)

The six cells wait, cursor blinking in the first. Each character typed produces a soft keystroke sound — not a keyboard click but a data-entry tone, like scanning a barcode. Pitched slightly higher for each subsequent cell (C4, D4, E4, F4, G4, A4) — a rising scale that creates a sense of progression toward completion.

On successful validation (check digit matches): all six cells illuminate simultaneously with a teal flash, accompanied by the full persistence tone (C5 bell). The background archipelago begins its province-lighting sequence.

On failed validation: the cells shake with a discordant buzz (150 Hz, 200ms) — low, unmistakable, but not harsh. The amber color and gentle shake say "try again" without saying "you failed."

---

## Technical Specification — localStorage-to-Code Round-Trip

### Serialization

```
1. Read localStorage keys matching game prefix: `ru_*`
2. Collect into JSON object: { campaign: {...}, blueprints: [...], codex: {...}, settings: {...} }
3. Strip Inspector replays (too large, separate persistence path)
4. JSON.stringify → gzip compress → Uint8Array
5. Typical payload: 5-12 KB compressed
```

### Code Generation

```
1. Generate 5 random bytes from crypto.getRandomValues()
2. Convert to base-31 using the confusable-excluded alphabet
3. Take first 5 characters
4. Compute Luhn-mod-31 check digit from the 5 characters
5. Append check digit → 6-character code
6. HEAD request to CDN: does this code exist?
7. If collision: regenerate from step 1 (up to 5 retries)
8. PUT compressed payload to CDN: saves.robotuprising.game/{code}.json.gz
```

### Restoration

```
1. Player enters 6 characters
2. Validate check digit (Luhn-mod-31). If invalid: reject immediately, no network call
3. GET saves.robotuprising.game/{code}.json.gz
4. If 404: "Code not recognized"
5. If 200: decompress gzip → JSON.parse → validate schema version
6. If schema version mismatch: run migration function (see 6.11a-ii)
7. Write to localStorage keys: ru_campaign, ru_blueprints, ru_codex, ru_settings
8. Reload game state from localStorage
```

### Expiry Policy

Save codes that haven't been read or written in **12 months** are eligible for CDN cleanup. Before deletion, an email is sent — wait, there are no emails. No accounts.

**Alternative expiry communication:** The game itself. If a player returns after 11 months of inactivity and their save code is about to expire, the restore flow shows: "This save hasn't been updated in 11 months. It will be permanently deleted in 30 days. Play a mission to renew it."

**Alternative: no expiry.** At <50 KB per save and <100K saves, total storage is <5 GB. At $0.015/GB/month on R2, that's $0.075/month forever. Just keep everything. The cost of maintaining save codes is negligible compared to the goodwill cost of deleting someone's blueprints.

**Recommendation: No expiry.** The storage cost is trivial. Never delete a player's save.

---

## Open Questions

1. **Should the save code be visible in the URL?** E.g., `robotuprising.game/play?save=HXKM7P`. This allows bookmarking a restore URL. But it also means sharing the URL shares the save code. For educational contexts: useful (teacher can distribute pre-loaded URLs). For personal use: mild privacy concern.

2. **Should save codes support versioned snapshots?** The current design overwrites on each save. A "version history" where the code points to the latest but old versions are accessible (e.g., `HXKM7P-v3`) would enable rollback. Cost: 3-5× storage. Benefit: safety net for accidental overwrites.

3. **Should the save code double as a "spectator pass"?** If someone enters your save code, they see your progress but can't modify it (read-only mode). This enables peer review — students can inspect each other's architectures without modifying them.

4. **What happens when a student graduates?** Their classroom save code (`MK42` in classroom `AGENT-SCOUT-RELAY`) stops being useful after the semester. Should it convert to a global save code automatically? Should the teacher have a "release students" action that migrates classroom saves to global namespace?

5. **Multi-device conflict resolution:** Player saves on Device A, then plays offline on Device B, then Device B comes online. The CDN has Device A's save; Device B has a different state. Which wins? Options: last-write-wins (simple, lossy), merge (complex, lossless for non-conflicting changes), prompt the player.
