# Onboarding: Observation Mode as Competitive Onboarding

**Aspect ID:** 1.06c-ext-D
**Wave:** 1 (Competitive Analysis) / 5 (Onboarding)
**Category:** Onboarding
**Related aspects:** 1.06 (Gladiabots), 1.06c-ext-B (config version control), 1.06c-ext-C (async-to-sync hybrid), 1.06c-ext-E (AI ghost matches), 5.01 (tutorial as puzzle), 5.03 (tutorial as sandbox), 7.03 (community sharing), 4.04a (debrief as debugger), 1.09 (Slay the Spire)

---

## The Core Idea

Before the player deploys a single config to competitive play, they can **watch other people's architectures fight**. Not a replay they stumbled upon — a curated, first-class "Observation Mode" that sits at the entrance to ranked play like a one-way mirror into a boxing gym. You press your face against the glass. You see two information architectures collide. You see one player's relay chain compress and forward intelligence that leads to a perfectly timed flanking strike on tick 14. You see the other player's command agent reroute hooks mid-battle and survive a noise-flood attack. You think: *I could do that. I want to try.*

The critical insight: **observation mode isn't spectator mode**. Spectator mode is for people who already play. Observation mode is for people who *don't yet play competitively* — it's a zero-risk, zero-commitment gateway that teaches the visual language of competitive play (the Inspector, the debrief, signal chains, context window dynamics) before the player puts their own architecture on the line.

### Why This Matters for Robot Uprising Specifically

Robot Uprising's competitive mode is architecturally unique: you don't play in real-time. You deploy a configuration, and it fights asynchronously. The result is a replay. This means **the competitive experience IS a replay experience**. The sealed watch → inspector flow that defines single-player missions is the same flow that defines competitive matches. If you can teach a player to read replays well, you've taught them to compete.

Most competitive games have a gap between "learning to play" and "learning to compete." In StarCraft, you learn mechanics in the campaign, but ladder play requires entirely different skills (build orders, scouting timing, macro). In Dota 2, you learn heroes in bot matches, but ranked requires draft knowledge, lane assignments, map awareness. The onboarding for competition is separate from the onboarding for the game.

Robot Uprising can close this gap. The Inspector skills that teach you to diagnose your campaign failures are the *exact same skills* that teach you to understand why your ranked config lost. Observation mode bridges the final distance: it shows you that the analytical tools you already know work on other people's architectures too.

### What Existing Games Do

**Dota 2's Watch tab** is the gold standard for in-client spectating. DotaTV provides live game spectating with multiple camera modes (directed, free, player perspective, hero chase), stat overlays (item charts, experience graphs, fight recaps), and a 2-5 minute delay for competitive integrity. Replays can be downloaded, scrubbed, bookmarked, and watched at variable speed. Pro players' replays are accessible through in-game and third-party tools (dotaprotracker, dotabuff, opendota). The learning path: watch pro → notice pattern → try in own game → review own replay → iterate. But DotaTV is a *spectator* tool, not an *onboarding* tool — it doesn't curate what you see, doesn't explain what you're watching, doesn't guide the transition from watching to playing.

**TFT lacked spectator mode for years** (finally added in Patch 14.1, late 2023). The community used Discord screensharing as a workaround. Riot acknowledged that for TFT to achieve mainstream competitive success, spectating was essential — but the feature was purely about watching friends and supporting tournaments, not onboarding new competitors.

**Gladiabots' sandbox mode** lets you control both teams and stress-test configurations against real player AIs drawn from the ranked pool. This is closer to observation-as-onboarding — you can watch how top-ranked AIs behave without risking your own rating. But it requires the player to actively set up the test, which is a higher friction barrier than simply browsing featured matches.

**CS:GO/CS2** delays spectated matches (GOTV) to prevent stream sniping. Spectators are invisible and cannot interact. Competitive mode blocks spectating entirely for friends — the risk of extra information outweighs the learning benefit.

**The pattern across all these games:** spectator features are designed for *existing competitive players* who want to watch others, not for *pre-competitive players* who need onboarding into the ranked ecosystem. Robot Uprising's observation mode would be novel in explicitly designing the spectator experience as an on-ramp.

---

## Three Observation Mode Variants

### Variant A: "The Gallery" — Curated Featured Matches

**What it is:** A permanent "Watch" screen accessible from the main menu, positioned between Campaign and Ranked. The Gallery shows 3-5 featured matches per day, algorithmically selected for drama and instructiveness. Each match has a short editorial blurb: "A compact 4-unit scout rush vs. a deep relay chain — watch how compression timing decides everything." The player clicks a match thumbnail and enters a special observation version of the Inspector.

**The observation Inspector** is identical to the post-mission Inspector the player already knows from campaign — same timeline scrubber, same click-to-inspect, same decision trace, same context window chart. But with two additions:

1. **Annotation overlays.** Key moments in the match have gold diamond markers on the timeline. Clicking a marker shows a brief annotation: "Tick 14: Blue's relay compresses 4 observations into 1 signal. This is why the striker arrives in time." The annotations are written by an automated system that detects tactically significant moments (context overloads, successful signal chains, kill sequences, hook reroutes) and generates explanations.

2. **Architecture comparison panel.** A split-panel view showing both players' blueprint configurations side by side. The observer can toggle between them. Each blueprint highlights the specific skills, rules, hooks, and context config that are relevant to the current tick — active rules glow, dormant ones dim. This makes the causal chain from configuration to battlefield outcome legible.

**What's NOT included:** No live chat. No social features. No leaderboard context. The Gallery is a quiet, analytical space — a library, not a stadium. The player is alone with two architectures and the tools to understand them.

**Screen layout:**
- Top bar: match title, player names (anonymized as "Blue" and "Red" by default, real names revealed on hover), match date, final outcome icon (Blue victory / Red victory / draw).
- Center: the 8x8 board in isometric view, identical to campaign sealed-watch. Signal chain lines visible in cyan and amber.
- Bottom: timeline scrubber with gold annotation diamonds. Tick counter. Speed controls (0.5x / 1x / 2x / step-by-step).
- Right sidebar: tabbed panel — "Blue Config" / "Red Config" / "Event Log" / "Annotations." The config tabs show the full blueprint editor in read-only mode, with active elements highlighted per tick.

**The transition to ranked:** After watching 3 Gallery matches, a subtle prompt appears on the Ranked menu: "You've studied 3 matches. Ready to deploy your own architecture?" This is not a gate — the player can access Ranked at any time. It's a nudge that acknowledges their preparation and frames their first deployment as a natural next step.

### Variant B: "The Apprenticeship" — Following a Featured Player

**What it is:** Instead of curated individual matches, the player follows a **featured architect** — a high-ranked player whose recent match history becomes a narrative. The Apprenticeship shows the featured player's last 5-10 competitive matches in sequence, with the player's configuration evolving across them. The observer sees not just individual battles but a **design trajectory** — how the architect iterated, what they changed after each loss, how their architecture grew.

**The narrative structure:** Each featured architect has an auto-generated story arc:
- "ARCHITECT-7 started Season 3 with a scout-heavy rush build. After losing to relay chains in matches 2 and 4, they added a compress relay and restructured their hook topology. By match 7, they had a hybrid architecture that could scout AND relay — and they climbed from Silver to Gold."
- The observer can scrub through this arc, seeing config diffs between matches, watching the sealed-watch for each battle, and inspecting the same way they would in campaign.

**What this teaches that The Gallery doesn't:** The Gallery teaches "how to read a match." The Apprenticeship teaches "how to iterate on a design." It shows the process of competitive improvement — the cycle of deploy → observe → diagnose → redesign → redeploy. This is the core loop of ranked play, and seeing it unfold over someone else's career makes it legible before the observer has their own career to analyze.

**The featured architect selection:** Algorithmically chosen for narrative quality — players who had dramatic rank climbs, who made interesting configuration pivots, who recovered from losing streaks. Not necessarily top-ranked players. A Silver-to-Gold climb is more instructive for a new player than a Grandmaster maintaining their position.

**Screen layout:**
- Left: a vertical "match timeline" showing 5-10 match thumbnails in chronological order, connected by a line. Each thumbnail shows outcome (win/loss icon), opponent rank, and a tiny config diff indicator (green = added skills, red = removed, amber = modified rules).
- Center: the selected match's sealed-watch or inspector view.
- Right sidebar: the featured architect's current config, with change highlights showing what was modified since the previous match. A "Config Diff" toggle overlays red strikethrough on removed elements and green highlights on added ones.
- Bottom: narrative text bar with the auto-generated story, advancing as the player scrubs through matches.

### Variant C: "The Mirror Match" — Your Config vs. The World

**What it is:** The player brings their own campaign-tested configuration and watches it fight against real competitive configs — without deploying to ranked. A sandbox simulation that uses actual ranked-pool architectures (anonymized) as opponents. The player does NOT control the battle — they watch the sealed watch and then inspect, exactly as they would in a real ranked match. But the result doesn't affect any rating.

**The bridge it builds:** This is the smallest possible step from "campaign player" to "competitive player." The player's config is already built. The opponent is real. The experience is identical to ranked. The only difference: no rating consequences. The player gets to answer the question "would my architecture survive ranked play?" without risk.

**The aha moment this is designed to produce:** The player watches their campaign-optimized architecture get dismantled by a competitive config that uses hook topologies and signal compression patterns they've never seen. They enter the inspector and trace the enemy's decision chain. They think: "I didn't know you could wire hooks that way." They return to the workbench and redesign. They try again. They iterate against real opponents in a zero-stakes environment until they feel ready. Then they deploy for real.

**What this teaches:** The Gallery teaches vocabulary. The Apprenticeship teaches process. The Mirror Match teaches **readiness** — it shows the player the gap between their current architecture and the competitive field, and gives them tools to close it.

**Screen layout:**
- Entry: "Test Your Architecture" button on the Ranked menu screen. Below it: "See how your config performs against real opponents. No rating changes."
- After clicking: opponent selection (random, or filtered by rank tier — "test against Silver" / "test against Gold"). Then the standard sealed-watch → inspector flow, identical to a real match.
- Post-match addition: a "Competitive Gap" panel that highlights specific differences between the player's config and the opponent's — "Opponent used 3 relay hops for signal compression; your architecture uses 0" — with links to relevant Blueprint Codex entries for the techniques demonstrated.

---

## Player Journeys

#### Journey: Priya, 28, Data Engineer — Campaign Veteran, Ranked Curious

**Context:** Priya has completed all 10 campaign missions. She's comfortable with the workbench, understands hooks and context windows, and has built a command-agent architecture she's proud of. She's seen the "Ranked" button on the main menu but never clicked it. She's afraid of losing to people who've been playing competitively for months.

**Minute 0:00 — The Watch Tab**
Priya notices a new tab on the main menu she hasn't explored: "Observe." It sits between "Campaign" and "Ranked," glowing with a soft amber pulse — the same pulse the EXECUTE button had in Mission 1. She clicks it.

The Gallery opens. Three match thumbnails arranged horizontally, each with a stylized isometric preview showing the final board state. The first is labeled: *"The Compression Gambit — BLUE's relay chain turns a 3-tick intelligence lag into a 1-tick advantage."* Below: "Silver rank • 47 ticks • Blue victory." She clicks it.

**Minute 0:30 — The Familiar Inspector**
The screen transitions to the Inspector — and Priya recognizes it immediately. Same timeline scrubber. Same click-to-inspect. Same decision trace panel. But instead of her own units, she's looking at two strangers' architectures fighting on a Cebu urban map she remembers from Mission 6. A gold diamond marker sits on tick 14. She clicks it.

An annotation fades in: *"Blue's RELAY-B compresses 4 scout observations into 1 priority signal and forwards to STRIKER-A. Cost: 2 context slots. Benefit: STRIKER-A receives actionable intelligence in 1 tick instead of 4."* Priya clicks the relay unit on the board. The decision trace shows which rule fired, which context entries it evaluated, which hook transmitted the compressed signal. She's seen this trace format hundreds of times in campaign debrief. But she's never seen anyone use compress this aggressively — her campaign relays filtered, but rarely compressed.

**Minute 2:00 — The Architecture Comparison**
Priya tabs to the "Blue Config" panel. She sees the full blueprint: a scout with wide-patrol and a hook on "recon-net," a relay with compress + filter skills listening on "recon-net" and emitting on "strike-cmd," a striker with rules prioritizing "strike-cmd" channel data over direct observations. She toggles to "Red Config." Red has more units but simpler hooks — each unit mostly acts on its own observations. No relay chain. She can see *why* Blue won: Blue's architecture turned 3 stupid units into 1 smart system. Red had 5 individually competent units that couldn't coordinate.

She thinks: *My campaign architecture looks like Red's. I need relay chains.*

**Minute 4:00 — The Nudge**
Priya returns to the Gallery and watches a second match — this one showing a command agent rerouting hooks mid-battle. Then a third. When she returns to the main menu, a small text appears below the "Ranked" button: *"You've studied 3 matches. Your architecture is ready for a real test."* She doesn't click Ranked yet. But she opens the workbench and starts redesigning her relay topology.

**Minute 8:00 — The Mirror Match**
She finds the "Test Your Architecture" option. She selects "Silver opponents." She watches her redesigned config fight a real Silver-ranked architecture. Her new relay chain works — the compressed signals reach her striker in time. But her context config is too permissive: the striker gets overloaded on tick 22 and stuns for 1 tick, which is enough for the enemy to flank. The post-match "Competitive Gap" panel highlights: *"Your striker's context window (8 slots) filled by tick 20. The opponent's striker uses ignore filters on low-priority channels — consider adding context config filters."*

She redesigns. Tests again. This time her striker survives without overload. She clicks "Ranked."

**UI Annotations:**
- Gallery thumbnails: 280×180px isometric board captures with a frosted-glass overlay showing match metadata. Hover reveals a 3-second looping animation of the match's climactic moment.
- Gold annotation diamonds: 12px diamond shapes on the timeline, pulsing gently. Click expands a 2-line annotation in a floating tooltip anchored to the timeline position.
- "Competitive Gap" panel: post-match right-sidebar tab with bullet points, each showing an icon (skill/hook/rule/context), a description, and a "Learn More" link to the Blueprint Codex.
- "Test Your Architecture" button: outlined button (not filled) with a shield icon, positioned below the primary "Deploy to Ranked" button. Visually secondary — it's an option, not a gate.

---

#### Journey: Marcus, 16, High School Student — Never Played a Strategy Game

**Context:** Marcus downloaded Robot Uprising because a TikTok clip showed someone's scout relay chain perfectly flanking an enemy base. He completed Missions 1-4 and thought the factory introduction in Mission 5 was cool, but he's stuck on Mission 7. He's never touched competitive. He doesn't know what "Silver rank" means.

**Minute 0:00 — Accidental Discovery**
Marcus is on the main menu trying to figure out how to beat Mission 7. He sees "Observe" and clicks it thinking it might have hints for campaign missions. The Gallery loads. The first featured match has a tagline: *"When hooks go wrong — RED's chain reaction stuns 3 units in 2 ticks."* Marcus thinks: "That sounds like what happened to me in Mission 7." He clicks.

**Minute 0:15 — Learning by Watching Others Fail**
The sealed watch plays. Marcus watches Red's architecture — it looks similar to his Mission 7 setup. Red has 4 units all listening on the same channel. On tick 8, the enemy floods the channel with noise signals. All 4 of Red's units receive the noise simultaneously. All 4 context windows fill. All 4 stun on tick 9. Three die on tick 10. Marcus leans forward. *That's exactly what happened to me.*

The annotation on tick 8 reads: *"RED's 4 units all listen on 'alert-all.' Enemy SPECIALIST emits noise on 'alert-all.' All 4 context windows fill simultaneously → mass stun. Countermeasure: separate channels or ignore filters."*

**Minute 1:30 — The Eureka Transfer**
Marcus clicks Blue's config. Blue has the same unit types but uses *three* different channels instead of one shared channel. The scouts report on "forward-eyes," the relay compresses on "relay-cmd," and the striker listens only on "relay-cmd." When the enemy floods "forward-eyes," only the scouts stun — the relay and striker are unaffected because they don't listen on that channel.

Marcus doesn't just learn how to beat Mission 7. He learns a *principle*: channel separation prevents cascade failures. He exits the Gallery, opens Mission 7's workbench, and splits his single channel into three. He beats the mission on his next attempt.

**Minute 5:00 — Curiosity About Ranked**
After beating Mission 7, Marcus returns to the Gallery voluntarily. He watches two more matches. He notices that competitive players use techniques he hasn't seen in campaign — hook rerouting, dynamic context eviction priorities, specialist hack sequences. He thinks: "These people are way better than campaign enemies." He doesn't click Ranked. He goes back to Mission 8. But now he's building architectures that are competitive-grade — because he's seen what competitive-grade looks like.

**UI Annotations:**
- Mass stun moment: on the sealed watch, all 4 Red units flash with the sparking/jittering stun animation simultaneously. The context bars (tiny colored pips) at the bottom of each unit tile all snap from half-full to bright red in one tick. A bass-heavy "thwoom" sound plays — the visceral weight of cascade failure.
- Channel visualization: during the sealed watch, dashed lines showing signal flow. When the noise flood hits, the "alert-all" channel lines flash angry red in rapid succession, terminating at each stunned unit. Blue's "relay-cmd" channel lines remain calm cyan.
- Gallery taglines: white text on dark background, sentence-case, slightly larger font than metadata. Designed to hook curiosity — written like video essay titles, not technical descriptions.

---

#### Journey: Zara, 34, Twitch Streamer — Content Creator Exploring the Game

**Context:** Zara streams strategy games to 2,000 viewers. She picked up Robot Uprising last week, blew through the campaign in two streams (her chat helped with Mission 9), and wants to start competitive content. Her audience expects her to narrate her thought process. She needs to understand competitive meta before deploying.

**Minute 0:00 — The Apprenticeship**
Zara clicks "Observe" and selects the Apprenticeship tab. She sees three featured architects: one who climbed Bronze to Silver in 8 matches, one who pivoted from rush builds to relay chains after a losing streak, one who maintained Diamond rank by counter-building each opponent. She picks the Bronze-to-Silver climber — relatable for her audience.

**Minute 0:30 — Narrating the Arc**
The Apprenticeship shows ARCHITECT-12's first match: a simple 3-scout rush. It loses badly — the opponent's relay chain outmaneuvers the scouts. The auto-narrative reads: *"Match 1: Direct engagement. Three scouts, no relay, no coordination. Result: elimination by tick 18."* Zara reads this aloud to her stream. "Okay chat, this person did what we did in Mission 2. Let's see how they improve."

Match 2: ARCHITECT-12 adds a relay. Match 3: adds a hook from scout to relay. Match 4: loss — the relay's context window overloads. Match 5: adds an eviction rule prioritizing recent data. Matches 6-8: steady improvement, reaching Silver.

Zara scrubs through the config diffs, narrating each change: "Look — after Match 4, they changed the eviction priority from 'oldest first' to 'lowest priority first.' That single slider change fixed the overload problem." Her chat is engaged. The Apprenticeship gives her a pre-built narrative to react to — she doesn't need to generate content from scratch.

**Minute 6:00 — The Mirror Match as Content**
Zara brings her campaign config to the Mirror Match. She selects "Silver opponents." Her stream watches the sealed watch together — Zara can't skip or pause, so the tension builds naturally. Her architecture wins, barely. Chat explodes. She inspects the replay, finding a near-miss overload on tick 31. She opens the Competitive Gap panel: *"Your command agent's 6 hook slots are only using 2. Expanding your hook topology would improve signal coverage."*

Zara says: "Okay chat, tomorrow we deploy to Ranked for real. But first I need to fill those hook slots." She spends the remaining stream redesigning, using Gallery matches as reference for hook topology patterns she hasn't tried.

**Minute 15:00 — The Stream Ends**
Zara's stream title for tomorrow: "RANKED DEBUT — Our architecture vs. the world." Her audience is invested in the architecture they've been building together. Observation mode gave her 15 minutes of engrossing content without touching ranked. The deployment stream will be the payoff.

**UI Annotations:**
- Apprenticeship match timeline: vertical strip on the left, each match a 64×64 thumbnail with a colored border (green = win, red = loss, amber = close win). Connected by a thin line with small arrows. The current match is enlarged (96×96) with a glowing gold border.
- Config diff overlay: split-view showing previous config on the left (dimmed) and current config on the right (bright). Changed elements connected by thin amber lines. Added elements have green "+1" badges. Removed elements have red strikethrough.
- Auto-narrative text: runs along the bottom in a dark translucent bar, serif font (contrast with the UI's sans-serif), typewriter animation at 40 characters/second. Feels like reading a match report. Pauses at the end of each sentence for 2 seconds.

---

## Strengths

1. **Zero-risk entry to competitive.** The single biggest barrier to competitive play in strategy games is fear of losing. Observation mode eliminates the risk entirely while building the skills and vocabulary needed to compete. The player's first ranked deployment is informed, not blind.

2. **Reuses existing UI.** The Inspector, timeline scrubber, decision trace, and blueprint editor already exist. Observation mode adds annotation overlays and comparison panels, but the core interaction patterns are identical to campaign debrief. No new UI paradigm to learn.

3. **Teaches replay literacy.** In an async competitive game where the competitive experience IS a replay, teaching players to read replays fluently is the highest-leverage onboarding investment. Every minute spent in Observation mode builds skills that transfer directly to competitive self-analysis.

4. **Content creation fuel.** The Apprenticeship variant provides pre-built narrative arcs for streamers to react to. The Mirror Match provides dramatic zero-stakes content. Both generate viewable moments that attract new players.

5. **Solves the "empty ranked queue" problem.** If competitive is scary and campaign is safe, many players will never cross over. Observation mode is the bridge. It moves players from "I'll never try ranked" to "I'm curious" to "I'm ready." The Mirror Match specifically addresses cold-feet syndrome.

## Weaknesses

1. **Content curation cost.** The Gallery requires algorithmically selecting interesting matches and generating useful annotations. Bad curation (boring matches, unhelpful annotations) would make the feature feel dead. The annotation system needs to be genuinely insightful, not generic.

2. **Spoiler effect.** If observation mode shows the "best" competitive strategies, it could homogenize the meta — everyone copies the featured builds. Mitigation: feature diverse strategies, not just winning ones. Show multiple ways to win.

3. **False confidence from Mirror Match.** The Mirror Match uses real opponents but the player can retry indefinitely with no consequences. A player who wins 5 Mirror Matches might deploy to Ranked expecting to dominate, then lose because ranked opponents adapt to the meta while Mirror Match opponents are static snapshots.

4. **Observation mode as procrastination.** Some players will watch forever and never deploy. The feature needs soft nudges without hard gates — you can always observe, but the game gently suggests deployment after sufficient observation.

5. **Privacy concerns in Apprenticeship.** Showing real players' ranked histories (even anonymized) raises questions. Players might not want their losing streaks featured as learning material. Opt-in system required, or use only AI-generated architect histories.

---

## Interaction Effects

**With async PvP (1.06c-ext-B):** Observation mode pairs perfectly with async competitive — both are replay-native experiences. The player transitions from watching others' replays (observation) to watching their own replays (ranked debrief). No mode-switch friction.

**With AI ghost matches (1.06c-ext-E):** If the competitive pool is small, AI ghosts can populate the Gallery and Mirror Match. The player doesn't need to know whether the featured match is human vs. human or human vs. AI ghost — the learning value is the same.

**With the Blueprint Codex (locked narrative):** The "Competitive Gap" panel in Mirror Match links to Codex entries. Observation mode drives Codex engagement — the player sees a technique in action, then reads the reference entry to understand the theory. Codex becomes a companion to observation, not just a standalone reference.

**With campaign Mission 7+ (locked):** Marcus's journey shows how Gallery matches can unstick campaign players. The observation mode inadvertently teaches campaign skills by showing competitive solutions to problems that also appear in campaign missions (channel separation, compression timing, context config tuning).

**With community sharing (7.03):** Featured matches in the Gallery could include community-submitted "highlight reels" — players nominating their best matches for curation. This creates a virtuous cycle: play ranked → have a great match → submit to Gallery → new players watch → get inspired → play ranked.

**With the Inspector (locked):** Observation mode is the Inspector's marketing campaign. Every minute in the Gallery reinforces Inspector fluency. By the time the player reaches ranked, the Inspector is second nature — they don't need to learn it under the pressure of analyzing their own losses.

---

## Comparable Games & Media

**Dota 2's Watch Tab:** The closest existing implementation. DotaTV + replay system provides the infrastructure, but Dota doesn't curate for onboarding. Robot Uprising's Gallery is DotaTV with editorial curation and pedagogical annotations — the difference between a library and a curated museum exhibition.

**Fighting game "replay channels":** Street Fighter 6's "Battle Hub" includes screens where you can watch other players' fights. The social context (you're in a virtual arcade watching the screen next to you) makes observation feel natural and low-pressure.

**Chess.com's "Game of the Day":** A daily featured game with move-by-move annotations explaining strategic decisions. The model is nearly identical to the Gallery's annotated matches — curated content with pedagogical overlays.

**YouTube/Twitch strategy game content:** Day[9]'s StarCraft dailies, Kripparian's Hearthstone, Disguised Toast's TFT — all are observation-mode experiences delivered through external platforms. Robot Uprising would bring this inside the game client.

**Sports film rooms:** Professional athletes watch game film to study opponents and their own performance. The Apprenticeship variant is literally a film room — studying another architect's season of performance to learn patterns.

---

## Sensory Description

**The Gallery entrance:** A dark screen with three match thumbnails floating on a subtle grid pattern — faint cyan lines on near-black, reminiscent of a server room floor. Each thumbnail shows a frozen isometric board state with units mid-action, color-graded cool (blue team) and warm (red team). Hovering a thumbnail triggers a 3-second animation loop — the match's most dramatic 3 ticks playing in miniature. A soft ambient hum, like the idle tone of a data center, plays in the background. No music. This is a place of study, not spectacle.

**Annotation diamond appearance:** When you scrub to a gold-diamonded tick, the diamond expands with a crystalline chime — a single high note, like tapping a wine glass. The annotation text fades in below the timeline in warm amber, slightly brighter than the surrounding UI. The text appears character by character at reading speed, not all at once — it feels like someone is writing it in real time, like a mentor's handwritten note appearing in the margin of a textbook.

**The Mirror Match sealed watch:** Identical to campaign sealed watch — but with one difference. Your units have a faint cyan outline (your architecture, your creation). The opponent's units have no outline. When your unit acts — moves, fires, transmits — the cyan outline pulses brighter for a half-second. You feel ownership. When your unit gets stunned, the cyan outline flickers and dims, and you feel the loss viscerally — that's YOUR design failing, not an abstract game state. A low-frequency vibration accompanies the stun, like a hard drive grinding to a halt.

**The Competitive Gap panel:** Appears post-match with a sliding animation from the right edge. Each gap entry has a left-side icon (skill = wrench, hook = chain link, rule = gavel, context = window frame) in a muted color, and a right-side text description in clean white sans-serif. A thin progress bar below each entry shows "your architecture vs. opponent" — your bar in cyan, opponent's in amber. Where the opponent exceeds you, the amber extends past your cyan and the excess glows softly. Where you exceed the opponent, your cyan extends and the opponent's bar is dimmed. The asymmetry is immediately legible — you can see your strengths and gaps at a glance without reading a word.

---

## The TikTok Clip

**15 seconds:** A player opens the Gallery. Clicks a featured match. The sealed watch shows two armies colliding — Red's 4 units all stun simultaneously in a cascade of sparking, jittering animations. The camera zooms to show all 4 context bars slamming red at once. Bass thwoom. Cut to the annotation: *"One channel. Four listeners. One noise flood. Total cascade."* Cut to the player opening Blue's config — three separate channels visible. Text overlay: **"Watch. Learn. Then deploy."** Cut to the Ranked menu. Click. Deploy.
