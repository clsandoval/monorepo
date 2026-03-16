# The "Find the Pivot" Tournament Format

**Aspect:** 7.13 — Community "find the pivot" tournament format: a formal async tournament where a featured match is posted and participants submit pivot guesses within a 24-hour window; the distribution of guesses displayed after deadline shows false pivot clustering; the metagame of collective diagnostic calibration; no debrief tools allowed during submission window

**Category:** multiplayer/community
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Every competitive game community develops a culture of *watching*. Chess communities replay grandmaster games. StarCraft communities analyze tournament VODs. Slay the Spire communities debate decision points in recorded runs. But in every case, the analytical tools are fully available during viewing — the viewer has as much information as they want.

Robot Uprising's sealed watch / inspector split creates a unique asymmetry: the sealed watch is an emotional experience with deliberately withheld information, while the inspector is an analytical experience with full transparency. The "find the pivot" tournament exploits this asymmetry. Players watch only the sealed version of a featured match — no inspector, no decision traces, no context window state — and must identify the **Effective Determination Timestamp (EDT)**: the tick at which the outcome was effectively decided.

This is a diagnostic skill test. Not "can you build a good config?" but "can you *read* a battle?" The format turns the community's collective diagnostic ability into a measurable, competitive, socially visible artifact. And it creates a format where *watching the game IS the game.*

The closest real-world parallel is the **World Chess Solving Championship** — where the competitive activity is analysis, not play. The WCSC has run since 1977, with six rounds of increasingly complex positions to solve under time pressure. But where chess solving asks "what is the best move?", find-the-pivot asks "when was the game decided?" — a fundamentally different diagnostic question that maps to **root cause analysis** in software engineering (finding the commit that broke production, the deployment that caused the outage, the configuration change that cascaded into failure).

Other comparable formats:
- **GeoGuessr's async challenges**: Players compete on the same set of locations within a time window, with scores revealed afterward. The distribution of guesses creates a community map of collective geographic knowledge. Robot Uprising's pivot distribution is the equivalent — a community map of collective diagnostic ability.
- **Wordle's daily puzzle**: One shared challenge per day, no replays, results shared as emoji grids. The format's virality comes from the shared experience — everyone attempted the same thing. Find-the-pivot achieves the same "we all watched the same match" shared-experience dynamic.
- **Fantasy sports prediction markets**: Participants make predictions against the same event, with accuracy tracked over time. Find-the-pivot is a prediction game where the "event" already happened — players predict the hidden structure of a completed match.

---

## The Format in Detail

### Phase 1: Match Selection (Admin/Automated)

A featured match is selected — either by community vote, automated algorithm (highest false-pivot gap, most dramatic reversal, most instructive failure mode), or tournament organizer. The match must have a computed EDT (gold diamond in the normal inspector view) and ideally a high false-pivot gap (many apparent reversals before the true determination point).

**Match metadata shown to participants:**
- Both players' Gauntlet tier (e.g., "Diamond vs. Platinum")
- Map name and biome
- Match duration in ticks (e.g., "87 ticks")
- Outcome (e.g., "Blue wins — enemy base destroyed at tick 87")
- NO config details, NO channel maps, NO unit counts — nothing from the workbench

**What the selection screen looks like:**
A full-width card dominates the community hub. The card shows the 8×8 board in its final state — destroyed units as debris, surviving units in idle poses, the losing base cracked and smoking. Above the board, a header reads **"FIND THE PIVOT — Round 14"** in the game's chunky terminal font, with a countdown timer below: **"23:47:12 remaining."** The card's border glows a soft gold — the same gold as the EDT diamond marker that participants are trying to find. A prominent **"ENTER"** button at the bottom pulses gently.

### Phase 2: Sealed Watch Only (24-Hour Window)

Participants click ENTER and are shown the sealed watch replay of the match. The same sealed watch they'd see in their own games — board center, tick clock top, context bars on units, signal chain lines, combat flashes. **No inspector. No decision traces. No click-to-inspect. No scrubber.**

**Critical constraint:** The replay plays forward at 1x speed (with 0.5x and 2x speed controls). The participant can replay the match as many times as they want within the 24 hours. But they cannot pause, step through individual ticks, or access any analytical tools. They are watching a *performance*, not reading a *diagram*.

**What the watch screen looks like:**
The standard sealed watch, but with one addition: a **MARK PIVOT** button in the bottom-right corner, styled as a gold diamond (matching the EDT marker visual). Clicking this button during playback drops a golden timestamp marker at the current tick. The marker appears as a small gold diamond on the tick clock's horizontal pip strip. The participant can place multiple markers during a viewing, delete markers, and move them. Only **one final marker** can be submitted.

Below the tick clock, a subtle bar shows the participant's current markers as tiny gold diamonds on a horizontal timeline. Hovering a marker shows "Tick 34" in a tooltip. Clicking the X on a marker removes it.

**What the participant sees during their seventh replay:**
The match has been replaying for 15 minutes. The participant notices something they missed the first six times — at tick 41, the blue relay's context bar flashes amber for a single tick before returning to green. This is subtle — it happens during a tick where a combat flash elsewhere draws attention. But the amber flash means the relay was approaching overload, which means its compress skill likely evicted critical data. The participant places a new marker at tick 41, removing their previous marker at tick 52 (which was where the first visible enemy unit died — a false pivot they'd been anchored to).

**Audio design:**
When placing a marker, a quiet crystalline *ping* — the same descending fifth interval used for the EDT reveal in normal inspector play. This creates a Pavlovian association: every time you place a marker, you hear the sound of "the answer revealed," training the anticipation loop.

### Phase 3: Submission

When satisfied, the participant clicks **SUBMIT** on a confirmation screen. The screen shows:

- The full tick timeline as a horizontal bar
- Their single gold diamond marker on it
- The text: **"Your pivot: Tick 41"**
- A confidence slider (optional): **"How sure are you?"** from "Wild guess" (1) to "I'd bet my Gauntlet rank" (5)
- A free-text annotation field (280 characters max): "Relay context bar amber flash at T41 — compress evicted threat data before it could reach striker. Everything after was inevitable."
- **LOCK IN** button (irreversible)

**What the submission screen looks like:**
A dark overlay dims the sealed watch behind it. A centered modal with the game's terminal-green border. The tick timeline stretches across the top, with the player's gold diamond prominent. Below, the confidence slider is a row of five small circles that fill with gold as the participant clicks. The annotation field has a keyboard-clackety typing sound (subtle) as they type, with a character counter in the bottom-right corner counting down from 280. The LOCK IN button is styled differently from any other button in the game — it has a gold border, slightly larger text, and requires a 1-second hold (a progress ring fills around it) to prevent accidental submission. On release, the diamond drops with a satisfying *thunk* and the screen shows "SUBMITTED — RESULTS IN [time remaining]" with a small animation of the diamond embedding itself in a timeline.

### Phase 4: The Reveal

After the 24-hour window closes, all participants see the results simultaneously. This is the climax of the format — the moment where individual guesses become a collective artifact.

**The reveal sequence (timed, 60 seconds total):**

**0-10 seconds: "The Scatter"**
The full tick timeline appears, empty. Then, one by one, participant markers rain down from the top of the screen, each a small gold diamond that lands on its submitted tick position with a soft *tink* sound. They arrive in random order over 10 seconds. The timeline quickly accumulates a scatter plot of guesses. Some ticks have dense clusters; others are empty. The total participant count fades in at the top: "247 diagnosticians submitted."

**What it looks like:** Gold diamonds falling like coins into a slot machine, landing on a horizontal timeline. Each diamond is slightly transparent so overlapping diamonds create brighter clusters. The sound is a gentle metallic rain — *tink tink tink tink* — accelerating and decelerating as clusters form. The screen is dark except for the timeline and the falling diamonds.

**10-20 seconds: "The Clusters"**
The scattered diamonds rearrange into a proper **histogram**. The timeline becomes the x-axis. Vertical bars rise from each tick position, their height proportional to the number of guesses at that tick. The histogram uses a warm amber gradient — taller bars glow brighter. Three or four distinct peaks are visible. Labels fade in above the tallest peaks: "Peak A: Tick 23 (41 guesses)" / "Peak B: Tick 41 (73 guesses)" / "Peak C: Tick 52 (62 guesses)."

**What it feels like:** The scattered rain of individual diamonds *organizes itself* into collective intelligence. The moment the clusters become visible is a revelation — "I wasn't alone in noticing tick 41!" or "Wait, 41 people thought it was tick 23? What did they see that I missed?"

**20-30 seconds: "The Diamond Drops"**
The real EDT gold diamond — larger, brighter, with a subtle pulse — descends from the top of the screen, falling in slow motion through the histogram. It trails a golden particle wake. The kulintang gong sounds a low, resonant tone. The diamond lands on the true pivot tick. If it lands on one of the histogram peaks, that peak flashes green and the crowd that guessed it shimmers. If it lands between peaks, the nearest peaks flush amber (close but wrong) and distant peaks flush dim red.

**What it sounds like:** The gong reverberates. A 2-second silence. Then either a triumphant rising fifth (the diamond landed on a peak — the community was right) or a surprised descending minor second (the diamond landed where almost nobody guessed — the community was fooled).

**30-45 seconds: "The Accuracy Ring"**
A circular accuracy visualization appears. The participant's own guess is highlighted — a personalized ring showing:
- **Exact match (0 ticks off):** A gold ring with particle burst. "PERFECT DIAGNOSTIC." Extremely rare.
- **Close (±1-3 ticks):** A green ring. "NEAR PIVOT: 2 ticks off."
- **Vicinity (±4-8 ticks):** An amber ring. "WARM: 6 ticks off."
- **Distant (±9+ ticks):** A red ring with the distance shown. "COLD: 23 ticks off."

Below the ring, the participant's percentile: "Better than 83% of diagnosticians."

**45-60 seconds: "The Annotations"**
The top-3 closest guesses' annotations are displayed, attributed to their authors (Gauntlet rank badge + username). These are the best diagnostic narratives — the community's most accurate readers explaining what they saw. A "Show All Annotations" button reveals the full set, filterable by accuracy band.

---

## Six Format Variations

### Variation A: "The Daily Diagnostic" (Wordle Model)

**How it works:** One match per day. 24-hour window. Everyone gets the same match. Results at midnight UTC. No entry fee, no stakes, pure communal ritual.

**What the daily notification looks like:**
A push notification at 8:00 AM local time: "Today's Pivot: Diamond vs. Platinum, Jungle (Palawan), 67 ticks. Blue wins." The notification thumbnail shows a miniaturized final board state — just recognizable enough to provoke curiosity. Tapping opens the sealed watch.

**Strengths:**
- Maximum community cohesion. "Did you do today's pivot?" becomes a social greeting.
- Low barrier. Takes 5-10 minutes. Can be done on a bus.
- Daily practice builds diagnostic intuition over time.
- Comparable precedent: Wordle's cultural penetration proved daily puzzles can sustain engagement for years.

**Weaknesses:**
- Match selection quality varies. Some days produce boring pivots (obvious EDT, no false pivots).
- Timezone equity problem: midnight UTC reset favors some regions. Players in UTC+8 (Philippines — the game's setting) get fresh puzzles at 8 AM; players in UTC-8 (US West Coast) get them at 4 PM.
- Staleness risk after months. The diagnostic skill doesn't have infinite ceiling — participants plateau.

**The TikTok clip:**
Split screen: left side shows the scatter of 10,000 diamonds falling into the daily histogram. Right side shows the diamond dropping — and it lands BETWEEN all the peaks. The community was completely fooled. The descending minor second sounds. Caption: "Nobody saw it. 🎯 0.3% accuracy today."

### Variation B: "The Weekly Gauntlet" (Tournament Model)

**How it works:** One match per week, but with a curated match selected for maximum diagnostic difficulty (highest false-pivot gap, most deceptive sealed watch). Entry requires spending Gauntlet rating points (e.g., 10 points). Prizes: top 10% get rating points back doubled. Top 1% get an exclusive diagnostic badge. Worst guess gets a humorous "Completely Fooled" badge (opt-in).

**The stakes screen:**
When entering, the participant sees: "Entry: 10 Rating Points. Prize pool: 500 points distributed to top 10% by accuracy. Current entrants: 1,247." Below, a risk/reward thermometer: green (guaranteed loss of 10 points) at the bottom, amber (break-even) in the middle, gold (profit) at the top. The participant's historical accuracy percentile is shown: "Your average: ±4.3 ticks (top 22%)."

**Strengths:**
- Real stakes create real engagement. Rating points on the line makes the diagnostic *matter*.
- Weekly cadence allows for higher-quality match curation.
- The "Completely Fooled" badge creates a fun social dynamic — wearing it is a badge of humility.

**Weaknesses:**
- Entry fee discourages casual participation. The format becomes elite-only.
- Rating point integration creates balance concerns (diagnostic skill subsidizing combat rating).
- One match per week may not sustain enough content for daily players.

### Variation C: "The Viewing Party" (Synchronous Social Model)

**How it works:** A scheduled live event (weekly, Friday evening). All participants watch the sealed replay simultaneously — no rewinding, no replaying, single viewing at 1x speed. Submissions due within 60 seconds of the match ending. Then the reveal plays for everyone at once.

**The lobby screen:**
A virtual "theater" lobby. Avatars of participants arranged in rows facing a large central screen. Chat bubbles appear as participants discuss. A countdown clock: "SHOWTIME in 3:24." The theater darkens as the countdown nears zero. A hush falls — chat becomes read-only during the viewing.

**What the synchronized viewing feels like:**
The match plays. In the lower third of the screen, a real-time "pulse" shows anonymous community emotional state — a waveform that rises when many participants click a "tense moment" button and falls during lulls. This aggregated pulse is visible to all viewers but reveals no individual guesses. After the match ends, the 60-second submission window opens: frantic typing of tick numbers, the character pressing that LOCK IN button with the hold-to-confirm.

**The reveal plays live.** The diamond scatter happens on the big screen. The peaks form. The EDT drops. Cheers in chat. Groans. The top diagnostic annotation appears on the big screen — the author's username spotlighted.

**Strengths:**
- Creates a genuine *event*. The synchronous experience is irreproducible in async.
- The single-viewing constraint is a dramatically higher skill ceiling — no replaying to catch subtle signals.
- The real-time pulse adds a social signal layer (you can feel when the crowd is uncertain).
- Comparable: GeoGuessr's live Twitch tournaments drew 300,000 viewers with similar "everyone guesses the same thing" dynamics.

**Weaknesses:**
- Timezone exclusion. A fixed weekly time excludes global participants.
- Single viewing is very hard. Beginners will guess randomly, creating noise in the histogram.
- Requires dedicated infrastructure (synchronized viewing, anti-cheat against screen recording + replay).

### Variation D: "The Blind Diagnostic" (No-Outcome Model)

**How it works:** Participants watch the sealed replay but are NOT told the match outcome. They don't know who wins. They must identify both the EDT AND predict the winner.

**What the match card shows:**
"FIND THE PIVOT — Blind Round. Diamond vs. Platinum. Jungle (Palawan). 87 ticks. Outcome: CLASSIFIED." The card's border is steel-grey instead of gold — the classification is visually prominent.

**The submission screen adds a second field:**
- "Your pivot: Tick ___"
- "Who wins? [Blue] / [Red]"
- Confidence on each (separate sliders)

**The reveal has an extra beat:**
Before the diamond drops, the winner is revealed. A brief flash of the final board state — base destroyed, surviving units. Then a split: "67% predicted Blue wins. 33% predicted Red wins." THEN the diamond drops. The intersection of "called the winner correctly AND identified the pivot" is a tiny elite group.

**Strengths:**
- The hardest variant. Removes the anchoring bias of known outcomes — participants can't reason backward from "Blue won, so the pivot must be when Blue gained advantage."
- The outcome prediction adds a second diagnostic dimension, creating a 2D accuracy space.
- Reveals who actually reads the sealed watch vs. who reverse-engineers from the outcome.

**Weaknesses:**
- Extremely difficult. Most participants will get both wrong. Frustration risk.
- The "who wins" question is often obvious from the sealed watch anyway (base health is visible). Needs careful match selection where the outcome is genuinely ambiguous from the sealed view.

### Variation E: "The Annotated Replay" (Community Teaching Model)

**How it works:** Same as the daily format, but after the reveal, the featured match's full inspector view is unlocked for all participants. Anyone can annotate specific ticks with commentary and publish their annotations. The community votes on the best analytical annotations. Top annotators build a "diagnostic authority" reputation.

**The post-reveal annotation interface:**
The inspector view with the standard timeline scrubber, but with an additional layer: small speech-bubble icons at ticks where other participants have left annotations. Clicking a bubble shows their commentary. A "Write Annotation" button at each tick opens a 280-character field. Published annotations show the author's pivot accuracy badge from this round ("wrote this annotation after guessing Tick 41 — 0 ticks off" vs. "wrote this annotation after guessing Tick 72 — 31 ticks off").

**The credibility loop:**
Annotations from participants who guessed accurately carry more weight. A "Sort by author accuracy" toggle puts near-pivot annotators' insights first. This creates a natural hierarchy: the people who read the battle best get to *explain* it to everyone else.

**Strengths:**
- Turns every round into a community learning artifact.
- Creates a merit-based authority structure — the best diagnosticians teach the rest.
- The annotation accuracy badge prevents armchair quarterbacking ("you wrote a confident explanation but guessed 30 ticks off").
- Builds a library of annotated matches over time — the game's equivalent of annotated chess game collections.

**Weaknesses:**
- Annotation quality varies. Most annotations will be low-quality ("lol got fooled here").
- Moderation burden for a user-generated content system.
- The accuracy-gated authority can feel exclusionary ("I had a great insight but guessed badly so nobody reads my annotation").

### Variation F: "The Pivot Chain" (Multi-Match Progressive Model)

**How it works:** Instead of a single match, participants are given a **series of 5 matches** from the same two players across a Gauntlet set. They must identify the pivot in each match AND identify which match was the **set pivot** — the match where the series outcome was determined.

**The selection screen:**
Five match cards in a horizontal row, labeled "Game 1" through "Game 5." Each card shows the board final state and outcome. Below the row, a prompt: "Mark the pivot tick in each game. Then mark the SET PIVOT — the game that decided the series."

**The reveal has two stages:**
1. Individual match EDT reveals (five diamonds drop, one per match)
2. The series-level pivot reveal — which game's EDT was the true inflection point for the entire set

**Strengths:**
- Tests multi-scale diagnostic ability (tactical pivot per match + strategic pivot per set).
- Creates richer analytical discussion ("Game 3's pivot didn't matter because the config weakness persisted into Game 4").
- Naturally ties into config necropsy culture — the series format invites "how did the config evolve between games?"

**Weaknesses:**
- Time commitment. Watching 5 sealed replays is 15-30 minutes minimum.
- Complexity may deter casual participants.
- "Set pivot" is a more subjective judgment than individual match EDT.

---

## The Metagame of Collective Diagnostic Calibration

The most interesting emergent property of find-the-pivot is the **histogram itself as a diagnostic artifact.** Over time, the community develops shared biases — "false pivot clustering" — where certain types of events consistently attract guesses even when they aren't the true EDT.

### Common False Pivot Attractors

1. **The First Kill.** When the first unit dies in a match, a large cluster of guesses forms there. The death is dramatic and visible. But in a game about information architecture, the first kill is often a *consequence* of the true pivot (which happened 5-15 ticks earlier when a signal chain failed silently).

2. **The Big Combat Tick.** When multiple units die simultaneously, the visual spectacle attracts guesses. But simultaneous deaths usually mean the losing side's information architecture collapsed many ticks ago.

3. **The Visible Overload.** When a unit's context bar goes red and it visibly stunts, participants anchor there. But the overload might be recoverable — the true pivot might be earlier (the signal flood that caused the overload) or later (the unit that failed to compensate).

4. **The Last Reversal.** In matches with many false pivots, participants tend to anchor on the *most recent* apparent advantage flip, suffering from recency bias. The true EDT might be earlier — the first flip from which the losing side never actually recovered, despite appearing to.

### The Calibration Loop

Over many rounds, individual participants develop awareness of their own biases. The accuracy percentile tracker forces introspection:
- "I keep guessing combat moments. My accuracy is ±12 ticks. The community median is ±7. I'm reading the spectacle, not the system."
- "I'm consistently early — I guess tick 30 when the EDT is tick 45. I'm seeing *causes* before their *effects fully resolve.*"
- "I'm always near the biggest cluster but the biggest cluster is usually wrong. I'm following the crowd."

This self-awareness IS the skill that transfers to real engineering diagnostics. The ability to distinguish "when the symptom appeared" from "when the root cause occurred" is the core skill of incident response. Find-the-pivot is training for postmortem accuracy.

### Community Bias Maps

After 50+ rounds, the aggregate data across all rounds reveals community-wide patterns:
- A heatmap of "where guesses concentrate relative to the true EDT" — shifted left (the community tends to guess early) or right (the community tends to guess late)?
- Accuracy by player tier — do higher-ranked players diagnose better? (They should, but the correlation might be weaker than expected if diagnostic skill and design skill are partially independent.)
- Accuracy by match type — are jungle maps harder to diagnose than city maps? Do relay-heavy configs create harder pivots? Does high EM activity make the sealed watch more or less readable?

This meta-data is itself a community artifact — publishable on the game's community dashboard as "The Community Diagnostic Report."

---

## Interaction Effects

### × Sealed Watch Design (Locked)
Find-the-pivot validates the sealed watch's core design. If the sealed watch were pausable or had inspector tools, the format wouldn't work — the diagnostic challenge would be trivial. The format REQUIRES the sealed watch to be a performance, not a diagram. It retroactively justifies every "no skip, no pause, no tools" constraint.

### × Inspector Design (Locked)
The inspector's full reveal after submission creates the emotional payoff. The participant watches the sealed version, forms a theory, submits, then opens the inspector to see whether their theory was right. The two-act structure (sealed → inspector) is reinforced by the three-act tournament structure (watch → submit → reveal).

### × Config Necropsy Culture (7.10)
Find-the-pivot generates natural content for config necropsies. After a round, the high-accuracy annotators produce write-ups that analyze the featured match's information architecture. These become the community's most-read analytical content — authoritative because the authors proved their diagnostic ability first.

### × Annotation Accuracy Leaderboard (7.14)
The per-round accuracy scores feed a persistent leaderboard. Over time, the top diagnosticians become community authorities — their config reviews carry weight because they've proven they can *read* battles accurately. This creates a social hierarchy based on analytical skill separate from competitive ranking.

### × Histogram as Social Loop (7.06)
The pivot histogram IS a Zachtronics-style distribution — but for diagnostic accuracy instead of optimization efficiency. "Where do you fall on the distribution?" is the same social question, applied to a different skill axis.

### × False Pivot Gap (4.26)
Match selection for the tournament should prioritize high FPG matches — these create the best diagnostic challenges because the sealed watch is maximally misleading. Low FPG matches (where the true pivot is also the most dramatic moment) are boring for the format.

### × Effective Determination Timestamp (4.18)
The EDT must be well-defined for the format to work. If the EDT is ambiguous (multiple possible "decision points"), the histogram will be legitimately multimodal and the "correct answer" will feel arbitrary. Match selection must filter for clean EDTs.

### × Counterfactual Simulation (4.20)
After the reveal, participants could access the counterfactual simulator at the true EDT — "what if the relay hadn't been overloaded at tick 41?" — to verify that the EDT was indeed determinative. This adds a verification step that deepens understanding.

### × Emissions Model (Locked)
EM noise is visible in the sealed watch as signal chain lines. Experienced diagnosticians learn to read EM patterns as early warning signs — a sudden increase in signal traffic at tick 38 might precede the visible overload at tick 41. This makes EM literacy a diagnostic advantage in the tournament.

### × Mobile/Touch Platform
The sealed watch replay works well on mobile. The MARK PIVOT button can be a simple tap target. The histogram reveal is inherently visual and works at any screen size. The daily format is particularly mobile-friendly — a 5-minute bus-ride activity.

---

## Player Journeys

### Journey: Reyna, 28, Backend Engineer, Manila

**Context:** Reyna is a Diamond-tier Gauntlet player who's been playing for 2 months. She subscribes to the daily pivot and has a current streak of 14 days. Her running accuracy average is ±4.1 ticks (top 18% of daily participants). She's at her desk eating lunch, phone propped against her monitor.

**Minute 0:00 — The Notification**
Reyna's phone buzzes at 12:03 PM. "Today's Pivot: Diamond vs. Platinum, Cebu (Urban), 74 ticks. Red wins." She opens the app. The match card fills her screen — the final board shows Red's striker adjacent to Blue's destroyed base, three Blue units still alive but irrelevant. The gold border pulses. She taps ENTER.

**Minute 0:15 — First Viewing**
The sealed watch plays. Reyna watches the opening ticks — Blue deploys two scouts and a relay, Red deploys a scout and a striker. Standard openings. She notes the tick clock mentally: "Blue scout spots Red striker at tick 8, sends signal through relay at tick 9, relay compresses and forwards at tick 11..." She's counting signal hops automatically now, after 14 days of practice. At tick 31, Blue's relay's context bar flickers amber for one tick. She notices but doesn't mark yet. At tick 44, Red's striker reaches Blue's base. Match ends at tick 74 when Red's second striker breaches.

**Minute 1:30 — Second Viewing, Slower**
Reyna replays at 0.5x. This time she's focused on context bars, not combat. She sees: Blue's relay bar is steady green through tick 28. At tick 29, Red's scout enters Blue's perception range — the relay starts receiving new observations. At tick 30, a second Red unit appears — the relay is now receiving two streams. Tick 31: the amber flash. Tick 32: green again. "The relay handled it," she thinks. But then at tick 37, the relay's bar jumps to solid amber and stays. "That's the real pressure. What happened at 37?"

**Minute 3:00 — Third Viewing, Hypothesis Forming**
She watches tick 35-40 at 0.5x three times. At tick 36, she sees a faint signal chain line from Red's relay to... nothing visible. A signal sent to an empty channel? Or a signal sent to a unit she can't see? At tick 37, Blue's relay receives a burst — multiple signal lines arriving simultaneously. "Red is flooding the relay. That's not natural observation traffic — that's deliberate noise injection." She drops her gold diamond at tick 37.

**Minute 4:00 — Doubt and Refinement**
But wait — was tick 37 the cause or the symptom? She replays from tick 30. The Red scout that appeared at tick 30 isn't just scouting — it's positioning to broadcast. Its context bar pulses at tick 35 (it received orders?) and at tick 36 it starts transmitting on multiple channels. The flood at tick 37 is the *result* of Red's scout repositioning at tick 30. But tick 30 is when the scout *arrived* — the decision to send it there was made during planning, not during execution. So the EDT isn't about Red's decision — it's about Blue's inability to handle it. She moves her marker to tick 37 and keeps it. The relay's failure to handle the noise is the moment Blue's information architecture broke.

**Minute 5:00 — Submission**
Reyna taps SUBMIT. "Your pivot: Tick 37." Confidence: 4/5 (she's not 100% sure it isn't tick 31 when the relay first showed stress). Annotation: "Red scout noise flood hits Blue relay at T37 — context bar goes solid amber and never recovers. Blue's remaining ticks are information-blind. The striker breach at T44 was inevitable from T37." She holds LOCK IN for one second. The diamond drops with a *thunk*. "SUBMITTED — RESULTS IN 11:42:33."

**Minute 5:30 — Back to Lunch**
Reyna puts her phone down and finishes her rice. She thinks about her own relay configs — does she have noise-filtering hooks? She makes a mental note to check tonight.

**That Evening — The Reveal**
Reyna opens the app at 12:01 AM. The reveal sequence plays. Diamonds rain down — 312 participants today. She watches the clusters form: Peak A at tick 31 (44 guesses — the first amber flash), Peak B at tick 37 (89 guesses — her pick), Peak C at tick 44 (71 guesses — the visible striker breach). The EDT diamond drops. It lands on tick 35. Tick 35! Two ticks before her guess. She's ±2 — green ring. "NEAR PIVOT: 2 ticks off. Better than 91% of diagnosticians."

She reads the top annotation from a Grandmaster-tier player who guessed tick 35 exactly: "Red scout begins noise broadcast at T35, visible from the channel activation pattern. The flood arriving at T37 was already in transit. T35 is when the weapon fired, T37 is when the bullet hit."

Reyna nods. She was reading the impact, not the trigger. She opens the inspector for the first time — and there it is. At tick 35, Red's scout's hook fires on the `noise-flood` channel. The decision trace confirms: the scout's Rule #1 matched because it detected Blue's relay position. The signal traveled 2 hops (scout → Red relay → broadcast), arriving at Blue's relay at tick 37. She was looking at tick 37 — the arrival — when the EDT was tick 35 — the departure.

"I need to learn to read the shooter, not the wound," she types in her notebook.

---

### Journey: Kwame, 30, ML Engineer, Accra, First-Time Participant

**Context:** Kwame has been playing the campaign for a week. He just finished Mission 6 (factory introduction). He hasn't touched Gauntlet yet. He sees the "Find the Pivot" card in the community hub and clicks it out of curiosity.

**Minute 0:00 — Entering**
The match card says "Diamond vs. Platinum" — tiers Kwame hasn't reached. He doesn't know what Diamond-tier play looks like. He taps ENTER anyway. The sealed watch begins.

**Minute 0:30 — Overwhelm**
The match is dramatically more complex than his Mission 6 experience. Both sides deploy 8+ units. Signal chain lines criss-cross the board like a fiber optic network diagram. Multiple combat events happen simultaneously. Context bars fluctuate rapidly. Kwame can't track everything. He doesn't know what half the skill animations mean (he hasn't unlocked hack or extract yet).

**Minute 1:30 — Pattern Recognition**
On his second viewing, Kwame stops trying to track individual units and looks at the gestalt. He notices a rhythm: Red's side of the board has lots of signal activity early, Blue's side is quieter. Then around tick 40, Blue's signal activity surges — lots of communication suddenly. At tick 55, Red's signal activity drops off sharply. Blue attacks in force at tick 60.

Kwame can't read the specifics, but he can read the *shape*. "Blue was quiet because they were setting up. Red was active because they were probing. Blue's surge at tick 40 is when their system came online. Red's silence at 55 is when they were outmaneuvered." He drops his marker at tick 40.

**Minute 3:00 — Submission**
Confidence: 2/5. Annotation: "Blue's signal activity surges at T40 — their communication network activates. I think this is when Blue takes information control. I'm new so this is a gut read." LOCK IN.

**That Evening — The Reveal**
The EDT lands on tick 38. Kwame is ±2 — green ring! "NEAR PIVOT: 2 ticks off. Better than 87% of diagnosticians." He blinks. Better than 87%?

He reads the Grandmaster's annotation: "Blue command agent reroutes at T38 — subordinates switch from passive observation to active coordination. The signal surge visible at T40 is the downstream effect." Kwame didn't know what a command agent reroute looked like, but he could read its *effect* on the board's signal pattern. His gut read was nearly as good as the Grandmaster's precise diagnosis.

He opens the inspector. For the first time, he sees a command agent's decision trace — the reroute skill triggering at tick 38, the cascading signal pattern that results. He's seeing high-level play from the inside. "This is how the game looks at Diamond?" He goes back to Mission 7 with new ambition.

**The teaching moment:**
Kwame learned more about high-level play from one find-the-pivot round than from any tutorial or documentation. He saw what matters (signal patterns, command agent timing) and what doesn't (individual combat events). The format is a telescope — it lets lower-level players see what the game becomes.

---

### Journey: Aya, 45, Twitch Streamer, Tokyo, 2,400 Viewers Live

**Context:** Aya streams Robot Uprising every Tuesday and Thursday. She has 2,400 concurrent viewers tonight. She's been building a community around the "Pivot Prediction" format — every stream, she plays the daily pivot live with her chat.

**Minute 0:00 — Setting Up**
"Okay chat, it's PIVOT TIME." Aya opens the daily pivot on her main screen. She splits her stream layout: game on the left (70%), chat on the right (30%). She's added a custom OBS overlay: a row of five colored circles at the bottom of the screen showing chat's aggregate guess distribution in real time (via a custom extension her mod built). "Today's match: Platinum vs. Diamond, Bohol (Hills), 91 ticks. Red wins. Let's go."

**Minute 0:15 — First Viewing with Commentary**
Aya watches the sealed replay, narrating. "Okay, Blue opens scout-relay, standard... Red goes double scout? Aggressive information play. Watch the contact timing..." She's teaching her audience to read the sealed watch in real-time. Chat is flying: "T12 FIRST CONTACT" "watch the relay" "Red scout flanking South" "COMBAT T34."

**Minute 2:00 — Chat Predictions**
After the first viewing, Aya opens a Twitch prediction: "What tick is the pivot? A: Before T30 / B: T30-50 / C: T51-70 / D: After T70." Channel points on the line. 1,800 viewers vote. The split: A: 12%, B: 41%, C: 34%, D: 13%. "Chat thinks it's mid-match. Let's watch again."

**Minute 3:00 — Second Viewing, Focused**
Aya replays at 0.5x. "Watch the context bars, chat. Blue's relay at C4 — see that? Amber at T28. That's stress. But it recovers at T30." She's pointing at the screen with her cursor, circling context bars. "Now T41 — Red scout sends signal, see the chain line? One, two, three hops. That's a deep architecture. Expensive but FAST information delivery."

Chat explodes: "T41 PIVOT" "no its T28" "THE RELAY THE RELAY" "Aya look at B2 context bar T45."

**Minute 4:00 — Aya's Guess**
"Okay. My read. The relay stress at T28 is a false pivot — it recovers. The combat at T34 is spectacle, not cause. I'm looking at T41 — Red's deep signal chain. That's when Red's architecture outperforms Blue's. Everything after is Red exploiting information advantage." She drops her marker at T41. "Chat, what's your guess? Type your tick in chat."

Her mod bot captures tick numbers from chat. The OBS overlay updates: a mini-histogram of chat's guesses. Two peaks: T28 (relay stress) and T41 (Aya's pick, now amplified by anchor bias from her commentary). A smaller peak at T34 (combat).

**Minute 5:00 — Submission**
Aya submits. "Tick 41. Confidence 4. Annotation: 'Red's three-hop signal architecture goes live at T41 — Blue's two-hop setup can't compete on information speed.'" LOCK IN. "Now we wait for midnight. Chat, I'll do the reveal on Thursday's stream."

**Thursday Evening — The Live Reveal**
Aya opens the reveal. Her OBS overlay shows both her stream's chat histogram and the global histogram side by side. "2,847 players today, chat. Let's see if we were right."

The diamonds rain down. Three peaks form: T28 (small — the relay stress false pivot), T38 (medium — a peak Aya didn't expect), T41 (the largest peak — her broadcast influence is visible in the global histogram). The EDT drops: T39. It lands between T38 and T41. Aya is ±2. Green ring.

"CLOSE! T39. Let me read the top annotation... 'Red specialist deploys hack at T39, disrupting Blue relay's compress skill. The relay loses its primary defense against noise. Everything Blue built assumes compress is working.' Oh! I was looking at the signal chain going live, but the pivot was the hack that BROKE Blue's defense. The signal chain was already running from T41 — but the hack at T39 created the opening."

Chat: "HACK > SIGNALS" "blue relay had no backup" "Aya was close tho" "±2 QUEEN" "that hack animation is SO subtle I missed it every time."

"Chat, this is why we do pivots. I've been playing for 6 months and I still learn something every round. The hack animation is tiny — it's a little purple pulse on the target unit. I need to start watching for those."

**The content creation loop:**
Aya's pivot streams are her highest-engagement content. The format is inherently watchable — it's a live prediction game with a dramatic reveal. Her viewers participate directly (Twitch predictions, chat guesses). The reveal creates a climactic moment every stream. And the analytical discussion afterward provides educational content that makes her channel a learning resource.

---

### Journey: Diego, 17, High School Student, Cebu City, Mobile Player

**Context:** Diego plays Robot Uprising exclusively on his phone during jeepney rides to school. He's on Mission 8 in the campaign. He's never entered a tournament, but the daily pivot notification caught his eye.

**Minute 0:00 — The Jeepney**
Diego is on the 04L jeepney from Lahug to school. He has about 12 minutes. He opens the daily pivot notification. The match card loads quickly — it's just a static image and text. He taps ENTER.

**Minute 0:15 — Watching on a Bouncing Screen**
The sealed watch plays on his phone's 6.1-inch screen. The jeepney hits a pothole and Diego's thumb accidentally taps the 2x speed button. He watches the rest at double speed. It's fast but readable — the tick-based design (snap positions, no animation between ticks) means even at 2x, every board state is a clear static image for 0.5 seconds.

He sees: compact opening, both sides deploy quickly. Combat starts at tick 20 (early for a 65-tick match). Multiple engagements. Red's units seem to coordinate better — their signal chains fire in visible sequences while Blue's are sporadic. At tick 38, three Blue units die in two consecutive ticks. Match ends at tick 65, Red wins.

**Minute 1:30 — One Replay**
He replays once more, this time at 1x. He focuses on Blue's relay — it's positioned at the center of the board but its context bar is GREEN the entire time. It never overloads. "Wait, the relay is fine. So why did Blue lose?" He looks at the signal chain lines. Blue's relay IS compressing and forwarding signals. But the signals are going to... units that are already dead. The relay is sending information to ghosts. Blue's units died but the relay doesn't know — it's still broadcasting to their last known positions.

He drops his marker at tick 26 — the tick where Blue's forward scout was destroyed, severing the relay's only source of fresh intelligence. Everything the relay sent after tick 26 was based on stale data.

**Minute 3:00 — Quick Submission**
"Tick 26. Confidence 3. 'Blue scout dies at T26 — relay keeps broadcasting stale intel to dead units. Blue was blind from T26 on.'" LOCK IN. The jeepney reaches his stop. He hops off.

**After School — The Reveal**
Diego checks during lunch break. EDT: tick 24. He's ±2. The Grandmaster annotation: "Red specialist hack disables Blue scout's perception at T24. The scout can still move but can't see — it walks into an ambush at T26. The scout's death is the symptom; the hack at T24 is the cause."

Diego didn't know about the hack — he hasn't unlocked specialists yet. But he was only 2 ticks off because he correctly identified the information breakdown, even if he missed the root cause. He screenshots his green ring and sends it to his class group chat: "±2 on today's pivot 🎯"

---

### Journey: Prof. Santos, 58, Computer Science Professor, UP Diliman, Using the Format for Teaching

**Context:** Prof. Santos teaches "Distributed Systems" to 3rd-year CS students at the University of the Philippines. She uses Robot Uprising as a teaching tool (via the Lab Sandbox). She's adapted the find-the-pivot format for her class — each week, she selects a match that demonstrates a distributed systems concept and has her students submit pivots with analytical annotations.

**Minute 0:00 — Setting Up the Assignment**
Prof. Santos selects a match where Blue's multi-relay chain fails due to a partition — Red's specialist hacks the middle relay, splitting Blue's network into two disconnected halves. She posts the match on the class LMS: "Week 7 Assignment: Identify the pivot tick. Your annotation must reference at least one distributed systems concept from this week's lecture (consensus, partition tolerance, CAP theorem). Due Friday."

**Tuesday, Student Viewing**
Maria, a student, watches the sealed replay on her laptop. She sees Blue's relay chain working beautifully for 30 ticks — signals flowing smoothly from scouts through relays to strikers. At tick 31, something changes — the middle relay stops forwarding. Blue's east-side units continue receiving signals; Blue's west-side units go silent. "That's a network partition," Maria mutters. She places her marker at tick 31.

But then she replays. At tick 29, she notices Red's specialist moving toward the middle relay. At tick 30, a purple pulse on the relay — the hack. At tick 31, the relay's behavior changes. "The hack at T30 caused the partition at T31. The pivot is T30."

She submits: "Tick 30. Red specialist hacks Blue relay at T30, creating a network partition. Blue's west-side agents lose contact with east-side scouts. This violates Blue's implicit assumption of a connected graph — their rules assume all signals reach all units. The partition exposes a lack of partition tolerance (CAP theorem). Blue chose consistency + availability (all units get the same data and respond immediately) but couldn't survive a partition."

**Friday — Class Discussion**
Prof. Santos reveals the EDT: tick 30. She shows the class histogram — most students clustered at T30-T31 (good — they identified the partition). A few outliers at T38 (when Blue's west-side striker walked into an ambush — a downstream consequence). She uses the histogram to discuss: "Those of you who guessed T38 — you identified a *failure* but not the *cause of the failure*. In incident response, this distinction is everything. The outage symptom is at T38. The root cause is at T30. If you fix the symptom (send the striker somewhere else), the partition still exists and something else will fail."

She pulls up the top student annotations and discusses them. "Maria's annotation is excellent — she explicitly connects the hack to a CAP theorem violation. Blue's architecture assumed a fully-connected network, which is exactly the mistake that takes down distributed systems in production."

**The pedagogical loop:**
Find-the-pivot becomes a weekly lab exercise. Students compete for accuracy and annotation quality. Over the semester, their diagnostic vocabulary grows from "something broke" to precise distributed systems terminology. The game's vocabulary (context window, hooks, channels) maps directly to the course's vocabulary (buffers, pub/sub, message queues). Prof. Santos publishes a paper: "Using Adversarial Game Replay Analysis to Teach Distributed Systems Diagnostics."

---

## Sensory Design Summary

| Element | Visual | Audio | Feel |
|---------|--------|-------|------|
| Match card | Gold-bordered, final board state, countdown timer | Subtle ticking when countdown < 1hr | Urgency builds |
| MARK PIVOT button | Gold diamond, slight pulse | Crystalline descending-fifth ping on place | Weighty, deliberate |
| LOCK IN hold | Progress ring fills gold over 1 second | Building harmonic tone that resolves on release | Commitment, irreversibility |
| Diamond scatter | Gold coins raining onto timeline, transparent overlap = brightness | Metallic rain: *tink tink tink* | Collective revelation |
| Histogram formation | Diamonds rearrange into bars, amber gradient | Rising hum as bars grow | Order from chaos |
| EDT diamond drop | Large gold diamond, slow descent, particle wake | Kulintang gong, low resonance | The answer |
| Accuracy ring | Gold/green/amber/red concentric ring around player's guess | Rising fifth (close) or descending second (far) | Personal reckoning |
| Top annotation | Terminal-green text, author's accuracy badge | Typewriter click on reveal | Authority earned |

---

## Comparable Games and Formats

| Format | Medium | Similarity | Key Lesson |
|--------|--------|-----------|------------|
| Chess.com Puzzles Championship | Online async | Timed analytical challenge, community competition | Puzzle format sustains engagement for years; speed+accuracy creates skill ceiling |
| World Chess Solving Championship | In-person | Pure analytical competition (no playing, only reading) | Analysis-only competition attracts a distinct audience from players |
| GeoGuessr Daily Challenge | Mobile async | One shared challenge per day, results after deadline | Daily cadence + shared experience = viral social loop |
| GeoGuessr Twitch Tournaments | Live stream | Synchronized viewing + prediction, 300K viewers | Spectator participation in guessing creates peak engagement |
| Wordle | Mobile daily | Shared daily puzzle, emoji result sharing, no replays | Cultural penetration through simplicity + shareability |
| Fantasy Sports | Prediction market | Accuracy tracked over time, seasonal rankings | Long-term accuracy tracking creates persistent engagement |
| Film analysis tournaments (CinéClub) | Niche academic | "What is the turning point of this film?" as analytical exercise | The "pivot" concept exists across narrative media |
| Medical case conferences | Professional | "When did the patient's condition become critical?" — diagnostic accuracy as professional skill | Diagnostic accuracy as a trainable, measurable skill |

---

## New Aspects Discovered

1. **7.13a — Anti-spoiler infrastructure for find-the-pivot matches:** How to prevent participants from accessing the inspector view before submitting; anti-cheat for screen-recording and replay tools; match encryption and reveal key distribution; preventing Twitch streamers from revealing answers before the deadline.

2. **7.13b — Pivot accuracy as a matchmaking signal:** Should pivot accuracy correlate with Gauntlet matchmaking? If a player is an excellent diagnostician but mediocre designer, does that indicate they need different opponents? Diagnostic skill vs. creative skill as orthogonal axes of player ability.

3. **7.13c — The "Crowd Wisdom" metric — when the histogram peak IS the EDT:** Tracking how often the community's modal guess (largest cluster) is correct vs. wrong; "crowd wisdom accuracy" as a meta-metric; when does aggregated intuition outperform individual experts?

4. **7.13d — Find-the-pivot for campaign missions (single-player variant):** Adapting the format for solo play — after completing a mission, replay in sealed-only mode and guess the pivot before opening the inspector; self-diagnostic skill training without community; the "diagnostic journal" as a solo player's accuracy tracker.

5. **7.13e — Pivot difficulty rating for match selection:** An algorithmic difficulty score for potential tournament matches based on false-pivot count, EDT distance from nearest combat event, signal-vs-combat ratio, and relay chain depth; automated match curation for daily/weekly formats; ensuring consistent challenge quality.
