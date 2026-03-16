# Onboarding: The Fidelity Threshold as Onboarding Gate

**Aspect ID:** 5.14a
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.04b (vocabulary density curve), 5.00a (vocabulary pacing bottleneck), 5.01 (tutorial as puzzle), 2.01 (fixed-slot buffer), 2.04 (buffer-model-weighted), 2.10 (signal taxonomy), 5.04a (Mission 5 wall), 5.17 (hybrid tutorial architecture)

---

## The Core Question

Missions 1-2 teach that buffers have limited space and that some observations are noise. But there's a deeper lesson the game must eventually teach: **not all signal is equally trustworthy.** A fresh, high-confidence observation from an adjacent tile is qualitatively different from a stale, degraded signal relayed through three hops. The existing Mission 2 design introduces confidence values (0.9 vs. 0.3) as readable metadata, but the *fidelity threshold* — a player-configurable minimum quality bar below which data is automatically discarded or deprioritized — is a distinct mechanic that transforms the player's relationship with information.

The question: **When does the fidelity threshold unlock, how does the game teach it, and what's the designed failure that makes its necessity visceral?**

---

## What the Fidelity Threshold IS

The fidelity threshold is a configurable parameter in a unit's Context Config section. It sets a minimum quality score (0.0 to 1.0) for incoming signals. Signals below the threshold are either:

1. **Auto-rejected** — never enter the context window at all (aggressive mode)
2. **Auto-deprioritized** — enter the context window but are eviction-first candidates (soft mode)
3. **Visually flagged** — enter normally but render with a degraded appearance, cueing the player to investigate (permissive mode)

The threshold interacts with every other buffer mechanic:
- **Eviction policy** (2.06): A low-fidelity signal that would have been evicted anyway vs. one that takes a precious slot from high-quality data
- **Compression** (relay skill): Compressing a 0.9-fidelity signal produces reliable summary; compressing a 0.3-fidelity signal produces garbage-in-garbage-out
- **Signal chains**: Each relay hop degrades fidelity slightly. A 3-hop signal arriving at 0.4 fidelity might have been 0.9 at the source. The threshold determines whether long relay chains are viable or fatal
- **Enemy noise injection**: Enemies flooding channels with low-fidelity garbage is a late-game tactic. Without fidelity thresholds, this is a context overload attack. With them, it's filterable — but at the cost of potentially discarding real degraded intelligence

The fidelity threshold is the first mechanic where the player configures an *automated quality judgment* — the unit decides for itself what's worth remembering. This is a conceptual bridge to the meta-level: the player isn't curating the buffer manually anymore (as in Missions 1-2); they're teaching the unit how to curate its own buffer.

---

## When It Should Unlock: The Case for Mid-Campaign (Mission 6-7)

### Why Not Earlier (Missions 1-4)

Missions 1-4 use pre-placed units and teach foundational vocabulary: buffers, slots, noise, confidence, staleness, hooks, channels, rules. The fidelity threshold requires the player to already understand:
- What confidence values mean (Mission 2)
- That signals degrade over relay hops (Mission 3)
- That rules automate decisions based on buffer contents (Mission 4)

Introducing the threshold before these foundations exist would be a vocabulary-on-vocabulary pile-up. The player needs to *feel* the problem of degraded signal quality manually before they're given a tool to automate the solution.

### Why Not at Mission 5

Mission 5 already carries an enormous cognitive load — the factory introduction, blueprints, production queues, resource management. Adding a new context config parameter here would be the straw that breaks the bottleneck. The existing vocabulary analysis (5.00a) identifies Mission 5 as the "mode-shift penalty" point. The fidelity threshold deserves its own teaching moment, not a footnote in the factory tutorial.

### The Sweet Spot: Mission 6 or 7

By Mission 6, the player has:
- Built several blueprints with custom context configs
- Experienced context overload at least once
- Used relay chains (and noticed signal degradation in the Inspector)
- Started writing rules that reference buffer contents

They've felt the pain of stale/degraded data filling critical buffer slots. They've seen in the Inspector how a striker acted on a 0.2-confidence signal and moved to the wrong tile. They're ready for the tool — and they'll recognize its purpose instantly because it solves a problem they've already cursed at.

---

## The Designed Failure: "The Fog Mission"

### Setup

Mission 6 or 7 introduces a new enemy behavior: **signal flooding**. Enemy relays broadcast a torrent of low-fidelity noise across the battlefield — fake position reports, degraded signal echoes, spoofed threat alerts. All arrive with fidelity scores between 0.15 and 0.35. The player's units have no fidelity threshold configured (it hasn't been introduced yet). Their context windows fill rapidly with plausible-looking but unreliable data.

### The Failure Cascade

The player designs their usual architecture: scouts reporting through relays to strikers. They hit EXECUTE. During sealed watch, something terrible happens — but it happens *slowly*, which is worse:

- **Tick 1-4:** Everything looks normal. Scouts spot enemies, signals flow through relays.
- **Tick 5-8:** The enemy signal flood begins. Context bars on relays shift from cool blue to amber. The player notices but can't do anything — sealed watch, no tools.
- **Tick 9-12:** Context bars on strikers turn amber, then red. The striker's behavior becomes erratic — moving toward phantom targets, ignoring real threats. The colored dashed lines showing signal chains are everywhere, a spaghetti of false connections.
- **Tick 13-15:** Context overload. Two units stun simultaneously — sparking, jittering, frozen for a tick. The enemy striker, unaffected by the flood (it's generating it), closes to adjacent. One-shot. Kill.
- **Tick 16-18:** The remaining units, still processing junk data, can't coordinate. Another stun. Another kill. The player watches their entire network collapse not from superior force, but from **information poisoning**.

### The Emotional Beat

The sealed watch ends. The player is frustrated — but it's the *good* kind of frustrated. They could see what was happening. They could feel the flood arriving. They wanted to reach in and filter the garbage out, but they couldn't. The sealed watch's "no tools" rule made them a helpless witness to an information catastrophe.

This is the "you need a better tool" feeling. The game just showed them a problem that manual buffer curation (Missions 1-2 style) can't solve — there's too much garbage arriving too fast. They need an automated filter.

### The Inspector Reveal

In the Inspector, the player scrubs back to the moment things went wrong. They click the stunned striker. Its context window at tick 12:

| Slot | Content | Fidelity | Source | Age |
|------|---------|----------|--------|-----|
| 1 | Position: enemy at F3 | 0.21 | relay-B | 4 ticks |
| 2 | Position: enemy at A7 | 0.18 | relay-A | 3 ticks |
| 3 | Threat: movement at G2 | 0.33 | direct observation | 0 ticks |
| 4 | Position: enemy at D1 | 0.15 | relay-B | 6 ticks |
| 5 | Signal: reposition to H4 | 0.27 | relay-A | 2 ticks |
| 6 | Threat: contact at B8 | 0.19 | relay-B | 5 ticks |
| 7 | Position: ally at C4 | 0.88 | direct observation | 0 ticks |
| 8 | Position: enemy at E5 | 0.91 | direct observation | 0 ticks |

Slots 7 and 8 — the unit's own direct observations — are high fidelity. But they're buried under six garbage entries relayed from compromised channels. The striker's rule checked "IF buffer contains threat data → engage nearest" and found six fake threats, drowning the two real observations. The decision trace shows: **Rule matched on slot 1 (enemy at F3, fidelity 0.21), moved toward phantom target.**

The player can SEE the problem. The fidelity column makes it visceral. Slots 1-6 are all below 0.35. Slots 7-8 are above 0.85. The solution writes itself in the player's mind before the game offers it.

### The Tool Introduction

After the Inspector, the workbench reopens for the retry. But now there's something new in the Context Config section: **a horizontal slider labeled "Minimum Signal Confidence."** It's set to 0.0 (accept everything — the default that just failed them). A boot log message types itself:

```
[SUBSYSTEM UPGRADE] Signal quality assessment module: ONLINE
Your units can now evaluate incoming signal reliability.
Configure minimum confidence threshold per blueprint.
Signals below threshold will be... your choice.

> REJECT (never enters context window)
> DEPRIORITIZE (enters, but evicted first)
> FLAG (enters with degraded visual — your rules can check for it)
```

The slider has three detent positions with snap feedback: 0.0 (everything), 0.5 (moderate filter), 0.8 (strict filter). The player can also drag to any arbitrary position. Below the slider, a real-time preview shows which of the striker's historical signals (from the failed run) would have passed the threshold. At 0.5, six of the eight entries would have been rejected. At 0.8, only the two direct observations survive.

---

## Three Design Variations for the Threshold UI

### Variation A: "The Bouncer" — Binary Reject/Accept

The threshold is a single number. Signals below it are rejected outright — they never enter the context window. Simple, clean, high-stakes.

**Strengths:** Easiest to understand. "Set to 0.5, done." Creates strong moments when the player realizes they filtered out something important (a real degraded signal at 0.45).
**Weaknesses:** Binary thinking. Players will find the "correct" threshold and never adjust it. No nuance.
**Comparable:** Email spam filters with a single aggressiveness slider.

### Variation B: "The Triage Nurse" — Three-Tier Quality Sorting

Three zones: green (above high threshold — trusted, enters normally), amber (between low and high threshold — enters with a visual flag, deprioritized for eviction), red (below low threshold — rejected). Two sliders on the same bar.

**Strengths:** Teaches that quality is a spectrum, not binary. Amber zone creates interesting decisions — "I'll accept suspect data but my rules can check the flag before acting on it."
**Weaknesses:** Two sliders is more complex. Interaction with rules becomes combinatorial (rules that check fidelity flags). More parameters to tune.
**Comparable:** Triage systems in hospitals. Email priority sorting (spam / possible spam / inbox).

### Variation C: "The Immune System" — Adaptive Threshold

The threshold auto-adjusts based on buffer pressure. When the context window is under 50% full, the threshold drops (accept more, even low-quality). When over 75% full, the threshold rises (get selective). The player configures the low-threshold and high-threshold values, and the buffer pressure curve between them.

**Strengths:** Most elegant. Mimics biological immune response (tolerant when healthy, aggressive when under attack). Creates dynamic behavior visible during sealed watch — you can see the threshold shift as the context bar fills.
**Weaknesses:** Hardest to teach. The concept "the filter gets stricter as the buffer fills" requires understanding both the buffer AND the threshold AND their relationship. Two extra parameters (low-bound, high-bound, and the pressure curve shape). Risks "set and forget" if the curve just works.
**Comparable:** TCP congestion control. Immune system complement cascade. Real-world AI context window pressure management.

---

## Player Journeys

### Journey: Sofia, 34, Elementary School Teacher, First Strategy Game

**Context:** Mission 6, "The Fog." Sofia has completed Missions 1-5 with some difficulty. She understands buffers, hooks, channels, and rules. She built her first custom blueprints in Mission 5 and felt proud of her relay network. She's comfortable but not confident.

**Minute 0:00 — The Boot Log**
Sofia reads the mission briefing. The boot log types: `[MISSION BRIEF] Enemy intelligence: confirmed signal warfare capability. Expect high-volume low-confidence transmissions. Recommendation: evaluate signal quality standards.` She frowns. "Signal quality standards? I don't have that." She looks at her workbench. Everything looks the same as last mission. No new tool visible yet. The game isn't giving her the solution upfront — it's warning her about a problem she can't yet solve.

**Minute 0:30 — Plan Phase (Pre-Failure)**
Sofia opens her relay blueprint from last mission. Context Config shows the usual settings: buffer size 12, listen on "scout-net" and "command-net," eviction priority "oldest first." She doesn't notice anything missing because she doesn't know what a fidelity threshold is yet. She arranges her production queue — two scouts, one relay, one striker — and hits EXECUTE.

**Minute 1:00 — Sealed Watch (The Flood)**
Ticks 1-4 feel normal. Her scouts spot enemies, green signal flashes ripple through the relay. Sofia relaxes. Then tick 5: the enemy relay activates. A wave of signal flashes — but they're not the clean green she's used to. They're a sickly yellow-green, slightly dimmer, arriving in rapid succession. The context bars on her relay start filling fast. Too fast.

Sofia leans forward. "What's happening?" The relay's bar shifts from blue to amber in two ticks. Then her striker's bar starts climbing. The colored signal lines on the board become a tangled mess — dashed lines crisscrossing the entire grid. She can see her network is drowning but she can't intervene.

Tick 11: her relay stuns. The jittering, sparking animation is alarming — she's seen it before in Mission 4 but it happened to one unit. Now two stun simultaneously. A high-pitched crackling sound, like static on an old radio, fills the scene. Tick 13: enemy striker adjacent to her scout. Flash of red. Gone.

**Minute 2:30 — The Emotional Beat**
The sealed watch ends. Sofia's jaw is set. She's not confused — she SAW what happened. The enemy flooded her with junk and her units couldn't think. The Inspector loads. She clicks her dead striker. She sees the context window at the moment of death: eight slots, six of them filled with entries showing fidelity scores of 0.15-0.33. Two entries — the real threats — are buried at the bottom with scores of 0.88 and 0.91.

The decision trace lights up: "Rule: IF threat detected → engage. **Matched: Slot 1** (enemy at F3, fidelity 0.21). Action: Move toward F3." The real enemy was at E5 (slot 8). The striker went the wrong way because it trusted garbage data.

Sofia actually says out loud: "It needed to know that was garbage."

**Minute 3:30 — The Tool Appears**
She returns to the workbench. A new element has appeared in the Context Config section: a horizontal bar labeled **"Minimum Signal Confidence"** with a slider currently resting at the far left (0.0). Below the slider, a small live preview panel replays the failed striker's historical incoming signals as a scrolling feed. Each signal shows its fidelity score. As Sofia drags the slider right, signals below the threshold dim and show a red "REJECTED" overlay in the preview.

The boot log types: `[UPGRADE] Signal quality filter: ONLINE. Your units can now refuse signals they don't trust. Set a minimum. Signals below it never enter the context window.`

Sofia drags the slider to 0.5. In the preview, six of the eight historical signals dim to red. Two remain bright green. She pauses. "But what if a real signal comes in at 0.4? What if a scout saw something real but the relay degraded it?" She's asking the right question — the game's design surface is working.

She settles on 0.4 — a compromise. Not too aggressive, not too permissive. She applies the threshold to all her blueprints.

**Minute 5:00 — The Retry**
She hits EXECUTE. This time, the sealed watch tells a different story. Tick 5: the enemy flood begins, but her units' context bars barely twitch. The flood signals arrive but vanish — filtered before entry. A subtle visual cue: tiny red sparks flicker at the bottom edge of each unit's tile, like embers being brushed away. The garbage is hitting the shield and burning off.

Her striker's context window stays clean: two direct observations, one fresh relay signal (fidelity 0.67, above her threshold). It engages the real target. Victory.

**Minute 6:30 — The "Aha" in the Inspector**
She opens the Inspector for the winning run. She clicks the striker. The context window is clean — three entries, all above 0.4. But she notices a new overlay: a small counter at the bottom of the context panel reading "**Rejected: 23 signals**." She clicks it. A dropdown expands showing all 23 rejected signals with their fidelity scores. Most are 0.15-0.33. But one catches her eye: "Position: enemy at G6, fidelity 0.38." That was a real enemy position that her relay degraded below her threshold. She missed it.

Sofia thinks: "Okay, so the threshold isn't free. I might miss real intelligence if I set it too high. But if I set it too low, I drown." She's discovered the central tension of the fidelity threshold — and she found it through play, not through a tooltip.

**What Sofia Learned:** Information has quality. Quality can be filtered automatically. But automated filtering has a false-positive cost. The right threshold depends on the mission's noise level. She'll adjust this slider for every mission from now on.

---

### Journey: Dev, 28, Backend Engineer Who's Played Factorio for 2000 Hours

**Context:** Mission 7. Dev has been breezing through the campaign, recognizing patterns from his professional work. He got the fidelity threshold last mission and immediately set it to 0.7 on everything. He's about to learn why that's too aggressive.

**Minute 0:00 — The Overconfident Configuration**
Dev opens his blueprints. All thresholds set to 0.7 from last mission. He's designed what he thinks is a clean architecture: scouts report to relays, relays compress and forward to strikers, command agent manages priorities. Every unit rejects signals below 0.7. "I'm not dealing with that noise flood again."

Mission 7's briefing mentions "extended reconnaissance in low-visibility terrain." Dev skims it. He's more interested in optimizing his production queue.

**Minute 1:00 — The Silence Problem**
EXECUTE. Sealed watch begins. His scouts deploy into a jungle-terrain board (Palawan province). The terrain is dense — perception ranges are reduced by terrain modifiers. Scouts see fewer tiles. Their direct observations are strong (fidelity 0.9+), but they see less. The relay network kicks in, forwarding scout reports.

But here's the problem: three relay hops through jungle terrain degrades signal fidelity from 0.9 to 0.55. Dev's 0.7 threshold rejects it. The striker on the far side of the board gets... nothing. Its context window is empty. It stands still, doing nothing, for tick after tick.

Dev watches his striker idling. Context bar: empty blue. No data arriving. No signal lines connecting to it. The unit is deaf — not from enemy flooding, but from its own quality standards.

**Minute 2:00 — The Realization**
Tick 8: an enemy striker appears two tiles from Dev's deaf unit. Dev's striker has no observation (it's out of perception range) and no relayed intelligence (all filtered). It doesn't move. Tick 9: enemy adjacent. Flash of red. Dead.

Dev's face falls. "I filtered out my own network." He watches the rest of the mission play out — his scouts and relays are fine, sending data, but the far-side striker acts blind. The architecture works *locally* but the fidelity threshold created an *information shadow* on the battlefield — a zone where quality filtering made units strategically deaf.

**Minute 3:00 — The Inspector Deep Dive**
Dev goes straight to the Inspector and clicks the dead striker at tick 7. Context window: completely empty. Rejected signals counter: **14 signals rejected.** He expands the list. Every one is between 0.55 and 0.65 — genuine scout observations degraded by relay distance. Not garbage. Not noise. Real intelligence that lost fidelity in transit.

He scrubs back to tick 1 and watches the fidelity values degrade hop by hop. Scout observation: 0.92. After relay-A: 0.78. After relay-B: 0.64. After relay-C: 0.55. Each hop costs ~0.12 fidelity. His three-hop architecture needs at least a 0.5 threshold to work — but 0.5 would also admit some of the enemy flood from last mission.

Dev murmurs: "Per-unit thresholds. Frontline units need strict. Backline units need permissive." He's discovered the key insight: **the fidelity threshold should vary by position in the information architecture, not be a global setting.**

**Minute 4:00 — The Redesign**
He returns to the workbench. Scouts: threshold 0.8 (they have direct observations, don't need to trust relayed data). Relays: threshold 0.3 (they process everything and compress it — compression is the quality control). Strikers (frontline): threshold 0.6 (they get 1-hop data, moderate degradation). Strikers (backline): threshold 0.4 (they get 2-3-hop data, more degradation tolerated).

He realizes he needs different striker blueprints for different positions. He clones his striker blueprint and creates "Striker-Close" and "Striker-Far" with different thresholds. The production queue gets more complex. This is the kind of complexity Dev lives for.

**Minute 6:00 — The Successful Retry**
EXECUTE. This time, the backline striker receives data at 0.55 fidelity — degraded but above its 0.4 threshold. It acts on approximate intelligence. Its movements are less precise than the frontline striker's (which has high-fidelity direct observations), but it moves. It covers the flank. When the enemy approaches, it's in roughly the right position. Not perfect. But alive.

Dev grins. "This is exactly like tuning log levels per service. Your edge services log everything, your core services only log warnings." He's mapped the mechanic perfectly to his professional experience.

**What Dev Learned:** Fidelity thresholds are per-blueprint, not global. Position in the relay chain determines what threshold is viable. The game rewards architectural diversity — not one blueprint to rule them all, but specialized blueprints for different information environments. And compression at the relay level is the "quality control" that lets backline units trust degraded signals.

---

### Journey: Marcus, 14, Plays Slay the Spire and Minecraft, No Programming Experience

**Context:** Mission 6. Marcus has been enjoying the campaign but hasn't internalized the systems deeply. He understands "remove noise from the buffer" and "connect units with channels" but thinks of rules as "the IF/THEN things." He hasn't mentally modeled fidelity as a continuous value — confidence numbers are just "high is good, low is bad" in his mental framework.

**Minute 0:00 — The Fog Begins**
Marcus reads the boot log. "Signal warfare capability" — cool, sounds scary. He doesn't adjust anything. His setup is simple: two scouts, two strikers, one relay. Default everything. EXECUTE.

**Minute 0:30 — The Crash**
The flood hits fast. Marcus watches his units' context bars fill up — he's seen overload before and recognizes the amber-to-red progression. Two units stun. An enemy striker closes in. His scout dies first. Then a striker. He loses badly.

"Okay, that was different from last time." He goes to the Inspector but doesn't dig deep — he sees the full context windows and lots of numbers. He notices the fidelity column but doesn't read individual values. His takeaway: "Too much stuff in the buffer."

**Minute 1:30 — The New Slider**
He returns to the workbench. He sees the new slider: "Minimum Signal Confidence." He doesn't read the boot log explanation. He drags the slider all the way to the right (1.0). The preview panel shows ALL signals rejected. "Wait, that's too much." He drags it to the middle (0.5). Most signals are rejected, two remain. He shrugs. "Good enough."

He applies 0.5 to every blueprint. EXECUTE.

**Minute 2:30 — The First Win**
It works. The flood bounces off. His units fight cleanly. Mission complete.

Marcus feels smart but doesn't fully understand why. He's treated the slider like a difficulty switch — crank it up, problem goes away. He hasn't considered false positives, per-blueprint tuning, or the relationship between relay distance and fidelity degradation.

**Minute 3:00 — The Inspector Nudge**
He opens the Inspector for fun (he likes the scrubber). He clicks a unit and sees the "Rejected: 19 signals" counter. He expands it. Most are garbage. But one entry is highlighted with a subtle gold border and a tooltip: "⚠ This signal contained accurate position data that was below your threshold." It was a real scout observation at fidelity 0.45 that got degraded by one relay hop.

Marcus reads it. "Oh. So I accidentally blocked a real one." He doesn't do anything about it yet — Mission 6 was winnable without it. But the seed is planted. When he hits a mission where the filtered signal matters, he'll remember this moment and lower the threshold.

**What Marcus Learned (Surface Level):** There's a slider that blocks bad signals. Set it in the middle and it works. There's a cost to setting it too high (you might miss real data). He hasn't gone deep, but the tool is in his mental toolbox and the Inspector planted a seed for future learning.

**What Marcus Will Learn (Mission 8+):** When a mission requires long relay chains and his 0.5 threshold blocks critical intelligence, he'll remember the gold-bordered rejected signal and lower the threshold — or create specialized blueprints. The teaching isn't finished in one mission. It's a slow burn across the campaign.

---

### Journey: Lena, 72, Retired Librarian, Plays Crosswords and Sudoku on Her Tablet

**Context:** Mission 6. Lena has been playing slowly and carefully, spending significant time in the Inspector after each mission. She reads every boot log entry fully. She understood the buffer concept immediately — "it's like a reference desk that can only hold so many books at once." She's been mapping every game concept to library science.

**Minute 0:00 — The Cataloging Metaphor**
Lena reads the boot log about signal quality. She nods. "This is like evaluating sources. A Wikipedia article isn't the same as a peer-reviewed journal." She's already framing fidelity threshold as **information literacy** — a concept she's taught for 40 years.

She looks at the new slider. "Minimum Signal Confidence." She reads the description carefully. She reads it again. She adjusts it to 0.3 first — "I'll accept most things but flag the really unreliable ones." She chooses the "FLAG" mode (Variation B) rather than "REJECT." She wants to see everything but know what's suspect.

**Minute 1:00 — The Curated Run**
EXECUTE. During sealed watch, the flood arrives. Lena watches her units' context bars fill, but differently this time — some entries have a subtle amber tint (flagged as low-fidelity). The units still receive them but their rules deprioritize flagged data. Her striker has eight buffer entries: two bright (high fidelity), six amber-tinted (low fidelity). Its rule fires on the bright entries. It engages the correct target.

Lena nods approvingly. "Good. It's considering the source, not just the content."

**Minute 2:30 — The Inspector as Catalog**
After victory, she opens the Inspector and spends five minutes examining the flagged entries. She clicks each amber entry and reads the source, the hop count, the fidelity score at each relay. She's building a mental model of how information degrades through the network — the same way a rumor degrades through a chain of retellings.

She notices that entries from relay-A (two hops from the scout) arrive at 0.65, while entries from relay-B (three hops) arrive at 0.45. "Shorter chain, more reliable. Just like primary vs. secondary sources."

She goes back to the workbench and adjusts: relay-A's output recipients get a 0.6 threshold. Relay-B's output recipients get a 0.4 threshold. She doesn't create separate blueprints — she uses the channel-specific listen configuration to set different thresholds per incoming channel. (If the UI supports this — see interaction effects below.)

**What Lena Learned:** Fidelity threshold IS information literacy. Source evaluation, chain-of-custody, provenance — she already has the mental model from decades of library science. The game just gave her a lever to apply that expertise. She's the archetype who understands the *concept* fastest but takes the most time with the *interface*.

---

## Strengths of the Fidelity Threshold as Onboarding Gate

1. **Natural problem-solution ordering.** The player experiences the flood, feels the pain, and then receives the tool. This is "hands before head" applied to a mid-game mechanic — the same principle that worked for Missions 1-2, now scaled up.

2. **Connects to prior knowledge.** Every player has an intuition about information quality. Spam filters, source evaluation, "consider the source" — the fidelity threshold maps to existing mental models. The vocabulary density cost (5.04b) is low because the *concept* is familiar even if the *game term* is new.

3. **Layered depth.** The threshold is immediately useful at a surface level (set it to 0.5, done) but has enormous depth for players who engage with per-blueprint tuning, per-channel thresholds, and the interaction with relay chain length. Novices and experts both benefit, at different levels.

4. **Creates a new decision axis.** Every subsequent mission after the threshold unlock adds a new planning question: "What quality of information can my architecture actually deliver?" This transforms the game from "build a network" to "build a network AND calibrate your trust in it."

5. **Teaches a real-world AI engineering concept.** Confidence thresholds, hallucination filters, and quality gates are central to real agentic AI systems. The fidelity threshold is a 1:1 analogue that players learn through gameplay, not lectures.

---

## Weaknesses and Risks

1. **The "Set and Forget" Problem.** If a single threshold value (e.g., 0.5) works for most missions, players will never engage with the depth. The game must create missions where the *wrong* threshold causes visible, diagnosable failure. The Fog Mission is the first; there need to be 2-3 more missions that test different threshold configurations.

2. **Parameter Overload.** Adding a slider to Context Config means another thing to tune per blueprint. For players already struggling with the factory (Mission 5), this is one more knob. Mitigation: make the threshold *optional* — the default (0.0) is always a valid choice, just a risky one. The game never punishes players who choose not to use it, only rewards players who do.

3. **The False Positive Trap.** Setting the threshold too high is a silent failure — the unit just doesn't receive data, which looks like "nothing happened" rather than "you're filtering too aggressively." The Inspector's "Rejected signals" counter is the main diagnostic tool, but players who don't check the Inspector won't discover this. Mitigation: a subtle visual cue on the unit tile during sealed watch — a small amber spark when a signal is rejected, different from the red spark of combat.

4. **Per-Channel vs. Global Threshold.** If the threshold is global (one number per blueprint), it's simple but coarse. If per-channel, it's powerful but adds N sliders (one per listened channel). The UI complexity scales linearly with the number of hooks. Mitigation: default to global, with an "Advanced" toggle that reveals per-channel sliders.

---

## Interaction Effects

### With Context Overload (Locked Mechanic)
The fidelity threshold is the *prevention* for context overload. Without it, the only defense against buffer flooding is having a large buffer or aggressive eviction. With it, the player can preemptively filter garbage before it enters. This creates a strategic decision tree: spend budget on bigger buffers (absorb the flood) or invest in fidelity thresholds (preempt the flood). Both are valid; missions should test both.

### With the Relay Compress Skill (Locked)
Compression and fidelity threshold interact critically. A relay that compresses a 0.3-fidelity signal produces a lower-quality summary than one compressing a 0.9-fidelity signal. Should the fidelity threshold be applied *before* or *after* compression? Before: the relay rejects low-quality input, only compresses good data (cleaner output, but may miss degraded-but-real signals). After: the relay processes everything and the threshold applies to the compressed output (relay does more work, but compressed signals might have higher fidelity than their raw inputs if compression is quality-enhancing). This is a deep design question that creates real engineering decisions.

### With Enemy Noise Injection (Campaign Mechanic)
The fidelity threshold is the designed counter to enemy signal flooding. But if the threshold perfectly blocks all enemy noise, the enemy tactic becomes useless. The game needs to ensure that some enemy signals are *above* the player's threshold — either through enemy relays that produce high-fidelity deception, or through fidelity scores that are close to the player's threshold (forcing the player to choose between security and intelligence). The arms race between threshold tuning and enemy signal quality is a potential late-game depth axis.

### With the Inspector (Locked Screen)
The Inspector becomes dramatically more useful after the threshold unlock. The "Rejected signals" panel is a new diagnostic tool that only exists post-threshold. The fidelity column in the context window viewer becomes meaningful retroactively — players will re-examine earlier missions and notice fidelity values they previously ignored. The threshold transforms the Inspector from "what happened" to "what didn't happen (and should it have?)."

### With the Boot Log Narrative (Locked)
The fidelity threshold unlock is a natural boot log beat: "SUBSYSTEM UPGRADE: Signal quality assessment module: ONLINE." This is the first *upgrade* to an existing system rather than a new system introduction. It signals to the player that the game's complexity is deepening within familiar systems, not just adding new ones. This is an important narrative distinction — growth vs. expansion.

---

## Sensory Description

### The Slider
A horizontal bar in the Context Config panel, 180 pixels wide. The background is a gradient from cool charcoal (left, 0.0) to warm amber (right, 1.0). The slider handle is a small diamond shape — cyan when below 0.5, amber when between 0.5 and 0.8, red when above 0.8 (visual warning that you're being very aggressive). As the player drags, the handle emits tiny particle sparks in its current color. Three detent positions (0.0, 0.5, 0.8) have subtle haptic bumps — the slider pauses for 50ms before continuing past them.

### The Rejection Visual (Sealed Watch)
When a signal hits a unit's fidelity threshold and is rejected, a tiny amber ember — 3 pixels wide — flickers at the bottom edge of the unit's tile and fades over 200ms. At low rejection rates (1-2 per tick), individual embers are visible. At high rejection rates (5+ per tick), the embers merge into a persistent amber shimmer along the tile edge — a heat-mirage effect that says "this unit is under information assault but holding." The shimmer is distinct from the red combat flash and the green signal delivery flash.

### The Flood Visual (Sealed Watch)
Enemy signal flooding looks like a slow-moving fog. A translucent amber-grey overlay creeps across the board from the enemy relay's position, tile by tile, each tick. Units inside the fog have their context bars filling faster. Units with high fidelity thresholds show the amber shimmer (rejecting) while units without thresholds show context bars climbing toward red. The fog is not a game mechanic — it's a pure visual indicator of where the noise density is highest. It creeps. It seeps. It feels like watching ink spread through water.

### The Inspector Rejection Panel
Below the context window state, a collapsible section labeled "Rejected (23)" in muted amber text. When expanded, a scrollable list of signal cards rendered at 60% opacity with a diagonal red line through each. Each card shows source, fidelity score, and content. One or two cards have a gold border and a small ⚠ icon — these are the false positives, real intelligence that was rejected. The gold border pulses gently (one pulse per second, 10% brightness variation) to draw the eye without demanding attention.

### Audio
- **Slider drag:** A soft granular sound, like sand through fingers, that increases in pitch as the threshold rises. At the three detent positions, a soft metallic "click" — different pitches for each detent.
- **Signal rejection (sealed watch):** A barely audible "pff" sound — like a match being blown out. At high rejection rates, the individual "pff" sounds blur into a continuous soft hiss, like white noise at 10% volume.
- **Flood approaching:** A low subsonic rumble (40-60Hz) that builds as the fog expands. Not alarming — atmospheric. Like distant thunder that never arrives. The rumble fades when the sealed watch ends.
- **False positive discovery (Inspector):** When the player clicks a gold-bordered rejected signal for the first time, a two-note descending tone — E4 to C4 on a muted bell. The "oh no" sound. Brief, not punishing. The sound of a small regret.

---

## The TikTok Clip

**15-second clip:** A unit's context bar is climbing fast — amber, then red. Twenty signal lines converge on it from every direction. The player can't intervene (sealed watch). Just as it's about to stun — cut to the retry. Same moment, same flood. But now tiny amber embers spark off the unit's tile like a force field. The context bar stays cool blue. The signal lines hit the unit and dissolve. The unit turns, spots the real enemy, and strikes. Text overlay: **"teach your robots what to ignore."**

---

## Discovered Aspects

- **5.14b — Per-channel fidelity thresholds:** The advanced mode where each listened channel gets its own threshold slider. UI complexity management, when to introduce vs. keep behind "Advanced" toggle, interaction with channel map panel.
- **5.14c — Fidelity threshold as rule condition:** Can rules reference the fidelity threshold? "IF signal fidelity < threshold AND source = relay-B → compress before processing." The threshold becoming a variable in the rule language rather than just a config parameter.
- **5.14d — Adaptive fidelity threshold (The Immune System model):** Full design exploration of the auto-adjusting threshold that responds to buffer pressure. The pressure curve, the two-parameter configuration, the sealed watch visualization of threshold shifting in real-time.
- **5.14e — Enemy fidelity spoofing:** Late-game enemy tactic where enemy signals carry artificially inflated fidelity scores. Forces the player to develop secondary quality checks beyond the threshold slider — source authentication, signal chain verification. The arms race as difficulty escalator.
- **5.14f — The "overcautious" diagnostic in Inspector:** A post-mission diagnostic that identifies missions where the player's threshold was unnecessarily high — "You rejected 47 signals, but only 3 were genuine noise. Your threshold may be too aggressive." Quantified false-positive feedback as teaching tool.
