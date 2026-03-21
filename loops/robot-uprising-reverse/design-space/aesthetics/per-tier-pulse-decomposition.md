# Per-Tier Pulse Decomposition

**Aspect 7.11e** — Separate Pulse dashboards per ranked tier (Bronze through Diamond); tier-specific metas differ; prevents population-level averages from hiding tier-specific problems; comparable to LoL rank-stratified balance.

---

## The Option

Instead of a single global Pulse dashboard that averages statistics across the entire player population, Robot Uprising decomposes its live-balance telemetry into **separate dashboards per ranked tier**. Each tier — Bronze, Silver, Gold, Platinum, Diamond — gets its own win-rate tables, blueprint pick/ban rates, skill-slot usage heatmaps, and hook-wiring pattern frequencies. The design team (and eventually the community, via a public-facing subset) can see that Relay-heavy "information fortress" architectures dominate Bronze while being nearly absent from Diamond, where aggressive Scout-Striker rush builds with minimal context windows prevail.

This is directly modeled on **Riot Games' Champion Balance Framework**, first published in 2019 and updated in 2020. Riot formally recognized four audiences for balance: **Average Play** (below top 10%, roughly Iron through Gold), **Skilled Play** (top 10% excluding the very top), **Elite Play** (top 0.1%), and **Professional Play**. Each audience has different thresholds for what constitutes "overpowered" or "underpowered":

- **Average Play**: A champion is OP at 54.5% win rate (or 52.5% with high ban rate). The large sample size makes win rate the primary signal.
- **Skilled Play**: OP threshold drops to 54% win rate. Players here punish imbalances faster.
- **Elite Play**: Sample sizes are too small for reliable win rates. Riot switches to **Presence** (combined pick + ban rate). A champion is OP at 45%+ presence.
- **Professional Play**: OP at 95% presence in one patch, or 85% across two consecutive patches.

The key insight: **a champion can be perfectly balanced for Gold players while being oppressively overpowered in Diamond, or vice versa.** Master Yi historically terrorizes low elo (42% ban rate in Iron/Bronze) while being nearly irrelevant in high elo, where coordinated teams hold crowd control for his engages. Conversely, champions like Azir and Ryze have been historically weak in low elo (sub-46% win rate) while being pick/ban in professional play due to their high skill ceiling and team-coordination synergies.

### How It Works in Robot Uprising

The Pulse system tracks per-tier data across these dimensions:

1. **Blueprint archetype win rates** — "Scout-heavy rush" wins 58% in Bronze but 47% in Diamond. That is two different balance problems requiring two different responses.
2. **Skill-slot usage frequency** — Which skills are equipped most often per tier. If `compress` is never used below Gold, that is an onboarding problem, not a balance problem.
3. **Hook-wiring complexity** — Average number of channels per blueprint, average chain depth. If Bronze players use 1.2 channels on average while Diamond uses 4.7, the complexity curve is working.
4. **Context config patterns** — How players configure eviction priorities, listen/ignore filters. Tier-specific patterns reveal which configuration decisions players at each level have internalized.
5. **Mission clear rates** — Per-mission, per-tier. If Mission 7 has a 92% clear rate in Diamond but 31% in Bronze, the difficulty is tier-inappropriate.
6. **Time-to-first-win** — How long new players at each tier take to clear a mission on first attempt. Reveals where the learning curve spikes differently by skill level.

### The "Population Average" Problem

Without tier decomposition, a blueprint archetype sitting at 50% win rate globally might actually be 62% in Bronze and 38% in Diamond — perfectly balanced on paper, catastrophically imbalanced in practice. This is the core problem Riot's framework was designed to solve: **population-level averages are lies when your population has heterogeneous skill levels.**

The decomposition also reveals **tier-specific metas** — emergent strategy ecosystems that differ by rank. In Robot Uprising:

- **Bronze Meta ("The Spam Factory")**: Players over-produce Scouts, under-use hooks, rarely configure context windows. Winning strategy: any blueprint with strong default behaviors. Balance concern: are defaults too strong? Too weak?
- **Silver Meta ("The First Wire")**: Players discover hooks and channels. One or two well-placed relay chains dominate. Balance concern: is the first hook-discovery moment rewarding enough?
- **Gold Meta ("The Optimizer")**: Players min-max slot allocations, discover compression chains. Balance concern: is there one dominant "solved" blueprint?
- **Platinum Meta ("The Architect")**: Command agents, multi-channel orchestration, counter-building. Balance concern: is the meta diverse enough?
- **Diamond Meta ("The Factory Engineer")**: Meta-level play — blueprints that adapt production queues mid-battle, context configs tuned to opponent patterns. Balance concern: is the skill ceiling still rising?

---

## Strengths

- **Prevents the Master Yi Problem.** A simple, low-skill-ceiling blueprint archetype can dominate Bronze without being touched by balance patches, because it looks fine at the population level. Tier decomposition catches this.
- **Reveals onboarding gaps.** If a core mechanic (e.g., context window configuration) is unused below Gold, the tutorial or UI is failing — not the mechanic. This is actionable UX data, not just balance data.
- **Enables targeted interventions.** A skill can be buffed for low-tier play (e.g., stronger default behavior for `compress`) without changing its ceiling for high-tier play (e.g., the manual configuration remains equally powerful).
- **Validates the complexity curve.** The locked mission arc (Missions 1-4 tutorial, 5-7 factory, 8-10 full system) should produce a specific pattern of tier-stratified data. If it does not, the arc is failing.
- **Community trust.** Riot's public framework increased community trust in balance decisions. Players could see *why* their favorite champion was nerfed — because it was OP in *their* tier, even if streamers said it was fine.

## Weaknesses

- **Requires a ranked population.** Tier decomposition is meaningless during launch, early access, or for a primarily single-player campaign game. Robot Uprising is a 10-mission campaign — ranked play is a post-campaign concern, if it exists at all.
- **Small tier populations produce noisy data.** Riot explicitly acknowledges that Elite and Professional tiers have insufficient sample sizes for reliable win rates, which is why they switch to Presence metrics. A niche indie game will have this problem at *every* tier.
- **Can justify excessive patching.** If the dashboard shows 15 separate "problems" across 5 tiers, the temptation is to patch constantly. Riot patches every two weeks; a small team cannot sustain that cadence.
- **Tier boundaries are arbitrary.** Where does "Bronze behavior" end and "Silver behavior" begin? The distribution is continuous. Hard tier boundaries create artificial discontinuities in the data.
- **Meta diversity can be mistaken for meta health.** Different metas per tier is not inherently good — it might mean low-tier players are playing a fundamentally different (and less interesting) game.

## Interaction Effects

- **Sealed Watch quality signal** — The "no skip, no pause" sealed watch is a quality signal that works differently by tier. Bronze players may find it punishing (forced to watch failures they do not understand). Diamond players may find it revelatory (subtle tactical interactions they would miss at speed). Tier-decomposed watch-skip-rate data would reveal this.
- **Inspector usage patterns** — How long players spend in the Inspector, which tools they use, how many ticks they scrub through — all tier-stratified. If Bronze players never open the Inspector, the two-act debrief structure may need a gentler on-ramp.
- **Blueprint Codex engagement** — Which codex entries are viewed, how often, at which tier. Reveals whether the reference system is serving its purpose or being ignored.
- **Campaign progression gates** — If tier-decomposed mission clear rates show Mission 5 (factory introduction) is a cliff for new players, the campaign pacing needs adjustment — but only for that segment.

## Comparable Games/Media

**League of Legends (Riot Games)** — The direct inspiration. Riot's four-audience framework (Average, Skilled, Elite, Professional) with different OP/UP thresholds per audience is the gold standard for tier-stratified balance. Their public transparency about the framework (dev blogs, patch note explanations) built community trust and reduced "why was X nerfed?" outrage.

**Dota 2 (Valve)** — Uses a similar tier-stratified approach but less publicly documented. Dotabuff and OpenDota provide community-driven tier-stratified data that Valve uses indirectly. Heroes like Pudge (dominant in low ranks, weak in pro play) and Io (dominant in pro play, weak in low ranks) illustrate the tier-divergence phenomenon.

**Clash Royale (Supercell)** — Stratifies balance data by trophy range (their equivalent of rank tiers). Cards like Elite Barbarians historically dominated low ladder while being absent from top-200 play. Supercell's approach: nerf the card's floor (make it less oppressive when used badly) without lowering its ceiling.

**Overwatch 2 (Blizzard)** — Blizzard has acknowledged heroes that are "must-pick" in GM but "never-picked" in Bronze, particularly high-coordination heroes like Ana. Their approach has been less structured than Riot's, leading to more community frustration.

---

## Sensory Description

### The Tier-Decomposed Dashboard (Developer-Facing)

Five horizontal swim lanes, each labeled with a tier emblem — a corroded bronze gear, a polished silver circuit, a golden processor die, a platinum fiber-optic bundle, a diamond crystal lattice. Each lane contains the same metrics: win-rate sparklines, blueprint-archetype popularity bars, skill-usage heatmaps. But the patterns are visibly different — Bronze's win-rate sparkline for "Scout Rush" spikes sharply upward while Diamond's slopes gently down. The color temperature shifts subtly per tier: Bronze lanes have warm amber backgrounds, Diamond lanes are cool steel blue. Hovering over any data point cross-highlights the same metric in other tiers, showing divergence at a glance — a thin vertical rule connects the five data points, and where they diverge wildly, the connecting line pulses red.

### The Community Pulse Panel (Player-Facing Subset)

A simpler view: the player's own tier is highlighted, other tiers dimmed. A horizontal bar chart shows the top 5 blueprint archetypes in their tier, with small up/down arrows indicating week-over-week trend. Tapping an archetype expands to show a radar chart of its strengths: rush speed, information density, hook complexity, context efficiency, production cost. A small text box reads: "In your tier, Relay Fortress builds win 54.2% of matches — up 1.3% from last week." Below, a "How other tiers play" toggle reveals the same chart for one tier above and below — not the full dashboard, just enough to glimpse the next meta horizon.

### Audio Cues

When the dashboard refreshes (weekly), a soft crystalline chime plays — different pitch per tier. Bronze is a low, warm bell. Diamond is a high, clear ping. When a metric crosses an OP threshold, the chime gains a slight dissonance — a warning undertone that says "something here needs attention" without alarm.

---

## Player Journeys

#### Journey: Diego, 28, Mobile Game Designer

**Context:** Diego has been playing Robot Uprising for three months. He cleared the campaign in his first week and has been playing ranked matches since. He is currently Gold III, having climbed from Silver through optimizing Relay-chain architectures. He is curious why his main strategy feels weaker this week.

**Minute 0:00 — Opening the Pulse Panel**
Diego taps the small bar-chart icon in the bottom-right of the campaign map screen. The Pulse Panel slides up from the bottom — a half-screen overlay with a frosted-glass background showing the campaign map dimly beneath. His tier, Gold, is highlighted in a warm golden banner across the top. Five horizontal bars show the top blueprint archetypes in Gold: "Relay Fortress" (54.2%, up arrow), "Scout Rush" (51.1%, flat), "Striker Dive" (49.8%, down arrow), "Command Web" (48.3%, up arrow), "Hybrid Flex" (47.9%, flat). Each bar is filled proportionally to win rate, colored on a green-to-amber gradient.

**Minute 0:20 — Investigating His Archetype**
Diego taps "Relay Fortress." The bar expands downward into a radar chart with five axes: Rush Speed (low), Information Density (very high), Hook Complexity (high), Context Efficiency (medium), Production Cost (high). A text annotation reads: "Relay Fortress builds excel at information control but are vulnerable to early aggression before the relay network is established." Below the radar chart, a small "Trend" sparkline shows the archetype's win rate over the past 8 weeks — it has been climbing steadily from 50% to 54%. Diego thinks: "Okay, it's actually getting *stronger* in my tier. So why does it feel harder?"

**Minute 0:45 — Peeking at Adjacent Tiers**
Diego toggles "How other tiers play." Two additional bars appear — Silver (one below) and Platinum (one above). In Silver, Relay Fortress is at 57.3% — even stronger. In Platinum, it is at 46.1% — significantly weaker. Diego's eyes widen. He is climbing toward Platinum, where his main strategy falls off. The Platinum meta is dominated by "Command Web" (55.8%) and "Striker Dive" (53.2%) — archetypes he has barely experimented with. A subtle animation plays: the Platinum bar pulses gently, as if beckoning.

**Minute 1:10 — Strategic Revelation**
Diego taps on the Platinum "Command Web" entry. The radar chart shows it excels at Rush Speed and Hook Complexity — the opposite profile of his Relay Fortress. A tooltip reads: "Command Web builds use a central Command agent to dynamically reroute production and hook channels mid-battle. High skill ceiling." Diego thinks: "I need to learn Command agents before I hit Platinum, or I'll plateau." He closes the Pulse Panel, opens Mission 6 (where Command agents are introduced), and starts a practice run.

**Minute 2:00 — Resolution**
Diego emerges from the Pulse Panel with a clear strategic roadmap: his current archetype is strong in his tier but will not carry him higher. He needs to diversify. The tier-decomposed data gave him this insight — a global average would have shown Relay Fortress at 51% (perfectly balanced) and told him nothing.

**UI Annotations:**
- Pulse Panel: Half-screen overlay, slides up from bottom, frosted-glass background
- Tier banner: Full-width, golden highlight for current tier, tier emblem (golden processor die) on left
- Archetype bars: Horizontal, filled proportionally to win rate, green-to-amber gradient, up/down/flat trend arrows on right
- Radar chart: Five-axis, translucent fill, axis labels at each point
- Adjacent-tier toggle: Small text link below radar chart, reveals two additional bars with smooth expand animation
- Sparkline: 8-week mini-chart, thin line, no axis labels, just the shape

---

#### Journey: Priya, 34, AI Research Engineer

**Context:** Priya is a Diamond-tier player and active community member. She has been vocal on forums about a blueprint archetype she considers overpowered. She is checking the public Pulse data to build an evidence-based case for a balance adjustment.

**Minute 0:00 — Accessing the Full Pulse View**
Priya opens the Pulse Panel and immediately toggles to the "All Tiers" view — available to Diamond and above as a community analytics feature. Five swim lanes appear, each with the same set of metrics. She scrolls to the "Striker Dive" archetype. In Diamond, it shows 56.8% win rate with a 38% pick rate and 22% ban rate. The Presence metric (pick + ban) reads 60% — highlighted in orange, approaching the OP threshold. In Bronze, the same archetype shows 44.1% win rate and 8% pick rate. The divergence is extreme.

**Minute 0:30 — Building the Case**
Priya screenshots the tier comparison. The visual is striking: a connecting line between the five tiers' win-rate dots forms a steep diagonal — 44% in Bronze climbing to 57% in Diamond. She opens the "Skill Breakdown" sub-panel for Striker Dive in Diamond. It shows that 94% of Diamond Striker Dive players equip the `breach` skill in slot 1 and pair it with a specific hook configuration: "on adjacent enemy detected, broadcast on channel `dive-now`, then engage." This hook wiring is rare below Platinum — only 12% of Gold Striker Dive players use it.

**Minute 1:00 — Understanding the Mechanism**
The tier-decomposed data reveals *why* Striker Dive is OP in Diamond but weak in Bronze: the power is not in the unit stats, it is in the hook configuration. Diamond players have discovered a specific wiring pattern that coordinates multiple Strikers through a shared channel. Bronze players use Strikers as standalone units — no hooks, no channels — which makes them mediocre. The balance lever is not Striker stats; it is the hook interaction.

**Minute 1:30 — Posting to the Forum**
Priya drafts a forum post titled "Striker Dive is OP in Diamond, Here's the Data." She includes the tier-comparison screenshot, the skill-breakdown panel, and her analysis: "The problem is not Striker base stats — it's the `breach` + `dive-now` hook combo scaling with coordination. Nerfing Striker stats would destroy the archetype in Bronze where it's already weak. Instead, consider adding a 1-tick cooldown to `breach` after hook activation, raising the execution difficulty without changing the ceiling." She tags the community manager.

**Minute 2:30 — Resolution**
The tier-decomposed Pulse data gave Priya the evidence to make a precise, targeted balance argument — not "nerf Strikers" but "add a timing constraint to this specific hook interaction." Without tier decomposition, the global 50.5% win rate for Striker Dive would have masked the Diamond-specific problem entirely.

**UI Annotations:**
- All Tiers view: Five horizontal swim lanes, tier emblems on left (bronze gear, silver circuit, gold die, platinum fiber, diamond crystal)
- Win-rate divergence line: Vertical connecting line between tier data points, pulses red when divergence exceeds 10 percentage points
- Skill Breakdown sub-panel: Expandable section showing skill-slot usage as stacked bar chart, hook-config as simplified wiring diagram
- Screenshot button: Small camera icon in top-right corner of Pulse Panel, captures current view as shareable image
- OP threshold indicator: Horizontal dashed line on Presence chart at 45%, orange when approached, red when exceeded

---

#### Journey: Marcus, 16, High School Student and First-Time Strategy Gamer

**Context:** Marcus downloaded Robot Uprising two weeks ago because a TikTok clip of a complex hook chain going off looked cool. He has cleared Missions 1-4 and just unlocked the factory in Mission 5. He has never played a competitive strategy game before. He is Bronze IV.

**Minute 0:00 — Noticing the Pulse Icon**
Marcus finishes a ranked match — his fifth. He lost. His Scout-spam strategy worked in the campaign but keeps failing against other players. On the post-match screen, a small pulsing icon in the corner catches his eye — a tiny bar chart with a "NEW" badge. He taps it.

**Minute 0:15 — First Encounter with Pulse**
The Pulse Panel opens. His tier — Bronze — is displayed prominently. A friendly header reads: "What's winning in Bronze right now?" Below, five archetype bars are displayed. "Scout Spam" (his strategy) shows 46.3% — below average, with a red down-arrow. "Relay Anchor" shows 55.1% — the top archetype, with a green up-arrow. A small info tooltip appears on first visit: "Pulse shows you what strategies are working at your rank. Tap any bar to learn more."

**Minute 0:35 — Discovering Relays**
Marcus taps "Relay Anchor." The radar chart shows high Information Density and Context Efficiency. A text box reads: "Relay Anchor builds place a central Relay unit with `compress` and `filter` skills, connected to Scouts via hooks. The Relay processes incoming information and forwards clean signals to Strikers." Below, a "Try It" button appears — linking directly to a pre-made blueprint template for Relay Anchor that Marcus can load into his workbench and modify. Marcus thinks: "Oh, I've been ignoring Relays because they can't move. But apparently they're good?"

**Minute 1:00 — The Adjacent-Tier Glimpse**
Curiosity leads Marcus to toggle "How other tiers play." Silver appears above Bronze. In Silver, "Relay Anchor" drops to 51.2% and "Hook Chain" appears at 53.8%. Marcus does not fully understand what a Hook Chain is — he has only used hooks once, in Mission 3. But seeing that it is what Silver players use plants a seed: hooks are important, and he needs to learn them to climb.

**Minute 1:20 — Loading the Template**
Marcus taps "Try It." The game transitions to the Plan screen with a pre-loaded Relay Anchor blueprint. The Relay has `compress` in skill slot 1, `filter` in slot 2, and a hook on channel `recon-data` set to trigger on "signal received." Two Scout blueprints are pre-configured to broadcast on `recon-data`. Marcus studies the wiring for a moment — the channel lines glow softly on the blueprint map. He has never seen a channel used this way. He hits EXECUTE and watches his first Relay-coordinated battle unfold.

**Minute 3:00 — Resolution**
The Relay Anchor build wins. Marcus watches the sealed watch with new eyes — the Relay sits in the center, context bars filling and emptying as it processes signals, forwarding compressed data to the Striker who moves decisively instead of wandering. Marcus thinks: "That's so much better than just spamming Scouts." He queues another match with the template, planning to tweak it. The tier-decomposed Pulse data did not just show Marcus meta statistics — it gave him a learning pathway, a concrete next step, and a pre-built template to try. It turned raw data into onboarding.

**UI Annotations:**
- Post-match Pulse icon: Bottom-right corner, pulsing animation, "NEW" badge on first appearance, 24x24 pixel bar-chart icon
- Friendly header: "What's winning in Bronze right now?" in warm amber text, casual tone, not intimidating
- "Try It" button: Appears below archetype radar chart for archetypes the player has not tried, deep teal button with rounded corners, links to pre-loaded blueprint template
- Template load transition: Smooth crossfade from Pulse Panel to Plan screen, template blueprint pre-loaded with all slots filled, channel wiring pre-drawn as glowing lines
- First-visit tooltip: Semi-transparent overlay with arrow pointing to archetype bars, disappears on tap, does not return

---

## The TikTok Clip

A split-screen: left shows the Bronze Pulse dashboard where "Scout Spam" dominates with a 55% win rate. Right shows the Diamond dashboard where the same archetype sits at 41%. Text overlay: "The game you're playing is NOT the game they're playing." Cut to a Diamond player's hook-chain wiring diagram — a dense web of channels and triggers. Cut to a Bronze player's blueprint — three Scout blueprints with empty hook slots. Same game. Different universe. The divergence IS the content.

---

## Applicability to Robot Uprising

The core tension: **Robot Uprising is primarily a 10-mission single-player campaign, not a ranked competitive game.** Tier-decomposed Pulse data is most valuable in a ranked competitive context where balance patches affect millions of matches. For a campaign game, the equivalent insights are:

- **Per-mission clear-rate decomposition** by player experience level (not ranked tier, but hours played or missions completed)
- **Blueprint complexity tracking** by progression stage — are players using more hooks and channels as they advance, or plateauing?
- **Difficulty-request data** — if a "reduce difficulty" option is offered, which missions trigger it most, and does the pattern differ by player type?

If Robot Uprising eventually adds competitive modes (async challenges, blueprint-sharing leaderboards, head-to-head), then full tier-decomposed Pulse becomes directly applicable. The infrastructure should be designed tier-aware from the start, even if early data is campaign-focused.
