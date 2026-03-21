# Duration-Based Matchmaking Weighting

**Aspect:** 7.11b — Duration-based matchmaking weighting: using average match duration as a matchmaking factor (pairing rush vs. rush, macro vs. macro at same rating); "play style ELO"; risk of meta echo chambers vs. experience quality

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising's Gauntlet produces matches with wildly different durations. A blitz architecture built around three strikers and a command agent can end a game in 18 ticks — the opponent's relay chain never finishes deploying, context windows never fill, and the match is over before the defensive player's architecture begins to function. A cathedral architecture built around layered relays, deep context accumulation, and a late-game command agent might not reach full power until tick 60, then dominate through superior information processing for another 40 ticks. Both architectures can reach Diamond rating. Both represent legitimate, skillful play. But when they meet each other, one player has a miserable experience.

The blitz player who loses at tick 70 spent fifty ticks watching their crippled army slowly bleed out — every tick after their initial rush failed was dead time, a foregone conclusion stretching interminably. The cathedral player who loses at tick 22 never got to play their game at all — they queued up for a chess match and got sucker-punched before they could place a single piece. Neither player made a mistake in the matchmaking sense. Both were correctly rated. The Elo system did its job. But the experience was poor for one side and unsatisfying for the other.

The question: **Should Robot Uprising use average match duration as a secondary matchmaking axis — a "play style Elo" — to pair players whose architectures operate on similar timescales?**

This is not a question about balance. Rush architectures and macro architectures can coexist at every rating tier with roughly 50% win rates against each other. The question is about experience quality. Is a game where both players' architectures reach their intended operating state more enjoyable than one where one architecture is structurally denied its play pattern? And if so, does the cost — echo chambers, narrowed learning, fragmented queues — justify the benefit?

---

## Duration Bands

Three duration bands define the matchmaking axis:

**Sprint (<40 ticks):** Games that end before the mid-game transition. Characteristic architectures: striker-heavy rushes, scout-into-striker timing attacks, command-agent-first alpha strikes. The Sprint player's design philosophy is compression — maximum damage output before the opponent's defensive infrastructure comes online. Sprint mirrors are frenetic, decided in the first 15 ticks by unit positioning, signal routing efficiency, and who lands the first relay kill.

**Standard (40-80 ticks):** Games that traverse the full early-mid-late arc. The broadest band, containing the most architectural diversity. Standard players build balanced architectures — enough early defense to survive rushes, enough late-game scaling to threaten macro players. Standard mirrors are the "default" Robot Uprising experience: early scouting, mid-game factory decisions, late-game information warfare.

**Marathon (80+ ticks):** Games that extend into deep late-game. Cathedral relay networks, multi-layered context processing, specialist-heavy information warfare. Marathon mirrors are slow-burn strategic chess — both sides building sprawling intelligence networks, probing for information advantage, waiting for the moment when accumulated context processing superiority becomes decisive. The first fifty ticks may produce zero combat. The last thirty are devastation.

A player's duration profile is their rolling average match duration over their last 30 Gauntlet matches. The matchmaking system uses this as a secondary sorting axis: given two potential opponents at similar Elo, prefer the one whose duration profile falls in the same band.

---

## Comparable Systems

### Overwatch Role Queue

Overwatch's role queue (introduced in 2019) is the closest analog to duration-based matchmaking. Before role queue, players selected heroes freely, leading to matches where one team ran 4 DPS and one healer while the other ran a structured 2-2-2 composition. Both teams might have similar average SR, but the experience was chaotic and frustrating — the 4-DPS team either stomped through raw damage or collapsed because nobody could sustain. Role queue forced 2-2-2 composition, guaranteeing that both teams had similar structural foundations.

Duration-based matchmaking attempts the same structural guarantee without the same rigidity. Role queue says "you must play this way." Duration matching says "we'll try to pair you with someone who plays at your speed." The critical difference: role queue changed the game's rules. Duration matching changes only who you face. Overwatch's lesson — that structural parity matters more than pure rating parity for experience quality — supports the concept. Overwatch's warning — that enforced structure fragments the queue, increases wait times, and removes emergent compositions — applies equally.

### Fighting Game Character-Based Matchmaking

The fighting game community has debated character-based matchmaking for decades. Should a Zangief player (slow, grapple-heavy, patient) be preferentially matched against other grapplers? Or should matchmaking be pure rating, forcing every player to learn every matchup? The FGC's answer has been overwhelmingly "pure rating" — because learning unfavorable matchups is the game. A Zangief who only fights other grapplers never learns to close distance against zoners, never develops the skill set that makes Zangief viable at tournament level.

This is the strongest argument against duration-based matchmaking. A Sprint player who only faces other Sprint players never learns to build architectures that survive past tick 40. A Marathon player who never faces rushes never learns to defend the critical ticks 10-25 when their infrastructure is vulnerable. The fighting game community's consensus — "bad matchups are the game" — is directly applicable.

### Chess Time Control Separation

Chess separates matchmaking entirely by time control. Your bullet rating (1 minute), blitz rating (3-5 minutes), rapid rating (10-15 minutes), and classical rating (60+ minutes) are independent. A 2200 rapid player might be 1600 in bullet. The games are treated as fundamentally different disciplines that happen to share the same rules.

This is the extreme version of duration-based matchmaking — not preference pairing but complete separation. Chess's approach works because the player explicitly chooses their time control before queuing. Robot Uprising's duration bands are emergent from architecture choice, not pre-selected. A player doesn't queue for "Sprint mode" — they queue for Gauntlet, and their architecture happens to produce short games. This distinction matters: chess players self-select into time controls, while Robot Uprising players would be sorted into duration bands by the system's observation of their behavior.

---

## The Echo Chamber Problem

Duration-based matchmaking's most dangerous failure mode is the echo chamber. Consider the lifecycle:

1. A new player builds a rush architecture. It works against other rushers at their rating.
2. The system classifies them as Sprint and pairs them against other Sprint players.
3. They optimize their architecture for the Sprint mirror — faster unit deployment, more aggressive signal routing, tighter timing attacks.
4. They never face a Marathon player's deep relay network. They never learn what happens when their rush fails and the game extends to tick 80. They never develop the architectural vocabulary for mid-game adaptation.
5. When they eventually face a Marathon player (in a tournament, or when queue times force cross-band matching), they have no tools. Their architecture literally cannot function past tick 35 because they've never needed it to.
6. They lose, badly, and the loss feels unfair — not because of rating disparity but because they were never taught by the matchmaking system that this dimension of the game exists.

The echo chamber doesn't just limit individual growth. It fragments the meta. Sprint players develop a Sprint meta that evolves independently of the Standard and Marathon metas. Architectural innovations that cross duration bands — a rush defense that transitions into macro play, a macro opening that includes a timing attack window — never emerge because nobody is incentivized to build them. The game's strategic depth, which depends on the tension between time horizons, collapses into three separate shallow games.

---

## Player Journeys

#### Journey: Kai, 22, Former StarCraft II Terran Player

Kai builds rush architectures. Two strikers, one scout, one command agent. Every game is decided by tick 25. He loves the intensity — the feeling of his architecture slamming into the opponent's half-formed defenses, the knife-edge micro-decisions about which relay to target first, the clean satisfaction of a 19-tick victory where every unit performed exactly one function at maximum efficiency.

The matchmaking system slots Kai into Sprint. His queue times drop from 45 seconds to 20 seconds. His matches feel incredible — every game is a mirror of compressed violence, both players racing to deploy faster, route signals tighter, strike harder. He climbs from Gold to Platinum in two weeks, his win rate a consistent 54%. He's learning, adapting, refining. The Sprint meta at Platinum is sophisticated: feint rushes that bait defensive repositioning, delayed command-agent deploys that trade early power for mid-rush flexibility, scout-sacrifice plays that reveal the opponent's striker positioning.

Then Kai enters a weekend tournament. Swiss format, open matchmaking. Round three, he faces a Marathon player named Rosa. The match begins. Kai's strikers deploy at tick 4, cross the midfield at tick 8, reach Rosa's base at tick 12. Rosa has two relays and a scout. No strikers. Kai's units attack — and bounce. Rosa's relay network routes damage mitigation signals faster than Kai's strikers can deal damage. The relay's context window, already half-full from passive environmental data, processes Kai's attack pattern and begins routing counter-intelligence to Rosa's as-yet-undeployed units.

By tick 30, Kai's rush has failed. His strikers are damaged, his command agent's context window is full of combat data that's no longer relevant, and Rosa is deploying her first striker — fresh, fully buffered, guided by sixty ticks of accumulated intelligence. Kai doesn't know what to do. His architecture has no post-rush plan. He's never needed one. He watches his units get systematically dismantled over the next forty ticks, and the feeling is not frustration at a bad matchup — it's the sickening realization that he's been playing half a game.

Kai's Gauntlet screen after the loss: his duration histogram — usually a tight spike at tick 18-25 — now has a single lonely bar at tick 71. The Inspector replay shows Rosa's architecture unfolding like origami, layer after layer of relay connections activating in sequence, each one making the next more effective. Kai has never seen this. His Sprint meta doesn't produce it. He sits in the Plan screen for twenty minutes, staring at his blueprint, trying to imagine what happens after tick 30.

#### Journey: Adaeze, 31, Network Engineer from Lagos

Adaeze builds marathon architectures. Four relays, one specialist, one command agent — and no strikers until tick 50. Her philosophy: intelligence wins wars. She spends the first half of every match building an information network so comprehensive that when she finally deploys offensive units, they operate with perfect knowledge — every enemy position mapped, every signal chain traced, every vulnerability identified.

Without duration-based matchmaking, Adaeze's Gauntlet experience is bipolar. Half her matches are against Sprint players who attack at tick 12 and destroy two of her four relays before her network is operational. She loses these games at tick 25, having never reached the part of the game she designed for. She's learned some early-defense adaptations — a scout positioned defensively, a relay placed behind terrain — but the fundamental asymmetry remains. Her architecture needs 50 ticks to function. Sprint players give her 20.

With duration-based matchmaking enabled, Adaeze's queue shows a new element: a small waveform icon next to the "Searching..." text, its frequency matching her duration profile. Slow, deep oscillations — the Marathon signature. The search takes longer. 30 seconds. 45 seconds. The waveform pulses patiently, each cycle a little brighter, as the system scans wider rating bands looking for another Marathon player.

She finds one. The match begins and — nothing happens. For thirty ticks, both players build relay networks in silence. Scouts probe the midfield, trade vision, retreat. Context windows fill with environmental data, signal chains optimize themselves, relay coverage maps overlap and interleave. At tick 40, Adaeze deploys her specialist — a unit configured to intercept and decrypt enemy signals. At tick 45, her opponent deploys a counter-specialist. The game enters a phase that Sprint players never see: information warfare, where the battlefield is the signal layer itself, and the units are proxies for the architectures directing them.

Adaeze wins at tick 94. The final twenty ticks are a masterclass in accumulated advantage — her relay network, marginally more efficient than her opponent's, processes combat data 3% faster, and that 3% compounds over dozens of micro-engagements until the opponent's network collapses in a cascade failure. The Inspector replay is beautiful: two vast signal networks, nearly identical, diverging by imperceptible degrees until one reaches critical mass and the other doesn't.

But Adaeze notices something. After three weeks of Marathon-only matches, she's stopped thinking about early defense. Her architectures have become slower — why deploy a defensive scout when your opponent won't attack until tick 50? Her anti-rush adaptations have atrophied. When a seasonal rotation forces cross-band matching, she loses to a Gold-rated Sprint player who attacks at tick 15. A Gold player. She's Diamond. The echo chamber ate her versatility.

#### Journey: Tomás, 16, First-Timer from Cebu

Tomás is new. He finished the campaign last week and entered his first Gauntlet match yesterday. He doesn't have a play style yet. His architecture is a mess — two scouts (because the campaign taught him scouting matters), one striker (because he needs to kill things), one relay (because the tutorial said to), and a command agent configured with default settings he hasn't touched.

His first five matches produce durations of 34, 67, 23, 51, and 89 ticks. His rolling average is 52.8 — Standard band. But the variance is enormous. He's not a Standard player. He's an undefined player, and the system's classification is meaningless noise applied to a player who hasn't developed a strategic identity.

The matchmaking system pairs him with other Standard players. His matches feel random — sometimes he's outrushed before he understands what happened, sometimes the game drags into a late phase where his untouched command agent sits idle because he doesn't know what it does at tick 70. He's learning, but he's learning the Standard meta by accident, not by choice.

What Tomás actually needs is exposure to all three duration bands. He needs to be rushed so he learns what early defense means. He needs to face a Marathon player so he sees what deep relay networks can do. He needs Standard mirrors so he experiences the full arc. Duration-based matchmaking, by prematurely classifying him, denies him the breadth of experience that would help him find his own play style.

The system could detect Tomás's high variance and exempt him from duration-band matching — flagging new players with fewer than 30 matches as "unclassified" and routing them through a discovery queue. But this fragments the queue further. And it requires the system to distinguish between a genuinely new player with high variance and an experienced player who deliberately plays multiple styles.

---

## Strengths

**Experience quality for established players.** Sprint vs. Sprint matches are tense, legible, and fast. Marathon vs. Marathon matches are deep, contemplative, and strategic. Both produce better experiences than cross-band matches where one player's architecture is structurally denied its operating conditions.

**Queue satisfaction.** Players who have found their preferred timescale get matches that feel like "their game." The psychological effect is significant: the match starts, and within the first 10 ticks, both players recognize the familiar rhythm. The tension is competitive, not structural.

**Reduced frustration from asymmetric non-games.** The most common Gauntlet complaint in any competitive game is the "non-game" — the match where one player never had a chance, not because of skill disparity but because of structural mismatch. Duration matching reduces non-games without affecting balance.

**Meta depth within bands.** Sprint, Standard, and Marathon each develop their own sophisticated meta-games. Sprint players discover feint rushes, delayed timings, scout sacrifices. Marathon players develop relay topology optimization, signal encryption strategies, context-window management techniques. Each band's meta is deeper than it would be in a mixed environment because players can explore their preferred timescale without defensive concessions to other bands.

---

## Weaknesses

**Echo chamber formation.** The fundamental risk. Players optimized for their band become fragile outside it. The game's strategic depth — which depends on the tension between fast and slow play — fractures into three separate games. Cross-band skills (rush defense, late-game transition, timing attacks against macro openings) atrophy because they're never tested.

**Queue fragmentation.** Splitting the player pool by three duration bands multiplies effective queue populations by three. At peak hours in Diamond, this might mean 90-second waits instead of 30-second waits. At off-peak hours in Master tier, it might mean 5-minute waits or forced cross-band matching that defeats the purpose.

**Classification instability.** A player who experiments with a new architecture — switching from Marathon to Sprint — carries 30 matches of Marathon history. The system will pair them against Marathon players while they're running a rush build, producing exactly the cross-band mismatch the system was designed to prevent. The rolling average is slow to update, and sudden style changes create a lag period of poor matches.

**New player misclassification.** Players with fewer than 30 matches have meaningless duration profiles. The system either classifies them based on insufficient data (producing bad matches) or exempts them (fragmenting the queue further). Neither option is good.

**Tournament and competitive integrity.** If Gauntlet rating is earned within duration bands, a Diamond Sprint player and a Diamond Marathon player have never been tested against each other. Their ratings are not comparable. Tournament seeding, leaderboard ranking, and career stats all become ambiguous — Diamond in which meta?

---

## Interaction Effects

### Gauntlet Rotation (5.08d)

The Gauntlet rotation system cycles mission types with modifiers — fog-of-war density, terrain configuration, unit restrictions, signal modifiers. Some rotations inherently favor Sprint play (small maps, high damage modifiers, limited relay slots). Others favor Marathon play (large maps, fog-heavy, abundant relay positions). If duration-based matchmaking is active, rotation changes will shift players between bands — a Marathon player on a small-map rotation might produce Sprint-duration games, confusing the classification system. The rotation and the duration band interact unpredictably: does the system use the player's historical average (stable but inaccurate for the current rotation) or their recent-rotation average (accurate but volatile)?

The recommended approach: weight recent matches more heavily during the first week of a new rotation, then stabilize. This acknowledges that rotations reshape the meta's temporal structure and gives the classification system time to adapt.

### Career Stats and Leaderboards

If duration-band matching is implemented, career stats must acknowledge it. A player's profile should show their duration histogram prominently — not just win rate and rating, but the temporal signature of their play. The Season Ladder (7.05) should display duration band alongside tier name: "Diamond — Marathon" or "Platinum — Sprint." This makes the band a visible part of competitive identity rather than a hidden matchmaking parameter.

The Pulse (7.11) already tracks population-level duration distributions. With duration-band matching, The Pulse gains a new diagnostic: per-band population health. If the Sprint band shows a collapsing meta (one architecture dominating) while Marathon remains diverse, that's a signal that Sprint's echo chamber has produced degenerate convergence.

### The Meta-Game

Duration-band matching changes the meta-evolution cycle (7.09). Without it, the meta is a single ecosystem where rush strategies, standard play, and macro strategies coexist and counter each other. The natural "rush beats greedy, greedy beats defensive, defensive beats rush" cycle keeps the meta healthy. With band matching, each band evolves independently. Sprint's meta may stagnate because there's no macro pressure to punish over-commitment to aggression. Marathon's meta may stagnate because there's no rush pressure to punish slow openings.

The counter-argument: within-band metas may be deeper precisely because players can fully explore their preferred timescale. Sprint players, freed from the need to hedge against macro play, can develop more nuanced rush variations. Marathon players, freed from early defense, can build more elaborate information networks. The question is whether depth within a band compensates for lost depth between bands.

### Queue Times

At the population level, Robot Uprising's Gauntlet draws from a single global queue. Duration-band matching triples the effective number of queues (Sprint, Standard, Marathon) at each rating tier. Using conservative estimates:

- If 20% of the population is Sprint, 60% Standard, 20% Marathon
- At Diamond tier (top 10% of players), Sprint has 2% of the total population
- At off-peak hours (25% of peak population), Diamond Sprint has 0.5% of the total population

This is not enough for fast matchmaking. The system must either accept long waits, widen rating bands (producing lopsided matches), or fall back to cross-band matching (defeating the purpose). Queue time is the practical ceiling on how aggressively the system can enforce duration-band preferences.

The recommended approach: duration-band matching as a soft preference, not a hard constraint. The system prefers same-band opponents but will cross-band match after a configurable timeout (45 seconds default). This preserves experience quality for the common case while preventing queue starvation.

---

## Sensory Design: The Matchmaking Queue

The queue screen gains a new visual element when duration-band matching is active: **The Resonance Meter**. Below the standard "Searching for opponent..." text, a horizontal waveform displays the player's duration signature — a stylized oscilloscope trace whose frequency maps to their average match duration.

Sprint players see a rapid, tight waveform — short wavelength, high frequency, the visual equivalent of a hummingbird's heartbeat. The trace is rendered in warm amber, pulsing with nervous energy. Each cycle takes about half a second, and the peaks are sharp, angular, aggressive. The waveform's background is dark with faint horizontal grid lines, evoking a military radar sweep.

Standard players see a moderate waveform — medium wavelength, balanced peaks and troughs. The trace is rendered in neutral teal, the game's default accent color. The oscillation is calm, rhythmic, unremarkable. This is the baseline experience.

Marathon players see a slow, deep waveform — long wavelength, low frequency, the visual equivalent of a whale's song or a tidal cycle. The trace is rendered in cool violet, each oscillation taking nearly two seconds. The peaks are rounded, smooth, patient. There's a meditative quality to watching it — the waveform communicates "this will take a while, and that's okay."

When the system finds a potential opponent, a second waveform appears above the player's — the opponent's duration signature, rendered as a dotted line. If the waveforms are in phase (same band), they pulse together, their peaks aligning, and the background brightens with each synchronized cycle. The visual says: this is your kind of match. If the waveforms are out of phase (cross-band match after timeout), they pulse at different rates, visually discordant, and a small text label appears: "Expanded search — style mismatch possible."

The match-found animation is the two waveforms converging into a single trace — the dotted line solidifying, the frequencies averaging, the colors blending. For same-band matches, this convergence is smooth and immediate. For cross-band matches, the waveforms struggle toward alignment, their frequencies bending reluctantly toward a midpoint, and the resulting trace is slightly irregular — a visual warning that this match may not fit either player's preferred rhythm.

A soft chime accompanies match-found. Same-band matches produce a consonant interval — a perfect fifth, clean and resonant. Cross-band matches produce a tritone — not unpleasant, but unsettled, a harmonic question mark. The player learns to read the chime: consonance means comfort, dissonance means adaptation.

---

## Recommendation

Implement duration-band matching as a **soft preference with high transparency and no hard enforcement**. The system should:

1. Calculate and display each player's duration profile (rolling 30-match average, visible on their profile and in the queue).
2. Prefer same-band opponents within a 45-second window, then expand to any band.
3. Display The Resonance Meter in the queue, making the matching preference visible and legible.
4. Exempt players with fewer than 30 Gauntlet matches from duration classification entirely.
5. Track per-band meta health via The Pulse, watching for echo chamber signals (collapsing within-band diversity, skill regression on cross-band matches).
6. Reserve the right to disable duration-band matching if per-band meta health degrades below thresholds.

The system should never hard-lock players into bands. It should never hide cross-band matching. It should frame duration bands as a description of play style, not a prescription — "you tend to play fast games" rather than "you are a Sprint player." The goal is experience quality, not identity enforcement.

---

## Discovered Aspects

- **7.11b-i — Duration band transition coaching:** When a player's rolling average crosses a band boundary (Sprint to Standard, Standard to Marathon), what coaching or UI signals help them understand the new meta they're entering? Architectural suggestions, replay highlights from the new band, "your game is getting longer — here's what happens after tick 40" educational moments.
- **7.11b-ii — Cross-band rating adjustment:** Whether Elo gains/losses should be adjusted for cross-band matches; whether beating a player from a different band is worth more or less than beating a same-band opponent; the signaling problem of asymmetric rating updates.
- **7.11b-iii — Intentional band-crossing as competitive strategy:** Players who deliberately build architectures that defy their band classification — a Sprint-rated player who deploys a slow build to confuse the matchmaking system, or a Marathon player who occasionally rushes to keep opponents guessing. Gaming the duration profile as meta-strategy.
- **7.11b-iv — Band-specific seasonal modifiers:** Whether Gauntlet seasons should apply different modifiers to different duration bands, or whether uniform modifiers naturally create band-specific effects. The interaction between seasonal rotation (5.08d) and duration classification.
- **7.11b-v — Spectator and streaming implications of duration bands:** Whether tournament broadcasts should use same-band or cross-band matches for entertainment value; the spectator experience of Sprint mirrors (exciting but shallow) vs. Marathon mirrors (deep but potentially boring) vs. cross-band clashes (dramatic but potentially one-sided).
