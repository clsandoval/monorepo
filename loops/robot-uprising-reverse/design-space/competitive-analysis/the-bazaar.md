# 1.10 — The Bazaar: Real-Time Autobattler Deckbuilding, Item Synergies, Economic Meta

## Overview

The Bazaar (Tempo Storm, 2025) is an asynchronous autobattler-roguelike hybrid created by Andrey "Reynad" Yanyuk, a former Hearthstone pro and founder of esports organization Tempo Storm. Announced in 2018, crowdfunded via Indiegogo ($115K+), it went through years of iteration — at one point pivoting from Unreal Engine to Unity — before launching into open beta in March 2025, full release in April 2025, and Steam launch on August 13, 2025. It holds an 81% positive rating on Steam with ~12K peak concurrent players and a $19.99 price tag. Reynad once described it as "multiplayer Slay the Spire."

The Bazaar is the closest existing game to Robot Uprising's structural DNA: both are asynchronous PvP games where the player *builds* during their turn and *watches* during combat, both have roguelike run structures with incremental power scaling, and both demand the player understand synergistic systems rather than execute moment-to-moment reactions. It's also a cautionary tale about monetization destroying community trust.

## Core Loop

### The 30-Second Loop
Browse a shop → buy/sell/position items on "The Rug" (your active board) → manage item sizes (small=1 slot, medium=2, large=3) across 10 rug slots and 10 stash slots → enchant items when possible → advance to next hour. Each purchase decision weighs immediate combat power against long-term synergy potential and gold economy.

### The 5-Minute Loop
Complete one in-game "day" of six unique hours. Each hour presents a different event type: merchant shops (most common), PvE monster fights, skill selections, NPC encounters, random events. The day ends with an asynchronous PvP fight: your board auto-battles against a *snapshot* of another real player's build at approximately the same day of their run. The loser takes Prestige damage (health). After 30 seconds of auto-combat, the phase ends and a new day begins.

### The Session Loop (20-45 minutes)
Play through a full run: select a hero, build a board from scratch across multiple days, fight PvP opponents at end of each day, accumulate power through items/skills/enchantments. A run ends when you reach 10 PvP wins or lose all your Prestige twice. Each hero has ~100 unique items in their pool, creating dramatically different build paths per run.

### The Meta Loop (Weeks-Months)
Master one hero → try another → climb ranked ladder (Elo-based) → discover new synergy paths within hero pools → optimize against the evolving meta of other players' builds. New heroes release quarterly with 100-card starting pools, plus ~10 cards/month expansions across existing heroes.

## The Ghost System — Asynchronous PvP as Design Philosophy

The Bazaar's most radical design decision: **you never fight another player in real time.** Every PvP opponent is a "ghost" — a frozen snapshot of another player's board state from approximately the same in-game day. The ghost is consumed on match: once you fight a ghost, it's deleted from the database and no one else encounters that exact build again.

This creates a game that *feels* like PvE but has PvP's build diversity. You have infinite time to plan your purchases and positioning. The opponent is always "real" (an actual human's build) but never present. Combat is fully automated and lasts exactly 30 seconds — items activate on their cooldowns, effects trigger, and whoever's build survives wins.

**Why Reynad chose this:** Mobile accessibility was the primary driver. Synchronous PvP required "clicking 50 times a minute," making phones impractical. The async model validated when Super Auto Pets and Backpack Battles proved the format commercially. Reynad described it as a "resting" design philosophy — progression only advances when the player initiates it.

**Robot Uprising parallel:** This is almost exactly the sealed watch model. Player designs systems → systems execute autonomously → player observes results. The critical difference: Robot Uprising makes the observation phase *mandatory and emotional* (sealed watch, no skip), while The Bazaar's auto-combat is more of a validation check that players often watch passively. The Bazaar's ghosts are consumed per-use; Robot Uprising's invisible randomization serves a similar anti-optimization purpose but through varied execution rather than varied opponents.

## The Board — "The Rug"

The Rug is a linear horizontal strip of item slots (starting at 4, expanding by 2 per level-up to a maximum of 10). Items are placed left-to-right and their *position matters*:

- **Adjacency effects:** Many items buff or trigger based on what's immediately to their left or right. Duct Tape activates when the item to its left fires. Some items grant Haste, Crit Chance, or Multicast to adjacent items.
- **Left/Right skills:** Hero skills like "Left-Handed" and "Right-Handed" specifically buff the leftmost or rightmost item on the rug.
- **Size constraints:** Large items (3 slots) are powerful but slow. A board of all large items has only 3 items total; a board of all small items has 10. The tension between power and frequency is spatial.

The Stash (also 10 slots) holds items not in combat. Crucially, some items with out-of-combat effects (gold generation, income boosters) activate *from the stash*, creating a parallel economy board the player also optimizes.

**Robot Uprising parallel:** The Rug's linear positional design is much simpler than Robot Uprising's 8×8 spatial grid. But the adjacency/positioning mechanic has a direct analog in Robot Uprising's perception radii, relay placement, and signal routing topology. The Bazaar teaches "where you put things matters" through a 1D linear board; Robot Uprising teaches it through a 2D spatial battlefield with temporal delay. The Stash's dual-purpose (storage + passive effects) is comparable to how Robot Uprising units have both active combat roles and passive signal-routing functions even when not directly engaged.

## The Cooldown System — Time as the Core Resource

Every item on The Rug has a cooldown measured in real seconds. When combat begins, all items start charging simultaneously. When an item's cooldown completes, it fires automatically. Faster items fire more times in the 30-second combat window.

Five cooldown modifiers create the game's strategic layer:
- **Haste:** Doubles cooldown speed (item fires twice as fast).
- **Slow:** Halves cooldown speed (imposed on enemy items).
- **Freeze:** Stops an item's cooldown entirely for a duration.
- **Charge:** Instantly fills a portion of an item's cooldown bar.
- **Multicast:** When an item fires, it fires N additional times instantly.

The meta-game emerges from this: it's not enough to have high-damage items. A board full of slow, powerful items will be outpaced by a board of fast, synergistic items that Haste each other and Freeze the opponent. The optimal build often isn't the strongest individual items — it's the fastest *system*.

**Robot Uprising parallel:** This is the cooldown-vs-power tension Robot Uprising recreates through signal latency. A deep information architecture (Scout→Relay→Command→Striker) is smarter but slower (4 ticks of latency) than a flat one (Scout→Striker, 2 ticks). The Bazaar's Freeze/Slow/Haste modifiers map to Robot Uprising's context overload → stun mechanic (enemy flooding noise to force 1-tick stun-locks) and the compress skill (reducing signal size to prevent overload). Both games make *timing* the core optimization target, not raw power.

## The Economy — Gold as Attention Budget

Gold economy follows a standard roguelike structure with income scaling:
- Start with 8 gold and 5 income
- At end of each day, receive gold equal to income value
- Income can be boosted through items and events
- Items sell for half purchase price
- The fundamental tension: invest in income-generating stash items (slower power curve, higher ceiling) vs. invest in combat items (faster power curve, lower ceiling)

**Robot Uprising parallel:** The factory production model serves the same role. Materials and energy per tick create the same invest-for-later-vs-spend-now tension. The Bazaar's income/combat tradeoff maps to Robot Uprising's relay investment (no direct combat value, but enables the information architecture that makes combat units effective).

## Hero Design — Constrained Build Diversity

Each hero has a unique pool of ~100 items plus exclusive skills and mechanics. You mostly operate within your hero's item pool — cross-hero items appear only through rare random events. This creates bounded diversity: each run explores a *different subspace* of the same hero's possibility space.

Notable heroes:
- **Vanessa:** Aggressive weapon-based strategies, damage-over-time builds. The "simple but effective" starter hero.
- **Pygmalion:** Trades early-game strength for end-game shield scaling and cooldown manipulation (freezing enemy items). The "defensive investment" hero.
- **Dooley:** Unique "Core" item that defines and transforms the build. Near-endless strategies stemming from a single centerpiece. The "engine-building" hero.

**Robot Uprising parallel:** This maps to the unit type system. Each unit type (Scout/Striker/Relay/Specialist/Command) has a constrained skill set that defines its build space, just as each Bazaar hero defines what items are available. The Bazaar's hero-as-constraint creates the same bounded creativity Robot Uprising achieves through slot limits and unit-type-specific skills. Dooley's "Core" item is particularly relevant — it's a centerpiece that transforms the entire build, comparable to the Command unit whose configuration reshapes every subordinate's behavior.

## Synergy Discovery — "The Game Is Designed to Break"

Reynad's explicit design philosophy: "The synergies you can throw into the game have been more liberal than most PvP games. The game is designed to encourage you to break it in lots of ways — and it certainly breaks."

Synergies emerge through several patterns:
1. **Type tagging:** Items belong to categories (Vehicles, Flying, Aquatic, Robotic). Skills and enchantments grant bonuses to entire categories ("Your Vehicles have +30% Crit Chance").
2. **Cooldown chaining:** Fast items that Haste or Charge adjacent items create cascading activation chains.
3. **Scaling loops:** Items that grow stronger each time they activate (or each time an adjacent item activates) create exponential power curves through the 30-second combat window.
4. **Build archetype convergence:** Poison bypasses shields. Shield builds counter raw damage. Fast builds counter slow heavy hitters. The meta creates rock-paper-scissors dynamics at the archetype level.

**Robot Uprising parallel:** The Bazaar's type-tagging system creates synergy through categorical membership ("all Vehicles benefit"). Robot Uprising creates synergy through *communication topology* ("all units listening on recon-net benefit from signals on that channel"). The Bazaar's approach is more legible (items display their types clearly) but less emergent (the synergy is authored into the item's type). Robot Uprising's approach is more emergent (synergies arise from hook wiring that players configure) but harder to read (you can't see the synergy until you watch it execute). The Bazaar's "designed to break" philosophy should inform Robot Uprising's balance: allow degenerate-feeling strategies to exist, because the feeling of breaking the game IS the reward.

## What Creates "One More Turn" / Replayability

1. **Hero diversity:** Each hero plays completely differently. Mastering one doesn't transfer mechanical skill to another.
2. **Shop randomness:** Each run presents different items from the hero's pool, forcing improvisation within a known build space.
3. **Power fantasy escalation:** The end-game scaling "feels amazing" — items Multicasting 5× with Haste stacking is a dopamine hit.
4. **Asynchronous nature:** Runs can be paused and resumed anytime, eliminating the "I don't have time for a full session" barrier.
5. **Ghost variety:** Since opponents are snapshots of real players, the PvP encounters are endlessly varied and feel "real" even though the player isn't present.

## Information Management Mechanics

The Bazaar has minimal information warfare compared to Robot Uprising:
- **Known information:** Your full item pool, your current board, your gold/income, your skills and enchantments.
- **Unknown information:** What specific items the shop will offer next, what the PvP ghost's board looks like (revealed only when combat starts, no time to adapt).
- **Meta-knowledge:** Database tools (BazaarDB, HowBazaar) let players study full item pools, synergy chains, and optimal builds externally.

**Robot Uprising contrast:** Robot Uprising's information management is the entire game. What agents know, what they don't, what they communicate, what gets evicted — information IS the resource. The Bazaar treats information as static context (you know your items, you don't know the opponent's). Robot Uprising treats information as a dynamic, contested, perishable resource that flows through a player-designed architecture. This is the fundamental design space difference: The Bazaar is about *item composition*; Robot Uprising is about *information architecture*.

## UI/UX for the Planning/Building Phase

The Bazaar's planning UI is a horizontal item tray:
- Items are displayed as cards with visible stats (cooldown, damage type, effects)
- Drag-and-drop for positioning on The Rug
- Shop items presented as a horizontal row, click to buy
- Skills displayed separately (no spatial position required)
- Enchantments shown as item modifiers with visual indicators

The UI is clean and card-game-familiar. No spatial complexity — everything is linear horizontal. Streamers and viewers can immediately parse a player's build state from a single screenshot. The tradeoff: simplicity limits expressiveness. There's no "architecture" to admire — just a row of cards.

**Robot Uprising contrast:** The workbench must show spatial relationships (board position), temporal relationships (signal latency paths), and hierarchical relationships (command structures). The Bazaar's linear tray is insufficient for this complexity. But The Bazaar's instant legibility — a viewer can glance at a board and understand the build — is something Robot Uprising's Inspector and replay systems must achieve despite greater complexity.

## Community Reception — What Players Love, What They Complain About

**Love:**
- "The best autobattler out there by a few miles" — deep strategic depth
- "Top notch visuals, designs, and incredibly diverse characters and play patterns"
- "Each run can be completely different from the next"
- The asynchronous format: "Easy to pick up and play even when life gets busy"
- Dooley's Core mechanic as a standout design

**Complain about:**
- Monetization: "One of the most aggressively monetized auto-battlers on the market." Heroes sold as DLC at game-price levels. Original free-to-play model alienated the entire community in March 2025 launch. Has since improved but scars remain.
- "Hitting a massive roadblock when it comes to monetization and progression, preventing the feedback loop from ever starting" — paywalled heroes block build diversity
- Balance issues across heroes — some builds dominant, others non-competitive
- "Many inconsistencies" in design polish

**Robot Uprising lesson:** The Bazaar's monetization disaster is a powerful cautionary tale. A mechanically excellent game can be destroyed by perceived predatory monetization. Robot Uprising's locked design (no backend, web-based) inherently limits monetization surface area, which may be a *strength* — ship the full game as a single purchase with all content unlocked.

## Sales/Reception Data

- **Steam rating:** 81% positive (Mostly Positive)
- **Peak concurrent players:** ~13,826 (Feb 2026)
- **Steady concurrent:** ~4,500-11,000 depending on time
- **Price:** $19.99 (Steam)
- **Platform:** PC (Steam), Mac, previously web/mobile
- **Development time:** ~7 years (2018 announcement to 2025 release)
- **Crowdfunding:** $115K+ on Indiegogo
- **Engine transition:** Unreal Engine → Unity (early in development)

## Specific Mechanics That Translate to Robot Uprising

### 1. The Ghost System → Invisible Randomization
Both games need PvP-feeling encounters without requiring synchronous opponents. The Bazaar's ghost database (snapshot real builds, serve them as opponents, delete after use) is a more complex version of Robot Uprising's invisible randomization (same mission varies within constraints on each execute). The key insight: **you don't need real-time opponents to create the feeling of playing against intelligence.** Ghost data from real players' builds is more varied than any AI opponent generator.

*Application for Robot Uprising:* If multiplayer is ever implemented, the async ghost model is proven. Even for single-player, the invisible randomization could incorporate community-submitted enemy configurations as "ghost" challenge scenarios.

### 2. Positional Synergy on a Linear Board → Spatial Synergy on a 2D Grid
The Bazaar's left-right adjacency system proves that even 1D positioning creates meaningful strategic depth. Robot Uprising's 2D grid with perception radii and signal propagation creates exponentially more positioning decisions.

*Application:* Steal the legibility. The Bazaar shows adjacency effects with clear visual connections between items. Robot Uprising's perception radii, signal routing, and hook connections need equivalent visual clarity — the holographic overlay system in Plan mode must make spatial relationships as readable as The Bazaar's adjacent item effects.

### 3. Cooldown Timing as Core Optimization → Signal Latency as Core Optimization
Both games make *when things happen* more important than *what things do*. The Bazaar's Haste/Slow/Freeze/Charge system maps to Robot Uprising's tick-based signal propagation, compress/amplify skills, and context overload stun mechanics.

*Application:* The Bazaar proves that timing-based optimization is accessible to casual players when visualized clearly (cooldown bars filling in real-time). Robot Uprising's signal latency needs equivalent visualization — the traveling signal dots, tick-counted hop pips, and ETA overlay from the signal latency legibility analysis (3.10b) are essential.

### 4. Hero-Constrained Item Pools → Unit-Type-Constrained Skill Sets
Both games create bounded creativity through constraints. The Bazaar's hero system prevents analysis paralysis by limiting the possibility space per run while maintaining massive variety across heroes.

*Application:* Robot Uprising's unit types already do this (Scout can't breach, Striker can't compress). The lesson is that this constraint should feel *liberating*, not limiting. The Bazaar's heroes feel like distinct playstyles, not arbitrary restrictions. Each Robot Uprising unit type needs a distinct *identity* — not just a stat block, but a personality expressed through its constraint set.

### 5. The Stash as Parallel Economy Board → Relay as Parallel Information Board
The Bazaar's innovation: items in the Stash don't fight but still generate gold and provide passive effects. This creates two optimization surfaces (combat board + economy board) from one item pool.

*Application:* Relays in Robot Uprising serve an analogous dual role — they don't fight (stationary, no perception) but process and route information that makes combat units effective. The lesson: make the non-combat contribution *visible*. The Bazaar shows Stash item gold generation explicitly. Robot Uprising's Inspector should show relay contribution metrics (signals routed, compressions performed, stun-locks prevented by filtering).

## Comparable Games — Where The Bazaar Fits

The Bazaar sits at the intersection of:
- **Super Auto Pets** (simpler auto-battler, more accessible, less depth)
- **Backpack Battles** (item-positioning auto-battler, spatial packing puzzles)
- **Slay the Spire** (roguelike deckbuilding, synergy discovery, run structure)
- **Hearthstone Battlegrounds** (hero-based auto-battler, tavern/shop economy)
- **Balatro** (combo-discovery roguelike, "break the game" philosophy)

The Bazaar's unique position: most strategic depth of any async auto-battler, with the "designed to break" synergy philosophy of Balatro applied to a competitive PvP format.

## Sensory Description

**Plan Phase (Shop/Board Management):**
A warm-toned marketplace UI. Items displayed as richly illustrated cards with glowing stat numbers — gold costs in the top corner, cooldown timers as circular progress indicators, damage/heal/shield values in bold type. The Rug stretches across the bottom third of the screen, items slotting in with satisfying *clunk* sounds and subtle glow effects on adjacency triggers. The Stash sits above or behind the Rug, dimmer but active. Shop items float in a horizontal carousel. Gold count pulses when income arrives at day's end — ka-ching — with coins visually stacking. The overall feeling: browsing a glowing bazaar stall at night, everything for sale, limited budget.

**Combat Phase:**
The 30-second auto-battle. Two boards face each other horizontally. Items pulse as their cooldown bars fill — each one a tiny heartbeat of color sweeping left-to-right. When an item fires, it flashes with its damage type (red for damage, green for heal, blue for shield, purple for poison, orange for burn). Numbers fly upward on impact. Health bars drain smoothly. The tempo accelerates as Haste effects stack — items firing faster and faster until the board is a strobing lightshow of competing effects. Freeze effects are crystal-blue, dramatically stopping an item's pulsing bar mid-fill. The final seconds are often a knife-edge: both players' health bars barely visible, last items firing, one final poison tick decides it. Win = gold burst and fanfare. Loss = Prestige cracks and ominous bass note.

**The TikTok Clip:**
A Dooley player's Core item Multicasts 7 times in a single activation, each cast triggering adjacent items, each trigger cascading Haste to the next item over, until the entire board is firing in a seizure-inducing cascade that erases the opponent's health in 3 seconds. The clip caption: "I didn't build a board. I built a resonance cascade."

---

## Player Journeys

#### Journey: Sofia, 15, Manila high schooler, never played an autobattler

**Context:** Sofia found The Bazaar through a TikTok clip of a Dooley cascade. She downloaded it on Steam. This is her first run.

**Minute 0:00 — Hero Select**
Three heroes visible: Vanessa, Pygmalion, Dooley. Each shows a portrait, a brief description, and a "Playstyle" tag. Sofia picks Vanessa because the description says "aggressive" and she wants to deal damage. She doesn't know what "auto-battler" means.

**Minute 0:30 — First Shop**
Three starting items offered. Sofia reads each card — damage numbers, cooldown timers, size indicators. She picks the one with the highest damage number, not yet understanding that cooldown matters more. A brief tutorial popup explains "items activate automatically in combat." She drags the item to The Rug. It clunks into place with a satisfying snap.

**Minute 1:00 — First Hour Events**
A shop appears with three items. Gold: 8. Items cost 3-6 gold. Sofia buys a weapon (4 gold) and a shield item (3 gold), filling three of her four starting Rug slots. She notices one slot is empty and feels anxious about it. The remaining gold: 1.

**Minute 2:00 — First PvE Fight**
A monster encounter. Sofia watches her three items pulse and fire automatically. The weapon deals damage every 4 seconds, the shield activates every 6 seconds. She can't interact — just watch. The monster dies. She gets a reward: a new item. She puts it on the Rug, filling the last slot. Satisfaction.

**Minute 3:00 — Day 1 PvP**
The screen shifts: "PvP BATTLE." An opponent's board appears — four items she's never seen. Combat starts. Both boards fire simultaneously. Sofia's weapon fires first (3.5s cooldown vs opponent's 4s). She deals damage. But the opponent has a Haste-granting item adjacent to their weapon — it fires twice in the time Sofia's fires once. Her shield absorbs one hit but she's losing. 30 seconds pass. She loses. Prestige drops by a chunk.

**Minute 3:30 — Understanding**
Sofia stares at the post-combat screen. She realizes: her opponent's items weren't *stronger* — they were *faster*. The Haste effect she ignored in the shop last round suddenly makes sense. She's not trying to do the most damage per hit; she's trying to do the most damage per 30 seconds. A subtle but total shift in mental model.

**Minute 5:00 — Day 2 Shop**
Sofia now evaluates items by cooldown first, damage second. She finds a small item (1 slot, 2s cooldown, low damage) that Hastes the item to its right. She places it to the left of her main weapon. In the next PvE fight, her weapon fires noticeably faster. The Haste visual effect (blue shimmer on the cooldown bar) gives her immediate feedback. "Oh. OHHH."

**Minute 10:00 — First Win**
Day 3 PvP. Sofia's repositioned board — Haste item → Weapon → Shield → small damage item — fires in a coordinated burst that overwhelms the ghost opponent. She wins. The gold burst and victory sound hit differently than PvE wins. This was a *real person's* build she just beat. She clicks "NEXT DAY" immediately.

**UI Annotations:**
- Rug: horizontal strip, bottom-center, 4-10 slots, items snap to grid
- Cooldown bars: thin horizontal progress bar below each item, fills left-to-right, color-coded by item type
- Adjacency indicator: faint glow line connecting adjacent items when synergy active
- Shop: horizontal item carousel, top-center, gold cost overlay
- PvP: split screen, your board bottom, opponent's board top, health bars at edges

---

#### Journey: Marcus, 38, Seattle DevOps engineer, 500 hours in Slay the Spire

**Context:** Marcus is familiar with roguelike synergy games. He's on Run 15, playing Dooley at the ranked ladder's Gold tier.

**Minute 0:00 — The Meta Read**
Marcus knows the current meta from community databases (BazaarDB). Shield-heavy Pygmalion builds are common at Gold rank. He needs Poison (bypasses shields) or raw speed (kills before shields matter). He picks a Combat Core Dooley build, planning to scale the Core item's damage exponentially through adjacent Charge and Multicast items.

**Minute 2:00 — The Decision Point**
Day 3 shop. Marcus has his Core + two support items. The shop offers three items: a Large (3-slot) Multicast engine, a Medium (2-slot) Haste buffer, and a Small (1-slot) income generator. He has 12 gold and 6 Rug slots free. The Multicast engine costs 9 gold — nearly everything. If he buys it, he can't buy anything for two more days. But if it works with the Core, the late-game scaling is absurd.

He hesitates. This is the Slay the Spire "do I take Snecko Eye?" moment — a high-risk high-reward decision that will define the entire run. He buys the Multicast engine. Places it adjacent to the Core. In the next PvE fight, the Core fires three times instead of once. Each cast triggers his damage enchantment. The numbers are enormous. He grins.

**Minute 8:00 — The Ghost Wall**
Day 6 PvP. Marcus's board is now a devastating cascade machine. But the ghost opponent is a Diamond-tier player's build from a previous run — heavily optimized. The opponent has Freeze items targeting Marcus's fastest items. His Multicast engine freezes for 4 seconds — nearly half the combat. Without it, the Core fires only once per cycle. He loses.

Marcus enters the post-combat analysis mode (minimal in The Bazaar — just a replay). He watches the Freeze hit. He needs anti-Freeze or redundant Multicast sources. The Bazaar doesn't offer many tools for *understanding* why you lost — just the raw replay. He has to intuit the problem.

**Minute 12:00 — The Adaptation**
Day 7 shop. Marcus sells a medium item to fund a "Radiant" enchantment ("Freeze and Slow effects last half as long"). He places it on his Core. The next PvP fight, the Freeze lands but only lasts 2 seconds. His cascade fires in the remaining 28 seconds. He wins narrowly.

**Minute 20:00 — The Ceiling**
Day 10. Marcus's board is fully optimized. The Rug is packed: Haste → Charge → Core (Radiant) → Multicast → Multicast → small Poison backup → Stash income generators. The final PvP opponent's build is wild — something he's never seen, a burn-stacking Vanessa board with 8 small items all firing every 2 seconds. A machine gun of small damage. His shield can't keep up. He loses his final Prestige. Run over.

Marcus immediately starts a new run. He opens BazaarDB in another tab to study burn-counter options. The "one more run" hook is the build-curiosity: "I wonder if a Freeze-focused defensive Core would counter burn spam?"

**UI Annotations:**
- BazaarDB: external browser tool, item database with filters (Hero, Size, Rarity, Enchantment)
- Replay: simple combat replay, no frame-by-frame, no detailed analytics
- Enchantment indicator: colored gem on item corner (blue=Radiant, gold=Golden, purple=Obsidian)
- Stash: visible behind/above Rug, dimmed items with gold-generation indicators pulsing

---

#### Journey: Aisha, 42, Nairobi eSports tournament organizer, evaluating The Bazaar for competitive events

**Context:** Aisha runs autobattler tournaments. She's assessing whether The Bazaar's format works for organized competition.

**Minute 0:00 — The Async Problem**
Aisha opens The Bazaar in ranked mode. The first thing she notices: there's no way to watch two players compete simultaneously. Since matches are asynchronous, both players are fighting *different* ghosts at different times. There's no shared battlefield. No dramatic tension of watching two builds clash in real-time.

**Minute 5:00 — The Spectator Gap**
She searches for a spectator mode. There isn't one. She can't watch another player's run in progress. For tournament purposes, this means: players stream their own perspective, casters switch between streams, and the "competitive moment" is always after-the-fact (checking final standings, not watching live combat).

**Minute 15:00 — The Ranking Insight**
The Elo system is run-aggregate — your entire run's wins and losses adjust your rating at the end, not match-by-match. This means individual PvP fights don't have stakes visible to an audience. It's like ranking a poker player by session results rather than hand results. Good for statistical accuracy, bad for spectator drama.

**Minute 30:00 — The Content Creator Angle**
Aisha watches several Twitch streams of The Bazaar. The content works: streamers narrate their decision-making in the shop phase ("Should I buy this Haste item or save for the Multicast?"), viewers vote in chat polls, and the 30-second combat provides a natural climax-and-resolution beat every few minutes. The format is inherently streamable even without formal spectator tools.

She concludes: The Bazaar is excellent content-creator material but poor formal tournament material. The async format that makes it accessible for players makes it awkward for organized competition.

**UI Annotations:**
- Ranked mode: Elo rating displayed top-right, rank icon (Bronze/Silver/Gold/Diamond)
- No spectator mode: no way to observe another player's run in progress
- Streaming: standard OBS capture of game window, no native streaming tools

---

#### Journey: Tomás, 14, Cebu middle schooler, plays on a low-end laptop during lunch break

**Context:** Tomás has 20 minutes between classes. He discovered The Bazaar from a classmate's phone.

**Minute 0:00 — The Resume**
Tomás opens Steam, clicks The Bazaar, and his in-progress run loads instantly. He's on Day 4 of a Vanessa run. His board has 3 items. He has 15 gold saved. The async design means he paused mid-run yesterday and picks up exactly where he left off. No reconnection penalty, no lost progress, no opponent waiting.

**Minute 0:30 — The Quick Shop**
A merchant hour. Tomás quickly scans three items. He recognizes one from yesterday's research (he was looking at builds on HowBazaar during math class). It's a Burn enchantment for his weapon. Costs 10 gold — expensive. He buys it. The enchantment animation plays: the weapon card glows orange, a flame icon appears on its corner. He drags it back to position 2 on the Rug.

**Minute 2:00 — The Classroom Combat**
PvP fight. Tomás hunches over his laptop, aware that the teacher might notice. The 30-second auto-combat plays out. His Burn-enchanted weapon deals persistent damage over time. The opponent's shields partially counter it (shields reduce Burn by 50%), but his raw weapon damage + Burn stack overwhelms. He wins. He pumps his fist under the desk. A classmate glances over. "What level are you?" "Day 4."

**Minute 5:00 — The Save Point**
Tomás hears the bell. He can't finish Day 5. He closes the laptop. The Bazaar saves automatically — he'll pick up at exactly this point tomorrow. Zero progress lost. The async model means his 5-minute sessions accumulate into a coherent 30-minute run over three lunch breaks.

**UI Annotations:**
- Save/resume: automatic, seamless, no explicit save button
- Load time: <3 seconds from click to gameplay on mid-range hardware
- Session flexibility: any hour boundary is a natural save point

## Interaction Effects with Robot Uprising Design Space

| Robot Uprising System | The Bazaar Lesson | Application |
|---|---|---|
| **Sealed Watch** | 30-second auto-combat is *too short* for emotional investment. Players treat it as a validation check, not an experience. | Robot Uprising's sealed watch (1 second/tick, 30-120 ticks) is deliberately longer and the "no skip, no pause" rule forces emotional engagement. The Bazaar validates that *some* watch period works; Robot Uprising correctly extends it. |
| **Inspector** | The Bazaar has almost no post-combat analysis tools. Players rely on external databases (BazaarDB) to understand synergies. This is a gap, not a feature. | Robot Uprising's Inspector is its competitive advantage. The two-act debrief (emotional → analytical) solves a problem The Bazaar doesn't even attempt. |
| **Plan Screen (Workbench)** | Linear horizontal item tray is immediately legible but limits expressiveness. | Robot Uprising's 2D workbench with spatial board, hook wiring, and perception radii needs The Bazaar's legibility but can't sacrifice its dimensionality. The holographic overlay (6.01c) is the solution. |
| **Ghost/Async PvP** | Async PvP works commercially and emotionally. Players accept fighting snapshots of real builds as "real PvP." | If Robot Uprising implements multiplayer, the ghost model is validated. Even single-player's invisible randomization can incorporate community ghost data. |
| **Onboarding** | The Bazaar's first-run tutorial is minimal — "items fire on cooldowns, buy items, win fights." Complex synergies are discovered, not taught. | Robot Uprising's boot log + tutorial missions are a more structured approach. The Bazaar's organic discovery works for simple systems (items on a line); Robot Uprising's complex systems (hooks, channels, context windows) need more scaffolding. |
| **Monetization** | Predatory monetization destroyed community trust at launch. Recovery took months. | Ship Robot Uprising as a complete package. No hero DLC, no loot boxes, no gacha. The web-native locked tech stack naturally limits monetization surface. |
| **Content Creation** | The Bazaar is highly streamable despite no spectator mode. The shop-decision → combat-resolution cadence creates natural streaming beats. | Robot Uprising's Plan → Execute → Inspect three-screen loop creates even stronger streaming beats. The sealed watch is the "hold your breath" moment. Design for this. |

## New Aspects Discovered

- **1.10a — The Bazaar's adjacency-first synergy vs. Robot Uprising's topology-first synergy:** deep comparison of how 1D positional synergy (adjacency on a line) creates different strategic depth than 2D+temporal synergy (spatial positioning + signal latency). Which creates more memorable "discovery moments"? Which is more accessible? Can Robot Uprising borrow The Bazaar's instant-feedback adjacency effects for any of its systems?
- **1.10b — The 30-second combat window as pacing constraint:** does fixed combat duration (The Bazaar's 30 seconds) create better design constraints than variable duration (Robot Uprising's tick budgets per mission)? The Bazaar's fixed window means all builds are evaluated on the same timescale. Robot Uprising's variable budgets create mission-specific optimization targets. Which serves replayability better?
- **1.10c — Ghost database as community content pipeline:** The Bazaar's ghost system inadvertently creates a massive database of real player builds. Could Robot Uprising's ghost/async model double as a community sharing mechanism? "Your failed battle configuration just became someone else's mission challenge."
- **1.10d — The stash as non-combat optimization surface:** The Bazaar's dual-board system (Rug for combat, Stash for economy) creates two parallel optimization games. Robot Uprising could learn from this: relay placement isn't just about signal routing — it could have explicit "economy mode" benefits (faster production, resource generation from information processing). Making the non-combat contribution quantified and visible.
- **1.10e — External database dependency as design failure:** The Bazaar's community relies on BazaarDB, HowBazaar, and other external tools to understand synergies and plan builds. The game's internal UI is insufficient. Robot Uprising's Blueprint Codex and Inspector are designed to prevent this — all analysis tools should be in-game. But the existence of external databases also proves player appetite for deep analysis tools. How deep should the in-game tools go?
