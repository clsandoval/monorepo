# 8.04 — The Minimum Viable Game: Smallest Set of Mechanics That Captures the Core Magic

## The Question

Strip Robot Uprising to its skeleton. What is the **smallest possible version** of this game that still transmits the feeling: *"I am managing smart autonomous systems, not puppeting dumb units"*? Not the game we ship — the game that proves the concept works. The vertical slice. The one-evening prototype that makes a playtester say "when can I play more?"

This is a cross-cutting synthesis drawing from every category in the design space. For each mechanic, we ask: **essential** (the game breaks without it), **enhancing** (the game is better with it but still works without), or **aspirational** (save for later).

---

## The Core Magic — What Must Be Transmitted

Before cutting, name what we're protecting. The minimum viable game must produce these three feelings:

1. **"I didn't program that."** The player watches their agents do something emergent — a flanking maneuver, a relay chain, a coordinated retreat — that they configured but didn't explicitly instruct. The gap between configuration and behavior IS the game.

2. **"Oh, THAT's why it failed."** The Inspector reveals a causal chain: unit did X → because rule Y matched → because slot Z had stale data → because the hook from unit W arrived 2 ticks late. The failure is traceable, not random. The player learns.

3. **"What if I rewired it?"** The player immediately sees how to change the information architecture. Not "I need to click faster" or "I need better stats" — "I need to change what this unit KNOWS and WHEN."

If the minimum viable game produces all three feelings, it works. If it's missing any one, it doesn't matter how polished it is.

---

## The Cut List

### ESSENTIAL — Cannot Be Removed

| Mechanic | Why It's Load-Bearing | Minimum Spec |
|----------|----------------------|--------------|
| **Fixed-slot context window** | IS the game. Without buffers, agents are omniscient and there's nothing to design. | 4-6 slots per unit. FIFO eviction. Visual: vertical stack of colored cards. |
| **Ordered condition→action rules** | Without rules, agents have no behavior. Without ordering, there's no priority design. | 3-5 rule slots. IF [condition] THEN [action]. First match fires. Drag to reorder. |
| **Hooks on named channels** | Without inter-agent communication, each unit is isolated. No architecture emerges. | 1-2 hook slots per unit. ON [trigger] SEND [channel]. Channel name = typed string. |
| **Deterministic tick execution** | Without determinism, you can't debug. Without debugging, you can't learn. | Simultaneous resolution. Board snaps. Same config + same seed = same result. |
| **The three-screen loop** | Plan → Watch → Inspect is the learning cycle. Cut any phase and the loop breaks. | Plan: workbench + board preview. Watch: sealed playback. Inspect: click-to-inspect + timeline scrub. |
| **One-shot, one-kill** | Eliminates HP math. Forces the game to be ABOUT information, not damage optimization. | Adjacent striker = instant kill. No HP bars. No damage numbers. |
| **At least 2 unit types** | Need sender + receiver for communication to matter. Scout + Striker is the minimum pair. | Scout (sees, sends) + Striker (receives, kills). Asymmetric capabilities. |
| **Signal latency (1 tick/hop)** | Without latency, information is instant and architecture doesn't matter. Latency creates the need for relay chains, compression, prediction. | 1 tick per hop. Scout→Striker = 2 ticks minimum. |
| **8×8 grid** | Locked. Spatial relationships create the need for communication. | Checkerboard. A-H, 1-8. Isometric view. |

### ENHANCING — Makes It Much Better But Game Survives Without

| Mechanic | What It Adds | Cut Consequence |
|----------|-------------|----------------|
| **Relay unit** | Enables 3-unit architectures. Compress/filter skills create the first real design decisions. | Without relays, architectures are flat (scout→striker only). Still works but ceiling is LOW. |
| **Context overload → stun** | Creates the visceral cost of bad information architecture. Makes buffer management feel urgent. | Without overload, full buffers just evict silently. Less dramatic. Less punishing. |
| **EM emissions** | Hooks create detectable noise. Deeper architectures are louder. Creates the stealth-vs-intelligence tradeoff. | Without EM, there's no cost to more hooks. Less interesting tradeoff space. |
| **Production queue / factory** | Enables the "design the factory" meta-level. Without it, you're hand-placing units. | Without factory, the game is a puzzle (configure pre-placed units). Still teaches the core lesson but lacks the production meta. |
| **Command agent** | The meta-level: systems that manage systems. The deepest design space. | Without Command, there's no hierarchy. Architectures are flat. Still emergent, but less deep. |
| **Boot log narrative** | Diegetic tutorial. "You are an AI reading your own spec sheet." | Without narrative, it's a bare mechanics tutorial. Functional but less memorable. |
| **Blueprint Codex** | Persistent reference. Players look up "how does compress work?" | Without Codex, players rely on memory or tooltips. Viable for a short prototype. |
| **Campaign map** | Philippine archipelago. Visual progression. Geographic grounding. | Without campaign map, it's a mission select list. Functional. |
| **Phase shifts** | Mid-battle terrain/enemy changes. Tests robustness. | Without shifts, missions are static puzzles with one optimal solution. |

### ASPIRATIONAL — Save For Later

| Mechanic | Why It Can Wait |
|----------|----------------|
| Specialist unit (hack, extract) | Adds variety but core loop works with Scout + Relay + Striker. |
| Tagging system | Economic layer. Not needed for the core information-architecture lesson. |
| Invisible randomization | Replayability feature. First playthrough doesn't need it. |
| Gauntlet / competitive mode | Endgame. The MVP is single-player. |
| Community sharing / Config Codes | Social layer. Solo prototype first. |
| Multiple biome tilesets | One biome is enough for the prototype. |
| Advanced hook chaining (hot/cold modes) | Progressive complexity. Start with simple fire-and-forget. |

---

## The Minimum Viable Game: "Three Units, Three Screens"

### What It Contains

**Three unit types:**
- **Scout** (6-slot buffer, 2 hooks, wide perception, fast, skills: patrol + evade)
- **Relay** (8-slot buffer, 3 hooks, stationary, skills: compress + filter) — we bump Relay to essential because without it, architectures are too flat
- **Striker** (6-slot buffer, 2 hooks, narrow perception, medium speed, skills: engage)

**Four primitives (all present from Mission 1, progressively revealed):**
- Skills (what a unit can do)
- Rules (ordered condition→action pairs)
- Hooks (reactive triggers on named channels)
- Context config (buffer listen/ignore toggles, eviction priority)

**Five missions:**
1. **Wake** — One pre-placed scout. Buffer has 3 signal + 3 noise cards. Drag noise out. Scout finds enemy. Execute. Win. *Teaches: buffer is attention. Less noise = better decisions.*
2. **Focus** — Two pre-placed scouts, one striker. Scouts see enemies, striker doesn't. Wire one hook: scout ON_ENEMY_SPOTTED → SEND "threats". Striker listens on "threats". Execute. Striker moves toward reported enemy. Win. *Teaches: hooks connect units. Information flows on channels.*
3. **Priority** — Same setup but two enemy types (fast + slow). Scout reports both. Striker gets confused — context fills, stale data persists, wrong target chosen. Player must reorder rules: IF fast_enemy_nearby THEN engage BEFORE IF enemy_nearby THEN engage. Execute. Striker prioritizes fast enemy. Win. *Teaches: rule ordering is strategy. Priority determines behavior.*
4. **Overload** — Three scouts, one striker. All scouts flood striker's 6-slot buffer on one channel. Striker stuns from overload. Player adds a Relay between scouts and striker. Relay compresses three scout reports into one summary. Striker receives compressed signal, acts clearly. Win. *Teaches: information architecture matters. Relay solves overload. The three-unit pipeline.*
5. **Architect** — First factory mission. Player designs blueprints for all three unit types. Production queue. Enemy spawner on opposite side of board. Static enemy waves. Player must design a full information pipeline: scouts detect → relay compresses → strikers engage. Win by eliminating all enemies. *Teaches: you design the system, not the units. The factory builds your architecture.*

**Three screens (all five missions):**
- **Plan screen** — Board left (8×8, read-only preview showing spawn points + enemy positions). Workbench right (blueprint editor with skill toggles, rule strips, hook config, context config). Missions 1-4: pre-placed units, workbench edits their configs. Mission 5: blueprint editor + production queue.
- **Sealed watch** — Board center. Tick clock top (horizontal pips). 1 second/tick. Speed: 0.5x / 1x / 2x. Context bars on units (tiny colored pips). Signal chains (colored dashed lines). Cell flashes (green=signal, red=combat). NO pause, skip, or tools.
- **Inspector** — Board center with timeline scrubber. Click any unit → see full context window state at that tick. Decision trace: which rule matched, what context it evaluated, why this action. Context fill sparkline. Event log.

**One biome:** Rice terraces (Ifugao). Isometric pixel art. SE Asian cyberpunk.

**No narrative framework:** No boot log, no Blueprint Codex, no campaign map. Mission select screen with numbered buttons. Pure mechanics. The narrative can be layered on later without changing any gameplay.

**No Command agent, no Specialist, no tagging, no phase shifts, no EM emissions.**

---

## What This Minimum Game Proves (Or Disproves)

### If it works, we know:

1. **Buffer-as-attention creates meaningful decisions.** Players genuinely think about what their units know, not what they do.
2. **The three-screen loop is satisfying.** Plan → Watch → Inspect creates a learning rhythm that makes players want to iterate.
3. **Hooks create emergence.** Even with simple fire-and-forget hooks, players discover behaviors they didn't explicitly program.
4. **One-shot-one-kill makes information matter.** Without HP, every piece of bad information is potentially fatal.
5. **The Inspector teaches.** Players actually USE the Inspector to diagnose failures, not just skip past it.

### If it fails, we learn:

1. **If players don't use the Inspector** → The emotional sealed watch isn't creating enough curiosity. The failure wasn't dramatic enough to investigate.
2. **If architectures feel flat** → Three unit types aren't enough. The design space needs Command agents or more skills earlier.
3. **If players just brute-force** → The puzzle missions have obvious solutions. Need more variation or randomization.
4. **If the sealed watch is boring** → 1-second ticks with snap resolution isn't visually engaging enough. Need more juice.
5. **If hooks feel like busywork** → The channel naming UX is too frictional, or the payoff isn't clear enough.

---

## Player Journeys

### Journey 1: Sofia, 15, Minecraft/Fortnite Player, Never Played Strategy

**Context:** Downloaded because a friend shared a TikTok of units doing a coordinated flanking maneuver. First time opening the game. Mission 1: Wake.

**Minute 0:00 — The Grid**
Sofia sees an 8×8 isometric grid. Rice terraces with pixelated water flowing between server racks nestled into the hillside. One unit sits in the middle — a small eye icon (👁) with a pulsing cyan outline. To the right, a panel labeled "CONTEXT WINDOW" shows six horizontal slots. Three are bright green with text: "ENEMY_NORTH", "TERRAIN_OPEN", "PATH_CLEAR". Three are muddy gray: "NOISE_7f2a", "STATIC_b91d", "INTERFERENCE_c4e0". A thin white arrow connects each slot to a cone of light emanating from the scout on the board. The cone is wide but flickering — jittering between directions.

Sofia thinks: "The green ones are real and the gray ones are fake. Like a spam filter."

**Minute 0:15 — The First Drag**
She hovers over "NOISE_7f2a". The slot highlights with a red border. A tooltip: "This entry is noise — it degrades decision quality." She clicks and drags it off the panel. The card dissolves in a shower of gray sparks with a soft *shhhck* sound, like pulling tape off a surface. On the board, the scout's perception cone tightens slightly — the jitter reduces by one degree. The context bar on the unit (a tiny vertical thermometer) drops from 6/6 to 5/6 — shifting from amber to yellow-green.

She removes the other two noise cards. Three drags. Six seconds. The scout's cone snaps to a clean, steady beam pointing northeast. The context bar is at 3/6 — cool blue. The cone illuminates a red enemy icon on the grid.

**Minute 0:30 — Execute**
A large cyan button in the top-right: "EXECUTE". She clicks it. The screen transitions — the workbench panel slides away, the board expands to fill the screen. A horizontal tick clock appears at the top with 20 small pips. The first pip glows gold.

Tick 1: The scout snaps one tile northeast. Its perception cone sweeps and locks onto the enemy. A green flash on the scout's tile — "DETECTED."
Tick 2: The scout moves adjacent to the enemy.
Tick 3: A red flash. The enemy is eliminated. The scout stands alone.

Text appears: "ALL THREATS ELIMINATED." A victory chime — three ascending notes on a kulintang (Philippine percussion instrument).

**Minute 0:45 — Inspector (First Time)**
The screen transitions again. The board is still visible but now a timeline scrubber replaces the tick clock. "INSPECTOR" label at the top. Sofia clicks the scout on the board. A side panel opens showing the scout's context window at tick 1: three green entries, zero noise. A decision trace: "Rule 1: IF enemy_in_perception THEN move_toward → MATCHED. Action: move NE."

She scrubs to tick 3. The decision trace shows: "Rule 2: IF enemy_adjacent THEN engage → MATCHED. Action: eliminate."

Sofia thinks: "Oh, it followed the rules in order. Like an if-else chain." She doesn't know what an if-else chain is, but the logic is visible. She clicks "NEXT MISSION."

**Minute 1:00 — Reflection**
Total time: under 60 seconds. She learned: the buffer holds information, noise degrades behavior, removing noise improves behavior. She didn't read a single line of tutorial text. The grid taught her.

---

### Journey 2: Derek, 31, Software Engineer, Factorio Veteran (600 hours)

**Context:** Heard about Robot Uprising from a blog post comparing it to Factorio's logistics network. Skipping nothing. Mission 4: Overload.

**Minute 0:00 — The Problem**
Derek sees the board: three scouts (👁👁👁) spread across the upper half, one striker (⚔) in the lower-left. A single enemy spawner on the right edge produces enemies every 4 ticks. The workbench shows all four units' configs. Each scout has a hook: ON_ENEMY_SPOTTED → SEND "intel". The striker listens on "intel". The striker has one rule: IF enemy_reported THEN move_toward_nearest.

Derek recognizes the architecture immediately. "Three producers, one consumer, fixed-size buffer. This is going to flood."

He clicks EXECUTE without changing anything — he wants to see the failure.

**Minute 0:20 — The Flood**
Sealed watch. Tick 1-3: Scouts fan out. Tick 4: All three scouts spot the first enemy simultaneously. Three green signal flashes — three "intel" messages hit the striker's 6-slot buffer in one tick. Three of six slots consumed instantly.

Tick 5: Scouts continue reporting. Three more signals. Buffer at 6/6. The striker's context bar is solid red.

Tick 6: Three more signals arrive. The striker's buffer is full. A violent visual: the striker sprite jitters — a rapid left-right shake, sparks flying from its chassis, a harsh *bzzzt* crackling sound. The context bar flashes white. Text overlay on the unit: "⚡ OVERLOADED." The striker does nothing this tick. It stands frozen while an enemy advances.

Tick 7: The striker's buffer compacts — oldest three entries evicted. It can act again, but the damage is done: the enemy is one tile away.

Tick 8: Red flash. Enemy adjacent. Striker eliminated.

Derek grins. "Classic backpressure problem. I need a message broker."

**Minute 0:40 — The Inspector Confirms**
Inspector mode. Derek scrubs to tick 6 — the overload tick. He clicks the striker. The context window shows all 6 slots full: intel_scout_1_T4, intel_scout_2_T4, intel_scout_3_T4, intel_scout_1_T5, intel_scout_2_T5, intel_scout_3_T5. Decision trace: "OVERLOADED — no rule evaluated. Context compacting..."

He sees the sparkline: context fill spikes to 100% at tick 6, drops to 50% at tick 7 after eviction. He nods. "The three scouts are firehosing the striker."

**Minute 1:00 — The Relay Solution**
Back to Plan screen. Derek adds a Relay (📡) to the board between the scouts and striker. He configures:
- Scouts: ON_ENEMY_SPOTTED → SEND "raw_intel" (hooks unchanged except channel name)
- Relay: Listens on "raw_intel". Skill: COMPRESS (takes multiple signals, outputs one summary). Hook: ON_COMPRESSED → SEND "processed_intel".
- Striker: Listens on "processed_intel" instead of "intel".

Derek types "raw_intel" into the scout hook's channel field. The relay auto-populates a listener toggle for "raw_intel". He enables compress. He types "processed_intel" into the relay's output hook. The striker's context config shows a toggle for "processed_intel" — he enables it, disables "intel" (the old channel).

The channel map panel (read-only, auto-generated) now shows: scouts → "raw_intel" → relay → "processed_intel" → striker. A clean two-stage pipeline.

**Minute 1:30 — The Fix Executes**
EXECUTE. Tick 4: All three scouts spot enemy. Three signals hit the relay's 8-slot buffer (plenty of room). Relay compresses three reports into one summary signal: "ENEMY at D5, HIGH CONFIDENCE." One signal hits striker's 6-slot buffer. Context bar: 1/6. Cool blue.

Tick 5: Striker acts on the compressed intel. Moves toward D5.

Tick 8: Red flash on D5. Enemy eliminated. Striker survives.

Derek watches the remaining ticks as more enemies spawn and the pipeline handles them cleanly. Three scouts flooding, one relay compressing, one striker acting on clean data. The context bars stay blue.

**Minute 2:00 — The Factorio Moment**
In the Inspector, Derek watches the relay's context window over time. Three entries arrive per tick, compress fires, one entry exits. A 3:1 compression ratio. The sparkline shows a sawtooth wave — fill to 3, compress to 1, fill to 3, compress to 1.

"This is literally a Factorio inserter," he says. "The relay is a balancer. The channel is a belt. The buffer is a chest." He opens Mission 5 immediately.

**Minute 2:30 — Reflection**
Derek has already internalized the core design language: producers, consumers, channels, compression, backpressure, buffer management. He learned it in 150 seconds because the minimum viable game made each concept viscerally visible through failure-then-fix. No documentation required. The Factorio mental model transferred directly.

---

### Journey 3: Tomás, 8, Has Played Angry Birds and Roblox

**Context:** His older sister Sofia (from Journey 1) showed him the game. He's on Mission 2: Focus. He can read basic English but doesn't know what "configuration" means.

**Minute 0:00 — Two Scouts, One Problem**
Tomás sees two 👁 units and one ⚔ unit on the board. The ⚔ unit has a red X over its perception cone — it can't see anything. A red enemy sits four tiles away. The workbench has three panels, one per unit.

He clicks EXECUTE immediately. (Eight-year-olds click buttons.)

**Minute 0:10 — The Blind Striker**
Sealed watch. Scouts spread out and spot the enemy (green flashes). The striker... does nothing. It sits still for 10 ticks. Eventually an enemy walks up and eliminates it. Red flash. Defeat.

Tomás doesn't understand why, but the visual is clear: the scouts SAW things (green), the striker DIDN'T (no green), and then the striker DIED (red). The scouts knew something the striker didn't.

**Minute 0:20 — Inspector (Skipped)**
The Inspector appears. Tomás pokes around — clicks the striker, sees empty context slots, doesn't understand the decision trace text. He clicks through to retry.

**Minute 0:25 — Finding the Wire**
Back on Plan screen. He clicks the scout panel. There's a section labeled "HOOKS" with an empty slot showing a dashed outline and a "+" button. He clicks "+". A simple form appears:

```
WHEN: [dropdown: enemy spotted ▼]
SEND TO: [text field: ________]
```

He picks "enemy spotted" from the dropdown. The text field blinks. He doesn't know what to type. But next to the striker's panel, there's a section labeled "LISTENS TO:" with an empty slot and the same dashed outline. It reads: "Type a channel name here or in a hook."

He types "go" in the scout's hook field. (Eight-year-olds type short words.) The scout hook now reads: `WHEN enemy_spotted → SEND "go"`. On the striker's panel, a new toggle appears: `Channel: "go" [ON/OFF]`. It's already toggled ON with a satisfying cyan glow and a tiny *click*.

He does the same for the second scout — types "go" in its hook too. Both scouts now send on "go". The striker listens on "go".

**Minute 0:40 — The Connection Works**
EXECUTE. Tick 2: Scout spots enemy. Green flash on scout. A cyan dashed line appears between the scout and striker — the signal traveling along it like a tiny star sliding down a wire. Tick 3: The signal arrives. The striker's context bar lights up: 1/6, green. The striker moves.

Tomás leans forward. He didn't tell the striker to move. He just connected a wire. The striker figured out what to do from the information it received.

Tick 5: Striker adjacent to enemy. Red flash. Victory chime.

**Minute 0:50 — "It Heard the Scout!"**
Tomás turns to Sofia. "It heard the scout! I made them talk!" He replays the sealed watch (clicks "WATCH AGAIN" — a simple replay button, no Inspector). He watches the cyan signal line travel from scout to striker three times, grinning each time.

He doesn't know what a "hook" is. He doesn't know what a "channel" is. He knows he made two units talk to each other by giving them the same word. And the talking unit did something smart because of what it heard.

**Minute 1:00 — Reflection**
The core magic is transmitted: "I connected them, and something smart happened." The minimum viable game requires no vocabulary. The visual — cyan signal line sliding between units — IS the explanation. An eight-year-old understood inter-agent communication in 40 seconds.

---

### Journey 4: Dr. Amara, 38, ML Infrastructure Lead, Plays Into the Breach

**Context:** Her team builds agent orchestration systems at work. She heard about Robot Uprising from a colleague and wants to see if it "actually feels like agent engineering." Mission 5: Architect (first factory mission).

**Minute 0:00 — The Blueprint Editor**
Amara sees the Plan screen with the full workbench. Left side: 8×8 board showing a player factory (bottom-left, glowing data center built into rice terraces) and an enemy spawner (top-right, dark angular structure). Right side: blueprint editor. Three blueprint tabs: Scout, Relay, Striker.

She clicks the Scout tab. The editor shows:
- **Skills:** patrol [ON], evade [OFF] — toggle switches with cyan/gray states
- **Rules:** 3 slots (2 filled, 1 empty dashed outline)
  - Rule 1: IF enemy_in_perception THEN send_on_hook [drag handle]
  - Rule 2: IF no_enemy THEN patrol [drag handle]
- **Hooks:** 2 slots
  - Hook 1: ON enemy_spotted → SEND "recon" [channel name field]
  - Hook 2: [empty, dashed outline, "+" button]
- **Context Config:**
  - Buffer: 6 slots
  - Listen: "orders" [ON], other channels [OFF toggles]
  - Eviction: FIFO [dropdown]

Below the blueprint editor, a horizontal conveyor belt strip shows blueprint icons in build order: Scout → Relay → Striker → Scout. A cost preview reads: "3m + 5m + 8m + 3m = 19m. Income: 2m/tick. First unit: tick 2."

**Minute 0:30 — The Architecture**
Amara designs the pipeline she'd build at work:
- Scouts: patrol + report on "recon"
- Relay: listen "recon", compress, send on "processed"
- Strikers: listen "processed", engage nearest reported enemy

She adjusts the production queue: Relay first (so the infrastructure exists before the scouts start reporting), then two scouts, then a striker. She drags the Relay icon to position 1 on the conveyor belt.

She notices the channel map panel (read-only, auto-generated at the bottom of the workbench) now shows: `Scout ──"recon"──▶ Relay ──"processed"──▶ Striker`. Clean topology. She smiles — this IS her Kubernetes service mesh, but with a grid and explosions.

**Minute 1:00 — Sealed Watch**
EXECUTE. The factory pulses — a warm amber glow spreading through the rice terrace data center as it begins production.

Tick 2: Relay unit materializes on the factory tile. 📡 appears with a mechanical *chunk* and a brief holographic shimmer.

Tick 4: First scout materializes. 👁 begins patrolling.

Tick 6: Second scout materializes. Two scouts now sweeping opposite quadrants.

Tick 8: First striker materializes. ⚔ sits near the relay, waiting.

Tick 10: Scout 1 spots an enemy. Green flash. Cyan dashed line fires from scout to relay. Tick 11: Relay compresses and forwards — second cyan line from relay to striker. The striker's context bar ticks up: 1/6. It begins moving.

Ticks 12-18: A beautiful ballet. Scouts patrol in wide arcs, signal lines flicker to the relay like fireflies feeding a central node, compressed lines pulse outward to strikers who converge on threats. The relay sits still in the center — a glowing hub with lines radiating in and out. Amara watches it process signal after signal without overloading. The 8-slot buffer sparkline (visible as a tiny bar) oscillates between 3/8 and 5/8 — healthy load.

Tick 20: All enemies eliminated. Victory chime. The signal network fades — all the dashed lines dim and disappear like a circuit powering down.

Amara's hands are off the keyboard. She watched the whole thing. She has goosebumps. That WAS her job — but beautiful.

**Minute 1:30 — Inspector Deep Dive**
She clicks the relay. Context window at tick 10: `[recon_scout1_T10: ENEMY at E3]`. At tick 11: `[COMPRESSED: threat_E3, confidence HIGH]` — the compress skill merged the data. Decision trace: "Hook 1: ON_COMPRESSED → SEND 'processed'. Fired at T11. Payload: threat_E3."

She scrubs to tick 14 where both scouts reported simultaneously. Relay context at T14: two entries arrive in one tick. Compress fires: merges into one. Output: one clean signal. The compression ratio sparkline shows a steady 2:1.

She clicks a striker. Decision trace at T12: "Rule 1: IF threat_reported AND enemy_in_perception THEN engage. MATCHED — target: E3." She follows the chain: striker acted → because relay sent processed signal → because scout reported → because scout perceived enemy at E3. Four hops, fully traceable.

**Minute 2:00 — "This Is My Job"**
Amara opens her phone and messages her colleague: "You were right. This is literally agent orchestration but you can SEE the context windows. My relay's compression ratio was 2:1. I'm designing a command agent pipeline in my head already."

She doesn't know there's no Command agent in this prototype yet. She's already thinking about it — which means the minimum viable game successfully planted the seed. The meta-level is a pull, not a push.

---

## Interaction Effects — How the Minimum Cuts Affect Other Systems

### What the MVG teaches implicitly

| Concept | How it's learned | When |
|---------|-----------------|------|
| Buffer as attention | Drag noise out, see behavior improve | Mission 1 |
| Inter-agent communication | Wire a hook, see a signal line | Mission 2 |
| Rule priority as strategy | Reorder rules, see different behavior | Mission 3 |
| Information overload | Watch a unit stun from too much data | Mission 4 |
| Compression as infrastructure | Add a relay, watch the flood become a stream | Mission 4 |
| System design vs. unit control | Design blueprints, watch the factory build your vision | Mission 5 |

### What's deferred and why it's safe to defer

| Deferred mechanic | Why it's safe | When to add |
|-------------------|--------------|-------------|
| **EM emissions** | The stealth-vs-intelligence tradeoff is beautiful but secondary. The core lesson is information architecture, not detection risk. | Mission 6 — first multi-wave mission where enemy behavior adapts. |
| **Command agent** | The meta-level needs a foundation. Players must design flat architectures before they can appreciate hierarchy. Amara is already WANTING a command agent after Mission 5 — that's the right time to introduce it. | Mission 7 — "what if a unit could change other units' rules?" |
| **Specialist (hack, extract)** | Counter-intelligence adds depth but the core loop doesn't need it. | Mission 8 — adversarial information warfare. |
| **Phase shifts** | Robustness testing needs something to test. Build the baseline first. | Mission 6+ — once players have architectures worth stressing. |
| **Tagging / economy** | Resource management is orthogonal to information architecture. Layering both simultaneously fragments attention. | Mission 5+ — economy integrated with factory. |

### What happens if you cut MORE

| Further cut | Consequence | Verdict |
|------------|------------|---------|
| Cut the Relay (2 unit types only) | Architectures are all scout→striker. No compression. No pipeline depth. Overload can't be solved elegantly — player must just reduce hooks. | **Fatal.** The relay is what makes "I designed an information pipeline" possible. Three units minimum. |
| Cut the Inspector | Players watch the battle, lose, and don't know why. No causal tracing. No learning. Retry is brute-force experimentation. | **Fatal.** The Inspector IS the teaching system. Without it, the game is trial-and-error. |
| Cut sealed watch (just Plan → Inspect) | No emotional investment in the outcome. No goosebumps. No "oh no my striker is overloading." The Inspector becomes an abstract debugging tool instead of a motivated investigation. | **Fatal.** The sealed watch creates the DESIRE to inspect. Two-act debrief is load-bearing. |
| Cut rule ordering (rules fire in any order) | No priority design. Rules become a flat checklist. "What should my unit do?" becomes "list all the things" instead of "what matters MOST?" | **Fatal.** Priority IS the game's strategic depth for rules. |
| Cut signal latency (instant delivery) | Architecture doesn't matter. Scout reports, striker acts same tick. No need for relays, prediction, or timing. | **Fatal.** Latency is why the spatial layout matters. |
| Cut one-shot-one-kill (add HP) | The game becomes about DPS optimization, not information architecture. "Is my striker strong enough?" instead of "does my striker KNOW what it needs to?" | **Fatal.** HP would destroy the thesis. |

---

## The TikTok Clip

**15-second clip for the minimum viable game:**

*Open on Mission 4, sealed watch. Three scouts on the board. One striker in the center. A flood of cyan signal lines converge on the striker from all directions — three scouts reporting simultaneously. The striker's context bar goes red. Sparks fly. It freezes. An enemy walks up. Red flash. Striker eliminated.*

*Hard cut to the same Mission 4, after the fix. A relay sits between the scouts and striker. Signal lines converge on the relay — three cyan lines in. One clean cyan line out. Striker's context bar stays blue. It moves smoothly, eliminates the enemy.*

*Text overlay: "Same scouts. Same striker. Different architecture."*

*Cut to the Inspector showing the relay's buffer: three entries in, one compressed entry out. The compression sparkline pulses steadily.*

*Text overlay: "You don't control the units. You design what they know."*

---

## Comparable Games at Their Minimums

| Game | Their MVG | What they kept | What they cut | Lesson for us |
|------|----------|---------------|--------------|---------------|
| **Into the Breach** | 3 mechs, 5×5 grid, one enemy type, one island | Perfect information, one-shot puzzles, undo | Multiple islands, pilots, mech upgrades, achievements | The base puzzle was so satisfying that players wanted MORE of it, not DIFFERENT. |
| **Slay the Spire** | One character, one act, basic cards, basic enemies | Deckbuilding, random encounters, rest sites | 3 more characters, 2 more acts, ascensions, daily runs | The core loop (fight → add card → fight harder) was addictive in isolation. Everything else amplified existing satisfaction. |
| **Factorio** | Iron plate → gear → science pack 1 → research | Belt logistics, manual crafting, basic assembly | Trains, nuclear, circuit network, logistics robots, space | The first 30 minutes of Factorio (mine → smelt → assemble by hand → automate) IS the entire game in miniature. |
| **Baba Is You** | 3 rules, 5×5 grid, 4 objects | Rule manipulation, push mechanic, win condition | 200+ levels, 50+ words, complex interactions | The first level teaches: rules are objects you can change. Everything else is variations on that truth. |
| **Robot Uprising MVP** | 3 unit types, 8×8 grid, 5 missions | Buffer as attention, hooks as wiring, rules as priority, sealed watch + Inspector | Factory meta, command agents, EM, phase shifts, narrative, economy | The first 5 missions must teach: you design what agents KNOW, and that determines what they DO. |

---

## Sensory Specification: The Minimum Viable Aesthetic

Even a prototype needs juice. Here's the sensory minimum:

**Visual:**
- Isometric pixel art, single biome (rice terraces — water between server racks, bamboo scaffolding, mist)
- Unit icons with context bars (vertical thermometer: blue < 50%, amber 50-80%, red > 80%)
- Signal lines: cyan dashed, traveling dot animation (like data packets on a wire)
- Combat flash: red, 200ms, tiles-wide
- Signal flash: green, 150ms, unit-only
- Overload: unit jitter (3-pixel random offset, 500ms), white sparks, *bzzzt*

**Audio:**
- Tick clock: soft metallic *tick* per beat
- Signal delivery: soft chime, pitch varies by channel (higher = newer channel)
- Combat kill: sharp percussive *crack*
- Overload: harsh electrical *bzzzt*, low-frequency rumble
- Victory: three-note ascending kulintang melody
- Defeat: single low gong
- Ambient: water flowing through terraces, distant server hum, cicadas

**Transitions:**
- Plan → Watch: workbench panel slides right, board expands, 400ms ease-out
- Watch → Inspector: tick clock morphs into timeline scrubber, 300ms crossfade
- Inspector → Plan: board contracts, workbench slides in from right, 400ms ease-in

---

## New Aspects Discovered

1. **8.04a — The "second session" test for the MVG:** What does a player do when they return to the MVG the next day? Do they replay Mission 5 with a different architecture? Do they try to beat it faster? What creates pull-back without progression systems or new content? The "one more try" psychology for a 5-mission prototype.

2. **8.04b — The Relay essentiality debate:** This analysis argues Relay is essential (three units minimum). But could a two-unit MVG work if the Scout had a built-in compress skill? The tradeoff: fewer units = simpler onboarding vs. fewer units = no pipeline design. What's the true minimum topology for emergence?

3. **8.04c — Inspector engagement metrics:** How do we measure whether the Inspector is actually teaching? Time-on-Inspector as a quality signal. Number of unit clicks per debrief. Scrubber positions visited. If players skip the Inspector, the MVG has failed — how do we instrument and respond?

4. **8.04d — The "factory shock" at Mission 5:** Every preceding mission had pre-placed units. Mission 5 introduces blueprints + production queue + economy simultaneously. Is this too much for the MVG? Should there be a Mission 4.5 that introduces one factory concept?

5. **8.04e — The MVG as web demo:** The 5-mission MVG maps perfectly to a browser-playable demo (React + Pixi.js, no backend, Vite build). Under 5 minutes total. Shareable URL. Could this be the viral acquisition funnel — play 5 missions in the browser, then buy the full game?
