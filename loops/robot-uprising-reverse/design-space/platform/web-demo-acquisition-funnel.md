# 6.11 — The Web Demo: Browser-Playable Demo as Acquisition Funnel

## Overview

Robot Uprising is built on React + Pixi.js + Vite — a **web-native** stack. Unlike most games that must port to browser, this game IS a browser game. The web demo isn't a compromise or a reduced version — it's the actual game running in its natural environment. This is an extraordinary structural advantage. The question isn't "can we make a web demo?" — it's "what should the web demo BE, and how does it drive the funnel from URL click to Steam wishlist to purchase?"

The Vampire Survivors precedent is the North Star: an itch.io browser version that generated 123,000 views and 81,800 browser plays before the Steam Early Access launch, with itch.io comments showing strong organic conversion ("Great game, thanks for the free demo here, after 1 round I bought it on Steam!"). NIMRODS kept a WebGL demo on itch.io "for SEO / promo since the demo itself links to our steam page." Steam Next Fest data (October 2025) shows that ~29.5% of wishlisters for top-performing games had previously tried the demo — and a wishlist earned because a player played the game carries vastly more buy intent than a vibes-only CGI trailer wishlist.

This document explores six web demo models, each targeting different funnel behaviors, audience segments, and viral mechanics.

---

## The Funnel Anatomy

Before exploring demo models, the full acquisition funnel for Robot Uprising:

```
[Discovery] → [Click] → [Load] → [Play] → [Hook] → [Wall] → [Convert]
   TikTok       URL     <3 sec   First     Aha      Content    Steam
   Reddit      itch.io   load    input    moment     gate     wishlist
   Discord    QR code             ↓         ↓         ↓      purchase
   Streamer   embed             touch      "oh,       ↓
   Word of               board   THIS is   what I
   mouth                         what it   can't do
                                 feels     in the
                                 like"     demo"
```

**Key metrics at each stage:**
- **Discovery → Click**: ~2-5% click-through from social media posts (industry average)
- **Click → Load**: Must be <3 seconds or 53% bounce (Google 2018 mobile benchmark). Web-native stack gives us this.
- **Load → Play**: First interaction must happen within 10 seconds of page load. No account creation, no email gate, no tutorial splash screen.
- **Play → Hook**: The "aha moment" — when the player first sees their configured agents execute and something unexpected-but-logical happens. Must occur within 3-5 minutes.
- **Hook → Wall**: The content gate that motivates conversion. Player wants MORE — more missions, more unit types, more blueprint complexity, the Gauntlet.
- **Wall → Convert**: Steam wishlist button, purchase link, or Steam widget embedded in the demo page.

---

## Demo Model A: "The First Mission" — Vertical Slice Demo

### What It Is

The complete Mission 1 experience — boot log, Plan screen with pre-placed Scout, Sealed Watch, Inspector debrief — running identically to the full game. One mission, full fidelity. When the player completes Mission 1, they see: "Mission 2 awaits. Continue on Steam →" with a Steam wishlist widget.

### How It Works Mechanically

The demo serves the exact same build as the full game, with a mission-unlock gate after Mission 1. The URL is `robotuprising.game/play` (or `robotuprising.itch.io`). No login. No account. The page loads to a title screen — stylized Philippine archipelago, circuit-board data cables pulsing between provinces, just the first province (Ifugao) glowing gold. Click it. Boot log begins.

The player experiences:
1. Boot log (diegetic tutorial — "You are an AI reading your own spec sheet")
2. Plan screen with one pre-placed Scout on the 8×8 rice terrace board
3. Three context window slots to configure (listen/ignore toggles)
4. EXECUTE button → Sealed Watch (the Scout navigates, encounters an enemy, context fills, action resolves)
5. Inspector debrief (scrub timeline, see what the Scout knew at each tick, understand why it did what it did)
6. Victory/failure → results screen → "Mission 2 awaits on Steam"

### Sensory Description

The demo loads in 2.1 seconds on a 25 Mbps connection (React + Pixi.js + Vite, ~4MB initial bundle with terrain sprites lazy-loaded). Title screen: dark background, the archipelago fades in from black over 800ms, circuit lines animate left-to-right, Ifugao province pulses gold at 0.5Hz. A subtle kulintang metallic shimmer plays on load — three ascending notes, each 200ms, the last ringing for 1.5 seconds. No start button. Click anywhere. The boot log types itself in amber monospace, character by character at 40 chars/second, each line appearing with a soft mechanical keystroke sound. The player doesn't press "skip" — they read, because it's about THEM. "Subsystem: perception... ONLINE. Subsystem: rules engine... ONLINE. Subsystem: hook router... ONLINE. You have one unit. It can see. Teach it what to notice."

### Strengths

- **Zero friction.** URL → playing in under 15 seconds. No download, no account, no install.
- **Full fidelity.** The player experiences the REAL game, not a reduced simulation. If they like Mission 1, they'll like Mission 2.
- **Clean conversion point.** The wall is natural — Mission 2 is locked. No "time limit" or "feature restriction" artificiality.
- **SEO-powerful.** A playable web page ranks for "play robot uprising" / "robot uprising demo" / "robot uprising free."
- **Embeddable.** An `<iframe>` embed of the demo can live on gaming press sites, review pages, or social media link trees.

### Weaknesses

- **Short session.** Mission 1 takes ~4-8 minutes. If the player doesn't convert immediately, they may forget. No reason to return.
- **Shallow hook.** Mission 1 teaches only context windows — no rules, no hooks, no factory. The aha moment may not land hard enough.
- **One-shot impression.** If the player has a bad first experience (confused by boot log, doesn't understand context), there's no recovery path.

### Interaction Effects

- **With GIF/clip export (6.09):** If the demo includes the Match Card auto-export, the player's first completed mission generates a shareable image. "I just played Robot Uprising" with a terrain screenshot, unit icons, and match stats → social sharing from the demo itself.
- **With mobile adaptation (6.07):** The demo must work on phones. Portrait Plan → landscape Sealed Watch rotation (6.07b hybrid model) is the demo's TikTok moment — "the phone turned itself sideways when the battle started."
- **With onboarding (5.00a):** Mission 1's vocabulary budget is the lowest (2 new terms: context window, perception). Safe territory for the demo.

### Comparable Games

- **Vampire Survivors (itch.io):** Free browser version = permanent demo. 81,800 browser plays before Steam launch. The demo WAS the game minus updates. Robot Uprising's demo is structurally similar — same engine, same assets, content-gated.
- **Into the Breach (Netflix mobile):** Into the Breach's mobile port is the full game behind a Netflix paywall, but the first island functions as a demo within the subscription. Mission 1 is self-contained.
- **Balatro:** No official persistent web demo (Steam demo was later removed), but multiple unofficial browser clones emerged — evidence that players WANT zero-friction access to test the core loop.

#### Journey: Ria, 24, UX Designer in Manila

**Context:** Sees a 12-second TikTok of someone's Sealed Watch replay — tiny robots moving on an isometric rice terrace grid, colored signal lines flashing between them, context bars filling and overloading. Caption: "i designed robots that are smarter than me." Link in bio.

**Minute 0:00 — The Click**
Ria taps the link on her phone. Safari loads `robotuprising.game/play`. The page is a dark void for 0.8 seconds, then the Philippine archipelago fades in. She recognizes the geography immediately — Luzon, Visayas, Mindanao. The Ifugao province glows gold. She taps it without reading anything else.

**Minute 0:15 — The Boot Log**
Amber text types itself onto a black screen, line by line. "SYSTEM INITIALIZATION..." She almost swipes away — another loading screen? But then: "Subsystem: perception engine... allocating 6 context slots." Context slots? She reads. "You have one Scout. It can see five tiles in any direction. Its context window holds six observations. When the window fills, the oldest observation falls out." She whispers "oh." She's an AI, and she's reading her own capabilities.

**Minute 1:30 — The Plan Screen**
The board appears on the left — an 8×8 isometric rice terrace, each tile a textured miniature of Ifugao's emerald steps. One unit sits on the grid: a cyan triangular Scout with a tiny 6-pip context bar beneath it. The workbench panel on the right (she's holding her phone in landscape now — it prompted her to rotate) shows the Scout's blueprint. Three toggles: what the Scout listens to. She turns ON "enemy positions" and "terrain features." Leaves "friendly positions" OFF because there are no friendlies. She sees the EXECUTE button pulsing gold in the top-right corner.

**Minute 2:45 — EXECUTE**
She taps EXECUTE. The screen shifts — board centers, workbench disappears, a horizontal tick clock appears at the top with 30 small pips. First pip lights. The Scout moves. Its context bar gains a pip — blue, an observation. Second tick. Two more pips. Enemy appears at E7. The Scout's bar flashes — a green pip arrives (signal detection). Third tick. The context bar is at 4/6. She can see the Scout processing, THINKING, in real time through its filling context. Tick 8 — bar hits 6/6. Tick 9 — the leftmost pip goes red and vanishes (eviction!), a new observation takes its place. She watches the Scout navigate based on what it currently knows, forgetting old data as new data arrives.

**Minute 4:15 — The Debrief**
"SEALED WATCH COMPLETE." The Inspector appears. A timeline scrubber replaces the tick clock. She drags it back to tick 9 — the eviction tick. She clicks the Scout. The context window panel shows six slots: [terrain F4, enemy E7, terrain G3, empty tile F6, terrain E5, enemy E6]. Below: "Rule matched: EVADE — enemy detected in context → move away from nearest enemy. Context entries evaluated: slot 2 (enemy E7), slot 6 (enemy E6)." She sees WHY the Scout ran northeast. It wasn't random. It read its context and followed its rule.

**Minute 5:30 — The Wall**
Results screen: "MISSION 1: IFUGAO RECONNAISSANCE — COMPLETE." Below: a match card showing the rice terrace board, her Scout's patrol path traced in cyan, context utilization sparkline (green→amber at tick 9). Below that: "Mission 2: Siquijor — Your Scout learns rules. Coming soon on Steam." A Steam wishlist button, large and gold. She screenshots the match card, shares it to her Instagram story: "ok this is actually insane." She taps the wishlist button.

**Minute 6:00 — The Afterglow**
She goes back to the TikTok that brought her here and comments: "just played the demo in my browser, the context window thing is wild." She checks if there's a subreddit.

**UI Annotations:**
- Steam wishlist widget: embedded Steamworks widget, 280×80px, gold border matching EXECUTE button palette
- Match Card: auto-generated PNG, 1080×1080 for Instagram, includes `robotuprising.game/play` watermark
- Rotation prompt: subtle phone icon with curved arrows, 60% opacity, dismisses on rotation

#### Journey: Dev, 34, Backend Engineer in Bangalore

**Context:** Reads a Hacker News comment: "Robot Uprising is literally an agentic engineering workbench disguised as a game. Skills = tools, rules = system prompts, hooks = webhooks, context config = context window management. Play the demo: robotuprising.game/play"

**Minute 0:00 — The Skeptic's Click**
Dev opens the link in Chrome on his work laptop. It loads fast — he inspects the network tab out of habit. React + Pixi.js, Vite bundled, ~3.8MB. "Clean stack," he thinks. The archipelago map appears. He clicks Ifugao.

**Minute 0:20 — The Recognition**
The boot log types: "Context window: 6 slots. Eviction policy: FIFO." He stops reading it as flavor text. This IS a context window. Six slots. First-in-first-out eviction. "This is literally an LLM context window at toy scale," he mutters. He's not learning game mechanics — he's recognizing engineering concepts he already knows, rendered visible and interactive.

**Minute 1:15 — The Plan Screen**
He sees the Scout's blueprint. Context config: listen/ignore toggles for observation categories. He turns ON everything — he wants maximum information. He hits EXECUTE.

**Minute 3:00 — The Overload**
Tick 12: the Scout's context bar hits 6/6. Tick 13: eviction flash. Tick 14: more evictions. The Scout is thrashing — every tick evicts old data and replaces it with new observations. It's context-switching so fast it can't act coherently. "Buffer thrash," Dev says out loud. He's seen this in production systems. The Scout wanders aimlessly because its context changes completely every 2 ticks.

**Minute 4:30 — The Debrief**
He scrubs to tick 14. The context window shows all 6 slots cycling. He sees the problem: with everything turned ON, terrain observations flood the buffer, pushing out the enemy sighting that should drive behavior. He needs to turn OFF terrain. Reduce input, improve signal-to-noise ratio. "This is literally context window engineering," he says, grinning.

**Minute 5:00 — The Wall**
Results screen. He wants to replay with the fix. The demo lets him re-attempt Mission 1 — same mission, different configuration. He turns off terrain listening. EXECUTE. This time the Scout sees enemies and ONLY enemies, navigates cleanly, evades efficiently. Perfection.

**Minute 7:00 — The Wishlist**
He wishlists. Then he opens Slack and posts the demo link in #engineering-random: "play this immediately. it's agent context windows as a game." Three wishlists from that message.

**UI Annotations:**
- Re-attempt: "RETRY MISSION" button below results, same gold as EXECUTE, no penalty, no timer
- Engineer's shortcut: the demo page URL accepts `?skip_boot=1` to skip the boot log on subsequent loads — Dev discovers this in the URL bar and appreciates it

#### Journey: Tomás, 14, High School Student in Cebu

**Context:** His friend sends him a Discord link: "play this its free" with a screenshot of the isometric battlefield.

**Minute 0:00 — The Impatient Click**
Chrome on a 4-year-old Android phone. The page loads in 3.4 seconds on his home WiFi. Archipelago map. He doesn't recognize it as the Philippines at first — "oh wait that's us!" He taps Ifugao.

**Minute 0:15 — The Boot Log**
Amber text starts typing. He reads the first three lines. Then he taps the screen rapidly trying to skip it. The text accelerates to instant-display mode (tap-to-advance, like a visual novel). He taps through in 15 seconds, absorbing maybe 20% of the content. He arrives at the Plan screen not really knowing what "context window" means, but knowing he has a Scout and it can see stuff.

**Minute 1:00 — The Guess**
He sees toggles. He turns them all ON because more = better, right? He sees EXECUTE, big gold button, taps it. His phone rotates to landscape for the Sealed Watch. "Whoa." The rice terrace board fills his screen. The Scout moves. Little colored pips appear under it. Enemies appear. The Scout runs around. He has no idea what's happening mechanically, but it LOOKS cool — isometric tiles, snap movements, signal flashes.

**Minute 3:00 — The Accident**
Mission fails. His Scout got cornered. He doesn't understand why. "what." He hits retry. This time he turns off two of the three toggles randomly. EXECUTE. The Scout does something different this time — it focuses, moves with purpose, and survives. He didn't understand the theory, but he saw the RESULT of changing configuration. A cause-and-effect moment that needs no vocabulary.

**Minute 5:00 — The Wall**
Results screen. He screenshots his successful match card and posts it in the Discord: "i beat it." His friend: "now do it without losing any ticks." Competitive engagement from a single shared mission. But there IS no Mission 2 in the demo. He wishlists. Not because he understands the game's depth — because the TikTok-ready isometric pixel art and the feel of watching his Scout execute made him want more.

**UI Annotations:**
- Tap-to-advance: boot log responds to rapid taps by switching to instant-display mode
- Mobile viewport: Plan screen stacks vertically on narrow phones (<600px), board on top, workbench below
- No signup: no account creation, no email capture, no age gate

---

## Demo Model B: "The First Three" — Extended Tutorial Demo

### What It Is

Missions 1-3 playable in the browser. This gives the player the context window (M1), rules (M2), and hooks (M3) — the three core primitives before the complexity jump at M4 (skills). The wall sits at Mission 4: "You've learned to see, think, and communicate. Now your agents learn to DO. Continue on Steam →"

### How It Works Mechanically

Same as Model A but with three missions unlocked. Player progress saves to `localStorage` — they can close the browser and return. Each mission introduces one core concept. By Mission 3, the player has experienced the full Plan → Sealed Watch → Inspector loop three times and has seen hooks wire two units together for the first time.

### Why Three Missions Is the Sweet Spot

Mission 1 teaches context windows (see). Mission 2 teaches rules (think). Mission 3 teaches hooks (communicate). These are the three legs of the stool. A player who has experienced all three understands the NATURE of the game — "I'm wiring intelligent systems" — even if they haven't seen skills, factories, or Command agents. The aha moment in M3 (watching two units coordinate via a hook channel for the first time) is the game's most powerful conversion point.

### Sensory Description

Completing Mission 3 triggers a special debrief sequence. After the Inspector, the campaign map re-appears. Ifugao, Siquijor, and Palawan glow cyan (completed). The fourth province — Batanes — pulses gold, but as the player reaches to tap it, the circuit-board cable connecting Palawan to Batanes dims and a lock icon appears. The Predecessor's voice (amber text): "The next step requires... more of you. More than this terminal can provide." The Steam widget fades in below the map, framed as a continuation of the diegetic narrative: the demo IS the limited terminal. Steam IS the full system.

### Strengths

- **Deeper hook.** Three missions ≈ 15-25 minutes. The player has invested time, learned vocabulary, and experienced the Inspector. Sunk cost + genuine understanding = stronger conversion.
- **Complete primitive set.** The player understands context, rules, AND hooks. They can explain the game to a friend.
- **Return visits.** Three missions means some players will spread the demo across 2-3 sessions. Each return is a re-engagement.
- **Replayability within demo.** Mission 1 can be re-attempted with knowledge from Mission 3 — "what if I configure this differently knowing how hooks work?"

### Weaknesses

- **Longer time-to-wall.** Some players convert faster with less content. Giving them 3 missions might mean they play 1.5 and leave without hitting the wall.
- **More content to maintain.** Three missions of parity between demo and full game means three missions of potential version drift.
- **Complexity exposure.** Some players who would have wishlisted after a simple M1 might bounce during M2 (rules can be confusing). More content = more chances to confuse.

### Comparable Games

- **Slay the Spire:** The Steam demo included the first act (roughly 1/3 of a run). Enough to understand deckbuilding, see a boss, experience a meaningful loss. Conversion was strong — "I want to see what Act 2 and 3 are like."
- **NIMRODS:** Maintained near-parity between itch.io WebGL demo and Steam demo during Steam Next Fest. 81,800 browser plays on itch.io, 1,203 reviews on Steam launch.

#### Journey: Priya, 41, Data Scientist in London

**Context:** A colleague mentions "there's a browser game that teaches agentic AI concepts through gameplay" in a team retrospective about AI tools adoption.

**Minute 0:00 — The Professional Click**
She opens the URL on her work laptop during lunch. Mission 1: she recognizes the context window immediately. FIFO eviction. "This is a toy sliding window." She speeds through it.

**Minute 4:00 — Mission 2: Rules**
Now her Scout has rules — ordered condition→action pairs. She creates two: "IF enemy in context THEN evade" and "IF no enemy THEN patrol." She hits EXECUTE. The Scout encounters an enemy, evades, loses sight of it, resumes patrol. Clean. She reorders the rules — patrol first, evade second. EXECUTE. The Scout patrols INTO the enemy because patrol matched first. She laughs. "Priority ordering. This is literally if-else evaluation." She reorders them back.

**Minute 10:00 — Mission 3: Hooks**
Two units now: Scout and Striker. The Scout can see far but can't fight. The Striker can fight but can barely see. She wires a hook: Scout broadcasts on channel "threat" when it sees an enemy. Striker listens on "threat" and engages the reported position. EXECUTE. The Scout spots the enemy. Tick 1: observation enters Scout's context. Tick 2: hook fires, signal sent on "threat" channel — green flash on the connecting line. Tick 3: signal arrives in Striker's context. Tick 4: Striker's rule matches "threat data in context → engage source location." Tick 5: Striker moves toward reported enemy position. She watches the information flow across two agents in real time, through their context windows, mediated by rules.

**Minute 14:00 — The Aha Moment**
The debrief shows the signal chain: Scout perceived → hook fired → Striker received → rule matched → action taken. Four ticks of latency. She thinks: "If I add a Relay in between to compress the signal, that adds another hop... but the compressed signal takes less context space in the Striker's buffer..." She doesn't have a Relay yet. She WANTS a Relay. She wishlists immediately. Then she books a 15-minute team demo: "Everyone needs to play this."

**Minute 15:00 — The Evangelism**
She sends the demo link to three colleagues with: "Play through mission 3. It'll take 15 min. Then tell me this isn't how we should be teaching people about agent architectures."

**UI Annotations:**
- Signal chain visualization: during M3 debrief, dashed cyan line connects Scout→Striker with tick numbers at each hop
- "What's next" teaser: at M3 completion, a greyed-out skill panel briefly flashes, showing the COMPRESS skill that would solve her Relay wish

#### Journey: Kwame, 27, Content Creator / Twitch Streamer in Accra

**Context:** Browsing itch.io for new indie games to stream. Sees Robot Uprising tagged "strategy, programming, AI, browser."

**Minute 0:00 — The Stream Test**
He opens it in OBS browser source to test if it's streamable. Title screen loads. "Oh this looks clean." He starts a test recording. The boot log types itself — "perfect for reading out loud on stream," he notes. Atmospheric audio works well through capture.

**Minute 2:00 — The Visual Test**
Plan screen: the isometric board looks great at 1080p capture. Colors are saturated enough for compressed video. Unit icons are readable at stream resolution. "Chat's gonna love watching the little robots." He plays through Mission 1, narrating as he goes. The Sealed Watch is especially streamable — no input needed, just watching and reacting. Signal flashes and context bar fills are visible enough for viewers.

**Minute 8:00 — The Clip Moment**
Mission 2. He misconfigures a rule and his Scout walks directly into an enemy. "NO NO NO — wait, the rule was wrong!" He scrubs back in the Inspector, shows exactly which rule matched, points at the screen. "CHAT, LOOK. It did EXACTLY what I told it to do. I'm the idiot." This is the clip. The moment of understanding that the system is deterministic and YOUR configuration is the variable — that's funny, relatable, and educational simultaneously.

**Minute 18:00 — The Content Evaluation**
After three missions, he's thinking about content potential: "This could be a full series. Each mission introduces something new. The debrief is like a post-game analysis — my viewers who watch esports will eat this up." He wishlists, schedules a stream for Thursday titled "I'm Building An AI Army And It's Going Terribly."

**UI Annotations:**
- Stream-friendly: high-contrast mode toggle in settings makes all UI elements bolder for compressed video
- No watermark: the demo doesn't brand itself intrusively; the game's visual identity IS the branding

---

## Demo Model C: "The Sandbox Slice" — One Board, Infinite Configurations

### What It Is

A single mission (Ifugao, Mission 1's board) but with ALL unit types unlocked and unlimited reconfiguration. No campaign progression. No story. Just the workbench and the battlefield. "Here's a board. Here are five unit types. Configure them. Hit EXECUTE. See what happens." The wall is implicit: after the player has iterated 5-10 times on the same board, they want NEW boards, NEW enemies, and a CAMPAIGN to structure their learning.

### How It Works Mechanically

The sandbox loads with the Mission 1 board (8×8 rice terrace, 3 enemy Scouts, 1 enemy Striker). The player gets 50 resource points and access to all five unit types (Scout 3m, Relay 5m, Striker 8m, Specialist 7m, Command 10m). Full blueprint editor — skills, rules, hooks, context config. Production queue. The demo runs until the enemies are eliminated or all player units die. Unlimited retries. No progression, no unlock, no story.

### Sensory Description

No boot log. The page loads directly to the Plan screen. Board on the left, fully revealed — enemies visible as red units with projected attack paths. Workbench on the right, all unit types in a vertical palette. A tooltip on first load: "Design your army. Hit EXECUTE. Watch. Learn. Redesign." That's the only tutorial. The rest is discovery.

### Strengths

- **Immediately deep.** A Factorio/Zachtronics veteran can dive into Command agent hook wiring on their first session. No tutorial gate.
- **Infinite replay.** Same board, infinite configurations. The "one more try" loop is immediate.
- **Community-generative.** Players share configurations: "I beat the demo with just 2 Relays and a Striker, no Scout." Config codes enable sharing even within the demo.
- **Showcases depth.** A viewer watching a streamer play the sandbox sees the FULL game — every unit type, every skill, every hook combination. The sandbox IS the pitch.

### Weaknesses

- **Hostile to beginners.** Five unit types, 12 skills, rules, hooks, context config — all at once. A new player doesn't know where to start. Cognitive overload. The game's careful 10-mission vocabulary pacing is destroyed.
- **No narrative hook.** No Predecessor, no boot log, no campaign map. The emotional layer is absent.
- **No structured conversion point.** There's no "Mission 2" to unlock. The player has to self-motivate to seek the full game.

### Comparable Games

- **Besiege / Kerbal Space Program:** Sandbox-first demos. "Here's a physics simulation. Build something. See if it works." Strong for engineering-minded players, alienating for everyone else.
- **Factorio demo:** The old Factorio demo was a mini-campaign. But Factorio's most viral moments come from sandbox factory screenshots — the complexity IS the pitch.

#### Journey: Marcus, 38, ML Engineer in San Francisco

**Context:** Sees a Reddit post on r/MachineLearning: "This game teaches agentic AI architecture through gameplay — same vocabulary as real agent frameworks (skills, rules, hooks, context windows). Sandbox demo: [link]"

**Minute 0:00 — The Expert's Entry**
Plan screen loads. No tutorial. He sees five unit types in the palette. He reads their stats: Scout (6 buffer, 2 hook slots, wide perception), Relay (12 buffer, 4 hook slots, stationary), Command (14 buffer, 6 hook slots, reassign/reroute/prioritize skills). He immediately recognizes the architecture: "Scout is a sensor, Relay is middleware, Command is an orchestrator." He places 2 Scouts, 1 Relay, 1 Striker, 1 Command.

**Minute 3:00 — The First Architecture**
He wires hooks: Scouts broadcast on "intel," Relay listens on "intel" and broadcasts compressed summaries on "orders," Striker listens on "orders." Command listens on "intel" (raw) and "orders" (compressed), with rules to reroute Striker if the compressed signal misses something. He sets the Relay's compress skill to prioritize enemy positions over terrain. He's building a real information pipeline — producer, middleware with filter/compress, consumer, and a supervisory monitor.

**Minute 4:30 — EXECUTE**
The Sealed Watch plays. His architecture works... mostly. The Scouts detect enemies, the Relay compresses, the Striker receives and engages. But: the Command agent's context window fills with both raw and compressed data, causing eviction of its OWN rules-evaluation context. It stops issuing reroute commands after tick 15. His supervision layer is overloaded. "Classic context window thrash," he mutters.

**Minute 7:00 — The Redesign**
He adds a listen/ignore filter on the Command agent: ignore raw "intel," only listen to "orders" (compressed). This frees context space for the Command's own decision data. EXECUTE again. This time the Command stays coherent through tick 30, rerouting the Striker twice to intercept flanking enemies. Victory.

**Minute 10:00 — The Optimization Loop**
He wonders: can he do it with fewer units? Less budget spent? He removes the Command entirely and tries with just Scouts→Relay→Striker. It works for simple enemy patterns but fails when enemies split. "The Command agent IS the fault tolerance," he realizes. He wishlists because he wants to see what HARDER boards look like — boards where the architecture matters more.

**UI Annotations:**
- Resource counter: top-left, shows "38/50 metal" with blueprint cost previews
- Config code: bottom-right, a shareable alphanumeric string encoding the full architecture — he copies it and posts it to Reddit

---

## Demo Model D: "The Replay Theater" — Watch-Only Viral Entry Point

### What It Is

Not playable. The demo page shows a curated gallery of 5-6 pre-recorded Sealed Watch replays — dramatic moments from later missions (hook cascades, context overload chain reactions, Command agent reroutes saving a doomed Striker). Each replay is 15-30 seconds. The player can click into the Inspector for any replay and scrub through the timeline. The pitch: "You designed this. (Well, someone did.) Want to design your own? Play free →" links to the playable demo or Steam.

### How It Works Mechanically

The page loads a gallery of replay thumbnails. Each is a looping 5-second GIF preview (Opus Magnum-style). Click one → full-screen Sealed Watch playback with speed controls. After watching, the Inspector panel slides in from the right. The player can scrub, click units, see context windows, trace signal chains. They're learning the Inspector without having played a mission.

### Sensory Description

Gallery page: dark background, 2×3 grid of replay cards. Each card shows a frozen isometric battlefield mid-action — signal lines frozen mid-flash, a Striker adjacent to an enemy, context bars at various fill levels. On hover, the card animates: a 3-second loop of the climactic moment. Subtle text below each: "The Cascade" / "The Overload" / "The Save" / "The Betrayal" / "The Silence." Each replay has a name like a gallery exhibition.

Click "The Cascade": the board fills the screen. Tick clock begins. A Scout spots three enemies simultaneously — context floods. A hook fires three signals in one tick. The Relay receives all three, compress skill activates, sends one compressed summary on "priority-target." The Striker receives it and engages the highest-priority enemy. Five agents, seven signal hops, all visible in real-time with colored dashed lines connecting them. The whole cascade takes 8 ticks. Then the Inspector slides in.

### Strengths

- **Zero-commitment entry.** Not even playing — just watching. Lower friction than any playable demo. Scrolling through replays is as easy as scrolling Instagram.
- **Showcases late-game depth.** The player sees what the game BECOMES — Command agents, multi-Relay chains, factory production. The playable demo can only show early missions.
- **Inspector as hook.** The Inspector is the game's most unique feature. Letting players interact with it (scrub, click, trace) without the pressure of having configured anything themselves is a gentle introduction.
- **Streamable / embeddable.** The replay gallery is a web page that works as a YouTube embed or a Twitch panel.

### Weaknesses

- **No ownership.** The player didn't design these architectures. The emotional payload ("I made that!") is absent.
- **Passive experience.** Watching is not playing. The conversion from "this looks cool" to "I want to DO this" requires an imaginative leap.
- **Curation burden.** Selecting and maintaining the gallery requires design effort — which replays best represent the game?

### Comparable Games

- **Opus Magnum GIF culture:** The game's primary viral mechanic is GIF export of solutions. Many players discover the game by watching GIFs. "I want to make something that beautiful" drives purchase.
- **Auto Chess / Teamfight Tactics spectator mode:** Watching others' compositions fight is entertainment. Some auto-chess players watch more than they play.

#### Journey: Luna, 16, Manga Artist in Tokyo

**Context:** Scrolling through Twitter/X. Sees a quote tweet of a Robot Uprising replay GIF with the caption "this is what happens when you give robots ADHD." The GIF shows three Scouts all trying to report the same enemy, flooding a Relay's context until it stunlocks.

**Minute 0:00 — The Curiosity Click**
She taps the link. A gallery page. Six replay cards, each with a title and a looping preview. She taps "The Overload" — it looks like the GIF she saw. Full replay plays. She doesn't understand the mechanics, but the RHYTHM is compelling — little robots moving in sync, colored lines flashing, then suddenly one unit freezes and sparks cascade outward. It's visually dramatic.

**Minute 1:30 — The Inspector Discovery**
The Inspector panel slides in. She sees a timeline at the top. She drags it. The battlefield steps backward tick by tick. She taps the frozen unit — a panel opens showing six colored slots, all full, the newest entry blinking red. She doesn't know what "context window utilization: 100%, overload triggered" means technically, but she sees: too many things in the box, box broke. Intuitive.

**Minute 3:00 — The Connection**
She watches "The Cascade" replay. This time she understands more — she can see the signal lines and trace the information flow. She starts to get it: some setups lead to chaos, some lead to elegance. The elegance one is beautiful. She wants to make something beautiful. "Play free →" button. She clicks it. She's in Mission 1.

**UI Annotations:**
- Gallery cards: 320×240px thumbnails, dark border, replay title in a serif font below, loop preview on hover/tap
- "Play free →" button: appears after watching any replay for >10 seconds, slides up from bottom, gold accent

---

## Demo Model E: "The Persistent Playground" — Free-to-Play First Five

### What It Is

Missions 1-5 free forever. The full tutorial arc through factory introduction. The player gets the entire learning curve — context, rules, hooks, skills, AND the factory/production system. The wall sits at Mission 6 (Command agents) — the game's deepest mechanical layer and the transition to "building the factory that builds the factory."

### How It Works Mechanically

The demo IS the game for Missions 1-5. Progress saves to `localStorage` and optionally syncs to a lightweight account (email or Steam link). When the player completes Mission 5 (factory introduction), the campaign map shows Missions 6-10 behind a purchase gate. The Gauntlet is behind the gate. Community features (config sharing, Workshop) are available in the demo but read-only — they can VIEW others' configurations but not share their own.

### Sensory Description

Missions 6-10 appear on the campaign map as dimmed provinces with a small lock icon. But they're not hidden — the player can see their names, terrain previews, and mission briefings. "MISSION 6: CEBU — The Command Layer. Your agents learn to manage other agents." The briefing is readable. The player knows exactly what they're missing. The lock icon pulses at 0.3Hz — slow, patient, not urgent. A thin circuit-board cable extends from Palawan (M5) to Cebu (M6) with a data-flow animation that reaches the lock and bounces back, creating a visual metaphor of information being blocked.

### Strengths

- **Strongest conversion point.** Mission 5 is the factory. The player has invested 1-2 hours, learned the full vocabulary, experienced the Plan→Watch→Inspect loop 5 times, and just unlocked PRODUCTION. They understand the game deeply. They're hooked. Mission 6 (Command agents) is the ultimate "I need to see what's next" — building agents that manage agents.
- **Complete tutorial.** The player who finishes M1-5 in the demo is a competent player. They can read the Codex. They understand hook wiring. They won't bounce off M6's complexity.
- **Word-of-mouth quality.** A player who's played 5 missions can explain the game convincingly to friends. They're better evangelists than someone who played 1 mission.
- **Replay within demo.** Five missions with replayability (retry with different configurations, improve context utilization, try without a Relay) means the demo can sustain engagement for 3-5+ hours.

### Weaknesses

- **Generous.** Five free missions might be enough for some players. They got the experience. They never convert. "I played it, it was cool, I'm done."
- **Pacing risk.** If Mission 3 or 4 is frustrating, the player has already invested 30 minutes. They may blame the game rather than try harder. The sunk cost works against them here.
- **Maintenance cost.** Five missions of demo parity = significant QA burden with every update.

### Comparable Games

- **Slay the Spire 2 (2026):** Early Access with the first character free, requiring purchase for additional characters. The "first character free" model is structurally similar — full game loop, content-gated expansion.
- **Hades (Epic Games Store exclusive period):** The initial launch generated massive word-of-mouth during a limited-platform period. Generous demos drive evangelism.

#### Journey: Abuela Rosa, 62, Retired Teacher in Davao, Playing with Grandson Tomás, 14

**Context:** Tomás set up the demo on the family tablet after playing it at school. "Lola, try this. You're the AI."

**Minute 0:00 — The Intergenerational Entry**
Rosa holds the tablet. Tomás has already completed Mission 1. He taps Mission 2 for her. "Ok Lola, this time you have RULES. Rules tell the Scout what to do when it sees things." She reads the boot log slowly, carefully. Tomás fidgets but lets her read. "Subsystem: rules engine. Condition → Action. When something is true, do something." She nods. "Like recipes. When the water boils, add the rice."

**Minute 3:00 — The Teaching Moment**
She creates her first rule: "IF enemy in context THEN evade." She asks Tomás: "What if there's no enemy?" He shows her how to add a second rule: "IF no enemy THEN patrol." She drags to reorder them. "The top one goes first? Like in cooking — check the seasoning before you serve?" Tomás nods. She hits EXECUTE. The Scout behaves exactly as her rules dictate. She claps.

**Minute 8:00 — Mission 3: The Hook Connection**
Two units. Rosa names the channel "warning" (she doesn't know that typing a name creates the channel — she discovers it by trying). The Scout warns the Striker. They coordinate. "It's like... the Scout is my eyes, and the Striker is my hands. The warning is me shouting across the kitchen." Every metaphor is domestic, every insight is genuine.

**Minute 25:00 — Mission 5: The Factory**
Rosa has been playing for three evenings now, 20 minutes each, with Tomás watching and sometimes helping. She reaches Mission 5. The factory. She designs a Scout blueprint and a Striker blueprint. She queues them. She watches her factory produce units that follow HER rules, communicate on HER channels. "I made a little kitchen that makes little cooks," she says. Tomás films her reaction for TikTok.

**Minute 26:00 — The Wall**
Mission 6 is locked. Rosa reads the description: "Your agents learn to manage other agents." She looks at Tomás. "An agent that tells other agents what to do? That's a manager. Can we get the full game?" Tomás checks the price. They decide it's worth it. Two generations, one purchase, driven by 5 missions of a browser demo.

**UI Annotations:**
- Tablet layout: 10.2" iPad, landscape, Plan screen split is generous — 500px board, 524px workbench
- Font size: demo detects `prefers-reduced-motion` AND includes a text size toggle (Rosa uses "Large")
- Save indicator: after each mission, a small "Progress saved" toast appears — Rosa needs the assurance

---

## Demo Model F: "The Living Demo" — Rotating Featured Mission

### What It Is

A single-mission demo that changes WEEKLY. Each week, a different mission from the full campaign is featured with appropriate pre-configuration (so late missions don't require prior knowledge). One week it's Mission 3 (hooks introduction), next week it's Mission 7 (Command agents), next week it's Mission 5 (factory). The rotating content creates urgency, return visits, and social media cadence.

### How It Works Mechanically

The demo URL always serves one mission. A header banner reads: "This week: Mission 7 — The Command Layer. 4 days remaining." The mission includes a condensed context briefing (boot log explains just enough to play this mission, even without prior experience). When the week's mission rotates, returning players see: "New mission available! Last week's stats: 14,328 players attempted. 41% succeeded."

### Sensory Description

The banner is a horizontal strip at the top of the page: dark background, countdown timer in tabular figures (4d 07h 23m), mission name in bold, a small archipelago icon highlighting the featured province. When the timer hits zero, the page auto-refreshes to the new mission with a brief transition: the old province dims, a data-flow animation traverses the circuit-board cable to the new province, which brightens to gold.

### Strengths

- **FOMO as conversion driver.** "I missed Mission 7's demo week" → "I should just buy the game so I can play any mission."
- **Social media cadence.** Weekly rotation creates a reason to post: "This week's Robot Uprising demo is the Command agent mission — hardest one yet. Link:" Every week is a marketing event.
- **Showcases breadth.** Over 10 weeks, every mission has been the demo. Players who try multiple weeks see the progression without buying.
- **Community discussion.** "Did anyone beat this week's mission with only Relays?" becomes a recurring social loop.

### Weaknesses

- **No cumulative learning.** A player who tries Mission 7 without having played M1-6 is lost. The condensed briefing can only do so much.
- **Missing the hook.** If a player's first week is a hard mission, they bounce and never return.
- **Engineering overhead.** Each mission needs a standalone-playable condensed briefing. 10 missions × standalone context = significant content work.

### Comparable Games

- **Fortnite limited-time modes:** Rotating content creates social urgency and recurring engagement.
- **Steam Next Fest:** The festival itself is a limited-time demo — urgency drives engagement. Robot Uprising creates a permanent Next Fest.

#### Journey: Zara, 22, Game Design Student in Stockholm

**Context:** Follows @robotuprising on Twitter. Every Monday, they tweet: "This week's free mission: [name]. [link]. Last week's clear rate: X%."

**Minute 0:00 — Week 3**
This week is Mission 3 (hooks). Zara has played Weeks 1 and 2. She opens the link. The condensed boot log: "Your Scout can now SEND signals to your Striker via a named channel. Configure the channel in the hook panel." She already knows context windows and rules from the previous weeks.

**Minute 5:00 — The Configuration**
She wires Scout→"alarm"→Striker. The Striker's rule: "IF 'alarm' data in context THEN engage source." EXECUTE. It works first try — she learned the pattern in Weeks 1 and 2. She now wants to try a more complex wiring: Scout→Relay→Striker with compression. But there's no Relay in this mission (M3 doesn't have one). She wants more. She wishlists.

**Minute 6:00 — The Discussion**
She posts her clear time (12 ticks) on the Robot Uprising Discord's #weekly-mission channel. Someone else cleared it in 9 ticks with a different rule ordering. She goes back and tries again. 10 ticks. The competitive loop is running on a free demo.

**UI Annotations:**
- Weekly banner: persistent 40px strip at top, non-dismissable, countdown + mission name + clear rate
- "#weekly-mission" channel link: small Discord icon next to the banner, one-click join
- Prior week stats: expandable "Last week" card below the banner showing attempt count, clear rate, fastest clear, most popular configuration

---

## The Recommended Pipeline: Model B + D + E Layered

No single demo model is optimal for all audiences. The recommended approach layers three models:

### Layer 1: The Replay Theater (Model D) — Viral Entry

**URL:** `robotuprising.game/watch`

The lowest-friction entry point. Gallery of curated replays. No play required. Perfect for social media links, tweet embeds, TikTok link-in-bio. The viewer sees the game's DEPTH and BEAUTY without committing to play. Every replay card has a "Play free →" button linking to Layer 2.

### Layer 2: The First Three (Model B) — Core Demo

**URL:** `robotuprising.game/play`

Missions 1-3 free in the browser. The full tutorial for context, rules, and hooks. Progress saves locally. The wall at Mission 4 links to Steam. This is the demo that content creators recommend: "Play the first three missions free at robotuprising.game."

### Layer 3: The Persistent Playground (Model E) — Deep Demo

**URL:** Same as Layer 2, gated behind email sign-up

After completing M1-3, a prompt: "Want Missions 4 and 5 free? Sign up for our mailing list." Email capture converts the anonymous demo player into a marketable lead. Missions 4-5 unlock. The wall at Mission 6 (Command agents) drives final conversion.

### The Funnel Numbers (Projected)

| Stage | Conversion | Running Total (per 10,000 social impressions) |
|-------|-----------|-----------------------------------------------|
| Social impression → Click | 3% | 300 |
| Click → Replay watched (Layer 1) | 60% | 180 |
| Replay watched → Play clicked (Layer 1→2) | 25% | 45 |
| Direct play link → Play started (Layer 2) | 70% | (+135 from direct links) ≈ 180 total |
| Play started → M1 completed | 65% | 117 |
| M1 completed → M3 completed | 45% | 53 |
| M3 completed → Email signup (Layer 2→3) | 35% | 19 |
| Email signup → M5 completed | 70% | 13 |
| M5 completed → Steam wishlist | 50% | 7 |
| Steam wishlist → Purchase | 15% | ~1 |

**Per 10,000 social impressions: ~1 purchase, ~7 wishlists, ~19 email leads, ~53 players who completed 3 missions.** These numbers are conservative estimates based on industry benchmarks (Steam Next Fest conversion data, browser game engagement rates). The 19 email leads are potentially more valuable than the immediate purchase — they can be re-engaged at launch, during sales, and during content updates.

### Technical Implementation

- **Shared codebase.** The demo is the same React + Pixi.js + Vite build as the full game, with a configuration flag controlling mission unlock gates. No separate demo repository.
- **Bundle optimization.** The demo build tree-shakes missions 4-10 assets for initial load. Mission 4-5 assets lazy-load when the player signs up.
- **Analytics events.** Track: page load, boot log skip rate, first EXECUTE, mission completion, Inspector engagement time, retry count, email signup, wishlist click. Each event includes `demo_layer` (1/2/3) and `utm_source`.
- **Progressive Web App.** The demo page includes a PWA manifest. On mobile, "Add to Home Screen" creates an app-like icon. Players return to the demo without remembering the URL.
- **Offline support.** Service worker caches the demo for offline play after first load. Players on commutes (subway dead zones) can play Missions 1-3 offline.

---

## New Aspects Discovered

1. **6.11a — Demo-to-full-game save migration:** When a player who completed M1-5 in the browser demo purchases the full game on Steam, their progress should migrate. Design for: localStorage → Steam Cloud sync, account linking flow, handling demo progress that's incompatible with a newer game version. The "thank you for playing the demo" moment as a designed emotional beat.

2. **6.11b — Demo-specific analytics dashboard:** Funnel visualization showing demo drop-off points, average session length, retry rates per mission, Inspector engagement heatmap, conversion attribution (which replay led to which playthrough). This dashboard is the demo's own "Inspector" — the developers applying the game's philosophy to their own business metrics.

3. **6.11c — Embeddable demo widget for gaming press:** A lightweight `<iframe>` embed that gaming press sites can include in review articles. "Play Mission 1 right here in this article." The embed loads in <2 seconds, shows Mission 1, and includes a Steam widget on completion. Design: fixed aspect ratio, responsive width, message-passing API for host page integration.

4. **6.11d — Demo as competitive event infrastructure:** Using the demo's sandbox mode (Model C) for weekly community challenges with fixed configs. "This week's challenge: beat the demo board with 30 metal and no Command agent." Leaderboard on the demo page, refreshes weekly. The demo isn't just acquisition — it's ongoing community infrastructure.

5. **6.11e — QR code physical-to-digital funnel:** QR codes on physical merchandise, convention booths, or poster campaigns that link to the demo with attribution tracking. The QR code links to `robotuprising.game/play?src=poster-{location}`. Each poster's scan rate is trackable. Physical world → browser demo → Steam wishlist is a three-step funnel that bypasses app store discovery entirely.
