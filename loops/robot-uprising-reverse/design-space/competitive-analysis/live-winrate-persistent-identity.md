# Design Space: The Live Win-Rate as Persistent Identity Metric

**Aspect:** 1.04g
**Category:** Competitive Analysis / Community Design
**Depends on:** [1.04f — Screeps as the live test suite endpoint](screeps-live-test-suite-endpoint.md), [1.05 — Screeps persistent world](screeps.md)

---

## The Thesis

Aspect 1.04f established **what the Gauntlet is**: an async adversarial environment where your config fights other players' configs while you sleep, generating daily digests, teaching you failure modes through debrief replays, and creating an arms race that never fully resolves.

This aspect asks a different question: **what does your Gauntlet Elo DO to you?**

Not how it's calculated. Not what the matches look like. But: what does it mean to carry a number that reflects how well your attention architecture performs against the entire field? How does that number appear in your identity across the game's community surfaces? How does it shape aspiration for players who haven't reached the Gauntlet yet? How does it create culture — the same way Codeforces' colored handles, Screeps' open-source bot prestige, and Robocode's RoboWiki turned isolated technical pursuits into living communities?

The claim: **Elo is not just a ranking. It's a vocabulary for talking about who you are as a designer.**

---

## How This Works in Real Communities

### Codeforces: The Handle as Colored Soul

Codeforces runs competitive programming contests for 850,000+ registered users, 300,000+ of whom are rated. The rating system is Elo-derived, and — crucially — **every rated user has a colored username on every surface where they appear**: forum posts, comment threads, contest standings, problem editorial discussions.

The colors form a recognized social hierarchy:
- **Grey** (0–899): unrated/beginner. Rarely engage publicly.
- **Green** (900–1,199): established. Beginning to contribute.
- **Cyan** (1,200–1,399): competent. Opinions respected.
- **Blue** (1,400–1,599): strong. Asked for help by green/grey.
- **Violet** (1,600–1,899): expert. Respected community figures.
- **Orange** (1,900–2,199): master. Small, recognized group.
- **Red** (2,200+): grandmaster. Known by name globally.
- **Nutella** (3,000+): the two-dozen best in the world. Their handles are bold-red with a black first letter — a visual artifact inspired by the Nutella logo. You recognize a nutella-rated post before you read the username.

The key cultural insight from Codeforces: **the colored handle travels everywhere**. When a red-rated programmer answers a question in the discussion thread, their answer is read differently than when a grey-rated programmer answers the same question with the same words. The identity isn't just on the leaderboard. It's in every interaction.

The secondary insight: **rating anxiety is a documented psychological phenomenon**. Losing rating feels five times worse than gaining the same amount — prospect theory applied to competitive performance. Codeforces users report skipping contests when they feel unconfident, specifically to protect a number that functions as self-image. This is a design risk.

### Screeps: The Open-Source Bot as Portfolio Piece

In Screeps World, there is no explicit Elo. Instead, rating manifests as **territory held** — your colony's size is your standing. But the deeper identity signal is your bot's GitHub presence. Top-performing Screeps bots — Overmind (1,900+ GitHub stars), The International (a community-maintained open-source faction bot), BraveBot — become known entities. Players recognize these bots. They fork them, study them, write blog posts about them.

The cultural mechanic: **your code is your identity**. Not your username. Not a number. The architecture of your bot — its design choices, its naming conventions, its handling of edge cases — carries your signature. When you publish your bot, you're publishing a design philosophy.

Screeps Arena added explicit Elo: a chess-derived system with seasonal resets, per-arena leaderboards, and persistent achievement tracking across seasons. The architects of the Arena system specifically designed **visible history**: your profile keeps a record of your rating and achievements from past seasons, so players can see not just your current standing but your arc.

### Gladiabots: Community AIs in the Campaign Itself

Gladiabots makes the identity-performance link concrete and visceral: **the campaign's later chapters use actual community AIs**. When you reach the upper skill tiers, the opponents you fight are not designer-scripted — they are configurations submitted by real players who earned placement in that tier. Your progress through the campaign literally encounters the community's best work.

This creates a particular aspiration dynamic: you meet a community AI that defeats you, notice in the credits it was submitted by a player named "hexflux_77," and that player's name becomes meaningful. You want to understand their approach. You look them up on the leaderboard. They're ranked 32 globally. You have a target.

The match notification mechanic — your async match result is delivered like a push notification from a friend — proved highly engaging in player reports. Players checked their Gladiabots match results with the same anticipatory affect as checking text messages. This is the correct emotional valence: **mild urgency, not anxiety**.

### Robocode: The Bot as Named Character

Robocode's community (active since 2001) built a lasting culture around **named bots with versioned identities**. When you submit to RoboRumble (the community ranking system), you submit a bot with a name, a version number, and a description. Top bots accumulate pages of analysis on RoboWiki — strategy diagrams, movement equations, counter-strategies. The wiki has been growing for over 20 years.

Crucially, Robocode players refer to bots by name in the community, not by player name. "Did you see what RaikoMX did against GrubbmGait?" The bot becomes the identity artifact, carrying its performance history in its name.

---

## Design Options for Robot Uprising

### Option 1: The Gauntlet Tier Badge (Visible But Gentle)

**The Concept:** Instead of displaying a raw Elo number, display a tier badge — a visual glyph representing your Gauntlet standing: Rookie / Operative / Architect / Commander / Overseer. The tier badge appears on your Workshop uploads, community hub posts, and replay exports.

**The Mechanics:**
- Five tiers, each with a distinct visual — an abstract circuit-board glyph. Rookie is a single line; Overseer is a dense web.
- The tier is derived from Elo percentile, not raw number: Rookie is bottom 40%, Operative is 40–70%, Architect is 70–90%, Commander is 90–98%, Overseer is top 2%.
- The badge appears in a subtle corner of your profile banner, your Workshop post headers, and at the start of any community hub comment you write.

**What This Creates:**
When a Commander-tier player posts a debrief analysis in the community hub, their Commander badge is visible. Other players weight the analysis accordingly. When an Architect-tier player asks a question, Commanders recognize it as peer-level discussion.

The soft version: no number, just a glyph. Less anxiety-inducing than exact Elo. Still carries social signal. The circuit-glyph visual is themetically coherent — the badge IS a tiny schematic.

**The TikTok Clip:** A player scrolls through the community hub. Every post has a tiny circuit badge in the top-left. They pause on one — a dense, intricate glyph they haven't seen before. An Overseer. They read the post. It's a breakdown of a hook topology they've never considered. They screenshot it.

---

### Option 2: The Colored Handle (Full Codeforces Mirror)

**The Concept:** Your Gauntlet Elo determines the color of your username on every community surface. The Elo number is displayed on your profile. The color is visible everywhere.

**The Six Colors:**
- **Dim blue** (< 900): new to the Gauntlet, still calibrating
- **Cool blue** (900–1,099): established
- **Teal** (1,100–1,299): skilled
- **Amber** (1,300–1,499): expert
- **Deep orange** (1,500–1,699): master
- **Pure white with orange glow** (1,700+): top echelon. Visually distinct on dark backgrounds.

**What This Creates:**
Every community post, workshop upload, and replay export carries a colored username. A white-glow post in the community hub is an event. Players stop scrolling. Even if the content is mundane ("updated my config to v8"), the color signals: this person's architecture is in the top 3% of all Gauntlet participants. What does v8 look like?

**What This Risks:**
The Codeforces anxiety problem, amplified. A grey-username player posting an interesting observation may be dismissed. A dim-blue Gauntlet player who designed a novel hook topology may be read as a beginner making a beginner observation. The color becomes a judgment applied before the content is read.

Mitigation: Don't show colors in the "help and questions" sections of the community hub — only in the "config sharing" and "meta analysis" sections where expertise signals are useful.

---

### Option 3: The Win-Rate Display (Honesty Over Elo)

**The Concept:** Don't show Elo. Show actual win rate over the last 7 days, last 30 days, and all-time. Displayed on your profile; optionally included in Workshop post headers if you opt in.

**The Mechanics:**
- Profile shows: "7-day win rate: 73% (146/200 matches)" and "All-time win rate: 68% (3,411/5,017 matches)"
- Workshop config pages show (if opt-in): "This config's current Gauntlet win rate: 71%"
- Config download pages show the win rate of the shared config at the time of upload

**What This Creates:**
Win rate is more legible than Elo to non-competitive-game players. "68% of the time, this config wins" requires no mental model of Elo math. It's honest. It tells you the failure rate too — "32% of matches, something beat me. Here's what."

The config-level win rate on Workshop downloads is particularly powerful: you're not just sharing a configuration, you're sharing a **performance artifact**. "This config won 71% of its Gauntlet matches before I uploaded it." Players can judge whether to study it.

**What This Risks:**
Win rate doesn't account for opponent difficulty. A 70% win rate against tier-1 opponents is a very different achievement from a 70% win rate against bottom-tier opponents. Without Elo context, win rate is misleading. Players will game it by running their strong configs only when matched against weak opponents (if the system allows opt-out/opt-in match timing).

---

### Option 4: The Multi-Axis Identity (Architecture Score)

**The Concept:** Three separate ratings, displayed as a triangle profile:
- **Gauntlet Elo** — win/loss performance against other players
- **Efficiency Score** — cycle-optimal performance (how fast your configs clear missions, measured against community median)
- **Robustness Score** — derived from campaign 100-case pass rates and Simulation Farm performance (if Option C is available)

Your triangle profile is visible on your Workshop page. A player with high Elo but low Efficiency is read as "bruteforces wins with slow but robust configs." A player with high Efficiency but low Robustness is "optimized for specific scenarios, brittle in the open field."

**What This Creates:**
Multi-axis identity resists the tyranny of a single ranking. "I am ranked 140 Gauntlet Elo, but my Efficiency Score is top 8%" is a different identity statement than "I am ranked 140 overall." It rewards architectural specialization. A player who obsessively optimizes cycle counts has a visible identity as an efficiency specialist, even if they don't compete in the Gauntlet at all.

This is the most thematically coherent option: **Robot Uprising is about designing systems, and your identity is the shape of the systems you build**. The triangle profile visualizes that shape.

---

### Option 5: The Config-First Identity (Bots as Named Characters)

**The Concept:** Following Robocode's culture, the identity unit is your **configuration** (your named bot), not your player profile. Configs are submitted to the Gauntlet with player-assigned names and version numbers. Players subscribe to configs, not to players. The leaderboard shows config names and rankings, with player names secondary.

**The Mechanics:**
- You submit "Swarm v1" to the Gauntlet. It fights. It accumulates a win-rate history.
- On the leaderboard: "1. Apex v12 — 1,642 Elo (quietstorm_8)". Config name first, player handle in parentheses.
- Workshop downloads are browsed by config, not by player. Your Workshop is a collection of named configs with their performance histories.
- Config version history is viewable: you can see how "Swarm" evolved from v1 to v8 and how its Elo trajectory changed with each revision.

**What This Creates:**
Configs become characters. "Apex v12" is a known entity in the community. Players discuss it. "The Understated Flanker" (a famous mid-meta config from Season 2) is referenced in community posts years later, the way chess players reference famous game sequences. The config outlives any individual's current standing.

Version history creates **growth stories**: "Here's Swarm v1 at launch — 47% win rate. Here's Swarm v8 after I fixed the relay timing bug — 71%. Here's the single commit that made the difference." This is the "config necropsy" community artifact (aspect 7.10) built into the core identity layer.

---

## Player Journeys

### Journey: Zara, 23, Computer Science Student, New to Strategy Games

**Context:** Zara beat the main campaign last weekend. She didn't know about the Gauntlet. She opened the community hub to look for tips on a mission she found hard, and noticed every post had a small symbol in the top-left corner.

**Minute 0:00 — The Discovery**
She's scrolling the community hub. Posts look like a forum: titles, usernames, timestamps. But each username has a tiny glyph next to it — a circuit diagram, abstract. Some are simple (a single arc). Others are intricate (dense mesh patterns).

She hovers over a complex glyph on a post titled "Why the mesh relay topology dominates Season 3." A tooltip: "Commander tier — top 8% of Gauntlet participants."

She reads the post. Dense analysis. Config topology diagrams. She doesn't understand all of it.

She checks the author's profile. It shows their tier badge (Commander), their config version history (12 versions, spanning 6 weeks), and their Gauntlet Elo trajectory — a blue line climbing from 1,000 to 1,480.

She sees the climb. It didn't start at Commander. It started at Rookie.

**Minute 12:00 — The Aspiration Lock**
Zara opens her own profile. She has completed the campaign. There is a button: "Submit to Gauntlet." Her estimated starting Elo: 1,000.

She reads the tooltip: "Your campaign configurations will be calibrated against 20 matches. Your starting Elo is determined by your performance. You won't lose your campaign progress."

She clicks Submit. Her config is named "First Try v1" (the default from her campaign save). She changes it to "RoseArch v1."

She is now in the Gauntlet. Her tier: Rookie. Her glyph: a single arc.

**18 Hours Later — The First Digest**
Notification: "GAUNTLET DIGEST: 11/20 wins. Elo: 1,024 (+24)."

She opens the game. She reads the loss patterns. Three patterns. She watches one loss replay.

A feeling: not failure. *Interest.* She didn't know opponents would do that. Now she knows they do. She wants to fix it.

She opens the workbench. She makes a change. Resubmits: "RoseArch v2."

**Week 3 — The Social Moment**
Zara asks a question in the community hub: "Why does the relay agent sometimes drop its own scout signals? I thought buffer eviction was FIFO." Her glyph is Rookie. She braces for dismissal.

A Commander-tier post appears within an hour: a clean explanation with a diagram. A second reply from an Operative with a personal anecdote: "I had this exact problem with v1, here's what I did."

No condescension. The Commander post doesn't reference her tier. It just answers.

She realizes: the tier badge communicates *context*, not *gatekeeping*. Her question was recognizably a growth question. The community responded to it as a growth question.

**UI Annotations:**
- Community hub post header: username (left), tier glyph (immediately right of username, 16px), post title, timestamp. On hover, glyph expands to tooltip: tier name + Elo range + "top X% of Gauntlet participants."
- Profile Gauntlet section: tier glyph (large, 64px), config version history list (sortable by date/Elo), Elo trajectory graph (all versions overlaid as separate lines — different colors per config).
- Submit to Gauntlet button: visible on profile after campaign completion. Shows current estimated starting Elo (derived from campaign performance statistics).

---

### Journey: Marcus, 34, Developer, Chasing Architect Tier

**Context:** Marcus has been in the Gauntlet for 5 weeks. His config "GridLock v7" is sitting at Elo 1,280 — solidly Operative, just shy of Architect (1,300 threshold). He has been at this plateau for 9 days. He is not anxious. He is annoyed.

**Day 1 of Plateau — The Diagnosis**
Marcus looks at his last 40 matches. His win rate against opponents below 1,200 is 89%. His win rate against opponents above 1,200 is 41%.

He filters the loss replays to show only losses against 1,200+ opponents. He watches six of them in sequence.

The pattern: opponents above 1,200 Elo are all running some version of what the community calls "the pressure mesh" — a multi-relay topology that creates redundant forwarding paths. His config has a single relay. When the mesh forces a simultaneous signal flood at tick 4, his single relay drops messages. His formation acts on stale data. He loses in a way that looks exactly like he's outthought.

**Day 3 — The Build**
Marcus redesigns. He replaces his single relay with a twin relay in parallel. The change costs him 4 slots of planning space — he has to drop one of his scout agents.

He's not sure this is right. But he submits "GridLock v8" and waits.

**Day 5 — The Threshold**
Digest: 16/20 wins. Elo: 1,302. A new Architect tier badge glows on his profile.

He takes a screenshot. He posts to the community hub: "GridLock finally hit Architect. Switched from single relay to twin relay at tick 4, lost a scout slot, net gain." His post is 50 words. No diagrams. Just the announcement.

17 likes within 6 hours. Two Architect-tier players reply: "Classic plateau at Operative — the mesh defense players live at 1,200+." "Welcome to the tier, good luck with the hook flood meta."

Marcus reads these replies with a feeling that is hard to name: *he's been inducted into something*. The tier is a group. He is now in that group.

**Day 14 — The Meta Discovery**
Marcus notices something: his v8 twin relay config is now being copied. He can tell because players at 1,100–1,200 are showing similar match patterns — twin relay setups that weren't common two weeks ago. He's not sure anyone copied him specifically, but the meta has moved in the direction he moved.

He screenshots his Elo trajectory. In the community hub, he posts it with the caption: "Twin relay adoption is accelerating in Operative tier. Started seeing it in my matches this week. Meta lag is ~10 days."

His Architect badge next to this post reads as legitimate meta-commentary. The same post from a Rookie would be speculation. From an Architect, it's data.

**UI Annotations:**
- Tier thresholds visible on Elo trajectory graph: thin horizontal lines marking Rookie/Operative/Architect/Commander/Overseer thresholds, labeled on hover. The line you're approaching is highlighted slightly.
- Match history filter: filter by opponent Elo range. Shows: "vs. 1200+ opponents: 41% win rate (17/41 matches)." Instantly diagnostic.
- Community hub: Architect badge is a more detailed glyph than Operative — visibly more circuits. The visual complexity of the glyph tracks with tier, so you can roughly eyeball tier before hovering.

---

### Journey: Vera, 19, High School Student, Watching Before Playing

**Context:** Vera found Robot Uprising from a TikTok clip — someone's hook cascade firing, a sequence of sounds, the caption "i rewired the relay yesterday." She downloaded the game. She's on campaign mission 3. She hasn't heard of the Gauntlet.

**Minute 0:00 — The Leaderboard Discovery**
Vera accidentally navigates to the Gauntlet leaderboard (she was looking for the campaign mission select). The leaderboard is public — it doesn't require Gauntlet participation to view.

The screen shows a ranking table. The top entry: "Apex v12 — Elo 1,642 — quietstorm_8." An Overseer badge — a dense, luminous circuit web glowing faintly at the edges.

She taps it. A profile page: version history (12 versions, 7 weeks), Elo graph (starting at 1,000, climbing to 1,642), and a "Featured Replay" button — a replay of a Gauntlet match the player marked as shareable.

She watches the replay. She doesn't understand most of what she's seeing. But the hook cascade fires. The sounds: click-click-whirr, each agent activating in sequence, the battle over in 9 ticks. She watches it three times.

**Minute 15:00 — The Naming**
She checks the username: quietstorm_8. She goes to the community hub. She searches for their posts.

Twenty-three posts. All Overseer-badged. She reads three of them. They're about relay topology design, meta-shift analysis, and a post titled "Why I stopped optimizing for efficiency and started optimizing for resilience."

She doesn't understand all of it. But she understands that there's something to understand. She has a destination: she wants to be at the level where that post makes sense.

She goes back to campaign mission 3. She finishes it on her second try.

**Month 2 — The First Reference**
Vera is on mission 9. She's stuck. She posts in the community hub: "Mission 9 hint? I keep losing at tick 7 when the second wave hits."

She has no Gauntlet badge (campaign only so far). The responses she gets are friendly but the explanations feel like they're aimed at a beginner. One reply includes: "When you get to the Gauntlet later, you'll see this pattern come up a lot."

The Gauntlet has become a future she's moving toward. It's not a separate mode. It's the next chapter of the same story she started in mission 3.

**UI Annotations:**
- Gauntlet leaderboard: publicly accessible from main menu. Requires no Gauntlet participation to browse. Functions as gallery/aspiration content.
- "Featured Replay" button: players can mark one Gauntlet replay as their public showcase. This is the shared artifact — the one clip they want the community to see.
- Version history on public profile: viewable by anyone. Shows config names and dates. Does NOT show config details (to prevent pure copy-paste without learning). Shows Elo trajectory per version.

---

### Journey: Dev, 47, Ex-Engineer, Playing the Imposter Problem

**Context:** Dev is Commander-tier — Elo 1,490. He got here through a strategy he privately calls "the exploit." He discovered that the current meta is vulnerable to a specific hook-flood timing attack that works 80% of the time against the most common Operative-tier configuration. His config is brittle — it loses immediately to any non-standard topology. But because 60% of Operative-tier players are running the same standard topology, he has an 80% win rate against them. His Commander badge feels hollow.

**The Tension**
In the community hub, Dev's Commander badge gives his posts extra weight. When he comments on others' relay designs, players thank him. He has said nothing wrong — his analysis is sound. But he knows his own config is not the architecture he's describing.

He starts to notice: other Commander-tier players post config replays. He doesn't. His replays would immediately reveal the exploit strategy, and he'd be either dismissed as a gameplayer or asked to share the exploit with the community.

**The Resolution**
Dev posts something unusual for a Commander: a confession. "I've been Commander tier for 3 weeks and my config is glass. I know the meta exploit. I'm going to redesign from scratch with the goal of achieving Commander through actual robustness rather than opponent prediction. Watch this thread for updates."

The response: 40+ likes. A dozen replies. Three other players say they're doing the same. They start sharing incremental updates in a thread.

Dev's Elo drops to Operative tier (1,270) when he submits his rebuild — the new config is unpolished. His Commander badge is gone. His Operative badge feels honest.

Four weeks later, he's back at Commander with a config he's proud of. He posts the version history — v1 through v14 — as a thread titled "How I lost Commander tier on purpose."

**The Design Insight This Reveals:**
The tier badge as identity creates **authenticity pressure** that standard ranking doesn't. When your standing is visible everywhere, it must be defensible. Players who achieve standing through exploits feel cognitive dissonance when the community treats that standing as earned. The social weight of the badge creates self-regulating honesty norms.

**UI Annotations:**
- No "hide badge" option. The badge is always visible if you're in the Gauntlet. This pressure is intentional.
- Elo trajectory graph shows dips — "Dev dropped from Commander to Operative on 3/15." This is visible on their profile. The voluntary dip is a visible narrative.
- The community hub has a "milestone posts" tag — posts like "I just crossed 1,500 Elo" or "I rebuilt from scratch" get auto-flagged as potential milestones and surface in a "Community Stories" digest.

---

## Strengths

### The Tier Badge Model (Option 1)
- **Low anxiety.** No precise number. The difference between 1,287 and 1,303 is invisible; both are Architect-tier.
- **Thematically coherent.** The circuit-glyph badge is a schematic, not a trophy. Visual language matches the game.
- **Accessible to non-competitive players.** Players who've never played a ranked game can intuit "denser badge = more experience" without needing to understand Elo math.

### The Colored Handle Model (Option 2)
- **Maximum social signal.** Proven by Codeforces to create powerful aspiration culture.
- **Creates recognizable community members.** High-tier handles become known entities.
- **Self-reinforcing.** The social weight of a high-color handle creates incentive to maintain and grow it.

### The Multi-Axis Triangle (Option 4)
- **Rewards specialization.** A player who optimizes efficiency is recognized as an efficiency specialist, not dismissed as "only 1,200 Elo."
- **Resists single-metric gaming.** Harder to exploit one axis when you're judged on three.
- **Reflects what Robot Uprising actually values.** The game is about design quality across multiple dimensions, not just win rate.

### The Config-First Identity (Option 5)
- **Builds permanent community artifacts.** Famous configs outlast seasons.
- **Growth narratives are built in.** Version history IS the identity.
- **Thematically deep.** In a game about designing attention systems, your designs are the most honest possible identity signal.

---

## Weaknesses

### The Tier Badge Model (Option 1)
- **Loses granularity.** An Architect just below Commander feels the same as an Architect just above Operative. The band hides meaningful skill gaps.
- **Easier to coast.** Without exact number pressure, players may settle within a tier rather than pushing for the next.

### The Colored Handle Model (Option 2)
- **Rating anxiety.** Codeforces documented this extensively — losing rating feels disproportionately bad. Some players stop competing to protect their color.
- **Gatekeeping risk.** Grey/dim-blue posts may be dismissed in community discussions, silencing the voices of engaged beginners.

### The Win-Rate Display (Option 3)
- **Opponent strength blind.** A 70% win rate against weak opponents and a 70% win rate against strong opponents look identical.
- **Gameable.** Players can game win rate by selective matching if the system permits any match selection.

### The Multi-Axis Triangle (Option 4)
- **Complex to read quickly.** A triangular profile requires more cognitive load than a single number.
- **Confusing to newcomers.** Three scores with no intuitive relationship to each other require explanation.

### The Config-First Identity (Option 5)
- **Player connection is indirect.** Players bond to configs, not to people. Community may feel impersonal.
- **Version fatigue.** Seeing "GridLock v18" in the leaderboard is less legible than seeing a player's progression metric.

---

## Interaction Effects

### With 1.04f (The Gauntlet Options)
The identity system determines what the Gauntlet FEELS LIKE to participate in. A purely Elo-based identity (Option 2) makes the Gauntlet feel like ranked play in a traditional competitive game. A config-first identity (Option 5) makes it feel more like a portfolio submission. The identity choice is inseparable from the Gauntlet design choice.

### With 5.21 (Open-Source Architecture as Community Mechanic)
The identity system determines what players SHARE and why. If config identity is primary (Option 5), players share configs because their config IS their identity — sharing is self-expression. If player Elo is primary (Option 2), players share configs as proof of their personal skill. The motivation differs, shaping the kind of community artifacts produced.

### With 7.09 (Arms Race as Designed Meta-Evolution)
Identity metrics shape meta behavior. If win rate is the identity signal, players will optimize for win rate (potentially at the cost of robustness or elegance). If multi-axis identity is used (Option 4), players will optimize for the axis most visible in their community context — efficiency players will optimize efficiency, even if it costs Gauntlet Elo. The meta evolves along the axes the identity system rewards.

### With 7.10 (The Config Necropsy as Community Artifact)
Config-first identity (Option 5) makes the "config necropsy" natural: the version history is already the primary identity artifact. Tier badge identity (Option 1) makes the necropsy a community practice rather than a built-in feature — players write necropsies because they WANT to, not because the game structures it.

### With 4.09 (The Histogram as Player Communication Layer)
The histogram shows where your config ranks on efficiency metrics. The identity system determines whether that ranking is ALSO social. If tier badges appear on histogram overlay views ("Architect-tier submissions cluster here"), the histogram becomes a social map, not just a performance map. You can see where your peer group is.

### With 8.07 (Robustness vs. Efficiency as Fundamental Tension)
If identity is multi-axis (Option 4), robustness and efficiency are both identity components. Players IDENTIFY as robustness specialists or efficiency specialists. The tension becomes a source of pride rather than a dilemma to resolve. Community forum posts will carry this: "I am efficiency-focused; here's my take on the relay timing debate."

---

## Comparable Games / Models

### Codeforces (Most Direct Analog)
The colored handle on every community surface is the most direct model for the Colored Handle option (Option 2). Key lessons: the color system works for creating aspiration and community cohesion; the anxiety problem is real and documented; the top tier (nutella) has extraordinary prestige that generates organic community mythology.

### Chess.com (Elo as Social Currency)
Chess.com's Elo is shown on every profile, on every post in the forums, on every game shared on social media. The number is central to identity. Chess players introduce themselves by rating when discussing the game. "I'm a 1,400 player" is a full social sentence. Robot Uprising could enable this: "I'm an Architect-tier architect" (pun intended) carries the same instantaneous social meaning.

### Gladiabots (Async Match as Social Notification)
The match result as push notification proved emotionally resonant — equivalent to a text message from a friend. The notification IS the social moment for the Gauntlet identity system. "Your config won 17/20 today" is a social update, not just a game state update.

### League of Legends (Ranked Visual Identity)
LoL's tiered ranked system (Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Challenger) showed that tier names are more culturally sticky than Elo numbers. "He's Diamond" is more communicative than "He's 2,100 Elo." The tier badge / colored handle decision for Robot Uprising maps directly to this: the tier name travels further than the number.

### Robocode RoboWiki (Bot Portfolios as Community Memory)
RoboWiki accumulated 20 years of bot analyses, strategy guides, and versioned bot write-ups. The institutional memory of which bots were dominant in which era is preserved and searchable. Robot Uprising's Workshop should aspire to this: a community hub where famous configs are preserved as historical artifacts, not discarded when they fall out of the current meta.

---

## Sensory Description

### The Tier Badge in Context

Your username in the community hub is rendered in white against a dark background. Immediately to the right of your name, a small glyph — 16 pixels, amber-toned — floats in the negative space.

At Rookie tier: a single arc, like the first stroke of a circuit trace. Suggests beginning.

At Operative: two connected nodes with a line between them. A minimal relay diagram.

At Architect: a three-node triangle with bidirectional edges. More complete. Suggests architecture.

At Commander: a four-node mesh with a central hub. Dense without being illegible.

At Overseer: the full mesh — six nodes, twelve edges, all connected. Glows faintly at the edges, as if warm from load. Not flashy. Just... *full*.

When you hover any glyph, it expands to a 48-pixel version in a popup, with the tier name and Elo range. The expansion is fast — 80ms ease-out, feels like focusing a lens.

### The First Tier Advancement

You've been Operative for two weeks. Your digest arrives. Elo: 1,302.

The game doesn't immediately update your badge. It shows the digest first. You read your match results: 15/20 wins. A familiar pattern. You're about to close the app.

Then the screen changes slightly: your profile banner updates. The two-node Operative glyph in the corner dissolves — a brief bloom of amber light — and rebuilds into the three-node Architect glyph. The reconstruction takes 600ms. Each node appears in sequence, then the edges connect, then the faint warm glow activates at the perimeter.

A single line of text below: "ARCHITECT. Your attention architecture has been recognized."

The sound: a soft resonant tone, like a circuit completing. Not triumphant. Resolved.

You share a screenshot to the community hub.

### The Overseer Leaderboard Entry

The leaderboard top entry: "Apex v12 — 1,642 Elo — quietstorm_8."

The Overseer glyph next to quietstorm_8's username is 20px here (slightly larger than standard). On dark backgrounds it has a visible ambient glow — not bright enough to distract, bright enough to notice before you read the name.

The leaderboard entry doesn't have a special animation or sound. It's just... there. Quiet authority. The glow is patient.

When you click it, the profile page loads: the Elo graph, the version history, the featured replay button. The graph shows a line that starts at 1,000 and climbs to 1,642 over seven weeks, with small dips at versions 5 and 9 (the rebuild periods). The line is amber. The threshold lines (Operative, Architect, Commander, Overseer) are visible as faint horizontal guides.

You look at the featured replay button: "Watch: Apex v12 vs. GlassCannonRed — Win in 8 ticks (Season 3 Week 4)."

You click it. The battle plays. The hook cascade fires.

You want that glow.

---

## The TikTok Clip

Two options — depending on which identity system is chosen:

**For Tier Badge (Option 1):**
Screen recording of the community hub. The player scrolls slowly through posts. Every post has a glyph. They pause at an Overseer post. Zoom in on the glyph — the dense mesh, warm glow at the perimeter. Text overlay: "this person's config is literally ranked top 50 worldwide." Cut to: their featured replay — hook cascade, 9 ticks, clean.

Comments: "how," "what is that symbol," "i want that glyph"

**For Colored Handle (Option 2):**
Screenshot of the leaderboard. White-glow username at #1. Player narrates: "the white glow means they're in the top 2%. they have 12 config versions. they redesigned from scratch 3 times." Cut to: Elo graph showing two deliberate dips. Text overlay: "they lost rank on purpose to rebuild better."

Comments: "you can CHOOSE to rebuild?" "this game sounds insane"

---

## New Aspects Discovered

1. **6.09 — GIF/clip export as primary viral mechanic**: designing replay clips that are shareable, beautiful, and self-explanatory without context; the hook-cascade clip as the viral moment; technical and design requirements for a Robot Uprising replay export that generates the correct TikTok moment.

2. **7.06 — The histogram as social loop**: post-execution bell curves showing player distribution across agent efficiency metrics (from Shenzhen I/O and Opus Magnum), now extended with Gauntlet tier overlay — where do Architect-tier players cluster vs. Operative-tier players on the efficiency histogram?

3. **7.08 — Deferred community metric invention**: designing the scoring system to be extensible so the community can invent new evaluation axes; the Opus Magnum "MechA" pattern applied to Gauntlet metrics; what composite metrics might the Robot Uprising community invent? ("Hook cascade density score"? "Relay resilience index"?)

4. **5.20 — Always-on anxiety vs. self-contained missions**: the identity system is the primary anxiety vector; tier badge (Option 1) minimizes anxiety; colored handle (Option 2) maximizes it; the choice between them is fundamentally a choice about how much emotional weight the game places on competitive standing.

5. **8.08 — The real-language vocabulary claim**: Robot Uprising asserts its primitives map 1:1 to real agentic AI engineering; the identity system is where this claim meets culture — does "Architect-tier config designer" feel meaningfully analogous to "staff engineer who designs multi-agent systems"? Does the prestige of the identity transfer?
