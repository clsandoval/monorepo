# 6.11e — QR Code Physical-to-Digital Funnel: Convention Booths, Poster Campaigns, and Attribution-Tracked Three-Step Acquisition

## Overview

Every game demo lives behind a URL. Most URLs are shared digitally — a link in a tweet, a Discord message, a TikTok bio. But Robot Uprising has a structural advantage that most indie games don't: a **SE Asian cyberpunk aesthetic rooted in a specific geography** — the Philippine archipelago. This means there are physical places where the game's target audience concentrates: Philippine gaming conventions (ESGS, CONQuest, GameON), SEA esports events, university gaming orgs, internet cafes in Manila and Cebu, and the growing indie game meetup circuit in Southeast Asia. A QR code on a poster in Makati doesn't feel like marketing spam. It feels like a piece of the game's world leaking into the real one.

The three-step funnel is deceptively simple: **scan QR code → play browser demo → wishlist on Steam.** But each step carries design decisions that compound. The QR code's visual design determines whether someone scans it. The landing page's first 3 seconds determine whether they stay. The demo's conversion surface determines whether they wishlist. And the attribution parameter baked into every QR URL — `?src=esgs-booth-2026`, `?src=poster-katipunan-ave`, `?src=sticker-cebu-uni` — means every physical placement becomes a measurable experiment.

This document explores the full design space: what the physical materials look like, how the QR codes are designed and tracked, how convention booth presence works, and how the physical-to-digital bridge interacts with the game's existing web demo infrastructure (6.11), demo analytics (6.11b), and brand identity.

---

## The Physical Materials

### QR Code Design Language

The QR code itself is not a generic black-and-white grid. It is a **branded artifact** — a piece of Robot Uprising's world rendered as a scannable pattern.

The base QR code is generated at error correction level H (30% redundancy), which allows up to 30% of the code's surface to be replaced with custom graphics without breaking scannability. The center logo zone (the standard "quiet zone" replacement) contains a simplified version of the game's unit icon — a cyan triangular Scout silhouette on a dark background, 18x18mm at print scale. The QR modules (the individual squares) are rendered not as crisp black-on-white but as **dark charcoal (#1a1a2e) on a matte gunmetal (#2d2d3d)** — the same palette as the game's boot log screen. The finder patterns (the three large corner squares) are replaced with stylized circuit-board traces, thick L-shaped lines with small circular pads at the corners, rendered in the game's signature amber (#d4a056). A thin amber border runs around the entire code, 1px at screen scale, with a subtle dashed pattern that echoes the hook visualization's subway-map line style.

Beneath the QR code, a single line of text in the game's UI monospace font (the same amber monospace used in boot logs): `SCAN TO INITIALIZE`. No URL visible. No "visit our website." The diegetic framing — you're not scanning a marketing code, you're initializing a system — matches the game's boot-log onboarding where the player IS the AI reading its own spec sheet.

The full QR block (code + text + border) fits in a 45x52mm rectangle. At this size, it scans reliably from 15-25cm on any modern phone camera. The amber-on-dark color scheme scans correctly because QR readers detect contrast ratio, not literal black-and-white.

### Poster Design

The poster is A2 size (420x594mm), portrait orientation. It is not a screenshot collage. It is a single atmospheric image: an isometric rice terrace board — Ifugao province — rendered at high resolution, with three units mid-battle. A Scout's perception radius glows cyan, signal lines pulse between a Relay and a Striker, and the Striker's context bar is visibly filling. The scene is frozen at the moment before an EXECUTE resolution — maximum tension, maximum visual density. The board is rendered with the game's tilt-shift depth-of-field effect, background tiles softly blurred, the central action cluster razor-sharp.

Above the board, the game's title in the display typeface: **ROBOT UPRISING**. Below the title, a single tagline line: *"Design minds. Watch them think."* Both in warm off-white (#f0e6d2) against the dark scene.

The QR code block sits in the bottom-right corner, positioned so it's at comfortable phone-scanning height when the poster is mounted at standard eye level (center at 160cm). A subtle circuit-trace line connects the QR block to the nearest unit on the board, as if the QR code is another node in the signal network.

The bottom-left corner carries the game's platform badges: Steam logo, "Playable in browser," and the Robot Uprising URL in small text (for people who prefer typing to scanning). No social media handles on the poster itself — the demo page handles that conversion.

### Convention Booth Materials

Beyond posters, the physical material set includes:

**Business cards** (85x55mm, standard credit card size): Front is a miniature version of the poster art — the isometric battle scene, cropped to a single dramatic moment. Back is the QR code block centered, with `robotuprising.game` in small text beneath. Printed on 350gsm matte cardstock with spot UV on the unit silhouettes, so the robots catch light differently than the background. The card feels heavy, deliberate. Not a throwaway flyer.

**Die-cut stickers** (50x50mm circle): The Scout unit silhouette — the cyan triangle with its perception-radius arc — on a transparent background. The QR code is encoded in a micro-pattern within the perception arc itself, scannable but not obviously a QR code until you try. Below the unit, tiny text: `robotuprising.game/play`. These are designed to end up on laptops, phone cases, water bottles. Every sticker placement is a permanent passive advertisement.

**Table tent cards** (for convention demo stations): A folded card showing the three-step funnel visually: Step 1 icon (phone scanning), Step 2 icon (browser window with game board), Step 3 icon (Steam wishlist button). Each step connected by the game's signal-line visual language — dashed amber lines with traveling dots. The QR code is on the back panel, facing the next person in the queue.

---

## Attribution Tracking Architecture

Every QR code encodes a URL with a `src` parameter:

```
https://robotuprising.game/play?src={campaign}-{location}-{variant}
```

Examples:
- `?src=esgs2026-booth-poster-a` — ESGS 2026, booth placement, poster variant A
- `?src=poster-katipunan-q4` — Street poster, Katipunan Avenue, Q4 2026
- `?src=sticker-upd-batch3` — Sticker, UP Diliman campus, third print batch
- `?src=card-conquest2026` — Business card, CONQuest convention 2026

The landing page reads `src` on load and:
1. Stores it in `localStorage` as `attribution_source` (persists across sessions)
2. Fires a `scan_arrived` event to the demo analytics pipeline (6.11b)
3. Passes it through to the Steam wishlist click as a UTM parameter

This creates a full attribution chain: **which physical material → which location → which event → led to a demo play → led to a wishlist → led to a purchase.** The analytics dashboard (6.11b) can show conversion funnels per source, answering questions like: "Do convention booth scans convert better than street poster scans?" and "Which convention had the highest scan-to-wishlist rate?"

**QR code generation is automated.** A simple build script takes a CSV of placements (campaign, location, variant) and generates print-ready QR code blocks with the correct encoded URLs, the branded visual treatment, and a human-readable label on the back for inventory tracking. Each batch gets a unique variant suffix so reprint effectiveness can be compared.

**Scan volume estimation:** A well-placed poster at a Philippine gaming convention (ESGS draws ~45,000 attendees over 3 days) might generate 200-800 scans depending on placement. A convention booth with active demo stations and card handouts might generate 500-2,000 scans over the event. Street posters in high-foot-traffic areas (university belts, MRT station exits) might generate 20-80 scans per poster per month. These numbers are small compared to digital channels — but the intent quality is vastly higher. Someone who physically scanned a QR code at a gaming convention is a warmer lead than someone who clicked a Reddit link while half-asleep.

---

## Convention Booth Design

The booth itself is the game made physical.

### The Demo Stations

Two to four tablets (iPad or Android) mounted on angled stands, each running the web demo in Safari/Chrome. The tablets are set to the Quick Play track (8.04e Model 6 dual-track) — the 4-minute compressed experience. Each station has over-ear headphones (closed-back, to cut convention noise) so the player hears the boot log keystrokes, the kulintang shimmer on load, the Sealed Watch tick clock. A laminated card next to each tablet shows a 3-step quick-start: "1. Read the boot log. 2. Configure your Scout. 3. Press EXECUTE and watch."

The tablets auto-reset to the title screen after 90 seconds of inactivity. A "Scan to save your config" prompt appears after mission completion — the player scans a dynamically generated QR code on-screen that encodes their Config Code (7.03e carrier pigeon model), letting them continue on their own phone later. This is the reverse QR flow: the game generates a code for the player, instead of the player scanning a code for the game.

### The Backdrop

A 2m-wide fabric banner behind the demo stations. The banner is the poster art at massive scale — the isometric battle scene, units mid-signal, the archipelago map faintly visible in the background. The game title is at the top. The QR code is printed at 30cm scale in the bottom-right of the banner, scannable from 2-3 meters away (someone standing in the aisle, deciding whether to approach).

### The Handoff

Every person who plays at the booth gets a business card. The booth attendant (ideally the developer) hands it with a specific prompt: "Scan this when you get home — the full demo runs in your browser, no download." This reframes the card from "marketing material I'll throw away" to "access key to something I already enjoyed." The card's QR code has a booth-specific attribution tag, distinct from the banner's QR code, so the analytics can measure: "Of people who played at the booth, how many scanned the card later?"

### The Queue Entertainment

While waiting for a demo station, people standing in the queue face a 24-inch monitor mounted vertically, looping a curated reel of Sealed Watch replays — the Replay Theater content (6.11 Model D). No sound (convention floor is too loud). Captions overlay each replay: "This Scout survived 40 ticks because its context window was configured to prioritize enemy movement over terrain data." The monitor has a QR code in the corner: "Can't wait? Play now on your phone →" with a mobile-optimized demo URL. This converts queue-waiters into immediate phone players, and those phone sessions carry the `src=esgs2026-queue-monitor` attribution tag.

---

## Regional Targeting

### Philippine Gaming Conventions

| Event | Typical Attendance | Timing | Booth Cost Estimate | Notes |
|-------|-------------------|--------|-------------------|-------|
| ESGS (Electronic Sports & Gaming Summit) | 40,000-50,000 | October | PHP 80,000-150,000 ($1,400-2,600) | Largest Philippine gaming event. SMX Convention Center, Pasay. Mix of AAA publishers and indie section. |
| CONQuest | 15,000-25,000 | June | PHP 30,000-60,000 ($520-1,040) | Pop culture + gaming. SMX, Pasay. Younger demographic, strong cosplay/social media crossover. |
| GameON | 5,000-10,000 | Varies | PHP 15,000-30,000 ($260-520) | Smaller, more indie-focused. Lower cost, higher per-attendee engagement. |
| GAME Developers Association of the Philippines (GDAP) events | 500-2,000 | Quarterly | Often free for Filipino devs | Industry-facing. Press contacts, potential partnerships. |

### SEA Events

| Event | Location | Notes |
|-------|----------|-------|
| GameStart Asia | Singapore | SEA's largest multi-country gaming event. English-speaking audience. |
| Indonesia Game Xpo | Jakarta | Massive mobile gaming market, growing PC/indie interest. |
| Thailand Game Show | Bangkok | Strong indie section in recent years. |
| Level Up KL | Kuala Lumpur | Developer-focused, good for press and industry connections. |

### Street-Level Placement

University gaming orgs are the highest-value street-level placement. UP Diliman, Ateneo de Manila, De La Salle, UST — each has active gaming communities, bulletin boards, and common areas where posters persist for weeks. The QR poster on a CS department bulletin board at UP Diliman is reaching exactly the audience that will understand "context window" and "hook router" as real engineering concepts (8.08). A poster in a Mineski internet cafe branch reaches the competitive gaming demographic. A sticker on a jeepney stop bench in Katipunan is ambient brand presence.

---

## The Scan Experience

### What Happens When You Scan

The phone's camera recognizes the QR code. The browser opens. The screen is black for 0.8 seconds — not a loading failure, but a deliberate dark hold that matches the game's boot-log aesthetic. Then: a single amber line types itself across the top of the screen, character by character at 40 chars/second.

```
INCOMING CONNECTION... SOURCE: ESGS-2026-BOOTH... VERIFIED.
```

The source tag from the QR URL is displayed in the connection message. A player scanning at ESGS sees "ESGS-2026-BOOTH." A player scanning a street poster sees "KATIPUNAN-AVE-Q4." The physical location they're standing in is reflected back to them on-screen. This is the game's diegetic voice acknowledging the physical world — you didn't just click a link, you established a connection from a specific place.

After the connection message (1.5 seconds), the standard demo title screen loads: the Philippine archipelago, circuit lines pulsing, Ifugao glowing gold. But a small amber badge in the top-right corner reads `FIELD OPERATOR` — a cosmetic label that persists through the demo session, marking this player as someone who entered through a physical channel. The badge has no mechanical effect. It's a psychological anchor: you're not a random internet visitor, you're a field operator who connected from a real location.

The entire sequence — scan to playable title screen — takes 3.2 seconds on a typical Philippine 4G connection (15-25 Mbps). The connection message doubles as a loading screen, masking asset prefetch behind narrative.

---

## Player Journeys

#### Journey: Marco, 19, Computer Science Student at UP Diliman

**Context:** Walking through the AS (Arts and Sciences) building between classes. A poster on the CS department bulletin board catches his eye — an isometric grid with tiny robots, signal lines between them, the whole scene rendered in that specific dark-teal-and-amber palette he associates with terminal windows. He almost walks past. But the tagline stops him: "Design minds. Watch them think." And at the bottom, a QR code with amber circuit-trace borders and the text `SCAN TO INITIALIZE`.

**The Scan (12:47 PM)**
He pulls out his phone — a Realme C55 with a cracked screen protector — and opens the camera. The QR code resolves instantly despite the amber-on-dark color scheme (error correction level H handles partial occlusion from the screen protector's crack shadow). Chrome opens. Black screen. Then amber text typing itself across the top: `INCOMING CONNECTION... SOURCE: POSTER-UPD-CS-DEPT... VERIFIED.` He grins. The game knows where he is. The `FIELD OPERATOR` badge appears in the corner.

**The Demo (12:48 PM - 12:55 PM)**
The archipelago loads. He taps Ifugao. The boot log begins typing. "Subsystem: perception engine... allocating 6 context slots." He's standing in a hallway, holding his phone in portrait mode. The demo detects portrait and loads The Flip layout (6.07b) — full-screen boot log, no awkward landscape prompt yet. He reads every line because the boot log is describing a system architecture he recognizes from his Operating Systems class. Context window. Buffer eviction. Hook subscriptions. These aren't game-specific terms — these are the concepts from his textbook, rendered as a playable system. He configures his Scout's context window, toggling perception filters. He presses EXECUTE. The phone prompts a landscape rotation (the bzt-bzt haptic nudge). He rotates. The Sealed Watch plays. His Scout navigates the rice terrace grid, signal lines flashing, context bar filling. It encounters an enemy. The context bar fills to capacity — the oldest observation falls out. The Scout makes a decision based on incomplete information. It works. Marco whispers "gago" — the Filipino expression of disbelief that doubles as admiration.

**The Conversion (12:56 PM)**
Mission 1 complete. The results screen shows his match stats and a "Continue on Steam" button with the Steam wishlist widget embedded. Below it: "Share your config" with a generated QR code — his blueprint encoded as a scannable pattern. He screenshots the results (the match card auto-generates with the `robotuprising.game` watermark). He wishlists on Steam. He sends the screenshot to his CS org's group chat on Messenger with the caption: "may game na nagtuturo ng context windows, legit" ("there's a game that teaches context windows, for real"). Three people in the chat scan the poster QR code that afternoon. The attribution chain: poster → Marco → screenshot → group chat → 3 more scans from the same poster.

**What the analytics see:** `src=poster-upd-cs-dept` → demo load → M1 complete (7m12s) → Steam wishlist click → match card screenshot (detected via clipboard API attempt). Conversion: 1 scan → 1 wishlist + 3 secondary scans (though the secondary scans are attributed to the poster, not to Marco's share — a limitation of QR attribution that could be addressed with shareable referral codes in 6.11e-i).

#### Journey: Aya, 26, Game Artist at a Manila Studio, at ESGS 2026

**Context:** Day 2 of ESGS. She's been walking the floor for three hours. Her badge lanyard is decorated with enamel pins from other booths. She's worked in the Philippine game industry for four years — character art for mobile gacha games, mostly — and she's jaded about indie booths. Most of them have a laptop running a Unity prototype with placeholder art and a nervous developer who talks too fast. She spots a booth with a fabric banner showing an isometric battle scene in dark teals and ambers. The art catches her professional eye: those are actual pixel-art sprites with deliberate color palettes, not programmer art. The isometric tiles have proper depth shading. Someone who understands visual design made this.

**The Booth (2:15 PM)**
She approaches. Two demo stations are occupied — a teenager hunched over a tablet, headphones on, and a woman in her thirties tapping deliberately at a second station. A third station is free. The laminated quick-start card is propped next to it. She picks up the headphones and puts them on. The convention floor noise drops away. The demo is on the title screen — the archipelago, the circuit lines, the kulintang shimmer playing through the headphones. Three ascending metallic notes, the last one ringing. She recognizes the sound: kulintang, her lola's favorite. The game is Filipino.

She plays Mission 1. The boot log types itself in amber monospace. The board loads — Ifugao rice terraces rendered in 64x32 isometric tiles with proper top-left lighting, dipterocarp tree sprites on the border tiles, each terrace step a slightly different emerald shade. She can tell these are hand-authored sprites, not procedural. The Scout unit is a cyan triangle with a subtle chrome reflection on its upper face and a 6-pip context bar beneath it — clean, readable, designed. She configures. She executes. She watches. The Sealed Watch plays with the tick-clock audio pulse in her headphones, each tick a soft mechanical click at 1-second intervals, the signal lines flashing with a faint electrical hum that rises in pitch as the context bar fills.

**The Handoff (2:28 PM)**
She finishes Mission 1. The developer hands her a business card. It's heavy — 350gsm matte, spot UV on the unit silhouette catching the fluorescent convention lighting as she tilts it. "The full demo runs in your browser when you get home," he says. She flips the card. QR code on the back, amber circuit borders, `SCAN TO INITIALIZE`. She tucks it into her badge lanyard sleeve, next to her business cards. She scans it that evening at home, sitting on her bed in her Makati studio apartment. The connection message reads: `SOURCE: ESGS2026-CARD...` She plays through Mission 2 and 3. She wishlists. She DMs the developer on Twitter to ask if they need a character artist.

**What the analytics see:** Two attribution events — `src=esgs2026-booth-tablet` (the booth play, logged by the demo station's auto-reset tracker) and `src=esgs2026-card` (the evening home scan). The system can correlate these: same `localStorage` fingerprint means the same person played at the booth AND scanned the card later. Booth-to-card re-engagement rate is a key metric.

#### Journey: Tito Jun, 42, Jeepney Driver, Quezon City

**Context:** Waiting at the Katipunan jeepney terminal while his vehicle fills. There's a sticker on the metal railing of the waiting shed — a circular die-cut, 50mm, showing a cyan triangular shape with an arc around it, on a transparent background. It's been there for two weeks. He's noticed it before but never scanned it. Today the wait is long. He pulls out his phone — a secondhand Samsung Galaxy A12, Android 12 — and opens the camera. The QR code embedded in the arc pattern resolves. Chrome opens.

**The Scan (3:32 PM)**
Black screen. Amber text: `INCOMING CONNECTION... SOURCE: STICKER-KATIPUNAN-TERMINAL... VERIFIED.` The archipelago loads. He recognizes the map immediately — Luzon, Visayas, Mindanao. The Ifugao province glows. He taps it. The boot log begins. He reads slowly. "Subsystem: perception engine..." The Filipino in him recognizes "perception" — his daily driving is ALL perception, reading traffic patterns, anticipating jeepney stops, managing the flow of passengers. The game asks him to configure what a Scout pays attention to. He turns on "enemy positions" and "terrain." The concept of limited attention — you can only track so many things before the oldest observation falls out — maps perfectly to his driving experience. You watch the motorcycle on your left, the bus ahead, the pedestrian crossing, but if a fourth thing demands attention, you lose track of the first.

He plays for 4 minutes. He doesn't complete Mission 1 — a passenger approaches and he has to drive. But the demo auto-saved his progress to `localStorage`. The next day, same terminal, same wait, he scans the same sticker. The connection message plays again, but the demo loads directly to his in-progress mission. He finishes. He doesn't wishlist — he doesn't have a Steam account and his phone is his only computing device. But the demo is a PWA. He installs it to his home screen. He plays the Quick Play track twice more over the next week. The analytics tag him as a `retained_non_converter` — someone who plays repeatedly but never hits the Steam funnel. This cohort is valuable data: it suggests a mobile-native acquisition path (future Play Store release, or PWA push notification for Steam launch) worth exploring.

**What the analytics see:** `src=sticker-katipunan-terminal` → 3 sessions over 7 days → M1 complete (session 2) → M2 complete (session 3) → PWA install → no Steam click. Attribution insight: street stickers in transit areas reach a demographic that digital channels miss entirely — older, mobile-only, high-engagement but low-conversion-to-Steam. This data informs the PWA-vs-native-wrapper decision (6.07a) and validates the "URL as universal access" thesis.

---

## Strengths

- **Zero-friction physical-to-digital bridge.** No app download, no account creation, no QR code scanning app needed. Every modern phone camera reads QR codes natively. Scan → playing in 3.2 seconds.
- **Attribution granularity.** Every physical placement is a measurable experiment. Convention booth A vs. convention booth B. Street poster in Katipunan vs. street poster in Makati. Sticker batch 1 vs. sticker batch 2. The analytics pipeline (6.11b) ingests all of this.
- **Diegetic branding.** The QR code doesn't look like a marketing asset. The amber circuit-trace borders, the `SCAN TO INITIALIZE` text, the `INCOMING CONNECTION` landing screen — all of it extends the game's boot-log aesthetic into the physical world. The physical materials are world-building.
- **Geographic targeting.** Philippine gaming conventions and university campuses concentrate exactly the audience that will resonate with the game's SE Asian cyberpunk setting and real-engineering vocabulary. A poster at UP Diliman's CS department is a precision strike.
- **Compounding passive presence.** A sticker on a laptop or a waiting shed railing persists for months. Each scan costs nothing. The QR code never expires (the URL is permanent). Physical placements are a one-time cost with indefinite return.
- **Convention booth as playable demo station.** The web-native stack means the booth runs the same demo on tablets — no custom build, no offline mode needed, no Steam keys to distribute.

## Weaknesses

- **Low absolute volume.** Even a successful convention booth generates hundreds to low thousands of scans. A single viral TikTok generates more clicks. Physical channels are high-quality but low-quantity.
- **Print cost and logistics.** Posters, business cards, stickers, and booth materials require upfront investment, physical distribution, and inventory management. A solo developer wearing multiple hats may not have bandwidth for print logistics.
- **QR code fatigue.** Post-COVID QR code ubiquity (restaurant menus, parking payments, contact tracing) has both normalized scanning (good) and created "QR blindness" — people ignoring QR codes because they assume it's a menu or a form. The branded design and `SCAN TO INITIALIZE` framing attempt to counter this, but some percentage will skip.
- **Attribution leakage.** If Marco screenshots his results and shares them in a group chat, the three friends who scan the poster are attributed to the poster, not to Marco's viral share. Word-of-mouth amplification — the most valuable second-order effect — is invisible to QR attribution. Referral codes (a potential 6.11e-i aspect) could address this.
- **Mobile-only first impression.** Convention scans happen on phones. The demo must be excellent on mobile (6.07) or the first impression is compromised. If the portrait-landscape transition stutters, if the touch targets are too small, if the load time exceeds 4 seconds on Philippine 4G — the physical channel's high-intent lead is wasted.
- **Regional limitation.** This strategy's highest ROI is in the Philippines and SEA. Western conventions (PAX, GDC, TGS) have much higher booth costs and an audience less specifically targeted by the game's cultural setting.

---

## Interaction Effects

### With Demo Analytics (6.11b)

The `src` parameter is the bridge. Every QR scan feeds into the same analytics pipeline that tracks digital acquisition. The dashboard gains a "Physical Channels" panel showing scan volume, demo completion rate, and wishlist conversion rate per physical source. A/B testing becomes possible: two poster variants at the same convention, with different `src` tags, measuring which art direction generates more scans. The analytics pipeline doesn't need modification — the `src` parameter is already designed for this. The physical channel is just another acquisition source feeding into existing infrastructure.

### With the Web Demo Platform (6.11, 8.04e)

The QR code links to the same demo URL that digital channels use. No separate build. No separate landing page. The `INCOMING CONNECTION` sequence is a 1.5-second addition to the standard load flow, triggered by the presence of a `src` parameter. The `FIELD OPERATOR` badge is a CSS class toggle. The engineering cost of supporting QR attribution is near-zero because the web demo was already designed as a URL-first, no-account, instant-play experience. Physical channels are parasitic on existing infrastructure in the best possible way.

### With the SE Asian Cyberpunk Brand

The physical materials ARE the brand. A sticker with a cyan Scout silhouette on a jeepney terminal railing in Quezon City is the game's world manifesting in the physical Philippines. The amber circuit-trace QR borders echo the boot log's visual language. The `SCAN TO INITIALIZE` prompt is diegetic — it's how an AI system would describe the act of a human connecting. The convention booth's fabric banner, showing the Ifugao rice terraces rendered as an isometric game board, is a statement: this game is set HERE, in these islands, in this geography. For a Filipino attendee at ESGS, seeing their own archipelago rendered as a cyberpunk battlefield is a different emotional register than seeing another generic sci-fi shooter. The physical materials make the cultural specificity tangible — literally something you hold in your hand.

### With Cross-Platform Sharing (7.03e)

The convention booth's "Scan to save your config" reverse-QR flow (game generates QR for player) dovetails with the Config Code sharing infrastructure. A player who builds a configuration at the booth, scans the config QR on their phone, and later loads it at home is using the Carrier Pigeon model (7.03e-A) triggered by a physical interaction. The convention becomes a config-generation event — dozens of unique configurations created under time pressure, each one a shareable artifact that can propagate through the player's social network.

---

## Comparable Games and Campaigns

### Indie Game Convention Marketing (General)

The indie game convention circuit — PAX Rising, Day of the Devs, EGX Rezzed — is well-documented. Common patterns: a laptop or monitor running the game, a developer standing behind it, a banner, and a stack of postcards with a Steam wishlist QR code. The conversion funnel is: play at booth → "wishlist it!" verbal prompt → player takes postcard → maybe scans later. Most indie developers report that 30-50% of postcards are never scanned. The Robot Uprising approach differs in two ways: (1) the demo continues on the player's own device (same URL, same build, auto-saved config), turning the postcard into a "continue playing" key rather than a "remember to wishlist" reminder, and (2) attribution tracking on every code means the developer can measure actual postcard scan rates and optimize.

### QR Codes in Japanese Game Marketing

Japanese publishers — particularly for mobile games — have a deep history with QR codes predating their global adoption. Famitsu magazine ads routinely include QR codes linking to game trailers or pre-registration pages. Monster Hunter's real-world collaboration events (cafe menus, train station posters) use QR codes to distribute in-game items, creating a "scan to receive" incentive beyond "scan to learn about." The Robot Uprising sticker design — where the QR code is embedded within the Scout's perception arc — draws from this tradition of making the QR code a designed object rather than a utilitarian grid. The `FIELD OPERATOR` badge mirrors Monster Hunter's event-exclusive titles: a small cosmetic reward for physical-world engagement.

### ARG Physical Elements

Alternate Reality Games (I Love Bees for Halo 2, Year Zero for Nine Inch Nails, Cicada 3301) use physical artifacts — posters, phone numbers, GPS coordinates — as entry points to digital experiences. The Robot Uprising QR funnel is not an ARG (there's no puzzle, no hidden narrative, no mystery to solve), but it borrows the ARG's core emotional mechanic: **the thrill of a physical object connecting you to a digital world.** The `INCOMING CONNECTION... SOURCE: POSTER-KATIPUNAN-AVE...` message — the game acknowledging your physical location — creates a micro-version of the ARG discovery moment. "This game knows where I found it." That recognition, even in miniature, converts a marketing interaction into a memorable experience.

### Vampire Survivors Itch.io Model

Vampire Survivors' permanent free browser demo (81,800 plays, organic "after 1 round I bought it on Steam" comments) proves that a URL-first strategy works. The QR funnel extends this: the URL is now printed on physical objects, scannable from physical locations. Every QR code is a permanent link to the free demo. The sticker on a laptop travels with its owner. The poster on a university bulletin board faces a new cohort every semester. The physical placement strategy turns the Vampire Survivors model from passive (exists on the internet, hope people find it) to active (placed in specific locations where the target audience concentrates).
