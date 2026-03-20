# 7.01e — Spectator Mode and Tournament Infrastructure

## The Option

Spectator mode transforms Robot Uprising from a private configuration puzzle into a watchable competitive sport. The core challenge: how do you make someone *else's* information architecture legible to an observer who didn't design it? StarCraft solved this for spatial warfare — army positioning, resource counts, and engagement zones are visually self-explanatory. Robot Uprising must solve it for *invisible* warfare: signal chains, context window states, and decision traces flowing through an 8x8 grid where the real action happens in data structures, not on tiles.

The infrastructure spans five interconnected systems:

1. **Stream Overlays** — HUD elements showing both players' Plan screen configurations, live signal chain activity, and context window health during Sealed Watch.
2. **Split-Screen Sealed Watch** — Dual-perspective viewing where observers see both players' sealed experience simultaneously or toggle between them.
3. **Inspector Casting Tools** — Analytical overlays a caster can activate mid-replay to explain what happened and why, without breaking the sealed watch emotional arc for first-time viewers.
4. **Tournament Bracket UI** — Visual bracket display with match previews, live updates, and historical data for organized competitive play.
5. **Replay Sharing** — Infrastructure for distributing match replays as community learning artifacts, including annotated versions and highlight clips.

### Stream Overlay Design: "The War Correspondent's Dashboard"

The overlay must serve three audiences simultaneously: the competing player (who sees nothing extra), the casual viewer (who needs emotional anchors), and the analytical viewer (who wants architectural detail). The solution is a three-tier overlay system where casters and viewers independently select depth.

**Tier 1: "The Pulse" (Casual)**
Minimal overlay showing only emotional state indicators. Each player gets a narrow vertical strip on their side of the screen — left player teal, right player crimson. The strip contains:
- A simplified "army health" bar (aggregate unit count, pulsing when units die)
- A single "architecture stress" indicator (average context window utilization across all units, displayed as a thermometer — cool blue under 50%, amber at 75%, angry red pulsing at 90%+)
- Signal activity sparkline (a tiny 60-tick rolling waveform showing message volume — flat = quiet architecture, spiky = active coordination)
- The player's Gauntlet rank badge and seasonal record

This tier adds less than 5% screen real estate and gives a casual viewer enough to follow emotional beats: "red player's stress meter is climbing," "blue's signal line just went crazy."

**Tier 2: "The X-Ray" (Intermediate)**
Adds a collapsible panel on each side showing the blueprint summary for each player's active configuration:
- Blueprint icons in production queue order with unit type silhouettes
- Hook count per blueprint (shown as small colored dots representing channel connections)
- A simplified channel topology diagram — nodes for each blueprint type connected by colored lines, line thickness proportional to message volume
- Active unit count per type
- EM emission level (small radar icon with expanding/contracting rings)

The channel topology diagram is the centerpiece — it lets an intermediate viewer see "Player A has a centralized star topology running through one relay, Player B has a distributed mesh." This is the equivalent of seeing army composition in StarCraft.

**Tier 3: "The Architect's Lens" (Expert)**
Full diagnostic overlay available to casters. Adds:
- Per-unit context window state (the familiar colored pips, but annotated with signal type labels on hover)
- Decision trace summary for the last tick (which rules fired on which units, shown as floating micro-annotations)
- Signal genealogy overlay (the full signal chain visualization from the Inspector, but live during the match replay)
- Pivot tick prediction (a running estimate of when the match outcome became determined, updating as the match progresses)
- EM emission heatmap on the board (showing where each player's noise footprint is concentrated)

Casters toggle between tiers with keyboard shortcuts (1/2/3) and can pin specific units for persistent inspection. A "follow cam" mode automatically tracks the most active unit on the board.

### Split-Screen Sealed Watch: "The Double Exposure"

The most spectacular viewing format. The screen divides vertically — left half shows Player A's perspective, right half shows Player B's. Each half renders the same board but with different overlay information: each player's own signal chains, context bars, and unit highlights.

The critical design decision: **signal chains from one player are invisible on the other player's half.** This means viewers see teal dashed lines flowing on the left and crimson dashed lines flowing on the right, sometimes passing through the same board positions. The visual effect is two overlapping neural networks competing for the same physical space — the information warfare made literally visible.

At key moments — combat, overload events, unit eliminations — the split screen briefly *merges* into a single full-screen view with both players' signal chains visible simultaneously, creating a visual cacophony that resolves as one player's network collapses. The merge lasts 2-3 seconds before splitting again. The effect is like a camera crash-zooming on an explosion.

Audio design: each half gets a slightly different audio channel. Player A's signal tones are panned slightly left, Player B's slightly right. Combat sounds are centered. The result is a stereo soundscape where the viewer's ears can track which player's architecture is more active.

### Inspector Casting Tools: "The Commentator's Desk"

For tournament casting, the Inspector gains additional tools designed for explanation rather than diagnosis:

- **Annotation Markers**: The caster can drop numbered markers on the board (gold diamonds with numbers) that persist across ticks, creating a "here's what to watch" system. Viewers see markers; players don't.
- **Slow-Motion Replay**: During Inspector review, the caster can set playback speed to 0.25x for key moments, with per-tick annotations appearing as floating text.
- **Side-by-Side Config Compare**: A panel showing both players' blueprints for the same unit type side by side, highlighting differences in rules, hooks, and context config. This is the "tale of the tape" for Robot Uprising.
- **Predicted Pivot Overlay**: After the match, a gold diamond appears on the timeline at the EDT (effective determination tick). The caster can reveal this dramatically, then scrub back to show *why* this tick mattered.
- **"What If" Toggle**: The caster can run a single counterfactual change live on stream — "if Player A had one more relay, watch what happens" — and show the alternate timeline to the audience.

### Tournament Bracket UI: "The Archipelago Circuit"

The tournament bracket renders as the Philippine archipelago campaign map, repurposed for competitive play. Each match is a province. The bracket flows geographically — quarterfinals in Visayas, semifinals in Luzon, finals at Taal volcano.

- **Province Tiles**: Each match location shows both player portraits, their rank badges, and a mini signal-activity sparkline from the match (or a pulsing "LIVE" indicator)
- **Data Cable Connections**: The circuit-board data cables from the campaign map connect provinces in bracket order. Completed matches show cyan cables; upcoming matches show gold pulse; eliminated players' cables go dim with a brief red flash
- **Match Preview Panel**: Hovering over a province shows a pre-match "scouting report" — both players' seasonal stats, head-to-head history, architectural style summary (e.g., "centralized topology specialist" vs. "distributed mesh player"), and predicted match duration based on historical data
- **Victory Ceremony**: When a player wins a match, their portrait gains a cyan glow and the cable to the next province lights up with a traveling pulse animation and a kulintang gong tone

### Replay Sharing: "The Match Library"

Replays are stored as compact deterministic replay codes (building on the locked replay link system from 6.09). The tournament infrastructure adds:

- **Annotated Replays**: Caster annotations (markers, commentary timestamps, highlighted ticks) are saved as a separate annotation layer on top of the base replay code. Multiple annotation layers can exist for the same match — the official caster's, a community analyst's, a coaching perspective.
- **Highlight Packages**: Auto-generated 15-30 second clips of key moments (combat exchanges, overload cascades, pivot ticks) with the Tier 2 overlay baked in. These are the TikTok-ready artifacts.
- **Community Analysis Threads**: Each replay has an associated discussion space where players can post Inspector screenshots, signal genealogy diagrams, and architectural critiques. The thread format mirrors config necropsy culture (7.10) applied to competitive matches.
- **Teaching Replays**: Curated replays tagged by the concepts they demonstrate ("relay chain failure," "EM stealth architecture," "command agent cascade") — a searchable library organized by the game's vocabulary.

## Player Journeys

#### Journey: Kwame, 28, Accra-based Twitch streamer and Diamond II Gauntlet player

**Context:** Semi-finals of the first Robot Uprising seasonal tournament. Kwame is casting the match between two Top 50 players — "NullPointer" (known for centralized command architectures) and "SilentType" (known for minimal-EM stealth builds). 847 viewers. Kwame has been streaming Robot Uprising for 3 months and has become the go-to English-language caster.

**Minute 0:00 — The Tale of the Tape**
Kwame opens the Match Preview on the Cebu province tile. The bracket shows NullPointer advanced through Palawan and Siquijor; SilentType through Ifugao and Batanes. The preview panel displays both players' seasonal stats — NullPointer: 78% win rate, average EDT at tick 34 (early decisive architectures), known for 6-hook Command agents. SilentType: 71% win rate, average EDT at tick 67 (late-game grinders), EM emissions consistently in bottom 10% of Diamond tier. Kwame reads these aloud: "Classic matchup — the symphony conductor versus the ghost. NullPointer wants to overwhelm the board with coordinated signal chains before SilentType's stealth network can establish itself."

**Minute 0:30 — The Split Screen**
The match begins. Kwame activates The Double Exposure. Left half shows NullPointer's perspective — immediately, teal dashed signal lines begin firing from a central relay positioned at D4. Four channels visible, messages flying outward to scouts and strikers. Right half shows SilentType's board — nearly empty. One faint teal line connecting two scouts. The architecture stress thermometers tell the story: NullPointer's is at 45% and climbing (busy but healthy), SilentType's is at 12% (barely whispering).

"Look at the difference," Kwame says. "NullPointer's board looks like a switchboard at rush hour. SilentType's looks like nobody's home. But that's the point — SilentType's EM footprint is invisible."

**Minute 1:15 — The Expert Overlay**
At tick 18, Kwame switches to Tier 3 and pins NullPointer's Command agent. The decision trace floats above the unit: "RULE 4 matched: IF scout_report contains ENEMY_CLUSTER AND cluster_size > 2 THEN reroute striker_alpha to flank_channel." The chat explodes — viewers can see the exact logic driving the flanking maneuver. Kwame drops Annotation Marker #1 on the tile where the striker is heading. "Watch marker one. If the striker gets there by tick 22, NullPointer's command chain worked perfectly."

**Minute 2:00 — The Merge**
Tick 22. The striker reaches Marker #1. SilentType's stealth scout was already there — tagged but undetected by NullPointer's perception radius. Combat. The split screen *merges* into a single full-screen view for 2.5 seconds. Both players' signal chains are visible simultaneously — teal and crimson lines crossing and overlapping in a chaotic web. NullPointer's striker eliminates SilentType's scout, but the kill triggers a dead-man's-switch hook — SilentType's scout had a hook configured to broadcast its last known enemy position on elimination. The crimson signal line shoots across the board.

"THE DEAD MAN'S SWITCH!" Kwame shouts. Chat floods with exclamation marks. The merge ends, split screen returns.

**Minute 3:30 — The Aftermath**
Post-match, Kwame opens the Inspector Casting Tools. The EDT diamond appears at tick 22 — the exact moment the dead-man's-switch fired. Kwame does the Side-by-Side Config Compare for both players' scouts. "Look — NullPointer's scout has no ON_ELIMINATED hook. SilentType's has ON_ELIMINATED → broadcast last_known_enemy to 'contingency' channel. That one hook slot difference decided the match."

Kwame exports a 20-second Highlight Package of the merge moment and posts it to Discord. Within an hour, it has 400 views. The community analysis thread accumulates 15 posts dissecting the dead-man's-switch architecture, with three players sharing their own versions.

**UI Annotations:**
- Split screen divider: 2px gold vertical line at screen center, with tiny player portraits at top
- Tier toggle: keyboard shortcuts 1/2/3, current tier shown as small badge in top-right
- Annotation markers: gold diamonds with white numbers, 40px diameter, 75% opacity, fade in over 200ms
- Merge trigger: combat or overload event, 300ms transition from split to full, reversed harp glissando sound
- Architecture stress thermometer: 8px wide, 120px tall, gradient fill with breathing glow at high values

#### Journey: Aya, 45, Tokyo-based tournament organizer and former StarCraft II observer

**Context:** Organizing the first official Robot Uprising invitational — 16 players, double elimination, streamed on two channels (English and Japanese). Aya has organized SC2 tournaments for 8 years and is evaluating whether Robot Uprising can sustain competitive viewership.

**Minute 0:00 — The Observer's Dilemma**
Aya opens the Spectator mode for her first test cast. Immediately she notices the difference from SC2: there are no armies to track, no bases being built, no resources to count. The board has units standing on tiles, occasionally moving. Without overlays, the match looks *boring* — units snap to positions, some vanish, signal flashes happen. "This needs to work harder than StarCraft to be watchable," she thinks.

She activates Tier 2 — The X-Ray. The channel topology diagrams appear on each side. Suddenly the match has shape. One player's topology is a tight star — all messages flowing through a single relay. The other's is a web — three relays forming a triangle with cross-connections. "Ah," Aya thinks, "this is like army composition. I can see the *shape* of each player's strategy."

**Minute 1:00 — Finding the Rhythm**
Aya discovers the signal activity sparklines are the heartbeat of each architecture. When a player's sparkline spikes, something interesting is about to happen on the board. She learns to watch the sparklines and call out "big signal spike from Player A — watch the northeast!" before the action happens on the board. This is the Robot Uprising equivalent of seeing army movement on the minimap before engagement.

The architecture stress thermometers give her another lead indicator. When one starts climbing from blue through amber, she knows a context overload cascade might be coming. "This is the supply block of Robot Uprising," she realizes. "Viewers need to learn to watch the thermometer."

**Minute 3:00 — The Casting Script**
After 10 test matches, Aya develops a casting framework:
1. Pre-match: read the topology diagrams, explain the strategic contrast
2. Early ticks: watch sparklines for activity patterns, call out the "opening"
3. Mid-game: toggle to Tier 3 for key decision traces on the most active units
4. Combat moments: let the merge speak for itself — stop talking during the 2-3 second merge
5. Post-match: EDT reveal → pivot tick analysis → "what would you have done differently?"

She writes a 2-page observer guide for other casters. The key insight: "In StarCraft, you narrate what you SEE. In Robot Uprising, you narrate what you UNDERSTAND. The overlays are not optional — they ARE the spectator experience."

**UI Annotations:**
- Channel topology diagram: 120x80px per player, positioned below player portraits, auto-layout using force-directed graph
- Signal sparkline: 200x20px horizontal strip, 60-tick rolling window, amplitude normalized to player's maximum
- Follow cam: activated with F key, smoothly pans to track most-active unit, subtle 200ms easing, gold border on tracked unit

#### Journey: Tomás, 16, Manila high school student and Silver III Gauntlet player

**Context:** Tomás has been watching Kwame's tournament streams but never used Spectator mode himself. His friend Diego (Gold I) just challenged him to a private Gauntlet match, and a third friend, Jun, wants to spectate live.

**Minute 0:00 — The Invitation**
Tomás and Diego queue into a private Gauntlet match. Jun joins as spectator via a shared match code (6-character alphanumeric, same format as save codes). Jun's screen loads the match — he sees the Philippine province tile for Cebu (the map both players agreed on) with both player portraits.

Jun's default view is Tier 1 — The Pulse. He sees the army health bars and stress thermometers. He has no idea what the signal sparklines mean, but he notices Tomás's thermometer is already amber before the match starts. "Bro, your stress meter is already orange," he types in the match chat. Tomás can't see the chat during Sealed Watch (locked by design), but the message will appear in debrief.

**Minute 0:45 — Learning to Read**
Jun switches to Tier 2 out of curiosity. The channel topology diagrams appear. Tomás's architecture is a simple star — one relay connected to everything. Diego's is more complex — two relays with separate channels for scout reports and combat coordination.

Jun doesn't understand the topologies yet, but he notices that Tomás's single relay is flashing amber. He screenshots it and posts to their Discord group: "Tomás has ONE relay doing everything lmao." This screenshot becomes the first artifact in what will eventually be a running joke about Tomás's "overworked relay."

**Minute 2:30 — The Social Layer**
The match ends — Diego wins when Tomás's relay overloads and his entire network goes silent for 3 ticks. Jun saw the thermometer spike to red right before the collapse. In the post-match chat, Jun's pre-Sealed-Watch message appears: "Bro, your stress meter is already orange." Tomás laughs — the spectator data gave his friend information he himself didn't have during the match.

The replay code appears. All three save it. Over the next week, they replay the match four times, each time using Inspector tools to dig deeper into why Tomás's single-relay architecture collapsed. Jun, who doesn't play competitively, learns more about context window management from spectating and analyzing this one match than from his own casual campaign play.

**UI Annotations:**
- Spectator join: 6-character match code entered in lobby, 2-second connection with "establishing connection" animation
- Match chat: small text overlay bottom-left for spectators, messages queued until debrief for players
- Replay code: displayed on match-end screen for all participants (players and spectators), one-click copy button
- Screenshot: standard OS screenshot captures overlay state, no special export needed

## Strengths and Weaknesses

**Strengths:**
- The tiered overlay system means spectating can scale from casual ("watch the thermometers") to expert ("read the decision traces") without overwhelming anyone
- The split-screen merge during combat creates a genuinely unique visual spectacle — two overlapping neural networks colliding
- The deterministic replay system means every match can be analyzed, annotated, and shared, creating a deep community content pipeline
- Tournament brackets using the Philippine archipelago map create geographic identity for competitive seasons

**Weaknesses:**
- The core spectator challenge remains: information architecture is inherently less visually dramatic than army combat — the overlays must compensate constantly
- Tier 3 casting requires deep game knowledge — casual casters can't use it, creating a high barrier to community casting
- Split-screen halves the board size on each side, making unit identification harder on smaller screens
- Tournament infrastructure assumes a community large enough to sustain organized play — may be premature for early player counts

## Interaction Effects

- **Sealed Watch purity (locked)**: Spectator overlays break the sealed watch's "no tools" philosophy for observers. Resolution: players NEVER see overlays during their sealed watch. Spectators see a deliberately different experience.
- **Config necropsy culture (7.10)**: Tournament replays with caster annotations become the highest-quality necropsy artifacts in the community.
- **Replay export (6.09)**: The Highlight Package system extends the existing clip export pipeline with spectator-specific overlays baked in.
- **EM emission model (locked)**: The EM heatmap overlay makes emission strategy visually legible for spectators — a player's stealth architecture becomes *visible* in its invisibility.
- **Signal genealogy (4.16)**: The Tier 3 live signal genealogy overlay brings the Inspector's most powerful diagnostic tool into the spectator experience.

## Comparable Games

- **StarCraft II Observer Mode**: Gold standard for esports spectating. Production tab, army supply, income graphs. Key lesson: observers need NUMBERS and SHAPES that tell the story at a glance. The channel topology diagram is Robot Uprising's equivalent of the production tab.
- **Dota 2 / League of Legends**: Item builds visible to spectators, ability cooldowns tracked. Gold graphs as match-state summary. The signal sparkline is the gold graph equivalent.
- **Into the Breach**: No spectator mode — matches are too short and too private. Robot Uprising's Gauntlet creates the competitive context that makes spectating meaningful.
- **Chess streaming (Hikaru/Levy)**: Evaluation bars and engine analysis during live commentary. The EDT diamond and counterfactual tools serve the same function — objective assessment layered onto subjective viewing.
- **Slay the Spire speedrun community**: Community analysis of runs through shared screenshots and tier lists. The Teaching Replay library extends this to structured searchable content.

## Sensory Description

The spectator experience at its best: the screen splits down the middle with a hairline gold divider. Left, a dense web of teal signal lines pulses with activity — a Command agent orchestrating five units through a 6-channel topology. Right, near-emptiness — two faint crimson lines connecting hidden scouts, the EM heatmap showing almost no footprint. The left thermometer glows amber; the right barely registers. The signal sparklines tell opposite stories — left is a jagged mountain range, right is a flat plain with occasional blips.

Then combat. The screen MERGES — both networks visible simultaneously. Teal and crimson lines cross and tangle. A striker advances; a scout retreats; a context bar fills red and the unit sparks and stutters. The kulintang audio swells — two harmonic layers colliding in dissonance. For 2.5 seconds, the full complexity of both architectures is visible in the same frame. Then the split returns, and one side has fewer units, fewer lines, a lower sparkline. The thermometer on the losing side is climbing toward red.

The TikTok clip: the 2.5-second merge moment, slowed to 0.5x, with both players' signal chains visible as overlapping neon webs on an isometric board. Caption: "Two AIs fighting is just this." 15 seconds. No explanation needed — the visual tells the story.
