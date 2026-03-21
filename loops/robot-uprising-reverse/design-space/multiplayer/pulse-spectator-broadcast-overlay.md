# The Pulse as Spectator Broadcast Overlay

**Aspect:** 7.11a — The Pulse as spectator broadcast overlay: heartbeat line and stomp index displayed during tournament streams; casters reference it to contextualize matches; the overlay as meta-literacy tool for casual viewers

**Category:** multiplayer/competitive
**Wave:** 7 — Cross-Cutting Synthesis / Community

---

## The Core Design Problem

Every competitive broadcast needs a visual shorthand that tells the audience who is winning. In traditional sports, the scoreboard does this. In esports, the challenge is harder — game states are multidimensional and the "score" is not always obvious. League of Legends solved this with the gold graph. Fighting games solved it with health bars. Chess broadcasts solved it with the engine evaluation bar. Each of these inventions transformed their game's watchability by giving casual viewers a single visual anchor: a line, a bar, a number that says "this player is ahead."

Robot Uprising has a harder version of this problem. The game's competitive state is *invisible*. Two players' attention architectures fight through signal chains, context window utilization, hook cascades, and EM emissions — none of which have obvious spatial or numerical expression on the board. A casual viewer watching a Sealed Watch sees units moving, combat flashing, signals pulsing — but has no way to know who is winning until units start dying en masse. The match might be decided at tick 12 by a relay architecture collapse that doesn't manifest as visible unit loss until tick 40. The viewer watches 28 ticks of "exciting" combat that was already over.

The Pulse overlay solves this. It is a real-time heartbeat line that encodes match tension into a single visual waveform, accompanied by a stomp index that quantifies how one-sided the match is at any moment. Together, they give tournament casters a reference graphic and casual viewers a literacy tool — a way to *feel* the match's trajectory without understanding its architectural details.

The fundamental question: **How does Robot Uprising transform its invisible information warfare into a readable broadcast graphic that serves casters, casual viewers, and competitive analysts simultaneously — without spoiling the sealed watch's dramatic tension?**

---

## The Mechanic: Pulse Line and Stomp Index

### The Heartbeat Line

The Pulse renders as a continuous waveform running horizontally across the bottom of the stream overlay, spanning the full width of the broadcast frame. It occupies a narrow band — roughly 48 pixels tall at 1080p — sitting just above the stream's lower chrome. The line is rendered in a warm neutral off-white against a semi-transparent dark strip, ensuring legibility against any board state.

The waveform's vertical axis encodes **match tension** — a composite metric derived from three underlying signals:

1. **Unit count differential**: The absolute difference in surviving units between the two players, normalized to starting count. When both players have equal units, this component is zero. When one player has lost three units and the other has lost none, this spikes. The contribution is weighted 40%.

2. **Territory control**: The fraction of the 8x8 board where each player has uncontested perception coverage. Overlapping perception zones are contested territory. The differential between Player A's uncontested tiles and Player B's uncontested tiles contributes 30%.

3. **Signal chain health**: The aggregate context window utilization across all surviving units, compared between players. A player whose units are running at 90% buffer capacity while the opponent's units sit at 40% is under architectural stress. The differential contributes 30%.

These three signals are combined into a single tension value that oscillates between -1.0 (Player A completely dominant) and +1.0 (Player B completely dominant). The zero line represents parity. The heartbeat waveform oscillates around this tension centerline with a frequency that maps to **match activity** — ticks with combat, signal bursts, or unit production create peaks; quiet ticks create troughs. The result is a waveform that looks like an ECG trace: steady rhythmic pulses during balanced play, with dramatic spikes during combat and architectural collapses.

The line is colored with a gradient wash. When the tension centerline is near zero, the line pulses in neutral white. As it drifts toward Player A's side (below zero), a teal tint bleeds into the waveform from below. As it drifts toward Player B's side (above zero), a crimson tint bleeds in from above. The color shift is gradual — a viewer doesn't need to read the axis to know who's winning. The line itself blushes toward the losing player's color.

At the left edge, a small 60-tick rolling window shows the recent waveform history. At the right edge, the current tick number pulses. Between them, the waveform scrolls left as the match progresses, leaving a trail of match history that viewers can read at a glance: "the teal player was ahead early, then it evened out, now crimson is pulling away."

### The Stomp Index

Displayed as a single number in a rounded rectangle at the right end of the Pulse strip, the stomp index is a 0-100 scale measuring how one-sided the current match state is. It is derived from a trailing 10-tick weighted average of the absolute tension value, normalized and scaled:

- **0-20: "Even"** — displayed in white, no alarm. The match is competitive.
- **21-40: "Lean"** — the number shifts to a pale amber. One player has an edge but the match is recoverable.
- **41-60: "Pressure"** — the number glows amber. One player is clearly ahead. Casters might say "we're entering stomp territory."
- **61-80: "Stomp"** — the number turns orange-red with a subtle pulse. The leading player has a commanding advantage. Comebacks from this range are rare and dramatic.
- **81-100: "Demolition"** — the number burns bright crimson with a slow throb. The match is effectively over. The losing player's architecture has collapsed.

The stomp index has a deliberate 3-tick lag built in — it cannot spike instantly from 0 to 80. This smoothing prevents single-tick combat events from creating false stomp readings and gives casters time to react before the number jumps. The lag also creates dramatic moments: a viewer sees a massive combat event, watches the Pulse line spike, and then watches the stomp index *climb* over the next few seconds as the system confirms "yes, that was as bad as it looked."

### Overlay Placement and Toggle

The complete Pulse overlay — heartbeat strip plus stomp index — sits in a dedicated band at the bottom of the broadcast frame. It is togglable by the stream production team via OBS/Streamlabs scene source. Three display modes:

- **Full**: Heartbeat line + stomp index + tick counter + player color indicators at the strip's left edge (small teal and crimson squares with player names)
- **Minimal**: Stomp index number only, displayed as a floating badge in the lower-right corner
- **Hidden**: No overlay, for moments when the production wants the board to fill the frame

The overlay data is generated server-side (or by the deterministic replay engine client-side) and broadcast as a lightweight WebSocket data stream that the overlay app consumes. This architecture means any streaming tool can render the Pulse — OBS overlays, custom Electron apps, even a browser source pointed at a URL. The data format is simple: one JSON object per tick containing tension value, stomp index, activity level, and per-player breakdowns.

---

## Caster Integration: "The Commentator's Stethoscope"

The Pulse transforms tournament casting by giving casters a shared reference graphic — the same way a football broadcast's win probability graph gives commentators data to work with. Without the Pulse, a Robot Uprising caster must interpret architectural state from raw visual signals: "I think Player B's relay chain is struggling because the signal lines look thin." With the Pulse, the caster can say: "Look at the Pulse — it's been drifting teal for the last 15 ticks. Player A's architecture is quietly winning this information war."

Specific caster use patterns:

**The Pre-Fight Read**: Before a major combat event, the caster glances at the Pulse to set expectations. "Stomp index is at 12, very even. This next engagement could swing the whole match." The audience knows the stakes because the number says so.

**The Post-Collapse Confirmation**: After a relay chain breaks or a command agent gets eliminated, the caster watches the stomp index climb. "And there it goes — stomp index jumping from 25 to 58 in three ticks. That relay death was catastrophic. Player B's entire eastern network just went dark." The climbing number creates a visual exclamation mark on what might otherwise look like a single unit dying.

**The False Stomp**: Sometimes the Pulse spikes on a combat event but the stomp index barely moves. This is the caster's signal that the match is more resilient than it looked. "Big fight at B4, two units down — but look, the stomp index only moved from 15 to 22. Player A's architecture absorbed that loss. Their backup relay kicked in." This is the Pulse teaching viewers that unit deaths are not always decisive — the architecture matters more.

**The EDT Hunt**: Late in a match, when one player is clearly winning, the caster can scrub back on the Pulse history and look for the moment the tension centerline began its drift. "If you look at the Pulse, you can see the shift started way back at tick 18. That's probably the EDT — the moment Player B's context windows started filling up. The combat at tick 35 was just the symptom." This teaches viewers to think about causation versus correlation — the Pulse line as a visual record of when the match was really decided.

**The Comeback Call**: In rare matches where a trailing player claws back, the Pulse provides the drama. "Stomp index was at 64 — that's deep in stomp territory — and look at it falling! 58... 51... Player B is stabilizing! The signal chain reroute through that western relay is actually working!" The descending number creates a narrative arc that words alone cannot.

---

## Casual Viewer Meta-Literacy

The Pulse's deepest value is pedagogical. It teaches casual viewers how to watch Robot Uprising by providing emotional anchors that eventually become unnecessary. The learning progression follows a natural arc:

**Stage 1 — "Follow the color"**: A first-time viewer sees the Pulse line shifting between teal and crimson. They don't understand signal chains or context windows. They understand: teal glow means the teal player is winning; crimson glow means the crimson player is winning. This is sufficient to follow the match.

**Stage 2 — "Read the number"**: After watching a few matches, the viewer starts tracking the stomp index. They learn that 30 means "close" and 70 means "blowout." They start predicting outcomes: "Stomp is at 55, I think teal has this." They begin experiencing the suspense of watching a stomp index climb or recover.

**Stage 3 — "Spot the spike"**: The viewer starts noticing that Pulse spikes correlate with events on the board — combat flashes, unit eliminations, signal chain disruptions. They begin tracing causation: "The Pulse spiked when that relay died. The relay must have been important." The overlay is teaching them that relays matter, without a tutorial.

**Stage 4 — "Question the lag"**: An advanced casual viewer notices that the stomp index sometimes barely moves after a dramatic-looking combat event. They ask: "Why didn't the stomp go up?" This is the moment they begin to understand that the match state is architectural, not spatial. The Pulse's indifference to flashy-but-unimportant combat teaches viewers to see past surface-level action.

**Stage 5 — "Find the pivot before the caster"**: The most engaged viewers start watching the Pulse line's drift and predicting the EDT. They join chat conversations: "The shift started at tick 22, not tick 35 like the caster said." They have internalized the Pulse as a diagnostic tool. At this point, they are ready to play Robot Uprising's annotation accuracy game (7.14) themselves.

This five-stage literacy arc transforms the Pulse from a crutch into a gateway. Viewers who arrive knowing nothing about attention architectures leave understanding causal structure, relay importance, and the difference between visible damage and invisible architectural collapse.

---

## Player Journeys

#### Journey: Rico, 31, Esports Caster from Quezon City

**Context:** Rico has been casting Dota 2 and Valorant for the Filipino esports scene for four years. He was approached to cast the first Robot Uprising community tournament — a 16-player bracket on a Saturday afternoon. He has played the campaign through Mission 7 but does not consider himself a strong competitive player. His casting strength is energy and narrative, not deep analysis. He is terrified of dead air during Sealed Watch because he cannot parse signal chains fast enough to commentate.

**The first match:** Rico opens OBS and loads the Pulse overlay as a browser source. During the pre-match lobby, he tests it with a practice replay. The heartbeat line scrolls steadily, stomp index hovering at 8. He scrubs forward to a combat event — the Pulse spikes, the stomp index climbs from 8 to 34 over three ticks. He exhales. This is something he can narrate.

**The cast:** First round. Two Gold-tier players. Rico fills the Plan phase with player introductions and blueprint previews. Then Sealed Watch begins and the board lights up with signal chains. Rico's eyes flick to the Pulse. "We're at stomp zero, dead even start." Tick 8 — a scout encounter. Combat flash. The Pulse twitches. "Small contact at C5 — Pulse barely moved, this is a probe, not a fight." Rico is reading the Pulse like a teleprompter for his narration. Tick 19 — a relay elimination. The Pulse line lurches crimson. "Whoa — look at that spike! Player Two just lost their eastern relay and the Pulse is screaming. Stomp index climbing... 18... 27... 33." Rico leans into his mic. "That relay was load-bearing." The chat erupts: "LOAD-BEARING RELAY" becomes a meme. Rico discovers that the Pulse gives him a three-tick window between the event and the stomp index peaking — exactly enough time to set up a sentence before delivering the punchline of the number.

**Post-tournament:** Rico reviews his VOD. He notices he referenced the Pulse 47 times across 6 matches. He never once had dead air during Sealed Watch. The Pulse gave him a continuous narrative thread — tension rising, tension falling, stomp approaching, stomp averted. His co-caster, an analytical player, focused on architecture while Rico focused on the Pulse, and the division worked. Rico posts on the community Discord: "The Pulse is the caster's best friend. I don't need to understand every signal chain — I just need to feel the heartbeat."

#### Journey: Mei, 23, Graphic Design Student from Cebu

**Context:** Mei has never played Robot Uprising. She watches Twitch streams while doing homework and clicked on a Robot Uprising tournament because the thumbnail showed a Philippine island campaign map. She has no idea what attention architectures are, what relays do, or why units are moving on an 8x8 grid. She is about to close the tab.

**The hook:** The caster says "Stomp index is at 45, this is getting one-sided." Mei sees a glowing orange number in the corner of the screen. She doesn't know what it means but she sees it pulse. The caster's tone is urgent. She stays to find out what happens. Tick 30 — the stomp index hits 62. The caster shouts: "Stomp! Player One's network is collapsing!" Mei sees the heartbeat line at the bottom of the screen — it is washed in deep crimson, the peaks are getting smaller, like a failing heart on a medical drama. She has never played the game and she understands: this player is dying.

**The education:** Over the next three matches, Mei learns to read the Pulse without understanding the game. She notices the heartbeat line is calm during quiet phases and spiky during fights. She notices the stomp index resets to near-zero at the start of each match. She starts predicting: "That number is going up, teal is going to lose." She is right more often than not. By the semifinal, she types in chat: "Stomp was already at 30 before the big fight, it was over at tick 20." A regular viewer responds: "Good read." Mei feels seen.

**The conversion:** Mei downloads Robot Uprising the next day. She does not cite the gameplay as her reason. She cites the Pulse: "I watched a tournament and there was this heartbeat thing at the bottom that showed who was winning. I wanted to understand what was actually happening under the line." The Pulse converted a casual viewer into a player by being simultaneously readable (she could follow it) and mysterious (she wanted to understand *why* it moved). The overlay is an acquisition funnel disguised as a broadcast tool.

#### Journey: Dex, 27, Diamond-Tier Gauntlet Player from Manila

**Context:** Dex reached Diamond tier in Season 1 with a command-agent architecture specializing in relay-chain topologies. He just lost a semifinal match in the community tournament and is watching the VOD with the Pulse overlay enabled. He is looking for the moment his architecture failed.

**The scrub:** Dex opens the VOD and fast-forwards to his match. The Pulse overlay is visible at the bottom of the caster's broadcast. He watches the heartbeat line during his opening — steady, even, stomp at 4. His relay chain deploys on schedule. Ticks 1 through 14 look fine. Then the Pulse line begins a slow, barely perceptible drift toward crimson. Not a spike — a drift. The stomp index creeps from 4 to 9 to 14 over ten ticks. Dex pauses. He didn't notice anything wrong during those ticks when he watched live. His units were still alive, his relays still forwarding. But the Pulse saw it. The tension centerline was shifting because his opponent's territory control was expanding while his context windows were slowly filling.

**The diagnosis:** Dex scrubs to tick 22. The stomp index is at 19 — still "even" by the overlay's color scheme, still white text. But the drift hasn't stopped. He opens the Inspector on his local replay (separate from the broadcast) and checks his units' context windows at tick 22. His western relay is at 78% utilization. It was only at 45% at tick 10. Something is writing into that buffer faster than expected. He traces the signal chain — his opponent's scout is generating perception signals that Dex's relay is dutifully forwarding, filling the buffer with low-priority data. His relay doesn't have a filter. The Pulse saw the architectural stress before any unit died.

**The insight:** At tick 31, the relay overloads and drops a critical hook message. Dex's striker loses its target signal and wanders. Three ticks later, the striker walks into an ambush. The stomp index jumps from 24 to 51. The caster on the VOD shouts about the combat. But Dex knows the match was lost at tick 22, not tick 34. He adds a filter rule to his relay's blueprint and queues a Gauntlet match to test it. The Pulse didn't tell Dex what went wrong — the Inspector did that. But the Pulse told Dex *when* to look. The slow drift between ticks 14-22 was the breadcrumb trail he needed to find the architectural failure that cost him the tournament.

---

## Strengths

1. **Immediate watchability**: The Pulse reduces Robot Uprising's spectator entry barrier from "understand signal chains" to "follow the bouncing line." This is the difference between a niche curiosity and a streamable esport.

2. **Caster enablement**: Gives casters a continuous data source they can narrate without deep architectural knowledge. Reduces dead air. Creates shared vocabulary ("stomp index," "the drift," "load-bearing relay").

3. **Pedagogical funnel**: The five-stage literacy arc transforms passive viewers into active analysts. Each stage of Pulse comprehension maps to a deeper understanding of the game's core systems.

4. **VOD utility**: Competitors rewatching their own matches can use the Pulse as a diagnostic timeline — the drift reveals when architectural stress began, often long before visible failure.

5. **Meme generation**: Stomp index values create shareable moments. "That was a 94 stomp" becomes community shorthand. The heartbeat visual lends itself to clip thumbnails and social media.

6. **Low visual footprint**: 48 pixels of screen height. Toggleable. Does not compete with the board, signal chains, or existing Tier 1-3 overlays from the spectator infrastructure (7.01e).

## Weaknesses

1. **Spoiler tension**: The Pulse inherently reveals match trajectory before it manifests visually on the board. A drifting heartbeat line can telegraph the outcome, undermining the sealed watch's dramatic uncertainty. Mitigation: a broadcast-delay mode that shows the Pulse with a 5-tick lag, preserving some surprise. But this creates a window where the caster knows the number before the audience sees it — potentially awkward.

2. **Composite metric opacity**: The tension value is a weighted blend of three signals. When the Pulse moves, a viewer cannot tell *which* component caused it — unit loss, territory shift, or buffer stress. Analytical viewers may find this frustrating. The Pulse sacrifices diagnostic precision for emotional clarity.

3. **Calibration fragility**: The 40/30/30 weighting of unit count, territory, and signal chain health is a design choice that encodes assumptions about which factors matter. If the meta evolves toward strategies where one factor dominates (e.g., turtle architectures where territory is irrelevant), the Pulse weighting becomes misleading. Periodic recalibration is necessary but creates inconsistency across seasons.

4. **Stomp index normalization**: Short matches naturally produce high stomp indices because any early advantage looks large when divided by few ticks. A 15-tick match where one player loses a scout at tick 3 might register as stomp 40 before any real architectural divergence occurs. The 3-tick lag helps but doesn't fully solve this.

5. **False drama ceiling**: The Pulse smoothing means that genuinely instant reversals — a single brilliant hack that flips the match — are dampened by the lag. The board shows the reversal immediately but the stomp index takes 3 ticks to respond, creating a visual contradiction that confuses the caster's timing.

---

## Interaction Effects

### The Pulse x EDT (Effective Determination Tick)

The Pulse's tension drift is strongly correlated with the EDT. In most matches, the moment the Pulse begins a sustained one-directional drift is within 5-10 ticks of the true EDT. This creates a powerful interaction with the annotation accuracy system (7.14): viewers watching tournament broadcasts with the Pulse overlay are *training their EDT intuition* whether they realize it or not. The Pulse teaches them to spot the drift — exactly the skill that annotation accuracy rewards. A viewer who watches 20 tournament matches with the Pulse enabled will likely score higher on their first annotation attempt than a player who has never seen the overlay.

The interaction also works in reverse: community members who are strong annotators (high AAS) can look at a Pulse trace and immediately identify whether the drift began before or after the caster noticed it. This creates content: "The Pulse saw it at tick 18 but the caster didn't call it until tick 25 — here's what the Pulse was reading that the caster missed."

### The Pulse x Sealed Watch Pacing

The sealed watch is designed to be experienced without perfect information — neither player knows the full state, and the viewer is meant to share that uncertainty. The Pulse partially breaks this contract by providing an omniscient tension metric. The design tension is real: the Pulse makes tournaments more watchable but makes the sealed watch less mysterious. The 5-tick delay mode and the Minimal display option (stomp index only, no heartbeat line) are compromise positions. Tournament organizers should have the authority to choose their display mode — some events may prefer the full Pulse for maximum production value, others may prefer hidden Pulse for maximum dramatic tension, revealing it only during the Inspector replay phase.

### The Pulse x Annotation Accuracy (7.14)

Tournament broadcasts with the Pulse overlay create a natural on-ramp to annotation accuracy competition. A viewer watching the Pulse learns to spot the tension drift. When they later open the Inspector to annotate a match, they are looking for the same signal — the moment the match's trajectory locked in. The overlay is literally training annotation skill. This suggests a community integration: after a tournament match ends, the broadcast could cut to a "Community Annotation Challenge" screen where the Pulse history is frozen, the EDT diamond is hidden, and viewers submit their guess via chat command. The highest-scoring viewer gets their name on screen. This turns passive viewing into active diagnostic competition.

### The Pulse x Streaming Tools

The Pulse data stream should be exposed as an OBS-compatible WebSocket overlay that any streamer can add to their broadcast — not just tournament productions. This democratizes the tool. A Diamond-tier streamer casting their own Gauntlet matches can enable the Pulse for their audience. A content creator reviewing submitted configs can show the Pulse during batch replay reviews. The data format should be documented and open, enabling third-party overlay apps, custom visualizations (3D Pulse renders, vertical orientations, accessibility color remaps), and community dashboard tools.

---

## Comparable Systems

### League of Legends Gold Graph

The gold graph is the closest analog. LoL broadcasts display a running line chart of total gold for each team, with the differential shown as a filled area between the two lines. When one team leads in gold, the area fills with that team's color. The gold graph has become so central to LoL broadcasting that casters reference it by name: "ten thousand gold lead at 20 minutes." It teaches casual viewers that gold matters, that leads compound, and that comebacks require specific gold swings. The Pulse learns from this: a single line encoding a complex game state, color-coded for emotional clarity, referenced by casters as a shared anchor. The Pulse's key difference: LoL's gold graph measures a single concrete resource (gold). The Pulse measures a composite of three abstract signals. This makes the Pulse more opaque but also more expressive — it can capture architectural stress that has no LoL equivalent.

### Fighting Game Health Bars

Health bars in Street Fighter or Tekken are the ur-example of broadcast-readable tension. Two bars, one per player, depleting from opposite sides. The visual is instantly legible to anyone who has ever seen a progress bar. Robot Uprising cannot use health bars directly because unit counts are not a good proxy for match state — a player can lose three units and still win if their remaining units have a superior architecture. The Pulse's stomp index is the closest analog: a single number that says "how close to dead is the trailing player?" The key difference: fighting game health bars reset per round and deplete monotonically. The Pulse can reverse, creating comeback narratives that health bars cannot.

### Chess Evaluation Bar

Chess.com and Lichess tournament broadcasts display an engine evaluation bar — a vertical black-and-white bar that shifts toward the winning side as the engine's centipawn advantage changes. The eval bar has transformed chess viewership by making engine-invisible advantages visible to casual viewers. A viewer who knows nothing about positional chess can watch the eval bar shift and understand "white has a small advantage that's growing." The Pulse is directly inspired by this: an omniscient metric displayed in real time, teaching viewers to see advantages that the board position doesn't obviously show. The chess eval bar's known problem — it spoils the tension of human-level uncertainty — applies equally to the Pulse. Chess broadcasts sometimes hide the eval bar during critical moments to preserve drama. Robot Uprising should offer the same option.

### Football Win Probability Graphs

ESPN and NextGenStats display live win probability estimates during NFL broadcasts — a line from 0% to 100% that swings with each play. These graphs have become iconic social media artifacts: a game with a dramatic comeback produces a "heart attack" win probability graph that tells the entire story in one image. The Pulse's heartbeat waveform is designed to produce similar artifacts. A stomp produces a flat line drifting to one side. A close match produces a volatile waveform. A comeback produces the most dramatic shape: a deep trough followed by a spike back to center. These shapes are inherently shareable — a screenshot of a match's Pulse history tells the emotional story without context.

---

## Sensory Description: The Overlay in Motion

The broadcast frame shows the 8x8 board in the Diorama style — lush tropical tiles with tilt-shift blur at the edges, units as chrome-bodied sprites with colored accents. Signal chains pulse as dashed Bezier lines in teal and crimson. The camera holds steady in spectator wide-angle.

At the bottom of the frame, a dark strip materializes at match start — not a hard cut, but a gentle fade-up over 500 milliseconds, like an instrument panel illuminating at boot. The strip is 48 pixels tall, semi-transparent obsidian with a subtle noise texture, as if printed on brushed carbon fiber. At the left edge, two small squares — teal and crimson — sit beside abbreviated player names in condensed sans-serif. A thin horizontal rule marks the zero line through the center of the strip.

The heartbeat line begins drawing. Each tick, a new data point appears at the right edge and the line shifts left by one pixel. The line's motion is smooth, cubic-interpolated between tick values. In a balanced opening, the line oscillates gently around the zero line — small peaks and troughs in neutral off-white, a resting heartbeat rhythm. The peaks correspond to signal activity: each time hooks fire or combat resolves, the waveform amplitude increases momentarily, like a sleeping person's pulse quickening during a dream.

A scout encounter at tick 6. The line twitches upward — a single crisp peak, narrow, returning to baseline within two ticks. The waveform still reads as calm. A subtle warmth enters the teal square at left — a barely perceptible glow suggesting the teal player's scout scored the first intelligence advantage. The stomp index in its rounded rectangle at the right reads "3" in clean white digits. Nobody is worried.

Tick 14. A relay elimination. The heartbeat line jolts — not a clean peak this time but a wide, sustained displacement below the zero line, like an ECG showing a prolonged QRS complex. The line color shifts: what was neutral white now carries a wash of crimson from above, as though blood were seeping into water. The displacement holds for three ticks, four ticks. The stomp index begins its climb: 8... 14... 19. The digits shift from white to a pale amber, the hue of a caution light. The zero line remains fixed, a steady reference against which the crimson drift becomes undeniable.

The caster's voice quickens. "The Pulse is telling us something — that relay wasn't just a unit, it was load-bearing infrastructure. Watch the drift." The audience's eyes flick between the board (where nothing dramatic is happening — units are still moving, signals still flowing) and the Pulse strip (where the heartbeat is telling a story the board hasn't revealed yet). The gap between what the board shows and what the Pulse shows is the gap between visible and invisible warfare. The overlay is making the invisible legible.

Tick 30. Combat erupts at D5. Three units converge. The heartbeat spikes sharply — a tall narrow peak followed by a second, taller peak two ticks later as follow-up signals cascade. The waveform now looks arrhythmic: irregular peaks, uneven spacing, the crimson wash deepening. The stomp index crosses 50 and the digits change to orange-red with a slow pulse animation — a gentle throb, once per second, as if the number itself has a heartbeat now. The dark strip beneath the waveform seems to darken further, the noise texture shifting to a subtle static pattern.

And then — the reversal. Tick 36. The trailing player's backup relay activates. A rerouted signal chain stabilizes three units simultaneously. On the board, nothing visually dramatic happens. In the Pulse strip, the heartbeat line hesitates. The crimson drift slows. The next peak is smaller than the last. The one after that is smaller still. The stomp index holds at 54... then 52... then 48. The orange-red digits pale back toward amber. The caster holds their breath. The waveform is pulling back toward zero — a visual representation of an architecture stabilizing, finding its backup paths, rerouting around the dead relay.

The audience reads the comeback in the Pulse line before they see it in the units. The overlay taught them how.
