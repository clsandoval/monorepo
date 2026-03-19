# 2.16 — Counter-Intelligence as Offensive Mechanic: Hook Judo and Deceptive Signal Routing

**Aspect:** 2.16 — Counter-intelligence as offensive mechanic: deliberately leaving enemy-injected hooks active and routing deceptive signals through them; "hook judo" — using enemy infrastructure against them; how the game scaffolds this discovery moment; risk/reward of leaving a known intrusion active.
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

The Specialist unit has the `hack` skill. The enemy has signal infrastructure — hooks, channels, observation reports flowing between enemy units. The obvious play is defensive: detect enemy hooks injected into your units and remove them, filter out noise, harden your network. But what if the most powerful play is to *leave the enemy's hooks in place* and feed them lies?

This is **counter-intelligence as offensive mechanic** — the moment a player realizes that an enemy intrusion is not a vulnerability to patch but an *asset to exploit*. The enemy built a pipeline into your network. That pipeline goes both ways. You can send deceptive signals back through it, feeding the enemy false intelligence that corrupts their decision-making. You can observe the enemy's hook behavior to learn their signal architecture. You can time your deception to synchronize with your real attack, creating a devastating information advantage.

The design question is three-layered: (1) What are the mechanical primitives that make this possible within the locked four-primitive system? (2) How does the game teach players that this option exists without spelling it out? (3) What is the risk/reward calculus that makes it a genuine strategic choice rather than always-correct or never-worth-it?

---

## The Mechanical Foundation

### How Enemy Hooks Get Into Your Units

The `hack` skill (Specialist unit) can inject hooks into enemy units. The enemy has equivalent capability. When an enemy Specialist hacks one of your units, it installs a foreign hook — a reactive trigger that fires on one of the compromised unit's hook slots, transmitting data on an enemy channel.

**What the player sees in the Inspector after a compromised battle:** A Scout's hook slot 2, which the player left empty (or which the enemy overwrote), now shows a hook configured as `ON_PERCEIVE → SEND on enemy-recon-7`. Every tick the scout sees something, it also broadcasts to the enemy network. The enemy is reading your scout's perception data in real time.

**The naive response:** Remove the hook. Go back to Plan screen, clear slot 2, replace with a player-configured hook. Problem solved. This is the Mission 6-7 response — detect and remove.

**The advanced response (Hook Judo):** Leave the hook. Configure the scout's *other* hook slot and its rules to exploit the compromised channel. The enemy thinks they're reading raw perception data. Instead, the player configures the scout to generate *specific* perception outputs that flow through the enemy hook — outputs that are technically true observations but strategically misleading.

### The Five Moves of Hook Judo

**Move 1: "The Wiretap" (Passive Intelligence)**
Leave the enemy hook in place and observe when it fires. In the Inspector, you can see the hook's trigger condition and transmission channel. This tells you what the enemy wants to know (trigger type), how they're organized (channel name), and when they're paying attention (transmission frequency). Knowing the enemy's information architecture is worth more than closing one data leak.

**Move 2: "The Echo Chamber" (Noise Injection)**
Configure your compromised unit to generate maximum observations in a specific area — patrol a zone full of decoy signals, friendly tagged tiles, irrelevant terrain. The enemy hook faithfully reports everything the unit sees. The enemy relay receives a flood of low-value data, consuming buffer slots. If the enemy's context config isn't filtering aggressively, their units start overloading on noise you're injecting through their own infrastructure. This is a context window denial-of-service attack routed through the enemy's own hooks.

**Move 3: "The False Flag" (Targeted Deception)**
The most advanced move. Configure the compromised unit to patrol near a decoy position — an area where you're *not* planning to attack. The enemy hook reports "player scout observing sector D7-E8" and the enemy's rules interpret this as reconnaissance for an incoming assault. They reposition to defend D7. Your real attack comes from B2. The enemy moved their striker away from B2 because your compromised scout told them (truthfully!) that you were looking at D7.

**Move 4: "The Canary Trap" (Leak Detection)**
If you suspect multiple units are compromised, configure each one to observe a unique "canary" zone — a tile that only that specific unit can see. If the enemy responds to one canary's zone, you've identified which hook is the active leak. Named after the real intelligence technique of feeding different versions of a document to different suspects.

**Move 5: "The Feedback Bomb" (Cascade Attack)**
The most dangerous move for both sides. If your compromised unit's enemy hook transmits on a channel that feeds back into an enemy relay with a broad listen config, you can create a signal amplification loop. Your unit generates observations → enemy hook fires → enemy relay receives → relay amplifies → potentially re-triggers if the channel architecture loops. If the enemy has circular hook chains, you can inject a signal that reverberates through their network, consuming buffer slots across multiple enemy units simultaneously. This is a distributed denial-of-service attack using the enemy's own signal infrastructure as the amplification layer.

---

## Risk/Reward Calculus: "The Mole's Dilemma"

Leaving a known enemy hook active is a genuine gamble. The design must make this a *decision*, not a dominant strategy.

### Risks of Leaving the Hook Active

| Risk | Severity | Description |
|------|----------|-------------|
| **Real intelligence leak** | Critical | Every tick the hook fires, the enemy receives genuine data about your unit's surroundings. If your scout sees your striker's position, the enemy sees it too. |
| **Hook slot consumption** | Medium | The enemy hook occupies one of the unit's limited hook slots (Scout has only 2). You lose one slot for your own hooks. A scout with one slot compromised has 50% of its communication capacity dedicated to enemy traffic. |
| **EM emission cost** | Medium | The enemy hook fires each tick, generating EM noise. Your compromised unit is louder than intended, potentially attracting enemy strikers. |
| **Context window pressure** | Low-Medium | If the enemy hook generates return signals (acknowledgments, commands), they consume buffer slots. The compromised unit's context window fills faster. |
| **Cascading compromise** | High | If the enemy uses the hook to inject additional hacks via return channel, the compromise can deepen. The mole might become a double agent *against* you. |

### Rewards of Leaving the Hook Active

| Reward | Value | Description |
|--------|-------|-------------|
| **Architecture intelligence** | High | Knowing the enemy's channel names, hook triggers, and signal patterns reveals their information architecture — invaluable for planning counter-strategies. |
| **Deception channel** | Very High | A working pipeline into the enemy decision-making loop. No need to hack — they built the pipeline themselves. |
| **Overload weapon** | High | Noise injection through enemy hooks can stun-lock enemy units by overloading their context windows with junk data. |
| **Timing advantage** | Very High | Coordinated deception (false flag + real attack) creates information asymmetry that is nearly impossible for the enemy to counter without cutting their own intelligence feed. |
| **Operational security signal** | Medium | A hook that suddenly stops firing tells the enemy their intrusion was detected. Leaving it active maintains the illusion that the compromise is undetected. |

### The Decision Threshold

The mechanic creates a genuine dilemma when the player has **partial information** about the enemy's architecture. If you know exactly how the enemy processes your leaked data, Hook Judo is almost always correct — you control the narrative. If you don't know what the enemy does with the data, the risk of leaking real intelligence is harder to assess.

The game should escalate this uncertainty across missions:
- **Mission 7:** Enemy hacks are simple (ON_PERCEIVE → SEND). Easy to read, low risk to exploit.
- **Mission 8:** Enemy hacks have compound triggers (ON_PERCEIVE AND ENEMY_TAG → SEND). Harder to predict what leaks.
- **Mission 9:** Enemy hooks inject *back* — the compromised channel sends commands to your unit, not just reads from it. Now leaving the hook active means the enemy can issue behavioral commands through it.
- **Mission 10:** The enemy runs counter-counter-intelligence. They inject hooks that *detect* deceptive signal patterns and adapt their response. The player must out-meta the enemy's meta.

---

## Scaffolding the Discovery Moment: "The Aha Pipeline"

The counter-intelligence mechanic should NOT be taught through a boot log tutorial. It should be *discovered* through play and then *named* retroactively. This is the Baba Is You model — the rule exists before the player understands it.

### The Four-Stage Scaffold

**Stage 1: "The Burn" (Mission 6-7)**
The player's first encounter with enemy hacking. A Specialist hacks your scout. During sealed watch, the scout behaves normally but the Inspector reveals a foreign hook transmitting on an unknown channel. The boot log names this: `INTRUSION DETECTED — foreign hook on SCOUT-A, slot 2. Recommended: purge and reconfigure.` The player removes the hook. This is the correct response at this stage — it solves the immediate problem and teaches detection.

**Stage 2: "The Curiosity" (Mission 7-8)**
The player notices in the Inspector that the enemy hook transmitted on `enemy-recon-7` and wonders what that channel connects to. The Inspector's signal genealogy (if implemented) shows the signal path: their scout → enemy relay → enemy command. The player realizes the enemy has a whole signal architecture mirroring their own. A thoughtful player starts to wonder: "Could I use this?"

**Stage 3: "The Experiment" (Mission 8)**
The critical discovery mission. The player faces a scenario where simply removing all enemy hooks leaves them at a disadvantage — the enemy has more units, better positions, or faster production. The player needs an edge. A veteran player, remembering the enemy's signal architecture from the Inspector, tries something: leave the enemy hook on a scout, then patrol the scout near a decoy zone. They hit EXECUTE and watch. During sealed watch, the enemy striker repositions toward the decoy. The player's real attack hits the vacated position. In the debrief, the Inspector confirms: the enemy hook transmitted the false observation, the enemy relay forwarded it, the enemy striker responded. The player just ran a counter-intelligence operation.

**Stage 4: "The Name" (Mission 8 debrief)**
The boot log acknowledges the discovery: `ANALYSIS: SCOUT-A retained foreign hook on slot 2. Signal output on enemy-recon-7 contained... tactical misdirection? Efficient. Filing under: COUNTER-INTELLIGENCE PROTOCOLS.` The Blueprint Codex unlocks a new entry: "Hook Judo — Exploiting enemy intrusions as deception channels." The mechanic is now named, documented, and available as a deliberate strategy.

---

## Six Design Variations

### Variation A: "The Clean Room" — No Counter-Intelligence

Enemy hooks are strictly threats. Detect and remove. The hack skill is purely offensive (you hack them), and hacked units on both sides simply leak information until the hook is cleared. No mechanism exists to feed deceptive signals through enemy hooks.

**Strengths:** Simplicity. One clear response to intrusion. Hack/counter-hack stays simple.
**Weaknesses:** Misses the richest strategic layer. Hack becomes a binary "did they detect it or not" mechanic rather than an ongoing strategic game-within-the-game.

### Variation B: "The Wiretap Only" — Passive Counter-Intelligence

Players can observe enemy hook behavior in the Inspector but cannot actively manipulate what flows through the hook. The benefit of leaving a hook active is purely informational — you learn the enemy's channel names and signal architecture, which helps you configure your own units to avoid detection or target enemy relays.

**Strengths:** Low complexity. Intelligence gathering feels powerful without requiring deception mechanics.
**Weaknesses:** Limited strategic depth. The wiretap is always-correct once the player understands it — no risk/reward tension.

### Variation C: "Full Judo" — Active Counter-Intelligence (RECOMMENDED)

Players can leave enemy hooks active and manipulate what their unit observes (by choosing patrol routes, positioning, context config) to influence what the enemy hook transmits. The five moves (Wiretap, Echo Chamber, False Flag, Canary Trap, Feedback Bomb) are all possible through existing primitives — no new mechanics required.

**Strengths:** Maximum strategic depth. Every enemy hack becomes a decision point. The mechanic emerges naturally from existing primitives (patrol routes + enemy hooks + perception). Teaches real counter-intelligence concepts through gameplay.
**Weaknesses:** Hard to balance. If counter-intelligence is too strong, players never remove enemy hooks. If too weak, the risk isn't worth it. Requires the enemy AI to be sophisticated enough that deception actually changes outcomes.

### Variation D: "The Double Agent" — Dedicated Deception Skill

A new skill for the Specialist: `deceive`. When activated on a unit with a foreign hook, the Specialist creates a synthetic observation that the hook transmits as if it were real perception data. The player explicitly authors the false signal rather than manipulating the unit's patrol route.

**Strengths:** Clearest player intent. The deception is deliberate and unambiguous. Easy to balance (deceive costs energy, has cooldown).
**Weaknesses:** Adds a 13th skill to the locked 12. Removes the emergent "aha" of realizing patrol routes can serve as deception. Makes counter-intelligence feel like a button press rather than an architectural insight.

### Variation E: "The Honeypot" — Dedicated Trap Infrastructure

Players can configure a unit as a deliberate "honeypot" — a unit designed to be hacked. The honeypot has special context config that feeds curated observations to any hook installed on it, regardless of source. The player pre-configures the false intelligence before the enemy even hacks the unit.

**Strengths:** Proactive rather than reactive deception. The honeypot is a deliberate investment in counter-intelligence infrastructure. Creates a strategic "arms race" between hacking and honeypotting.
**Weaknesses:** Requires dedicating a unit to the deception role. A scout configured as a honeypot is not doing reconnaissance. The opportunity cost may be too high in a one-shot-one-kill game.

### Variation F: "The Progressive Judo" — Escalating Counter-Intelligence

Combines elements of B, C, and E across the campaign arc. Missions 6-7: Wiretap only (passive intelligence from enemy hooks). Mission 8: Full Judo unlocked (patrol-route-based deception emerges naturally). Mission 9: Honeypot config option unlocked (dedicated counter-intelligence infrastructure). Mission 10: Enemy counter-counter-intelligence forces the player to build adaptive deception networks.

**Strengths:** Gradual complexity ramp. Each mission adds a new dimension to the hack/counter-hack game. By Mission 10, the information warfare layer is as rich as the direct combat layer.
**Weaknesses:** Late-game complexity may overwhelm players who are still learning core mechanics. The counter-intelligence layer sits on top of the already-complex hook/channel system.

---

## Player Journeys

### Journey: Priya, 29, Backend Engineer

**Context:** Mission 8, first attempt. Priya has a solid understanding of hooks and channels from Missions 5-7. Last mission, she noticed enemy hacking for the first time and dutifully removed the foreign hooks per the boot log recommendation. This mission, she's facing a numerically superior enemy force on the Cebu urban map — dense terrain, short sightlines, enemy has two Specialists.

**Minute 0:00 — "The Compromise Detection"**
Priya opens the Inspector from her previous failed attempt. She scrubs to tick 8 and clicks her lead Scout. The context window panel shows six slots. Slot 3 glows with a faint crimson border — a foreign entry. She clicks slot 3 and the decision trace expands: `HOOK SLOT 2 [FOREIGN] — trigger: ON_PERCEIVE, channel: en-recon-4, source: ENEMY SPECIALIST at D6, tick 6.` Below, a signal genealogy line traces outward: her scout's perception data flowing to an enemy relay at F7, then to an enemy command unit at H8. She can see the enemy's entire intelligence pipeline.

She hovers over the signal path. A tooltip reads: `en-recon-4: 14 transmissions (T6-T20). Payload: raw perception dump.` The enemy has been reading everything her scout sees for 14 ticks. She frowns. Then she notices something: the enemy striker repositioned from G3 to C5 at tick 11 — three ticks after her scout observed her own striker moving through C4. The enemy used her scout's leaked perception to intercept her striker.

**Minute 1:30 — "The Realization"**
Priya stares at the signal genealogy. The crimson line from her scout to the enemy relay. She thinks about her own hook architecture — she built a similar pipeline for her own intelligence. And she thinks: *what if I controlled what flows through that crimson line?*

She switches to the Plan screen. Her scout has two hook slots. Slot 1: her own `ON_PERCEIVE → SEND on player-recon`. Slot 2: the enemy's `ON_PERCEIVE → SEND on en-recon-4`. She does NOT clear slot 2. Instead, she edits the scout's patrol route. Instead of sweeping the center of the board (where her real attack will come from), she draws the patrol through the eastern corridor — tiles E7 through H7. Her striker will attack from B2 in the west.

**Minute 3:00 — "The False Flag"**
She reconfigures her production queue. A second scout spawns early — this one with clean hooks, configured to sweep the real attack vector. The compromised scout patrols east, generating genuine observations about the eastern corridor. The enemy hook on slot 2 dutifully transmits: *player scout observing E7, E8, F7, F8.* To the enemy, this looks like reconnaissance for an eastern assault.

She hits EXECUTE.

**Minute 4:00 — "The Sealed Watch"**
The tick clock fires. Her compromised scout moves east, scanning tiles. At tick 4, a faint crimson pulse flickers from the scout — the enemy hook transmitting. She can't see the details during sealed watch, but she sees the enemy relay at F7 blink teal as it receives the signal. Three ticks later, the enemy striker begins repositioning from the center toward the east. Her clean scout, meanwhile, is quietly scanning the western approach. Her striker advances through B2, uncontested.

At tick 14, her striker reaches the enemy base. The enemy striker is at E6, defending the east against an attack that was never coming. Her striker breaches the enemy base at tick 15. Victory.

**Minute 5:00 — "The Debrief"**
The Inspector confirms everything. Signal genealogy shows 12 transmissions from her compromised scout to en-recon-4, all containing eastern corridor observations. The enemy command unit's decision trace shows: `tick 7: rule "IF recon_data contains eastern_sector → reposition STRIKER to E6" matched.` The enemy's own rules, fed with her curated intelligence, produced the wrong response.

The boot log types: `TACTICAL ANALYSIS: SCOUT-A foreign hook retained. Signal output exploited as deception vector. Enemy force repositioned to false target. COUNTER-INTELLIGENCE PROTOCOL: EFFECTIVE.`

Priya leans back. She just ran a counter-intelligence operation. The enemy's infrastructure — the hack they installed, the relay they built, the rules they configured — all worked perfectly. They just worked on false data.

**UI Annotations:**
- **Foreign hook indicator:** Crimson dashed border on hook slot, crimson pulse animation when transmitting during sealed watch
- **Signal genealogy (Inspector):** Crimson dashed line from compromised unit to enemy relay, with tick annotations showing transmission count and timing
- **Enemy decision trace:** Available only in Inspector, shows which enemy rule matched and which context entries were evaluated. Foreign-sourced entries highlighted with crimson background
- **Patrol route editor:** Drag-to-draw polyline on tactical preview. Compromised scout's route shown in amber; clean scout's route shown in teal

---

### Journey: Kai, 11, First Strategy Game

**Context:** Mission 7, second attempt. Kai lost Mission 7 on his first try — his scout kept dying and he didn't understand why. In the debrief, his older brother pointed out the crimson-bordered hook slot. "Something's wrong with your scout," his brother said. "See that red thing?" Kai removed the hook and won on his second attempt. Now he's on Mission 8, which introduces enemy Specialists who hack more aggressively.

**Minute 0:00 — "The Frustration"**
Kai's scout gets hacked again at tick 5. He's watching the sealed watch, sees the crimson pulse. He groans. "Not again." He knows from last mission: go to Plan, clear the hook, re-execute. But this time, the enemy hacks his scout *again* at tick 9. And again at tick 13. The enemy has two Specialists and they keep re-compromising his scout faster than he can clear the hooks.

He fails. Debrief shows his scout spent more time being re-hacked and cleared than actually scouting. He's losing the action economy — spending configuration turns removing hooks while the enemy spends those turns gaining intelligence.

**Minute 2:00 — "The Accident"**
Third attempt. Kai is frustrated with the hack-clear-hack loop. This time, when his scout gets hacked at tick 5, he thinks: "Fine. Keep your stupid hook. I'll just move my scout somewhere useless." He drags the scout's patrol route away from his army, sending it to the far corner of the map — tile A8, far from anything important. His attitude is defensive: if the enemy wants to spy on his scout, let them spy on nothing.

He hits EXECUTE.

**Minute 3:30 — "The Discovery"**
During sealed watch, the enemy striker starts moving toward A8 — toward the scout in the corner. The crimson pulse keeps firing from the compromised scout, reporting what it sees: empty tiles, terrain, nothing useful. But the enemy doesn't know it's nothing useful. Their rules say "go where the player scout is looking — that's where the attack will come from."

Meanwhile, Kai's actual units — his striker and relay — are on the opposite side of the board, approaching the enemy base from the south. The enemy striker is trudging toward A8. Kai's striker reaches the enemy base at tick 16, mostly uncontested.

He wins. He stares at the screen. He didn't mean to do that. He just wanted to get the scout out of the way. But accidentally, he ran a false flag operation.

**Minute 4:30 — "The Naming"**
The boot log types: `NOTE: SCOUT-A foreign hook active for 11 ticks. Transmitted 8 observations from sector A7-A8. Enemy response: STRIKER repositioned to northwest quadrant. RESULT: southern approach undefended. Classification: COUNTER-INTELLIGENCE — HOOK JUDO.`

Kai reads "Hook Judo." He grins. The Blueprint Codex pings — a new entry appears. He opens it: a card with an illustration of a scout trailing crimson signal threads, enemy units following the threads into an empty corner while player units attack from behind. The description reads: *"Sometimes the best defense against a hack isn't removing it — it's feeding it lies."*

He calls to his brother: "I just tricked the enemy AI with their own hack!"

**UI Annotations:**
- **Patrol route during frustration phase:** Short defensive loop near player base, showing Kai's instinct to keep the scout close
- **Patrol route during discovery phase:** Long line to map corner A8, visually separated from all other units
- **Enemy striker movement during sealed watch:** Visible path line showing the striker's 8-tick journey toward A8, moving away from the player's real attack vector
- **Blueprint Codex "Hook Judo" entry:** Illustration card, crimson-and-teal color scheme, category: "Advanced Tactics," unlock condition: "Exploit a foreign hook to misdirect enemy forces"
- **Boot log tone:** Analytic, not congratulatory. The AI is observing its own behavior and classifying it, not praising the player

---

### Journey: Dr. Amara, 38, ML Researcher and Security Hobbyist

**Context:** Mission 9, first attempt. Dr. Amara has been running counter-intelligence since Mission 8, deliberately leaving enemy hooks on sacrificial scouts. She's comfortable with the False Flag and Echo Chamber moves. Mission 9 introduces a new enemy behavior: enemy hooks that inject *back* — they don't just read from your unit, they send commands to it. The compromised unit receives signals on the enemy channel that its rules may inadvertently respond to.

**Minute 0:00 — "The Escalation"**
Dr. Amara's opening setup: two scouts (one clean, one honeypot), two strikers, a relay, and a command unit. The honeypot scout has an intentionally empty hook slot — bait for the enemy Specialist. She's been doing this for two missions.

At tick 6, the enemy Specialist hacks the honeypot scout. Expected. She'll check the Inspector later to read the enemy's architecture. But at tick 9, something unexpected happens: the honeypot scout *breaks formation*. It stops patrolling the decoy zone and moves toward the player base. During sealed watch, she sees the scout's context bar filling rapidly — amber, then red. The scout is overloading.

Tick 10: the scout is stunned. The crimson pulse fires three times in rapid succession — the enemy hook is flooding the scout with incoming signals, not just reading outgoing ones. The enemy is using the hook as a *command injection channel*, sending orders that the scout's rules are interpreting as legitimate signals.

**Minute 2:00 — "The Diagnosis"**
She switches to the Inspector after the battle ends in defeat. Scrubs to tick 9. Clicks the honeypot scout. The context window shows six slots — five are filled with entries from channel `en-cmd-override`, a channel she's never seen. The foreign hook isn't just `ON_PERCEIVE → SEND` — it's `ON_RECEIVE(en-cmd-override) → EXECUTE_RULE(priority_override)`. The enemy hook installed a bidirectional pipe. It reads perception data AND injects behavioral commands.

The decision trace shows: tick 9, the scout received a command on `en-cmd-override` that matched its first rule (which the enemy hook overwrote to: `IF en-cmd-override CONTAINS "return" → move toward en-base`). The enemy didn't just hack the scout — they reprogrammed it as a double agent.

**Minute 3:30 — "The Counter-Counter"**
Second attempt. Dr. Amara restructures her honeypot scout. She configures the scout's context config to IGNORE channel `en-cmd-override` — so even if the enemy hook receives commands on that channel, the scout's context window won't admit them. The enemy can send all the commands they want; the scout's listen config acts as a firewall.

But she leaves the outgoing portion of the hook intact. The enemy hook still fires ON_PERCEIVE and transmits the scout's observations. The enemy thinks their full bidirectional hack is working. But the scout only leaks — it doesn't obey.

She configures the honeypot's patrol to sweep the northeast decoy zone. She positions her real assault on the southwest.

**Minute 5:00 — "The Adaptive Enemy"**
Third attempt, after the second fails. The enemy, it turns out, has a counter-counter-intelligence behavior: if the bidirectional hook transmits outgoing data but the injected commands don't produce the expected movement, the enemy command unit reclassifies the hook as compromised. At tick 12, the enemy stops trusting signals from `en-recon-4` and repositions based on direct observation instead.

Dr. Amara realizes she needs to make the deception more convincing. She allows *some* of the enemy commands through — configuring the honeypot's context config to admit en-cmd-override signals but at LOW eviction priority. The enemy commands enter the buffer but get evicted quickly, producing brief, inconsistent behavioral responses. The scout twitches toward the enemy base occasionally but doesn't fully comply. To the enemy, this looks like a partially successful hack — realistic enough to maintain trust.

She adjusts the honeypot's rules to have a fallback: `IF en-cmd-override IN BUFFER → move 1 tile toward en-base, THEN resume patrol`. The scout takes one step toward the enemy base, then returns to its decoy patrol. From the enemy's perspective, the hack is working — slowly, unreliably, but working. They continue trusting the intelligence feed.

This time, the real attack succeeds. The enemy defended the northeast based on the honeypot's patrol data, treating the scout's intermittent command compliance as confirmation that the hack was genuine.

**Minute 7:00 — "The Meta-Reflection"**
The boot log types: `ADVANCED COUNTER-INTELLIGENCE ANALYSIS: Bidirectional intrusion on SCOUT-A. Outbound exploitation: ACTIVE (deception feed). Inbound mitigation: PARTIAL COMPLIANCE (trust maintenance). Enemy counter-detection: BYPASSED via behavioral authenticity. Classification: DEEP COVER OPERATION.`

Dr. Amara opens her notebook and writes: "This is exactly how adversarial ML works. The model (enemy) trusts the data pipeline (hook). The attacker (player) poisons the pipeline with plausible-but-misleading inputs. The defender's defense (counter-counter-intelligence) checks for anomalies. The attacker's counter-defense maintains enough normal behavior to pass the anomaly detector. It's an adversarial robustness problem."

**UI Annotations:**
- **Bidirectional hook indicator:** Crimson border with bidirectional arrows (← →) instead of single arrow (→). Distinguishes read-only hacks from command-injection hacks
- **Context config firewall:** In the listen/ignore toggles, foreign channels appear with crimson labels. Toggling IGNORE on a foreign channel shows a lock icon with a firewall tooltip
- **Partial compliance rule:** A rule with a crimson-tinted condition strip, visually marking it as "responding to enemy commands." The rule editor shows a dashed amber border indicating "deliberate vulnerability"
- **Enemy trust indicator (Inspector):** In the signal genealogy, enemy relay nodes show a green/amber/red trust badge based on whether the enemy is still acting on the compromised channel's data. Green = trusting fully, amber = suspicious, red = channel abandoned

---

## Interaction Effects

### x Hack Skill (Specialist)
Counter-intelligence transforms the hack skill from a symmetric binary (you hack them / they hack you) into an asymmetric strategic layer. A player who understands Hook Judo treats being hacked as an *opportunity* rather than a problem, which inverts the emotional valence of the hack mechanic entirely.

### x EM Emissions Model
The compromised hook fires each tick, generating EM noise. A honeypot scout in a far corner generates EM in a location where the player has no other units — this could itself be a tell for a sophisticated enemy. Counter-intelligence players must account for the EM signature of their deception.

### x Context Window / Overload
Bidirectional hacks (Variation C, Mission 9+) threaten context overload. The enemy can weaponize a hook to flood the compromised unit's context window. The player must use context config (listen/ignore filters) as a firewall — which is exactly the same skill as managing legitimate signal load. The mechanic reinforces the core lesson that context configuration is *the* survival skill.

### x Signal Latency
Deception signals travel through the same 1-tick-per-hop latency as legitimate signals. A false flag operation must account for the delay: the enemy receives the false intelligence N ticks after the scout observes the decoy area. The player must time their real attack to coincide with the enemy's response to the delayed false signal. This creates a timing puzzle layered on top of the deception puzzle.

### x Inspector / Debrief
The Inspector is the tool that makes counter-intelligence possible. Without signal genealogy and decision traces on enemy units, the player cannot see how the enemy processed the deceptive signal. The debrief's analytical phase is where the player learns whether their deception worked, partially worked, or was detected. The Inspector must show enemy unit decision traces (at least for compromised channels) to make this legible.

### x Command Agent
A command agent can orchestrate counter-intelligence at scale: reassign a compromised scout's patrol route, adjust context config on units receiving enemy signals, coordinate real attacks to synchronize with deception timing. Counter-intelligence operations are the most complex command agent configurations in the game.

### x Campaign Progression
Counter-intelligence layers naturally across Missions 6-10: detect hacks (M6) → remove hacks (M7) → passive intelligence (M7) → false flag discovery (M8) → bidirectional defense (M9) → adaptive deception (M10). Each mission adds a dimension without front-loading the complexity.

---

## Comparable Games

### Invisible Inc. (Klei Entertainment, 2015)
The closest mechanical parallel. Invisible Inc. has security systems that can be hacked and turned against the facility. Cameras, drones, and turrets can be captured and repurposed. The player faces the same risk/reward: using a captured camera gives intelligence but may trigger an alert if security sweeps detect the intrusion. The key difference: Invisible Inc.'s hacking is immediate and binary (hacked or not), while Robot Uprising's counter-intelligence is continuous and graduated (how much deception, for how long, at what risk).

### Counter-Strike (Series)
Counter-intelligence as metagame. Professional CS teams use fake utility (flashbangs, smokes in wrong locations) to suggest a site take, then rotate to the other site. The deception operates through the opponent's information model — they hear the utility and interpret it as commitment. Robot Uprising's Hook Judo mechanizes this: instead of fake utility, the player feeds false perception data through enemy hooks. The fundamental pattern is identical: *manipulate what the opponent observes to corrupt their decision-making*.

### Diplomacy (Board Game, 1959)
The social deception parallel. Diplomacy's core mechanic is promising support and then betraying — using the enemy's trust in your communication as a weapon. Hook Judo captures this mechanically: the enemy trusts their hack's intelligence feed, and the player exploits that trust. The "partial compliance" behavior (Dr. Amara's journey) is the Diplomacy move of following through on 80% of your promises to maintain trust for the critical 20% betrayal.

### Factorio Circuit Networks
Factorio players build circuits that read sensor data and control factory behavior. A corrupted sensor reading (e.g., reporting 0 iron when there's actually 1000) can cause the entire factory to malfunction — over-producing, under-producing, or entering an infinite loop. Robot Uprising's Echo Chamber attack is this exact scenario: corrupt the sensor (scout's perception), and the factory (enemy's agent network) processes the corrupted data as if it were real.

### Real-World Counter-Intelligence: Operation Mincemeat (WWII)
The Allied operation that planted false documents on a corpse to mislead Axis forces about the invasion of Sicily. The corpse was the "honeypot" — a platform designed to be "hacked" (discovered by the enemy). The documents were the false signal. The enemy's intelligence apparatus faithfully processed the false information and repositioned forces away from Sicily. Hook Judo is Operation Mincemeat as a game mechanic.

---

## Sensory Design

### Visual Language
- **Foreign hook:** Crimson (#c0392b) dashed border on the hook slot, pulsing gently at 0.5Hz when idle, bright flash when transmitting
- **Deception signal in transit:** During sealed watch, the compromised unit's transmission line is crimson with gold flecks — visually distinct from player signals (teal) and enemy signals (red). The gold flecks signal "this is enemy infrastructure carrying player-controlled content"
- **Honeypot scout:** A subtle amber diamond icon on the unit's tile marker, visible only to the player. The enemy sees a normal scout
- **Enemy trust state (Inspector):** Green filled circle = enemy trusting channel, amber half-circle = enemy suspicious, red empty circle = enemy abandoned channel

### Audio Design
- **Foreign hook firing:** A low, slightly distorted version of the normal hook transmission ping — same frequency but with a metallic ring, like a bell being struck inside a tin can. Recognizable as "hook firing" but texturally wrong. The player learns to hear compromised transmissions.
- **Successful deception:** When the Inspector confirms an enemy repositioned due to false intelligence, a quiet, satisfied three-note ascending chime in a minor key — not triumphant but cunning. The sound of getting away with something.
- **Counter-detection alert:** If the enemy detects the deception (trust state goes red), a sharp descending two-note buzz — the sound of a cover being blown. Urgent, demanding immediate attention.
- **Partial compliance (Dr. Amara's journey):** When the compromised unit executes an enemy command briefly before returning to its patrol, a low cello note bends slightly flat and then resolves — the sound of bending but not breaking.

### The TikTok Clip
Split-screen: left side shows the player's Plan screen with a scout's patrol route drawn through an empty corner. Right side shows the sealed watch. The compromised scout moves to the corner. Crimson pulses fire. The enemy striker begins its 8-tick march toward the decoy. Meanwhile, on the opposite side of the board, the player's real striker advances unopposed. The enemy base falls. Cut to the Inspector showing the signal genealogy — the crimson line from the player's scout through the enemy's entire intelligence pipeline to the enemy command unit's decision that sent the striker to the wrong location. Text overlay: *"they hacked my scout. i hacked their brain."* 15 seconds. Devastating.

---

## Strengths

1. **Emergent from existing primitives.** No new mechanics required. Patrol routes + enemy hooks + perception = deception. The player discovers the strategy, not the game system.
2. **Teaches real counter-intelligence concepts.** Honeypots, false flags, canary traps, OPSEC through maintained cover — these are genuine intelligence tradecraft concepts accessible through gameplay.
3. **Inverts the emotional valence of enemy hacking.** Being hacked goes from "I need to fix this" to "I can exploit this." This inversion is the discovery moment that creates mastery.
4. **Layers naturally across the campaign.** Detect → remove → observe → exploit → counter-counter. Each mission adds a dimension.
5. **Creates memorable stories.** "I tricked the enemy AI with their own hack" is a story every player will tell. This is the TikTok clip mechanic.

## Weaknesses

1. **Requires sophisticated enemy AI.** If the enemy doesn't meaningfully respond to intelligence, deception is pointless. The enemy must have visible, exploitable decision-making.
2. **Hard to balance.** If counter-intelligence is too effective, players never remove hooks. If too risky, they always remove hooks. The sweet spot where both are viable requires careful tuning.
3. **Invisible to non-exploratory players.** A player who always removes enemy hooks on detection will never discover Hook Judo. The game must create scenarios where removal is insufficient (Mission 8's numerical disadvantage) to push players toward experimentation.
4. **Inspector dependency.** Counter-intelligence is illegible without the Inspector's signal genealogy and enemy decision traces. The mechanic is only as good as the diagnostic tools.
5. **Late-game complexity.** Counter-intelligence adds a strategic layer on top of already-complex hook/channel/context systems. Mission 8-10 players must manage their own signal architecture AND a deception layer simultaneously.

---

## Recommendation

**Variation F (Progressive Judo)** is the strongest approach. It layers counter-intelligence across Missions 6-10 in a natural escalation that matches the campaign's complexity ramp. The critical design requirement is that Mission 8 must create a scenario where simple hook removal is insufficient, forcing the player to experiment with leaving hooks active. The discovery moment — when the player realizes an enemy intrusion is an asset, not a liability — is the single highest-value "aha" moment in the late campaign. Name it "Hook Judo" in the Codex, make it a card with memorable art, and let every player tell the story of the first time they tricked an enemy AI with its own hack.
