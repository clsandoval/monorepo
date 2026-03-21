# Onboarding: Detection Skills as Complexity Gate

**Aspect ID:** 5.14
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.14a (fidelity threshold as onboarding gate), 5.14b (per-channel fidelity thresholds), 5.14e (enemy fidelity spoofing), 2.10 (signal taxonomy), 5.17 (hybrid tutorial architecture), 5.04b (vocabulary density curve)

---

## The Core Idea

Most games handle difficulty with a slider: Easy / Normal / Hard. The player picks a label before they know what the game even is, and every subsequent experience is filtered through that binary gate. Robot Uprising can do something more elegant — difficulty that scales with **player investment** rather than player self-assessment.

The "intrusion detection" skill is the prototype for this pattern. It is a Specialist-class skill (equippable in one of the Specialist's limited skill slots alongside hack and extract) that reveals **hidden corruption** in the information flowing through the player's network. Without it, corrupted signals look identical to clean ones. The game is perfectly playable — the corruption exists, subtly degrading outcomes, but the player never sees it and may attribute losses to other causes. With intrusion detection equipped, the Specialist periodically scans signals passing through adjacent units' context windows and flags entries that have been tampered with, spoofed, or degraded beyond a corruption threshold.

The key insight: **the game doesn't become harder when you equip intrusion detection. It becomes deeper.** A beginner who never equips it plays a clean, comprehensible game about scouts reporting to strikers. A veteran who equips it discovers an entire shadow layer of information warfare — enemy signal injection, relay chain degradation, spoofed coordinates — and must now manage that layer on top of everything else. The difficulty didn't change. The player's aperture did.

This is the **Progressive Lens** pattern applied to an entire game mechanic rather than a UI element. The complexity was always there. The skill just makes it visible.

---

## How Intrusion Detection Works Mechanically

### The Skill

**Intrusion Detection** is a Specialist skill. When equipped:
- The Specialist passively scans the context windows of all friendly units within its perception radius (3 tiles) once per tick
- Any context entry with a corruption flag (set by enemy spoofing, extreme relay degradation, or direct enemy hack) gets marked with a red exclamation glyph
- The Specialist broadcasts a "corruption-alert" signal on a configurable channel, containing: corrupted entry ID, affected unit, corruption type, source (if traceable)
- In the Inspector post-battle, corrupted entries are highlighted with a red border and a trace showing where the corruption originated

### What Corruption Is

Corruption is a hidden metadata field on every context entry. Clean entries have corruption = 0. Corruption can be introduced by:

1. **Enemy signal spoofing** (Missions 7+): Enemy relays inject fake position reports and threat alerts into player channels. These arrive with plausible fidelity scores (0.5-0.7) but corruption = 1.0.
2. **Extreme relay degradation**: A signal relayed through 4+ hops accumulates minor corruption (0.1 per hop beyond 2). At corruption > 0.5, the positional data is noticeably inaccurate.
3. **Enemy hack attacks** (Specialist enemy units): A hacked unit's context window gets corruption injected into random slots. The unit's subsequent decisions are based on tainted data.
4. **Environmental interference** (terrain-specific): Certain tiles (volcanic Taal, dense jungle Palawan) add corruption to signals passing through them, creating "dead zones" where relay chains become unreliable.

### The Invisible Layer

Without intrusion detection, corruption is **mechanically active but visually invisible**. A corrupted position report still shows up as a normal cyan entry in a unit's context window. A striker receiving a spoofed "enemy at E4" moves to E4 and finds nothing — but the player sees this in the sealed watch as the striker "making a mistake," not as "acting on corrupted data." The player might think their rule logic is wrong, or their relay chain has too much latency. They'll adjust rules, rewrite hooks, restructure their network — all valid responses, but none addressing the actual cause.

This is not unfair. The game is designed so that corruption alone never causes a loss on standard difficulty missions. It causes suboptimal behavior — wasted ticks, missed engagements, unnecessary movement — but a well-designed architecture with redundancy and good eviction policies absorbs these inefficiencies. The player wins, but perhaps not as cleanly. The corruption is a performance tax, not a death sentence.

When intrusion detection is equipped, the tax becomes visible — and manageable. The player can now design architectures that actively counter information warfare, opening up an entire strategic layer that was always present but invisible.

---

## The Three Depths of Play

### Depth 1: The Clean Game (No Detection)

The player never equips intrusion detection. They experience Robot Uprising as a game about information architecture — routing signals, managing context windows, designing rule logic. Enemy signal flooding exists and causes context overload (which they handle with fidelity thresholds from 5.14a). But the subtler corruption — spoofed coordinates, injected false reports — manifests only as occasional "weird" unit behavior that resolves itself with better architecture.

**This is a complete, satisfying game.** The player never feels like they're missing something. Victories feel earned. Losses feel diagnosable through the Inspector (which shows rule matching and context state, but not corruption flags unless detection was active).

### Depth 2: The Revealed Game (Detection Equipped)

The player equips intrusion detection on a Specialist. Suddenly, red exclamation glyphs bloom across their network during sealed watch. Units they thought were acting on clean data were processing corrupted entries. The Inspector now shows corruption traces — red-bordered entries with source attribution. The player discovers that their "reliable" 3-hop relay chain was delivering data with 0.3 corruption on every signal.

**This is the "red pill" moment.** The game hasn't changed. But the player's understanding of what was happening has shifted fundamentally. They now have a new optimization axis: not just "does the information arrive?" but "is the information trustworthy?"

### Depth 3: The Counter-Intelligence Game (Detection + Response Architecture)

The veteran player designs architectures where intrusion detection isn't just diagnostic but **reactive**. The Specialist's corruption-alert channel feeds into a Command agent's rule logic:

- Rule: WHEN corruption-alert AND source = relay-B THEN reroute relay-B traffic to relay-C
- Rule: WHEN corruption-alert AND type = spoofed-position THEN deprioritize all position data from affected channel for 3 ticks
- Rule: WHEN corruption-count > 3 in 5 ticks THEN broadcast "network-compromised" on command channel

The player is now running a counter-intelligence operation on top of their military operation. They're building immune systems. The game has become fundamentally richer — not because a difficulty slider was moved, but because the player chose to look deeper.

---

## Player Journeys

#### Journey: Sofia, 16, High School Student, First Strategy Game

**Context:** Mission 7, first encounter with enemy signal spoofing. Sofia has beaten Missions 1-6 with straightforward Scout→Relay→Striker architectures. She has never equipped intrusion detection — she picked hack and extract for her Specialist because the boot log described them as "offensive capabilities" and she likes offense. She doesn't know corruption exists as a mechanic.

**Minute 0:00 — The Plan**
Sofia opens the Plan screen. The workbench shows her three blueprints: Scout (patrol, evade), Relay (compress, amplify), Striker (engage, breach). She also has a Specialist blueprint with hack and extract. She's used the Specialist to hack enemy relays in the last two missions — it's become her favorite trick. The production queue shows Scout → Relay → Striker → Specialist → Striker. Standard build order.

The board preview on the left shows the Cebu urban terrain: dense grid of buildings creating chokepoints and sight-line blockers. Enemy spawner in the northeast corner. Her factory in the southwest. She places her usual hooks: Scouts broadcast "threat" on detection, Relay compresses and forwards on "intel," Strikers listen to "intel" and engage.

She notices a new skill in the Blueprint Codex: "Intrusion Detection" under the Specialist's available skills. The card shows a magnifying glass icon with a red exclamation overlay. Description reads: "Scan nearby units' context windows for corrupted entries. Broadcasts alerts on a configurable channel." Sofia reads it, shrugs — "I already have hack and extract, those are more fun" — and moves on. She doesn't equip it.

**Minute 2:00 — Sealed Watch (The Fog)**
She hits EXECUTE. The tick clock begins. Her factory produces units in order. By tick 8, she has two Scouts patrolling the western approach, a Relay in the center, and a Striker waiting for intelligence. Everything feels normal.

Tick 10: The enemy spawner produces two enemy relays. They take positions behind buildings. Sofia doesn't notice them — her Scouts' patrol routes cover the western half of the board, not the eastern.

Tick 12-15: Subtle change. Her Striker, which had been holding position near the Relay, suddenly moves northeast — toward tile E6. Sofia leans forward. "Why is it going there? Nobody reported anything there." The Striker's context bar is at amber — filling up with... something. One tick later, the Striker arrives at E6. Empty tile. It stands there, doing nothing, for two ticks while its rule logic fails to match any condition (no enemy adjacent, no threat detected).

Tick 17: An actual enemy Striker approaches from the east. Sofia's Scout on the western patrol doesn't see it — wrong side of the board. Her own Striker is at E6, three tiles away from the real threat. By the time it processes a legitimate signal and starts moving, the enemy is adjacent to her Relay. One shot. Kill. The Relay goes dark. Signal chains dissolve. Her remaining units drift on stale data.

**Minute 4:00 — The Confusion**
Sofia loses. She watches the defeat screen — her Striker standing at E6 while the enemy flanked from the east. "Why did my Striker go to E6?! I didn't tell it to go there!" She's frustrated but not confused in a hopeless way — the Inspector is next.

**Minute 4:30 — The Inspector (Incomplete Picture)**
She opens the Inspector and scrubs to tick 12. Clicks on her Striker. The context window shows six entries. Slot 3 contains: "Enemy detected at E6, fidelity 0.62, source: intel channel." She checks the signal trace — it came through her Relay, which received it from... the intel channel. But her Scouts didn't send that signal. Where did it come from?

Without intrusion detection having been active, there's no corruption flag visible. The entry looks legitimate — fidelity 0.62 is moderate but reasonable for a relayed signal. Sofia can see that the signal didn't originate from her Scout (the source chain shows the Relay received it directly, not from Scout→Relay), but she might not notice this detail. She might conclude: "I need better patrol routes" or "I need my Scouts covering the east too."

Both conclusions are valid and will help her. She doesn't know about corruption. She doesn't need to.

**Minute 7:00 — The Retry**
Sofia redesigns with wider Scout patrol coverage and an additional Scout in her production queue. She retries. With better coverage, her Scouts spot the real threats before the spoofed signals can misdirect her Strikers. The spoofed signals still arrive, still fill context slots, still cause occasional weird behavior — but with redundant intelligence from real Scouts, the correct data outweighs the corrupted data in her Strikers' context windows. She wins.

Sofia never learns about corruption. She solved the problem through architecture — redundancy, coverage, information saturation. Her solution is valid. The game rewarded her for it.

**UI Annotations:**
- Blueprint Codex: "Intrusion Detection" card shows magnifying glass icon, red "!" overlay, grayed "Not Equipped" badge. Sofia scrolls past it.
- Context window in Inspector: six horizontal slots, each with content label, fidelity score (0.0-1.0 right-aligned), source chain (small text below). No corruption indicators visible because detection wasn't active.
- Signal trace: thin dashed lines in the timeline view connecting signal origin → relay → destination. The spoofed signal's trace shows "Relay → Striker" with no upstream origin — but this detail is rendered in the same visual language as legitimate relayed signals.

---

#### Journey: Marcus, 28, Software Engineer, Factorio/Zachtronics Veteran

**Context:** Mission 7, same scenario as Sofia. Marcus has already beaten it once the "clean" way (better Scout coverage). But something nagged him — that signal at E6 that didn't come from his Scouts. He's replaying Mission 7 to investigate. He noticed the "Intrusion Detection" skill in the Codex two missions ago and has been waiting for a reason to use it.

**Minute 0:00 — The Hypothesis**
Marcus reopens Mission 7's Plan screen. He pulls up his Specialist blueprint and makes a deliberate choice: he unequips "extract" and equips "Intrusion Detection" in its place. The skill card snaps into the slot with a subtle scanner-pulse animation — concentric cyan rings radiating outward from the Specialist's icon for half a second, then fading. The Specialist's portrait in the blueprint editor gains a small magnifying glass badge in the corner.

He configures the Intrusion Detection hook: channel name "security." He wires his Command agent to listen to "security" — not with any rules yet, just listening. He wants to see what the detection picks up before he automates responses.

His production queue: Scout → Relay → Specialist → Striker → Scout. The Specialist deploys third — earlier than most players would — because Marcus wants maximum scan coverage of the early game.

**Minute 2:30 — Sealed Watch (The Revelation)**
EXECUTE. The tick clock fires. His factory produces units. By tick 6, the Specialist is deployed, positioned adjacent to the Relay in the center. Its perception radius (3 tiles) covers the Relay and the nearest Scout.

Tick 10: The enemy relays deploy in the northeast. Tick 12: The first spoofed signal arrives on the "intel" channel. Marcus watches it enter the Relay's context window — a cyan pip appears in the context bar. Normal.

But this time, something new happens. The Specialist's scan fires. The Relay's context bar flickers — and the third pip turns from cyan to **angry red**, pulsing once with a small "!" glyph floating above it for one tick. Simultaneously, a thin red dashed line flashes from the Specialist to the Relay — the scan connection. The Specialist broadcasts on "security": a signal that reads "CORRUPTION DETECTED: relay-alpha, slot 3, type: spoofed-position, fidelity: 0.62, corruption: 1.0."

Marcus sits bolt upright. "It's SPOOFED. The fidelity said 0.62 but the corruption is 1.0. It's a complete fake." He watches the next few ticks with new eyes. More spoofed signals arrive — ticks 13, 14, 15. Each one, the Specialist flags with that angry red pip flash. The "security" channel lights up with alert after alert. His Command agent's context window fills with corruption alerts — but without response rules configured, the Command just... accumulates the information without acting on it.

His Striker still receives some spoofed data (the Specialist only scans units within 3 tiles, and the Striker is positioned 4 tiles away — outside scan range). The Striker makes the same wrong move to E6. But Marcus doesn't care about winning this run. He's watching the corruption unfold with clinical fascination.

**Minute 5:00 — The Inspector (Full Picture)**
He loses again — same way, Striker at E6, enemy flanking the Relay. But now the Inspector is transformed. He scrubs to tick 12 and clicks the Relay. The context window shows the same six entries — but now slot 3 has a **red border** with a corruption trace. He clicks it.

A detail panel slides open: "Source: external (no friendly origin), Fidelity: 0.62 (reported), Corruption: 1.0 (detected by Specialist-alpha at tick 12), Type: spoofed-position, Coordinates claimed: E6, Actual source: enemy-relay-2 at G7." A thin red line on the board traces from G7 (enemy relay) through the channel to his Relay at D4.

Marcus exhales. "They're injecting fake coordinates into my channel. The enemy relay is broadcasting on 'intel' — my own channel name." He checks the channel map panel. Sure enough, the "intel" channel has five listeners: his two Scouts (broadcast), his Relay (listen + forward), his Striker (listen)... and enemy-relay-2 (broadcast). The enemy hijacked his channel by name.

**Minute 7:00 — The Counter-Architecture**
Marcus restarts. This time, he builds a counter-intelligence architecture:

1. Specialist with Intrusion Detection positioned adjacent to the Relay (scan range covers the central hub)
2. New channel: "verified-intel" — the Specialist listens to "intel," scans incoming signals, and only forwards clean ones to "verified-intel"
3. Strikers now listen to "verified-intel" instead of "intel"
4. Command agent has a rule: WHEN corruption-alert AND corruption-count > 2 in 3 ticks THEN broadcast "channel-compromised" on "command"

The architecture is now a firewall. Spoofed signals enter "intel," the Specialist catches them, only clean signals reach "verified-intel" and the Strikers. The Specialist's context window fills with corruption alerts — but it has 10 slots and the compress skill could manage the load if needed.

He hits EXECUTE. Sealed watch. The enemy spoofing begins at tick 10. Red pips flash on the Relay — and then immediately, green pips appear on the Specialist as it processes and verifies. The Strikers' context bars stay cool blue. Clean data only. His Strikers move to real targets. The enemy, confused that their spoofing isn't working, falls back on conventional tactics. Marcus's architecture handles conventional threats easily.

He wins. Not just wins — dominates. The Specialist didn't fire a single hack. It sat in the center, scanning, filtering, protecting the information network. Marcus grins. "I built a firewall. An actual firewall."

**Minute 10:00 — The Meta-Realization**
In the Inspector, Marcus reviews the Specialist's activity log. 23 corruption detections across 40 ticks. 23 signals that would have entered his Strikers' context windows and caused misdirection. His "verified-intel" channel carried 11 clean signals. His Strikers acted on all 11 — zero wasted ticks.

He opens the Blueprint Codex and reads the Intrusion Detection card again. The description now has an addendum (unlocked by first detection): "Advanced: Corruption types include spoofed-position, faked-threat, injected-noise, and relay-decay. Each type requires different countermeasures." He realizes this is deeper than he thought. There's a taxonomy of corruption he hasn't explored yet.

**UI Annotations:**
- Intrusion Detection scan: thin concentric cyan rings pulse outward from Specialist once per tick during sealed watch (subtle, not distracting). When corruption found, the ring flashes red on that tick.
- Corruption pip: context bar pip changes from cyan to pulsing red with floating "!" for one tick. Returns to static red border afterward.
- Inspector corruption trace: red-bordered entry expands on click to show source attribution, corruption type, and a red dashed line on the board tracing the spoofed signal's origin.
- "verified-intel" channel: appears in the channel map panel with a small shield icon indicating it's downstream of a detection-filtered source.
- Channel hijacking: the channel map panel shows enemy-relay-2 broadcasting on "intel" with a red warning badge — but ONLY if Intrusion Detection was active. Without it, the enemy broadcaster is invisible in the channel map.

---

#### Journey: Priya, 34, Cybersecurity Analyst, Mission 9 Veteran

**Context:** Mission 9, deep campaign. Priya has been using Intrusion Detection since Mission 7. She's built increasingly sophisticated counter-intelligence architectures. She's about to face the hardest information warfare challenge in the campaign: enemy fidelity spoofing combined with direct hack attacks on her detection infrastructure.

**Minute 0:00 — The Arms Race**
Priya opens Mission 9's Plan screen. The board preview shows Manila megacity terrain — dense urban grid, many buildings blocking line of sight, multiple choke points. The enemy spawner in the north is marked with a new icon she hasn't seen: a red broadcast tower with concentric rings. The boot log reads: "ADVISORY: Hostile signal infrastructure detected. Multiple emission sources. Expect coordinated information warfare."

Priya smiles. This is her domain — professionally and now in-game. She opens her Specialist blueprint. Two skill slots. She equips Intrusion Detection (non-negotiable at this point) and hack (for offensive counter-operations). She's given up extract entirely — information warfare has replaced resource extraction as her strategic axis.

Her architecture is mature:
- **Two Specialists** (unusual — most players run one). Specialist-alpha scans the western network. Specialist-beta scans the eastern.
- **Dedicated "security" channel** with Command agent listening and automated response rules
- **"quarantine" channel** — when corruption is detected, the corrupted unit's channel gets rerouted to "quarantine" for 3 ticks while the Specialist re-scans
- **"verified-intel" and "verified-threat"** filtered channels that Strikers exclusively listen to
- **Rule on Command:** WHEN corruption-alert AND source-type = hack-attack THEN reassign nearest Striker to protect affected unit (physical defense of information infrastructure)

The production queue is long: Scout → Relay → Specialist-alpha → Striker → Scout → Relay → Specialist-beta → Striker → Striker. Nine units. She's investing heavily in infrastructure before combat power.

**Minute 3:00 — Sealed Watch (The Sophisticated Attack)**
EXECUTE. The factory hums. Units deploy across the Manila grid. By tick 10, her western network is operational: Scout→Relay→Specialist-alpha scanning. By tick 14, the eastern network comes online with Specialist-beta.

Tick 15: The enemy attack begins. But it's not the simple spoofing from Mission 7. Three things happen simultaneously:

1. **Enemy relay-1** broadcasts spoofed position reports on "intel" (the standard hijack)
2. **Enemy relay-2** broadcasts on a NEW channel: "security" — spoofing corruption alerts to confuse her Command agent
3. **Enemy Specialist** moves toward her western Relay, preparing a hack attack

Priya watches with narrowed eyes. Her Specialist-alpha catches the first spoofed "intel" signals — red pips flash on the Relay, corruption alerts fire on the real "security" channel. But then — her Command agent's context window starts filling with TWO streams of security alerts: real ones from Specialist-alpha (corruption detected on Relay) and fake ones from enemy relay-2 (fabricated alerts about units that aren't corrupted).

The Command's context bar goes from blue to amber in three ticks. It's being drowned in security noise — meta-corruption. Corruption of the corruption detection system itself. Her Command agent's automated rules start firing erratically: rerouting channels that don't need rerouting, quarantining units that are clean, reassigning Strikers to protect units that aren't under attack.

Tick 20: The enemy Specialist reaches her western Relay and executes a hack. The Relay's context window gets injected with corrupted entries — but Specialist-alpha catches this too, adding MORE alerts to the already-overwhelmed "security" channel. The Command's context bar hits red. One more tick and it'll overload.

Tick 21: Context overload. The Command agent stuns — sparking, jittering, frozen. For one tick, no commands flow. Priya's entire automated defense network goes silent. The enemy Striker, which had been held back waiting for exactly this moment, advances through the gap.

**Minute 5:30 — The Recovery**
Tick 22: The Command recovers from stun. Its context window has been compacted — evicting the lowest-priority entries (which, because Priya configured eviction properly, are the oldest alerts). Fresh alerts from Specialist-alpha and Specialist-beta arrive. The Command resumes operations, but the enemy Striker is now adjacent to her eastern Relay.

Priya watches the Striker eliminate her eastern Relay. She grimaces. But the western network holds — Specialist-alpha's detection kept the western channel clean, and the two western Strikers are engaging enemy units effectively. The battle degrades into a grinding fight. She wins, barely, with two units surviving.

**Minute 7:00 — Inspector (The Post-Mortem)**
Priya opens the Inspector with the intensity of a SOC analyst reviewing incident logs. She scrubs to tick 15 — the moment the attack began. She clicks the Command agent and traces every context entry:

- Ticks 15-17: Legitimate corruption alerts from Specialist-alpha (red border, clean trace to Specialist-alpha)
- Ticks 16-18: Spoofed "security" alerts from enemy relay-2 (red border... but also red border? She clicks one. "Source: security channel, fidelity 0.71, corruption: 1.0 — detected by Specialist-beta at tick 17"). The fake security alerts were themselves detected as corrupted by Specialist-beta — but the detection arrived 1-2 ticks after the fake alert, due to signal latency.

The timing gap was the vulnerability. The fake security alert arrived at tick 16. The detection of that fake alert arrived at tick 17. The Command agent processed the fake alert at tick 16 and issued an erroneous reroute. By tick 17, the correction arrived — but the reroute was already in effect.

Priya's fix crystallizes: she needs a **delay rule** on the Command agent. Instead of acting immediately on security alerts, buffer them for 1 tick and wait for confirmation or contradiction. Trade response speed for accuracy. An intentional latency injection — the information security equivalent of "wait for the second source before publishing."

She opens the Plan screen and adds a new rule to the Command: WHEN corruption-alert THEN wait 1 tick AND IF confirmed by second source THEN act ELSE discard. She's designing a consensus mechanism. A real-world security pattern, implemented in game as a drag-and-drop rule configuration.

**Minute 10:00 — The Replay**
She retries with the delay rule. This time, when the fake security alerts arrive, the Command buffers them for one tick. Specialist-beta's detection of the fakes arrives during that buffer window. The Command discards the fakes. The real alerts get confirmed and processed. The Command's context window stays at amber — busy but not overwhelmed. No stun. No gap. The enemy Striker advances but meets a wall of properly-coordinated Strikers.

Clean win. Full network integrity maintained. Priya leans back. "I just built a SIEM. In a video game. And it worked."

**UI Annotations:**
- Dual Specialist scan: two sets of concentric cyan rings pulsing from different positions on the board, overlapping in the center. When both detect the same corruption, the overlap zone flashes bright cyan — visual confirmation of corroborated detection.
- Meta-corruption: the Command agent's context bar showing mixed red pips (real alerts) and red pips with a subtle orange tinge (fake alerts that haven't been verified yet). After Specialist-beta detects the fakes, the orange-tinged pips gain a strikethrough — visually "crossed out" in real-time.
- Delay rule visualization: when the Command buffers a security alert, the context pip has a tiny hourglass overlay, ticking for 1 tick. If confirmed, the hourglass dissolves and the pip solidifies. If contradicted, the pip fades to transparent and evicts.
- Hack attack: when the enemy Specialist hacks the Relay, a jagged red lightning bolt connects them for 1 tick. The Relay's context pips scramble — several change color randomly, simulating data corruption.
- "quarantine" channel in channel map panel: appears as a dashed-outline channel with a yellow hazard stripe pattern. Units rerouted to quarantine show a yellow badge on their board icon.

---

#### Journey: Tomás, 42, Casual Mobile Gamer, "I Just Want to Play"

**Context:** Mission 8, late campaign. Tomás plays on his lunch break, 15 minutes at a time. He's never equipped Intrusion Detection. He doesn't read the Blueprint Codex thoroughly. He's beaten every mission so far by iterating on simple architectures — more Scouts, more Strikers, straightforward hooks. He enjoys the game as a puzzle game, not an information warfare simulator.

**Minute 0:00 — The Simple Plan**
Tomás opens Mission 8. He's running a proven architecture: three Scouts with wide patrol, two Relays for redundancy (he learned this from Mission 6 when a single Relay was a bottleneck), three Strikers. No Specialist — he tried one in Mission 7 but didn't like the complexity. His blueprints use default context configs with fidelity thresholds set to 0.4 (he learned this from the Fog Mission's debrief).

The board shows Mindanao jungle terrain. Dense vegetation limiting perception ranges. Enemy spawner to the north. He sets up his hooks — "threat" and "intel" channels, standard wiring — and hits EXECUTE.

**Minute 1:30 — Sealed Watch (The Invisible War)**
Behind the scenes, enemy relays are spoofing signals on his "intel" channel. Corrupted entries enter his Relay's context windows. But three things protect Tomás without his knowledge:

1. His fidelity threshold (0.4) rejects the lowest-quality spoofed signals
2. His two-Relay redundancy means real intelligence outnumbers spoofed intelligence in his Strikers' context windows
3. His three Scouts provide such a density of real observations that the spoofed data gets evicted by higher-fidelity real data before it can influence decisions

Tomás watches his Strikers occasionally hesitate — pausing for a tick before moving, or taking a slightly suboptimal path. He doesn't realize these are moments where spoofed data temporarily occupied context slots. To him, it just looks like the units are "thinking." He doesn't mind. The Strikers still engage and eliminate enemies. He wins in 35 ticks.

**Minute 4:00 — The Debrief**
The debrief shows: "Mission Complete. 3 units lost. 12 enemies eliminated. Network efficiency: 74%." That 74% is lower than his usual 85-90% — the corruption caused wasted ticks and suboptimal routing. But Tomás doesn't know what 74% means relative to what's possible. He just sees: mission complete, moving on.

The Inspector is available, but Tomás doesn't open it. He got the win. Time to get back to work.

**What Tomás Never Sees:**
- 17 corrupted entries entered his network during the battle
- His Strikers wasted 8 ticks on misdirected movement due to spoofed coordinates
- One Striker was eliminated because it moved to a spoofed position and was flanked by a real enemy it would have seen coming if its context window hadn't been cluttered with fakes
- His "network efficiency: 74%" could have been 95% with a Specialist running Intrusion Detection

None of this matters. Tomás won. He had fun. He'll play Mission 9 tomorrow.

**UI Annotations:**
- No corruption indicators visible anywhere — no red pips, no "!" glyphs, no red borders in Inspector. The game looks identical to a game without corruption.
- Network efficiency percentage in debrief: displayed as a simple stat, no judgment. Not "74% — POOR" but just "74%." The number is there for players who want to optimize. Tomás doesn't.
- Striker hesitation: during sealed watch, affected Strikers pause for one tick (no movement, no action) before continuing. Visually indistinguishable from normal decision-making delay.

---

## Strengths

**1. Organic Difficulty Scaling.** The game doesn't need an Easy/Normal/Hard selector. Player sophistication IS the difficulty dial. Someone who equips Intrusion Detection is, by definition, ready for the complexity it reveals. The game trusts the player to gate their own experience.

**2. Discovery as Reward.** Equipping Intrusion Detection and seeing the corruption layer for the first time is a genuine discovery moment — like finding a hidden room in Dark Souls. The information was always there; you just learned to see it. This creates powerful "wait, WHAT?" moments that players share with friends and post about online.

**3. Multiple Valid Solutions.** Sofia's redundancy architecture solves the corruption problem without ever seeing it. Marcus's firewall architecture solves it through direct detection. Priya's consensus mechanism solves the meta-corruption problem. Tomás's brute-force approach absorbs it through sheer information density. All four are valid. The game rewards all of them.

**4. Real-World Skill Transfer.** Priya's journey explicitly mirrors real cybersecurity practices: intrusion detection systems, SIEM, consensus mechanisms, defense-in-depth. The game teaches transferable concepts without ever breaking the fourth wall. A player who builds a corruption-detection relay chain has genuinely understood how network security monitoring works.

**5. Social Stratification Without Toxicity.** In multiplayer conversations, a veteran who says "I built a counter-intelligence Specialist" and a beginner who says "I used three Scouts to cover more ground" are both describing valid winning strategies. The veteran isn't "better" — they're playing a deeper version of the same game. No one is told they're on "easy mode."

## Weaknesses

**1. Discovery Discoverability.** If the game is too subtle about corruption's existence, players may never try Intrusion Detection. The skill description must hint at what it reveals without giving away the full depth. The Codex card "Scan nearby units' context windows for corrupted entries" is informative but not enticing. It might need a more evocative hook: "Some signals aren't what they seem."

**2. Balance Tightrope.** Corruption must be impactful enough that detection matters, but mild enough that non-detection isn't punishing. If corruption causes Mission 8 to be significantly harder without detection, the game is effectively gating content behind a specific skill choice — violating the "clean experience for beginners" principle. The invisible tax must stay below the threshold of "this feels unfair."

**3. Inspector Discrepancy.** When a player WITHOUT detection reviews the Inspector, they see context entries without corruption flags. If they later equip detection and replay, they see corruption flags on entries that were previously clean-looking. This could feel retroactively dishonest: "The game was hiding information from me." The framing must be: "Your Specialist detected something new" — not "the game was lying to you."

**4. Skill Slot Competition.** The Specialist has only 2 skill slots and 3 available skills (hack, extract, intrusion detection). Choosing detection means giving up hack OR extract. For players who've built their strategy around hacking enemy units, this is a painful trade. The game should ensure that detection and hack can coexist in later missions — perhaps through a Command agent's "reassign" skill granting a temporary third slot, or through a Gauntlet modifier that grants all Specialists a bonus detection slot.

**5. Content Cliff for Veterans.** Once a veteran player has fully mapped the corruption layer and built optimal counter-intelligence architectures, there's no deeper layer to discover. The progressive lens has a bottom. Gauntlet modifiers (enemy fidelity spoofing from 5.14e, adaptive thresholds from 5.14d) extend this, but the fundamental mechanic has a depth ceiling.

---

## Interaction Effects

**With fidelity thresholds (5.14a):** Fidelity thresholds filter by quality score; intrusion detection filters by corruption flag. These are complementary but distinct. A spoofed signal with fidelity 0.7 passes the fidelity threshold but fails corruption detection. This teaches that **quality and authenticity are different properties** — a signal can be high-quality and fake, or low-quality and genuine. This distinction is fundamental to real-world information security.

**With the emissions model (locked):** Running Intrusion Detection adds EM noise (the Specialist is actively scanning, which emits detectable signals). A detection-heavy architecture is louder — which means the enemy can detect that you're running counter-intelligence. This creates a stealth tradeoff: scan more for better security, but become a louder target. The secure architecture is the visible architecture.

**With the Inspector (locked):** The Inspector becomes dramatically more useful with detection data. Without it, the Inspector shows rule matching and context state — useful for debugging logic. With detection data, the Inspector shows corruption traces and source attribution — useful for understanding information warfare dynamics. The Inspector's value scales with the player's investment in detection, reinforcing the progressive lens pattern.

**With Command agent meta-level (locked):** Detection alerts become inputs to Command agent rule logic, enabling automated defensive responses. This is the bridge between "I manually react to corruption" and "I build a system that reacts to corruption for me" — the meta-level progression that's central to the game's identity.

**With enemy design (campaign):** Enemy capabilities must be designed to create meaningful challenges at BOTH depth levels. An enemy that only uses corruption-based attacks is trivial for detection-equipped players and confusing for non-equipped players. Enemies must always have a "physical" threat component (conventional Strikers) alongside information warfare. The best enemy designs use corruption to create openings for conventional attacks — not as the attack itself.

---

## Comparable Games

**Cogmind's Sensor System.** Cogmind has a layered perception system: basic sight, enhanced sensors, full-spectrum analysis. Players who invest in sensor utilities see more of the game world — enemy patrol routes, trap locations, structural weaknesses. Players without sensors play a simpler game of corridor combat. The key difference: Cogmind's sensors reveal spatial information; Robot Uprising's detection reveals information integrity. Both use investment as a complexity gate.

**Dark Souls' Illusory Walls.** The entire Dark Souls community splits between players who know about illusory walls and players who don't. Both groups play the same game. The knowledge of hidden passages creates a richer experience without diminishing the base experience. Robot Uprising's corruption layer is the illusory wall of information warfare — always there, visible only to those who invest in looking.

**Slay the Spire's Ascension Levels.** Each Ascension level adds a stacking modifier that reveals new strategic considerations. Ascension 1 (enemies hit harder) teaches defensive balance. Ascension 10 (start with a curse card) teaches deck management. Robot Uprising's detection skill is like an Ascension level the player can opt into voluntarily — but instead of making the game harder, it makes the game more complex while providing new tools to handle that complexity.

**Into the Breach's Vek Emerging Pattern.** Into the Breach shows you where enemies will emerge before they appear. This information is available to all players, but only experienced players use it for pre-positioning. The information creates a complexity gate: beginners react to what's on the board; veterans plan for what's coming. Robot Uprising's detection similarly creates a temporal gate: beginners react to what their units do; veterans pre-plan for what corruption will do to their units.

---

## Sensory Description

**The Detection Pulse.** When the Specialist scans, concentric rings of thin cyan light expand outward from its position on the board, covering its 3-tile perception radius. The rings are faint — almost subliminal — pulsing once per tick like sonar. When corruption is found, the ring flashes hot red on that tick, a single angry strobe that draws the eye. The effect is like a heartbeat monitor: steady, steady, steady — SPIKE.

**The Corrupted Pip.** In a unit's context bar (those tiny colored pips at the bottom of the tile), a corrupted entry renders as a pip that's subtly wrong. Where clean pips are solid cyan, corrupted pips pulse between cyan and red at a frequency just fast enough to register as "something's off" but not fast enough to be immediately obvious. Only when the Specialist scans them do they solidify into unmistakable angry red with the floating "!" glyph. Before detection, they're Schrödinger's data — corrupted but unobserved.

**The Corruption Trace in Inspector.** When you click a corrupted entry in the Inspector, the detail panel has a different visual treatment than clean entries. The background is a barely-visible red gradient instead of the standard dark panel. The source chain renders in red dashed lines instead of cyan solid lines. The enemy source at the end of the chain is highlighted with a pulsing red diamond. The feeling is forensic — you're looking at evidence.

**The Firewall Moment.** When a Specialist successfully blocks a corrupted signal from reaching downstream units (via the "verified-intel" filtered channel pattern), there's a subtle visual payoff: the red dashed line of the corrupted signal extends from the enemy source, hits the Specialist, and terminates. A small shield glyph flashes at the termination point. The clean signal continues past the Specialist as a green dashed line. The visual language says: attack blocked, clean signal forwarded. One tick, two lines, one story.

**The Sound of Detection.** The scan pulse is near-silent — a soft, high-frequency ping, like submarine sonar rendered digitally. When corruption is detected, the ping drops an octave and gains a metallic edge, like a tuning fork struck on steel. The sound is brief (0.2 seconds) and doesn't interrupt the battle's ambient soundscape. But once you've heard it, you can't un-hear it — the corruption detection sound becomes an audio cue that experienced players listen for like a smoke detector chirp.

---

## The TikTok Clip

*The clip opens on a sealed watch battle — units moving across an isometric Manila cityscape. Everything looks normal. Cut to: the player equipping Intrusion Detection on a Specialist. Cut to: the same battle, same moment — but now, angry red pulses bloom across the network. Pips flash red. The Specialist's scan rings strobe. The player zooms into the Inspector: red-bordered entries, enemy source traces. Text overlay: "The corruption was always there. You just couldn't see it." Cut to: the player's reaction — jaw drop. Cut to: a firewall architecture blocking every red signal, green signals flowing clean. Final text: "I didn't change the difficulty. I changed what I could see."*

The clip works because it shows the SAME game looking completely different based on one skill choice. The before/after is inherently shareable — "wait, YOUR game has red stuff? Mine doesn't have any red stuff" — and creates immediate curiosity about what else might be hidden.
