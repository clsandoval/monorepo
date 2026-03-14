# PvP: Designing Attention Systems Against Another Human's Attention Systems

**Aspect:** 7.01 — The foundational PvP question: what does competitive multiplayer look like when the player's input is agent configuration, not direct control?

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising's PvP is unlike anything in mainstream competitive gaming. The player's move is not a click, a card play, or a unit command — it's an *architecture*. You design an attention system (skills, rules, hooks, context config across multiple blueprints), then submit it. Your system fights another human's system. Neither player has real-time input during the battle.

This is the **Gladiabots paradigm**: program-then-watch. But Robot Uprising adds layers Gladiabots doesn't have — hooks creating inter-agent communication channels, fixed-size buffers creating information bottlenecks, EM emissions creating detectable noise, and command agents creating meta-level recursion. The PvP design must account for all of this.

The fundamental question: **what's the competitive unit of play?** In chess it's a move. In StarCraft it's an APM-second. In Slay the Spire it's a card play. In Robot Uprising, the competitive unit is a *configuration* — an entire attention architecture submitted as one atomic decision.

This changes everything about how PvP feels, flows, and sustains.

---

## Five PvP Models

### Model A: "The Ghost Match" (Asynchronous Gladiabots-Style)

**How it works:** Each player designs their attention architecture offline, then deploys it as a "ghost" — a persistent configuration sitting in the matchmaking pool. The system matches ghosts by rating, simulates the battle deterministically, and stores the replay. Both players can watch whenever they want.

**The match flow:**
1. Player opens the Plan screen, configures blueprints, sets production queue
2. Player hits DEPLOY (distinct from EXECUTE, which is campaign-only)
3. System acknowledges: "Configuration deployed. Searching for opponent..."
4. Match resolves server-side (or client-side with deterministic seed)
5. Notification: "Match vs. [opponent] ready to watch"
6. Player watches Sealed Watch → Inspector flow at their leisure
7. Rating adjusted after either player finishes watching

**What the screen looks like at deploy:**
The EXECUTE button in the top-right transforms. Instead of the campaign's green "EXECUTE" with the lightning bolt, it shows a blue "DEPLOY" with a satellite dish icon. Below it, a status ribbon: "Last deployed: 14m ago | Rating: 1,847 | Ghost active | 3 matches pending." The ribbon pulses gently when new match results are available — a warm amber glow, like a notification LED.

**Strengths:**
- **Survives small communities.** Gladiabots proved this — async PvP works with 50 active players. Robot Uprising as a niche game needs this survival property.
- **Respects player time.** No waiting in queues. No coordination. Deploy and walk away.
- **Natural rhythm.** The competitive loop becomes: play campaign mission → tweak config → deploy → play another mission → watch match result → iterate. PvP weaves into the single-player experience.
- **Ghost evolution.** Your ghost keeps playing while you're offline. You return to find your rating shifted. Your architecture was tested against opponents you never saw. This creates a "checking in on my garden" feeling — tending a system rather than grinding matches.

**Weaknesses:**
- **No shared moments.** Both players watch alone. There's no "we were both there" tension. The TFT carousel moment — where players converge physically in the same space — doesn't exist.
- **Delayed feedback.** You deploy, then wait. The iteration cycle is slow. In Gladiabots, this averages 5-15 minutes between deploy and first result, depending on pool activity.
- **Metagame stagnation.** Without live adaptation, the metagame can lock into stable equilibria. If relay-chain beats scout-rush and scout-rush beats striker-swarm and striker-swarm beats relay-chain, the meta becomes rock-paper-scissors with no evolution pressure.
- **No spectator drama.** You can't watch two humans playing live. Streaming content is limited to replays.

**The TikTok clip:** Split screen — left side, someone closes their laptop at a coffee shop. Right side, their ghost wins a match against a sleeping opponent's ghost. Text overlay: "My robots won while I was ordering coffee."

---

### Model B: "The Sealed Duel" (Synchronous Simultaneous Submit)

**How it works:** Two players are matched live. Both see the same map. Both have a timer (3-5 minutes) to design their attention architecture. When the timer expires (or both submit early), configurations lock and the battle plays out live while both watch simultaneously.

**The match flow:**
1. Matchmaking pairs two players by rating
2. Both see the map, enemy base position, terrain — all public information
3. Timer starts: 3:00 for early matches, 5:00 at high ratings
4. Both players configure their attention systems in the Plan screen
5. Neither can see the other's configuration
6. Submit or timer expires → Sealed Watch begins for both simultaneously
7. Both watch the same battle, same ticks, same outcome
8. Inspector phase for both
9. Rating adjusted

**What the submit moment looks like:**
When one player submits early, a small indicator appears in the opponent's UI — a dim silhouette icon in the top-left corner marked "Opponent ready." No pressure mechanic, just information. When the timer hits 0:00, both screens flash white simultaneously and transition to Sealed Watch. The tick clock begins. Both players see the same board state unfold at the same tick rate. No pause. No skip. Just two humans watching their systems collide.

**Strengths:**
- **Shared tension.** Both players watch the same battle unfold in real time. The "will my architecture hold?" anxiety is simultaneous. This is the Into the Breach "I see the whole board and I'm still nervous" feeling, but doubled.
- **Spectator-friendly.** Streamers can broadcast live matches. Tournament organizers can schedule synchronized finals. The viewing experience is legible: two Plan screens (picture-in-picture) → shared Sealed Watch → two Inspectors.
- **Time pressure creates real decisions.** A 3-minute timer forces prioritization. Do you spend time perfecting one blueprint or roughing out three? This is a genuine competitive skill — configuration triage under pressure — that doesn't exist in async.
- **Map reading as skill.** Both players see the same terrain. Reading the map and adapting your architecture to the specific geography becomes a competitive dimension. In async, your ghost plays the same config on every map; in synchronous, you configure per-map.

**Weaknesses:**
- **Requires simultaneous players.** The death knell of niche multiplayer. If the matchmaking pool dips below ~200 concurrent players at your rating band, queue times become unbearable.
- **Timer anxiety.** Robot Uprising's attention systems are *complex*. A 3-minute timer might force players to use pre-built templates rather than designing from scratch. This reduces the game to template-picking rather than architecture design.
- **Session commitment.** Plan (3-5 min) + Sealed Watch (~30-60 seconds at default tick speed on an 8x8 board) + Inspector (optional, ~2 min) = 5-8 minutes minimum per match. That's not bad, but it requires uninterrupted focus.
- **Performance anxiety.** Some players thrive under time pressure. Many freeze. The game's core fantasy is "thoughtful system architect," not "clutch configuration under pressure." Timer undercuts the vibe.

**The TikTok clip:** Split-screen tournament final. Timer at 0:03. Left player makes one last hook connection. Right player is already watching, arms crossed. Battle begins. Left player's last-second hook creates a cascade that wins the game. Left player screams.

---

### Model C: "The Arms Race" (Iterative Bo3/Bo5 with Mid-Series Adaptation)

**How it works:** Two players play a series (best of 3 or 5). After each round, both players see the replay and can modify their architecture for the next round. The competitive skill is not just building a good system — it's *reading your opponent's system and counter-configuring.*

**The match flow:**
1. Matchmaking pairs two players
2. **Round 1:** Both design blind (like Model B). Battle plays out.
3. **Debrief:** Both players enter Inspector. They can see the *full replay* — including the opponent's unit behaviors, channel activity, and buffer states.
4. **Adaptation phase:** 2-minute timer. Both players modify their architecture based on what they learned from Round 1.
5. **Round 2:** Modified architectures fight. Same map, different configurations.
6. Repeat for Round 3 (and 4, 5 if Bo5).
7. Series winner determined by round wins.

**What the adaptation phase looks like:**
After the Inspector closes, the screen splits. Left: your Plan screen, editable. Right: a condensed replay summary — "Opponent deployed 3 Scouts, 2 Relays, 1 Striker. Primary channel: 'sweep'. Scout behavior: wide patrol with amplified signal. Relay position: center column. Key tick: 14 (flanking maneuver through amplified scout data)." This summary is auto-generated from the replay. The 2-minute timer runs in the top bar. You're not just redesigning — you're *counter-designing*. You saw their relay chain compresses scout data. You saw the striker responds to compressed signals with a 2-tick delay. You add a specialist with `hack` to intercept the relay's compression output. You reroute your striker to listen on the hacked channel instead.

**Strengths:**
- **The deepest competitive skill ceiling.** Reading an opponent's architecture, understanding their information flow, and counter-configuring is the ultimate expression of the game's core mechanic. It's the "attention system vs. attention system" promise delivered at maximum intensity.
- **Creates narrative arcs.** Round 1 is discovery. Round 2 is adaptation. Round 3 is counter-adaptation. Each series tells a story. "They switched to hack-intercept in Round 2 so I rerouted to encrypted channels in Round 3." This is chess-like in its depth.
- **Rewards the Inspector.** In campaign, the Inspector is educational. In Arms Race PvP, the Inspector becomes a *competitive intelligence tool*. The better you read the debrief, the better your adaptation. This validates the two-act emotional→analytical structure.
- **Solves the metagame stagnation problem.** The meta isn't just "which architecture beats which" — it's "which architecture adapts best." Static strategies lose to players who read and counter.

**Weaknesses:**
- **Session length.** A Bo3 Arms Race: 3 config phases (~3 min each) + 3 Sealed Watches (~1 min each) + 2 adaptation phases (~2 min each) + optional Inspector time = 16-20 minutes minimum. Bo5 approaches 30 minutes. This is a significant commitment.
- **Information overload in adaptation.** Reading an opponent's full architecture from a replay in 2 minutes is cognitively demanding. The Inspector must surface the *right* information fast. If the debrief is too complex, adaptation becomes guesswork rather than analysis.
- **Snowball risk.** If one player's system crushes the other in Round 1, the losing player has to both fix their architecture AND counter-adapt. The winner only has to refine. This creates a momentum advantage that can make later rounds feel futile.
- **Requires live opponents.** Same matchmaking population problem as Model B, but worse — both players must commit to 15-30 minutes.

**The TikTok clip:** Montage of three rounds. Round 1: scouts get annihilated. Round 2: player adds relays, scouts survive but strikers arrive too late. Round 3: player adds a command agent that reroutes strikers based on relay compression. Pincer attack wins. Text: "Round 1: I had no idea. Round 3: I had a plan."

---

### Model D: "The Gauntlet" (Asynchronous League with Weekly Submissions)

**How it works:** Players submit one architecture per week. That architecture fights every other architecture in their bracket. At week's end, standings are calculated from win/loss records. Top performers promote, bottom performers demote.

**The match flow:**
1. At league start, player is placed in a bracket of 8-16 players by rating
2. Player has all week to design their architecture
3. At the weekly deadline, architecture is locked
4. All bracket matchups are simulated (round-robin or swiss)
5. Results become available: replay library of all your matches
6. Standings posted. Top 2-3 promote, bottom 2-3 demote.
7. New week begins with a new map

**What the weekly dashboard looks like:**
A tall vertical panel — "GAUNTLET WEEK 7." At top, the map for this week (8x8 grid with terrain features highlighted). Below, your current submitted architecture as a compact blueprint card. Below that, the bracket: 12 player names in a column, sorted by current standing (if matches have already run). Each name has a tiny win/loss indicator next to your row. Hover over any opponent → preview of their submitted architecture (only visible after their matches against you have resolved). A "RESUBMIT" button pulses if you haven't updated since the map was revealed. Timer in corner: "3d 14h until lock."

**Strengths:**
- **Maximum deliberation.** A full week to design means players can iterate endlessly. This is the truest expression of the "thoughtful system architect" fantasy. No time pressure, no shortcuts.
- **Community engagement.** Weekly standings create water-cooler conversation. "Did you see [player]'s relay chain this week? It's unstoppable." The bracket becomes a social object.
- **Round-robin fairness.** Every architecture fights every other. No matchmaking variance. The best architecture in the bracket wins, period.
- **Content scheduling.** New map each week gives the community a shared challenge. Streamers analyze the map on Monday, discuss strategies Tuesday-Thursday, results drop Friday.
- **Low commitment.** One submission per week. You can spend 20 minutes or 20 hours. The floor is accessible, the ceiling is infinite.

**Weaknesses:**
- **Slow iteration.** One data point per week. Learning from matches requires waiting for the next cycle. Players who need fast feedback loops will churn.
- **Bracket manipulation.** Players can intentionally lose to demote into easier brackets, then dominate for easy wins ("smurfing" through relegation).
- **Stale between results.** Once you've submitted, there's nothing competitive to do until results post. The game goes quiet mid-week unless there's a parallel campaign.
- **Map-dependence.** If the weekly map strongly favors one strategy, the bracket becomes who-noticed-the-map-feature-first rather than who-designed-the-best-system.

**The TikTok clip:** Friday morning. Player opens the app. 12 replays loading. Fast-cut montage: win, win, loss (grimace), win, win. Final standing: 2nd. Promotion arrow. Fist pump. Text: "My robots went 10-2 while I was at work."

---

### Model E: "The Hybrid" (Async Core + Live Events)

**How it works:** The default competitive mode is Model A (Ghost Match), always available. Layered on top: weekly Gauntlet brackets (Model D) and periodic live tournament events (Model C Arms Race format). Three tiers of competition with different commitment levels.

**The competitive stack:**
1. **Ghost Ladder** (always on) — Casual competitive. Deploy and forget. Rating adjusts continuously. Entry point for all competitive play.
2. **Weekly Gauntlet** (opt-in, weekly cycle) — Deliberate competitive. Submit once per week against a bracket. Requires more thought but not more time. Promotes/demotes.
3. **Live Arena** (scheduled events) — Intense competitive. Model C Arms Race format, Bo3, scheduled at specific times. Weekend tournaments with brackets. Top Gauntlet players auto-qualify.

**Why this is the recommendation:**

The Ghost Ladder solves the population problem. You can always play, always improve, always see results — even with 30 active players. The Gauntlet creates community engagement and shared challenges without requiring simultaneous presence. The Live Arena creates spectator moments and prestige events without requiring them for progression.

Each tier feeds the next. Ghost Ladder teaches you what works. Gauntlet tests deliberation. Live Arena tests adaptation.

**What the competitive hub looks like:**
A three-column layout when opened from the main menu. Left column: Ghost Ladder status card — current rating, ghost status (active/disabled), pending matches count, mini trend graph (last 20 matches, sparkline). Center column: Gauntlet — current bracket visualization (12 names in a vertical list, your row highlighted, this week's map as a tiny preview tile, submission status, countdown to lock). Right column: Live Arena — next scheduled event, your qualification status, past event results. All three columns share the same visual language: dark background, the same blue deploy accent color, neon information overlays. The Ghost Ladder column pulses when new results arrive. The Gauntlet column has a slow countdown animation. The Live Arena column only activates when an event is upcoming.

---

## Cross-Model Interaction: What PvP Does to the Three-Screen Loop

### Plan Screen Under PvP

In campaign, the Plan screen is a sandbox — take your time, experiment, make mistakes. In PvP (especially synchronous or timed models), the Plan screen becomes a pressure cooker. Design implications:

- **Blueprint presets become mandatory.** Players need to save and recall configurations quickly. The Plan screen needs a "loadout" system — named configurations that can be deployed in one click, then tweaked for the specific map.
- **The production queue gains strategic weight.** In campaign, build order is a puzzle to solve. In PvP, build order is a bet. Leading with scouts (cheap, fast intelligence) means vulnerability to early strikers. Leading with relays (mid-cost, no mobility) means committing to a specific information architecture before you know what the opponent is doing.
- **Ghost previews become prediction tools.** In campaign, ghost units show you what you're building. In PvP, ghost units become "what if my opponent does X" scenario tools. The Plan screen might need a "red team" mode — place hypothetical enemy units to test your architecture against imagined configurations.

### Sealed Watch Under PvP

The locked "no skip, no pause, no tools" rule becomes a *competitive design feature* in PvP. Both players must sit through the same battle. Neither can fast-forward to the result. This creates:

- **Shared emotional arc.** In Arms Race format, both players experience the same ticks. The moment when scouts first make contact. The moment when the relay chain activates. The moment when strikers breach the perimeter. Both players feel these beats simultaneously.
- **Read-ahead as competitive skill.** Experienced players learn to predict outcomes from early ticks. "Their scout just hit my relay's perception radius — that means the compressed signal reaches their striker in 4 ticks — that means the flank hits at tick 18." This mental modeling, done during the sealed watch with no tools, is a deep competitive skill.
- **Buffer bars as information.** The tiny colored pips at the bottom of each unit become competitive tells. A buffer bar filling rapidly means the unit is about to overflow. A buffer bar sitting empty means the unit isn't receiving signals. Reading buffer states on *opponent* units during the sealed watch — without any inspection tools — is a visual skill that separates novices from experts.

### Inspector Under PvP

In Arms Race format (Model C), the Inspector transforms from an educational tool into a competitive intelligence system. The player is no longer asking "what did my system do?" — they're asking "what did my *opponent's* system do, and how do I counter it?"

- **Click-to-inspect becomes espionage.** Clicking an enemy unit reveals its buffer state at each tick — what signals it received, what got evicted, what survived. This is reverse-engineering the opponent's attention architecture from its behavior.
- **Channel metrics become strategic intelligence.** The Inspector's channel traffic visualization shows which channels carried the most signals, which had the most drops, which were silent. Reading this on the opponent's channels reveals their information topology.
- **The queue depth chart becomes a weakness map.** If the opponent's striker's buffer was overloaded at tick 12, that's a vulnerability — flood that unit's channel and it becomes blind at the critical moment.

---

## The Configuration Meta-Game

### Rock-Paper-Scissors of Attention Architectures

Based on the locked unit stats and skills, natural strategic archetypes emerge:

**"The Wide Net"** — Scout-heavy, wide perception, many channels. Knows everything but acts slowly. Signal latency through relay chains means strikers arrive late. Beats slow, predictable architectures. Loses to fast, decisive ones.

**"The Blitz"** — Striker-heavy, narrow perception, minimal communication. Doesn't know much but hits hard and fast. Direct engagement without waiting for intelligence. Beats architectures with long signal chains. Loses to architectures with good early warning.

**"The Cathedral"** — Relay-heavy, deep compression chains, command agent orchestrating. Extremely efficient information processing but expensive and loud (EM emissions). Beats architectures that can't process information at scale. Loses to specialists with `hack` intercepting the relay network.

**"The Ghost"** — Specialist-heavy, using `hack` and `extract` to spy on enemy channels and steal economy. Wins by intelligence advantage — knowing what the opponent is doing before they do it. Beats architectures that rely on channel secrecy. Loses to architectures that don't use channels (scout-striker direct engagement).

**"The Swarm"** — Many cheap scouts, no relays, no command. Each unit operates independently with simple rules. No channels to hack, no central point of failure. Wins through redundancy and simplicity. Loses to concentrated firepower (striker groups that overwhelm individual scouts).

These archetypes create a healthy competitive ecosystem because they have natural counters. The meta-game becomes: read the bracket, predict what your opponents are running, and configure an architecture that beats the field.

### The Specialist as PvP Wildcard

The Specialist unit (hack, extract) is the PvP-specific unit. In campaign, hack and extract are tools for solving puzzle missions. In PvP, they become the counter-play mechanic:

- **Hack** intercepts an enemy channel, reading messages intended for enemy units. This is *attention architecture espionage* — you're reading their scout reports before their strikers do.
- **Extract** steals economy from tagged nodes. This creates a parallel economic war alongside the attention war.

A PvP-focused player must answer: "How much of my budget do I spend on Specialists (intelligence/economy warfare) vs. Scouts/Strikers/Relays (battlefield dominance)?" This resource allocation question is the beating heart of the PvP meta.

### EM Emissions as PvP Mechanic

The locked emissions model — hook transmissions produce detectable EM noise — becomes a core PvP mechanic. Deeper architectures (more relays, more compression, more hooks) are smarter but louder. An opponent with wide scout perception can detect your EM signature and infer your architecture complexity without directly observing your units.

This creates the **stealth vs. intelligence tradeoff:** a silent architecture (few hooks, direct engagement) is invisible but dumb. A noisy architecture (deep relay chains, command agent) is brilliant but visible. The competitive space lives in this tension.

---

## Player Journeys

### Journey 1: Mika, 24, First-Time PvP Player

**Context:** Mika has completed the campaign through Mission 7. She's comfortable with all five unit types and has built several command agent configurations. She's never played competitive multiplayer in any strategy game. She opens the competitive hub for the first time.

**Minute 0:00 — The Hub**
The competitive hub loads. Three columns. Mika's eyes go to the Ghost Ladder first — "Rating: 1,000 (Unranked)" in clean white text. Below, a button: "DEPLOY FIRST GHOST." The Gauntlet column shows a lock icon: "Complete 5 Ghost Ladder matches to unlock." The Live Arena column shows "Next event: Saturday 2pm — Open Qualifier."

She clicks DEPLOY FIRST GHOST. The Plan screen opens — identical to campaign, but the EXECUTE button reads "DEPLOY" in blue.

**Minute 0:30 — Configuration Anxiety**
Mika stares at the empty blueprint panel. In campaign, she knew what was coming — the mission briefing told her about enemy composition and terrain. Here, the map is shown (an 8x8 grid with a dense cluster of jungle tiles in the center and open flanks) but the enemy is unknown. She doesn't know what she's preparing against.

She falls back on what worked in Mission 7: two scouts on patrol, a relay in the center, a striker listening to the relay's compressed channel, and a command agent. She drags blueprints from her saved loadouts — she saved her Mission 7 config as "First Army." Ghost units materialize on the board. Perception radii glow softly. Channel wiring lines trace from scout → relay → striker. The command agent sits near the base, its six hook slots wired to management channels.

She sets the production queue: scout first (cheap, fast intel), then relay, then striker, then second scout.

**Minute 3:00 — Deploy**
She hits DEPLOY. The button transforms: "Ghost Active ✓". A status ribbon appears: "Searching for opponent... Rating: 1,000." She goes back to the campaign.

**Minute 7:00 — First Result**
A notification pulse in the competitive hub icon. She opens it. "Match vs. NovaClaw (1,032) — DEFEAT." Her heart sinks slightly. She clicks WATCH.

Sealed Watch begins. Her scouts patrol outward. An enemy striker appears on tick 4 — much earlier than she expected. No enemy scouts. No enemy relays. NovaClaw went full Blitz — three strikers, rushing straight for her base. Her scouts see them, signal the relay, the relay compresses and forwards, her striker responds — but by the time her striker reaches the engagement, two enemy strikers are already adjacent to her relay. One-shot, one-kill. Her relay goes dark on tick 8. Her information network collapses. Her command agent has nothing to manage. Game over by tick 14.

**Minute 10:00 — Inspector Education**
Inspector opens. Mika clicks on NovaClaw's lead striker. Its buffer is nearly empty — only 2 of 8 slots occupied. Simple rules: "IF adjacent to enemy → engage. ELSE → move toward enemy base." No hooks. No channels. Zero EM emissions. Her own relay's buffer was overflowing with scout data it was compressing and forwarding to a striker that couldn't arrive in time.

She realizes: her architecture was too slow. The relay chain added 4 ticks of latency. Against a Blitz, those 4 ticks were fatal.

**Minute 12:00 — Adaptation**
Back in the Plan screen. She modifies her config: drops the relay, wires scouts directly to the striker. Loses compression quality but gains 2 ticks of response time. Adds a second striker in the production queue. Redeploys. The ghost updates.

**Minute 12:30 — The Hook**
She's thinking about her architecture differently now. Not "what's elegant" but "what survives against aggressive opponents." She hasn't realized it yet, but she's learning competitive attention system design — the same skill that makes a senior ML engineer effective at deploying production AI systems. The ghost ladder is teaching her through real-time adversarial pressure what the campaign taught through curated puzzles.

---

### Journey 2: Darius, 38, Competitive Veteran (Ex-StarCraft Diamond)

**Context:** Darius reached Architect tier in the Ghost Ladder and has been playing Weekly Gauntlet for a month. He's qualified for his first Live Arena event — a Saturday afternoon tournament with 16 players in a single-elimination Bo3 Arms Race bracket.

**Minute 0:00 — Tournament Lobby**
The Live Arena screen shows a 16-player bracket tree. Darius is seeded 5th. His first opponent is "CoralMind," seeded 12th, a player he's beaten twice in the Ghost Ladder. He opens CoralMind's public profile: Ghost Ladder history shows heavy relay usage, specialist deployments, low striker counts. A "Cathedral" player — deep information processing, high EM emissions.

The map loads: an urban terrain (city tiles with chokepoints and elevated positions) with bases at opposite corners.

**Minute 1:00 — Round 1 Configuration**
Darius thinks: CoralMind builds cathedrals. Cathedrals are loud and channel-dependent. Counter: specialists with `hack` to intercept their relay network, plus fast strikers to exploit the intelligence.

He configures: 2 scouts (wide patrol on flanks), 1 specialist (hack-focused, positioned to intercept center channels where relays will sit), 2 strikers (listening to the specialist's hacked intelligence rather than their own scouts' reports). Command agent with reroute — if the hack fails, reroute strikers to scout channels instead.

He sets a channel architecture: scouts broadcast on "eyes", specialist listens on CoralMind's likely channel names (he guesses "scan" or "data" based on common naming) and rebroadcasts intercepted data on "stolen". Strikers listen on "stolen" with "eyes" as fallback. Command agent monitors "stolen" traffic volume — if it drops below threshold (hack intercepted nothing), it reroutes strikers to "eyes".

The timer shows 4:23 remaining. He submits early. The "Opponent ready" indicator was already visible — CoralMind submitted even faster. Both players know: the other is confident.

**Minute 5:00 — Round 1 Sealed Watch**
Tick 1: All units deploy from bases. Darius's scouts fan out. On the opponent's side, he sees — two relays placed center-city, exactly as predicted. The relays' perception radius is zero (stationary), but their hook slots are glowing with channel activity.

Tick 4: His specialist reaches intercept range. A green cell flash — signal intercepted. The specialist's buffer fills with compressed enemy scout data. It rebroadcasts on "stolen." His strikers receive it.

Tick 6: His strikers know where CoralMind's scouts are — because they're reading CoralMind's own intelligence. A flanking route opens through the urban chokepoint.

Tick 9: CoralMind's strikers finally receive their own intelligence through the relay chain (4-tick latency). They turn to intercept — but Darius's strikers are already at their relay. One-shot. First relay down.

Tick 11: CoralMind's information network fragments. Half their units stop receiving signals. Darius's strikers advance. CoralMind concedes at tick 16.

Darius pumps his fist. Round 1 to him. But he knows: CoralMind now sees everything. The replay will show the specialist hack, the "stolen" channel, the entire counter-strategy.

**Minute 7:00 — Round 1 Inspector + Adaptation**
Darius opens the Inspector. He clicks through his specialist's buffer — the hacked data was clean, high-quality. CoralMind's compression was efficient. He notes the relay positioning: center-city, column D-E. CoralMind used channel "sweep" for scout data and "engage" for striker commands. Good naming — standard, but now known.

The adaptation timer starts: 2:00. Darius thinks: CoralMind will change channel names (trivial counter to hack). They might move relays off-center. They might add specialists of their own. He needs a strategy that works even without the hack.

He keeps the specialist but adds a second role: if hack fails (no intercepted data within 3 ticks), switch to extract (steal economy from nearest tagged node). He adds a third scout to compensate for potentially losing hacked intelligence. He changes the command agent's reroute trigger to be more aggressive — any drop in "stolen" traffic triggers immediate failover to "eyes."

**Minute 9:00 — Round 2 Sealed Watch**
CoralMind adapted. Relays moved to the flanks. New channel names — unrecognizable. The specialist's hack intercepts nothing (wrong position, wrong channels). Tick 3: Command agent detects zero "stolen" traffic, triggers reroute. Strikers switch to "eyes" — direct scout intelligence. Slower, less compressed, but reliable.

This round is longer. Both architectures are functional but neither has an intelligence advantage. It comes down to production efficiency and positioning. Darius's early economy lead (specialist extracting from tagged nodes after hack failed) gives him one extra striker by tick 20. That striker breaks the stalemate.

Round 2 to Darius. Series win. He advances. In the bracket chat, CoralMind types: "GG. The hack in R1 was filthy."

**Minute 15:00 — Between Matches**
Darius has 10 minutes before his semifinal. He reviews CoralMind's Round 2 adaptation in the Inspector — the channel renaming, the relay repositioning. Smart moves. He thinks about what he'd have done differently. He screenshots the specialist's empty buffer at tick 3 ("The moment I knew the hack failed") and posts it to the tournament Discord. Someone replies: "The reroute fallback saved you. That command agent config is clean."

This is the beginning of what will become config necropsy culture.

---

### Journey 3: Aya, 15, Mobile-Only Player

**Context:** Aya plays exclusively on her phone. She completed the campaign and has been on the Ghost Ladder for two weeks (rating: 1,340, Silver bracket). She's never touched the Gauntlet or Live Arena. She's on the bus to school.

**Minute 0:00 — Morning Check-In**
She opens the app. The Ghost Ladder card shows: "4 new matches." She taps it. A list: two wins, two losses. Total rating change: +8. She swipes to the first loss.

**Minute 0:30 — Bus Replay**
Sealed Watch plays on her phone — vertical layout, the 8x8 board fills the top two-thirds of the screen, buffer bars visible but small. She watches at 2x speed (she's seen enough battles to read fast). Her scout-heavy architecture gets overwhelmed by a player running three strikers with breach — they punch through her scout perimeter and reach her base.

She notices: her scouts' buffer bars were full when the strikers hit. They had the intelligence, but the relay chain was too slow to route it to her single striker. She needs either more strikers or shorter relay chains.

**Minute 1:30 — Quick Tweak**
She switches to the Plan screen. On mobile, the blueprint editor is full-screen with the board hidden behind a tab. She taps her relay blueprint, opens the hook config. The channel name field shows "scan" — she taps it and changes the hook to also broadcast on "alert" (a new channel she creates by typing the name). She opens her striker blueprint and adds "alert" to its listen list — now the striker receives both compressed "scan" data and raw "alert" warnings.

She hits DEPLOY. Takes 40 seconds total. Ghost updates. She puts her phone in her pocket.

The entire PvP interaction — check results, watch a replay, tweak config, redeploy — took 2 minutes on a bus. This is the Ghost Ladder's superpower: competitive play that fits into the cracks of daily life.

**Minute 2:00 — School**
At lunch, she shows a friend the replay. "Look — their strikers just ignored my scouts and went straight for the base." Her friend, who doesn't play: "Can you make the scouts block them?" Aya: "They can't fight. But I can make them broadcast a warning signal that reroutes my striker. Watch —" She pulls up her new config, shows the ghost preview, traces the channel wiring from scout alert → striker listen. Her friend sees the perception radius shrink as the striker pivots toward the alert source. "That's actually cool."

Aya is doing something no other mobile game offers: showing a friend how she designed an autonomous system's attention architecture, and that system is competing against real humans right now while she eats lunch.

---

### Journey 4: Dr. Kwame, 52, Systems Architect, Streams on Weekends

**Context:** Kwame is a top-50 Ghost Ladder player (Architect tier, rating 2,340). He streams Weekend Gauntlet results and Live Arena tournaments to a small but dedicated audience (~200 viewers). He's casting a semifinal between two players he knows — "TerraceMind" (Cathedral archetype) and "PhantomRush" (Ghost archetype with specialist-heavy builds).

**Minute 0:00 — Pre-Match Analysis**
Stream overlay shows both players' Ghost Ladder history as sparklines. Kwame narrates: "TerraceMind is the most consistent Cathedral player in Architect tier. Three relays, deep compression, command agent. Classic. PhantomRush is the counter-player — heavy specialists, hack-focused, tries to dismantle the information network before the Cathedral can function."

He pulls up both players' Gauntlet submissions from last week (public after results post). Shows the blueprint layouts side by side. Chat goes wild pointing out details: "look at TerraceMind's eviction policy — they're dropping oldest-first, PhantomRush should target the newest slots" / "PhantomRush's hack specialist has no fallback channel, if the hack fails they're deaf."

**Minute 3:00 — Round 1 Live Watch**
Both players have submitted. Sealed Watch begins. Kwame's stream shows the battle with his own commentary overlay. He reads buffer bars in real time: "TerraceMind's center relay is filling fast — 8 of 12 slots occupied at tick 5. That's scout data from both flanks compressing through one relay. If PhantomRush's specialist hits that relay, the whole network crumbles."

Tick 7: PhantomRush's specialist reaches intercept range. Green flash. Kwame: "THERE IT IS. The hack is live. PhantomRush is reading TerraceMind's compressed scout data before TerraceMind's own strikers receive it."

Chat erupts. Clip created. This is the TikTok moment: a specialist unit silently intercepting an enemy's information network, the buffer bar visually showing stolen data accumulating in the hacker's memory. The drama is entirely informational — no explosions, no health bars, just the quiet violence of intelligence warfare.

**Minute 8:00 — Debrief Casting**
After the round, Kwame opens the Inspector view and scrubs through the timeline. He clicks on PhantomRush's specialist at tick 7: "Look at this buffer. Slot 1: compressed scout position data from TerraceMind's east scout. Slot 2: compressed scout position data from west scout. Slot 3: TerraceMind's relay forwarding the engagement priority signal. PhantomRush literally had TerraceMind's battle plan in their specialist's buffer before TerraceMind's strikers did."

He switches to TerraceMind's command agent: "And look — the command agent never detected the breach. No rule watching for EM anomalies near the relay. No hook monitoring signal integrity. TerraceMind's Cathedral was beautiful but undefended. PhantomRush walked right in."

A viewer donates: "That specialist hack was the most exciting thing I've seen in a game in years and nothing exploded." Kwame laughs: "That's Robot Uprising. The drama is in the information."

---

## Interaction Effects

### PvP × Building Blocks
- The Plan screen blueprint editor must support **loadouts** (saveable configurations) for rapid PvP deployment
- Channel naming becomes a strategic act — common names are hackable, unique names are harder to predict but harder to remember
- The production queue gains counter-strategy weight: "Do I lead with scouts to read the opponent, or strikers to pressure before they can set up?"

### PvP × Campaign
- Campaign teaches mechanics; PvP tests them adversarially
- The 10-mission arc should introduce PvP concepts gradually: Mission 5+ could include "practice against a ghost" optional challenges
- Ghost Ladder should unlock after Mission 5 (factory introduced) so players have the production mechanic before competing

### PvP × Inspector
- Inspector becomes a competitive intelligence tool in Arms Race format
- Click-to-inspect on enemy units reveals buffer state — this is the espionage mechanic
- Channel metrics become strategic reads: silent channels = unused; saturated channels = overloaded; intercepted channels = compromised

### PvP × Audio Design
- The Sealed Watch audio design (from 6.02) gains new meaning in PvP — the sonic signature of enemy hooks becomes competitive intelligence (you can *hear* their architecture's complexity)
- A specialist's hack intercept should have a distinctive sound cue — quiet, invasive, like a wire tap clicking into place
- The kulintang option (6.02 Option A) naturally scores PvP: more units = more gong voices = more complex sonic texture. A Cathedral architecture *sounds* more complex than a Blitz

### PvP × Accessibility
- Async Ghost Ladder is inherently accessible — no time pressure, play at your own pace
- Arms Race timer needs accommodation options (extended timer, pause-between-rounds)
- Buffer bar reading as competitive skill creates accessibility concern — colorblind modes and screen reader support for buffer state are mandatory

### PvP × Platform
- Ghost Ladder works perfectly on mobile (Journey 3: Aya)
- Arms Race tournaments work best on PC (timer + complex configuration)
- Steam Workshop integration could allow sharing PvP-optimized loadouts
- Cross-platform Ghost Ladder is essential (Gladiabots does this and it's critical for pool size)

---

## Comparable Games

| Game | PvP Model | What Robot Uprising Can Learn |
|------|-----------|-------------------------------|
| **Gladiabots** | Async ghost system, Elo leagues, 3 game modes | Ghost infrastructure, matchmaking relaxation for small pools, async PvP is *not* lesser PvP |
| **Screeps: Arena** | Synchronous 1v1 with JavaScript code submission | Code-vs-code PvP at maximum depth, but requires programming skill — RU's visual config is more accessible |
| **Screeps: World** | Persistent MMO with territorial PvP | Defense/offense asymmetry problem — attackers need dramatically more sophistication than defenders |
| **TFT/Auto Chess** | Synchronous 8-player with carousel shared moments | "Tough choices not tough execution" philosophy; cloned army async battles; shared moments via carousel/Little Legends |
| **MIT Battlecode** | Annual tournament, Java/Python bot submission | Round-robin bracket format; community builds shared AI libraries (Overmind analogy) |
| **Core War** | Async, programs fight in shared memory | Original "my code vs. your code" paradigm; paper-scissors-stone meta of replicators/scanners/bombers |
| **Into the Breach** | No multiplayer (instructive absence) | Perfect information + deterministic outcomes = spectator legibility; Robot Uprising PvP inherits this clarity |
| **Opus Magnum** | No PvP, histogram comparison | Social competition through optimization metrics rather than direct combat; Gauntlet standings serve this role |
| **Factorio** | Co-op multiplayer, no PvP | Factory optimization as social competition (throughput comparisons); Robot Uprising's attention architectures have the same "show me your factory" appeal |
| **Chess** | Synchronous 1v1, Elo rating | The adaptation game — reading opponent's style across a series; Arms Race inherits this directly |

---

## Sensory Description: What PvP *Feels* Like

**The Ghost Ladder notification.** Your phone buzzes. You open the app. The competitive hub's Ghost Ladder card has a warm amber glow around its border — new results. You tap. A tiny animation: the match result card slides in from the right. Win: the card border flashes green for 0.3 seconds, a subtle ascending two-note chime (C→E). Loss: the card border flashes a muted rose, a descending two-note (E→C). Rating change displayed as a delta with a trend arrow. The sparkline graph updates with a new point, the line extending smoothly rightward.

**The Arms Race deploy moment.** Timer at 0:05. Your Plan screen is configured. Ghost units shimmer on the board. Channel wiring lines pulse with potential energy. You hover over DEPLOY — the button brightens. You click. The button compresses, then releases with a satisfying mechanical *chunk* sound — like a latch closing. The board's ghost units solidify slightly, becoming more opaque. "Configuration locked." A beat of silence. Then the opponent's indicator: "Both players ready." The Plan screen UI elements retract — panels slide offscreen left and right, the board expands to fill the center, the tick clock materializes at the top. Sealed Watch begins.

**The specialist hack in a live match.** Your specialist creeps toward the enemy relay's broadcast range. Its tile is dark, minimal EM signature. Then — a green cell flash, but different from normal signal delivery. Not a bright flash — a dim, pulsing glow, like a wire tap's LED. The specialist's buffer bar starts filling, but the color is different: the intercepted data shows as a violet tint rather than the standard blue, marking it as enemy intelligence. Your screen — and your opponent's screen — both show this. But only you know what it means. The audio: a faint, high-pitched tone, like a distant modem handshake. Quiet enough that a casual observer might miss it. Loud enough that an experienced player's stomach drops.

**A Gauntlet Friday.** The results post. You open the bracket. Twelve names. You scroll to yours. Win indicators cascade in from left to right — green check, green check, red X (that loss stings), green check... Final record: 9-2. You scroll up. First place: 10-1. Second place: you, 9-2. Promotion arrow appears next to your name — a small golden chevron, pointing up. You tap it. The bracket visualization animates: your name lifts out of the current bracket and slots into the higher one. New names surround you. Higher ratings. Harder opponents. The golden chevron pulses once, then settles. Next week's map preview loads below: a coastal terrain with chokepoints at the beach-to-city transition. You're already thinking about relay placement.

---

## New Aspects Discovered

- [ ] 7.01a — **Loadout system design for PvP:** saveable blueprint configurations, quick-deploy, per-map loadout adaptation, loadout sharing between players, loadout import/export as community feature
- [ ] 7.01b — **Red team mode in Plan screen:** hypothetical enemy unit placement for testing architectures before deployment, sandbox PvP training, "what-if" scenarios for counter-configuration practice
- [ ] 7.01c — **Channel naming as competitive metagame:** common channel names are predictable (hackable), unique names are harder to intercept but harder for teammates to guess in co-op; channel obfuscation as a competitive skill; automatic channel renaming as a defensive rule
- [ ] 7.01d — **PvP unlock gating and campaign integration:** when does competitive multiplayer become available; Ghost Ladder after Mission 5 vs. earlier; practice-against-ghost missions in campaign; competitive skill teaching within the tutorial arc
- [ ] 7.01e — **Spectator mode and tournament infrastructure:** stream overlays showing both players' Plan screens, split-screen Sealed Watch, Inspector casting tools, tournament bracket UI, replay sharing for community analysis
