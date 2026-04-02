# Gauntlet Warm-Up Mode: Practice Matches Without ELO Stakes

**Aspect:** 5.22e — Gauntlet warm-up mode
**Category:** Campaign / Gauntlet
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

A player finishes Mission 10. The Gauntlet opens. They have a 1400 ELO rating and an architecture they built to beat the Warden. They want to try something radically different --- rip out their command agent hierarchy and replace it with a flat mesh network of autonomous scouts. But their first Gauntlet match is real. Every match is real. The ELO number stares at them from the top of the screen.

They don't click EXECUTE.

This is the warm-up mode question: **should there be a space where Gauntlet-level play happens but the number doesn't move?** And if so, what does that space cost the rest of the game?

The tension is genuine. Robot Uprising's sealed watch derives its emotional power from stakes --- you built this system, you deployed it, and now you watch it succeed or fail with no way to intervene. Practice mode threatens that power at its root. If the watch doesn't matter, the build doesn't matter. If the build doesn't matter, nothing matters. But if every match matters, players stop experimenting. They play it safe. They iterate on what works instead of exploring what might work. The architecture space narrows. The game becomes conservative.

This is not a new problem. Every competitive game with a rating system has faced it. The solutions vary wildly, and none are clean.

---

## The Practice Match Itself

### What It Is

A match that uses the full Gauntlet simulation --- same battlefield, same rules, same deterministic tick engine, same sealed watch --- but records no ELO change for either participant. The player's deployed ghost is not affected. The opponent's ghost is not affected. The match result exists only in the player's local history.

### Opponent Selection

Three options, each with different design implications:

**Option 1: Matchmade ghost pool.** The practice queue pulls from the same ghost pool as ranked, matching at the player's current ELO. The opponent's ghost doesn't know and doesn't care --- it's a ghost, it fights whoever the server sends. This means practice matches are against real-quality opponents at the player's skill level. The downside: the ghost owner has no idea their architecture is being used as a training dummy. Their ghost accumulates no score from these matches. This is fine mechanically but creates a subtle asymmetry --- one player is practicing, the other's proxy is working for free.

**Option 2: AI opponents at selectable difficulty.** The game provides a set of pre-built AI architectures at various ELO-equivalent difficulties (1200, 1400, 1600, 1800, 2000). These are hand-designed or curated from high-performing community ghosts (with permission/attribution). The player picks a difficulty and fights it. The upside: no pool-splitting, no asymmetry, no matchmaking delay. The downside: AI opponents don't capture the creative diversity of real players. A 1600-rated AI plays like *one* 1600-rated player, not the full spectrum of 1600-rated architectures. The player optimizes against a known quantity, which is the opposite of what the Gauntlet demands.

**Option 3: Replay any previous opponent.** The player can rematch any ghost they've previously faced in ranked. This turns the practice mode into a laboratory --- "I lost to this hook-flooding architecture at 1650; let me iterate against it until I solve it." This is the most useful option for genuine improvement but creates a different problem: the opponent's ghost is frozen at the version they deployed when the original match happened. If the opponent has since updated their architecture, the player is practicing against a stale target.

**Recommendation: Option 1 as default, Option 3 as unlocked feature.** Matchmade practice gives realistic opponents. Rematch mode gives targeted iteration. Option 2 exists as a fallback for low-population scenarios where the ghost pool is too thin for practice matchmaking.

### What Data Is Recorded

- Match replay: saved locally, watchable from match history, tagged as PRACTICE
- Architecture snapshot: the blueprint configuration used, timestamped
- Win/loss outcome: visible in the player's private practice log
- Debrief data: full inspector access, identical to ranked

What is NOT recorded:
- ELO change for either player
- Ghost deployment updates
- Leaderboard position changes
- Season statistics
- Any public-facing record of the match

### Rate Limiting

Unlimited practice matches would let players use the mode as a free simulation sandbox, running hundreds of matches per hour to brute-force optimal configurations. This isn't inherently bad --- it's how engineering works --- but it changes the game's character. Two approaches:

**Soft limit:** Practice matches cost a resource (simulation credits, energy, whatever the game's economy unit is). The player gets 3-5 free practice matches per day, with more available through campaign replay or daily objectives. This creates natural pacing without hard gates.

**No limit:** Let them practice as much as they want. The sealed watch takes 2-4 minutes per match. Even a dedicated grinder can only run 15-20 practice matches per hour. The time cost IS the rate limit. The game respects their time by not adding artificial friction.

---

## Player Journeys

### Journey 1: The Experimenter --- Kai, 24, Software Engineer

**Context:** Kai is at 1580 ELO after 40 ranked matches. He's plateaued. His architecture is a proven three-blueprint system: scouts, fighters, command relay. It wins 52% of matches. He wants to try something he read about on the community forum --- a single-blueprint polymorphic design where every unit can switch roles based on context. It's theoretically elegant but he's never built one.

**Day 1, 7:30 PM --- The Impulse**

Kai opens the Gauntlet screen. His ELO sits at 1580. He stares at the EXECUTE button, then notices the smaller button beneath it: PRACTICE. It's rendered in a muted tone --- same font, but the orange accent is replaced with a cool grey. The button doesn't pulse. It doesn't invite. It just exists.

He clicks it. The plan screen loads identically to ranked --- same blueprint editor, same channel map, same conveyor belt queue. But the border trim shifts. The sharp orange highlights that normally frame the plan screen soften to a steel blue. The ELO display in the top corner dims and shows a small lock icon beside it. The message is clear without being stated: this is the same room, but the scoreboard is off.

Kai tears apart his three-blueprint system. He deletes the command relay entirely. He designs a single blueprint with conditional role-switching rules: IF nearby_allies < 2 THEN scout_mode, IF enemy_detected AND nearby_allies >= 3 THEN fighter_mode, IF damaged THEN retreat_to_factory. It's messy. The channel map is a single pipe called `swarm-net`. Every unit talks to every unit.

He hits EXECUTE. The sealed watch begins.

**7:35 PM --- The Watch**

The battlefield renders identically to ranked. Same grid, same fog, same ambient hum. But one detail is different: the match timer in the corner displays in the same steel-blue as the plan screen border. A subtle `[PRACTICE]` label sits beneath it, small enough to ignore but present enough to remember.

Kai watches his swarm pour out of the factory. They scatter. Three units detect an enemy scout and converge --- the fighter_mode rule triggers. They destroy it. But then the swarm-net floods with detection signals, and every unit within relay range switches to fighter_mode simultaneously, abandoning map coverage. The enemy's actual attack force flanks through the unmonitored east corridor.

Kai loses badly. His units chase ghosts while the real threat walks through the front door.

**7:38 PM --- The Debrief**

Full inspector access. Kai opens the channel metrics for `swarm-net` and sees the cascade: 47 signals in 3 ticks, every unit context-saturated, no filtering. The pressure thermometer is solid red from tick 12 onward. He understands the failure immediately --- the polymorphic design needs signal throttling or it drowns in its own communication.

He doesn't feel the sting of a ranked loss. He feels curiosity. He goes back to the plan screen and adds a `compress` skill to every unit's receive hook. The signal flood should collapse into summary data.

He runs three more practice matches. The second is better --- the swarm holds formation but responds too slowly to threats. The third, with adjusted compress thresholds, produces a fluid, adaptive army that wins against a 1550-rated ghost. The fourth match, against a 1620-rated ghost, exposes a new weakness: the swarm has no answer to concentrated burst damage.

**7:55 PM --- The Decision**

Four practice matches, 25 minutes. Kai now has a polymorphic design that works in principle but needs refinement against high-burst strategies. He could keep practicing. Instead, he clicks RANKED. The border shifts back to orange. The ELO display unlocks. The match timer will be white, not blue. This one counts.

He deploys the polymorphic swarm. He's nervous --- 1580 is at stake. The sealed watch starts. His units pour out. The swarm-net hums. He watches with his hands clasped, leaning forward.

He wins. 1580 becomes 1596. The polymorphic design is real now. It has a ranked win. He grins.

**What practice mode did:** It gave Kai permission to destroy a working system and build something untested. Without practice mode, the polymorphic experiment would have cost him 3-4 ranked losses (roughly 60-80 ELO) before becoming viable. Most players would never take that risk. Practice mode turned a 60-ELO gamble into a 25-minute lab session, then Kai chose to take the refined result into ranked when he was ready.

### Journey 2: The Anxious Player --- Priya, 31, Product Manager

**Context:** Priya finished the campaign two days ago. She loved it. The Predecessor's narration, the gradual complexity ramp, the satisfaction of beating the Warden --- all of it resonated. She opened the Gauntlet screen, saw the ELO number, and closed the game. She hasn't played since.

**Day 3, 9:00 PM --- Returning**

Priya opens the game. The boot log greets her: `ALL SYSTEMS ONLINE. GAUNTLET ACCESS: GRANTED.` She navigates to the Gauntlet screen. The ELO number --- 1200, the starting value --- feels like a judgment she hasn't earned yet. She doesn't know what "good" looks like. She doesn't know if her Warden-beating architecture is competitive or laughable.

She sees the PRACTICE button. Relief. She clicks it.

**9:02 PM --- First Practice Match**

The steel-blue border feels safer than the orange. The locked ELO display is a promise: nothing bad can happen here. She deploys her campaign architecture unchanged --- the same system that beat the Warden. EXECUTE.

The sealed watch plays. Her army performs... adequately. She wins against a 1200-rated ghost, but it's messy. Her units cluster in the center, leaving flanks exposed. The command agent issues redundant orders. She built this system to beat a specific boss, not to handle an unknown opponent.

The debrief shows the problems clearly. She adjusts her scout rules to cover more ground and reduces the command agent's broadcast frequency. Second practice match. Better. Third practice match, against a 1250-rated ghost. She loses --- the opponent's architecture uses emissions-hunting to snipe her command agent early, and without it, her army collapses.

**9:25 PM --- Understanding the Gauntlet**

Three practice matches have taught Priya something the campaign never did: her architecture has a single point of failure. The command agent is load-bearing. If it dies, everything falls apart. This is a Gauntlet lesson --- campaign enemies don't target your command agent because they're scripted, not strategic.

She redesigns. Two command agents, each managing half the army, with a failover rule: IF primary_commander_destroyed THEN assume_command. It's redundant but robust.

**9:35 PM --- The Leap**

Priya clicks RANKED. The border turns orange. Her heart rate increases. She deploys the dual-commander architecture. The sealed watch begins. She watches her army operate with a plan she trusts because she tested it. She wins. 1200 becomes 1216.

She plays three more ranked matches that evening. She goes 2-1. The losses sting but don't devastate --- she's already seen her architecture fail in practice, so ranked failure feels like data, not judgment.

**What practice mode did:** It gave Priya a low-anxiety on-ramp to competitive play. Without it, she might never have clicked RANKED. The campaign-to-Gauntlet transition is the game's highest-churn moment --- practice mode is a pressure valve that lets anxious players decompress the transition at their own pace.

### Journey 3: The Competitive Grinder --- Marcus, 22, CS Student

**Context:** Marcus is at 1820 ELO, top 5% of the ladder. He plays 8-10 ranked matches per day. He does not use practice mode.

**Tuesday, 4:00 PM --- The Usual Session**

Marcus opens the Gauntlet. He ignores the PRACTICE button --- he has always ignored it. To Marcus, practice mode is for people who are afraid to lose. Losing is data. Every ranked loss shows him a weakness in his architecture. Every ranked win confirms a strength. The ELO number is the only honest measure of his system's quality. Practice mode produces fake data --- wins and losses against opponents who might be practicing too, in conditions that don't matter, producing results that mean nothing.

He clicks RANKED. Deploys. Watches. Wins. Deploys again. Wins. Third match: a loss against a 1790-rated opponent who used an architecture Marcus has never seen --- a decoy factory that produces cheap, expendable units while the real army spawns from a hidden secondary base. Marcus's scouts found the decoy factory and reported "threat neutralized." The real army hit him from behind.

**4:25 PM --- The Exception**

Marcus opens the match history. He finds the opponent's ghost. For the first time in weeks, he clicks PRACTICE. He wants to fight this specific ghost again. Not to protect his ELO --- he's already lost the points --- but because he wants to understand the decoy factory architecture. How does the opponent split production between decoy and real units? Where does the secondary base place? What's the resource allocation?

He runs the rematch. This time, he watches differently. He's not trying to win; he's trying to *read*. The inspector shows the opponent's unit count diverge --- 60% cheap decoys, 40% elite fighters. The decoy factory is placed centrally (obvious), the real factory is placed in a corner (hidden). The channel map uses two completely separate networks: `noise-net` for decoys and `strike-net` for the real army.

Marcus designs a counter: scouts that track resource expenditure, not unit count. If total enemy resource spend exceeds visible unit value by more than 20%, flag a hidden factory. He tests it in a second practice match against the same ghost. The scout detects the secondary base by tick 8. His army destroys it by tick 15. Victory.

**4:40 PM --- Back to Ranked**

Marcus deploys his updated architecture with the resource-tracking scout rule. He climbs from 1812 to 1835 over the next five matches. The decoy factory trick never catches him again.

**What practice mode did:** Even for the player who disdains it, practice mode served as a specific-opponent laboratory. Marcus didn't use it as a warm-up; he used it as a debugger. The rematch feature turned a confusing loss into a learning session with a precise outcome: one new rule that permanently improved his architecture.

---

## Strengths

**Experimentation freedom.** Practice mode is the single most effective way to encourage architectural diversity in the Gauntlet. Without it, the meta calcifies --- players converge on proven configurations because the cost of experimentation (ELO loss) outweighs the potential reward (maybe finding something better). With practice mode, the cost of experimentation drops to time only. The meta stays fluid because players can explore the design space without penalty.

**Anxiety reduction at the transition point.** The campaign-to-Gauntlet transition is where the game loses players. Practice mode is a decompression chamber. It lets campaign graduates experience Gauntlet-level play without the immediate pressure of a permanent record. This is not coddling --- it's retention engineering. A player who practices 5 times before their first ranked match is more likely to play 50 ranked matches than a player who loses their first 3 ranked games and quits.

**Targeted improvement via rematch.** The ability to replay a specific opponent's ghost transforms confusing losses into solvable puzzles. This is the most defensible use case for practice mode --- it's not avoiding stakes, it's extracting maximum learning from a single data point.

**Iteration speed.** The architecture iteration loop (modify blueprints, execute, watch, inspect, repeat) runs faster in practice mode because the emotional overhead of each cycle is lower. A player in ranked spends mental energy processing the ELO implications of each match. A player in practice spends that same energy on the architecture itself. Practice mode is a focus tool.

---

## Weaknesses

**Emotional dilution of the sealed watch.** This is the core risk. The sealed watch's power comes from irreversibility --- you built this, you deployed it, now you watch it fight for real. Practice mode introduces a category of sealed watches that don't count. If a player spends 70% of their time in practice, the sealed watch becomes a preview tool, not a moment of truth. The emotional valence shifts from "my creation is being tested" to "let me see if this works." That's a meaningful degradation.

The counter-argument: the sealed watch's emotion comes from *authorship*, not stakes. Watching your architecture execute a plan you designed is satisfying regardless of whether ELO moves. A parent watching their child's soccer practice game still feels pride and anxiety --- the game doesn't need to be the championship to matter. But this counter-argument has limits. If every game is practice, no game is practice. Stakes create meaning. The question is whether practice mode dilutes stakes for the 80% of players who use it occasionally, or whether it becomes a crutch for the 20% who live in it.

**Queue splitting.** If practice and ranked use the same ghost pool (recommended), there's no queue split --- ghosts don't know which mode they're fighting in. But if practice uses a separate opponent pool, the matchmaking population splits. For a small-community game, any population split is dangerous. The ghost system mitigates this --- ghosts fight asynchronously regardless --- but practice-exclusive players who never deploy ranked ghosts shrink the ranked pool without contributing to it.

**Practice-to-ranked skill transfer gap.** Practice mode produces a false sense of readiness. A player who goes 10-0 in practice might expect similar performance in ranked, but the psychological pressure of ranked play affects decision-making in the plan screen. The player might over-think their blueprint choices, second-guess changes that worked in practice, or choke on the EXECUTE button. Practice mode can't simulate the feeling of "this counts."

**Exploitation surface.** If practice matches pull from the real ghost pool, a player could use practice mode to scout future ranked opponents --- play 10 practice matches to identify common architectures at their ELO, then deploy a counter-build in ranked. This isn't cheating (the ghost pool is public by nature), but it creates an advantage for players who invest time in scouting. Whether this is a feature or a bug depends on the game's philosophy.

---

## Interaction Effects

### ELO Integrity

Practice mode has zero direct effect on ELO --- no points are exchanged. The indirect effect is positive: players who practice before ranking up bring better-tested architectures to ranked, which means ranked matches are higher quality. The ELO distribution becomes more accurate because players are deploying architectures they understand, not experimental builds that lose 3 games before becoming viable.

The risk is ELO stagnation at the low end. If anxious players never leave practice mode, they never enter the ranked pool, and the 1200-1400 ELO bracket thins out. Low-ranked players face longer matchmaking times and wider ELO spreads. This is the "smurf-free zone" problem in reverse --- instead of high-skill players depressing low ranks, low-skill players simply aren't there.

### Sealed Watch Tension

The sealed watch in practice mode should be IDENTICAL to ranked. Same camera constraints, same inability to pause or intervene, same 2-4 minute runtime. The only visual difference is the steel-blue color accent and the `[PRACTICE]` tag. If practice mode allows fast-forwarding, pausing, or real-time inspection during the watch, it becomes a simulation tool, not a practice match --- and the sealed watch's emotional design collapses entirely. The watch must be sealed in practice because the watch IS the game. Unsealing it, even in practice, teaches the wrong lesson: that the watch is an obstacle to get through, not the experience itself.

### Iteration Speed

Practice mode dramatically accelerates the iteration loop. In ranked, a player who wants to test 3 variants of a blueprint change must spend 3 ranked matches (6-12 minutes of sealed watches, plus ELO risk, plus the emotional processing of each result). In practice mode, the same 3 tests take the same 6-12 minutes but carry no ELO risk and lower emotional overhead. The player reaches "I understand what works" faster, then deploys a refined architecture in ranked.

The danger: if iteration is TOO fast, the game loses its meditative quality. Part of Robot Uprising's rhythm is the weight of each EXECUTE --- the decision to deploy should feel consequential. Practice mode should feel lighter than ranked, but not weightless. The sealed watch's mandatory viewing time provides natural friction. Each practice match still takes 5-7 minutes including plan time, watch time, and debrief. That's the minimum viable weight.

### Matchmaking Pool

If practice uses the existing ghost pool (asynchronous), there is no pool impact. Ghosts don't distinguish between practice and ranked challengers. The ghost fights; the result is discarded for practice or recorded for ranked. The ghost owner never knows. This is the correct implementation --- it avoids pool splitting entirely.

If the game ever implements synchronous PvP (real-time matches between two live players), practice mode DOES split the synchronous pool. This is a future concern, not a launch concern, since the ghost system is asynchronous by design.

---

## Comparable Games

### League of Legends: Normal vs. Ranked

League's "Normal" queue is the closest analogue to Gauntlet practice mode. Normal uses its own hidden MMR, matches are full-length (30-45 minutes), and the experience is mechanically identical to ranked. The differences are psychological: no visible rank, no promotion series, no season rewards.

The result: Normal became League's most-played mode. More players play Normals than Ranked in every region. This is both a success (retention) and a warning (competitive dilution). Many players never transition to Ranked because Normal provides all the gameplay with none of the anxiety. League solved this by making Ranked-exclusive rewards (skins, borders, titles) desirable enough to pull players across the threshold.

Robot Uprising lesson: if practice mode is too comfortable, it becomes the default mode and ranked becomes the exception. The game needs a pull mechanism --- something that exists only in ranked (seasonal cosmetics, leaderboard position, architecture museum entries) to make ranked feel worth the anxiety.

### Chess: Casual Games on Chess.com/Lichess

Chess platforms offer both rated and unrated games with identical mechanics. The unrated option is used primarily for two purposes: playing with friends without stakes, and testing openings against human opponents. Serious improvement happens in rated games because the Elo number provides the feedback signal --- you can't tell if a new opening is working without seeing its effect on your rating over 20+ games.

Robot Uprising lesson: practice mode is useful for single-session experiments ("does this blueprint work at all?") but not for long-term improvement tracking. The ELO number IS the improvement metric. Players who want to get better must eventually play ranked. Practice mode should be a waystation, not a destination.

### Fighting Games: Training Mode

Street Fighter, Tekken, and Guilty Gear all feature training modes where the player fights a configurable dummy opponent. Training mode is NOT a match --- it's a laboratory. The opponent can be set to block, attack, or stand still. Combos can be practiced in isolation. Frame data is visible. The training room has a distinct visual identity (usually a featureless grid or blank stage) that signals "this isn't real."

The key insight: fighting game training mode is NOT a practice match. It's a tool. The emotional register is completely different --- training mode is clinical, analytical, detached. A practice match preserves the emotional structure of a real match (sealed watch, unknown opponent, win/loss outcome) but removes the consequences. Fighting game training mode removes BOTH the consequences AND the emotional structure.

Robot Uprising should NOT build a training mode. The sealed watch is too important to the game's identity to allow a "configurable dummy" mode that bypasses it. Practice mode must preserve the watch --- it must feel like a real match that simply doesn't count, not a laboratory where the rules are suspended.

### Slay the Spire: No Practice, Full Commitment

Slay the Spire has no practice mode. Every run is real. Every card choice matters. Every floor could end the run. This works because Slay the Spire is a roguelike --- the commitment unit is a 45-minute run, not a permanent rating. A bad run costs time, not status. You start fresh next run.

Robot Uprising's Gauntlet is NOT a roguelike. The ELO rating persists across sessions. A bad match costs permanent status that takes multiple wins to recover. The commitment structure is closer to chess than Slay the Spire, and chess has always offered unrated play.

---

## Visual Differentiation: Practice vs. Ranked

The practice mode must look different enough to prevent accidental confusion but similar enough to preserve the sealed watch's emotional design. The solution is a **color temperature shift**, not a layout change.

**Ranked atmosphere:**
- Border accents: warm orange (#d67e4b equivalent in the game's palette)
- ELO display: prominent, white text, live-updating
- Match timer: white
- Post-match result: full-screen, with ELO delta shown prominently (+16 / -12)
- Ambient sound: the usual battlefield hum with a subtle tension undertone

**Practice atmosphere:**
- Border accents: cool steel-blue (desaturated, lower contrast)
- ELO display: dimmed, with a small lock icon, no delta shown
- Match timer: steel-blue, with `[PRACTICE]` label beneath
- Post-match result: smaller, no ELO delta, just WIN/LOSS with a "Deploy to Ranked?" prompt
- Ambient sound: identical battlefield hum but without the tension undertone --- same sounds, slightly lower urgency in the mix

The plan screen, sealed watch, and inspector are functionally identical in both modes. The color shift is the ONLY persistent difference. This preserves the emotional continuity of the three-screen loop while providing a constant, ambient reminder that stakes are suspended.

The transition moment --- clicking RANKED after a practice session --- should feel like flipping a switch. The border warms from blue to orange. The ELO display unlocks and brightens. The tension undertone fades back into the ambient mix. The room is the same room. The tools are the same tools. But the air is different now. This counts.

---

## Recommendation

Ship practice mode at launch. Make it available immediately when the Gauntlet unlocks --- no additional gate, no unlock condition. Use the ghost pool for opponents (no queue splitting). Keep the sealed watch fully sealed in practice. Use the color temperature shift for differentiation. Do not rate-limit practice matches; the sealed watch's mandatory viewing time provides natural friction.

The risk of emotional dilution is real but manageable. The risk of losing players at the campaign-to-Gauntlet transition --- because they're afraid to play ranked and have no alternative --- is higher and less recoverable. Practice mode is retention insurance. The players who would live in practice mode forever are players who would have quit without it. The players who use practice mode as a laboratory before deploying to ranked are the game's healthiest competitive players. Serve both.

The one non-negotiable: the sealed watch must be sealed in practice. The moment practice mode allows skipping, fast-forwarding, or real-time inspection of the watch, it stops being a practice match and becomes a simulation tool. That's a different feature with a different design document. This is about practice. Practice means playing the game. Playing the game means watching your creation fight while you sit on your hands and hope.
