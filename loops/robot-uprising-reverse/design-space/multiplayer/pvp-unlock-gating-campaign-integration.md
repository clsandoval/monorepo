# PvP Unlock Gating and Campaign Integration

**Aspect:** 7.01d — When does competitive multiplayer become available? Ghost Ladder after Mission 5 vs. earlier? Practice-against-ghost missions in campaign? Competitive skill teaching within the tutorial arc.

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Design Question

Every competitive game faces the same structural tension: **gate PvP too early and new players get crushed, gate it too late and competitive players leave before reaching it.** The answer defines the game's identity — is it a campaign game with optional PvP, or a competitive game with a tutorial campaign?

Robot Uprising has a unique constraint: the Gauntlet is explicitly designed as a "third act" (see 5.22). The campaign IS the tutorial for competitive play. But the three-act structure (Boot Sequence → Assembly → Gauntlet) means the full competitive experience doesn't unlock until after Mission 10. That's potentially 3-5 hours of single-player content before touching PvP. For a competitive player, that's an eternity. For a narrative player, it's perfect.

The question isn't just "when" — it's "what kind of PvP, at what fidelity, with what guardrails."

---

## Five Unlock Models

### Model A: "The Full Gate" — PvP After Mission 10

**How it works:** Competitive multiplayer is completely invisible until the campaign is complete. The boot log's `GAUNTLET MODE AVAILABLE` line at the end of Mission 10 is the first time the player sees any mention of PvP. The entire campaign is a single-player experience.

**What the player sees:**
Nothing. No greyed-out PvP button. No "coming soon" teaser. No mention of other players. The campaign map shows 10 provinces. The main menu has Campaign, Blueprint Codex, Settings. After Mission 10, the main menu adds "Gauntlet" with a gold border and a single-pulse animation the first time it appears — like a new terminal line being written. The campaign map gains a golden ring around the entire archipelago, pulsing gently.

**Strengths:**
- **Narrative integrity.** The three-act structure is preserved exactly as designed. The Predecessor's voice, the boot log ceremony, the emotional arc from student to architect to commander — none of it is interrupted by competitive UI elements.
- **No premature anxiety.** New players never think "am I good enough for PvP?" during the learning phase. The campaign is a safe space.
- **Clean first impression.** The game markets as a single-player strategy game first. PvP is the "and there's MORE" discovery. This is the Hades model — you play for the story, then discover the Pact of Punishment adds infinite depth.
- **Prevents bad matchmaking.** With only post-campaign players in the pool, every Gauntlet participant has baseline competence with all four primitives, the factory, and command agents.

**Weaknesses:**
- **The 3-5 hour wall.** Competitive-first players (the Gladiabots/Screeps audience) must complete the entire campaign before accessing the mode they bought the game for. Every hour of campaign is an hour they could be competing. Dropout risk is real — Steam refund window is 2 hours.
- **No competitive word-of-mouth during early access.** Streamers want to show PvP. If it takes 4 hours to unlock, early access coverage is campaign-only for weeks.
- **Small matchmaking pool.** Only campaign completers enter Gauntlet. If 30% of buyers complete the campaign (generous for strategy games), the competitive pool is 30% of the player base from day one. For a niche game, this could mean unplayable queue times.
- **Skill cliff at Gauntlet entry.** The player goes from "I just beat a designed AI" to "I'm facing a human who's been iterating for 50 matches." The first Gauntlet experience can be brutally humbling with no intermediate step.

**Comparable games:**
- **Into the Breach:** No PvP at all, but squads unlock progressively through achievements — the unlock system IS the metagame. Players who want competition use community challenge seeds and leaderboards.
- **Hades:** The competitive element (Pact of Punishment, speedrun leaderboards) only becomes relevant after the first clear. The first clear takes 8-15 hours. Nobody complains, because the campaign is compelling enough to stand alone.
- **Slay the Spire:** Daily Runs (the competitive mode) are locked until you complete at least one standard run per character. Custom Runs require three victories. The gate is short (1-3 hours) but exists.

**The TikTok clip:** The boot log's final line appearing: `[OK] GAUNTLET MODE AVAILABLE`. Cut to a montage of increasingly complex architectures fighting each other. Text: "The campaign was the tutorial."

---

### Model B: "The Ghost Ladder" — Ghost Matches After Mission 5

**How it works:** After completing Mission 5 (the factory introduction), a new section appears on the campaign map: a dim satellite dish icon in the corner labeled "Ghost Ladder." Tapping it opens a simplified competitive mode where the player deploys their current architecture against other players' ghosts. Ghost Ladder uses the async "deploy and forget" model from 7.01 Model A. It has its own rating, separate from the eventual Gauntlet.

**What the player sees:**
Mission 5 ends. The boot log prints: `[NEW SUBSYSTEM] EXTERNAL SIGNAL DETECTED. Ghost architectures broadcasting on open frequencies. Deploy to test against unknown configurations? [Y/N]`. A new icon materializes on the campaign map — a satellite dish icon, positioned off the coast of the archipelago, connected by a dashed line. First entry shows a brief tutorial: "Your architecture will be matched against another operator's design. Deploy, then return to the campaign while the match resolves."

The Ghost Ladder screen is minimal: a DEPLOY button (blue, satellite icon), a rating number starting at 1000, and a list of recent match results with opponent names and outcomes. No detailed Inspector access for Ghost Ladder matches — just win/loss and a "Watch Replay" button that plays the sealed watch only. Full Inspector access is reserved for Gauntlet after Mission 10.

**Strengths:**
- **Mid-campaign competitive testing.** The player has just learned the factory. They have blueprints, channels, production queues. They have enough vocabulary to build a real architecture. Ghost Ladder lets them test it against humans while still learning.
- **Motivates campaign completion.** Ghost Ladder is intentionally limited — no Inspector, simplified debrief. The player experiences "I lost but I don't know why" and the campaign promises "Mission 8-10 will give you the tools to understand." The limitation creates pull toward completing the campaign.
- **Larger competitive pool.** Mission 5 completers are a bigger group than Mission 10 completers. More players in the pool = better matchmaking.
- **Natural competitive rhythm.** Complete a campaign mission → tweak architecture → deploy ghost → play next mission → check ghost results. PvP weaves into the campaign loop rather than replacing it.
- **Streamer-friendly.** Content creators can show PvP within the first 1-2 hours. "I just learned factories and I'm already fighting humans" is a compelling narrative.

**Weaknesses:**
- **Premature exposure.** At Mission 5, the player has learned context, rules, hooks, skills, and the factory — but not the command agent (M6), not multi-blueprint coordination (M7), not factory-vs-factory (M8). Ghost Ladder opponents who are further in the campaign have access to more sophisticated architectures. The matchmaking must account for campaign progress.
- **Rating reset at Gauntlet.** Ghost Ladder rating is meaningless once Gauntlet opens. Does it seed Gauntlet calibration? If yes, Ghost Ladder incentivizes grinding. If no, the rating feels throwaway.
- **Attention split.** The campaign's emotional arc (discovery → power → graduation) is interrupted by "check my ghost results." The two-act debrief design (sealed watch → Inspector) is compromised because Ghost Ladder doesn't have Inspector. The player might start thinking about winning instead of learning.
- **Complexity at the worst moment.** Mission 5 is already the hardest complexity jump in the campaign (see 5.04a — The Mission 5 Wall). Adding Ghost Ladder at the same moment adds UI, mental model, and decision surface area exactly when the player is most overwhelmed.

**Comparable games:**
- **Gladiabots:** Multiplayer is available from the start, with campaign ghosts pulled from real player Elo ratings. The campaign IS practice-against-ghosts from Chapter 2 onward. No separate gating — the entire experience is PvP-adjacent.
- **Tekken 8 Super Ghost Battle:** Ghost AI learns from your play and mimics other players. Available as a training mode alongside ranked, serving as a bridge between practice and competition.

**The TikTok clip:** Split screen — left: player configuring their first factory in Mission 5. Right: their ghost winning a match against another player while they're still in the tutorial. Text: "My factory's already fighting people."

---

### Model C: "The Shadow Campaign" — Ghost Opponents Replace AI from Mission 3

**How it works:** From Mission 3 onward, enemy configurations in the campaign are silently replaced with real player ghosts matched to the current player's skill level. The player doesn't know they're fighting humans — the UI says "Enemy Commander" with a procedurally generated name. After Mission 10, the reveal: "Every battle since Mission 3 was against a real operator's architecture." The Ghost Ladder is retroactively shown as having been active all along.

**What the player sees at first:**
Nothing different. The campaign feels like a campaign. Enemy configurations are labeled with names like "UNIT-7X TACTICAL SUBSYSTEM" or "WARDEN-CLASS PATTERN ALPHA." The difficulty scales naturally because matchmaking selects ghosts near the player's estimated skill.

**What the player sees at the Mission 10 reveal:**
The boot log types: `[DECRYPTION COMPLETE] Enemy signature analysis... HUMAN ORIGIN DETECTED. Mission 3: Operator "kai_builds" (Rating 1,247). Mission 4: Operator "relay_queen" (Rating 1,389)...` Each mission's "enemy" is revealed as a human architect. The campaign map replaces procedural enemy names with actual usernames. The player can now go back and Inspector-analyze these matches with full knowledge.

**Strengths:**
- **The reveal is a nuclear emotional moment.** "I've been fighting humans this whole time" is a Braid-level twist. It reframes the entire campaign. Every victory becomes more meaningful. Every loss becomes more instructive. This IS the TikTok clip.
- **Zero cognitive overhead during campaign.** The player never has to think about PvP, matchmaking, ratings, or ghost deployments. They just play the campaign. The competitive testing happens invisibly.
- **Perfect matchmaking.** Since the system selects ghosts to match player skill, the difficulty curve is human-calibrated rather than designer-calibrated. The player faces architectures that real humans at their level would build, which teaches more relevant lessons than designer-authored enemy AI.
- **Retroactive competitive identity.** The player discovers they have a hidden rating and a match history going back to Mission 3. They enter the Gauntlet not as a blank slate but with a calibrated rating and a visible track record.

**Weaknesses:**
- **Requires a live player pool from day one.** If the game launches to 100 players, there aren't enough ghost configurations to match against across all skill levels and campaign missions. Cold start problem is severe.
- **Deception as design.** Some players will feel betrayed by the reveal. "You lied to me" is a real reaction. The game's relationship with the player starts with hidden manipulation. For a game about transparency and information architecture, this is thematically dissonant.
- **Determinism problems.** Campaign missions have specific terrain, spawn points, and objectives. Ghost configurations designed for Ghost Ladder (open format) may not fit campaign mission constraints. The system must either limit ghosts to those whose configurations are compatible with each mission's specific layout, or fudge the ghost to fit — which means the "real human opponent" claim is partially false.
- **Replay value destroyed.** Once the reveal happens, replaying the campaign loses the twist. Second-campaign players know they're fighting ghosts. The magic is one-time.
- **Ghost availability per mission.** Each campaign mission would need a pool of human-compatible ghost configs. Missions 1-2 (pre-placed units, no player agency over enemy config) can't use ghosts at all. Missions 3-4 have limited player agency. Only Missions 5-10 have enough configuration freedom for meaningful ghost substitution.

**Comparable games:**
- **Forza Horizon's Drivatars:** AI opponents in races are invisibly trained on real players' driving behavior. Players race against "ghosts" without knowing it. The system is so seamless most players don't notice.
- **Metal Gear Solid V — FOB Invasions:** Your base can be invaded by real players while you're offline, but the game presents it as an enemy attack within the fiction. The line between PvE and PvP blurs.

**The TikTok clip:** The reveal. Boot log decrypting enemy names one by one, each resolving to a username. Player's face goes from confused to shocked. Text: "The enemies were real people the entire time."

---

### Model D: "The Practice Range" — Dedicated PvP Training Missions in Campaign

**How it works:** Instead of a separate competitive mode, the campaign includes dedicated "field test" missions between story missions that are explicitly framed as PvP practice. After Mission 4 (completing the Boot Sequence), a "Field Test" mission appears on the campaign map between provinces — a small island off the main archipelago, connected by a dashed circuit-board cable. Field Tests use the Ghost Match model but are framed as campaign content: "Test your architecture against captured enemy configurations" (which are actually player ghosts).

**What the player sees:**
The campaign map shows the standard 10 provinces plus 3 Field Test islands positioned between the three acts:
- **Field Test Alpha** (between M4 and M5): "Test your attention system against a captured operator's configuration." Available after completing M4. Uses the player's M4 hand-configured unit setup against a skill-matched ghost. No factory. No production. Pure attention architecture vs. attention architecture.
- **Field Test Beta** (between M7 and M8): "Deploy your factory against an unknown adversary." Available after completing M7. Full factory vs. ghost factory. First "real" competitive match.
- **Field Test Gamma** (between M9 and M10): "Prepare for the Warden. Face the strongest captured configuration." Available after M9. Intentionally difficult. Meant to be a wall — the final exam before the Gauntlet.

Each Field Test has a unique visual treatment: the map island is slightly desaturated, with static interference lines across the terrain. The boot log frame reads: `[FIELD TEST] Captured configuration loaded. Authenticity: UNVERIFIED. Proceed? [Y/N]`.

**Strengths:**
- **Campaign-integrated competitive teaching.** PvP isn't a separate mode — it's a campaign mission type. The player doesn't have to context-switch between "learning" and "competing." The Field Test is learning through competition.
- **Three escalating competitive checkpoints.** Each Field Test matches the player's current vocabulary: Alpha tests primitives, Beta tests factory, Gamma tests full system. The competitive skill ramp mirrors the campaign skill ramp.
- **Narrative coherence.** "Captured configurations" fits the fiction. The AI uprising has captured enemy operator designs. Testing against them is preparation for the real battle. The slight unreliability ("Authenticity: UNVERIFIED") creates narrative tension without revealing the ghost mechanic.
- **Low-pressure competitive exposure.** Field Tests are optional campaign missions. You can skip them. They don't block campaign progress. But they reward completion with rating data that seeds the Gauntlet.
- **Natural difficulty calibration.** If the player crushes Field Test Alpha, Beta selects a harder ghost. If they struggle, Beta selects an easier one. The Field Tests double as hidden placement matches for the Gauntlet.

**Weaknesses:**
- **Only 3 competitive encounters before Gauntlet.** Three matches is not enough to build competitive skill or calibrate a rating. The player enters the Gauntlet with minimal PvP experience. Compare to Overwatch 2's 50-win requirement.
- **Optional means skippable.** If Field Tests are optional, narrative-focused players skip them entirely and enter the Gauntlet blind. If they're required, they interrupt the campaign flow for players who don't want competition.
- **Ghost pool segmentation.** Each Field Test needs its own ghost pool (Alpha: pre-factory, Beta: factory-level, Gamma: full system). Three separate pools means each pool is smaller. Cold start is harder across three pools than one.
- **"Captured configuration" narrative strain.** The fiction works for 1-2 Field Tests but starts to creak at 3. "We keep capturing operator designs" is convenient but thin.

**Comparable games:**
- **Fire Emblem's paralogues:** Optional side missions between story chapters that offer unique rewards and increased difficulty. They're part of the campaign but separable from the main arc.
- **Slay the Spire 2's Daily Runs:** Accessible after completing one standard run, positioned as a "come back daily" layer alongside the main progression.

**The TikTok clip:** The Field Test Alpha loading screen — static interference, "CAPTURED CONFIGURATION" text, the player's scout vs. an unexpectedly clever opponent architecture. Text: "I thought this was a tutorial mission."

---

### Model E: "The Parallel Track" — Campaign and Ghost Ladder as Separate Paths from Launch

**How it works:** The main menu has two options from the moment the game launches: "Campaign" and "Ghost Ladder." Campaign is the 10-mission story. Ghost Ladder is async PvP with no campaign prerequisites. Both are always available. Campaign completion unlocks the full Gauntlet (rated seasonal play, Inspector tools, cosmetics). Ghost Ladder is the "practice PvP" — unrated, simplified debrief, no seasonal rewards.

**What the player sees at first launch:**
The main menu shows two doors. Left: "CAMPAIGN — Learn to build attention systems" with the Philippine archipelago silhouette pulsing cyan. Right: "GHOST LADDER — Test your designs against other operators" with a satellite dish icon pulsing amber. Both are fully lit, fully interactive, no locks, no "complete X to unlock." Below both: "GAUNTLET (unlocked after campaign completion)" greyed out with a padlock, connected to both doors by dashed lines.

Ghost Ladder provides a stripped-down experience: the Plan screen with all primitives available (no progressive unlock), a simplified debrief (sealed watch + basic stats, no full Inspector), and an unrated matchmaking pool. It's the "jump in and play" option for competitive-first players.

**Strengths:**
- **Respects competitive players.** The Gladiabots/Screeps audience can start competing immediately. No hours of tutorial content before the mode they want. The game says "we trust you to figure it out."
- **Maximum player pool from day one.** Everyone who buys the game can Ghost Ladder immediately. The matchmaking pool is the entire player base, not just campaign completers.
- **Self-selection teaching.** Players who Ghost Ladder first and lose will naturally enter the campaign to learn why. "I keep losing to relay chains — what's a relay?" becomes the pull that makes the campaign feel necessary, not mandatory. The campaign transforms from gate to resource.
- **Streamer flexibility.** Content creators can show PvP immediately. "First match ever against a real person" is a first-hour clip. Campaign deep-dives come later.
- **A/B testing data.** Tracking which path players choose (and how many campaign-first vs. ladder-first eventually complete both) provides invaluable design data about the audience split.

**Weaknesses:**
- **Vocabulary overload for ladder-first players.** Ghost Ladder gives access to all primitives without teaching any of them. A player who has never seen a hook or a context window will face opponents who have mastered both. The Plan screen is a wall of unlabeled options. The stripped-down debrief can't explain why they lost.
- **Two first impressions.** Every game has one chance at a first impression. If a competitive player launches Ghost Ladder, fights one confusing match with no context, and refunds — the campaign they never played can't save the game. The first 15 minutes of Ghost Ladder must be self-teaching.
- **Campaign devaluation.** If you can compete without the campaign, why play it? The campaign's reward (Gauntlet unlock, which is just "rated Ghost Ladder with Inspector") may not feel worth 4 hours for competitive players. The campaign becomes optional content, not the core experience.
- **Balancing two onboarding paths.** The game must teach primitives twice — once in the campaign's structured progression, once through Ghost Ladder's trial-by-fire. UI hints, tooltips, and adaptive difficulty in Ghost Ladder become necessary, duplicating design effort.
- **Rating integrity.** Ghost Ladder is unrated, but players will treat it as rated. The transition from Ghost Ladder to Gauntlet creates a "smurf" problem — experienced Ghost Ladder players entering Gauntlet calibration will crush genuine newcomers.

**Comparable games:**
- **TFT (Teamfight Tactics):** Ranked is available from level 1. No tutorial gate. No campaign requirement. Players can jump straight into competitive. The game teaches through playing and losing. This works for TFT because each match is 25-35 minutes and the rules are learnable within 3-5 matches.
- **Overwatch 2:** Requires 50 Quick Play wins before competitive — a middle ground that ensures baseline mechanical competence. But Quick Play IS the game mode, just unranked. The tutorial is playing the game.
- **League of Legends:** Level 30 + 20 champions + 10 normal games. Heavy gating justified by the game's complexity and the damage an unprepared player does to 9 other people's experience. Robot Uprising's async PvP reduces this concern since there's no live teammate being harmed.

**The TikTok clip:** A new player clicking "Ghost Ladder" on their first launch. Confusion → one terrible match → clicking "Campaign" → montage of learning → returning to Ghost Ladder and winning. Text: "The tutorial is optional. But you'll want it."

---

## Recommended: Model D+B Hybrid — "The Archipelago Approach"

**The recommended design combines Field Test missions (Model D) with Ghost Ladder access after Mission 5 (Model B), creating a graduated competitive exposure that mirrors the campaign's own pedagogical structure.**

### The Flow

**Missions 1-4 (Boot Sequence):** Pure single-player. No mention of other players. No competitive elements. The player learns primitives in safety. The campaign map shows only the 10 provinces.

**After Mission 4 — Field Test Alpha appears:**
A small island materializes off the coast between Siquijor and Palawan on the campaign map, connected by a dashed circuit-board cable. The boot log types: `[SIGNAL INTERCEPT] Foreign architecture detected on adjacent frequency. Configuration captured. Analyzing...` The Field Test mission unlocks. It's framed as a campaign mission — same map treatment, same boot log preamble. But the opponent is a player ghost matched to the player's M1-4 skill level.

Field Test Alpha uses pre-placed units (matching M1-4's format). The player's hand-configured attention system faces another player's hand-configured attention system. No factory. No production. Pure primitive vs. primitive. The debrief is a simplified sealed watch — no Inspector tools yet (those aren't introduced until the campaign teaches them).

**Mission 5 (Factory Introduction) completes. Ghost Ladder unlocks:**
The campaign map gains a satellite dish icon off the eastern coast. The boot log: `[SUBSYSTEM ONLINE] External deployment capability activated. Your architectures can now be broadcast for field testing against unknown operators.` Ghost Ladder is accessible from the campaign map — it's positioned as a campaign feature, not a separate mode. The main menu doesn't change.

Ghost Ladder is async (Model A from 7.01). Deploy your current architecture, get matched against a ghost, watch the sealed replay when it resolves. Rating starts at 1000. Debrief is sealed watch + basic stats (ticks survived, units produced, signals sent). No Inspector.

**Between M7 and M8 — Field Test Beta:**
Full factory vs. ghost factory. The player has command agents, multi-blueprint coordination, and production tuning. This is the first "real" competitive match. The debrief now includes a limited Inspector view — context charts and decision traces, but not signal genealogy or full diagnostic tools. These are reserved for the Gauntlet.

**Between M9 and M10 — Field Test Gamma:**
Maximum difficulty ghost. Full system test. The debrief includes everything the player has unlocked so far. This match's ghost opponent is selected to be slightly above the player's current Ghost Ladder rating — a wall that creates "I need to improve" motivation for the Gauntlet.

**After Mission 10 — Gauntlet unlocks:**
Full competitive mode. Rated seasonal play. Complete Inspector access on every match. Ghost Ladder rating seeds Gauntlet calibration (as a starting point, not a locked rating). The Ghost Ladder satellite dish on the campaign map transforms — the icon gains a gold ring, the dashed cable becomes solid, the boot log: `[UPGRADE] Ghost Ladder → GAUNTLET. Full diagnostic suite enabled. Seasonal rating active.`

### Why This Hybrid Works

**The competitive exposure is pedagogically sequenced:**
1. Field Test Alpha: "Other people play this game" (awareness)
2. Ghost Ladder: "I can test my designs anytime" (practice)
3. Field Test Beta: "Factory-level competition exists" (escalation)
4. Field Test Gamma: "I need to be better to survive" (motivation)
5. Gauntlet: "This is the real thing" (destination)

**The Inspector is a Gauntlet-exclusive reward:**
Ghost Ladder and Field Tests have simplified debriefs. The player can see WHAT happened but not deeply analyze WHY. The Inspector's full diagnostic suite is the campaign's graduation gift. This creates pull toward campaign completion for competitive players: "I keep losing in Ghost Ladder but I can't figure out why → the campaign promises diagnostic tools → I should finish the campaign." The Inspector becomes the competitive advantage that campaign completion provides.

**Ghost Ladder never replaces the campaign:**
It's positioned as a campaign feature, accessible from the campaign map, framed within the boot-log fiction. It doesn't have its own main menu entry until Gauntlet transforms it. Competitive play is embedded in the campaign experience, not parallel to it.

**Rating continuity:**
Ghost Ladder → Gauntlet is a continuous rating evolution, not a reset. The player's Ghost Ladder matches establish a baseline. Gauntlet calibration refines it. Field Test performance contributes as well. By the time the player enters Gauntlet, the system has 3 Field Tests + N Ghost Ladder matches of data. Calibration is fast and accurate.

---

## Sensory Design: The Field Test Atmosphere

### Field Test Alpha — The First Encounter

**The map icon:** A tiny island southeast of Siquijor, barely visible — rocky volcanic outcrop with a single antenna tower. When the player hovers, the island lifts slightly (parallax) and the antenna blinks with a soft amber pulse. Clicking opens a brief boot-log terminal:

```
[FIELD TEST ALPHA]
Signal origin: UNKNOWN
Architecture class: PRIMITIVE (pre-factory)
Threat assessment: MATCHED TO YOUR CAPABILITY

Deploy current configuration? [EXECUTE]
```

**The loading transition:** The screen doesn't fade to black. Instead, static interference crawls from the edges of the campaign map inward — horizontal scan lines, each tinted slightly different cyan. The archipelago dissolves into noise. Then the 8x8 board resolves out of the static, tile by tile, left-to-right, top-to-bottom. Each tile snaps into place with a soft click — like tuning a radio and finding a frequency. The terrain is unfamiliar — not one of the campaign's Philippine provinces, but a procedurally generated layout with a faintly corrupted aesthetic (slight pixel displacement along tile edges, as if the transmission is imperfect).

**The opponent's units appear:** Instead of the campaign's slow dramatic unit reveals, enemy units simply... are there. Already on the board. Already configured. Already waiting. A small text label floats above the enemy base: `OPERATOR [CALLSIGN REDACTED]`. The redaction is a harsh black bar over what would be the username — the game explicitly signals "this is a real person but we're not telling you who."

**Audio:** The kulintang chord is absent. Field Tests have a different sonic signature — a low-frequency hum, almost subsonic, like a distant server room. When the tick clock starts, each tick is marked by a sharp mechanical click rather than the campaign's warm agung strike. The soundscape says: "This isn't the campaign. This is field conditions."

### Ghost Ladder — The Persistent Satellite

**The map icon:** A satellite dish icon positioned off the eastern coast of the archipelago, in open ocean. The dish rotates slowly (one revolution per 8 seconds). When the player has unviewed match results, the dish emits concentric pulse rings — amber circles expanding outward, like a radar ping.

**The deploy moment:** The player finishes configuring their architecture in the workbench, then clicks a "DEPLOY TO GHOST LADDER" button positioned below the campaign's EXECUTE button. The button is blue (not green like EXECUTE) with a satellite dish icon. On click:

1. The architecture visually compresses — blueprints shrink, channel wiring contracts, the entire configuration folds into a small glowing data packet (a cyan cube, 32×32 pixels, rotating slowly).
2. The data packet rises from the workbench and arcs across the screen toward the satellite dish icon on the campaign map.
3. The dish catches it — a brief flash of white — and the dish's rotation accelerates momentarily before settling back to normal speed.
4. A status ribbon appears: `GHOST ACTIVE | Rating: 1,047 | Searching for match...`

**Match result notification:** When a ghost match completes, the satellite dish emits a single strong pulse. The campaign map gains a small notification badge (amber dot with a number). Clicking the dish shows the result list — each match displayed as a minimal card:

```
vs. OPERATOR_4791  |  ✓ VICTORY  |  Tick 67 of 80  |  [WATCH]
vs. OPERATOR_8234  |  ✗ DEFEAT   |  Tick 43 of 80  |  [WATCH]
```

The WATCH button plays the sealed watch only. No Inspector. No scrubbing. Just the battle unfolding at 1x speed with the option to 2x. After watching, the card gains a muted "REVIEWED" label. Rating adjusts visibly — the number ticks up or down with a soft chime (ascending for gain, descending for loss).

### Ghost Ladder to Gauntlet Transformation

**The moment:** After Mission 10's boot log completes (`[OK] ALL SYSTEMS ONLINE`), the satellite dish on the campaign map begins to vibrate. The slow rotation accelerates. The dashed circuit-board cable connecting the dish to the archipelago solidifies — dashes filling in left-to-right with a solder-joint animation and tiny sparks at each connection point. The dish itself transforms: the structural supports thicken, the dish gains a gold ring around its rim, and the amber pulse shifts to gold.

A new boot-log line types across the dish's status ribbon:
```
[SYSTEM UPGRADE] Ghost Ladder → GAUNTLET
[+] Full diagnostic suite: ENABLED
[+] Seasonal rating: ACTIVE
[+] Inspector access on all matches: UNLOCKED
[OK] Welcome to the Gauntlet, Operator.
```

The first time the player opens the Gauntlet, the stripped-down Ghost Ladder interface expands. The match result cards gain new elements: an "INSPECT" button (gold, magnifying glass icon) alongside WATCH. The rating display gains a seasonal tier indicator. The minimal status ribbon becomes a full dashboard with match history, seasonal stats, and the eEDT trajectory chart.

---

## Player Journeys

### Journey: Kai, 22, Competitive Gladiabots Veteran

**Context:** Kai bought Robot Uprising because a Reddit post compared it to Gladiabots. He wants PvP. He doesn't care about story. He played Gladiabots for 400 hours and was top 50 on the ranked ladder.

**Minute 0:00 — First Launch**
Main menu: Campaign. Blueprint Codex (locked). Settings. No PvP option visible. Kai's eyebrow rises. He clicks Campaign. The boot log starts typing. He reads it — the writing is good, actually. The "you are an AI reading your own spec sheet" hook catches him. He leans in slightly.

**Minute 0:20 — Mission 1 (Wake Up)**
Pre-placed scout. Context window visualization. Kai gets it instantly — he recognizes the attention system from Gladiabots' target selection. He clears the filter puzzle in 40 seconds. The sealed watch plays. His scout navigates correctly. He nods. "OK, same concept, different vocabulary."

**Minute 1:30 — Mission 4 (Noisy Channel)**
Kai has blazed through Missions 1-3 in 15 minutes. He knows hooks from Gladiabots' communication system. He's mapping Robot Uprising's vocabulary onto his existing mental model. The Mission 4 noisy channel puzzle makes him think — the context overload mechanic is new. He fails once, adjusts the eviction priority, passes. "Interesting. Gladiabots doesn't have buffer pressure."

**Minute 2:00 — Field Test Alpha Appears**
The volcanic island materializes on the campaign map. Kai's eyes widen. "Wait — is this PvP?" He reads the boot log: `FOREIGN ARCHITECTURE DETECTED.` He clicks immediately. The static transition loads. He sees the unfamiliar board. He sees `OPERATOR [CALLSIGN REDACTED]`. "It IS PvP." His posture shifts. He's no longer casually playing a tutorial. He's configuring for competition.

**Minute 2:30 — Field Test Alpha Battle**
His attention architecture faces the ghost. It's a close match — his aggressive scout positioning works initially, but the opponent's relay chain creates a coordinated striker response that his scouts can't handle. He loses at tick 38. The simplified debrief shows: "Opponent's signal chain completed faster than your direct control." No Inspector. No deep analysis. Just the outcome and a high-level summary.

Kai's reaction: not frustration — curiosity. "Their relay chain was faster. How do I analyze that?" He notices the campaign promises Inspector tools in later missions. He has a new motivation for the campaign: not story, not tutorial, but **diagnostic tools for competitive play**.

**Minute 3:00 — Mission 5 (Factory)**
Kai attacks the factory mission with new purpose. He's not just learning factories — he's building a competitive architecture. When Ghost Ladder unlocks after Mission 5, he deploys immediately. Then continues the campaign. He checks Ghost Ladder results between every mission.

**Minute 4:30 — Field Test Beta**
Full factory vs. factory. Kai's first real competitive match. He wins — barely. The limited Inspector (context charts, decision traces) shows him exactly where his relay chain nearly collapsed. "I need the full Inspector. I need signal genealogy." He pushes through Missions 8-9 specifically to unlock Gauntlet.

**Minute 6:00 — Gauntlet Opens**
Kai enters with a Ghost Ladder rating of 1,340. His Gauntlet calibration is fast — 3 matches to place. He's ranked in the top 20% of the initial ladder. He opens the full Inspector on his first Gauntlet match and exhales: "Finally. THIS is the game."

**UI Annotations:**
- Field Test loading: horizontal scan-line static, tile-by-tile board reveal, mechanical tick sounds
- Ghost Ladder deploy: blue satellite button, architecture compression animation, data packet arc
- Gauntlet transformation: dish vibration, cable solidification, gold ring appearance

---

### Journey: Sofia, 15, First-Time Strategy Player from Manila

**Context:** Sofia downloaded Robot Uprising because her older cousin showed her a TikTok of a relay chain saving a scout. She has never played a strategy game. She plays Mobile Legends and Genshin Impact.

**Minute 0:00 — First Launch**
The boot log captivates her. "You are an AI reading your own spec sheet" — she giggles. She's never seen a game talk to her like this. She takes her time with Mission 1, reading every tooltip, dragging every filter card carefully.

**Minute 8:00 — Mission 4 Complete**
Sofia has taken 35 minutes to reach Mission 4. She's careful, deliberate, and proud of every clear. She's named her scouts ("Tala" and "Bituin"). The context overload mechanic in Mission 4 was hard — she failed twice — but the boot log's patient tone kept her going.

**Minute 8:30 — Field Test Alpha Appears**
The volcanic island appears. Sofia reads the boot log: `FOREIGN ARCHITECTURE DETECTED.` She's confused. "Is this another mission?" She clicks. The static transition is unsettling — the warm campaign aesthetic dissolves into interference. The board loads. She sees `OPERATOR [CALLSIGN REDACTED]`. "Wait... that's a real person?" Her stomach tightens. She's never competed against a human in a strategy game.

**Minute 9:00 — Field Test Alpha Battle**
She deploys her careful, conservative configuration. The sealed watch begins. Her scout Tala (she doesn't know it's just a unit, she thinks of it as Tala) moves cautiously. The opponent's scout is faster, more aggressive. Their striker appears from behind terrain and eliminates Tala. Sofia gasps. "No!" The match ends. She lost.

The simplified debrief says: "Opponent's perception range exceeded yours." Sofia stares at the screen. She's not angry — she's determined. "I need to learn more." She clicks back to the campaign map. The next campaign mission is Mission 5 — the factory. She's motivated to learn factories not because the game told her to, but because she wants to build a better architecture to avenge Tala.

**Minute 10:00 — She Ignores Ghost Ladder**
Ghost Ladder unlocks after Mission 5. Sofia sees the satellite dish. She reads the description. She's not ready. She's still learning factories. She continues the campaign without deploying a ghost. The satellite dish sits idle on her map for three more missions.

**Minute 25:00 — Mission 7 Complete, First Ghost Deploy**
After completing Mission 7 (Pressure Test), Sofia finally feels confident enough to deploy. Her architecture has two scouts, a relay, two strikers, and her first attempt at a command agent. She clicks DEPLOY TO GHOST LADDER. She watches the data packet arc to the satellite. She goes to bed.

**Next morning — First Ghost Result**
She opens the game. The satellite dish is pulsing. She clicks it. `vs. OPERATOR_6127 | ✓ VICTORY | Tick 52 of 80`. She screams. She literally screams. She calls her cousin. "I beat a real person!" She watches the replay three times.

**UI Annotations:**
- Field Test static transition: deliberately unsettling for first-time players, breaks campaign comfort
- Ghost Ladder deploy: the packet-arc animation transforms a scary moment (deploying to PvP) into a gentle, beautiful ritual
- Victory notification: amber pulse from satellite dish, ascending chime, bold green ✓

---

### Journey: Marcus, 42, DevOps Engineer and Into the Breach Veteran

**Context:** Marcus has played Into the Breach for 300 hours. He values clean systems, perfect information, and analytical depth. He bought Robot Uprising for the Inspector — the idea of tracing decisions through an agent's context window is exactly how he debugs production incidents.

**Minute 0:00 — Campaign Start**
Marcus appreciates the boot log's technical tone. He maps every concept to his professional vocabulary: context window = log buffer, rules = alert policies, hooks = webhooks, eviction = log rotation. The campaign feels like configuring a monitoring system that happens to fight battles.

**Minute 4:00 — Field Test Alpha**
Marcus wins Field Test Alpha easily. His Into the Breach experience gives him perfect positional awareness. But the simplified debrief frustrates him. "I can see I won, but I can't see WHY I won efficiently. Where were the wasted signals? What was the buffer utilization curve?" He wants the Inspector. He knows it's coming.

**Minute 5:30 — Ghost Ladder (Aggressive Deployment)**
Marcus deploys to Ghost Ladder the moment it unlocks. He deploys after every campaign mission. He treats Ghost Ladder as a CI pipeline — the campaign is writing code, Ghost Ladder is running tests against production traffic. His rating climbs steadily: 1,000 → 1,150 → 1,280.

But he's frustrated. He can see from the sealed watch that his relay chain has a latency problem around tick 40, but without the Inspector, he can't trace the signal path to find the bottleneck. He writes down observations in a notebook. He's manually doing what the Inspector would automate.

**Minute 12:00 — Field Test Beta**
The limited Inspector access in Field Test Beta is a revelation. Marcus finally gets context charts and decision traces. He spends 20 minutes in the Field Test Beta debrief — longer than the battle itself. He finds the latency problem: his relay's eviction policy was dropping high-fidelity scout signals in favor of older low-fidelity data. He fixes the eviction priority. His next Ghost Ladder match shows a 15% improvement in signal delivery time.

**Minute 15:00 — "The Inspector is the Competitive Advantage"**
Marcus realizes the game's design: the Inspector is gated not as punishment but as **incentive**. Ghost Ladder without Inspector is like monitoring without dashboards — you know something is wrong but can't find the root cause. The campaign teaches the Inspector. The Gauntlet rewards Inspector mastery. Campaign completion doesn't just unlock PvP tools — it teaches you to use them.

Marcus finishes the campaign not because he enjoys the narrative (he skips most boot-log flavor text) but because each mission unlocks Inspector capabilities that directly improve his Ghost Ladder performance. By Mission 10, he enters the Gauntlet with a Ghost Ladder rating of 1,450 and a deep understanding of every diagnostic tool.

**UI Annotations:**
- Ghost Ladder as CI: Marcus deploys after every mission, treats results like test output
- Inspector gating: the "I can see it but can't analyze it" frustration as designed pull
- Gauntlet entry: his 15+ Ghost Ladder matches provide excellent calibration data

---

### Journey: Tala, 17, Batangas Student, Plays on Budget Android Phone

**Context:** Tala found Robot Uprising through the web demo embedded in a Philippine gaming blog. She's playing on a Realme C55. She has limited data. She plays during her jeepney commute and at home on WiFi.

**Minute 0:00 — Campaign on Mobile**
Tala plays through Missions 1-4 over three days, 15-20 minutes per session on the jeepney. The portrait-mode touch controls work well. She uses the ghost hand tutorial when needed. She's methodical and patient.

**Day 4 — Field Test Alpha on WiFi**
She waits until she's on home WiFi to attempt Field Test Alpha — it requires downloading a ghost configuration, which she assumes needs data. (The game actually caches ghost configs at ~2KB each, but she doesn't know this.) She plays the Field Test. She loses. She retries with a modified configuration. She wins. She feels the same rush Sofia felt but expresses it differently — she screenshots the victory card and sends it to her class group chat. Three classmates download the game.

**Day 7 — Ghost Ladder Deployment Anxiety**
Ghost Ladder unlocks. Tala hovers over the DEPLOY button for 30 seconds. She's worried about data usage. She's worried about being bad. She reads the status text: "Your architecture will be matched against a similar-level operator." Similar level. She deploys.

The ghost match resolves while she's in school. She checks results during lunch break — on mobile data, the match result card loads instantly (text-only, <1KB). `✓ VICTORY`. She shows the phone to her seatmate. "I won against a real person." Her seatmate: "What game is that?"

**Day 14 — Field Test Beta, the Wake-Up Call**
Field Test Beta is Tala's first factory-level competitive match. Her factory design is simple — one blueprint, scouts and strikers only. The ghost opponent has relays, a command agent, compressed signal chains. Tala gets demolished. The limited Inspector shows her exactly why: her strikers acted on stale information because she had no relay chain to compress and forward scout data.

This is the moment Tala decides to master the game. She returns to Mission 6 and replays it. She practices relay configurations in the sandbox between missions. She deploys to Ghost Ladder with relay architectures. Her rating, which had climbed to 1,120, drops to 1,050 during the learning period, then climbs past 1,200. The rating curve maps exactly to her skill growth.

**UI Annotations:**
- Data-conscious design: ghost configs cached at ~2KB, match results <1KB text
- Mobile deploy: same blue button, same packet animation, touch-friendly sizing
- Social sharing: screenshot of victory card as the primary social artifact

---

## Interaction Effects

### × Campaign Pacing (5.04, 5.04a)
The Field Test missions slot into the existing campaign pacing. Field Test Alpha sits in the natural breath between the Boot Sequence (M1-4) and the Assembly (M5-7). Field Test Beta sits between Assembly and the final push (M8-10). They function as intermissions that are also escalation points. The "Mission 5 Wall" (5.04a) is slightly eased by Ghost Ladder — the player can shift attention to competitive play if the factory introduction is overwhelming.

### × Inspector as Teaching Tool (5.22)
Inspector access is deliberately progressive: no Inspector in Field Test Alpha, limited Inspector in Field Test Beta and Ghost Ladder, full Inspector in Gauntlet. This mirrors the campaign's own Inspector introduction (the two-act debrief in 4.04b). The competitive path and the pedagogical path use the same progressive tool access.

### × Async PvP Survival (1.06c)
Ghost Ladder IS async PvP. The model inherits all of Gladiabots' small-community survival properties. A game with 200 active Ghost Ladder players can still provide reasonable matchmaking. A game with 200 synchronous PvP players cannot.

### × Sealed Watch Purity (locked design)
Field Tests and Ghost Ladder replays use sealed watch — no skip, no pause. This preserves the quality signal from the locked design while providing competitive context. The player watches their architecture succeed or fail against a real opponent with the same emotional constraints as campaign missions.

### × Rating Continuity (5.22a, 5.22b)
Ghost Ladder rating → Gauntlet calibration is a continuous function, not a reset. The system has N Ghost Ladder matches + 3 Field Tests of performance data by Gauntlet entry. Calibration placement is fast (2-3 matches vs. Overwatch's 10) because the system already has signal. This directly addresses the "Gauntlet ELO calibration match design" question from 5.22b.

### × Community Moderation (7.03b)
Ghost Ladder generates community interaction earlier in the player lifecycle. The moderation infrastructure from 7.03b must be active from Ghost Ladder, not just Gauntlet. This means trust levels (7.03b Model B) need a pre-campaign tier — players who have only completed Mission 5 but are actively competing.

### × Mobile/Touch (6.07)
Ghost Ladder's deploy-and-check-later model is perfectly suited for mobile play. Tala's journey illustrates the natural fit: configure on WiFi, deploy, check results on mobile data between classes. The async model accommodates mobile constraints (intermittent connectivity, short sessions) in ways synchronous PvP cannot.

---

## Comparable Games: Unlock Gating Spectrum

| Game | PvP Gate | Hours to Unlock | Justification |
|------|----------|----------------|---------------|
| TFT | None | 0 | Simple rules, each match teaches |
| Gladiabots | None (campaign uses real ghosts) | 0 | Campaign IS competitive practice |
| Slay the Spire | 1 clear per character | 1-3 | Ensures basic mechanical understanding |
| Into the Breach | No PvP (community challenges post-clear) | 3-5 | Single-player-first identity |
| Overwatch 2 | 50 Quick Play wins | 10-15 | Protects team experience quality |
| League of Legends | Level 30 + 20 champs + 10 normals | 50-100 | Extreme complexity, team dependency |
| **Robot Uprising (recommended)** | **Ghost Ladder at M5, Gauntlet at M10** | **1.5-2 (Ghost) / 4-5 (Gauntlet)** | **Progressive exposure, Inspector as reward** |

---

## The Anti-Pattern: What To Avoid

**Don't be StarCraft 2.** SC2's campaign and multiplayer were completely separate games using different mechanics, different units, and different skills. The campaign taught hero abilities, the multiplayer demanded build orders. The result: the campaign was great, multiplayer was great, and most players played only one. Co-op Missions bridged the gap but arrived years late.

**Don't be Overwatch 2 (too heavy a gate).** 50 wins is 15-25 hours of Quick Play before ranked. For a game that bills itself as competitive, this feels like the DMV. The gate exists because one bad player ruins 9 others' experience — Robot Uprising's async PvP doesn't have this problem.

**Don't be TFT (no gate at all).** Zero gating works for TFT because each match is self-contained and the rules are learnable in 3 matches. Robot Uprising's attention system primitives require more vocabulary. A zero-gate player faces a Plan screen they cannot read.

**Be Gladiabots with better scaffolding.** Gladiabots proves that async ghost PvP works for small communities with programming-game audiences. But Gladiabots' campaign is an afterthought — levels get hard fast, with minimal narrative or emotional investment. Robot Uprising's campaign is a first-class experience. The recommended design uses it as the scaffold that Gladiabots lacks.
