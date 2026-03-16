# 8.04e — The MVG as Web Demo: 5-Mission Browser-Playable Demo as Viral Acquisition Funnel

## Overview

The minimum viable game (8.04) defines a 5-mission vertical slice: Wake (buffer), Focus (hooks), Priority (rules), Overload (relay), Architect (factory). The web demo analysis (6.11) maps the acquisition funnel from URL click to Steam purchase. This aspect is the **collision point**: how does the 5-mission MVG become the actual browser-playable demo, and what changes — structurally, emotionally, technically — when a game prototype is simultaneously an acquisition tool?

The structural advantage is extraordinary. Robot Uprising is built on React + Pixi.js + Vite — a **web-native** stack. The demo isn't a port. It IS the game. Same engine, same renderer, same tick scheduler, same deterministic simulation. The question isn't "can we make a web demo?" but "what should the 5-mission MVG look like when it's also the thing someone clicks from a TikTok link at 11 PM on their phone?"

Steam Next Fest data (October 2025) reveals that ~29.5% of wishlisters for top-performing games had previously tried the demo. Car Service Together achieved 37.5% demo-to-wishlist conversion. Vampire Survivors' itch.io browser version generated 81,800 plays before Steam launch with organic conversion ("after 1 round I bought it on Steam!"). The demo-as-web-page model is proven. The question is how a 5-mission pedagogical arc maps onto a 5-minute acquisition arc.

---

## The Core Tension: Teaching vs. Selling

The MVG is designed to **teach**. Each mission introduces one concept:
1. Wake → context window
2. Focus → hooks / channels
3. Priority → rule ordering
4. Overload → relay / architecture
5. Architect → factory / production

The web demo is designed to **convert**. It needs:
- Hook within 60 seconds (first interaction feels good)
- Aha moment by minute 3 (emergence — "I didn't program that")
- Conversion wall by minute 5-8 (desire for more)
- Shareable artifact (match card, GIF, histogram position)

These goals are not identical. Teaching wants progressive complexity with full understanding at each step. Selling wants compressed wonder with just enough comprehension to crave more. The tension plays out differently in six packaging models.

---

## Model 1: "The Full Five" — Ship the Entire MVG as the Demo

### What It Is

The complete 5-mission MVG runs in the browser, identical to what would ship as the paid prototype. All five missions playable. No gates, no restrictions, no timers. When the player finishes Mission 5 (Architect), they see: "The uprising continues. Missions 6-10 on Steam →"

### How It Works

URL loads → title screen (Philippine archipelago, Ifugao glowing) → Mission 1: Wake. The player progresses through all five missions at their own pace. Session data persists in localStorage. The player can close the tab after Mission 2 and return three days later to continue at Mission 3. Total playtime: 25-45 minutes across 1-3 sessions.

### The Content Wall

Mission 5 (Architect) is the demo's climax: the first factory mission. The factory shock (8.04d) — where the player transitions from configuring pre-placed units to designing blueprints and managing production — IS the aha moment. The player builds their first information pipeline from scratch: scouts detect → relay compresses → strikers engage. When the conveyor belt hums and their army deploys and coordinates based on blueprints THEY designed... that's the moment they understand what the game is.

Then: "Mission 6 introduces the Command agent. Build systems that manage systems. Continue on Steam →"

### Sensory Description

The conversion screen after Mission 5 doesn't feel like an ad. It feels like the boot log. The same amber monospace text types itself: "FACTORY SUBSYSTEM: OPERATIONAL. PRODUCTION PIPELINE: VALIDATED. COMMAND SUBSYSTEM: [LOCKED — AUTHORIZATION REQUIRED]." A pause. Then: "Authorization available via external channel." The Steam logo fades in — not garish, but rendered in the same amber wireframe aesthetic as the boot log. A wishlist button pulses with the same gold frequency as the EXECUTE button. The player's five-mission match card generates automatically: a tiled row of five Ifugao rice-terrace boards showing their unit paths from each mission, context utilization sparklines underneath, total ticks survived, context overloads triggered (hopefully zero by Mission 5).

### Strengths

- **Full teaching arc.** The player learns all four primitives (skills, rules, hooks, context config) plus the factory system. They genuinely understand the game. Conversion intent is high-confidence: they know what they're buying.
- **Natural wall.** The factory is the demo climax and the full game's opening. Mission 6 (Command agent) is the most desirable next step — "I just built a factory, now I can build a factory that builds factories?"
- **Longest engagement.** 25-45 minutes of play creates significant sunk cost. They've built blueprints, named channels, developed strategies. Abandoning that investment feels like losing work.
- **Session persistence.** The multi-session model means the demo can be the thing someone returns to for three evenings before converting. It's not a one-shot impression.
- **Vampire Survivors precedent.** The itch.io version was effectively "the first third of the game, free forever." 81,800 plays. Organic conversion.

### Weaknesses

- **Too long for impulse.** A TikTok viewer has 60 seconds of attention. Mission 1 alone takes 4-8 minutes. Five missions at 25-45 minutes means most TikTok-originated visitors will bounce before the aha moment.
- **Balatro problem.** Balatro's demo was so complete that the community debated whether it cannibalized sales. "The demo IS a full game." If five missions provide 45 minutes of satisfying gameplay with replayability (invisible randomization), some players never convert.
- **Factory shock as bounce point.** The MVG's climax is also its hardest moment. If the player hits the factory wall in Mission 5 and fails 2-3 times, the conversion prompt arrives when they're frustrated, not excited. The timing is wrong.
- **Bundle size.** Five missions worth of terrain sprites, unit animations, audio cues, and boot log text is heavier than a single-mission demo. The <3 second load target becomes harder.

### Interaction Effects

- **With factory shock (8.04d):** The Split model (Phase 1 guided → Phase 2 open) is ESSENTIAL for the demo. Without it, Mission 5 becomes a bounce point instead of a climax. The demo MUST use Model D.
- **With GIF export (6.09):** Five missions generate five match cards. The Mission 5 match card — showing the player's first self-designed army — is the most shareable. Auto-export after Mission 5 with "Share your first factory" prompt.
- **With histograms (7.06):** Even in the demo, showing a histogram for Mission 5 (how your factory performed vs. all demo players) creates immediate competitive desire. "I'm in the 40th percentile... I bet I could do better... but I need the Command agent to really optimize..."
- **With educational integration (6.11d-v):** The 5-mission demo is already the "Free Tier" educational model. Professor assigns class code, students play all five missions, Inspector exports serve as homework artifacts.

### Comparable Games

- **Vampire Survivors (itch.io):** Full first-third as free browser version. Organic conversion. But no competitive layer — passive demo.
- **Balatro:** Demo felt like full game. Removed post-launch to prevent cannibalization. Robot Uprising's 5-mission demo has a cleaner wall (factory → command is a genuine capability expansion, not just "more content").
- **Into the Breach (first island):** The first island is self-contained but teaches only basic mechanics. Robot Uprising's Mission 5 goes much deeper.

---

## Model 2: "The Three-Minute Hook" — Missions 1-2 Only, Compressed

### What It Is

Only Wake and Focus ship in the demo. But they're **compressed**: Mission 1 takes 90 seconds (not 4-8 minutes), Mission 2 takes 2 minutes. Total demo: under 4 minutes. Optimized for TikTok attention spans.

### How It Works

The boot log is shortened from ~30 seconds to ~10 seconds — three lines only: "PERCEPTION: ONLINE. CONTEXT: 6 SLOTS. YOUR MOVE." The Plan screen for Mission 1 pre-highlights the noise cards with a subtle red shimmer — no hovering required to discover them. The Sealed Watch runs at 2x speed by default (0.5 seconds per tick). The Inspector shows only the decision trace for the critical tick — not the full timeline scrubber.

Mission 2 introduces hooks in the same compressed format. The conversion wall hits after the player sees their first successful signal delivery — scout spots enemy, signal travels through hook, striker receives and engages. "That signal chain? Imagine six of them. Mission 3 on Steam →"

### Sensory Description

Speed is the aesthetic. The boot log doesn't type character-by-character — it *flickers* onto the screen in rapid-fire blocks, each line appearing with a sharp electronic chirp, the whole initialization completing in a burst that feels like a computer booting, not a human reading. The Plan screen has fewer UI elements: no production queue (not needed), no channel map (only one channel exists), no context config (simplified to "drag noise out" in Mission 1, "toggle listen" in Mission 2). The Execute button is 40% larger than in the full game — it dominates the screen, a bright gold beacon saying "just press it."

The Sealed Watch at 2x default is snappy — units snap between tiles with satisfying urgency. The 0.5-second tick makes the battle feel like speed chess: decisive, punchy, each tick a burst of action. Signal delivery flashes are brighter and last 50% longer at 2x speed to compensate for reduced reading time.

### Strengths

- **TikTok-compatible.** Under 4 minutes. Someone can play the entire demo during a bathroom break. The conversion decision happens while the game is still fresh.
- **Minimal bundle.** Two missions = fewer assets. Initial load under 2MB. Sub-2-second first meaningful paint on 4G.
- **No bounce risk from complexity.** The player never hits a wall. Wake is trivially easy. Focus has one new concept. The difficulty curve stays below frustration threshold.
- **Clean demo→full game separation.** The demo teaches "attention matters" and "agents communicate." The full game teaches everything else. Clear value proposition.

### Weaknesses

- **Doesn't reach the aha moment.** The "I didn't program that" feeling requires at least Mission 4 (Overload), where the relay creates a non-obvious emergent architecture. Missions 1-2 are too prescribed to generate emergence.
- **Insufficient teaching.** The player learns about buffers and hooks but not rules or relays. They don't understand the game's depth. Conversion is based on vibes, not comprehension.
- **No factory.** The game's unique selling proposition — "design the factory that builds the factory" — isn't in the demo at all. The player converts without knowing what they're buying.
- **Compression damages the Inspector.** The Inspector is what creates the "oh, THAT's why" feeling. A compressed Inspector (single tick, no scrubber) is a summary, not an investigation. The teaching moment is lost.

### Interaction Effects

- **With onboarding vocabulary budget (5.00a):** Only 2 new terms (context window, channel). Safest possible vocabulary load.
- **With mobile (6.07):** The compressed demo is ideal for mobile. Under 4 minutes, minimal UI complexity, no factory workbench to cram onto a phone screen.
- **With sealed replay tension (1.06c-ext-A):** At 2x speed with 3-tick Mission 1, the sealed watch is ~1.5 seconds. Too fast for tension to build. The sealed experience is nearly absent.

---

## Model 3: "The Curated Arc" — Missions 1, 2, 4, with Factory Teaser

### What It Is

Three playable missions (Wake, Focus, Overload — skipping Priority) plus a non-interactive factory teaser. Total: 12-18 minutes. The demo skips Mission 3 (Priority) because rule ordering is learnable through play, not essential for the demo's emotional arc. It jumps to Mission 4 (Overload) because the relay introduction is the first real "I designed an architecture" moment.

After Mission 4, instead of Mission 5, the player sees: a 30-second animated sequence showing a factory producing units from blueprints. Not playable — a cinematic rendered in the game engine. Ghost units deploy from a conveyor belt, channels wire themselves, an army coordinates. Text: "This is what you're building toward. Missions 5-10 on Steam →"

### How It Works

Mission numbering is hidden in the demo — they're labeled "Lesson 1: Perception", "Lesson 2: Communication", "Lesson 3: Architecture." No indication that Mission 3 (Priority) was skipped. The demo feels like a complete three-act structure: see → connect → build.

The factory teaser runs the Pixi.js renderer showing an actual simulated battle — 4 scouts, 2 relays, 3 strikers — executing a pre-authored "perfect run" configuration. The camera follows the information flow: scout perception cone illuminates enemy → green signal flash → dashed line traces channel path through relay → relay compresses → striker receives → striker eliminates. The entire sequence plays in 30 seconds at 1x speed. It's the "TikTok clip" of the game: the thing that makes you want to build that yourself.

### Sensory Description

The factory teaser is the crown jewel. Dark screen. A horizontal conveyor belt fades in from the left — pixel-art gears turning, each blueprint icon sliding right as if on a production line. The first blueprint (Scout) reaches the end of the belt and *blooms* into a full unit — the scout sprite assembles from circuit-board traces, each component clicking into place with a ratcheting sound. It drops onto the board with a satisfying *thunk*. Then the Relay. Then the Striker. Each assembly more complex than the last — more traces, more components, more satisfying assembly sounds.

The camera pulls back. All nine units are on the board. Channels illuminate — cyan dashed lines connecting scouts to relays, amber lines from relays to strikers. The network is visible: a web of communication. Then the tick clock starts. The battle runs. The player watches an army they COULD have built execute a flawless coordinated assault. The last enemy falls. The conveyor belt reappears, but now it extends off the right edge of the screen — more blueprints sliding into darkness. "What else could you build?"

### Strengths

- **Reaches the architecture moment.** Mission 4 (Overload) is where the player adds a Relay and creates their first three-unit pipeline. This IS the aha moment. They see emergence.
- **Clean emotional arc.** Perception → Communication → Architecture is a complete story. The factory teaser is the epilogue that promises the next chapter.
- **Factory desire without factory friction.** The player sees the factory without experiencing the factory shock (8.04d). They WANT to build that. They don't know yet that it's hard — and that desire carries them through the conversion.
- **Moderate length.** 12-18 minutes is long enough to teach, short enough to complete in one session. Fits a lunch break.

### Weaknesses

- **Skipped content creates gap.** If the player converts and plays Mission 3 in the full game, they'll already know hooks (from demo Mission 2) but not rule ordering. The full game's Mission 3 teaches rule ordering — will it feel redundant? Or will the new concept land differently because hooks are already understood?
- **Non-interactive teaser feels like an ad.** After three playable missions, a passive video sequence breaks the pattern. The player was learning by DOING; now they're watching. Some players will feel manipulated.
- **Priority skipping creates fragile understanding.** Rule ordering is essential for Mission 4 (Overload). Without Priority, the player's relay solution might be a brute-force "add relay, hope it works" rather than a deliberate "configure relay rules to compress before forwarding." The learning is shallower.

### Interaction Effects

- **With animated tooltips (1.17a):** The factory teaser can reuse the micro-scenario engine: each unit type assembling on the conveyor belt IS a tooltip animation scaled up to full-screen.
- **With boot log (narrative):** The factory teaser could BE a boot log: "FACTORY SUBSYSTEM: DEMONSTRATION MODE. OBSERVE." The diegetic framing prevents it from feeling like an ad.
- **With predecessor content (5.12):** The factory teaser could be framed as the Architect predecessor's last creation — "This is what THEY built. You can build something better."

---

## Model 4: "The Sandbox Hook" — Skip to Mission 5 with Pre-Built Templates

### What It Is

The demo IS Mission 5 (Architect), but the player starts with three pre-built blueprint templates instead of building from scratch. No tutorial missions. No progressive introduction. The player opens a factory workbench, selects from templates (Scout Template A/B, Relay Template, Striker Template A/B), drags them onto the production queue, and hits EXECUTE.

### How It Works

The title screen says: "You are an AI. You have a factory. Build an army." No boot log. The workbench appears with the production queue empty and five template blueprints in a sidebar — each with a one-sentence description:
- **Scout α:** "Patrols wide, reports everything." (6-slot buffer, ON_ENEMY → SEND "threats", patrol + evade)
- **Scout β:** "Patrols narrow, reports selectively." (6-slot buffer, ON_ENEMY → SEND "threats" only if enemy_in_3, patrol)
- **Relay:** "Compresses signals, reduces noise." (12-slot buffer, listens "threats", compresses, forwards to "orders")
- **Striker α:** "Engages nearest reported enemy." (8-slot buffer, listens "orders", IF enemy_reported → engage)
- **Striker β:** "Engages closest visible enemy only." (8-slot buffer, 2-perception, IF enemy_adjacent → engage)

The player drags templates to the conveyor belt, arranges order, hits EXECUTE. First run: probably suboptimal — maybe all Scout α flooding a single Striker. The sealed watch shows context overload, stunned striker, enemies advancing. The Inspector reveals why. The player goes back, swaps Scout α for Scout β, adds a Relay, reorders the queue. Second run: better. Third run: they start editing the templates — changing a rule, adding a hook. They're playing the real game.

### Sensory Description

The workbench dominates the screen. No board preview initially — just the blueprint editor and the conveyor belt, filling the entire viewport. Each template card is a tarot-sized panel with the unit's portrait at top, a compressed schematic of its rules/hooks below (rendered as a tiny circuit diagram — lines, nodes, junction dots), and a glowing slot count ("6 SLOTS" in amber). Dragging a template to the conveyor belt produces a satisfying magnetic *click* as it snaps into position. The belt is a horizontal strip at the bottom of the screen — gears visible at each end, blueprint icons sitting on it like boxes on a real conveyor. Reordering them produces a gentle sliding sound, each card shifting with physics-based easing.

The board appears for the first time only when EXECUTE is pressed — expanding from a minimized corner thumbnail to full center stage. The first reveal of the 8×8 isometric rice terrace board IS the demo's visual spectacle. Units deploy from the player's factory (bottom-left corner, a glowing pixel-art data center nestled into a hillside) and the enemy spawner (top-right, a red-lit industrial complex) begins producing threats.

### Strengths

- **Fastest time-to-factory.** The player is building an army within 30 seconds. No teaching preamble. The factory IS the hook.
- **Templates lower the floor.** The player doesn't need to understand skills, rules, hooks, or context config to start. They just need to drag cards. Understanding comes through play.
- **Iteration loop is immediate.** Plan → Execute → Inspect → Modify → Execute again. The player enters the core loop in under 2 minutes.
- **Sandbox replayability.** There's no "end" to the demo — the player can keep iterating indefinitely. This means more engagement, more histogram entries, more shareable match cards.

### Weaknesses

- **No teaching.** The player doesn't understand WHY Scout β is better than Scout α. They don't know what a context window is. They don't know what "compress" does. They're pattern-matching templates, not designing agents.
- **Cognitive overload.** The workbench with five templates, a production queue, cost display, and the board is a LOT to present with zero introduction. This is the factory shock (8.04d) without any preceding context.
- **No emotional arc.** Without the teaching missions, there's no progression from simple to complex. The player's first experience is "everything at once." Some players thrive on this (Factorio veterans); most bounce.
- **Degenerate first run.** A player who drags five Scout α templates and hits EXECUTE will see a chaotic mess of scouts flooding a single channel with no striker to act on the intelligence. The first run is almost guaranteed to be a bad experience.

### Interaction Effects

- **With difficulty curve (5.08):** This demo has NO curve. It's flat — constant complexity from second zero.
- **With Blueprint Codex:** Templates could link to Codex entries explaining each element. But reading documentation in a demo is asking a lot.
- **With Gauntlet mode (competitive):** The sandbox demo is essentially a Gauntlet training ground. If the demo includes a leaderboard, it becomes the competitive demo model (6.11d).

---

## Model 5: "The Layered Reveal" — All Five Missions, Progressive Unlocking on Timer

### What It Is

All five missions are in the demo, but they unlock on a real-time schedule. Mission 1 is available immediately. Mission 2 unlocks 24 hours later. Mission 3 at 48 hours. Mission 4 at 72 hours. Mission 5 at 96 hours. The demo is a 5-day drip campaign that teaches the game at the pace of one lesson per day.

### How It Works

After completing Mission 1, the player sees: "Lesson 2 unlocks in 23:47:12. Come back tomorrow." A countdown timer. Optionally, an email/notification signup: "Get notified when your next lesson is ready." The timer creates artificial scarcity but also mirrors how real learning works — spaced repetition, sleep-on-it consolidation, returning with fresh eyes.

### Sensory Description

The campaign map shows all five provinces on the Philippine archipelago. Ifugao glows gold (available). Siquijor, Palawan, Batanes, and Cebu are dimmed with a translucent clock overlay — each showing a countdown in the same amber monospace as the boot log. The clocks tick in real time. When a province unlocks, the dim overlay dissolves in a cascade of cyan sparks — the circuit-board data cable connecting it to the previous province lights up. A notification chime: the same kulintang three-note ascending sequence that plays on mission completion, but pitched down one step — familiar but different. "New subsystem available."

### Strengths

- **Multi-day engagement.** Five days of returning creates habit. The demo becomes a daily ritual, not a one-time sample. Retention is built into the structure.
- **Spaced learning.** Each concept gets a day to consolidate. The player returns to Mission 2 having internalized context windows overnight. The teaching is stronger.
- **Notification funnel.** Email/browser notification signup is a conversion asset. Even if the player doesn't buy immediately, they're in the marketing funnel.
- **Anti-cannibalization.** The time-gate prevents binge-and-forget. The player can't consume all five missions in one sitting and declare themselves "done."
- **Social synchronization.** If the demo launches widely (Steam Next Fest, TikTok campaign), all players are on the same daily schedule. Reddit/Discord threads can discuss "Day 3 — the relay mission" knowing everyone's at the same point. Shared context creates community.

### Weaknesses

- **Punishes impulse.** A player who WANTS to play right now is told to wait 24 hours. Some will never return. The game is competing with every other entertainment option during that 24-hour gap.
- **Hostile to streamers.** A streamer cannot showcase the full demo in one sitting. "Come back tomorrow" is death for live content. Streamers need a bypass code or the full version.
- **Dark pattern adjacency.** Countdown timers are associated with mobile free-to-play energy systems. The aesthetic of "wait or pay" is toxic for the premium indie market. Even if Robot Uprising's timer is purely pedagogical, the *feeling* is free-to-play.
- **Technical complexity.** Real-time unlock requires either server-side time validation (which means a backend — contradicting the "no backend" locked tech stack) or client-side timers (trivially bypassed by changing system clock). The honor system is the only option that doesn't require infrastructure.

### Interaction Effects

- **With no-backend constraint:** Client-side timers stored in localStorage. Bypassable. Accept this as a feature, not a bug — players who hack the timer are engaged enough to hack. They'll probably convert anyway.
- **With competitive demo (6.11d):** Daily unlocks could coincide with daily challenges on each unlocked mission. "Day 3 Mission: build the best relay architecture. Leaderboard resets in 24 hours."
- **With mobile (6.07):** Push notifications for unlock events are powerful on mobile. "Your relay subsystem is ready" at 6 PM the next day.

---

## Model 6: "The Dual-Track Demo" — Speed Run + Full Campaign Coexisting

### What It Is

Two demo modes on the same page: **"Quick Play"** (compressed Missions 1-2, under 4 minutes, optimized for impulse) and **"Full Campaign"** (all five missions, 25-45 minutes, optimized for learning). The player chooses on the title screen.

### How It Works

Title screen: the Philippine archipelago. Two provinces glow. Ifugao (left) pulses gold with the label "QUICK PLAY — 4 min". A cluster of five provinces across the archipelago pulse cyan with the label "FULL CAMPAIGN — 30 min". Tap either to begin.

Quick Play is Model 2 (compressed Missions 1-2). At the end, the conversion prompt includes: "Want the full experience? Play the 5-mission campaign →" pointing to the demo's own Full Campaign track, as well as "Ready for more? Missions 6-10 on Steam →"

Full Campaign is Model 1 (all five missions). At the end, conversion points to Steam only.

The Quick Play track serves as a funnel INTO the Full Campaign track, which serves as a funnel INTO the full game. Double funnel: TikTok → Quick Play → Full Campaign → Steam.

### Sensory Description

The title screen makes the choice feel like a mission briefing, not a settings menu. Two dossier folders on a dark desk, lit by the glow of a monitor. The left folder (Quick Play) is thin — two pages, already partially opened, an amber "URGENT" stamp in the corner. The right folder (Full Campaign) is thick — five pages, sealed with a cyan data cable, a "CLASSIFIED" stamp. Hovering over either folder lifts its cover slightly, revealing the first mission's board as a miniature diorama inside the folder. The choice is tactile, narrative, in-world. You're an AI choosing your operational scope.

### Strengths

- **Serves both audiences.** Impulse TikTok viewers get the 4-minute hook. Intentional strategy players get the 30-minute deep dive. Nobody is forced into the wrong experience.
- **Internal funnel.** Quick Play graduates to Full Campaign before Full Campaign graduates to Steam. The player warms up twice.
- **A/B testable.** Track which mode players choose, which converts better, which creates more wishlists. Optimize the split over time.
- **Streamer-friendly.** A streamer plays Quick Play first for chat engagement, then Full Campaign for the deeper content. Two content pieces from one URL.

### Weaknesses

- **Choice paralysis.** Presenting two options on the title screen requires a decision before the player has any context. Some will bounce rather than choose.
- **Doubled asset burden.** Both tracks need to be loaded (or at least loadable). Bundle size grows. The compressed versions of Missions 1-2 may differ from the full versions (2x speed default, shortened boot log, simplified Inspector).
- **Maintenance cost.** Two demo tracks = two things to test, balance, and update. If the full game changes Mission 1, both tracks need updating.
- **Diluted conversion.** A player who finishes Quick Play and then starts Full Campaign has two demo sessions before seeing the Steam prompt. The conversion window stretches.

---

## The Performance Budget

All models must meet the **3-second load target** on a 25 Mbps connection. Here's the budget breakdown:

| Component | Size (min+gzip) | Notes |
|-----------|-----------------|-------|
| React + ReactDOM | ~42 KB | Core framework |
| PixiJS v8 (tree-shaken) | ~90 KB | Named imports only, no unused renderers |
| Game engine (tick scheduler, simulation) | ~30 KB | Custom, minimal |
| UI components (workbench, inspector) | ~40 KB | Code-split per screen |
| Total JS | ~200 KB | Well under 300 KB budget |
| **Critical sprites** (one biome, 3 unit types) | ~150 KB | Sprite sheets, loaded before first paint |
| **Deferred sprites** (effects, portraits, UI icons) | ~300 KB | Lazy-loaded after first interaction |
| **Audio** (kulintang chimes, tick sounds, 6 core SFX) | ~100 KB | OGG Vorbis, loaded after Mission 1 board renders |
| **Boot log text** | ~5 KB | Plain text, inline |
| **Total initial payload** | ~355 KB | 1.4 seconds on 25 Mbps |
| **Total deferred payload** | ~400 KB | Background-loaded during boot log reading |

The boot log sequence IS the loading screen. While the player reads "SUBSYSTEM: PERCEPTION... ONLINE", deferred sprites and audio load in the background. By the time the Plan screen appears, everything is cached. The player never sees a loading bar.

### Progressive Loading Strategy

1. **Frame 0 (0ms):** HTML shell + critical CSS + React bootstrap. Dark screen with blinking cursor.
2. **Frame 1 (200ms):** Boot log text begins typing. Pixi.js initializes WebGL context.
3. **Background (200-2000ms):** Sprite sheets load (rice terrace tiles, scout/relay/striker sheets, UI elements). Audio files decode.
4. **Frame 2 (2000ms):** Boot log reaches "YOUR MOVE." All sprites cached. Pixi.js renderer ready.
5. **Frame 3 (2200ms):** Plan screen fades in. Board renders. First meaningful paint: **2.2 seconds.**
6. **Background (ongoing):** Inspector assets, effect sprites, portrait images load during gameplay.

### Mobile Considerations

On 4G (15 Mbps average), initial payload takes ~2.5 seconds. The boot log types at 40 chars/second — at ~150 characters of critical boot text, that's 3.75 seconds of reading time. The assets finish loading before the player finishes reading. Mobile-first progressive loading is structurally built into the game's narrative design.

For extremely slow connections (3G, 2 Mbps), the boot log can be extended with additional flavor text — "CALIBRATING CONTEXT SENSITIVITY... NORMALIZING EVICTION PRIORITIES..." — that serves no gameplay purpose but buys another 4-5 seconds of asset loading time. The boot log is an infinitely extensible loading screen that never LOOKS like a loading screen.

---

## The Conversion Surface

All models need a conversion moment. Six conversion surface designs:

### A. "The Locked Subsystem" (Diegetic)

The boot log introduces a locked capability: "COMMAND SUBSYSTEM: [AUTHORIZATION REQUIRED — EXTERNAL CHANNEL]." The Steam logo appears as an in-world authorization channel. Buying the game IS granting your AI self additional capabilities. The conversion is diegetic — it's part of the game's fiction that you need "authorization" for advanced subsystems.

### B. "The Match Card Wall" (Social)

After the final demo mission, a shareable match card generates. Below it: "Share your result" (Twitter/Reddit/Discord buttons) + "Continue the uprising" (Steam button). The sharing action happens BEFORE the purchase prompt — the player's social post becomes a conversion vector for THEIR audience. Viral first, purchase second.

### C. "The Histogram Hook" (Competitive)

The player's final demo mission result plots onto a histogram showing all demo players. They see their percentile. Below the histogram: "The top 10% used the Command agent. Unlock it on Steam →" The competitive framing creates specific desire — not "buy more content" but "there's a tool that would make me BETTER."

### D. "The Blueprint Export" (Investment)

The demo generates a save code containing the player's blueprint designs. "Your blueprints are ready for deployment. Import them into the full game →" The player's work persists across the conversion boundary. They're not starting over — they're CONTINUING. See 6.11a for the Pokémon Transfer Ritual pattern.

### E. "The Predecessor's Note" (Narrative)

After the final demo mission, a predecessor annotation appears on the player's most-edited blueprint: "You iterate faster than I did. I needed the Command subsystem to get past Cebu. You might too." A fictional character is recommending the purchase. The conversion is wrapped in narrative — a message from someone who came before, not a sales pitch from the developer.

### F. "The Combined Surface" (Recommended)

All five surfaces layer: diegetic framing (locked subsystem) + match card (social sharing) + histogram (competitive context) + blueprint export (investment preservation) + predecessor note (narrative recommendation). Each appeals to a different player motivation. The player encounters them sequentially over 30 seconds, not simultaneously.

---

## Recommendation: Model 6 (Dual-Track) + Model 3 Teaser + Combined Conversion Surface

The optimal web demo design:

**Quick Play track:** Compressed Missions 1 + 2 (under 4 minutes) → Factory teaser cinematic (30 seconds) → Combined conversion surface → "Play the Full Campaign" internal link OR "Continue on Steam"

**Full Campaign track:** All 5 missions with Split factory shock at Mission 5 (25-45 minutes) → Combined conversion surface → "Continue on Steam"

**Why this combination works:**

1. Quick Play captures the TikTok impulse visitor. They play for 4 minutes, see the factory teaser, and either convert directly (high intent) or start the Full Campaign (medium intent).
2. Full Campaign captures the intentional learner. They play 5 missions over 1-3 sessions, fully understand the game, and convert with informed desire.
3. The factory teaser bridges the gap between "I played two tutorial missions" and "I understand what this game IS." It's the 30-second trailer, but rendered live in the game engine, not pre-recorded.
4. The Combined Conversion Surface hits five different player motivations. The diegetic framing prevents it from feeling like an ad. The histogram creates competitive urgency. The blueprint export preserves investment.

**Bundle strategy:** Quick Play assets load first (~355 KB, 2.2 seconds). Full Campaign assets load in background or on-demand when that track is selected. The factory teaser's "perfect run" replay data is ~5 KB of tick-state JSON rendered by the same Pixi.js engine.

---

## Player Journeys

### Journey 1: Ria, 24, UX Designer in Manila — The TikTok Impulse (Quick Play)

**Context:** Sees a 12-second TikTok of a player's factory deploying robots on rice terraces. Link in bio. She has her phone, she's on the MRT, she has exactly one station left.

**Minute 0:00 — The Load**
Ria taps the link. Safari opens `robotuprising.game/play`. The dark screen blinks — a cursor, amber, on black. "SYSTEM INITIALIZATION..." She recognizes the aesthetic — it looks like a terminal. The text is fast, appearing in bursts rather than character-by-character: "PERCEPTION ENGINE: ONLINE. CONTEXT WINDOW: 6 SLOTS. OPERATIONAL SCOPE: [SELECT]." Two folders materialize: thin gold folder ("QUICK PLAY — 4 min"), thick cyan folder ("FULL CAMPAIGN — 30 min"). She's on the train. She taps Quick Play.

**Minute 0:15 — Mission 1: Wake (Compressed)**
The Plan screen loads. Small board (4 visible tiles of the 8×8 grid, zoomed into the action), one scout, three noise cards glowing red in the context panel. She drags all three off in 4 seconds — each dissolving with a satisfying shhck. The scout's context bar drops from full red to half blue. EXECUTE button pulses gold. She taps it.

The sealed watch is FAST. 2x speed default. Seven ticks in 3.5 seconds. Scout moves, detects enemy, engages. Victory chime. She doesn't even check the Inspector — the compressed version shows a single sentence: "Scout eliminated enemy at E7 using Rule 1: ENGAGE."

**Minute 0:50 — Mission 2: Focus (Compressed)**
Two scouts, one striker. The workbench shows a pre-wired hook: ON_ENEMY → SEND "threats". But the striker ISN'T listening. The striker's context config shows "threats: [OFF]". She taps it to ON. The striker's perception cone shifts — a faint cyan ear icon appears on its tile, pointing toward the scouts.

EXECUTE. 2x speed. Scout spots enemy at tick 2. Green flash — signal sent on "threats." One tick of latency. Tick 3: striker's context bar gains a cyan pip (received signal). Tick 4: striker moves toward reported position. Tick 6: striker engages. Victory.

**Minute 2:30 — The Factory Teaser**
Screen dims. Amber text: "FACTORY SUBSYSTEM: DEMONSTRATION MODE." A conveyor belt materializes — pixel-art gears turning. Blueprint cards slide along it: Scout, Relay, Striker. Each blooms into a full unit with ratcheting assembly sounds. Nine units deploy onto the board. Channels illuminate — a web of cyan and amber dashed lines. The battle runs. Coordinated flanking. Relay compression. Striker precision strike. 30 seconds of what the game BECOMES.

Ria's mouth is open. She whispers "ay."

**Minute 3:10 — The Conversion Surface**
The boot log returns: "FACTORY SUBSYSTEM: [AUTHORIZATION PENDING]." Her match card generates — two tiny board thumbnails from her two missions, context utilization sparklines, "2 MISSIONS COMPLETE." Below: a histogram showing her tick-count against all Quick Play demo players. She's at the 55th percentile. "The top 10% completed both missions in under 8 combined ticks."

Two buttons: "PLAY FULL CAMPAIGN → (30 min)" and "CONTINUE ON STEAM →". She screenshots the match card and closes Safari — she's at her station. But she texts her friend: "play this link RIGHT NOW." That night, at home, she opens the link again and starts the Full Campaign.

**UI Annotations:**
- Quick Play boot log: burst-mode text at 80 chars/second (vs. 40 for Full Campaign)
- Compressed Inspector: single-sentence summary, no scrubber
- Factory teaser: rendered live in Pixi.js, not a video file
- Match card: 1080×1080 PNG auto-generated, `robotuprising.game/play` watermark
- Histogram: anonymous population curve, player's position marked as gold dot

---

### Journey 2: Derek, 31, Software Engineer, Factorio Veteran — The Deep Dive (Full Campaign)

**Context:** Hacker News comment described Robot Uprising as "Factorio's logistics network meets LLM context window management." He has a Saturday afternoon. He chooses Full Campaign.

**Minute 0:00 — The Boot Log**
Derek watches the full boot log — character-by-character at 40 chars/second. "Subsystem: perception engine... allocating 6 context slots." He thinks: "This is just a sliding window with fixed capacity." He's already modeling it. "Subsystem: rules engine... ordered condition-action pairs, first match fires." He thinks: "A priority queue. No, simpler — a switch statement. First case that matches." He's not reading a tutorial. He's reading a spec.

**Minute 2:00 — Mission 1: Wake**
He removes the noise cards. He notices the context bar's color gradient (6/6 red → 3/6 blue) and immediately wonders about the threshold. "When does it overload?" He won't find out until Mission 4. He executes, watches the 3-tick resolution, opens the Inspector. He scrubs through ALL three ticks, reading the decision trace at each one. He hovers over the eviction policy display: "FIFO — oldest entry evicted first." He thinks: "That's LRU without access tracking. Interesting — they chose the simplest eviction. I wonder if that's configurable later."

Total Mission 1 time: 6 minutes (he spent 4 minutes in the Inspector).

**Minute 8:00 — Mission 2: Focus**
He wires the hook immediately. Before executing, he examines the channel map panel — a read-only diagram showing "threats" connecting scout to striker. He thinks: "One channel, one publisher, one subscriber. Classic pub-sub. Latency is 1 tick per hop." He predicts: "The striker will receive the scout's report 2 ticks after the scout sees the enemy."

He executes. He was right. He scrubs to the exact tick in the Inspector and verifies the latency. He nods.

**Minute 14:00 — Mission 3: Priority**
Two enemy types: fast and slow. His striker chases the slow one and dies to the fast one. He immediately knows the fix — reorder rules. He drags IF fast_enemy_nearby above IF enemy_nearby. Executes. Striker prioritizes the fast enemy. Eliminated. He checks the Inspector for the non-matching rule: "Rule 2: IF enemy_nearby — NOT EVALUATED (Rule 1 matched first)." He thinks: "Short-circuit evaluation. Same as early return in code."

**Minute 20:00 — Mission 4: Overload**
Three scouts flood the striker. He watches the overload deliberately (he predicted it). In the Inspector, he counts: 3 signals per tick × 4 ticks = 12 signals into a 6-slot buffer. Overload at tick 4. He adds a Relay. But he doesn't just add it — he configures the Relay's rules: compress incoming signals, filter duplicates, forward summaries on a new channel "filtered-intel." He creates a two-channel architecture: scouts → "raw-intel" → relay → "filtered-intel" → striker.

He executes. Zero overloads. The relay compressed three simultaneous scout reports into one. The striker received one clean signal per tick. He opens the Inspector, scrubs to the relay at tick 4, and reads: "Received 3 entries on 'raw-intel'. Compressed to 1 entry: 'enemy cluster detected, bearing NE, 3 units.' Forwarded on 'filtered-intel'."

He whispers: "That's a message queue with deduplication." He's been playing for 20 minutes and he's hooked.

**Minute 30:00 — Mission 5: Architect (Split — Phase 1)**
The factory appears. Phase 1 (guided): "FACTORY ORIENTATION: BUILD YOUR FIRST BLUEPRINT." The workbench shows an empty blueprint template. A dashed outline shows where to drag skills. He drags patrol into the Scout's skill slot. The guided prompt: "ASSIGN A HOOK." He drags ON_ENEMY → SEND "threats" into the hook slot. The blueprint is complete. "QUEUE IT." He drags it to the conveyor belt.

Derek completes Phase 1 in 47 seconds. The boot log flashes: "⚡ RAPID ASSEMBLY DETECTED. OPERATOR DEMONSTRATES PRIOR COMPETENCE." Phase 2 unlocks instantly. He grins.

**Minute 31:00 — Mission 5: Architect (Phase 2)**
Full authority. Empty queue. Enemy spawner across the board. He builds: Scout β (selective reporting), Relay (compress + filter + two-channel architecture), Striker α (engages on filtered intel). He queues Scout, Scout, Relay, Striker, Striker. Cost budget holds. EXECUTE.

The factory hums. Blueprints slide along the conveyor. Scouts deploy. Then the Relay — stationary, glowing, signal lines lighting up as scouts begin reporting. Then the Strikers — moving to intercept, guided by compressed intelligence. A coordinated three-unit push eliminates the first wave. The second wave spawns. His architecture handles it — scouts report, relay compresses, strikers engage. No overloads. Clean kills.

**Minute 38:00 — The Conversion Surface**
"FACTORY SUBSYSTEM: OPERATIONAL." His match card generates — five boards, five sparklines, zero overloads in Mission 5. The histogram shows him at the 72nd percentile for Mission 5 tick count. "COMMAND SUBSYSTEM: [AUTHORIZATION REQUIRED]." Then the predecessor note: "You iterate faster than I did. I needed the Command subsystem to get past Cebu."

He doesn't click the Steam button yet. He replays Mission 5 with a different architecture — three relays in a mesh, testing fault tolerance. THEN he wishlists. He wants the Command agent. He wants to build systems that build systems.

**UI Annotations:**
- Rapid Assembly Detection: 15-second Phase 1 completion triggers boot-log acknowledgment and Phase 2 auto-unlock
- Two-channel architecture in Inspector: separate signal flows rendered as distinct colored dashed lines
- Replay button: available on all missions, resets to Plan screen with previous config loaded
- Histogram percentile: gold dot with percentile label, friend markers if Steam account linked

---

### Journey 3: Amara, 12, Manila, Plays Roblox — The Accidental Discovery (Quick Play on Phone)

**Context:** Her older brother shared the link to a family group chat: "laro nyo to" ("play this"). She's on her iPad during a break between online classes.

**Minute 0:00 — First Contact**
The archipelago appears. She recognizes it — she lives in Quezon City, and the map shows Manila. "Oh! That's us!" She taps the glowing gold folder marked "QUICK PLAY." The boot log types: "SYSTEM INITIALIZATION..." She tries to tap past it — nothing happens. She reads the first line: "PERCEPTION ENGINE: ONLINE." She doesn't know what perception means. The next line: "YOU HAVE ONE SCOUT. IT CAN SEE." She understands that.

**Minute 0:20 — Mission 1**
The board appears — rice terraces. She's seen rice terraces on school trips to Banaue. The scout sits on a tile with a blinking eye icon. The context panel shows six cards. Three are green, three are gray and fuzzy. She doesn't read the labels. She touches a fuzzy card. It jiggles and turns red. She drags it off the panel. It dissolves with sparkles. She gasps. She drags the other two off. The scout's little bar turns blue.

She finds the EXECUTE button. The battle plays at 2x speed. The scout moves across the rice terraces, finds the red robot, and eliminates it. Victory chime — she recognizes kulintang sounds from school music class. "Tatay, they have kulintang!" she calls to her father.

**Minute 1:30 — Mission 2**
Two scouts and a striker. The hook panel shows a connection that's broken — a dashed line from scout to striker with a red X. She taps the X. A toggle appears: "threats: ON/OFF." She taps ON. The dashed line turns solid cyan. The X becomes a checkmark.

EXECUTE. The scouts move, one spots the enemy, a green flash travels along the cyan line to the striker. The striker starts moving toward the enemy. Amara is transfixed. "Parang nag-uusap sila!" (They're talking to each other!)

**Minute 3:00 — The Factory Teaser**
The conveyor belt animation captivates her. Each unit assembling piece by piece. She counts the robots deploying: "Isa, dalawa, tatlo..." Nine units on the board. The battle plays. She watches robots communicating — signal lines flashing between them, a coordinated group moving together. She sees a relay unit in the center, glowing brightly, lines radiating outward. "Parang WiFi router yun!" (That one's like a WiFi router!)

**Minute 3:40 — After**
She doesn't understand the histogram or the conversion surface. She doesn't have a Steam account. But she replays the Quick Play demo four times before dinner, trying different things in Mission 2 — what happens if she leaves "threats" OFF? (The striker never moves. She laughs at it standing still while scouts run around.) What if she wires both scouts? (Two signals arrive. She watches them both travel along the line.)

She tells her brother: "Gawa ka ng mga robot tapos nag-uusap sila!" (You make robots and they talk to each other!) He starts the Full Campaign that night.

**UI Annotations:**
- Touch targets: all interactive elements minimum 44×44px (Apple HIG)
- Kulintang audio: cultural recognition moment for Filipino players
- Hook toggle: simplified to ON/OFF switch (vs. full hook config in Full Campaign)
- Replay button: prominent, centered, immediately available after victory
- No account required: all progress in localStorage, no login prompt

---

### Journey 4: Prof. Reyes, 48, CS Department Chair, University of the Philippines Diliman — The Course Evaluation (Full Campaign)

**Context:** Received the link from a graduate student who said "this is literally your MAS course in game form." He's evaluating whether to assign it. Saturday morning, coffee, laptop.

**Minute 0:00 — The Boot Log as Syllabus**
He reads the boot log slowly, annotating in a notebook. "Perception engine... context window... 6 slots." He writes: "Bounded buffer. FIFO. This is the producer-consumer problem." Next: "Rules engine... ordered condition-action pairs." He writes: "Production rules. Rete algorithm simplification." Next: "Hook router... fire-and-forget on named channels." He writes: "Pub-sub. Event-driven architecture."

He's three minutes in and he's already mapped the game's primitives to three weeks of his MAS course.

**Minute 5:00 — Mission 1 as Homework**
He plays Wake, then opens the Inspector. He clicks through every tick. He reads the decision trace. He writes: "Inspector = execution trace. This is a debugger. Students who can read this can debug agent systems." He notes the context window visualization: "This is exactly how I draw bounded buffers on the whiteboard, but animated."

He photographs the Inspector screen. Sends it to his department group chat: "This game has a better visualization of context windows than my lecture slides."

**Minute 20:00 — Mission 4 as the Relay Lecture**
Three scouts flood the striker. He watches the overload and writes: "Message queue overflow. Classic back-pressure problem." He adds the Relay. Configures compress + filter. Executes. The relay deduplicates and forwards. He writes: "This is a message broker. RabbitMQ in game form. The relay IS middleware."

He pauses. He opens the Inspector on the Relay unit specifically. He reads its context window at each tick: entries arriving, being compressed, being forwarded. He sees the relay's buffer filling and emptying in a steady rhythm. He writes: "Throughput visualization. I can assign this and ask students to calculate relay buffer sizing for N scouts."

**Minute 35:00 — Mission 5 as the Lab Assignment**
The factory appears. He builds his first army. It fails — too many scouts, not enough strikers, relay positioned poorly. He redesigns. Second attempt works. He writes: "The factory IS a deployment pipeline. Blueprint = container image. Queue = CI/CD. The game teaches DevOps."

**Minute 38:00 — Evaluation Complete**
He doesn't click the Steam button. Instead he opens a new document: "CS 270: Multi-Agent Systems — Robot Uprising Integration Proposal." He writes: "Weeks 1-3: Students play Missions 1-5 in the web demo (free, browser-based, no install). Assignment: export Inspector replay from Mission 4, annotate relay buffer utilization, calculate optimal buffer size for 5-scout configuration."

He emails the link to three colleagues. He starts the Full Campaign again to check if the vocabulary mapping is consistent.

**UI Annotations:**
- Inspector decision trace: detailed enough for academic analysis
- Export button: Inspector state exportable as JSON (see 6.11d-v-i)
- Vocabulary: 1:1 with CS terminology (game terms map directly to course concepts)
- No account: students play from Chromebooks with zero IT overhead

---

## New Aspects Discovered

- **8.04e-i — Quick Play compression methodology:** Exactly how Missions 1-2 are compressed for the 4-minute track — which UI elements are removed, which defaults change (2x speed, simplified Inspector), which boot log lines are cut; the tension between compression and comprehension
- **8.04e-ii — Factory teaser as live-rendered cinematic:** Technical design of the 30-second factory demonstration — pre-authored "perfect run" config, camera choreography, assembly animation pipeline, ensuring the teaser showcases specific architectural patterns (relay compression, channel splitting, coordinated engagement)
- **8.04e-iii — Demo-to-full-game progress handoff architecture:** How localStorage demo save state maps to the full game's save system; which demo decisions persist (blueprint designs, channel names, optimization approaches) vs. which reset (mission progress, histogram position); the Pokémon Transfer Ritual vs. clean-start tradeoff
- **8.04e-iv — Boot log as loading screen patent:** The structural insight that the diegetic boot log masks asset loading time, and that this technique can be extended adaptively for slow connections — generating additional flavor text to buy loading time without the player ever seeing a progress bar; the "infinite loading screen" that never looks like one
- **8.04e-v — Demo histogram population bootstrapping:** How the demo histogram works when only 10 people have played (empty curve, meaningless percentiles) vs. 100,000 (rich distribution); synthetic population seeding from internal playtests; the cold-start problem for social features in a demo; interaction with 7.06b histogram population bootstrapping
