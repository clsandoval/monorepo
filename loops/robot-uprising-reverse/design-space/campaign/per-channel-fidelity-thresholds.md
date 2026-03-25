# 5.14b — Per-Channel Fidelity Thresholds

**Aspect:** 5.14b — Per-channel fidelity thresholds: advanced mode where each listened channel gets its own threshold slider; UI complexity management, when to introduce vs. keep behind "Advanced" toggle, interaction with channel map panel
**Wave:** 5 (Onboarding & Campaign)
**Category:** Campaign / Progressive Disclosure
**Parent:** 5.14a — Fidelity threshold as onboarding gate (global threshold slider)
**Related:** 2.11 (signal fidelity degradation), 3.12 (context config UI), 5.04 (complexity ramp), 2.01 (fixed-slot buffer), 2.10 (signal taxonomy), 5.04a (Mission 5 wall)

---

## The Core Problem

The global fidelity threshold (5.14a) is a single slider: "reject anything below 0.5." It solves the signal flooding problem introduced in Mission 6-7. But it is a blunt instrument. A Relay listening to four channels — `recon-net`, `cmd-net`, `strike-report`, `noise-floor` — has four fundamentally different trust relationships with those information sources. Recon data arriving at fidelity 0.35 after three hops is expected and useful: the Scout is far away, the intelligence is approximate, but knowing "something hostile exists in the northwest quadrant" is worth a buffer slot. Command signals arriving at fidelity 0.35 are alarming: commands should travel short hops, and degraded orders cause catastrophic miscoordination. A global threshold of 0.5 rejects the degraded recon (losing strategic awareness) to protect against degraded commands (preserving coordination). A global threshold of 0.3 accepts the recon (good) but also accepts the degraded commands (dangerous).

The player needs per-channel thresholds. `recon-net` threshold: 0.2 (accept anything, even ghosts). `cmd-net` threshold: 0.8 (only trust crisp, high-fidelity orders). `strike-report` threshold: 0.5 (moderate confidence). `noise-floor` threshold: 0.0 (accept everything for analysis — this is a deliberate noise-monitoring channel).

Per-channel thresholds transform the fidelity system from a single quality gate into a **trust policy per information source**. The player is no longer saying "how much junk will I tolerate?" but "how much do I trust each speaker?" This is the difference between a spam filter slider and a per-contact trust rating. It is qualitatively richer, dramatically more expressive, and potentially a UI disaster.

---

## The UI Complexity Explosion

### The Math

A Relay has 4 hook slots, each potentially listening to a different channel. With per-channel thresholds, that is 4 sliders. A Command unit has 6 hook slots: 6 sliders. A squad of 3 Relays, 2 Strikers, 1 Command, and 2 Scouts — each with their own channel subscriptions — could present the player with 24 individual threshold sliders across 8 blueprints. A late-game factory mission with 12 active units and 6 distinct channels could produce 48 or more configurable thresholds.

Forty-eight sliders is not a configuration surface. It is a spreadsheet. The game goes from "design a robot brain" to "fill out a form." The expressiveness that makes per-channel thresholds powerful is precisely the property that makes them dangerous. Every additional slider is a decision the player must make, justify to themselves, and remember when debugging a failed run. The inspector must show which threshold on which channel on which unit caused which signal to be rejected. The cognitive chain grows from "my threshold was wrong" to "the recon-net threshold on my second Relay was 0.1 too high, causing it to reject the degraded Scout observation from tick 8 that would have triggered the reposition rule on line 3."

This is the central tension: **precision tuning vs. cognitive tractability.** The analysis below treats this as a progressive disclosure problem, not a feature toggle problem.

---

## The Progressive Disclosure Design

### Phase 1: Global Threshold Only (Missions 6-7)

The player has a single slider per blueprint. This is the 5.14a design. It works. The game teaches "you can set a quality floor." Every blueprint has one number. The context config strip at the bottom of the workbench shows: `🔒 Min Fidelity: [====|====] 0.50`. Simple, learnable, immediately useful against signal flooding.

At this stage, the channel map panel — the read-only auto-generated topology diagram on the Plan screen — shows channels as colored lines between unit types. Each line has a small fidelity indicator: an average signal quality number based on expected hop count. The player can see "recon-net: ~0.6 avg fidelity" and "cmd-net: ~0.9 avg fidelity" on the channel map. This plants the seed: different channels carry different quality levels. But the only threshold is global.

### Phase 2: The Designed Failure That Motivates Per-Channel (Mission 8-9)

Mission 8 ("Breach") introduces multi-objective scenarios and the Specialist unit. The player must simultaneously defend a base, attack an enemy position, and monitor a contested flank. The architecture requires long recon chains (3+ hops, fidelity ~0.35 at destination) AND short command chains (1 hop, fidelity ~0.85). With a global threshold, the player faces an impossible choice:

- Set threshold to 0.3: Recon data flows through. But enemy fidelity-spoofing (introduced as an enemy tactic in Mission 8) also flows through. The Specialist, receiving spoofed signals at 0.32 on `cmd-net`, executes a fake order and walks into an ambush.
- Set threshold to 0.7: Command chain is protected. But all recon dies. The defending Strikers have no early warning. The flank collapses from surprise.

There is no single threshold value that makes both chains work. The player discovers this in the Inspector: they scrub through the failed run and see the recon Relay rejecting useful-but-degraded data on one channel while accepting dangerous-but-high-enough data on another. The problem is visible in the buffer: good recon filtered out sits as ghost entries below the context window ("FILTERED: fidelity 0.34, threshold 0.40"), while bad commands sit in active slots ("fidelity 0.38, threshold 0.30, ACTED UPON").

### Phase 3: The Unlock — Per-Channel Threshold Mode

On retry after the Mission 8 failure, the workbench shows a new element in the Context Config strip: a small toggle labeled **"Advanced"** next to the global fidelity slider. The boot log prints:

```
[SUBSYSTEM UPGRADE] Per-channel signal quality assessment: AVAILABLE
Advanced mode enables independent fidelity thresholds per listened channel.
Default: all channels inherit the global threshold.
```

The Advanced toggle does not force per-channel configuration. It reveals it. Every channel still inherits the global threshold by default. The player can override individual channels one at a time, leaving the rest at global. This is the critical design decision: **override-on-demand, not configure-everything**.

---

## The Per-Channel UI: What It Looks Like

### Collapsed State (Advanced Off)

The context config strip looks identical to Phase 1. A single slider. The word "Advanced" sits as a small, dim text link to the right of the slider — not a button, not a toggle, just a text link. Players who do not need it will not notice it. Players looking for more control will find it because they are already examining the threshold slider carefully.

```
┌─────────────────────────────────────────────────────────┐
│ 🔒 Min Fidelity: [========|====] 0.50       Advanced ▸  │
│ 📡 recon-net ✓  ⚡ cmd-net ✓  🎯 strike-rpt ✓           │
│ Evict: oldest-first ▾                                    │
└─────────────────────────────────────────────────────────┘
```

### Expanded State (Advanced On)

Clicking "Advanced" triggers a 300ms downward expansion. The global slider remains at the top but now shows a thin horizontal line extending right, labeled "Global default." Below it, each listened channel gets its own row: the channel's colored pill icon, its name, and a shorter slider. Each channel slider has a small "lock" icon to its left — locked means "inherit global," unlocked means "custom value."

```
┌─────────────────────────────────────────────────────────┐
│ 🔒 Min Fidelity (Global): [========|====] 0.50          │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ◂ Adv  │
│   🔗 recon-net    [====|========] 0.20  (override)       │
│   🔗 cmd-net      [============|] 0.80  (override)       │
│   🔐 strike-rpt   ── inherits 0.50 ──  (locked)         │
│ 📡 recon-net ✓  ⚡ cmd-net ✓  🎯 strike-rpt ✓           │
│ Evict: oldest-first ▾                                    │
└─────────────────────────────────────────────────────────┘
```

### Sensory Details

**The expansion animation.** The context config strip's bottom border drops smoothly downward. The channel rows appear one at a time, top to bottom, each fading in with a 50ms stagger — `recon-net` first, then `cmd-net`, then `strike-rpt`. Each row enters with a soft horizontal wipe from left to right, as though a signal is traveling along the row to initialize it. The sound: a quiet ascending sequence of three short tones, each slightly higher pitched, like a system enumerating its inputs. The total animation time is 300ms. It feels like opening a diagnostic panel on a machine — panels folding outward to reveal the internals.

**The lock/unlock interaction.** Clicking the lock icon on a channel row plays a quiet mechanical *ka-chunk* — like a physical relay switching. The slider materializes from the lock icon position, stretching rightward to its full width in 150ms. The default position is wherever the global slider currently sits. The channel's colored pill brightens slightly when unlocked, indicating this channel now has its own policy. The corresponding channel line on the channel map panel (if visible) gains a small threshold indicator: a fidelity number next to the channel label, in the channel's color.

**The slider feel.** Each channel slider is shorter than the global slider — about 60% width — and thinner. It has the same detent positions (0.0, 0.3, 0.5, 0.8, 1.0) with subtle snap feedback. The slider track is colored with a gradient matching the fidelity visual language: green at the left (permissive, accept everything), transitioning through amber to red at the right (strict, reject most). The current threshold value appears as a small number to the right of the slider, in the same color as the gradient at that position.

**The global-override visual link.** When a channel is unlocked and set to a custom value, a thin dotted line connects the global slider's handle to the channel slider's handle — visible only on hover, a subtle reminder of the relationship. If the player drags the global slider, locked channels move with it; unlocked channels stay put, and their dotted lines stretch or compress to show the divergence.

**Collapsing back.** Clicking "Advanced" again or clicking outside the expanded section collapses the channel rows with a reverse animation — rows slide left and fade, the strip contracts upward. The global slider remains, now showing a small badge: "2 overrides" in muted text, so the player knows per-channel settings are active even when the panel is collapsed.

---

## Interaction with the Channel Map Panel

The channel map panel is a read-only, auto-generated topology diagram showing which unit types connect via which channels. It already displays channel names, directions, and connection counts. Per-channel thresholds add a new data layer.

**Without per-channel thresholds:** The channel map shows `recon-net ──── (3 listeners)` with a colored line. No fidelity information beyond the average hop-count indicator.

**With per-channel thresholds active:** Each channel line on the map gains a small annotation at the receiving end: the threshold value for that receiver. If RELAY-A listens to `recon-net` with threshold 0.2 and STRIKER-B listens to `recon-net` with threshold 0.6, the channel line forks at the receiving end, showing two threshold values. The map now tells the story: "This channel carries data to two consumers with different quality standards."

**The critical information architecture question:** Does the channel map become an interactive configuration surface for per-channel thresholds, or does it remain read-only? The recommendation is **read-only with click-to-navigate.** Clicking a channel threshold annotation on the map opens the corresponding blueprint's context config, scrolled to that channel's slider. The map is the "where" and the blueprint editor is the "what." Mixing configuration into the map creates a second locus of truth and invites state synchronization bugs. The map should reflect, not control.

When a per-channel threshold causes a signal rejection during a replay, the channel map highlights the affected channel line in amber, with a small warning icon — linking the topological view to the diagnostic event. This makes the channel map a debugging surface: the player sees "this channel is having threshold issues" at a glance, then clicks to investigate.

---

## Interaction with Fidelity Spoofing (Enemy Tactic)

Fidelity spoofing — enemies injecting signals with artificially high fidelity scores to bypass threshold filters — becomes dramatically more interesting with per-channel thresholds. With a global threshold, spoofing must exceed one number. With per-channel thresholds, the enemy must know (or guess) the player's per-channel trust policy.

This creates an adversarial information game. The player sets `cmd-net` threshold to 0.8, trusting only high-fidelity command signals. The enemy injects spoofed commands at fidelity 0.85 on `cmd-net`. The player's units accept them. In the Inspector, the player sees the spoofed signal sitting in the buffer with a legitimate-looking fidelity score — but the signal genealogy (source trace) reveals it originated from an enemy unit, not from the player's Command agent. The countermeasure: rules that check source identity in addition to fidelity threshold. Or: per-channel thresholds combined with source-based filtering — "accept cmd-net signals only if fidelity >= 0.8 AND source is allied."

Per-channel thresholds make spoofing defense more granular but also more complex. The player who sets differentiated thresholds across 4 channels has 4 attack surfaces instead of 1. Each channel's threshold is an independent security boundary that the enemy can probe.

---

## Interaction with Buffer Pressure

Per-channel thresholds interact with buffer pressure in a non-obvious way. A unit with 12 buffer slots listening to 4 channels, each with a different threshold, will accept different volumes of data per channel. A permissive threshold (0.1) on `recon-net` means nearly every recon signal enters the buffer. A strict threshold (0.9) on `noise-floor` means almost nothing from that channel enters. The effective buffer allocation is no longer uniform across channels — the thresholds create an implicit per-channel bandwidth allocation.

This can cause a "crowding" problem: the permissive channel floods the buffer with low-quality data, leaving no room for the strict channel's rare but high-quality signals. The player intends "trust recon loosely, trust commands strictly" but achieves "drown in recon, starve for commands." The fix requires combining per-channel thresholds with eviction policies that favor certain channel sources — a second layer of per-channel configuration that compounds the complexity further.

The game should surface this interaction visually. When a unit's buffer is >80% filled by signals from a single channel, the context config strip could show a small "dominant: recon-net (9/12 slots)" warning. This teaches the player that threshold permissiveness and buffer share are connected.

---

## Strengths

1. **Expressiveness.** Per-channel thresholds let players articulate nuanced trust policies that map directly to architectural intent. "Trust recon loosely, trust commands strictly" is a meaningful design statement that the global threshold cannot express.

2. **Architectural identity.** Different blueprints can have radically different trust profiles. A front-line Relay near enemy territory might accept anything on `recon-net` (threshold 0.1) while a rear-echelon Command Relay demands perfection on `cmd-net` (threshold 0.95). The per-channel configuration becomes part of what makes each blueprint unique.

3. **Debugging precision.** When a run fails because a signal was rejected, the Inspector can point to the exact channel threshold that caused the rejection. The diagnostic is more specific than "your global threshold was too high" — it is "your cmd-net threshold on RELAY-B was 0.1 too strict for the 3-hop command chain."

4. **Spoofing defense depth.** Per-channel thresholds create granular security boundaries. The player can harden critical channels while leaving information-gathering channels permissive. This is the firewall-per-port model, and it produces richer adversarial gameplay.

5. **Teaching arc alignment.** The mechanic builds naturally on the global threshold (Mission 6-7), extends it in response to a clear designed failure (Mission 8), and rewards players who invest in understanding channel topology. It is not a new concept but a refinement of an existing one.

---

## Weaknesses

1. **Combinatorial explosion.** Twelve units with 4 channels each is 48 thresholds. Even with the override-on-demand design (most channels inherit global), a player who discovers they need fine-grained control on many channels faces a configuration burden that feels like work, not play.

2. **Debugging complexity.** The Inspector must now show which channel threshold, on which unit, at which tick, caused which signal to be rejected or accepted. The causal chain grows longer. Players who struggle with the global threshold will struggle more with per-channel.

3. **Interaction opacity.** The relationship between per-channel thresholds and buffer pressure is non-obvious. A permissive threshold floods the buffer; a strict threshold starves it. The combined effect across 4 channels with 4 different thresholds is hard to predict without running the simulation. Players may resort to trial-and-error rather than reasoning.

4. **UI height cost.** The expanded Advanced panel adds 3-6 rows to the context config strip, each containing a slider. On a 1080p monitor, this competes with the rule editor for vertical space. A Command unit listening to 6 channels would need 6 slider rows — approximately 150px — in addition to the existing context config elements.

5. **False precision trap.** Players may over-tune thresholds, adjusting individual channels by 0.05 increments, when the real solution is architectural (shorter relay chains, better channel topology). Per-channel thresholds can become a substitute for structural thinking, encouraging players to "fix it with a slider" rather than redesign their network.

6. **New player overwhelm risk.** Even behind an Advanced toggle, the presence of per-channel configuration can intimidate. A player who opens Advanced mode "just to look" sees 4 channel sliders and immediately feels out of their depth. The toggle must be genuinely optional — missions must remain solvable with the global threshold alone through Mission 9 at minimum.

---

## Comparable Systems

### Per-App Notification Settings (iOS/Android)

Every phone ships with a global notification volume and a per-app override. Most users set the global and forget it. Power users drill into individual app settings: "Messages: allow, Slack: silent after 10pm, Twitter: off." The key design lesson: **the global default handles 80% of users, and the per-app surface is discoverable but not forced.** Robot Uprising's per-channel threshold should follow the same principle. The global slider is the volume knob. Per-channel overrides are the per-app settings.

### Email Filter Rules Per Sender

Gmail's filter system lets users create rules per sender, per subject, per keyword. Most users create 0-3 filters. Power users create 50+. The system never forces filter creation — the inbox works without them. But users who discover filters find they solve problems that felt unsolvable before. Per-channel thresholds should feel like discovering email filters: "Oh, I can set a different rule for THIS channel? That solves everything."

### Firewall Rules Per Port

Network firewalls have per-port allow/deny rules. Port 80 (HTTP): allow. Port 22 (SSH): allow from specific IPs only. Port 3306 (MySQL): deny all external. The parallel to per-channel thresholds is direct: each channel is a port, and the threshold is the access control rule. The firewall model also illustrates the debugging complexity — when a connection fails, the admin must determine which rule on which port on which interface blocked it.

### Audio Mixing: Per-Track EQ

A mixing board has per-channel EQ, compression, and volume. The novice mixer sets the master fader and leaves individual channels flat. The experienced mixer sculpts each track independently. The mixing metaphor maps cleanly: the global threshold is the master fader, per-channel thresholds are per-track EQ. The risk is also the same — a mix with 48 independently EQ'd tracks is harder to debug than one with 4 submixes and a master. Robot Uprising could learn from the "bus" concept: group channels into trust tiers (recon bus, command bus, report bus) and set thresholds per bus rather than per channel.

### Factorio Circuit Network Conditions

Factorio allows per-entity circuit conditions that filter signals. A chest can be set to "enable only if iron > 100." The system starts with global enable/disable and progresses to per-signal-type conditions. Players who never touch circuits complete the game. Players who master circuits build factories of staggering efficiency. The lesson: **the advanced system must not be required for campaign completion, only for mastery and optimization.**

---

## The Teaching Arc: When to Introduce vs. Keep Behind Advanced

### Recommendation: Mission 8 Unlock, Mission 10 Mastery Test

**Mission 6-7:** Global threshold only. The player learns "I can set a quality floor." The Advanced link does not exist in the UI yet.

**Mission 8 (Breach):** The designed failure described above. After the failed run, the Advanced toggle appears. The boot log message is clinical: `Per-channel assessment available. Override individual channel thresholds via Advanced mode.` No tutorial popup. No forced interaction. The player who needs it will find it because they just experienced the problem it solves.

**Mission 9 (Arms Race):** The mission is solvable with global threshold alone, but per-channel thresholds make it significantly easier. Enemy architectures in Mission 9 use fidelity spoofing on specific channels. The player who has per-channel thresholds can harden the spoofed channel while keeping others permissive. The player without per-channel thresholds must set a global threshold high enough to block spoofed signals, losing legitimate degraded recon in the process. Both approaches can win. The per-channel approach wins more cleanly.

**Mission 10 (The Warden):** The final mission is a factory-vs-factory full architecture challenge. Per-channel thresholds are one of many tools available. The mission does not require them but rewards their sophisticated use. A player who has mastered per-channel thresholds can build an architecture with differentiated trust policies across 6+ channels — a signal processing pipeline that adapts to different information sources with different quality standards. This is the mastery payoff.

---

## Player Journeys

#### Journey: Marco, 28, DevOps Engineer

**Background:** Marco manages Kubernetes clusters professionally. He understands network policies, per-service access control, and the concept of trust boundaries between microservices. He reached Mission 8 on his second evening with the game, having breezed through Missions 1-7 using his systems intuition to build clean relay chains.

**Minute 0:00 — The Briefing**
Marco reads the Mission 8 boot log. Multi-objective: defend base, attack east flank, monitor southern approach. He notes the enemy has "signal warfare capability" mentioned in the briefing. He designs his architecture on paper first — three channel groups, recon flowing north-to-south, commands flowing east-to-west, strike reports flowing back to the Command unit.

**Minute 3:30 — The Global Threshold Dilemma**
Marco sets his global fidelity threshold to 0.5 on all blueprints. He runs the mission. During sealed watch, his southern monitoring relay goes deaf — recon signals from the distant Scout arrive at fidelity 0.38, below the threshold. Meanwhile, his eastern Striker accepts a spoofed command at fidelity 0.55, walks into an ambush. Marco watches both failures happen simultaneously on opposite sides of the board. He mutters something about needing per-namespace network policies.

**Minute 6:00 — Finding the Advanced Toggle**
In the Inspector, Marco identifies the exact problem: his recon channel needs a low threshold (0.2) and his command channel needs a high one (0.8). He opens the blueprint editor, looks at the context config strip, and immediately notices "Advanced" — because he is looking for exactly this kind of granular control. He clicks it. The channel rows expand. He sees his four listened channels, each locked to the global default. He unlocks `recon-net`, drags to 0.2. Unlocks `cmd-net`, drags to 0.85. Leaves the other two locked at 0.5.

**Minute 8:00 — The Payoff**
Marco re-executes. This time, the southern Relay accepts degraded recon (fidelity 0.38 > threshold 0.2) and forwards strategic awareness to the defending Strikers. The eastern Striker rejects the spoofed command (fidelity 0.55 < threshold 0.85 on `cmd-net`) and holds its defensive position. Marco watches his architecture perform differentiated trust assessment across channels and feels the satisfaction of a well-configured service mesh.

**UI Annotations:**
- Advanced toggle discovered at first glance due to active search behavior
- Two channels unlocked, two left at global — partial override pattern
- Channel map panel now shows `recon-net: 0.2` and `cmd-net: 0.85` at the receiving ends
- Inspector replay shows "FILTERED: cmd-net, fidelity 0.55, threshold 0.85" with green highlight indicating correct rejection

---

#### Journey: Priya, 41, High School Art Teacher

**Background:** Priya plays puzzle games casually — Monument Valley, The Room, Baba Is You. She found Robot Uprising through a recommendation and was drawn to the visual design. She struggled with Mission 5 (the factory wall) and needed three attempts. She reached Mission 8 after two weeks of evening play sessions. She has never voluntarily opened an "Advanced" settings panel in any software.

**Minute 0:00 — The Failure**
Priya hits EXECUTE on Mission 8 with her global threshold at 0.4. The run fails. She watches her Strikers chase phantom targets while recon data from the southern Scout gets filtered out. She enters the Inspector and identifies that the recon signals were rejected — she can see the ghost entries labeled "FILTERED" below the Relay's context window.

**Minute 4:00 — The Adjustment Attempt**
Priya lowers her global threshold to 0.2. She re-executes. Now the recon flows through — her southern defense stabilizes. But the eastern Striker accepts a spoofed command at fidelity 0.32 and walks into an ambush again. Priya frowns. She raises the threshold to 0.35. The spoofed command at 0.32 is now blocked, but so is the recon at 0.33 from the distant Scout. She tries 0.3. The spoof at 0.32 gets through. There is no single number that works.

**Minute 8:30 — The Discovery**
Priya stares at the context config strip, frustrated. She notices "Advanced" for the first time — a small text link she had overlooked in three previous sessions. She clicks it tentatively. The panel expands. She sees her three channels listed with lock icons. She reads the labels. She understands immediately: she can set a different number for each channel. She unlocks `recon-net` and slides it to 0.15. She unlocks `cmd-net` and slides it to 0.7 — not as precise as Marco's values, but enough. She leaves `strike-rpt` locked at the global 0.35.

**Minute 11:00 — Partial Success**
The run is better. Southern recon flows. The spoofed command on `cmd-net` at 0.55 is rejected (threshold 0.7). But a second spoof on `cmd-net` at fidelity 0.72 gets through — it was above her threshold. Priya sees the failure, goes to the Inspector, and raises `cmd-net` to 0.8. On the fourth attempt, the mission clears. Priya has configured three per-channel thresholds. She did not enjoy the process but recognizes its necessity. She will use per-channel thresholds sparingly in future missions — only when the global threshold clearly fails.

**UI Annotations:**
- Advanced toggle discovered only after exhausting global threshold options (three failed attempts)
- Lock metaphor understood intuitively — "locked = same as global, unlocked = custom"
- Per-channel sliders used for necessity, not curiosity — will not explore beyond immediate need
- Channel map annotations not noticed; Priya works entirely within the blueprint editor

---

#### Journey: Tomasz, 16, Competitive Gamer

**Background:** Tomasz plays StarCraft II at Diamond league and has completed every Zachtronics game. He reached Mission 8 in a single four-hour session, using YouTube guides for Mission 5. He optimizes aggressively and has already experimented with unusual relay chain topologies. He found the global threshold "obvious" and set it to 0.5 without much thought in Mission 6.

**Minute 0:00 — Pre-Optimization**
Tomasz reads the Mission 8 briefing and immediately opens the channel map panel to study the topology. He counts channels, estimates hop counts, and calculates expected fidelity at each endpoint. Before even designing his architecture, he clicks "Advanced" — he noticed it in Mission 7 but had no reason to use it. The panel expands. He sees the channel sliders.

**Minute 1:30 — The Spreadsheet Approach**
Tomasz unlocks all four channels on every blueprint. He assigns thresholds based on expected hop count: channels with 1-hop paths get threshold 0.7, 2-hop paths get 0.4, 3-hop paths get 0.2. He treats the thresholds as a routing quality matrix. He also creates a dedicated `honeypot` channel with threshold 0.0 — accepting all signals, even dead ones — connected to a Relay whose sole purpose is monitoring enemy spoofing patterns for his Inspector analysis.

**Minute 5:00 — First Run**
The architecture works on the first attempt. The differentiated thresholds prevent both the recon starvation and the spoofing vulnerability simultaneously. The honeypot Relay collects all enemy noise for post-mission analysis. Tomasz clears Mission 8 on his first try and immediately replays it to optimize his score (fewer units, faster clear, lower buffer waste).

**Minute 7:00 — The Optimization Hole**
On the replay, Tomasz notices he can push `recon-net` threshold to 0.05 on the distant Scout chain and 0.3 on the mid-range Relay — different thresholds on the SAME channel, on different blueprints. He begins building asymmetric trust policies where the same channel is treated differently by different units based on their position in the network. This is emergent depth: the system supports it without explicitly teaching it.

**UI Annotations:**
- Advanced toggle discovered proactively, not reactively — explored before needing it
- All channels unlocked on all blueprints — maximum configuration surface utilized
- Channel map panel used as primary planning surface — threshold values read from map, adjusted in editor
- Honeypot channel: emergent use case not anticipated by the teaching arc
- Same-channel-different-blueprint asymmetric thresholds: emergent depth the UI must support without cluttering

---

## Design Recommendation

Per-channel fidelity thresholds should be implemented with the following principles:

1. **Override-on-demand, not configure-everything.** Channels inherit the global threshold by default. Players unlock individual channels only when needed. The UI shows "2 overrides" when collapsed, not "4 channels configured."

2. **The Advanced toggle is a text link, not a button.** It should be discoverable but not prominent. Players who need it will find it. Players who do not need it should not feel its presence.

3. **The channel map panel reflects but does not control.** Threshold values appear on the map as annotations. Clicking navigates to the blueprint editor. The map never becomes a configuration surface.

4. **Missions must remain solvable without per-channel thresholds through Mission 9.** The global threshold, combined with architectural changes (shorter relay chains, fewer channels), must always be a viable alternative. Per-channel thresholds are an optimization tool, not a requirement — until Mission 10, where they separate good solutions from great ones.

5. **The bus grouping concept should be explored for late-game.** If a player has 8+ channels, grouping them into trust tiers (recon bus, command bus, monitoring bus) with per-bus thresholds — rather than per-channel — may preserve expressiveness while reducing slider count. This is a separate aspect worth its own analysis.
