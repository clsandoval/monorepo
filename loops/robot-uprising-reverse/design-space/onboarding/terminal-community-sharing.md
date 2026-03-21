# Terminal as Community Sharing Surface: Shareable Query Links, Embed Previews, and Community Knowledge Culture

**Aspect ID:** 5.16c
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding / Multiplayer crossover
**Related aspects:** 5.16 (non-alt-tab embedded document reference UI — Model D CRT Terminal), 5.16a (terminal content authoring pipeline), 5.16b (terminal in Inspector mode — tick-state-aware reference), 5.16d (terminal progressive disclosure across campaign), 7.10 (config necropsy community artifact), 7.03a (Config Code format design), 7.03e (cross-platform sharing infrastructure), 5.17 (hybrid tutorial architecture — Blueprint Codex), 4.23 (replay annotated export), 1.04b (diegetic tutorial documents), 5.00b (search-by-player-vocabulary)

---

## The Mechanic

### The Problem: Knowledge Sharing Without the Terminal

Robot Uprising's terminal houses ~30 core terms and 120-180 cross-cutting interaction descriptions. When a Diamond-tier Gauntlet player posts in the `#config-necropsies` Discord channel explaining why their relay chain failed against scout-rush, they write: "The problem was the compress + EM interaction -- my relays were compressing threat data but the compression itself generated enough EM emission to attract the scouts I was trying to avoid." Three readers understand immediately. Seven others do not know what "compress + EM interaction" means. Those seven tab out to a community wiki, search for "compress," read a fan-written description that may or may not match the in-game terminal's canonical explanation, then tab back to Discord and try to continue reading the necropsy.

This is a knowledge-sharing bottleneck. The canonical reference exists inside the game. The conversation exists outside the game. There is no bridge.

### The Solution: Terminal Entries as First-Class URLs

Every terminal entry -- every term definition, every cross-cutting interaction description, every query result -- generates a unique, shareable URL. The URL opens the terminal to that exact entry, either inside the game (if the player has it installed) or in a web-based terminal viewer (if they don't). The terminal becomes a **linkable knowledge surface**: a reference system that participates in conversations happening outside the game.

### URL Format

Terminal URLs follow a human-readable slug pattern rooted in the game's domain:

**Single term:**
```
robotuprising.game/terminal/compress
robotuprising.game/terminal/eviction
robotuprising.game/terminal/hooks
```

**Cross-cutting interaction (ordered pair):**
```
robotuprising.game/terminal/compress+em
robotuprising.game/terminal/eviction+amplify
robotuprising.game/terminal/hooks+filter
```

The `+` delimiter is intentional -- it reads naturally in conversation: "check out the compress+em interaction." The URL is short enough to paste in Twitch chat. The slugs match the in-game term names, lowercased and hyphenated for multi-word terms (`context-window`, `eviction-priority`, `hook-chaining`).

**Query results (search state):**
```
robotuprising.game/terminal?q=relay+latency
robotuprising.game/terminal?q=why+compress+loud
```

Query URLs encode the search string, opening the terminal to the search results page. This captures the "I searched for this and found something useful" moment -- the link shares not just a result but the act of searching.

**Inspector-grounded context (tick-state-aware):**
```
robotuprising.game/terminal/compress+em?tick=22&unit=RELAY-C&match=a7f3b2
```

When shared from Inspector mode (5.16b), the URL includes tick state, inspected unit, and match ID. Opening this link in-game loads the terminal entry with the match-specific Tick Marginalia visible -- the canonical definition of compress+EM plus "AT TICK 22, RELAY-C: compress generated 3.2 EM units, attracting SCOUT-7 from 4 tiles away." This is the highest-fidelity sharing format: canonical knowledge grounded in a specific replay moment.

### How Shared Links Open

**In-game (installed player):** Clicking a terminal URL activates a protocol handler (`uprising://terminal/compress+em`). The game opens to the workbench with the terminal panel slid out, scrolled to the referenced entry. If the URL includes Inspector context, the game offers to load the referenced match replay. A soft CRT power-on flicker (200ms green phosphor bloom) accompanies the terminal opening -- the same animation as the `?` key shortcut, maintaining visual consistency.

**Web viewer (non-installed or browser context):** The URL resolves to a standalone web page that renders the terminal entry in the game's CRT aesthetic -- charcoal background, amber monospace text, scan-line shimmer, the full diegetic treatment. The web viewer is read-only but complete: term definition, micro-scenario animation (rendered as a looping GIF or short WebM), Related entries in a right sidebar, and cross-cutting interaction descriptions. A persistent banner at the bottom reads: `> TERMINAL ACCESS: READ-ONLY | FULL INTERACTIVE MODE AVAILABLE IN-GAME` with platform-appropriate install links. The web viewer IS the demo acquisition funnel (7.03e) for the reference system.

### Embed Previews for Discord, Slack, Reddit

When a terminal URL is pasted into Discord, Slack, Reddit, or any platform that renders OpenGraph/oEmbed previews, the link unfolds into a rich preview card:

**Visual structure:**
- **Title:** `ROBOT UPRISING TERMINAL: Compress + EM Emission` (or `ROBOT UPRISING TERMINAL: Eviction`)
- **Description:** The first two sentences of the canonical entry, rendered in plain text. For interaction entries: the one-sentence mechanical summary followed by the strategic implication. Example: *"Compress reduces buffer slot count but generates EM emission proportional to compression ratio. Higher compression = louder signal = easier for enemy scouts to detect your relay position."*
- **Thumbnail:** A 300x200px still frame from the entry's micro-scenario animation -- the moment of peak visual interest. For compress+EM: the relay unit with visible compression animation and the amber EM ripple expanding outward. The thumbnail uses the game's art style, not a generic icon.
- **Footer:** `robotuprising.game/terminal | 30 core terms | 180+ interactions`

The embed preview is the **first contact surface** for players who haven't opened the link yet. It must convey enough information to be useful in the conversation (answering "what is compress+EM?") while creating enough curiosity to click through. The micro-scenario still frame is the hook -- it shows something happening that the preview text alone cannot explain.

**Discord-specific:** The embed uses Discord's rich embed format with the game's dark charcoal as the embed sidebar color (`#1a1d1a`). The thumbnail renders at Discord's standard 80x80px avatar size in compact mode and full 300x200px in expanded mode.

**Reddit-specific:** When posted as a link, Reddit's card preview shows the micro-scenario still frame as the primary image, with the terminal entry title as the card headline. This makes terminal links visually distinct from generic URL posts in subreddit feeds.

### Integration with Config Necropsy Culture (7.10)

The terminal link system transforms necropsy posts from opaque expert monologues into hyperlinked knowledge graphs. A necropsy that previously read:

> "The problem was compress + EM. My relays were too loud. I switched to filter-first architecture and reduced EM by 60%."

Now reads:

> "The problem was [compress + EM](robotuprising.game/terminal/compress+em). My relays were too loud. I switched to [filter](robotuprising.game/terminal/filter)-first architecture and reduced EM by 60%."

Every technical term becomes a portal to canonical reference material. New players reading necropsy posts can hover any linked term to see the embed preview, click through for the full entry, and return to the necropsy with understanding. The necropsy author writes for experts; the links make it accessible to everyone.

**The Changelog export (7.10 Model 1)** auto-generates terminal links for every skill, hook trigger, and channel type referenced in the config diff. When a Changelog shows "added Specialist with hack skill," the word "hack" is a terminal link. The annotation text supports Markdown-style terminal links: `[compress+em]` auto-expands to the full terminal URL.

**The Annotated Replay (7.10 Model 2)** embeds terminal links in annotation pins. When a player drops a pin at tick 22 and writes "this is where compress killed me," the word "compress" auto-links to the terminal entry. Viewers who open the annotation can click through to the terminal without leaving the replay viewer.

### Community-Contributed Annotations

The terminal's canonical entries are authored by the development team (per 5.16a pipeline). But the community sharing surface introduces a second layer: **community notes**. These are not wiki-style edits to canonical text -- they are appended annotations visible below the official entry, marked with a distinct visual treatment.

**How it works:** On the web viewer, each terminal entry has a "Community Notes" section below the canonical content. Authenticated players (linked to their in-game identity) can submit notes of up to 280 characters. Notes are upvoted by other players. The top 3-5 notes by upvote count appear on the entry page; the rest are accessible via "Show all notes."

**Visual treatment:** Community notes render in a different phosphor color than the canonical text -- teal-green against the amber of official content. Each note shows the author's display name, their Gauntlet tier badge (if applicable), and a small upvote count. The visual separation is critical: the canonical terminal content is authoritative and consistent; community notes are supplementary and social.

**What community notes contain:** Strategic tips ("compress+EM is worse on open terrain -- no walls to block emission"), edge case documentation ("at compression ratio 4+, EM spike is instant -- enemy scouts react same tick"), meta-game observations ("most Diamond players run filter-first specifically to counter this interaction"), and teaching moments ("if you're confused by this, try Mission 7 -- it's designed to teach exactly this interaction").

**Moderation:** Notes that contradict canonical mechanics are flagged. Notes that reference specific patches or balance changes are tagged with the game version. Stale notes (referencing outdated mechanics) are auto-dimmed after a balance patch touches the relevant terms.

---

## Player Journeys

#### Journey: Nessa, 26, Systems Engineer, Diamond Gauntlet Regular

**Context:** Nessa has been playing Robot Uprising for four months. She runs a relay-chain architecture that reached Diamond tier three weeks ago. She's active in the game's Discord, primarily in `#config-necropsies` and `#gauntlet-strategy`. Tonight she lost a match that confuses her -- her relay chain should have outperformed the opponent's scout-rush, but her relays went dark at tick 18.

**Minute 0:00 -- The Inspector Discovery**
Nessa opens the Inspector and scrubs to tick 18. RELAY-B's buffer is full. She selects RELAY-B and opens the terminal with `?`. The Grounding Strip reads `TICK 18 | RELAY-B INSPECTED | BUFFER 12/12`. She types "eviction" into the search bar. The canonical eviction entry loads -- amber text describing FIFO policy, LRU alternatives, priority overrides. Below the canonical text, the Tick Marginalia appears in warm amber: `AT TICK 18, RELAY-B: eviction occurred 6 times in last 4 ticks. Evicted entries: 4 SCOUT-A threat reports (age 1-2t), 2 RELAY-A compressed summaries (age 0t). NOTE: compressed summaries were evicted immediately upon arrival -- eviction priority ranked them below existing threat reports despite zero age.`

Nessa stares. The compressed summaries -- the data she needed -- were being evicted the moment they arrived because her eviction priority was wrong. She clicks the "Related" link for `eviction+compress` in the right column. The cross-cutting interaction entry loads: "When compress outputs a summary signal, the summary inherits a default priority equal to the average priority of its source signals. If the receiving unit's buffer contains high-priority raw signals, the compressed summary may be evicted immediately despite being newer and more information-dense."

**Minute 2:00 -- Sharing the Discovery**
Nessa clicks the share icon on the `eviction+compress` entry. A share modal appears with the URL: `robotuprising.game/terminal/eviction+compress?tick=18&unit=RELAY-B&match=k9d2f7`. She copies it and pastes into the `#gauntlet-strategy` channel with: "PSA: if you run relay chains with compress, check your eviction priorities. Compressed summaries get default priority from source average, which means they can get evicted instantly if your buffer is full of high-priority raw signals. [link]"

In Discord, the link unfolds into the embed preview: thumbnail showing a relay unit with an amber-highlighted buffer where a green compressed-summary entry dissolves upon arrival, replaced by a red "EVICTED" flash. Title: `ROBOT UPRISING TERMINAL: Eviction + Compress`. Description: "When compress outputs a summary signal, the summary inherits a default priority equal to the average priority of its source signals..."

**Minute 5:00 -- Community Response**
Three replies within ten minutes. One player clicks through to the web viewer and reads the full entry, including the Tick Marginalia from Nessa's specific match. They reply: "The tick-specific data is wild -- your compressed summaries were literally arriving and dying in the same tick." A second player adds a community note to the `eviction+compress` entry: "Fix: set eviction priority to 'COMPRESSED > RAW' on relay units. This preserves information-dense signals at the cost of losing raw scout reports faster." The note appears in teal-green below the canonical text, tagged with the author's Diamond badge.

**Minute 8:00 -- The Link Cascade**
Nessa's post gets linked in two other Discord threads. A content creator bookmarks the terminal URL for a video they're making about relay architecture. The community note gets 14 upvotes by morning and becomes the top community annotation on the `eviction+compress` entry. Nessa opens the terminal in-game the next day and sees the note she inspired -- teal-green text with a Diamond badge, visible to every future player who reads this interaction entry.

**Sound:** The share modal's appearance is accompanied by a quiet ratcheting click -- the sound of a mechanical typewriter carriage returning. The URL generates with a brief burst of dot-matrix printer noise, 300ms. The modal dismisses with the same CRT power-down hum as the terminal close.

**Color:** The share modal is charcoal with amber text, matching the terminal. The URL itself renders in cyan -- the player-action color -- distinguishing it from the amber reference text. The "Copy" button flashes green on click, then settles back to charcoal.

---

#### Journey: Marcus, 16, High School Student, Just Finished Campaign

**Context:** Marcus completed Mission 10 yesterday. He's browsing the game's subreddit during lunch, reading necropsy posts from Gauntlet players. He understands the basic terms but hasn't internalized the cross-cutting interactions yet -- he got through the campaign knowing what each skill does individually but not how they combine at a competitive level. He encounters a post titled "Why your Command agent is actually making you worse."

**Minute 0:00 -- Encountering a Terminal Link**
The post's second paragraph contains a terminal link: "[hooks+command](robotuprising.game/terminal/hooks+command)." Marcus has never seen a terminal link in a Reddit post before. On Reddit's card layout, the link shows an inline preview: the micro-scenario thumbnail showing a Command agent emitting a hook signal that cascades through three subordinate units. The preview description reads: "When a Command agent triggers a hook, the hook's payload inherits Command's priority level, which may override subordinate units' local decision-making..."

Marcus clicks. His browser opens the web terminal viewer. The page loads with a brief CRT power-on animation -- the charcoal background brightens from black over 400ms, amber text materializes line by line with a typewriter cascade, and a single horizontal scan line drifts upward once before settling. The entry fills the screen: canonical definition of the hooks+command interaction, a looping micro-scenario showing the priority override cascade, the Related sidebar listing `command+rules`, `command+context-window`, `hooks+filter`, and four other cross-cutting entries.

**Minute 1:00 -- The Rabbit Hole**
Marcus reads the canonical entry. He understands it but wants to see how it connects to what the Reddit post is describing. He clicks `command+context-window` in the Related sidebar. A new entry loads -- same CRT aesthetic, new content: "Command agents maintain their own context window, separate from subordinate units. When a Command agent's buffer is full, its hook signals to subordinates may contain stale data without the Command agent being aware of the staleness. This is the 'Command Fog' problem..."

Marcus clicks `command+eviction`. Then `eviction+compress`. Each click loads another entry, each entry has a Related sidebar with more links. He has been on the web viewer for eight minutes. He has read six entries. He did not plan to study interaction mechanics during lunch. The terminal's link structure pulled him through a connected knowledge graph, one curiosity at a time.

**Minute 10:00 -- Return to Reddit**
Marcus goes back to the Reddit post. He now understands the argument: the poster is claiming that Command agents create information bottlenecks because their hooks override subordinate judgment. Marcus disagrees -- he thinks the problem is eviction priority, not Command itself. He replies with two terminal links: "I think the real issue is [eviction+command](robotuprising.game/terminal/eviction+command), not hooks. If Command's buffer runs FIFO, it evicts the oldest signals first, which are often the most strategically important. Try [eviction-priority](robotuprising.game/terminal/eviction-priority) and set Command to LRU instead."

His reply contains two embed previews, both rendering with micro-scenario thumbnails. The post looks professional -- terminal links give a 16-year-old's Reddit comment the same visual authority as a veteran's analysis.

**Sound:** The web viewer's CRT power-on plays through the browser's audio -- a brief capacitor whine followed by the familiar green-phosphor hum. Each entry transition plays a soft page-turn sound, like a microfilm reader advancing one frame. Marcus doesn't notice these sounds consciously; they register as "this is the terminal" at a subliminal level.

**Color:** The web viewer's charcoal background is slightly lighter than the in-game terminal (to account for browser rendering differences), but the amber text and teal community notes are color-matched. The Related sidebar entries glow faintly cyan when hovered, inviting the click.

---

#### Journey: Dalisay, 34, Content Creator, 12K YouTube Subscribers

**Context:** Dalisay makes Robot Uprising tutorial videos. Her most popular series is "Interaction of the Week" where she picks a cross-cutting interaction, explains it, and shows a replay where it matters. She's filming this week's episode on `filter+hooks` -- how filter rules can accidentally suppress hook signals that the player intended to forward.

**Minute 0:00 -- Preparing the Video**
Dalisay opens the terminal in Plan mode and navigates to `filter+hooks`. She reads the canonical entry, noting the micro-scenario: a Relay unit with filter rules that strip a hook signal because the hook payload matches the filter's rejection criteria. The animation loops, showing the hook signal arriving, passing through the filter evaluation, and dissolving with a red rejection flash. She screen-records this micro-scenario for her video's explainer segment.

She clicks the share icon and copies the URL: `robotuprising.game/terminal/filter+hooks`. She pastes it into her video description and pins it in her Discord server's `#this-weeks-interaction` channel. The Discord embed preview shows the micro-scenario thumbnail -- the filter rejection flash frozen at peak intensity, a striking red-on-amber image that works as a video thumbnail too.

**Minute 5:00 -- Loading the Inspector Context**
For the "real match" segment of her video, Dalisay loads a Gauntlet replay where a subscriber's config failed because of exactly this interaction. She opens the terminal in Inspector mode, navigates to `filter+hooks`, and the Tick Marginalia loads: `AT TICK 11, RELAY-A: filter rule "reject noise" evaluated hook signal from SCOUT-B on channel 'threat-broadcast.' Signal matched rejection criteria (payload contained terrain data, classified as noise by filter). Hook signal REJECTED. Consequence: STRIKER-C never received threat update.`

She copies the Inspector-grounded URL: `robotuprising.game/terminal/filter+hooks?tick=11&unit=RELAY-A&match=m4p8q1`. This becomes the "deep dive" link in her video description -- viewers can open this specific match moment in their own game and see exactly what happened.

**Minute 10:00 -- Community Notes as Content**
Before filming, Dalisay scrolls down to the community notes on `filter+hooks`. The top note reads: "Easy fix: add an exception rule above your filter for hook-origin signals. 'IF source=hook THEN forward' before 'IF type=noise THEN reject.'" She reads this note aloud in her video, crediting the community contributor by display name and tier badge. The note's upvote count will spike after the video publishes -- this is the flywheel between content creation and community annotation.

**Minute 15:00 -- The Video Goes Live**
Her video description contains three terminal links: the canonical `filter+hooks` entry, the Inspector-grounded replay moment, and the `hooks` standalone entry for viewers who don't know what hooks are. Each link generates a rich embed preview when shared on social media. A viewer in Thailand who doesn't own the game clicks the `filter+hooks` link, reads the web viewer entry, watches the micro-scenario loop, and adds the game to their Steam wishlist. The terminal link was the acquisition funnel.

**Sound:** During Dalisay's screen recording, the terminal's ambient CRT hum is audible in the capture. She leaves it in -- her viewers associate that hum with "learning something." The micro-scenario's animation plays with its accompanying sound design: a soft filtering sweep (low-pass resonance) followed by the sharp rejection click. She uses this audio as a stinger in her video intro.

**Color:** In her video, the terminal's amber-on-charcoal renders with high contrast against the game's other UI panels. The Tick Marginalia's warmer amber stands out from the canonical text's standard amber -- a distinction her regular viewers have learned to recognize as "this part is about a specific match."

---

## Strengths

**1. Closes the Knowledge-Context Gap.** The game's canonical reference system participates directly in community conversations. Players never need to paraphrase or re-explain mechanics -- they link to the source. This reduces misinformation, which plagues games with complex interaction systems where community wikis diverge from actual mechanics.

**2. Lowers the Expertise Barrier for Necropsy Consumption.** Config necropsies (7.10) are written by experts for experts. Terminal links make them accessible to intermediates and newcomers without requiring the author to simplify their analysis. The links carry the pedagogical burden.

**3. Web Viewer as Acquisition Funnel.** Every terminal link shared on Discord, Reddit, YouTube, or Twitter is a touchpoint with the game's aesthetic and depth. Non-players see the CRT terminal, read a micro-scenario, absorb the game's vocabulary, and encounter the install prompt. The reference system markets the game's intellectual depth without a marketing team.

**4. Community Notes Create a Living Reference.** The canonical entries are finite -- the team can't anticipate every strategic insight. Community notes extend the reference system with emergent meta-game knowledge, edge cases, and teaching tips that only competitive play reveals. The notes are socially curated (upvotes) and visually distinct (teal vs. amber), maintaining authority hierarchy.

**5. Inspector-Grounded Links Are Uniquely Powerful.** No comparable game offers "here's the reference definition of this mechanic, grounded in this specific moment of this specific match." The tick-state URL transforms abstract knowledge into concrete diagnostic evidence. This is the bridge between "understanding a concept" and "applying it to a real failure."

---

## Weaknesses

**1. URL Rot Risk.** If term names change across balance patches (e.g., "compress" is renamed to "condense"), all existing terminal links break. Mitigation: maintain a slug redirect table where old names permanently redirect to current names. Adds maintenance surface.

**2. Community Notes Moderation Burden.** Upvote-based curation works for popular entries but fails for niche interactions with low traffic. Stale or incorrect notes on low-traffic entries may persist without correction. Automated staleness detection (flagging notes that reference outdated patch mechanics) helps but doesn't eliminate the problem.

**3. Web Viewer Development Cost.** A standalone web terminal viewer that faithfully reproduces the in-game CRT aesthetic, renders micro-scenario animations, and handles OpenGraph metadata is a significant engineering investment. The no-backend constraint (7.03e) means the viewer must be a static site or serverless function, limiting dynamic features.

**4. Inspector-Grounded URLs Require Match Persistence.** If replay data is stored locally (no server), tick-state URLs only work for the match author and anyone they've explicitly shared the replay file with. The URL becomes a dangling reference for viewers who don't have the match data. Mitigation: the web viewer renders the canonical entry without Tick Marginalia when match data is unavailable, with a note: `> MATCH DATA NOT AVAILABLE -- SHOWING CANONICAL ENTRY ONLY`.

**5. Embed Preview Freshness.** Discord and Reddit cache OpenGraph metadata aggressively. If a terminal entry's content is updated (canonical text change, new top community note), the embed preview may show stale information for hours or days. This is a platform limitation, not a design flaw, but it affects user trust.

---

## Interaction Effects

**With Config Necropsy Culture (7.10):** Terminal links are the connective tissue of necropsy posts. The Changelog export auto-generates terminal links for every referenced mechanic. The Annotated Replay embeds terminal links in annotation pins. Community notes on terminal entries become a secondary necropsy surface -- strategic insights that don't belong to any single match but emerge from the community's collective diagnostic experience. The necropsy and the terminal reinforce each other: necropsies drive traffic to terminal entries, terminal entries provide the vocabulary for necropsies.

**With Blueprint Codex (5.17):** The Blueprint Codex is the in-game card collection screen; the terminal is the in-workbench reference panel. Terminal links reference the terminal's CRT entries, not the Codex cards. But the web viewer can cross-link to Codex card views where relevant, creating a two-tier reference architecture: terminal for text-based mechanics lookup, Codex for visual card browsing. Shared terminal links may include a "View in Codex" button that opens the corresponding Codex card in-game.

**With Replay Exports (4.23):** Annotated replay exports already contain config state and timeline data. Terminal links extend this: when a replay export is opened in the web viewer, any mechanic terms in the annotation text auto-link to terminal entries. A replay export becomes a hyperlinked document, not just a video file. This is the "director's commentary with footnotes" model.

**With Community Wikis:** Terminal links compete with external wikis for authority. The design intention is that terminal links ARE the wiki -- the canonical source, always in sync with the game's actual mechanics, with community notes providing the social layer wikis offer. External wikis may still emerge for meta-analysis (tier lists, matchup charts, historical patch notes) that the terminal doesn't cover. The terminal's community notes should absorb the most useful wiki-type content through organic migration.

---

## Comparable Games

**Path of Exile Build Links (pathofexile.com/passive-skill-tree):** PoE's passive skill tree generates shareable URLs encoding the entire tree allocation. These links are the backbone of PoE's build-sharing culture -- every build guide, every Reddit post, every forum discussion includes a tree link. The link opens an interactive tree viewer in-browser, identical to the in-game tree. Robot Uprising's terminal links serve the same function for knowledge rather than builds: "here's the mechanic interaction I'm referencing" instead of "here's my passive tree." PoE's lesson: the URL must be short enough to paste in chat, the viewer must be faithful to the in-game experience, and the link must be the default way the community references the system.

**MTG Scryfall Card Links (scryfall.com/card/...):** Scryfall is the de facto card reference for Magic: The Gathering. Every card has a permanent URL. Discord bots auto-expand card names into Scryfall embeds with card image, oracle text, and rulings. The community convention of [[card name]] triggering a bot lookup is so embedded that MTG conversations are essentially hyperlinked documents. Robot Uprising should aspire to the same convention: a Discord bot that auto-expands `[[compress+em]]` into a terminal embed preview. Scryfall's lesson: the community will adopt the link system only if it's lower friction than explaining the mechanic manually.

**Steam Guide System (steamcommunity.com/sharedfiles):** Steam's guide system lets players publish long-form strategy documents with embedded images, formatted text, and community ratings. Guides are discoverable in-game and in-browser. Robot Uprising's community notes are a micro version of Steam guides -- short, focused annotations on specific entries rather than full-length documents. Steam's lesson: community-authored content needs curation (ratings, featured selections) to surface quality over noise. The upvote system on community notes serves this function.

**Factorio Blueprint Strings:** Factorio's blueprint string system transformed the game's community. Players share complete factory designs as copy-pasteable strings. The string opens in-game as a placeable blueprint. Robot Uprising's Config Code (7.03a) already fills the blueprint-string role for configs. Terminal links fill a different role: they share *knowledge about mechanics*, not *specific configurations*. A Factorio player pastes a blueprint string; a Robot Uprising player pastes both a Config Code (here's my build) and terminal links (here's why it works). The two complement each other.

**Factorio Wiki (wiki.factorio.com):** Factorio's official wiki is the primary reference for mechanics. It's external to the game, maintained by the community with developer oversight, and heavily linked in subreddit posts and forum discussions. Robot Uprising's terminal link system aims to make the external wiki unnecessary for core mechanics by embedding the reference inside the game and making it linkable. The web viewer IS the wiki, but canonical and always current.

---

## Sensory Descriptions

### Generating a Share Link

You've found the entry that explains your loss. The `eviction+compress` interaction, rendered in amber monospace on the terminal's charcoal CRT. The micro-scenario loops in the center column -- a relay's buffer visualized as twelve horizontal slots, a compressed summary arriving in green, sliding into slot 12, then immediately dissolving as the eviction policy ejects it. The red EVICTED flash pulses once, twice, in sync with the scan-line's upward drift.

You press the share icon -- a small transmission tower in the terminal's top-right corner, rendered in the same amber as the text. A modal slides down from the icon's position with a mechanical ratcheting sound, like a telegram machine engaging. The URL materializes character by character in cyan monospace: `r-o-b-o-t-u-p-r-i-s-i-n-g-.-g-a-m-e-/-t-e-r-m-i-n-a-l-/-e-v-i-c-t-i-o-n-+-c-o-m-p-r-e-s-s`. A cursor blinks at the end. Below: three buttons -- COPY (clipboard icon), QR (grid icon), EMBED PREVIEW (eye icon). You click COPY. The button flashes green for 400ms, the URL text briefly brightens to white, and a single crisp dot-matrix printing sound plays -- tktktktktk -- 200ms of mechanical satisfaction. The link is on your clipboard. The knowledge is portable.

**Sound:** The share modal's ratcheting entry (300ms, metallic, rhythmic). The URL typewriter cascade (50ms per character, soft key-strike). The copy confirmation (200ms dot-matrix burst). The modal dismiss (reverse ratchet, 200ms, softer than entry).

**Color:** Modal background matches terminal charcoal. URL in cyan (player-action color). Buttons in amber outline, green on confirm. The eye icon for EMBED PREVIEW pulses once in amber when hovered, showing a miniature preview of how the embed will look in Discord -- a tooltip-within-a-tooltip.

### Reading a Shared Link in Discord

You're scrolling the `#config-necropsies` channel. A post from a player you follow: "Lost three straight to signal-flood compositions. Turns out my filter rules were catching hook signals too. See [link]." Below the text, Discord renders the embed: a dark card with the game's charcoal background, amber title text reading `ROBOT UPRISING TERMINAL: Filter + Hooks`, and a thumbnail showing a relay unit mid-rejection-flash -- the hook signal frozen in the instant of dissolution, a red X overlaid on the amber hook icon. The description text is clean and specific: "Filter rules evaluate all incoming signals, including hook payloads. If a hook's payload matches a filter rejection criterion, the hook signal is silently dropped..."

You click. Your browser opens. The CRT power-on animation plays -- capacitor whine rising in pitch over 400ms, green phosphor bloom expanding from center, scan-line sweeping upward once, then settling into the steady ambient hum. The entry fills the screen. You read. You understand. You click Related: `hooks+channel-naming`. Another entry loads with a microfilm-advance page-turn sound. You're three entries deep before you realize you've been reading for five minutes. The scan-line still drifts. The hum still holds.

**Sound:** The browser CRT power-on (muffled compared to in-game, respecting browser audio conventions -- 60% volume). The ambient hum (continuous, barely audible, establishes presence). The page-turn between entries (single frame-advance click, clean, non-intrusive). If you've muted the browser tab, complete silence -- the visual CRT aesthetic carries the experience alone.

**Color:** The web viewer matches the in-game terminal within 2% color accuracy. Amber text on charcoal. Teal community notes. Cyan for interactive elements (Related links, navigation). The browser's default white scrollbar is overridden with a thin charcoal-on-dark track, maintaining the terminal aesthetic to the viewport edge.

---

## Newly Discovered Aspects for the Frontier

1. **5.16c-i -- Discord bot auto-expansion of terminal references:** A bot that converts `[[compress+em]]` syntax in Discord messages into terminal embed previews automatically; community adoption mechanics; bot permission and channel configuration; rate limiting for large servers
2. **5.16c-ii -- Terminal link analytics as content authoring signal:** Tracking which terminal entries receive the most external link traffic to prioritize authoring effort (5.16a); high-traffic entries get full voiced treatment first; low-traffic entries remain as stubs; traffic patterns reveal which interactions confuse players most
3. **5.16c-iii -- Community note moderation and reputation system:** Detailed design of the upvote/downvote/flag system for community annotations; tier-badge-weighted voting (Diamond votes count more on competitive entries); developer-pinned "verified" notes; note decay over time as meta evolves
4. **5.16c-iv -- Terminal link integration in streaming overlays:** OBS/Streamlabs plugin that renders the current terminal entry as a transparent overlay on stream; streamer opens terminal, overlay shows the entry to viewers in real-time; viewers can click a chatbot link to open the same entry; the stream becomes a live reference session
5. **5.16c-v -- Offline terminal link resolution:** How terminal URLs behave when the web viewer is unreachable (CDN outage, maintenance); graceful degradation to plain-text preview in Discord embed; cached viewer pages via service worker for recently visited entries; the "SIGNAL LOST" diegetic error state as a designed offline experience

---

## Sources

- Path of Exile passive tree sharing: [pathofexile.com/passive-skill-tree](https://www.pathofexile.com/passive-skill-tree) — URL-encoded full tree state, community standard for build sharing since 2013
- Scryfall card database: [scryfall.com](https://scryfall.com/) — permanent card URLs, Discord bot integration via Scryfall syntax, OpenGraph card image embeds; "The way Magic players reference cards" — community convention analysis
- Steam Workshop and Guide system: [Steamworks Documentation — Workshop](https://partner.steamgames.com/doc/features/workshop) — community content publishing, in-game and web discovery, rating systems
- Factorio Blueprint String format: [Factorio Wiki — Blueprint string format](https://wiki.factorio.com/Blueprint_string_format) — version byte + JSON + zlib + base64; community sharing ecosystem built on copy-paste strings
- Discord OpenGraph embed specification: [Discord Developer Documentation — Embeds](https://discord.com/developers/docs/resources/message#embed-object) — rich embed format, thumbnail rendering, metadata caching behavior
- Factorio Wiki as community knowledge infrastructure: [wiki.factorio.com](https://wiki.factorio.com/) — developer-supported community wiki, primary reference for mechanics, heavily linked in r/factorio
- oEmbed specification: [oembed.com](https://oembed.com/) — standard for URL preview embeds across platforms
