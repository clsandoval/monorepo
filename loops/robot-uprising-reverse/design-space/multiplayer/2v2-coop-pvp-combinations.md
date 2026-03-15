# 2v2 Co-Op PvP Mode Combinations: Team Architecture vs. Team Architecture

**Aspect:** 7.02c — Pairing co-op models with PvP models; Specialist co-op (4 distinct roles in a 2v2) as the deepest competitive format; mixed co-op models as asymmetric advantage.

**Category:** multiplayer/competitive + multiplayer/cooperative
**Wave:** 7 — Multiplayer & Community

---

## The Design Problem

Robot Uprising has five PvP models (Ghost Match, Sealed Duel, Arms Race, Gauntlet, Hybrid) and six co-op models (Archon, Specialist, War Room, Divided Front, Relay, and combinations thereof). The 2v2 question is not "which co-op model works in PvP" — it's "what happens when TWO pairs, each using a co-op model, compete against each other?"

This is a 6×5 matrix with 30 possible pairings, but the real design space is deeper: should both teams use the *same* co-op model (symmetric 2v2), or can teams *choose* their co-op model as a strategic decision (asymmetric 2v2)? The choice of co-op model IS a competitive move — it determines your team's communication structure, which is the game's core mechanic.

The 2v2 format also solves several problems with 1v1 PvP: it creates social infrastructure (pairs become teams, teams become communities), it provides a natural context for co-op learning (your teammate teaches you the Inspector), and it adds a coordination dimension that 1v1 lacks entirely. Two human brains designing one attention system competing against two other human brains designing another attention system — this is the fullest possible expression of the game's "manage smart autonomous systems" fantasy.

The fundamental question: **does the coordination overhead of 2v2 amplify or dilute the core attention-architecture gameplay?**

---

## Symmetric 2v2: Same Co-Op Model for Both Teams

### Configuration 1: "Double Archon" (Archon + Ghost Match / Sealed Duel)

**How it works:** Both teams use Model A (Archon) — shared workbench, full access for both players. Each team produces one architecture collaboratively, then those architectures fight. This is StarCraft II Archon Mode mirrored: two Archon pairs on opposite sides.

**What the Plan screen looks like:** Each team sees their own shared workbench. The screen is identical to single-player Archon co-op — two cursors, color-coded edits (Player 1 cyan, Player 2 amber on each team). The board preview shows the competitive map with both spawn points. No information about the opposing team's configuration is visible. A team chat box sits in the bottom-left corner — text only, no voice requirement (though voice is assumed for serious play). Above the DEPLOY button: "Team: [TeamName] | Partner: [PlayerName] | Status: Editing..."

When one team member hits READY, a half-bar fills on the team status indicator. When both hit READY, the bar completes and the DEPLOY button illuminates. The opposing team's readiness shows as a single dim/bright indicator — "Opponents: Preparing..." vs. "Opponents: Ready."

**Strengths:**
- **Lowest barrier to entry.** If you can play solo, you can play Double Archon. The co-op layer adds nothing mechanically new — it's purely social. Two friends can jump into competitive 2v2 with zero new learning.
- **Natural mentorship ladder.** A strong player carries a weaker friend into PvP. The weaker player learns from watching the stronger player edit in real-time. Archon Mode's strongest legacy in StarCraft II was as a teaching tool, and that transfers directly.
- **Scales the design space.** Two minds produce more creative architectures than one. The conversation between teammates ("what if we use a relay chain here?") generates ideas that neither player would have solo.

**Weaknesses:**
- **Coordination is overhead, not depth.** Two players editing the same workbench don't produce a fundamentally different architecture than one skilled player. The coordination cost (channel name conflicts, cursor collisions, simultaneous rule edits) adds friction without adding strategic depth. The team that communicates cleanly wins not because their architecture is better but because they wasted less time arguing.
- **Free-rider amplified.** In competitive 2v2, one strong player doing 90% of the work while the partner watches is a viable strategy. The weaker player's contribution approaches zero. This undermines the "team" feeling.
- **No unique competitive dimension.** Double Archon is just 1v1 with social overhead. The architecture doesn't get *qualitatively* different with two editors — it gets quantitatively faster to produce.

**Comparable games:**
- **StarCraft II Archon Mode in team leagues** — The StarCraft community experimented with Archon Mode tournaments. They quickly fizzled. The format produced marginally better macro play but no new strategic dimensions. The community concluded that Archon Mode was "1v1 with a friend in the room."
- **Overcooked's competitive mode** — Two teams of two, each managing a shared kitchen. The coordination IS the challenge, not the cooking. But Overcooked works because the coordination is physically spatial (don't block the chopping station). Robot Uprising's coordination is abstract (don't edit the same rule), which is less viscerally fun.

**Verdict: Weak.** Double Archon is easy to implement but doesn't create a unique competitive experience. Skip as a competitive format, keep as a casual "bring a friend" mode.

---

### Configuration 2: "Double Specialist" (Specialist + Arms Race)

**How it works:** Both teams use Model B (Specialist) — one player is the Behaviorist (Skills + Rules), the other is the Networker (Hooks + Context Config). Each team's architecture emerges from the collaboration between their halved-access players. In Arms Race format (Bo3 with adaptation between rounds), the adaptation phase becomes a team diagnostic: the Behaviorist and Networker must AGREE on what went wrong and which half of the architecture to change.

**This is the richest 2v2 configuration and the primary recommendation.**

**What the Plan screen looks like:** Each team member sees the split workbench (Behaviorist on left, Networker on right, luminous seam between). The competitive map is visible in the corner with both spawn points. A "Team Comm" panel sits above the workbench — a narrow strip showing the partner's last 3 edits as compact diff cards: "STRIKER-B: +rule: IF tagged → engage" or "SCOUT-A: +hook: WHEN evade → EMIT 'danger-north'." Each diff card glows briefly, then dims. Hovering a diff card highlights the affected blueprint and its ghost unit on the board.

During the Arms Race adaptation phase (between rounds), both team members see the Inspector simultaneously. But the information they extract is different — the Behaviorist reads enemy unit *behaviors* (what rules produced which actions), while the Networker reads enemy *communication patterns* (which channels carried which signals, where buffers overflowed). They must combine their readings into a coherent counter-strategy, then each modify their respective halves.

**What the adaptation phase looks like:**
The screen splits three ways. Left: Behaviorist's Inspector focus (unit actions, rule triggers, combat outcomes — rendered in cyan-tinted overlays). Right: Networker's Inspector focus (signal arcs, buffer states, channel traffic — rendered in amber-tinted overlays). Center: a shared "Diagnosis Board" — a whiteboard-style panel where either player can drag Inspector elements to pin them as evidence. The Diagnosis Board persists between adaptation and plan phases, serving as the team's shared working memory.

A Behaviorist drags a unit's action trace ("STRIKER-B engaged at tick 14 based on rule 'IF enemy_tagged → engage'") to the Diagnosis Board. The Networker drags a signal graph ("Channel 'threat' peaked at tick 12, then went silent — relay destroyed at tick 13"). Both evidence cards sit side by side. The team sees the causal chain: relay died → channel died → striker acted on stale data → wrong engagement. The fix crosses the player boundary: the Networker needs to add a backup relay, AND the Behaviorist needs to add a fallback rule for when 'threat' channel goes silent.

**Strengths:**
- **Four distinct roles create maximum depth.** In a 2v2 Specialist match, there are four players with four different capabilities: Team A's Behaviorist, Team A's Networker, Team B's Behaviorist, Team B's Networker. Each sees the game through a different lens. Each contributes something irreplaceable. This is the deepest possible expression of the game's "manage smart autonomous systems" fantasy — you're managing a management system collaboratively.
- **Arms Race adaptation becomes team diagnosis.** The conversation during adaptation ("I saw their relay chain compress before forwarding — can you add a hack hook to intercept the compressed signal?" "Only if you give the specialist a rule to act on the intercepted data") IS the game at its highest level. The competitive skill is not configuration speed or architecture knowledge — it's the ability to communicate complex systems behavior across a role boundary under time pressure.
- **Natural team compositions.** Some players are "builders" (love designing behaviors, equipping skills, crafting rules). Some are "wires" (love designing communication networks, tuning buffers, managing information flow). The Specialist 2v2 lets each player be what they naturally are. Finding your co-op partner is like finding your doubles partner in tennis — complementary strengths, shared language, developed over time.
- **Prevents the metagame stagnation problem.** In 1v1, the metagame is "which architecture beats which." In 2v2 Specialist, the metagame is "which TEAM COMPOSITION beats which" — a pair with strong Behaviorist skills and moderate Networker skills produces a different architecture profile than a pair with the inverse. The human element becomes a competitive variable.
- **Cross-boundary failure is the most interesting failure.** When Team A loses because the Behaviorist's rules expected signals the Networker didn't wire, the post-match conversation is incredibly rich: "I wrote a fallback rule for when 'threat' goes silent, but you didn't configure the relay to emit on 'threat' at all — you used 'enemy-north.'" This is EXACTLY how real engineering teams debug production failures. The game teaches team debugging as a social skill.

**Weaknesses:**
- **The handoff problem squared.** In co-op Specialist, one pair has the handoff problem (rules expect signals that hooks don't provide). In competitive Specialist 2v2, both teams have it, and the team that solves it faster wins. If the handoff problem is too punishing, the format becomes "which team miscommunicates less" rather than "which team builds better." The game must provide enough scaffolding (diff cards, shared channel map, type-ahead channel suggestions) that the handoff is challenging but not paralyzing.
- **Session length.** A Bo3 Arms Race already takes 16-20 minutes in 1v1. In 2v2, the adaptation phase is longer (two people must agree on changes, then each modify their half). Estimate: 25-35 minutes for a Bo3. This is a significant commitment for four people's schedules.
- **Finding four players at the same time.** The matchmaking population problem is exponentially worse for 2v2. You need four players of similar skill, with two willing to play Behaviorist and two willing to play Networker, all online simultaneously. Solutions: flexible role assignment (queue as "either role, preference for Behaviorist"), pre-formed teams with async scheduling, the Ghost Match asynchronous model for 2v2.
- **Blame assignment is painful.** When a 2v2 match is lost, the internal team dynamics can be toxic. "Your hooks were wrong" / "Your rules didn't account for signal latency." The game must carefully avoid surfacing blame-enabling metrics in team debrief. Show team architecture health, not individual player error counts.

**The TikTok clip:** Four-way split screen. Two players on Team A sit in a Discord call: "Their relay compresses before forwarding. If I add a hack hook to intercept—" "—I'll add a rule that uses the intercepted signal to retarget our strikers." Cut to Round 3: Team A's specialist intercepts the compressed signal, three strikers redirect mid-formation, pincer attack on Team B's relay. Team A erupts. Text: "She read their network. I rewired ours. Round 3 was a 30-second phone call."

**Comparable games:**
- **Valorant / CS2 competitive doubles** — Fixed roles (entry fragger, support, IGL) create team compositions. The "team meta" is layered on top of the "gun meta." Teams that communicate well beat teams with better individual aim. Robot Uprising's 2v2 Specialist creates the same dynamic: team communication > individual skill.
- **Magic: The Gathering Two-Headed Giant** — Two players share a life total and turns but each build separate decks. The deckbuilding meta shifts dramatically: aggressive strategies are weaker because you face two decks of answers, combo strategies are stronger because your partner can protect you. Similarly, Robot Uprising's 2v2 Specialist changes the architecture meta — relay chains are stronger (your partner can protect the relay while you build the chain) and solo-operative builds are weaker (you can't do everything yourself).
- **Deep Rock Galactic class system** — Four classes (Scout, Engineer, Driller, Gunner) with distinct capabilities that combine. The game is explicitly designed so that no class can solve every problem alone. Robot Uprising's Specialist 2v2 creates the same mandatory interdependence.
- **Bridge (card game)** — The deepest team card game. Partners communicate through bids (limited information channel) about what cards they hold. The bidding convention IS the metagame — pairs develop private signal languages. Robot Uprising's 2v2 Specialist creates a similar dynamic: teams develop private channel naming conventions, private diagnostic vocabularies, private adaptation protocols. The "team language" is a competitive advantage.

---

### Configuration 3: "Double War Room" (War Room + Sealed Duel)

**How it works:** Both teams use Model C (War Room) — one player is the Architect (configures), the other is the Analyst (diagnoses). In Sealed Duel format, both teams design simultaneously under a timer, then watch the battle. After the battle, each team's Analyst enters the Inspector while their Architect cannot. The Analyst must diagnose AND communicate competitive intelligence ("their relay was at position D4 with a 12-slot buffer listening on channel 'sweep'") to their Architect for the next round.

**What the adaptation screen looks like:** The Analyst's Inspector shows the full battle — both teams' units, all signals, all buffer states. The Analyst can inspect ENEMY units as well as friendly ones. A "Share" button on every Inspector element creates a diagnostic card that goes to the Architect's suggestion tray. The Architect sees only the board replay with basic playback, plus the growing stack of diagnostic cards from their Analyst.

The Analyst faces a triage problem: they have limited time (2 minutes for adaptation) and must decide whether to diagnose their OWN architecture's failures or reverse-engineer the OPPONENT's architecture. The best Analysts do both. A skilled Analyst might pin: "Our RELAY-B buffer overflowed at tick 18 — too much terrain noise" (defensive diagnosis) AND "Their striker responded to compressed signals on channel 'engage-east' with a 2-tick delay — if we hack that channel, the delay becomes 4 ticks" (offensive intelligence).

**Strengths:**
- **The Analyst becomes a competitive role.** In solo or co-op War Room, the Analyst is a support role. In competitive 2v2 War Room, the Analyst is a *spy*. They're reverse-engineering enemy architecture in real-time, extracting intelligence, and delivering it under time pressure. This is the most viscerally exciting role in 2v2 Robot Uprising — the intelligence analyst in a cyberpunk heist film.
- **Asymmetric information creates drama.** Each team's Analyst sees things the opposing Architect can't. The information advantage flows from Analyst to Architect through a lossy channel (diagnostic cards + voice). The team whose Analyst communicates more effectively has a structural advantage. Communication quality IS competitive quality.
- **Streaming heaven.** Four-camera tournament setup: two Analyst screens (full Inspector with spy-vs-spy reverse engineering) and two Architect screens (suggestion trays filling up with intelligence). The spectator can see all four perspectives simultaneously. Casters can narrate the intelligence war in real-time: "Team A's Analyst just found the buffer vulnerability. Is the Architect going to exploit it?"

**Weaknesses:**
- **Double the complexity for the Analyst.** The Analyst must understand their OWN architecture well enough to diagnose failures AND understand the OPPONENT's architecture well enough to extract intelligence. This requires mastery of every unit type, every signal type, every buffer behavior. The skill floor for competitive 2v2 War Room Analyst is extremely high.
- **The Architect feels passive.** During the Inspector phase, the Architect waits for intelligence from their Analyst. They can study the board replay, but without analytical tools, they're largely dependent. In competitive play, "waiting for your partner" is a momentum killer.
- **Information overload in diagnostic cards.** An Analyst under time pressure will dump every observation into the suggestion tray. 15 diagnostic cards in 2 minutes, half of them context-free screenshots of buffer states, overwhelms the Architect. The format needs a card limit (max 5 cards per adaptation phase) to force Analyst triage.

**Comparable games:**
- **Among Us** — The "detective" role in social deduction. The most engaged player gathers evidence, constructs a narrative, and communicates it to the group under time pressure. Robot Uprising's competitive Analyst is this role made permanent and instrumental.

---

### Configuration 4: "Double Divided Front" (Divided Front + Gauntlet)

**How it works:** Both teams use Model D (Divided Front) — the 8x8 board is now split into FOUR quadrants. Team A controls the NW and SW quadrants (columns A-D). Team B controls the NE and SE quadrants (columns E-H). Within each team, Player 1 takes the northern half and Player 2 takes the southern half. Each player controls 2 columns × 4 rows = 16 cells. Four separate architectures, connected by cross-boundary channels.

**The board layout (16x8 or expanded):**
The standard 8x8 is too small for four-quadrant play. The board expands to 12x12 for 2v2 Divided Front. Each quadrant is 6×6 (36 cells). Quadrant boundaries are rendered as faint dashed lines — the intra-team boundary (between NW and SW, or NE and SE) is a thin cyan/amber line. The inter-team boundary (between columns F and G) is a thicker white dashed line with periodic pulse animations — the "front line."

**Strengths:**
- **Four separate architectures interacting.** The emergent complexity of four independently designed attention systems communicating across three boundaries (intra-team N/S, inter-team, and diagonal cross-team) is enormous. No player designed the global behavior. It emerges from four local decisions.
- **The front line becomes real.** The inter-team boundary is a literal front line where both teams' units interact. Cross-boundary signals from teammates, combat with opponents, and EM emissions all happen at the front. The spatial metaphor — "hold the line" — maps directly to attention architecture: units at the front need different rules than units in the rear.

**Weaknesses:**
- **Board expansion may strain the visual language.** A 12x12 grid is 144 cells — much harder to read than 64. The Into the Breach visual clarity (the locked design inspiration) is built on small boards where every unit matters. 12x12 may feel more like Advance Wars than Into the Breach.
- **Quadrant isolation.** If enemies approach from one quadrant, three players have nothing to do. The game must ensure all four quadrants face simultaneous pressure.

---

## Asymmetric 2v2: Teams Choose Different Co-Op Models

This is the most radical and interesting design option. Both teams pick their co-op model as a strategic decision BEFORE seeing the map. The choice of co-op model is itself a competitive move.

### "The Draft" — Co-Op Model Selection as Strategy

**How it works:**
1. Two teams are matched. Neither knows the other's composition.
2. Map is revealed to both teams simultaneously.
3. Each team privately selects their co-op model from a menu: Archon, Specialist, War Room, Divided Front, or Relay.
4. Selections are locked. Neither team knows what the other picked.
5. Both teams enter their respective Plan screens (which look different based on their chosen co-op model).
6. Battle plays out. Inspector reveals which co-op model the opponent used.

**What the selection screen looks like:**
A dramatic reveal screen. The map sits in the center — terrain features, spawn points, special locations all visible. Around the map, five large cards fan out in an arc, each representing a co-op model:

- **Archon** card: two overlapping cursor icons, cyan+amber blended into teal. Tagline: "SHARED CONTROL. Full access, full chaos."
- **Specialist** card: a split icon — wrench (Skills/Rules) on one side, antenna (Hooks/Context) on the other, separated by the luminous seam. Tagline: "DIVIDED CRAFT. You build behavior. They build communication."
- **War Room** card: a magnifying glass over a blueprint, with a speech bubble overlaying diagnostic data. Tagline: "ASYMMETRIC KNOWLEDGE. One builds. One sees."
- **Divided Front** card: a board split into quadrants with color-coded zones. Tagline: "SEPARATE TERRITORIES. Connected by channels."
- **Relay** card: one bright eye and one fogged silhouette. Tagline: "FOG AND CLARITY. One designs blind. One sees everything."

Both team members must agree on the selection (both click the same card). A 30-second timer. If no agreement, Archon is the default. The selection card flips over with a satisfying thwack sound, revealing the team's chosen model on their screen only.

**Why asymmetric co-op model choice is the deepest competitive layer:**

The choice of co-op model determines your team's *communication topology*. Archon teams are fast but undifferentiated. Specialist teams are slow but produce architectures with cleaner separation of concerns. War Room teams iterate faster through diagnostic cycles but are bottlenecked on the Analyst. Each co-op model produces architecturally different attention systems — not because the primitives are different, but because the DESIGN PROCESS is different.

A Specialist team's architecture will have cleaner hook wiring (because one player focused entirely on hooks) but may have behavior-hook mismatches (because the two halves were designed by different minds). An Archon team's architecture will be more internally consistent but less optimized in any single dimension.

The meta-game becomes: which co-op model is strongest on this map? On maps with wide-open terrain and high-mobility enemies, Archon may be fastest (one player handles all scout rules while the other optimizes relay positions). On maps with narrow chokepoints and signal-dense environments, Specialist may produce better-tuned communication (the Networker can optimize buffer eviction for the specific chokepoint without the Behaviorist's rules conflicting).

**Counter-picking possibilities:**
- War Room counters Archon on adaptation-heavy formats (Arms Race) because the Analyst extracts more intelligence per round.
- Specialist counters War Room on complex maps because the Specialist pair's separated architecture is harder to reverse-engineer (the Networker's half isn't predictable from the Behaviorist's half).
- Divided Front counters Specialist on large boards because spatial ownership prevents the opponent's hack units from intercepting a concentrated channel architecture.

**The meta-meta-game:** teams develop reputations for certain co-op models. "That pair always runs Specialist — they'll have clean hooks but the Behaviorist overcommits to aggression." Scouting opponent teams' historical co-op model choices becomes part of preparation.

---

## The Four-Role 2v2: The Deepest Format

The most competitively promising 2v2 format is **Specialist co-op + Arms Race PvP**. This creates four distinct roles across two teams:

| | Team A | Team B |
|---|--------|--------|
| **Behaviorist** (Skills + Rules) | Player A1 | Player B1 |
| **Networker** (Hooks + Context) | Player A2 | Player B2 |

Each player has a unique competitive identity:
- **A1 (Behaviorist)** reads B's unit behaviors to infer their rules, then counter-designs.
- **A2 (Networker)** reads B's signal patterns to infer their hook topology, then counter-wires.
- Both must coordinate: A1's counter-rules must match A2's counter-hooks.

**The Arms Race adaptation conversation (between rounds):**

> A1: "Their scout evaded when it saw our striker — they have a high-priority evade rule. But it didn't emit when evading. No flee-signal."
> A2: "That means their scout has no hook on evade. If I add a hook to OUR scout that emits on 'enemy-evaded', our striker can chase the fleeing scout."
> A1: "I'll add a pursuit rule: IF signal 'enemy-evaded' AND no closer threat → engage. Give me the channel name."
> A2: "'chase-alert.' I'll wire it now."

This conversation IS the competitive experience. The team that can translate observations into cross-role changes faster wins the adaptation phase. The 2-minute timer creates pressure. The split-role creates interdependence. The opponent's architecture creates the puzzle.

---

## Player Journeys

### Journey: Kai, 22, Competitive Gamer (Valorant Diamond, First Strategy Game)

**Context:** Kai and his duo partner Mika have been playing Robot Uprising's campaign in co-op Specialist mode for three weeks. Kai is the Behaviorist (he likes designing aggressive scout and striker rules). Mika is the Networker (she's obsessed with relay chain optimization). They've completed Mission 8 and are entering the Gauntlet for the first time as a 2v2 team.

**Minute 0:00 — The Queue**
Kai hits "Find Match" on the Gauntlet screen. The matchmaking indicator — a pair of rotating gears, one cyan (his Behaviorist icon) and one amber (Mika's Networker icon) — spins while searching. A status ribbon reads: "Searching for opponents... Team Rating: 1,420 (Provisional)." After 45 seconds, a chime: "Match found. Team vs. Team. Best of 3." The screen transitions to the map reveal.

**Minute 0:45 — Map Reveal and Co-Op Model Selection**
The map loads: a Cebu-inspired urban grid with tight alleyways (one-tile corridors), elevated highway tiles (vision bonuses), and a central plaza (open 3×3 area). Kai and Mika are in a Discord call.

"This map is tight," Kai says. "Lots of corners. Scouts are going to bump into enemies at point-blank range."

"Stay Specialist?" Mika asks. The five co-op model cards fan around the map. Mika hovers Divided Front — on this map, the board would split into two 4×8 halves, each with narrow corridors.

"No, Specialist is our thing. I'll make the scouts aggressive and you wire them tight."

Both click the Specialist card. It flips over with a satisfying snap. The luminous seam appears, splitting their workbench. Mika's side — Hooks and Context Config — glows amber. Kai's side — Skills and Rules — glows cyan. A small "VS" icon with two question-mark silhouettes represents the unknown opposing team.

**Minute 1:30 — Round 1 Plan Phase (3:00 timer)**
Kai opens SCOUT-A's blueprint. Skills panel: he toggles `patrol: ON` and `evade: ON`. Rules panel: he drags three rules into priority order:
1. `IF enemy_adjacent → evade` (survival first)
2. `IF enemy_detected → tag` (mark for strikers)
3. `IF no_threat → patrol` (default behavior)

On Mika's side, she sees Kai's rules appear as read-only cards with cyan borders. She configures SCOUT-A's hooks:
- `WHEN tag_applied → EMIT on 'target-spotted'` (hook slot 1)
- `WHEN evade_triggered → EMIT on 'danger-zone'` (hook slot 2)

She sets SCOUT-A's context config: buffer size 6, priority `[enemy, signal, terrain]`, eviction `oldest-first`.

The diff card strip above shows both their changes interleaved: cyan cards for Kai's rules, amber cards for Mika's hooks. The channel map panel auto-populates: 'target-spotted' (SCOUT-A → STRIKER-B, STRIKER-C), 'danger-zone' (SCOUT-A → RELAY-A).

Timer: 1:30 remaining. Mika configures RELAY-A with `compress` and `filter` skills (read-only to Kai), wires it to channel 'tactical-update' for the strikers. Kai adds rules to STRIKER-B: `IF signal 'target-spotted' → engage tagged`, `IF signal 'danger-zone' via RELAY-A → reposition toward danger`.

"Ready?" Kai hovers the READY button. The half-bar fills cyan. Mika hits READY. Amber fills. Full bar. DEPLOY illuminates.

**Minute 4:30 — Round 1 Sealed Watch**
The board renders: isometric urban grid, neon signs flickering on the elevated highway, tight corridors below. Units snap to starting positions. Tick clock begins: pip 1 lights.

Tick 3: SCOUT-A enters the central plaza. A red enemy icon appears two tiles north — enemy scout. Both scouts detect each other simultaneously. Cell flash: red AND green overlap in a flicker.

Tick 4: Kai's SCOUT-A tags the enemy scout (cyan diamond marker appears on the red unit). Simultaneously, Kai sees the signal arc — a thin green line from SCOUT-A through RELAY-A to STRIKER-B — but the line takes 2 ticks (signal latency). Meanwhile, the enemy striker appears from the northwest corridor. No warning — Kai's scout didn't see it because it came from outside perception range.

Tick 6: Enemy striker reaches SCOUT-A. Adjacent. One-shot, one-kill. SCOUT-A's tile flashes red. Destroyed. Kai's gut drops. The signal that SCOUT-A sent at tick 4 JUST arrived at STRIKER-B — but the scout is already dead. STRIKER-B begins moving toward the tagged enemy scout's last known position. But the tagged enemy has already moved.

Tick 12: Kai's architecture collapses. Without the scout feeding intelligence, the strikers patrol blindly. Enemy relay chain coordinates a pincer. Both strikers eliminated by tick 16. The match ends with Team B's factory intact.

"That was bad," Kai says.

**Minute 5:30 — Round 1 Inspector (Adaptation Phase, 2:00 timer)**
The Inspector loads. Both Kai and Mika see the timeline scrubber. Mika clicks SCOUT-A at tick 3 — the buffer state panel opens on her side: all 6 slots occupied by tick 3 (two terrain observations from corridor tiles, one enemy detection, one tag confirmation, one evade assessment, one patrol-path update). The buffer was FULL before the critical moment.

"The scout's buffer was full of terrain junk," Mika says. "It had two corridor observations that it didn't need. If I had filtered terrain observations with lower priority, the enemy detection would have been processed faster."

Kai scrubs to tick 4 on his Inspector view (limited — he sees unit actions and rules but not buffer states in full detail). He sees: "SCOUT-A: rule 'IF enemy_detected → tag' fired. But rule 'IF enemy_adjacent → evade' did NOT fire at tick 5 — why?"

"Because evade was still processing the tag action from tick 4," Mika reads from the decision trace. "The scout was in 'tag' animation at tick 5 when the striker arrived. It never got to evaluate evade."

"I need to reorder the rules," Kai says. "Evade ABOVE tag. Survival before intel."

Mika: "And I'll filter terrain from the scout's buffer. Enemy and signal only. Terrain is noise in corridors."

Timer: 0:45. Both make their changes. Kai drags `IF enemy_adjacent → evade` to position 1. Mika changes context config: `listen: [enemy, signal]`, `ignore: [terrain]`.

**Minute 8:00 — Round 2 Sealed Watch**
Tick 3: SCOUT-A enters the plaza again. Enemy scout detected. But this time, SCOUT-A's buffer is only 3/6 full (no terrain noise). The enemy detection gets priority processing.

Tick 4: SCOUT-A evades FIRST (rule 1), moving one tile south, out of the striker's expected approach path. Then — because evade triggered Mika's hook — 'danger-zone' emits. RELAY-A receives and compresses.

Tick 6: STRIKER-B gets the compressed signal. It now knows: enemy detected at the plaza, scout evaded south. STRIKER-B approaches from the east corridor — the opposite direction from the scout's retreat. The enemy striker, pursuing the scout south, walks into STRIKER-B's perception range.

Tick 7: Adjacent. One-shot, one-kill. Enemy striker eliminated. The signal arc from scout → relay → striker glows green across the board. Kai punches the desk.

The match continues. Team A's adapted architecture wins at tick 24. Round 2 to Kai and Mika.

**Minute 10:30 — Round 3 Plan Phase**
Both teams adapt. Kai and Mika know the opponents will change their approach. "They'll protect their striker better this time," Kai predicts. "Maybe with a relay screen."

Mika: "If they add relays, I'll be able to see their signal patterns in the next Inspector. I'll know their whole architecture."

Kai: "For now, I'll add a specialist with hack. If they use relays, the specialist can intercept."

The Round 3 prep is faster — both know their architecture's strengths now. They're not building from scratch; they're tuning.

**Minute 13:00 — Round 3 Resolution**
Team A wins at tick 31. Kai's specialist intercepted a compressed signal from the opponent's relay, revealing the enemy striker's target. Mika had wired the specialist's hack output to a new channel 'intercepted-intel' that fed directly to their own strikers. The opposing team's relay chain — their greatest strength — became their vulnerability.

"That's our first Gauntlet win," Mika says. Kai's screen shows: "VICTORY — Team Rating: 1,420 → 1,468."

**UI Annotations:**
- **Diff card strip:** 120px tall horizontal strip above the workbench. Shows last 5 edits from partner as compact cards (blueprint icon + change type + timestamp). Cards animate in from the right, slide left as new ones arrive. Cyan border = Behaviorist edit. Amber border = Networker edit. Tap to expand for full change detail.
- **Ready system:** Two-part progress bar in the DEPLOY button area. Left half fills cyan when Behaviorist ready. Right half fills amber when Networker ready. Both halves complete = DEPLOY illuminates with a white pulse.
- **Adaptation timer:** 120-second countdown in the top bar, rendered as a draining horizontal progress bar. Changes from white to amber at 30s, amber to red at 10s. A gentle tick-tick-tick audio at 10s.

---

### Journey: Dr. Amara, 38, AI Researcher and Casual Gamer

**Context:** Amara studies multi-agent systems at a university. She convinced her grad student Leo to try Robot Uprising as "professional development." They've played 5 co-op campaign missions. Amara is the Networker (she maps it directly to her research on communication protocols in multi-agent systems). Leo is the Behaviorist (he's more comfortable with individual agent logic). They're trying their first 2v2 match in the Weekly Gauntlet — an async format where they submit one architecture per week.

**Day 1 (Monday) — Map Study**
The weekly Gauntlet map drops at midnight UTC. Amara opens it on her phone during her morning commute. It's a Palawan jungle map — dense vegetation tiles that (per the locked terrain rules) reduce perception range. "This map punishes wide-perception scouts," she texts Leo. "We need tight relay chains, not broad sweeps."

At the lab that afternoon, they sit side-by-side at workstations. The Gauntlet Plan screen shows: "GAUNTLET WEEK 12 — Palawan Jungle. Submission deadline: Sunday 23:59 UTC. Current team rating: 1,612." The 12x12 board (expanded for Gauntlet) shows dense jungle tiles with a few clearings.

"This is literally a packet routing problem," Amara says. "The jungle tiles are high-latency links. The clearings are low-latency hubs. I need to place relays at clearings and route signals through them."

She opens her amber-bordered Hooks and Context Config panels. For RELAY-A, she configures: buffer size 12 (maximum), listen on channels ['scout-report', 'danger-alert', 'resource-ping'], compress skill active, filter set to drop terrain observations older than 3 ticks. She positions the relay ghost at a clearing intersection — columns D-E, row 6 — where three jungle corridors converge. The relay's perception radius (0 — it's stationary) doesn't matter; it's a signal hub, not a sensor.

Leo, on the cyan side, configures SCOUT-A with aggressive patrol rules and tight evasion. He adds a rule Amara hasn't seen before: `IF buffer_full → drop oldest non-enemy entry`. "Wait," Amara says, "that's a context config, not a rule."

"No — I'm writing it as a behavioral rule. When the scout DETECTS its own buffer is full, it changes behavior to prioritize enemy information." This is a meta-rule — a rule about the scout's own information state. It crosses the Behaviorist/Networker boundary in a way neither of them expected.

They discuss for 20 minutes whether this should be a rule (Kai's domain) or a context config eviction policy (Amara's domain). They decide: the rule detects the condition, the context config executes the eviction. The rule says "when full, evict." The config says "evict oldest non-enemy." Amara adds the eviction policy; Leo adds the detection rule. The luminous seam between their panels ripples as both edits land simultaneously.

**Day 3 (Wednesday) — Iteration**
They've submitted three test architectures against the practice bot (not the Gauntlet — just testing). The third version works: scouts feed relays at clearings, relays compress and forward to strikers positioned at jungle corridor exits. The production queue reads: SCOUT-A, RELAY-A, SCOUT-B, STRIKER-A, RELAY-B, STRIKER-B. Six units, deployed over 18 ticks.

Amara reviews the channel map: 5 active channels, 12 hook connections, 3 relay nodes. She draws it on paper — it looks like a network topology diagram. "This is a star network with two hub relays," she says. "If either relay dies, half the architecture goes deaf."

Leo: "I'll add a fallback rule — if no signal for 5 ticks, scouts switch to direct striker channels. Bypass the relay."

Amara: "That needs new hooks. I'll wire fallback channels: 'direct-scout-to-striker-A' and 'direct-scout-to-striker-B.' Higher latency, no compression, but survivable."

They submit Version 4 — the one with relay redundancy — on Thursday evening. Three days before deadline.

**Day 6 (Saturday) — Pre-Deadline Anxiety**
"Should we change anything?" Leo asks. They've watched other teams' public replays from previous weeks. One team runs a hack-heavy specialist approach — intercepting relay signals. If the opponents hack their hub relays...

"Add a specialist with counter-hack," Amara suggests. "It monitors our own channels for foreign listeners."

Leo: "That costs 7 metal. We'd have to cut STRIKER-B."

They agonize. The production queue on screen shows the trade-off visually — dragging the SPECIALIST icon in requires dragging STRIKER-B out. The conveyor belt grows and shrinks. They decide: keep the specialist out. Their relay redundancy should survive a hack because even if the main relay channel is intercepted, the fallback direct channels are harder to find.

Final submission: Sunday afternoon. The status ribbon updates: "Architecture locked. Matches begin Monday 00:00 UTC."

**Day 8 (Monday) — Results**
Amara opens the Gauntlet dashboard on Monday morning. 8 replays available (round-robin against 8 other teams). She and Leo watch the first replay together over video call — the Sealed Watch shows their architecture performing beautifully against a scout-heavy opponent. Relays compress and forward, strikers converge. Victory at tick 28.

The third replay is a loss. An opponent team ran two specialists with hack — they intercepted RELAY-A's compressed signal on channel 'tactical-update' at tick 12. Once intercepted, the opponent's strikers knew exactly where Amara and Leo's strikers were heading. Counter-ambush at tick 19.

"We need counter-hack next week," Leo says.

"Or encrypted channels," Amara muses. "If the game supported signal encryption..."

She makes a note for her research: "Emergent need for authenticated channels in adversarial multi-agent systems — game play reveals the same design pressures as real distributed systems security."

Final standing: 6-2, promotion to the next bracket.

**UI Annotations:**
- **Gauntlet dashboard:** Tall vertical panel. Weekly map as a 200×200px preview tile. Submission status below (green "LOCKED" badge with lock icon). Bracket below: 9 team names in a column, each row showing W-L record and a tiny sparkline of match durations. Team's own row highlighted in cyan/amber gradient. Timer: "Next submission window: 5d 14h."
- **Replay library:** Horizontal scroll of replay thumbnails. Won matches have a green border pulse. Lost matches have a red border. Unwatched matches have a glowing notification dot. Clicking opens the standard Sealed Watch → Inspector flow.

---

### Journey: Sofia, 15, and Her Older Brother Mateo, 19 — First 2v2 Match

**Context:** Sofia discovered Robot Uprising through a TikTok clip of a relay chain cascade. She's completed Missions 1-5 of the campaign solo. Her brother Mateo plays competitive Valorant and thinks strategy games are "slow." Sofia convinced him to try one 2v2 match. They've never played co-op before.

**Minute 0:00 — Co-Op Model Selection**
They're matched against another team. The map loads: a Batanes highlands terrain — elevated tiles with strong winds (reduced movement speed on exposed tiles, normal in sheltered valleys). The five co-op model cards fan out.

"Which one?" Mateo asks, leaning over Sofia's monitor.

"Archon is easy — we both control everything," Sofia reads the tagline. "Specialist means I do one part and you do another."

"I'm not learning two new things at once," Mateo says. "Let's do Archon."

Both click the Archon card. It flips. The workbench appears — shared, both cursors visible. Sofia's cursor is cyan. Mateo's is amber. Both see the full blueprint list.

**Minute 0:30 — Plan Phase**
Sofia immediately opens SCOUT-A and starts toggling skills. Mateo stares at the workbench for 10 seconds, then asks: "What do I do?"

"Pick a different unit," Sofia says. "Configure its rules."

Mateo opens STRIKER-A. He sees the Skills panel: `engage`, `breach`. The Rules panel is empty. He stares at the condition dropdown: `IF enemy_adjacent`, `IF enemy_detected`, `IF signal_received`, `IF buffer_full`...

"This is like programming," he says, surprised.

"It IS programming," Sofia grins. She's already configured SCOUT-A with two rules and a hook. A diff card appears on Mateo's screen: "Sofia: SCOUT-A: +rule: IF enemy_detected → tag" in cyan.

Mateo drags a rule into STRIKER-A: `IF enemy_adjacent → engage`. Simple. Lethal. He adds a second: `IF signal_received channel 'target-spotted' → move toward source`. He types the channel name — 'target-spotted' — and it autocompletes in cyan, because Sofia already created it on SCOUT-A's hook. The green autocomplete glow makes Mateo pause. "Wait, you already made this channel?"

"Yeah! My scout will emit on 'target-spotted' when it tags an enemy. Your striker will hear it."

"That's... actually cool." Mateo's expression changes. He's engaged.

**Minute 3:00 — Sealed Watch**
The highland board renders. Wind particles drift across exposed tiles. Their units spawn. Tick 1.

Tick 4: SCOUT-A crests a ridge and spots an enemy relay in the valley below. Tags it. Signal arc: green line from scout through their RELAY-A (which Sofia hastily configured at the last minute — buffer too small, no compression) to STRIKER-A. The signal takes 3 ticks through the relay.

Tick 7: STRIKER-A receives 'target-spotted.' Begins moving toward the valley. But the exposed ridge tiles slow movement — wind penalty. STRIKER-A takes 2 ticks to cross the ridge instead of 1.

Tick 9: STRIKER-A enters the valley. The enemy relay is still there — stationary, undefended. Adjacent tile. Engage. One-shot. Kill flash. The relay sparks and collapses. Both siblings cheer.

But the celebration is short. At tick 10, two enemy strikers emerge from behind a hill — they were shielded from the scout's perception by the terrain. No warning. No signal. The scout's hook didn't fire because it didn't detect them. Both enemy strikers converge on STRIKER-A.

Tick 11: STRIKER-A eliminated. Mateo's hands drop from the keyboard.

The remaining match is ugly. Their RELAY-A's buffer overflows at tick 15 (Sofia configured only 6 slots when the highlands' wind-noise fills buffers faster than expected). Both scouts lose signal connectivity. Strikers patrol aimlessly. Loss at tick 32.

**Minute 5:00 — Inspector**
In Archon mode, both have full Inspector access. Sofia immediately clicks RELAY-A at tick 15. The buffer state: all 6 slots full — 4 wind-noise terrain observations, 1 enemy detection, 1 scout report. The wind-noise filled the buffer before the critical signals arrived.

"The relay was full of wind," Sofia says.

"Wind? Like... the terrain made noise in the buffer?" Mateo leans in.

"Yeah, every tile generates observations. Wind tiles generate MORE. We needed to filter out terrain noise."

"Can we do that?"

"Context config — priority and eviction. If I set terrain to lowest priority and enable 'evict lowest priority first,' the wind observations get dropped when real signals arrive."

"This is actually a queue management problem," Mateo says. He plays competitive games — he understands resource management. "The buffer is like a magazine. You want bullets, not blanks. Filter the blanks."

Sofia stares at him. "That's... exactly what it is."

**Minute 7:00 — Round 2 (Arms Race, if applicable) or Rematch Queue**
They immediately queue again. This time, Sofia adjusts RELAY-A: buffer size 12 (she forgot relays have 12 slots, not 6), listen only on `[signal, enemy]`, ignore `[terrain]`. Mateo adds a second striker and connects it to the same 'target-spotted' channel.

Their second match is closer. They lose again — the opponents have a command agent that reroutes units, which they haven't learned to counter yet — but the relay doesn't overflow. Progress.

"One more?" Mateo asks.

It's midnight. They play until 2 AM.

**UI Annotations:**
- **Archon cursor visibility:** Each player's cursor is a small colored arrow (cyan/amber) with a 12px circular glow. When both cursors are within 100px of each other, a gentle "proximity pulse" rings both cursors — visual feedback that you're about to collide.
- **Channel autocomplete:** When a player types a channel name in a hook config, the dropdown shows existing channels with the creator's color border. Channels created by the partner pulse briefly on first appearance. New channel names show a "+NEW" badge.
- **Wind noise in buffer visualization:** Wind-noise entries in the buffer state panel render as wispy, translucent grey lines — visually distinct from solid, bright-colored enemy/signal entries. The visual weight communicates priority: noise is light, data is heavy.

---

### Journey: Tournament Caster POV — Grand Finals of the First Robot Uprising 2v2 Championship

**Context:** The first official 2v2 tournament. 64 teams. Double elimination bracket. Grand Finals: Team Relay Chain (known for deep relay architectures, Specialist co-op model) vs. Team Ghost Protocol (known for hack-heavy specialist rushes, War Room co-op model). The match is streamed to 12,000 viewers. Two casters: Mira (game analyst) and Jax (play-by-play).

**Minute 0:00 — The Draft**
The tournament uses the asymmetric co-op model draft. Both teams' co-op model selections are hidden during selection but revealed to spectators immediately.

Mira: "Team Relay Chain is locking Specialist — no surprise, that's their bread and butter. Their Behaviorist, 'Circuit,' is known for aggressive scout rules. Their Networker, 'Mesh,' built the relay architecture that swept the losers' bracket."

Jax: "And Team Ghost Protocol is going War Room! Their Analyst, 'Wraith,' is probably the best Inspector reader in the competitive scene. Their Architect, 'Forge,' builds based on Wraith's intelligence. In Bo5, they'll be scarier every round."

The spectator view shows both teams' co-op model cards side by side: SPECIALIST (left, split icon) vs. WAR ROOM (right, magnifying glass icon). A stylized "VS" pulses between them. The map loads: Manila cyberpunk megacity — dense urban grid, fiber optic tiles that amplify signal delivery, elevated highways creating multi-level terrain.

**Minute 1:00 — Round 1 Plan Phase (Spectator View)**
The stream shows a four-quadrant picture-in-picture:
- Top-left: Circuit (Behaviorist, Team RC) — configuring aggressive scout rules with early-tag priority
- Top-right: Mesh (Networker, Team RC) — building a three-relay chain with compression at each hop
- Bottom-left: Forge (Architect, Team GP) — building a specialist-heavy architecture with two hack units
- Bottom-right: Wraith (Analyst, Team GP) — studying the map, placing amber zone markers on likely relay positions, writing notes: "If they relay-chain, the center fiber optic corridor is the choke"

Mira: "Look at Mesh's relay chain. Three relays in a line along the fiber optic corridor — columns D through F. That's a signal superhighway. Scout data will reach strikers in 4 ticks flat."

Jax: "But Wraith has already identified that corridor as the chokepoint. She's marking it for Forge. If Ghost Protocol hacks that corridor, the whole chain goes down."

**Minute 5:00 — Round 1 Sealed Watch**
12,000 viewers watch the battle unfold. The spectator view shows the full board with both teams' units visible (spectators see everything; players see only their own perspective).

Tick 6: Team RC's scout tags an enemy. The signal arc lights up the fiber optic corridor — three green delivery flashes in sequence, RELAY-A → RELAY-B → RELAY-C → STRIKER. The compressed signal reaches the striker in exactly 4 ticks as predicted.

Tick 8: Team GP's specialist reaches the fiber optic corridor. Hack skill activates on RELAY-B. The relay's output channel — 'tactical-compressed' — is now monitored by the specialist. A purple overlay appears on RELAY-B (visible to spectators and Team GP's Analyst only): INTERCEPTED.

Mira: "THEY HACKED THE MIDDLE RELAY. Team Relay Chain doesn't know yet. Every signal going through RELAY-B is now copied to Team Ghost Protocol's striker."

Tick 12: Team RC's scout detects a second enemy group. Tags and emits. The signal travels through RELAY-A, hits RELAY-B — and splits. One copy continues to RELAY-C → STRIKER (intended path). Another copy goes to Team GP's specialist → Team GP's striker (intercepted path). Team GP now knows exactly where Team RC's striker is heading.

Tick 15: Counter-ambush. Team GP positions their striker at the exact tile Team RC's striker is heading toward. Adjacent. Kill flash. Team RC's Behaviorist, Circuit, slams the desk — visible in his player cam.

Jax: "THAT'S THE POWER OF WAR ROOM. Wraith identified the vulnerability in the plan phase. Forge executed. And now the relay chain that won the losers' bracket is the thing killing Team Relay Chain."

Team GP wins Round 1 at tick 22.

**Minute 7:00 — Adaptation Phase (Spectator View)**
The four-quadrant view shifts to adaptation mode:
- Circuit and Mesh (Team RC) are in their shared Inspector. Mesh scrubs to tick 8 and sees the hack event — RELAY-B's output suddenly duplicated. "They hacked B," Mesh says. "I need to reroute around B or add a counter-hack."
- Wraith (Team GP) is alone in the full Inspector, reverse-engineering Team RC's entire relay chain. She pins 4 diagnostic cards for Forge: (1) "Relay chain runs D4→E4→F4, all fiber optic" (2) "Scout emits on 'tag-alert', relay compresses to 'tactical-compressed'" (3) "Striker only listens on 'tactical-compressed' — no fallback channel" (4) "RECOMMENDATION: Hack F4 instead of E4 next round — it's the last hop, they'll protect E4."

Mira: "Look at Wraith's diagnostic card #4. She's not just diagnosing — she's predicting Team RC's adaptation and pre-adapting. That's next-level."

**Minute 12:00 — Round 3 Resolution (Bo5, Series at 1-1)**
Team RC has added counter-hack specialists to protect their relay chain. Team GP has shifted their hack target. The battle is a chess match of hack and counter-hack, with both teams' communication networks under siege. The stream chat explodes at tick 18 when Mesh counter-hacks Ghost Protocol's OWN specialist, temporarily blinding their intercept. Circuit's striker breaks through in the confusion.

Round 3 goes to Team Relay Chain. The series continues.

**The casters' excitement is genuine.** The game produces legible, dramatic, narratively rich competitive content. The four-role structure creates storylines: the Behaviorist vs. the Architect designing rules to counter each other, the Networker vs. the Analyst in an intelligence war. Every round reveals more about both teams' architectures, and the adaptation creates a rising-action narrative arc.

**Minute 25:00 — Game 5 (Series at 2-2)**
The final game. Both teams deploy their most refined architectures — five rounds of adaptation have produced counter-upon-counter-upon-counter designs. Team RC's relay chain now has three redundant paths and counter-hack on every relay. Team GP's specialist squad has encryption-piercing hooks and decoy channels to waste counter-hack resources.

Tick 28: Decisive moment. Team GP's Wraith, in the War Room Analyst seat, spots something in the Inspector during the previous round that no one else saw: Circuit configured a fallback rule at the LOWEST priority — `IF no_signal for 8 ticks → patrol randomly`. If they can silence Team RC's entire signal network for 8 consecutive ticks, every unit reverts to random patrol. Chaos.

Forge builds accordingly: four specialists, all targeting different relay nodes simultaneously. A coordinated hack burst at tick 10 that silences every relay for exactly 8 ticks.

Tick 18: All of Team RC's units switch to random patrol. They scatter. Team GP's two strikers, guided by their own unhacked channels, pick off the disoriented units one by one.

Jax: "THEY READ THE FALLBACK RULE FROM THE DEBRIEF. WRAITH SAW THE LOWEST-PRIORITY RULE AND BUILT A STRATEGY AROUND IT. THAT'S THE POWER OF THE ANALYST ROLE."

Team Ghost Protocol wins the championship.

**UI Annotations (Spectator/Stream):**
- **Four-quadrant PIP:** 1920×1080 divided into four 960×540 panels. Each panel has the player's name, team name, and role (Behaviorist/Networker/Architect/Analyst) as a persistent header bar.
- **Hack overlay:** When a unit is hacked, a purple diamond icon appears above it. On the spectator view, a purple dashed line shows the data path from hacked unit to the hacking specialist. The purple overlay pulses rhythmically — each pulse represents a copied signal.
- **Diagnostic card preview:** When a War Room Analyst pins a card, the spectator view briefly flashes the card's content in the Analyst's quadrant, then shows it sliding to the Architect's quadrant as a miniature card icon. Casters can hover to expand.

---

## Interaction Effects

### With the Three-Screen Loop
- **Plan screen:** In 2v2, the Plan screen must accommodate partner visibility (diff cards, shared channel map, co-op model-specific layouts) without breaking the existing single-player layout. The core layout (board left, workbench right) remains; additions are overlays and panels.
- **Sealed Watch:** Unchanged for 2v2. Both team members watch the same battle. The emotional impact is amplified by shared investment.
- **Inspector:** In Arms Race 2v2, the Inspector becomes a competitive intelligence tool (as in 1v1) but with the added complexity of communicating findings to a partner who sees different data (Specialist) or can't see the Inspector at all (War Room).

### With EM Emissions
- In 2v2, EM emissions from BOTH team members' units contribute to the team's detection signature. A Specialist pair where the Networker builds a deep relay chain produces high EM, even if the Behaviorist designed quiet scout rules. The emission budget is a SHARED resource that neither player fully controls (see 7.02e — Cross-boundary EM emission budget).

### With the Gauntlet
- 2v2 Gauntlet requires separate ratings for teams vs. individuals. A player might be 1,800 in 1v1 and 2,100 in 2v2 with their main partner. The Gauntlet must track team-level ratings and show partnership history.

### With Production Queue Negotiation (7.02b)
- In 2v2, the production queue negotiation already explored in 7.02b gains competitive stakes. A team that can't agree on build order loses time in the adaptation phase. The War Council mechanic (joint approval required) creates a miniature negotiation game within the larger competitive game.

### With Community Features
- 2v2 creates natural content: team replays, partnership statistics ("this pair has a 72% win rate over 200 matches"), team-specific config necropsies. The community layer is richer because there are RELATIONSHIPS to display, not just individual profiles.

---

## Sensory Design

### The Team Match Loading Screen
Both team members' profile icons appear side by side — one cyan-tinted, one amber-tinted — connected by a thin luminous line that pulses in sync. On the opposite side, the opponent team's icons appear (generic silhouettes if anonymous, profile pics if public). The connecting line between opponents is thicker and red-tinted. Between the two team pairs, a pulsing "VS" icon rotates slowly. A low hum builds as the map loads — a bass drone that rises in pitch as the loading bar fills, resolving into a bright chime when the match is ready.

### The Co-Op Model Card Flip
When a team selects their co-op model, the card flips with a satisfying dimensional rotation — it spins along the vertical axis, revealing the back side (which shows the selected model's icon in full color against a dark background). A sharp "thwack" sound — like a playing card snapped against a table. The other four unselected cards slide downward off-screen with a soft shuffling sound, like a deck being gathered.

### The Adaptation Phase Timer
The 2-minute adaptation timer is rendered as a circular dial — not a horizontal bar. It fills counterclockwise (inspired by a chess clock). When under 30 seconds, the dial's edge begins to glow orange, and a soft ticking begins — not a metronome, but a heartbeat-like double pulse (thum-THUM, thum-THUM) that accelerates as time runs out. At 5 seconds, the screen edges subtly darken — a gentle vignette closing in, creating tunnel vision focus.

### The Cross-Team Signal Hack Moment
When a specialist successfully hacks an opponent's channel, the visual language must communicate VIOLATION. The hacked unit's signal arc changes color: the portion of the arc after the hack point shifts from green (healthy) to purple (compromised). A brief audio sting — a descending digital glitch sound, like a modem being interrupted. The hacking specialist's tile gets a small purple glow aura. On the spectator view, the data path from hacked unit to hacking specialist renders as a purple dashed line with animated data packets (tiny bright dots) flowing along it, one per tick.

---

## Discovered New Aspects

1. **7.02c-i — 2v2 matchmaking population thresholds:** Minimum concurrent player counts for viable 2v2 matchmaking across each PvP model (Ghost: ~30 teams, Sealed Duel: ~200 teams, Arms Race: ~500 teams, Gauntlet: ~50 teams); at what population levels should 2v2 modes be enabled/disabled; dynamic mode availability based on concurrent count.

2. **7.02c-ii — Team rating systems for 2v2:** Elo variants for team vs. individual rating; partnership persistence (does rating transfer when a player switches partners?); the "new partner penalty" design; comparison to chess team ratings and Valorant duo queue adjustments.

3. **7.02c-iii — Asymmetric co-op model draft as ban/pick phase:** Tournament format where teams ban 1 co-op model, then pick from remaining 4; the ban as strategic intelligence ("they banned Specialist, so they're weak against separated-concern architectures"); comparable to MOBA champion draft as competitive meta-game layer.

4. **7.02c-iv — Spectator mode four-quadrant director controls:** Automated and manual camera systems for 2v2 tournament streaming; when to show which player's perspective; picture-in-picture priority logic; the "director AI" that highlights the most interesting perspective at each tick; Dota 2's auto-directed camera as comparable.

5. **7.02c-v — 2v2-specific mission design for co-op campaign:** Campaign missions designed for 2v2 teams rather than adapted from solo; missions where BOTH co-op roles face simultaneous pressure; the "designed handoff" mission that forces Behaviorist and Networker to solve intertwined problems; missions that explicitly teach team diagnostic conversation.
