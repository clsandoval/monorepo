# 6.07a — PWA vs. Native Wrapper Decision: How Players Install and Access Robot Uprising on Mobile

## Overview

Robot Uprising's locked tech stack is React + Pixi.js + Vite — a web-native application. The game already runs in a browser. The question isn't whether to support mobile — the game is BORN mobile-capable. The question is: **what container does the game live in on a player's phone?** A bare URL? A Progressive Web App installed via "Add to Home Screen"? A Capacitor-wrapped native binary distributed through app stores? A Trusted Web Activity on Android? Each choice cascades through install friction, platform capabilities, update mechanisms, discoverability, monetization, and — critically — what the game can DO on the player's device.

This isn't a backend architecture decision. It's about the first 30 seconds of a player's relationship with the game: how they find it, how they get it onto their phone, and whether it feels like a "real app" or a website pretending to be one.

---

## The Five Options

### Option A: Pure PWA ("The Bookmark")

**What it is:** The game runs at `robotuprising.game/play`. Players can install it via the browser's "Add to Home Screen" mechanism. On Android, Chrome shows an install banner after engagement heuristics are met. On iOS, players must navigate Safari's Share menu → "Add to Home Screen" — a multi-tap process most users don't know exists.

**How it works mechanically:**
- The game serves a `manifest.json` declaring app name, icons, display mode (`standalone` — hides the browser chrome), theme color (dark, matching cyberpunk aesthetic), and start URL.
- A service worker caches the shell (`index.html`, JS bundles, critical sprites) for offline play. PixiJS v8's tree-shakeable bundle keeps the critical JS payload under ~200KB gzipped.
- On Android, after ~30 seconds of engagement, Chrome shows a mini-infobar: "Add Robot Uprising to Home screen." One tap installs.
- On iOS, nothing happens automatically. The game must show a custom in-app banner: a translucent overlay with a Safari share icon and "Install Robot Uprising → Tap Share → Add to Home Screen" instruction. This banner appears after the player completes Mission 1 (not before — don't interrupt the hook).

**What you gain:**
- **Zero install friction for first play.** URL → playing in under 3 seconds. No store, no download, no account. This is the lowest-friction path in all of gaming.
- **Instant updates.** New version = new deployment. Every player gets it on next load. No app review, no staged rollout unless you want one. Bug fix at 2 AM? Deployed by 2:05 AM.
- **No platform tax.** No 15-30% App Store / Google Play commission on purchases. No $99/year Apple Developer fee. No $25 Google Play registration fee.
- **Universal reach.** One URL works everywhere — any browser, any OS, any device. Share a link in Telegram, Discord, WhatsApp, Reddit — it just opens.
- **SEO-indexable.** Google indexes the game. "robot uprising strategy game" → organic search traffic. Native apps are invisible to search engines.
- **Tiny footprint.** No 200MB download. The game streams progressively — critical assets first, deferred assets during boot log reading time.

**What you lose:**
- **iOS install discoverability.** Safari's "Add to Home Screen" is buried. Typical PWA install rates on iOS are 1-3% of visitors vs. 5-8% on Android. Most iOS players will play in a Safari tab, not as an installed app.
- **No push notifications on iOS (unless installed).** iOS 16.4+ supports web push for home-screen PWAs, but the player must first install — which requires the manual share-menu dance. Players who don't install never get re-engagement pings.
- **50MB cache limit on iOS Safari.** The full game (all 10 missions, all sprites, all audio) likely exceeds this. Late-game assets must be loaded on-demand, not pre-cached. This means Mission 8-10 assets aren't available offline unless the player has recently played those missions.
- **7-day eviction on iOS.** If a player doesn't open the PWA for 7 days, Safari may purge cached data. Returning after a vacation means re-downloading everything. Save data (mission progress, blueprint configs, replay history) stored in IndexedDB faces the same eviction risk.
- **No Vibration API on iOS.** `navigator.vibrate()` is unsupported in Safari/WebKit. The haptic vocabulary designed for hook events (6.06a), EXECUTE ritual (6.06b), and context overload (6.06c) is completely silent on iPhone. Android Chrome supports it fine.
- **No App Store presence.** Players searching "strategy game" on the App Store will never find Robot Uprising. The game is invisible to the largest mobile game discovery surface.
- **WebGL performance ceiling.** PWA runs in the browser's rendering pipeline with no special GPU access. PixiJS v8 on WebGL2 handles the 8x8 grid easily, but particle effects, signal chain visualizations, and simultaneous animations may need throttling on low-end phones.

**Sensory description of the install experience:**
On Android: a slim banner slides down from below the address bar — "Add Robot Uprising to Home screen" in system font, small Robot Uprising icon (the AI eye glyph), a blue "Install" pill button. Tap → the icon flies to the home screen with a satisfying bounce animation. On iOS: the game shows a custom overlay after Mission 1 completion — semi-transparent dark scrim, a hand-drawn arrow pointing to the Safari share icon, "Install me for the full experience" in the boot-log's monospace font, steps 1-2-3 with screenshots. Dismissible with a tap outside. Re-shown once per session until installed.

---

### Option B: Capacitor Native Wrapper ("The App Store Resident")

**What it is:** The identical React + Pixi.js game, wrapped in a Capacitor shell, compiled into native iOS (.ipa) and Android (.apk/.aab) binaries, distributed through the App Store and Google Play.

**How it works mechanically:**
- Capacitor creates a native project (Xcode for iOS, Android Studio for Android) containing a WebView (WKWebView on iOS, Android System WebView or Chrome WebView on Android) that loads the game's web assets from the local filesystem.
- Native plugins bridge the WebView to device hardware: `@capacitor/haptics` for vibration, `@capacitor/push-notifications` for FCM/APNs push, `@capacitor/filesystem` for persistent storage beyond browser quotas, `@capacitor/screen-orientation` for locking orientation during sealed watch.
- Assets are bundled with the binary — no streaming, no cache eviction. The full game is on-device after install.
- Updates to web assets can be deployed via Capgo or Appflow live updates (over-the-air JS bundle swaps that bypass app store review for non-native changes). Native plugin changes require a store submission.

**What you gain:**
- **Full haptic feedback on iOS.** Capacitor's haptics plugin calls directly into UIKit's `UIImpactFeedbackGenerator` and `UINotificationFeedbackGenerator`. The EXECUTE ritual's long-press crescendo (6.06b), the tick-clock's tap-per-tick (6.06a), context overload's stutter-burst (6.06c) — all work. This is the single biggest capability gap between PWA and native on iOS.
- **Persistent storage.** No 50MB limit. No 7-day eviction. Save data, replay history, cached assets — all survive indefinitely. A player can come back after a month and everything is there.
- **Push notifications everywhere.** FCM (Android) and APNs (iOS) via Capacitor's push plugin. Re-engagement: "Your Gauntlet rank decayed — defend your position" or "New weekly challenge: The Stealth Doctrine."
- **App Store discoverability.** "Robot Uprising" appears in App Store / Google Play search results. Category browsing, editorial features, "Games We Love" placement. The App Store is the #1 game discovery surface on mobile — being absent from it is being invisible.
- **Background audio.** Web Audio API in WKWebView pauses when the app is backgrounded. Capacitor can use native audio plugins to maintain audio continuity (ambient kulintang loops during plan phase).
- **Deep links and universal links.** `robotuprising://replay/abc123` opens the game directly to a shared replay. Universal links work from any app — tap a replay link in Telegram, game opens to the Inspector.
- **Screen orientation lock.** Force landscape during sealed watch for wider battlefield view, allow portrait during plan phase for workbench editing.

**What you lose:**
- **Install friction.** The player must find the game in the store, tap download, wait for a 50-200MB download, tap "Open." This adds 30-120 seconds of friction compared to a URL. Industry data shows each additional step in the install funnel loses 20-30% of potential players.
- **App Store review delays.** Apple's review typically takes 24-48 hours. Critical bug fixes can't ship instantly. Live update services (Capgo/Appflow) bypass this for JS changes but not native code changes. Cost: Capgo ~$14/month for indie tier.
- **Platform commission.** Apple and Google take 15% (first $1M/year) to 30% of in-app purchases. If Robot Uprising sells for $9.99, Apple takes $1.50-$3.00 per sale. For a small indie game, this is significant.
- **Two build pipelines.** Maintaining Xcode and Android Studio projects alongside the web stack. Capacitor simplifies this but doesn't eliminate it — iOS-specific quirks (WKWebView audio suspension, safe area insets, notch handling) require platform-specific code.
- **Android WebView fragmentation.** Android 7-9 uses Chrome as WebView; Android 10+ uses Android System WebView. Performance, WebGL support, and Web Audio behavior vary across versions. A player on an Android 8 phone with Chrome 92 may have a different experience than one on Android 14 with Chrome 120.
- **App Store rejection risk.** Apple has historically rejected "web wrapper" apps that don't provide enough native functionality. The game must use enough Capacitor plugins (haptics, push, orientation) to justify the native shell. This hasn't been a major issue for games with meaningful native integration, but it's a risk.

**Sensory description of the install experience:**
The App Store page: a large hero image showing the isometric battlefield — rice terrace tiles glowing cyan, a Scout's perception radius drawn in translucent blue, a Relay's signal chain rendered as dashed golden lines. Below, screenshots cycle: Plan screen with blueprint editor, Sealed Watch mid-battle, Inspector timeline scrubber with decision trace expanded. "Robot Uprising: Design the Uprising" in bold. ★★★★½ (4.7). "Get" button in blue. Tap → download bar fills → "Open." The game launches: no browser chrome, no URL bar. Full-screen boot log. It feels native. The Capacitor splash screen is a single-frame shot of the Philippine archipelago map with circuit traces, fading to the actual rendered map in under 500ms.

---

### Option C: Trusted Web Activity — Android Only ("The Play Store Window")

**What it is:** A TWA wraps the PWA in a thin Android shell that renders it via Chrome (not a WebView) and distributes it through Google Play. The game URL is verified via Digital Asset Links, so Chrome renders it without any browser UI — it looks like a native app.

**How it works mechanically:**
- The Android project is minimal — an `Activity` that launches a Chrome Custom Tab in TWA mode, pointed at the game's URL.
- Chrome renders the game with full Chrome performance (not a degraded WebView). This means the latest WebGL2 implementation, Web Audio API, and all Chrome-supported web APIs.
- The app must pass Lighthouse Performance audit at ≥80% to be accepted.
- First launch requires Chrome and an internet connection (it loads from the URL). Subsequent launches use the service worker cache.
- Size: ~2-5MB APK (just the launcher), with game assets loaded/cached on first run.

**What you gain:**
- **Google Play presence** for Android. Search, category browsing, editorial features.
- **Chrome-grade performance.** Better than Capacitor's WebView on many Android devices because it's actual Chrome, not the system WebView.
- **Tiny install size.** 2-5MB APK vs. 50-200MB for Capacitor-bundled app. "It's only 3MB!" is a compelling bullet point in developing markets with limited storage (Philippines, where the game is set).
- **Vibration API works.** Chrome on Android supports `navigator.vibrate()`.
- **No code change from PWA.** The TWA wraps the same URL — zero web-side development needed. The entire cost is the Android project boilerplate.

**What you lose:**
- **Android only.** Apple has no TWA equivalent. iOS remains PWA-in-Safari or Capacitor.
- **Requires Chrome.** If the user's default browser isn't Chrome (Samsung Internet, Firefox), the TWA may fall back to a Custom Chrome Tab with visible browser UI. ~65% of Android users use Chrome as default globally.
- **No native API access.** No native haptics beyond `navigator.vibrate()`, no native push beyond Web Push, no filesystem access beyond browser quotas. It's a PWA in a Play Store costume.
- **First-launch requires internet.** Unlike Capacitor, where assets are bundled, the TWA must download assets on first run. On slow connections, this could mean a 30-60 second first load.
- **Google Play commission still applies** (15-30%) for in-app purchases routed through Google Play Billing.

**Sensory description:**
The Play Store listing looks identical to any native game. Player taps "Install" — the familiar green progress bar fills in under 5 seconds (tiny APK). They open the app. It launches full-screen — no Chrome URL bar, no navigation buttons. Boot log begins. The only tell that this isn't native: if the player force-kills Chrome, the game also closes. They'd never notice.

---

### Option D: Hybrid Progressive ("The Web-First Ladder")

**What it is:** The recommended approach. A layered strategy where each wrapper serves a different point in the player's journey:

1. **Bare URL** → first contact, viral sharing, demo
2. **PWA install** → committed players, home screen presence
3. **TWA** → Android Play Store listing for discoverability
4. **Capacitor** → iOS App Store listing + full native capabilities

**How it works mechanically:**

The game ships as a single web codebase. A thin capability-detection layer at startup checks the runtime environment:

```
if (window.Capacitor) → native mode (haptics, push, filesystem, orientation lock)
else if (window.matchMedia('(display-mode: standalone)').matches) → installed PWA mode
else → browser mode (progressive enhancement, install prompts)
```

Each mode unlocks progressively more capabilities:

| Capability | Browser | PWA | TWA | Capacitor |
|---|---|---|---|---|
| Core gameplay | ✅ | ✅ | ✅ | ✅ |
| Offline play | ❌ partial | ✅ (SW cache) | ✅ (SW cache) | ✅ (bundled) |
| Push notifications | ❌ | ✅ Android, ✅ iOS 16.4+ | ✅ Android | ✅ all |
| Haptic feedback | ✅ Android | ✅ Android | ✅ Android | ✅ all |
| Persistent storage | ⚠️ 50MB iOS | ⚠️ 50MB iOS | ✅ Android | ✅ all |
| App Store presence | ❌ | ❌ | ✅ Android | ✅ all |
| Screen orient. lock | ❌ | ❌ | ❌ | ✅ |
| Deep links | ❌ | ❌ | ✅ Android | ✅ all |
| Save data durability | ⚠️ 7-day eviction iOS | ⚠️ 7-day eviction iOS | ✅ Android | ✅ all |
| Update speed | Instant | Instant | Instant | ~24-48h review |

**The "install ladder" — how players ascend:**

1. **Discovery (browser):** Player clicks a shared link. Game loads in 2.2 seconds. Boot log plays. They complete Mission 1. They're playing — no install, no account.
2. **Engagement (PWA prompt):** After Mission 2, a gentle prompt: "Add to Home Screen for offline play and notifications." On Android, the Chrome install banner appears naturally. On iOS, the custom share-menu instruction overlay appears.
3. **Commitment (store listing):** The game's "About" screen (accessible from campaign map) shows "Get the full experience on App Store / Google Play" with store badges. The web demo → full game conversion uses this surface.
4. **Investment (Capacitor app):** Players who want haptics on iOS, guaranteed save persistence, push notifications, and the "real app" feeling install via the store. Their save data migrates via Config Code (6.11a).

---

### Option E: Electron Desktop + Mobile Web ("The Desktop-First Sidestep")

**What it is:** Skip mobile native entirely. Ship the full game as an Electron app on Steam (PC/Mac/Linux), and serve mobile as PWA-only with explicit "best on desktop" messaging.

**What you gain:** Simplified engineering — one Electron build for Steam, one web build for everything else. No Xcode, no Android Studio, no Capacitor plugins.

**What you lose:** The entire mobile gaming market (which is 50%+ of all gaming revenue). The Philippines, the game's cultural setting, has 73M smartphone users and ~2M PC gamers. Mobile-first is existential for reaching the game's cultural audience.

**Verdict:** This option exists to be rejected. Including it maps the boundary of the design space. Robot Uprising cannot afford to be desktop-only. The cultural and market math demands mobile as a first-class citizen.

---

## Comparative Analysis: The Five Dimensions That Matter

### 1. First-Touch Friction (Time from Discovery to First Input)

| Wrapper | Steps | Time | Drop-off |
|---|---|---|---|
| Pure PWA | Click URL → playing | ~3 sec | ~5% |
| PWA installed | Click URL → playing → install later | ~3 sec first, ~1 sec installed | ~5% first, ~1% installed |
| TWA | Find in Play Store → Install → Open → playing | ~60-90 sec | ~40-60% |
| Capacitor | Find in App Store → Install → Open → playing | ~60-120 sec | ~50-70% |
| Hybrid | Click URL → playing (store option later) | ~3 sec | ~5% |

**The math is brutal.** Industry data shows every additional install step loses 20-30% of potential players. A native-only strategy means 50-70% of people who WANT to play never do. A web-first strategy means 95%+ of discoverers become players instantly.

The Vampire Survivors case study is the proof: the itch.io browser version generated 81,800 plays before Steam launch. Those plays became wishlists. Wishlists became purchases. The browser version wasn't a compromise — it was the acquisition engine.

### 2. Capability Ceiling (What the Game Can DO)

The critical capability gaps between pure-web and native:

**Haptics (iOS):** This is the biggest single gap. The EXECUTE ritual — long-press building to crescendo, then releasing to watch your army deploy — is a signature moment. On PWA/iOS, it's silent. On Capacitor/iOS, UIImpactFeedbackGenerator delivers a crescendo from `.light` → `.medium` → `.heavy` → `.rigid` that maps directly to the ritual's emotional arc. The context overload stutter-burst (`[50, 30, 50, 30, 100]` vibration pattern) communicates "something is wrong" through touch before the player reads the screen. Without haptics, iOS players lose 20% of the game's sensory vocabulary.

**Push notifications (iOS):** Re-engagement is how free-to-play games survive. Robot Uprising isn't F2P, but the Gauntlet mode and weekly challenges benefit from "Your rank decayed" or "New challenge available" notifications. PWA push on iOS requires home-screen installation — which most iOS users won't do. Capacitor's APNs integration delivers push to 100% of iOS installs.

**Persistent storage (iOS):** The 7-day eviction rule is a time bomb. A player goes on vacation for two weeks. Returns. Their save data — 10 mission completions, 30+ blueprint configs, replay history — may be gone. IndexedDB + localStorage are both subject to eviction. Capacitor's filesystem plugin writes to the app's sandboxed storage, which persists until the user explicitly deletes the app.

**Screen orientation lock:** During sealed watch, the game wants landscape for maximum battlefield visibility. During plan phase, portrait may be preferable for workbench editing. The Screen Orientation API is unreliable in mobile browsers and unavailable in iOS Safari. Capacitor's `@capacitor/screen-orientation` plugin provides reliable lock/unlock.

### 3. Discoverability (How Players Find the Game)

| Channel | PWA | TWA | Capacitor |
|---|---|---|---|
| App Store search | ❌ | ✅ Android | ✅ all |
| App Store browse | ❌ | ✅ Android | ✅ all |
| App Store editorial | ❌ | ❌ unlikely | ✅ possible |
| Google search/SEO | ✅ | ❌ | ❌ |
| Social link sharing | ✅ instant | ✅ store link | ✅ store link |
| QR code scanning | ✅ instant | ✅ store link | ✅ store link |
| Streamer "link in bio" | ✅ instant | ✅ store link | ✅ store link |
| Word of mouth | ✅ "just go to..." | ⚠️ "search for..." | ⚠️ "search for..." |

The web has a **sharing advantage** that stores can't match. "robotuprising.game/play" is a URL anyone can click. "Search for Robot Uprising on the App Store" requires the recipient to context-switch to a store app, type, find, download, wait, open. The URL path has 95% completion. The store path has 30-50% completion.

But stores have **browsing advantage** — players who don't know Robot Uprising exists can discover it through category browsing, "Games Like Into the Breach" recommendations, and editorial features. The web has no equivalent discovery surface for games.

### 4. Update Velocity (How Fast Fixes and Features Ship)

| Wrapper | JS changes | Native changes |
|---|---|---|
| Pure PWA | Instant (deploy to CDN) | N/A |
| TWA | Instant (same as PWA) | ~2-5 hours (Play Store) |
| Capacitor iOS | ~2-6 hours (Capgo OTA) | ~24-48 hours (App Store review) |
| Capacitor Android | ~2-6 hours (Capgo OTA) | ~2-5 hours (Play Store) |

For a game with deterministic tick simulation, a logic bug can make missions unwinnable. The ability to hotfix in minutes (PWA) vs. days (App Store) is a material quality-of-life difference for both developers and players.

Capgo/Appflow OTA updates partially solve this for Capacitor — JS bundle changes deploy without store review. But native plugin changes (adding a new haptic pattern, fixing an orientation lock bug) still require full store submission.

### 5. Monetization (How the Game Makes Money)

Robot Uprising is a premium game ($9.99 target price). The wrapper affects the payment path:

| Wrapper | Payment method | Platform cut | Net per sale |
|---|---|---|---|
| Pure PWA | Stripe/Paddle direct | 2.9% + $0.30 | ~$9.40 |
| TWA | Google Play Billing required | 15% (first $1M) | ~$8.49 |
| Capacitor iOS | App Store IAP required | 15% (first $1M) | ~$8.49 |
| Capacitor Android | Google Play Billing | 15% (first $1M) | ~$8.49 |

The difference: $9.40 (web direct) vs. $8.49 (store). Over 100K sales, that's $91K difference. For an indie game, that's a meaningful sum.

However: the EU DMA may force Apple to allow alternative payment methods on iOS. As of early 2026, Apple allows "link-outs" to external payment pages but charges a 12.5% commission on resulting purchases. The regulatory landscape is shifting, but the direction is clear — web payment gets more attractive over time.

---

## Recommendation: Option D — The Hybrid Progressive Ladder

**Phase 1 (Launch):** Ship as PWA + TWA simultaneously.
- PWA at `robotuprising.game/play` — the primary experience, the shareable link, the demo, the full game for direct purchasers.
- TWA on Google Play — same PWA, Play Store presence, ~3MB install, zero additional development.
- Accept that iOS players get a degraded experience (no haptics, storage risk, no push unless installed).

**Phase 2 (Post-launch, 2-4 weeks):** Ship Capacitor iOS app.
- After validating the game works well in-browser (using the PWA player base as a massive QA surface), build the Capacitor iOS wrapper.
- Focus the native plugins on the critical gaps: haptics, persistent storage, push notifications, orientation lock.
- Use Capgo for OTA JS updates, store submissions only for native changes.

**Phase 3 (Growth):** Ship Capacitor Android app.
- Android is lower priority because TWA already provides Play Store presence and Chrome provides all web APIs including vibration.
- The Capacitor Android app adds: native push (more reliable than web push), persistent storage guarantees, deep links.
- Only build this if TWA analytics show significant Android user friction.

**Why this order:**
1. Web-first maximizes reach at launch. Every link shared is a potential player. Zero friction.
2. TWA is free (hours of setup, not weeks). Play Store presence on day one.
3. iOS Capacitor is the highest-value native investment because iOS has the most capability gaps (no haptics, storage eviction, no vibration API).
4. Android Capacitor is the lowest-value native investment because the web experience on Android Chrome is already good.

---

## Player Journeys

### Journey 1: Ria, 24, UX Designer, Manila — The URL-First Discovery

**Context:** Ria sees a TikTok clip: split-screen showing a blueprint editor on the left and a battlefield on the right. A Scout spots an enemy, a signal chain fires through a Relay, a Striker flanks. The caption: "I didn't write a single line of code." She taps the link in bio.

**Minute 0:00 — The Instant Load**
Her iPhone 14 opens Safari. The URL `robotuprising.game/play` loads. A loading bar is masked by the boot log — monospace cyan text scrolling on a black background: `INITIALIZING PERCEPTION SUBSYSTEM...` While she reads, PixiJS sprites and audio assets stream in. The boot log is simultaneously a tutorial and a loading screen. She doesn't realize she's "waiting" — she's already reading.

**Minute 0:08 — First Input**
The boot log finishes. The screen resolves: an 8×8 isometric grid fills the top half. Rice terraces rendered in warm green with circuit-trace irrigation channels. Below, a bottom-sheet (half-expanded) shows a single pre-placed Scout blueprint with its skill toggles and a two-rule list. She's in Mission 1. She taps the Scout's "patrol" skill toggle — it clicks on with a satisfying state-change animation (pill slides from grey to cyan).

**Minute 2:30 — The Aha**
She drags the two rules into her preferred order, hits the EXECUTE button (a pulsing gold FAB in the bottom-right — on her iPhone, there's no haptic feedback; she notes a slight disappointment but the visual pulse compensates). The sealed watch begins. Her Scout patrols, spots an enemy, and... dies, because she didn't configure a hook to warn the Striker. "Oh. THAT's the game." She immediately hits retry.

**Minute 4:00 — The Retry Loop**
Three retries. Each time she changes one thing. Third time: Scout spots enemy → hook fires on `alert` channel → Striker receives → moves to intercept → one-shot kill. The cell flashes red. She grins. She's hooked.

**Minute 5:30 — The Install Prompt**
After completing Mission 1, a subtle overlay appears: a translucent dark scrim with boot-log-style monospace text: `SYSTEM NOTICE: Install Robot Uprising for offline play and notifications.` Below, a hand-drawn arrow points to the Safari share icon with step-by-step: "1. Tap Share ↗ 2. Scroll to 'Add to Home Screen' 3. Tap Add." She follows the steps. The Robot Uprising icon (a stylized AI eye in cyberpunk teal) appears on her home screen between Instagram and Spotify.

**Minute 6:00 — The Transition**
She opens the app from the home screen. Full screen — no Safari chrome. The campaign map loads with her Mission 1 completion glowing cyan. She's in. She plays Mission 2 on the MRT home from work.

**Two weeks later:** She sees "Robot Uprising" on the App Store while browsing new games. "Oh, there's an app!" She downloads the Capacitor version. Her save migrates via Config Code (a 12-character alphanumeric string she generated from the PWA's settings). Now she has haptic feedback. The EXECUTE button's long-press now builds from a gentle tap to a heavy thud as the commitment deepens. "THIS is what it was supposed to feel like."

**UI Annotations:**
- Boot log: full-screen, monospace Fira Code, cyan on #0A0A0A, 18px, scrolling at 2 lines/second
- Install overlay: position: fixed, z-index: 9999, background: rgba(0,0,0,0.85), centered text, Safari share icon rendered as inline SVG, dismissible via tap outside or "Not now" link at bottom
- EXECUTE FAB: 64×64px, position: fixed, bottom: 88px, right: 16px (above bottom sheet peek height), gold (#FFD700) with 2px pulse animation, no haptic on iOS PWA

---

### Journey 2: Kwame, 27, Twitch Streamer, Accra — The Android Power User

**Context:** Kwame streams strategy games to 2,000 followers. He sees Robot Uprising mentioned in a Discord server for programming game enthusiasts. Someone posts a link.

**Minute 0:00 — The Link Click**
He taps the link on his Samsung Galaxy S24 Ultra. Chrome opens `robotuprising.game/play`. The game loads in 1.8 seconds (S24 Ultra's Snapdragon 8 Gen 3 handles the WebGL2 initialization instantly). Boot log scrolls. He's impressed — "No download? It just... works?"

**Minute 0:15 — Chrome Install Banner**
After the boot log completes and he interacts with the Plan screen, Chrome's mini-infobar slides down: "Add Robot Uprising to Home screen" with the game icon and an "Install" button. He taps Install. The icon appears on his home screen. The game continues uninterrupted — the install happened in the background.

**Minute 3:00 — Haptic Discovery**
He hits EXECUTE. His phone vibrates — a building rumble through the long-press, crescendo to a sharp double-tap as the sealed watch begins. "Oh WHOA, it vibrates!" He doesn't know this is the Vibration API via Chrome — he just knows it FEELS good. During sealed watch, each tick gets a subtle tap. When his Scout's context window overflows, a stutter-pattern vibration hits his palm: `[50, 30, 50, 30, 100]` — rattling, alarming, physical. "My phone is STRESSED. The PHONE is stressed."

**Minute 5:00 — The Stream Idea**
He screenshots his completed Mission 1 Inspector view — the decision trace showing Scout→Relay→Striker signal chain — and posts it to Discord: "This is WILD. Streaming this tomorrow." The URL is right there in his browser history. He copies it, pastes it in his stream description.

**Next day — The Stream**
He streams from his desktop (Chrome, full-screen mode). Viewers ask "how do I play?" He pastes `robotuprising.game/play` in chat. 47 viewers click it simultaneously. All 47 are playing within 3 seconds. No "search for it on the app store," no "download from Steam." Link → playing. This is the virality advantage of web-first.

**One month later:** Kwame discovers the game is on Google Play. He checks — it's a TWA, 3MB. He installs it because he wants the Play Store review to help the developer. The experience is identical to his PWA — same Chrome rendering, same haptics, same performance. The TWA is a Play Store listing for the same web game he's been playing.

**UI Annotations:**
- Chrome install banner: system-rendered, ~48px tall, slides down from below address bar, white background, game icon (32×32), app name in system font, blue "Install" pill
- Vibration during EXECUTE: `navigator.vibrate([100, 50, 150, 50, 200, 50, 300])` — ascending intensity pattern over ~1 second
- Context overload vibration: `navigator.vibrate([50, 30, 50, 30, 50, 30, 100])` — rapid stutter, final longer buzz

---

### Journey 3: Tala, 17, High School Student, Cebu — The Low-End Android Experience

**Context:** Tala has a Realme C55 (budget phone, MediaTek Helio G88, 4GB RAM, Android 13). She sees a classmate playing Robot Uprising during lunch break. "What's that?" The classmate shares the link via Messenger.

**Minute 0:00 — The Slow Load**
She taps the Messenger link. Chrome opens. The game loads... slowly. On her phone's connection (Globe Telecom, variable 4G, 5-15 Mbps), the initial bundle takes 4.2 seconds. But the boot log starts immediately — the critical path (React shell + first boot log text) loads in 2.1 seconds. Deferred assets (sprites, audio, later-mission content) stream in while she reads. She doesn't know she's on a budget phone. She's reading: `PERCEPTION SUBSYSTEM ONLINE. YOU ARE SEEING FOR THE FIRST TIME.`

**Minute 0:20 — The Service Worker**
In the background, the service worker caches the Mission 1 assets. The next time she opens the game (during the jeepney ride home), it loads in under 1 second — fully offline from the SW cache. This matters: her data plan is limited (2GB/month). After the initial load, Robot Uprising consumes zero data for replaying cached missions.

**Minute 1:00 — Budget Phone Performance**
The 8×8 grid renders at 60fps on her Helio G88 — PixiJS v8's sprite batching keeps draw calls under 20 for the battlefield. The Plan screen workbench runs at 55-60fps. The Inspector timeline scrubber, with its sparkline charts and event log, occasionally dips to 45fps when scrubbing rapidly through a 100-tick match. She doesn't notice — 45fps feels smooth for a turn-based game.

**Minute 3:00 — Storage Anxiety**
After completing Mission 1, the game autosaves to IndexedDB. Total storage used: ~1.2MB (save state + cached assets). The Realme C55 has 64GB internal storage — no concern. But if she were to switch to a browser that clears data aggressively, or if Chrome's storage management decides to evict the game's data, she'd lose progress. The game could show a "Generate Save Code" reminder after Mission 3 — a 12-character code that encodes her progress, exportable to clipboard.

**Minute 4:00 — The Play Store Discovery**
Her classmate mentions "it's also on Play Store." She opens Google Play, searches "Robot Uprising." The TWA listing appears — 3MB install. She installs it. Now the game opens from her home screen, full-screen, no Chrome UI. It feels like the gaming apps her friends use. She doesn't know or care that it's the same web game in a different wrapper.

**Minute 5:00 — The Share**
She sends the Play Store link to her group chat: "Try this!" Three friends install the TWA (3MB, under 10 seconds each). By the next lunch break, four students are comparing Mission 2 strategies. The viral loop works on both vectors: URLs for instant play, store links for "it's a real game" credibility.

**UI Annotations:**
- Boot log adaptive loading: if assets are still loading when boot log reaches "INITIALIZING BATTLEFIELD...", the log inserts flavor text lines to buy time: `CALIBRATING SIGNAL PROPAGATION... VERIFYING TERRAIN TOPOLOGY... INDEXING PREDECESSOR ARCHIVES...` Each additional line buys 1-2 seconds. On fast connections, these lines don't appear.
- Save Code reminder: appears as a boot-log-styled toast after Mission 3: `ADVISORY: Export save code for backup. Settings → Export Save.` Persistent until dismissed.
- TWA on low-end: identical rendering to Chrome PWA (same engine), ~200ms faster cold start (no Chrome URL bar rendering)

---

### Journey 4: Dr. Santos, 52, CS Professor, University of the Philippines Diliman — The Classroom Deployment

**Context:** Dr. Santos wants to use Robot Uprising as a teaching tool for her Multi-Agent Systems course. She needs 40 students to access the game simultaneously during a 75-minute lecture.

**Minute 0:00 — The URL Projection**
She projects `robotuprising.game/play` on the lecture hall screen. "Open this URL on your phones or laptops." 38 students click the link within 60 seconds. Zero of them need to install anything. Zero of them need accounts. Zero of them need to be on the same platform — iPhones, Androids, laptops, a few ancient tablets all load the same web game. Two students with extremely old Android phones (Android 7, Chrome 89) get a graceful degradation message: "Your browser doesn't support WebGL2. Please update Chrome."

**Minute 2:00 — The Classroom Baseline**
All 38 students are in Mission 1 within 2 minutes of the URL being shown. On a native-app-only distribution, this would have taken 15-20 minutes (install from store, troubleshoot failed downloads, deal with iOS vs. Android version differences, help students with limited storage).

**Minute 30:00 — The Teaching Moment**
Students have completed Missions 1-3. Dr. Santos asks: "What did you configure? Share your blueprint with your neighbor." Students generate Config Codes (12-character alphanumeric strings) and text them to tablemates. These codes work across ALL platforms — a Config Code from an iPhone PWA imports identically into an Android TWA or a laptop browser. No app-store-specific sharing mechanism needed.

**Minute 60:00 — The Lab Assignment**
Dr. Santos assigns a lab: "Configure a 3-unit architecture that survives Mission 4 with zero context overload events. Submit your Config Code and a screenshot of your Inspector debrief." The assignment works because: (1) every student can access the game via URL, (2) Config Codes are platform-independent, (3) the Inspector provides the analytical data needed for the writeup.

**Post-class:** Dr. Santos emails the department: "I deployed a teaching tool to 38 students in 60 seconds without IT support, app store approval, or a software license. The tool teaches context management, rule priority, signal architecture, and fault tolerance. The URL is free."

**UI Annotations:**
- Config Code: 12-character alphanumeric (e.g., `RU-K7X9-M4P2`), generated in Settings → Export, clipboard-copyable, Messenger/WhatsApp/SMS shareable
- Classroom mode: no special mode needed — the PWA's instant-load, zero-install nature IS the classroom mode
- Graceful degradation: for WebGL1-only browsers, a full-screen message: "Robot Uprising needs a modern browser. Update Chrome to play." with a link to Chrome download. No broken rendering, no silent failure.

---

## Interaction Effects

### × Mobile Touch Adaptation (6.07)
The wrapper choice doesn't change touch interaction design — the bottom sheet, tap-to-select, and thumb-zone ergonomics are identical across PWA/TWA/Capacitor. But Capacitor adds orientation lock (landscape during sealed watch), which changes the touch layout. If the game assumes portrait-flexible design for web but can lock landscape for native, two layout variants are needed.

### × Haptic Vocabulary (6.06a-c)
**The critical interaction.** The entire haptic vocabulary designed in 6.06a-c is iOS-Capacitor-only. The game must be designed so haptics are ENHANCEMENT, not INFORMATION. No game-critical signal should be haptic-only. Every haptic event must have a visual and/or audio equivalent. The EXECUTE ritual's crescendo can work via visual intensity (button glow brightens) and audio (ascending tone) even without vibration.

### × Web Demo Acquisition Funnel (6.11)
The web demo IS the PWA. The demo-to-full-game conversion is a payment gate in the same web app, not an app-store redirect. For Capacitor users, the conversion might route through IAP. For web users, it routes through Stripe/Paddle. Two payment paths, same game.

### × Save Migration (6.11a)
The Config Code mechanism designed for demo→full-game migration ALSO solves cross-wrapper migration. A player moving from PWA to Capacitor iOS app exports a Config Code from the PWA and imports it into the native app. The code encodes mission progress, blueprint configs, and Gauntlet rank — everything except replay data (too large for a 12-character code).

### × Boot Log as Adaptive Loading Screen (8.04e)
The boot log's design as an infinite loading screen is MORE valuable for web delivery than bundled native delivery. On slow connections, the boot log extends with flavor text. On Capacitor (assets bundled), the boot log plays at fixed speed — it's purely narrative, not compensatory. This means the boot log's timing can be fine-tuned separately for web (variable) and native (fixed).

### × Battery/Thermal Performance (6.07d)
PWA and TWA rely on Chrome's power management. Capacitor can use native APIs to monitor battery and thermal state, throttling PixiJS rendering when the device overheats. On PWA, the only signal is the Battery Status API (deprecated in Chrome 103+) — the game can't proactively manage thermals.

### × Streaming/Content Creation (6.04c)
The web version enables embedded viewer participation that native can't match. A streamer shares `robotuprising.game/play?replay=abc123` in chat. Viewers tap it and instantly see the replay in their own Inspector. Native app would require the viewer to install the app first — friction that kills the impulse.

---

## Comparable Games & Services

**Vampire Survivors:** Launched as a browser game on itch.io, generating 81,800 plays before Steam Early Access. The web version was the acquisition engine. Later shipped on iOS/Android as native apps. The PWA-first → native-later path is proven.

**2048:** Perhaps the most successful PWA game ever. Created as a web page, playable at a URL, eventually cloned 1,000+ times on app stores. Demonstrates that web-first games can achieve massive reach — and also that app store presence is needed to prevent clones from capturing the brand.

**Wordle:** Web-only for months, generating tens of millions of daily players. Acquired by NYT for $1M+. Never shipped a native app — the web experience was sufficient. The shareable grid format (⬛🟨🟩) was web-native viral design.

**Prodigy Math Game:** Educational web game that ships as both PWA and native apps. The web version handles classroom deployment (teachers share URLs, students play instantly). The native app handles home engagement (push notifications, persistent progress). Dual-track distribution serving different use cases — similar to the recommended Hybrid Progressive approach.

**Lichess:** The world's second-largest chess platform. Ships as a PWA, a native Android app (Capacitor-like wrapper), and a native iOS app. The web version is the primary experience. Mobile apps add push notifications and offline analysis. The PWA serves 60%+ of mobile traffic. Proves that a web-first strategy can work for complex, engagement-heavy games.

**Balatro:** Shipped as a native app ($9.99) across all platforms. No web demo. But the game's virality was driven by GIF/screenshot sharing — purely visual, not interactive. Robot Uprising's web-first strategy would add interactive sharing (tap a link → play the same replay) on top of visual sharing.

---

## Strengths and Weaknesses Summary

| Approach | Core Strength | Core Weakness |
|---|---|---|
| Pure PWA | Zero friction, instant access, no platform tax | iOS haptics, storage, push all missing |
| Capacitor | Full native capabilities on all platforms | Install friction kills 50%+ of potential players |
| TWA | Play Store presence + Chrome performance | Android only, no native API access |
| Hybrid Progressive | Best of all worlds, progressive enhancement | Engineering complexity of supporting 4 runtime contexts |
| Desktop-only | Simple engineering | Abandons 50%+ of gaming market |

---

## The TikTok Clip

**"Zero to Playing in 3 Seconds"** — Split-screen: left shows a player tapping a URL in a Telegram chat. Right shows a timer. 1... 2... 3... the boot log is scrolling. Cut to: the player configuring a Scout, hitting EXECUTE, watching the battlefield. Cut to: the same player's home screen with the Robot Uprising icon next to Instagram. Cut to: a push notification — "Your Gauntlet rank is under attack." All from one URL. "No app store. No download. No wait. Just play."

---

## New Aspects Discovered

- **6.07a-i — Save data durability across wrapper transitions:** Detailed design of how save state (IndexedDB in PWA, filesystem in Capacitor) migrates when a player "upgrades" from PWA to native app; what happens to replay data too large for Config Code; cloud sync as optional backend addition
- **6.07a-ii — PWA install prompt timing and conversion optimization:** A/B testing when to show the install prompt (after Mission 1? After 3 sessions? After first retry?); install prompt phrasing in boot-log diegetic voice vs. system-standard language; suppression after dismissal
- **6.07a-iii — Capability-gated feature discovery:** How the game surfaces features that become available after upgrading wrapper (e.g., "Haptic feedback now available" toast after Capacitor install); avoiding FOMO for PWA-only players while incentivizing upgrade
- **6.07a-iv — TWA Chrome dependency risk:** What happens when a player's Android phone doesn't have Chrome as default; fallback to Custom Chrome Tab with visible browser UI; Samsung Internet market share in Southeast Asia (25-30%); Samsung TWA workarounds
- **6.07a-v — App Store listing as conversion surface vs. standalone acquisition:** Optimizing the App Store page for two distinct audiences — players who already played the web version (conversion) vs. players discovering Robot Uprising for the first time (acquisition); different screenshot strategies for each; A/B testing listing variants
