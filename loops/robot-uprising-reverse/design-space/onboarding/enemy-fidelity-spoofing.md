# 5.14e — Enemy Fidelity Spoofing: The Arms Race as Difficulty Escalator

**Aspect:** 5.14e — Enemy fidelity spoofing: late-game enemy tactic with artificially inflated fidelity scores; forces secondary quality checks beyond threshold slider; source authentication, signal chain verification; the arms race as difficulty escalator

**Wave:** 5 (Onboarding & Campaign)

**Category:** Onboarding / Adversarial Escalation

**Dependencies:** 5.14a (fidelity threshold as onboarding gate), 5.14b (per-channel fidelity thresholds), 5.14c (fidelity as rule condition), 5.14d (adaptive fidelity threshold), 2.11 (signal fidelity degradation), 2.12 (deception signals), 2.26 (fidelity spoofing as attack primitive), 5.04 (complexity ramp), 5.11e (corruption as enemy characterization), 3.05 (rules language)

---

## The Design Question

By Mission 6, the player has spent five missions building trust in a system. They have learned that signals carry fidelity scores. They have learned that higher fidelity means more reliable data. They have internalized a simple heuristic: set a threshold, reject the noise, trust the rest. The fidelity slider is the first real security tool they own, and it works. It has been working for one or two missions. The player has formed a belief: *fidelity scores tell the truth.*

The question is: **how does the game shatter that belief without breaking the player?**

Fidelity spoofing is the answer. It is the moment the game says: the numbers you trusted were written by someone who wants you dead. The threshold slider that felt like a lock on the door is revealed as a lock the enemy has the key to. Every signal that enters your buffer at fidelity 0.85 is no longer automatically trustworthy --- it might be a lie stamped with a credible number by an adversary who studied your filter configuration and designed their attack to pass through it.

This is not a difficulty spike. It is a *paradigm shift* --- the transition from a world where defense means filtering to a world where defense means verification. The player must move from asking "is this signal good enough?" to asking "who sent this signal, and can I prove it?" The game must teach this transition across multiple missions, each one escalating the sophistication of the attack by exactly one dimension, so that the player's defensive toolkit grows in lockstep with the threat.

The deeper design question: **can an arms race --- attacker escalates, defender adapts, attacker escalates again --- serve as the primary difficulty curve for the game's second half?** And can that arms race teach something real --- the principles of defense-in-depth, authentication versus quality assessment, and trust as a graduated spectrum rather than a binary gate --- without ever feeling like a lecture?

---

## The Mechanical Specification: How the Arms Race Unfolds

### Phase 1: The False Confidence (Missions 1-5)

Before spoofing exists, the player builds habits. Fidelity is introduced in Mission 2 as a property of signals: observations start at 100, lose 20 per hop. The player learns to read the fidelity number as a quality indicator. In Mission 5, the global fidelity threshold slider appears in the context config panel --- a horizontal bar with a draggable handle, labeled "Signal Acceptance Threshold," ranging from 0 to 100. The player drags it to 50 or 60, watches low-fidelity noise vanish from their units' buffers, and feels the satisfaction of a system that obeys a simple rule.

This phase is pedagogically critical because it builds the belief that spoofing will later subvert. The player must trust the fidelity number before the game can weaponize that trust. If the threshold slider never works, spoofing has nothing to break. If it works too well for too long, the player becomes complacent and the spoofing escalation feels arbitrary. The sweet spot: two to three missions where the threshold is necessary and sufficient, long enough to become habitual, short enough that the player has not forgotten the slider exists when it stops being enough.

### Phase 2: Noise Injection --- The Spam Filter Moment (Mission 6)

The enemy broadcasts random garbage on the player's channels. Fidelity values between 10 and 40, nonsensical content, obviously wrong. The player's buffer fills with grey-tagged static entries that displace legitimate data. The global threshold at 50 sweeps it all away.

**What the player learns:** Buffer space is a resource that the enemy can attack. Signal volume is a weapon. But the lesson is shallow on purpose --- the player solves it in under two minutes and moves on. The real purpose of Mission 6 is to confirm the player's belief in the threshold. "I set the number, the noise goes away, I win." This confirmation is the setup for Mission 7's subversion.

**What the enemy learns (diegetically):** The player has a threshold. The enemy's crude noise was rejected. Next time, the signals need to be better.

### Phase 3: Crafted Plausibility --- The Phishing Escalation (Mission 7)

The enemy stops broadcasting garbage and starts broadcasting lies that look like truth. Signals arrive at fidelity 48-55 --- straddling the typical threshold setting --- with structurally valid content: threat detections pointing at real quadrants, movement orders in plausible directions, status reports from fictional but plausibly named unit IDs. The volume is high: three to four spoofed signals per tick per channel, versus one to two legitimate signals.

The player who set their threshold to 50 in Mission 6 now faces a problem: spoofed signals at 52 pass the filter. Raising the threshold to 65 blocks the spoofs but also blocks legitimate degraded signals from distant Scouts arriving at fidelity 58 after two relay hops. There is no single number that separates "real but degraded" from "fake but crafted."

**The false-positive/false-negative moment:** This is the first time the player encounters the fundamental tension of any detection system. Set the bar high and you miss real signals. Set it low and you accept fakes. The threshold slider, which felt like a dial with a right answer, is revealed as a dial with only tradeoffs.

**The architectural response:** Some players solve this by moving Relays closer to Scouts, shortening hop chains so legitimate fidelity stays above 70. Others discover per-channel thresholds (5.14b): set the command channel high, the recon channel lower. Others try the adaptive threshold (5.14d) --- permissive when the buffer has room, strict under pressure. All three responses are valid. All three teach a different facet of the same lesson: the threshold alone is not enough; the architecture must compensate.

### Phase 4: Identity Forgery --- The Impersonation Crisis (Mission 8)

The enemy stops broadcasting on their own frequencies and starts injecting signals directly onto the player's named channels --- `cmd-net`, `recon-net`, `strike-report`. Signals carry fidelity scores of 70-85, well above most threshold settings. Source labels claim to be the player's own units. A spoofed command at fidelity 82 on `cmd-net` is visually and metrically indistinguishable from a legitimate command at fidelity 85 from the player's own Command unit.

**The trust boundary collapse:** The player assumed that signals on their channels came from their units. This was never guaranteed --- it was a social contract the enemy has now violated. The player must shift from channel-based trust to identity-based trust. This is the shift from "I trust this channel" to "I trust this sender" --- the fundamental distinction between network security and authentication.

**The defensive tools:** Per-channel thresholds become critical (set `cmd-net` to 90, above the spoofed 82). But the real breakthrough is source-checking rules: `WHEN signal_source cmd-net != COMMAND-A THEN evict`. The player writes their first authentication rule. This is the moment the game teaches that quality assessment and identity verification are separate operations --- a signal can be high-quality and still be a lie.

### Phase 5: Perfect Mimicry --- The Deepfake Endgame (Mission 9)

Enemy signals become indistinguishable from legitimate signals by every single metric the player has learned to check. Fidelity is matched precisely to the expected value for the claimed path. Source IDs are forged to match the player's actual unit names. Channel routing is correct. Signal type and content are plausible. The only tells are cross-referential: a double-report from a Scout that should have reported once, a fidelity value that is 0.85 when the actual path math yields 0.83, a threat detection in a quadrant outside the claimed Scout's perception radius.

**No single check reveals the forgery.** The player must build architectures that correlate multiple signals before acting --- consensus protocols that require two independent observers to confirm a threat before a Striker engages. The player writes rules like: `WHEN buffer_count threat_detected < 2 THEN hold_position` --- do not trust a lone voice; wait for a second opinion.

This is the culmination of the arms race. The player who has climbed all four phases has moved from "set a number" to "design a verification architecture." They have internalized defense-in-depth without anyone saying the phrase.

### The Arms Race as Difficulty Curve

The traditional approach to difficulty in strategy games is to add more enemies, faster enemies, or stronger enemies. Robot Uprising's approach is different: the enemies get *smarter about information*. The player's units do not become weaker. The player's tools do not become less effective. What changes is the sophistication of the adversary's exploitation of the player's own systems. Each escalation step requires the player to think one layer deeper about trust, verification, and architecture. The difficulty curve is intellectual, not numerical.

This has a specific advantage for pacing: the player who "gets it" --- who understands the principle behind each escalation --- can adapt in one or two attempts. The player who does not get it can still brute-force with high thresholds and redundant architectures, clearing on Normal difficulty with imperfect but functional solutions. The arms race rewards understanding without punishing its absence (on Normal). On Hard, understanding becomes necessary. The difficulty modes are not "more health" and "less health" --- they are "partial defenses work" and "only correct defenses work."

---

## Player Journeys

#### Journey: Sofia, 28, Forensic Accountant

**Context:** Sofia plays games that involve finding discrepancies in data. She loved Return of the Obra Dinn, Papers Please, and Wilmot Works It Out. She reached Mission 7 after a week of evening sessions, having thoroughly mastered the buffer system and threshold slider. She names her Relays after audit checkpoints: INTAKE, VERIFY, APPROVE.

**Minute 0:00 --- Mission 7 Opens**

Sofia deploys her standard architecture: two Scouts on the flanks, a central Relay chain feeding a pair of Strikers, fidelity threshold set to 55. She hits EXECUTE and watches the sealed replay. For the first eight ticks, everything looks normal. Tick 9: her eastern Striker suddenly breaks formation and moves three tiles north, chasing a threat that does not exist on the visible board. The Striker arrives at the phantom position, finds nothing, and is flanked by the real enemy approaching from the south. The Striker is destroyed at tick 14.

Sofia frowns. She opens the Inspector.

**Minute 1:30 --- The Inspector Forensics**

She scrubs the buffer replay to tick 9. The eastern Striker's context window shows seven entries. Five are properly colored --- the blue-bordered signals from her Scout chain. Two have a subtle amber border she has never seen before. She hovers over one: `threat_detected, position: C2, fidelity: 0.53, source: UNKNOWN-4a2c`. Fidelity 0.53. Her threshold is 0.55. This signal should have been rejected. She checks: the *other* amber signal is at fidelity 0.57 --- above the threshold. It passed. The Striker's rule --- `WHEN buffer_has threat_detected THEN move_to threat_position` --- fired on the spoofed signal because it was the newest entry.

Sofia's eyes narrow. She recognizes this pattern. It is the same as a fraudulent invoice slipped into a batch of real ones: plausible enough to pass automated checks, wrong enough to cause damage if acted upon. She raises her threshold to 70. But before re-executing, she checks her Scout's fidelity at the eastern Striker: it arrives at 62 after two relay hops. Threshold 70 would block it.

**Minute 4:00 --- The Architectural Redesign**

Sofia does not raise the threshold. Instead, she moves her VERIFY Relay one tile closer to her eastern Scout, reducing the hop count from three to two. The Scout's signal now arrives at the Striker at fidelity 72. She sets the threshold to 65. The spoofed signals at 0.53-0.57 are blocked. The legitimate Scout data at 0.72 passes. She re-executes. The Striker holds formation. The real enemy approaches from the south. The Striker engages correctly. Mission 7 clears.

Sofia writes in her notebook (she keeps a physical notebook next to her keyboard, a habit from work): "Lesson: proximity is security. Shorter chains = higher fidelity = wider margin above threshold. Don't trust the number; control the conditions that produce the number."

**Minute 6:30 --- The Satisfaction**

She sits back. The game has just taught her something she already knew from auditing --- the best defense against a plausible forgery is not a better detection algorithm but a shorter chain of custody. The fewer hands a document passes through, the harder it is to tamper with. She did not learn this from a tooltip. She learned it from losing a Striker and tracing the loss back to a two-point fidelity margin.

**UI Annotations:**
- Amber border on marginal-fidelity signals first appears in Mission 7 --- the player may not notice it in the heat of sealed watch, but it is visible in Inspector replay
- The UNKNOWN source tag is the first hint that signals can originate from outside the player's network
- Physical notebook kept alongside the game --- diegetic forensic behavior emerging from game mechanics

---

#### Journey: Tomasz, 41, High School Physics Teacher

**Context:** Tomasz plays one game at a time, slowly, usually on weekends. He is on Mission 8, his sixth week with Robot Uprising. He understood the threshold immediately (it is analogous to measurement uncertainty in physics --- data below a confidence threshold is discarded). He has not yet written any custom rules; he relies entirely on the threshold slider and careful unit placement. His architectures are simple but geometrically precise.

**Minute 0:00 --- Mission 8, The Command Channel Breach**

Tomasz deploys a clean two-relay chain from his Command unit to his front-line Strikers. Fidelity threshold at 70 on all channels. He hits EXECUTE. Tick 5: his lead Striker receives a command and moves west --- into an empty corridor away from the objectives. Tick 8: the Striker is surrounded. Tick 10: destroyed.

Tomasz opens the Inspector. He scrubs to tick 5. The Striker's buffer shows a command signal: `move_west, fidelity: 0.82, source: COMMAND-A, channel: cmd-net`. The fidelity is 82. The source says COMMAND-A. The channel is cmd-net. Everything looks correct. Tomasz is confused. He checks his Command unit's buffer at tick 5 --- it sent `hold_position`, not `move_west`. Two contradictory commands. One is real. One is not.

**Minute 3:00 --- The Source Revelation**

Tomasz clicks on the spoofed signal in the genealogy panel. The board map renders a path trace: a red dotted line originating from a tile in the northwest corner --- nowhere near his Command unit on the eastern edge. The signal claims to be from COMMAND-A but traveled through enemy territory. Tomasz stares at the screen. He has just encountered signal forgery for the first time.

He understands the physics analogy immediately: this is like measuring a magnetic field and getting a reading that looks correct but was produced by a hidden magnet you did not account for. The instrument (the buffer) reports accurately what it received. The source of what it received is the lie.

**Minute 5:30 --- The Threshold Wall**

Tomasz's instinct is to raise the threshold. He sets `cmd-net` to 90 using the per-channel threshold panel (he noticed it in Mission 7 but did not need it). The spoofed signal at 82 is blocked. He re-executes. Mission 8 clears. He is satisfied.

But a small discomfort lingers. The spoofed signal was at 82. His real command signal arrives at 85 (one relay hop from 100). The margin is only 3 points. If the enemy can craft a signal at 82, what stops them from crafting one at 86? The threshold is a wall, but the enemy is building taller ladders.

**Minute 8:00 --- The Question He Carries Forward**

Tomasz does not write a source-checking rule. He does not yet know the rule language well enough. But he carries a question into Mission 9: *what do I do when the number on the signal is higher than my threshold and the signal is still fake?* This question --- the question of authentication beyond numerical thresholds --- is the exact question the game wants him to carry. Mission 9 will answer it by forcing him to answer it himself.

**UI Annotations:**
- The per-channel threshold panel is a dropdown accessible from the context config section; Tomasz found it by exploring the UI, not from a tutorial prompt
- The red dotted path trace in the genealogy panel is the primary spoofing-reveal mechanism --- it shows where the signal actually came from, regardless of what the source label claims
- Tomasz's threshold-only defense is explicitly designed to work for Mission 8 but fail for Mission 9 --- the game allows partial solutions to succeed at the current difficulty level while planting the seeds of their future insufficiency

---

#### Journey: Amara, 19, Computer Science Freshman

**Context:** Amara is taking an intro to cybersecurity class. A classmate mentioned Robot Uprising as "basically a CTF with robots." She speedran Missions 1-7 in three days and is now on Mission 9, the sophisticated mimicry mission. She has already built source-checking rules and per-channel thresholds. She treats the Inspector like a packet capture tool. She is competitive and wants to clear every mission on Hard.

**Minute 0:00 --- Mission 9, Hard Difficulty**

Amara deploys an architecture she is proud of: two independent Scout channels (`recon-alpha` and `recon-beta`) covering overlapping quadrants, per-channel thresholds set aggressively (cmd-net at 95, recon channels at 60), source-checking rules on all channels, and a honeypot Relay with threshold 0 that collects everything for forensic analysis. She hits EXECUTE.

Tick 3: Scout-B reports `threat_detected` at position D5, fidelity 83. The signal passes source verification --- it claims to be from SCOUT-B, and the source signature checks out. Tick 4: A second `threat_detected` arrives, also claiming to be from SCOUT-B, at position D7, fidelity 85. Two threat reports from the same Scout, one tick apart, pointing at adjacent but different tiles.

The Striker's rules fire on the first report (oldest-first priority) and move toward D5. At D5, there is nothing. The real enemy is at G2, on the far side of the board. Scout-C on `recon-beta` has been reporting the correct position the entire time, but the Striker's buffer is full --- the two spoofed Scout-B reports displaced Scout-C's legitimate signal via eviction.

**Minute 2:00 --- The Forensic Deep Dive**

Amara opens the Inspector and goes straight to the signal genealogy panel. She expands both Scout-B signals side by side. The first (tick 3, D5, fidelity 83) traces back through a clean path: SCOUT-B to RELAY-A to STRIKER-1. The second (tick 4, D7, fidelity 85) traces through... SCOUT-B to RELAY-A to STRIKER-1? The path looks identical. But Amara notices something: the hop count on the second signal is 3, while the first is 2. The fidelity math does not add up. A 3-hop signal should arrive at 100 - (3 x 20) = 40. This signal claims fidelity 85 after 3 hops. The fidelity is inflated.

She clicks "show full path" on the second signal. The board trace renders: the signal did not come from SCOUT-B. It was injected at a tile between RELAY-A and STRIKER-1 by an enemy unit, with a forged source signature and an artificially inflated fidelity score. The hop count metadata was correct (3 hops from the injection point) but the fidelity was manually set to 85 by the attacker.

**Minute 4:30 --- The Verification Rule**

Amara writes a new rule she has never needed before: `WHEN signal_fidelity threat_detected > expected_fidelity_for_hop_count THEN flag_as_suspect`. This is a path-fidelity consistency check --- if the signal says it traveled 3 hops but its fidelity is 85, the math is wrong, and the signal is suspect. She also writes a consensus rule: `WHEN buffer_count threat_detected:confirmed < 2 THEN hold_position` --- require corroboration from two verified sources before engaging.

She re-executes. The spoofed signal is flagged by the path-fidelity check. The Striker holds position. Scout-C's legitimate report on `recon-beta` arrives uncontested. The Striker engages the real enemy at G2. Mission 9 Hard clears on her third attempt.

Amara screenshots her rule configuration and posts it to the class Discord with the caption: "built a zero-trust architecture in a game about robots lmao."

**Minute 7:00 --- The Arms Race Insight**

After clearing, Amara sits in the Inspector replaying the spoofed signal's genealogy trace. She realizes something: the enemy adapted. In Mission 7, the spoofs were crude --- wrong source labels, middling fidelity. In Mission 8, they forged the source label. In Mission 9, they forged the source signature, matched the channel routing, and calibrated the fidelity to be "good but not suspiciously perfect." The enemy is learning.

And her defenses have been learning in lockstep. Mission 7: raise the threshold. Mission 8: add source checks. Mission 9: add path-fidelity consistency checks and consensus protocols. Each attack broke her previous defense. Each new defense addressed the specific failure mode of the previous one. She has been doing iterative security hardening without realizing it was a curriculum.

She opens her cybersecurity textbook to the chapter on defense-in-depth. The diagram --- concentric rings labeled "perimeter," "network," "host," "application," "data" --- maps exactly to her relay architecture: global threshold (perimeter), per-channel thresholds (network), source-checking rules (host), path-fidelity validation (application), consensus protocols (data). She takes a photo of the textbook page next to her game screen and sends it to her professor.

**UI Annotations:**
- Signal genealogy "show full path" reveals the actual injection point on the board map --- the red dotted line diverges from the claimed path
- Path-fidelity consistency check is a rule the player must write, not a built-in feature --- the game provides the data (hop count, fidelity), the player provides the logic
- Consensus rule pattern: `buffer_count` condition with a `:confirmed` tag filter, requiring flagged signals to be excluded from the count
- Honeypot Relay at threshold 0 --- collects everything, acts on nothing, exists purely for forensic analysis in the Inspector

---

#### Journey: Dante, 55, Retired Police Detective, Casual Gamer

**Context:** Dante plays games on his tablet while his wife watches television. He found Robot Uprising through a recommendation algorithm after playing a lot of chess and Slay the Spire. He does not think in terms of cybersecurity or network architecture. He thinks in terms of evidence, testimony, and corroboration --- the language of criminal investigation. He is on Mission 8, having taken three weeks to reach it, playing two or three missions per week.

**Minute 0:00 --- Mission 8, The False Witness**

Dante's Striker receives what appears to be a legitimate command and moves into an ambush. He watches the replay with the same expression he used to wear reviewing bodycam footage: attentive, skeptical, replaying the critical seconds repeatedly. He sees the Striker move. He sees the result. He scrubs back to find the cause.

In the buffer replay, he finds the command signal. Source: COMMAND-A. Fidelity: 0.82. He checks his actual Command unit --- it sent a different order. Two contradictory commands, one real, one false. Dante does not think "source forgery." He thinks: *I have two witnesses giving contradictory testimony. One of them is lying.*

**Minute 3:00 --- The Interrogation**

Dante clicks the genealogy trace on each signal. The real command traces a clean path from his Command unit, two tiles east. The false command traces a path through the northwest quadrant --- a direction his Command unit could not physically broadcast from. Dante nods slowly. "You came from the wrong side of the building. Your alibi doesn't hold."

He does not write a source-checking rule. He does not know how. Instead, he moves his Command unit one tile closer to his Strikers, shortening the chain to a direct adjacency with zero relay hops. The real command now arrives at fidelity 100. He sets the `cmd-net` threshold to 95. The spoofed command at 82 is blocked. The real command at 100 passes with room to spare.

**Minute 5:00 --- The Detective's Principle**

Dante clears Mission 8 on his second attempt. He does not use rules. He does not use per-channel threshold tuning. He uses physical proximity --- putting the witness (Command unit) as close to the jury (Striker) as possible, eliminating intermediaries who could tamper with the testimony. This is the same principle he applied in investigations: minimize the chain of custody. Fewer handoffs means fewer opportunities for contamination.

His solution is architecturally different from every other player journey in this document, and it works. The game supports it. This is the sign of a well-designed system: the same problem admits fundamentally different solutions depending on the solver's mental model.

**UI Annotations:**
- Dante never opens the per-channel threshold panel; he uses the global threshold exclusively
- His defensive strategy is entirely positional --- moving units rather than configuring rules
- The genealogy trace serves as "witness testimony" in his mental model --- he reads the path trace as an alibi and checks whether it is physically possible

---

## Strengths

1. **The arms race teaches defense-in-depth through experience, not exposition.** No tutorial popup says "defense-in-depth means layered security." The player discovers it by building one layer, watching it fail, and adding another. By Mission 9, the player who has climbed all four phases has a multi-layered defense architecture that they designed themselves. The understanding is earned, not given, and it persists because it was forged through failure.

2. **Each escalation step is exactly one conceptual unit.** Mission 6: volume. Mission 7: plausibility. Mission 8: identity. Mission 9: perfection. The player never faces two new dimensions simultaneously. This respects the 2-term cognitive load principle (5.00a) applied to adversarial mechanics: one new attack type per mission, one new defensive tool per mission.

3. **The arms race makes every fidelity mechanic feel necessary.** Without spoofing, the global threshold is set-and-forget. Per-channel thresholds are a power-user curiosity. Source-checking rules are an academic exercise. With spoofing, each tool is the specific response to a specific escalation. The player discovers each tool at the moment they need it. This is progressive disclosure at its most natural: the threat reveals the tool.

4. **Multiple valid solutions per phase.** Sofia moves Relays closer. Tomasz raises thresholds. Amara writes verification rules. Dante moves his Command unit into direct adjacency. All four approaches work for their respective missions. The game does not prescribe a single "correct" defense; it provides a problem space with multiple viable solutions. This respects player agency and produces emergent defensive architectures that surprise even the designers.

5. **Real-world transferability.** The cognitive patterns the player develops --- skepticism toward trusted-looking data, cross-referencing before acting, tracing the provenance of information, treating metadata as more reliable than content when content may be compromised --- are directly applicable to phishing detection, misinformation evaluation, and AI-generated content verification. The game teaches security thinking without ever claiming to be educational.

---

## Weaknesses

1. **The causal chain from spoofed signal to unit failure is long and opaque.** A spoofed signal enters the buffer, displaces a legitimate signal via eviction, triggers a rule, causes a movement, leads to an ambush. The player sees the ambush. They do not automatically see the six-step causal chain that produced it. Without strong Inspector signposting --- a dedicated "actions taken on spoofed signals" debrief panel, highlighted amber entries in the buffer replay, a "why did this unit move here?" trace button --- players will blame their rules, their architecture, or the game itself before they blame the enemy's spoofing. Dana's journey in the campaign arc document (5.14e-campaign) illustrates this: she spent 15 minutes editing rules in Mission 7 before realizing the signals were the problem.

2. **The "impossible threshold" moment in Mission 9 risks rage-quitting.** When the player discovers that a spoofed signal at 0.96 passes their threshold of 0.95, and their real signal arrives at 0.97, there is no threshold value that separates them. The game must communicate clearly --- through a boot log advisory, a Predecessor's note, or a debrief hint --- that the threshold paradigm has reached its limit and a new approach is needed. Without this hint, the player who has relied exclusively on thresholds for three missions will feel the game has moved the goalposts.

3. **Source-checking rules require a skill jump.** The transition from "drag a slider" to "write a conditional rule with source-identity verification" is a significant UX cliff. The global threshold is a no-code interface. Source-checking rules require the player to compose logic in the rule language. The workbench should offer suggested rule templates --- pre-written rules that the player can inspect, modify, and deploy --- to bridge this gap. A "Suggested Defense" panel in the boot log, showing a rule template appropriate to the current mission's threat, reduces the barrier without removing the learning.

4. **Tuning spoofed fidelity values is fragile.** A 0.05 change in the spoofed signal's fidelity can shift a mission from "interesting puzzle" to "trivially easy" or "impossible." The exact fidelity values, the timing of spoofed signal delivery, the source forgery quality --- all must be tuned per mission with narrow tolerances. This is a significant playtesting burden that cannot be resolved on paper.

5. **Cognitive load accumulation across four phases.** By Mission 9, the attentive player is managing global thresholds, per-channel thresholds, adaptive threshold curves, source-checking rules, path-fidelity consistency rules, and consensus protocols. Six independent defensive mechanisms. For analytical players (Amara, Sofia), this is deeply satisfying. For casual players (Dante), it is potentially overwhelming. The game must remain clearable on Normal difficulty with a subset of these tools --- a high threshold and careful positioning should suffice, even if the optimal solution uses all six layers.

---

## Interaction Effects

### With the Fidelity Threshold Onboarding Gate (5.14a)

The global threshold is the foundation of the player's trust model. Spoofing exists to break it. The threshold must work reliably for at least two missions before spoofing appears, so the player has formed the habit that spoofing subverts. If the threshold never felt reliable, its failure carries no weight. The timing relationship between 5.14a (threshold introduction) and 5.14e (threshold subversion) is the emotional architecture of the arms race: build trust, then betray it, then rebuild it on a deeper foundation.

### With Per-Channel Thresholds (5.14b)

Per-channel thresholds become the first upgrade when the global threshold fails. Spoofing motivates the transition from one-number-for-everything to channel-specific security levels. The interaction creates a natural discovery path: global threshold fails (Mission 7) --> player discovers per-channel thresholds (Mission 8) --> per-channel thresholds fail against identity spoofing (Mission 9) --> player discovers source-checking rules. Each tool is the stepping stone to the next.

### With Adaptive Thresholds (5.14d)

Adaptive thresholds --- thresholds that tighten when buffer pressure rises --- are the automatic immune response to frequency flooding (Mission 7). The enemy's high-volume attack creates exactly the buffer pressure that triggers the adaptive tightening. Players who enable adaptive thresholds find that Mission 7's flooding is partially mitigated without manual intervention. This produces a satisfying "my system is defending itself" moment --- the architecture responding to a threat the player did not explicitly anticipate.

### With the Inspector and Signal Genealogy

The Inspector transforms from a debugging tool to a forensic lab. Every spoofing phase introduces a new forensic pattern: Mission 6's grey-tagged noise entries, Mission 7's amber-bordered marginal signals, Mission 8's source-mismatch reveals, Mission 9's path-trace divergences. The Inspector's signal genealogy panel is the primary mechanism for spoofing detection in retrospect --- during sealed watch, the player cannot intervene; in the Inspector, they can trace the full provenance chain of any signal and identify exactly where the forgery occurred.

### With the Intrusion Detection Skill (5.14)

The Intrusion Detection skill makes corruption visible in real-time rather than only in the Inspector. A player who equips it sees spoofed entries flagged with red exclamation glyphs during sealed watch --- live detection rather than post-mortem forensics. This creates a risk/reward trade: the skill occupies a Specialist slot that could be used for hack or extract. The player trades offensive capability for defensive visibility. Spoofing makes this trade meaningful --- without spoofing, Intrusion Detection has nothing to detect.

### With the Document-as-Corrupted-Surface (5.11a)

If the diegetic tutorial document can be corrupted by enemy interference, spoofing extends beyond the battlefield into the player's reference material. A page of the tactical archive showing corrupted fidelity values --- accurate data replaced with plausible lies --- teaches the spoofing concept before the player encounters it mechanically. The player reads a corrupted page, notices something is wrong, and carries that suspicion into the mission. The document trains the skill that the gameplay demands.

---

## Comparable Games and Media

### Into the Breach --- Deterministic Information, No Deception

Into the Breach is Robot Uprising's primary mechanical ancestor, but it has no deception layer. The player sees all enemy positions, all attack targets, all movement patterns. Information is complete and honest. Robot Uprising's spoofing is the deliberate departure from this transparency --- the claim that incomplete, deceptive information creates richer strategy than perfect information. Into the Breach teaches optimization under certainty. Robot Uprising teaches decision-making under adversarial uncertainty.

### Among Us --- Social Deception Detection

Among Us teaches the same cross-referencing skill that Mission 9 demands: no single observation reveals the imposter; only correlating multiple data points over time produces a reliable conclusion. The difference: Among Us relies on social cognition (reading behavior, evaluating alibis), while Robot Uprising mechanizes the detection (writing rules that perform the cross-referencing). Both teach that trust must be earned through corroboration, not assumed from appearance.

### Invisible Inc. --- Information Warfare as Core Loop

Invisible Inc. builds its entire stealth system on information asymmetry. The player manages visibility, alarm levels, and guard awareness. Crucially, guards can be misdirected --- hacked security cameras show false feeds, guards investigate disturbances that were player-created diversions. The parallel to fidelity spoofing is precise: Invisible Inc. teaches that the enemy's information system is an attack surface. Robot Uprising teaches that *your own* information system is an attack surface. The direction of the deception is reversed, and the reversal makes the lesson more personal.

### Actual Cybersecurity CTFs (Capture the Flag Competitions)

The most direct comparable is not a commercial game but the competitive cybersecurity training ecosystem. CTF challenges escalate from simple pattern matching (find the flag in the source code) to sophisticated forensic analysis (trace a forged certificate chain to identify the compromised CA). Robot Uprising's Mission 6-9 spoofing escalation mirrors a CTF challenge progression: each level requires the solver to apply one additional layer of skepticism to data that looks increasingly trustworthy. Amara's journey explicitly draws this connection --- her classmate called the game "basically a CTF with robots," and her gameplay experience validates the comparison.

### Telephone (the children's game) --- Degradation as Humor, Degradation as Danger

The children's game of Telephone --- whisper a phrase down a line of children, laugh at what comes out the other end --- is the folk version of signal fidelity degradation. Everyone knows that messages degrade as they travel. Robot Uprising's insight is that degradation can be *weaponized* --- that an adversary who understands how your message chain works can inject a forgery that degrades "correctly," arriving at the other end looking like a legitimately degraded version of a message that was never sent. The game takes a concept everyone intuitively understands and reveals its adversarial surface.

---

## Sensory Descriptions

### The Grey Cascade (Mission 6)

The buffer visualization during sealed watch: slots filling with entries rendered in washed-out grey, each tagged with a tiny static-noise icon --- a cluster of white-on-grey pixels that vibrate at 2Hz, evoking a detuned television. The entries accumulate rapidly, three per tick, pushing legitimate blue-bordered signals off the right edge of the buffer bar. The audio: each grey entry produces a faint burst of digital static --- a short `ksssh` sound, like a walkie-talkie squelch between transmissions, layered at low volume so it reads as background interference rather than alert.

When the player enables the fidelity threshold, the grey entries blink out in a left-to-right cascade over 0.8 seconds. Each evicted entry produces a soft descending tone --- `bwip` --- one semitone lower than the last, creating a descending chromatic scale that reads as "cleaning up." The buffer bar's background color shifts from a stressed amber tint back to its neutral dark blue. A quiet chime --- two notes, ascending major third --- signals the filter engaging. The silence after the cascade is the reward: the absence of static is the sound of a working defense.

### The Amber Warning (Mission 7)

Spoofed signals in Mission 7 do not look like garbage. They look almost right. Each one carries a subtle amber border --- a 2-pixel stroke in the color `#d4a843`, the warm amber of a caution light. The border pulses slowly, once per second, at 30% opacity variation. In the buffer bar, these amber-bordered signals sit among legitimate blue-bordered ones, creating a visual pattern the player learns to dread: blue-amber-blue-amber-amber-blue, a corrupted heartbeat.

When a Striker acts on an amber signal --- moving to a phantom position --- the movement trail on the 8x8 grid renders as a pulsing amber dashed line instead of the normal solid white. The trail says: this movement was based on uncertain data. The Striker's sprite, during the movement, displays a subtle head-tilt animation --- a one-frame lean to the left, as if the unit is hesitating, second-guessing, but following orders anyway. The audio for the amber-trail movement is the normal movement sound (a mechanical servo whir) with a low-frequency undertone added --- a 60Hz hum that vibrates at the edge of perception, the sound of machinery running on bad instructions.

### The Red Injection Line (Mission 8)

The signal genealogy panel's path trace is the primary visual for identity spoofing. Legitimate signals trace as thin cyan lines from source to destination, each hop marked with a small circle at the relay tile. Spoofed signals, when revealed in the Inspector, trace as red dotted lines --- 3-pixel dots with 4-pixel gaps, the visual language of a forbidden path on a circuit diagram. The line originates from the enemy's injection point (a tile the player does not control) and travels through contested or enemy territory before arriving at the player's unit.

The reveal animation plays when the player clicks "show full path": the line draws itself from injection point to destination over 1.2 seconds, with each dot appearing individually in sequence, accompanied by a soft percussive click --- `tk tk tk tk` --- like the sound of a geiger counter ticking through contaminated ground. When the line reaches the player's unit, the unit's tile border flashes red once, and a small skull-and-crossbones glyph appears in the corner of the buffer slot that received the spoofed signal. The glyph is not cartoonish --- it is rendered in the same geometric line-art style as the rest of the UI, a triangle with an exclamation mark inside, the universal symbol for "hazardous data."

### The Perfect Fake (Mission 9)

The horror of Mission 9 spoofing is that it has no visual tell during sealed watch. The spoofed signal looks identical to a legitimate one: blue border, high fidelity, correct source label, correct channel. The Striker acts on it. Nothing looks wrong. The player may not realize the signal was spoofed until the ambush occurs.

In the Inspector, the reveal is quieter and more unsettling. Two signals sit side by side in the buffer replay. Their borders are both blue. Their fidelity scores are nearly identical: 0.85 and 0.83. Their source labels both say SCOUT-B. The player must click into the genealogy panel to see the difference: one traces a clean path through the player's relay chain; the other traces a path that includes a hop through a tile where no player relay exists. The divergence point is rendered as a small branching icon --- the cyan line splits, and one branch turns red. The branch point is labeled with the tick number and the tile coordinate where the injection occurred.

The audio for this reveal is minimal: a single low tone --- a bass sine wave at 80Hz, held for 0.4 seconds --- that plays when the red branch appears. It is the sound of something wrong being uncovered. Not an alarm. Not a warning. A discovery. The sound says: *you found it.*

---

## The TikTok Clip

**Title:** "my robot just got phished"

**The 15 seconds:** Sealed watch. The player's Striker receives a command and moves confidently toward the western edge of the board. The sprite's movement is crisp, purposeful --- it looks like a good play. The Striker arrives at the target tile. Nothing is there. A beat of silence. Then the real enemy appears from the south --- three tiles away, closing fast. The Striker turns (a two-frame rotation animation) and is destroyed in a single shot: a white flash, a burst of pixel debris, a sharp percussive crack that cuts through the ambient hum.

Cut to the Inspector. The player clicks on the command signal in the buffer. The genealogy trace draws itself across the board: a red dotted line from the enemy's position in the northwest, through contested territory, arriving at the Striker's buffer. The camera zooms on the signal detail panel: `source: COMMAND-A (FORGED), fidelity: 0.82 (INFLATED), content: move_west (FABRICATED)`. Three red labels, each appearing one after another with a mechanical clunk sound --- `thunk, thunk, thunk` --- like a stamp marking a document REJECTED.

The clip ends on the player's face (in the overlay cam): a slow blink, a head shake, and then a grin of recognition. The expression says: *they got me. But I see how.*

**Why it works:** The viewer watches a confident move turn into a disaster, feels the shock, then watches the forensic reveal explain exactly how the deception worked. The three red labels landing one by one is the money shot --- each one adds a new dimension to the betrayal (forged source, inflated fidelity, fabricated content). The final grin says this is a game where getting tricked is fun because understanding the trick is the game.
