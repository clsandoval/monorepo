# 6.11d — Demo as Competitive Event Infrastructure

## Overview

Most game demos are static: a slice of content frozen in time, played once, then abandoned. The web demo for Robot Uprising doesn't have to be this way. Because the game runs on a fully web-native stack (React + Pixi.js + Vite), the demo IS the game — same engine, same renderer, same tick scheduler. This creates a structural opportunity: the demo can become a **living competitive platform** with weekly challenges, community leaderboards, and ongoing events that keep players returning to a free browser experience long after their first visit.

The question isn't "can the demo have leaderboards?" — it's what shape the competitive infrastructure takes, how it interacts with the full game's Gauntlet mode, and whether the demo becomes a permanent community gathering point or a time-limited acquisition funnel.

This is "The Tetris 99 Question": can a free, accessible version of Robot Uprising sustain its own competitive community indefinitely?

---

## Comparable Games: How Others Do This

### Slay the Spire — The Daily Climb

Slay the Spire's Daily Climb is the gold standard for adding competitive infrastructure to a single-player game. Every day, all players get the same seeded run with a randomly-selected character and three modifiers (e.g., "all items cost 25% more," "elite enemies swarm the spire"). Final score goes on a 24-hour leaderboard. You get one attempt per day.

**What works:** The shared seed creates a conversation — Reddit and Discord threads dissect optimal routes because everyone played the same map. The three-modifier system creates genuine variety (bonuses + penalties force novel strategies). The 24-hour reset creates urgency — miss today's climb, it's gone forever. Score optimization is deep: the 45-minute Light Speed bonus (50 free points) creates time pressure; multiple score multipliers (Highlander, Pauper, no-damage elite fights) create layered optimization goals.

**What doesn't:** Players exploit the system with alt accounts — play the daily once to map the seed, then replay on their main for a perfect run. The mode is locked behind owning the full game, so it's not a demo-level feature. Score inflation from modifier luck means some days produce 1700+ point scores while others cap at 900, making cross-day comparison meaningless.

**What translates:** The shared-seed model maps perfectly to Robot Uprising's deterministic execution. Give every player the same enemy configuration, same terrain, same starting resources. Their blueprint designs and production queues are the variable. Score dimensions map to the game's own metrics: ticks survived, enemies eliminated, context overload events avoided, EM emission budget.

### Tetris 99 — The Maximus Cup

Tetris 99 is free-to-play (for Nintendo Switch Online subscribers) and has sustained 52+ Maximus Cup events over seven years. Each Cup runs over a weekend: play matches, earn points based on placement (1st place = 100 points, last place = 1 point), reach 100 points to unlock a cosmetic theme. Events are themed around other Nintendo properties (Super Mario Galaxy, Kirby, Splatoon).

**What works:** The point system is brilliantly inclusive — even a terrible player who finishes last 100 times earns the reward. Skilled players can earn it in a single match. This means the event serves both audiences: competitive players chase first-place finishes for bragging rights, casual players grind for the cosmetic unlock. The themed cosmetics create collection pressure and cross-pollinate audiences (Mario fans try Tetris 99 for the Galaxy theme). Seven years and 52 events later, the game still has an active community.

**What translates:** The "everyone can earn it" design prevents the demo from feeling like a walled garden for elite players. Robot Uprising's weekly challenges could offer cosmetic Blueprint Codex skins, unit color schemes, or campaign map decorations that everyone can earn through participation, while leaderboard positions reward skill. The themed events model works with the locked campaign map — Philippine province skins, seasonal weather effects on the battlefield, special unit visual variants.

### Zachtronics — The Histogram as Social Loop

Zachtronics games (Shenzhen I/O, Opus Magnum, TIS-100) show completion histograms for every puzzle: three axes (cycles, cost, area), your score plotted against the global distribution. The game tracks your friends' scores specifically. Community leaderboard bots in Discord extend this further.

**What works:** The histogram turns optimization into a social activity without requiring real-time competition. Seeing your solution is in the 60th percentile for cycles but the 20th percentile for cost creates an immediate personal challenge. The three antagonistic axes mean everyone's solution is "good" at something — nobody is simply "bad." The community leaderboard bot created an external layer of competition that the developers didn't have to maintain.

**What translates:** Robot Uprising's demo challenges could show histograms for tick count, context overload events, EM emission total, and blueprint complexity (rule count + hook count). The three-axis tension (speed vs. stealth vs. simplicity) mirrors Zachtronics perfectly. The histogram is also the "TikTok clip" — a screenshot of your score beating the curve is inherently shareable.

### Vampire Survivors — The Itch.io Living Demo

Vampire Survivors launched as a free browser game on itch.io in March 2021 and kept it alive alongside the paid Steam version. The itch.io page accumulated 440+ comments, with players routinely writing things like "Great game, thanks for the free demo here, after 1 round I bought it on Steam!" The demo version received occasional content updates but was explicitly positioned as a subset of the full game.

**What works:** The always-available browser version removed all friction from word-of-mouth ("just click this link"). The comment section became a community gathering point. Conversion was organic — players chose to buy, not because of a hard gate, but because they wanted more content. The demo stayed live years after the full release.

**What doesn't:** No competitive infrastructure. No leaderboards, no challenges, no events. The demo was retained because it was useful for acquisition, not because it was a living product.

**What translates:** Robot Uprising's demo should stay permanently live as a URL anyone can share. But the Vampire Survivors model is passive — it relies on the game being so good that people self-convert. Adding competitive events transforms the demo from a passive sample into an active community.

---

## Six Design Options

### Option A: "The Weekly Gauntlet Lite"

**Core concept:** Every Monday at 00:00 UTC, a new challenge configuration appears in the demo. All players get the same enemy spawner layout, terrain, and starting resources. Players design their blueprints, execute, and their score (multi-axis: ticks, kills, overloads, EM) goes on a weekly leaderboard. One submission per week. Histograms visible to all.

**Mechanical details:**
- The demo includes Mission 1-4 content (pre-placed units, no factory) plus a dedicated "Challenge" tab on the main menu
- Each weekly challenge is hand-authored by a designer OR procedurally generated from a curated seed space
- The challenge rotates through terrain types (rice terrace, jungle, beach, urban, volcanic) to showcase variety
- Score is submitted automatically after the sealed watch completes
- Leaderboard shows: rank, player name, tick count, kills, overloads, EM total — sortable by any column
- Histograms for each metric axis appear after submission, with your position highlighted
- Previous weeks' challenges remain playable but their leaderboards are frozen

**What it looks like:**
The demo's main menu shows two options: "Campaign" (Missions 1-4) and "Weekly Challenge." The Challenge tab glows with a subtle gold pulse when a new challenge is available. Entering the challenge shows a splash card: terrain preview (isometric 8×8 board with enemy positions revealed), constraint text ("3 Scouts, 2 Strikers, 1 Relay — configure their attention systems to survive 40 ticks"), and a countdown timer showing how long until the challenge expires. The board preview rotates slowly, casting soft shadows, with enemy spawner positions pulsing red.

After submitting, the screen transitions to a results card: your configuration rendered as a compact blueprint schematic on the left, the histogram wall on the right. Each histogram is a horizontal bar chart — your position marked by a glowing cyan diamond, the median marked by a white line, the top 1% marked by a gold line. Below the histograms, a "Share" button generates a shareable results image: the blueprint schematic overlaid with your percentile rankings, the Robot Uprising logo, and a "Play free at [URL]" watermark.

**Strengths:**
- Zero marginal content cost (procedural or minimal manual effort per week)
- Histograms are inherently shareable ("I'm in the top 5% for stealth!")
- Teaches the community the vocabulary of multi-axis optimization early
- One submission per week prevents grinding and preserves strategic depth
- Archives build a "puzzle book" of interesting configurations

**Weaknesses:**
- One submission per week means a misclick or misunderstanding costs you the entire week
- Pre-placed unit challenges (Mission 1-4 scope) limit design space — no factory, no production
- No real-time social interaction — purely asynchronous
- Hand-authored challenges require ongoing designer labor; procedural may produce unbalanced puzzles

---

### Option B: "The Sandbox Arena"

**Core concept:** The demo includes a free-play sandbox mode with a fixed unit palette. Players can build any configuration they want, test it against preset enemy patterns, and submit their best run to a persistent all-time leaderboard. No weekly rotation — the sandbox is always open, always the same.

**Mechanical details:**
- One fixed 8×8 board with medium terrain complexity (urban Cebu map — recognizable, interesting)
- Full unit palette unlocked (all 5 types, all 12 skills) but limited to 6 total units
- Enemy configuration is fixed and known: a published spawner schedule that never changes
- Players can execute as many times as they want before submitting
- Submission locks the configuration — visible to other players who can copy and modify it
- All-time leaderboard with separate categories per metric axis
- A "Solutions" browser lets you inspect any submitted configuration's blueprint

**What it looks like:**
The sandbox opens to a split screen: the familiar 8×8 board on the left, the full workbench on the right. Every skill, every rule template, every hook type is available. The enemy spawner schedule is printed on a scrolling ticker at the top of the board: "T1: Scout at E3, T5: Striker at B7, T8: Relay at D1..." — all information is perfect. Below the board, a "PRACTICE" button runs the simulation without submitting. A "SUBMIT BEST" button appears after at least one successful execution.

The leaderboard screen looks like Opus Magnum's histogram gallery: three tall histograms (speed, stealth, elegance) with your score positions marked. Below, a "Top 100" table with expandable rows — click any row to see the full blueprint configuration, then a "Copy to Workbench" button to start from that player's design.

**Strengths:**
- Maximum depth — the full design space is explorable
- Solution sharing creates a learning ecosystem (study the best, then beat them)
- No time pressure — good for thoughtful, iterative players
- The fixed enemy configuration becomes a community-studied "puzzle" with known optimal strategies
- Effectively infinite replayability — the optimization ceiling is always higher

**Weaknesses:**
- Stale meta — within weeks, dominant strategies emerge and the leaderboard calcifies
- No urgency to return — there's no "this week only" hook
- Overwhelming for new players (full skill palette with no tutorial framing)
- Solution copying can feel like cheating — top of leaderboard may be marginal variations of the same design
- The fixed enemy config may not showcase the game's true variety

---

### Option C: "The Daily Config"

**Core concept:** Every day, a new constraint set drops. "Today: Scouts only, 4 units, beach terrain, enemy uses hacking." Players build within the constraint, execute once, score posted. Yesterday's constraint + top solutions are archived. Slay the Spire's Daily Climb, adapted.

**Mechanical details:**
- Constraint dimensions: unit type restriction, unit count, terrain, enemy behavior archetype, skill restrictions, hook slot limits, buffer size overrides
- Each day's constraint is generated from a seed (deterministic, reproducible)
- One execution per day — no retries, no practice mode
- Score is composite: 40% survival ticks, 30% kills, 20% stealth (inverse EM), 10% elegance (inverse rule count)
- Daily leaderboard with 24-hour visibility, then archived
- "Streak" counter for consecutive days played — visible on profile

**What it looks like:**
Opening the demo greets you with today's Daily Config card: a dark slate panel with constraint icons arranged in a row — unit silhouettes (greyed out types are restricted), terrain thumbnail, enemy archetype icon (red skull with hack symbol = hacking-focused enemy), special modifiers (lightning bolt = "double tick speed," padlock = "no compress skill"). Below: "Configure. Execute once. Score." The constraint card has a "What's this?" tooltip on each icon explaining the modifier.

After execution, the result screen shows your score breakdown as a vertical bar with colored segments (amber for ticks, red for kills, teal for stealth, white for elegance), your rank on the daily board, and a "Share Daily" button that generates an image: the constraint icons + your score bar + rank + "Robot Uprising Daily — [date]."

The streak counter appears as a horizontal chain of connected circuit nodes at the top of the demo's main menu — each day played adds a glowing node, and the chain dims after a missed day (streak resets). A 7-day streak earns a "Seven Cycles" badge visible on the leaderboard.

**Strengths:**
- Daily cadence creates habit formation — "check the daily before breakfast"
- Constraints force players to explore the design space (can't just reuse yesterday's config)
- One execution adds weight and anxiety — every decision matters
- Streaks create non-monetary retention hooks
- Archives become a "design space exploration history" — players learn from constraint variety
- The constraint system can be extended infinitely

**Weaknesses:**
- One execution per day is punishing for new players who misunderstand a mechanic
- Daily rotation requires either manual authoring or robust procedural generation
- Some constraint combinations may produce trivially easy or impossibly hard challenges
- The 24-hour window excludes players in certain timezones (challenge drops at midnight UTC)
- Streak anxiety can feel coercive — "I can't miss a day" as negative motivation

---

### Option D: "The Bounty Board"

**Core concept:** Community-generated challenges. Any player can create a challenge by specifying constraints (unit types, terrain, enemy config, special rules) and posting it as a "bounty." Other players attempt the bounty. The creator earns reputation when their bounty gets many attempts. Top solver earns a badge per bounty.

**Mechanical details:**
- Bounty creation UI: a simplified version of the plan screen workbench, but for ENEMY configuration and CONSTRAINT specification
- Each bounty has a difficulty rating (auto-calculated from constraint severity + enemy count)
- Bounties are categorized: "Puzzle" (specific optimal solution exists), "Optimization" (open-ended, score-based), "Survival" (last as long as possible)
- Creator can set a "par score" — their own best attempt, displayed as a ghost line on the histogram
- Bounty lifetime: 7 days active, then archived
- Top 3 solvers per bounty get visible badges on their demo profile
- Bounty creators earn "Architect" reputation points

**What it looks like:**
The Bounty Board is a physical corkboard aesthetic: challenge cards pinned at slight angles, each card showing terrain thumbnail, constraint icons, attempt count, creator name, and difficulty stars (1-5). Cards are color-coded: teal border for "Puzzle," amber for "Optimization," red for "Survival." Hovering over a card lifts it slightly and shows a tooltip with the creator's par score and top 3 solver names. The board scrolls horizontally — "Hot" (most attempts this week), "New" (posted today), "Unsolved" (zero completions), "My Bounties" (your creations).

Creating a bounty feels like being on the OTHER side of the game: you're designing the enemy's attention system. The creation screen uses the same workbench but with red-tinted UI: red hook wires, red rule strips, red unit silhouettes. You place enemy spawners, configure their behavior, set constraints for the challenger. A "TEST YOUR BOUNTY" button lets you verify it's solvable before posting.

**Strengths:**
- Infinite content — community generates challenges faster than any dev team
- Creator/solver duality teaches both sides of the design space
- Reputation system creates community hierarchy and recognition
- Unsolved bounties create mystique — "has anyone beaten DarkRelay's Suicide Run?"
- The bounty creation experience teaches enemy AI design — transferable skill
- Bounty sharing is inherently viral: "I made this, can you beat it?"

**Weaknesses:**
- Quality control nightmare — most community-generated challenges will be terrible
- Griefing potential: impossible bounties, trivial bounties that spam the board
- Requires moderation infrastructure (reporting, quality scoring, auto-deletion)
- The enemy configuration UI is complex to build and maintain
- New players overwhelmed by the board — no curation for beginners
- Reputation gaming: create easy bounties that get many attempts for cheap reputation

---

### Option E: "The Evolution Chain"

**Core concept:** Each week starts with a designer-authored "seed configuration" — a working but suboptimal blueprint setup. Players improve one thing about it and submit. The best improvement becomes next week's starting point. Over months, the community collectively evolves a configuration from naive to masterful.

**Mechanical details:**
- Week 1: a designer creates a simple 3-unit configuration (1 Scout, 1 Relay, 1 Striker) with basic rules
- Players can modify UP TO 3 elements (e.g., change 2 rules and 1 hook, or add 1 skill and change 2 context config entries)
- Submissions are ranked by performance improvement over the seed
- The top-ranked submission becomes the new seed for next week
- A "Family Tree" visualization shows the evolution chain across weeks
- Special "branch" events: two seeds diverge, community votes on which lineage continues

**What it looks like:**
The Evolution Chain screen shows a vertical timeline: at the top, the original naive seed (rendered as a small blueprint card). Below it, a branching tree of weekly improvements — each node is a card showing the modifier's name, what they changed, and the performance delta. The current week's seed glows gold at the bottom, with a "MODIFY" button that opens the workbench with the seed pre-loaded and a red outline around the 3 modifiable slots.

After submitting, your improvement appears as a pending branch: a dotted line extending from the current seed, with a preview of your changes. When the week closes, the winning branch solidifies into a bright cyan connection, and all other branches fade to dim grey. A "REPLAY EVOLUTION" button plays an accelerated montage: each week's sealed watch compressed into 3 seconds, the configuration visibly improving — units moving more purposefully, fewer overloads, cleaner eliminations. The montage is auto-generated and shareable.

**Strengths:**
- Teaches iterative improvement — the core engineering skill the game wants to transmit
- Low barrier — you only change 3 things, not build from scratch
- The family tree is a compelling visualization of collective intelligence
- Branch events create community drama — "which lineage will survive?"
- The evolution montage is an incredible TikTok clip — 30 seconds of visible improvement
- New players learn by studying the chain: "why did this change improve performance?"

**Weaknesses:**
- Only one lineage survives — feels wasteful of good alternative approaches
- The 3-modification limit may be too restrictive for meaningful improvement
- Late in the chain, the configuration may be near-optimal, making further improvement marginal
- Depends on consistent weekly participation — a dead week kills momentum
- The "best improvement" metric may favor incremental tweaks over bold restructuring
- Community may disagree with which submission won — "that's not really better, the seed this week was just lucky"

---

### Option F: "The Seasonal Circuit"

**Core concept:** A 4-week competitive season with escalating challenges. Week 1: tutorial-level constraint. Week 2: intermediate. Week 3: advanced. Week 4: grand finale — hardest challenge, biggest leaderboard, most prestige. Season standings track cumulative performance. Top players at season end get permanent badges.

**Mechanical details:**
- Season lasts 28 days (4 challenges, 7 days each)
- Each challenge uses progressively more game mechanics (Week 1 = context only, Week 2 = + rules, Week 3 = + hooks, Week 4 = full system)
- Players get 3 attempts per challenge (best score counts)
- Cumulative season score = sum of best scores across all 4 challenges
- Season leaderboard shows rank, cumulative score, per-challenge breakdown
- Season rewards: Top 100 get a permanent badge. Top 10 get a named badge. #1 gets a custom title.
- Between seasons: 3-day "intermission" with a sandbox mode open
- New season = new terrain theme, new enemy behaviors, new constraint flavor

**What it looks like:**
The Season screen is dominated by a Philippine archipelago map — the locked campaign map, but repurposed. Each week's challenge maps to a province: Week 1 in Ifugao (rice terraces — gentle, tutorial), Week 2 in Palawan (jungle — intermediate), Week 3 in Cebu (urban — complex), Week 4 in Taal (volcano — the final boss). Completed provinces glow cyan; the current province pulses gold; upcoming provinces are dim. Your season rank floats above the map in a circuit-board badge.

The grand finale screen (Week 4) has ceremony: the volcano terrain shimmers with heat distortion. Enemy spawners are visibly more numerous. The constraint card has more icons than any previous week. A countdown timer shows hours remaining. The sealed watch for Week 4 is accompanied by a low rumbling audio track that builds with each tick — the game FEELS like a finale.

At season end, a "Season Results" ceremony plays: the archipelago map lights up province by province as your scores are announced, then zooms out to show your rank among all players. The top 10 names scroll in gold. Your permanent badge materializes with a forge-striking animation and a metallic ring sound, then pins itself to your profile.

**Strengths:**
- The escalating structure teaches the game's mechanics in order — Week 1 is effectively a tutorial
- 4-week commitment creates real investment and community
- 3 attempts per challenge reduces single-execution anxiety
- The seasonal reset prevents meta stagnation — every month is a fresh start
- The campaign map reuse creates visual continuity between demo and full game
- Season badges create permanent social proof — "I was Top 10 in Season 3"
- The finale ceremony creates a shared emotional peak every month

**Weaknesses:**
- 4-week commitment may be too long for casual demo players
- Players who join mid-season are at a disadvantage (missed Week 1-2 scores)
- Requires meaningful challenge design 12+ times per year (3 seasons × 4 challenges)
- Top 100/Top 10 rewards create steep competition — most players get nothing
- The seasonal structure doesn't accommodate irregular play patterns
- Server infrastructure needed for persistent leaderboards, account management, badge storage

---

## Player Journeys

### Journey: Ava, 23, Marketing Analyst, Never Played a Strategy Game

**Context:** Ava saw a TikTok of the Evolution Chain montage — 30 seconds of a configuration getting visibly smarter over 8 weeks. She thinks "that's cool" and clicks the link in the bio.

**Minute 0:00 — First Contact**
The demo loads in under 2 seconds. A clean splash screen: "ROBOT UPRISING" in angular teal letters on dark gray, a subtle circuit-board pattern behind the text. Two buttons: "Campaign" and "This Week's Challenge." Ava clicks "This Week's Challenge" because it sounds more interesting than a tutorial.

**Minute 0:15 — The Challenge Card**
A dark slate card slides in from the right. Terrain: beach (Palawan jungle — she sees palm trees and turquoise water in the thumbnail). Constraint icons: two Scout silhouettes, one Relay silhouette, one Striker silhouette — the other unit types are greyed out X'd icons. A red skull icon with a speaker symbol: "Enemy uses amplify — signals are LOUD." Below: "Configure their attention systems. Execute once. Climb the board."

Ava doesn't know what "attention systems" means. A pulsing "?" icon next to the constraint text opens a tooltip: "Each unit has a context window — a short-term memory. You decide what fills it and what gets evicted. Tap a unit to begin." She taps the Scout.

**Minute 0:45 — First Configuration**
The workbench opens for the Scout. It looks like a phone's settings screen: toggleable rows for skills (patrol is ON, evade is OFF — she can toggle one), a list of rules (one rule pre-filled: "IF enemy_visible THEN send to recon-net"), and a context config section showing a buffer bar with 6 slots. She doesn't understand most of it. She toggles evade ON because "evade sounds good."

She moves to the Relay. Its workbench has more hook slots (4 vs the Scout's 2). One hook is pre-filled: "ON recon-net RECEIVE → compress → forward to strike-net." She doesn't change anything. She moves to the Striker. One rule: "IF context contains threat THEN engage nearest." She leaves it.

**Minute 2:00 — The Execute**
She presses the EXECUTE button (top-right, glowing amber, bold sans-serif label). The screen transitions: the workbench slides away, the board expands to center-screen. A horizontal tick clock appears at the top — 8 empty pips. The first pip lights up. Tick 1: her Scout moves one tile east. Enemy scout appears at the far corner. Nothing happens. Tick 2: her Scout's perception cone (faint teal highlight on surrounding tiles) reaches the enemy. A green flash — signal sent. The channel wire briefly illuminates between Scout and Relay: a teal dashed line with a flowing particle. Tick 3: the Relay compresses and forwards. Another dashed line, Relay to Striker. Tick 4: the Striker receives. Tick 5: the Striker begins moving toward the threat.

But — the enemy is using amplify. A loud signal blast (red expanding ring from the enemy Relay, occupying 3 tiles) fills her Scout's context window. The Scout's context bar (tiny colored pips at the bottom of its tile) fills from 2/6 to 6/6 in one tick. A jittering animation — the Scout is stunned. Sparks fly from its sprite. One tick lost.

**Minute 3:30 — The Result**
She survives 28 ticks before being overwhelmed. The result screen shows her score: 28 ticks survived, 3 kills, 4 context overloads, high EM emission. Histograms appear: she's in the 40th percentile for ticks, 55th for kills, 25th for stealth. A share button generates an image. She screenshots it and texts it to a friend: "I'm in the top 55% for kills lol."

**Minute 4:00 — The Hook**
She notices the histogram shows the top 1% survived 40 ticks — the maximum. She wonders: "How did they avoid the overload?" She goes back to the Campaign tab and plays Mission 1 to learn. The tutorial makes more sense now because she has a concrete question: "How do I stop my Scout from getting stunned?"

**UI Annotations:**
- Challenge Card: centered modal, 400×500px, dark slate background, rounded corners, constraint icons as 32×32 SVGs in a horizontal row, tooltip on hover/tap
- Histogram wall: three horizontal bar charts stacked vertically, each 300px wide × 60px tall, gradient fill (cool blue → amber → red), cyan diamond for player position, white line for median, gold line for top 1%
- Share image: 1080×1080 square, dark background, blueprint schematic left half, histograms right half, logo bottom-center, URL watermark bottom-right

---

### Journey: Marcus, 38, Senior Software Engineer, Factorio Veteran

**Context:** Marcus has been playing the full game since launch. He opens the demo's Weekly Gauntlet Lite on his lunch break because his coworker challenged him.

**Minute 0:00 — The Challenge**
This week's challenge: urban Cebu terrain, 2 Scouts / 2 Relays / 2 Strikers / 1 Specialist, enemy uses hack + noise flood. Marcus immediately recognizes the problem: the hack skill can corrupt context entries, and the noise flood will push toward overload. He needs tight context filters and compress on the Relays.

**Minute 0:30 — Architecture Planning**
He doesn't touch the units yet. He opens the constraint card and studies the enemy spawner schedule (revealed for challenge mode). Four enemy Scouts spawn at T1 (corners), two enemy Relays at T8 (center), one enemy Striker at T15 (back row). He maps the timeline on paper: "T1-7 is scouting phase, T8-14 is noise phase, T15+ is kill phase."

He configures his Scouts with tight perception (filter out EM noise), patrol patterns that avoid the center (where Relays will spawn), and hooks that send ONLY confirmed enemy positions (not noise echoes). His Relays get compress + filter: compress incoming signals, filter out anything older than 3 ticks. His Strikers get a single rule: "IF context contains compressed_threat AND age < 2 THEN engage." The Specialist gets hack + extract: hack the enemy Relays to reduce their noise output, extract intelligence from hacked units.

**Minute 5:00 — Execute**
He watches the sealed watch with his arms crossed. The scouting phase goes perfectly — his Scouts avoid the center, send clean signals. T8: enemy Relays spawn and begin flooding noise. His Relays catch it — compress strips the noise, forwards clean threat data. T12: his Specialist hacks an enemy Relay. The enemy Relay's sprite flickers — it stops broadcasting for 3 ticks. T15: the enemy Striker appears, but his Strikers already have its position from compressed intel. They converge. Clean elimination at T18. The remaining enemy Scouts fall by T25.

**Minute 6:00 — The Score**
40 ticks survived (maximum — all enemies eliminated). 6 kills. 0 context overloads. Low EM emission (compressed signals are quieter). He's in the top 3% for ticks, top 1% for stealth. He screenshots the histogram and sends it to his coworker: "Your move."

**Minute 6:30 — The Inspection**
He clicks "Inspect" and scrubs to T12 — the hack moment. The Specialist's decision trace shows: "Rule: IF context contains relay_position AND NOT tagged THEN hack." The context window at T12 had the enemy Relay's position (from a Scout signal compressed through his own Relay) in slot 3, age 1 tick. The hack skill activated. He nods: the architecture worked exactly as designed.

**UI Annotations:**
- Enemy spawner schedule: scrolling ticker, monospace font, timestamps left-aligned, unit type + position pairs, red-tinted text for enemy entries
- Inspect mode: identical to full game's Inspector — timeline scrubber, click-to-inspect, decision trace sidebar, context window state per tick
- Coworker share: direct link to your result card, recipient sees your histograms overlaid with their own (if they've also completed this week's challenge)

---

### Journey: Zara, 16, High School Student, Plays Mobile Games Casually

**Context:** Zara's friend shared a Robot Uprising Daily Config link in their Discord server. She opens it on her phone during study hall.

**Minute 0:00 — Mobile Load**
The demo loads in the phone's browser. The UI adapts: the 8×8 board is centered, the workbench opens as a bottom drawer (swipe up to expand, swipe down to collapse). Today's Daily Config: "Scouts only. 4 units. Rice terrace terrain. Enemy: 3 Scouts, 1 Striker. Survive 20 ticks."

**Minute 0:15 — Touch Configuration**
She taps Scout 1. The bottom drawer expands: skill toggles as big, thumb-friendly switches. Rules as swipeable sentence strips. She doesn't read the rules — she just toggles patrol ON and evade ON for all four Scouts. She taps EXECUTE.

**Minute 1:00 — The Watch**
Her Scouts scatter across the rice terrace terrain (brown-green tiles with horizontal line textures). Enemy Scouts appear. Her Scouts spot them — green flashes. But she hasn't configured any hooks. No signals are sent. Each Scout acts independently. One Scout evades an enemy successfully. Another doesn't see the enemy approaching from behind (narrow perception after enabling both patrol and evade used up her skill slots). The enemy Striker appears at T15 and eliminates two of her Scouts in rapid succession.

**Minute 2:00 — The Result**
She survived 18 ticks. The result card shows she's in the 30th percentile. Her friend survived 24 ticks (65th percentile). The friend's result card is visible in the Discord thread — she can see the friend used hooks to connect Scouts and configured an evade rule that triggered on received signals.

**Minute 2:15 — The Retry Temptation**
She wants to retry but can't — it's one execution per day. She feels frustrated for 5 seconds, then fascinated: "Wait, you can make them TALK to each other?" She taps the "?" next to the hooks section and reads the tooltip. She opens the Campaign tab and plays Mission 1 on her phone. By study hall's end, she's on Mission 2.

**Minute 30:00 — Evening Return**
That evening, she opens the demo on her laptop. She finishes Mission 3 (hooks tutorial). She's already planning tomorrow's Daily Config strategy: "I'm going to chain all four Scouts on the same channel so they share everything."

**UI Annotations:**
- Mobile layout: board fills upper 60% of screen, bottom drawer for workbench, 44px minimum touch targets, skill toggles as iOS-style switches
- Daily Config one-shot enforcement: after execution, the EXECUTE button is replaced by "TOMORROW'S CHALLENGE IN: 14:32:07" countdown, greyed out, non-interactive
- Discord share: og:image meta tag on the result URL generates a rich embed in Discord — terrain thumbnail, score bar, percentile badge

---

### Journey: Professor Reyes, 55, Computer Science Educator, Uses Games in Curriculum

**Context:** Professor Reyes teaches an intro to multi-agent systems course at a Philippine university. She discovered Robot Uprising's demo through the Evolution Chain — a student showed her the family tree of 12 weeks of community-evolved configurations. She wants to use the demo's weekly challenges as homework assignments.

**Minute 0:00 — Semester Planning**
She opens the Seasonal Circuit. Season 4 starts next week: 4 challenges escalating from context-only (Week 1) to full system (Week 4). This maps perfectly to her syllabus: Week 1 = perception and memory, Week 2 = rule-based behavior, Week 3 = inter-agent communication, Week 4 = system architecture.

**Minute 1:00 — Assignment Design**
She creates a shared class group in the demo (a lightweight account system — email + password, no payment). Each student's submissions are visible to her. She writes the assignment: "Complete this week's Seasonal Circuit challenge. In your lab report, include: (1) your blueprint configuration screenshot, (2) your decision trace for the critical tick you identified, (3) a 200-word analysis of what you'd change."

**Minute 5:00 — The Week 1 Challenge**
She plays it herself first. Week 1 challenge: Ifugao rice terraces, 2 Scouts only, context config is the ONLY adjustable parameter. Enemy sends noise signals. The puzzle is pure context management: set the right listen/ignore filters and eviction priorities so the Scouts' 6-slot buffers retain useful observations and discard noise.

She configures Scout 1 to ignore all signals (perception only — it can see but won't listen to any channel). Scout 2 listens to one channel but with strict age-based eviction (oldest entries evicted first). She executes. Scout 1 performs well early (clean buffer) but can't receive warnings. Scout 2 gets some noise but also receives a critical "enemy approaching from east" observation relayed from Scout 1's hook. Scout 2 evades. Scout 1 doesn't. The tension between isolation (clean context) and connection (shared knowledge) is the entire lesson.

**Minute 8:00 — Curriculum Realization**
She realizes the demo's four-week season structure IS her course structure. She emails the department: "I need to build my multi-agent systems course around this game."

**UI Annotations:**
- Class group: lightweight group creation (invite link), instructor view shows all member submissions in a table (name, score, timestamp, "Inspect" link)
- Decision trace export: "Export as PDF" button on the Inspector screen, generates a clean document with tick-by-tick context states and rule evaluations — suitable for grading
- Assignment integration: no LMS integration needed — students screenshot and submit via the university's existing system

---

## Interaction Effects

### With the Full Game's Gauntlet Mode (7.xx)
The demo's competitive infrastructure is a **feeder system** for the full game's Gauntlet. Players who top the weekly demo leaderboard see a message: "Ready for the full arena? Your skills transfer." Demo badges should be visible in the full game's Gauntlet profile — a "Demo Veteran" badge that signals you climbed before you even owned the game. This creates prestige for early adopters and social proof for conversion.

### With Campaign Progression (5.xx)
The demo includes Missions 1-4 (locked spec). Weekly challenges should reference mechanics taught in these missions, creating a natural loop: play the challenge → realize you don't understand hooks → play Mission 3 → return to next week's challenge with new knowledge. The challenge constraints should never require mechanics beyond Mission 4 scope (no factory, no production queue) unless the demo is expanded.

### With the Inspector (4.xx)
The Inspector is Robot Uprising's secret weapon for competitive play. Demo challenges should include full Inspector access post-execution. The decision trace, context window timeline, and signal chain visualization are what separate casual players from competitors. Leaderboard leaders will be the players who use the Inspector to diagnose and iterate — the same skill the game teaches for real engineering.

### With Blueprint Sharing / Community (7.03)
Challenge solutions should be shareable as Config Codes (7.03a). After a weekly challenge closes, all submitted configurations become browsable. This creates a study ecosystem: "How did the #1 player solve this week's challenge?" The solution browser needs the same Blueprint Codex aesthetic as the full game — cards with unit portraits, rule summaries, hook wiring diagrams.

### With Mobile/Touch Adaptation (6.08/6.09)
The demo MUST work on mobile. Most TikTok/Discord traffic arrives on phones. Every competitive feature needs touch-friendly interaction: swipeable leaderboards, tap-to-inspect units, thumb-sized execution buttons. The Daily Config format is best suited for mobile (short session, one execution, minimal configuration depth). The Seasonal Circuit is best suited for desktop (deeper configuration, multi-week commitment).

### With Web Demo Acquisition Funnel (6.11)
The competitive infrastructure IS the acquisition funnel. Every shared histogram, every Discord embed, every Evolution Chain montage is an ad for the game. The "Share" button is not a nice-to-have — it's the primary conversion mechanism. Every result screen should generate a shareable image that includes the demo URL. Every leaderboard position should generate an og:image for social media embeds.

---

## Sensory Description

**The Weekly Challenge splash card** materializes from a swirl of teal particles that condense into a solid slate rectangle. The terrain thumbnail renders with a subtle depth-of-field effect — foreground tiles sharp, background tiles soft. Constraint icons appear one by one with a quiet "tick" sound (like a mechanical switch being toggled), each icon snapping into its position with a micro-bounce. The "EXECUTE ONCE" text glows with a gentle amber pulse, 0.5Hz, like a heartbeat.

**The leaderboard** is rendered as a vertical list of slim horizontal bars — each bar shows a player name on the left, their score as a colored segment (length proportional to score), and their rank number on the right. The bars are stacked tightly, 24px tall each, with 1px gaps. Your bar is highlighted: thicker (32px), brighter color, subtle glow. Scrolling the leaderboard produces a soft "card shuffle" sound — each bar slides past with a tiny paper-flutter noise. The top 3 bars have metallic textures: gold (#1), silver (#2), bronze (#3).

**The histogram** is a horizontal bar chart with 50 bins. Each bin is a thin vertical rectangle, height proportional to the count of players in that score range. The bars are teal by default, shifting to amber for the bin containing your score, which pulses gently. The median line is a thin white vertical rule. The top 1% line is gold, with a tiny crown icon above it. When the histogram first renders, the bars grow upward from zero in a wave pattern (left to right, 20ms stagger) with a rising "chime" sound that pitches up as the bars get taller — the distribution literally sings its shape.

**The streak chain** is a horizontal strip of hexagonal nodes connected by thin circuit-board traces. Each completed day is a bright teal hexagon with a checkmark inside. Missed days are dim grey hexagons with a crack pattern. The current day's hexagon pulses with a gold border. When a new day is completed, the connection trace animates: a bright particle travels from the previous node to the new one, and the new hexagon "lights up" with a warm flash and a satisfying "clink" sound — like a chain link connecting.

**The Evolution Chain montage** plays as a vertical filmstrip scrolling upward: each week's sealed watch is compressed into 3 seconds of accelerated playback. Early weeks show chaotic movement — units bumping into each other, overloads sparking. Later weeks show purposeful coordination — clean signal chains, precise flanking, zero overloads. The audio compresses too: early weeks are noisy (static, sparks, confused blips), later weeks are clean (crisp signal tones, rhythmic tick sounds, a confident hum). The visual transition from chaos to order over 30 seconds is the clip.

---

## The TikTok Clip

**The Evolution Chain montage is the clip.** 30 seconds. Week 1: bumbling robots, sparking overloads, red combat flashes everywhere. The configuration blueprint card in the corner is simple — 3 rules, 1 hook. Week 4: slightly better. Week 8: noticeably coordinated. Week 12: a precision strike squad — Scouts sweeping in formation, Relays compressing and forwarding in sync, Strikers converging on targets from two directions simultaneously. The configuration card now shows 8 rules, 4 hooks, 3 channel names. Text overlay: "12 weeks of community evolution. No one designed this. Everyone designed this." Logo. URL.

**The histogram flex is the screenshot.** Your score diamond sitting at the 98th percentile on the stealth axis, while being 45th percentile on speed. Text overlay: "My robots are invisible but slow." The multi-axis tension creates personality — every screenshot tells a story about the player's priorities.

---

## Recommended Hybrid: "The Living Demo"

Combine the best elements:

1. **Daily Config** (Option C) as the daily habit — one execution, constraint variety, streak counter. Low investment, high frequency. Best for mobile, casual players, and first-time visitors.

2. **Seasonal Circuit** (Option F) as the monthly commitment — 4-week escalating challenges, cumulative scoring, permanent badges. Best for desktop, competitive players, and educators.

3. **Evolution Chain** (Option E) as the community spectacle — one ongoing collective project, visible in the demo's background, generating shareable montage content. Best for viral distribution and emotional connection to the community.

4. **Histogram walls** (from Zachtronics, applied everywhere) — every result screen shows multi-axis histograms. Best for replayability motivation and shareability.

Skip the Sandbox Arena (Option B — stale meta risk) and the Bounty Board (Option D — moderation cost too high for a free demo). These belong in the full game, not the demo.

The **infrastructure requirements** for this hybrid:
- Lightweight account system (email or anonymous with browser localStorage fallback)
- Server-side score storage and leaderboard computation (simple REST API — scores are small data)
- Procedural challenge generation from curated seed space (for Daily Config)
- Manual challenge authoring 4× per month (for Seasonal Circuit)
- Weekly seed configuration authoring (for Evolution Chain)
- OG image generation service (for social media embeds)
- CDN for the demo itself (static assets, < 5MB compressed)

Total ongoing cost: one designer spending ~4 hours/week on challenge authoring + standard web hosting. The competitive infrastructure pays for itself through acquisition — every shared result is a free ad.

---

## New Aspects Discovered

- **6.11d-i — Anti-cheat in a deterministic demo:** Since execution is deterministic from config, players could theoretically brute-force optimal configs. Do you need anti-cheat? What does "cheating" even mean when the game is about configuration, not execution? The boundary between "studying the enemy schedule" and "brute-forcing the search space" — is optimization-through-iteration cheating or the point?
- **6.11d-ii — Demo-to-full-game badge migration:** How do demo badges (Seasonal Circuit rankings, Daily Config streaks) transfer when a player buys the full game? Badge persistence across platforms; the "Demo Veteran" prestige hierarchy; interaction with Gauntlet ratings.
- **6.11d-iii — Challenge authoring tools for designers:** The internal tool used to create weekly/seasonal challenges. If this tool is good enough, open it to the community (becomes the Bounty Board). The authoring pipeline: enemy config → constraint specification → difficulty estimation → playtesting → publication.
- **6.11d-iv — Timezone equity in daily challenges:** The Daily Config resets at midnight UTC. Players in UTC+8 (Philippines) get the new challenge at 8 AM; players in UTC-8 (US West Coast) get it at 4 PM the previous day. Rolling resets vs. fixed UTC vs. player-local-time resets — fairness implications for global leaderboards.
- **6.11d-v — Educational institution demo integration:** Professor Reyes's use case — class groups, assignment-friendly Inspector exports, curriculum-aligned seasonal schedules. The demo as a teaching platform, not just an acquisition funnel.
