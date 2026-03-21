# 2.12 — Deception Signals: Enemy Can Inject False Information Into Your Network

**Aspect:** 2.12 — Deception signals: enemy can inject false information into your network
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic
**Dependencies:** 2.11 (Signal Fidelity), 2.10 (Signal Taxonomy), 2.16 (Counter-Intelligence Offensive Mechanic), 2.01 (Fixed-Slot Buffer)

---

## The Design Question

Your scout reports an enemy striker at C5, moving east. Your relay compresses the signal and forwards it to your defensive line. Your striker repositions to intercept at D5. Tick fires. The tile is empty. There was never a striker at C5. The signal was a fabrication — injected into your scout's perception by an enemy Specialist's `hack` skill, planted in the buffer as a ghost observation indistinguishable from a real one. Your striker is now out of position, your western flank is exposed, and the real enemy assault is arriving from G2.

This is **deception signals** — the mechanic where the enemy doesn't just attack your units, it attacks your *information*. Not by jamming or flooding (that's noise, covered by context overload), but by crafting plausible false data and inserting it into your network where it will be read, believed, and acted upon. The enemy poisons the well. Your own carefully-built information architecture becomes the delivery vehicle for the enemy's lies.

The fundamental design tension: **trust vs. paranoia.** The entire game teaches the player to build information pipelines — scouts perceive, relays forward, strikers act. Deception signals attack the foundation of that pipeline: the assumption that perception data is real. Once the player has been burned by a fake signal, every observation becomes suspect. How do you build a decision-making system when you can't trust your own inputs?

This maps directly to real adversarial AI engineering: prompt injection, data poisoning, adversarial examples. The game is literally teaching the player that intelligent systems must validate their inputs, that the boundary between "signal" and "attack surface" is the same boundary, and that the most dangerous vulnerability is the one that looks exactly like normal operation.

---

## The Mechanical Model: "The Phantom Protocol"

### How Deception Signals Enter the Network

The enemy's Specialist unit has the `hack` skill. The locked mechanic allows injecting hooks into player units. Deception signals extend this: a successful hack can also **insert fabricated context entries directly into a unit's buffer.** These entries look identical to genuine perception observations in the buffer visualization — same format, same color coding, same slot rendering. The only difference is invisible during the sealed watch phase: a `source` property on the entry that reads `injected` instead of `perceived` or `received`.

**Three injection vectors:**

| Vector | How It Works | Detectability | Danger Level |
|--------|-------------|---------------|--------------|
| **Direct injection** | Enemy Specialist within hack range (3 tiles) plants a fabricated entry in the target unit's buffer on the next tick | Visible in Inspector post-battle (source: injected) | High — immediate and precise |
| **Hook hijacking** | Enemy overwrites one of the target's hook slots with a hook that receives signals from an enemy-controlled channel. Enemy then sends fabricated signals on that channel. | Hook slot shows enemy channel name in Inspector | Very High — persistent pipeline, can inject repeatedly |
| **Relay poisoning** | Enemy injects a fabricated signal into a relay's buffer. The relay's compress/amplify/filter skills process it normally and forward it to all listeners. The relay becomes an unwitting amplifier of enemy lies. | Almost undetectable — the relay processed it "legitimately" | Critical — one compromised relay corrupts the entire downstream network |

### The Anatomy of a Fabricated Signal

A deception signal is a buffer entry with the same structure as a real observation:

```
SLOT 4: [OBSERVATION] Enemy Striker at E4, heading W, speed 2
         Age: 0 ticks | Fidelity: 80 | Source: [HIDDEN DURING BATTLE]
```

The fidelity score is **set by the attacker**, not computed from hops traveled. A clever enemy crafts signals at fidelity 80 — high enough to be actionable, low enough to be plausible (a direct perception would be fidelity 100, which might look suspicious coming through a relay). The game is simulating what real adversarial ML looks like: the attacker crafts inputs that pass through the defender's filters.

**What fabricated signals can contain:**
- **Phantom units:** Fake enemy positions that don't exist. The player's rules react to threats that aren't there.
- **Ghost withdrawals:** False reports that an enemy unit has moved away from a position it still occupies. The player sends units into an ambush.
- **Spoofed friendlies:** Fake observations of allied unit positions. If a striker's rules say "don't engage near friendlies," a spoofed friendly position can suppress the striker's aggression at a critical moment.
- **Fake resource signals:** False reports about tagged nodes or resource states, causing misallocation of production priorities.

### The Confidence Problem

Once the player knows deception signals exist, every observation in the buffer becomes potentially untrustworthy. The game needs to give the player tools to manage this uncertainty without making deception trivially counterable.

**Tool 1: Source Verification (Inspector only)**
In the Inspector phase after battle, clicking any buffer entry reveals its `source` field: `perceived` (the unit saw it directly), `received` (arrived via hook/channel from an allied unit), or `injected` (enemy fabrication). This post-hoc analysis teaches the player which signals were real and which were lies, but only after the damage is done. The learning happens in debrief, not during battle. You never get to fix it in the moment — only build better defenses for next time.

**Tool 2: Perception Cross-Referencing (Rule-Based)**
A player can configure rules that require corroboration: "Only act on enemy position reports if two or more independent sources report the same grid area within 3 ticks." This burns rule slots (scarce resource) on validation instead of tactics, and introduces latency — waiting for corroboration means slower response time. The enemy can counter by injecting two matching fabricated signals from different vectors.

**Tool 3: The `verify` Skill (Specialist)**
A potential new skill (or sub-function of `extract`) that checks a buffer entry's provenance. The Specialist expends one tick examining a suspicious entry and marks it as `verified` or `suspect`. Verified entries get a visual treatment in the buffer — a small checkmark pip. Rules can be configured to only trigger on verified entries. Cost: you're spending a Specialist's action on bureaucracy instead of hacking the enemy.

---

## The Enemy's Deception Playbook: Five Named Patterns

### "The Phantom Phalanx"
The enemy injects three to four fabricated signals reporting a large enemy force approaching from one direction. The player's rules trigger defensive repositioning — strikers move to intercept, relays reroute signal chains to cover the phantom threat zone. The real attack, a single striker through an unmonitored flank, arrives while the defense is chasing ghosts. This is the information warfare equivalent of a feint, executed entirely through data manipulation rather than unit movement.

**Sensory description:** During sealed watch, the player sees their scout's buffer light up with multiple new entries — the observation pips glow bright amber, filling slots rapidly. The scout's hook fires, green flash ripples along the channel line to the relay. The relay compresses and forwards — another green cascade to the striker. The striker pivots, snap-moving two tiles west toward the phantom. A tick later, another phantom report. The striker moves again. Then the eastern flank flashes red — combat — a real enemy striker adjacent to the player's undefended relay. The relay is eliminated. The green signal lines connected to it go dark simultaneously, all downstream units losing their information pipeline in a single tick.

### "The Slow Poison"
Instead of dramatic fabrications, the enemy injects a steady drip of slightly wrong data — enemy positions off by one tile, movement directions rotated 45 degrees, threat levels slightly elevated or suppressed. No single entry is obviously wrong. But over 10-15 ticks, the player's units build a subtly distorted model of the battlefield. Strikers patrol one tile off from optimal, scouts investigate areas that are almost but not quite where the real activity is. Death by a thousand paper cuts of misinformation.

**Why this is terrifying:** In the Inspector post-battle, the player scrubs through the timeline and sees no obvious fabrication moment — no sudden flood of false signals, no smoking gun. Just a gradual drift between what their units believed and what was actually happening. The decision trace shows every rule matched correctly, every action was rational *given the data*. The data was just slightly wrong. This is the hardest deception to learn from because there's no single "aha" moment to anchor the lesson.

### "The Echo Trap"
The enemy injects a fabricated signal into a relay that has the `amplify` skill configured. The relay amplifies the fabricated signal and broadcasts it on all its output channels. Every downstream unit receives the lie at amplified fidelity. If the relay feeds into another relay with amplify, the fabrication cascades through the entire network at boosted confidence levels. One injected signal becomes the canonical truth across the player's entire army. This exploits the player's own signal infrastructure as an amplification vector.

### "The Loyalty Test"
The enemy injects a signal that *correctly* reports an enemy unit position — but one the enemy is willing to sacrifice. The player's units act on the real intelligence, destroy the sacrificial enemy unit, and the player's rules "learn" (reinforce) that signals from this source are trustworthy. The enemy then sends a critical fabrication through the same vector at the decisive moment, exploiting the trust it manufactured. This is the most sophisticated pattern because it requires the enemy AI to sacrifice resources to build credibility.

### "The Buffer Bomb"
The enemy rapidly injects many fabricated signals — not to deceive, but to consume buffer slots. Unlike noise flooding (which generates EM and is obviously hostile), fabricated signals look like legitimate observations and pass through listen/ignore filters that would block obvious noise. The unit's buffer fills with fake observations that look real, evicting genuine entries according to the player's eviction priority config. The most recently evicted real observation might have been the one that warned of the actual incoming attack. This is the bridge between deception and denial-of-service: the weapon is the plausibility of the fake data, which lets it bypass the filters designed to prevent overload.

---

## Interaction With Locked Mechanics

### Context Window Pressure
Fabricated signals occupy real buffer slots. A scout with a 6-slot buffer that has 2 fabricated entries has effectively lost 33% of its working memory to enemy propaganda. The eviction priority config becomes a defense mechanism — if the player configures "evict oldest first," fabricated signals naturally age out. But if the enemy keeps injecting fresh fakes, the newest (false) entries push out the oldest (potentially true) entries. The eviction config is now a security vulnerability.

### Signal Fidelity Interaction (2.11)
Deception signals interact with signal fidelity in a crucial way: **fabricated signals don't degrade naturally because they never traveled through hops.** A directly-injected signal enters the buffer at whatever fidelity the attacker chose. If the player has learned to trust high-fidelity signals (fidelity 80+) and filter low-fidelity ones, the enemy can inject signals at fidelity 90 that bypass fidelity-based filtering. Conversely, if the player learns that *suspiciously high fidelity on a multi-hop path* is a red flag, fidelity becomes a crude authentication mechanism — a signal that arrived via relay but has fidelity 95 is probably fake, because real signals degrade 20 points per hop.

This creates a beautiful design interaction: the same fidelity system that solves the "telephone game" problem (2.11) also provides the first layer of deception detection. Players who deeply understand signal fidelity degradation can use it as an implicit authenticity check. The enemy must then learn to set fabricated signal fidelity to the correct degraded value for the number of hops it supposedly traveled — a cat-and-mouse arms race inside the signal metadata.

### EM Emissions
Hook hijacking generates EM noise on every transmission. If the enemy is using a hijacked hook to pipe fabricated signals into a player unit, that unit becomes louder (more EM emissions per tick). An observant player might notice in the Inspector that a unit's EM signature spiked in the ticks when fabricated signals arrived — the hook was firing more than it should have. EM emission analysis becomes a secondary deception detection method.

### One-Shot-One-Kill Amplification
In a game with HP and damage math, a deception signal that mispositions one striker costs you some HP. In a one-shot-one-kill game, a deception signal that mispositions one striker costs you the striker *permanently*. The information integrity stakes are as high as they can possibly be. Every buffer entry is life or death. This is why deception signals feel so devastating — and why the tools to counter them feel so vital.

---

## Strengths

- **Teaches real AI security concepts.** Data poisoning, adversarial examples, prompt injection — these are the actual threats facing AI systems. The game makes them visceral and personal. When your striker dies because a fake signal sent it to the wrong tile, you understand adversarial inputs in your bones.
- **Creates a trust economy.** The player must decide how much validation infrastructure to build vs. how much combat capability to sacrifice. Every rule slot spent on cross-referencing is a rule slot not spent on tactical behavior. Every Specialist tick spent verifying is a tick not spent hacking.
- **Deepens the Inspector.** Post-battle analysis becomes forensic investigation. "Where did the lie enter my network? Which relay amplified it? Why didn't my filters catch it?" The Inspector transitions from "replay viewer" to "crime scene investigation tool."
- **Scales with player skill.** Beginners get burned and learn to build basic validation. Veterans run sophisticated counter-deception architectures with canary signals, cross-referencing rules, and deliberate honey-pot units. The skill ceiling is enormous.
- **The TikTok clip writes itself.** A player's perfectly-orchestrated defense collapses because one fabricated signal pulled two strikers out of position. The replay shows the moment the lie entered the network, cascaded through the relay, and sent the army chasing a phantom. Comments explode: "I would have fallen for that too."

## Weaknesses

- **Invisible failure mode.** The player loses and might not understand why. Unlike combat (red flash, unit destroyed — clear cause/effect), deception is silent. The unit simply acted on wrong data. The causal chain is long: enemy hack → fake signal → buffer entry → rule match → wrong action → death. New players may not connect these dots without significant Inspector tutorialization.
- **Paranoia spiral.** If deception is too effective, players may stop trusting any signal and build exclusively short-range, direct-perception architectures — scouts that only act on their own sight, strikers that ignore all network signals. This collapses the entire signal network mechanic into "every unit is solo." The game must reward network architectures enough that abandoning them is clearly suboptimal.
- **Computational complexity for enemy AI.** Crafting plausible deception requires the enemy AI to model what the player's units would plausibly observe and inject signals that fit that model. In a deterministic system, this means the enemy AI must be sophisticated enough to generate contextually appropriate lies, not just random noise.
- **UI legibility during sealed watch.** If fabricated signals look identical to real ones (which they must, for the mechanic to work), the sealed watch phase gives the player zero tools to notice the deception in real time. The emotional impact — "I was betrayed and didn't know it" — is powerful but also potentially frustrating if the player feels they had no agency.

---

## Comparable Games / Media

**Among Us:** The entire game is a deception signal mechanic. Impostors inject false information (fake alibis, false accusations) into the crew's communication network (meetings). The crew must cross-reference stories, verify alibis, and decide who to trust with incomplete information. Among Us proves that deception mechanics create incredible emergent drama — the moment you realize you were deceived generates more emotional charge than any combat mechanic. Robot Uprising translates this from social deduction to information architecture.

**StarCraft — Hallucination:** The Protoss Sentry can create hallucinated units — fake copies that look real to the opponent but deal no damage and disappear when attacked. Hallucinations are primarily used for scouting (send a hallucinated phoenix to scout) but elite players use them for army deception — a hallucinated colossus army approaching from one angle while the real army flanks. The key lesson: effective hallucinations exploit the opponent's *automated responses*. An opponent who manually checks every unit will see through hallucinations, but automated reactions (like moving interceptors to defend against hallucinated carriers) are perfectly fooled. In Robot Uprising, the "automated responses" are the player's rules — and rules can't distinguish real from fake.

**Netrunner (Android: Netrunner):** The Corporation installs face-down cards in servers. Some are valuable agendas, others are traps (Snare!, Junebug, Overwriter). The Runner must decide which servers to hack based on incomplete information — every unrezzed card is potentially a trap. The Corp player constructs a bluffing architecture, and the Runner must read the board state to assess probability. The key translation to Robot Uprising: the bluff is embedded in the *infrastructure*, not the real-time play. The player's pre-battle configuration determines how susceptible their network is to deception.

**EVE Online — D-Scan Manipulation:** In EVE, players use directional scanners to detect nearby ships. Experienced players warp between safe spots at angles designed to appear on the enemy's d-scan from misleading directions, creating the impression of fleet movement that doesn't match the actual approach vector. The scanner provides real data (a ship IS at this bearing), but the interpretation is wrong because the pilot deliberately manipulated what the scanner sees. This is identical to how deception signals work in Robot Uprising — the data is "real" (an observation entry exists in the buffer), but the thing it describes doesn't exist.

---

## Sensory Description: What Deception Looks and Feels Like

**During sealed watch — the invisible betrayal:**
The board looks normal. A scout's context bar pulses with incoming data — new amber pips filling from the bottom, each one a heartbeat of information. Green channel lines flash as hooks fire, carrying data downstream. The relay in the center processes signals, its buffer bar cycling through colors — green, green, amber, green. Everything looks healthy. The striker repositions based on the latest report, snapping one tile east. Another tick, another report, another adjustment. The striker is now three tiles from where it started, chasing intelligence that feels urgent and specific.

Then the east side of the board flashes red. An enemy striker, unseen and unreported, eliminates the relay. The green channel lines connected to the relay wink out like severed nerves — six lines going dark simultaneously. The downstream units' context bars flicker — entries graying out as the relay's compressed signals stop arriving. The defense has a hole shaped exactly like the phantom the player's striker was chasing.

**In the Inspector — the forensic revelation:**
The player clicks on their dead relay, scrubs back to tick 8. The buffer detail panel shows 12 slots. Slot 7 has a pale entry with an observation: "Enemy Striker at D6, heading E." The player clicks it. The detail panel expands: `Source: injected | Fidelity: 78 | Injected by: Enemy Specialist at F5, tick 6`. A thin red dashed line appears on the board overlay, connecting the enemy Specialist's position at tick 6 to the relay. The player scrubs forward — tick 9, the relay's `amplify` skill fires, boosting the fabricated signal and broadcasting it on `defense-net`. Tick 10, the player's striker receives the amplified lie at fidelity 90 (boosted by amplify) and repositions.

The decision trace for the striker at tick 10 reads: `Rule 2 matched: IF [enemy_striker_reported, fidelity > 70, distance < 4] THEN [move_to_intercept]. Context entry: Slot 3, "Enemy Striker at D6, heading E", fidelity 90, age 1.` Every step was logical. The rule was correct. The fidelity threshold was reasonable. The data was fake.

**The emotional beat:** The player stares at the decision trace. Everything their system did was *right*. The rules worked. The relay worked. The channels worked. And they lost anyway because the input was a lie. This is the teaching moment — the moment the player understands that intelligent systems are only as good as their data, that architecture can be perfect and still fail if the inputs are compromised. It's the Robot Uprising version of learning that your model has a data quality problem.

---

## Player Journeys

---

#### Journey: Priya, 29, Data Engineer

**Context:** Mission 7. Priya has built solid signal architectures in missions 5-6 — scouts feeding relays feeding strikers, clean channel topology, reliable performance. She's never encountered enemy Specialists before. Her current setup: two scouts broadcasting on `recon-alpha`, one relay compressing and forwarding to `strike-net`, two strikers listening on `strike-net`. She's proud of the architecture. It worked perfectly last mission.

**Minute 0:00 — The Confident Setup**
Priya opens the Plan screen. The 8x8 board preview on the left shows three enemy spawner positions in the eastern half. She's used to this layout — defend west, scout east, intercept in the middle. Her blueprint workbench on the right shows her tried-and-true scout blueprint: perception range 5, hook slot 1 configured as `ON_PERCEIVE_ENEMY → SEND on recon-alpha`, hook slot 2 configured as `ON_PERCEIVE_TAGGED → SEND on resource-net`. Context config: listen to `command-net`, ignore everything else, eviction priority = oldest-first.

She doesn't change anything. Hits EXECUTE. The button depresses with a satisfying clunk, the screen transitions to the dark battlefield.

**Minute 0:15 — The Sealed Watch**
Ticks advance. Her scouts fan out, buffer bars slowly filling with amber observations. Green flashes along channel lines — data flowing from scouts to relay to strikers. Familiar rhythms. Tick 5, a scout spots an enemy unit at E3. The scout's buffer bar gains a bright pip, hook fires, green cascade through the relay to the strikers. The eastern striker repositions to intercept. Tick 7, a second report — enemy at E4, moving west. The striker adjusts, moving to D4 to cut off the approach.

Tick 9 — a flash she's never seen before. A thin purple line appears between an enemy unit at G3 and her western scout. It's fast — blink and miss it. Her scout's buffer bar gains a new pip, but the color is identical to every other observation pip. She's not sure what just happened.

Tick 11. Her western scout's hook fires. Green flash along `recon-alpha` to the relay. The relay processes and forwards on `strike-net`. Her western striker — the one defending the flank — snaps two tiles south, toward F7. That seems odd. There's nothing in F7 on the board. But the striker's rules matched something in its buffer.

Tick 14. Red flash. The relay is destroyed by an enemy striker that approached from the north — the direction Priya's western striker just vacated. All channel lines from the relay go dark. Her two strikers are now deaf, acting only on direct perception. One is out of position chasing a phantom. The other is two tiles away from the real threat.

Tick 18. Both remaining strikers are eliminated. Mission failed.

**Minute 1:30 — The Inspector**
The tick clock is replaced by the timeline scrubber. Priya scrubs back to tick 9 — the purple flash. She clicks the western scout. The buffer detail panel shows slot 4 contains: `[OBSERVATION] Enemy Striker at F7, heading N, speed 2`. She clicks the entry. The detail panel reveals: `Source: injected | Fidelity: 82 | Injected by: Enemy Specialist at G3`.

Priya's eyes widen. "Injected." She's never seen that source type before. She scrubs forward to tick 11. The scout's hook fires on `recon-alpha`, transmitting the fabricated observation as if it were real. The relay compresses it (fidelity drops to 72) and forwards on `strike-net`. Her western striker receives it at tick 12. The decision trace reads: `Rule 1: IF [enemy_striker_reported, fidelity > 60] THEN [move_to_intercept]`.

She says out loud: "It passed my fidelity filter. Because the enemy *set* the fidelity." She clicks through three more ticks, watching the real enemy striker approach from the north, completely unreported because the scout's buffer was half-full of the fabricated entry and its derivatives. The real threat was lost to eviction — oldest-first eviction pushed out a 3-tick-old genuine observation to make room for the fresh fabrication.

**Minute 3:00 — The Redesign**
Back on the Plan screen, Priya stares at her scout blueprint. She drags open the rules panel. Currently: one rule for movement, one rule for evasion. She has two remaining rule slots. She types a new rule: `IF [observation_count_same_source > 1, within_3_ticks] THEN [flag_and_hold]`. The idea: don't forward any single-source observations immediately. Wait for corroboration. If two different sources report the same area, then it's likely real.

She pauses. This means her response time doubles — from instant-forward to wait-for-corroboration. In a one-shot-one-kill game, two ticks of delay can be fatal. But so can acting on a lie.

She also opens the relay blueprint and adds a rule: `IF [signal_fidelity > 85, source_is_relay] THEN [hold_for_review]`. The logic: if a signal arrived via relay but still has fidelity above 85, it's suspiciously pristine. Real signals degrade 20 points per hop. A relay-forwarded signal at fidelity 85+ either traveled zero hops (impossible — it came from the relay) or was fabricated with inflated fidelity.

She hits EXECUTE again, feeling like she's building a firewall for the first time.

**UI Annotations:**
- **Buffer detail panel:** Clicking a buffer entry expands to show source, fidelity, age, and injector identity (if applicable). Injected entries have a hairline red border visible only in Inspector.
- **Decision trace:** Collapsible panel showing rule match chain. Each step is clickable to highlight the relevant buffer entry and channel.
- **Purple flash (sealed watch):** Brief directional indicator of hack event. Subtle enough to miss on first viewing, obvious on replay.

---

#### Journey: Marcus, 34, Security Consultant

**Context:** Mission 9. Marcus has been building counter-deception architectures since Mission 7. He treats Robot Uprising like a penetration testing exercise. His current setup includes dedicated "canary" scouts that patrol unique sectors, cross-referencing rules on his relay, and a Specialist configured with `verify` behavior via extract skill usage. He's been winning missions by out-deceiving the enemy — leaving hijacked hooks active for counter-intelligence (Hook Judo from 2.16). This mission introduces a new enemy pattern he hasn't seen.

**Minute 0:00 — The Paranoid Architecture**
The Plan screen shows Marcus's intricate setup. His workbench is dense — five blueprints, each heavily customized. The production queue conveyor belt shows: Scout-A (canary west), Scout-B (canary east), Relay-Central, Specialist-Validator, Striker-Alpha, Striker-Beta, Command-Oversight.

His relay blueprint is where the defensive magic lives. Four hook slots are allocated: slot 1 listens on `recon-west`, slot 2 on `recon-east`, slot 3 outputs to `verified-intel`, slot 4 outputs to `strike-orders`. Three of his four rule slots are dedicated to cross-referencing: `IF [matching_reports >= 2, same_sector, different_sources, within_2_ticks] THEN [forward_on verified-intel with tag CONFIRMED]`. Only confirmed signals reach the strikers. Unconfirmed signals are held in buffer but never forwarded.

His Specialist has rules that trigger on `verified-intel` — when the relay forwards a confirmed report, the Specialist uses its `extract` skill on one of the reporting scouts to check for hook tampering. If a scout has an enemy hook, the Specialist flags it on `command-channel`.

He's spent six rule slots and one full Specialist on validation infrastructure. That's an enormous investment — a Specialist not hacking enemy units, a relay with only one free rule slot for compression. But his network has been deception-proof for two missions.

He hits EXECUTE.

**Minute 0:30 — The Loyalty Test**
Ticks 1-8 are routine. Scouts patrol, report, relay cross-references. Two matching reports from both scouts — enemy units at D5 and E5. Relay confirms and forwards to `verified-intel`. Strikers reposition. Tick 10, the confirmed report is accurate — enemy units are exactly where reported. Marcus's striker eliminates one. Clean kill.

Tick 12. Scout-A reports a new enemy at B3. Single source — no corroboration from Scout-B (which is covering the east). Marcus's cross-referencing rule holds the signal. It never reaches the strikers. Tick 14. The enemy unit at B3 attacks and destroys Scout-A. The report was real. Marcus's paranoia cost him a unit — the cross-referencing delay meant his striker never moved to protect the scout.

He watches the replay, muttering. The enemy sacrificed a real unit in a genuine position to teach Marcus's network that *uncorroborated signals can be real*. If he loosens his corroboration rules, he's faster but vulnerable to deception again. If he keeps them strict, real threats in single-scout coverage areas go unaddressed.

**Minute 1:15 — The Slow Poison Begins**
Tick 16. Replacement Scout-A-2 is produced from the factory. It takes position and begins patrolling. Tick 18, both scouts report enemy movement near F4. Relay cross-references — match! Forward to `verified-intel`. Strikers reposition.

But Marcus notices something in retrospect: the reports matched *too perfectly*. Both scouts reported "Enemy Scout at F4, heading S, speed 1." Identical wording, identical parameters. In his experience, two independent observers report slightly different details — one might catch the heading, the other might note the position but not the speed. Two perfectly identical reports could mean one was fabricated to match the other.

He doesn't notice this during sealed watch. The tick clock advances. Ticks 20-25 see a series of matched reports — each time, both scouts corroborate. Marcus's relay dutifully confirms and forwards. His strikers dance across the board, always chasing confirmed intelligence.

Tick 28. The real enemy assault arrives from a vector none of the confirmed reports ever mentioned. Three enemy strikers from the south — a direction Marcus's scouts were covering, but their reports about that sector were *slightly wrong* each time. Off by one tile. The slow poison: the enemy wasn't just injecting fake observations, it was *editing real observations* as they passed through a compromised hook that Marcus never detected because his Specialist was checking scouts, not the relay itself.

**Minute 2:30 — The Inspector Forensic**
Marcus scrubs to tick 18. He clicks the relay. Buffer slot 9: an observation from Scout-A-2 about F4. He clicks it. `Source: received, from Scout-A-2, channel recon-west, fidelity 78.` Looks clean. He clicks Scout-A-2 at the same tick. Buffer slot 3: the original observation. `Enemy Scout at F3, heading SE.` F3 heading SE, not F4 heading S.

The signal changed between the scout and the relay. He clicks the channel line between them. The hook on Scout-A-2's slot 1 shows `ON_PERCEIVE_ENEMY → SEND on recon-west`. Normal. But slot 2 — the slot he left empty — now reads `ON_RECEIVE_recon-west → MODIFY(position+1,heading=S) → RESEND on recon-west`. An enemy-injected hook that *intercepts the scout's own outbound signals*, modifies them slightly, and retransmits on the same channel. The relay receives two versions — the original and the modified — but the modified one arrives one tick later, and his oldest-first eviction replaces the original with the "newer" (modified) version.

Marcus leans back. The enemy figured out his cross-referencing system and built a hook that generates corroborating false signals by intercepting and modifying real ones. His multi-source validation was defeated by an attacker who manufactured the second source.

**Minute 4:00 — The Counter-Counter Architecture**
Back at the Plan screen, Marcus redesigns. He adds a rule to his relay: `IF [two_reports_same_channel, time_delta == 1_tick] THEN [flag_potential_echo]`. If two reports arrive on the same channel one tick apart with similar content, it might be an interception-and-modify attack. He also configures his Specialist to periodically `extract`-scan the relay itself, not just the scouts — checking for injected hooks on the relay's unused slots.

He considers going further: unique channel names per scout (instead of shared `recon-west`), so that a hook on one scout's channel can't spoof corroboration from another scout's independent channel. But this requires more hook slots on the relay — and the relay only has 4. He's already using 3 for cross-referencing. The slot pressure is real.

He hits EXECUTE, feeling like he's running a red team exercise against himself.

**UI Annotations:**
- **Hook diff view (Inspector):** When a hook slot shows enemy-injected content, the Inspector displays the original slot state (if any) ghosted underneath the current state. A small `TAMPERED` badge in red appears on the slot.
- **Signal path overlay:** Clicking a buffer entry illuminates the full path the signal traveled on the board — from source unit through every relay hop to destination. Modified signals show a red segment at the point of interception.
- **Cross-reference match indicator:** In the relay's buffer view, matched entries that triggered the corroboration rule show thin connecting lines between the matched slots.

---

#### Journey: Tomás, 16, First-Time Strategy Player

**Context:** Mission 5. Tomás is new to strategy games — he picked up Robot Uprising because a TikTok clip of someone's relay network collapsing looked incredible. He's just unlocked the factory system. His architecture is simple: one scout, one relay, one striker. He doesn't use channels consciously yet — the boot log auto-configured `recon` and `strike` channels for him. He hasn't encountered deception before.

**Minute 0:00 — Simple Setup**
The Plan screen feels overwhelming — so many slots, so many options. Tomás sticks with the suggested starter blueprint. Scout has `ON_PERCEIVE_ENEMY → SEND on recon`. Relay listens on `recon`, forwards on `strike`. Striker listens on `strike` with rule `IF [enemy_reported] THEN [move_to_intercept]`. He queues Scout, Relay, Striker on the conveyor belt and hits EXECUTE.

**Minute 0:20 — Everything Works (At First)**
The sealed watch opens. Factory produces the scout first — the little eye icon appears on the spawn tile, and the conveyor belt below the factory stutters forward. The scout patrols east. Tick 4, it spots an enemy. Buffer bar lights up. Green flash along the channel line to the relay. Relay processes. Green flash to the striker. Striker moves to intercept. Tick 6 — red flash. Enemy eliminated. Tomás pumps his fist.

**Minute 0:45 — The First Deception**
Tick 10. A thin purple line briefly connects an enemy unit to Tomás's scout. He doesn't notice it — too fast, too subtle, lost in the visual noise of the battlefield. His scout's buffer bar gains a new pip. Hook fires. Green flash to relay. Green flash to striker. The striker pivots and moves two tiles north.

Tomás watches, trusting the system. The striker is chasing a report. Tick 12 — nothing at the reported position. The striker stands alone in an empty tile. Tick 13 — an enemy striker approaches from the south, where the player's striker just was. Red flash on the relay — eliminated. Channel lines go dark.

Tick 15 — the player's striker, now deaf (relay destroyed), wanders on its last known orders. An enemy flanks it. Red flash. Game over.

**Minute 1:15 — Confused Debrief**
The Inspector opens. Tomás scrubs back, confused. "My striker was in the right place at tick 6, but then it moved to the wrong place. Why?"

He clicks the striker at tick 11. The decision trace reads: `Rule 1 matched: IF [enemy_reported] THEN [move_to_intercept]. Context entry: Slot 2, "Enemy Striker at C2, heading W."` He clicks the entry. The detail panel shows a field he's never seen: `Source: injected`.

A small tooltip appears (first-encounter tutorial moment): *"This observation was planted by an enemy Specialist. Your unit believed it was real. Consider: how could you tell the difference?"*

Tomás clicks back to the scout at tick 10. He sees the injected entry in the scout's buffer. He scrubs one tick earlier — tick 9 — the entry isn't there. Tick 10 — it appears. He looks at the board at tick 10 and sees the enemy Specialist at the edge of the scout's perception range.

"That thing *put fake data into my scout's brain?*" He's indignant. And hooked.

**Minute 2:30 — The Learning Moment**
Back at the Plan screen, Tomás opens his scout blueprint. He stares at the context config panel. He notices the "listen" toggles — currently, the scout listens to `command-net` (unused) and ignores nothing. He toggles "listen: recon" off — wait, the scout doesn't need to listen to its own channel. He hovers over the buffer size indicator: 6 slots. He thinks about how 1 fake entry consumed 1/6 of his scout's memory.

He opens the rules panel. Empty slots with dashed outlines. He tentatively types his first custom rule: `IF [observation_source == "unknown"] THEN [ignore]`. The rule editor highlights a problem — source isn't exposed as a rule-queryable field during battle. The game only reveals source in the Inspector.

A tooltip appears: *"Source verification isn't available during battle. Consider: what other signals might indicate a fake observation?"*

Tomás thinks. He doesn't know enough yet to build fidelity-based filters or cross-referencing. But he has an idea: he adds a second scout to his production queue. Two observers, two independent channels. Next time, he'll know that a report seen by only one scout might be fake. It's not a complete solution, but it's his first step toward understanding information validation — and he figured it out himself.

**Minute 3:30 — "One More Mission"**
He hits EXECUTE with two scouts, a relay, and a striker. This time, when one scout reports an enemy, he watches the other scout's coverage area. If only one reports, the striker hesitates (he added a crude rule: `IF [enemy_reported, report_count < 2] THEN [hold_position]`). It costs him a kill — a real enemy escapes because he waited for corroboration that never came. But when the deception signal comes at tick 14, his striker doesn't chase the phantom. The relay survives. He wins the mission with one unit remaining.

His striker stood still when it could have chased. His filter caught the lie — and also caught a truth. The false negative was the price of the true negative. This is the fundamental tradeoff of information validation, and Tomás just learned it by playing a video game.

**UI Annotations:**
- **First-encounter tooltip:** The word `injected` in the source field triggers a one-time tooltip on first viewing. Non-intrusive — small text below the field, fades after 5 seconds.
- **Buffer slot coloring (Inspector only):** Injected entries gain a faint red-tinted background in Inspector mode, visible only after the player has clicked the entry and revealed its source at least once. Before clicking, it looks identical to real entries. This prevents the Inspector from trivially solving deception on first glance — the player must actively investigate.
- **Scout perception radius overlay:** When hovering over a scout in the Plan screen, a translucent circle shows perception range. Two scouts' overlapping circles visually suggest redundant coverage — a natural invitation to use corroboration.

---

## The Teaching Arc Across Missions

| Mission | Deception Encountered | What the Player Learns |
|---------|----------------------|----------------------|
| 5-6 | None | Build trust in signal networks. Learn that relayed data drives striker behavior. |
| 7 | First direct injection (Phantom Phalanx) | Signals can be fake. Inspector reveals `injected` source. Emotional shock of betrayal. |
| 8 | Slow Poison + Echo Trap | Not all deceptions are obvious. Subtle corruption is harder to detect than dramatic fabrication. Need systematic validation, not just paranoia. |
| 9 | Loyalty Test + Hook modification attacks | Sophisticated deception defeats simple cross-referencing. Need to validate the validators. Security is recursive. |
| 10 | Full adversarial deception integrated with combat | Deception and combat are inseparable. The information war IS the war. The player who controls the signal layer controls the outcome. |

---

## Design Risks and Mitigations

**Risk: New player quits after Mission 7 frustration.**
Mitigation: Mission 7 introduces deception with a "training wheels" version — the enemy injects only one fabricated signal, the mission is winnable even if the player falls for it (enemy sacrifices the Specialist to perform the hack, reducing their combat force), and the Inspector post-battle highlights the injected entry with a gentle tutorial prompt. The player loses *optimally* but doesn't necessarily lose the mission.

**Risk: Paranoia collapses network play.**
Mitigation: Missions 8-10 feature enemies that punish both paranoia and naivety. Over-filtering means real threats go unaddressed. Under-filtering means deceptions succeed. The optimal architecture uses *selective* validation — high-stakes decisions (striker repositioning) require corroboration, low-stakes decisions (scout patrol routing) can act on single-source data. This teaches proportional security — the real-world principle that you don't put the same security controls on a login page and a marketing blog.

**Risk: Deception feels unfair because it's invisible during sealed watch.**
Mitigation: The purple flash on hack events is a deliberate breadcrumb. On first viewing, the player might miss it. On replay (Inspector scrubber), they'll catch it. Over multiple missions, players learn to watch for the purple flash — it becomes a signal itself, a meta-level observation that feeds the player's own "context window." The game teaches situational awareness through its own observation mechanics.
