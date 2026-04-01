# 3.16 — Copy/Paste/Template: Duplicating, Saving, and Sharing Agent Configurations

## Overview

**Aspect:** Config management UX — duplication, templating, import/export, and community sharing of blueprints.

**Wave:** Mid-production (not needed for first playable, but critical before Mission 5 when blueprint count escalates).

**Dependencies:** Workbench layout (3.14), blueprint editor (skills, rules, hooks, context config per blueprint), production queue, slot limits per unit type.

---

By Mission 6, a player managing a scout, two strikers, a relay, a specialist, and a command agent has configured six blueprints — each with skills toggled, rules written, hooks wired, and context config set. They've found patterns: "every scout I build has patrol + evade, hook on ON_THREAT_ENTER to channel 'alarm', context config listening on 'orders'." Typing this out for the fourth scout is not mastery. It's data entry.

The question is not whether players need duplication tools — they do, by Mission 5 at the latest — but how deep the system goes. A simple clipboard is one thing. A named template library is another. Exportable build strings that travel through Discord and Reddit are something else entirely. Each layer multiplies both utility and complexity.

This is also the aspect where Robot Uprising's meta-game lives or dies. If players can't share builds, the community stays small. If they can share builds trivially, the community becomes a hive of theory-crafters, tier lists, and "I beat Mission 8 with 3 units — here's the code" posts.

---

## The Design Question

**What config management tools does the player have, and how far does the sharing system extend?**

The spectrum runs from "nothing, configure everything manually every time" to "full community marketplace with searchable, rated, importable blueprints." Each point on the spectrum trades friction against depth of engagement.

---

## Mechanical Specification

### Option A: The Clipboard (Minimal)

**How it works:** Right-click any blueprint in the workbench. A context menu offers "Copy Blueprint" and "Paste Blueprint." Copy captures the entire blueprint state — skills, rules, hooks, context config — into an invisible clipboard. Paste overwrites the target blueprint with the clipboard contents. That's it. No persistence. No naming. Close the game and the clipboard is gone.

**What it feels like:** The player right-clicks Scout-A's blueprint tab. A small menu appears with two items: "Copy Blueprint" and a grayed-out "Paste Blueprint" (nothing copied yet). They click Copy. A brief flash — the tab border pulses white for 300ms, and a tiny clipboard icon appears in the top-right corner of the workbench, glowing softly to indicate "something is held." They right-click Scout-B's tab, click Paste, and the blueprint contents slide in — skills toggles snap into position, rules text populates line by line (fast, 50ms per line, but visible), hooks wire themselves with a soft click-click-click, and context config checkboxes tick on. The whole paste animation takes about 800ms. The clipboard icon remains — they can paste again.

**Scope of copy:** Full blueprint. No partial selection (can't copy just the hooks, or just the rules). The clipboard holds one blueprint at a time.

**Cross-unit-type behavior:** Pasting a relay blueprint onto a scout silently drops incompatible elements. Skills the scout can't use (compress, amplify) are ignored. Hooks referencing relay-only triggers are stripped. A small warning toast appears: "3 elements skipped (incompatible with Scout chassis)." The surviving elements paste normally.

**Strengths:**
- Zero UI cost. No new screens, no new menus beyond two context-menu items.
- Immediately discoverable by any player who right-clicks anything.
- Solves the most common pain point: "I want this scout to behave like that scout."
- No persistence means no management burden — no template library to organize, no naming decisions.

**Weaknesses:**
- No persistence. Can't save a "standard scout config" across sessions or missions.
- No partial copy — can't grab just the hook wiring from one blueprint and apply it to another.
- No sharing. The clipboard is local and ephemeral.
- Doesn't help with the deeper problem: building a library of known-good configs over a 10-mission campaign.

**The ceiling:** Useful through Mission 7. By Mission 8, players are designing multi-agent architectures where the relationships between blueprints matter more than individual blueprints. A clipboard that copies one blueprint at a time can't capture "these three blueprints form a relay network."

---

### Option B: The Template Library (Named, Persistent, Local)

**How it works:** The workbench has a new panel: the **Schematic Vault**. It's a scrollable list on the left edge of the workbench, collapsed by default (just a thin vertical strip with a small vault icon). Clicking the vault icon slides it open, revealing a list of saved templates grouped by unit type.

**Saving a template:** Right-click a blueprint tab, select "Save to Vault." A naming modal appears — a narrow text field pre-populated with a generated name based on the blueprint's contents: "Scout — patrol, evade, alarm hook" or "Relay — compress, filter, intel-to-command." The player can edit the name or accept the default. Pressing Enter saves. The template appears in the vault with the unit type icon, the name, and a small preview showing skill icons and hook count.

**Loading a template:** Drag a template from the vault onto a blueprint tab. The paste animation plays (same as Option A). Alternatively, right-click a blueprint tab and select "Load from Vault," which opens the vault panel with a filter.

**Template contents:** Same as clipboard — full blueprint state. But templates are named, persistent across sessions, and can be deleted or renamed.

**The vault's visual language:** Each template entry is a horizontal card, 40px tall, showing:
- Unit type icon (left, 24px, color-coded: blue for scout, red for striker, green for relay, purple for specialist, gold for command)
- Template name (truncated to 25 characters, tooltip shows full name)
- Skill icons (small, 12px, showing which skills are active)
- Hook count badge (e.g., "4H" for 4 hooks configured)
- A small "..." menu for rename/delete/duplicate

The vault scrolls vertically. Templates are sorted by unit type, then by last-used date within each type. A search bar at the top filters by name.

**Cross-mission persistence:** Templates are global — saved in Mission 3, available in Mission 10 and in Gauntlet. This is critical because players develop standard configs early and refine them later.

**Strengths:**
- Solves the persistence problem. "My standard scout" exists as a named entity.
- The naming step forces reflection. Naming a template is a small act of design — "what IS this config, really?"
- The vault provides a visual overview of the player's design vocabulary. Seeing 12 named templates is a form of mastery feedback.
- Templates become part of the player's identity. "I always start with my 'Perimeter Scout' and my 'Signal Relay' — they're my core."
- Low-cost addition to the workbench — collapsed by default, never in the way.

**Weaknesses:**
- Management burden. After 10 missions, a player might have 30+ templates. Scrolling through them is its own UX problem.
- No versioning. If the player updates their "Perimeter Scout" template, the old version is gone.
- No sharing. This is still local-only.
- Templates don't capture multi-blueprint relationships. A "relay network" is three blueprints working together, but the vault stores them individually.

---

### Option C: The Blueprint String (Export/Import, Shareable)

**How it works:** Every blueprint can be serialized into a compact alphanumeric string — the **Blueprint Code**. The player right-clicks a blueprint tab and selects "Export Code." A modal appears showing the string:

```
RU:SCT:v1:pE2hA1c0r[IF.threat>2:evade;IF.idle:patrol.NE]k[ON_THREAT:alarm;ON_OBSERVE:raw]x[L:orders,alarm]
```

The string is automatically copied to the system clipboard. A "Copy" button offers a second chance. The string is also displayed as a QR code for mobile/screenshot sharing.

**Importing:** Right-click a blueprint tab, select "Import Code." A text field appears. Paste the string. The blueprint loads with the paste animation. If the string targets a different unit type than the current blueprint, the same compatibility-stripping logic from Option A applies, with a warning toast.

**String format:** The code is human-semi-readable. It starts with a game prefix (`RU:`), unit type shorthand (`SCT`, `STK`, `RLY`, `SPC`, `CMD`), version number (`v1`), then encoded skills, rules, hooks, and context config. The encoding is compact but not obfuscated — a dedicated player can learn to read the codes, and a modder can write them by hand.

**Where strings travel:**
- Discord: "Here's my Mission 8 scout build: `RU:SCT:v1:pE2h...`" — paste and play.
- Reddit: Build guides include codes for every blueprint in the loadout.
- Steam guides: Full mission walkthroughs with importable configs.
- Twitch/YouTube: Streamers put codes in video descriptions. Viewers pause, transcribe, import.
- The game's own share screen (see Option D).

**Strengths:**
- Viral by nature. A string in a Discord message IS the build. No screenshots, no step-by-step instructions — just paste.
- Enables the theory-crafting community that sustains games for years. Factorio's blueprint strings are the canonical example: the subreddit is 80% string-sharing.
- Compact enough for a tweet, descriptive enough for a guide.
- QR code enables cross-device sharing (see a build on your phone, scan into your PC game).
- Zero server infrastructure. Strings are self-contained — no need for a community server or account system.

**Weaknesses:**
- Strings are fragile across game updates. If a skill is rebalanced or a hook trigger is renamed, old strings may break. Versioning (`v1`) helps but doesn't solve forward-compatibility.
- Importing someone else's build bypasses the learning process. A player who imports a Mission 8 build without understanding it hasn't actually learned anything. This is the "netdecking problem" from card games.
- String length grows with blueprint complexity. A command agent with 6 hooks, 8 rules, and full context config produces a 200+ character string. Manageable, but not tweet-length.
- No curation. Every string is equally accessible — there's no way to distinguish a brilliant config from a terrible one without trying it.

---

### Option D: The Community Nexus (Server-Backed Sharing)

**How it works:** The game includes a **Nexus** — an in-game browser for community-shared blueprints. Accessible from the main menu or from within the workbench (a tab next to the Schematic Vault).

**Uploading:** From the vault, right-click a template and select "Share to Nexus." A modal asks for:
- Title (auto-generated from template name)
- Description (optional, 200 characters)
- Tags (unit type auto-tagged; player can add mission number, strategy archetype like "defensive," "rush," "economy")
- Screenshot (auto-captured from the blueprint editor — the current state of the workbench with this blueprint loaded)

The upload goes to a lightweight server. The template receives a unique short URL (e.g., `ru.gg/b/7kx3`) and a unique numeric ID.

**Browsing:** The Nexus shows a grid of blueprint cards, each displaying:
- Unit type icon and color
- Title
- Author name
- Skill icons
- Hook count
- Star rating (community votes, 1-5)
- Download count
- Mission tag (which mission it was designed for)
- Gauntlet winrate (if the author has used it in Gauntlet, the game tracks its win/loss and displays a percentage — this is the killer data point)

Filters: unit type, mission, minimum rating, sort by downloads/rating/recent/winrate.

**Downloading:** Click a blueprint card, preview its contents (full rules text, hook wiring, context config visible in read-only mode), then click "Import to Vault." It appears in the Schematic Vault with a small "community" badge and the author's name.

**Gauntlet integration:** Blueprints used in Gauntlet automatically track wins and losses. A blueprint's Gauntlet winrate is its most powerful community signal. "This scout config has a 73% winrate across 1,200 Gauntlet matches" is the kind of data that drives tier lists and meta evolution.

**Strengths:**
- The meta-game engine. Tier lists, meta reports, "build of the week" — the Nexus enables all of it.
- Gauntlet winrate is a self-maintaining quality signal. Good builds float up; bad builds sink.
- Curation through community votes prevents the "noise" problem of raw string sharing.
- Short URLs work in every medium (chat, stream, tweet, guide).
- Deepens engagement for non-competitive players: browsing and trying community builds is a game mode unto itself.

**Weaknesses:**
- Server infrastructure. A community sharing system requires servers, moderation, storage, and ongoing maintenance.
- The netdecking problem intensified. When the "best scout build" is one click away, does anyone still design their own?
- Meta stagnation. If one build dominates Gauntlet winrate, the competitive scene narrows to "this build or you lose."
- Moderation: offensive template names, descriptions, author names. Low risk but nonzero.
- Splits the community between "people who design" and "people who download." The designers feel exploited; the downloaders feel judged.

---

### Option E: The Architecture Snapshot (Multi-Blueprint Export)

**How it works:** Beyond individual blueprints, the player can save or export an **Architecture** — the complete set of blueprints for a mission loadout, including their inter-blueprint wiring (which channels connect which units, the production queue order, and context config cross-references).

**Saving:** From the Plan screen (not the workbench), a button labeled "Save Architecture" captures everything: all blueprints, the production queue, and the channel map. The result is an Architecture card in a separate section of the Schematic Vault, visually distinct (wider card, shows a miniature channel topology diagram).

**Exporting:** Architectures serialize to longer strings (500-1000 characters) or to a JSON file for file-based sharing. The Nexus supports Architecture uploads with a different card format showing the full unit composition and channel topology.

**Strengths:**
- Captures the real artifact of mastery: not a single blueprint, but a system of blueprints that work together.
- Enables "full loadout" sharing: "Here's my complete Mission 8 setup, all 6 units, all wiring."
- The architecture preview (miniature topology diagram) is a powerful teaching tool — seeing how an expert wires their network is more instructive than seeing any individual blueprint.

**Weaknesses:**
- Architectures are mission-specific. A 6-unit architecture designed for Mission 8's map doesn't transfer cleanly to Mission 9's terrain.
- Even longer strings / larger files. File-based sharing loses the elegance of a pasteable string.
- The "I imported someone's complete architecture and won without understanding it" problem is maximized.

---

## Player Journeys

### Journey 1: Diana, 34, Data Engineer — "I Just Want My Scout Back"

**Context:** Mission 6. Diana has a scout config she's been refining since Mission 2 — patrol northeast, evade on threat, hook ON_THREAT_ENTER to "alarm," hook ON_OBSERVE to "raw_data," context config listening on "orders." She needs two more scouts with identical configs. She's playing under Option B (Template Library).

**Minute 0:00 — The Workbench**
Diana opens the Plan screen. Three empty blueprint tabs for her three scouts. She configures Scout-A manually — 90 seconds of clicking: toggle patrol, toggle evade, write two rules, wire two hooks, set context config channels. She's done this enough times to be fast, but not fast enough to enjoy it.

**Minute 1:30 — Saving to the Vault**
She right-clicks Scout-A's tab. The context menu appears — dark background, light text, three items: Copy Blueprint, Save to Vault, Export Code. She clicks "Save to Vault." The naming modal slides down from the tab. The auto-generated name reads "Scout — patrol, evade, 2 hooks (alarm, raw_data)." She backspaces and types "Perimeter Watcher v3." Enter. A soft chime — a brief brass tone, like a stamp pressing into wax. The vault panel on the left edge pulses once — a thin line of blue light tracing its border — indicating something new is stored.

**Minute 1:45 — Loading Twice**
She clicks Scout-B's empty tab. Right-clicks. "Load from Vault." The vault panel slides open. One entry under Scouts: "Perimeter Watcher v3" with the patrol and evade skill icons and "2H" badge. She clicks it. The blueprint loads — skills snap on with toggle sounds (tick, tick), rules text streams in character by character at high speed (the typewriter sound, but fast-forwarded to a rapid patter), hooks wire with two soft clicks, context config checkboxes tick. Total time: 800ms of animation, 200ms of her clicking. She does the same for Scout-C. Two scouts configured in 4 seconds of player input.

**Minute 2:00 — The Divergence**
Now she needs Scout-C to be slightly different — this one patrols southwest instead of northeast. She opens Scout-C's blueprint (loaded from the template) and edits the patrol rule: change "NE" to "SW." One edit. Everything else identical. She doesn't save this as a new template — it's a one-off variant. The template system let her start from a known-good base and modify surgically.

**Minute 2:15 — The Feeling**
Diana looks at her three configured scouts. Total config time: about 2 minutes instead of the 4.5 minutes it would have taken to configure each from scratch. But the real win isn't time — it's confidence. She knows Scout-A and Scout-B are *identical*. No chance she forgot a hook or mis-typed a channel name. The template is the single source of truth.

---

### Journey 2: Marcus, 22, Competitive Gamer — "Show Me the Meta"

**Context:** Gauntlet mode, week 3 of the game's release. Marcus has completed the campaign and is now grinding Gauntlet rank. He's been running his own configs but plateaued at rank 14. He opens the Nexus (Option D) to study what the top players are doing.

**Minute 0:00 — The Nexus**
Marcus opens the Nexus from the main menu. The screen transitions: the workbench fades, replaced by a dark grid of blueprint cards arranged in a masonry layout. A search bar sits at the top with filter pills: [All Types] [All Missions] [Gauntlet] [Sort: Winrate]. He taps the "Gauntlet" filter. The grid reshuffles — only blueprints with Gauntlet winrate data remain. He sorts by winrate, descending.

The top card glows faintly with a gold border — the highest-rated build. It reads:

```
GHOST RELAY v4
by: entropyx
Type: Relay | Skills: compress, filter | Hooks: 4/4
Gauntlet Winrate: 78.3% (2,847 matches)
Rating: 4.8 stars (312 votes)
Tags: #gauntlet #relay #stealth #meta
```

The card shows a miniature preview: four hook connection lines radiating outward, two skill icons, and a faint channel topology hint. Marcus clicks it.

**Minute 0:20 — The Preview**
The card expands into a full-screen preview. On the left: the blueprint in read-only mode — every skill, every rule, every hook, every context config setting visible. On the right: community discussion — a stack of short comments from other players. The top comment: "Pair this with a 2-scout perimeter setup. The filter rule on line 3 is the key — it strips noise before compression so the output is clean enough for strikers to act on immediately." Marcus reads the rules carefully, tracing the logic. He sees a rule he's never used: `IF buffer_age > 4 ticks THEN drop_entry`. A staleness filter. He didn't know you could do that.

**Minute 1:00 — The Import**
He clicks "Import to Vault." The blueprint downloads — a brief animation of the card shrinking and flying to the vault icon in the corner, which pulses green. A toast: "Ghost Relay v4 saved to vault (credit: entropyx)." The template now lives in his local vault with a small community badge (a globe icon) and the author's name in gray text below the template name.

**Minute 1:15 — The Adaptation**
He opens a Gauntlet prep screen, loads Ghost Relay v4 into his relay slot. But he doesn't run it stock. He reads the rules again, understands the staleness filter, and adjusts the threshold from 4 ticks to 3 — his scouts report faster than entropyx's, so signals go stale quicker. He also swaps one hook from ON_COMPRESS to ON_BUFFER_FULL as a backpressure alert. He's not copying — he's learning from a community artifact and adapting it to his style.

**Minute 2:00 — The Feeling**
Marcus queues for Gauntlet. He's running a hybrid: one community-sourced relay, two personal scout configs, and a striker he's been tuning since Mission 4. The relay performs beautifully — the staleness filter keeps the signal pipeline clean, something Marcus never thought to do himself. He wins the match. He doesn't feel like he cheated; he feels like he studied. The Nexus is his textbook.

---

### Journey 3: Ren, 41, Streamer — "Content is Configs"

**Context:** Ren streams Robot Uprising three nights a week to 400 viewers. Tonight's stream is a community challenge: viewers submit blueprint codes in chat, and Ren runs them in Gauntlet without previewing. Option C (Blueprint Strings) is the backbone of this format.

**Minute 0:00 — The Pitch**
Ren is on camera, the game's main menu behind them. "Alright chat, same rules as last time. Drop a blueprint code in chat. Any unit type. I'll run the first five submissions as my Gauntlet loadout. No previews. No edits. Whatever you give me, that's what I'm fighting with."

Chat erupts. Strings flood in. Some are real builds; some are obviously troll configs (a command agent with zero hooks and only the "patrol" skill). Ren's mod highlights five strings with a bot command.

**Minute 0:45 — The Blind Import**
Ren opens the workbench. Five empty blueprint tabs. They right-click the first tab, select "Import Code," and paste the first string from chat:

```
RU:RLY:v1:cFhA4r[IF.buf>8:compress;IF.ch.alarm.age<2:amplify.all]k[ON_COMPRESS:intel;ON_BUFFER_FULL:panic;ON_RECEIVE:ack;ON_IDLE:heartbeat]x[L:alarm,raw,orders]
```

The blueprint loads. The paste animation plays: skills tick on (compress, filter — chat chose well), rules stream in, four hooks wire themselves rapidly — click-click-click-click — and context config populates. Ren reads the rules out loud: "If buffer above 8, compress... if alarm channel has fresh data, amplify to all... four hooks, ON_COMPRESS to intel, ON_BUFFER_FULL to panic — oh, someone's built a backpressure relay. This is actually good." Chat celebrates. Ren imports the next four strings, reading each aloud with escalating amusement or alarm.

**Minute 3:00 — The Gauntlet Match**
Ren deploys the five community-built blueprints without modification. The match begins. For 90 seconds, Ren and chat watch in sealed-watch mode as the units behave according to configs Ren has never tested. A scout patrols in a tight circle (chat: "that's my orbit scout!"). The relay compresses efficiently (chat: "told you it was good"). One striker runs directly into a wall because someone set its patrol rule to a single tile (chat: laughter, emotes). Ren loses the match but gained 20 minutes of content.

**Minute 4:30 — The Clip**
Ren highlights the moment the orbit scout accidentally discovered an enemy cluster by spiraling into it. The clip is 15 seconds: the scout's tight circle, the sudden threat flash, the alarm hook firing, the relay compressing, the good striker responding — a cascade of emergent behavior from a config submitted as a joke. "This is why I love this game," Ren says. Chat spams the blueprint code of the orbit scout. By morning, it's on the subreddit with the title "the orbit scout meta is real."

---

## Strengths and Weaknesses Summary

| Feature | Value Added | Cost |
|---------|------------|------|
| Clipboard (A) | Eliminates repetitive config within a session | Zero UI cost, zero persistence |
| Template Library (B) | Named, persistent configs; mastery identity | Vault panel, naming UX, management burden |
| Blueprint Strings (C) | Viral sharing, community content | String fragility across updates, netdecking risk |
| Community Nexus (D) | Meta-game engine, winrate data, curation | Server infra, moderation, meta stagnation |
| Architecture Snapshot (E) | System-level sharing, teaches topology | Mission-specific, long strings, maximum bypass risk |

**Recommended layering:** Ship A + B at Mission 5 introduction (when the factory makes multiple units possible for the first time). Ship C at Gauntlet unlock (competitive context makes sharing relevant). Ship D post-launch (community needs critical mass to be useful). Consider E only if the community explicitly asks for it.

---

## Interaction Effects

**With the Debrief/Inspector (aspect 4.x):** The Inspector already lets players scrub through a battle and examine any unit's state at any tick. If templates are visible in the Inspector ("this unit was loaded from template 'Perimeter Watcher v3'"), the player can trace failures back to the template itself rather than the specific instance. "My template is wrong, not just this unit."

**With the Production Queue (aspect 3.x):** Templates interact with the conveyor belt. A "stamp" action could let the player assign a template to a production queue slot: "every scout produced from this slot uses the Perimeter Watcher v3 template." This turns the production queue from a unit-type selector into a template applicator.

**With Rule Conflicts (aspect 3.10):** Pasting a template onto an existing blueprint might create rule conflicts if the player has already configured some rules. The conflict resolution system needs to handle paste-induced conflicts gracefully — either overwrite completely (current design) or offer a merge mode.

**With Meta-Progression (aspect 5.x):** If the game has cross-campaign progression (unlocking cosmetics, titles, stats), template usage could feed into it. "Designed 50 templates" as an achievement. "Had a Nexus blueprint reach 1,000 downloads" as a social milestone.

**With Gauntlet Balance (aspect 6.x):** The Nexus winrate data creates a feedback loop. If one build dominates, the meta centralizes. The game needs either regular balance patches or a rock-paper-scissors structure where counter-builds exist for every dominant strategy. Otherwise the Nexus becomes a "copy this or lose" system.

**With the EM Emission Mechanic:** Shared builds create convergent EM signatures. If everyone runs the same relay config, enemy detection becomes easier — the EM pattern is known. This is a natural counter to netdecking: the more popular a build, the more predictable its emissions.

---

## Comparable Games and Media

**Factorio — Blueprint Strings:** The gold standard. Factorio's blueprint string system turned the subreddit into a library of shared factory designs. Players paste strings to import entire factory sections. The string format is stable across versions (mostly), compact enough for a forum post, and self-documenting (the imported blueprint shows exactly what it does). Robot Uprising's blueprint codes are directly inspired by this — but scoped to individual agents rather than spatial factory layouts.

**Slay the Spire — Deck Sharing / Seed Sharing:** Slay the Spire doesn't have a formal deck export, but the community developed its own sharing culture: screenshots of final decks, seed codes for reproducible runs, and mod-enabled deck import. The lesson: if you don't build sharing tools, the community will hack them together worse. Build them first.

**Magic: The Gathering — Deck Codes (Arena):** MTG Arena's deck code system exports a human-readable text list that can be pasted into the game's deck builder. The format is dead simple: one line per card, quantity and name. This is closer to Robot Uprising's needs than Factorio's binary blobs — our configs are small enough to be readable as text.

**Opus Magnum — GIF Export:** Opus Magnum lets players export animated GIFs of their solutions. The GIF IS the share artifact — it shows the machine running, which communicates the design's elegance (or inelegance) instantly. For Robot Uprising, the equivalent would be exporting a short clip of a blueprint's behavior during a match — "here's what my scout does" as a 5-second loop. This complements code sharing with visual evidence.

**Gladiabots — Bot Sharing:** Gladiabots has a built-in bot-sharing system where players upload their AI configurations and others download them. The community developed tier lists of the best bots. The key lesson: sharing + ranked play creates a living meta where builds compete even when their authors are offline. The Nexus's Gauntlet winrate tracking is designed to replicate this dynamic.

**Screeps — Code Sharing on GitHub:** Screeps players share their AI code on GitHub, complete with READMEs explaining their strategy. This is the deepest form of sharing — full source code with documentation. Robot Uprising's Architecture Snapshot (Option E) approaches this level, exporting not just a single unit's config but an entire multi-agent system.

---

## Sensory Descriptions

**The Copy Flash:** When the player copies a blueprint, the tab border traces itself in white light — a 300ms sweep from top-left, clockwise, back to top-left. A soft "snapshot" sound: a quick mechanical shutter click, like a Polaroid camera. The clipboard icon appears in the workbench's top-right corner: a small translucent rectangle with a faint ghost image of the copied blueprint's skill icons.

**The Paste Cascade:** Pasting is not instant. It's a 800ms choreography. First, skills toggles flip on in sequence from left to right — each with a small "tick" sound and a brief green flash. Then rules text streams into the rules panel, character by character at 200 characters per second, with a rapid typewriter patter that rises in pitch as it goes. Then hooks wire themselves: each hook slot illuminates in sequence, a connection line draws itself from the hook to its channel endpoint with a thin crackling sound (like electricity arcing through a wire). Finally, context config checkboxes tick on simultaneously with a single collective "thunk." The total effect is mechanical, precise, and satisfying — like watching a machine assemble itself.

**The Vault Save:** Saving to the Schematic Vault produces a heavier, more permanent sound than the clipboard copy. A deep brass stamp — the sound of a seal pressing into hot wax. The vault panel's thin border traces itself in gold for 500ms. The new template card slides into position in the vault list with a soft friction sound, like a card being filed into a metal drawer. The card settles with a quiet click.

**The Import Code Modal:** When importing a blueprint string, the modal has a wide text field with a blinking amber cursor. As the player pastes the string, the characters appear in monospace font with a faint green tint — the same terminal aesthetic as the game's boot logs. Below the text field, a live preview panel shows the blueprint being decoded in real time as the string is parsed: skill icons light up, hook lines sketch themselves, rules text renders. If the string is valid, the preview background tints green. If invalid (corrupted string, wrong version), the background tints red and specific characters in the string highlight with red underlines, with a tooltip: "Unknown skill reference at position 34." The "Import" button only enables when the string parses cleanly.

**The Nexus Browse:** The Nexus grid has a dark background with blueprint cards floating in a subtle parallax — scrolling the grid causes cards to shift slightly against each other, creating a layered depth effect. Each card has a thin border in the unit type's color (blue/red/green/purple/gold). Hovering a card raises it slightly with a soft paper-lift sound and brightens its border. The Gauntlet winrate number glows faintly in green if above 60%, amber if 40-60%, dim red if below 40%. Cards with over 1,000 downloads have a small flame icon that flickers. The whole screen feels like browsing a catalog of weapons in an armory — each card is a tool waiting to be picked up.

---

## The TikTok Clip

**Title:** "he imported a troll build and it actually worked"

**The 12 seconds:**

Second 0-2: Split screen. Left: a Discord chat with the message "try this lol" followed by a blueprint string. Right: the game's Import Code modal. The string pastes in. The live preview panel lights up — but the skills look weird. Only one skill active. Three hooks. The preview background turns green (valid code).

Second 2-4: The player clicks Import. The paste cascade plays on a scout blueprint — one skill ticks on (just patrol, nothing else), three hooks wire themselves rapidly with the crackling sound. The player's cursor hovers over the rules panel. One rule: "IF idle THEN patrol in circles, radius 1." Chat message visible in overlay: "this is literally a roomba."

Second 4-8: Cut to the match. Sealed watch. The "roomba scout" patrols in a tiny 1-tile circle at the center of the map. Enemy units stream past it. But the three hooks are all firing ON_OBSERVE to three different channels — alarm, raw_data, and a custom channel called "everything." The relay receives a firehose of observations from the scout's rapid circling. The relay compresses them. The strikers converge. Every enemy that passes the roomba gets tracked, compressed, and hunted.

Second 8-10: The kill feed lights up. Three eliminations in quick succession. The roomba scout is still circling, oblivious. The channel lines on the map pulse with green sparks racing outward from the spinning scout like a signal sprinkler.

Second 10-12: Cut to the post-match stat screen. The roomba scout has 0 kills, 0 damage, but 47 observations — the highest intel contribution of any unit. The stat line highlights in gold. Text overlay: "the friend who doesn't fight but always sees everything." The blueprint code appears at the bottom of the screen.

Comment section writes itself: "drop the code," "need this for mission 7," "the roomba meta begins."
