# The "Config Necropsy" as Community Artifact

**Aspect:** 7.10 — A community practice where high-Elo players post config evolution retrospectives ("here's v1, here's the attack that broke it, here's v5"); designing the infrastructure to make this easy — version history export, annotatable replay sharing, readable config diff views

**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis / Community

---

## The Core Design Problem

Every competitive game generates post-mortem analysis. Chess has game annotation. Magic: The Gathering has tournament reports. Pokémon VGC has team reports posted on Victory Road and Smogon, where tournament-placing players walk through their team composition, EV spreads, and matchup reasoning. Factorio has blueprint evolution threads on Reddit where players show v1→v2→v3 of a smelting array. Opus Magnum has GIF-sharing culture where players post increasingly optimized solutions.

But Robot Uprising has something none of these games have: **the artifact being analyzed is an attention architecture** — a multi-agent information system with emergent behavior. A config necropsy isn't "here's my deck list" or "here's my move sequence." It's "here's the system I designed, here's how it failed against a specific adversarial pressure, here's the diagnostic process I used to identify the root cause, and here's the structural change I made." The necropsy IS the engineering retrospective.

This makes Robot Uprising's community sharing culture potentially closer to **software engineering postmortems** (Google SRE incident reports, Cloudflare outage writeups) than to traditional game community content. The question is: how do we design infrastructure that makes this natural, frictionless, and socially rewarded?

---

## Six Necropsy Models

### Model 1: "The Changelog" (Linear Version History)

**How it works:** Every time the player modifies their config and deploys it (in campaign or Gauntlet), the game auto-saves a versioned snapshot. The player can access their full version history from the workbench — a scrollable timeline of every config state, tagged with the mission or Gauntlet match where it was deployed, and the outcome (win/loss). To share a necropsy, the player selects a range of versions (e.g., v3 through v7) and exports them as a "Changelog" — a single shareable artifact containing all intermediate states, diffs between each pair, and the associated match outcomes.

**What the export screen looks like:**
The player opens their config history from the workbench sidebar (a clock icon with a small number badge showing total versions). A vertical timeline fills the left panel — each node is a small circuit-board tile showing the version number, a 2-word auto-generated name ("relay-heavy," "stealth-scout," "command-pivot"), the date, and a tiny outcome icon (green checkmark, red X, or amber tilde for mixed results). The player clicks two nodes to define a range. Between selected nodes, the timeline pulses with a cyan trace connecting them. The right panel shows a side-by-side diff of the two endpoints: left is v3, right is v7, with changed elements highlighted in amber (modified), green (added), red (removed). The diff isn't raw text — it's a **visual config diff**: blueprint cards show changed rules with strikethrough/replacement, hook wiring diagrams show rerouted channels with dashed-line ghosts of old connections, context config shows changed priorities with before→after arrows.

A "Narrate" button at the top of the right panel opens a text field where the player can add commentary to each version transition: "v3→v4: enemy was flooding my relay with noise signals. Added filter on recon-net channel. Didn't fix it because the noise was coming from a different channel I wasn't monitoring." These annotations appear inline between diff views.

An "Export Changelog" button at the bottom generates the shareable artifact — a compact URL, a QR code, and a "Copy to Clipboard" button that produces a formatted text block for pasting into Discord.

**What the viewer sees:**
Opening a Changelog link loads a dedicated viewer (in-game or web). The viewer shows the same timeline on the left, but now with the author's annotations visible between nodes. The viewer can click any version to see the full config state, click between any two versions to see the diff, and — critically — can **import any version into their own workbench** as a starting point. Imported configs carry attribution metadata: "Forked from @kai_architect v5 (2026-03-14)."

**Sensory design:**
The timeline has a gentle parallax scroll — nodes in the center of the viewport are full-size, nodes above and below shrink slightly, creating a sense of depth like scrolling through a film strip. Each node's circuit-board tile has a subtle glow matching its outcome (green shimmer for wins, red pulse for losses, amber flicker for mixed). The diff view uses the game's established color language: cyan for player elements, amber for changes, red for removals. Dashed ghost lines for removed hook wiring fade with a 0.3s dissolve animation. Added elements materialize with the same "subsystem ONLINE" flash used in the boot log tutorial.

#### Journey: Kai, 24, Competitive Gauntlet Player

**Context:** Kai has been climbing the Gauntlet ladder for 3 weeks. His relay-chain architecture got him to Diamond tier, but he's hit a wall against aggressive scout-rush opponents. Over 8 matches, he iterated his config from v1 through v8, eventually finding a solution involving a Specialist unit with hack skill that disrupts enemy scout communication.

**Minute 0:00 — Opening the History**
Kai opens his workbench and clicks the clock icon in the sidebar. The version timeline unfurls — 8 nodes, each a tiny circuit tile. v1-v3 glow green (wins during his climb). v4-v6 pulse red (the wall). v7 is amber (close loss). v8 glows green (breakthrough). Kai clicks v3 and v8 to define his necropsy range.

**Minute 0:30 — Reading the Diff**
The right panel shows v3→v8 side by side. His relay network is largely intact, but there's a new Specialist blueprint that didn't exist in v3 — it materializes in green on the right side. Two hook wiring changes: the scout's `threat-detected` channel now routes through the Specialist (amber line with arrow showing reroute), and there's a new `hack-target` channel (green dashed line). Kai hovers over the Specialist blueprint — a tooltip shows it was added in v6 and modified in v7 and v8.

**Minute 1:00 — Writing Annotations**
Kai clicks "Narrate" and types between v3 and v4: "Started losing to scout-rush. My relays were getting flanked before they could compress threat data." Between v5 and v6: "Tried adding a second relay for redundancy. Didn't help — the problem wasn't relay capacity, it was that scouts were dying before they could report." Between v6 and v7: "Hypothesis: disrupt enemy coordination instead of improving my own. Added Specialist with hack. First attempt: hack target selection was wrong — was hacking enemy relays when I should have been hacking their scouts." Between v7 and v8: "Changed hack target rule to prioritize enemy units with active hook transmissions. This disrupts their coordination at the source. Combined with my existing relay chain, I now out-inform them even when they have more scouts."

**Minute 2:00 — Exporting**
Kai clicks "Export Changelog." A modal appears with three options: compact URL (for Discord), QR code (for streaming overlays), and formatted text (for forum posts). He copies the URL and pastes it into the Robot Uprising Discord's `#config-necropsies` channel with: "Relay chain vs scout rush — how I broke through Diamond. 8 versions, 3 weeks."

**Minute 2:30 — Community Response**
Within an hour, three responses: one player imported v8 and is testing it against their own scout-rush config. Another noticed Kai's v6 redundant-relay idea and suggests it would work if paired with a different eviction priority. A third posted their OWN changelog showing a completely different solution to the same scout-rush problem — using a Command agent to dynamically reassign skills mid-battle.

**UI Annotations:**
- **Clock icon:** Top of workbench sidebar, badge shows version count (red badge if >20 unreviewed)
- **Timeline nodes:** 48×48px circuit tiles, glow color = outcome, slight parallax depth
- **Range selection:** Click two nodes, cyan trace connects them, all intermediate nodes highlighted
- **Diff view:** Visual config diff — not text, not raw data. Blueprint cards, hook wiring diagrams, context config panels
- **Narrate field:** Markdown-capable text input between version transitions, 500 char limit per transition
- **Export modal:** Three export formats, preview of each, "Copy" button with checkmark confirmation

---

### Model 2: "The Annotated Replay" (Match-Centric Necropsy)

**How it works:** Instead of starting from config versions, the necropsy starts from a specific match replay. The player watches a replay in the Inspector, and at key moments — the pivot tick, a cascade failure, a successful combo — they drop **annotation pins**. Each pin is a timestamped note: "This is where my relay got overloaded. Watch the buffer bar — it goes from green to red in 2 ticks." The annotated replay is the primary artifact, with the config diff available as supplementary context.

**What the annotation interface looks like:**
During Inspector replay scrubbing, a small pin icon appears at the bottom-right of the screen. Tapping it drops a gold diamond marker on the timeline at the current tick. A text field slides up from the bottom — the player types their annotation. The annotation appears as a floating speech bubble above the relevant unit (if one was selected) or as a banner at the top of the screen. Multiple pins create a guided tour through the replay.

When shared, the viewer experiences the replay with annotations appearing at the correct ticks — like watching a YouTube video with director's commentary. They can pause at any pin to study the board state, inspect unit buffers, and view the config that was active at that moment.

**The annotated replay differs from a raw replay** in that it contains the author's diagnostic reasoning — not just what happened, but why it happened and what the author learned from it. The pins transform a replay from raw data into curated knowledge.

**Sensory design:**
Annotation pins on the timeline are gold diamonds (matching the locked "decisive moment" diamond from the Inspector design). When playback reaches a pin, the battlefield dims slightly (15% opacity reduction on non-relevant units), the annotated unit gets a soft spotlight (subtle radial gradient beneath), and the speech bubble materializes with a paper-unfold animation — two triangles folding open from the pin point. The bubble has a warm cream background with the author's text in the game's monospace font, and a small avatar icon of the author in the corner. A gentle chime (two ascending notes, major third interval) plays when each pin appears.

#### Journey: Amara, 31, Twitch Streamer and Content Creator

**Context:** Amara just had an epic Gauntlet match — her relay chain held for 80 ticks against an aggressive opponent, but a single misrouted signal in tick 73 caused a cascade failure that lost her the match. She wants to create content around the dramatic reversal.

**Minute 0:00 — Entering the Inspector**
The match ends. Sealed watch plays. Amara watches her relay chain hum beautifully for 70 ticks — signal chains visible as cyan dashed lines pulsing between units. Then at tick 73, a green flash on the wrong relay. By tick 76, her striker is looking the wrong direction. By tick 79, her base is destroyed. The sealed watch ends. The Inspector materializes.

**Minute 0:45 — Scrubbing to the Moment**
Amara scrubs the timeline back to tick 72 — one tick before the failure. She selects her central relay (RELAY-B) and inspects its context window. Six slots, all occupied. She sees the problem: slot 3 contains a stale observation from tick 58 that should have been evicted but wasn't, because her eviction priority was set to "oldest non-signal" and this entry was technically a signal, just an ancient one. She drops her first pin: "The root cause. RELAY-B has a 15-tick-old signal taking up a buffer slot. My eviction priority doesn't evict old signals — only old observations. This is the time bomb."

**Minute 1:30 — Tracing Forward**
She advances tick by tick. At tick 73, a new enemy position signal arrives. RELAY-B's buffer is full. The new signal evicts the OLDEST NON-SIGNAL entry — which happens to be the most recent enemy position update. RELAY-B compresses and forwards the stale data instead. Pin 2: "Tick 73: the cascade begins. The relay compresses STALE data because the freshest observation was evicted to make room. The compress skill doesn't know the data is old — it just processes whatever's in the buffer."

**Minute 2:15 — The Domino Effect**
Tick 74: the striker receives the compressed (stale) signal and moves to intercept an enemy that's no longer there. Pin 3: "Watch the striker. It moves northwest — toward where the enemy WAS 15 ticks ago. The enemy is actually southeast now. This is what acting on stale intelligence looks like."

**Minute 3:00 — Exporting the Annotated Replay**
Amara clicks "Export Annotated Replay." She selects the "Streamer Format" — annotations appear with her Twitch avatar, and the export includes a 15-second highlight clip centered on pins 2-3 (the cascade moment) for social media. She also exports the full annotated replay link.

**Minute 3:30 — Community Impact**
Amara posts the highlight clip to Twitter. 45 seconds of a relay chain working perfectly, then a single green flash on the wrong unit, then the whole system collapsing in 6 ticks. Caption: "15-tick-old signal destroyed my Diamond run. Watch the buffer." The clip gets 12K views. 200 people click through to the full annotated replay. A thread develops about eviction priority design — specifically, whether "signal age" should be a configurable eviction factor. Three different players post their OWN eviction priority configs that would have survived this scenario.

**UI Annotations:**
- **Pin button:** Bottom-right during Inspector scrub, gold diamond icon, tap to drop
- **Annotation bubble:** Cream background, monospace text, author avatar, paper-unfold animation
- **Timeline pins:** Gold diamonds on scrubber bar, spaced apart (minimum 3 ticks between pins to prevent clutter)
- **Highlight clip:** Auto-extracted from pin range, 15-second maximum, includes 5 ticks of context before first pin
- **Viewer controls:** Play/pause, skip-to-next-pin, toggle annotations on/off, "Inspect This Tick" button to open full Inspector view

---

### Model 3: "The Diff Report" (Structured Engineering Postmortem)

**How it works:** A templated, semi-structured document — like an incident report or a Google SRE postmortem. The player fills in sections: **Summary** (one sentence), **Config Version** (with link), **Failure Mode** (what went wrong), **Root Cause** (why it went wrong), **Fix Applied** (what changed), **Verification** (match result after fix), **Lessons Learned** (transferable insight). The game pre-populates some fields from match data (e.g., "your buffer utilization exceeded 90% on 3 units during ticks 40-55") and the player fills in the interpretation.

**What the authoring screen looks like:**
The player opens "New Necropsy" from the community hub. A document template fills the screen — a warm parchment-textured background (echoing the boot log aesthetic) with section headers in the game's teal accent color. The Summary field has a 140-character limit (tweet-length — forces concision). The Config Version field has a dropdown showing recent versions with thumbnails. The Failure Mode section has a free-text field plus a "Tag failure type" dropdown: *buffer overflow, stale data, cascade failure, timing mismatch, enemy counter, production bottleneck, hook deadlock, EM exposure*. The Fix Applied section shows a visual diff (auto-generated from the config versions selected) with annotation slots.

A sidebar shows **auto-detected metrics** from the match: buffer utilization sparklines, signal latency numbers, EM emission timeline, kill/death events. The player can drag any metric into their report as an inline embed — "drag this sparkline into your Root Cause section to show the buffer spike."

**The key design insight:** The template structure teaches postmortem thinking. A player who writes 10 necropsies has practiced structured failure analysis 10 times. The necropsy template is itself a pedagogical tool — the sections mirror real-world incident response (Summary = Jira title, Root Cause = 5 Whys, Lessons Learned = retro action items).

**Sensory design:**
The document has a warm, slightly textured background — not sterile white, but the same parchment warmth of the boot log, as if the necropsy is another diegetic document. Section headers pulse gently when empty (inviting completion) and settle into a steady glow when filled. Auto-populated metrics appear as embedded sparkline cards with a subtle data-blue background. When the player drags a metric into a text section, it lands with a satisfying magnetic snap and a brief blue flash. The completed report, when viewed by others, has a "classified document" aesthetic — a thin red border, a stamp-style classification header reading "POST-ENGAGEMENT ANALYSIS // [MISSION/GAUNTLET] // [DATE]" — reinforcing the diegetic fiction that the player is an AI filing official reports.

#### Journey: Dr. Priya, 38, ML Engineer and Casual Player

**Context:** Dr. Priya plays 3-4 Gauntlet matches per week. She just lost a match she should have won — her architecturally-sound relay chain lost to a simpler scout-rush because her production queue was wrong. She wants to document the lesson before she forgets it.

**Minute 0:00 — Opening the Template**
Dr. Priya navigates to the community hub and clicks "New Necropsy." The template loads. She sees the familiar parchment texture, feels the weight of the classified-document header: "POST-ENGAGEMENT ANALYSIS // GAUNTLET // 2026-03-14." She starts with Summary: "Lost to scout-rush despite superior architecture — production queue prioritized relay over striker, leaving base undefended for 12 ticks."

**Minute 0:45 — Selecting Versions**
She clicks the Config Version dropdown. Two recent versions appear: v12 (deployed in the losing match) and v13 (her fix, deployed in a subsequent winning match). She selects both. The visual diff auto-generates in the Fix Applied section: the production queue strip shows v12's order (Scout → Relay → Relay → Striker) alongside v13's (Scout → Striker → Relay → Striker), with the reordered elements highlighted in amber.

**Minute 1:30 — Filling Root Cause**
In the Root Cause section, she writes: "My relay-first production order assumes the opponent will also build infrastructure first. Against scout-rush, I had no combat presence until tick 18. The opponent had 3 strikers by tick 12." She drags the production timeline sparkline from the sidebar into this section — it shows her unit count over time versus the opponent's, with a visible gap between ticks 8-18 where she has 0 strikers and the opponent has 3.

**Minute 2:15 — Tagging and Publishing**
She tags the failure type as "production bottleneck." In Lessons Learned, she writes: "Production queue must be opponent-aware, not architecture-first. Consider: if the opponent is building combat units while I'm building infrastructure, I need at least one early striker as insurance. The relay chain is useless if the base dies before it's finished." She clicks "Publish." The necropsy gets a permanent URL and appears in the community feed.

**Minute 3:00 — Discovery**
A week later, she searches the necropsy archive for "production bottleneck" — 14 results. She reads three from players ranked higher than her. One describes the same relay-first problem but with a different solution: a Command agent that dynamically reorders the production queue based on scouted enemy composition. She hadn't thought of that. She imports the player's config as a study reference.

**UI Annotations:**
- **Template sections:** Summary (140 char), Config Version (dropdown with thumbnails), Failure Mode (free text + tag dropdown), Root Cause (free text + metric embed), Fix Applied (auto-diff + annotation), Verification (match link + outcome), Lessons Learned (free text)
- **Metric sidebar:** Scrollable panel of auto-extracted match data, each metric is a draggable card
- **Drag-to-embed:** Blue snap animation, metric card resizes to inline width
- **Publish button:** Bottom-right, "classified stamp" animation on publish (red seal impression)
- **Search/browse:** Tag-based filtering, full-text search, sort by recency/rating/author-Elo

---

### Model 4: "The Evolution Tree" (Branching Config Genealogy)

**How it works:** Instead of a linear version history, the player's config history is visualized as a **branching tree**. Every time the player creates an alternative version (to test a different approach) without abandoning the original, the tree branches. Dead-end branches (configs that lost and were abandoned) are rendered as grey stubs. The main line of development glows cyan. The tree itself is the community artifact — it shows not just what the player built, but what they considered and rejected.

**What the tree looks like:**
A horizontal tree growing left to right. The root is v1 (leftmost). Each node is a small config thumbnail (simplified to show unit composition as colored dots — cyan for scout, red-orange for striker, magenta for relay, etc.). Branches extend right and slightly up or down. The main trunk (the configs that were actually deployed in successful matches) glows cyan. Dead-end branches are desaturated grey with a small X at their terminal node. Active branches (configs the player is still considering) pulse amber.

Hovering over any node shows a tooltip with: version name, date, one-line annotation, match outcome, and a "diff from parent" summary (e.g., "+1 hook, -1 rule, changed eviction priority"). Clicking a node opens the full config. Clicking between two nodes shows the diff.

The tree can be shared as a single artifact. Viewers see the full branching history — including the dead ends. This is the key insight: **the dead ends are as valuable as the main line.** They show what the player tried and why it didn't work. In software engineering, this is the pull request history — the closed PRs, the reverted commits, the experiments that informed the final solution.

**Sensory design:**
The tree renders on a dark background with a subtle grid pattern (echoing the battlefield). Nodes are small glowing orbs connected by lines that fade from bright at the main trunk to dim at dead ends. The main trunk has a gentle particle flow animation — tiny cyan dots flowing left to right along the line, suggesting the "flow" of development. Dead-end branches have no particle flow — they're static, inert. When the player hovers over a dead end, a brief amber flicker shows it was once alive. Branch points have a small diamond marker (a decision point). The whole tree has a gentle breathing animation — nodes slightly expand and contract on a 3-second cycle, like a living organism.

#### Journey: Marcus, 45, Former Chess Tournament Player

**Context:** Marcus has been playing Robot Uprising for 6 weeks. He's a methodical player who tests multiple approaches before committing. His config history has 34 versions across 8 branches — he's been experimenting with three fundamentally different architectures (relay-chain, scout-swarm, and command-heavy) before settling on a hybrid.

**Minute 0:00 — Viewing His Tree**
Marcus opens his evolution tree from the profile screen. The tree fills the screen — 34 nodes across 8 branches, spreading right like a river delta. The main trunk is easy to trace: a bright cyan line running through the center with 18 nodes. Five branches extend above and below, all desaturated grey (abandoned experiments). Two branches pulse amber (active alternatives he's still considering).

He zooms in on the first major branch point — v5, where he split into relay-chain (upward) and scout-swarm (downward). The relay branch continues for 12 versions. The scout branch has 4 nodes, all grey, terminating with an X. He hovers over the terminal scout node: "v5-scout-d: tried scout-heavy with no relays. Information was fresh but uncompressed — strikers couldn't process raw observations fast enough. Buffer overload on every striker by tick 15."

**Minute 1:00 — Sharing the Tree**
Marcus wants to show his chess club (who also play Robot Uprising) why he abandoned the scout-swarm approach. He selects the first branch point and the scout branch, then clicks "Share Branch." The export includes: the branch point config (v5), all 4 scout-branch configs, the diffs between each, and Marcus's annotations on each terminal node. But critically, it ALSO includes the parent trunk for context — showing what the scout branch was branching FROM.

**Minute 1:30 — A Chess Club Discussion**
In their Discord, Marcus posts the branch export with: "Here's why pure scout-swarm doesn't work in the current meta. 4 attempts, all failed at buffer overload. The problem is fundamental: scouts generate too much raw data for strikers to consume without relay compression." Three club members respond. One posts a counter-argument — their OWN evolution tree, showing a successful scout-swarm branch that survived by using a different eviction priority (newest-first instead of oldest-first, sacrificing historical awareness for real-time responsiveness). Marcus hadn't tried that. He creates a new branch from his abandoned scout-swarm node to test the suggested eviction change.

**Minute 3:00 — The Meta-Insight**
Looking at his full tree, Marcus realizes something: every successful branch involves at least one relay. His tree is visual proof that relay compression is load-bearing in his playstyle. He adds a tree-level annotation: "Every viable architecture I've found requires relay compression. The game is fundamentally about information compression, not information gathering."

**UI Annotations:**
- **Tree view:** Horizontal left→right, zoomable/pannable, main trunk cyan, dead ends grey, active alternatives amber
- **Node hover:** Tooltip with version name, date, annotation, outcome, diff summary
- **Branch share:** Select branch point + branch, export includes parent context
- **Tree-level annotations:** Free-text notes attached to the tree as a whole (not individual nodes)
- **Branch resurrection:** Click a dead-end X to "reopen" the branch and create a new child node from it

---

### Model 5: "The Matchup Matrix" (Adversarial-Centric Necropsy)

**How it works:** Instead of narrating config evolution, this model organizes the necropsy around **matchups**. The player builds a matrix: rows are their config versions, columns are opponent archetypes they've faced (scout-rush, relay-chain, command-heavy, stealth, etc.). Each cell shows the outcome (win/loss) and a one-line note. The matrix reveals patterns: "v3 beats relay-chains but loses to scout-rush. v5 beats scout-rush but loses to command-heavy. v8 handles all three."

This model is inspired by **Magic: The Gathering sideboard guides** — tournament reports that organize analysis by matchup rather than by card-by-card reasoning. In MTG, a player writes: "Against Mono-Red Aggro, board in X and Y, board out A and B, mulligan aggressively for Z." In Robot Uprising, the equivalent is: "Against scout-rush, config v5 with aggressive early striker production and compressed buffer on relays."

**What the matrix looks like:**
A grid fills the screen. Row headers on the left show config version thumbnails (small unit composition dots). Column headers across the top show opponent archetype icons — a sprinting figure for scout-rush, a web pattern for relay-chain, a crown for command-heavy, a ghost for stealth, a factory for production-spam. Each cell contains a colored dot (green/red/amber) and expands on click to show the one-line note, the match replay link, and the specific config changes that addressed this matchup.

The matrix's power is **pattern revelation**. A column of all-red dots means "I have never beaten this archetype." A row of all-green dots means "this config version is a generalist." A diagonal pattern (green→red→green→red across versions) means "I'm oscillating — each fix breaks something else." The matrix makes meta-strategic patterns visible.

**Sensory design:**
The grid has a war-room aesthetic — dark background, thin white grid lines, cell dots that pulse gently. Green dots have a steady glow. Red dots have a subtle heartbeat pulse. Amber dots flicker. The overall impression is of a situation board — tactical data at a glance. When the player hovers over a column header (opponent archetype), all cells in that column brighten and the rest dim — spotlight mode. When they hover over a row (config version), same effect. Cross-hover (row + column) highlights a single cell with maximum brightness. Scrolling the matrix horizontally produces a subtle parallax — version thumbnails scroll slightly slower than the grid, creating a layered depth effect.

#### Journey: Zara, 22, College Student and Aspiring Competitive Player

**Context:** Zara has been playing Gauntlet for 2 months, bouncing between Gold and Platinum. She keeps winning against relay-chain players but losing to aggressive rushes. She's iterated her config 14 times and can't find a stable solution.

**Minute 0:00 — Building the Matrix**
Zara opens her matchup matrix. The game auto-populates it from her Gauntlet match history — 14 config versions × 5 opponent archetypes she's faced. The pattern is immediately visible: the relay-chain column is almost entirely green. The scout-rush column is almost entirely red. The command-heavy column is a mix. She's been solving the same problem (scout-rush) for 2 weeks and every fix has weakened her relay-chain matchup.

**Minute 0:45 — Spotting the Oscillation**
She hovers over the scout-rush column and reads her notes chronologically: v8 "added early striker," v9 "moved striker earlier in production queue," v10 "added second scout for early warning," v11 "back to relay-first, second scout too expensive," v12 "tried Specialist with hack to disrupt enemy scouts," v13 "hack too slow, back to early striker," v14 "early striker + reduced relay count." The pattern is clear: she's oscillating between "more combat" and "more intelligence," never finding the balance.

**Minute 1:30 — Sharing for Help**
Zara exports her matrix and posts it in Discord's `#help-me-fix-this` channel: "I've been oscillating for 2 weeks. My relay matchup is great but I can't crack scout-rush without breaking it. Matrix attached." A Diamond player responds within minutes: "Your matrix shows the classic relay-specialist trap. You need the relay chain for intelligence but can't afford to build it fast enough against rush. Solution: don't try to outproduce them. Instead, configure your relay to prioritize survival signals — when your relay detects adjacent enemy, it stops compressing and starts signaling retreat to the nearest ally. The relay becomes a tripwire, not a pipeline."

**Minute 2:30 — The Aha Moment**
Zara hadn't thought of using her relay defensively. She creates v15 with the suggested change — a new rule on her relay blueprint: "IF adjacent_enemy THEN broadcast retreat-signal ON emergency channel." She runs it against the scout-rush scenario. The relay survives because the striker receives the retreat signal and moves to protect it. v15 gets green dots in BOTH the relay-chain AND scout-rush columns. She adds a matrix annotation: "The relay isn't just infrastructure — it's a sensor. Dual-purpose configs beat oscillation."

**UI Annotations:**
- **Matrix grid:** Dark background, white gridlines, colored dots (green/red/amber) per cell
- **Row headers:** Config version thumbnails with unit composition dots
- **Column headers:** Opponent archetype icons with hover-to-spotlight
- **Cell expansion:** Click to show note, replay link, config changes
- **Oscillation detector:** Auto-detected when 3+ alternating win/loss in a column, shown as a small orange spiral icon in column header
- **Export:** Full matrix as shareable image or interactive link

---

### Model 6: "The Community Autopsy" (Collaborative Post-Mortem)

**How it works:** Rather than a single player writing a necropsy, this model enables **collaborative analysis**. A player shares a losing replay and their config, and the community annotates it together. Think of it as a code review, but for game configurations. Multiple analysts can add their own annotation pins to the same replay, offer alternative fixes, and vote on the most insightful analysis.

**What the collaborative space looks like:**
The replay player is central — the familiar Inspector view with the timeline scrubber. But the right sidebar now shows a **thread panel** — like GitHub pull request comments. Each thread is anchored to a specific tick and optionally a specific unit. Threads are sorted by tick order (chronological with the replay). Each thread shows the author's avatar, their Gauntlet rank (as credibility signal), and their analysis. Other users can reply, creating nested discussion. A "Best Analysis" upvote system (not simple likes — a single checkbox: "this analysis taught me something") floats the most educational threads to the top.

The config itself is shown in a **review mode** — similar to a GitHub code review, with line-by-line (or rather, element-by-element) commenting. Community members can highlight a specific rule, hook, or context config setting and attach a comment: "This eviction priority is the root cause. Consider changing to signal-age-weighted." These comments are tied to the config version, not the replay — so they persist even when the replay is no longer relevant.

A **"Fork & Fix" button** lets any community member create a proposed fix: they clone the config, make changes, and submit their modified config as a "proposed fix" — like a pull request. The original poster can accept, reject, or discuss each proposed fix. If accepted, the fix is incorporated with full attribution.

**Sensory design:**
The thread panel has a warm amber tint — distinct from the Inspector's cool cyan analytical palette. This signals "human discussion" versus "machine analysis." Thread anchors on the timeline are small amber circles (contrasting with the gold diamond of the decisive moment marker). When a thread is selected, a thin amber line extends from the timeline marker to the corresponding unit on the board, creating a visual connection between discussion and battlefield state. The Fork & Fix proposals appear as small branching arrows (🔀) next to the original config, in green — suggesting growth, improvement, possibility.

#### Journey: Tomás, 16, High School Student and New Player

**Context:** Tomás just finished the campaign and played his first 5 Gauntlet matches. He went 1-4. He doesn't understand why his configs keep losing. He posts his worst loss for community review.

**Minute 0:00 — Posting for Review**
Tomás opens the community hub and clicks "Request Analysis." He selects his worst match (a 12-tick blowout where his entire army was eliminated). The game prompts: "What would you like help understanding?" Tomás types: "I don't know why my scouts keep dying before they can report anything." He clicks "Post." His replay and config are now visible to the community.

**Minute 0:30 — First Response**
A Platinum player named Kai opens Tomás's replay. She scrubs to tick 3 — the first scout death. She adds a thread: "Your scout has 6 buffer slots and all 6 are full by tick 2 — it's context overloaded. Look at its channel subscriptions: it's listening to BOTH `recon-net` and `command-orders`. A scout doesn't need command orders — that's unnecessary input filling the buffer. The scout is stunned from overload at tick 3, and the enemy striker is adjacent." She marks this as a config review comment on the scout blueprint's context config: "Remove `command-orders` from listen list."

**Minute 1:30 — A Debate Emerges**
A Diamond player disagrees: "The real problem isn't the listen list — it's the lack of an evade rule. Even with a clean buffer, this scout has no rule telling it to flee from adjacent enemies. Add: IF adjacent_enemy AND enemy_type=striker THEN move_away." A third player responds: "Both are right. Fix the buffer AND add evade. One without the other still fails." Tomás can see all three perspectives, each attached to a specific tick and unit.

**Minute 2:30 — Fork & Fix Proposals**
Kai submits a Fork & Fix: she's cloned Tomás's config, removed `command-orders` from the scout's listen list, and added a basic evade rule. She re-ran it against the same scenario — the scout survives until tick 9 instead of tick 3. The Diamond player submits their own Fork & Fix: same eviction change plus a different evade rule that considers distance, not just adjacency. Their version has the scout surviving until tick 14.

**Minute 3:30 — Learning**
Tomás reads both fixes. The side-by-side diff shows exactly what each reviewer changed. He accepts the Diamond player's fix (longer survival) but adds Kai's insight about unnecessary channel subscriptions to his "Lessons Learned" note: "Don't subscribe units to channels they don't need. Every subscription is a buffer pressure source." He's learned a principle, not just a fix.

**UI Annotations:**
- **"Request Analysis" button:** Community hub, one-click replay + config share with prompt
- **Thread panel:** Right sidebar, amber-tinted, tick-anchored threads with author rank badges
- **Config review mode:** Element-by-element commenting on config, similar to code review
- **Fork & Fix:** Green branching arrow button, clone → modify → submit workflow
- **"Best Analysis" vote:** Single checkbox per thread, floats educational content
- **Side-by-side Fork comparison:** Two Fork & Fix proposals shown simultaneously with diff highlights

---

## Interaction Effects

### Necropsy × Inspector (4.20, 4.36, 4.38)

The Inspector's existing tools — signal genealogy, decision trace, counterfactual explorer — are the raw material for necropsies. The Minimum Fix Explorer (4.36) generates exactly the kind of insight that belongs in a necropsy's "Root Cause" section. Design consideration: should the Inspector have a "Start Necropsy" button that pre-populates a Diff Report template with the current Inspector findings? This reduces friction from "analysis" to "publication."

### Necropsy × Sealed Replay (4.04b, 1.06c-ext-A)

The sealed replay creates the emotional first-act experience. The necropsy is the analytical second-act artifact. Together, they form a complete content unit: "Watch me lose dramatically, then learn why." For streamers, this is a natural content structure — the sealed replay is the drama, the necropsy is the education.

### Necropsy × Leaderboards (7.05)

Necropsy authorship could be a tracked community metric — "necropsies published," "necropsies with 10+ Best Analysis votes," "Fork & Fix proposals accepted." This creates a reputation economy around diagnostic skill, not just competitive rank. A Gold-tier player who writes exceptional necropsies has a different kind of community status than a Diamond player who doesn't share.

### Necropsy × Config Codes (7.03a)

Every config version in a necropsy needs to be importable. Config Codes (compact serialization) are the technical prerequisite. The Changelog model requires N config codes (one per version), the Evolution Tree requires M codes (one per node), and the Community Autopsy requires codes for both the original and every Fork & Fix proposal.

### Necropsy × Modding (7.04)

Community-created missions designed around specific failure modes ("this mission is designed to trigger buffer overflow on relay-heavy configs") become natural necropsy generators. Players who lose to a community mission can share their necropsy, and the mission creator can see how their design challenged the community.

### Necropsy × EDT / Career Metrics (4.25, 4.26)

EDT trajectory (4.25) is a career-level metric. Necropsies are the qualitative story behind the quantitative curve. A player whose EDT trajectory improved from 0.20 to 0.45 over a season can share a necropsy series showing the specific config changes that drove the improvement — "here's the necropsy for each inflection point in my EDT curve."

---

## Comparable Games and Systems

### Opus Magnum — GIF + Histogram Culture
Opus Magnum's one-click GIF export created a viral sharing loop: solve puzzle → export GIF → post to Reddit → compare histogram positions → iterate → re-post. The key insight: **the sharing format must be frictionless.** Opus Magnum's GIF is a single button press. Robot Uprising's necropsy must approach that level of ease, despite being a much richer artifact. The Changelog's "select two versions and click Export" is the closest analog.

### Magic: The Gathering — Tournament Reports and Sideboard Guides
MTG tournament reports on sites like Star City Games follow a standard format: deck list, matchup analysis, sideboard plans, round-by-round results, takeaways. This is almost exactly the Diff Report model. The Matchup Matrix model is inspired by MTG sideboard guides, which organize analysis by opponent archetype. Key learning: MTG reports are valuable because they contain the **reasoning**, not just the list. "I boarded in Counterspells against Control" is useless; "I boarded in Counterspells against Control because their deck has 8 must-answer threats and my maindeck only has 4 answers" is educational.

### Pokémon VGC — Team Reports on Victory Road and Smogon
VGC team reports on Victory Road follow tournament results — players who place in the top cut write detailed breakdowns of their team composition, EV spread reasoning, matchup plans, and round-by-round narratives. The community values reports that explain **why** each Pokémon was chosen, not just what the team is. The Smogon Teambuilding Competition adds a social dimension: weekly challenges where players submit teams with explanations and the community votes. Robot Uprising's Community Autopsy model captures this social-voting dynamic.

### Factorio — Blueprint Sharing and Evolution
Factorio's blueprint strings create a copy-paste sharing culture: encode your factory as a string, paste it into Discord, anyone can import it. The community evolved from sharing single blueprints to sharing **blueprint books** (collections) to sharing **progression sequences** ("here's my early-game smelter, here's my mid-game, here's my late-game"). This progression-sharing maps directly to Robot Uprising's Changelog model. Key learning: Factorio players debate whether blueprint sharing "ruins" the game by letting players skip the design process. Robot Uprising should lean into sharing because the CONFIG is not the insight — the DIAGNOSTIC REASONING is. Sharing a config without the necropsy is like sharing code without the commit message.

### Software Engineering — Postmortem Culture
Google's SRE book popularized the blameless postmortem: structured document with timeline, root cause analysis, action items, and lessons learned. Cloudflare, GitHub, and other companies publish public postmortems after outages. These are almost exactly the Diff Report model. The key cultural insight: **blamelessness**. The best postmortems focus on systemic causes, not individual mistakes. Robot Uprising's necropsy culture should encourage "my config had a structural weakness" rather than "I made a dumb mistake."

### GitHub — Pull Request and Code Review
The Community Autopsy model is essentially a GitHub pull request review applied to game configs. Threads anchored to specific code lines → threads anchored to specific ticks. Inline suggestions → Fork & Fix proposals. "Approved" / "Changes Requested" → "Best Analysis" votes. The vocabulary mapping is nearly 1:1, reinforcing the game's pedagogical goal of teaching transferable engineering skills.

### Slay the Spire — Run History Tools
The Slay the Spire community built external tools like SpireScope (local dashboard with deck analysis, run history, and analytics) and STS Log Viewer (browser-based run explorer). These are player-built because the game didn't ship with adequate run analysis tools. Robot Uprising should ship with necropsy infrastructure from day one — don't leave it to the community to build essential analytical tools.

---

## The TikTok Clip

**The Changelog:** A 15-second timelapse of a config evolving from v1 to v10 — the visual diff animating through each version like a stop-motion film of a circuit board rewiring itself. The caption: "10 versions to beat one enemy. Each change was wrong in a new way."

**The Annotated Replay:** A 15-second clip of a perfect relay chain working beautifully, then a single annotation pin drops — "this signal is 15 ticks old" — and the entire system collapses. The contrast between mechanical beauty and catastrophic failure.

**The Evolution Tree:** A 10-second zoom-out from a single node to the full tree — 34 nodes across 8 branches, most dead ends, the main trunk glowing cyan. Caption: "This is what learning looks like."

**The Community Autopsy:** A split screen — on the left, a new player's config with three community annotations pointing to problems. On the right, the same config 5 minutes later, all problems fixed, running beautifully. Caption: "Code review, but for robots."

---

## Recommended Combination

No single model captures the full necropsy design space. The recommended approach is a **layered necropsy system** where the models serve different contexts:

1. **Changelog (Model 1)** as the foundational layer — always available, auto-populated, zero-effort version tracking. Every player has a changelog whether they share it or not.
2. **Annotated Replay (Model 2)** for match-specific analysis — the most streamable, most viral, most emotionally compelling format.
3. **Diff Report (Model 3)** for structured learning — the pedagogical backbone, teaches postmortem thinking through template structure.
4. **Evolution Tree (Model 4)** for long-arc strategic reflection — the most unique format, shows the full decision landscape including dead ends.
5. **Matchup Matrix (Model 5)** for competitive meta-analysis — the most actionable format for improving against specific opponent archetypes.
6. **Community Autopsy (Model 6)** for collaborative learning — the social glue, creates the community norms around shared diagnostic culture.

The models build on each other: a Changelog entry becomes an Annotated Replay becomes a Diff Report. An Evolution Tree provides the strategic overview, the Matchup Matrix provides the tactical detail. A Community Autopsy draws on all five other formats as source material.

---

## New Aspects Discovered

- **7.10a — Necropsy search and discovery UX:** Full design of the community necropsy archive — tag taxonomy (failure-type, archetype, rank-bracket, mission), search by config similarity ("show me necropsies from configs similar to mine"), recommendation engine ("players at your rank who faced this opponent archetype wrote these necropsies"), featured necropsies as editorial content
- **7.10b — Necropsy reputation economy:** How necropsy authorship and quality build community reputation; "Senior Diagnostician" badge for players with 20+ highly-rated necropsies; diagnostic reputation as a social currency distinct from competitive rank; the "famous analyst" archetype who is Gold-tier but writes Diamond-quality necropsies
- **7.10c — Necropsy-to-tutorial pipeline:** When a community necropsy identifies a common failure pattern, can it be promoted to an official tutorial mission? Community-identified failure modes as campaign content; the feedback loop from competitive play to onboarding design
- **7.10d — Cross-necropsy pattern mining:** Automated analysis across 1000+ published necropsies to find recurring failure patterns in the community; "this month, 340 necropsies mention buffer overflow on relay blueprints — the relay blueprint may need a balance pass"; necropsy data as game balance signal
- **7.10e — Necropsy localization and accessibility:** Necropsies are text-heavy community content; how do they work for non-English speakers? Machine translation of annotations with original preserved? Audio narration for accessibility? Visual-only necropsies using annotated replays without text? The tension between rich textual analysis and universal accessibility
