# The Histogram as Social Loop: Post-Execution Bell Curves as Community Engine

**Aspect:** 7.06 — The histogram as social loop: post-execution bell curves showing player distribution across agent efficiency metrics (from Shenzhen I/O)
**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis

---

## The Core Design Problem

A histogram is not a leaderboard. A leaderboard says "you are #47,382." A histogram says "you are *here*, and *here* is the shape of the world." The shift from position to distribution is the shift from judgment to curiosity — and curiosity is what drives the social loop.

Robot Uprising's post-execution histograms must do three things simultaneously:

1. **Motivate replay** — the player sees their position in the population curve and immediately wants to shift leftward (or rightward, depending on the axis). Not because the game tells them to. Because the shape of the curve *implies* a better self.
2. **Generate social artifacts** — the histogram becomes something players screenshot, share, argue about, and build identity around. "I'm in the top 5% on signal latency" is a social identity statement, not just a game stat.
3. **Sustain community** — histograms create a shared language for discussing solutions. Instead of "my config is better," the conversation becomes "I traded 8 ticks of speed for 40% fewer channels — where does that put me on the efficiency curve?" The histogram gives the community a coordinate system.

The fundamental question: **how does a post-battle bell curve become the engine of a social ecosystem — driving not just replay, but sharing, discussion, identity, and community formation?**

---

## The Psychology: Why Distributions Beat Rankings

### Festinger's Social Comparison Theory Applied to Histograms

Leon Festinger's 1954 Social Comparison Theory identifies two comparison directions:

- **Upward comparison** (comparing to better performers): Can motivate improvement ("I can see the curve ahead of me — I could get there") or demoralize ("the gap is impossible"). Histograms make upward comparison *gentle* — you see the gradient, not the summit.
- **Downward comparison** (comparing to worse performers): Boosts self-esteem ("I'm above the median"). Histograms make downward comparison *automatic* — the area of the curve behind you is visually obvious.

The histogram's genius is that it provides **both directions simultaneously** without requiring the player to seek either one. You glance at it and you know: where you are, how many people are ahead, how many behind, and — critically — **what the shape of possible improvement looks like**.

Research on game leaderboards (Velez et al., 2018) found that downward social comparisons increase enjoyment by boosting competence and relatedness perceptions. But pure downward comparison leads to complacency. The histogram's bell curve guarantees both: you're above the median (confidence) AND there's a visible tail to chase (aspiration).

### The N-Effect: Small Populations Feel Competitive

Garcia & Tor's "N-Effect" research demonstrates that competitive motivation decreases as the comparison group grows. Participants completed tasks faster when competing against 10 rather than 100 others. Robot Uprising's histograms should leverage this:

- **Friends-only histograms** (N=5-20) for maximum competitive motivation
- **Global histograms** for population context and self-assessment
- **The toggle between them** as a deliberate social design — friends histogram for "one more try," global histogram for "where do I stand in the universe"

### Upward Identification vs. Upward Contrast

Research on social game continuance behavior (ScienceDirect, 2021) identifies a critical distinction:

- **Upward identification** ("I could be like them") → positive self-efficacy → continued play
- **Upward contrast** ("I'll never be like them") → reduced self-efficacy → quitting

Histograms promote identification over contrast because the curve shows *continuous possibility*. There's no unreachable #1 position — there's just a smooth gradient from where you are to where you could be. Every point on the curve was achieved by a real player. The curve is proof that the next percentile is reachable.

---

## Six Histogram Social Loop Models

### Model A: "The Mirror" (Pure Population Distribution)

**What it is:** After each mission/match, the player sees three bell curves — one per optimization axis (speed, efficiency, elegance as defined in 7.07). Their score is a vertical line on each curve. No names, no friends, no context. Just you and the population.

**Sensory description:** Three horizontal curves fill the lower third of the debrief screen, stacked vertically with generous spacing. Each curve is a smooth gradient fill — cool teal at the left (better scores), warm amber at center, fading to dim gray at the right tail. The player's position is a bright white vertical line that *snaps* into place with a satisfying click sound (a short, crisp tick like a mechanical counter). The area to the left of the line (players who scored better) glows subtly brighter for 500ms, then settles. The area to the right (players who scored worse) dims slightly. The player's percentile appears as floating white text above each line: "Top 23%."

**The social loop:**
1. Player completes mission → sees histogram → "I'm in the 65th percentile on speed but 82nd on elegance"
2. Internal tension: "Can I improve speed without sacrificing elegance?"
3. Redesigns architecture → re-executes → "I moved from 65th to 71st on speed but dropped to 78th on elegance"
4. The curve *moved*. Not because the player's score changed, but because the population curve itself is alive — other players are also optimizing. Yesterday's 70th percentile is today's 68th.

**Strengths:** Maximum simplicity. Zero social friction. Works for solo players who never touch multiplayer. The comparison is abstract — it's "humanity" not "Dave from work."

**Weaknesses:** No social *connection*. The histogram is a mirror, not a window. You see yourself but not anyone else. The motivation is self-referential, not relational. Lonelier than it needs to be.

**Comparable:** Opus Magnum's core implementation — three histograms, no friend integration, anonymous population. The community then *built* the social layer externally (Reddit optimization threads, GIF sharing, tournament organization). Opus Magnum proved that even the simplest histogram creates social activity — but the social activity happened *outside the game*.

---

### Model B: "The Friends Layer" (Population + Friend Markers)

**What it is:** Same population curve as Model A, but friend/followed player positions appear as named dots on the curve. Small avatar circles sitting on the curve line with names below.

**Sensory description:** The population curve renders first (smooth gradient fill, 400ms fade-in). Then friend markers *drop in* from above — tiny circular avatars (24px) that fall with a gentle bounce onto their positions on the curve (staggered 100ms apart, left to right, with a soft "tink" on landing). Each friend marker has a thin vertical line extending down from their position. If a friend is very close to the player's position (within 3 percentile points), their marker gently pulses with a gold border — the "rival proximity" indicator.

**The social loop:**
1. Player completes mission → sees population curve → friend markers land
2. "Sana is 4 percentile points ahead of me on speed" → specific, personal motivation
3. Player redesigns → re-executes → overtakes Sana on speed → Sana's marker is now *behind* the player's line
4. **The notification:** Sana sees "You've been overtaken by [Player] on Mission 3 Speed" next time she opens the game → Sana re-optimizes → the rivalry sustains
5. The "tink-tink-tink" of friend markers landing becomes Pavlovian — the player anticipates the social comparison moment before it arrives

**The rival proximity mechanic:** When two friends are within 3 percentile points on any axis, a thin connecting arc appears between their markers with a subtle shimmer. This is the "rivalry zone" — close enough that one good optimization attempt could flip the positions. The game doesn't call it a rivalry. The proximity does the work.

**Strengths:** The killer social feature. "My friend is right there" is the most powerful motivator in all of game design. The N-Effect research confirms: small comparison groups (5-20 friends) maximize competitive drive. Opus Magnum's Steam integration showed friends on histograms — this was the most cited feature in community discussions.

**Weaknesses:** Friends disappear. As Zachtronics observed: "As you go up the list of levels, friends disappear from the histograms. Not everyone is going to make it." This is inherent to difficulty — it cannot be solved without compromising the game. The histogram gets lonelier as you get deeper. But this loneliness *itself* is a motivator: "I want to pull my friends forward by showing them it's possible."

**Comparable:** Shenzhen I/O's refined friend histograms. SpaceChem's original friend integration. The key Zachtronics learning: friend markers should be **always visible even on unsolved puzzles** — show friends who've completed it and friends who haven't, creating both rivalry (overtake) and mentorship (help) dynamics.

---

### Model C: "The GIF Economy" (Histogram + Solution Sharing)

**What it is:** The histogram includes a "Share" button that captures the histogram state — with the player's position, their percentile, and optionally the first 3 seconds of their sealed watch execution — as a shareable image or short video clip.

**Sensory description:** A small upward-arrow icon sits in the top-right corner of the histogram panel. Tapping it triggers a 300ms "capture" animation — the histogram panel gets a brief white-flash border (like a camera shutter), then a thumbnail preview slides up from the bottom: a clean 1200×630 image showing the three histograms with the player's position highlighted, their username, mission name, and percentile scores. Format options: PNG (static), GIF (3-second sealed watch loop embedded below the histogram), or a direct "copy link" to an interactive version.

The GIF capture is the social nuclear weapon. Robot Uprising's sealed watch — where units snap to grid positions, signals flash, and combat resolves — is inherently GIF-able. A 3-second loop of a perfectly-wired signal chain triggering a simultaneous three-striker flanking maneuver, with the histogram overlaid showing "Top 2% Speed" — this is the image that makes someone download the game.

**The social loop:**
1. Player achieves a personal best → histogram shows movement → hits Share
2. Posts to Discord/Reddit/Twitter with caption "finally cracked the top 10% on elegance"
3. Community responds: "Nice, but look at your efficiency — you're burning 3× the energy I am"
4. Player clicks responder's profile → sees THEIR histogram → "wait, how did you get 92nd percentile on efficiency with only 4 channels?"
5. **Config Code exchange happens.** The histogram sparked the conversation. The Config Code (7.03a) enables the technical exchange. The histogram is the HOOK; the Config Code is the PAYLOAD.

**The Opus Magnum precedent:** Opus Magnum shipped with built-in GIF export of solutions. The subreddit r/opus_magnum became a gallery of animated solutions with implicit histogram competition. Players didn't just share solutions — they shared *beautiful* solutions. The GIF format transformed optimization from a private activity to a public performance. The community invented composite metrics (MechA, Sum) because the existing three axes weren't enough to compare the GIFs people were sharing.

Seven years after launch, the Opus Magnum community Discord still has active optimization GIF channels. Players broke records as recently as September 2024. The GIF economy outlived the game's commercial lifecycle.

**For Robot Uprising:** The sealed watch's deterministic tick-based resolution produces visually clean, loopable moments. The Into the Breach-style snap-to-position clarity means every tick is a distinct frame. A 3-second GIF at 1 tick/second = 3 frames of meaningful state change. Signal chains appear as colored dashed lines flashing between units. Combat resolves as red cell flashes. The visual clarity IS the shareability.

**Strengths:** Transforms the histogram from a private mirror into a public artifact. Creates content. Drives acquisition (new players discover the game through shared GIFs). Builds community identity around optimization culture.

**Weaknesses:** Requires the sealed watch to produce visually interesting moments reliably. Bad battles (all units die immediately, nothing happens) produce terrible GIFs. The share feature must be smart enough to capture *interesting* moments, not arbitrary 3-second windows.

---

### Model D: "The Pareto Gallery" (Multi-Axis Visualization)

**What it is:** Instead of separate bell curves per axis, the histogram is a 2D scatter plot showing the Pareto frontier. Each dot is a player. The player's dot is highlighted. The Pareto frontier (the set of solutions that are optimal on at least one axis) is drawn as a connecting line.

**Sensory description:** A large square panel fills the center of the debrief screen. X-axis: Speed (ticks to victory, lower = better, left = better). Y-axis: Elegance (rule count × hook count, lower = better, bottom = better). Each dot is a semi-transparent teal circle (4px) — thousands of them forming a cloud. The Pareto frontier is a bright white line connecting the dots that no other dot dominates on both axes. The player's dot is a larger (8px) bright gold circle with a gentle pulse. Friend dots are cyan with initials.

The cloud's shape tells a story. The dense center is "good enough" — where most players land. The thin tendrils reaching toward the axes are the specialists — speed demons who sacrificed elegance, or elegant minimalists who sacrificed speed. The Pareto frontier is the "wall of excellence" — the set of solutions where you cannot improve one axis without worsening the other.

Hovering over any dot shows: player name (if friend), percentile on each axis, number of units, number of channels, mission time. Clicking shows: "View Config Code" — direct access to the architecture that produced this dot.

**The social loop:**
1. Player sees their gold dot in the center of the cloud → "I'm average"
2. Sees the Pareto frontier → "Those dots are the best possible trade-offs"
3. Picks a direction: "I want to move toward the speed extreme"
4. Redesigns → re-executes → dot moves → "I'm closer to the frontier"
5. Eventually reaches the frontier → "I AM the frontier" → screenshot → share → "I'm on the Pareto frontier for Mission 7"
6. Another player optimizes further → frontier shifts → the player's dot is no longer on the frontier → re-optimize

**The "moving frontier" effect:** Unlike a static leaderboard, the Pareto frontier is a living boundary that shifts as the community improves. Being on the frontier today doesn't guarantee frontier status tomorrow. This creates a permanent "arms race" dynamic — but a healthy one, because there are infinite points on the frontier. You don't need to beat anyone. You need to find your *own* undominated point.

**Strengths:** Visualizes the multi-axis trade-off space in a way that single-axis histograms cannot. Makes the Pareto concept visceral — players learn optimization theory by living it. Creates a richer social language: "I'm on the speed end of the frontier" vs. "I'm on the elegance end."

**Weaknesses:** Harder to read than single-axis curves. Requires two axes at a time (with three axes, you need either three 2D plots or a 3D visualization that nobody can parse). The scatter plot is less immediately legible than a bell curve — the "where am I?" moment takes longer. New players may not understand the Pareto concept without education.

**Comparable:** The Opus Magnum community's scatter plots (community-generated, not in-game). Factorio's production statistics graphs (line charts over time showing throughput). Chess rating distribution charts. The key insight from Opus Magnum: the community built these tools *because they wanted them*. Ship it built-in.

---

### Model E: "The Living Curve" (Temporal Histograms)

**What it is:** The histogram isn't a snapshot — it's a timeline. The player can scrub through the histogram's history, seeing how the population curve shifted over days, weeks, months. Their own position is tracked as a line threading through time.

**Sensory description:** The bell curve fills the screen width. A horizontal timeline slider sits below it. As the player drags the slider leftward (backward in time), the curve *morphs* — the median shifts, the tails lengthen or compress, the player's vertical line slides along. The curve is a river flowing through time, and the player's position is a boat on it.

Initially (day 1 after a mission releases), the curve is wide and flat — everyone is figuring it out. Over weeks, it compresses and shifts left as the community optimizes. The player can see this compression happening: "The median was 45 ticks two weeks ago. Now it's 31. The community is getting better."

The player's own trajectory appears as a faint gold line threading through the timeline — showing not just where they are now, but where they *were*. A player who was 80th percentile on day 1 but fell to 50th by week 4 (because the community improved around them) has a visually distinct trajectory from a player who climbed from 30th to 80th over the same period.

**The social loop:**
1. Player opens histogram → notices curve has shifted since last week → "The community moved. Did I keep up?"
2. Scrubs to see their trajectory → "I was 72nd percentile last week, now I'm 68th. I didn't get worse — everyone else got better"
3. This realization — that standing still IS falling behind — creates urgency without explicit pressure
4. Re-optimizes → trajectory ticks upward → the act of maintaining position against a moving curve IS the game

**The "obsolescence wave" phenomenon:** In the first week after a mission releases, the curve moves rapidly as early solutions are replaced by better ones. Then it stabilizes as the community converges on strong strategies. Then, months later, a single breakthrough (a new combo, a new hook topology) shifts the curve again — and everyone who was "done" with that mission suddenly isn't. The living curve surfaces these breakthrough moments as visible events.

**Strengths:** Makes the community feel alive. The histogram is not static data — it's a living organism. This is the strongest "return to the game" mechanic of any model. Even a player who hasn't played in weeks can open the living curve and see that the world moved without them.

**Weaknesses:** Requires historical data storage (memory cost). The timeline scrubber adds UI complexity. The "I'm falling behind without playing" feeling can be more anxiety-inducing than motivating for some players. Must offer an opt-out or "snapshot only" mode.

**Comparable:** GitHub contribution graphs (green squares showing activity over time). Strava segment leaderboards (your times vs. historical best-of). Chess ELO history charts. The key difference: those show YOUR history against a static benchmark. Robot Uprising's living curve shows your history against a moving population.

---

### Model F: "The Constellation" (Community Identity Map)

**What it is:** The histogram is replaced by a 2D identity map where clusters of similar solutions form "constellations." Players don't just see where they rank — they see which *tribe* of solution-builders they belong to.

**Sensory description:** A dark field fills the screen, like a night sky. Each player's solution is a point of light — positioned by architectural similarity (dimensionality-reduced from hook count, channel topology, unit composition, rule complexity). Similar solutions cluster into visible constellations. Constellation names emerge organically from the community or are auto-generated: "The Relay Chain," "The Scout Rush," "The Silent Network," "The Command Fortress."

The player's dot is a bright gold star. Their friends are cyan stars. Each constellation has a faint boundary line and a name label. Hovering over a constellation shows: average metrics, dominant unit composition, typical hook topology, and number of players in this approach.

The map breathes. When many players converge on a new strategy, a new constellation forms — the stars drift together over days, pulling into a visible cluster. When a strategy falls out of favor, its constellation dims and scatters. The identity map is a real-time visualization of the game's meta.

**The social loop:**
1. Player opens identity map → sees their gold star in "The Relay Chain" constellation
2. Notices a bright, growing constellation on the other side of the map: "The Silent Network" — small, dense, new
3. "What are they doing differently?" → clicks the constellation → sees aggregate metrics → "Zero relays. All scouts with compressed hooks. How does that work?"
4. Imports a Config Code from the constellation → studies it → "Oh, they're using direct scout-to-striker wiring with heavy context filtering instead of relay amplification"
5. Player either adopts the approach (their star drifts toward the new constellation) or optimizes their existing approach (their star stays but grows brighter)

**The tribe effect:** Players identify with their constellation. "I'm a Relay Chain player" becomes a social identity. Community discussions fragment along constellation lines: "Relay Chain vs. Silent Network" debates. Streamers pick constellations and brand themselves. Tournaments feature constellation-balanced brackets.

**Strengths:** Creates social *identity*, not just social *comparison*. Players belong to something. The constellation visualization is inherently beautiful and shareable. The meta becomes visible — you can literally *see* the strategic landscape.

**Weaknesses:** Architecturally complex to implement (requires dimensionality reduction, clustering algorithms, real-time updates). The visualization may be beautiful but hard to read for quick "how did I do?" assessment. Less actionable than a simple bell curve — knowing you're in "The Relay Chain" doesn't tell you how to improve.

**Comparable:** Reddit user clustering visualizations. Spotify Wrapped taste profiles. Chess opening explorer trees. The key insight: people want to know not just how *good* they are, but what *kind* of player they are.

---

## Recommended Hybrid: "The Three Lenses"

**Ship all six as progressive layers, unlocked across the player's career:**

| Layer | Unlock Condition | What It Shows | Social Function |
|-------|-----------------|---------------|-----------------|
| **Mirror** (Model A) | Mission 1 | Population curve + percentile | Private self-assessment |
| **Friends** (Model B) | First friend added or M3 | Friend markers on curve | Interpersonal rivalry |
| **Share** (Model C) | First mission completed | GIF/image export | Content creation, acquisition |
| **Pareto** (Model D) | Mission 5 (factory unlock) | 2D scatter + frontier | Multi-axis optimization language |
| **Living** (Model E) | 1 week after account creation | Temporal curve + trajectory | Return motivation, community pulse |
| **Constellation** (Model F) | Gauntlet entry / advanced campaign | Identity clusters | Tribe identity, meta visualization |

The debrief screen defaults to Model B (population + friends). Tab bar along the top: **Curve | Frontier | Timeline | Map**. Share button present on every view.

**Critical design rule:** The histogram panel must render in **under 200ms**. If it's slow, it's not a reflex — it's a chore. The emotional window after a battle (the "did I do well?" moment) is 2-3 seconds. The histogram must answer that question before the emotion fades.

---

## The Social Loop Lifecycle: From First Glance to Community Engine

### Phase 1: The Private Mirror (Sessions 1-5)

The player completes early missions. The histogram appears. They don't yet have friends or context. The curve is just a mirror: "I'm here." The motivation is self-referential: "Can I do better?"

**Key design moment:** The first time the player re-executes a mission and sees their line move on the curve. The line slides from the 60th percentile to the 55th percentile. There's a subtle animation — the line sweeps leftward with a satisfying whoosh sound, like a speedometer needle. This is the moment the social loop hooks. Not because of social comparison — because of *self-comparison mediated by social context*.

### Phase 2: The Rivalry (Sessions 5-20)

Friends are added. Friend markers appear on the curve. Now the histogram is a window, not just a mirror. "Sana is 3 percentile points ahead of me." The rivalry proximity indicator glows.

**Key design moment:** The first time the player overtakes a friend. The friend's marker visually *slides behind* the player's line (a 500ms animation). A subtle sound: a soft "ding" — not triumphant, just satisfying. No notification to the overtaken friend unless they opt in. The victory is private until shared.

### Phase 3: The Content Loop (Sessions 20-50)

The player starts sharing. First histogram screenshots in Discord. Then GIF captures of their best sealed watch moments with histogram overlays. Community members respond with their own GIFs. Config Codes are exchanged in the conversation threads.

**Key design moment:** The first time someone shares a GIF that includes the player's friend marker visible on the histogram. "Wait — I can see myself on THEIR histogram." The social graph becomes visible through the histogram.

### Phase 4: The Optimization Culture (Sessions 50-100)

The Pareto gallery unlocks. The player starts thinking in trade-offs: "I can be on the speed frontier OR the elegance frontier, but not both." The community develops vocabulary: "speed-optimal," "elegance-optimal," "balanced."

**Key design moment:** The first time the player reaches the Pareto frontier. Their dot touches the white line. A subtle glow emanates from their dot. No fanfare — just the geometric fact of undominated performance. The player screenshots this and shares it. "I'm on the frontier for Mission 7." This is the Opus Magnum histogram equivalent of "Top 1% cycles."

### Phase 5: The Living Community (Sessions 100+)

The living curve reveals that the community is an organism. The timeline shows meta-shifts. The constellation map shows strategic tribes. The player is no longer just optimizing — they're *participating in a culture*.

**Key design moment:** The first time the player notices a new constellation forming on the identity map. "What is that cluster? Why are people grouping there?" Investigation reveals a new strategy. The meta shifts. The histogram as social loop has become the histogram as *collective intelligence visualization*.

---

## Player Journeys

#### Journey: Sofia, 15, Casual Mobile Gamer (First Histogram Encounter)

**Context:** Just completed Mission 2 (Focus — wire first hook). Playing on iPad during lunch break at school. Has never seen a post-game histogram in any game.

**Minute 0:00 — The Debrief Begins**
The sealed watch ends. Sofia's scout spotted the enemy but the signal arrived one tick too late — the striker engaged from a suboptimal position but still won. The screen transitions to the Inspector phase. Sofia pokes around the timeline scrubber for 30 seconds, clicks a few units, sees the decision trace. Then she notices the tab at the bottom of the screen: "STATS."

She taps it. Three horizontal curves fill the lower third of the screen. They're colored in soft gradients — teal on the left fading to amber in the middle to dim gray on the right. A bright white vertical line snaps into place on each curve with a crisp *tick* sound. Text appears above each line:

- **Speed: Top 54%** (31 ticks)
- **Efficiency: Top 67%** (4 channels, 2 hooks)
- **Elegance: Top 41%** (3 rules, 1 relay)

**Minute 0:15 — The Reading**
Sofia stares. "Top 41% on elegance? That means 59% of people did worse than me?" She looks at the curve shape — most players cluster in the middle, but there's a long tail to the left where the best scores live. Her line is slightly left of center on elegance. "I used fewer rules than most people."

She looks at efficiency: 67th percentile. The curve shows a fat center — most people are clustered around the same channel count. Her line is in the fat middle. "I'm... normal on this one."

Speed: 54th. Almost exactly median. "So half of people beat this mission faster than me."

**Minute 0:30 — The Itch**
Sofia goes back to the Plan screen. She's not trying to progress to Mission 3. She's staring at her hook configuration thinking: "If I moved the scout closer to the striker, the signal would arrive one tick earlier. That's 30 ticks instead of 31. Would that move me?"

She reconfigures. Moves the listen filter on the striker to ignore terrain observations. Executes.

**Minute 1:15 — The Movement**
Debrief. Stats tab. The curves render. The white lines snap — and on the Speed curve, the line is slightly *further left* than before.

- **Speed: Top 48%** (29 ticks)

The line swept leftward with a soft whoosh. Six percentile points. Sofia grins. She didn't beat the mission faster because the game told her to. She beat it faster because the curve told her she *could*.

**Minute 1:30 — The Screenshot**
Sofia takes a screenshot of the three histograms showing her Speed improvement. She sends it to her friend Marcus on WhatsApp with the caption "i just moved up 6%." Marcus, who hasn't played Mission 2 yet, replies: "what game is this." The acquisition funnel begins.

**UI Annotations:**
- Histogram panel: bottom third of debrief screen, three stacked curves with 40px vertical spacing
- Player line: 2px bright white, snaps into position with 200ms ease-out animation and "tick" sound
- Percentile label: 14px white text, floats 8px above line, fade-in 100ms after line lands
- Curve gradient: teal (#00BFA5) left → amber (#FFB300) center → gray (#616161) right
- "STATS" tab: bottom tab bar, alongside "TIMELINE" and "SIGNALS" tabs

---

#### Journey: Marcus, 38, Software Engineer, Opus Magnum Veteran (The Friends Layer)

**Context:** Mission 7 (Command agent + production tuning). Has three friends playing: Sofia (casual, behind on campaign), Derek (Factorio vet, ahead), and Kwame (streamer, same mission). Playing on PC with Steam friends integration.

**Minute 0:00 — The Familiar Shape**
Marcus finishes a complex battle involving a command agent rerouting two relays mid-fight. He clicks the Stats tab immediately — he knows the rhythm from 200 hours of Opus Magnum. Three curves appear. His line lands.

- **Speed: Top 22%** (24 ticks)
- **Efficiency: Top 31%** (6 channels, 8 hooks, 4 units)
- **Elegance: Top 15%** (5 rules, 1 command agent, 2 blueprints)

Then the friend markers drop in. Three small circles fall from above the curves, bouncing onto their positions with staggered "tink" sounds:

- **Derek** lands at Top 8% Speed, Top 44% Elegance. Speed demon. Brute-force.
- **Kwame** lands at Top 19% Speed, Top 12% Elegance. Close to Marcus on both axes.
- **Sofia** — no marker. She hasn't reached Mission 7 yet. A faint gray circle with her avatar sits below the curve with text: "Not yet completed."

**Minute 0:15 — The Rival**
Marcus zeroes in on Kwame's marker. It's 4 percentile points ahead on Speed and 3 points ahead on Elegance. Both markers have a thin connecting arc between them — the rivalry proximity indicator, shimmering faintly gold. Marcus mutters: "He's using fewer channels than me. How?"

He taps Kwame's marker. A small popup shows: "4 channels, 5 hooks, 3 units, 22 ticks." Marcus has 6 channels and 8 hooks for nearly the same speed. Kwame's architecture is *tighter*.

**Minute 0:30 — The Redesign Motivation**
Marcus doesn't click "Next Mission." He clicks "Redesign." He stares at his hook topology. Six channels. Do I really need a separate channel for terrain observations? Could I merge the threat and position channels?

He spends 8 minutes reducing his channel count from 6 to 4 by combining hooks and using context config filtering instead of channel separation. Re-executes.

**Minute 9:00 — The Overtake**
Stats tab. Curves. Lines snap. Friend markers drop.

- **Speed: Top 18%** (22 ticks) — moved 4 percentile points
- **Elegance: Top 9%** (4 rules, 1 command, 2 blueprints) — moved 6 points

Kwame's marker is now *behind* Marcus's line on elegance. The connecting arc glows briefly, then fades — the rivalry proximity is no longer active because Marcus pulled ahead by more than 3 points.

Marcus hits Share. The GIF captures 3 seconds of his sealed watch — the moment the command agent reroutes a relay mid-battle, creating a perfect scout-relay-striker chain that eliminates three enemies in two ticks. The histogram overlay shows "Top 9% Elegance" in the corner.

He posts to the group Discord: "Finally cracked single-digit elegance on M7. @Kwame your move."

Kwame sees it 20 minutes later. Opens the game. The loop continues.

**UI Annotations:**
- Friend markers: 24px circular avatars with 1px border matching player's Steam profile color
- Rivalry proximity arc: thin (#FFD700 gold) arc connecting markers within 3 percentile points, 0.3 opacity shimmer
- Missing friend: gray (#9E9E9E) circle below curve with "Not yet completed" in 10px text
- Friend tap popup: 200px wide, shows key metrics, Config Code "View" button, 300ms fade-in
- Share button: top-right of histogram panel, upward-arrow icon, 32×32px, white on dark

---

#### Journey: Aisha, 14, First-Time Strategy Game Player, Playing on Phone in Manila (The Constellation Discovery)

**Context:** Has been playing for 3 months. Completed all 10 campaign missions. Just entered Gauntlet competitive mode. Her constellation map just unlocked.

**Minute 0:00 — The New Tab**
Aisha completes a Gauntlet match — a close victory where her scout network detected an enemy flanking attempt and rerouted her striker just in time. In the debrief, she notices a new tab she hasn't seen before: "MAP" — next to the familiar Curve, Frontier, and Timeline tabs.

She taps it. The screen fills with a dark field — deep indigo, almost black — scattered with hundreds of tiny points of light. It looks like a night sky. The points cluster into visible groups, connected by faint boundary lines. Labels float near each cluster: "Relay Chain," "Scout Rush," "The Silent Network," "Command Fortress," "Balanced Standard."

Her dot is a bright gold star, pulsing gently, sitting inside the "Relay Chain" constellation. Around her, a dozen other gold-edged stars — her friends and Gauntlet rivals.

**Minute 0:15 — The Identity Moment**
Aisha reads the constellation name: "Relay Chain." She taps it. A panel slides in from the right showing aggregate stats:

- **247 players** in this constellation
- **Average composition:** 2 Scouts, 2 Relays, 1 Striker, 1 Command
- **Typical topology:** Scout→Relay→Relay→Striker chain
- **Strengths:** Signal quality, noise filtering, reliable information
- **Weaknesses:** Speed (high latency), vulnerability to relay elimination

"That's me," Aisha thinks. Two relays, long chains, reliable but slow. She didn't know there was a name for it. She didn't know 246 other people played the same way.

**Minute 0:30 — The Other Tribe**
Across the map, a dense, bright cluster catches her eye: "The Silent Network." It's smaller — maybe 80 players — but the stars are tightly packed and unusually bright (indicating high Gauntlet ratings). She taps it:

- **83 players** (average Gauntlet rating: Diamond)
- **Average composition:** 3 Scouts, 0 Relays, 2 Strikers, 0 Command
- **Typical topology:** Direct scout-to-striker wiring, compressed signals, minimal channels
- **Strengths:** Speed (low latency), stealth (minimal EM emissions)
- **Weaknesses:** Signal quality (no relay filtering), vulnerability to noise flooding

No relays. No Command agent. Just scouts wired directly to strikers with aggressive context filtering. Aisha has never built an architecture without relays. The constellation map just showed her a playstyle she didn't know existed.

**Minute 1:00 — The Cross-Pollination**
Aisha taps "Browse Configs" within the Silent Network constellation. A scrollable list of Config Codes appears, each with a mini-histogram position and a brief description. She picks one with a high Gauntlet rating and imports it.

In the workbench, she studies it. Zero relays. The scouts use compressed hooks with aggressive filtering — they only transmit confirmed threats, discarding all terrain and position data. The strikers listen on a single channel called "kill" — nothing else. The context windows are set to 4 slots (minimum) with oldest-evicted.

"This is so different from mine," she whispers. She modifies it — adding one relay as a compromise — and queues a Gauntlet match.

After the match, she opens the constellation map again. Her gold star has moved. Not by much — but it's drifted slightly from the center of "Relay Chain" toward the gap between Relay Chain and Silent Network. She's in the interstitial space. A pioneer between tribes.

**Minute 2:00 — The Social Identity**
Aisha screenshots the constellation map with her gold star positioned between two clusters. She posts it to the Robot Uprising Discord channel #gauntlet-meta with the caption: "relay chain player trying silent network. relay-silence hybrid? anyone else in the gap?"

Three responses within an hour. One from a Diamond player: "I've been in that gap for weeks. The meta calls us 'Whisperers.' We use one relay as a filter node instead of an amplifier. Welcome to the unnamed constellation."

The community has named a tribe that the game hasn't. The constellation map made the tribe *visible*. The community made it *real*.

**UI Annotations:**
- Identity map: full-screen dark field (#1A1A2E), points of light at 60% opacity, player's dot at 100% gold (#FFD700)
- Constellation boundaries: thin dashed lines (#FFFFFF at 15% opacity), label text 12px, positioned above cluster center
- Cluster tap panel: slides from right, 320px wide, shows aggregate stats, "Browse Configs" button at bottom
- Star drift: after each match, player's star smoothly animates to new position over 1.2s with faint trail
- Cross-constellation space: unlabeled, dark — pioneers visible as isolated bright dots between clusters

---

#### Journey: Dr. Reyes, 45, CS Professor at UP Diliman, Manila (The Living Curve as Teaching Tool)

**Context:** Uses Robot Uprising in his Software Architecture course. Has assigned Mission 7 (Command agent) as a lab exercise. 30 students playing simultaneously. Has been tracking the class's histogram evolution over 2 weeks.

**Minute 0:00 — The Monday Lecture**
Dr. Reyes projects the Living Curve for Mission 7 onto the lecture hall screen. He scrubs the timeline back to two weeks ago — the day he assigned the mission. The curve is wide and flat: students' first attempts scattered across the full range. The median is at 52 ticks (slow, inefficient).

He scrubs forward one day at a time. Monday: wide and flat. Wednesday: the curve starts to compress. The median moves from 52 to 44 ticks. A cluster forms at the left tail — the top students found efficient architectures early. Friday: the median hits 38 ticks. The curve is narrower. The community (his class) is converging.

"Notice what happened between Wednesday and Friday," he says. "The curve compressed. Not because I taught you anything — I was at a conference. You taught *each other*. Config Codes shared in your group chat moved the median 6 ticks in 48 hours."

**Minute 0:30 — The Distribution Discussion**
He switches to the current histogram. The curve has a bimodal shape — two peaks. "Why are there two humps?" he asks.

A student raises her hand: "The left peak is people who used command agents. The right peak is people who didn't."

"Exactly. The command agent is a *phase transition* in this mission's design space. There are two local optima — one with command, one without. The histogram is showing you the topology of the solution space."

He toggles to the Pareto gallery. Two distinct clusters of dots — the command cluster (lower-left, fast and elegant) and the no-command cluster (upper-right, slower but simpler). "Your homework: move from the right cluster to the left cluster. Your grade is not your percentile — it's your *trajectory*. Show me movement."

**Minute 1:00 — The Grade Innovation**
Dr. Reyes opens the Living Curve's trajectory view. Each student's path through the histogram over 14 days is visible as a thin colored line. Some lines are steep descents toward the left (rapid improvement). Some are flat (stuck). Some zigzag (experimentation).

"I'm grading you on the slope of your line, not the endpoint. A student who went from the 90th percentile to the 40th percentile in two weeks learned more than a student who started at the 20th percentile and stayed there."

A student in the back: "So the game's histogram is literally your gradebook?"

"The game's histogram is a *richer* gradebook than anything I could design. It captures not just your answer, but your answer relative to every other answer that exists, your improvement trajectory, and which strategic cluster you belong to. That's more information than a letter grade could ever convey."

**UI Annotations:**
- Timeline scrubber: horizontal slider below curve, date labels at weekly intervals, playback controls (play/pause/step)
- Trajectory view: per-player colored lines threading through the time-varying curve, opacity = recency
- Bimodal detection: when curve has >1 peak, subtle vertical dashed lines appear at valleys between peaks
- Projection mode: external display via browser URL (shareable link to read-only histogram dashboard)

---

## Interaction Effects

### Histogram × Config Code (7.03a)
The histogram surfaces the *what* (where you stand). The Config Code provides the *how* (the architecture that produced that position). The social loop requires BOTH: the histogram creates the desire to compare, and the Config Code enables the technical exchange. Without Config Codes, histograms are just vanity metrics. Without histograms, Config Codes have no context for comparison.

### Histogram × Inspector (Locked)
The Inspector provides the *why* (decision traces, buffer states, signal genealogy). A player who sees they're in the 60th percentile on speed needs the Inspector to understand *what's slow*. The histogram → Inspector → redesign → histogram cycle is the core analytical loop.

### Histogram × Three Optimization Axes (7.07)
The histogram's value scales with the number of axes. One axis = one curve = simple comparison. Three antagonistic axes = complex trade-off space = rich social discussion. The Pareto gallery (Model D) requires at least two axes. The constellation map (Model F) benefits from higher dimensionality. The axes ARE the social language.

### Histogram × Sealed Watch (Locked)
The sealed watch produces the content that the histogram contextualizes. A beautiful sealed watch GIF with a histogram overlay showing "Top 3% Elegance" is the social object. The sealed watch's visual clarity (deterministic ticks, snap-to-grid, signal lines) makes the GIF shareable. Without sealed watch clarity, histogram GIFs would be meaningless.

### Histogram × Campaign Missions (Locked)
Per-mission histograms create 10 distinct optimization spaces. Mission 3 (hooks introduction) has a different curve shape than Mission 9 (full system). The per-mission structure means the histogram never gets stale — completing a new mission opens a new curve to climb. The "friends haven't reached this mission yet" loneliness effect (observed in Zachtronics games) must be mitigated by global population markers.

### Histogram × Gauntlet (Competitive)
Gauntlet-specific histograms are distinct from campaign histograms. Campaign histograms compare solutions to the same puzzle. Gauntlet histograms compare architectures across *varying* opponents and scenarios — a fundamentally different comparison. The Gauntlet histogram is a meta-level measurement: not "how well did you solve this puzzle?" but "how robust is your architecture?"

### Histogram × EM Emissions (Locked)
EM noise emissions could be a histogram axis — "stealth score." A new dimension creates new trade-off space: fast-but-loud vs. slow-but-silent. The constellation map might show a "Dark Network" cluster of stealth-optimized architectures.

### Histogram × Leaderboards (7.05)
Histograms and leaderboards are complementary, not competing. The histogram shows distribution (where you fit). The leaderboard shows rank (who's best). The Zachtronics insight is that the histogram *replaces* the leaderboard for most players — but the top 1% still want rankings. Robot Uprising should show histograms by default and rankings only for Pareto frontier residents.

---

## Comparable Games & Media

### Opus Magnum (Zachtronics, 2017)
The gold standard. Three-axis histograms (cost/cycles/area) visible after every puzzle. Built-in GIF export created a massive sharing culture. Community invented novel metrics (MechA, Sum, LexC, Period) because three axes weren't enough. Reddit community active 7+ years post-launch. Tournaments organized around custom composite metrics. The histograms were the social loop — not the puzzles, not the story, not the mechanics. The histograms.

Key lesson: **ship the histogram. The community will build the rest.**

### SpaceChem (Zachtronics, 2011)
The histogram's origin. Zach Barth's postmortem: histograms replaced leaderboards because (1) leaderboards incentivize cheating, and (2) leaderboards tell most players they suck. The histogram was born from organic community behavior — players sharing solution text blocks in Kongregate comments for earlier Zachtronics Flash games.

Key lesson: **the histogram arose because players already wanted to compare. The design just formalized what was happening naturally.**

### Shenzhen I/O (Zachtronics, 2016)
Refined histogram UI with clearer low-value rendering. Added friend integration via Steam. The observation that friends "disappear from histograms as you progress deeper" — inherent to difficulty curves.

Key lesson: **friend presence on histograms drives engagement more than population position.**

### Strava (Running/Cycling App)
Segment leaderboards show your time vs. all-time and recent records. The "Local Legend" badge for most attempts at a segment in 90 days creates repeat engagement independent of speed. Crown icons for top-3 positions.

Key lesson: **frequency of engagement (attempts), not just quality (percentile), can be a histogram axis.** Robot Uprising could show "number of optimization attempts per mission" as a dedication metric.

### GitHub Contribution Graph
The green-squares visualization creates social pressure to maintain streaks. "Contribution streaks" became a social currency — people optimized for green squares even when the contributions were trivial.

Key lesson: **visible consistency metrics drive behavior even without explicit incentives. But Goodhart's Law applies — once the metric is visible, people optimize for the metric, not the underlying value.** Robot Uprising must be aware of this when choosing what to histogram.

### Wordle (NYT)
The colored-square share format (⬛🟨🟩) created a universal visual language for sharing performance. The grid is a micro-histogram — it communicates not just the result but the journey (which guesses were close, which were wrong). It's shareable precisely because it's compact and self-explanatory.

Key lesson: **the share format matters as much as the data.** Robot Uprising's histogram share image must be self-explanatory to non-players — the shape of the curve and the player's position should be legible without any game knowledge.

---

## The TikTok Clip

**"The Flip"**
Split screen. Left: a histogram with the player's line at the 60th percentile. Right: the workbench. The player drags one rule to a different priority position. Quick cut to sealed watch — the rearranged rule fires first, causing a scout to report before the striker engages instead of after. The striker wins. Quick cut back to histogram — the line sweeps from 60th to 42nd percentile. The whoosh sound. Text overlay: "One drag. Eighteen percentile points."

The clip works because it connects a *tiny action* (dragging a rule) to a *visible outcome* (histogram movement) through an *emotionally legible intermediary* (the sealed watch kill). The histogram makes the improvement concrete and social. The viewer thinks: "I want to feel that whoosh."

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Histogram anxiety ("I'm falling behind") | Default to friends-only view; population view is opt-in toggle |
| Goodhart's Law (optimizing for percentile, not learning) | Multiple antagonistic axes prevent single-metric optimization |
| Cheating (submitting fake scores) | Deterministic tick engine enables server-side replay verification for Gauntlet; campaign histograms accept some noise |
| Small population (early launch, thin curves) | Backfill with AI-generated solution scores; disclose "includes AI benchmarks" until population > 1000 per mission |
| Friend disappearance (deep missions) | Show "not yet completed" friend markers below curve; "invite to try" button |
| Data storage (living curve history) | Daily snapshots, not per-execute; 90-day rolling window; aggregate after 90 days |

---

## New Aspects Discovered

- **7.06a** — Histogram animation and sound design vocabulary: the exact visual choreography of line-snap, friend-marker-drop, curve-morph, and percentile-label-fade; audio mapping (tick, tink, whoosh, ding); 200ms rendering budget; how animation pacing creates emotional rhythm in the debrief
- **7.06b** — Histogram population bootstrapping for launch: strategies for launching with empty histograms (AI benchmarks, developer playthroughs, beta population carry-over, "first 1000 players" badge); when to disclose synthetic data; the transition from bootstrapped to organic population curves
- **7.06c** — The histogram as anti-cheat signal: using population distribution shape to detect anomalous scores (scores far into the tail are flagged for replay verification); the tension between allowing legitimate outliers and flagging exploits; community-reported suspicious scores
- **7.06d** — Per-unit-type histograms: breaking down the overall histogram by unit composition (show separate curves for relay-heavy vs. scout-heavy architectures); enables constellation-like analysis without the full identity map; simpler to implement than Model F
- **7.06e** — Histogram accessibility: screen reader narration of histogram position ("You are in the 23rd percentile on Speed, meaning 77% of players completed this mission faster"); haptic vibration patterns mapping to curve shape on mobile; high-contrast histogram mode; reduced-motion histogram rendering (no animation, instant positioning)
