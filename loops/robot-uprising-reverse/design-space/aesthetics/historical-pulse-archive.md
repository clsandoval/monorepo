# 7.11c — Historical Pulse Archive as Community Memory

## The Option: The Meta History Museum

The Pulse system — Robot Uprising's live meta-game tracker — generates a continuous stream of data about what strategies players use, which blueprints dominate, which channel architectures win, and how the meta shifts patch over patch. The **Meta History Museum** is the full archival layer: every season's Pulse data preserved, browsable, and scrubable, transforming ephemeral competitive intelligence into a permanent educational and analytical resource.

This is not a stats page. It is a **time machine for the game's strategic evolution**. Players can scrub backward through seasons the way the Inspector lets them scrub through ticks — watching the meta breathe, seeing dominant strategies rise and fall, understanding *why* the game plays the way it does today by tracing the lineage of every blueprint archetype, every channel topology, and every balance patch that reshaped the landscape.

### How It Works Mechanically

**Data Captured Per Season:**
- Blueprint usage rates (which unit types, which skill loadouts, which rule orderings)
- Channel topology frequencies (star networks, mesh networks, relay chains, silent builds)
- Win rates by blueprint archetype across mission tiers and competitive brackets
- Context window configuration distributions (buffer sizes, eviction policies, listen/ignore filter patterns)
- Hook wiring patterns (which trigger-action pairs dominate)
- Production queue orderings and factory timing benchmarks
- Community-submitted blueprint names and descriptions
- Patch notes with annotated balance changes

**Archive Structure:**
Each season is a self-contained snapshot. The Museum presents them as chapters in a book — each chapter has a cover page showing the dominant meta composition, a "hero blueprint" that defined the era, and the key balance changes that shifted the landscape.

**The Scrubber:**
A horizontal timeline at the top of the Museum screen — identical in visual language to the Inspector's tick scrubber but operating at season scale. Drag left to go back in time. Each notch is a season. Hover over a notch to see a thumbnail of that season's meta composition as a pie chart. Click to enter that season's full data view.

### Visual & Sensory Design

The Museum lives behind a dedicated tab in the main menu, styled as an actual museum lobby. The background is a long, dimly lit corridor with glowing display cases on either side — each case is a season. The current season's case is largest, nearest to the camera, glowing gold. Older seasons recede into cool cyan-blue distance, their cases smaller but still legible.

**The Season Card:** Each season is represented as a holographic display case. Inside floats a slowly rotating 3D composition of the dominant blueprint archetypes — tiny isometric unit sprites arranged in their characteristic formation. A Scout-Relay-Striker triangle for a "reconnaissance meta." A dense Relay mesh for a "signal fortress meta." The composition is auto-generated from that season's most-played blueprint combinations.

**Color Language:** Each season inherits the biome color palette of the campaign missions that were most played that season. A season dominated by Manila megacity missions has neon magenta and electric blue undertones. A season where Ifugao rice terrace missions were popular carries warm amber and jade green. This creates an instant visual identity — veterans can glance at a season card's color palette and remember: "Oh, that was the terrace meta."

**Audio:** Entering the Museum fades the main menu music into a quiet, reverential ambience — low hum of data servers, occasional soft chime when hovering over a season card. Each season card, when selected, plays a 2-second audio signature composed from the dominant channel sounds of that era. If relay-heavy builds dominated, you hear compressed signal chirps. If striker-rush was meta, you hear sharp engage clicks.

**Typography:** Season names are displayed in the same boot-log monospace font used in the game's narrative system, reinforcing that the Museum is the AI reading its own history. Each season has an auto-generated epithet: "Season 3: The Silent Flank Era," "Season 7: The Relay Fortress Collapse."

---

## Comparable Games & Media

### DOTABUFF / STRATZ (Dota 2)
STRATZ has parsed and stored statistics from billions of public Dota 2 matches since 2013. Their Meta Trends page lets players scrub hero performance data across timeframes from hours to months, filtered by rank bracket, position, and region. The key design lesson: **granularity matters**. Players want to zoom from "what's strong this week" to "what was strong six months ago" without switching tools. STRATZ's strength is that the same interface serves both live meta and historical analysis — the archive is not a separate product but a time-shifted view of the same dashboard.

### MTGGoldfish / MTG Meta Analyzer (Magic: The Gathering)
MTGGoldfish tracks metagame share percentages for every competitive format, with historical charts showing archetype popularity over time. The MTG Meta Analyzer on GitHub provides matchup matrices with color-coded win rates between archetypes and scatter plots of archetype share vs. win rate. The key lesson: **matchup data is the killer feature for competitive intelligence**. Knowing that "Relay Fortress beats Scout Rush 62% of the time" is more actionable than knowing either archetype's raw win rate. Historical matchup data reveals not just *what* was strong, but *what it was strong against* — and whether your current strategy would have survived past metas.

### Rewind.lol (League of Legends)
Rewind aggregates a player's personal match history across up to 1000 games, creating a personal statistical archive. The lesson: **personal meta history matters alongside global meta history**. Players want to see not just "what the community played in Season 4" but "what *I* played in Season 4, and how my strategies evolved." The Museum should overlay personal performance data on top of global meta data.

### Star City Games Historical Articles (MTG)
Star City Games published long-form retrospectives tracing the lineage of dominant decks across 17 years of competitive Magic. These articles are beloved because they tell *stories* — not just data, but narrative arcs of innovation, dominance, and obsolescence. The lesson: **data without narrative is a spreadsheet**. The Museum needs editorial framing — auto-generated or community-contributed — that turns "Scout Rush had a 58% win rate in Season 3" into "Season 3 was the age of the Silent Flank, when players discovered that a single Scout with a compressed whisper channel could dismantle relay fortresses before they spun up."

### Dota 2 Patch Timeline (D2PT)
Dota2ProTracker features an interactive timeline of Dota 2 patches with AI-generated summaries, hero pick statistics for each patch, and even patch release predictions. The lesson: **patches are the chapter breaks**. Meta history without patch annotations is incomprehensible. Every data point needs to be anchored to "which version of the game was this?" The Museum must show balance changes as vertical markers on every timeline chart, with hover tooltips explaining what changed and why it mattered.

---

## Player Journeys

#### Journey: Rina, 24, Competitive Player and Aspiring Tournament Contender

**Context:** Season 8 of Robot Uprising competitive play. Rina has been playing since Season 2 and has climbed to Diamond rank. She's preparing for an upcoming community tournament and wants to understand the historical performance of relay-heavy architectures against the aggressive striker-rush compositions she expects to face.

**Minute 0:00 — Entering the Museum**
Rina clicks the "Pulse Archive" tab from the main menu. The screen transitions with a horizontal wipe — the menu slides left and the Museum corridor fades in from the right. Dim ambient lighting. Glowing season cases stretch into the distance. The current Season 8 case pulses gold at the near end. A horizontal scrubber bar spans the top of the screen: eight notches, each labeled S1 through S8. She's standing at S8 by default.

**Minute 0:15 — Browsing to the Relay Fortress Era**
Rina remembers that relay-heavy builds peaked around Season 5. She drags the scrubber left. As it passes each season notch, the Museum corridor slides smoothly — display cases glide past like she's walking backward through a gallery. The background color palette shifts: S8's neon magenta fades through S7's jungle green, S6's volcanic red-orange, and settles on S5's cool cyan — the color of Palawan coastal missions that dominated that season. The Season 5 display case enlarges to fill the center of the screen. Inside, a holographic formation rotates: four Relay units in a tight diamond with two Scouts orbiting the perimeter. Below the formation, text reads: **"Season 5: The Signal Fortress Meta — Relay diamond compositions reached 34% play rate, highest single-archetype dominance in game history."**

**Minute 0:40 — Drilling Into Archetype Data**
Rina clicks the Season 5 display case. It expands into a full data dashboard. The left panel shows a meta composition pie chart — Relay Fortress (34%), Scout Rush (22%), Balanced Factory (18%), Striker Blitz (14%), Other (12%). The center panel shows a matchup matrix: a grid where rows and columns are archetypes, cells are colored green (favorable) through red (unfavorable) with win percentages. She scans the Relay Fortress row: 67% vs. Balanced Factory, 55% vs. Scout Rush, but 38% vs. Striker Blitz. The Striker Blitz column glows faintly amber — this was the counter. A small annotation icon next to Striker Blitz reads: "Patch 5.3 — Striker engage range increased to 2 tiles. Fortress collapse began here."

**Minute 1:15 — Comparing Across Seasons**
Rina clicks the "Compare" button (two overlapping squares icon, top-right). A second scrubber appears below the first. She drags it to Season 8. Now the screen splits vertically: Season 5 data on the left, Season 8 on the right. She can see that Relay Fortress has dropped to 11% play rate in Season 8, while the matchup matrix shows its win rate vs. Striker Blitz has improved to 45% — someone found a counter to the counter. She clicks the delta arrow between the two panels. A diff view appears: changed stats highlighted in amber, new archetypes that didn't exist in S5 shown with dashed outlines. The new "Compressed Whisper" archetype — a Scout-Relay hybrid that didn't exist in S5 — is highlighted as the innovation that rescued relay builds.

**Minute 2:00 — Exporting Intelligence**
Rina clicks "Export Blueprint Snapshot" on the Season 5 Relay Fortress entry. A modal shows the most common blueprint configuration for that archetype in that season: specific skill slots, rule orderings, hook wirings, context config. She can't directly import it (the game has evolved, some skills have been rebalanced), but she can study the architecture. She screenshots it and opens her Plan screen in a new tab to experiment with a modernized version. She's thinking: "The diamond formation's weakness was the gap at 2-tile engage range. If I add a compress hook to collapse the diamond when strikers approach..."

**Minute 2:30 — Resolution**
Rina closes the Museum and opens her blueprint workbench. She has a concrete plan: adapt the Season 5 Relay Fortress diamond with modern compressed-whisper hooks to cover the striker gap. She wouldn't have found this approach without seeing the historical matchup data. The Museum didn't give her a ready-made strategy — it gave her the *genealogy* of a strategy, letting her understand why it worked, why it stopped working, and what innovation might make it work again.

**UI Annotations:**
- **Scrubber bar**: Full-width horizontal strip at top, 8 notches, drag to navigate seasons. Current position shown as gold diamond marker. Hover shows season thumbnail (pie chart + epithet).
- **Display cases**: 3D perspective corridor, each case is a clickable card ~200px wide. Selected case expands to fill ~80% of screen.
- **Matchup matrix**: Color-coded grid, green (#2ecc71) for >55%, amber (#f39c12) for 45-55%, red (#e74c3c) for <45%. Hover shows exact percentage and sample size.
- **Compare mode**: Split-screen with diff highlighting. Delta arrows between panels pulse gently to invite interaction.
- **Export snapshot**: Modal with read-only blueprint diagram. Copy-to-clipboard and screenshot buttons.

---

#### Journey: Marco, 17, New Player in His Second Season

**Context:** Marco started playing in Season 7 and is now in his first weeks of Season 8. He's been losing to a strategy he doesn't understand — opponents seem to use almost no Relays but still coordinate perfectly. He's heard veterans call it "the whisper meta" and wants to understand where it came from.

**Minute 0:00 — Curiosity-Driven Entry**
Marco opens the Pulse Archive from the main menu. He's never been here before. The Museum corridor loads — it looks like the Inspector's timeline view but grander, stretched across seasons instead of ticks. A gentle tooltip appears at the bottom of the screen: **"Welcome to the Meta History Museum. Scrub through seasons to explore how the game's strategies have evolved."** The tooltip fades after 5 seconds. Marco notices that Season 8 (his current season) is glowing gold. Season 7 — his first season — has a small personal badge icon on it (a tiny player silhouette), indicating he has personal data from that era.

**Minute 0:20 — Searching for "Whisper"**
Marco notices a search bar at the top-right of the Museum (magnifying glass icon, monospace placeholder text: "Search archetypes, blueprints, channels..."). He types "whisper." The corridor view dims and a results overlay appears: three entries glow brighter than the rest. "Compressed Whisper — first appeared Season 6, peaked Season 8." "Whisper Channel — hook pattern using compress + narrow-cast." "The Silent Flank — Season 6 community-named strategy." Marco clicks "Compressed Whisper."

**Minute 0:45 — The Archetype Timeline**
The screen transitions to an archetype-focused view. A horizontal area chart fills the center: the x-axis is seasons (S1 through S8), the y-axis is play rate percentage. The "Compressed Whisper" archetype appears as a thin sliver starting in late Season 5, growing through Season 6, dipping in Season 7 (a balance patch nerfed compress range), then surging in Season 8 after a counter-buff. The chart is layered — other archetypes form the stacked area below and above, so Marco can see what Compressed Whisper *displaced* as it grew. Relay Fortress shrinks as Whisper grows. A cause-and-effect narrative.

**Minute 1:10 — Understanding the Blueprint**
Below the timeline chart, a "Representative Blueprint" section shows the most common Compressed Whisper configuration for each season it existed. Marco can see how the blueprint evolved: in Season 6, it used a Scout with 2 hook slots both dedicated to whisper channels. By Season 8, the hook allocation shifted — one whisper hook, one emergency broadcast hook. The evolution is shown as a side-by-side comparison with changed elements highlighted in amber. Marco thinks: "Oh, they added an emergency channel because pure whisper was too quiet when things went wrong."

**Minute 1:40 — The "Why It Works" Panel**
Marco clicks a "Learn" button (graduation cap icon) next to the Compressed Whisper archetype. An educational panel slides in from the right — styled like a Blueprint Codex entry but for a *strategy* rather than a component. Header: "Compressed Whisper — The Art of Saying More with Less." Body text in the boot-log narrative voice: *"Standard relay architectures broadcast on wide channels. Every unit hears everything. The whisper architecture inverts this: compress the signal, narrow the channel, speak only to the unit that needs to act. The result is faster (fewer hops), quieter (lower EM emissions), but fragile — lose your whisperer and the whole network goes deaf."* Below this, a simple diagram shows the channel topology: Scout whispers to Striker directly vs. the traditional Scout broadcasts to Relay broadcasts to Everyone path.

**Minute 2:15 — Personal Overlay**
Marco toggles "My Data" (a small toggle switch in the top-right, person silhouette icon). His personal match history overlays on the global data. A second, thinner line appears on the archetype timeline: his encounter rate with Compressed Whisper opponents. It spikes in the last two weeks — confirming his suspicion that he's been facing it more often. His win rate against it is shown as a small red badge: 28%. The Museum suggests: "You've faced Compressed Whisper 14 times with a 28% win rate. Historically, Relay Fortress and Striker Blitz have been effective counters. Explore Season 5 Striker Blitz?" A clickable link.

**Minute 2:45 — Resolution**
Marco follows the suggested link to Season 5 Striker Blitz data, studies the counter-strategy, and exits the Museum with a plan. He's learned not just *what* beats him but *why* the strategy exists, how it evolved, and what its structural weaknesses are. The Museum turned a frustrating losing streak into an educational journey. He's excited to play again instead of discouraged.

**UI Annotations:**
- **Search bar**: Top-right, monospace font, cyan border glow on focus. Results overlay dims background corridor, matching entries pulse.
- **Archetype timeline**: Stacked area chart, each archetype a distinct color from the game's channel color palette. Hover on any point shows exact percentages. Vertical dashed lines mark patch boundaries.
- **Representative blueprint**: Side-by-side season comparison, changed elements highlighted amber. Unchanged elements in neutral gray.
- **Learn panel**: Slides from right, styled as Blueprint Codex entry. Boot-log monospace for narrative text, clean sans-serif for data. Diagram uses the same visual language as the Plan screen's channel map.
- **My Data toggle**: Small toggle switch, person silhouette. When active, personal data overlays in a distinct warm orange line atop the cool cyan global data.

---

#### Journey: Dani, 31, Game Design Student and Content Creator

**Context:** Dani makes YouTube analysis videos about Robot Uprising strategy. She's preparing a video called "The Three Metas That Shaped Robot Uprising" and needs to pull historical data, comparisons, and visual assets from multiple seasons to build her narrative.

**Minute 0:00 — Research Mode Entry**
Dani opens the Museum and immediately clicks "Research Mode" — a button in the top-right corner (microscope icon). The Museum shifts from its atmospheric corridor view to a clean, data-dense dashboard. The ambient audio cuts out, replaced by silence. The background becomes flat dark gray. Charts, tables, and filters fill the screen in a three-column layout: left column is season/patch selector, center is data visualization area, right is a "clipboard" panel where she can pin findings for later reference.

**Minute 0:20 — Multi-Season Comparison**
Dani holds Ctrl and clicks Season 2, Season 5, and Season 8 in the left column. All three seasons highlight with colored borders (blue, cyan, gold). The center panel shows three overlaid pie charts — meta composition for each season — with a toggle to switch to bar chart, area chart, or table view. She switches to bar chart. Three grouped bars per archetype, color-coded by season. The visual story is immediate: in Season 2, "Scout Spam" dominated (41%). By Season 5, "Relay Fortress" had taken over (34%). By Season 8, no single archetype exceeds 20% — the meta has diversified. Dani pins this chart to her clipboard with a click (pushpin icon, satisfying *click* sound).

**Minute 0:50 — Extracting Narrative Data Points**
Dani clicks on Season 2's "Scout Spam" bar. A detail panel expands showing: peak win rate (62%), the patch where it was nerfed (Patch 2.4 — Scout perception radius reduced from 6 to 5), the community reaction (a "heat" indicator showing forum activity spiked 340% around that patch), and the successor archetype that emerged ("Scout-Striker Hybrid" appeared within 2 weeks of the nerf). Dani pins each data point to her clipboard — each pinned item shows as a small card in the right panel with the key stat and its source season/patch.

**Minute 1:20 — Exporting Visual Assets**
Dani right-clicks the multi-season bar chart and selects "Export as PNG." The chart renders at 1920x1080 with transparent background, the game's boot-log font for labels, and a small "Robot Uprising Meta History Museum" watermark in the corner. She also exports the Season 5 Relay Fortress holographic display case as a standalone image — the rotating formation of Relay sprites. These are assets she'll drop into her video. The export modal lets her choose resolution, background (transparent, dark, light), and whether to include the watermark.

**Minute 1:50 — The "Moments" Feature**
Dani discovers the "Moments" tab — a curated timeline of community-significant events anchored to specific data points. "The Night the Fortress Fell" — a community tournament in Season 5 where a unknown player used Striker Blitz to defeat the #1 ranked Relay Fortress player, triggering a meta shift. "The Whisper Patch" — when compress was buffed in Season 6, spawning an entirely new archetype. "The Great Diversification" — Season 8's balance patch that brought eight archetypes within 3% win rate of each other. Each Moment has a short narrative blurb (2-3 sentences, boot-log voice), the data charts showing the before/after, and links to related community content (tournament replays, forum discussions). Dani pins three Moments to her clipboard — they'll be the three chapters of her video.

**Minute 2:30 — Clipboard Export**
Dani clicks "Export Clipboard" at the bottom of the right panel. A modal offers formats: Image Pack (all pinned charts as PNGs in a zip), Data Pack (all pinned stats as CSV), Narrative Pack (all pinned data points formatted as a text document with citations). She chooses Image Pack + Narrative Pack. A download begins. The narrative document includes auto-generated captions for each chart: "Season 2 meta composition — Scout Spam dominated at 41% play rate before the Patch 2.4 perception nerf."

**Minute 3:00 — Resolution**
Dani has her video structure: three Moments, each with data visualizations, holographic display case screenshots, and narrative text. The Museum didn't just give her raw data — it gave her *story-ready assets*. She'll credit the Museum in her video, driving more players to explore it. The content creation loop feeds the community memory loop: her video will teach new players about meta history, who will then explore the Museum themselves, who will discover strategies informed by that history.

**UI Annotations:**
- **Research Mode**: Toggles between atmospheric corridor (browsing) and data dashboard (analysis). Microscope icon, top-right. Dashboard uses flat dark gray background, maximum data density.
- **Multi-select**: Ctrl+click seasons in left panel. Selected seasons get colored borders matching their display case color.
- **Clipboard panel**: Right column, vertical stack of pinned cards. Each card shows a thumbnail of the pinned data, a label, and a delete (x) button. Pushpin icon for pinning, satisfying click sound.
- **Export modal**: Supports PNG (transparent or solid background), CSV, and narrative text. Resolution selector (720p, 1080p, 4K). Watermark toggle.
- **Moments tab**: Curated timeline with editorial blurbs. Each Moment is a card with a date, title, narrative text, and expandable data visualization.

---

## Strengths

1. **Transforms ephemeral meta into permanent knowledge.** Without an archive, competitive intelligence dies with each season. Players who join in Season 8 have no way to understand why the game plays the way it does. The Museum preserves institutional memory.

2. **Educational depth for new players.** The "Learn" panels and archetype evolution timelines teach strategy through history rather than abstract theory. "Here's why relay builds work — and here's the three times the community broke them" is more compelling than a tutorial.

3. **Content creator goldmine.** Exportable charts, holographic screenshots, and narrative data points make the Museum a primary source for community content. Every YouTube analysis video, blog post, or tournament commentary that references Museum data reinforces the game's depth reputation.

4. **Personal data overlay creates emotional investment.** Seeing your own strategic journey overlaid on the global meta makes history personal. "I was playing Scout Rush when everyone else had moved to Relay Fortress — no wonder I was struggling" is a moment of self-awareness the Museum enables.

5. **The scrubber metaphor is native to the game.** Players already understand timeline scrubbing from the Inspector. Applying the same interaction pattern at season scale feels natural rather than bolted-on.

6. **Emergent narrative generation.** Auto-generated season epithets, archetype names, and Moment blurbs create a sense of living history without requiring manual editorial effort. The game writes its own lore through play data.

## Weaknesses

1. **Cold start problem.** The Museum is empty for the first season. It only becomes compelling after 3+ seasons of accumulated data. Early adopters get a barren Museum, which could feel like a broken feature rather than a future payoff.

2. **Data storage and performance.** Storing granular match data across many seasons grows linearly. A web-based game with no backend (locked tech constraint) would need to either bundle historical data as static JSON assets with each build or rely on a lightweight CDN-hosted data service — neither of which is truly "no backend."

3. **Analysis paralysis risk.** A Museum full of historical data could overwhelm players who just want to know "what should I play right now?" The Research Mode dashboard especially risks becoming a data dump rather than an insight generator. The Pulse (live meta) must remain the primary recommendation surface, with the Museum as an opt-in deep dive.

4. **Balance patch dependency.** The Museum's narrative quality depends on meaningful balance patches creating actual meta shifts. If the game is perfectly balanced from launch (unlikely but possible), the Museum chronicles stasis — boring. If patches are too frequent, no meta has time to establish identity before it's disrupted — also boring. The Museum needs a Goldilocks patch cadence.

5. **Community curation burden.** The "Moments" feature requires someone (or something) to identify which events are historically significant and write the narrative blurbs. AI-generated blurbs risk being bland. Community-submitted blurbs require moderation. Either path has ongoing costs.

---

## Interaction Effects

**With the Inspector:** The Museum uses the same scrubber interaction pattern as the Inspector, creating conceptual consistency. Players who master tick-by-tick analysis in the Inspector will intuitively understand season-by-season analysis in the Museum. The visual language (timeline bar, hover tooltips, click-to-expand) should be identical.

**With the Blueprint Codex:** The Museum's archetype entries are essentially Blueprint Codex entries for *strategies* rather than *components*. They should share visual styling — the same card format, the same monospace boot-log narrative voice, the same portrait/stats/description layout. A player moving between Codex and Museum should feel like they're browsing different sections of the same library.

**With the Campaign Map:** Historical meta data could be overlaid on the campaign map — showing which missions were most played each season, which biomes correlated with which archetypes. "Relay Fortress dominated on Ifugao missions because the rice terrace terrain created natural chokepoints for relay placement." This ties strategic history to geographic identity.

**With Competitive/Ranked Play:** The Museum is a competitive intelligence tool. Players preparing for tournaments will mine it for counter-strategy data. This creates a skill gap between players who use the Museum and those who don't — which is desirable (rewarding research is a form of skill) but must be balanced against accessibility (the Museum shouldn't be *required* to compete at mid-level play).

**With the "No Backend" Tech Constraint:** This is the hardest interaction. Historical data across seasons is fundamentally a persistence problem. Options within the locked tech stack: (a) bundle historical data as static JSON files shipped with each game update, (b) use a lightweight third-party service (e.g., a public GitHub repo with JSON files, fetched via CDN), (c) community-hosted data sharing (players export/import data packs). Option (a) is simplest but increases build size each season. Option (b) stretches the "no backend" constraint. Option (c) is most community-aligned but least reliable.

---

## The TikTok Clip

A 15-second clip: the camera slowly pulls back through the Museum corridor, season display cases gliding past — each one showing a different holographic formation rotating inside its case. The season epithets flash as they pass: "The Scout Swarm"... "The Silent Fortress"... "The Whisper Revolution"... "The Great Diversification." The final frame shows a player scrubbing the timeline and the entire corridor shifting around them — strategies rising and falling like stock tickers, the visual history of a thousand competitive battles compressed into a single satisfying scroll. Caption: "Every strategy that ever dominated. Every counter that toppled it. The Meta History Museum remembers everything."
