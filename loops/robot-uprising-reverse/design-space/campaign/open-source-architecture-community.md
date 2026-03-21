# Open-Source Architecture as Community Mechanic

**Aspect:** 5.21 — Open-source architecture as community mechanic: Screeps' culture of publishing full bot code on GitHub + writing architectural blog posts is a deliberately-designed community mechanic; what's the Robot Uprising equivalent? Exportable agent configs, shareable hook wiring diagrams, community config repositories?

**Category:** campaign
**Wave:** 5 — Campaign & Progression

---

## The Core Insight: Sharing IS the Game

Screeps didn't accidentally produce a culture where players publish 40,000-line TypeScript repositories on GitHub, write multi-part blog series about their AI architecture decisions, and maintain community-governed bots with automated PR voting systems. The game's design made sharing inevitable because **the artifact you produce while playing IS a sharable artifact.** Your bot is code. Code lives on GitHub. GitHub has stars, forks, pull requests, and README files. The game's output format and the internet's collaboration format are the same format.

This is the deepest lesson: **the game's expressive medium determines the community's sharing culture.** Factorio blueprints are shareable because they're serializable data (Base64-encoded JSON strings). Slay the Spire seeds are shareable because they're short alphanumeric codes. Zachtronics solutions are shareable because they produce histograms that beg comparison. Robocode tanks are shareable because they're Java classes with known interfaces. In each case, the community culture emerged from the shareability properties of the game's primary artifact.

Robot Uprising's primary artifact is the **blueprint configuration** — a bundle of skills, rules, hooks, and context config that defines an agent's behavior. The secondary artifact is the **architecture** — the wiring diagram of channels connecting multiple blueprints into a system. The tertiary artifact is the **full loadout** — the complete set of blueprints, their channel wiring, and the production queue ordering for a specific mission.

The question is: which sharing models produce the richest community culture, and how does the game's UI support them?

---

## The Sharing Spectrum Across Games

### Screeps: Full Source Code Publishing

Screeps players share *everything* — complete codebases running thousands of lines. The TooAngel bot pioneered fully automated open-source deployment where community pull requests are automatically merged via a "World Driven" consensus system. The Screeps Quorum project has no single author — it's a collectively governed bot where developers vote on PRs using GitHub reactions, and merged code auto-deploys to the game server.

Ben Bartlett's Overmind (40,000+ lines of TypeScript) spawned a multi-part blog series explaining architectural decisions: why he structured the AI around Starcraft's Zerg hierarchy (Overlords, Colonies, Directives), how he solved CPU constraints with a refresh-phase caching pattern, and how the "Assimilator" module lets all players running Overmind act as a collective hivemind sharing creeps and resources across accounts.

**The critical tension:** The Screeps community is deeply divided on open-source bots. Supporters argue they're inevitable, educational, and that paying subscribers deserve to play however they want. Opponents argue that "running someone else's code as your mainstay on the official servers" undermines the game's core challenge. A middle ground emerged: **frameworks over full bots** — providing structure and libraries while requiring players to implement their own logic.

**What translates:** Robot Uprising is NOT a programming game, so full-code sharing isn't the parallel. But Screeps proves that when a game's artifact is modular, documented, and produces observable behavior, the community will build an entire culture around sharing, comparing, and iterating on those artifacts.

### Factorio: Blueprint String Exchange

Factorio's sharing mechanic is almost frictionless. Export a blueprint and it becomes a Base64-encoded JSON string you can paste into Discord, Reddit, or a dedicated site like FactorioBin. Import: paste the string, click import, the blueprint appears in your inventory. The community developed a sophisticated ecosystem: FactorioBin for quick exchanges, Factorio.school for curated collections, FactorioPrints as a searchable archive. Community standards emerged organically — sharing-ready blueprints include documentation of inputs, outputs, entry points, and prerequisites.

**What translates:** The copy-paste portability. A blueprint string is a URL-length chunk of text. You can share it in a tweet, a Discord message, a Reddit comment. No file downloads, no account linking. The format IS the sharing mechanism.

### Zachtronics: Histogram Comparison

Zachtronics games show you a histogram of all players' solutions after you complete a puzzle. Your solution is a dot on the curve. You instantly see whether you're in the fat middle or the elite tail. This isn't sharing content — it's sharing *position*. The histogram creates a silent conversation: "I see that someone solved this in 14 cycles. HOW?" This drives replay, optimization, and eventually explicit sharing of solutions and GIFs.

**What translates:** The comparison invitation. Seeing that your architecture used 12 ticks to solve Mission 7 when the median is 8 creates an irresistible pull to improve. But it also creates an irresistible pull to find out *how the 5-tick players did it* — which drives demand for shared configs.

### Gladiabots: AI Export/Import

Gladiabots — the closest mechanical parallel to Robot Uprising — allows AI export but its sharing culture is weak. The game uses visual behavior trees, which are inherently harder to serialize and share than text code or blueprint strings. The community relies on Discord and forums rather than any in-game sharing platform. Backup/sync exists but isn't designed as a sharing feature.

**What translates as a warning:** Visual configuration systems are harder to share than text-based ones unless the game provides explicit serialization and import tools. Robot Uprising MUST build sharing into the format, not bolt it on.

### Robocode: Strategy Wikis

Robocode's community centralized around the RoboWiki, accumulating two decades of strategy knowledge: movement algorithms, targeting techniques, radar sweep patterns. The wiki functions as a shared vocabulary — players don't share complete tanks, they share *techniques* with names (Wave Surfing, Guess-Factor Targeting, Minimum Risk Movement). Each technique has a wiki page, example code, and discussion.

**What translates:** Named techniques create shared vocabulary. When Robot Uprising players discover that a specific hook wiring pattern produces reliable flanking behavior, that pattern needs a NAME, a description, and a place to live in the community's memory.

---

## The Robot Uprising Sharing Architecture

### Layer 1: The Blueprint Card (Single Agent Config)

**What it is:** A serializable, exportable configuration for a single blueprint — skills, rules, hooks, and context config frozen into a shareable format. The atomic unit of sharing.

**Format:** A compact encoded string (like Factorio's blueprint strings) that can be pasted into the game's import dialog. Short enough to share in a Discord message. The string includes a human-readable header showing unit type, skill loadout, and hook channel names before the encoded data block.

Example of what a shared blueprint card looks like in text:

```
[SCOUT] "Whisper Net" | skills: patrol, evade | hooks: recon-net(send), danger-ping(listen) | rules: 3
RU:v1:eyJza2lsbHMiOlsicGF0cm9sIiwiZXZhZGUiXSwicnVsZXMiOlt7...
```

**What the import flow looks like:** Player pastes the string into a text field in the Plan screen's blueprint editor. A preview card materializes showing the blueprint's full configuration — skills in their slots, rules in their ordered list, hooks with channel names, context config toggles. A cyan "Import" button and a red "Cancel" button. Imported blueprints appear in a special "Community" tab in the blueprint library, visually distinguished from player-created blueprints with a small download-arrow icon in the corner.

### Layer 2: The Wiring Diagram (Multi-Agent Architecture)

**What it is:** A complete architecture export — multiple blueprints AND their channel wiring AND production queue ordering. This is the equivalent of sharing an entire Factorio factory, not just one assembler.

**Format:** A longer encoded string (or a shareable URL if the game has a web component). Includes all blueprint configs plus the channel topology — which blueprints send on which channels, which listen, the production ordering.

**What makes this interesting:** The wiring diagram is the *strategic insight*. Individual blueprint configs are tactics; the wiring diagram is strategy. Sharing a wiring diagram reveals your theory of how information should flow through a squad. It's the architectural blog post made concrete.

**Visual representation for sharing:** When a player exports a wiring diagram, the game generates a **channel topology image** — a node-graph visualization showing blueprint icons connected by colored channel lines, with channel names labeling each connection. This image is auto-copied to clipboard alongside the string, designed for posting on Discord/Reddit. It's the "TikTok clip" of the sharing system — a single glance tells you the architecture's shape.

### Layer 3: The Mission Loadout (Config + Context)

**What it is:** A complete solution to a specific mission — blueprints, wiring, production queue, AND the mission identifier. Not just "here's my architecture" but "here's my architecture that beats Mission 7 in 9 ticks."

**Format:** Encoded string plus mission ID plus performance metadata (ticks to complete, units lost, peak context utilization, total signals sent). The loadout is the Zachtronics histogram data point made exportable.

### Layer 4: The Technique (Named Pattern)

**What it is:** Not a config file but a concept — a named, documented pattern that describes a reusable architectural idea. "The Whisper Net" (scouts on a shared low-priority channel that relays aggregate to a single striker). "The Pressure Cooker" (deliberately filling enemy context windows with noise using multiple scouts broadcasting on the same frequency). "The Ghost Protocol" (zero-emission architecture using only pre-positioned relays and context-based implicit coordination).

**How the game supports this:** The Blueprint Codex (already locked in the design) includes a "Community Patterns" section that surfaces named patterns. Each pattern card shows a minimal wiring diagram, a one-sentence description, the player who named it, and a usage count. Players can tag their exported configs with pattern names.

---

## Three Sharing Models

### Model A: "The Blueprint Exchange" (Factorio-Style Paste-and-Play)

**How it works:** Pure import/export. No in-game marketplace, no accounts, no curation. Players share blueprint strings on Discord, Reddit, forums. The game provides the serialization format and the import dialog. Everything else is community-driven.

**The UI:** In the Plan screen's blueprint editor, a small clipboard icon in the top-right corner of each blueprint card. Click it: the blueprint string is copied to clipboard with a satisfying snap sound and a brief cyan flash on the icon. To import: a text field at the bottom of the blueprint library panel with placeholder text "Paste blueprint string..." — paste, press Enter, preview appears, confirm import.

For architecture export: a "Share Architecture" button in the channel map panel. Clicking it generates the topology image (animated: channel lines draw themselves one by one over 0.5 seconds, then blueprint icons fade in, then the whole diagram pulses once and freezes as a static image). The encoded string and the image are both copied to clipboard. A toast notification: "Architecture copied — string + diagram."

**Strengths:**
- Zero infrastructure required from the developer
- Community self-organizes curation (Reddit upvotes, Discord pinned messages, dedicated websites)
- No moderation burden
- Players who want to share, share; players who don't, don't even know the feature exists
- Preserves the "I built this myself" pride — importing is a conscious, visible act

**Weaknesses:**
- Discovery is entirely external — new players won't find shared configs without joining Discord
- No quality signals — a pasted string might be terrible, and you won't know until you run it
- No attribution — configs spread without credit to the original creator
- The community might not self-organize if the player base is small

### Model B: "The Config Gallery" (Steam Workshop-Style In-Game Browser)

**How it works:** An in-game gallery where players publish, browse, search, and download configs. Each published config includes metadata: creator name, mission it was designed for, performance stats, descriptive tags, a player-written description. Sorting by popularity (downloads), recency, rating, or performance metrics.

**The UI:** A new tab in the Blueprint Codex called "Community." Opening it reveals a grid of config cards — each card shows:
- The blueprint's unit type icon (Scout/Striker/Relay/Specialist/Command) in the top-left
- The config name in bold (e.g., "Whisper Net Scout v3")
- The creator's name in small text below
- A miniature wiring diagram if it's an architecture (not just a single blueprint)
- Performance badges: mission icons with tick counts (e.g., "M7: 9t" meaning Mission 7 in 9 ticks)
- A download count and a star rating (1-5 stars)
- Tags: #flanking, #stealth, #economy, #anti-noise

Clicking a card opens a detail view: full blueprint configuration displayed exactly as it would appear in the workbench editor, but read-only. A "Copy to Library" button imports it. A "Report" button for inappropriate content. A "See Creator's Other Configs" link.

**Search and filter bar** at the top: text search, unit type dropdown, mission filter, sort-by dropdown (Popular / Recent / Top Rated / Fewest Ticks). A "Featured" section curated by the developer or by community vote shows 3-5 highlighted configs that rotate weekly.

**Strengths:**
- Discovery happens inside the game — new players encounter community configs naturally
- Performance metadata creates Zachtronics-style comparison pressure ("someone solved M7 in 5 ticks with THIS?")
- Attribution is built in — creators get visible credit, download counts, ratings
- Tags create emergent vocabulary (community names for patterns)

**Weaknesses:**
- Requires backend infrastructure (or at minimum a static hosting solution for a web-based game)
- Moderation burden — someone will name their config something offensive
- Can undermine the learning curve — why struggle with Mission 5 when you can download a proven solution?
- Rating systems can be gamed or create popularity bubbles

### Model C: "The Open Architecture" (Screeps-Style Full Transparency)

**How it works:** Every player's loadout for every mission they've completed is automatically visible in the Inspector debrief. After watching your own replay, you can browse OTHER players' replays of the same mission — seeing their architecture, their wiring, their tick-by-tick decisions. No explicit "sharing" action needed. Playing the game IS sharing.

**The UI:** In the Inspector screen, after scrubbing through your own replay, a new panel appears at the bottom: "Other Approaches." It shows a horizontal scroll of replay thumbnails — each thumbnail is a 3-second animated loop of another player's sealed watch for the same mission, miniaturized. Below each thumbnail: the player's name, tick count, unit count, and a "Watch Full Replay" button.

Clicking "Watch Full Replay" opens that player's Inspector view — you can scrub through their ticks, click their units, see their context windows, trace their decision chains. A "Copy Architecture" button in the top-right exports their full loadout to your library.

**The critical design:** This is opt-OUT, not opt-in. All replays are public by default. A settings toggle ("Hide my replays from other players") exists but defaults to off. This mirrors Screeps' philosophy where playing on the public server means your code is running publicly.

**Strengths:**
- Creates the deepest learning culture — you learn by watching others, not by reading documentation
- Removes the "sharing barrier" — nobody has to decide to share, it just happens
- Creates natural mentorship chains — struggling players find successful approaches organically
- The replay format is richer than any config string — you see the architecture IN ACTION
- Generates the Zachtronics histogram effect naturally ("how did they do it in 5 ticks?" → click → watch → learn)

**Weaknesses:**
- Privacy concerns — some players will feel exposed
- Could reduce experimentation ("why try my own approach when I can just copy the top player's?")
- Requires replay storage infrastructure
- Spoiler problem — a player might see the "answer" to a mission before developing their own solution

---

## Player Journeys

### Journey: Marcus, 32, Senior Software Engineer

**Context:** Mission 7 completed. Has been playing for two weeks. Comfortable with the workbench but hasn't explored hooks deeply. His architectures tend to be simple — scouts feed strikers directly, no relays, no compression. He just beat Mission 7 in 14 ticks but felt like it was sloppy.

**Minute 0:00 — The Histogram Sting**

Marcus enters the Inspector screen after his sealed watch of Mission 7. His replay scrubber shows 14 ticks — a plodding, inefficient clear. He scrubs through, noting two ticks where his strikers sat idle waiting for scout reports. He clicks the "Other Approaches" panel at the bottom of the Inspector. A horizontal scroll of replay thumbnails loads. The first one shows a 6-tick clear. Six ticks. Marcus's jaw tightens.

The thumbnail is a 3-second animated loop: five units moving in coordinated waves, channel lines flickering like a neural network firing. Below: "user: architecta, 6 ticks, 0 units lost." A cyan "Watch Full Replay" button pulses gently.

**Minute 0:30 — Studying the Master**

Marcus clicks the replay. The Inspector loads architecta's Mission 7 run. The board shows a completely different unit composition — two relays, one scout, two strikers. Marcus has never used more than one relay. He clicks the first relay unit. Its context window panel opens in the sidebar: 12 slots, 8 occupied, all showing compressed scout reports with timestamps. The relay's hook configuration panel shows four hooks — two receiving on "recon-net," one sending on "strike-priority," one sending on "flank-signal." The channel topology is visible as colored dashed lines connecting units on the board.

Marcus clicks the decision trace for tick 3. The relay received two raw scout reports on recon-net, compressed them using its "compress" skill into a single prioritized threat assessment, then forwarded the compressed signal on "strike-priority." Both strikers received it simultaneously on tick 4 and moved to intercept. No wasted ticks. No idle strikers.

**Minute 2:00 — The Architecture Epiphany**

Marcus clicks "Copy Architecture" in the top-right. A confirmation dialog appears: "Import architecta's Mission 7 loadout? This will be saved to your Community library." He confirms. The loadout appears in his blueprint library with a small download-arrow icon and "via architecta" in small text.

But Marcus doesn't just run it. He opens the Plan screen and places architecta's loadout side-by-side with his own. Two workbench panels. His: Scout → Striker direct. Architecta's: Scout → Relay → Striker with branching channels. He stares at the channel topology diagram — his is two straight lines, architecta's is a tree with branches. He starts modifying architecta's design, adding a third relay for redundancy. He's not copying anymore. He's learning.

**Minute 5:00 — The Remix**

Marcus executes his modified version of architecta's architecture. The sealed watch plays. 8 ticks — faster than his original 14, slower than architecta's 6. But the third relay created a fallback path he hadn't anticipated. When the scout was eliminated on tick 3, the relay network routed around the gap. Marcus grins. He exports his modified architecture, names it "Redundant Whisper Net," and publishes it to the gallery with a description: "Based on architecta's M7 approach, added relay redundancy for scout-loss scenarios."

**UI Annotations:**
- **Other Approaches panel:** Horizontal scroll at bottom of Inspector, 120px tall, dark background, replay thumbnails as 100x100 animated GIF-style loops with player name, tick count, and "Watch" button below each
- **Copy Architecture button:** Top-right of Inspector when viewing another player's replay, cyan outline, download-arrow icon
- **Community library tab:** Blueprint library section with download-arrow badge on imported configs, "via [creator]" attribution text in 10px gray italic
- **Channel topology diagram:** Auto-generated node graph, blueprint icons as nodes, colored lines as channels, channel names as edge labels, exportable as image

---

### Journey: Sofia, 19, Art Student (First-Time Strategy Player)

**Context:** Stuck on Mission 5, the first factory mission. Has never played a strategy game before. Found Robot Uprising through a TikTok of someone's elaborate architecture producing a 4-tick clear. She's been playing for three days and loves the aesthetic but feels overwhelmed by the factory system.

**Minute 0:00 — The Stuck Screen**

Sofia has failed Mission 5 four times. Her factory produces scouts that wander aimlessly because she hasn't configured hooks — her scouts have the patrol skill but no rules about what to do when they find something. She stares at the Plan screen workbench. The hook slots are empty dashed outlines. She knows they matter but doesn't understand the channel concept.

She notices the clipboard icon in the top-right of the workbench area. Hovering it shows a tooltip: "Import a community blueprint." She clicks it. A text field appears with placeholder text: "Paste blueprint string or browse gallery..."

**Minute 0:20 — The Gallery Discovery**

Sofia clicks "browse gallery." The Blueprint Codex opens to the Community tab. A grid of config cards fills the screen. She sees unit type filters at the top — Scout, Striker, Relay, Specialist, Command — rendered as the familiar unit icons. She clicks the Scout icon. The grid filters to scout configurations.

The first card: "Basic Recon Scout" by user: tutorial_helper, tagged #beginner #mission-5, downloaded 2,340 times, rated 4.2 stars. A single-line description: "A scout that reports what it finds. Good starting point for Mission 5." The card shows two skill slots filled (patrol, evade), one hook slot filled (recon-net, send), and two rules.

Sofia clicks the card. The detail view shows the full blueprint configuration laid out exactly like the workbench editor, but with a soft blue background indicating "viewing mode." She can see the two rules in order:
1. IF enemy detected in perception → SEND on recon-net (tagged: location, type, distance)
2. IF danger detected within 2 tiles → USE evade skill

Below the rules, the context config: listen on "command" channel, ignore "noise" channel, eviction priority: oldest-first. A "Copy to Library" button glows cyan at the bottom.

**Minute 1:00 — The Aha Moment**

Sofia copies the Basic Recon Scout to her library. Back in the Plan screen, she drags it into her factory's blueprint slot. She sees the hook: "recon-net (send)." The channel map panel on the right side of the workbench shows a new channel appearing — "recon-net" — with the scout icon connected to it by a cyan line, but no listener on the other end. The channel name pulses amber with a subtle warning: "No listeners."

This is the moment. Sofia understands: the scout is SENDING information, but nothing is RECEIVING it. She opens her striker blueprint. The hook slots are empty. She clicks an empty hook slot, types "recon-net," sets it to "listen." The channel map updates — a line now connects scout to striker through the recon-net channel. The amber pulse stops. The channel glows steady cyan.

She didn't learn hooks from a tutorial text box. She learned them by importing one half of a conversation and discovering the other half was missing.

**Minute 3:00 — The First Factory Run**

Sofia hits Execute. The sealed watch plays. Her factory produces a scout first (she set it first in the production queue). The scout spawns, patrols, spots an enemy on tick 3. A green cell flash — signal sent on recon-net. One tick later, her striker (produced on tick 2, now in position) receives the signal. A green cell flash on the striker. Tick 5: the striker moves toward the reported position. Tick 6: elimination. Red flash. Sofia pumps her fist.

She didn't build this architecture from scratch. She imported one piece, understood the gap, and filled it herself. The community config was a scaffold, not a solution.

**Minute 5:00 — Paying It Forward**

After clearing Mission 5 in 11 ticks, Sofia modifies her scout blueprint — she adds a second hook sending on a new channel she names "danger-alert" that broadcasts when the scout is in danger. She exports the modified blueprint, names it "Alert Recon Scout," and adds a description: "Like Basic Recon Scout but also warns allies when in danger. Good for missions where scouts get killed a lot." She tags it #beginner #mission-5 #safety.

**UI Annotations:**
- **Gallery card layout:** 200px wide cards in a responsive grid, unit type icon (24px) top-left, config name in 14px bold, creator in 10px gray, download count and star rating bottom-left, tags as small pills (#beginner in green, #mission-5 in blue)
- **Detail view:** Full-width panel with blue-tinted background, blueprint config rendered identically to workbench editor but with "Copy to Library" button instead of "Save" button
- **Channel map warning:** Channel name text pulses amber when a channel has senders but no listeners (or vice versa), with a 1px dashed amber line to the unconnected endpoint
- **Import badge:** Imported blueprints in the library show a 12px download-arrow icon in the bottom-right corner of the card, distinguishing them from player-created ones

---

### Journey: Dex, 27, Competitive Factorio Player and Zachtronics Veteran

**Context:** Has completed all 10 missions. Now replaying for optimization. Currently holding the 3rd-fastest Mission 10 clear at 18 ticks. Wants to break into the top spot (15 ticks by user: signal_architect). Deeply invested in the meta-game of architecture optimization.

**Minute 0:00 — The Leaderboard Hunt**

Dex opens the Mission 10 leaderboard in the Blueprint Codex. A vertical list shows the top 20 clears sorted by tick count. Each entry shows: rank, player name, tick count, unit composition (tiny unit icons in a row), and a "Watch Replay" button. The top entry: #1 signal_architect, 15 ticks, composition: 1 Command, 2 Relays, 1 Scout, 3 Strikers.

Dex's entry: #3, 18 ticks, composition: 2 Scouts, 2 Relays, 3 Strikers. No Command unit. He suspects the Command unit is the key — signal_architect is using one, and the Command's "reassign" and "reroute" skills could dynamically adjust the architecture mid-battle.

He clicks "Watch Replay" on signal_architect's run.

**Minute 0:30 — The Replay Study**

The Inspector loads signal_architect's Mission 10 replay. Dex scrubs to tick 1. The channel topology is extraordinarily complex — eight named channels visible as colored lines webbing across the board. He clicks the Command unit. Its context window shows 14 slots, all configured with aggressive eviction: oldest-first, with "enemy-position" tagged as never-evict. The Command's rule list is 6 entries long — the maximum. Rule 3: "IF strike-channel congested AND enemy-count > 3 → REROUTE striker-2 from strike-alpha to strike-beta." The Command unit is load-balancing its strikers across two attack channels based on congestion.

Dex pauses. He's never used the "reroute" skill. He didn't realize it could be conditional — triggered by channel congestion, not just a static assignment. He opens his notebook app and sketches the channel topology by hand: Command in the center, two relay nodes branching left and right, each feeding a different striker pair through separate channels, with the Command monitoring both channels and shifting units between them.

**Minute 2:00 — The Architecture Theft**

Dex clicks "Copy Architecture." But he doesn't import it directly. Instead, he opens his own Mission 10 loadout in the workbench and begins reconstructing signal_architect's approach from memory and notes. He adds a Command unit to his production queue. He creates the split-channel topology. He writes the conditional reroute rule himself, testing different congestion thresholds.

He exports his new architecture before testing it. He names it "Adaptive Dual-Lane v1" and writes a detailed description in the gallery: "Inspired by signal_architect's M10 approach. Key insight: using Command's reroute skill with congestion-conditional rules to dynamically balance striker groups across two attack lanes. My variation uses 2 scouts instead of 1 for faster initial reconnaissance, trading production speed for information coverage."

**Minute 5:00 — The Blog Post Equivalent**

Dex opens the gallery's description editor for his published architecture. It supports basic formatting. He writes a 500-word breakdown:

> "The fundamental problem with single-channel striker architectures in M10 is congestion. When 3+ strikers listen on the same strike channel, incoming signals compete for context window slots. Strikers with full context windows get stunned for 1 tick — fatal in a mission where the enemy factory produces a new unit every 3 ticks.
>
> The dual-lane solution splits strikers across two channels (strike-alpha and strike-beta). A Command unit monitors congestion on both channels and conditionally reroutes individual strikers when one lane is overloaded. This produces emergent load-balancing behavior without requiring the Command to understand the battlefield — it only needs to monitor signal density.
>
> Key configuration details:
> - Command rule 3 threshold: congestion > 4 signals/tick triggers reroute
> - Relay compression ratio: 3:1 (three raw scout reports compressed into one prioritized alert)
> - Scout broadcast interval: every tick (aggressive, high emission, but Mission 10 enemies already know you're there)"

This IS the Screeps blog post. It's not code, but it's a detailed architectural explanation tied to a concrete, importable configuration. Other players reading it can import the architecture, study the replay, and build on the insight.

**Minute 8:00 — The Community Response**

Two days later, Dex checks the gallery. His "Adaptive Dual-Lane v1" has 89 downloads. A player named relay_queen published "Adaptive Dual-Lane v2" — a modification that replaces one scout with a specialist using the "hack" skill to disable enemy relays, reducing incoming noise and therefore reducing the congestion that triggers rerouting. relay_queen's variant clears Mission 10 in 16 ticks — faster than Dex's 17 but still behind signal_architect's 15.

The optimization conversation is happening through published configs, not forum posts. Each config IS an argument. Each tick count IS evidence. The gallery is a peer-reviewed journal where the artifacts are executable and the metrics are deterministic.

**UI Annotations:**
- **Leaderboard panel:** Vertical list in Blueprint Codex, rank numbers in gold for top 3, player names left-aligned, tick counts right-aligned with color gradient (green for fast, amber for medium, red for slow), unit composition shown as a row of 16px unit type icons
- **Architecture description editor:** Multi-line text field with basic markdown support (bold, italic, bullet lists, code blocks for config snippets), 2000-character limit, displayed below the architecture's wiring diagram in the gallery detail view
- **Derivative tracking:** When a published config's description mentions another player's config by name, a "Based on" link automatically appears, creating a visible lineage chain (Adaptive Dual-Lane v1 → v2 → v3)
- **Replay comparison mode:** Side-by-side Inspector view showing two different players' replays of the same mission, ticks synchronized, with diff highlighting (units that move differently flash amber)

---

### Journey: Amara, 41, Middle School Teacher

**Context:** Uses Robot Uprising in her CS class. 25 students, varying skill levels. She needs to distribute starter configurations to students and collect their modifications for grading. The sharing system is her classroom infrastructure.

**Minute 0:00 — The Lesson Prep**

Amara opens the Plan screen on her laptop. She's built three "starter" blueprints for tomorrow's class: a basic scout, a basic striker, and a pre-wired two-unit architecture (scout reports to striker). She needs to distribute these to 25 students who will each modify one element — either adding a rule, changing a hook channel, or adjusting context config — and submit their modified version.

She clicks the export button on each blueprint. Three strings appear. She pastes them into a Google Doc titled "Mission 5 Starter Kit — Period 3." Below each string, she writes: "Import this blueprint. Change ONE thing. Export your modified blueprint and paste it into the submission form."

**Minute 0:15 — The Classroom Session**

Students open Robot Uprising on their Chromebooks. They paste the first blueprint string into the import field. The preview card appears. Some students immediately see what to change — a student who plays Factorio at home notices the context config has no eviction priority set and adds "oldest-first." A quieter student hovers over the empty hook slot and asks what would happen if the scout also sent to a second channel.

The frictionless import/export means no accounts, no logins, no friend requests, no platform friction. Paste. Import. Modify. Export. Paste into Google Form. Done.

**Minute 5:00 — The Gallery as Teaching Tool**

Amara projects the class gallery on the smartboard — she created a private gallery tag (#period3-m5) and all student submissions are tagged with it. The gallery shows 25 config cards, each with a student name, their modification summary, and a "Watch Replay" button (each student ran their config against Mission 5 during class).

She clicks the card from a student named Joaquin. His modification: added a rule that makes the scout evade when its context window is more than 80% full. She watches Joaquin's replay. On tick 7, the scout's context bar turns amber, the evade rule triggers, and the scout retreats. It survives. The original scout (without this rule) would have been stunned and eliminated. Amara highlights this on the smartboard: "Joaquin's rule prevented context overload. What other conditions could trigger evasion?"

**UI Annotations:**
- **Private gallery tags:** Tags prefixed with # are searchable in the gallery but not featured or promoted, functioning as unlisted collections
- **Batch export:** Select multiple blueprints in the library, right-click → "Export All" generates a multi-blueprint string with separator markers, importable as a batch
- **Replay embed:** Gallery entries with replays include a "Watch" button that opens a lightweight Inspector view (no copy functionality, read-only), suitable for projection and classroom review

---

## Strengths and Weaknesses Summary

| Dimension | Blueprint Exchange (A) | Config Gallery (B) | Open Architecture (C) |
|---|---|---|---|
| **Discovery** | External only (Discord, Reddit) | In-game, browsable | Automatic via Inspector |
| **Friction** | Lowest (copy-paste) | Medium (browse, download) | Zero (opt-out sharing) |
| **Attribution** | None built-in | Full (creator, stats) | Full (replay linked to player) |
| **Learning depth** | Shallow (config only) | Medium (config + description) | Deep (config + full replay + decision traces) |
| **Infrastructure** | None | Backend needed | Replay storage needed |
| **Privacy** | Full control | Publish is explicit | Opt-out required |
| **Community vocabulary** | Emerges externally | Tags create vocabulary | Patterns emerge from observation |
| **Spoiler risk** | Low (must seek out) | Medium (visible in-game) | High (visible after every mission) |

## Recommended Hybrid: "The Open Workbench"

The strongest design combines all three layers:

1. **Blueprint Exchange (always available):** Every config has a copy-paste export string. Zero infrastructure. Works from day one.

2. **Config Gallery (post-campaign):** Unlocks after completing Mission 10. Not available during the campaign to prevent spoilers. Becomes the endgame optimization community.

3. **Open Architecture (per-mission, post-clear):** After you clear a mission, other players' replays of that same mission become visible in your Inspector. You can only see replays for missions you've already beaten — no spoilers, but unlimited learning for optimization.

4. **Technique naming (emergent):** The gallery supports tagging and descriptions. Named patterns emerge organically. A "Community Patterns" section in the Blueprint Codex surfaces the most-used tags as named techniques with descriptions, creating the RoboWiki equivalent inside the game.

The spoiler gate is critical: you earn the right to see other approaches by solving the mission yourself first. This preserves the discovery and struggle of the campaign while creating a rich post-clear optimization culture.

---

## Interaction Effects

- **Inspector design (locked):** The Open Architecture model depends entirely on the Inspector's ability to show another player's replay with full decision traces. The Inspector is already designed for this depth — click-to-inspect, decision trace, context window chart. Adding "other player's replay" is a data source change, not a UI change.

- **Blueprint Codex (locked):** The Config Gallery naturally lives inside the Codex as a new tab. The Codex already has the card-collection visual language.

- **Sealed watch (locked):** The "no skip, no pause, no tools" rule during sealed watch means you MUST watch your own replay before seeing others. The emotional-then-analytical two-act debrief is preserved — you can't shortcut to "how did the top player do it" without first experiencing your own run.

- **Mission retry granularity:** Shared configs create a "try this approach" loop that increases mission retry rate. The production queue conveyor belt's drag-to-reorder interface must be fast enough to support rapid iteration.

- **Deterministic tick scheduler:** Because the game is deterministic, shared configs produce EXACTLY the same results on the same mission seed. This is both a strength (reproducible, verifiable) and a constraint (no "it worked for me but not for you" mysteries, but also no variation in shared replays unless invisible randomization produces different mission layouts).

---

## Comparable Games Summary

| Game | Sharing Unit | Format | Community Platform | Key Lesson |
|---|---|---|---|---|
| **Screeps** | Full bot codebase | GitHub repo + blog posts | GitHub, Slack, forums | The artifact's native format determines sharing culture |
| **Factorio** | Blueprint | Base64 string | FactorioBin, Reddit, Discord | Frictionless paste-and-play drives volume |
| **Zachtronics** | Solution metrics | Histogram position | In-game histogram, Reddit GIFs | Comparison creates demand for sharing |
| **Gladiabots** | AI behavior tree | Export file | Discord, forums (weak) | Visual configs need explicit serialization support |
| **Robocode** | Strategy technique | Wiki article + code snippet | RoboWiki (20+ years) | Named techniques create shared vocabulary |
| **Slay the Spire** | Seed | Short alphanumeric code | Steam forums, Reddit | Short codes spread virally |

---

## Sensory Description

**Exporting a blueprint:** The player clicks the clipboard icon on a blueprint card. A soft mechanical *snap* sound — like a polaroid camera shutter — plays. The card briefly flashes cyan from its edges inward, a 0.3-second pulse. A small toast notification slides up from the bottom of the screen: "Copied to clipboard" in white text on a dark translucent background, with a tiny clipboard icon. The toast fades after 2 seconds.

**Importing a blueprint:** The player pastes into the import field. The text field glows amber briefly as it parses the string. A preview card materializes from the center of the field, expanding outward with a subtle scaling animation (0.2s, ease-out). The card shows the full blueprint configuration — skills in their slots, rules listed, hooks with channel names. A soft *chime* plays — two ascending notes, like a notification received. The "Import" button glows cyan, the "Cancel" button is dim red.

**Viewing the topology diagram:** When exporting an architecture, the topology diagram draws itself. Channel lines animate from sender to listener, each taking 0.2 seconds, staggered so they cascade. Blueprint icons fade in once their connections are drawn. The whole diagram pulses once — a brief brightness surge — then freezes. The visual style is dark background with cyan lines and white blueprint icons, matching the campaign map's circuit-board aesthetic.

**The gallery browse experience:** Cards load in a staggered grid animation, each card sliding up from below with a 50ms delay between cards, creating a cascading reveal. Hovering a card raises it slightly (2px shadow increase) and brightens its border. Clicking produces a soft *click* sound and the detail view slides in from the right, pushing the grid left. The detail view's blueprint configuration fades in section by section — skills first, then rules, then hooks, then context config — a 0.5-second staggered reveal that guides the eye through the blueprint's structure.

**The "Other Approaches" panel in Inspector:** After the player finishes scrubbing their own replay, the panel slides up from below the board with a soft *whoosh*. Replay thumbnails are animated — tiny 3-second loops showing miniaturized unit movements on the 8x8 board, rendered in reduced detail (units as colored dots, channel lines as thin traces). The animation loops seamlessly. Scrolling the horizontal list produces a smooth inertial slide with each thumbnail's animation staying in sync. The overall effect is like browsing a shelf of snow globes, each containing a tiny living battle.

---

## The TikTok Clip

A split-screen video. Left side: a player's 14-tick Mission 7 clear — units stumbling around, two strikers idle for three ticks, a scout getting eliminated because nobody heard its report. Right side: the same player AFTER importing and studying a community architecture — 7 ticks, units moving in coordinated waves, channel lines flickering like synapses, zero wasted motion. The caption: "Before vs. after I found the Whisper Net config on the gallery." The channel topology diagram appears as an overlay — a beautiful web of connections — then the final board state with all enemies eliminated. Total runtime: 12 seconds.
