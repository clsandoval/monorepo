# Workshop Search and Discovery UX

**Aspect:** 7.03d — Workshop search and discovery UX: full design of search, filtering, tag taxonomy, recommendation engine, trending algorithms, and config similarity detection

**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis

---

## The Core Design Problem

Robot Uprising's Workshop isn't a mod repository or a level browser. It's a **configuration library** — a place where players browse, evaluate, and import *attention architectures*. The shareable unit (established in 7.03a) is a Config Code encoding blueprints, rules, hooks, channels, and context configs into a portable string. The Workshop wraps these codes in metadata — author, tags, screenshots, ratings, descriptions, replays — and makes the resulting catalog searchable.

The fundamental challenge: **configs are opaque.** A Factorio blueprint visually IS its function — you see a smelter array and know what it does. A Mario Maker level thumbnail communicates theme and density. But a Robot Uprising config is a *graph of behavioral relationships*. The thumbnail can show a replay frame, but the config's intelligence — its hook topology, its rule ordering, its context eviction strategy — is invisible at a glance. The Workshop's discovery UX must solve the **legibility-at-a-glance problem for behavioral systems.**

This is harder than Steam Workshop (mods are named and categorized by type), harder than Factorio Prints (blueprints are spatial — you can see them), and harder than deck-sharing sites like hsreplay.net (cards are known quantities with established tier lists). The closest analog is **GitHub** — browsing repositories of code you can't evaluate without reading the source. But GitHub has README files, stars, activity graphs, and language badges. Robot Uprising needs equivalent signals for attention architectures.

---

## The Workshop Home Screen

### Layout: "The Library"

The Workshop opens to a full-screen overlay replacing the campaign map. A soft transition — the campaign map's circuit-board cables dim and recede as the Workshop grid slides up from below with a quiet mechanical *clunk*, like a filing cabinet drawer being pulled open.

**Top bar:** The player's avatar and username (left), search field (center, 60% width), and filter toggles (right). The search field has a magnifying glass icon and placeholder text: *"Search configs, authors, channels, skills..."* The field has a subtle cyan glow when focused, matching the game's data-stream aesthetic.

**Below the top bar:** A horizontal row of category pills — **Trending**, **New**, **Top Rated**, **Most Imported**, **Staff Picks**, **Following**, **For You**. The active pill fills with cyan; inactive pills are dark grey with light text. Clicking a pill smoothly cross-fades the grid below.

**The grid:** A 3-column card layout (2 columns on mobile, 4 on ultrawide). Each card is a **Config Card** — the atomic unit of Workshop browsing. Cards are vertically stacked, infinitely scrollable with lazy loading. Each card casts a subtle drop shadow and lifts slightly on hover with a 100ms ease-out, accompanied by a quiet *tick* — the sound of a file folder being partially pulled from a drawer.

### Config Card Anatomy

Each card contains (top to bottom):

1. **Hero image** (top 40% of card): A replay screenshot from the config's best recorded match — the board frozen at the most dramatic moment (highest simultaneous signal density, or the frame before a kill chain). If no replay exists, a procedurally generated **topology diagram** — a miniaturized node graph showing blueprints as colored dots and channels as connecting lines, rendered in the game's circuit-board style against a dark background. The topology diagram IS the config's visual fingerprint.

2. **Title bar** (below image): Config name in 16px bold white text, truncated with ellipsis at 40 characters. Below: author name in 12px cyan text, linked to author profile.

3. **Signal strip** (below title): A horizontal row of tiny icons summarizing the config's composition:
   - Unit type icons (👁📡⚔🔧🤖 for Scout/Relay/Striker/Specialist/Command) with count badges
   - Channel count (📡 ×4)
   - Hook density indicator (a small spark icon, brighter = more hooks per unit)
   - A miniature **EDT badge** — the config's average Effective Determination Timestamp from recorded matches, colored green (<0.3), amber (0.3-0.6), or red (>0.6)

4. **Tags** (below signal strip): 1-3 tag pills from the taxonomy (see below). Overflow tags show as "+2 more" with tooltip on hover.

5. **Footer** (bottom edge): Import count (⬇ 1.2k), like count (♥ 847), comment count (💬 23), and time since publication ("3d ago"). All in 10px grey text.

**Sensory description:** The grid feels like browsing vinyl records in a cyberpunk music shop. Each card is a jewel case with a circuit-board album cover. The topology diagrams — each one unique, each one a different network shape — create a wall of visual variety. Dense configs have busy, tangled diagrams; elegant configs have clean, minimal graphs. You can *see* architectural philosophy before reading a single word. The hover lift + tick sound creates a tactile browsing rhythm — tick, tick, tick — like flipping through a card catalog.

---

## Tag Taxonomy

### The Three-Axis System

Tags operate on three independent axes, each answering a different question:

**Axis 1: Archetype** — "What kind of architecture is this?"
| Tag | Description |
|-----|------------|
| `scout-rush` | Scout-heavy, fast intel, early aggression |
| `relay-chain` | Relay-dependent signal pipeline |
| `command-tower` | Command agent as central controller |
| `swarm` | Many cheap units, minimal wiring |
| `singleton` | Few expensive units, deep config each |
| `stealth-net` | Low-emission, dark-channel design |
| `noise-flood` | Deliberate EM overload offense |
| `hybrid` | No dominant archetype |

**Axis 2: Specialty** — "What does this config excel at?"
| Tag | Description |
|-----|------------|
| `anti-rush` | Counters early aggression |
| `late-game` | Scales to long matches |
| `economy` | Resource/tagging efficiency |
| `information` | Maximizes intel coverage |
| `disruption` | Targets enemy buffers/channels |
| `escort` | VIP protection optimized |
| `flexible` | Adapts to varied scenarios |
| `educational` | Designed to teach a concept |

**Axis 3: Complexity** — "How experienced should I be?"
| Tag | Description |
|-----|------------|
| `beginner-friendly` | Mission 1-4 vocabulary only |
| `intermediate` | Uses factory + channels |
| `advanced` | Command agent, multi-channel |
| `expert` | Meta-level systems, deep hook chains |

### Auto-Tagging

When a config is uploaded, the Workshop analyzes the Config Code and auto-suggests tags:
- **Archetype** is detected from unit composition ratios (>60% scouts → `scout-rush`), channel count (>6 channels → `relay-chain`), presence of Command agent (`command-tower`)
- **Complexity** is detected from vocabulary used — configs without hooks get `beginner-friendly`; configs with reassign/reroute skills get `advanced`+
- **Specialty** requires author input (auto-detection unreliable for strategic intent)

The author sees suggested tags as pre-filled pills with an "×" to remove, and can add manual tags from the taxonomy. A maximum of 5 tags per config prevents tag spam.

### Community-Emergent Tags

After 90 days, if community comments consistently use a term not in the taxonomy (detected by frequency analysis of comment text), the system surfaces a "Suggest New Tag" prompt to the most active taggers. Community tags enter a **candidate pool** — visible with a dotted-outline pill and italic text — until they reach 50 uses, at which point they're promoted to the official taxonomy. This is how the community names meta-strategies the developers didn't anticipate.

**Comparable:** Danbooru's tag wiki system, where community-created tags become canonical through usage frequency. Also: Stack Overflow's tag creation system (requires reputation threshold).

---

## Search System

### Full-Text Search

The search field accepts freeform text and searches across:
- Config title and description (highest priority)
- Author name
- Tag names
- **Decoded Config Code fields** — because the Config Code (7.03a) is structured JSON under the compression, the Workshop indexes the decoded structure. This enables:
  - `"compress skill"` → finds configs equipping the compress skill on any blueprint
  - `"relay"` → finds configs containing Relay-type blueprints
  - `"recon-net"` → finds configs using a channel named "recon-net"
  - `"eviction:age"` → finds configs with age-based eviction priority

This is the Factorio community's biggest ask — searching inside blueprints, not just names — built in from day one.

### Structured Query Language (Power Users)

Advanced users can type structured queries using a simple syntax:

```
unit:relay count:>3 skill:compress mission:7 tag:relay-chain author:@priya
```

Fields:
- `unit:<type>` — filter by unit type presence
- `count:<op><n>` — filter by unit count (>, <, =)
- `skill:<name>` — filter by equipped skill
- `hook:<trigger>` — filter by hook trigger type
- `channel:<name>` — filter by channel name
- `rule:<condition>` — filter by rule condition type
- `mission:<n>` — filter by designed-for mission
- `tag:<name>` — filter by tag
- `author:<name>` — filter by author
- `edt:<range>` — filter by EDT range (e.g., `edt:0.3-0.6`)
- `imported:>1000` — filter by import count
- `created:<30d` — filter by creation date

Autocomplete drops down as the user types, suggesting field names after the colon and valid values after the field. The autocomplete panel appears 200ms after the last keystroke, slides down from the search bar with a subtle shadow, and shows up to 8 suggestions with the matching substring highlighted in cyan.

**Comparable:** GitHub's search qualifiers (`is:open language:python`), Jira's JQL, Chrome DevTools network filter syntax.

### Search Results Ranking

Results are ranked by a weighted score combining:
1. **Text relevance** (TF-IDF against indexed fields) — weight 0.4
2. **Popularity signal** (log(imports) + log(likes)) — weight 0.2
3. **Recency** (exponential decay, half-life 14 days) — weight 0.15
4. **Author reputation** (from reputation economy, 7.03c) — weight 0.1
5. **Match-rate signal** (pass rate on the config's designed-for mission, from community play data) — weight 0.15

The weights are not player-visible but the ranking factors are — each result card shows small indicator icons for why it was ranked: a flame for trending, a star for highly rated, a clock for recent.

---

## Recommendation Engine

### "For You" Feed

The personalized feed uses three signal sources:

**1. Config Similarity Graph**
When a player imports or likes a config, the system computes **structural similarity** between that config and all others in the Workshop. Similarity is measured across four dimensions:
- **Unit composition vector** — normalized count of each unit type (e.g., [0.4 Scout, 0.2 Relay, 0.4 Striker])
- **Hook topology fingerprint** — a hash of the channel→blueprint adjacency graph, tolerant of channel name differences (isomorphic graph matching)
- **Rule vocabulary overlap** — Jaccard similarity of the set of {condition_type, action_type} pairs across all rules
- **Skill loadout similarity** — set overlap of equipped skills

Configs with similarity > 0.7 are considered "structurally related." The For You feed shows configs structurally related to the player's recent imports but from different authors — "architectures like yours that other people built differently."

**2. Collaborative Filtering**
Classic item-item collaborative filtering: "players who imported Config A also imported Config B." This surfaces configs from different archetype families that share a player base — a relay-chain player who also imports scout-rush configs suggests a cross-archetype interest pattern.

**3. Skill Gap Detection**
The system analyzes the player's campaign progress and Gauntlet match history to identify **skills they haven't used**. If a player has never equipped the `hack` skill or never built a Command agent, the feed surfaces highly-rated configs featuring those elements with a subtle label: "New to you: uses hack skill" in a soft green badge.

### "Similar Configs" Panel

On each config's detail page, a right sidebar shows:
- **"Structurally Similar"** — configs with similar topology but different rules/hooks (same shape, different behavior)
- **"Same Author"** — other configs by this creator
- **"Counter Configs"** — configs that consistently beat this one in Gauntlet matches (adversarial recommendation — "if you like this, here's what beats it")
- **"Evolution"** — if this config was forked from another (tracked via Config Code ancestry, 7.03a), show the lineage: original → fork → fork-of-fork

### "Players Who Beat This Mission Also Used..."

On each campaign mission's page (accessible from the campaign map), a recommendation strip shows the top 5 most-imported Workshop configs that have the highest pass rate on that specific mission. This is the **cold-start solver** — a player stuck on Mission 7 opens the Workshop, sees "Mission 7: Top Configs," and can import one to study (not just copy — the game shows the config in the workbench but encourages understanding before executing).

**Sensory description:** The "For You" feed has a subtly different visual tone from the main grid — cards have a faint cyan border glow (barely visible, 10% opacity) that distinguishes personalized results from generic browsing. The skill gap badges pulse once when first visible, like a gentle notification. Hovering over "Counter Configs" in the sidebar briefly tints the hero image red — a flash of adversarial energy.

---

## Trending Algorithms

### Five Trending Models

**Model 1: "Velocity" (Import Acceleration)**
Ranks by the second derivative of import count — not how many imports, but how fast imports are *accelerating*. A config that went from 5→50→200 imports over three days scores higher than one that went from 100→120→140. This surfaces configs that are *taking off*, not configs that are already popular. The viral discovery moment.

**Strengths:** Surfaces genuinely novel content. Prevents incumbency bias.
**Weaknesses:** Vulnerable to coordinated import-spamming. Noisy for configs with small absolute numbers.

**Model 2: "Signal-to-Noise" (Like-to-Import Ratio)**
Ranks by the ratio of likes to imports, filtered to configs with >50 imports (minimum sample). A config imported 200 times with 180 likes (90% ratio) ranks above one imported 2000 times with 800 likes (40%). This surfaces *quality* over *volume* — configs that people actually enjoy, not just configs that show up in search results.

**Strengths:** Quality signal. Rewards craft.
**Weaknesses:** Penalizes experimental/educational configs that people import to study but don't "like."

**Model 3: "Conversation" (Comment Velocity)**
Ranks by comment count per hour, weighted by comment diversity (comments from unique authors count more than multiple comments from the same person). This surfaces configs that are *generating discussion* — whether because they're clever, controversial, or confusing.

**Strengths:** Surfaces interesting content even if it's not universally liked. Captures "watercooler" energy.
**Weaknesses:** Controversy farming. A deliberately bad config can trend by provoking arguments.

**Model 4: "Gauntlet Disruption" (Meta Shift Detection)**
Ranks configs that have appeared in Gauntlet matches where the winning config's archetype was previously rare. When a `stealth-net` config starts beating `command-tower` configs that were previously dominant, the stealth-net config trends under this algorithm. This surfaces **meta-breaking** content — the configs that are changing how the game is played.

**Strengths:** The most strategically useful trending signal. Tells competitive players what to prepare for.
**Weaknesses:** Requires significant match data. Only meaningful in active competitive seasons. Might create self-fulfilling prophecies (trending → everyone copies → meta warps).

**Model 5: "Hybrid Weighted" (Production Recommendation)**
A weighted blend of Models 1-4:
- 35% Velocity
- 25% Signal-to-Noise
- 20% Conversation
- 20% Gauntlet Disruption

With a recency multiplier (configs published in the last 7 days get 1.5× weight, decaying to 1.0× at 30 days). This is the default "Trending" tab.

### Trending Display

The Trending tab replaces the standard grid with a **ranked list** — numbered #1 through #20, with the top 3 configs displayed as larger hero cards (double width, with replay GIF previews auto-playing on hover) and configs #4-20 as compact list items. A small "Why trending?" tooltip on each entry explains: "⬆ Import velocity +340% this week" or "💬 47 comments from 31 authors today."

**The TikTok clip:** The Trending tab, top card, shows a config called "THE WHISPER NET" by @kai_ph. The topology diagram shows an intricate but clean relay chain — five relays in a star pattern, each feeding a single striker. The EDT badge glows green: 0.22. Import counter is climbing in real-time: 1,247... 1,248... 1,249. The comment preview shows: "This thing is TERRIFYING in Gauntlet. My command tower can't see it coming."

---

## Config Similarity Detection

### The Fingerprinting System

Every Config Code uploaded to the Workshop is decomposed into a **structural fingerprint** — a fixed-length vector capturing the config's architectural DNA independent of surface details (names, ordering). The fingerprint enables:

1. **Duplicate detection** — preventing re-uploads of the same config under different names
2. **Plagiarism flagging** — detecting configs that are near-copies of existing ones
3. **Cluster analysis** — grouping configs into archetype families
4. **Recommendation fuel** — the similarity graph powering "Structurally Similar"

### Fingerprint Components

**Component 1: Unit Composition Vector (5 dims)**
Normalized count of each unit type. [0.4, 0.0, 0.2, 0.2, 0.2] = 40% Scout, 0% Striker, 20% Relay, 20% Specialist, 20% Command.

**Component 2: Channel Topology Hash (64-bit)**
The channel graph (which blueprints publish to which channels, which blueprints listen on which channels) is converted to a canonical adjacency matrix, sorted by unit type and channel degree. The matrix is hashed. Two configs with isomorphic channel graphs (same structure, different names) produce the same hash.

**Component 3: Rule Vocabulary Set (variable, encoded as bit vector)**
Each unique {condition_type, action_type} pair is a bit in a vector. The vector captures *what kinds of decisions the config makes* without caring about specific parameters. A config with rules like "if enemy_nearby → engage" and "if buffer_full → compress" has bits for {enemy_nearby, engage} and {buffer_full, compress} set.

**Component 4: Skill Loadout Bitmask (per unit type)**
For each of the 5 unit types, a bitmask of which skills are equipped. 5 bitmasks, each up to 8 bits.

**Component 5: Context Config Signature (per unit type)**
A compact encoding of each unit type's eviction priority ordering and listen/ignore filter pattern.

### Similarity Metric

Structural similarity is computed as:
```
sim(A, B) = 0.25 * cosine(unit_vectors)
           + 0.30 * (topology_hash_match ? 1.0 : jaccard(channel_adjacency_sets))
           + 0.20 * jaccard(rule_vocabularies)
           + 0.15 * avg(hamming_similarity(skill_bitmasks))
           + 0.10 * cosine(context_signatures)
```

**Similarity thresholds:**
- **≥ 0.95**: Flagged as potential duplicate. Upload blocked with message: "This config is very similar to [existing config]. Did you mean to fork it?"
- **0.85-0.94**: Flagged as derivative. Upload allowed but tagged "Related to [existing config]" with a link. Author can dismiss the tag.
- **0.70-0.84**: Structurally related. Used for recommendation graph edges.
- **< 0.70**: Architecturally distinct. No relationship surfaced.

### Plagiarism vs. Evolution

A critical UX question: when is similarity *theft* and when is it *iteration*? The system distinguishes:
- **Fork** (sanctioned): A player explicitly imports a config, modifies it, and re-uploads with "Forked from [original]" attribution auto-attached. This is evolution. The topology diagram shows a small tree icon in the corner linking to the original.
- **Independent convergence**: Two players independently arrive at similar configs. The system flags the relationship but attaches no blame. Attribution reads: "Structurally similar to [other config]."
- **Uncredited copy**: A player manually recreates another config without importing it (to avoid fork attribution). Detection catches this via fingerprint similarity. The system tags it the same as independent convergence — **no accusation, just transparency.** The community decides.

**Comparable:** GitHub's fork graph (explicit attribution), YouTube's Content ID (automated detection), Opus Magnum's solution comparison (no plagiarism concern because optimization is inherently convergent).

---

## The Config Detail Page

When a player clicks a Config Card, the detail page slides in from the right (or opens as a modal on mobile).

### Layout

**Left column (60%):**
- **Hero replay** — auto-playing GIF of the config's best match, looping. Clicking pauses and opens full Inspector replay.
- **Topology diagram** — larger version, interactive. Hovering a node (blueprint) highlights its channels. Clicking a node opens a popover showing that blueprint's skills, rule count, and hook summary.
- **Description** — author's text explaining the config's design philosophy, matchup strengths, evolution history. Markdown-supported.

**Right column (40%):**
- **Quick stats:** Unit count, channel count, hook count, average context utilization, EDT range
- **Import button** — large, cyan, centered. "Import to Workbench →". Clicking shows a preview of how the config will look in the player's workbench before confirming.
- **Tags** — full list, clickable (clicking a tag opens a filtered search)
- **Match stats** — if the config has been used in Gauntlet: win rate, EDT distribution sparkline, most common opponent archetypes
- **Comments** — threaded, sorted by recency or likes. Comment input at top.
- **Version history** — if the author has uploaded updates, a version timeline showing diffs between versions (which rules changed, which hooks were rewired). Each version is importable independently.
- **Similar configs** sidebar (see Recommendation Engine above)

### The "X-Ray" Toggle

A toggle button in the top-right corner of the topology diagram: "X-Ray: OFF / ON". When activated:
- The topology diagram expands to fill the left column
- Each blueprint node opens to show its internal structure — skills as icons, rules as numbered strips, hooks as colored antenna, context config as a small thermometer
- Channel lines thicken and show signal direction arrows
- The diagram becomes a full **architecture schematic** — readable by an experienced player in 10 seconds

This is the solution to the legibility-at-a-glance problem. The X-Ray view converts the opaque Config Code into a visual blueprint that an experienced player can evaluate without importing.

**Sensory description:** Activating X-Ray feels like putting on night-vision goggles. The topology diagram's background darkens from charcoal to near-black. The nodes bloom open like flowers — each unit type's color (cyan for Scout, amber for Relay, red for Striker, green for Specialist, white for Command) saturates to full brightness. Channel lines animate briefly — a pulse of colored light travels along each line, showing signal direction. Hook connections sparkle. For 500ms, the whole diagram is alive with flowing data, then it settles into a static schematic. The toggle click produces a sound like a camera shutter — *ka-chunk* — and the blueprint hums.

---

## Player Journeys

### Journey: Mara, 14, First-Time Strategy Player

**Context:** Mission 6, just introduced to factories. Stuck — her configs keep getting overrun. Friend told her to check the Workshop.

**Minute 0:00 — Opening the Workshop**
Mara taps the Workshop icon on the campaign map (a small storefront icon with a wrench). The filing-cabinet drawer sound plays. The Workshop grid loads — the default tab is "For You." She sees a skill gap badge on the first card: "New to you: uses compress skill" in a soft green pill. The card's topology diagram shows a simple three-node graph — two Scouts feeding one Relay. Clean, not scary.

**Minute 0:15 — Browsing**
She scrolls. Most cards have topology diagrams she doesn't understand — tangled webs of lines, too many nodes. But the "beginner-friendly" tagged cards have noticeably simpler diagrams — 3-4 nodes, clean lines. She clicks the "beginner-friendly" tag pill on one card. The grid filters instantly, and now every card has simple topologies. She exhales. This is manageable.

**Minute 0:30 — Evaluating a Config**
She clicks a card titled "Baby's First Relay Chain" by @teacherTina. The detail page slides in. The hero replay shows three units — two scouts flanking, one relay in the center — sweeping across the board in a clean formation. The description reads: "A gentle introduction to relay-mediated scouting. Two scouts report to one relay, which compresses and forwards to a striker. Watch how the signals chain together." The right sidebar shows: ⬇ 3,400 imports, ♥ 2,890 likes — a 85% like ratio.

**Minute 0:45 — Importing**
She clicks "Import to Workbench →." A preview overlay appears: the config's blueprints laid out in her workbench, each one highlighted with a subtle glow. A tooltip reads: "This will add 3 new blueprints and create 2 channels. Your existing blueprints won't be affected." She clicks Confirm. The Workshop closes and her workbench now contains the imported config. She studies it — reads the rules, traces the hooks, and for the first time *understands* why a relay needs a compress skill.

**Minute 1:30 — Learning**
She doesn't just run the imported config — she opens each blueprint and reads each rule. She sees the hook: "on:enemy_detected → channel:recon-net → payload:position." She sees the relay's listen config: "recon-net: ON, broadcast: OFF." She sees the striker's rule: "if recon-net has entry AND entry.age < 3 → move toward position." The architecture makes sense as a chain. She modifies one rule — changes the age threshold from 3 to 5 — hits EXECUTE, and watches. The striker reacts slower but still works. She's learning by tinkering with a working example.

**Minute 3:00 — Return**
She goes back to the Workshop, finds @teacherTina's profile, and sees five more configs of escalating complexity. She hits Follow. Her "Following" tab now has content. She will return.

**UI Annotations:**
- Skill gap badge: 10px pill, `#34d399` background, white text, 2px rounded corners, positioned below hero image
- "beginner-friendly" tag filter: clicking any tag pill on any card opens filtered search with that tag pre-applied; filter bar shows as cyan pill with "×" dismiss in top-left of grid
- Import preview: semi-transparent overlay (80% black) with config elements positioned in workbench layout at 60% scale; "Confirm" and "Cancel" buttons centered below

---

### Journey: Kai, 28, Gauntlet Veteran (Diamond Rank)

**Context:** Deep into competitive season. His command-tower config has a 62% win rate but he's plateaued. He wants to understand what's beating him.

**Minute 0:00 — Targeted Search**
Kai opens Workshop and types: `tag:stealth-net edt:<0.30 imported:>500`. The autocomplete shows field names as he types — `edt:` triggers a range helper dropdown showing "<0.30 | 0.30-0.60 | >0.60". He selects `<0.30`. Four results appear. All have low-density topology diagrams — sparse nodes, thin lines. The EDT badges glow green. These are quiet configs.

**Minute 0:15 — X-Ray Analysis**
He clicks the top result: "PHANTOM LATTICE v4.2" by @ghost_architect. Detail page loads. He immediately hits the X-Ray toggle. *Ka-chunk.* The topology blooms open. Five Scouts, two Relays, no Command agent. The hooks are minimal — just two channels, both with compress payloads. The context configs show aggressive ignore filters — listening only to compressed signals, ignoring raw observations. This config is designed to be invisible — low EM emissions, tight signal budget.

He traces the rule logic: Scouts have a rule "if EM_budget > threshold → evade instead of report." They *voluntarily go dark* to stay under emission limits. The Relays only fire when they have 3+ compressed signals queued — batch transmission. This is architectural discipline he hasn't seen before.

**Minute 0:45 — Counter Config Exploration**
He scrolls to the "Counter Configs" sidebar. Three configs are listed that consistently beat PHANTOM LATTICE. The top one is "NOISE CANNON" — a brute-force approach that floods the channel space with garbage signals, overwhelming the stealth config's compressed-only filters. He clicks it, scans the X-Ray, sees the hook topology: 8 channels, all broadcasting noise. Crude but effective against stealth.

**Minute 1:15 — Forking**
He goes back to PHANTOM LATTICE. He clicks "Import to Workbench →" but instead of importing directly, he clicks "Fork & Edit" — a secondary button below the main import. This creates a copy with "Forked from PHANTOM LATTICE v4.2 by @ghost_architect" auto-attributed. He begins modifying: adds a Command agent (which PHANTOM LATTICE deliberately omits), adjusts the EM budget thresholds, adds a dedicated anti-noise hook that filters signals below a quality threshold. He's building a hybrid — his command-tower expertise grafted onto a stealth chassis.

**Minute 3:00 — Upload**
After testing against Mission 10, he uploads his fork. The auto-tagger suggests: `command-tower`, `stealth-net`, `advanced`, `flexible`. He accepts all four and adds a manual tag: `anti-noise`. The fingerprint system detects 0.78 similarity to PHANTOM LATTICE — structurally related but not derivative. No flag, but the "Related to" link appears automatically. He publishes. His config appears in PHANTOM LATTICE's "Evolution" sidebar.

**UI Annotations:**
- Structured query autocomplete: 250px dropdown, dark background, 8 max suggestions, matching substring in cyan, field names in grey italic
- X-Ray toggle: 32px pill button, `OFF` = grey, `ON` = cyan with glow, positioned absolute top-right of topology diagram
- Fork & Edit button: secondary style (outline, not filled), positioned below primary Import button, 12px text
- Similarity flag: "Related to [config]" shown as 10px italic text below title on upload confirmation screen

---

### Journey: Sofia, 42, Educator Using Robot Uprising in a University Course

**Context:** Teaching a "Systems Thinking" course. Wants to curate a reading list of configs that demonstrate specific architectural patterns for her students.

**Minute 0:00 — Structured Search for Teaching Materials**
Sofia opens Workshop and navigates to the search bar. She types: `tag:educational skill:compress`. Six results. She refines: `tag:educational skill:compress tag:beginner-friendly`. Two results. She opens both in side-by-side tabs (clicking the middle-mouse button on a card opens it in a new tab).

**Minute 0:30 — Evaluating Pedagogical Value**
She examines each config's description. The first, "Compression 101" by @teacherTina, has a description that reads like a lesson plan: "This config demonstrates why raw signals overwhelm a striker's context window. Step 1: Remove the relay's compress skill and watch what happens. Step 2: Re-enable compress and compare. The difference is visible in the context bars." The second config has no description — just a title and tags.

She selects "Compression 101." On the detail page, she checks the version history: three versions, each with a changelog ("v2: simplified rules for clarity", "v3: added deliberate flaw for classroom discussion"). This author updates for teaching purposes. Perfect.

**Minute 1:00 — Creating a Collection**
She clicks "Add to Collection" (a bookmark icon on the detail page). A dropdown shows her existing collections: "Week 3: Signals", "Week 4: Hooks", "Week 5: Architectures". She selects "Week 3: Signals." The bookmark icon fills with cyan. She adds 4 more configs to this collection over the next 5 minutes, using structured search: `tag:educational channel:*` to find configs that teach channel wiring, `tag:educational rule:* tag:beginner-friendly` for rule logic.

**Minute 6:00 — Sharing the Collection**
She opens her profile → Collections → "Week 3: Signals". The collection page shows her 5 selected configs as a curated list with her added annotations ("Start here — notice the hook on the scout", "Compare this relay's filter config with the previous one"). She clicks "Share Collection" and gets a URL. She pastes it into her course LMS. Students will open the link, see the curated configs, and import them one by one into their workbenches for study.

**Minute 7:00 — Monitoring**
Over the next week, the collection's analytics page shows: 34 imports (from her 28 students — some imported twice), 12 forks, 4 comments. One student forked "Compression 101" and uploaded their modified version with the tag `educational` — the teaching loop is working.

**UI Annotations:**
- Collections: stored per-player, visible on profile page, shareable via URL
- Collection annotation: per-config text field (500 char max), displayed as italic text below each config card in collection view
- Collection analytics: import count, fork count, comment count per config, updated daily
- "Add to Collection" bookmark icon: 24px, outline when empty, filled cyan when in any collection, dropdown appears on click showing collection list with "New Collection" at bottom

---

## Interaction Effects

### With Config Code Format (7.03a)
The entire Workshop is built on Config Codes. The search index is built from decoded Config Code JSON. The fingerprint system processes the Config Code structure. The import flow transfers Config Codes. If the Config Code format changes between game versions, the Workshop must handle migration transparently — old configs should still be browsable and importable, with the game auto-migrating on import.

### With Reputation Economy (7.03c)
Author reputation badges appear on Config Cards. High-reputation authors get a subtle gold border on their cards. The search ranking factor (weight 0.1) uses reputation. The "Staff Picks" tab is curated by developers but reputation influences eligibility — only authors with reputation > threshold can be staff-picked (prevents gaming by alt accounts).

### With Async Challenges (7.03)
Workshop and Challenge Hub are separate tabs but cross-linked. A config in the Workshop can have a "Challenge" button: "Challenge someone to beat your config's scenario." This creates a Gauntlet Seed (Model 2 from 7.03) pre-configured with the Workshop config's designed-for mission. Challenge results feed back to the config's match stats.

### With Config Necropsy (7.10)
Necropsy artifacts (diagnostic writeups) link to Workshop configs. A config's detail page shows "Necropsies mentioning this config" — community analysis of why it works or fails. Necropsies become a form of review: the most-necropsied configs are implicitly the most studied and understood.

### With Histogram System (7.06)
The Zachtronics histogram appears on Gauntlet Seed challenge configs (Model 2) but also on any Workshop config that has sufficient Gauntlet match data. The histogram shows where this config falls on the EDT/efficiency distribution compared to all configs in the same mission/archetype.

### With Campaign Progression (Wave 5)
The Workshop gates visibility by campaign progress. A player on Mission 3 cannot see configs that use Command agents (introduced Mission 6) — these are filtered out and shown as silhouetted cards with a lock icon and "Unlocks after Mission 6." This prevents spoilers AND prevents confusion (seeing vocabulary you don't understand yet).

### With Blueprint Codex (Locked Narrative)
Importing a Workshop config that uses skills/hooks the player hasn't unlocked yet triggers a Codex popup: "This config uses the 'hack' skill. View in Codex?" Clicking opens the Codex entry for that skill — teaching through discovery rather than explicit tutorial.

---

## Comparable Games/Media

### Steam Workshop
The gold standard for mod discovery. Robot Uprising's Workshop borrows the card grid, sorting tabs (trending/new/top rated), and subscription model. But Steam Workshop's weakness is that mods are opaque — you see a title, screenshot, and description, but the mod's quality/compatibility is unknown until you install it. Robot Uprising's topology diagram and structural fingerprinting provide what Steam Workshop lacks: *visual evaluation before installation*.

### Factorio Prints (factorioprints.com)
Third-party blueprint sharing site. Strengths: tag-based filtering, blueprint preview images. Weaknesses: no in-game integration, no similarity detection, no structured search inside blueprints. Robot Uprising addresses all three gaps by making the Workshop a first-party in-game feature with decoded Config Code search.

### Mario Maker 2 Course World
Nintendo's approach: Hot/Popular/New categories, difficulty filtering (Easy/Normal/Expert/Super Expert), Course ID search. Strengths: difficulty calibration from clear rates, curated "Hot" algorithm surfacing rising content. Weaknesses: no structured search, no creator-following ecosystem, limited discovery beyond categories. Robot Uprising takes the difficulty-from-clear-rates pattern but adds structured search and the For You recommendation feed.

### hsreplay.net (Hearthstone Deck Tracker)
The premier deck-sharing platform. Strengths: deck archetypes as first-class categories, win rate data per deck per rank bracket, meta-snapshot curation. Weaknesses: only works because cards are discrete and well-understood — decks are compositional but not topological. Robot Uprising's configs are MORE complex (topological, not just compositional) and need the fingerprinting system to achieve what hsreplay gets from simple card lists.

### GitHub
Repository discovery for code. Strengths: star count, fork graph, language detection, README rendering, contributor count, activity graphs. Weaknesses: browsing code is inherently hard — you can't evaluate a repo at a glance. Robot Uprising's X-Ray toggle is the GitHub README equivalent — a legibility layer that converts opaque structure into scannable visual.

---

## Discovered Sub-Aspects

- **7.03d-i — Config Card hero image generation**: exact algorithm for selecting "most dramatic replay frame" vs. procedural topology diagram generation; frame scoring heuristic (signal density, unit count, kill events); when replay data is unavailable
- **7.03d-ii — Workshop content moderation at the card level**: offensive config names, misleading tags, fake import counts, coordinated upvote manipulation; automated detection vs. community reporting; interaction with 7.03b moderation infrastructure
- **7.03d-iii — Workshop offline mode**: what happens when the player has no internet? Cached configs from last session, local-only configs, sync-on-reconnect; the Workshop as partially-offline-capable
- **7.03d-iv — Collection curation as community content type**: curated collections as a first-class shareable artifact beyond individual configs; "playlists" of configs for specific purposes (learning arcs, meta-counter lists, archetype showcases); collection creator reputation
- **7.03d-v — Workshop analytics dashboard for creators**: what metrics does an author see about their own configs? Import trends, like ratios, fork counts, comment sentiment, geographic distribution; the "Creator Studio" as a post-upload engagement tool
