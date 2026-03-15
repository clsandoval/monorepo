# Async Challenges: "Beat My Architecture" Shareable Puzzles

**Aspect:** 7.03 — Asynchronous challenges as community content: player-generated puzzles, shareable architecture configurations, curated challenge feeds, and the social infrastructure of "can you beat this?"

**Category:** multiplayer/community
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising has a unique property among strategy games: **the player's creative artifact is a configuration, not a replay.** In chess, the artifact is a game record. In Factorio, it's a blueprint. In Slay the Spire, it's a run seed. In Robot Uprising, the thing worth sharing is an *attention architecture* — a complete set of blueprints, hooks, channel wiring, rules, and context configs that together produce emergent behavior.

This means the game's community content isn't levels or maps — it's **systems**. A shared Robot Uprising challenge isn't "play this level" but "can your system beat my system?" or "can you fix this broken system?" or "can you design a system that survives this scenario?" The sharing unit is the configuration itself, and configurations are both the question AND the answer.

The fundamental design question: **what are all the ways players can create, share, consume, and compete around configurations as community content?**

---

## Seven Challenge Models

### Model 1: "The Puzzle Box" (Fix My Broken Architecture)

**How it works:** A player creates a pre-built configuration with an intentional flaw — a buffer overflow on the relay, a dead-end channel, a rule ordering bug, a missing hook — and publishes it as a puzzle. The solver must identify and fix the flaw using a limited modification budget (e.g., "change exactly 2 rules" or "add 1 hook"). The puzzle succeeds when the solver's modified config passes the attached scenario.

**What the creation screen looks like:**
The player opens the workbench in **Puzzle Author** mode (accessible from the community hub, not the campaign). The left panel shows the familiar 8×8 board with a scenario loaded — enemy positions, terrain, objectives. The right panel is the full workbench, but with an additional toolbar at the top: a row of constraint toggles. The first toggle reads "Modification Budget" with a dropdown: *1 change / 2 changes / 3 changes / unlimited*. The second toggle: "Allowed Modifications" with checkboxes: *rules / hooks / context config / skills / production queue*. The third: "Hint Level" with radio buttons: *none / warm-cold / explicit*.

Below the toolbar, a **Flaw Marker** button (shaped like a tiny red bug icon) lets the author secretly tag which element contains the intentional flaw. This tag is invisible to solvers but stored in the puzzle metadata for analytics — when 80% of solvers fix the tagged element, the puzzle is well-designed; when most solvers fix something else, the flaw is ambiguous.

When the author hits PUBLISH, the screen shows a preview card: the scenario map as a thumbnail, the modification budget prominently displayed, the author's name and avatar, and a **Proof of Solvability** badge — a green checkmark confirming the author solved their own puzzle before publishing (the Opus Magnum requirement: you cannot publish what you cannot solve).

**What the solver screen looks like:**
The solver opens the puzzle and sees the Plan screen with the author's configuration pre-loaded. Every element has a subtle lock icon overlay — a tiny grey padlock in the corner of each rule card, each hook slot, each context config dial. The modification budget is displayed as a counter in the top-right: "Changes remaining: 2" in a chunky pill-shaped badge.

When the solver clicks a locked element, the padlock animates — it jiggles, then cracks open with a satisfying metallic *click* sound. The element becomes editable, and the counter decrements. If the solver changes their mind, they can re-lock (undo) with a long-press, and the counter increments back. The padlock re-seals with a soft *thunk*.

The solver hits EXECUTE. The Sealed Watch plays. If the modified config passes the scenario, a victory screen shows: "PUZZLE SOLVED" with a confetti burst of tiny gear icons, the solver's change list displayed as a diff ("Changed: RELAY-B Rule #3 priority from 5→2"), and a **Compare** button that reveals the author's intended solution alongside the solver's.

**Strengths:**
- **Teaches debugging.** The puzzle format IS the Inspector skill expressed as gameplay. Every puzzle box trains diagnostic reasoning. Players who solve 50 puzzle boxes become dramatically better at debugging their own configs.
- **Low creation barrier.** Any player who's completed Mission 5+ can create a puzzle box — take a working config, break it deliberately, set constraints. No level design skill required.
- **Multiple valid solutions.** Because the solver can fix any element (within budget), puzzle boxes are open-ended. The author's intended fix and the solver's actual fix often differ — the Compare screen makes this visible and educational.
- **Comparable precedent.** Chess puzzles have sustained community engagement for centuries with exactly this format: a position, a constraint ("White to play and mate in 2"), and an open solution space.

**Weaknesses:**
- **Flaw ambiguity.** A config might have multiple bugs. The author intended a specific fix, but the solver found a different bug entirely. Is the puzzle poorly designed or the solver creative?
- **Difficulty calibration.** There's no way to know how hard a puzzle is until people attempt it. Pass rate emerges from community play, not author intent.
- **Narrow expressiveness.** "Fix this thing" is only one kind of challenge. Players who want to CREATE, not diagnose, need a different model.

**Sensory description:**
The puzzle box screen feels like a crime scene investigation. The pre-loaded config sits on the workbench like evidence — you can look but not touch (until you spend your modification budget). The locked padlocks give the whole interface a *sealed* quality, like opening a watch case. The crack-open animation when you spend a change is the most satisfying micro-interaction in the game — the padlock splits into two halves that tumble apart with a tiny particle burst of metal shavings, and the element beneath glows warm amber for a half-second as it becomes live. The counter decrementing feels weighty. Two changes feels like enough; one change feels like a scalpel.

**The TikTok clip:** Split screen. Left: creator places a hook on the wrong channel, smiles, hits PUBLISH. Right: solver stares at the config for 20 seconds, eyes narrow, clicks ONE rule, hits EXECUTE. Units sweep the board flawlessly. Text: "Fixed your entire army by changing one rule."

---

### Model 2: "The Gauntlet Seed" (Beat My Scenario)

**How it works:** A player designs a scenario — enemy composition, terrain layout, objective, tick limit — and publishes it without any player-side configuration. The challenge is: "design a config from scratch that beats this scenario." The leaderboard ranks solutions by efficiency metrics (ticks to complete, units lost, EM emissions, buffer utilization).

**What the creation screen looks like:**
**Scenario Author** mode. The board dominates the left 60% of the screen. The author places enemy units by dragging from a palette on the right — each enemy type as a tile with its icon (🤖 for enemy scout, red ⚔ for enemy striker). Terrain is painted with a brush tool: click a tile, cycle through terrain types (jungle, beach, city, terrace, jammer field). The objective selector sits at the top: "Destroy all enemies / Destroy enemy base / Tag N nodes / Survive N ticks / Escort VIP to exit."

A **Test Play** button in the bottom-right lets the author attempt their own scenario before publishing. The Opus Magnum proof-of-solvability applies: you must beat your own scenario at least once. But unlike Puzzle Box, the author's solution is NEVER revealed — the leaderboard IS the content.

Below the test button, a **Difficulty Estimator** — a horizontal gauge with five segments labeled "Tutorial / Easy / Medium / Hard / Nightmare" — estimates difficulty based on enemy count, terrain hostility, and tick limit. This is a rough heuristic, not a guarantee, and updates in real-time as the author adjusts the scenario. The gauge pulses gently when the scenario crosses a difficulty threshold, and a tooltip reads: "Estimated based on scenario complexity. Actual difficulty depends on community skill."

**What the solver screen looks like:**
The solver opens the Gauntlet Seed and sees an empty Plan screen — no pre-loaded config. The board shows the scenario: enemies in position, terrain painted, objective displayed in the top-center bar. The right panel is the full, empty workbench. Build from scratch.

After solving, the solver sees a **Zachtronics Histogram** — three overlapping distribution curves (ticks to complete, units lost, total EM emissions) comparing their solution to all other solvers. The solver's position is marked with a bright vertical line on each curve. Below the histograms, a **Leaderboard** tab shows the top 10 solutions by each metric, with clickable entries that play the replay.

**Strengths:**
- **Zachtronics optimization culture.** The histogram is the engine. Players don't just beat the scenario — they optimize. "I beat it in 34 ticks. Can I do 28?" This is the replayability loop that sustained Opus Magnum for years.
- **Community difficulty calibration.** The histogram shows difficulty implicitly. A scenario where 90% of solvers cluster at 60-80 ticks is moderate. A scenario where the top solver took 120 ticks and the median is DNF is a nightmare. No designer labeling needed.
- **Creative expression.** Unlike Puzzle Box (diagnosis), Gauntlet Seeds test creation. The solver starts from nothing. Their architecture is fully their own.
- **Streamer gold.** "Can I beat this community scenario?" is a natural streaming prompt. The histogram provides live comparison context.

**Weaknesses:**
- **Higher creation barrier.** Designing a good scenario requires understanding enemy placement, terrain balance, and objective difficulty. Not every player has level-design instincts.
- **Solvability verification.** The author must prove solvability, but their proof might use an unusual strategy that most players won't discover. The scenario might be "technically solvable" but practically impossible for 95% of the community.
- **Histogram sparsity.** With a small community, histograms are empty. A scenario needs ~50 solutions before the curves become meaningful.

**Sensory description:**
The Gauntlet Seed screen has a different color temperature than the campaign. Campaign missions have a warm amber Plan screen. Gauntlet Seeds shift the workbench panel to cool slate blue — subtle but perceptible, signaling "community content, not curated." The histogram screen uses the Zachtronics palette: soft grey backgrounds, thin colored lines for the distribution curves (green for ticks, amber for units lost, red for emissions), and the player's own marker as a thick white line with a gentle pulsing glow. The feeling is clinical, comparative, aspirational — "I'm good, but the curve shows someone is better."

**The TikTok clip:** Zoom into a histogram. The player's line is at the 70th percentile. They grimace, go back to the workbench, rebuild the entire relay network, hit execute. Cut to the new histogram: 95th percentile. Fist pump. Text: "From 'fine' to 'top 5%' by changing the channel architecture."

---

### Model 3: "The Config Duel" (My Architecture vs. Yours)

**How it works:** A player publishes their configuration WITH a specific scenario and challenges others to beat it. Not "design a config for this scenario" (Gauntlet Seed) but "design a config that beats MY config on this scenario." The published config IS the enemy. It's PvP expressed as a community challenge — asynchronous, one-to-many.

**What the creation screen looks like:**
The author opens the Plan screen with a working config loaded. They select a scenario (from campaign, from Gauntlet Seeds, or a custom scenario). They hit a new button: **CHALLENGE** (distinct from EXECUTE and DEPLOY). A dialog appears:

```
┌─────────────────────────────────────┐
│  CHALLENGE THE COMMUNITY            │
│                                     │
│  Your config becomes the enemy.     │
│  Challengers design a counter.      │
│                                     │
│  Scenario: Mission 6 - Siege        │
│  Your units: [preview grid]         │
│  Your channels: [topology diagram]  │
│                                     │
│  Visibility:                        │
│  ○ Open (challengers see your full  │
│    config before building)          │
│  ○ Sealed (challengers see only     │
│    unit composition, not wiring)    │
│  ○ Blind (challengers see nothing   │
│    — pure counter-design)           │
│                                     │
│  [ PUBLISH CHALLENGE ]              │
└─────────────────────────────────────┘
```

The three visibility modes create three fundamentally different challenge types:
- **Open:** Pure optimization. The challenger knows everything and must build a counter. Tests analytical skill.
- **Sealed:** Partial information. The challenger knows the unit mix but not the attention architecture. Tests adaptive design.
- **Blind:** Zero information. The challenger builds a general-purpose config that must beat an unknown opponent. Tests robustness.

**What the solver screen looks like:**
For **Open** visibility, the solver sees the author's full config in a read-only panel on the left, with their own empty workbench on the right. They can inspect every rule, every hook, every channel. The board shows both armies in their starting positions — the author's units in red, the solver's ghost units in blue.

For **Sealed**, the left panel shows only unit types and positions — red icons on the board, a composition summary ("2 Scouts, 1 Relay, 2 Strikers, 1 Command") — but the workbench inspector is locked. A frosted-glass overlay covers the config panel with the text: "Architecture sealed. Design your counter."

For **Blind**, the left panel shows only the scenario terrain. No enemy information at all. The board shows terrain and the solver's own ghost units. A single line of text at the top: "An unknown opponent awaits."

After the solver hits EXECUTE, the Sealed Watch plays with both armies on the board. The outcome: win, lose, or draw (both bases destroyed same tick). The leaderboard shows win rate against this challenge, plus efficiency metrics for winners.

**Strengths:**
- **Natural competitive progression.** Config Duels bridge the gap between campaign and Gauntlet PvP. A player who isn't ready for live matchmaking can challenge individual configs at their own pace.
- **Visibility modes create depth.** Open/Sealed/Blind are three different skills. A player might excel at Open challenges (analysis) but struggle with Blind (robustness). This creates a richer skill profile than "win rate."
- **Streamer-friendly.** "This config has a 94% win rate. Can I crack it?" is premium content. The solver's thought process — analyzing the config, identifying weaknesses, designing a counter — is inherently watchable.
- **Config improvement culture.** When your published challenge gets beaten, you can study the winning counter-config and improve. The challenge-response cycle drives architectural evolution.

**Weaknesses:**
- **Asymmetric advantage.** The challenger always has more information than the author (who designed the config without knowing the challenger's approach). Open visibility amplifies this — the challenger can hard-counter perfectly. Win rates skew toward challengers.
- **Power creep.** Over time, community configs improve. Early challenges become trivially beatable. There's no natural difficulty floor.
- **Grief potential.** A player publishes a deliberately impossible challenge (e.g., 6 Command agents with perfect wiring that no starter config can beat). Moderation needed.

**Sensory description:**
The Config Duel screen has a martial atmosphere. The board is split — a faint vertical line bisects it, with the author's units on the left in a warm red glow and the solver's staging area on the right in cool blue. The visibility modes change the left half's rendering: Open shows full configs with readable text and wiring lines; Sealed shows unit silhouettes with a shimmering frosted-glass panel obscuring the details; Blind covers the entire left half in a smoky grey fog that swirls slowly, occasionally revealing the terrain beneath.

When the solver hits EXECUTE, the dividing line dissolves with a horizontal-wipe animation — like a curtain rising — and both armies are revealed on the full board. For Blind challenges, this reveal moment is electrically tense: the fog burns away from center-out, revealing enemy positions one by one, each appearance punctuated by a sharp *ping* sound and a brief red flash on the revealed tile.

**The TikTok clip:** Blind challenge. The fog burns away. Five enemy units appear. The player's face: shock, then calculation, then they whisper "Oh no, that's a relay chain." Their units engage. Chaos. Final tick: their striker reaches the enemy base by one tile. Win. Text: "Blind challenge, first attempt, one tile."

---

### Model 4: "The Daily Seed" (Curated Rotating Challenge)

**How it works:** Every 24 hours, the game presents ONE challenge — same for all players worldwide. It could be any of the three types above (Puzzle Box, Gauntlet Seed, Config Duel) rotated on a schedule. All players attempt the same challenge, and a global leaderboard ranks results. One attempt per player, no retries on the leaderboard (though unlimited practice runs are allowed that don't submit).

**What the screen looks like:**
The main menu shows the Daily Seed prominently — a rotating hexagonal badge in the top-right corner with today's challenge type icon (🔧 Puzzle Box, 🏔 Gauntlet Seed, ⚔ Config Duel). Tapping it opens the Daily Challenge screen.

The Daily Challenge screen has a countdown timer at the top: "Ends in 14h 32m." Below, the challenge details — same presentation as the relevant challenge type, but with a gold border and a "DAILY" ribbon in the corner. At the bottom, two buttons side by side: "PRACTICE (unranked)" and "SUBMIT (ranked, one chance)."

The SUBMIT button pulses gently with a gold glow. Pressing it triggers a confirmation dialog: "This is your one ranked attempt. Ready?" with a 3-second cooldown before the CONFIRM button activates — preventing accidental submissions. After submission, the button greys out: "Submitted. Rank: calculating..." which updates in real time as other players submit.

The leaderboard refreshes hourly and shows:
- **Top 10** with full replays viewable
- **Your rank** (highlighted in gold)
- **Friend rankings** (if social features exist)
- **Distribution histogram** (Zachtronics-style, appearing after 100+ submissions)

**Post-challenge reveal:**
When the timer expires, a "DAILY REVIEW" event unlocks. The top-ranked solution plays as a featured replay. The author of the daily challenge (if community-sourced) is credited. A brief design analysis — auto-generated or community-voted — highlights what made this challenge interesting.

**Strengths:**
- **Shared experience.** Unlike the atomized challenge types above, the Daily Seed is a communal event. "Did you do today's daily?" becomes a conversation starter. Slay the Spire's Daily Climb proved this creates sticky community engagement.
- **Content curation.** Daily challenges can be hand-picked by designers or algorithmically selected from the best community submissions. This solves the quality problem of open community content.
- **One-shot tension.** The single ranked attempt creates high-stakes drama. Every decision matters. The practice mode provides a safety valve for players who want to experiment first, but the leaderboard respects commitment.
- **Streamer calendar.** Daily content creates a streaming rhythm. "Daily challenge run" is a dependable content format.

**Weaknesses:**
- **Timezone inequality.** Players in some timezones get the challenge fresh; others get it with 20 hours of community discussion already public. Spoiler culture becomes a real issue.
- **One-shot frustration.** A player who misclicks during their ranked attempt has no recourse. The stakes might be too high for casual players.
- **Slay the Spire's lesson.** The Daily Climb eventually became dominated by experienced players who used community-shared optimal routes. "Daily" became "daily for the top 1%, irrelevant for everyone else." Robot Uprising needs anti-degenerate design.
- **Content pipeline.** Someone needs to create or curate daily challenges. This is a sustainability cost.

**Anti-spoiler design:**
To combat the Slay the Spire problem, Robot Uprising's Daily Seed uses **sealed submission windows**. The 24-hour period is split into 4 six-hour windows. Submissions within each window are ranked separately, then combined into a global ranking weighted by window difficulty (earlier windows might have less community discussion and are weighted slightly higher). This doesn't eliminate spoilers but reduces their impact.

Additionally, the Daily Seed uses **invisible randomization within constraints** (matching the locked narrative design). Each player's instance has the same enemy composition and terrain, but enemy starting positions vary by ±1 tile per the deterministic seed derived from the player's ID. This means community-shared "exact solutions" don't transfer perfectly — each player must adapt the approach to their specific layout.

**Sensory description:**
The Daily Seed badge on the main menu rotates slowly, catching light on its hexagonal facets like a physical token. When a new daily drops, the badge bursts with a brief particle shower — tiny golden sparks that dissipate in 2 seconds — and a low-pitched *gong* sound, felt more than heard. The challenge type icon in the badge's center fades in with a gentle zoom.

The countdown timer uses a monospace font, cycling seconds with a mechanical *tick* feeling. When under 1 hour, the timer shifts from white to amber. Under 10 minutes, it pulses red. The last 60 seconds show a progressing circle animation around the badge.

After submission, the rank display uses an elevator metaphor — the number starts high and slides down as better solutions are submitted, or holds firm. Watching your rank hold while the submission count rises is deeply satisfying. The number uses a seven-segment display font, reminiscent of old-school scoreboards.

**The TikTok clip:** The Daily Seed drops. Split-screen of 4 players around the world (bedroom, coffee shop, train, office). All open the same challenge simultaneously. Fast cuts between their Plan screens — different architectures taking shape. All hit SUBMIT within minutes of each other. Leaderboard numbers fly. One player lands #1. Fist pump. Text: "Same puzzle. 50,000 players. One winner."

---

### Model 5: "The Workshop" (Configuration Library)

**How it works:** An open library where players upload full configurations — not as challenges but as ARTIFACTS. "Here's my scout network design. Study it. Use it. Modify it. Learn from it." The Workshop is to Robot Uprising what the Steam Workshop is to Opus Magnum or what GitHub is to Screeps — a repository of community knowledge.

**What the screen looks like:**
The Workshop is a dedicated section of the community hub, visually distinct from challenges. The layout resembles a code repository more than a game store:

The main feed shows **Config Cards** — rectangular tiles arranged in a masonry grid. Each card shows:
- The config name ("The Silent Relay Chain v3.2")
- Author avatar and name
- A tiny 8×8 board thumbnail showing unit positions and channel wiring
- Tags: "Stealth", "Relay-heavy", "Mission 7+", "Gauntlet-viable"
- Stats: ⭐ 127 favorites, 📋 43 forks, 👁 892 views
- A **Lineage Badge** showing the fork chain: "Forked from @alice's Silent Chain v2.1 → @bob's Whisper Net v1.0"

Clicking a Config Card opens the **Config Inspector** — a read-only view of the full workbench. Every blueprint, every rule, every hook, every channel, every context config — all visible, all annotated by the author with optional inline comments (small yellow sticky-note overlays on individual elements: "This rule handles the edge case where scouts report stale data after tick 20").

Below the Inspector, three action buttons:
- **Import to Workbench** — copies the config into the player's working environment for modification. Adds a lineage tag.
- **Fork** — creates a copy in the player's Workshop profile with a public link to the original. Like GitHub fork.
- **Challenge** — instantly creates a Config Duel using this config as the opponent.

**Sorting and discovery:**
The Workshop supports sorting by: Most Recent, Most Favorited, Most Forked, Rising (most activity in last 24h), and **Most Iterated** (configs with the longest fork chains). A search bar supports freeform text and structured queries: `unit:relay hooks:4+ scenario:"mission 7" author:@alice`.

A **Featured** tab, curated weekly by the community team or algorithmically selected, highlights exceptional configs with short editorial write-ups: "This week's featured config solves Mission 8 with zero relays. Yes, really. Here's how."

**Version history:**
Each Workshop entry has a version history — a linear timeline showing every published version of the config with diff summaries. Clicking any version opens that specific snapshot in the Inspector. This mirrors Screeps' approach where players publish their full bot code and discuss architectural decisions.

**Strengths:**
- **Knowledge accumulation.** The Workshop becomes the game's collective intelligence. New players can study veteran architectures. The learning curve flattens.
- **Fork culture.** Like GitHub, forking normalizes learning-by-modification. A player who can't design from scratch can fork a working config and tweak it — still learning, but with a scaffold.
- **Config necropsy support.** The Workshop infrastructure directly enables the "config necropsy" community practice (7.10) — high-Elo players post config evolution retrospectives with version history, annotated replays, and design commentary.
- **Screeps precedent.** Screeps proved that programmable-game communities WANT to share full solutions. The community culture shifted from "hide my code" to "discuss my architecture" because sharing created reputation, which created social capital.

**Weaknesses:**
- **Net-decking problem.** If the best configs are freely available, why design your own? The Workshop might kill creative engagement for players who optimize for results over process. (Counter: the campaign gates configs behind mission-specific constraints that Workshop imports can't bypass. And Gauntlet matchmaking detects common Workshop configs and matches them against known counters.)
- **Quality floor.** An open upload system fills with low-quality or trivial configs. Curation is essential but expensive.
- **Spoiler risk.** Workshop configs for campaign missions are spoilers for the puzzle-solving experience. Tag-based spoiler warnings and mission-gated visibility help.

**Sensory description:**
The Workshop has a *laboratory* aesthetic. The background is a dark charcoal with subtle grid lines — like graph paper. Config Cards have a matte white surface with sharp shadows, like index cards pinned to a board. The lineage badges use a thin colored line connecting cards — following a fork chain feels like tracing a family tree. Hovering a card lifts it slightly (a 2px shadow increase) and reveals a brief tooltip animation: the config's channel topology diagram drawing itself in real-time over 1 second, lines appearing one by one with tiny spark effects at each connection point.

The version history timeline uses a vertical stem with circular nodes — each node represents a version. The current version pulses gently. Clicking a past version causes the Config Inspector to *morph* — elements that changed between versions flash amber and then settle into their new state, while unchanged elements remain still. The diff is felt as motion, not read as text.

**The TikTok clip:** A player opens the Workshop, finds a config with 200 forks. They import it, watch it run — it's good. They change ONE rule. Run it again — it's better. They fork, publish, add a comment: "Moved evade priority above engage. Scouts survive 30% longer." Twenty forks of their fork appear within a week. Text: "One rule change. An entire architecture evolved."

---

### Model 6: "The Bounty Board" (Community-Requested Challenges)

**How it works:** Players post REQUESTS — not challenges but unsolved PROBLEMS. "I need a config that beats Mission 8 with only scouts and relays (no strikers)." "I need a stealth architecture that generates zero EM emissions but still tags 4 nodes." "I need a relay chain that works on any map layout." Other players attempt to solve these bounties and submit solutions. The poster awards a "bounty" (cosmetic currency, reputation points) to the best solution.

**What the screen looks like:**
The Bounty Board is a vertical feed of request cards, each structured like a quest:

```
┌──────────────────────────────────────────┐
│  🏴 BOUNTY: The Zero-Emission Network    │
│                                          │
│  Posted by @signal_architect · 2h ago    │
│                                          │
│  "Build a config for Mission 7 that      │
│  completes with total EM ≤ 10. My best   │
│  is 14. I'll award 50 circuit tokens     │
│  to whoever cracks it."                  │
│                                          │
│  Constraints:                            │
│  • Scenario: Mission 7 (Siege)           │
│  • Max EM: 10                            │
│  • All unit types allowed                │
│  • Must pass 5/5 scenario variants       │
│                                          │
│  🏆 Reward: 50 CT + Featured Config      │
│  📊 3 submissions · Best: EM 12          │
│  ⏰ Expires in 5d 14h                    │
│                                          │
│  [ ATTEMPT BOUNTY ]  [ WATCH REPLAYS ]   │
└──────────────────────────────────────────┘
```

The bounty constraint system is structured: the poster selects a scenario, then adds constraints from a menu — max EM, max ticks, max units, unit type restrictions, channel count limits, "no command agents," etc. The system validates that the constraint set is achievable (at least one existing config in the database, anonymized, meets the constraints — or the poster must prove solvability).

Submissions appear in a ranked list below the bounty card. Each submission shows the key metrics (EM total, ticks, units lost) and a WATCH REPLAY button. The poster can award the bounty to any submission — not necessarily the one with the best metrics. "I'm awarding this to @relay_queen because her solution uses a technique I've never seen" is a valid judgment.

**Strengths:**
- **Demand-driven content.** Instead of generating challenges and hoping for solvers, the Bounty Board surfaces what the community actually WANTS solved. This ensures relevance.
- **Mentor-student dynamics.** Advanced players post bounties to learn from the community. Beginners solve bounties to prove themselves. The bounty economy inverts the usual skill-hierarchy: the experienced player is the one asking.
- **Emergent meta-knowledge.** Bounties that stay unsolved reveal the game's frontier — the configurations nobody can build. A bounty board with "Zero-emission siege: UNSOLVED 47 days" tells the community something profound about the game's design space.
- **Self-regulating difficulty.** Bounties naturally calibrate — easy ones get solved fast and disappear; hard ones persist, attracting skilled players.

**Weaknesses:**
- **Economy design.** What are "circuit tokens?" If they're purely cosmetic, the bounty system has low stakes. If they unlock gameplay, it becomes pay-to-win adjacent. Reputation-only economies can work (Stack Overflow proved it) but need critical mass.
- **Grief bounties.** "Build a config with 0 hooks that beats Mission 10" — provably impossible, wastes everyone's time. Validation is essential.
- **Small community problem.** With few players, bounties sit unsolved not because they're hard but because nobody's looking. The board feels empty and dead.

**Sensory description:**
The Bounty Board has a notice-board aesthetic — warm cork-colored background, cards pinned with tiny metallic thumbtacks that cast small shadows. Unsolved bounties have a faint amber glow around their border. As submissions come in and the best metric improves, the glow shifts toward green — like a progress indicator. A bounty that's been solved (poster awarded) has a gold CLAIMED ribbon across its corner and slowly fades to greyscale over a week before archiving.

The "ATTEMPT BOUNTY" button has the weight of accepting a quest — pressing it triggers a brief screen transition where the bounty card zooms up and unfolds into the full Plan screen, the constraints materializing as overlays on the workbench (a red EM limit bar at the top of the Plan screen, a unit-type restriction shown as crossed-out icons in the blueprint palette).

**The TikTok clip:** A bounty has been unsolved for 30 days. The poster looks frustrated in the first clip. A new player — profile shows 2 weeks of play — opens the bounty, builds a config in 3 minutes using a technique nobody considered (all specialists, no scouts). Submits. Metrics: EM 8. Below the poster's target of 10. The poster's reaction: "HOW." The new player's comment: "I just didn't use scouts." Text: "Sometimes the answer is not having the thing everyone assumes you need."

---

### Model 7: "The Evolution Chain" (Iterated Community Improvement)

**How it works:** A seed config is published. The community collectively improves it through sequential modifications. Player A takes the seed, makes ONE change, publishes. Player B takes A's version, makes ONE change, publishes. Each step is a single modification — one rule reorder, one hook change, one context config adjustment. The chain grows linearly, and the full evolution history is visible. After N iterations, the final config is compared to the seed — showing how incremental changes transform an architecture.

**What the screen looks like:**
The Evolution Chain is displayed as a horizontal timeline — a thick horizontal line with circular nodes at each step. Each node shows:
- The change made (a tiny diff icon: "Rule #3: engage→evade")
- The author avatar
- The pass rate against a fixed scenario set (shown as a tiny green/red bar)

Scrolling left reveals earlier iterations. Scrolling right reveals later ones. The leftmost node is always the seed — marked with a special icon (a sprouting seedling 🌱). The rightmost is the current frontier — the latest improvement.

Clicking any node opens a split view: the config at that step on the left, the config at the PREVIOUS step on the right, with the diff highlighted in amber. Below, the scenario replay plays, with a toggle to switch between watching the current step's version and the previous step's version — A/B comparison.

A "CONTRIBUTE" button at the frontier node opens the workbench with the latest version loaded. The player has a modification budget of exactly 1 change. They make their change, submit, and the chain extends.

The chain also displays a **Fitness Graph** below the timeline — a line chart showing the pass rate (or efficiency metric) over iterations. Ideally, this graph climbs over time. If it plateaus, the chain might be stuck. If it drops, someone made it worse (rollback voting available).

**Strengths:**
- **Git for game design.** The Evolution Chain IS version control made visible and playful. Each contribution is a commit. The chain is a branch. Forking creates parallel branches. The entire culture of collaborative software development — expressed as a game mechanic.
- **Low barrier, high impact.** Making ONE change is the minimum possible creative contribution. A player who can't design a full config from scratch can still contribute meaningfully to a chain.
- **Emergent optimization.** The chain often finds solutions that no individual player would have designed. Collective intelligence produces architectures that surprise everyone — including veteran players.
- **Built-in narrative.** The evolution history IS a story. "This config started as a basic scout rush. Over 40 iterations, it became a stealth relay chain. Nobody planned that transformation. It emerged."

**Weaknesses:**
- **One-change constraint is artificial.** Sometimes the right improvement requires changing two things simultaneously (moving a hook AND adjusting the rule that triggers it). The one-change constraint can trap the chain in local optima.
- **Grief edits.** A player makes a deliberately bad change, breaking a chain that was on a good trajectory. Rollback voting helps but doesn't prevent frustration.
- **Slow feedback.** Each link in the chain takes time. A chain that updates once per day takes weeks to develop. Speed depends on community activity.
- **Convergence.** Chains often converge to similar architectures. The first 10 iterations are interesting; iterations 50-100 are micro-optimizations with diminishing returns.

**Sensory description:**
The Evolution Chain has a *botanical* aesthetic. The timeline isn't a sterile progress bar — it's rendered as a growing vine, with each node as a leaf or bud. Early nodes are small, pale green leaves. As the chain progresses and the config improves, the nodes grow larger and deeper green. A node where the pass rate dropped is a wilted brown leaf. The current frontier node is a bright flower bud, pulsing gently, waiting for the next contribution to bloom it open.

The Fitness Graph below uses the same botanical metaphor — the line is drawn in a vine-like style with tendrils, and upward trends cause tiny animated flowers to bloom along the curve. A plateau is visualized as a flat stretch of vine with no flowers — dormant, waiting for the next breakthrough.

When a new contribution is submitted, the vine extends with a smooth growth animation — the new node sprouts from the frontier, unfurls, and settles into place over 1.5 seconds. A soft, organic *unfurl* sound accompanies it.

**The TikTok clip:** Time-lapse of an Evolution Chain. The seed config runs the scenario and scores 20%. Fast-forward through 50 contributions, the vine growing across the screen. At iteration 50, the score hits 100%. The final version runs — units execute a perfect coordinated assault that the seed config couldn't imagine. Text: "50 strangers. One change each. Perfect architecture."

---

## Cross-Model Interaction Matrix

| | Puzzle Box | Gauntlet Seed | Config Duel | Daily Seed | Workshop | Bounty Board | Evolution Chain |
|---|---|---|---|---|---|---|---|
| **Puzzle Box** | — | PB can use GS scenarios as base | PB can challenge "fix my config to beat this opponent" | Daily can rotate PB type | PB solutions uploaded to WS | Bounty: "create a PB with exactly 1 solution" | Chain of PBs with increasing difficulty |
| **Gauntlet Seed** | — | — | GS + Config Duel = "beat this on this map" | Daily can rotate GS type | Top GS solutions → WS | Bounty: "beat GS with constraint X" | Chain of GS solutions converging |
| **Config Duel** | — | — | — | Daily can rotate CD type | Duel losers study winner's WS entry | Bounty: "beat this config blind" | Duel winner's config → seed for chain |
| **Daily Seed** | — | — | — | — | Daily winner → featured WS entry | Daily results inspire bounties | Daily winner → chain seed |
| **Workshop** | — | — | — | — | — | WS configs as bounty starting points | WS configs as chain seeds |
| **Bounty Board** | — | — | — | — | — | — | Unsolved bounty → chain attempt |

---

## Sharing Infrastructure

### The Configuration Export Format

Every config is serializable as a **Config Code** — a compressed, URL-safe string that encodes the full architecture. Similar to Baba Is You's level codes or share codes in auto-battlers.

**Format:** `RU-{version}-{base64-encoded-config}`
**Example:** `RU-1-aGVsbG8gd29ybGQ...` (truncated)

A Config Code can be:
- Pasted into the game's import dialog
- Shared as a URL: `robotuprising.game/c/RU-1-aGVsbG8...`
- Posted on Discord, Reddit, Twitter as plain text
- Embedded in a QR code displayed on the victory screen

**The clipboard moment:**
After any successful match, a "Share" button appears. Pressing it copies the Config Code to clipboard AND generates a shareable image: a 1080×1080 PNG showing the 8×8 board final state, the config's channel topology diagram overlaid as translucent colored lines, key stats (ticks, units lost, EM), and the Config Code as both text and QR code in the bottom strip. This image is designed to be directly postable to social media — self-contained, visually appealing, and functional (the QR/code imports the config).

### Proof of Solvability

Every published challenge (Puzzle Box, Gauntlet Seed, Config Duel) requires the author to solve it first. The author's solution is stored but hidden until either:
- The challenge is solved by someone else (then both solutions are available for comparison)
- The challenge expires unsolved (the author's solution is revealed as a "consolation")
- The author explicitly reveals it

This is the Opus Magnum principle applied universally: no unsolvable content in the ecosystem.

### Spoiler Architecture

Campaign-related content (solutions to specific missions) is tagged with mission numbers. Players can set a **spoiler filter** in their profile: "Hide content tagged with missions I haven't completed." This filter applies globally — Workshop, Bounty Board, Evolution Chains, Daily Seeds.

The filter is generous: it shows the EXISTENCE of content ("43 configs available for Mission 7") without showing the content itself. Curiosity is maintained; spoilers are gated.

---

## Player Journeys

#### Journey: Tomás, 16, First Strategy Game Player

**Context:** Tomás has completed Missions 1-6. He's comfortable with scouts, relays, and basic hooks. He's never engaged with community content before. He opens the community hub for the first time from the main menu.

**Minute 0:00 — The Community Hub**
The main menu's "Community" button has had a tiny amber notification dot for two days. Tomás finally taps it. The hub opens: a tabbed interface with DAILY (pulsing gold badge), CHALLENGES, WORKSHOP, BOUNTIES, CHAINS. The Daily tab is foregrounded. Today's challenge: a Puzzle Box for Mission 5-level configs. The card reads: "Fix the relay chain. 2 changes allowed. 847 solvers."

Tomás thinks: "847 people solved this. It can't be that hard."

**Minute 0:30 — Opening the Daily**
He taps PRACTICE (unranked). The Plan screen opens with a pre-loaded config — 2 scouts, 2 relays, 1 striker. The board shows enemies in a standard siege formation. He inspects the config. The relays' hooks look fine... but wait. RELAY-A's context config has "listen: all-channels" while RELAY-B has "listen: north-alert only." RELAY-B isn't receiving half the scout reports.

His eyes widen. He's seen this problem before — in his own Mission 5 config.

**Minute 1:15 — First Attempt**
He unlocks RELAY-B's context config (the padlock cracks open — satisfying). Changes "listen: north-alert" to "listen: all-channels." One change spent. He runs it. The Sealed Watch plays. Better, but the relays are now flooded — buffer overflow on RELAY-B because it's receiving everything but has a small buffer.

"Oh. The fix isn't 'listen to everything.' It's 'listen to the right things.'"

**Minute 2:30 — Second Attempt**
He resets (undo, padlock re-seals on RELAY-B). This time he unlocks RELAY-A's hook (change 1): changes the channel name from "south-feed" to "all-feed." Then unlocks RELAY-B's listen config (change 2): changes from "north-alert" to "all-feed." Now both relays share one channel, and both listen to it. The buffer issue resolves because the signal volume is split across two relays instead of concentrated.

He runs it. The Sealed Watch plays. The relays compress and forward efficiently. Striker reaches the enemy base on tick 43. SUCCESS.

**Minute 3:45 — Submission**
The victory screen shows his solution. He taps SUBMIT (ranked). His rank appears: #412 of 847 — middle of the pack. The histogram shows most solvers used 2 changes (like him), but a cluster used only 1. He taps a 1-change solver's replay. Their fix: they changed the STRIKER's hook instead of touching the relays at all — routing the striker to listen directly to scouts, bypassing the relay chain entirely.

Tomás stares. "You can just... skip the relays?"

**Minute 4:30 — The Lesson**
He opens the Compare view. Author's intended solution: fix RELAY-B's listen config (1 change). The 1-change community solution: bypass relays entirely. His 2-change solution: restructure the channel architecture. Three completely different approaches to the same flaw. He screenshots the Compare view and sends it to his friend.

He thinks: "I want to make one of these."

**UI Annotations:**
- Daily badge: hexagonal, gold border, pulsing glow, centered in community hub header
- Padlock crack: 200ms animation, metallic click sound, particle burst of 8-12 tiny shrapnel pieces
- Change counter: pill-shaped, top-right, decrements with a brief number-flip animation (old number slides up, new slides in from below)
- Compare view: split-panel, left = author's solution, right = solver's, diff elements highlighted amber, unchanged elements dimmed to 40% opacity

---

#### Journey: Dr. Priya, 38, ML Engineer and Gauntlet Veteran

**Context:** Priya has completed the campaign, plays Gauntlet regularly (rating 2,100), and publishes configs on the Workshop. She's interested in the Bounty Board as a way to push her architectural skills.

**Minute 0:00 — Browsing Bounties**
Priya opens the Bounty Board. She sorts by "Unsolved, Oldest First" — these are the hard ones. The top result has been open for 12 days:

> 🏴 "The Whisperer: Complete Mission 9 with total EM ≤ 5"
> Posted by @stealth_master
> 4 attempts, best EM: 11

Priya's professional instinct activates. EM ≤ 5 for a full Mission 9 config means almost no hook transmissions. That means no relay chain. That means scouts must communicate through... nothing? Or through a single compressed burst?

**Minute 1:00 — Analysis**
She opens a scratchpad (in-game text area for notes, separate from the workbench) and writes:

"EM budget: 5 units total across all ticks.
Sources of EM: hook transmissions = 1 EM each.
So max 5 hook firings in the entire match.
Mission 9: ~80 ticks. Enemy base + patrols.
Key constraint: scouts must identify targets, strikers must reach them.
No persistent channel communication possible."

She stares at the constraint for 30 seconds. Then types:

"What if the scouts don't broadcast at all? What if strikers infer enemy positions from scout MOVEMENT PATTERNS instead of scout MESSAGES?"

**Minute 3:00 — The Insight**
Priya designs a config where scouts patrol deterministically and strikers' rules include: "IF scout visible AND scout executing evade → enemy is near scout's position." No hook firing needed. The scouts' physical behavior IS the signal. She needs hooks only for 3 key moments: initial deployment confirmation (1 EM), mid-battle factory status (1 EM), and the final strike command (1 EM). Total: 3 EM. Under budget.

She builds it on the workbench, testing against the Mission 9 scenario. First run: scouts evade correctly, but strikers misread a patrol turn as an evade. She adds a rule: "IF scout visible AND scout speed = fast AND scout direction changed → evade behavior." The patrol-vs-evade distinction is visible because evade uses the fast speed stat while patrol uses medium.

Second run: 72 ticks, all enemies eliminated, EM total: 3.

**Minute 8:00 — Submission**
She submits. EM: 3. Below the bounty target of 5, below the previous best of 11. She adds a comment: "The trick is reading scout behavior as signal. No hooks needed for communication — movement IS the message."

She publishes a Workshop entry explaining the technique: "Behavioral Signaling: Using Movement Patterns as Zero-EM Communication." The entry includes the full config, annotated with inline comments explaining each rule's role in the inference chain.

**Minute 10:00 — Community Impact**
Within hours, the bounty poster @stealth_master awards her the bounty and writes: "I've been trying to solve this with compress+filter to minimize EM per transmission. I never considered eliminating transmissions entirely. Behavioral signaling is a new paradigm." Three players fork her Workshop entry. One applies the technique to Mission 7 with similar results.

Priya thinks: "This is what it felt like when we discovered you could use model embeddings as search indices instead of building a separate retrieval system."

**UI Annotations:**
- Bounty constraint overlay: red EM limit bar across top of Plan screen, numerically updating in real-time as she adds hooks (turns green when under budget)
- Scratchpad: slide-in panel from right edge, semitransparent dark background, monospace font, auto-saves
- Submission comment: inline text field below the SUBMIT button, renders as markdown, supports Config Code embeds
- Workshop cross-post: one-tap from bounty submission screen, pre-fills title and description, auto-links back to bounty

---

#### Journey: Kai, 11, Minecraft and Roblox Player

**Context:** Kai has completed Missions 1-4 and just unlocked the factory in Mission 5. He discovers the Evolution Chain from a friend who shares a link at school.

**Minute 0:00 — Following a Link**
Kai's friend sends a URL in their group chat: "look at this chain its at 40 iterations." Kai taps it. The game opens to an Evolution Chain — 40 nodes along a growing vine, starting pale green and getting deeper. The Fitness Graph below shows a ragged climb from 15% pass rate to 78%.

He scrolls through the chain, tapping nodes. Node 1: a basic two-scout setup. Node 15: someone added a relay. Node 23: someone changed the relay's compression settings. Node 30: someone rewired the hook channels. He watches the replay at Node 1 (scouts stumble around, get killed) and Node 40 (a coordinated relay-scout-striker assault that tags 3 nodes before destroying the enemy base).

**Minute 1:30 — "I Can Do Better"**
The current frontier node shows 78% pass rate. The Fitness Graph has plateaued for the last 5 iterations — the vine has no flowers, just flat growth. Kai thinks: "I bet I can break the plateau."

He taps CONTRIBUTE. The workbench loads with the current config. He has exactly 1 change. He inspects the config — it's more complex than anything he's built himself, but he can read it. The scout has 4 rules; the relay has 6 rules; the striker has 3 rules.

He notices the striker's Rule #1: "IF signal received AND signal type = ALERT → move toward signal origin." But the relay is sending REPORT signals, not ALERT signals. The striker is ignoring the relay's reports!

**Minute 2:30 — The Fix**
He unlocks the relay's hook payload config and changes the signal type from REPORT to ALERT. One change. He submits.

The scenario runs. Pass rate: 84%. The vine extends — a new node sprouts, deeper green than the last 5. The Fitness Graph ticks upward. A tiny flower blooms on the curve. The *unfurl* sound plays.

**Minute 3:00 — Social Proof**
Kai screenshots the Fitness Graph showing the uptick at his node. He sends it to the group chat: "i broke the plateau." His friend replies: "HOW." Kai: "the relay was speaking the wrong language."

Within the day, 3 more iterations build on Kai's change, pushing the pass rate to 91%. Each contributor sees Kai's node in the chain — his avatar, his change, the flower that marks where the plateau broke.

**UI Annotations:**
- Evolution Chain vine: horizontal scroll, pinch-to-zoom on mobile/trackpad, each node 48px diameter with 24px avatar inset
- Fitness Graph: 200px tall, below the vine, green line on dark background, flower bloom animation at each upward inflection (0.5s, tiny white petal burst)
- CONTRIBUTE button: appears only at the frontier node, green pill shape, text "Make 1 Change"
- Post-contribution celebration: the new vine node grows with a 1.5s spring animation, overshoots slightly then settles, accompanied by a warm chime that rises in pitch

---

#### Journey: Amara, 45, Non-Gamer Project Manager

**Context:** Amara started playing Robot Uprising because a colleague described it as "project management with robots." She's on Mission 7, comfortable with the basics, and curious about the Workshop.

**Minute 0:00 — Workshop Discovery**
Amara opens the Workshop from the community hub. The masonry grid of Config Cards loads. She sees names like "The Silent Relay Chain v3.2" and "Aggressive Scout Rush Alpha." The cards have stats — favorites, forks, views — that feel familiar from professional contexts (npm downloads, GitHub stars).

She searches: "mission 7 siege." Three results appear. She opens the highest-rated one (⭐ 89, 📋 12 forks).

**Minute 0:45 — Studying the Config**
The Config Inspector shows a 5-unit architecture: 2 scouts, 2 relays, 1 striker. She reads the author's inline annotations — yellow sticky notes on key elements. The first note on SCOUT-A's patrol route: "This scout covers the north corridor. The patrol waypoints are chosen to maximize enemy detection before tick 15, when the first wave spawns."

She thinks: "This is like reading someone's project plan. I can see their reasoning."

She notices the channel architecture diagram in the overview panel — three channels forming a triangle: "north-feed" → "central-relay" → "strike-command." The author's note: "Triangle topology gives redundancy. If RELAY-A dies, scouts still reach the striker through RELAY-B via central-relay."

**Minute 2:00 — Import and Modify**
She taps "Import to Workbench." The config loads into her Plan screen with a banner: "Imported from @relay_queen's Silent Chain v3.2 (Modified: 0 changes)." Every change she makes increments the counter.

She modifies the striker's rules — changing the engagement priority from "closest enemy" to "enemy near base" — because her Mission 7 attempts keep failing when the striker chases a decoy. The banner updates: "Modified: 1 change."

She runs it. Better. The striker ignores the decoy and defends the base approach. She modifies SCOUT-B's patrol to cover the east corridor (which the original config left unmonitored). "Modified: 2 changes."

**Minute 4:00 — Fork and Publish**
She taps "Fork." A dialog appears: "Create a public fork of @relay_queen's Silent Chain v3.2?" She names it "Silent Chain — East Coverage v1.0" and adds a note: "Added east corridor coverage. Changed striker priority to base defense."

Published. The lineage badge reads: "Forked from @relay_queen's Silent Chain v3.2." Her fork appears in her profile and in the Workshop search results.

Two days later, she gets a notification: "@relay_queen favorited your fork." She opens it and sees relay_queen's comment: "Smart change on the east corridor. I never covered it because my version relies on RELAY-B's perception to catch eastern enemies — but your explicit patrol route is more reliable. Might merge this back."

Amara thinks: "This is exactly like getting a 'LGTM' on a pull request."

**UI Annotations:**
- Import banner: thin amber strip at top of workbench, "Imported from [author]'s [config name] (Modified: N changes)", persists until the player explicitly detaches lineage
- Fork dialog: centered modal, config name field (pre-filled with original name + "fork"), description field, visibility toggle (public/unlisted)
- Lineage badge: on Config Card, thin colored line with arrow from original to fork, author avatars at each end
- Notification: system notification with author avatar, action text, and deep-link to the relevant Workshop entry

---

## Interaction Effects

### With Campaign (5.xx)
- Puzzle Boxes naturally extend the campaign's teaching arc — a community Puzzle Box for Mission 4-level hooks reinforces what the campaign taught
- Gauntlet Seeds can serve as "bonus missions" that extend the campaign without designer effort
- Evolution Chains seeded from campaign mission configs create a community-driven "extended campaign"
- Campaign missions could have a "Community Variants" tab showing player-created scenario modifications

### With Competitive/PvP (7.01)
- Config Duels are the gateway drug to Gauntlet PvP — lower stakes, asynchronous, self-paced
- Workshop configs flagged as "Gauntlet-viable" create a natural path from studying others' architectures to deploying your own
- Daily Seeds create shared competitive moments that build community identity before players commit to persistent Gauntlet rating

### With Inspector/Debrief (4.xx)
- Every challenge model benefits from the Inspector's diagnostic tools post-match
- The Compare view in Puzzle Box directly uses the Inspector's diff visualization
- Bounty solutions are evaluated partially through Inspector metrics (buffer utilization, signal efficiency)
- Evolution Chain node diffs use the same visual language as the Inspector's counterfactual comparison

### With Config Necropsy Culture (7.10)
- The Workshop IS the infrastructure for config necropsy — version history, inline annotations, fork chains
- Bounty Board solutions with detailed comments become reference necropsies
- Evolution Chains are living necropsies — the chain history IS the improvement story

### With Accessibility (6.08)
- Config Codes must be screen-reader friendly (readable character-by-character, not binary blob)
- Workshop inline annotations need alt-text for visual elements
- Daily Seed countdown needs audio cues for low-vision players
- Evolution Chain vine metaphor needs non-visual parallel (e.g., numbered list with trend indicators)

### With Onboarding (5.xx)
- Community content should be GATED behind campaign progress — no Workshop access until Mission 5, no Bounty Board until Mission 8
- The Daily Seed could have a "Beginner" tier that uses Mission 1-4 level configs
- Puzzle Boxes for early missions serve as supplementary tutorials

---

## Comparable Games

| Game | Sharing Model | What Works | What Doesn't | Lesson for Robot Uprising |
|------|--------------|------------|--------------|--------------------------|
| **Opus Magnum** | Steam Workshop puzzles + GIF solution sharing | Proof-of-solvability requirement; GIF culture creates organic marketing; histograms make optimization competitive | Workshop eventually dominated by ultra-hard puzzles; GIFs only show solutions, not the design process | Require solvability proof; make the PROCESS of solving shareable, not just the result |
| **Baba Is You** | Level editor + cross-platform level codes | Level codes work everywhere (Discord, Reddit, Switch, PC); curated Featured tab surfaces quality; community packs create themed experiences | No built-in discussion; quality varies wildly in unfeatured content; no difficulty indicators before playing | Config Codes must be platform-agnostic; curation is non-optional; difficulty estimation helps discovery |
| **Slay the Spire** | Daily Climb (same seed for everyone) | Shared daily experience creates community conversation; modifier variety keeps it fresh; one-shot leaderboard creates drama | Dominated by experienced players; spoiler culture around optimal routes; leaderboard hacking | Anti-spoiler window design; difficulty tiers for dailies; server-validated submissions |
| **Screeps** | Full source code publishing + blog culture | Sharing code creates reputation economy; architectural discussion elevates entire community; "open source your bot" as community norm | Overwhelming for new players; no structured comparison; documentation is external (GitHub, blog) | Built-in Workshop annotations > external documentation; fork lineage makes studying approachable |
| **Gladiabots** | Async PvP tournaments + community AI challenges | Low-barrier competitive play; async survives small community; community challenges extend content | No structured sharing infrastructure; AI configs shared via screenshots/Discord (not in-game) | Build sharing infrastructure INTO the game; don't rely on external platforms |
| **Super Mario Maker 2** | Level codes + curated featured + Endless Challenge | Cross-platform codes; Featured curation; Endless Challenge as difficulty-sorted consumption; hearts as curation signal | Flooded with low-quality "troll" levels; difficulty wildly inconsistent; no collaborative building | Quality gating (solvability proof); difficulty estimation; Evolution Chain for collaborative creation |
| **Chess** | Puzzle databases (Lichess, Chess.com) | Centuries of puzzle culture; difficulty ratings (Elo for puzzles); themed collections; daily puzzles | Purely diagnostic (no creative submission by average players) | Robot Uprising's Puzzle Box format democratizes puzzle creation, not just solving |

---

## The "Net-Decking" Question

The most contentious design question for community sharing: **does free access to optimal configs kill creative engagement?**

Card games call this "net-decking" — copying a tournament winner's decklist instead of building your own. The debate is eternal. Hearthstone embraced it (deck codes are trivially shareable). Magic: The Gathering's community is split. Slay the Spire has no multiplayer so it's moot.

Robot Uprising's answer should be **structural, not cultural:**

1. **Campaign missions have unique constraints.** A Workshop config designed for Mission 7 won't work on Mission 8 without modification. The campaign forces creative adaptation even from importers.
2. **Gauntlet meta-evolution.** If everyone copies the same Workshop config, it becomes the dominant strategy, and counter-strategies emerge that beat it. Net-decking in an evolving metagame is self-correcting.
3. **Invisible randomization.** Each match varies within constraints. A copied config might pass the author's scenario variants but fail the copier's different variants. Adaptation is always needed.
4. **Fork lineage is visible.** A player running an unmodified Workshop import has a lineage badge: "Forked from @relay_queen's Silent Chain v3.2 (Modified: 0 changes)." This is visible in Gauntlet profiles. Community norms will emerge around this — some players will wear "Modified: 47 changes" as a badge of creative investment.
5. **The Workshop teaches BEFORE it gives.** Inline annotations, version history, and fork chains mean studying a Workshop config IS learning. The player who copies today builds tomorrow. The Workshop is a school, not a cheat sheet.

---

## New Aspects Discovered

- **7.03a — Config Code format design:** Exact encoding format, compression strategy, version migration, URL scheme, QR code generation, and backward compatibility when game primitives change between versions
- **7.03b — Community moderation infrastructure:** Grief prevention (impossible bounties, deliberately bad Evolution Chain contributions, offensive config names), report system, automated quality detection, trust levels
- **7.03c — Reputation economy design:** Circuit tokens, contributor badges, featured-creator program, reputation decay, and how reputation interacts with Gauntlet rating as parallel social currencies
- **7.03d — Workshop search and discovery UX:** Full design of search, filtering, tag taxonomy, recommendation engine ("players who liked this config also liked..."), trending algorithms, and config similarity detection
- **7.03e — Cross-platform sharing infrastructure:** How Config Codes, Workshop entries, and challenge invitations work across PC/mobile/web demo; account linking; progress synchronization; the "scan QR code from friend's screen" flow
