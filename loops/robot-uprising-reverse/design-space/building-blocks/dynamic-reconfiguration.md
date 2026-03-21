# 3.18 — Dynamic Reconfiguration: Can a Command Agent Change Subordinate Skills/Rules/Hooks Mid-Battle? What Are the Constraints?

## The Option

The locked Command agent skills — `reassign`, `reroute`, `prioritize` — each target a different layer of subordinate configuration. `Reassign` toggles skills on and off. `Reroute` changes channel subscriptions. `Prioritize` adjusts eviction policies. But these are surface-level knobs. The deeper question is: **how mutable is a unit's configuration once battle starts?**

Can a Command agent rewrite a subordinate's RULES — not just toggle a skill, but insert, delete, or reorder the condition-action pairs that govern behavior? Can it install new HOOKS — wiring a unit to a channel it wasn't connected to at blueprint time? Can it change CONTEXT CONFIG — adjusting what a unit listens to, ignores, or forgets? And if it can do any of this, what does it COST?

This is the design space of **mid-battle reconfiguration depth**. At one extreme: battle is pure execution, blueprints are immutable, and the Command agent can only flip pre-configured switches. At the other extreme: the Command agent is a full workbench with battlefield access, rewriting agents on the fly, making the Plan phase merely a first draft. The game's identity lives somewhere on this spectrum.

---

## The Reconfiguration Depth Spectrum

### Level 0: Switch Flipping (Minimal Mutation)

The Command agent can only toggle pre-existing configuration. Skills already equipped in the blueprint can be turned ON/OFF. Channels already defined in the blueprint can be swapped between. Eviction policies already authored can be switched. **Nothing new is created mid-battle.** The player front-loads all possibility during the Plan phase; the Command agent selects from the menu at runtime.

This is the Doctrine Board paradigm (3.17 Paradigm E) applied to individual skills. The Command agent is a selector, not a creator.

**Mechanical detail:** Each blueprint slot that the player equips during Plan phase is marked as "switchable" or "locked." A scout with patrol in slot 1 (switchable) and evade in slot 2 (locked) means the Command agent can disable patrol mid-battle but evade is always on. The player decides which knobs the Command agent is allowed to touch.

**What it preserves:** The sealed watch as a revelation of pre-planned design. Every behavior that manifests during battle was authored during the Plan phase. The Command agent selects timing and sequencing but cannot introduce novelty. The Inspector can always trace any behavior back to a Plan phase decision.

**What it sacrifices:** Adaptive depth. The player must anticipate every possible battlefield state and pre-configure responses. If the enemy does something unexpected — a unit type the player hasn't seen before, an approach vector they didn't plan for — the Command agent has no new tricks. The menu is the menu.

### Level 1: Parameter Tuning (The Locked Skills, As Designed)

This is the locked spec's apparent intent. The Command agent modifies parameters within existing configurations:

- **Reassign:** Toggle skills ON/OFF. Not equip new skills — just enable/disable ones already in the loadout.
- **Reroute:** Change which channel a hook publishes to or listens on. The hook itself remains; only the channel name changes. New channel names CAN be created by typing them (channels emerge from naming, per locked spec).
- **Prioritize:** Change eviction policy ordering. Switch from oldest-first to lowest-priority-first. The policies themselves are pre-defined; the Command agent picks which one is active.

**The critical nuance:** Reroute can create NEW channels by naming them. This is the one place where Level 1 creates something that didn't exist in the Plan phase. A Command agent that reroutes SCOUT-A from `intel-east` to `emergency-flank-7` creates channel `emergency-flank-7` if it didn't exist — and any unit already listening on that channel (because the player typed that name as a channel subscription during Plan) suddenly starts receiving SCOUT-A's data.

This creates a **pre-wired network with latent connections.** During Plan, the player sets up units listening on channels that don't yet have publishers. During battle, the Command agent activates these latent connections by rerouting publishers to pre-subscribed channels. The network was always there; the Command agent turns it on.

### Level 2: Rule Injection (Deep Mutation)

The Command agent can INSERT new rules into a subordinate's rule stack. Not just toggle skills or swap channels — actually add condition-action pairs that didn't exist at blueprint time. The subordinate begins obeying logic it was never programmed with.

**How it could work mechanically:**

The Command agent has a `program` skill (hypothetical, not in the locked set). When the Command agent fires `program`, it sends a message to the target unit's buffer containing a serialized rule: `{type: rule_injection, rule: "IF buffer contains ENEMY_TYPE:SPECIALIST → move away", priority: 2}`. The target unit's rule engine receives this, validates it against a schema, and inserts it at the specified priority position. The rule persists until the target's buffer evicts it or another `program` command removes it.

**The cost model:** Rule injection consumes the target's buffer slots. The injected rule doesn't just execute — it occupies buffer space as a stored instruction. A unit with buffer size 8 that receives 2 injected rules has only 6 slots for observations, signals, and other data. The Command agent is literally trading the subordinate's situational awareness for behavioral complexity. More instructions = less room to think.

This creates a visceral tradeoff: a heavily-programmed subordinate follows complex orders but is nearly blind, while a lightly-programmed subordinate is aware but simple-minded. The Command agent must decide: does this scout need smart rules or clear eyes?

**The buffer-as-RAM metaphor:** Injected rules sitting in buffer slots are code loaded into RAM. Observations are data. The buffer is a unified memory space where code and data compete for the same slots — exactly like a Von Neumann architecture. This is not an analogy; it IS the design. Players who understand this understand something fundamental about computing.

### Level 3: Blueprint Rewriting (Full Mutation)

The Command agent can rewrite any aspect of a subordinate's configuration: add skills not in the original loadout, create new hooks, modify context config filters, reorder rule priorities, change perception radius parameters. The subordinate's runtime configuration can diverge completely from its Plan-phase blueprint.

**Why this is probably too far:** It collapses the distinction between Plan and Execute. If the Command agent can do everything the workbench can, the workbench is just a convenient starting point, not a meaningful design exercise. The sealed watch loses its revelatory power — bad planning can be patched mid-battle by a sufficiently clever Command agent. The core tension of "commit to a design and watch it perform" dissolves.

**When it might be appropriate:** If Robot Uprising introduces a "sandbox mode" or creative mode where players experiment without mission pressure. Full mutation in sandbox, constrained mutation in campaign.

---

## The Cost Architecture for Reconfiguration

Every reconfiguration should cost SOMETHING. Free reconfiguration makes the Plan phase meaningless. The question is what currency the costs are denominated in.

### Cost 1: Tick Latency (Time Cost)

Every reconfiguration command travels through the hook network. Command → Relay → Target = 3 ticks minimum. During those 3 ticks, the target unit operates under its OLD configuration. In a one-shot-one-kill game, 3 ticks of stale behavior can mean death.

**The design implication:** Deeper command hierarchies (Command → Sub-Command → Relay → Target) are smarter but slower. By the time the reconfiguration reaches a front-line scout 5 hops away, the battlefield has changed 5 times. The reconfiguration might be responding to a threat that no longer exists — or has already killed the target.

**Sensory:** The reconfiguration command is a golden pulse traveling along channel wiring lines, hop by hop. Each hop takes 1 tick. The player watches the golden dot traverse the network during sealed watch. When it arrives at the target, the target's icon briefly flashes gold and its behavior visibly changes on the next tick. The delay between the Command agent's golden emission and the target's golden reception IS the latency, rendered as spatial distance on the board.

### Cost 2: EM Noise (Detection Cost)

Per the locked emissions model, every hook transmission generates detectable EM noise. Reconfiguration commands are hook transmissions. A Command agent issuing frequent reconfigurations is broadcasting its organizational structure to the enemy.

**The tactical implication:** Every time the Command agent changes a subordinate's behavior, the enemy hears the radio chatter. An enemy specialist with `hack` can intercept reconfiguration commands, deducing your army's current configuration. A Command agent that reconfigures every 3 ticks is a beacon; one that reconfigures once every 20 ticks is nearly silent.

**The design tension:** Adaptive armies are noisy. Static armies are quiet. The player must choose between intelligence (knowing the current state and adapting) and stealth (maintaining radio silence). This mirrors real electronic warfare doctrine: EMCON (emissions control) vs. operational flexibility.

### Cost 3: Buffer Occupation (Attention Cost)

At Level 2 (rule injection), injected rules consume buffer slots. But even at Level 1, the reconfiguration COMMAND itself occupies a buffer slot when it arrives at the target. The target must process the command — reading it from the buffer, applying the change, then (presumably) evicting the command entry. During the tick when the command occupies a buffer slot, it displaces one observation or signal.

**The stun risk:** If the target's buffer is nearly full when the reconfiguration command arrives, the incoming command might trigger context overload — stunning the target for 1 tick. The Command agent's attempt to help a subordinate can HARM it by overloading its buffer. This is the "too many meetings" problem: management overhead consuming productive capacity.

### Cost 4: Resource Cost (Economic Cost)

Each reconfiguration could cost minerals or energy. Reassign costs 1m. Reroute costs 2m (changing network topology is expensive). Rule injection (if Level 2 is adopted) costs 3m. The Command agent's 4e/tick upkeep already represents the ongoing cost of meta-level control; reconfiguration costs represent the transactional cost of using that control.

**The design question:** Does this create an interesting decision, or does it just tax the player for playing the game correctly? If the optimal strategy always includes frequent reconfiguration, the cost is just a tax. If the optimal strategy sometimes involves NOT reconfiguring (holding position, maintaining radio silence), the cost creates genuine tension.

### Cost 5: Coherence Risk (Systemic Cost)

The most subtle and important cost. Every reconfiguration changes the system's behavior. A scout that was patrolling east gets rerouted to a defense channel. But the relay that was compressing the scout's patrol data is still configured to expect patrol observations — and now it's receiving nothing on that channel. The relay's compression threshold never fires. Downstream units that depended on the compressed signal starve for data.

Reconfiguration can break the information architecture's coherence. The Command agent changes one node, but the effects ripple through the network in ways the player (and the Command agent's rules) may not anticipate. This is the **cascading reconfiguration problem**: changing one thing requires changing three other things, each of which requires changing two more.

**How the game teaches this:** The first time a player reconfigures mid-battle and watches their information pipeline collapse — scouts sending data to channels nobody listens to, relays compressing empty streams, strikers starving for intelligence — they learn that reconfiguration is not a button press. It's surgery. You don't just move the kidney; you reconnect the blood vessels.

---

## The Meta-Level: Reconfiguring the Reconfigurer

Can a Command agent reconfigure ANOTHER Command agent? Can it reconfigure ITSELF?

### Command-on-Command Reconfiguration

Lin's Rule 10 in Journey 4 of 3.17 already explored this: OVERLORD reassigning SUB-COMMANDER's reroute priority. This creates a three-tier hierarchy where reconfiguration cascades downward:

1. OVERLORD changes SUB-COMMANDER's behavior
2. SUB-COMMANDER (with new behavior) changes subordinate configurations
3. Subordinates execute under new configurations

Each tier adds latency (ticks for commands to propagate) and noise (EM emissions at every hop). A three-tier hierarchy resolving in the worst case takes 6+ ticks and generates 3+ emission events per reconfiguration cascade.

**The constraint question:** Should Command-on-Command reconfiguration be unlimited? A player could build a four-tier hierarchy: ARCHITECT → GENERAL → CAPTAIN → units. Each tier adds intelligence and adaptability but also latency and fragility. The deepest tier — ARCHITECT reconfiguring GENERAL — is so far from the front line that its decisions are based on information that's 8+ ticks stale.

**Proposed constraint: Maximum hierarchy depth of 2.** A Command agent can manage subordinates of any type EXCEPT other Command agents of equal or higher rank. Rank is determined by the player during Plan phase (a new field in the Command blueprint: `rank: 1` or `rank: 2`). A rank-2 Command agent can reconfigure rank-1 Command agents. Rank-1 agents cannot reconfigure rank-2 agents. No rank-3 exists. This caps the hierarchy at two management layers plus one execution layer.

### Self-Reconfiguration

Can a Command agent change its own rules, channels, or priorities? This is aspect 3.17b from the discovered aspects in the command-agent-design analysis, but it intersects directly with dynamic reconfiguration.

**The case for self-reconfiguration:** A Command agent that monitors its own buffer fill and adjusts its own eviction policy is performing self-maintenance. This is the simplest form of autonomic computing — a system that tunes itself. It's also the most straightforward way to handle the "management overhead" problem: if the Command agent's own buffer is filling with reconfiguration confirmations, it can change its eviction policy to discard confirmations faster.

**The case against self-reconfiguration:** Self-modifying code is the bane of debugging. If a Command agent changes its own rules mid-battle, the Inspector must show WHICH rules were active at EACH tick — creating a temporal dimension to rule display that doesn't exist for other units. The player can't just look at the blueprint and understand what happened; they must scrub the timeline of rule mutations.

**Proposed constraint: Self-reconfiguration limited to context config.** A Command agent can change its own eviction policy and channel subscriptions (Level 1 operations on itself) but cannot toggle its own skills or inject new rules into itself. This allows self-tuning without self-modification. The Command agent can adjust HOW it processes information but not WHAT it can do.

---

## Player Journeys

### Journey 1: Dante, 22, Competitive FPS Background — Discovering Reconfiguration Cost the Hard Way

**Context:** Mission 7, second attempt. Dante's first attempt failed because his static army couldn't adapt to the enemy's mid-battle production shift. He's added a Command agent and wired it to his relay network. He has 2 scouts, 1 relay, 2 strikers, and 1 Command agent. The Command agent has 3 rules: reassign scouts to evade when enemy strikers appear, reroute strikers to a flanking channel when an opening is detected, and prioritize the relay's eviction to combat-first when the relay overloads.

**Minute 0:00 — The Over-Eager Commander**
Dante opens the Plan phase. His Command agent blueprint shows 3 rules in the flat editor (Paradigm A). He looks at the channel map: Command connects to Relay on `cmd-relay`, Relay connects to both Scouts on `patrol-data`, Relay connects to both Strikers on `strike-intel`. The Command agent's hooks: one publishing to `cmd-orders` (subscribed by all units), one listening on `intel-summary` (published by the relay). Total latency from scout observation to command response: Scout → Relay (2 ticks) → Command (2 more ticks) → Command decision (1 tick) → Command → target unit via Relay (2 more ticks) = 7 ticks minimum.

He doesn't think about this. He hits EXECUTE.

**Minute 1:00 — The First Cascade**
Sealed watch. Ticks 1-8: deployment and patrol. Tick 9: Scout-A spots two enemy strikers entering from the east. Blue observation pips fill Scout-A's buffer bar — two bright yellow threat entries appear among the blue observation data. Scout-A's hook fires: a thin cyan line connects Scout-A to the Relay. The observation arrives at the Relay at tick 10.

Tick 10: The Relay compresses. Three observation entries merge into one brighter pip with a diamond icon. The Relay's hook fires to `intel-summary`. A cyan line pulses from Relay to Command.

Tick 11: The compressed signal arrives in Command's buffer — a slot fills with a teal-bordered entry. Command's Rule 1 evaluates: `buffer contains ENEMY_TYPE:STRIKER count >= 2` — TRUE. The rule fires. A golden pulse emits from the Command agent. The `cmd-orders` channel lights up with a golden line: `reassign(ALL_SCOUTS, skill:patrol, OFF; skill:evade, ON)`. An EM emission ring expands from Command in concentric amber circles, visible for 2 tiles.

Tick 12: The reassign command travels through the Relay (hop 1).

Tick 13: The reassign command arrives at both Scouts. Their icons flash gold for one tick. Scout-A's behavior changes: it stops patrolling and switches to a tight evasive posture, pulling back from the enemy strikers. Scout-B, on the other side of the board, also switches to evade — even though no enemy is near it. It stops patrolling, stops generating observations, and the western intelligence pipeline goes dark.

**Minute 2:00 — The Collateral Damage**
Tick 14-18: Scout-B is evading nothing. Its patrol was covering the western approach. With patrol disabled, no observations flow from the west. The Relay stops receiving western data. Its compression threshold never triggers for western signals because there ARE no western signals. The western half of the board is now invisible.

Tick 19: An enemy scout sneaks through the unmonitored western approach. No friendly unit sees it. Tick 20: An enemy striker follows the scout's path. Tick 23: The enemy striker reaches Dante's Relay from the west — the direction nobody was watching. One adjacent tick. One kill. The Relay is eliminated.

**Minute 2:30 — The Cascade Collapse**
With the Relay gone, the Command agent's information pipeline is severed. No more `intel-summary` signals arrive. The Command agent's buffer begins to stale — old entries age, new ones never arrive. Rules 2 and 3 can't fire because they depend on buffer contents that are no longer updating. The Command agent sits in darkness, issuing no further commands.

The remaining army reverts to their last-received configuration: scouts evading, strikers holding position. Nobody adapts. The enemy walks through the now-blind western flank and eliminates the Command agent at tick 31. Golden hexagon goes dark. Game over.

**Minute 3:30 — Inspector Revelation**
Dante opens the Inspector. He clicks the Command agent at tick 11 — the moment Rule 1 fired. The decision trace shows: `Rule 1 evaluated TRUE → reassign ALL_SCOUTS`. He clicks the target selector: ALL_SCOUTS. Both scouts highlighted. He realizes: "I told ALL scouts to evade. I should have said 'scouts on the east side' or 'scouts that can see the threat.' Scout-B had no reason to evade."

He scrubs to tick 19. He clicks the western tiles — empty observation field. No perception cone covers them. The intelligence gap is obvious in hindsight: a dark band across the western approach where Scout-B's patrol was supposed to be. The context window chart for the Relay shows signal volume dropping to zero at tick 13 — the exact moment Scout-B stopped patrolling.

He scrubs to tick 23. The Relay's elimination. He clicks the enemy striker that killed it and traces backward: the striker followed the enemy scout, which entered through the observation gap. The kill chain starts at tick 13 — the moment HIS Command agent created the gap.

**Minute 5:00 — The Fix**
Dante returns to the Plan phase with a new understanding. He rewrites Rule 1: `IF buffer contains ENEMY_TYPE:STRIKER count >= 2 AND signal_source_channel = "patrol-east" → reassign(listeners:patrol-east, skill:patrol, OFF; skill:evade, ON)`. Now the reassign only targets scouts listening on the eastern patrol channel. Scout-B, listening on `patrol-west`, keeps patrolling.

He also adds Rule 4: `IF buffer contains NO signal from channel "patrol-west" for 3 ticks → reassign(listeners:patrol-west, skill:evade, OFF; skill:patrol, ON)`. This is a silence detection rule (from 3.03d) — if the western scout goes quiet, the Command agent restores its patrol. A self-healing reconfiguration.

He runs again. This time, when enemy strikers appear in the east, only Scout-A switches to evade. Scout-B keeps patrolling the west. The western intelligence pipeline stays live. When a second enemy probe comes from the west, Scout-B detects it, the Relay compresses and forwards, and the Command agent reroutes a striker to intercept.

**Minute 7:00 — The Learning**
Dante has learned three things about dynamic reconfiguration:
1. **Target specificity matters.** `ALL_SCOUTS` is a blunt instrument. Channel-based targeting (`listeners:patrol-east`) is a scalpel.
2. **Reconfiguration has side effects.** Disabling a scout's patrol kills its observation output, which starves the relay, which blinds the Command agent. The reconfiguration's SECOND-ORDER effects were worse than the threat it responded to.
3. **Silence detection is the reconfiguration safety net.** A rule that monitors for ABSENCE of signals can detect when a reconfiguration has broken a pipeline, and restore the previous state.

**UI Annotations:**
- **EM emission ring:** Concentric amber circles expanding from Command agent on reconfiguration, visible for 2 tiles, fading over 1 tick. Enemy units within the ring can detect the emission.
- **Intelligence gap visualization (Inspector):** Dark band on the board heatmap showing tiles with no observation coverage. Appears when scrubbing past the moment coverage was lost.
- **Decision trace:** Right sidebar panel in Inspector. Shows: Rule number → condition evaluation (TRUE/FALSE per clause) → action fired → target units highlighted on board. Click target unit to see the command's arrival tick and behavior change.
- **Signal volume sparkline:** Miniature line chart in the Relay's Inspector detail panel showing incoming signal count per tick. Flat-line segments indicate pipeline starvation.

---

### Journey 2: Priya, 29, Systems Architect — Exploring Rule Injection at Level 2

**Context:** Mission 9, factory vs. factory. Priya has been theorycrafting on the game's subreddit about Level 2 reconfiguration — specifically whether Command agents should be able to inject new rules into subordinates. She's built an experimental army with 2 Command agents: STRATEGIST (rank 2, managing the army's overall posture) and TACTICIAN (rank 1, managing individual unit responses). Her architecture: STRATEGIST manages TACTICIAN and 2 relays. TACTICIAN manages 3 scouts, 3 strikers, and 1 specialist. Deep hierarchy, high latency, maximum adaptability.

**Minute 0:00 — The Pre-Wired Network**
During Plan phase, Priya has spent 8 minutes setting up latent channels — channels that exist by name but have no current publishers. She's created `emergency-north`, `emergency-south`, `emergency-east`, `emergency-west`, `pincer-left`, `pincer-right`, `full-retreat`, and `siege-mode`. Her scouts and strikers are subscribed to various subsets of these channels but nobody is publishing to them yet. The channel map panel shows a web of dim, inactive lines — potential connections waiting to be activated.

Her STRATEGIST has rules that reroute units TO these latent channels based on high-level conditions. When STRATEGIST reroutes SCOUT-A from `patrol-east` to `emergency-east`, Scout-A starts publishing its observations on a channel that all eastern-sector units are pre-subscribed to. The network topology changes without any unit needing new hooks — only the channel names change.

She opens TACTICIAN's blueprint. TACTICIAN has a hypothetical `program` skill (Level 2). Its rules include: `IF buffer contains intelligence_snapshot from SPECIALIST AND snapshot reveals enemy_rule "move_toward_relay" → program(nearest_striker, rule: "IF buffer contains ENEMY_TYPE:SPECIALIST within 2 → engage immediately")`. TACTICIAN reads enemy intelligence and writes COUNTER-RULES into friendly strikers.

**Minute 2:00 — The Rule Injection UI**
The `program` skill's configuration panel is unlike any other skill. It contains a mini rule-builder — a nested condition-action editor WITHIN the Command agent's own rule editor. She's writing a rule that, when it fires, creates ANOTHER rule inside a different unit. Two layers of condition-action logic, displayed as an indented block:

```
TACTICIAN Rule 3:
  IF buffer contains intelligence_snapshot
     AND snapshot.enemy_rules contains "move_toward_relay"
  THEN program(nearest_striker):
    ├─ Injected Rule: IF ENEMY_TYPE:SPECIALIST within 2 → engage
    ├─ Priority: 1 (highest)
    └─ Buffer cost: 2 slots
```

The indented block uses a different background color — pale gold instead of the standard cream — signaling that this is meta-level content: a rule about rules. The `Buffer cost: 2 slots` label is shown in amber, warning that this injection will consume the target striker's limited memory.

**Minute 3:30 — The Buffer Cost Calculation**
She hovers over the `Buffer cost: 2 slots` label. A tooltip expands showing the target striker's buffer breakdown:

```
STRIKER-A buffer (8 slots):
  [1] Observation data (from patrol channel)
  [2] Observation data
  [3] Compressed intel (from relay)
  [4] Command override (from TACTICIAN)
  [5] (empty)
  [6] (empty)
  [7] (empty — reserved for injected rule, slot 1)
  [8] (empty — reserved for injected rule, slot 2)
```

The tooltip shows that after injection, STRIKER-A will have 6 usable buffer slots and 2 slots occupied by the stored rule. The injected rule persists until explicitly removed (by another `program` command with a `remove` flag) or until evicted by buffer pressure (if the eviction policy allows rule eviction — a player-configurable setting).

She notices the design tension: if rule eviction is enabled, injected rules can be lost under buffer pressure — the striker "forgets" its special orders when overwhelmed with data. If rule eviction is disabled, injected rules are permanent and the buffer space is permanently reduced. She enables rule eviction with lowest priority — the injected rule survives unless the buffer is completely full, at which point the striker sheds its special orders to make room for survival-critical observations.

**Minute 5:00 — EXECUTE: The Intelligence-Driven Counter**
Sealed watch. Tick 15: SPECIALIST-A successfully hacks an enemy relay. The green siphon line connects for 1 tick. Three jagged-bordered intelligence entries appear in the specialist's buffer. The specialist's hook fires the intelligence to TACTICIAN via `intel-raw` channel.

Tick 17: Intelligence arrives at TACTICIAN. The decision trace shows TACTICIAN processing the snapshot: enemy relay's buffer contained a rule `{type: move_toward, target: nearest_relay}`. TACTICIAN's Rule 3 matches. The `program` skill fires.

A distinctive animation plays: instead of the standard golden pulse of a reassign/reroute command, a golden HELIX spirals outward from TACTICIAN — a double-stranded signal, visually denser than a normal command. The helix represents code, not a simple order. It travels along the channel wiring toward STRIKER-A.

Tick 19: The helix arrives at STRIKER-A. The striker's buffer bar shows two new slots filling with gold-bordered entries — the injected rule. STRIKER-A's icon gains a subtle golden pip in the corner: a visual indicator that this unit is running injected code, not just its blueprint configuration.

Tick 22: An enemy specialist approaches STRIKER-A's position, heading toward the relay. The injected rule fires: `ENEMY_TYPE:SPECIALIST within 2 → engage`. STRIKER-A pivots and moves toward the enemy specialist. One tick later, adjacency. Crimson flash. Enemy specialist eliminated.

Without the injected rule, STRIKER-A's original rules would have prioritized moving toward the enemy BASE (its default objective). The enemy specialist would have reached the relay and hacked it. The injected rule — a counter-strategy derived from enemy intelligence — saved the relay.

**Minute 7:00 — Inspector: The Meta-Level Trace**
Priya opens the Inspector and clicks STRIKER-A at tick 22. The decision trace shows:

```
Tick 22: STRIKER-A
  Rule evaluated: [INJECTED @ tick 19] IF ENEMY_TYPE:SPECIALIST within 2 → engage
  Source: TACTICIAN Rule 3 → program(STRIKER-A)
  Intelligence chain: SPECIALIST-A hack @ tick 15 → TACTICIAN @ tick 17 → inject @ tick 19
  Result: move toward E6 (enemy specialist position)
```

The trace shows the FULL causal chain: the hack at tick 15 led to the intelligence at tick 17 led to the injection at tick 19 led to the engagement at tick 22. Seven ticks from intelligence to action. The trace links three units (specialist, Command agent, striker) and two skill types (hack, program) across the entire chain.

She clicks the buffer state display. STRIKER-A's 8 slots at tick 22:

```
[1] 🟦 Patrol observation (from scout, tick 20)
[2] 🟦 Patrol observation (from scout, tick 21)
[3] 🟩 Compressed intel (from relay, tick 18)
[4] 🟡 Command override: reroute (from TACTICIAN, tick 12)
[5] 🟡 Command override: reassign (from STRATEGIST, tick 8)
[6] 🟦 Patrol observation (from scout, tick 22)
[7] ✨ INJECTED RULE: IF specialist within 2 → engage (from TACTICIAN, tick 19)
[8] ✨ INJECTED RULE: [rule data continued] (from TACTICIAN, tick 19)
```

Slots 7-8 glow with gold borders and a subtle sparkle animation — they're not data, they're code. The Inspector makes the Von Neumann duality visible: code and data sharing the same memory space, competing for the same slots.

**Minute 9:00 — The Buffer Pressure Crisis**
She scrubs forward to tick 35. Enemy production has ramped up. The board is chaotic. STRIKER-A's buffer is under heavy pressure — observations flooding in from three scouts, commands arriving from two Command agents. The buffer state at tick 35:

```
[1] 🟦 Observation (tick 34)
[2] 🟦 Observation (tick 34)
[3] 🟦 Observation (tick 35)
[4] 🟡 Command override (tick 33)
[5] 🟦 Observation (tick 35)
[6] 🟦 Observation (tick 35)
[7] 🟦 Observation (tick 35)
[8] 🟦 Observation (tick 35)
```

The injected rule is GONE. Evicted at tick 31 when buffer pressure exceeded capacity. The gold-bordered slots were replaced by blue observation data. The golden pip on STRIKER-A's icon has disappeared. The striker has "forgotten" its anti-specialist programming and reverted to default rules.

Priya watches tick 38: another enemy specialist approaches. STRIKER-A ignores it — its original rules say "move toward enemy base." The specialist reaches the relay. Green siphon. Intelligence stolen.

She understands: injected rules are fragile. They live in the same memory space as everything else. Under pressure, the mind discards learned behaviors and reverts to instinct. The metaphor is visceral and exact.

**UI Annotations:**
- **Golden helix animation:** Double-stranded spiral signal for `program` skill, visually distinct from single-line reassign/reroute commands. Travels at normal signal speed (1 tick/hop). Heavier visual weight communicates "this is more than a simple order."
- **Golden pip indicator:** Small golden diamond in the bottom-right corner of a unit's board icon, indicating injected rules are present. Disappears when rules are evicted. Visible during both sealed watch and Inspector.
- **Injected rule buffer display:** Gold-bordered slots with sparkle animation in the Inspector buffer state view. Distinct from observation data (blue), commands (yellow), and intelligence (green/jagged).
- **Rule injection mini-editor:** Indented block within the Command agent's rule editor, pale gold background. Contains a nested condition-action builder. Buffer cost label in amber with hover tooltip showing target unit's projected buffer state.

---

### Journey 3: Haruki, 45, Factory Automation Engineer — Command-on-Command Reconfiguration Cascade

**Context:** Mission 10, the factory-versus-factory climax. Haruki approaches the game like a control systems problem. He has two Command agents: FOREMAN (rank 2, managing strategic posture) and SUPERVISOR (rank 1, managing tactical execution). His army has evolved over multiple attempts — 4 scouts, 2 relays, 4 strikers, 1 specialist. He's about to discover the limits and power of hierarchical reconfiguration.

**Minute 0:00 — The Two-Tier Control System**
The workbench shows FOREMAN's Control Room dashboard (Paradigm C). The decision matrix has 8 rows — conditions about overall battle state — and 3 columns: reconfigure SUPERVISOR, reconfigure relays, no action. The key insight in Haruki's design: FOREMAN never directly commands scouts or strikers. It only commands SUPERVISOR and the relays. SUPERVISOR handles the front-line units.

FOREMAN's Row 1: `IF enemy_production_rate > friendly_production_rate → reassign(SUPERVISOR, skill:prioritize, mode:AGGRESSIVE)`. This means: when we're being outproduced, tell SUPERVISOR to become more aggressive in how it prioritizes subordinate buffers — evicting old data faster, pushing fresh combat data to strikers. FOREMAN doesn't know or care WHICH strikers get WHICH data. It sets the organizational TONE, and SUPERVISOR translates that into specific unit-level changes.

SUPERVISOR's rules, in turn, respond to its own priority mode:
- NORMAL mode: balance patrol coverage and strike readiness
- AGGRESSIVE mode: sacrifice patrol coverage for strike concentration
- DEFENSIVE mode: sacrifice strike positioning for relay protection

Haruki has built a thermostat. FOREMAN reads the room temperature (battle state) and sets the target temperature (organizational mode). SUPERVISOR is the HVAC system that actually adjusts the vents (subordinate configurations). The metaphor maps exactly to industrial process control, which Haruki recognizes immediately.

**Minute 2:00 — The Cascade Latency Problem**
During Plan, Haruki calculates the worst-case reconfiguration latency. FOREMAN detects a condition from buffer data (relayed from scouts through relays — 4 ticks of observation latency). FOREMAN issues a mode change to SUPERVISOR (2 ticks via relay). SUPERVISOR processes the mode change and issues subordinate reconfigurations (1 tick to evaluate, then 2 ticks via relay to each front-line unit). Total: 4 + 2 + 1 + 2 = 9 ticks from observation to front-line behavior change.

At 2 tiles/tick striker movement speed, an enemy striker can cross the entire 8-tile board in 4 ticks. Haruki's 9-tick cascade takes longer than the threat's traversal time. By the time the front line switches to defensive posture, the enemy striker has already reached the relay.

He stares at the channel map. The latency numbers hover over each connection line in amber text. He traces the critical path: Scout → Relay-A → FOREMAN → Relay-A → SUPERVISOR → Relay-B → STRIKER. Seven hops. He needs to cut hops.

**Minute 3:30 — The Shortcut Architecture**
Haruki redesigns. He adds a direct channel from FOREMAN to SUPERVISOR (no relay intermediate), cutting 2 ticks. He adds a direct channel from SUPERVISOR to front-line strikers (bypassing relay-B), cutting 2 more. New latency: 4 + 1 + 1 + 1 = 7 ticks. Still slow.

Then he makes the critical trade: he gives SUPERVISOR a hook that listens DIRECTLY to the scout channel (`patrol-east`), bypassing the relay compression step. SUPERVISOR now receives raw, uncompressed scout data. This means SUPERVISOR can detect threats independently — without waiting for FOREMAN's mode change. The hierarchy remains (FOREMAN sets overall mode, SUPERVISOR obeys) but SUPERVISOR has a fast-path for urgent situations.

He adds a SUPERVISOR rule: `IF mode = NORMAL AND buffer contains ENEMY_STRIKER within 3 of any relay → OVERRIDE: reassign(nearest_striker, skill:engage, ON) + reroute(nearest_striker, channel:intercept)`. This rule fires on SUPERVISOR's own initiative, not waiting for FOREMAN's instruction. The `OVERRIDE` prefix means it acts even if the current mode doesn't normally allow this action.

New latency for urgent threats: Scout observation → SUPERVISOR (2 ticks direct) → STRIKER (1 tick direct) = 3 ticks. Fast enough.

**Minute 5:00 — EXECUTE: Two Tiers in Action**
Sealed watch. The battlefield unfolds. Ticks 1-15: standard deployment, patrol, intelligence gathering. FOREMAN's dashboard (visible in the corner as a tiny matrix) shows all conditions FALSE — no mode changes needed.

Tick 16: Enemy production shift detected by SPECIALIST. Intelligence flows through the network. FOREMAN's Row 1 fires at tick 20: enemy production rate exceeds friendly. A golden pulse from FOREMAN — deeper, more resonant than a standard command. The FOREMAN-to-SUPERVISOR channel glows gold. At tick 21, SUPERVISOR's mode shifts to AGGRESSIVE. SUPERVISOR's icon gains an amber border — visual indicator of its current mode.

Tick 21-22: SUPERVISOR cascades the mode change. Golden pulses radiate from SUPERVISOR to each front-line unit. Scouts tighten their patrol paths (less coverage, more focus). Strikers shift forward (more aggressive positioning). The relay adjusts eviction to combat-first. The entire army's posture shifts over 2 ticks — a visible wave of golden rings expanding from center to periphery.

Tick 28: Enemy striker spotted 3 tiles from Relay-A. SUPERVISOR's fast-path rule fires INDEPENDENTLY of FOREMAN. A sharp golden bolt (faster animation than the mode-change pulse) shoots from SUPERVISOR to STRIKER-B. STRIKER-B pivots to intercept. The fast-path is visually distinct: a thin, bright golden line that appears and disappears in a single tick, compared to the mode-change's broad, slow pulse.

Tick 30: STRIKER-B engages the enemy striker. Crimson flash. Threat eliminated. The fast-path response took 3 ticks total — within the interception window. FOREMAN didn't need to be involved.

Tick 35: FOREMAN's Row 3 fires: `IF friendly_striker_count < enemy_striker_count → reassign(SUPERVISOR, skill:prioritize, mode:DEFENSIVE)`. FOREMAN shifts the organizational posture from AGGRESSIVE to DEFENSIVE based on attrition rates. The mode change cascades through SUPERVISOR again — scouts widen their patrols (more coverage), strikers pull back to relay-protection positions.

Haruki watches the two tiers interoperate. FOREMAN makes slow, strategic decisions every 15-20 ticks. SUPERVISOR makes fast, tactical decisions every 3-5 ticks. The hierarchy doesn't slow things down — it SEPARATES time scales. Strategic adaptation operates on a 20-tick cycle. Tactical adaptation operates on a 3-tick cycle. Neither interferes with the other because they operate at different frequencies.

**Minute 8:00 — The Inspector: Control Theory Made Visible**
Haruki opens the Inspector. He selects FOREMAN and SUPERVISOR simultaneously (multi-select in Inspector). The command timeline shows two horizontal bars:

FOREMAN's bar: three widely-spaced command events (ticks 20, 35, 52). Strategic shifts. Each pip is a large, slow-fading gold circle.

SUPERVISOR's bar: fifteen tightly-spaced command events spread across 80 ticks. Tactical adjustments. Each pip is a small, sharp golden dot.

The two bars together look like two different waveforms — a low-frequency carrier wave (FOREMAN) modulated by a high-frequency signal (SUPERVISOR). Haruki recognizes this immediately: it's a control system with a slow outer loop and a fast inner loop. The PID controller pattern from his factory floor, rendered as a game timeline.

He clicks SUPERVISOR at tick 28 — the fast-path interception. The decision trace shows:

```
Tick 28: SUPERVISOR
  Current mode: AGGRESSIVE (set by FOREMAN @ tick 20)
  Rule evaluated: OVERRIDE fast-path — ENEMY_STRIKER within 3 of RELAY-A
  Action: reassign(STRIKER-B, engage ON) + reroute(STRIKER-B, intercept)
  Note: OVERRIDE rule fired independently of FOREMAN mode
  Latency: 2 ticks (scout → SUPERVISOR direct) + 1 tick (SUPERVISOR → STRIKER-B direct) = 3 ticks
```

The trace shows both the hierarchy (current mode set by FOREMAN) and the override (SUPERVISOR acting on its own authority). The OVERRIDE label is highlighted in amber — a visual signal that this action deviated from the standard chain of command.

**Minute 10:00 — The Control Theory Insight**
Haruki leans back. He's built a cascade control system. The outer loop (FOREMAN) sets setpoints based on strategic conditions. The inner loop (SUPERVISOR) tracks those setpoints while also handling disturbances (urgent threats) that the outer loop is too slow to address. The override mechanism is the equivalent of a feedforward path — a fast response that bypasses the slow loop for known disturbance patterns.

He opens the game's subreddit and writes a post titled "Robot Uprising is a cascade PID controller — here's the proof." He includes screenshots of the two-bar command timeline and the control loop diagram. Within hours, three other factory automation professionals respond comparing their own hierarchical designs. One shares an architecture with THREE Command agents at different time scales: strategic (50-tick cycle), operational (10-tick cycle), tactical (3-tick cycle). The thread devolves into a debate about optimal controller bandwidth separation ratios.

**UI Annotations:**
- **Mode indicator on Command agents:** Colored border around the Command agent's board icon showing current mode. Amber = AGGRESSIVE, Blue = NORMAL, Green = DEFENSIVE. Changes visually when a mode-shift command is received.
- **Two-tier command timeline (Inspector):** Two horizontal bars, one per Command agent, showing command events as pips. Bar height and pip size proportional to command "weight" (strategic commands = large pips, tactical commands = small pips). The visual pattern reveals the control frequency separation.
- **Fast-path vs. slow-path animation:** Mode changes from FOREMAN render as broad, slow golden pulses (3-frame expansion). OVERRIDE responses from SUPERVISOR render as thin, sharp golden bolts (1-frame flash). The visual distinction communicates the two time scales during sealed watch.
- **Latency annotation on channel map:** Amber numbers on each channel connection line showing hop count. During Plan phase, hovering over a Command agent's rule shows the end-to-end latency from detection to response, calculated as sum of hops along the critical path.
- **OVERRIDE label in decision trace:** Amber-highlighted text in the Inspector decision trace when a rule fires outside the standard mode-based logic. Links to the mode state and explains why the override was triggered.

---

## Strengths and Weaknesses

### Strengths

**The reconfiguration depth spectrum creates a natural progression.** Missions 7-8 introduce Level 0-1 (switch flipping, parameter tuning). Mission 9 might introduce Level 2 (rule injection) as an advanced optional mechanic. The depth is revealed incrementally, matching the campaign's skill curve.

**Reconfiguration costs create genuine strategic tension.** Latency, EM noise, buffer occupation, and coherence risk are not arbitrary taxes — they're physical properties of the system that the player can reason about and optimize. Cutting latency means adding direct channels (more EM noise). Reducing noise means fewer reconfigurations (less adaptability). Every optimization has a counter-cost.

**The Von Neumann buffer model (Level 2) teaches a real computer science concept through gameplay.** Code and data sharing the same memory space, competing for slots, with code being evictable under pressure — this is a profound insight delivered without a lecture.

**Hierarchical reconfiguration (Command-on-Command) maps to real organizational design.** The two-tier control system, the frequency separation between strategic and tactical loops, the override mechanism for urgent responses — these are patterns from industrial automation, military command, and corporate management. The game teaches transferable skills.

### Weaknesses

**Level 2 (rule injection) may be too complex for the core audience.** Writing rules that write rules is inherently difficult to reason about. The nested rule editor is intimidating. The buffer cost calculation requires arithmetic. Even experienced players may avoid Level 2 in favor of more doctrines and better Level 1 targeting.

**Reconfiguration cascades are hard to debug.** When a three-tier hierarchy produces unexpected behavior, the player must trace through multiple Command agents, multiple ticks of latency, and multiple rule evaluations to find the root cause. The Inspector helps, but the cognitive load is high.

**The coherence risk (side effects of reconfiguration) can feel punishing.** When a player reconfigures one unit and watches their whole information pipeline collapse, the failure feels disproportionate — "I just toggled one skill, why did everything break?" The game needs to teach cascading effects gently before punishing for them.

**Self-reconfiguration (even limited to context config) creates temporal complexity in the Inspector.** The Inspector must show that a Command agent's eviction policy at tick 15 was different from tick 30 because it changed its own config at tick 22. This is a new dimension of state tracking that other units don't have.

---

## Interaction Effects

### With the Locked Emissions Model
Every reconfiguration command is a hook transmission that generates EM noise. Frequent reconfiguration = loud army = detectable army. This creates the **radio silence dilemma**: the most adaptive armies are the easiest to locate. A player facing an aggressive enemy might CHOOSE to reduce reconfiguration frequency, accepting slower adaptation in exchange for stealth. The Command agent's reconfiguration rate becomes a tunable parameter — fast and loud or slow and quiet.

### With One-Shot-One-Kill Combat
Reconfiguration latency is measured in ticks. Enemy strikers cover distance in ticks. The question "can my reconfiguration outrace the threat?" is a simple arithmetic comparison that the player can calculate during Plan phase: sum of hops in the command chain vs. enemy approach distance / enemy speed. If the reconfiguration is slower than the threat, the player needs a shorter command chain or a faster detection mechanism.

### With the Doctrine Board (3.17 Paradigm E)
Doctrines are pre-packaged Level 0 reconfigurations — complete organizational state snapshots that switch atomically. Dynamic reconfiguration (Level 1-2) exists in tension with doctrines: doctrines are fast, atomic, but coarse-grained. Dynamic reconfiguration is slow, incremental, but fine-grained. The deepest player architectures might use BOTH: doctrines for major posture shifts (defensive → aggressive) and dynamic reconfiguration for surgical adjustments within a doctrine (reroute one scout, inject one rule into one striker).

### With Hook Chaining (3.09) and Signal Latency
Every hop in the reconfiguration chain adds 1 tick of latency AND 1 EM emission event. A reconfiguration that traverses 4 hops generates 4 separate emission events at 4 different board positions — creating a visible trail that reveals the command chain's physical topology to any enemy unit in detection range. The emission trail IS a map of the player's organizational structure.

### With Context Overload Mechanics
A Command agent issuing multiple reconfigurations in rapid succession can OVERLOAD its own subordinates' buffers. Each reconfiguration command occupies a buffer slot on arrival. Three commands arriving in 3 consecutive ticks fills 3 buffer slots. If the target unit's buffer was already at 6/8 capacity, the third command triggers context overload — stunning the target for 1 tick. The Command agent's help HARMS the subordinate. This is the "too many Slack messages from the boss" problem, rendered as a game mechanic.

---

## Comparable Games/Media

| Reference | What It Does | What Transfers |
|-----------|-------------|---------------|
| **Supreme Commander's strategic zoom** | Players zoom between tactical (individual units) and strategic (entire battlefield) levels of control seamlessly | The two-tier Command architecture mirrors Supreme Commander's zoom levels — strategic decisions operate at a different time scale than tactical ones. The lesson: the zoom metaphor (frequency separation) is more intuitive than the hierarchy metaphor. |
| **Factorio's circuit network** | Wires connecting machines. Signals propagate with tick latency. Conditions trigger reconfigurations of production lines. | Factorio's circuit networks ARE dynamic reconfiguration. A combinator that disables an inserter when storage is full is a Command agent reassigning a subordinate's skill. The lesson: latency in control signals creates oscillation if the feedback loop is too slow. Factorio players learn anti-oscillation patterns (hysteresis, dead bands) that transfer directly. |
| **Kubernetes controllers** | Controllers watch cluster state and reconcile toward desired state. Multiple controllers can manage the same resource with priority ordering. | The Command-on-Command hierarchy is a controller hierarchy. FOREMAN is a Deployment controller; SUPERVISOR is a ReplicaSet controller. The lesson: controller conflicts require explicit priority (like RBAC) and the "last writer wins" default causes chaos. |
| **Chess: positional play vs. tactical play** | Grandmasters operate on two time scales — long-term positional plans and short-term tactical responses | FOREMAN's strategic posture shifts are positional play (operating over many moves). SUPERVISOR's fast-path overrides are tactical play (responding to immediate threats). The separation of time scales is the same insight that distinguishes master-level chess from beginner-level piece-chasing. |
| **StarCraft 2: army control groups** | Players assign units to numbered groups and issue group-level commands | Control groups are Level 0 reconfiguration — selecting pre-defined subsets of units and issuing simple commands. Robot Uprising's channel-based targeting is a more expressive version of the same concept, where "groups" are defined by network topology rather than player selection. |

---

## Sensory Summary: What Dynamic Reconfiguration FEELS Like

**The Golden Cascade.** Every reconfiguration begins with a golden pulse from the Command agent and ends with a golden flash on the target. Between them: the signal traverses the network, hopping through relays, each hop a distinct golden pip traveling along the channel wiring line. The cascade IS the hierarchy made visible — the player watches their organizational structure light up like a circuit. A well-designed hierarchy produces clean, fast cascades — short paths, few hops, golden signal arriving at the target in 2-3 ticks. A poorly-designed hierarchy produces long, meandering cascades — the golden signal bouncing through 5 relays before reaching a scout that's already dead.

**The Mode Shift.** When FOREMAN changes SUPERVISOR's mode, the entire army's visual register shifts. AGGRESSIVE mode: unit icons gain amber borders, channel lines thicken, patrol paths tighten. DEFENSIVE mode: unit icons gain blue borders, channel lines dim (less transmission), patrol paths widen. The mode shift plays out over 2-3 ticks as the cascade reaches each unit, creating a ripple effect — center units shift first, periphery units shift last. The ripple IS the latency, rendered as a wave of color change across the board.

**The Override Bolt.** When SUPERVISOR fires a fast-path override, the animation is different from a standard cascade. Instead of a broad pulse, a thin golden lightning bolt snaps from SUPERVISOR to target in a single tick — bright, sharp, gone instantly. The contrast between the slow mode-change pulse and the fast override bolt communicates the two time scales visually. Players who see both in the same battle understand intuitively: strategic decisions roll like thunder, tactical decisions strike like lightning.

**The Helix Injection.** Level 2 rule injection uses a double-helix animation — two golden strands spiraling around each other. It's visually heavier than a single-line command, communicating that this signal carries more payload. When the helix arrives at the target, the target's buffer bar shows two slots filling with gold-bordered entries, and a subtle sparkle persists on those slots for the rest of the battle (or until eviction). The sparkle is the visual signature of code living in data space — something borrowed, something foreign, something that might not survive.

**The Silence After Reconfiguration.** The most important sound in dynamic reconfiguration is the one that STOPS. When a scout's patrol is disabled by a Command agent's reassign, the scout's blue observation ripples cease. The rhythmic pulse of patrol data flowing through the network goes quiet. The relay's compression events stop. The channel line dims. In the sealed watch, this silence — a section of the board going dark and quiet — is the visceral signal that reconfiguration has consequences. The player doesn't need the Inspector to know something went wrong. They can HEAR it.

---

## The TikTok Clip

Split screen. Left: the Plan phase channel map showing a complex hierarchy — FOREMAN, SUPERVISOR, 10 subordinates, latent channels drawn as dim potential connections. Right: the sealed watch.

Tick 1-15: normal operations. Calm blue ripples, steady data flow.

Tick 16: enemy production shift. FOREMAN's mode-change pulse ripples outward. **THRUM.** Army posture shifts from blue borders to amber borders, spreading from center to edge over 3 ticks.

Tick 28: enemy striker spotted near the relay. SUPERVISOR's override bolt snaps to STRIKER-B. **CRACK.** One tick. STRIKER-B pivots. Crimson flash. Threat eliminated.

Tick 35: attrition mounting. FOREMAN shifts to DEFENSIVE. **THRUM.** Amber borders fade to blue, spreading like a cool wave.

Text overlay: "Two Command agents. Two time scales. One army."

Cut to Inspector: the two-bar command timeline. Low-frequency strategic pulses. High-frequency tactical bursts. The control system heartbeat.

Final text: "You didn't command the army. You designed the commander."
