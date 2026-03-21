# Multi-Round Mission Retry Granularity

**Aspect:** 5.22a — Multi-round mission retry granularity: when a player fails Round 3 of 5, do they restart from Round 1 or retry Round 3?
**Category:** Campaign / Mission Design
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

Some Robot Uprising missions span multiple rounds — waves of enemies, sequential objectives, escalating phases. When a player's architecture survives Rounds 1 and 2 but crumbles in Round 3, the game faces a fork: does it send them back to Round 1 (mission-level reset) or let them retry from Round 3 (round-level checkpointing)?

This isn't a UX convenience question. It's a question about what the game *is*. Round-level checkpointing says: "Each round is an independent puzzle." Mission-level reset says: "The whole mission is one continuous system test — your architecture must hold across all conditions, not just one." The choice shapes learning speed, emotional stakes, and whether the game feels like a series of isolated challenges or a single coherent design problem.

Robot Uprising's locked constraints make this question particularly sharp:

- **Full determinism with invisible randomization** — the same config produces varied results. Replaying from Round 1 means Rounds 1-2 play out *differently* even with the same config. The player can't just autopilot through "solved" rounds.
- **The sealed watch is mandatory** — no skip, no pause, no fast-forward past "solved" rounds. If the player restarts from Round 1, they must *watch* Rounds 1-2 again at 1x/2x speed. This is seconds or minutes of mandatory viewing.
- **Architecture is holistic** — context window state, unit positions, resource income from tagged nodes, production queue progress — all carry forward between rounds. Round 3's starting conditions are a *consequence* of how Rounds 1-2 played out.
- **One-shot, one-kill** — units lost in Rounds 1-2 don't respawn. A "clean" Round 1 and a "messy" Round 1 produce fundamentally different Round 3 starting states.

---

## The Spectrum of Retry Granularity

Retry granularity isn't binary. It exists on a spectrum from maximally punishing to maximally forgiving, with several meaningful stops along the way.

### Model A: "The Full Gauntlet" — Mission-Level Reset Only

**How it works:** Fail any round, restart the entire mission. No checkpoints. No shortcuts. Round 1 through Round N is a single indivisible test of your architecture.

**The philosophy:** Your agent architecture is a *system*, not a collection of independent solutions. A config that handles Round 3's flanking attack but collapses under Round 1's opening pressure isn't a good config — it's a fragile one. The mission tests robustness. You must build something that works across all conditions.

**Comparable games:**
- **Into the Breach** uses a complete island reset model. If you abandon a timeline, you lose everything and start fresh with a new squad. There are no mid-island checkpoints. Each island is a gauntlet of 2-4 missions plus a boss, and while individual missions can be failed without ending the run (grid power absorbs losses), the *run* itself has no save points. The game's "Reset Turn" mechanic (once per battle, rewind your current turn) provides micro-granularity within a battle but zero macro-granularity across the island. This teaches players to think holistically — not "can I solve this one battle?" but "can my squad survive four battles with accumulating damage?"
- **Fire Emblem (Classic Mode)** historically required full chapter restarts on game over. Units lost mid-chapter stayed dead (permadeath), creating stakes that compound across the chapter. A careless move in Turn 3 might not kill anyone immediately, but leaves a unit exposed for Turn 7's reinforcements. The chapter is a single continuous test.

**Strengths:**
- Forces holistic thinking about architecture robustness, not round-specific optimization
- Creates genuine tension in early rounds — "I need to survive this cleanly or Round 4 becomes impossible"
- Makes victory feel earned — you conquered the *whole thing*
- Prevents degenerate "solve each round independently" strategies that ignore carry-over state
- Invisible randomization means replaying isn't pure repetition — Rounds 1-2 play out differently each time

**Weaknesses:**
- Mandatory sealed watch means replaying "solved" rounds is *watching*, not *playing*. A 5-round mission at 20 ticks per round at 1 second per tick = 100 seconds of sealed watch. Failing on Round 5 means re-watching 80 seconds you've already seen, potentially dozens of times.
- The "I already solved this part" frustration is real and well-documented. Red Dead Redemption 2 players reported rage-quitting after losing 30 minutes of mission progress to a full restart.
- Learning is slower — feedback from Round 3 changes requires waiting through Rounds 1-2 to verify
- Invisible randomization is a double-edged sword: your "fixed" config might fail Round 2 this time even though it passed before, obscuring whether your Round 3 fix actually works

### Model B: "The Checkpoint Gate" — Round-Level Checkpointing

**How it works:** Completing a round creates a checkpoint. When you fail, the game offers: "Retry from Round 3?" or "Restart Mission?" The checkpoint captures the full game state: unit positions, context window contents, production queue status, resource count, tagged nodes, everything. Retrying from a checkpoint replays from that exact state.

**The philosophy:** Each round is a distinct challenge. The player's time is valuable. If they've proven they can handle Rounds 1-2, don't make them prove it again. Let them focus their learning on the round that's actually stumping them.

**Comparable games:**
- **Celeste's** instant respawn at room boundaries is the gold standard for checkpoint granularity. Each room is an independent challenge. Death resets only that room. The result: players attempt the hardest screens hundreds of times without frustration because the retry loop is measured in *seconds*, not minutes. Celeste's Assist Mode goes further — invincibility, slow-mo, infinite dashes — but the core genius is the checkpoint granularity itself.
- **XCOM 2 (non-Ironman)** auto-saves at the start of each player turn, creating turn-level checkpoints. Players can reload from any previous turn. This granularity is so fine that the community coined "save scumming" for the practice of reloading after every bad outcome. Notably, XCOM 2 seeds its random number generator to prevent identical outcomes on reload — the same action taken in the same order produces the same result, forcing players to try *different* approaches rather than re-rolling the dice.

**Strengths:**
- Dramatically faster learning loop — change config, see Round 3 result immediately
- Eliminates the "watching rounds I already solved" frustration
- More respectful of player time, especially in later missions with many rounds
- Players can focus attention on the specific architectural flaw that caused failure

**Weaknesses:**
- Breaks the holistic system test — players can optimize each round independently without considering carry-over effects
- Checkpointed state may not reflect the *best* Rounds 1-2 performance. The player might have entered Round 3 with 2 units lost; those units might have been saveable with a better config, but the checkpoint locks in the suboptimal state
- Reduces emotional stakes — "I can always retry from here" deflates the tension of watching each round
- Can create a local-maximum trap: the player optimizes for Round 3 *given this specific Round 2 outcome* rather than rethinking the whole architecture

### Model C: "The Rewind Charge" — Limited Mid-Mission Retries

**How it works:** The player gets a limited number of "rewind charges" per mission (1-3). When a round fails, spending a charge restarts from the beginning of that round. When charges are exhausted, the next failure triggers a full mission reset. Charges don't regenerate between rounds.

**The philosophy:** Failure forgiveness is a *resource*, not a right. The player can choose when to spend their safety net. Using a charge on Round 2 means Round 5 has no safety net. This creates a secondary strategic layer: "Is this failure bad enough to spend a charge, or should I restart the mission and try to enter Round 3 in a better state?"

**Comparable games:**
- **Fire Emblem: Three Houses' Divine Pulse** is the direct inspiration. Players start with a limited number of "pulses" (initially around 3, upgradeable to 13) that rewind the battle to any previous turn. The brilliance: you choose *how far* to rewind. Made a mistake 1 turn ago? Small rewind, small cost. Realize 8 turns ago you positioned a unit badly? Big rewind, same cost but you lose 8 turns of progress. The mechanic transforms Classic Mode from "restart the whole chapter on any death" to "you get N mulligans per chapter." It preserved emotional stakes (charges are finite, running out is terrifying) while eliminating the worst frustration (losing 45 minutes of progress to one misclick).
- **Into the Breach's Reset Turn** — one free turn rewind per battle, two with Isaac Jones. This is the most constrained version: exactly one do-over, at turn granularity within a single battle. The constraint is what makes it strategic. Players agonize over when to use it. "Should I reset now, or will I need it more in Turn 5?"

**Strengths:**
- Preserves emotional tension (charges are finite and precious)
- Creates an additional strategic decision: when to spend vs. save charges
- Prevents the worst frustration spikes without eliminating all consequences
- Scales naturally with difficulty: harder missions could grant more charges

**Weaknesses:**
- Adds mechanical complexity to a game that's already cognitively demanding
- The "should I use my charge?" decision can cause analysis paralysis
- Players who save all charges and fail on the last round feel doubly punished — they "wasted" their charges by not using them
- Rewind semantics are complicated with invisible randomization — does the rewind replay with the same seed or a new one?

### Model D: "The Debrief Gate" — Conditional Retry Based on Inspector Analysis

**How it works:** Round-level retry is available, but *only after* the player has engaged with the Inspector for the failed round. The game tracks whether the player actually scrubbed through the timeline, inspected unit context windows, and read the decision traces. Perfunctory clicking doesn't count — the Inspector must register meaningful engagement (spending at least N seconds on the analysis, or clicking through specific diagnostic views). Once the player has "done their homework," the round-level retry unlocks.

**The philosophy:** The game's learning loop requires reflection. Retrying without understanding *why* you failed is just button-mashing with extra steps. The Inspector is the learning tool. The checkpoint is the reward for using it.

**Strengths:**
- Ensures every retry is informed by analysis, not just frustration-driven repetition
- Reinforces the two-act debrief structure (sealed watch → inspector) as essential, not optional
- Makes the Inspector feel valuable rather than skippable
- Players build actual debugging skills — the game is literally teaching agentic system analysis

**Weaknesses:**
- "Forced learning" can feel patronizing, especially for experienced players who already understand their mistake
- Defining "meaningful engagement" is technically tricky — time-based gates are gameable (leave it open, go get coffee)
- Adds friction to the retry loop, which is the opposite of what frustrated players want
- Risk of the Inspector becoming a "homework assignment" players resent rather than a tool they value

### Model E: "The Cascading Checkpoint" — Earn Checkpoints Through Performance

**How it works:** Checkpoints are not automatic. They're *earned*. Complete a round with zero unit losses and a tagged-node threshold? Checkpoint created. Complete it messily with casualties? No checkpoint — if you fail later, you restart from the last earned checkpoint (or the beginning if you haven't earned any).

**The philosophy:** Checkpoints are a reward for excellence, not a participation trophy. This encourages players to not just *pass* each round but to *master* it. A player who scrapes through Rounds 1-3 with heavy losses gets no safety net for Rounds 4-5. A player who handles Rounds 1-3 cleanly earns three checkpoints.

**Comparable games:**
- **Souls-like bonfire placement** — checkpoints exist at fixed locations, but reaching them requires surviving the gauntlet between them. The bonfire is both a reward for progress and a strategic resource (healing, leveling up). The spacing of bonfires is one of the primary difficulty levers.

**Strengths:**
- Creates a natural difficulty curve within the mission — messy play cascades into harder conditions
- Rewards mastery with convenience, creating a virtuous cycle
- Encourages perfectionists to replay early rounds for clean checkpoints rather than brute-forcing later rounds
- The "earned checkpoint" feels genuinely satisfying — "I played that round so well I never have to do it again"

**Weaknesses:**
- Punishes struggling players most — the people who need checkpoints most are least likely to earn them
- Can create a death spiral: messy Round 2 → no checkpoint → fail Round 4 → restart from Round 1 → messy Round 2 again
- Threshold design is critical and hard to balance — too generous and everyone earns them, too strict and no one does
- Contradicts the game's ethos of learning through iteration if struggling players spend most of their time replaying rounds they can't clean up

---

## Player Journeys

### Journey 1: Marco, 28, Software Engineer, First Strategy Game

**Context:** Mission 6, first factory mission with Command agent. The mission has 4 rounds of escalating enemy waves. Marco has played Missions 1-5 over two sessions and is comfortable with the workbench but still learning production tuning. His factory blueprint produces scouts and strikers but his relay placement is inconsistent.

**The game uses Model A (Full Gauntlet).**

**Minute 0:00 — The Setup**
Marco opens the Plan screen. The board preview shows an urban Cebu battlefield — tight corridors, high-rise blockers, two enemy spawners on opposite corners. The conveyor belt shows his production queue: Scout → Scout → Relay → Striker → Striker. His Command agent blueprint has hooks wired to `recon-net` and `strike-order` channels. He scans his rule priorities, tweaks the Relay's context config to ignore low-priority signals, and hits EXECUTE.

**Minute 0:10 — Round 1 (Sealed Watch)**
The tick clock begins. His factory hums, producing the first Scout on tick 3. Enemy scouts pour from the northeast spawner. His pre-placed units hold the center. Green signal flashes ripple across the board — `recon-net` is live, his Scout spots the enemy cluster. Context bars on his Relay are half-full, healthy blue glow. Round 1 ends. The board holds. Marco exhales.

**Minute 0:35 — Round 2 (Sealed Watch)**
Second wave, both spawners active now. More enemies. His Striker engages a flanking enemy scout — red flash, one-shot kill, satisfying. But a second enemy approaches from the west. His Relay's context bar flickers amber — it's receiving signals from both his scouts simultaneously. The Relay compresses and forwards, but the Striker acts on stale data, moving to a position the enemy already vacated. The Striker survives, but it's out of position. Marco winces.

**Minute 1:10 — Round 3 (Sealed Watch)**
Three enemy spawners active. Marco's production queue is kicking out Strikers now. But the western flank is weak — his mispositioned Striker from Round 2 is isolated. An enemy striker closes to adjacency. Red flash. His Striker is eliminated. One-shot, one-kill. Then a chain — the enemy pushes through the gap, reaches his Relay. Another red flash. His communication backbone collapses. His remaining units go dark — no signals, no coordination. The Command agent's context window fills with stale entries, no fresh data coming in. It stuns. The enemy reaches his base.

**MISSION FAILED.**

**Minute 1:40 — The Inspector**
The timeline scrubber appears. Marco drags back to tick 22, the moment before his Striker was eliminated. He clicks the Striker — the decision trace shows it moved west because of a `strike-order` signal that referenced a target position from tick 18. The signal was 4 ticks old. The target had moved. The Striker walked into a trap chasing ghost data.

Marco sees the problem: his Relay wasn't compressing timestamps aggressively enough. Stale position data was being forwarded as current. He needs to add a freshness filter — or reduce the Relay's context window to force faster eviction.

He clicks RETRY.

**Minute 2:00 — Back to Plan Screen**
The workbench loads with his previous config. Marco adjusts the Relay's eviction priority: position data older than 2 ticks gets evicted first. He also adds a rule to the Striker: "If signal age > 3 ticks, ignore." He hits EXECUTE.

**Minute 2:10 — Round 1 Again (Sealed Watch)**
The tick clock fires. Round 1 plays out. Marco has already seen this. His scouts spread, his Relay receives signals, everything works. But invisible randomization means the enemy scouts take slightly different paths. The broad strokes are the same but the details differ. Marco watches, arms crossed. He's not bored exactly — the slight variations keep him scanning — but he's *waiting* for Round 3, where his fix lives.

**Minute 2:35 — Round 2 Again**
Similar to before, but the randomization produces a different engagement pattern. His Striker handles the western flank better this time — or maybe the enemy just didn't push as hard. Marco can't tell if his fixes helped here or if the dice rolled differently. This uncertainty nags at him.

**Minute 3:10 — Round 3 Again**
Three spawners. The western push comes again. His Striker receives the signal — and this time, the freshness filter catches the stale data. The Striker *ignores* the outdated position and holds its ground. The enemy approaches, but the Striker is in position. Red flash — enemy eliminated. The Relay survives. The communication backbone holds. Round 3 passes.

Marco pumps his fist. But he had to watch Rounds 1-2 again to get here. Elapsed time from failure to victory: about 3 minutes, of which maybe 90 seconds was re-watching rounds he'd already cleared. For a software engineer used to fast iteration loops, that 90 seconds felt long.

**What Marco learned:** The fix worked, but the slow feedback loop made it feel like guesswork. He couldn't isolate whether his fix helped Round 2 or just Round 3 because invisible randomization changed both.

**UI Annotations:**
- RETRY button: bottom-right of Inspector screen, large, cyan glow, labeled "RETRY MISSION" — no ambiguity about scope
- Sealed watch during replay: identical to first watch, no fast-forward, no skip indicators
- Tick clock: horizontal pips, each round separated by a brief gold flash divider

---

### Journey 2: Priya, 34, Product Manager, Plays Slay the Spire and Into the Breach

**Context:** Mission 8, factory-vs-factory climax. The mission has 5 rounds with escalating enemy production. Priya is a veteran of the campaign, has multiple blueprint configurations saved, and understands channel architecture deeply. She's been iterating on a "deep relay chain" strategy — Scout → Relay → Relay → Command → Striker — that's powerful but fragile due to its 4-tick signal latency.

**The game uses Model C (Rewind Charges) — 2 charges per mission.**

**Minute 0:00 — Pre-Battle Assessment**
Priya examines the Mindanao jungle board. Dense terrain, limited sight lines. She knows her deep relay chain needs open ground for the Scout's wide perception radius to matter. She considers switching to a "flat broadcast" strategy (Scout hooks directly to Strikers, bypassing Relays) but decides her chain is stronger once established. She queues her production: Scout, Relay, Relay, then Strikers. Her Command agent's hooks listen on `compressed-intel` (from the second Relay) and broadcast on `strike-order`.

She notes her 2 rewind charges — displayed as two small golden hourglass icons in the top-right of the Plan screen, glowing faintly. She tells herself: save them for Round 4 or 5.

**Minute 0:15 — Rounds 1-2 (Sealed Watch)**
Round 1 is quiet — both factories warming up. Her Scout deploys tick 3, begins patrolling. Enemy scouts appear on tick 5. Round 2 ramps up — her first Relay deploys, the communication chain begins forming. Enemy strikers probe her perimeter. Her Scout spots them, signals flow through the nascent chain. A few close calls but nothing breaks. Context bars are green across the board.

**Minute 0:50 — Round 3 (Sealed Watch)**
Her second Relay deploys. The full chain is online: Scout → Relay 1 → Relay 2 → Command → Striker. But the 4-tick latency shows its cost. An enemy striker flanks south. Her Scout spots it on tick 31. The signal reaches her Striker on tick 35. In those 4 ticks, the enemy has moved 2 squares. Her Striker engages based on position data from tick 31 — the enemy is no longer there. The Striker whiffs, ends up adjacent to a different enemy. Red flash. Striker eliminated.

Priya's jaw tightens. She considers her rewind charges. Two golden hourglasses pulse gently. She has 2 charges. This is Round 3 of 5. Does she spend one now?

**Minute 1:05 — The Decision**
Priya weighs it: she lost one Striker, but her factory will produce another by Round 4. The chain is intact. The Command agent is rerouting. She decides *not* to spend a charge. The loss is recoverable. She'll save both charges for Rounds 4-5 where the enemy production ramps to full.

This is the strategic layer the Rewind Charge model creates — a meta-decision layered on top of the tactical game. Priya isn't just thinking about her agent architecture; she's thinking about her *failure budget*.

**Minute 1:30 — Round 4 (Sealed Watch)**
Enemy production surges. Three enemy strikers push simultaneously. Her replacement Striker is still in production. Her Scout gets flanked — it evades (evade skill fires), but the evasion puts it outside perception range of the main enemy group. Her chain goes blind. Relay 1's context window fills with stale observations. Amber bars. Then the chain cascades: Relay 2 receives stale compressed data, amplifies it, floods the Command agent. The Command's context bar flashes red — context overload. It stuns for 1 tick. In that tick, an enemy striker reaches her base.

**ROUND 4 FAILED.**

**Minute 1:55 — Rewind Charge Decision**
The sealed watch freezes. A prompt appears center-screen over the frozen battlefield: two golden hourglasses, one glowing (available), one dim (used = none yet, both still available). Text: "REWIND TO ROUND 4? (2 charges remaining)". Below: "RETRY MISSION" in smaller text.

Priya spends a charge. One hourglass dims. She's sent back to the Plan screen — but it's a *constrained* Plan screen. She can only modify blueprints, not the production queue (which is mid-execution). She adjusts the Scout's evade rule: "If evading, prioritize staying within 3 squares of Relay 1." She adjusts the Command agent's context config: increase eviction aggression for signals older than 2 ticks.

**Minute 2:15 — Round 4 Replay**
The sealed watch begins from Round 4's starting state. Same unit positions, same resource count, same context window contents as the checkpoint captured. But invisible randomization means the enemy pushes differently. This time, three enemy strikers push from the northeast instead of spreading. Her Scout stays in range (the new evade rule works), spots the concentrated push, and the chain delivers the signal with only 4 ticks of latency — but because the enemies are clustered, the position data is still roughly accurate. Her Strikers engage. Red flashes. Two enemies eliminated. Round 4 passes.

One charge remaining. One round to go.

**Minute 2:50 — Round 5**
Final wave. Priya watches with her hand hovering near the screen, as if she could intervene (she can't — sealed watch). Her chain holds. The factory produces a third Striker. Overwhelming force meets the final push. The enemy base falls.

**MISSION COMPLETE.** One rewind charge unused.

**Minute 3:10 — The Afterglow**
Priya exhales. The debrief shows: Mission 8 complete, 1 rewind charge used, 1 unit lost (the original Striker in Round 3). She feels a specific satisfaction — not just winning, but the *decision not to rewind Round 3* paying off. She managed her failure budget correctly. The meta-game rewarded her judgment.

**What Priya learned:** The rewind charge wasn't just a safety net — it was a strategic resource. The decision of *when* to use it was as interesting as the blueprint design itself. She also learned that her deep relay chain's latency is a systemic vulnerability that she needs to address architecturally, not just patch with better evade rules.

**UI Annotations:**
- Rewind charges: 2 golden hourglass icons, top-right of Plan screen and sealed watch, glow faintly when available, dim when spent
- Rewind prompt: center-screen overlay on frozen battlefield, hourglass icons with count, "REWIND TO ROUND N?" in gold text, "RETRY MISSION" in dimmer text below
- Constrained Plan screen on rewind: production queue is greyed out and locked (mid-execution), only blueprint parameters are editable, a subtle gold border on the screen reminds the player this is a rewind state

---

### Journey 3: Tomás, 16, High School Student, Plays Mostly Mobile Games and Fortnite

**Context:** Mission 4, the last hand-configured tutorial mission before the factory is introduced. This mission has 3 rounds teaching hook chains. Tomás has been playing in short sessions on his laptop between classes. He understands context windows and rules but hooks are still confusing to him. His attention span for watching sealed battles is limited.

**The game uses Model B (Round-Level Checkpointing).**

**Minute 0:00 — The Setup**
Mission 4's Plan screen shows pre-placed units — 2 Scouts, 1 Relay, 1 Striker — on a Batanes highland battlefield. Rolling green terrain, stone walls, windswept grass tiles. The mission's boot log introduced hooks: "SUBSYSTEM INITIALIZED: Reactive trigger network. When condition X detected → broadcast signal Y." Tomás configured a hook on Scout 1: "When enemy spotted → broadcast on `threat-alert`." The Relay listens on `threat-alert` and forwards to the Striker via `attack-order`. Simple two-hop chain.

**Minute 0:05 — Round 1 (Sealed Watch)**
Two enemy scouts approach from the north. Scout 1 spots them, the hook fires — green flash as `threat-alert` propagates. The Relay receives, context bar ticks up one slot, compresses and forwards on `attack-order`. The Striker receives and moves to engage. Red flash. Enemy eliminated. Clean.

Tomás grins. The hook worked. It felt like watching a Rube Goldberg machine click into place.

**ROUND 1 COMPLETE.** A subtle checkpoint indicator appears: a small diamond icon in the round indicator bar at the top of the screen pulses once, then settles into a solid cyan glow. The round indicator now reads: ◆ ○ ○ (Round 1 checkpointed, Rounds 2-3 pending).

**Minute 0:25 — Round 2 (Sealed Watch)**
More enemies, from two directions. Scout 1 spots the northern group and fires `threat-alert`. But Scout 2 also spots the eastern group — and Scout 2 *doesn't have a hook configured*. It sees the enemies but can't tell anyone. The information dies in Scout 2's context window. The Striker, responding only to the northern threat, moves north. The eastern group flanks unopposed. They reach the Striker from behind. Red flash. Striker eliminated.

**ROUND 2 FAILED.**

**Minute 0:45 — The Inspector**
Tomás scrubs the timeline. He clicks Scout 2 — the context window shows "Enemy spotted: E4" at tick 8, but no hook output. The decision trace says: "No matching hook trigger." The diagnosis is clear even to Tomás: Scout 2 needs a hook too.

**Minute 1:00 — Retry from Round 2**
The failure screen shows: "RETRY FROM ROUND 2?" with the checkpoint indicator showing ◆ (Round 1 saved). Tomás clicks it. He's back in the Plan screen, but only Scout 2's config is highlighted — the game subtly suggests this is where the problem was. He adds a hook to Scout 2: "When enemy spotted → broadcast on `threat-alert`." Same as Scout 1. He hits EXECUTE.

Round 2 replays. Both scouts fire hooks. Both enemy groups are reported. The Relay receives two signals, compresses, forwards. The Striker receives coordinated intel and engages the closer threat first. Both groups handled. Round 2 passes.

**Minute 1:30 — Round 3 (Sealed Watch)**
Full enemy assault. But now both scouts are wired. The hook chain handles multi-directional threats. The Relay's context window fills faster — amber bar, but no overload. The Striker prioritizes targets based on the compressed signal order. The mission concludes with all enemies eliminated.

**MISSION COMPLETE.**

**Minute 1:45 — The Satisfaction**
Tomás completed Mission 4 in about 2 minutes of total play. The checkpoint meant he didn't have to re-watch Round 1 after failing Round 2. For his attention span, this was critical — re-watching a round he already passed would have been a phone-check moment. Instead, the learning loop was tight: fail Round 2 → inspect → fix Scout 2 → retry Round 2 → succeed → Round 3.

But there's a cost Tomás doesn't notice: he never tested whether his Scout 2 hook change affected Round 1's dynamics. In a full gauntlet, adding a second `threat-alert` broadcaster might have caused the Relay's context window to fill faster in Round 1, potentially causing issues. The checkpoint let him skip that interaction test.

**What Tomás learned:** Hooks are necessary on every scout, not just one. The learning was fast and focused. But he learned it as a *local fix* ("Scout 2 needs a hook") rather than a *systemic principle* ("every sensor unit should have broadcast hooks, and the relay must handle the increased signal volume").

**UI Annotations:**
- Checkpoint indicator bar: top of screen during sealed watch, row of diamond shapes (◆ = checkpointed, ○ = pending, ● = current round), cyan for completed, gold pulse for current
- Retry prompt: "RETRY FROM ROUND 2?" in large text, checkpoint diamond visible, "RESTART MISSION" in smaller text below
- Focused Plan screen: on round-level retry, the units whose configs changed between attempts have a subtle gold highlight border, guiding attention to the modification point

---

### Journey 4: Anika, 41, UX Designer, Plays Puzzle Games and Civilization

**Context:** Mission 9, second-to-last mission. Factory-vs-factory on a Manila megacity board. 5 rounds of escalating factory production. Anika has been methodically working through the campaign over two weeks, taking notes in a physical notebook. She prefers slow, deliberate play. She's on her third attempt at Mission 9.

**The game uses Model E (Cascading Checkpoints — earned through clean performance).**

**Minute 0:00 — Third Attempt, The Assessment**
Anika has failed Mission 9 twice. First attempt: collapsed on Round 3 when her relay chain was overwhelmed by enemy signal noise. Second attempt: fixed the noise issue but lost too many units in Round 4's flanking assault. No checkpoints earned either time — her play was functional but messy, too many unit losses.

This attempt, she's rebuilt her architecture from scratch. New approach: two parallel relay chains for redundancy, aggressive context filtering on all units, a Command agent that dynamically reroutes signals based on which relay is less loaded. She's spent 10 minutes on the Plan screen, longer than any previous mission.

**Minute 0:15 — Round 1**
Clean execution. Her redundant relay chains both activate. Scouts broadcast on separate channels (`east-recon`, `west-recon`), each relay chain handles one. No signal collision. Zero unit losses. The round indicator shows a glowing golden checkpoint diamond: ◆. She's earned a checkpoint.

Anika notes in her notebook: "R1 clean. Checkpoint earned. Redundant relays work."

**Minute 0:40 — Round 2**
Enemy production ramps up. Her western relay chain handles the incoming scouts well. But an enemy striker slips through the eastern perimeter — her east Scout evades but the evasion disrupts its patrol pattern. The Scout stops broadcasting for 2 ticks while it repositions. Her eastern relay's context window goes stale. The Command agent, noticing the gap, reroutes the eastern Striker to hold position rather than advance on stale data.

She loses one Striker — an acceptable casualty, but the checkpoint threshold for Round 2 requires zero losses. The round indicator shows: ◆ ○ — Round 1 checkpointed, Round 2 not. If she fails later, she'll restart from Round 1, not Round 2.

Anika frowns. She *passed* Round 2, but she didn't *master* it. The cascading checkpoint system is telling her: "You can do better."

**Minute 1:10 — Round 3**
Without the Round 2 checkpoint, Anika plays with heightened awareness. She's watching her eastern relay chain anxiously. The enemy pressure increases. Her redundant architecture holds — but just barely. The Command agent's context window flickers amber briefly before the eviction policy kicks in. No losses. Checkpoint earned: ◆ ○ ◆.

The checkpoint pattern creates an interesting strategic picture: if she fails Round 4 or 5, she'll restart from Round 3 (the latest checkpoint), not Round 1. But she'll have to replay Round 3 *without* the Round 2 checkpoint behind it — meaning Round 3 starts from the same (slightly messy) state as this attempt.

**Minute 1:40 — Round 4**
The flanking assault that killed her last attempt. Three enemy strikers from three directions simultaneously. Her redundant relay chains struggle — the western chain handles its sector, but the Command agent's rerouting logic creates a priority conflict. Two `strike-order` signals arrive at the same tick, pointing to different targets. Her Striker hesitates — context overload. Stun. One tick frozen. Enemy striker reaches adjacency.

Red flash. Her Striker is eliminated. Then the cascade: the gap in coverage lets another enemy through. Red flash. A Relay is down. Half her communication architecture collapses.

**ROUND 4 FAILED.**

**Minute 2:00 — Checkpoint Restart**
The failure screen shows: "RETRY FROM ROUND 3" — her latest earned checkpoint. Not Round 4 (she didn't earn that checkpoint due to the Striker loss in Round 2's carryover). Not Round 1 (she earned Round 1's checkpoint). The system restarts from the Round 3 checkpoint.

Anika is back in the Plan screen, but with the Round 3 starting state. She can modify blueprints but not undo what happened in Rounds 1-2. She looks at the Command agent's rule set — the priority conflict was the root cause. She adds a tiebreaker rule: "When multiple strike-orders arrive simultaneously, prioritize the *closest* target." She also adjusts the Striker's context config to increase the overload threshold by 1 slot.

**Minute 2:20 — Round 3 Replay → Round 4 Retry**
Round 3 replays cleanly (she earned that checkpoint for a reason — the architecture was sound at this point). Round 4: the flanking assault comes again, but with different timing (invisible randomization). Two strike-orders arrive near-simultaneously, but her new tiebreaker rule resolves the conflict. The Striker engages the closer target. Red flash — enemy eliminated. The second target is picked up by the replacement Striker from the factory queue. Round 4 passes.

**Minute 2:55 — Round 5, Victory**
Final wave. Anika's refined architecture holds. The mission completes. Debrief shows: 2 restarts, 1 checkpoint used, 3 units lost total. Not perfect, but complete.

**What Anika learned:** The cascading checkpoint system rewarded her Round 1 mastery and punished her Round 2 sloppiness, which taught her that *consistency* matters as much as any individual fix. She also experienced the subtle frustration of "I passed Round 2 but didn't earn the checkpoint" — which motivated her to eventually replay Mission 9 for a cleaner run, extending playtime naturally.

**UI Annotations:**
- Checkpoint diamond: earned checkpoints glow gold, unearned show as hollow gray outlines with a subtle "x" through them
- Checkpoint threshold display: at round completion, a brief overlay shows "CHECKPOINT EARNED: 0 losses, all objectives met" (gold) or "CHECKPOINT NOT EARNED: 1 unit lost" (gray, with the specific failure condition listed)
- Restart prompt shows *which* checkpoint you're returning to: "RETRY FROM ROUND 3 (checkpoint)" with the full checkpoint chain displayed: ◆ ○ ◆ ● ○

---

## Interaction Effects

### With the Sealed Watch (No Skip, No Pause)
This is the single biggest interaction. The sealed watch is locked: no skip, no pause, no fast-forward past "solved" rounds. In a full gauntlet model, failing Round 5 of a 5-round mission means re-watching 4 rounds at 1x or 2x speed. At 20 ticks per round at 1 second per tick, that's 80 seconds of sealed watch before the player even reaches the round they care about. At 2x speed, it's still 40 seconds. Over 5 retries, that's 3-6 minutes of mandatory re-watching.

This creates a natural pressure toward *some* form of checkpointing. The sealed watch design was built for single-round missions where the watch is short. Multi-round missions may need a modified sealed watch rule — perhaps "previously checkpointed rounds play at 4x speed" or "checkpointed rounds show a condensed highlight reel" rather than the full tick-by-tick playback.

### With Invisible Randomization
Invisible randomization means replaying from Round 1 isn't pure repetition — enemy behavior varies. This is both a blessing (prevents tedium) and a curse (a config that passed Round 2 last time might fail it this time, even if the player only changed something for Round 3). The randomization makes checkpoint-based retry cleaner because it eliminates the "same seed" question — the checkpoint captures a fixed state, and the randomization only affects what happens *after* the checkpoint.

### With the Inspector (Two-Act Debrief)
The Inspector is designed for post-mission analysis. In a checkpoint model, the Inspector must work at *round* granularity, not just mission granularity. The player needs to inspect the failed round specifically, not the entire mission history. This implies the Inspector should support round-scoped views: "Show me only Round 3's timeline" vs. "Show me the full mission timeline."

### With the 10-Mission Campaign Structure
Missions 1-4 are hand-configured tutorial missions. They're likely short (1-2 rounds) and the retry question is moot — it's a full reset either way. Missions 5-10 introduce factories and multi-round complexity. The retry granularity question really only matters for Missions 5+, which means the game could *introduce* checkpointing as a mechanic alongside factory production, tying it narratively to the AI's increasing capability.

### With One-Shot, One-Kill
Permadeath per round means unit losses compound. A checkpoint captures the loss — retrying from Round 3 with only 2 of your original 4 units is retrying a harder version of Round 3. This can create scenarios where the "right" move is to restart the mission entirely because the checkpointed state is too degraded to salvage. The game should make this explicit: show the player their checkpoint state vs. a fresh start, so they can choose informed.

---

## The Recommendation Space

No single model is universally correct. The right choice depends on which player archetype the game prioritizes:

| Model | Best For | Worst For | Learning Speed | Emotional Stakes |
|-------|----------|-----------|----------------|-----------------|
| A: Full Gauntlet | Holistic thinkers, mastery-oriented players | Impatient players, short sessions | Slow (must replay solved rounds) | Highest (every round matters) |
| B: Checkpoints | New players, short attention spans, accessibility | Players who want systemic testing | Fastest (instant round retry) | Lowest (safety net always available) |
| C: Rewind Charges | Strategic players, Into the Breach fans | Players overwhelmed by meta-decisions | Medium (limited retries force selectivity) | High (charges are scarce, using one hurts) |
| D: Debrief Gate | Analytical players, learning-oriented design | Players who want fast iteration | Medium-slow (forced reflection adds time) | Medium (stakes from process, not consequence) |
| E: Cascading | Perfectionists, completionists | Struggling players, accessibility | Variable (fast if clean, slow if messy) | High (earned checkpoints feel precious) |

**The hybrid approach most aligned with Robot Uprising's design philosophy:** Model C (Rewind Charges) with a dash of Model D (Debrief Gate). The player gets 1-2 rewind charges per mission. Using a charge requires at least viewing the Inspector for the failed round (not a time gate, but the retry button only appears in the Inspector, not during the sealed watch). This preserves emotional stakes, creates a strategic meta-layer, and ensures every retry is informed by analysis.

The sealed watch constraint suggests a further refinement: when rewinding to a previous round, previously-cleared rounds play as a "highlight reel" — a 5-second condensed summary showing key moments (unit deployments, major engagements) rather than the full tick-by-tick sealed watch. This respects the "no skip" philosophy (you still watch *something*) while eliminating the frustration of re-watching 60+ seconds of solved content.

---

## The TikTok Clip

The fifteen-second clip: A player's army is crumbling in Round 4. The sealed watch freezes. Two golden hourglasses appear — they have one charge left. They spend it. The battlefield *rewinds* — units sliding backward, red flashes reversing into living units, signals un-propagating. The Plan screen snaps open. The player tweaks one rule. EXECUTE. Round 4 replays. This time the army holds. The hourglasses are empty. Round 5 begins with zero safety net. The player leans forward. No more do-overs.

The feeling: "I used my last life. Everything rides on this."

---

## Sensory Design Notes

**Rewind charge visual:** Two small hourglasses in the top-right corner, rendered in gold pixel art with sand particles slowly trickling down during the sealed watch. When spent, the hourglass shatters with a crystalline sound — gold particles scatter and fade. The remaining hourglass pulses slightly faster, as if nervous about being the last one.

**Checkpoint earned sound:** A clean chime — two ascending notes, like a xylophone struck with a felt mallet. Brief, warm, unmistakable. The round indicator diamond fills with cyan light from the center outward, a ripple that takes half a second.

**Checkpoint denied sound:** A soft, low tone — not a buzzer or a fail sound, just a flat note that resolves nowhere. The diamond outline briefly flickers gray, then settles into its hollow state. No drama, no punishment — just "not this time."

**Rewind visual:** When the player spends a charge and the game rewinds to a previous round, the battlefield doesn't just cut — it *reverses*. For 2 seconds, the tick clock runs backward, units slide to previous positions, signal lines retract, red combat flashes play in reverse (a dead unit un-dying). The effect is eerie, mechanical, deliberate — like rewinding a cassette tape. Then a sharp vertical wipe transitions to the Plan screen.

**Last charge warning:** When only one rewind charge remains, the single hourglass develops a subtle pulse — a heartbeat rhythm, barely perceptible unless you're looking for it. The gold color shifts slightly warmer, almost orange. The sand trickles faster. The game is whispering: "This is your last chance."
