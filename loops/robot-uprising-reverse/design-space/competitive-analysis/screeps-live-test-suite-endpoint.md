# Design Space: Screeps as the "Live Test Suite" Endpoint

**Aspect:** 1.04f
**Category:** Competitive Analysis / Core Mechanic Synthesis
**Depends on:** [1.04e — 100-test-case robustness](../campaign/mission-design-robustness-scenarios.md), [1.05 — Screeps persistent world](screeps.md)

---

## The Thesis

Aspect 1.04e established that robustness testing — running your agent configuration against many randomized scenarios — is a first-class mechanic in Robot Uprising. The campaign ramps from 10 test cases to 100.

But what is the endpoint of that axis?

Screeps answers: **the live adversarial environment.** Not 100 scenarios. Not 1,000 procedurally generated enemies. An infinite, evolving, human-driven adversarial space where every possible strategy exists because real players invent them. Your configuration must work not against a test suite you can enumerate, but against a creative field that continuously generates novel attacks.

This is the logical extreme of the robustness principle:

```
Tutorial mission        →   1 scenario
Early campaign          →   10 scenarios
Mid campaign            →   50 scenarios
Late campaign           →   100 scenarios
Robustness endgame      →   ∞ scenarios (Screeps World)
```

The question this aspect explores: **What does "Screeps World endpoint" look like if you don't want a full 24/7 MMO?** Can Robot Uprising capture the adversarial-evolution dynamic without the vacation-death anxiety and subscription paywall that made Screeps inaccessible?

This analysis maps four distinct design options — from minimal-footprint async challenge to full persistent war — and traces what each feels like to actually play.

---

## What Makes the Live Endpoint Different

In the 100-test-case mode, the player knows (or can discover) the bounds of the scenario space. The maximum threat is enumerable. You can reason about worst cases. There is a definable "perfect config" — one that handles all 100 cases.

In a live adversarial environment, that bound does not exist. There is no perfect config. There is only the current best-available config, which will eventually be outmaneuvered by a strategy you haven't seen. The design shifts:

| Dimension | 100-Test-Case | Live Adversarial |
|-----------|--------------|-----------------|
| Goal | 100% pass rate | Highest win rate over time |
| Perfection | Possible | Impossible |
| Threat space | Fixed (designer-controlled) | Infinite (player-driven) |
| Learning signal | Which of 100 cases you fail | Which specific human tactic defeats you |
| Optimization loop | Converges (you can finish) | Diverges (arms race) |
| Emotional register | Completionist satisfaction | Competitive anxiety + pride |
| Replayability mechanism | Perfect solution → histogram glory | Elo climb, meta shifts, seasonal resets |

The emotional shift is enormous. 100-case robustness creates the satisfaction of a solved puzzle — the clean 100/100, the tight architecture, the debrief showing a green grid. Live adversarial creates the feeling of a living ranking — you're never done, never safe, always watching for the next innovation that will invalidate your current build.

Screeps discovered that a subset of players strongly prefer the live mode even though it eliminates the "finished" feeling. Arena (match-based, finite) had dramatically fewer players than World (persistent, infinite), despite being more accessible. The persistence fantasy mattered more than the accessibility gain.

---

## Four Design Options for Robot Uprising

### Option A: The Gauntlet (Async Config Challenge)

**The Concept:** A passive endgame mode where you upload your campaign-beating configuration to "The Gauntlet." Your config is automatically matched against configs submitted by other players. Matches run server-side, asynchronously. You check in to see how you're doing.

**How It Works Mechanically:**
- After beating the campaign, unlock "Submit to Gauntlet" from the workbench
- Your config is assigned an Elo rating, starting at 1000
- Each day, your config runs 20 matches against randomly matched opponents of similar rating
- You get a daily digest: "17/20 wins today. Lost to configs that used [hook-flood attack]. Your buffer model may be vulnerable to saturated channels."
- No 24/7 commitment. You check the digest whenever. Your empire doesn't die while you sleep — it just doesn't run while you sleep.
- Meta-evolving: the Gauntlet's match pool shifts as players update their configs. A strategy that was dominant in Week 1 may be obsolete by Week 4 as players develop counters.

**The Interface:**
A leaderboard screen distinct from the campaign map. Your config shown as a "registered combatant" with a portrait (the robot formation you prefer), an Elo graph trending over time, and a match history grid: win/loss, opponent Elo tier, brief reason (generated from battle replay — "lost: opponent's relay agent survived 3 ticks after your striker was neutralized, breaking your flanking hook chain").

**What Makes It Compelling:**
- Zero anxiety. No persistent world. Your farm doesn't die.
- But the meta is real. The strategies you face aren't scripted — they evolved from humans trying to beat you.
- The "check the digest" ritual mimics Screeps' "check overnight performance" moment without the commitment.
- Configuration evolution: as you identify patterns in what defeats you, you update your config and resubmit. The Gauntlet remembers your version history — you can see whether version 7 is actually better than version 5.

**What Breaks It:**
- If the playerbase is small, matches degenerate (you fight the same 12 configs endlessly).
- Without narrative framing, it can feel like a lobby — mechanical, cold.
- No way to spectate live: all matches happen in the background, so you never watch a real fight in real time.

---

### Option B: The Arena League (Match-Based Async PvP)

**The Concept:** An optional competitive mode separate from the campaign. Players create "fight configurations" — agents + hooks configured specifically for 1v1 or 2v2 combat — and submit them to a league. Matches are scheduled, executed by the server, and results posted. The feel: Chess.com's correspondence chess mode, or Robocode's league system. This is closer to EXAPUNKS' battle mode than to Screeps.

**How It Works Mechanically:**
- Separate "Arena" unlocked after campaign completion (or mid-campaign as a side mode)
- Create a "fight deck": pick your army composition from your unlocked skills, configure hooks and rules, set buffer sizes
- Submit to a weekly league bracket. Matches run automatically, results posted 24 hours later
- Each match generates a full replay you can scrub frame-by-frame in the debrief
- Three league tiers: Copper (new players, vanilla configs), Iron (mid-tier, first optimization), Gold (endgame, meta-aware configs). Promotion/relegation based on weekly win rate.
- Season length: 4-6 weeks. End-of-season cosmetics (a trophy config portrait frame, a special animation for your winning hook chain).

**The Interface:**
An Arena screen separate from the campaign. Shows:
- Your current config ("Active Loadout": army layout, buffer profile)
- Your league rank and tier badge
- Week's match schedule: 5 upcoming opponents (their tier, their last-known config snapshot, their win record)
- Match replays available: click any past match, open the full debrief, see exactly where you lost
- "Edit Loadout" button that opens the workbench with Arena-specific constraints (e.g., 6 agents max, 2 fabbers max)

**What Makes It Compelling:**
- The match replay is the killer feature. After losing, you WATCH the replay. You see the exact tick where your hook chain broke. You see the opponent's relay agent survive one tick longer than you expected, forwarding a signal your striker never received. You fix exactly that.
- The seasonal reset creates a fresh meta. Everyone starts at 1000 Elo. The first week of a new season is the most exciting — no established meta, all configs are untested.
- Gladiabots uses this exact model. Players found it deeply satisfying. The async match result notification ("your bot WON") functions like a push notification from a friend. Visceral.

**What Breaks It:**
- Config cliffing: if a dominant meta config emerges (e.g., "spam relay agents with max buffer hooks"), the season becomes stale until the next reset.
- Player count problem: small playerbase means long queue waits and degenerate matchmaking.
- No "live" feel: because matches are async, there's no watching a real fight in real time.

---

### Option C: The Simulation Farm (AI-Generated Adversarial Environment)

**The Concept:** Instead of other players' configurations, the adversarial environment is generated by an AI system that learns to defeat your architecture. The farm runs forever, throwing increasingly sophisticated configurations at you. When you submit your config to the farm, it generates opponents specifically calibrated to probe your weaknesses — not random difficulty, but targeted adversarial generation.

**How It Works Mechanically:**
- Your config is profiled over 100 matches against a "baseline adversary" (a known-good enemy config)
- The system identifies your most common failure modes (e.g., "loses when relay agent is jammed on turn 4")
- For the next 100 matches, it generates adversaries that specifically exploit that failure mode: more jamming attacks, different jam timing, jam + flanker combos
- You fix the vulnerability. The system finds the next one.
- The farm never runs out of scenarios because it generates new ones calibrated to your current config's specific weaknesses
- Your "Farm Rating" tracks how many rounds it took the farm to find an unconquered vulnerability. A config that survives 500 rounds before failing rates higher than one that fails at round 50.

**The Interface:**
The Farm reads like a penetration test report. After each round batch:
```
FARM REPORT — Round 124–200
Config: "Swarm v3" (uploaded 3 days ago)

PROBE SEQUENCE: Relay Isolation Attacks
  - Round 124–141: Direct jammer on relay agent. Result: 18/18 DEFEATED.
  - Round 142–163: Delayed jammer (turn 6 instead of turn 2). Result: 22/22 DEFEATED.
  - Round 164–181: Dual jammer (relay + closest striker). Result: 11/18 DEFEATED.
                   *** VULNERABILITY IDENTIFIED ***
  - Round 182–200: Dual jammer with hook-flood feint. Result: 0/18 DEFEATED.
                   *** EXPLOIT CONFIRMED ***

RECOMMENDED: Configure relay agent to maintain 2-hop backup path.
Next probe sequence: Scout Blinding Attacks (based on observed config topology).
```

**What Makes It Compelling:**
- No player count dependency. The farm runs regardless of community size.
- The adversarial AI teaches you about YOUR specific weaknesses, not general ones. This is more pedagogically efficient than human opponents (who may exploit random strategies) or fixed scenarios (which may not probe your specific failure modes).
- The "next probe sequence" creates a Columbo dynamic — the farm is building a case against you. Each report reveals one more layer of your config's vulnerability. Paranoid and exciting.
- Works entirely offline. No servers needed beyond the single-player game.

**What Breaks It:**
- Without real human creativity, the farm eventually becomes a solvable puzzle. If the AI is finite in its strategy space (even if large), a sufficiently hardened config will eventually achieve a 100% farm rating — and then there's nothing more to do.
- The AI's generated strategies may not feel "real." A human opponent makes weird choices that break your assumptions. A generated adversary operates within a known strategy vocabulary.
- No social dimension. No one to brag to about your farm rating.

---

### Option D: The Persistent War (Full Screeps-Style Mode)

**The Concept:** An optional persistent-world server where player factions fight 24/7. Not a seasonal league — a permanent world. Your configuration runs continuously. When you're offline, your territory is defended by your bots. When you're online, you tune them.

This is the design option most true to Screeps, and it comes with all of Screeps' baggage.

**How It Works Mechanically:**
- Persistent server (or self-hosted via open-source server code)
- Factions of players control territory on a shared map
- Your army configuration auto-executes every tick: scouts patrol, defenders respond, attackers probe
- Territory control is the score metric. More territory = more resources = better fabricator capacity = better armies
- The only way to influence your faction's performance is to edit your configuration. No manual unit control.
- Login anytime. The war continues without you.

**What Makes It Compelling:**
- **The ownership feeling** Screeps players describe: your empire, running right now, extending while you work. Nothing else replicates this.
- **The arms race**: meta-evolution happens in real time. Someone invents a new hook topology. It starts winning. Within a week, every faction has deployed counters. The meta shifts weekly.
- **The community dimension**: in Screeps, posting "I finally automated cross-room resource routing" to the Discord is a social achievement. Robot Uprising would generate similar stories: "I got the combo-relay strategy working for the first time last night. Took over 3 sectors by morning."
- **Genuine stakes**: losing a sector to a neighbor because your hook chain was misconfigured HURTS in a way that losing a campaign mission doesn't.

**What Breaks It:**
- **All of Screeps' problems.** Vacation death. Subscription paywall if you want competitive CPU allocation. Tutorial cliff. Stale client. The 24/7 commitment.
- **Amplified by Robot Uprising's younger/casual audience.** Screeps' audience was primarily experienced programmers who enjoyed the commitment. Robot Uprising aims broader. The persistent mode would be self-selecting to that niche while potentially signaling "this game is for hardcore players only" to casual players considering the main campaign.
- **Server costs.** A persistent 24/7 multiplayer server is expensive to run. This requires either a subscription model, a player-operated server network, or a well-funded studio.

**Design Recommendation:** If pursued, should be opt-in for campaign completionists, server code should be open-source (enabling private servers, eliminating server cost risk), and the entry point should require completing the full campaign first (ensuring baseline competence).

---

## Player Journeys

### Journey: Nadia, 27, Software Engineer, Campaign Completionist

**Context:** Nadia just beat the final campaign mission. 100% pass rate on the last mission's 100-case suite. She's been playing for 3 weeks. She knows her architecture intimately: a 3-tier hierarchy (commander → relay → leaf agents), queued hooks, compressed signal forwarding. It feels unbeatable. She wants to test it.

**Minute 0:00 — The Unlock**
The campaign victory screen fades. A new notification appears in the lower-right corner — a pulsing amber beacon with text: **THE GAUNTLET IS OPEN.**

Nadia clicks it. A new screen: "Your configuration has been registered as Combatant #7,441. Elo: 1000 (provisional)."

Below: "Your first 20 matches will begin tonight. Check back in 6-12 hours for your first digest."

She closes the app. Goes to work. Thinks about her relay agent's hook configuration during a meeting.

**Hour 18:00 — The First Digest**
The game sends a push notification (Steam notification if desktop, browser notification if web): "GAUNTLET DIGEST: 14/20 wins. 3 new loss patterns identified."

She opens the game. The Gauntlet screen shows her first week:

```
COMBATANT: "Swarm v1" (Nadia)
ELO: 1042 (+42)  |  Week 1 PROVISIONAL

WINS: 14  |  LOSSES: 6

LOSS PATTERN ANALYSIS:
  Pattern A (4 losses): Your striker hook chain fires BEFORE relay agent
                         confirms signal receipt. Against fast jammer builds,
                         relay is silenced before forwarding. Striker executes
                         without updated position data. [View replay →]

  Pattern B (2 losses): Opponent deployed 8-agent swarm with no command layer.
                         Your commander's scan interval (every 5 ticks) missed
                         the rapid entry formation. [View replay →]
```

Nadia clicks Pattern A. The replay opens. She watches: tick 3, her relay agent receives a position signal. Tick 4, an enemy jammer fires. Tick 5, relay agent is silenced. Tick 6, her striker fires at the last-known position — but the target has moved. Miss. The enemy striker, unimpeded, eliminates her formation.

She closes the replay. Opens the workbench. Adds an ACK hook to the relay: "striker fires only after relay confirms forward." Resubmits. "Swarm v2" registered.

*The Gauntlet has taught her something 100 scenario-tests never surfaced: real opponents SPECIFICALLY target her relay because it's the linchpin. The test suite didn't include "jam the relay at exactly the right moment." A human opponent did.*

**Hour 48:00 — The Meta Shift**
Two days later, another digest:

```
ELO: 1098 (+56)  |  Week 1

WINS: 18  |  LOSSES: 2

NOTE: Pattern A addressed successfully. Pattern B still present.
  New pattern C (2 losses): Opponent using "hook flood" — 12 simultaneous
                            signals saturating your relay's queue. 8 signals
                            dropped. Commander receives incomplete picture.
                            [View replay →]
```

The hook flood. She's never encountered this. She watches the replay: the enemy faction deployed a "noise generator" agent specifically to fire junk signals into her relay. Her relay's bounded queue dropped real intelligence to make room for the noise.

She reads the replay for 20 minutes. Builds a signal filter — a priority rule that identifies null-content signals and drops them before they enter the relay's queue. Resubmits. "Swarm v3."

*The Gauntlet is a teacher with infinite patience and infinite students. It has shown her three failure modes in 48 hours that she'd never have found in solo play.*

**Week 4 — The Arms Race**
Nadia's Elo: 1,310. Top 15% of registered combatants. But the meta has shifted. In Week 1, most players didn't know about the relay-first attack vector. By Week 3, it's standard. Everyone targets the relay. Nadia has hardened hers. Now she's seeing attacks on her COMMANDER — stripping the brain so the rest of the army flails.

She redesigns: a "headless" architecture that degrades gracefully. No single point of failure. Each agent can operate in "solo mode" if disconnected from the command chain.

The redesign costs her a week of losses (Elo drops to 1,220) before it stabilizes. But when it stabilizes, she's running an architecture she couldn't have imagined in Week 1.

*This is the Gauntlet's unique value: forced evolution. She has become a better designer by being attacked.*

**UI Annotations:**
- Gauntlet screen: split into "My Combatant" (left panel — elo graph, current version, match history grid) and "Meta Report" (right panel — what's winning this week, which strategies are emerging)
- Match history grid: 7 days × 20 matches. Green dots (wins), red dots (losses). Click any red dot = open that replay in the debrief.
- Version history: your past config submissions, each with its Elo trajectory. Visual cue: a declining Elo after a resubmit suggests the new version is worse — you can roll back.
- Elo graph: blue line with weekly averages. Dotted line showing the server median for context.

---

### Journey: James, 35, Casual Player, Was Never Going to Beat the Campaign

**Context:** James is on campaign mission 5. He's stuck. He can't get above 60% on the 50-test-case suite. He's been browsing the game's community hub when he sees a Steam Workshop post: "Gauntlet Replay Pack — Week 3 Top 10 Configs." He downloads it.

**Minute 0:00 — The Proxy Experience**
James opens the downloaded replay pack in his game. It launches a special replay viewer: you're watching someone else's config play. No workbench. No controls. Just the battle.

He watches Config #1 ("Apex v6 — 1,342 Elo"). He sees the battle unfold. A scout circles the perimeter, feeding position signals back to a relay. The relay compresses. A pair of strikers, tightly hooked, execute simultaneously — a flanking maneuver from both sides. The enemy barely fires a shot.

James has never seen this topology. He didn't know you could hook two strikers to the same relay in a synchronized discharge. He didn't know the relay's compression could feed both simultaneously.

He watches three more replays. By the fourth, he's sketching the topology on paper.

He opens his campaign mission 5. He applies a variant of the relay-twin-striker topology he saw. Runs the 50-case suite. 78%.

*Watching other people's Gauntlet replays is indirect coaching. The community generates tutorials without writing any.*

**Minute 45:00 — Social Aspiration**
James opens the Gauntlet leaderboard — not to submit (he hasn't beaten the campaign), but to look. He can see combatant names, their Elo, their last version tag. One player at #3 is named "quietstorm_8." Their config is called "The Understated Flanker."

James doesn't know what that means. But he wants to. He now has a goal: figure out what "The Understated Flanker" is, and learn it.

*The Gauntlet leaderboard functions as aspirational content even for players who can't yet access it. Readable by anyone. Enterable only by completionists.*

**UI Annotations:**
- Replay viewer: full-screen battle, no UI chrome except a scrub bar, a speed control, and "open config" button that opens a READ-ONLY view of the submitter's config. Can view but not copy (to encourage organic learning rather than straight theft — though some games take the opposite stance).
- Leaderboard: public-facing, visible without campaign completion. Acts as a "gallery of what's possible."
- Workshop/community hub: replay packs, config write-ups, "how I built my Gauntlet config" tutorial posts. Screeps' culture of open-source bots is this, but built in.

---

### Journey: Chen, 42, Zachtronics Veteran, Building For the Meta

**Context:** Chen played every Zachtronics game. He beat Robot Uprising's campaign in 8 days. His config is already clean — tight buffer allocations, minimal hook depth, 100/100 on every mission. He's submitted to the Gauntlet. He checks it every morning like email.

**Day 1 — Baseline Establishment**
Chen's first digest: 17/20 wins. He notes which 3 he lost. Two are Pattern A (relay timing). One is a novel pattern he hasn't seen.

He watches the novel loss. His reaction: "interesting." He recognizes the opponent's strategy immediately — a "creep and compress" approach where the enemy uses many slow-moving scouts to exhaust his buffer with position updates before deploying the actual striker. His buffer is full of stale scout-position updates when the striker fires. He has no capacity for new threat data.

He doesn't patch it immediately. He wants to understand the pattern better. He watches 3 more matches where similar losses occurred (he can filter match history by loss pattern). After analysis, he builds a "signal age eviction rule": scout-position data older than 4 ticks is marked as low-priority and evicted first. The threat signal takes priority.

*Chen's workflow: pattern recognition → structural diagnosis → minimal targeted fix. Identical to how he approached TIS-100 and Shenzhen I/O.*

**Day 14 — The Meta Awareness**
Chen has reached Elo 1,450. He checks the community forum. Someone has posted: "The Creep-and-Compress attack is dead — defensive configs now evict stale position data. New dominant strategy: fake compress (send a decoy high-priority signal to fill eviction target slots, then hit with real striker)."

Chen reads the post carefully. He's been seeing this for two days already — the adaptation happened in real time on the server. By the time someone posted about it, he'd already developed a partial counter.

He opens his workbench. He adds a "signal provenance check" — a rule that flags signals whose relay path is fewer than 2 hops as potentially direct-injected (i.e., not organically routed through his own network). These get lower priority treatment.

He doesn't know if this works yet. He submits Swarm v9 and waits for the morning digest.

*This is the Screeps endgame for Chen: the pleasure is not in PLAYING the game but in REASONING about the meta and testing his hypotheses. The Gauntlet is a research environment.*

**Day 30 — The Arms Race Plateau**
Chen's config has been Elo 1,540 for 5 days. He has not found a new vulnerability. Opponents who might have defeated him 2 weeks ago are now below his tier and rarely matched to him.

He checks the season timer: 6 days until reset. He is #7 globally.

He sets a goal: top 5 before reset. He analyzes the configs of #1 through #6 from their public replays. He identifies a structural pattern all top configs share: they all use a "mesh relay" topology rather than a single relay. He's been running single relay. He begins the redesign.

*Top players share something: they read the meta AND the specific configs of players ranked above them. The meta tells them what strategies dominate; the config replays tell them HOW. This is Screeps' open-source-bot culture built into the game's architecture.*

**UI Annotations:**
- Meta Report panel: updated weekly. Shows "dominant strategy distribution" as a pie chart (e.g., "36% relay-first attack, 22% hook flood, 18% scout blinding, 24% other"). Chen reads this like a patch notes document.
- Config version history: Chen has 9 versions. Each is tagged with the patch level ("v3 was effective against relay-first but vulnerable to hook flood; v6 added flood resistance at cost of +2 tick command latency"). He writes his own notes in the version tags.
- Replay filter: filter match history by loss pattern, opponent Elo tier, match outcome, config version. Chen has built a deep understanding of which version performed best against which strategy tier.

---

## Strengths

### The Gauntlet Model (Option A)
- **Zero anxiety.** No vacation death. No 24/7 commitment.
- **Real adversarial evolution.** Human creativity generates strategies no test suite can.
- **Social without multiplayer.** The async format lets you engage with competition on your own schedule.
- **Self-teaching community.** Replay packs and config posts emerge organically from an engaged player community.
- **Low infrastructure.** Server-side matches run asynchronously in bursts, not live. Lower server cost than persistent world.

### The Arena League (Option B)
- **Seasonal resets create fresh metas.** Every 4-6 weeks, the hierarchy reshuffles. Veterans and newcomers start at the same Elo.
- **The replay is the core loop.** Post-match debrief is identical to the campaign debrief — familiar UI, familiar learning mechanic.
- **Gladiabots proved this model works.** The match-based async bot tournament is a validated design.

### The Simulation Farm (Option C)
- **No player count dependency.** Works for a game with 500 active players or 500,000.
- **Personalized adversarial generation.** The farm finds YOUR specific weaknesses, not general weaknesses.
- **Can run offline.** No server required.

### The Persistent War (Option D)
- **The ownership feeling.** Nothing else creates "my empire running while I sleep."
- **Infinite depth.** No meta is ever "solved." Arms race continues indefinitely.
- **Open-source culture.** Players who build meta-defining configs become community heroes.

---

## Weaknesses

### The Gauntlet Model (Option A)
- **Playerbase dependency.** Below ~2,000 active Gauntlet participants, matchmaking degenerates.
- **No live spectacle.** All matches happen offline. No watching a real fight.
- **Narrative thinness.** Without story context, the Gauntlet feels like a lobby.

### The Arena League (Option B)
- **Meta stagnation risk.** Dominant configs make seasons boring once discovered.
- **Async disconnect.** The excitement of the match isn't present; only the result.

### The Simulation Farm (Option C)
- **Not truly infinite.** A finite adversarial AI has a finite strategy vocabulary.
- **No social dimension.** No community artifact. No one to brag to.
- **Risk of feeling gameable.** If players figure out the farm's strategy generation heuristics, they can optimize against it rather than for general robustness.

### The Persistent War (Option D)
- **All of Screeps' problems.** Vacation death, subscription pressure, 24/7 commitment.
- **Wrong audience.** Robot Uprising aims broader than Screeps' technical-programmer niche.
- **Infrastructure cost.** Requires persistent 24/7 servers.

---

## Interaction Effects

### With 1.04e (100-Test-Case Robustness)
The 100-case robustness mechanic is the natural on-ramp to the Gauntlet. The campaign teaches "your config must be robust across many scenarios." The Gauntlet teaches "those scenarios are infinite and evolving." They're the same lesson at different scales. The debrief's pass/fail grid for 100 cases becomes the Gauntlet's match history grid for ∞ cases. The visual language should be identical — grid of outcomes, clickable replays, failure pattern annotation.

### With 4.04a (Debrief as Debugger)
The debrief's step-through replay is the primary learning tool in both the campaign and the Gauntlet. Every Gauntlet loss should generate a full step-through debrief identical to a campaign mission loss. "You lost the match" → "here's the exact tick your strategy failed" → "here's why" → "here's the workbench, fix it." The Gauntlet is a debrief generator.

### With 4.12 (Spawn Genealogy Tree)
In the Gauntlet, understanding your opponent's spawn sequence is critical. The debrief's spawn genealogy tree becomes offensive intelligence: "they spawned a jammer at tick 4, which only makes sense if they knew my relay fires at tick 3. How did they know? Their scout was here at tick 2." The tree tells you not just what happened but what your opponent knew and when.

### With 5.20 (Always-On Anxiety vs. Self-Contained Missions)
The Gauntlet (Option A) directly addresses the anxiety problem: async matches that run only when you're ready to check. Option D (Persistent War) is the full anxiety mode. The design should make it possible to participate in the competitive ecosystem WITHOUT choosing the anxiety version — Options A, B, and C all achieve this. Option D is explicitly opt-in for players who want the persistence fantasy.

### With 5.21 (Open-Source Architecture as Community Mechanic)
The Gauntlet creates the same incentives as Screeps' open-source bot culture: top configs are aspirational objects. If top configs are publicly viewable (replays, read-only config browser), the community will reverse-engineer dominant strategies, post analyses, create guides. This should be designed for: "top 10 configs of the week" as a featured community section, not an afterthought.

### With 7.06 (The Histogram as Social Loop)
Opus Magnum's histogram shows where your config ranks across all solutions. The Gauntlet version: a distribution of Elo ratings for all Gauntlet participants, with your position highlighted. Not just "you're #7 globally" — but a full bell curve showing that most players cluster around 900–1100, a long tail of high performers, and you're in the 94th percentile. The histogram makes your position legible not as a rank but as a distribution.

### With 8.07 (Robustness vs. Efficiency as Fundamental Tension)
The Gauntlet stress-tests this tension. A highly efficient config (fast, tight, cycle-optimal) will often be brittle — it relies on a specific sequence working correctly. A robust config (handles all inputs, never assumes timing) will often be slower, losing on efficiency metrics. In campaign missions, this tension is managed (you can use either and complete the campaign). In the Gauntlet, it becomes explicit: brittle-efficient configs climb fast then crater when a novel attack finds the brittleness. Robust-inefficient configs plateau lower but never catastrophically fail. The meta will develop "brittle-efficient for ranked play, robust for placement" strategies.

---

## Comparable Games/Models

### Gladiabots (Closest Analog)
Gladiabots is a visual behavior tree programming game for robots with a competitive online mode. Players program their bots using a node graph, then enter matches where bots fight automatically. The async match system (submit → wait → check results) is exactly Option B. Community reception: Very Positive on Steam, ~100k owners. Key lesson: the match result + debrief loop is highly satisfying even without live watching the fight. Players reported checking their match results with the same excitement as checking text messages.

### Robocode
A Java-based game from 2001 where players write code for robotic tanks, then enter them in tournaments. Pioneered the "code your bot, watch it fight" category. Still has an active community. Key lesson: technical skill transfer (real Java knowledge useful) and community artifact generation (sharing bot code) created an unusually long-lived game for its era. The "you wrote the code that wins" pride was self-sustaining.

### Chess.com / Lichess (Correspondence Chess)
Online correspondence chess proves that async competitive play with meaningful stakes doesn't require simultaneous presence. You make a move, your opponent makes a move tomorrow, you see the result next week. The Gauntlet's "check your digest tomorrow" is this model applied to strategy game configurations. Key lesson: the delay doesn't reduce investment. It increases it — players think about the match during the gap.

### Fantasy Sports
Players draft a "lineup" of athletes, then watch (not control) how that lineup performs over a week's real games. The configuration is done once; the execution happens without you. The feeling of "watching your picks perform" is directly analogous to watching your Gauntlet config win. Fantasy sports are one of the most successful async competitive formats ever designed.

### Poker ICM Analysis Tools
Tournament poker players use ICM (Independent Chip Model) solvers to test their strategies against simulated opponent distributions. The solver tells you: "against this range of opponents, your strategy has X% EV." The Farm (Option C) is this model applied to Robot Uprising: test your config against a distribution of adversarial strategies, get an EV-equivalent robustness metric.

---

## Sensory Description

### The Gauntlet Match Notification (Option A)

It's 8:42 AM. You're making coffee. Your phone buzzes. Steam notification from Robot Uprising: "⚡ GAUNTLET DIGEST: 17/20 wins. Elo +38 → 1,340."

A feeling: mild urgency. Not anxiety. Curiosity.

You open the game. The Gauntlet screen loads in the same amber-and-dark palette as the workbench — it IS a workbench, just with a different config object (your Elo history instead of your agent hooks). Three red dots in the match history grid catch your eye. You tap the first one.

The replay opens: dim battlefield, your agents rendered in your faction's color (deep teal), enemy agents in adversarial red. A scrub bar at the bottom. You press play. The animation: your agents dispatch normally for the first 6 ticks, routine movements, then suddenly — your relay agent freezes. A signal was sent; no ACK received. The hook chain that depended on it fires into silence. Your strikers execute a maneuver that made sense 3 ticks ago, before the enemy formation rotated.

The sound design: your striker's action plays at normal speed, but the absence of the expected hook-cascade sound (the satisfying sequence of click-click-whirr that means your wiring is live) is noticed as a silence. Nothing fired. The striker hits empty air.

A text annotation appears over the replay: "CAUSE: relay signal dropped at tick 6 (buffer at capacity; oldest entry evicted was your own scout's last position, which your striker needed)."

You close the replay. The red dot glows — you've seen this. The Gauntlet screen updates the loss pattern counter: "Pattern A: 3 losses this week."

You tap "Patch" — the workbench opens, pre-navigated to your relay agent's buffer config. Time to fix it.

### The Season Reset Moment (Option B)

The timer hits zero. The season ends.

The screen goes dark for exactly one second.

Then: a new screen. A clean Elo graph, flat at 1,000. A new season ID: "Season 4: The Iron Crucible." Your previous season's cosmetics appear in your profile — a bronze badge, a subtle trail animation on your agents.

The season leaderboard from Season 3 is preserved but no longer active. You can still browse it, see "quietstorm_8" at #1 with 1,642 Elo and their config labeled "Apex v12." That config is now historical artifact. Season 4 is a blank slate.

A notification: "25 players you know have entered Season 4." You recognize two usernames from the community forum. The anticipation is clean.

You open the workbench. This season, you're trying something new.

---

## The TikTok Clip

For the Gauntlet: the clip writes itself, and it requires no explanation.

Screen-record. Open the Gauntlet. The digest has just arrived: 20/20. Pure green. A perfect day.

Zoom in to the match history grid: twenty green dots, arranged in a 4×5 matrix, each one a tiny victory. The Elo counter ticks up: 1,540. Then 1,541. Then the global rank updates: #4. A soft trumpet sound when the number changes.

Cut to: a single replay. Your agents move. A hook cascade fires. The sound of each hook activating — click, whirr, snap — as the chain propagates across your formation. The enemy doesn't have time to react. The battle is over in 8 ticks.

The clip is silent except for the hook sounds.

Text overlay: "i rewired the relay yesterday"

Comments: "how," "i need to understand this," "what game is this"

That last comment. That's the TikTok clip.

---

## New Aspects Discovered

1. **1.04g — The live win-rate as persistent identity metric**: your Gauntlet Elo as a visible identity signal — shown on your profile, on community hub posts, on workshop uploads. The Elo doesn't just track skill; it signals your architectural philosophy. High Elo = well-designed system. The reputation mechanic of a programming community applied to a game config.

2. **2.22 — AI-generated adversary configs as difficulty axis**: instead of designer-scripted enemies, enemy configurations generated by an adversarial AI that learns to defeat the player's specific architecture. The "red team" AI as a game system: what is its vocabulary, how does it escalate, how does it avoid feeling game-able?

3. **7.09 — The arms race as designed meta-evolution**: the Gauntlet's meta is not controlled by designers. It evolves from player innovation. How do you design a game that gracefully supports meta-evolution rather than locking into a dominant strategy? Intervention points (seasonal resets, occasional new skill/hook unlocks) vs. pure player-driven evolution.

4. **7.10 — The "config necropsy" as community artifact**: a community practice (modeled on Screeps' GitHub-published bots) where high-Elo players post detailed retrospectives of their config evolution — "here's v1, here's the attack that broke it, here's v5, here's the patch notes." Designing the sharing infrastructure to make this easy: version history export, annotatable replay sharing, readable config diff views.

5. **5.22 — The Gauntlet as a third act**: structuring the game as three acts — campaign (learn the mechanics), advanced campaign (develop robustness), Gauntlet (prove it against infinite adversarial creativity). The Gauntlet as designed destination, not optional appendage. The campaign's final cutscene explicitly opens the Gauntlet: "You've proven yourself against simulations. Now prove yourself against the world."
