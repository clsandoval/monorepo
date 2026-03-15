# Co-Op Production Queue Negotiation: Build Order as Diplomacy

**Aspect:** 7.02b — When two players share one production queue (Archon, Specialist, War Room), build order becomes a diplomacy problem; resource allocation as cooperative tension; comparable to Factorio's "you used all the iron" conflict.

**Category:** multiplayer/cooperative
**Wave:** 7 — Multiplayer & Community

---

## The Design Problem

Robot Uprising's production system is a horizontal conveyor belt of blueprint icons. Drag to reorder. Left-to-right = build order. Factory produces units every N ticks from that queue. In single-player, production order is a quiet optimization — you decide whether to build scouts first for intel or strikers first for defense, and the trade-off is personal.

In co-op, the production queue becomes **shared mutable state**. Two players with two different strategies, one queue. Player A wants three scouts for early recon. Player B wants two strikers for immediate defense. The factory can only build one unit at a time. Who goes first?

This is not a minor UI problem. It is the central cooperative tension in every co-op model that shares a factory. The production queue is where abstract architectural disagreements become concrete, visible, and sequential. You cannot compromise on build order — blueprint #1 deploys before blueprint #2. Someone goes first.

The deeper problem: build order decisions are **irreversible in real-time**. Once the factory starts building SCOUT-A, those resources and ticks are committed. If SCOUT-A turns out to be the wrong first unit, you've lost 3 metal and N ticks. In a one-shot-one-kill game where 1 lost tick can be fatal, a wrong build order costs the match. The stakes are high enough that the negotiation matters but not so high that it becomes paralyzing — the sweet spot for cooperative tension.

---

## Which Co-Op Models Share a Queue?

Not all six co-op models (from 7.02) face this problem equally:

| Model | Queue Sharing | Tension Level |
|-------|--------------|---------------|
| **A: Archon** | Fully shared — both drag freely | 🔴 Maximum: silent conflicts, race conditions |
| **B: Specialist** | Shared — Behaviorist controls skills (what units CAN do), Networker controls hooks (how they communicate) — but who controls build ORDER? | 🟡 Ambiguous: neither role cleanly "owns" production |
| **C: War Room** | Architect controls queue; Analyst can suggest via annotation pins | 🟢 Low: clear ownership, but Analyst's suggestions may be ignored |
| **D: Divided Front** | Separate queues — each player has own factory | ⚪ None: no sharing |
| **E: Relay** | One player controls production, other controls communication — production queue IS their domain | 🟢 Low: clear ownership |
| **F: Rotating** | Shared, but only one player has queue access at a time | 🟡 Temporal: disagreements deferred to role-swap moments |

The **Archon** and **Specialist** models produce the deepest tension. The analysis below focuses there, with notes for other models.

---

## Six Approaches to Queue Negotiation

### Approach 1: "The Free-for-All" (No Guardrails)

**How it works:** Both players can drag any blueprint anywhere in the queue at any time. No locks, no turns, no confirmation. If Player A drags SCOUT-A to slot 1 and Player B simultaneously drags STRIKER-B to slot 1, the last mouse-release wins. The other blueprint gets bumped to slot 2.

**What the queue looks like:** A horizontal conveyor belt strip spanning the bottom of the shared workbench. Blueprint icons sit as colored tiles — cyan border for blueprints Player A configured, amber for Player B's. Both players' cursors appear as colored ghosts when hovering the queue area. When a blueprint is being dragged, it lifts with a subtle shadow and the other blueprints slide apart to make room, the gap indicating "this is where it will land." If both players drag simultaneously, both ghosts are visible — and the queue jitters slightly when they target the same slot, a visual cue that conflict is happening.

**The sound:** A soft magnetic *clunk* when a blueprint snaps into position. When two blueprints fight for the same slot, a brief *buzz-click* — like two magnets repelling — before one wins.

**Strengths:**
- Zero overhead. No new UI, no new mechanics. Just the single-player queue with two cursors.
- Captures the Factorio multiplayer feeling. In Factorio, if your partner uses all the iron plates building inserters while you needed them for rails, you discover it when your construction fails. The friction is emergent, not designed. This approach trusts players to negotiate verbally rather than through UI guardrails.
- Fastest iteration speed. Players don't wait for permission.

**Weaknesses:**
- **Race condition grief.** A player can silently rearrange the queue right before EXECUTE. The other player doesn't notice because they're focused on their blueprint editor. The battle starts with the wrong build order.
- **No accountability.** After a loss, both players say "I thought we agreed scouts first." No record of who moved what when.
- **StarCraft II Archon Mode's exact problem.** "A player could be trying to save up resources to place a building, but the other may unwittingly use it all up." The SC2 community consensus: this kills the mode for equally-skilled pairs.

**Comparable:** StarCraft II Archon Mode (shared production with no restrictions — "Its appeal, and perhaps its greatest flaw, is it simply hands over control of a base to two players"). Google Docs simultaneous editing without track changes.

---

### Approach 2: "The Proposal" (Drag-to-Suggest, Click-to-Accept)

**How it works:** Either player can drag a blueprint to propose a new queue position. The proposed change appears as a translucent ghost — the blueprint's current position stays solid while its proposed new position renders at 50% opacity with a dashed border. The other player sees a subtle notification pulse on the queue: "Player B proposed: STRIKER-B → Slot 1." They click ✓ to accept or ✗ to reject. If accepted, the blueprint slides smoothly to its new position with a satisfying *schink* (a ratchet-lock sound, like a conveyor belt advancing one notch). If rejected, the ghost dissolves with a soft *pfft* and a small amber "✗" floats up and fades.

**What the queue looks like:** The conveyor belt with an overlay layer. Solid blueprints represent the current agreed-upon order. Ghost blueprints with dashed amber or cyan borders represent pending proposals. A small counter badge on the queue reads "2 proposals pending" when multiple changes are queued. Proposals stack visually — if both players propose moving blueprints to slot 1, both ghosts overlap there with a small "(conflict)" label.

**Proposal notification design:** When a proposal arrives, the queue's border briefly pulses in the proposer's color (cyan or amber). A small tooltip rises from the proposed position: "↑ Move SCOUT-A here? — Player A" with ✓/✗ buttons. The tooltip persists until answered or until EXECUTE is pressed (at which point all pending proposals are force-rejected and the current order is locked).

**Strengths:**
- **Prevents silent changes.** Every queue modification requires explicit consent from both players.
- **Creates a conversation trigger.** The proposal tooltip is a designed prompt for "hey, I want to move this — here's why." The UI creates moments of negotiation.
- **Audit trail.** The stream of proposals and responses is visible. After a loss, the Inspector could show "Queue changes: Player A proposed SCOUT-A → 1 (accepted), Player B proposed STRIKER-B → 2 (rejected, counter-proposed → 3, accepted)."
- **Git pull request energy.** Propose → review → merge. The exact workflow the game claims to teach.

**Weaknesses:**
- **Friction.** Every small reorder requires the other player's attention. If Player A wants to swap positions 3 and 4, they have to wait for Player B to notice and approve. This is annoying for low-stakes changes.
- **Proposal fatigue.** In a complex build with 8+ blueprints, the number of proposals explodes. Players start auto-approving to clear the backlog, defeating the purpose.
- **Asymmetric attention cost.** The proposer acts quickly (drag). The reviewer bears the cognitive load (evaluate, decide, click). This is the code-review problem: reviews are slower than writing.

**Mitigation:** Auto-approve for moves in positions 4+ (low priority slots). Only require confirmation for the top 3 slots, where order matters most.

---

### Approach 3: "The Alternating Draft" (Take Turns Placing)

**How it works:** The production queue starts empty. Players take turns placing blueprints into the queue. Player A places one blueprint. Then Player B. Then Player A. And so on. The queue fills from left to right. Once placed, a blueprint cannot be moved — its position is locked.

**What the queue looks like:** The empty conveyor belt has numbered slots with dashed outlines: [1] [2] [3] [4] [5]... The active player's slot pulses in their color (cyan or amber). An arrow indicator and small text says "Player A — place a blueprint." Player A drags a blueprint from the workbench into any empty slot (not necessarily slot 1 — they might skip to slot 3, leaving 1 and 2 for Player B). After placement, the slot solidifies with the player's color border and the indicator shifts: "Player B — your turn."

**The draft timer:** An optional sand-timer visual — a thin vertical bar on the side of the queue that drains over 30 seconds per pick. If a player doesn't place in time, their turn is skipped (that slot goes to the other player). The draining timer audibly ticks — a soft metronome at 1-second intervals, accelerating to 0.5-second ticks in the last 10 seconds. Time pressure prevents over-deliberation while leaving room for thought.

**Strengths:**
- **Fair by construction.** Each player gets exactly 50% of the queue positions. No race conditions. No silent changes.
- **Creates strategic depth.** Placement order becomes a mini-game. Do you take slot 1 (ensure your unit deploys first) or slot 3 (save the early slots for your partner's scouts)? The draft itself teaches cooperative strategy.
- **Familiar pattern.** Tabletop gamers recognize this immediately — it's a snake draft. Slay the Spire 2's co-op uses a shared card draft where "you want everyone to get what they need, but often you need to decide which player needs the card(s) more."
- **Mechs vs. Minions precedent.** Their shared card draft ("4 cards total, your power level stays the same regardless of number of players") proves that cooperative drafting creates satisfying team dynamics.

**Weaknesses:**
- **Rigid.** Once placed, you can't reorder. If you realize mid-draft that your partner's placement changes your optimal strategy, you're stuck. The draft doesn't allow iteration.
- **Slow.** For a 6-unit queue, the draft requires 6 turns (3 each). If each turn takes 15 seconds, that's 90 seconds just for build order — before any actual blueprint configuration.
- **Penalizes flexible players.** A player who says "I don't care about order, just let me configure" is still forced through 3 placement turns. The draft adds ceremony to a non-problem for some pairs.
- **Slot-skipping is confusing.** If Player A places in slot 3, leaving 1-2 empty, does Player B understand they should fill those? Or do they interpret it as "Player A doesn't want early units"? The signal is ambiguous.

**Comparable:** Mechs vs. Minions shared card draft. Slay the Spire 2 cooperative card selection. NFL draft. Civilization leader/wonder pick in multiplayer. Fantasy football snake draft.

---

### Approach 4: "The Budget Split" (Resource Allocation as Negotiation)

**How it works:** Instead of sharing one queue, each player gets a personal resource budget. Total resources per cycle are split — not necessarily 50/50. A negotiation slider at the top of the Plan screen divides the factory's per-tick income. Player A drags the slider left to claim 70% of income. Player B sees the slider move and can drag it back. The slider settles wherever both players agree (or wherever the last person to touch it left it before EXECUTE).

Each player builds their own queue from their budget. Both queues feed into the same factory, but the factory alternates: build one unit from Player A's queue, then one from Player B's, round-robin. Or — if Player A has 70% of the budget, the factory builds from Player A's queue 70% of the time (e.g., 2 of every 3 units).

**What the budget slider looks like:** A horizontal bar spanning the width of the queue area. Cyan fill on the left, amber on the right. A diamond-shaped handle in the middle, draggable by either player. Numbers display on each side: "Player A: 7 metal/cycle" | "Player B: 3 metal/cycle". When the slider is being dragged, the numbers update in real-time with smooth counting animations. The handle wobbles slightly when both players grab it simultaneously — a tug-of-war visual.

**The factory interleaving visualization:** Below the budget bar, two parallel mini-queues (cyan and amber) merge into a single interleaved output queue. The merge pattern is shown explicitly: if the split is 70/30, the output reads [A][A][B][A][A][B]... with alternating color tiles. This makes the production cadence legible before EXECUTE.

**Strengths:**
- **Negotiation IS the mechanic.** The slider is the simplest possible representation of cooperative resource tension. It's a single degree of freedom that captures the entire "how much do we each get" question.
- **Flexible asymmetry.** If one player has a more expensive strategy (Command agents cost 10m), they can argue for a larger share. The game supports unequal contributions by design.
- **Teaches resource allocation.** Real engineering teams negotiate compute budgets, headcount, and sprint capacity. The slider is a literal resource negotiation tool.

**Weaknesses:**
- **Doesn't solve build ORDER.** Even with separate budgets, the interleaving pattern determines which unit deploys when. If Player A needs SCOUT-A out before Player B's STRIKER-B, the interleave must accommodate. Budget split solves "how much" but not "what first."
- **Slider wars.** A passive-aggressive player can silently drag the slider to 90/10 right before EXECUTE. Same silent-conflict problem as Approach 1.
- **Factory complexity.** Interleaved production from two queues adds mechanical complexity. The single-player factory is already the most complex screen in Mission 5. Co-op shouldn't double that complexity.

**Comparable:** Factorio's implicit resource allocation ("you used all the iron" is the canonical Factorio co-op friction moment). Board game negotiation mechanics (Settlers of Catan resource trading, Diplomacy). Real engineering sprint capacity allocation.

---

### Approach 5: "The War Council" (Deliberation Phase + Commit)

**How it works:** Before the main Plan phase, a dedicated 60-second "War Council" phase for production planning. Both players see the empty queue, the mission's threat briefing, and each other's blueprint roster. They discuss verbally and collaboratively fill the queue during this phase. Either player can place or move blueprints freely during the War Council. At the end, both players must press CONFIRM — a split confirmation bar (like the Specialist's Ready Check) fills from both sides, meeting in the middle. Once both confirm, the queue LOCKS. During the main Plan phase, the queue is read-only. Players can configure blueprint details (skills, rules, hooks, context) but cannot change build order.

**What the War Council looks like:** A dedicated screen — NOT the full Plan workbench. The center of the screen shows the production queue at large scale, horizontal, occupying the full width. Above it: the mission briefing panel (threat type, enemy spawner positions, terrain). Below it: both players' available blueprints in two rows (cyan / amber). Blueprint cards show unit type, cost, and a one-line summary of current configuration. No detailed config editing is possible — just placement and ordering.

The background is darker than the Plan screen — a moodier, more deliberate atmosphere. A circular timer at the top counts down from 60 seconds. The timer's ring is split: cyan on the left half, amber on the right. As time passes, both halves shrink simultaneously. At 15 seconds remaining, the ring turns amber and the tick sound accelerates. At 5 seconds, it pulses red.

**The confirmation ceremony:** When both players press CONFIRM, their respective halves of a split progress bar extend toward the center. Cyan from left, amber from right. When they meet, a brief flash — a *lock-snap* sound, like a vault closing — and the queue tiles gain a metallic sheen. The transition to Plan screen begins: the queue shrinks and slides down to its normal position at the bottom of the workbench. The message: "Production order locked. Configure your agents."

**Strengths:**
- **Temporal separation.** Build order negotiation happens BEFORE detailed configuration. This prevents the common failure where players configure blueprints for 5 minutes and then realize they disagree about build order — invalidating configuration work.
- **Time-boxed negotiation.** The 60-second timer prevents infinite deliberation. Space Alert proved that cooperative games need time pressure to prevent quarterbacking: "It completely sidetracks the quarterbacking problem because no one can know enough information in the required time." 60 seconds is long enough for meaningful discussion but short enough to feel urgent.
- **Lock prevents late-stage grief.** Once confirmed, the queue cannot be modified. This eliminates the "silent rearrange before EXECUTE" problem entirely.
- **Teachable moment.** The War Council is where cooperative strategy crystallizes. "I think we need scouts first because of the wide-open terrain" — this is the conversation the game wants to generate. The dedicated phase tells players: this decision matters enough to have its own screen.
- **The confirmation ceremony feels good.** The split progress bar meeting in the middle is a visceral "we're aligned" moment. It's a small ritual of agreement that reinforces cooperative identity.

**Weaknesses:**
- **Extra phase.** The game already has three screens (Plan, Watch, Inspector). Adding a War Council phase makes four. Players who don't care about co-op production order still have to sit through it.
- **Configuration dependency.** Build order sometimes depends on blueprint configuration. "If I give SCOUT-A the compress skill, it should deploy first to set up relay chains early." But you can't see detailed config in the War Council phase, because config happens in Plan. Circular dependency.
- **60 seconds may be wrong.** Too short for new players learning the system. Too long for veterans who agree in 5 seconds. Dynamic timer? First co-op missions get 90 seconds, later missions 45?

**Comparable:** Space Alert's two-phase structure (real-time action programming → deterministic resolution, exactly Plan → Watch). Board game "planning phases" (Mechs vs. Minions' drafting round). Military war room briefings. Sprint planning meetings. DOTA 2's draft phase (hero selection with timer, separate from gameplay).

---

### Approach 6: "The Progressive Protocol" (RECOMMENDED — Escalating Structure)

**How it works:** Co-op production negotiation evolves across the campaign, mirroring the progressive disclosure philosophy throughout Robot Uprising's design:

**Phase 1 — Missions 5-6: Free-for-All.** When co-op production is first introduced, both players drag freely (Approach 1). The queue is simple (3-4 units). Disagreements are small. The game trusts verbal negotiation. If conflict causes a loss, the Inspector reveals it: "STRIKER-B deployed at tick 8 — too late to intercept the east push. SCOUT-A deployed at tick 2 but had no relay to report to. Build order mismatch detected." The diagnostic names the problem without imposing a solution.

**Phase 2 — Missions 7-8: Proposal System.** The queue grows to 5-6 units. Complexity requires guardrails. The boot log introduces proposals diegetically: "SUBSYSTEM UPGRADE: Production planning protocol initialized. All queue modifications now require mutual authorization." Both players see the ghost-proposal overlay. The proposal system teaches code-review habits — propose, discuss, approve.

**Phase 3 — Missions 9-10: War Council + Lock.** Full queue with 7-8 units. The dedicated War Council phase appears. "TACTICAL PLANNING MODULE: Production Council initiated. 60-second coordination window. Commit required from both command threads." The split confirmation bar appears. The queue locks after confirmation. Players learn that high-stakes decisions deserve deliberate planning phases.

**Phase 4 — Gauntlet: Player Choice.** Competitive co-op players can toggle between any negotiation mode in Gauntlet settings. Some pairs prefer speed (Free-for-All). Some prefer structure (War Council). Gauntlet respects player autonomy — the campaign taught the tools, now the players choose which to use.

**What the progression looks like across sessions:**

Session 1 (Mission 5, Free-for-All): The queue is a simple conveyor belt. Both cursors drag freely. It works because there are only 3 blueprints. They argue about whether SCOUT or RELAY goes first. They pick wrong. The Inspector shows why. They laugh and retry.

Session 4 (Mission 7, Proposals): The queue has 5 blueprints. Player B drags STRIKER-C to slot 1. A translucent ghost appears. Player A sees: "Player B proposes: STRIKER-C → Slot 1." Player A thinks, frowns, clicks ✗. Types in chat: "We need vision first. Let me put SCOUT-A in slot 1." Proposes. Player B approves. The queue settles. Both press READY for Sealed Watch.

Session 8 (Mission 10, War Council): A new screen appears — darker, more deliberate. The circular timer counts down from 60. Both players stare at the mission briefing: "Factory vs. factory. Enemy spawner at H8. Terrain: volcanic, Taal." Player A says: "Triple relay first for deep intel. Then strikers." Player B: "No — we need a strike team to pressure their spawner early. Scouts, then strikers, relays can wait." The timer reads 42 seconds. They compromise: SCOUT-A, STRIKER-B, RELAY-C, STRIKER-D. Both press CONFIRM. The split bar extends, meets in the middle. *Lock-snap.* The screen transitions to Plan. They have 60 seconds of agreement and 10 minutes of configuration ahead.

**Strengths:**
- **No front-loaded complexity.** New co-op players aren't hit with a War Council on their first factory mission. The system grows with their skill.
- **Teaches negotiation progressively.** Free-for-All teaches "this matters." Proposals teach "we should agree." War Council teaches "complex plans deserve dedicated planning time." Each stage is a lesson in cooperative engineering practices.
- **Matches the game's pedagogical identity.** The entire game teaches agentic engineering through play. Production negotiation teaches project management through play. Sprint planning, resource allocation, mutual commit — these are real skills.
- **Campaign → Gauntlet flexibility.** Campaign teaches all three modes. Gauntlet lets players pick their preferred mode. This prevents Gauntlet co-op from being one-size-fits-all.

**Weaknesses:**
- **Implementation cost.** Three different negotiation UIs that must all be maintained and bug-tested.
- **Tutorial burden.** Each new mode needs its own boot log introduction and first-encounter guided experience.
- **Risk of regression.** Players who learned War Council might revert to Free-for-All in Gauntlet because it's faster, never actually using the discipline the campaign taught.

---

## The "You Used All the Iron" Moment

Every co-op production system needs its **canonical failure moment** — the first time the shared queue goes wrong in a way that both players remember. In Factorio multiplayer, this is universally described as "you used all the iron" — one player builds too many inserters, draining the iron plate supply just as the other player needs rails. In StarCraft II Archon Mode, it's "I was saving for a Command Center and you built ten Marines."

In Robot Uprising, the canonical moment should be: **"Your striker deployed first and died immediately because my relay wasn't built yet."**

The scenario: Player A wants STRIKER-B early for defense. Player B wants RELAY-C early for intel distribution. Player A drags STRIKER-B to slot 1. The factory builds it first. STRIKER-B deploys at tick 4. But there's no relay yet — the scout's intel has no path to the striker. The striker moves blindly. Walks into an enemy. One-shot-one-kill. STRIKER-B is gone before RELAY-C even finishes production at tick 7.

In the Inspector, the decision trace is devastating: "STRIKER-B, Tick 6: No context entries. Context window empty. Rule 'IF enemy_detected → engage' could not evaluate — no enemy data in context. Default action: patrol. Moved to D5. Adjacent to ENEMY-01. Eliminated."

The empty context window is the proof. Not "the striker was weak" — "the striker was blind." The relay would have given it sight. Build order killed it.

This moment teaches: **in a system where units depend on each other's information, deployment order is a dependency graph, not a preference list.**

---

## Interaction Effects

### With Channel Naming (7.02a)
Production queue negotiation and channel naming are the two co-op coordination surfaces. They interact when build order depends on communication architecture: "RELAY-C must deploy before STRIKER-B because STRIKER-B listens on 'threat-east' which only exists when RELAY-C's hooks create it." The production queue enforces temporal ordering. Channel naming enforces semantic agreement. Both must be aligned. The War Council phase naturally includes channel discussion: "What channels are we using?" comes up when deciding build order.

### With EM Emissions Model (Locked)
Build order affects EM visibility. Deploying relays first creates early EM noise — enemies detect the communication network being built. Deploying scouts first is quieter but leaves the communication backbone un-built when intel arrives. The production queue is an implicit stealth-vs-intel tradeoff. In co-op, this tradeoff becomes a negotiation: one player may prefer stealth (scouts first), the other may prefer infrastructure (relays first).

### With Sealed Watch (Locked)
The sealed watch's "no skip, no pause" rule means build-order mistakes are experienced as slowly unfolding consequences. You don't just see "striker deployed too early" as a stat — you watch the striker standing alone, context window empty, for 3 ticks before the relay finishes. The emotional weight of the mistake scales with viewing time. This is why the sealed watch exists: it makes abstract decisions (build order) concrete and painful.

### With Inspector (Locked)
The Inspector's decision trace makes production order mistakes legible. "Context window empty at tick 4 because RELAY-C hadn't deployed yet" is a precise, blame-free diagnosis. Critically, it blames the BUILD ORDER, not either player. This is important for co-op health: the diagnostic system should surface structural causes, not personal fault.

### With Campaign Arc (Locked)
Missions 1-4 have pre-placed units — no production queue, no negotiation. Mission 5 introduces the factory. In co-op, Mission 5 is the first time players face shared production. The transition from "I configure what's given" to "we choose what to build and when" is a cooperative milestone that deserves narrative acknowledgment (boot log: "PRODUCTION SYSTEM: Dual-thread coordination required. Consensus protocol initializing.").

### With Competitive Co-op (7.02c: 2v2)
In 2v2, production queue negotiation becomes a competitive advantage. A well-coordinated pair that agrees on build order in 10 seconds has more Plan phase time for detailed configuration than a pair that argues for 45 seconds. The War Council timer becomes a competitive meta-resource. Pair synergy in production planning = faster iteration = better configs = wins.

---

## Player Journeys

#### Journey: Marcus, 35, Software Engineering Manager

**Context:** Mission 7 co-op (Specialist model). Marcus is the Behaviorist (skills + rules). His partner Keiko is the Networker (hooks + context). They've played 3 co-op sessions together. This is their first mission with the Proposal system.

**Minute 0:00 — War Briefing**
The mission loads. Cebu city terrain. Enemy spawner at G7, their factory at B2. The threat briefing reads: "Adversary behavior: fast scout swarm. Expect early probes from tick 3." Marcus reads aloud. Keiko nods. Both enter the Plan screen.

**Minute 0:20 — The Queue Disagreement**
Marcus looks at the production queue. Five empty slots on the conveyor belt at the bottom of the shared workbench. He thinks: fast enemy scouts means we need strikers early for defense. He drags STRIKER-B to slot 1. A translucent ghost appears — cyan-bordered, half-opacity, dashed outline. Keiko's screen flashes: a subtle amber pulse on the queue border. A tooltip rises: "↑ STRIKER-B → Slot 1? — Marcus" with ✓ and ✗ buttons.

Keiko frowns. "If we lead with a striker, it'll be deaf. We need RELAY-C first to wire up the threat channel." She clicks ✗. The ghost dissolves with a soft *pfft*. A tiny "✗" floats up from slot 1 and fades.

**Minute 0:45 — The Counter-Proposal**
Keiko drags RELAY-C to slot 1. Her amber ghost appears. Marcus sees the notification: "↑ RELAY-C → Slot 1? — Keiko." He hesitates. Relay first means no combat capability until tick 7 at least. But he remembers last session — the striker that deployed blind and walked into an enemy. "Context window empty" in the decision trace. That image burns.

He clicks ✓. The ghost solidifies with a *schink*. RELAY-C is locked into slot 1. The conveyor belt's first tile fills with the 📡 icon, amber-bordered.

**Minute 1:10 — The Compromise**
Marcus proposes: STRIKER-B → slot 2, SCOUT-A → slot 3. Two ghosts appear simultaneously. Keiko approves STRIKER-B immediately (✓) — she understands the need for early defense once the relay is up. She pauses on SCOUT-A. "Slot 3 is late for recon. Can we swap SCOUT-A and STRIKER-B?" She rejects SCOUT-A at 3 (✗), proposes SCOUT-A → slot 2 and STRIKER-B → slot 3.

Marcus considers. Earlier scout means earlier intel. Later striker means later defense. But the relay will be up by the time the scout reports — the chain works. He approves both.

The queue reads: [📡 RELAY-C] [👁 SCOUT-A] [⚔ STRIKER-B] [???] [???].

**Minute 1:40 — The Remaining Slots**
Slots 4-5 go quickly. Marcus proposes a second striker, Keiko proposes a specialist for hacking. Both approve each other's pick without debate — the critical ordering is settled, lower-priority slots are less contested. The queue fills.

**Minute 5:00 — Sealed Watch**
The factory produces RELAY-C at tick 2. It's stationary, positioned at C3, already listening. SCOUT-A deploys tick 4, immediately begins patrol. At tick 6, the scout detects an enemy. Keiko's hooks fire — signal travels through the relay on "threat-east." STRIKER-B, freshly deployed at tick 6, receives the signal at tick 8. Its context window has one entry: "threat-east: enemy at F5." Marcus's rule activates: `IF enemy_detected → engage`. The striker moves toward F5. Two ticks later — kill flash.

Both players exhale.

**Minute 8:30 — Inspector Debrief**
Marcus clicks STRIKER-B in the Inspector. The context window chart shows: empty until tick 8, then a single green bar — the "threat-east" signal. The decision trace: "Rule 1 matched at tick 8: enemy_detected TRUE (source: threat-east, age: 2 ticks). Action: engage. Target: F5."

Keiko points at the age: "Two ticks old. The scout saw it at tick 6, relay forwarded at tick 7, striker received at tick 8. Two-hop latency." Marcus: "If we'd put the striker first like I wanted, it would have been at F5 already at tick 6 — but blind. It would have engaged the wrong direction." Keiko: "Or it would have been dead."

Marcus screenshots the decision trace. He'll use it in his next engineering standup to explain why deployment ordering matters.

**UI Annotations:**
- Queue proposal tooltip: rises from queue slot, shows unit icon + player name + ✓/✗ buttons, persists until answered
- Proposal ghost: 50% opacity, dashed border in proposer's color (cyan/amber), slides into position with other blueprints making room
- Rejection animation: ghost dissolves over 300ms, small "✗" floats up 20px and fades over 500ms
- Acceptance animation: ghost solidifies over 400ms, *schink* ratchet sound, border becomes solid in proposer's color
- Queue conflict indicator: when two ghosts target same slot, both jitter ±2px at 8Hz for 500ms

---

#### Journey: Aisha, 14, First Strategy Game — Plays with Older Brother Dayo, 17

**Context:** Mission 5 co-op (Archon model). First factory mission. Free-for-All queue negotiation. Aisha and Dayo sit at the same computer, split-screen view, both with mice connected (one Bluetooth, one USB).

**Minute 0:00 — Factory Introduction**
The boot log plays: "PRODUCTION SYSTEM: Factory subsystem initialized. Blueprint queue detected. Resource allocation: 10 metal base, 2 metal per tick. Build directive: units will be constructed in queue order. First slot builds first." Aisha reads along, mouthing the words. Dayo skims — he's played Factorio.

The Plan screen shows the workbench with three blueprint slots (simplified for Mission 5). The empty conveyor belt at the bottom has three numbered positions: [1] [2] [3]. Both cursors are visible — Aisha's is cyan (a small diamond), Dayo's is amber (a small circle).

**Minute 0:30 — The Race**
Dayo immediately drags SCOUT-A to slot 1. He knows recon comes first from Factorio. Aisha hasn't processed the screen yet. She sees Dayo's amber cursor move, the scout icon sliding into slot 1, and the *clunk* of placement. "Wait, why the scout?" she asks. "We need eyes first," Dayo says, already dragging RELAY-C to slot 2.

Aisha feels left out. She grabs STRIKER-B — the only blueprint left — and drags it to slot 3. It's the only slot available. She didn't really choose; she got the remainder.

**Minute 1:00 — Aisha's Discomfort**
They press EXECUTE. The battle plays. Scout deploys, relays deploy, striker deploys last. The mission completes successfully — Mission 5 is designed to be clearable with most build orders. But Aisha feels like she didn't contribute. Dayo placed 2 of 3 units. She placed the leftover.

**Minute 3:00 — Inspector Discovery**
In the Inspector, Aisha clicks STRIKER-B (her unit). The context window chart shows it received signals late — by the time it deployed, the scout had already cleared the southern enemy. STRIKER-B had one engagement at tick 12, at the edge of the map. "My striker barely did anything," she says.

Dayo: "That's because it deployed last. If it had been slot 1, it would have been out there fighting while we were still building the relay." Aisha: "So slot 1 matters?" Dayo: "Yeah, slot 1 is the most important one."

**Minute 4:00 — Retry: Aisha Takes Slot 1**
They retry. This time Aisha moves fast — she drags STRIKER-B to slot 1 before Dayo can react. Dayo's hand pauses on the mouse. He wants to say "scouts first" but sees Aisha's expression — determined, invested. He nods. Places SCOUT-A at slot 2, RELAY-C at slot 3.

The battle plays differently. Striker deploys early, blind, but aggressive. It stumbles into an enemy at tick 5 — no intel, no relay, just proximity detection. Kill flash! Aisha pumps her fist. But at tick 8, a second enemy approaches from the east. The striker's narrow perception (2 tiles) doesn't see it. The scout, deployed at tick 6, spots it but has no relay to forward the intel. The striker walks into the second enemy blind. Eliminated.

"Oh no," Aisha says. "Why didn't it see the second one?"

**Minute 6:00 — The Lesson**
In the Inspector, the decision trace for STRIKER-B at tick 8 reads: "No relevant context entries. Rule 'IF enemy_detected → engage' did not match. Default: patrol. Moved to E5. Adjacent to ENEMY-02. Eliminated." The context window chart: one green entry at tick 5 (direct perception of ENEMY-01), then empty.

Dayo points at the empty chart. "See? No relay means no long-range intel. The scout saw the enemy at tick 7 but had no way to tell the striker." Aisha stares at the empty context slots. "So Dayo... scouts first IS better." Dayo grins. "Want to try again? Your call on the order this time."

Aisha thinks. "Scout first. Then relay. THEN my striker." She places them herself this time — all three, deliberately, one by one. Dayo watches, hands off the mouse.

**Minute 8:00 — Third Attempt**
Build order: SCOUT-A, RELAY-C, STRIKER-B. Scout deploys, patrols, spots both enemies. Relay forwards on "threat" channel. Striker deploys at tick 6 with full context: two enemy positions in its context window. It engages the closer one first, then turns to the second. Two clean kills. Mission complete.

Aisha turns to Dayo: "The robots need to TALK to each other first. Then fight."

**UI Annotations:**
- Dual cursors: Aisha's cyan diamond (8px), Dayo's amber circle (8px), both always visible on shared screen
- Free-for-all drag: no proposals, no confirmation, last-release-wins, other blueprints slide to accommodate
- Mission 5 simplified queue: only 3 slots, visually larger than later missions, generous spacing
- First-placement celebration: tiny confetti burst (3 particles) when a player places their first-ever blueprint in the queue

---

#### Journey: Kwame, 32, Twitch Streamer — Co-op with Chat-Picked Partner

**Context:** Mission 10 co-op stream event. Kwame (experienced, 150+ hours) pairs with Lucia (competitive Gauntlet player, 200+ hours). War Council mode. 847 viewers.

**Minute 0:00 — War Council Opens**
A new screen fades in — darker than the Plan screen, moodier. The circular 60-second timer at the top begins counting down, its split ring (cyan left, amber right) slowly shrinking. The mission briefing dominates the upper third: "TAAL VOLCANO. Factory vs. factory. Adversary: adaptive, multi-phase. Eliminate enemy base."

The empty production queue stretches across the center, 8 numbered slots with dashed outlines. Below it, two rows of available blueprints: Kwame's (cyan) on the left, Lucia's (amber) on the right. Blueprint cards show unit type, cost, and key skill loadout. The stream overlay shows both players' webcams in picture-in-picture.

Kwame addresses chat: "Alright, the final boss. Taal volcano. Factory vs. factory. We've got 60 seconds to plan our build order. Lucia, what's your read?"

**Minute 0:10 — The Disagreement**
Lucia speaks immediately: "Economy first. Three relays, then a command agent, then strikers. We outscale them with information advantage." She starts dragging RELAY-C to slot 1.

Kwame: "Wait wait wait. Taal is volcanic terrain — enemy scouts are going to rush us. We need a striker in slot 1 for defense. If they get a snipe on our factory, the economy plan is dead."

The timer reads 48 seconds. Chat explodes:
- "ECONOMY ANDY vs. RUSH DEFENDER"
- "lucia is right macro > micro"
- "kwame remembers the mission 8 factory snipe rip"

**Minute 0:25 — The Negotiation**
Lucia pauses her drag. RELAY-C hovers in limbo, not yet placed. "Okay, what about a compromise — SCOUT-A slot 1 for early warning, then RELAY-C slot 2, THEN a striker. The scout is cheap, deploys fast, and gives us vision of a rush."

Kwame considers. The timer reads 35 seconds. He looks at SCOUT-A's cost: 3 metal. Fast to build. Wide perception. "That works. Scout-relay-striker. But I want TWO strikers before the command agent." He drags SCOUT-A to slot 1. *Clunk*.

Lucia: "Deal. Scout, relay, striker, striker, command, then more relays." She fills slots 2-4. Kwame fills 5-8. The queue reads:
[👁 SCOUT-A] [📡 RELAY-C] [⚔ STRIKER-B] [⚔ STRIKER-D] [🤖 COMMAND-A] [📡 RELAY-E] [📡 RELAY-F] [⚔ STRIKER-G]

The timer reads 12 seconds. Both review.

**Minute 0:50 — The Commit**
Lucia presses CONFIRM. Her half of the split bar extends from the right — amber filling halfway. Kwame glances at the queue one more time. 6 seconds. He presses CONFIRM. Cyan extends from the left. The two halves meet in the center. A bright flash. *Lock-snap*. The queue tiles gain a metallic sheen.

Chat: "🔒🔒🔒 LOCKED IN" "that was TENSE" "the split bar meeting in the middle is so satisfying"

**Minute 1:00 — Plan Phase Begins**
The War Council screen dissolves. The queue shrinks and slides down to its normal position at the bottom of the Plan workbench. Kwame and Lucia begin configuring blueprints. The queue is grayed slightly — still visible, but uneditable. A small "🔒 Committed" label sits above it.

**Minute 12:00 — Sealed Watch**
The factory starts building. SCOUT-A deploys tick 2. Immediately patrols toward the enemy side. At tick 4 — enemy scout spotted approaching from the east. Kwame: "THERE'S THE RUSH. Called it!" RELAY-C deploys tick 5, receives the scout's alert, compresses, forwards. STRIKER-B deploys tick 7, receives forwarded intel, moves to intercept. Kill flash at tick 9.

Chat: "if they'd gone economy first the rush would have killed the factory" "kwame the prophet" "lucia's relay was the real MVP tho — striker would be blind without it"

The battle escalates. By tick 20, both factories are producing. The enemy adapts — switches from rush to noise flooding. Kwame and Lucia's deep relay network handles it. The command agent deploys at tick 15, begins rerouting signals. By tick 40, their information architecture overwhelms the enemy's flat signal chain.

Lucia: "See? Economy wins in the end." Kwame: "But my early striker bought you the time to set it up." They fist-bump.

**Minute 18:00 — Victory and Post-Game**
Enemy base eliminated at tick 52. Both players stand up. 847 viewers. Chat erupts with a wall of "GG" and "SYNERGY." Kwame clips the War Council negotiation — the 60-second timer, the disagreement, the compromise, the split-bar commit ceremony. He titles it: "60 seconds to agree or we both lose."

The clip gets 23K views in 48 hours.

**UI Annotations:**
- War Council screen: darker background (#1a1a2e), mission briefing panel top-third, queue center, blueprint rosters bottom
- Circular timer: split cyan/amber ring, 60s countdown, accelerating tick sound at 15s, red pulse at 5s
- CONFIRM split bar: each player's half fills independently, meeting in center triggers flash + lock-snap sound
- Locked queue indicator: slight metallic sheen on tiles, "🔒 Committed" label, unresponsive to drag attempts (cursor shows 🚫 on hover)
- Blueprint cards in War Council: unit icon, cost (metal), key skills as small badges, no detailed config

---

## Comparable Games

| Game | Shared Resource Mechanic | Lesson for Robot Uprising |
|------|-------------------------|--------------------------|
| **Factorio multiplayer** | Shared resource pool, no negotiation UI, "you used all the iron" as emergent friction | Proves that unguarded shared resources create memorable co-op moments but also frustration; Robot Uprising needs guardrails Factorio intentionally omits |
| **StarCraft II Archon Mode** | Shared base, shared production, "A player could be trying to save up resources to place a building, but the other may unwittingly use it all up" | Full-access sharing kills the mode for equal-skill pairs; Robot Uprising must add structure SC2 refused to add |
| **Mechs vs. Minions** | Shared card draft, "you want everyone to get what they need but often you need to decide which player needs the card(s) more" | Cooperative drafting creates satisfying team tension when the cost of compromise is visible and the alternative (selfish drafting) is clearly worse |
| **Space Alert** | Shared energy pool, "a player shooting a laser that doesn't have enough energy because another player already used it" | Time pressure (60s timer) prevents quarterbacking; shared-resource conflict should be REVEALED during execution not PREVENTED during planning |
| **Slay the Spire 2 co-op** | Shared card draft, "3M copies in one week" validating cooperative deckbuilder-adjacent design | The co-op card draft as proven commercial viability for cooperative resource negotiation in strategy games |
| **Pandemic** | Shared board state, shared resources, alpha-player/quarterbacking problem | The War Council approach (time-bounded deliberation + mutual commit) directly addresses Pandemic's quarterbacking: neither player can unilaterally decide |
| **Settlers of Catan** | Resource trading as negotiation mechanic | Proves players enjoy resource negotiation as a core activity, not just overhead |
| **DOTA 2 draft phase** | Shared hero selection with timer, separate from gameplay | Dedicated pre-game negotiation phase with timer is a proven competitive design pattern |

---

## The TikTok Clip

Split-screen of two players. Left player drags a striker to slot 1. Right player shakes their head, rejects it — the ghost dissolves with a tiny *pfft*. Left player looks offended. Right player drags a relay to slot 1 instead. Left player hesitates... then approves. *Schink.* Cut to: the battle. Striker deploys third. Relay is already up. Scout sends intel through relay to striker. Perfect kill chain. Both players turn to each other, simultaneous: "Okay, you were right." Text overlay: "The hardest part of Robot Uprising isn't programming robots. It's agreeing with your teammate."

---

## New Aspects Discovered

- **7.02b-i — Queue proposal history in Inspector:** a chronological log of every proposed, accepted, and rejected queue change — visible in the Inspector after battle as "Production Planning Trace"; enables post-game analysis of whether build order disagreements caused failures; the co-op equivalent of git blame for deployment order
- **7.02b-ii — Build order dependency graph visualization:** an optional overlay in the War Council phase showing dependency arrows between blueprints ("STRIKER-B depends on RELAY-C for signal delivery → RELAY-C must deploy first"); computed from hook/channel wiring; auto-detected deployment-order constraints as visual guidance
- **7.02b-iii — Queue veto as competitive meta-resource:** in 2v2 co-op, each player gets one "hard veto" per War Council that cannot be overridden; the veto is a scarce resource that signals conviction strength; interaction with EM emission budget as parallel cooperative constraint
- **7.02b-iv — Async co-op queue negotiation:** for asynchronous co-op play (not same session), the production queue becomes a message-passing system — Player A proposes a queue, Player B reviews and edits offline, sends back; the queue negotiation as async design review; interaction with async challenges (7.03)
- **7.02b-v — Solo queue practice mode:** single-player mode that simulates the co-op queue by giving the AI partner its own build preferences that the player must negotiate against; teaches co-op negotiation skills without requiring a partner; the AI partner's personality (aggressive early, conservative, economy-focused) as a solo training tool
