# 3.03 — Skill Interactions: The Combinatorics of Emergent Behavior

## Overview

Twelve skills across five unit types. Every skill generates buffer entries. Every buffer entry can trigger hooks. Every hook can fire across channels to units with different skills. The interaction space isn't 12 × 12 = 144 — it's 12 × hooks × channels × rules × buffer states, a combinatorial explosion that produces the game's emergent magic. This document maps the interaction space: which skill pairings create powerful synergies, which create degenerate strategies, which are surprisingly inert, and which produce the "I didn't tell them to do this" moments that make the TikTok clip.

The locked primitives (skills, rules, hooks, context config) create a four-layer interaction model:
1. **Direct skill interaction** — one skill's output is another skill's input
2. **Hook-mediated interaction** — skills connected across units via named channels
3. **Rule-gated interaction** — skills that only combo when specific conditions are met
4. **Buffer-constrained interaction** — combos that work at low load but collapse under pressure

---

## The Interaction Matrix

### Tier 1: Core Synergies (The Bread and Butter)

These are the combinations that define the game's basic vocabulary. Players discover them in Missions 1-4. They're reliable, readable, and form the foundation for everything else.

---

#### **Patrol → Compress** (The Intelligence Pipeline)

**How it works:** Scout patrols generate raw observations that flood the scout's buffer. A hook on the scout sends observations to a relay's channel. The relay's compress skill combines redundant entries (three sightings of the same enemy → one trajectory summary). The compressed signal occupies one buffer slot instead of three, then gets forwarded to strikers or command units.

**Why it matters:** This is the game's "Hello World" combo. It teaches the core information flow: *observe → transmit → compress → act*. A player who understands this pipeline understands the entire game at a conceptual level.

**The tension:** Compression is lossy. Three observations `{enemy_scout at C3, tick 12}`, `{enemy_scout at C4, tick 13}`, `{enemy_scout at C5, tick 14}` compress into `{enemy_scout, moving_south, corridor_C, ticks 12-14}`. The receiver knows the trajectory but loses exact tick timing. A striker receiving the compressed signal can intercept at C6 — but if the enemy changed direction at tick 15, the stale trajectory is a trap.

**Compression threshold as skill parameter:** The relay's compression threshold (configurable: 2-5 entries required before compression fires) determines pipeline latency. Threshold 2 = frequent, fast, low-quality summaries. Threshold 5 = rare, slow, high-quality summaries. This is literally the batch size tradeoff in stream processing.

**Sensory:** During Sealed Watch, a well-tuned patrol→compress pipeline creates a rhythmic visual pulse. The scout emits blue ripples as it patrols (2-3 per tick cycle). Blue observation pips fill the scout's buffer bar. When the hook fires, a thin cyan line briefly connects scout to relay. The relay's buffer absorbs the entries — three blue pips slide in, then visibly merge into one brighter, slightly wider pip. The relay's antenna pulses blue-white. The compressed signal fires outward on the next tick. The whole sequence takes 3-4 ticks and looks like a breathing cycle: inhale (observe) → process (compress) → exhale (forward).

---

#### **Evade → Amplify** (The Alarm System)

**How it works:** When a scout evades, it generates a `threat_detected` entry. A hook sends this to a relay's channel. The relay's amplify skill broadcasts the threat on a priority channel, making it resistant to eviction in receiving buffers. Every unit listening on that channel gets a high-priority threat notification.

**Why it matters:** This is the game's first defensive architecture. It turns a single scout's survival instinct into a network-wide alert. The amplification ensures the alert survives even in units with full buffers — the priority flag means the threat notification displaces lower-priority entries rather than being discarded.

**The degenerate case:** A scout on an aggressive patrol path through enemy territory evades constantly. Every evade triggers the alarm. The relay amplifies every alarm. Every unit's buffer fills with amplified threat data, drowning out navigation and tactical information. This is **the alarm fatigue problem** — the real-world phenomenon where too many alerts cause all alerts to be ignored.

**How the game teaches alarm fatigue:** A player who wires evade→amplify without filtering discovers that their strikers stop moving toward objectives. Inspector reveals why: the strikers' buffers are 6/8 slots full of amplified threat data from 15 ticks ago. Their rules can't find current navigation data because it was evicted by priority-flagged threats that are no longer relevant. The fix: add filter rules on the relay ("only amplify threats within 3 tiles of a striker") or reduce scout patrol aggression. The player has discovered alert fatigue through gameplay, not a lecture.

**Sensory:** Evade's red flinch on the scout → thin red line to relay → relay absorbs, antenna flashes → concentric green rings expand from relay (amplify) → all connected units flash briefly yellow as the priority entry arrives. When amplify fires repeatedly (alarm fatigue), the green rings overlap into a persistent green haze around the relay — visually noisy, obviously too loud. The relay looks like a panicked switchboard.

---

#### **Hack → Reroute** (The Intelligence-Driven Pivot)

**How it works:** A specialist hacks an enemy unit, reading its buffer (3 buffer slots consumed for the intelligence snapshot). The specialist's hook sends the intelligence to a command unit's channel. The command unit's rules analyze the intelligence — if the enemy buffer reveals a flanking maneuver, the command unit uses reroute to redirect defensive units to a new channel covering the threatened sector.

**Why it matters:** This is the game's first "meta-level" combo. Three different unit types coordinate across two skill categories (observation + command) to produce an adaptive response. The player didn't program "if flanked, reroute defense." They programmed: (1) the specialist to hack when adjacent, (2) a hook to forward intelligence, (3) the command unit to detect flanking patterns in intelligence data, (4) a reroute action targeting specific units. The flanking response *emerges* from four independent configuration choices.

**The information lag:** Hack takes 1 tick (adjacency required). Hook transmission takes 1 tick per hop. If the specialist sends intelligence through a relay to a command unit, that's 3 ticks minimum (hack + specialist→relay + relay→command). The reroute command then takes 1 tick to reach its targets. Total: 4+ ticks from intelligence to response. In a game where enemy strikers can cross 2 tiles per tick, a 4-tick intelligence lag means the response arrives after the flank has already hit.

**The design lesson:** This combo teaches that deeper architectures are smarter but slower. A simpler design — specialist hooks directly to the striker, cutting the command unit out — responds in 2 ticks but lacks the adaptive rerouting. The player chooses between fast-dumb and slow-smart. This is the real-world tradeoff between flat and hierarchical organizations.

**Sensory:** The hack's green siphon line connects specialist to enemy for 1 tick — subtle, surgical. The intelligence entry (jagged green border) appears in the specialist's buffer. A cyan hook line fires to the relay. The relay forwards to the command unit. At the command unit, the buffer bar shows the intelligence entry glowing bright green among dimmer entries. Then the command's rules fire: a yellow reroute arrow pulses downward toward the target unit. Channel wiring lines physically move on the board — the old channel detaches (soft click), the new one solidifies (subtle snap). The target unit pauses for 1 tick during the channel switch. The whole sequence plays out over 4-5 ticks, and in Inspector, scrubbing through it frame by frame reveals the entire intelligence cascade.

---

### Tier 2: Advanced Synergies (The Mission 5-7 Toolkit)

These combos emerge when players have access to the full unit roster and start building multi-layer architectures.

---

#### **Compress → Filter → Amplify** (The Relay Signal Chain)

**How it works:** A relay configured with all three of its skills creates a signal processing pipeline within a single unit. Incoming raw signals are compressed (reduce volume), then filtered (remove irrelevant categories), then amplified (boost priority on remaining signals). The relay becomes an information refinery.

**Why it matters:** This combo transforms the relay from a simple repeater into an intelligent signal processor. The ORDER of skills matters — filter before compress produces different results than compress before filter. If you filter first, you eliminate noise before compression; the compressed signal is clean but you might lose data that was ambiguously relevant. If you compress first, redundant entries merge before filtering; the filter sees fewer entries but each is richer.

**The skill ordering question:** The locked design doesn't specify execution order for a unit's skills. This is a critical design decision:

- **Option A: Fixed order (compress → filter → amplify):** Deterministic, predictable. Players learn one pipeline and optimize within it.
- **Option B: Player-configurable order:** Rules specify which skill fires when. A rule like "IF buffer_fill > 8 THEN compress ELSE filter" creates adaptive processing. More expressive but harder to debug.
- **Option C: Simultaneous with priority:** All three skills evaluate each tick. Compress and filter compete for the same entries. Priority settings determine which wins.

**Recommendation:** Option B aligns with the game's philosophy — rules govern everything. The relay's three skills are powerful verbs; rules determine the grammar.

**The single-unit pipeline problem:** A relay running all three skills every tick is busy. Compress needs N entries accumulated. Filter checks every entry. Amplify broadcasts everything that survived. At high signal volume, the relay's 12-slot buffer becomes a bottleneck — entries arrive faster than the pipeline can process them. This teaches **throughput design**: sometimes you need two relays in series (one compresses, one filters and amplifies) rather than one relay doing everything.

**Sensory:** A relay running the full chain is visually distinctive. Incoming signals flow in (buffer pips light up). Three sequential animations play in rapid succession: merge (compress) → dissolve (filter) → rings (amplify). The relay looks like a machine processing data — a visible, animated pipeline. A relay running at capacity shows all three animations overlapping, creating a dense visual cluster. A player watching in Inspector can pause on each step and see the buffer state between each skill activation.

---

#### **Reassign + Hack** (The Counter-Intelligence Pivot)

**How it works:** A command unit receives hacked intelligence revealing the enemy's scout patrol route. The command uses reassign to deactivate a friendly scout's patrol and activate evade-only, positioning the scout as a decoy on the enemy's known patrol route. The enemy scout reports the decoy's position; the enemy acts on that information; meanwhile, the player's real attack comes from the unmonitored flank.

**Why it matters:** This is the first purely strategic combo. No direct combat improvement. Instead, it manipulates what the enemy's scouts observe, poisoning their intelligence pipeline. The player is attacking the enemy's attention system, not their units. This is the moment the game delivers on its promise: you're playing in the information domain.

**Three-unit dependency:** This combo requires: (1) specialist to hack, (2) command unit to analyze and reassign, (3) scout to accept the reassignment. If any unit's rules don't respect command overrides, the chain breaks. The player must have configured subordination rules on the scout — a decision made in the Plan phase that pays off (or doesn't) during execution.

**The Sacrifice Play:** The decoy scout will be found. The enemy striker will engage it. One-shot, one-kill — the decoy dies. The player has sacrificed a 3-mineral unit to misdirect the enemy's attention for 5-10 ticks. Was it worth it? Inspector reveals: during those 5-10 ticks, the enemy's relay was forwarding decoy positions instead of real threat data. The enemy's command unit made decisions based on stale intelligence. The player's flanking strikers arrived undetected.

**Sensory:** The reassign fires — a yellow arrow points from the command unit toward Scout-B. Scout-B flashes yellow, accepting the override. Its cyan patrol line vanishes. Scout-B stops moving purposefully; it drifts into the enemy's expected zone, then freezes — evade-only means it only moves when threatened. The enemy scout spots it: a yellow ping on the enemy side. The enemy relay forwards the sighting. Meanwhile, on the opposite flank, the player's strikers advance in darkness — no enemy perception covering them. The board has two visual stories: a brightly lit eastern side (where the decoy draws attention) and a dark western side (where the real attack develops). When the strikers engage, the crimson flashes on the dark side are shocking — the enemy had no visual warning.

---

#### **Prioritize → Compress** (The Memory Sculpting Chain)

**How it works:** A command unit uses prioritize to tell a relay "preserve intelligence entries, evict threat_detected first." The relay, now prioritizing intelligence data, compresses its threat entries aggressively (threshold 2 — merge any pair of threats immediately) to make room for intelligence signals. The relay becomes an intelligence-preserving node that still processes threat data, but treats threats as expendable cache and intelligence as permanent storage.

**Why it matters:** This combo turns the relay's buffer into a designed memory hierarchy — hot data (intelligence) in preserved slots, cold data (threats) in evictable slots, compressed data as a middle tier. The player is building a cache architecture using game primitives that map directly to real cache design concepts (LRU vs. LFU, hot/cold tiering, compression as space reclamation).

**The dynamic reprioritization:** If the command unit later detects a different threat pattern, it can reprioritize the same relay — swap intelligence for threat preservation. The relay's behavior changes mid-battle without any change to its own rules. The command unit is tuning a subordinate's memory, not its behavior. This is the "factory that builds the factory" feeling: the player configured a command unit that dynamically tunes a relay that processes data from scouts.

**Sensory:** When the command unit fires prioritize, no visible change on the board — it's internal. But in Inspector, clicking the relay reveals the shift: intelligence entries (green, jagged border) now glow steadily bright, while threat entries (red) dim to half-brightness. A small crown icon appears on preserved entries. As new data flows in, threat entries compress rapidly (merge animations fire frequently) while intelligence entries accumulate untouched. The buffer bar becomes visually stratified — a bright green core surrounded by flickering, compressing red entries. It looks like a gemstone forming under pressure.

---

#### **Extract + Engage** (The Dual-Use Striker Escort)

**How it works:** A specialist extracts resources at a node. A striker, positioned adjacent to the same node, stands guard. The specialist's hook broadcasts its position on a "guarded_assets" channel. If an enemy approaches, the striker's rules trigger engage. The specialist keeps extracting, protected by dedicated muscle.

**Why it matters:** This is the game's first economy-defense pairing. It teaches resource denial as a strategic concept — if you can protect your extraction points while threatening the enemy's, you win the economic game. The striker isn't attacking; it's defending. This reframes the striker as a versatile unit, not just an assault weapon.

**The escort dilemma:** A striker guarding a specialist is a striker not attacking. If the enemy doesn't contest the node, the escort is wasted. If the enemy sends two units, one striker might not be enough. The player must decide how many extractors to protect, how heavily, and when to pull escorts for offensive operations. This is the classic RTS army split problem, but expressed through attention architecture rather than direct micro.

**The specialist's dual nature:** The specialist could be hacking instead of extracting. Hack generates intelligence; extract generates resources. Assigning a specialist to extraction is choosing economy over information. When the player has two specialists, the decision becomes: "one hacking, one extracting" (balanced), "both extracting" (economy rush), or "both hacking" (intelligence all-in). The skill interaction isn't between extract and engage — it's between extract and hack within the specialist's own identity.

**Sensory:** The specialist tethers to the resource node — amber pulse, data streams, floating "+2m" text. The striker stands one tile away, idle pose, narrow perception radius (2 tiles) glowing faintly red. Nothing happens for many ticks. Then an enemy scout enters the striker's perception. The striker's buffer bar lights up (one red pip). If the enemy moves adjacent — instant crimson flash, destroyed sprite, metallic clang. The specialist doesn't flinch; it keeps extracting. The "+2m" text keeps floating. The striker returns to idle. The guarded extraction continues like nothing happened. The visual story: the bodyguard did its job so efficiently that the asset never noticed the threat.

---

### Tier 3: Emergent Combos (The "I Didn't Program This" Moments)

These are combinations that no single player intentionally designs. They emerge from the interaction of independently configured agents across multiple units and channels. Discovering these combos is the game's peak experience.

---

#### **The Cascade Flanking Maneuver**

**Components:** 2 scouts (patrol + evade), 1 relay (compress + amplify), 2 strikers (engage), hooks on channels "recon" and "converge"

**How it emerges:** Scout-A patrols the northern sector, Scout-B the southern. Both send observations on "recon." The relay compresses northern and southern observations separately, producing two trajectory summaries. It amplifies both on "converge." Both strikers receive the amplified summaries. Striker-A's rules say "IF buffer contains enemy trajectory south of row 4 THEN move south." Striker-B's rules say "IF buffer contains enemy trajectory north of row 4 THEN move north." If both scouts observe the same enemy cluster in the center, both strikers converge — one from north, one from south. Pincer attack. Simultaneous engage on the same tick.

**Why it's emergent:** No one programmed "execute pincer attack." Each striker has a simple directional rule. The relay doesn't know about the pincer — it just processes and forwards. The scouts are unaware of each other's routes. The flanking maneuver emerges from the intersection of five independent configurations when the enemy happens to be in the center of the board.

**When it fails:** If the relay's buffer is full when the second scout report arrives, one of the compressed signals gets evicted. Only one striker converges. The "pincer" becomes a solo rush, and the lone striker dies to enemy numbers. Buffer capacity determines whether the emergent combo fires. The player who discovers the cascade flanking in Inspector can trace the failure to the relay's buffer — one missing pip, one missing striker, one dead unit.

**The TikTok clip:** Top-down 8×8 board. Two cyan scout dots tracing their patrol paths, rippling blue. A relay in the center, antenna pulsing. Two red striker dots converging from opposite edges, closing on a cluster of three enemy units. Tick 32: double crimson flash. Two enemies eliminated simultaneously. The caption: *"I didn't program the flanking. I programmed attention."*

**Sensory:** The approach is tense. Both strikers moving inward, their narrow perception fields (faint red glows) not yet overlapping with the enemy cluster. The relay's amplify rings pulse outward every 3 ticks — green rings expanding, overlapping the strikers' paths. Then both strikers reach adjacency on the same tick. Two crimson flashes, synchronized, at positions D4 and D6 — the enemy cluster caught in the middle. Two sharp metallic clangs, slightly offset for stereo spread. The remaining enemy unit is now flanked, one tile from each striker. Next tick: another double flash. The cluster is eliminated in two ticks. The board goes quiet. The scouts keep patrolling, unaware of the violence their observations caused.

---

#### **The Echo Chamber Collapse**

**Components:** 2 relays (amplify + amplify), hooks wired to each other's output channels

**How it emerges:** Relay-A amplifies on channel "alpha." Relay-B listens on "alpha" and amplifies on "beta." Relay-A listens on "beta." A single signal entering this loop gets amplified twice per cycle: Relay-A amplifies → Relay-B receives and amplifies → Relay-A receives the amplified-amplified signal. Each amplification adds a priority flag. After 3 cycles, the signal has 6 priority flags and is essentially immortal in any buffer — it can never be evicted.

**Why it's a degenerate strategy:** Every unit connected to either "alpha" or "beta" receives this hyper-amplified signal. Their buffers fill with copies of the same increasingly-prioritized entry. Legitimate signals can't compete — they get evicted immediately because the echoed signal has overwhelming priority. The entire network becomes deaf to new information, endlessly circulating one ancient observation. The architecture has created a memory leak.

**The teaching moment:** This is the game's most visceral demonstration of why feedback loops in information systems are dangerous. The player watches their army go blind — scouts keep observing, but no unit acts on fresh data because their buffers are choked with echoed garbage. Inspector reveals the buffer state: every unit shows the same entry repeated in every slot, all glowing maximum priority, all timestamped from 30+ ticks ago. The player learns: **amplification without termination conditions is self-destruction.**

**The fix:** The player needs one of: (1) a filter rule on Relay-B that discards signals already marked as amplified ("don't amplify amplified signals"), (2) a TTL mechanism — signals carrying a hop count that increments each time they're forwarded, discarded when they exceed a threshold, (3) a deduplication rule that checks signal identity before amplifying. Each fix teaches a different principle: filtering, TTL, or deduplication — all standard solutions to broadcast storms in real networking.

**Sensory:** It starts beautifully — two relays pinging in rhythm, green rings expanding from each in alternating pulses. For 5-6 ticks it looks like a healthy communication network. Then the rings start overlapping. The pulse frequency increases as echoed signals trigger faster amplification. By tick 15, both relays are constant green — rings overlapping so densely that the area around them is a solid green haze. The buffer bars on nearby units transition from healthy multi-colored pips to solid, pulsing bars of a single color — the echoed signal consuming every slot. Units stop moving purposefully. Strikers stand idle despite enemies nearby. Scouts patrol but their observations vanish — evicted by the priority monster in every buffer. The visual tells the story: the network is screaming so loud that no one can hear.

---

#### **The Sentinel Web**

**Components:** 3 scouts (patrol + evade), 2 relays (compress + filter + amplify), hooks creating overlapping coverage zones

**How it emerges:** Three scouts patrol overlapping sectors. Their observation channels ("north-recon", "mid-recon", "south-recon") each feed a relay. But the two relays share a unified output channel ("combined-intel"). Each relay compresses its sector's observations, filters out stale data (older than 5 ticks), and amplifies fresh data. The overlapping scout paths mean the center of the board is covered by all three scouts. The relays' filter-for-freshness means only the most recent observation of each enemy survives — even if three scouts report the same enemy, only the freshest report reaches the strikers.

**The emergent property:** This architecture has **graceful degradation**. If Scout-A is destroyed, the center is still covered by Scout-B and Scout-C. If Relay-A goes down, Relay-B still receives from the mid and south scouts. The network self-heals because the overlapping coverage zones and unified output channel create redundancy that no single unit's destruction can eliminate. The player didn't design fault tolerance — they designed overlapping coverage, and fault tolerance emerged.

**When a player discovers this:** In Inspector, after losing Scout-A to an enemy striker at tick 20, the player scrubs forward expecting their intelligence to go dark. Instead, the combined-intel channel keeps producing fresh data. They click on Relay-B's buffer and see: Scout-B observed the same enemy at tick 21 that Scout-A would have reported. The gap is 1 tick. The architecture compensated automatically.

**The veteran optimization:** An experienced player designs the sentinel web deliberately, then adds a command unit monitoring for "scout_destroyed" signals. When a scout dies, the command uses reroute to redirect a surviving scout's patrol to cover the dead scout's sector. The emergent fault tolerance becomes designed fault tolerance — the player has closed the loop from discovery to engineering.

**Sensory:** Three cyan dotted patrol lines crisscrossing the board, overlapping in the center like a Venn diagram. Three scouts rippling blue in rhythm — but slightly offset, creating a rolling wave of blue across the center tiles. The relays receive this stream: one on the left side of the board, one on the right. Their buffer bars fill and compress in parallel — synchronized blue-white merge animations. The amplified output flows to strikers as a steady, clean pulse. When Scout-A is destroyed (crimson flash, destroyed sprite), the remaining patrol lines shift slightly — the overlapping coverage shrinks but doesn't vanish. The relay buffer bars show a brief dip (one fewer data source) but recover within 2 ticks as the surviving scouts' observations fill the gap. The visual metaphor: a spider web with one strand cut — the whole structure flexes but holds.

---

### Tier 4: Degenerate Strategies (The Traps)

These are skill interactions that seem powerful but lead to catastrophic failure modes. The game should be designed so that players naturally discover these traps and learn to avoid them.

---

#### **The Amplify Spiral** (covered above as Echo Chamber)

**Signature:** Mutual amplification creates unbounded priority escalation.
**Teaching moment:** Feedback loops in information systems require termination conditions.

---

#### **The Evade Flood**

**Signature:** Multiple scouts with evade on the same alarm channel. Each evade generates a threat_detected entry. All scouts hear each other's alarms via a shared channel. Hearing another scout's alarm triggers evade (the scout moves away from the reported threat even if it's not nearby). The scouts enter a feedback loop of self-generated panic — each evade causes more evades across the network.

**The cascade:** Tick 10: Scout-A evades an actual enemy. Broadcasts on "alarm." Tick 11: Scout-B receives the alarm, evaluates threat proximity... but the alarm signal doesn't contain distance data (just position). Scout-B's rules interpret any threat_detected signal as "danger nearby" and evade fires. Scout-B broadcasts its evade on "alarm." Tick 12: Scout-A receives Scout-B's alarm. Evade again. Both scouts are now bouncing around the board, evading phantom threats created by each other's alarms.

**The fix:** (1) Include distance-to-threat in the evade rule condition: "only evade if threat is within perception radius 5." (2) Use the filter skill on a relay to deduplicate alarms before forwarding. (3) Add signal provenance to evade entries and filter out self-referential alerts. Each fix teaches a different concept: distance-aware rules, deduplication, and provenance tracking.

**Sensory:** Two cyan scout dots bouncing erratically across the board — red flinch, move, red flinch, move — like two birds startling each other. Their buffer bars are solid red (all threat_detected entries). The relays connected to "alarm" are overwhelmed — green amplify rings firing continuously. The entire network is in panic mode over a single original enemy sighting. The visual is almost comedic — the player watches their carefully designed intelligence network devolve into two scared dots bouncing off walls. It's funny the first time, instructive the second time.

---

#### **The Command Micromanagement Trap**

**Signature:** A command unit with rules that trigger reassign/reroute/prioritize every tick based on every new piece of information.

**The cascade:** The command unit receives a scout report: "enemy at D4." It reassigns a striker to intercept. Next tick: "enemy at D5." It reroutes a relay to cover D5. Next tick: "enemy at D6." It reprioritizes a relay's buffer. The command unit is reacting to every data point rather than patterns. Each reassign/reroute/prioritize takes 1 tick to reach its target. By the time the striker processes the "intercept D4" command, the enemy is at D6 and the command has already issued a new, contradictory order. The subordinates are constantly being reconfigured, never completing any action.

**The real-world parallel:** This is literal micromanagement — the AI engineering equivalent of a Kubernetes operator that restarts pods on every log warning. The game teaches: command units should react to patterns (compressed/filtered data), not raw signals. A command unit listening to uncompressed scout data is a manager reading every Slack message in real time.

**The fix:** Insert a relay between the scouts and the command unit. The relay compresses and filters, so the command unit receives trend data ("enemy moving south through column D") instead of point data ("enemy at D4, D5, D6..."). The command's rules then fire less frequently on higher-quality information.

**Sensory:** Yellow arrows cascade downward from the command unit every tick — reassign, reroute, prioritize, all firing in rapid succession. Target units flash yellow constantly, their active skills flickering as they're reassigned and re-reassigned. Channel wiring lines detach and reattach every other tick, creating a visual tangle. The command unit's buffer bar is full of raw data, all equally bright. Nothing is compressed. Nothing is filtered. The board looks like a switchboard having a seizure. Compared to the calm, rhythmic pulse of a well-architected command chain, this is visual chaos — and the player can see the difference.

---

## The Interaction Grid: All 12 × 12

Each cell describes what happens when Skill A's output reaches a unit with Skill B. Empty cells are inert (no meaningful interaction). Cells marked ⚡ are synergies. Cells marked ☠ are traps. Cells marked 🌟 are emergent combos.

| | patrol | evade | engage | breach | compress | filter | amplify | hack | extract | reassign | reroute | prioritize |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **patrol** | — | Self: patrol generates observations that fill buffer, potentially triggering evade when threat enters perception range | ⚡ Patrol data enables striker positioning for engage via hooks | ⚡ Patrol reveals structures for breach targeting | ⚡ **Core pipeline**: patrol → compress reduces observation volume | ⚡ Filter removes low-value patrol data | ⚡ Amplify boosts critical patrol findings | Patrol reveals enemy positions for hack approach planning | Patrol maps resource nodes for extract optimization | Patrol data informs reassign decisions | Patrol coverage gaps inform reroute needs | Patrol volume informs buffer prioritization |
| **evade** | Evade interrupts patrol path | — | Evade moves scout away, preventing friendly engage on adjacent enemies | Evade cancels breach commitment (if evade fires during breach window) | Evade entries compress into threat summary | ⚡ Filter prevents evade spam from flooding network | ☠ **Alarm fatigue**: amplified evade flood | Evade moves specialist away from hack target | Evade interrupts extraction | Evade entries trigger reassign rules | ⚡ Evade patterns trigger reroute to defensive channels | Evade frequency triggers buffer reprioritization |
| **engage** | Engage eliminates units that patrol could observe | Engage eliminates the threat that triggered evade | — | Engage clears escorts before breach | Engage results compress (kill log) | Kill notifications filtered if low-priority | ⚡ Amplified kills confirm area cleared | Engage eliminates hack targets before data extracted | Engage protects extraction zones | Kill count informs reassign (redeploy striker) | Kill location informs reroute (area cleared) | Post-engage buffer cleanup via prioritize |
| **breach** | Breach completion reported on patrol channels | — | ⚡ Engage + breach: strikers clear escort then breach structure | — | Breach status compresses with engage reports | Filter breach updates to reduce chatter | ⚡ Amplified breach status coordinates cover | — | Breach destroys enemy production (indirect extract value) | Breach status triggers reassign (redeploy post-breach) | 🌟 Breach start triggers reroute to "cover_me" channel | Breach duration prioritizes defensive intel |
| **compress** | Compressed patrol data is higher value per slot | Compressed threat summaries more informative than raw evades | ⚡ Compressed trajectories enable predictive engage positioning | Compressed intel identifies breach targets | ☠ **Double compression**: compressing already compressed signals loses too much fidelity | ⚡ **Pipeline**: compress then filter for clean output | ⚡ **Pipeline**: compress then amplify for efficient broadcast | Compressed intel enhances hack target selection | — | ⚡ Compressed data is better input for reassign decisions | Compressed channel load informs reroute | — |
| **filter** | Filtered patrol data is pre-cleaned | Filtered evade data reduces noise | Filtered engage data focuses on relevant kills | — | ⚡ **Pipeline**: filter then compress removes noise before batching | — | ⚡ **Pipeline**: filter then amplify prevents noise amplification | Filtered intelligence isolates key findings | — | Filtered data improves reassign accuracy | — | — |
| **amplify** | Amplified patrol data has broadcast priority | ☠ **Amplified evade flood** | Amplified kills serve as area-denial signals | ⚡ Amplified breach status rallies cover | ☠ **Echo chamber** if amplified compressed signals re-enter compression | — | ☠ **Double amplify spiral**: mutual amplification feedback | Amplified intelligence reaches entire network | — | Amplified command overrides have priority | — | — |
| **hack** | Hacked enemy patrol routes inform own patrol design | — | Hacked enemy buffer reveals engage opportunities | Hacked data reveals structure locations | ⚡ Hacked intel compressed for efficient forwarding | Filter isolates actionable hacked data | ⚡ Amplified hack results = network-wide intelligence | — | Hacked economic data informs extract priorities | 🌟 **Counter-intel pivot**: hacked data triggers reassign for deception | 🌟 **Intelligence-driven reroute** | Hacked data informs what to prioritize |
| **extract** | — | — | — | — | — | — | — | — | — | — | — | — |
| **reassign** | Reassign changes scout patrol behavior | Reassign can force evade-only mode (decoy creation) | Reassign can activate/deactivate engage on strikers | — | — | — | — | — | Reassign can repurpose specialist from hack to extract | — | ⚡ Reassign + reroute = full unit reconfiguration | ⚡ Reassign + prioritize = full subordinate tuning |
| **reroute** | Reroute changes which channels receive patrol data | — | Reroute directs engage-relevant data to strikers | — | Reroute changes which relays compress which data | Reroute changes filter targets | Reroute changes amplification network topology | Reroute directs hack intel to specific recipients | — | ⚡ Reroute + reassign = full reconfiguration | — | ⚡ Reroute + prioritize = network + memory tuning |
| **prioritize** | Prioritize affects which patrol data survives in buffer | — | — | — | Prioritize determines what compress preserves | Prioritize and filter are complementary memory management | — | Prioritize preserves hacked intel | — | ⚡ All three command skills in concert = total subordinate control | ⚡ | — |

---

## Player Journeys

### Journey: Sofia, 31, Backend Engineer at a Fintech Startup

**Context:** Mission 5. Sofia has scouts, strikers, and relays unlocked. She's just gotten access to the factory and is building her first production queue. She's played 200 hours of Factorio and thinks about everything in terms of throughput.

**Minute 0:00 — The Throughput Problem**
The Plan screen shows the board with her base at A1. The production queue (horizontal conveyor belt strip) has three blueprint icons: Scout, Relay, Striker. The workbench shows her Scout-A blueprint: patrol path covering the middle of the board, evade enabled, hook sending observations on "recon." Her Relay-A blueprint: compress (threshold 3), filter (remove observations older than 5 ticks), amplify on "action." Her Striker-A: engage, rules listening on "action" channel.

She clicks EXECUTE, expecting her pipeline to work. Sealed Watch begins.

Tick 1-5: Scout deploys, starts patrolling. Blue ripples. Observations filling buffer (blue pips).
Tick 6: First hook fires — thin cyan line from scout to relay. Relay receives 3 observations.
Tick 7: Relay compresses. Three pips merge into one brighter pip. Blue-white antenna flash.
Tick 8: Relay filters — one stale entry dissolves (ghost pip, pop sound).
Tick 9: Relay amplifies — green rings expand outward. Compressed signal broadcasted on "action."
Tick 10: Striker receives the signal. Buffer bar shows one green pip (compressed, priority-flagged). Striker's rules evaluate: enemy trajectory south through column D. Striker moves toward D6.

Sofia nods. The pipeline works. Observe → transmit → compress → filter → amplify → act. Each step is one tick. Total latency: 4 ticks from observation to striker response. She's measuring latency in ticks the way she measures API response time in milliseconds.

**Minute 1:30 — The Buffer Overflow**
Tick 15: Three enemy scouts appear simultaneously. Scout-A's perception radius catches all three. Six observations in one tick — but the buffer only has 6 slots. The three oldest observations are evicted to make room. Scout-A's hook fires, but it can only transmit what's in the buffer — the evicted observations are gone.

Tick 16: Relay receives 3 observations (the surviving ones). Compress fires — but the threshold is 3, and all three observations are of different enemies. No compression possible (compress requires same-target entries). The relay's buffer fills with 3 uncompressed entries.

Tick 17: Three more observations arrive from the scout. Relay buffer now at 6/12 — still room, but no compression happening because each enemy is unique.

Tick 20: Relay buffer at 10/12. Still no compression — diverse enemy types prevent merging. Filter removes 2 stale entries (pop, pop). Amplify fires on the remaining 8 entries — green rings expand, but 8 amplified signals hit the striker simultaneously.

Tick 21: Striker's buffer (8 slots) receives 8 amplified entries. All 8 are high priority. Rules evaluate: 8 different enemy positions, no clear trajectory for any one enemy. The striker can't decide where to move. It stands still, buffer full, paralyzed by information overload.

**Minute 2:30 — The Inspector Diagnosis**
Sofia opens the Inspector. She clicks the striker at tick 21. Buffer state:

```
Slot 1: [compressed] enemy_scout_A, pos D4, tick 19 — PRIORITY ▲
Slot 2: [compressed] enemy_scout_B, pos F6, tick 19 — PRIORITY ▲
Slot 3: [compressed] enemy_scout_C, pos B7, tick 19 — PRIORITY ▲
Slot 4: [observation] enemy_striker, pos G3, tick 18 — PRIORITY ▲
Slot 5: [observation] enemy_scout_A, pos D3, tick 17 — PRIORITY ▲
Slot 6: [observation] enemy_scout_B, pos F5, tick 17 — PRIORITY ▲
Slot 7: [observation] enemy_striker, pos G2, tick 16 — PRIORITY ▲
Slot 8: [observation] enemy_scout_C, pos B6, tick 16 — PRIORITY ▲
```

Eight entries, all priority-flagged from amplify. No eviction possible — all are equal priority. The striker's rules find multiple matching targets and pick the first one... which changes every tick as new data evicts the first slot.

Sofia gets it instantly. "I'm amplifying everything. The relay is a megaphone with no volume knob. I need the filter to be smarter — filter by distance to striker, not just by age."

**Minute 3:30 — The Fix**
She returns to Plan. She opens Relay-A's filter rule. Changes it from "remove observations older than 5 ticks" to "remove observations where target distance to nearest striker > 3 tiles." Now the relay only forwards threats that a striker can actually reach.

She also changes the amplify rule: "amplify only if buffer contains breach_in_progress or threat_count ≤ 2." Now the relay amplifies only when there's a critical alert OR when the signal volume is low enough to be actionable.

Second EXECUTE. The pipeline runs cleaner. Striker receives 1-2 relevant, amplified signals per cycle instead of 8 irrelevant ones. It locks onto the nearest enemy and engages.

Sofia thinks: "This is rate limiting. I built a circuit breaker on the relay." She's mapping game mechanics to engineering patterns she already knows.

**UI Annotations:**
- Production queue: horizontal strip of blueprint icons (drag to reorder), cost preview below each icon, left-to-right = build order
- Relay filter rule editor: condition builder with dropdown menus (target attribute → comparison operator → value), real-time preview showing which current buffer entries would survive
- Amplify rule editor: same condition builder, with "signal volume meter" showing estimated signals per tick at current settings
- Striker buffer state in Inspector: vertical list of entries, priority arrows (▲) shown as upward-pointing yellow triangles, entries that match active rules are highlighted with a green border

---

### Journey: Dayo, 17, First Strategy Game

**Context:** Mission 3. Dayo has scouts and relays. He's never played a strategy game before — he found Robot Uprising through a TikTok of the cascade flanking maneuver clip. He wants to make his robots "do the thing."

**Minute 0:00 — Trying to Recreate the Clip**
Dayo has seen the pincer attack TikTok. He has two scouts and one relay. No strikers yet (those unlock in Mission 3b or are pre-placed). The mission objective is to observe all four enemy relay positions without getting caught.

He draws patrol paths for both scouts — aggressive routes that crisscross the board. He wires hooks: Scout-A sends on "recon-north", Scout-B sends on "recon-south", both channels feed Relay-A. He enables compress on the relay.

The Plan screen shows the board with two dotted cyan lines crisscrossing and a relay in the center, channel wiring lines connecting all three units. The ghost preview shows the scouts tracing their paths, the relay pulsing.

**Minute 0:30 — EXECUTE**
Sealed Watch. Both scouts move. Blue ripples expanding from each, overlapping in the center of the board. The relay receives observations on both channels — its buffer fills steadily. Compress fires when three observations of the same enemy relay accumulate. The merge animation plays — three pips slide together, blue-white flash on antenna.

Tick 8: Scout-A spots Enemy Relay 1 at D2. Observation enters buffer, forwarded to Relay-A. Relay-A hasn't hit the compression threshold yet.

Tick 10: Scout-B passes D3. Also spots Enemy Relay 1. Another observation forwarded. Now Relay-A has two observations of the same target — one more for compression.

Tick 12: Scout-A circles back. Third observation of Enemy Relay 1. Compress fires! Three entries merge into one: `{enemy_relay_1, position D2, stationary, ticks 8-12}`. The compressed entry is brighter, wider in the buffer bar. Dayo sees the visual merge and grins — "It combined them!"

**Minute 1:30 — The Discovery**
Tick 20: Both scouts have covered most of the board. Relay-A's buffer shows 4 compressed entries — one per enemy relay position. The mission objective updates: "All 4 enemy relays located ✓". Mission complete!

But Dayo notices something in the relay's buffer that wasn't in his plan. One of the compressed entries reads: `{enemy_relay_3, position G5, intermittent signal emission detected, ticks 15-19}`. The relay didn't just compress positions — it compressed *behavioral data*. The scout had observed the enemy relay emitting signals (green rings) during some ticks and not others. The compression preserved this pattern.

Inspector shows: at ticks 15, 17, and 19, the enemy relay emitted signals. At ticks 16 and 18, it was silent. The compression algorithm noticed the pattern and flagged it: "intermittent signal emission."

Dayo didn't configure this. The compress skill is smart enough to detect and preserve behavioral patterns, not just positions. He thinks: "The relay figured out the enemy's schedule. That's... really cool."

**Minute 2:30 — Planning Ahead**
The debrief suggests: "Your relay detected an enemy transmission pattern. In future missions, this kind of compressed intelligence can inform striker timing — attack when the enemy relay is silent (no alarm broadcast)."

Dayo realizes: the compress skill isn't just about saving buffer space. It's about extracting meaning from raw data. Three observations become one insight. The relay isn't a dumb repeater — it's an analyst.

He's thinking about Mission 4, where he'll have strikers and hooks. "If I can get the relay to tell the strikers WHEN the enemy relay is silent, they can attack during the gap..."

This is the game planting the seed for the timing-based combo: **compress detects pattern → filter isolates silence window → hook signals striker → engage during enemy communication gap**. Dayo hasn't been taught this combo. He's imagining it himself, from the compressed behavioral data he accidentally discovered.

**UI Annotations:**
- Compressed entry visual: wider pip in buffer bar, diamond icon, brighter glow than raw entries
- Behavioral compression: when compress detects a temporal pattern, the compressed entry includes a mini-timeline icon (3 dots = intermittent, solid bar = continuous, fading bar = decreasing)
- Mission objective overlay: transparent checklist in top-left, items check off with a satisfying small green flash and chime
- Debrief suggestion: appears as a boot-log-style message after mission stats, typewriter text, cyan text for game concepts

---

### Journey: Priya, 45, Network Security Consultant

**Context:** Mission 8. Priya has the full unit roster including command units. She's been building increasingly sophisticated architectures. Her professional background in intrusion detection systems means she immediately understood the filter, hack, and amplify skills as network security primitives.

**Minute 0:00 — The Counter-Intelligence Architecture**
Priya's Plan screen shows a complex setup. She has three channels visible in the auto-generated channel map:
- "perimeter" (cyan): Scout observations, unfiltered
- "verified-intel" (green): Relay-processed, compressed, filtered data
- "command" (yellow): Command unit overrides

Her innovation this mission: a dedicated **counter-intelligence relay**. Relay-B is configured differently from her main signal relay:
- Compress: OFF
- Filter: ON — accepts ONLY hack-sourced intelligence entries (type: intelligence, jagged green border)
- Amplify: ON — broadcasts filtered intelligence on "verified-intel"

This means Relay-B is a dedicated intelligence processor that strips all non-intelligence signals. Only data sourced from the specialist's hack skill survives.

She also has the specialist on a new channel "raw-intel" that feeds exclusively into Relay-B. The specialist's hack output goes through one relay; the scouts' patrol output goes through another. The two streams never mix until they reach the command unit, which receives from both "verified-intel" and "perimeter."

**Minute 1:00 — The Trap Detects Itself**
She clicks EXECUTE. The battle unfolds. Her specialist creeps toward an enemy relay and hacks it at tick 14. Green siphon line, cascade of green text in buffer. The intelligence snapshot shows the enemy relay's buffer:

```
Enemy Relay buffer at tick 14:
Slot 1: [observation] friendly_scout at B3, tick 12
Slot 2: [observation] friendly_scout at C4, tick 13
Slot 3: [deception] false_report: striker at F7, tick 10
Slot 4: [command] "relay_inject: send false report on 'perimeter'"
```

Priya's specialist has captured evidence that the enemy is actively injecting false reports onto her "perimeter" channel. Slot 3 contains a deception signal the enemy relay was about to broadcast. Slot 4 reveals the command behind it.

The intelligence flows through Relay-B (filter: only hack data, amplify) to the command unit. The command unit's rules detect the deception:

```
IF buffer contains intelligence WITH deception_detected = true
THEN reroute all scouts: stop listening "perimeter", start listening "verified-intel"
AND reassign Specialist-A: activate hack, deactivate extract
AND prioritize Relay-A: preserve type intelligence, evict first any entry from "perimeter"
```

Tick 16-17: The command fires. Three things cascade:
1. Scouts disconnect from "perimeter" — they stop broadcasting there (the compromised channel dies). Channel line detaches with a click.
2. The specialist switches from economic mode (extract) to full intelligence mode (hack). Its sprite shifts posture — from tethered extraction to alert, probing stance.
3. Relay-A deprioritizes all data from the compromised channel, preserving intelligence entries instead.

**Minute 2:30 — The Network Heals Itself**
The deception attack fails because Priya's architecture detected it, isolated it, and rerouted around it — all autonomously. She watches in Sealed Watch as her scouts seamlessly switch to the clean channel. The enemy's false reports hit an empty "perimeter" channel — no one is listening anymore. The deception signals broadcast into silence.

Meanwhile, her specialist, now in hack mode, approaches a second enemy unit. More intelligence flows in. The command unit refines its picture of the enemy's architecture and adjusts her network further.

**Minute 4:00 — Inspector Revelation**
Priya opens Inspector and scrubs through the deception cascade. She sees the exact tick where the enemy's false report was injected. She follows the intelligence chain: specialist hack → Relay-B filter → command analysis → triple reroute/reassign/prioritize. The signal genealogy graph shows a clean green path (intelligence chain) branching into three yellow arrows (command actions).

She exports the replay with annotations: "Detected enemy deception at tick 14 via hacked buffer snapshot. Autonomous counter-measure at tick 16. Network isolation complete by tick 17. Total response time: 3 ticks."

She thinks: "This is an incident response playbook. My game architecture did exactly what a SOAR platform does — detect, analyze, contain, recover. In three ticks."

**UI Annotations:**
- Channel map panel: auto-generated, color-coded channels with unit connection counts, warning icon on channels receiving deception signals (post-Inspector analysis)
- Intelligence entry: jagged green border, 3 buffer slots consumed, expandable in Inspector to show full enemy buffer snapshot
- Deception flag: red warning triangle on entries identified as deceptive through hack comparison
- Command cascade in Inspector: timeline view showing the command's rule evaluation, each action as a branching arrow with tick number and target unit label
- Signal genealogy graph: expandable network visualization, green nodes for intelligence, yellow for commands, red for deceptive signals, edges show transmission direction and tick timing

---

## Interaction Effects with Other Design Dimensions

### Skills × Building Block Paradigms (Wave 3)
The skill interaction model heavily favors the **rules-as-ordered-list** building block paradigm. Skill combos require specific firing conditions, which ordered condition→action pairs express naturally. A node-graph paradigm might visualize the interactions differently — compress→filter→amplify as a literal data processing pipeline with wire connections — but the underlying interaction logic is the same.

### Skills × Buffer Models (Wave 2)
The **fixed-slot buffer** creates hard interaction constraints. The cascade flanking maneuver works with 8-slot striker buffers but fails with 6-slot scout buffers — the scout can't hold enough compressed data to generate a useful trajectory summary. Buffer size literally determines which combos are possible. The **weighted buffer** variant (2.02) would change the interaction space dramatically — a 3-slot intelligence snapshot in a weighted buffer consumes proportionally more, making hack combos more expensive.

### Skills × EM Emissions (Locked)
Skill interactions have emission profiles that compound. A patrol→compress→amplify chain generates moderate emissions (patrol quiet, compress silent, amplify loud). A hack→reroute→reassign chain is moderate-to-loud (hack quiet, reroute moderate, reassign moderate). Architectures that use more skill interactions are louder than simple architectures. This creates a natural cap on complexity — deeper architectures are smarter but more detectable.

### Skills × Campaign Pacing (Wave 5)
The skill interaction tiers map naturally to the 10-mission arc:
- Missions 1-2: Tier 1 combos only (patrol→compress, evade→amplify)
- Missions 3-4: Tier 1 mastery + Tier 2 introduction (relay signal chain, extract escort)
- Missions 5-7: Tier 2 mastery + first Tier 3 emergent discovery
- Missions 8-10: Tier 3 and Tier 4 experiences (cascade flanking, echo chamber, sentinel web, counter-intelligence)

### Skills × Sealed Watch (Locked)
Skill interactions are the primary visual spectacle of Sealed Watch. A well-architected army creates coordinated visual rhythms. A poorly designed army creates visual chaos. The sealed watch is where players SEE the quality of their skill interactions — they can't intervene, only observe. This makes the interaction quality viscerally legible: beautiful = working, chaotic = broken.

---

## Comparable Games

### **Factorio: Insertion→Belt→Assembler Chains**
Factorio's core interaction is between three systems: inserters move items, belts transport them, and assemblers transform them. The parallel to Robot Uprising is exact: scouts observe (inserters), relays process (assemblers), hooks transport (belts), and strikers act on processed data. Factorio's "main bus" design pattern (one central belt line feeding all assemblers) maps to Robot Uprising's "unified output channel" feeding all strikers. Factorio players discovering spaghetti belts = Robot Uprising players discovering echo chambers.

### **Slay the Spire: Card Synergies**
Slay the Spire's card synergies follow the same tier structure: Tier 1 = obvious combos (Bash + Strike), Tier 2 = build-around combos (poison deck, strength deck), Tier 3 = emergent combos (Corruption + Dead Branch creates infinite cards). The game's "infinite" combos (Dead Branch) are equivalent to Robot Uprising's echo chamber — they look broken but require setup and have failure modes. The discovery arc is identical: obvious → planned → accidental → degenerate → mastered.

### **Into the Breach: Position-Based Skill Chaining**
Into the Breach's core mechanic is using one attack's knockback to push an enemy into another attack's line of fire. This is a two-skill interaction with spatial constraints. Robot Uprising scales this to 12 skills with information constraints instead of spatial ones — the "line of fire" is the hook channel, and "knockback" is reroute.

### **TIS-100: Node Communication Patterns**
TIS-100's blocking port communication creates emergent behaviors when nodes deadlock or starve. The same patterns appear in Robot Uprising's hook semantics: a relay waiting for 3 entries to compress while receiving none (starvation), or two relays amplifying each other's output (deadlock-like feedback loop). TIS-100 players who mastered port communication will immediately recognize Robot Uprising's channel patterns.

---

## New Aspects Discovered

1. **3.03a — Skill execution ordering within a single unit:** When a relay has compress, filter, and amplify all active, what order do they execute in? Fixed pipeline, player-configurable, or simultaneous with conflict resolution? Major design decision affecting all relay strategies.

2. **3.03b — Degenerate strategy detection and in-game warnings:** Should the game detect echo chambers, evade floods, and micromanagement traps and warn the player? Options: never warn (pure discovery), warn in Plan phase ghost preview (spatial feedback), warn only in debrief (post-hoc learning), or warn via a dedicated "architecture linter" tool.

3. **3.03c — Skill interaction discovery UI:** How does the game help players discover combos? Options: no help (pure emergent discovery), "combo journal" that logs observed interactions, a "theory crafting" mode in Plan phase that simulates interactions without executing, community-shared "combo recipes."

4. **3.03d — The "silence detection" combo pattern:** The absence of signals on a channel as a trigger condition. Multiple combos require detecting what ISN'T happening (no data from west, enemy relay silent, no scout reports for 5 ticks). Is this expressible through current rules, or does it need a dedicated "watchdog" rule type?

5. **3.03e — Cross-match skill interaction stability:** Do the same skill combos produce the same results across the 100 randomized scenarios per mission? Which combos are robust (work regardless of enemy placement) vs. fragile (depend on specific spatial configurations)? Robustness as a hidden quality metric for skill interaction design.
