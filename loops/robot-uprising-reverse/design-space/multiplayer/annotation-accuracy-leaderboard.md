# The Annotation Accuracy Leaderboard

**Aspect:** 7.14 — Annotation accuracy leaderboard: a global leaderboard tracking not win rate but "annotation accuracy" — players who consistently mark within ±5 ticks of the diamond before revealing; top annotators as the "diagnosticians" of the competitive community whose config necropsies carry authority because their manual pivot-identification is provably calibrated

**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis / Community

---

## The Core Design Problem

Every competitive game has leaderboards. Nearly all of them rank the same thing: winning. Elo, MMR, LP, SR — different names for the same measurement. "How often does this player beat other players?" This produces a community hierarchy where authority flows from combat results. The best player's opinion carries weight because they win the most.

Robot Uprising has an opportunity to create a second, orthogonal hierarchy: one that ranks **diagnostic skill** rather than design skill. The annotation accuracy leaderboard asks not "can you build a config that wins?" but "can you *read* what happened in a match?" The player who consistently identifies the Effective Determination Tick (EDT) before the gold diamond reveals it is demonstrating a different competency — the ability to trace causation through a complex multi-agent system in real time, to distinguish correlation from causation, to see through false pivots to the structural moment where the outcome became inevitable.

This is the difference between a surgeon and a diagnostician. Both are doctors. The surgeon's skill is in the operating room. The diagnostician's skill is in the reading room — pattern recognition across incomplete data, differential diagnosis, the ability to say "the problem started *here*, not where you think it started." In Robot Uprising, the annotation accuracy leaderboard is the diagnostician's credential.

The closest real-world parallels exist outside traditional gaming:
- **Chess puzzle ratings** (Chess.com, Lichess): A separate Elo track for solving tactical positions. A player can have a 1200 blitz rating and a 2000 puzzle rating — the two skills are correlated but distinct. The puzzle rating measures pattern recognition speed, not competitive endurance. Robot Uprising's annotation accuracy is the equivalent: pattern recognition for causal structure rather than tactical opportunity.
- **GeoGuessr leaderboards**: Players are ranked on locating positions from Google Street View imagery. The skill is observational — reading road signs, sun angle, vegetation, car types — not navigational. Top GeoGuessr players develop an almost supernatural ability to identify countries from a single frame. Annotation accuracy players develop a similar ability to read battlefield state and identify causal inflection points.
- **Fantasy sports analyst rankings**: DraftKings and FanDuel track prediction accuracy over seasons. The best predictors are not necessarily the best athletes or even the best coaches — they are the best *readers* of the game. Their authority comes from provable calibration over hundreds of predictions.

The design challenge: how do you build a leaderboard that resists gaming, rewards genuine diagnostic skill, creates a meaningful community role for top performers, and interacts cleanly with the existing competitive and social systems?

---

## The Mechanic: How Annotation Accuracy Works

### Measurement

Every time a player watches a match in the Inspector and marks their pivot hypothesis before revealing the gold diamond, the game records the **signed tick distance** between their mark and the true EDT. A mark at tick 41 when the EDT is tick 44 produces a distance of -3. A mark at tick 50 produces +6. The absolute value is the player's **error** for that annotation.

The leaderboard tracks a rolling accuracy score derived from recent annotations. The core formula:

**Annotation Accuracy Score (AAS)** = weighted average of (max(0, 1 - |error| / K)) across the last N qualifying annotations, where K is a normalization constant (set to the match's total tick count / 4, so that "guessing the middle" produces approximately 0.5 score on average rather than a free high score) and N is the rolling window size (50 annotations).

This formula has several deliberate properties:
- **Perfect marks (0 ticks off) score 1.0.** The ceiling is clear.
- **Marks within ±5 ticks score high** (typically 0.85-1.0 depending on match length), rewarding genuine diagnostic skill without requiring inhuman precision.
- **The normalization by match length prevents short-match inflation.** A 40-tick match where the EDT is at tick 20 has K=10; being 5 ticks off scores 0.5. An 80-tick match with K=20 scores 0.75 for the same 5-tick error. Longer matches are more forgiving because they contain more information to read.
- **The floor is 0, not negative.** Wildly wrong guesses score 0, not a penalty — this prevents players from feeling punished for attempting difficult annotations.

### Minimum Sample Size

A player's AAS is not displayed on the leaderboard until they have completed **30 qualifying annotations**. This threshold is high enough to prevent lucky streaks from polluting the rankings and low enough that a dedicated player can qualify within 2-3 weeks of regular play. During the qualification period, the player sees a progress bar: "14/30 annotations — 16 more to qualify for the Diagnostician Leaderboard."

A "qualifying annotation" requires:
1. The match must be at least 30 ticks long (filters out trivially short stomps where the EDT is obvious).
2. The player must mark their hypothesis **before** revealing the diamond (no retroactive marking after seeing the answer).
3. The match must not be one the player participated in (no annotating your own matches, where you have privileged knowledge of your own config's behavior).
4. The player must have watched at least 60% of the sealed replay before marking (prevents blind guessing at a random tick without engaging with the match).

### Anti-Gaming Measures

The normalization constant K is the primary defense against the naive exploit of "always guess the middle tick." If a match is 80 ticks long and the player always guesses tick 40, their expected error depends on the EDT distribution. But EDTs are not uniformly distributed — they cluster in the second and third quartiles for competitive matches, and early for stomps. The normalization by match length means that guessing the midpoint of every match produces an average score of approximately 0.45-0.55, which places a player solidly in the middle of the leaderboard — respectable but nowhere near the top.

Additional anti-gaming protections:

- **Match diversity requirement**: At least 40% of a player's qualifying annotations must come from matches where different players are involved. A player who only annotates matches between the same two opponents (whose EDT patterns they've memorized) will find their pool drying up.
- **Tier-weighted scoring**: Annotations on Diamond-tier matches are weighted 1.2x, Platinum 1.1x, Gold 1.0x, Silver 0.9x, Bronze 0.8x. Higher-tier matches have more complex causal chains and more deceptive false pivots, so accuracy there is more impressive.
- **False pivot density bonus**: Matches with a high false-pivot gap (4.26) — where the most dramatic visible moment is far from the true EDT — grant a 1.1x multiplier on the annotation score. These are the hardest matches to read, and accuracy on them is the strongest signal of genuine skill.
- **Annotation timestamp validation**: The system records the exact tick at which the player placed their mark during the sealed watch. Marks placed in the final 5% of the replay (suggesting the player watched the whole thing and guessed based on outcome rather than reading the battle) receive a 0.8x penalty. Genuine diagnosticians form their hypothesis during the match, not after seeing who wins.

### Seasonal Resets

The leaderboard operates on the same seasonal cadence as the Gauntlet (3-month seasons). At the start of each season:

- **Soft reset**: All players' AAS decays by 30% and their qualifying annotation count resets to max(0, N-20). A player with 50 qualifying annotations drops to 30; a player with 25 drops to 5 and must re-qualify. This prevents stale rankings while preserving the relative ordering of long-term accurate players.
- **Season badge**: The top 100 players at season's end receive a permanent seasonal badge on their profile — a gold diamond with the season number engraved. These badges accumulate over time, creating a visible record of sustained diagnostic excellence.
- **Title refresh**: The "Verified Diagnostician" title (see below) requires re-qualification each season. You cannot coast on past performance.

### The "Verified Diagnostician" Badge

Players whose AAS places them in the top 5% of qualified annotators receive the **Verified Diagnostician** badge — a small gold diamond icon that appears next to their name everywhere in the game: chat, config necropsies, Workshop comments, Gauntlet lobby, friend lists. The badge communicates: "This player's causal analysis is provably calibrated. When they say 'the pivot was at tick 34,' they have a track record of being right."

The badge has three tiers:
- **Diagnostician** (top 5%): Gold diamond outline, no fill.
- **Senior Diagnostician** (top 1%): Gold diamond, filled, with a subtle pulse animation.
- **Chief Diagnostician** (top 10 players globally): Gold diamond with a stethoscope glyph — the diagnostic metaphor made explicit. These players' names appear in a special "Diagnostic Authority" panel on the community hub.

---

## The Leaderboard UI: Sensory Design

### The Main Leaderboard Screen

The leaderboard lives in the Community Hub, accessible via a tab labeled "DIAGNOSTICIANS" with a gold diamond icon. Opening the tab triggers a 0.6-second transition: the hub background dims to deep charcoal, and the leaderboard materializes as a vertical scroll of player entries — each entry a horizontal card with a dark matte finish and a thin gold left border.

Each card contains:
- **Rank number** in the game's chunky monospace font, gold for top 10, white for the rest.
- **Player name** with their badge tier (if qualified). The badge diamond sits to the left of the name, sized 12x12px, with its appropriate fill and animation.
- **AAS displayed as a three-decimal number** (e.g., "0.847") in a clean sans-serif font. The number's color grades from white (0.5) through amber (0.7) to gold (0.9+).
- **A micro-histogram**: a 60px-wide horizontal bar showing the distribution of the player's last 50 annotation errors. Each tick of error is a 1px column; the columns are colored green (0-2 ticks off), amber (3-5 ticks off), red (6+ ticks off). A player with strong accuracy has a micro-histogram that is almost entirely green with a thin amber tail. A mediocre annotator's histogram is a broad amber smear. The micro-histogram communicates consistency at a glance — a single outlier error shows as one red spike in a field of green.
- **Annotation count** in small grey text: "217 annotations" — the volume of the player's diagnostic work.
- **Best single annotation**: "0 ticks — Match #4827" as a tiny gold text, linking to the match where they nailed the EDT perfectly.

### The Player's Own Accuracy Profile

Clicking your own entry (or navigating to Profile > Diagnostics) opens a detailed accuracy view. The screen is dominated by a **scatter plot**: the horizontal axis is match number (chronological), the vertical axis is signed error (negative = guessed too early, positive = guessed too late). Each dot is a past annotation, colored by absolute error (green/amber/red). A horizontal gold line at y=0 represents perfect accuracy.

The scatter plot tells a story. A new annotator's dots are scattered wildly — large positive and negative errors, lots of red. Over weeks and months, the dots converge toward the gold line. The visual is unmistakable: the player is getting better at reading matches. A trend line (dashed, grey) traces the rolling average error, making improvement visible even when individual annotations still vary.

Below the scatter plot, three summary statistics in large text:
- **Current AAS**: "0.823" with a small arrow showing change since last session (green up, red down).
- **Season rank**: "#47 of 1,204 qualified" with percentile: "Top 3.9%".
- **Streak**: "7 consecutive annotations within ±5 ticks" — the current run of high-accuracy annotations, displayed with small gold diamonds in a row like a killstreak counter.

### The Accuracy Ring (Post-Annotation Feedback)

After every annotation — when the player marks their hypothesis and reveals the gold diamond — the screen shows the **Accuracy Ring**: a circular visualization centered on the gold diamond's position on the timeline. The ring expands outward in concentric circles:
- **Inner circle (±2 ticks)**: bright gold, labeled "Surgical."
- **Second ring (±5 ticks)**: warm amber, labeled "Sharp."
- **Third ring (±10 ticks)**: cool teal, labeled "Close."
- **Outer ring (±20 ticks)**: faint grey, labeled "Wide."

The player's mark appears as a small cyan diamond at its actual position relative to the gold diamond. If the mark falls in the inner circle, a sharp crystalline chime plays — two ascending notes, a perfect fifth — and the inner ring briefly flashes. If it falls in the second ring, a softer chime. Beyond the third ring, a quiet neutral tone. The ring lingers for 3 seconds before fading.

This feedback loop is the micro-moment that makes annotation accuracy addictive. Every reveal is a tiny test result: "Was I right? How close was I?" The ring provides immediate, visceral feedback that drives improvement-seeking behavior.

---

## Player Journeys

#### Journey: Reyna, 28, Systems Engineer from Manila

**Context:** Reyna has been playing Robot Uprising for two months. She climbed to Gold tier in Gauntlet with a relay-chain architecture but recently plateaued. She watches a lot of other players' matches in the community hub — partly to learn, partly because she finds the sealed watch genuinely entertaining. She has noticed the "Diagnostician Leaderboard" tab but has not clicked it.

**Week 1 — Discovery:**
Reyna is watching a Diamond-tier match between two players she follows. She scrubs through the sealed watch, noticing a moment at tick 38 where the blue side's relay context bar flashes amber — a brief overload that resolves. She marks tick 38 as her pivot hypothesis. The gold diamond drops at tick 41. The Accuracy Ring appears: her cyan diamond sits in the second ring. "Sharp — 3 ticks." She feels a small flush of satisfaction. She had been watching casually, but now she is paying attention to the number.

She annotates four more matches that evening. Her errors: 3, 8, 1, 12. The "1 tick off" annotation produces the bright chime and inner-ring flash. Her eyes widen slightly. She clicks on the Diagnostician Leaderboard tab for the first time. A progress bar reads: "5/30 annotations — 25 more to qualify."

**Week 3 — Qualification:**
Reyna has annotated 32 matches. Her AAS is 0.761. She qualifies for the leaderboard at rank #312 of 890 qualified players. The leaderboard entry materializes with a small animation — her card sliding in from the right edge and settling into its position. Her micro-histogram is mostly amber with scattered green dots. She studies the top 10 players' micro-histograms — almost solid green. The gap is visible and concrete.

She begins watching matches differently. Instead of following the combat, she watches relay context bars, channel activity indicators, production queue states. She starts pausing at moments that *feel* like pivots and asking herself: "Is this the real inflection, or is this a false pivot?" She develops a mental checklist: check the EDT-adjacent signals (buffer states, channel load, production commitments), not the combat-adjacent signals (unit deaths, damage bursts, territorial changes).

**Month 2 — The Badge:**
Reyna's AAS has climbed to 0.856. She is ranked #47, in the top 5.3%. The Diagnostician badge — gold diamond outline — appears next to her name. When she posts a comment on a Workshop config, the badge is visible. When she writes her first config necropsy (a detailed analysis of how a relay-chain architecture collapsed against a noise-flood strategy), other players notice the badge. One replies: "Diagnostician-verified analysis — I trust this."

The badge has changed how the community treats her contributions. Her config necropsy gets 3x more views than a similar one posted by a player without the badge. She is not a better config builder than she was two months ago — her Gauntlet rank has only moved from Gold II to Gold I — but her *reading* of the game is demonstrably elite. She has become a diagnostician.

#### Journey: Kwame, 30, ML Engineer and Streamer

**Context:** Kwame streams Robot Uprising three times a week to an audience of 400-800 viewers. He is a Diamond-tier Gauntlet player with a strong command-agent architecture. His stream format includes "Diagnostic Challenges" where he watches a match with annotation suppressed and tries to identify the pivot live on stream, with chat making their own guesses.

**The Format Shift:**
When the annotation accuracy leaderboard launches, Kwame's chat immediately demands he "go for Chief Diagnostician." He is already good at live pivot identification — his stream format has been training exactly this skill — but he has never tracked his accuracy formally. He begins annotating matches off-stream as well, building his sample size.

**The Streaming Integration:**
Kwame's stream overlay now includes his current AAS (0.891) and leaderboard rank (#8) in the corner. When he annotates live, the Accuracy Ring appears on stream. Chat erupts when he hits the inner ring. He develops a pre-annotation ritual: pausing the sealed watch at his suspected pivot, explaining his reasoning to chat for 60 seconds, then marking and revealing. The ritual creates tension — chat is split between "too early" and "too late" — and the ring resolves it instantly.

His AAS becomes a secondary storyline on the stream. Viewers track his rank changes. When he drops from #8 to #11 after a bad session (three wide misses on matches with high false-pivot gaps), chat roasts him affectionately. When he climbs back to #6, donations spike. The leaderboard has given his stream a persistent competitive narrative orthogonal to his Gauntlet rank.

**The Authority Effect:**
Kwame's Chief Diagnostician badge (top 10) makes his config necropsies the most-viewed in the community. When he posts a necropsy annotating a match where he identified the pivot at exactly tick 0 error, the post becomes a reference document. Other players cite "Kwame's tick-41 necropsy" as evidence for a meta-shift in relay timing. His diagnostic authority is not just social — it is mathematically verified.

#### Journey: Sofia, 15, High School Student from Cebu

**Context:** Sofia plays Robot Uprising on her phone during jeepney commutes and study breaks. She is a Silver-tier player who finds config building stressful but loves watching matches. She discovered the annotation accuracy system through a friend's screenshot showing their Accuracy Ring result.

**The Low-Pressure Entry:**
Sofia starts annotating matches casually — one or two per commute. She is not trying to climb the leaderboard; she just likes the feeling of the Accuracy Ring. Her first 10 annotations average 14 ticks off — solidly in the "Wide" ring. But she notices that her errors are consistently positive (guessing too late), which means she is anchoring on late-game combat events rather than the earlier structural moments that actually determined the outcome.

She begins watching for earlier signals. On her 15th annotation, she notices a production queue change at tick 22 — the losing side committed to building a third striker when they should have built a second relay. She marks tick 22. The diamond drops at tick 24. "Sharp — 2 ticks." The chime plays through her earbuds on the jeepney. She grins.

**The Learning Transfer:**
Sofia's annotation practice is teaching her to read matches in a way that her own config building never did. She begins to understand *why* certain configs fail — not from building them, but from diagnosing them. When she returns to her own workbench, she makes a change she would not have thought of before: adding a second relay instead of a third striker. Her win rate bumps from 45% to 52%.

The annotation accuracy system has created a **side door into game mastery**. Sofia is learning to be a better player not by competing, but by watching. Her AAS (0.714 after 30 annotations) qualifies her at rank #780 — middle of the pack. She does not care about the rank. She cares that she can now read a match and *see* what happened, where before she only saw chaos.

---

## Strengths and Weaknesses

### Strengths

1. **Creates a new axis of community prestige** orthogonal to Gauntlet rank. Players who are mediocre builders but exceptional readers have a home. This expands the community's talent surface.
2. **Self-reinforcing learning loop.** Annotation practice directly improves game understanding. Players who annotate become better builders — the leaderboard is a training system disguised as a competition.
3. **Feeds content creation.** Verified Diagnosticians' necropsies carry more weight, incentivizing high-quality community analysis. The badge is a credentialing system for analytical content.
4. **Natural streaming format.** The Accuracy Ring is visually dramatic and immediately readable. Streamers get a persistent secondary narrative (their AAS trajectory) that is easy for viewers to follow.
5. **Resistant to botting.** Unlike win-rate leaderboards where bots can grind, annotation accuracy requires genuine perceptual skill — watching and interpreting a replay. No API or automation can substitute for reading a sealed watch.

### Weaknesses

1. **Small population risk.** If fewer than 500 players actively annotate, the leaderboard feels empty and the percentile rankings are noisy. The system needs a critical mass of participants to be meaningful.
2. **EDT quality dependency.** If the EDT calculation itself is sometimes wrong or debatable (a match where two moments could both be "the" determination point), annotation accuracy punishes players for reasonable alternative readings. The system is only as good as the ground truth it measures against.
3. **Observation bias.** Players who watch more matches have more data points, which means their rolling average is more stable. A casual player with 31 annotations has a noisier AAS than a dedicated annotator with 200. Volume is partially rewarded even though the system intends to reward quality.
4. **Match selection bias.** Players can choose which matches to annotate. A player who only annotates "easy" matches (short stomps with obvious EDTs) will have an inflated AAS compared to one who tackles complex Diamond-tier matches. The tier-weighting and false-pivot-gap bonus partially address this but do not eliminate it entirely.
5. **Potential for community gatekeeping.** If the Diagnostician badge becomes too authoritative, unbadged players' necropsies and analyses may be dismissed regardless of quality. The badge should be a credibility signal, not a participation requirement.

---

## Interaction Effects

### With Pivot Accuracy (4.27)

Pivot accuracy as a profile stat (4.27) is the personal, private-facing version of what the annotation accuracy leaderboard makes social and competitive. The two systems share the same underlying measurement but serve different purposes: 4.27 is the player's self-assessment tool ("am I getting better at reading matches?"), while 7.14 is the community ranking ("who is the best at reading matches?"). The profile stat should feed into the leaderboard automatically — any qualifying annotation contributes to both. Players who are motivated by self-improvement engage with 4.27; players motivated by social competition engage with 7.14. The systems are complementary, not redundant.

Design consideration: the profile stat (4.27) could show annotations on the player's own matches (where they have privileged information), while the leaderboard (7.14) excludes self-annotations. This creates a clean separation: "how well do I understand my own configs?" vs. "how well do I understand configs in general?"

### With EDT Trajectory (4.25)

EDT trajectory measures whether a player's *configs* are improving — are their matches becoming more contested over time? Annotation accuracy measures whether a player's *perception* is improving — can they identify where matches were decided? The two metrics should be displayed side by side in the career stats view, because they are the two faces of mastery: building better systems and reading systems better. A player with a rising EDT trajectory but flat annotation accuracy is "building better but not learning why." A player with rising annotation accuracy but flat EDT trajectory is "learning to read but not applying the lessons." The pairing creates diagnostic self-awareness at the meta level.

### With Config Necropsy Culture (7.10)

The annotation accuracy leaderboard is the **credentialing layer** for necropsy culture. A config necropsy is an analytical artifact — "here is what happened and why." The Diagnostician badge tells the reader: "the person who wrote this analysis has a demonstrated track record of correctly identifying causal structure in matches." This is the difference between an anonymous blog post and a peer-reviewed paper: both contain analysis, but one comes with a credibility signal.

The interaction is bidirectional. The leaderboard drives players toward annotation practice, which makes them better diagnosticians, which makes their necropsies more insightful, which makes the necropsy ecosystem richer, which draws more players into watching and annotating matches — a flywheel.

### With Reputation Economy (7.03c)

The Diagnostician badge is a form of **earned reputation** that interacts with the broader reputation economy. If the reputation system includes circuit tokens or contributor badges, the Diagnostician badge should be distinct — it is not earned through volume of contributions (uploading configs, answering questions) but through provable calibration. This distinction is important: the reputation economy rewards participation, while the annotation leaderboard rewards skill. Both matter. A player with high reputation and high annotation accuracy is the community's ideal voice: prolific *and* calibrated.

### With Streaming

The annotation accuracy system is designed to be streaming-native. The Accuracy Ring is a visual payoff moment that works in any stream format. The AAS number in the stream overlay creates a persistent stakes layer. The live annotation ritual (explain reasoning, mark, reveal) is a natural content beat that produces 60-90 seconds of high-engagement content per match. Streamers who climb the Diagnostician leaderboard can use their rank as a content hook: "Watch the #3 Diagnostician break down this match live." The leaderboard creates streamer identities beyond "good player" — it creates "good analyst," which is a distinct and valuable content niche.

---

## Comparable Games

**Chess puzzle rating (Chess.com, Lichess):** The most direct precedent. Chess separates "playing" rating from "puzzle" rating, recognizing that tactical pattern recognition is a distinct skill from over-the-board competitive play. Annotation accuracy is Robot Uprising's puzzle rating — a diagnostic skill measured separately from competitive skill. Chess puzzle ratings have proven enormously popular (Chess.com's puzzle section is its most-used feature), suggesting that a large segment of players prefer analytical challenges to competitive ones.

**GeoGuessr leaderboards:** GeoGuessr ranks players on observational accuracy — how close their guess is to the true location. The scoring function (distance-based, with diminishing returns) is structurally similar to annotation accuracy scoring (tick-distance-based, with normalization). GeoGuessr's community has developed a culture where top players are respected as "analysts" — their YouTube breakdowns of how they identified a location carry authority because their leaderboard position proves they can do it consistently. Robot Uprising's Diagnostician badge serves the same function.

**Fantasy sports analyst rankings (ESPN, DraftKings):** Fantasy sports track prediction accuracy over entire seasons, creating a credentialing system for analysts. The best fantasy analysts are cited in mainstream sports media — their predictions carry weight because their track record is public. Annotation accuracy creates the same dynamic: the best diagnosticians' analyses carry weight because their track record is on the leaderboard. The seasonal reset mirrors fantasy sports' annual reset, preventing stale rankings.

**Geoguessr's "Explorer Mode" vs. "Competitive Mode":** GeoGuessr separates casual exploration from ranked competition. Similarly, annotation accuracy separates casual match-watching (always available, no pressure) from ranked annotation (qualifying criteria, leaderboard visibility). The casual mode feeds the competitive mode — players who enjoy watching matches naturally drift toward annotating them.

**Foldit (protein folding game):** Foldit's leaderboard ranks players on scientific problem-solving accuracy, not gaming skill. Top Foldit players have contributed to actual scientific papers. The prestige comes from demonstrating calibrated analytical ability. Annotation accuracy follows the same pattern: prestige from demonstrating calibrated diagnostic ability, creating a community role ("the diagnostician") that is respected independently of competitive rank.
