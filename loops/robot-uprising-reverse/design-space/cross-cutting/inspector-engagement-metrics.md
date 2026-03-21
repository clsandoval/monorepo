# 8.04c — Inspector Engagement Metrics

**Aspect:** Time-on-Inspector, unit clicks per debrief, scrubber positions visited as quality signals; how to detect and respond to Inspector skip behavior
**Category:** Cross-Cutting Synthesis (Wave 8)
**Related:** 4.25 (EDT Trajectory), 4.26 (False Pivot Gap), 4.47 (Autonomy Dial), 8.04 (Minimum Viable Game), 8.09 (Diagnostic Teaching Layer), 6.01a (Sealed Watch visual language), 7.10 (Necropsy Culture), 8.07 (Robustness vs. Efficiency)

---

## The Mechanic

The Inspector is the game's primary analytical tool — the surface where players transition from emotional reaction (Sealed Watch) to systematic understanding. But the Inspector only works if players actually *use* it. The question is: how does the game know whether a player engaged with the Inspector, what does it do with that knowledge, and where is the line between helpful nudging and patronizing surveillance?

### What Gets Tracked

Every debrief session generates an **Inspector Engagement Profile (IEP)** — a lightweight telemetry struct capturing five dimensions:

**1. Dwell Time ("The Clock")**
Total seconds the Inspector panel is visible and in focus. Measured from the moment the player enters Inspector phase to the moment they click "Next Mission" or return to Plan. Idle detection kicks in after 90 seconds of no input — the timer pauses, and resumes on next click or scroll. Dwell time is stored per-mission and as a 10-mission rolling average.

Thresholds:
- **Under 15 seconds**: "Ghost pass" — the player clicked through Inspector without stopping. This is the clearest skip signal.
- **15-60 seconds**: "Glance" — the player looked but did not dig. Normal for easy missions where nothing surprising happened.
- **60-180 seconds**: "Study" — typical engaged session. The player clicked units, moved the scrubber, read decision traces.
- **Over 180 seconds**: "Deep dive" — the player is doing serious analysis. Common after close losses or surprising victories.

**2. Unit Click Count ("The Autopsy Count")**
How many distinct units the player selected in the Inspector. Each unit click opens that unit's context window state, decision trace, and signal history in the sidebar. A player who clicks 0 units never opened a single autopsy. A player who clicks every unit is exhaustively reviewing.

Thresholds:
- **0 clicks**: Combined with dwell under 15s, this is definitive skip behavior.
- **1-2 clicks**: The player checked their key units (probably the one that died or the one that won).
- **3-5 clicks**: Healthy engagement. The player is comparing behaviors across their squad.
- **6+ clicks**: Deep investigation. The player is building a mental model of the whole system.

**3. Scrubber Position Set ("The Timeline Fingerprint")**
The timeline scrubber lets the player drag through every tick of the match. The game records which tick positions the player visited — not as a continuous stream, but as a set of unique positions (bucketed into 5-tick windows to avoid noise from imprecise dragging). A 60-tick match has 12 possible buckets. The coverage ratio is: positions visited / total buckets.

Thresholds:
- **0%**: Player never touched the scrubber.
- **1-25%**: Spot-checked one or two moments (probably the climax they saw in Sealed Watch).
- **25-60%**: Reasonable coverage — checked key moments and some context around them.
- **60%+**: Thorough review. The player scrubbed through most of the match.

**4. Decision Trace Opens ("The Why Count")**
Each unit's Inspector view has a "WHY" panel showing rule evaluations. The game counts how many times the player expanded a decision trace. This is the deepest engagement signal — a player reading decision traces is actively trying to understand *causal reasoning*, not just outcomes.

Thresholds:
- **0 opens**: The player didn't engage with causal analysis at all.
- **1-3 opens**: Checked a few critical moments.
- **4+ opens**: Systematic causal analysis across multiple units and ticks.

**5. Context Window Chart Interaction ("The Buffer Inspector")**
The context window chart shows buffer fill levels over time — a miniature area chart showing how full each unit's context window was at each tick. The game records whether the player hovered over this chart (triggering tooltip detail), clicked into the full buffer view, or ignored it entirely.

### The Composite Score: "Inspector Depth"

These five dimensions collapse into a single 0-100 **Inspector Depth** score using weighted sum:

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Dwell Time (normalized) | 20% | Necessary but not sufficient — you can stare without engaging |
| Unit Click Count (normalized) | 25% | Strongest correlate of actual investigation |
| Scrubber Coverage | 25% | Shows temporal exploration breadth |
| Decision Trace Opens | 20% | Deepest engagement signal |
| Buffer Chart Interaction | 10% | Advanced feature, lower weight early in campaign |

Inspector Depth is never shown to the player as a number. It is a background signal used by three systems: the Diagnostic Teaching Layer (8.09), the Autonomy Dial (4.47), and the difficulty scaler. The player sees its *effects* but never its score.

### Detecting Skip Behavior: "The Ghost Inspector" Pattern

A Ghost Inspector is a player who consistently exits Inspector with Depth under 15. The detection is not based on a single session — everyone rushes through occasionally. The game watches for a **pattern**: three consecutive missions with Depth under 15 triggers the "Ghost Inspector" flag.

What distinguishes a Ghost Inspector from a player who legitimately doesn't need Inspector:
- **Win rate**: A player winning easily might skip Inspector because they already understand. The game cross-references skip behavior with mission outcome. Skipping after a dominant win (all objectives complete, zero unit losses) is normal. Skipping after a loss or narrow win is the red flag.
- **EDT trajectory**: A player whose EDT (Expected Decision Tightness — a measure of how contested their matches are) is trending upward may be learning through Plan-phase iteration alone. The game grants more latitude if EDT is healthy.
- **Campaign position**: Early missions (1-3) have less Inspector content. Skipping Inspector on Mission 1 is much less concerning than skipping on Mission 7.

### Response Spectrum: What the Game Does

The game's responses to Ghost Inspector behavior are arranged on a gentleness gradient. No response is mandatory. The autonomy dial (4.47) controls how aggressive these nudges are — players who slide the dial toward "leave me alone" suppress all nudges except the subtlest.

**Tier 0 — Ambient Glow ("The Warm Lamp")**
*Always active. Cannot be suppressed.*
When the player enters Inspector, units that experienced "interesting" events during the match have a soft pulsing glow on the grid — a warm amber (#ffc107) ring that breathes at 0.5Hz, expanding from 90% to 110% of the unit sprite's radius. "Interesting" means: the unit made a decision that deviated from its most common action, OR the unit's context window was full for 5+ consecutive ticks, OR the unit received a signal that went unprocessed. The glow is purely visual. It says "something happened here" without saying "you should click this." It draws the eye without demanding attention.

**Tier 1 — Breadcrumb Tooltip ("The Whisper")**
*Active when Inspector Depth < 30 for 2+ consecutive missions. Suppressed at autonomy dial 4+.*
When the player hovers over the "Next Mission" button with fewer than 2 unit clicks, a small tooltip fades in (300ms ease-in, 80% opacity) below the button: a single sentence in italic DM Sans at 12px, warm grey (#9e9e9e). Examples:
- "Scout-3 made an unusual decision at tick 22."
- "Your relay dropped 4 signals this match."
- "The striker chose a different target than expected at tick 38."

The tooltip never repeats the same message twice in a row. It never says "you should look at this" — it states a fact that might spark curiosity. If the player clicks "Next Mission" anyway, the tooltip dissolves with no further protest.

**Tier 2 — Highlight Pulse ("The Spotlight")**
*Active when Ghost Inspector flag is set AND last mission was a loss. Suppressed at autonomy dial 3+.*
One unit on the grid receives a brighter highlight — a teal (#00bcd4) ring with a single sharp pulse (0 to full brightness in 200ms, then fade to gentle glow over 1 second). The unit chosen is the one with the highest "decision surprise" score — the unit whose behavior deviated most from what the player's configuration would predict under simple heuristics. A small label appears next to the unit: "?" in the same teal, 16px, for 3 seconds before fading to 8px and settling as a persistent badge.

**Tier 3 — The Debrief Prompt ("The Gentle Gate")**
*Active only when Ghost Inspector flag is set for 5+ consecutive missions AND win rate is below 40%. Suppressed at autonomy dial 2+.*
Before allowing "Next Mission," the game presents a soft interstitial: a dark overlay (rgba(0,0,0,0.6)) with a centered card (280px wide, rounded corners, dark navy background matching Inspector palette). The card shows:

- A single unit portrait (the most "interesting" unit)
- One sentence: "This match, Scout-3 ignored a threat signal 4 times. Want to see why?"
- Two buttons: "Show me" (teal, full-width) and "Skip" (text-only link, below)

Clicking "Show me" opens Inspector with that unit pre-selected and the scrubber positioned at the first relevant tick. Clicking "Skip" dismisses immediately with no judgment. The card never appears more than once every 3 missions, even if the trigger conditions persist.

**Tier 4 — The Adaptive Tutorial Moment ("The Teaching Hand")**
*Active only in the first 5 missions of a brand-new player's campaign. Never appears after Mission 5. Never suppressed by autonomy dial.*
On Mission 2's first Inspector visit, if the player has not clicked any unit after 10 seconds, a semi-transparent hand cursor animation appears — a ghostly pointer icon (#ffffff at 40% opacity) that moves from the center of the screen to the nearest unit, clicks it (triggering the sidebar to open), then fades out. This is the only moment in the game where the tutorial physically demonstrates an Inspector action. It happens exactly once, ever, per player account.

---

## Player Journeys

#### Journey: Kai, 22, Competitive FPS Player
**Context:** Kai plays Valorant and Apex Legends. He downloaded Robot Uprising because a streamer he follows played it. He's used to fast iteration — die, respawn, adjust. The idea of watching a replay and studying it feels like homework.

**Minute 0:00 — Mission 3 Sealed Watch ends.** Kai watches the final moments — his scouts got flanked, the striker never received targeting data. He already knows what went wrong: bad patrol routes. The Sealed Watch's emotional peak was seeing his relay get destroyed at tick 34. He felt the gut-punch. He wants to fix it now.

**Minute 0:05 — Inspector phase begins.** The grid appears with units in their final positions. A warm amber glow pulses gently around his destroyed relay. Kai's eyes flick to the "Next Mission" button in the bottom-right corner. His mouse moves there immediately.

**Minute 0:08 — Breadcrumb tooltip appears.** As his cursor reaches the button, a line of warm grey text materializes below it: *"Relay-1 received 0 signals after tick 18."* Kai reads it but doesn't process it as actionable. He clicks "Next Mission."

**Minute 0:10 — Plan phase.** Kai adjusts patrol routes. He moves scouts wider. He doesn't change the relay position.

**Minute 5:00 — Mission 4 Sealed Watch.** Same result. Relay gets destroyed earlier this time — tick 28. The scouts are patrolling wider but the relay is still exposed. Kai is frustrated.

**Minute 5:05 — Inspector phase.** Amber glow around two units this time: the relay and Scout-2. Kai's cursor heads for "Next Mission" again. The breadcrumb appears: *"Scout-2's context window was full from tick 12 to tick 28."* Kai pauses. Full context window? He didn't know that was possible.

**Minute 5:12 — First unit click.** Kai clicks Scout-2. The sidebar slides open from the right — dark navy panel with teal accent lines. The context window visualization shows a vertical stack of colored bars. Every slot is filled. The bottom three slots are amber (signals) that have been sitting there for 16 ticks. Kai sees the problem: the scout was holding onto old data and couldn't process new threats.

**Minute 5:30 — Second unit click.** Kai clicks the relay. Its context window is nearly empty. It received nothing because the scout was broadcasting on a channel the relay wasn't listening to. Kai notices this in the channel metrics tab — a flat sparkline on Channel B, a saturated sparkline on Channel A.

**Minute 6:00 — Plan phase.** Kai changes the relay's listen filter. He also reduces the scout's buffer age threshold. He's learning signal architecture — not because the game told him to, but because the Inspector showed him the data.

**Inspector Depth progression:** Mission 3: 8 (ghost). Mission 4: 34. Mission 5: 52. Mission 6: 61. The breadcrumb worked. One fact ("context window was full") converted a rusher into an investigator.

---

#### Journey: Priya, 31, Data Engineer
**Context:** Priya works with Apache Kafka and distributed systems daily. She picked up Robot Uprising specifically because the "design AI attention systems" pitch resonated with her work on event streaming architectures. She reads documentation for fun.

**Minute 0:00 — Mission 2 Sealed Watch ends.** Priya watches carefully, already taking mental notes. She noticed a scout hesitate at tick 19 — it stopped moving for two ticks before resuming. She wants to know why.

**Minute 0:04 — Inspector phase begins.** Priya immediately clicks the hesitant scout. The sidebar opens. She scrolls directly to tick 19 in the decision trace. The WHY panel shows: Rule "patrol_advance" matched but was preempted by Rule "evade_threat" — condition "threat_in_adjacent" evaluated TRUE based on a signal from Scout-1 received at tick 17. But there was no threat at tick 19. The signal was stale — received at tick 17 with a 3-tick TTL, still valid at 19 but the threat had moved.

**Minute 0:45 — Scrubber deep-dive.** Priya drags the scrubber from tick 15 to tick 22, watching the context window state evolve tick-by-tick. She sees the stale signal arrive at tick 17, sit in the buffer at ticks 18-19, and finally evict at tick 20 (TTL expiry). She opens the context window chart and hovers over each tick — the tooltip shows exact buffer contents.

**Minute 1:30 — Signal trace.** Priya clicks "TRACE" on the stale signal. The signal genealogy view highlights the full path: Scout-1 observed threat at tile D4 on tick 15, broadcast on Channel A, relay compressed and forwarded on tick 16, Scout-2 received on tick 17. By tick 19 the threat was at F6 — five tiles away. The signal was accurate when sent, stale when consumed. Priya recognizes this instantly: this is the distributed systems consistency problem. She's delighted.

**Minute 3:00 — Cross-unit comparison.** Priya clicks every unit in sequence, comparing their buffer states at tick 19. She builds a mental model of the entire information topology at the moment of failure. She screenshots the context window chart and posts it to the game's Discord with the caption: "Classic stale-read problem. TTL of 3 is too generous for this map size."

**Minute 4:30 — Returns to Plan.** Priya has been in Inspector for over four minutes. Her Inspector Depth score: 94. She adjusts TTL parameters and adds a freshness-weighted eviction rule. She is playing the game the way it was designed to be played.

**Inspector Depth progression:** Mission 1: 71. Mission 2: 94. Mission 3: 88. Consistently deep. The game never nudges her — no breadcrumbs, no highlights. The Warm Lamp glows gently and she clicks it before it finishes its first pulse.

---

#### Journey: Marco, 27, Indie Game Reviewer
**Context:** Marco has been playing Robot Uprising for three weeks. He's on Mission 14 of the campaign, well past the tutorial arc. He streamed the first 10 missions and got good viewer engagement from his Inspector analysis segments. But he's hit a plateau — his win rate has stabilized around 55%, his EDT trajectory has flattened, and the missions feel samey. His Inspector engagement is dropping.

**Minute 0:00 — Mission 14 Sealed Watch ends.** Another close loss. Marco watches the final push fail — his striker arrived one tick too late. He sighs. He's seen this pattern before.

**Minute 0:04 — Inspector phase.** Marco clicks his striker out of habit. Sidebar opens. Decision trace shows the striker waited for a signal that arrived late. Buffer chart shows the relay was overwhelmed at tick 40. Marco has seen this exact failure mode in Mission 11 and Mission 13. He doesn't learn anything new.

**Minute 0:25 — Quick exit.** Marco clicks "Next Mission" after 21 seconds. Inspector Depth: 22. This is his third consecutive session under 30.

**Minute 0:26 — No nudge appears.** Marco's autonomy dial is set to 3 (he adjusted it during week 2 when he found the setting). At this autonomy level, Tier 1 breadcrumbs are active but Tier 2 highlights are suppressed. The breadcrumb says: *"Command-1 rerouted signals 3 times — a new record for this config."* Marco reads it but doesn't engage. He's not skipping Inspector because he doesn't understand it — he's skipping because he thinks he already knows what went wrong.

**Minute 5:00 — Mission 15 Plan phase.** Marco makes the same relay-position adjustment he's been making for four missions. The histogram from his last win is displayed in the corner — he's optimizing for the same metric.

**Minute 10:00 — Mission 15 Sealed Watch.** Same failure pattern. Striker late. Relay overwhelmed. This time Marco actually loses a unit — his second scout goes down.

**Minute 10:04 — Inspector phase.** Amber glow on three units. The breadcrumb (now targeting a different data point because the system noticed Marco ignored relay-related breadcrumbs): *"Scout-2 used only 2 of its 4 context window slots for the entire match."* This catches Marco off guard. He clicks Scout-2.

**Minute 10:15 — The discovery.** Scout-2's context window chart shows 50% vacancy for 45 of 60 ticks. Marco has been so focused on his relay bottleneck that he never noticed his scout was *underutilizing* its buffer. The scout was configured with narrow listen filters from Mission 5 — it was only receiving threat data and ignoring terrain observations. On this larger, more complex map, terrain data is critical for pathfinding around obstacles.

**Minute 10:45 — Re-engagement cascade.** Marco opens the decision trace for Scout-2 at multiple ticks. He sees the scout making suboptimal movement choices because it lacked terrain context. He clicks the other scout — same pattern. He scrubs through the full match timeline and watches the terrain data flow: plentiful at the source, completely filtered out at the scouts.

**Minute 12:00 — Return to Plan with new understanding.** Marco widens his scout listen filters for the first time in 9 missions. Inspector Depth this session: 67 — triple his recent average. The breadcrumb about buffer underutilization broke his fixation on the relay bottleneck. He was optimizing the wrong component.

**Inspector Depth progression:** Missions 10-13: 72, 55, 38, 22 (declining). Mission 14: 22 (plateau). Mission 15: 67 (recovery). The system detected the decline, varied its breadcrumb targeting, and found the one fact that re-engaged him — not by telling him what to do, but by pointing at something he hadn't noticed.

---

## Strengths and Weaknesses

### Strengths

**The Inspector teaches itself.** By tracking engagement and responding with curiosity-sparking facts rather than instructions, the system creates a self-reinforcing loop: low engagement triggers a breadcrumb, the breadcrumb leads to a discovery, the discovery teaches the value of the Inspector, and future engagement rises organically. The game never says "use the Inspector" — it says "your relay dropped 4 signals" and lets the player's own curiosity do the work.

**Skip detection respects player agency.** The response spectrum is gentle by design. Even at maximum intervention (Tier 3), the player can dismiss with a single click and zero judgment. The system never gates progression on Inspector engagement — a player who wants to brute-force through Plan-phase iteration alone is allowed to, even if they learn slower. This respects the autonomy dial contract: the player chose how much help they want.

**Metric composite avoids Goodhart's Law.** Because Inspector Depth is never shown to the player, there's no incentive to game it. A player can't pad their score by clicking units randomly — the system measures meaningful interaction patterns, not raw input counts. And because the score only drives background systems (nudge intensity, difficulty calibration), players who naturally engage deeply never notice it exists.

**Breadcrumbs double as content.** The single-sentence tooltips that appear during skip detection are themselves interesting game content — they surface data the player might never have found. Even players who read the breadcrumb and still click "Next Mission" have absorbed one fact about their last match. Over 10 missions, that's 10 facts that accumulate into systemic understanding.

### Weaknesses

**The patronizing cliff.** Any system that detects "insufficient engagement" and responds with nudges risks feeling parental. The Tier 3 Gentle Gate is the most dangerous — a modal interstitial after a loss can feel like the game is saying "you lost because you didn't study enough." The autonomy dial mitigates this, but players who haven't discovered the autonomy dial (or don't know it controls this) may feel surveilled.

**False negative on engagement transfer.** A player who watches a YouTube analysis of their favorite streamer's Inspector session may understand their failure perfectly — and then skip their own Inspector because they already got the insight. The game can't detect learning that happened outside the game. The Ghost Inspector flag would incorrectly trigger for this player.

**Dwell time as vanity metric.** A player who leaves Inspector open while checking their phone for 90 seconds before the idle detector kicks in logs 90 seconds of "engagement." The idle detection helps but isn't perfect — slow, thoughtful reading looks identical to distracted staring. The mitigation is weighting dwell time at only 20% of the composite.

**Cold start problem.** In early missions (1-3), the Inspector has minimal content. Inspector Depth scores are naturally low because there's less to engage with. The system must have campaign-position-adjusted thresholds — otherwise every new player looks like a Ghost Inspector on Mission 1.

**Streaming observers vs. player.** A streamer who verbally analyzes the Inspector for their audience while only clicking one unit has deep engagement that the metrics undercount. The streaming context (discussed below) needs special handling.

---

## Interaction Effects

### Two-Act Debrief Structure
The two-act lock (Sealed Watch THEN Inspector) means Inspector engagement is always preceded by emotional priming. A player who just watched their squad get wiped in Sealed Watch arrives at Inspector in a different emotional state than one who watched a dominant victory. The engagement metrics should be interpreted through this lens: low Inspector Depth after a dominant win is expected and healthy (there's less to investigate). Low Inspector Depth after a devastating loss is the real signal. The IEP system cross-references mission outcome with engagement score — a "contextual Depth" metric that factors in whether there was something worth investigating.

### Career Stats (EDT Trajectory, Pivot Accuracy)
Inspector Depth feeds into but does not directly affect EDT trajectory. The relationship is correlational: players with higher Inspector Depth tend to improve their EDT faster because they understand their failures. The career stats dashboard could display Inspector Depth trend alongside EDT trend, but this risks making the metric visible and gameable. Current design: Inspector Depth influences *which career insights are surfaced* in the profile view, but is never displayed as its own stat.

### Autonomy Dial (4.47)
The autonomy dial is the release valve for the entire engagement response system. At maximum autonomy (5), only Tier 0 (ambient glow) remains active. At minimum autonomy (1), all tiers are active including the Gentle Gate. The dial defaults to 2 for new players (breadcrumbs active, highlights active after loss, gate suppressed) and the game never auto-adjusts it. This is critical: the player must always feel they chose their nudge level, not that the game decided for them.

### Difficulty Scaling
Inspector Depth is one input to the difficulty scaler. A player with consistently high Inspector Depth who is still losing may be facing missions that are too hard — they're doing the analytical work but the challenge exceeds their current skill. The difficulty scaler should ease slightly. Conversely, a player with low Inspector Depth who is winning easily might benefit from harder missions that *force* Inspector engagement by presenting failures that can't be solved through Plan-phase intuition alone. This is the subtlest use of the metric: shaping challenge to create the conditions where Inspector engagement becomes intrinsically motivated.

### Streaming and Content Creation
Streamers present a unique measurement challenge. A streamer who spends 5 minutes verbally analyzing the Inspector while only clicking 2 units has deep engagement that the telemetry undercounts. Potential mitigation: a "streaming mode" toggle in settings that (a) suppresses all nudges (streamers don't want tooltips cluttering their broadcast) and (b) disables Inspector Depth tracking entirely. The streamer's engagement signal comes from their audience, not from the game's metrics. Additionally, the Inspector's visual design — dark navy with teal accents, clean typography, readable at 720p stream resolution — is itself an engagement feature for viewers. The Inspector should look good on Twitch.

---

## Comparable Games

**Civilization's Advisor System.** Civ tracks which advisors the player opens and adjusts advisor verbosity accordingly. A player who never opens the Military Advisor stops getting military pop-ups. Robot Uprising's breadcrumb system is similar but inverted: instead of reducing nudges for ignored content, it *varies* the content of nudges to find what resonates. Civ's weakness was binary on/off; Robot Uprising's graduated response spectrum is more nuanced.

**XCOM's Tutorial Hints.** XCOM 2 tracks whether players use overwatch, flanking, and cover mechanics. If a player consistently ignores cover, the game surfaces increasingly urgent hints about cover mechanics. The weakness: XCOM's hints feel prescriptive ("You should use cover!"). Robot Uprising's breadcrumbs are descriptive ("Your scout's buffer was full for 16 ticks") — they surface data, not instructions.

**Hades' Narrative Pacing.** Supergiant tracks which NPCs the player talks to and adjusts dialogue availability based on engagement. A player who always skips Achilles' dialogue sees Achilles less frequently; one who engages sees deeper storylines. The parallel to Robot Uprising is exact: low Inspector engagement means the game surfaces fewer advanced Inspector features (probe hooks, signal genealogy), while high engagement accelerates their introduction. The progression speed of diagnostic tools is engagement-adaptive.

**Return of the Obra Dinn's Notebook.** Obra Dinn gives the player a notebook that fills with deductions. The game tracks which pages the player has viewed, which fates they've attempted to solve, and which evidence they've examined. Critically, the game never tells the player they're wrong until they commit three linked fates — it lets them sit with uncertainty. This "show data, withhold judgment" philosophy matches Robot Uprising's breadcrumb approach: the game surfaces facts and lets the player decide whether to investigate.

**Baba Is You's Hint System (post-update).** Baba Is You added a hint system that tracks player retry count and time per puzzle. After N retries, a subtle visual shimmer appears on a tile relevant to the solution. It doesn't explain the solution — it directs attention. Robot Uprising's Tier 1 breadcrumbs and Tier 2 highlights serve the same function: attention direction, not solution provision.

---

## Sensory Description

### The Warm Lamp (Tier 0)
A ring of amber light (#ffc107) around interesting units. The ring expands from 90% to 110% of the unit sprite radius over 1 second, then contracts back — a slow, organic breathing rhythm at 0.5Hz. The ring has soft edges (Gaussian blur radius 3px) and 60% opacity at peak. No sound. The effect is visible but non-intrusive — like a candle flickering in peripheral vision. Multiple units can glow simultaneously, creating a constellation of warm points on the dark grid.

### The Whisper (Tier 1)
The breadcrumb tooltip appears below the "Next Mission" button. It fades in over 300ms with an ease-in-out curve, reaching 80% opacity. The text is warm grey (#9e9e9e) in italic DM Sans at 12px — deliberately quieter than any other UI text. The tooltip has no background box, no border, no arrow — just floating text. If the player moves their cursor away from the button, the tooltip fades out over 200ms. If the player clicks the button, the tooltip dissolves into a scatter of 3-4 tiny particles (2px dots) that drift downward and fade — a visual whisper of "I had something to say, but it's okay."

### The Spotlight (Tier 2)
A single sharp pulse of teal (#00bcd4) light on one unit. The ring snaps from 0% to 100% opacity in 200ms (faster than the Warm Lamp — this is meant to catch the eye), then decays over 1 second to a gentle sustained glow at 30% opacity. Accompanied by a single audio cue: a soft, high-pitched chime at 2400Hz, 200ms duration, with a fast attack and slow release — the sound of a sonar ping or a notification from a very polite machine. The "?" badge that appears next to the unit is rendered in the same teal, starting at 16px and shrinking to 8px over 3 seconds. The badge has a subtle inner glow (#00bcd4 at 20% opacity, blur 2px).

### The Gentle Gate (Tier 3)
The overlay appears as a dark veil (rgba(0,0,0,0.6)) that fades in over 400ms. The centered card has a dark navy background (#1a1a2e) matching the Inspector palette, with 12px rounded corners and a 1px teal border at 30% opacity. The unit portrait inside the card is rendered at 48x48 pixels with a subtle vignette. The text beneath is DM Sans Regular at 14px, warm white (#e0e0e0). The "Show me" button is teal (#00bcd4) with white text, full card width, 40px height, 6px rounded corners. On hover, it brightens 10% and the text gains a subtle letter-spacing increase (0 to 0.5px over 150ms). The "Skip" link below is 12px, warm grey, underlined on hover only. No sound accompanies the gate — it appears in silence, letting the weight of the question land on its own.

### The Teaching Hand (Tier 4)
A ghostly cursor — the default pointer icon rendered in white at 40% opacity with a 1px white outline at 20% opacity for visibility against both light and dark surfaces. The cursor starts at screen center and moves in a smooth bezier curve to the nearest unit over 1.5 seconds, with a slight overshoot and settle (like a human hand, not a robot). Upon reaching the unit, the cursor performs a "click" animation: a small concentric circle expands from the cursor tip (20px diameter, teal, 50% opacity, 300ms duration). The unit sidebar slides open as if the player had clicked. The ghost cursor then fades over 500ms. The whole animation is accompanied by a single soft tone: a sine wave at 800Hz, 400ms duration, volume at 30% — the gentlest possible audio acknowledgment that something just happened.
