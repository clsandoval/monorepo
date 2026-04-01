# 2.26 — Fidelity Spoofing as Attack Primitive

**Aspect:** 2.26 — Fidelity spoofing as attack primitive: enemy crafts signals with artificially-high fidelity specifically to pass the player's confidence filters; the workbench UI for signal authentication (checksums, source signatures, Counter-Intelligence skill that verifies provenance before buffer entry); makes the attention language itself an adversarial interface

**Wave:** 2 (Core Mechanic Variations)

**Category:** core-mechanic

**Dependencies:** 2.11 (Signal Fidelity Degradation), 2.12 (Deception Signals), 2.16 (Counter-Intelligence Offensive Mechanic), 2.10 (Signal Taxonomy), 2.25 (Signal Priority Levels)

---

## The Design Question

Your relay is configured with a filter: `IF signal_fidelity < 70 → discard`. This is a reasonable heuristic — low-fidelity signals are degraded, noisy, unreliable. Why clutter your buffer with garbage? You learned this lesson in Mission 4 when a three-hop signal at fidelity 30 sent your striker to the wrong tile.

The enemy knows about your filter. They know you've learned to trust high-fidelity signals. So when their Specialist injects a fabricated observation into your network, they stamp it at fidelity 92. Your filter opens the gates — fidelity 92 is pristine, actionable, trustworthy. The fabricated signal enters your relay's buffer, gets compressed and forwarded to your strikers, who act on elegant, high-fidelity lies.

This is **fidelity spoofing** — the attack primitive where the enemy weaponizes your own authentication system against you. Not by injecting obviously fake data (your filters would catch that), but by crafting adversarial inputs that pass through every confidence gate you've built. The checksums verify. The source signatures look valid. The fidelity scores are textbook-perfect. And the data is completely fabricated.

The design question cuts to the heart of the game's pedagogical claim: **can the player build an authentication system that the enemy can't game?** Or is every defense a new attack surface? Fidelity spoofing turns the workbench — the player's design-time sanctuary — into an adversarial interface. The enemy doesn't just attack your units during battle. They attack your blueprint configurations, your filter rules, your trust assumptions. The question shifts from "how do I build a good signal network?" to "how do I build a signal network that can't be spoofed?"

---

## The Mechanical Model: "The Forged Certificate"

### How Fidelity Spoofing Works

In the base system (2.11), fidelity is computed: direct perception = 100, minus 20 per hop. The player can use fidelity as a proxy for authenticity — a signal at fidelity 95 probably traveled 0 hops (direct observation), while a signal at fidelity 40 traveled 3 hops and is heavily degraded.

Fidelity spoofing breaks this assumption. When an enemy Specialist injects a fabricated signal (per 2.12), the attacker sets the fidelity field to any value they choose. A clever enemy sets it to the *correct degraded value* for the supposed hop count — a signal that "arrived via one relay" is stamped at fidelity 80, matching the expected degradation for a single hop. The signal looks legitimate by every metric the player's filters check.

**The spoofing spectrum:**

| Strategy | Fidelity Set | Detectability | Player Impact |
|----------|-------------|---------------|---------------|
| **Crude spoof** | 100 (direct perception) | Obvious — signal claims 0 hops but arrived via relay chain | Filters catch it if hop-aware |
| **Matched spoof** | Correct degraded value for claimed path | Invisible during sealed watch | Passes fidelity filters, triggers rules normally |
| **Golden spoof** | 90-95 (slightly degraded but clearly "good") | Passes most filters, but suspiciously pristine for multi-hop | Exploits "good enough" thresholds |
| **Precision spoof** | Exactly calibrated to victim's filter threshold | Designed to barely pass the player's configured cutoff | Exploits the specific number the player chose |

The precision spoof is the most dangerous. If the player's relay filters at fidelity < 70, the enemy stamps fabricated signals at fidelity 71 — one point above the threshold. The signal barely passes, which is both mechanically effective and narratively chilling: the enemy knows your filter configuration and is tuning their attacks to exploit it.

### The Authentication Layer: Checksums and Source Signatures

Fidelity spoofing exists because fidelity is a *single scalar* — easy to fake. To counter it, the game introduces an authentication layer: additional metadata on signals that are harder to forge.

**Checksums:**

Every signal carries a hash of its content fields — a mathematical fingerprint that verifies the signal hasn't been tampered with. When a Scout generates an observation at fidelity 100, the game computes a checksum from the observation's data fields (unit type, position, movement vector). The checksum travels with the signal.

When a Relay compresses three signals into one summary, the compressed output gets a *new* checksum computed from the summary's content. The checksum is valid for the compressed signal's content — it proves the Relay processed the data honestly, not that the original observations were real.

**What checksums prevent:** Man-in-the-middle tampering. If a signal passes through a compromised relay that modifies the content (changing "enemy at D4" to "enemy at F4"), the checksum fails — the content doesn't match the hash. The receiving unit's filter can detect: `IF checksum_mismatch → discard`.

**What checksums do NOT prevent:** Fidelity spoofing at the injection point. The enemy stamps a fabricated observation with a valid checksum for its fabricated content. The checksum says "this signal has not been modified since creation" — but the creation itself was a lie. Checksums verify integrity, not authenticity. This is the same distinction that makes TLS certificates and code-signing possible to spoof with compromised CAs.

**Source Signatures:**

Every signal carries a `source_signature` — a cryptographic-style token that identifies *which unit generated the signal*. The signature is tied to the unit's identity in the game world. A Scout at tick 15 generates a signature that the receiving unit can verify: "this signal was generated by Scout-A at tick 15."

**What source signatures prevent:** Impersonation. An enemy can't generate a signal that claims to come from your Relay-B because they don't have Relay-B's signature key. The signature check fails: `IF source_signature ≠ known_unit → flag as suspicious`.

**What source signatures do NOT prevent:** Compromised unit exploitation. If the enemy hacks your Scout and injects a fabricated signal INTO the Scout's buffer, the signal exits the Scout with the Scout's valid source signature. The signature says "Scout-A generated this" — which is technically true, since the Scout's compromised buffer is the origin point. The enemy uses your own unit as a signing authority for their lies.

### The Counter-Intelligence Skill: "Verify"

The Specialist's existing skills are `hack` and `extract`. Fidelity spoofing introduces a potential new skill or sub-function for the Specialist: **`verify`**.

When a unit with the `verify` skill is adjacent to another unit (friend or foe), it can examine that unit's buffer entries for authenticity signals. Specifically:

1. **Provenance check:** The Specialist reads the signal's full metadata chain — every hop, every processing step, every fidelity adjustment. A fabricated signal shows a metadata chain that starts at "injected" rather than "perceived."

2. **Fidelity audit:** The Specialist compares the signal's claimed fidelity against the expected fidelity given its claimed path. A signal that says "arrived via 2 hops" but has fidelity 95 is flagged — the math doesn't add up.

3. **Cross-referencing:** The Specialist can compare a signal against its own perceptions. If the Specialist is at tile E5 and the signal says "enemy Striker at E5" but the Specialist sees nothing, the signal is marked `suspect`.

The verify action takes 1 tick (the Specialist is reading data, not acting on the battlefield). The output is a modified buffer entry — the original signal with an appended `verification_status: verified | suspect | forged` field. Rules can be configured to act only on verified entries.

**The workbench UI for verification rules:**

In the Plan screen's workbench, the player configures verification policies per blueprint. The verification panel is a new section alongside Skills, Rules, Hooks, and Context Config. It contains:

- **Fidelity threshold:** Slider from 0-100. Signals below this value are flagged (not necessarily discarded — the player chooses the action).
- **Source whitelist:** List of known unit IDs. Signals from unknown sources are flagged. This requires the player to manually register trusted units — a maintenance cost that scales with army size.
- **Path validation toggle:** ON = the game checks whether the signal's claimed fidelity matches the expected degradation for its path. OFF = fidelity is accepted at face value.
- **Action on failure:** Dropdown — `discard` (silently drop), `flag` (mark as suspect, keep in buffer), `quarantine` (separate buffer partition for suspicious entries).

Each verification setting consumes a context config "slot" — not unlimited. The player can verify everything perfectly, but verification costs attention that could be spent on combat-relevant signals. This is the trust tax.

---

## Player Journeys

#### Journey: Marcus, 34, Cybersecurity Analyst

**Context:** Mission 9. Marcus has encountered deception signals in Mission 7 and learned to use fidelity as a rough trust proxy. He configured his relay blueprint with a fidelity filter at 60 and added a cross-referencing rule on his Command unit. He thinks he's covered. The enemy has been getting more sophisticated — Mission 8 introduced "matched spoof" signals that passed his filter.

**Minute 0:00 — The Hardened Setup**

Marcus opens the Plan screen. The workbench on the right shows his relay blueprint. He's added the new `verify` skill to his Specialist (unlocked at the start of Mission 9 via boot log). The verification panel shows three toggles: fidelity threshold at 65, path validation ON, source whitelist containing his five units. Action on failure: `flag`.

He configures a new rule on his relay: `IF verification_status == forged THEN discard AND broadcast_alert on counterintel-net`. The idea: any signal that fails verification gets dropped AND triggers an alert so his other units know they're under a spoofing attack.

He pauses. The verification panel shows a tooltip: "Path validation checks claimed fidelity against expected degradation. Note: enemy-injected signals may carry valid source signatures if injected through a compromised unit." Marcus reads this twice. "Valid signatures from compromised units..." He looks at his source whitelist. Scout-B was hacked two missions ago. He cleared the hook, but what if the enemy injected entries before he cleared it?

He reconfigures his source whitelist to exclude Scout-B entirely — any signal claiming to come from Scout-B is flagged regardless of signature validity. He's treating Scout-B as potentially compromised even though the hook was removed. This is paranoid security posture. It costs him — Scout-B's legitimate observations will now be flagged and require manual review in the Inspector.

**Minute 1:00 — The Execute**

Marcus hits EXECUTE. During the sealed watch, he watches his network operate. Green flashes along channel lines. Buffer bars filling with verified entries (bright, clear pips). At tick 7, a faint amber flicker appears on his Specialist's tile — it's running verify on the relay's buffer entries. A small checkmark pip appears next to verified entries; a question mark pip appears next to flagged ones.

At tick 11, he sees it: a red flash on his relay's tile. The discard-and-alert rule fired. During sealed watch, he sees the alert broadcast on `counterintel-net` — a ripple of red across the channel lines. His two strikers briefly flash red (they received the alert) and adjusted their movement patterns — the rule on the strikers says `IF counterintel_alert THEN switch to short-range-only mode`.

Tick 12: An enemy striker appears from the north. It's heading straight for the relay. The spoofed signal Marcus's relay just discarded was a decoy — the enemy sent a fake "clear zone" signal to suppress Marcus's defenses while the real assault approached from a different vector. But Marcus's alert rule meant his strikers went to short-range mode early, and one of them happened to be positioned near the northern approach. Adjacency. Red flash. Enemy striker eliminated.

**Minute 3:00 — The Debrief**

Marcus scrubs to tick 11 in the Inspector. He clicks the discarded entry. The detail panel shows:

```
SLOT 7: [OBSERVATION] Zone north clear, no enemies within 4 tiles
  Fidelity: 74 | Source: injected | Path: claimed 1 hop via Relay-C
  Verification: FORGED — fidelity 74 expected for 1 hop (80), discrepancy: -6
  Source signature: Relay-C (VALID — injected through compromised relay)
  Checksum: VALID (content unmodified since injection)
  Action: DISCARDED by rule [verify-fail-discard]
  Alert broadcast: counterintel-net at tick 11
```

Marcus studies this. "The signature was valid because the injection happened at the relay. The checksum was valid because the content wasn't modified after injection. The only thing that caught it was path validation — the claimed fidelity didn't match the expected degradation." He leans back. "The authentication layer caught 2 out of 3 checks. The fidelity math was the one that mattered."

He then notices the enemy's strategy: they injected a "zone clear" signal to suppress defensive reactions in the north, then attacked from the north. Without the spoofing, his normal rules would have detected the approaching enemy via scout observations. The spoofed signal was designed to create a false negative — an absence of threat signals that his rules would interpret as safety.

He adjusts his blueprint: a new rule on the Command unit: `IF verification_status == forged AND content == "zone clear" THEN broadcast_alert AND reposition strikers to threatened zone`. This rule responds to spoofed "clear" signals by assuming the opposite — the zone is NOT clear. Counter-deception logic.

**UI Annotations:**
- **Verification panel (workbench):** New section below Context Config. Slider for fidelity threshold (0-100), toggles for path validation and source whitelist, dropdown for action-on-failure. Each toggle shows a "slot cost" indicator — verifying consumes attention resources.
- **Checkmark/question mark pips (sealed watch):** Small icons on buffer bar entries. Verified = bright cyan checkmark. Suspect = amber question mark. Forged = red X (entries are discarded but the X flashes briefly before disappearing).
- **Alert ripple (sealed watch):** When the discard-and-alert rule fires, a red ripple propagates along all channel lines from the verifying unit. Downstream units briefly flash red to indicate they received the counterintel alert.
- **Forged entry detail (Inspector):** Full metadata chain shown — every hop, every fidelity value, every signature check. The "discrepancy" field shows the numerical gap between claimed and expected fidelity. Red text on forged entries.

---

#### Journey: Yuki, 17, Competitive TCG Player

**Context:** Mission 8, second attempt. Yuki plays card games at a competitive level — she thinks in terms of bluff detection, read accuracy, and information asymmetry. She lost Mission 8 first try because three of her relay's buffer entries were spoofed "clear zone" signals that suppressed her defensive rules. She knows the spoofing exists now, but she doesn't know how to counter it mechanically.

**Minute 0:00 — The Bluff Reader**

Yuki reopens the Plan screen after her first failure. She's looking at the Inspector from her failed run. She scrubs to tick 14 and finds three suspicious entries in her relay's buffer — all saying "zone clear" at fidelity 72-75. She clicks each one. Source: `injected`. She stares at the numbers. "72, 73, 75. They're all in the same range. The enemy is consistency-spoofing."

She doesn't have the `verify` skill yet (it unlocks Mission 9). So she improvises. She opens her relay blueprint and configures a filter rule: `IF signal_type == observation AND content == "zone clear" AND fidelity BETWEEN 70 AND 80 THEN hold_for_3_ticks`. The idea: don't trust "clear" signals immediately. Hold them for 3 ticks and see if a contradictory signal arrives (a scout reports enemies in the same zone). If no contradiction, trust it. If contradiction, discard.

This is essentially a delayed-verification system using only rules and filters — no new skill required. But it costs her a rule slot and introduces latency. Three ticks of delay before she trusts a "clear" signal means her defensive repositioning is 3 ticks slower.

**Minute 0:30 — The Confidence Trap**

She also adds a counter-rule on her striker: `IF buffer contains "zone clear" signal AND no scout has reported that zone in last 5 ticks THEN flag as suspicious`. The logic: if her scouts haven't confirmed that zone is clear, how does the relay know? A "clear" report with no corroborating scout data is likely a spoof.

She pauses. What if the enemy sends a spoofed scout observation ("enemies at D4") AND a spoofed clear report ("zone E5 clear")? Two fabrications that reinforce each other. Her cross-reference rule would see the enemy report and the clear report as independent sources agreeing: there are enemies at D4, and E5 is clear. Both fabrications pass.

"Okay, so I can't just cross-reference. I need provenance." She stares at the workbench. Without the verify skill, she can't check provenance. She adds a Specialist to her production queue — expensive, but she needs it for verification. She configures the Specialist with patrol routes that pass near her relays every few ticks, giving it proximity to run verify checks.

**Minute 1:30 — The Execute and the Cost**

She hits EXECUTE. The sealed watch plays out. Her Specialist patrols near the relay at tick 6. A verify pulse briefly appears — the Specialist is checking the relay's buffer entries. Two checkmarks appear on verified entries. But at tick 9, the Specialist moves away from the relay — it can't verify while out of range.

At tick 12, the enemy strikes. A spoofed signal enters the relay at fidelity 76 — within her "hold for 3 ticks" range. The signal sits in the buffer, flagged but not yet discarded. Her relay's hook doesn't fire on it (the hold rule suppresses transmission). Two ticks pass. At tick 14, no contradictory signal arrives — the enemy was careful not to send scouts into the zone they spoofed as clear.

The hold rule expires. The signal is released. It passes into her relay's forwarding hooks and reaches her strikers. Her counter-rule checks: "has a scout reported this zone in the last 5 ticks?" Yes — a scout reported the zone 4 ticks ago. The signal passes the cross-reference check. Her strikers reposition away from the spoofed "clear" zone.

The real attack comes from the opposite direction at tick 16. Her strikers are out of position — delayed by 3 ticks of hold time AND sent the wrong way by the corroborated spoof. She loses.

**Minute 4:00 — The Lesson**

In the debrief, Yuki stares at the decision trace. Her rules worked perfectly — hold-for-corroboration, cross-reference with scout data. Every rule matched correctly. But the enemy anticipated her rules and fed them fabrications that passed every check. "The enemy spoofed the *ecosystem*," she says. "Not just one signal. They spoofed the scout report AND the clear signal so my cross-reference would agree."

She realizes: without provenance verification, any cross-referencing system can be defeated by sufficiently coordinated fabrications. The verify skill isn't a luxury — it's the only way to break the spoofing loop because it checks ORIGIN, not just content.

She reconfigures for her next attempt: her Specialist now has a dedicated patrol route that stays within verify range of the relay for the entire battle. She sacrifices the Specialist's extract capability (no resource bonus) for continuous verification. This is the trust tax — one unit dedicated entirely to authentication.

**UI Annotations:**
- **Hold-for-corroboration (sealed watch):** Flagged entries pulse with an amber outline for the hold duration. A small timer pip counts down. The entry sits in the buffer but is grayed out — present but not active.
- **Verify pulse (sealed watch):** When the Specialist runs verify near a unit, a brief golden ring emanates from the Specialist's tile. Affected entries gain checkmark/question mark indicators.
- **Cross-reference visualization (Inspector):** When a rule uses cross-referencing, the decision trace shows which entries were compared and whether they agreed. Forged cross-references show "BOTH SOURCES INJECTED" in the trace — a devastating reveal.
- **Trust tax indicator (workbench):** The Specialist's blueprint shows "verify" as occupying a skill slot AND a hook slot (for broadcasting verification results). The player can see exactly how much capacity they're dedicating to authentication vs. combat.

---

#### Journey: Aisha, 42, Project Manager

**Context:** Mission 7, first attempt. Aisha manages distributed systems at work — she thinks in terms of SLAs, monitoring, and failure modes. She's never played a strategy game but the system architecture metaphor clicks for her. She hasn't encountered spoofing yet. She's built a clean three-scout, two-relay, two-striker architecture and it's been working flawlessly.

**Minute 0:00 — The Pristine Network**

Aisha's sealed watch begins. She watches her network operate — green flashes along channel lines, buffer bars filling with clean amber and green pips. The relay in the center processes signals and forwards to strikers. Everything looks healthy. Her fidelity filter is set at 50 — anything below that gets discarded. She's been filtering noise successfully for two missions.

At tick 8, something subtle changes. A new entry appears in her relay's buffer — an observation from Scout-B: "Enemy Scout at E6, stationary." Fidelity: 73. The entry looks normal. It passes her fidelity filter (73 > 50). It gets compressed and forwarded. Her eastern striker adjusts position toward E6.

At tick 10, another entry: Scout-B reports "Enemy Scout at E6, stationary." Fidelity: 72. Same observation, one tick later. Also passes filter. The striker holds position — it's already near E6.

At tick 12, Scout-B reports: "Enemy Scout at E6, stationary." Fidelity: 71. Aisha notices three identical reports in a row. "Why is the scout seeing the same thing three times? Is it stuck?" She doesn't realize these are fabricated. The enemy is creating a "persistence spoof" — sending the same fake observation repeatedly to make her striker fixate on a non-existent target.

At tick 15, the real enemy assault arrives from G2. Her eastern striker is at D5, watching E6 for an enemy that was never there. The relay is destroyed. Channel lines go dark. Mission over.

**Minute 2:00 — The Forensic Reveal**

In the Inspector, Aisha scrubs to tick 8. She clicks the relay entry. `Source: injected`. Her eyebrows go up. "Injected." She clicks the next entry at tick 10. `Source: injected`. And tick 12: `Source: injected`. Three injected entries, all from the same vector. She follows the provenance chain: each was injected by an enemy Specialist at G4, tick 7-11.

She looks at the fidelity values: 73, 72, 71. "They're degrading by one each time. Like a real signal losing fidelity. They're *simulating* natural degradation." The enemy isn't just spoofing fidelity — they're spoofing the *pattern* of fidelity loss to make the signals look like organic observations from a stationary scout.

She stares at the Inspector for a long moment. Then she says something that captures the entire design question: "They didn't fake the data. They faked the *normalcy*. They made a lie that looked like the truth by making it look boring."

**Minute 4:00 — The Countermeasure**

Back on the Plan screen, Aisha configures a new rule on her relay: `IF same_source_reports_same_observations >= 3 within 5_ticks THEN flag_as_potential_spoof`. She doesn't discard — she flags. Why? Because a real scout CAN observe the same enemy three times (if the enemy is actually stationary). But the flagged entry triggers a secondary rule: `IF flagged_as_potential_spoof THEN request_verify from nearest Specialist`.

She also configures a rule on her scout: `IF observation_age < 3 AND observation == previous_observation THEN reposition Scout (break observation loop)`. This rule makes her scouts move if they've seen the same thing three times — either the enemy is stationary (in which case repositioning gets a better angle) or the signal is spoofed (in which case the scout moves away from the injection point).

"Two layers," she says. "The relay catches the pattern. The scout breaks the pattern. If it's real, the scout gets a better vantage. If it's fake, the scout disrupts the injection."

**Minute 6:00 — Resolution**

She hits EXECUTE. Her new rules fire at tick 9 — the relay flags the second "same as before" entry. Her Specialist begins moving toward the relay for verification. At tick 10, her scout's reposition rule fires — the scout moves away from its patrol route toward a new observation point. The enemy's injection continues, but now the flagged entries are held in a quarantine buffer — visible but not forwarded.

The enemy Specialist at G4 loses its injection target as the scout moves away. The spoofing stops. The real attack comes from G2 at tick 15, but this time her relay has the actual scout observations (the scout's new position gives it line of sight to the real approach). Her strikers respond correctly. She wins.

In the debrief, the boot log types: `PATTERN ANOMALY DETECTED IN SIGNAL STREAM — persistence spoofing identified and mitigated. COUNTERMEASURE: observation-loop-break + relay-flagging. Filed as NOVEL COUNTER-SPOOFING PROTOCOL.` The Blueprint Codex unlocks an entry: "Fidelity Spoofing — When the enemy makes lies look boring."

**UI Annotations:**
- **Persistence spoof visualization (sealed watch):** Three identical buffer entries stack in the relay's buffer bar. The pip colors are subtly *too* uniform — real observations vary in fidelity and content. The spoofed entries are chromatically identical, like a wallpaper pattern repeating.
- **Quarantine buffer (Inspector):** Flagged entries are moved to a separate partition in the buffer detail view — a red-bordered box below the main buffer slots. They're visible but inactive. The player can review what was quarantined and why.
- **Reposition rule (sealed watch):** When the scout's reposition rule fires, the scout snaps to a new tile with a brief blue flash — distinct from evade (red flinch) and patrol (smooth movement). A tooltip reads: "Observation loop broken — repositioned for fresh angle."
- **Codex unlock animation:** After the mission, a card flips in the Blueprint Codex with the spoofing entry. The card shows a visual of three identical pips stacked together, with a red "X" through the middle one. The flavor text reads: "The most dangerous lie is the one that looks like nothing happened."

---

## Strengths

**Pedagogically devastating.** Fidelity spoofing teaches one of the hardest lessons in real-world security: authentication systems can be gamed. The player learns that checksums verify integrity (not authenticity), that source signatures can be valid even when the underlying data is fabricated, that "high fidelity" is a claim, not a proof. These are real cryptographic and cybersecurity concepts delivered through visceral gameplay. The player who masters spoofing countermeasures will instinctively understand TLS certificate validation, code signing, and the difference between integrity and authenticity.

**Creates a metagame of trust calibration.** Every filter threshold the player sets becomes a known attack surface. If you filter at 70, the enemy spoofs at 71. If you add path validation, the enemy compromises a relay and uses its valid signature. If you add cross-referencing, the enemy fabricates coordinated multi-source spoofs. The player is constantly raising their authentication bar, and the enemy is constantly finding the next gap. This is the real-world arms race between security systems and attackers, compressed into a strategy game.

**Makes the workbench adversarial.** The Plan screen is normally the player's safe space — no enemies, no time pressure, full information. Fidelity spoofing makes the workbench a chess match against an absent opponent. Every configuration choice the player makes is a bet against the enemy's capabilities. "I'm filtering at 65 — can the enemy spoof at 66?" This transforms blueprint design from rote optimization into genuine strategic thinking.

**Deepens the Inspector.** Post-battle analysis becomes a forensic audit. "Which signals were spoofed? How did they pass my filters? What metadata did I fail to check?" The Inspector's provenance chain visualization — every hop, every fidelity value, every signature check — gives the player the tools to understand exactly how they were fooled and how to prevent it next time. The learning curve is baked into the debrief.

**Creates emergent trust architectures.** Players who understand spoofing build layered defenses: fidelity filters + path validation + cross-referencing + verify skills + quarantine buffers. Each layer catches a different class of spoof. The player's trust architecture becomes a visible, understandable system that mirrors real-world defense-in-depth security design. The game literally teaches zero-trust architecture through its mechanics.

## Weaknesses

**Potentially overwhelming complexity.** The base game already teaches skills, rules, hooks, channels, context windows, eviction policies, signal fidelity, and delegation. Adding checksums, source signatures, path validation, and a verify skill on top creates a mountain of concepts. Players who are still learning to build a basic scout-relay-striker chain will not have the cognitive bandwidth to also understand cryptographic authentication. This mechanic MUST be gated behind the campaign arc — it should not appear before Mission 7 at the earliest.

**The "everything is suspicious" spiral.** If spoofing is too prevalent, players may become paranoid about every signal. The game devolves into "trust nothing, verify everything," which burns all available capacity on authentication and leaves nothing for actual combat. The balance must ensure that spoofing is a mid-to-late-game threat that rewards players who invest modestly in verification — not a pervasive threat that makes the entire signal system feel unreliable.

**AI sophistication requirement.** Crafting convincing spoofs requires the enemy AI to model the player's filter configurations. If the enemy always spoofs at fidelity 71, the player learns to set their threshold at 72 and spoofing becomes trivially countered. The enemy must adapt its spoofing strategy to the player's specific defenses, which requires the AI to "read" the player's blueprint configurations. This is a significant AI engineering challenge.

**Invisible during sealed watch.** By design, spoofed signals look identical to real ones during the sealed watch phase. The player has no way to detect spoofing in real time — they can only discover it in the Inspector afterward. This creates a powerful emotional beat ("I was fooled and didn't know it") but also a frustrating one ("I couldn't have done anything differently in the moment"). The verify skill provides real-time detection, but it costs an action and proximity — not always available.

**Interacts dangerously with information overload.** If the player's buffer is already near capacity and they add verification rules that quarantine suspicious entries, the quarantine buffer itself becomes a new pressure point. Quarantined entries occupy space (or require a separate allocation), and if the enemy floods with spoofed entries, the quarantine can overflow. The player now has TWO buffers to manage: the main buffer and the quarantine. This may cross the complexity threshold for all but the most dedicated players.

---

## Interaction Effects

**With Signal Fidelity Degradation (2.11):** Fidelity spoofing exists because fidelity is meaningful — players use it as a trust signal. If fidelity degradation were removed, spoofing wouldn't exist (no fidelity to fake). The two mechanics are symbiotic: degradation creates the trust system, spoofing attacks it, and authentication (verify, checksums, signatures) patches the hole. Removing any one collapses the triangle. The interaction is: degradation makes fidelity a trust proxy, spoofing makes trust proxies dangerous, and authentication makes trust proxies *conditionally* reliable.

**With Deception Signals (2.12):** Deception signals are the broader category (injecting false data). Fidelity spoofing is a specific sub-type: deception that specifically targets the fidelity/trust system. A deception signal at low fidelity is "honest deception" — the player's filters catch it because the fidelity looks wrong. A spoofed signal at correctly-calibrated fidelity is "sophisticated deception" — it exploits the trust system rather than just the data. The interaction: deception signals are the attack, spoofing is the refinement. Higher-tier enemies use spoofed deceptions; lower-tier enemies use crude ones.

**With Counter-Intelligence / Hook Judo (2.16):** Counter-intelligence lets the player exploit enemy hooks. Fidelity spoofing means the enemy is also exploiting the player's authentication. The two mechanics create a mirror: both sides are using the other's infrastructure against them. The player runs hook judo on enemy hooks while the enemy runs fidelity spoofing on the player's filters. The information warfare layer becomes a genuine chess match where both sides have offensive and defensive capabilities in the same domain.

**With Signal Priority Levels (2.25):** If spoofed signals carry URGENT priority tags, they can forcibly displace real entries from buffers. This is the ultimate combination: spoofed urgency. The enemy injects a fabricated "BASE UNDER ATTACK" signal at fidelity 90, priority URGENT, which displaces the real "enemy approaching from north" observation. The player's strikers respond to the fake emergency while the real attack goes unreported. Priority spoofing + fidelity spoofing = buffer takeover. This combination must be gated behind the latest campaign missions.

**With Context Overload (locked):** A flood of spoofed entries can fill a unit's buffer, triggering context overload and the 1-tick stun. The spoofed entries look legitimate (passing fidelity filters, valid checksums), so the player's normal noise-filtering rules don't discard them. The buffer fills with convincing lies, the unit overloads, and during the stun tick the real attack arrives. Fidelity spoofing as a stun-lock vector — the most devastating combination in the game.

**With the Workbench UI (locked):** The workbench is where the player configures all their authentication policies. Every setting in the verification panel — fidelity threshold, path validation, source whitelist, action-on-failure — is visible to the enemy via the emissions model if the player's units have been hacked. The enemy can read the player's authentication configuration and craft spoofs specifically designed to pass it. The workbench is not just a design tool — it's an intelligence surface. This is the ultimate expression of "the attention language is an adversarial interface."

---

## Comparable Games / Media

**Android: Netrunner:** The Corp installs ice (defenses) on servers. The Runner breaks subroutines on the ice. But some ice has "EtR" (End the Run) subroutines that can only be broken with specific programs. The Runner must anticipate which ice they'll face and include the right breakers in their deck. Fidelity spoofing in Robot Uprising mirrors this: the player builds authentication "ice" (filters, checksums, verify skills), and the enemy must craft spoofing strategies that break through specific subroutines. The meta-game of "what authentication will they run?" vs. "what spoofing can I afford?" is identical to Netrunner's deckbuilding tension.

**Among Us (task verification):** Crewmates verify each other through task performance — you watch someone do a task and it confirms they're not the impostor. But experienced impostors fake tasks convincingly. The verification (watching the task) is only as good as the observer's knowledge of what a real task looks like. In Robot Uprising, the verify skill is the same: it checks provenance and path, but a sophisticated enough spoof can pass even provenance checks if the injection vector has a valid signature. The lesson is identical: verification is probabilistic, not absolute.

**The Imitation Game (film / historical):** The Enigma machine produced encrypted messages that the Allies learned to decrypt. But the Germans changed their encryption keys regularly, requiring the Allies to re-break the code each time. Fidelity spoofing is the same arms race: the player builds an authentication system, the enemy learns to game it, the player rebuilds, the enemy adapts. Turing's team didn't just break Enigma once — they built a machine that could keep breaking it as the Germans changed their approach. The player must build an authentication architecture that can adapt, not just a filter that works once.

**Certificate Authority compromises (real world):** In 2011, DigiNotar was compromised and issued fraudulent SSL certificates for Google domains. Browsers trusted these certificates because they chain to a valid root CA. The certificates passed every integrity check (valid signatures, correct format, unexpired) but were fundamentally fraudulent — they were created by an attacker, not by Google. Fidelity spoofing at the "golden spoof" level is exactly this: signals that pass every authentication check but are fabricated at the origin. The countermeasure (certificate revocation, transparency logs, pinning) maps to Robot Uprising's verify skill, quarantine buffers, and cross-referencing rules.

---

## Sensory Description: What Fidelity Spoofing Looks and Feels Like

**During sealed watch — the invisible attack:**

The board looks normal. Your relay's buffer bar fills with healthy green and amber pips — each one a bright, crisp entry that passes your fidelity filter. The green channel lines pulse with forwarded signals, flowing to your strikers like blood through arteries. Everything looks perfect. Your network is operating at peak efficiency.

The spoofed entries are indistinguishable from real ones. They have the same color saturation, the same pip brightness, the same visual weight. The only difference — visible only in the Inspector, not during sealed watch — is a hairline metadata discrepancy that the player's filters didn't catch. During the sealed watch, the player sees only a healthy, functioning network.

And that's the horror. The network looks healthy while it's being fed lies. The green flashes keep firing. The buffer bars keep filling. The strikers keep repositioning based on perfectly-formatted, beautifully-authenticated garbage data. The visual language of "healthy network" — bright pips, green lines, smooth operation — is the same visual language of "compromised network running on spoofed data." The game gives you no visual cue during the sealed watch. The betrayal is total.

**In the Inspector — the authentication audit:**

The player scrubs to the tick where things went wrong. They click a buffer entry. The detail panel opens, showing the full metadata chain:

```
SLOT 3: [OBSERVATION] Enemy Striker at D5, heading E
  Fidelity: 78 | Claimed path: 1 hop via Relay-C
  Checksum: VALID (content matches hash)
  Source signature: Scout-A (VALID — registered unit)
  Path validation: FLAGGED — expected fidelity 80 for 1 hop, actual 78 (-2)
  Verification status: SUSPECT (path discrepancy)
  Injected by: Enemy Specialist at F5, tick 7
```

The path validation discrepancy — just 2 fidelity points — is highlighted in amber. The entry didn't fail the filter (fidelity 78 > threshold 70), but the path check caught a 2-point anomaly. The player zooms out and sees the full board: a thin red dashed line traces from the enemy Specialist at F5 to the compromised relay, showing the injection path.

The player clicks "show all spoofed entries." The board lights up with red dashed lines — five injection events across three ticks, all originating from the same enemy Specialist. The scale of the operation becomes clear: the enemy ran a sustained spoofing campaign, not just a one-off injection.

**The emotional beat — the paranoia pivot:**

The player leans back. Every signal they received in the last 15 ticks is now suspect. Their relay's buffer — the nerve center of their information architecture — was compromised for 8 ticks before their path validation caught the first anomaly. How much of their striker positioning was based on spoofed data? How many of their "verified" entries were actually correct?

They scrub through every entry, checking verification status. Three entries pass all checks. Two are flagged. One is forged. Three real observations, three fabrications, in the same buffer, looking identical. The player can no longer trust their eyes — they must trust their authentication system. And the authentication system just proved it can be beaten.

This is the feeling the mechanic should produce: not frustration, but *respect*. Respect for the difficulty of building trustworthy systems. Respect for the sophistication of adversaries. Respect for the gap between "my system works" and "my system is secure." The player walks away from this experience understanding, in their gut, why cybersecurity engineers are paranoid.

**Audio design:**

Normal signal delivery: clean digital chirp, pitch consistent, timing precise.

Spoofed signal delivery (if detectable): The same chirp, but with a barely-perceptible phase offset — the chirp arrives a millisecond late, just enough for a trained ear to notice. This is the audio equivalent of the path validation discrepancy. Players who listen carefully can develop an ear for spoofs the way experienced musicians can hear a pitch that's 2 cents flat.

Verify skill activation: A crystalline scanning tone — like an RFID reader sweeping — that rises in pitch as it processes each entry. Verified entries produce a clear "ding." Flagged entries produce a discordant double-tone. Forged entries produce a sharp, dissonant buzz — the sound of a lie being caught.

The quarantine buffer: A low, persistent hum — like a holding cell. Entries in quarantine vibrate slightly, as if straining against containment. The audio communicates "these are dangerous and contained" without the player needing to read anything.

---

## Summary

Fidelity spoofing as aspect 2.26 extends the signal fidelity system (2.11) and deception signals (2.12) into the authentication domain. Where 2.12 asks "can the enemy lie to you?", 2.26 asks "can the enemy lie to you *in ways that pass your verification systems*?" This is the difference between basic deception and sophisticated adversarial attack.

The mechanic introduces:
1. **Fidelity spoofing** — enemy stamps fabricated signals with correctly-calibrated fidelity to pass filters
2. **Authentication metadata** — checksums (integrity) and source signatures (identity) that provide partial protection
3. **The verify skill** — Specialist capability that checks provenance chains, with a workbench UI for configuring verification policies
4. **The trust tax** — authentication costs capacity (skill slots, hook slots, Specialist action time), creating genuine resource tradeoffs

The pedagogical value is high: players learn the difference between integrity and authenticity, the concept of defense-in-depth, the limitation of any single authentication mechanism, and the emotional reality of building systems that must trust untrusted inputs. These map directly to real-world cybersecurity, cryptographic verification, and adversarial machine learning.

---

## Additional Comparables

**Papers Please (document forgery escalation):** The border checkpoint game that teaches document authentication through progressive forgery sophistication. On Day 1, you check names against passports. By Day 20, you're cross-referencing issuing cities against regional seals, checking document weight, verifying watermarks under UV light, and catching forgers who have perfected every detail except a single mismatched serial number prefix. Papers Please and fidelity spoofing share the same core escalation: the attacker's forgeries get better, so your inspection process must get deeper. The game doesn't let you automate the check — you have to look at the document yourself, every time, and decide. Robot Uprising mirrors this but pushes the inspection into the design layer: you can't inspect every signal yourself during sealed watch, so you must build rules and verification systems that inspect FOR you. Papers Please is the manual version of what Robot Uprising automates — and both teach the same lesson: authentication is a process, not a gate. You don't "solve" forgery. You build increasingly sophisticated verification pipelines and accept that sufficiently motivated adversaries will eventually find the gap.

**Social engineering (real world):** Kevin Mitnick didn't hack computers — he hacked people. He called employees, impersonated IT staff, and asked for passwords. His "signals" had perfect "fidelity": correct jargon, correct tone, correct understanding of internal procedures. The humans receiving his calls ran their own verification — "Does this person sound like they work here? Do they know the right terms? Are they asking for something reasonable?" — and every check passed because Mitnick had done his homework. Fidelity spoofing in Robot Uprising is social engineering against your automated systems. The enemy doesn't attack your units — it attacks your units' trust heuristics. The spoofed signal "sounds right" to your rules the same way Mitnick "sounded right" to the help desk. The countermeasure in both cases is the same: don't verify the signal's content, verify its provenance. Don't ask "does this signal look correct?" Ask "where did this signal come from, and should that source be generating this type of data?"

**Stuxnet (industrial control system attack):** The most famous example of spoofed sensor data in history. Stuxnet didn't just damage Iran's centrifuges — it fed the monitoring systems fake telemetry showing everything was normal while the centrifuges tore themselves apart. The operators saw green lights on their dashboards. Every sensor reading looked healthy. The system was destroying itself, and the feedback loop said "all good." This is the exact emotional beat of fidelity spoofing during sealed watch: the player's network looks healthy — green pulses, clean buffer bars, smooth operation — while it's being fed fabricated data that sends strikers to wrong positions. The Stuxnet parallel is the most viscerally accurate: fidelity spoofing doesn't just deceive, it deceives the system that would tell you you're being deceived.

---

## The TikTok Clip

**The setup:** 15 seconds. Split screen. Left side: a relay's buffer bar, beautiful and healthy, green and amber pips lined up like jewels. Channel lines pulsing with clean signal delivery. The text overlay reads: "My network is running perfectly." A confident, clean electronic beat plays underneath.

**The turn:** 3 seconds. Hard cut. The music drops out. Black screen. White text: "Or is it?"

**The reveal:** 25 seconds. The Inspector opens. The player clicks the first buffer entry. Source: `injected`. Click. `injected`. Click. `injected`. Each click is accompanied by a sharp, dissonant tone — the verify-fail buzz from the audio design. The camera zooms out to show the full board. Red dashed lines bloom across the map — five injection paths from a single enemy Specialist, threading through the player's entire relay network. The text overlay changes: "5 spoofed signals. 8 ticks undetected. Every checksum valid. Every signature verified."

**The kicker:** 5 seconds. Cut to the workbench. The player's fidelity filter reads "70." A spoofed signal's fidelity reads "71." The text overlay: "They knew my number." The same confident electronic beat returns, but now it's slightly off-key — a 2-cent pitch shift, barely perceptible, deeply unsettling. The clip ends on the filter slider, the number 70 glowing amber, the spoofed signal's 71 glowing red directly above it.

**Why it works:** The clip teaches the entire mechanic in 48 seconds without a single word of explanation. The visual language does all the work: healthy network (green, clean, confident) to compromised network (red lines, dissonant tones, unsettling pitch shift). The "they knew my number" payoff is the hook — it communicates that the enemy is reading your configuration and tuning attacks to exploit it. Every viewer who has ever set a password, configured a spam filter, or trusted a notification will feel the gut punch of "the system I built to protect me was the vulnerability." The comment section writes itself: "Wait, the ENEMY can see your filter settings??" and "I thought checksums meant it was safe" and "This is literally how phishing works."

**Hashtags:** #RobotUprising #InfoSec #TrustNoSignal #TheyKnewMyNumber #FidelitySpoofing
