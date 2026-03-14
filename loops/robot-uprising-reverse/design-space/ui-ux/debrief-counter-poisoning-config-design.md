# Counter-Poisoning Config Design

**Aspect:** 4.69e-iv — Counter-poisoning config design: full design of the player's ability to intentionally design a config that generates misleading cluster signals in an opponent's career analysis; the offensive version of adversarial poisoning; ethical/design considerations around explicit "diagnostic sabotage" as player intent.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii — Known adversarial opponent tagging; 4.69e-iii — Per-opponent threshold override; 4.69e-v — Adversarial density as career season metric
**Related:** 4.57 — Threat model report; 4.65 — Pre-ranking adversarial surface; 4.69e-iii-a — Compound adversarial detection; 4.69e-iii-h — Intentional vs. convergent coordination signal; multiplayer/competitive-* (PvP competitive design); 7.10 — Necropsy culture

---

## The Core Design Problem

The adversarial detection system (4.69e through 4.69e-iii-a) is fundamentally *defensive*: it helps the player identify when their career analysis is being polluted by an opponent's targeted config. The match-source breakdown reveals concentration. Tags and caps suppress noise. Compound detection catches coalitions.

**But the system describes a two-player game.** If the player can detect adversarial targeting, can the player also *perform* adversarial targeting against an opponent? Can they intentionally design configs that stress specific elements of the opponent's agent architecture, generating false cluster signals in the opponent's career analysis?

This is the offensive mirror of the defensive system. Where 4.69e asks "how do I protect my diagnostics from pollution?", 4.69e-iv asks "how do I pollute my opponent's diagnostics?"

### Why This Matters for Game Design

The question isn't whether players *can* do this — they can, simply by building configs that counter-target an opponent's known agents. The question is whether the game should **make this an explicit, legible, supported strategy** with dedicated tools, or whether it should remain implicit — a natural consequence of competitive play that the player discovers organically.

This is a design values question with real consequences:

1. **Explicit tools** create a meta-game of diagnostic warfare. Players optimize not just to win matches but to corrupt their opponent's long-term learning. The career analysis system becomes a battleground.
2. **Implicit emergence** keeps the career analysis system as a neutral analytical tool. Players who discover the poisoning strategy have an edge, but the game doesn't celebrate or facilitate it.
3. **Active discouragement** treats diagnostic poisoning as unsportsmanlike — like signal-jamming in a sport that depends on fair signal propagation. The game could penalize it or make it structurally difficult.

---

## Option A: The Diagnostic Warfare Paradigm — Full Offensive Tooling

### The Concept

The game explicitly supports counter-poisoning as a legitimate competitive strategy. A new section in the workbench — the **Adversarial Lab** — lets the player model how their config will appear in an opponent's career analysis, and optimize for diagnostic disruption.

### The Adversarial Lab

**Location:** A tab in the Plan Screen workbench, next to the blueprint editor. Accessible after Mission 7 (when the competitive meta is introduced). Not available in solo campaign — only in competitive/multiplayer modes.

**The UI:**

The Adversarial Lab is a split-panel tool. The left panel shows the player's current config. The right panel shows a **simulated opponent career analysis** — what the opponent's diagnostic system would show if the player's config were part of their match history.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ADVERSARIAL LAB                                                    [Close ✕]   │
├────────────────────────────────────┬────────────────────────────────────────────┤
│                                    │                                            │
│  YOUR CONFIG                       │  SIMULATED OPPONENT DIAGNOSTICS            │
│                                    │                                            │
│  ┌────────────────────────────┐    │  Target: NebulaFang                        │
│  │ STRIKER-A                  │    │  Known agents: RELAY-C, SCOUT-D, STRIKER-B │
│  │ Skills: [Flank] [Strike]  │    │                                            │
│  │ Rules:                     │    │  Simulated Cluster Impact:                 │
│  │  1. If buffer > 80% →     │    │  ┌──────────────────────────────────────┐  │
│  │     prioritize compressed  │    │  │ RELAY-C  ████████████░░░░ +34% cov  │  │
│  │  2. If scout_signal →      │    │  │ SCOUT-D  ██████░░░░░░░░░ +18% cov  │  │
│  │     move toward source     │    │  │ STRIKER-B████░░░░░░░░░░░ +11% cov  │  │
│  │ Hooks:                     │    │  └──────────────────────────────────────┘  │
│  │  scout.alert → engage      │    │                                            │
│  │ Context: 8 slots, LRU      │    │  Cluster Flag Probability:                │
│  │                             │    │  RELAY-C: ████████████████ 89% 🎯        │
│  │                             │    │  SCOUT-D: ████████░░░░░░░ 42%           │
│  │                             │    │  STRIKER-B:████░░░░░░░░░░ 19%           │
│  │                             │    │                                            │
│  └────────────────────────────┘    │  Predicted Opponent Response:              │
│                                    │  "Likely to redesign RELAY-C's fallback    │
│  Poisoning Targets:                │   filter and priority queue. If they do,   │
│  [x] RELAY-C context buffer        │   your STRIKER-A flank loses ~15% win      │
│  [x] RELAY-C fallback filter       │   rate against the redesigned RELAY-C      │
│  [ ] SCOUT-D perception range      │   but gains +22% against their current     │
│  [ ] STRIKER-B priority queue      │   SCOUT-D, which they won't fix."          │
│                                    │                                            │
│  [Generate Poisoning Config]       │  ⚠ Ethical warning: This config is         │
│  [Preview Match Simulation]        │  optimized for diagnostic disruption,      │
│                                    │  not match winning. Win rate vs.           │
│                                    │  NebulaFang: 38% (down from 52%)          │
│                                    │                                            │
├────────────────────────────────────┴────────────────────────────────────────────┤
│  COST: Poisoning configs sacrifice match performance for diagnostic impact.     │
│  This config is 14% WEAKER against NebulaFang to make their diagnostics 34%   │
│  NOISIER for RELAY-C.                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### The Mechanics of Deliberate Poisoning

**How a config becomes a poison:**

A normal config is optimized to win. A poisoning config is optimized to *stress specific elements* of a known opponent agent, making those elements appear in as many runner-up diagnostic slots as possible — even if the config doesn't actually exploit those weaknesses effectively in combat.

The key insight: the career analysis system looks at which agent elements *almost* failed across many matches. A poisoning config doesn't need to *beat* the opponent's RELAY-C — it just needs to make RELAY-C's context buffer, fallback filter, and priority queue show up as runner-up candidates in the opponent's post-match diagnostic. Even losses count. The opponent's career analysis doesn't distinguish "this element was stressed because we lost" from "this element was stressed because we won" — it measures *how often the element appears as a fix candidate*.

**The poison vector:** The player's config includes agents whose sole purpose is to generate specific stress patterns against the target agent. A SCOUT that sends signals on the exact channel the opponent's RELAY-C listens to, at a rate calibrated to fill but not overflow the buffer — keeping RELAY-C *almost failing* without actually failing. A STRIKER that positions itself just outside RELAY-C's perception range, making the relay's context allocation decisions consistently sub-optimal without triggering an outright loss.

**The cost:** This is NOT free. A config optimized for diagnostic disruption is weaker at actually winning. The player trades match performance for long-term diagnostic corruption. This is the fundamental tension: you can win matches OR you can corrupt diagnostics, but doing both at once is structurally difficult.

### The Poisoning Target Selector

The player chooses which opponent agent elements to target. The system models the likely diagnostic impact:

- **High-impact targets:** Elements the opponent has been tuning recently (visible from their match history if competitive metadata is shared). Stressing an element they just "fixed" makes the cluster flag fire immediately, suggesting the fix didn't work.
- **Low-cost targets:** Elements that can be stressed without significantly weakening the player's match performance. Some stress patterns are cheap — sending junk signals costs almost nothing. Others are expensive — positioning agents sub-optimally to create perception edge-cases sacrifices tactical advantage.
- **Cascading targets:** Elements whose diagnostic disruption triggers secondary effects. If the opponent redesigns RELAY-C in response to the false cluster, the redesign might break synergies with SCOUT-D, creating a real structural problem where there was only a phantom one.

### The Win-Rate / Diagnostic-Impact Trade-Off Curve

This is the central design element. The Adversarial Lab displays a **trade-off curve** — a smooth gradient from "100% optimized for winning" to "100% optimized for diagnostic disruption":

```
         WIN RATE vs. NEBULAFANG
    60% ┤●
        │ ╲
    55% ┤  ╲
        │   ╲
    50% ┤    ●─── Your current config (balanced)
        │      ╲
    45% ┤       ╲
        │        ╲
    40% ┤         ●── Heavy poisoning config
        │           ╲
    35% ┤            ●── Max disruption
        │
    30% ┤
        └────────────────────────────────────
         0%   20%   40%   60%   80%  100%
              DIAGNOSTIC IMPACT ON RELAY-C
```

The player drags a slider along this curve. The left panel updates the config in real-time. The right panel updates the simulated diagnostic impact. The player chooses their balance point.

**The shape of the curve matters.** If it's convex (steep initial drop, gradual tail), light poisoning is expensive and heavy poisoning is relatively cheap — incentivizing all-or-nothing strategies. If it's concave (gradual initial drop, steep tail), light poisoning is cheap and heavy poisoning is prohibitive — incentivizing subtle, persistent pressure over dramatic sabotage.

The game should use a **concave curve** for most matchups, making "a little poison in every config" the dominant strategy over "dedicated poison configs." This creates an always-present background radiation of diagnostic noise that rewards players who understand the adversarial detection tools (4.69e-ii, 4.69e-iii) and punishes players who trust their diagnostics uncritically.

### Sensory Design

**The Adversarial Lab has a distinct visual identity** — darker than the standard workbench, with a vaguely conspiratorial palette. Deep navy background instead of the standard charcoal. The simulated opponent diagnostics panel renders in a ghostly green-on-black — terminal aesthetic, like you're hacking into their system. The cluster impact bars pulse slowly, like a heartbeat monitor showing vital signs you're about to corrupt.

**The trade-off slider** glows along a gradient from clean blue (pure win optimization) to toxic green (pure diagnostic disruption). As the player drags toward green, the left panel's config card borders shift from blue to green, and small ☠ icons appear on the agent cards that have been modified for poisoning. The sound design shifts from the standard workbench's crisp clicks to slightly distorted, lower-pitched versions — the same interactions, but *wrong*, signaling that you're building something fundamentally different.

**The cluster flag probability indicator** on the right panel is a fill bar that throbs when above 75% — a confident, predatory pulse. Below 50%, it's static. Between 50-75%, it shivers occasionally, uncertain.

**The cost callout** at the bottom is always visible and always honest. Bright amber text. No hiding the price. If the player's win rate drops below 40%, the amber text turns red and adds: *"WARNING: This config loses more matches than it wins. The diagnostic disruption may not be worth the rating cost."*

---

## Option B: The Implicit Emergence Paradigm — No Dedicated Tools

### The Concept

The game provides NO explicit support for counter-poisoning. Players discover the strategy organically through competitive play. The career analysis system is presented purely as a self-improvement tool, and any adversarial use is emergent player behavior.

### How It Works

Players who deeply understand the career analysis system — particularly the cluster detection, match-source breakdown, and threshold mechanics — realize they can reverse-engineer the system. If they know what their opponent's agents look like (from match replays, shared configs, or community discussion), they can reason about what their opponent's career analysis will show.

**The discovery path:** A player runs career analysis and sees that 78% of their RELAY-C cluster comes from NebulaFang. They think: *"Wait — if NebulaFang is doing this to me, am I doing it to them?"* They pull up their own match history against NebulaFang and realize their STRIKER-A consistently stresses NebulaFang's SCOUT-D. Not intentionally — just because STRIKER-A is good at pressuring scouts.

The next thought: *"What if I made that intentional?"*

Without dedicated tools, the player does this manually:
1. Study their opponent's agent configs (from replays or community info)
2. Build a config that they hypothesize will stress specific elements
3. Play matches against the opponent
4. Watch replays to see if the stress patterns emerged as expected
5. Iterate on the config

**This is tedious, uncertain, and slow** — which is the point. The game doesn't optimize for this workflow. The player is *misusing* the system, applying analytical tools to an offensive purpose they weren't designed for. The friction is the balance.

### The Community Discovery Moment

The "Diagnostic Sabotage" strategy becomes a community-discovered meta-game. Forum posts appear: *"I've been throwing matches against VoidKnot for 3 seasons to corrupt their RELAY analysis. Here's how."* The community debates whether this is clever or toxic. Content creators make videos: *"I spent 100 matches ruining my opponent's career stats."*

**This is organic, emergent, and uncontrollable.** The game's design stance is: we built a diagnostic system. What you do with it is your business. We won't help you sabotage, but we won't stop you either.

### Sensory Description

There is no dedicated UI to describe — the sensory experience is the *existing* workbench and career analysis tools used in an unintended way. The feeling is underground, DIY, hacker-ish. Scribbled notes in a spreadsheet. Replays rewatched at 0.25x speed with a notepad open. The thrill is in the clandestine nature — you're doing something the game didn't anticipate, and there's no safety net.

---

## Option C: The Scouting Report Paradigm — Defensive Intelligence Without Offensive Tools

### The Concept

Instead of offensive poisoning tools, the game provides **enhanced defensive intelligence** — a "Scouting Report" that helps the player understand how their configs affect opponents, but frames this information defensively. The player sees their diagnostic footprint, but the tool is designed for self-awareness, not sabotage.

### The Scouting Report

**Location:** A section in the debrief screen, available after any competitive match. Appears in the Inspector phase, below the standard diagnostic panel.

**The UI:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  YOUR DIAGNOSTIC FOOTPRINT                                                     │
│  How your config appeared in your opponent's post-match analysis                │
│                                                                                 │
│  Match vs. NebulaFang — Season 12, Match 47                                    │
│                                                                                 │
│  Agent elements your config stressed:                                           │
│  ┌─────────────────────────────────────────────────────────────┐                │
│  │ NebulaFang's RELAY-C                                        │                │
│  │   Context buffer:  ████████████████░░░░  82% utilization    │                │
│  │   Fallback filter: ████████████░░░░░░░░  61% trigger rate   │                │
│  │   Priority queue:  ██████████░░░░░░░░░░  48% reorder rate   │                │
│  │                                                              │                │
│  │   Your contribution to their cluster signal: MODERATE        │                │
│  │   If they run career analysis including this match,          │                │
│  │   RELAY-C gains ~12% coverage toward cluster threshold.      │                │
│  └─────────────────────────────────────────────────────────────┘                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐                │
│  │ NebulaFang's SCOUT-D                                        │                │
│  │   Perception range: ████████░░░░░░░░░░░░  38% edge-case    │                │
│  │   Signal routing:   ██████░░░░░░░░░░░░░░  28% suboptimal   │                │
│  │                                                              │                │
│  │   Your contribution to their cluster signal: LOW             │                │
│  └─────────────────────────────────────────────────────────────┘                │
│                                                                                 │
│  ⓘ This information helps you understand your competitive impact.               │
│    A high footprint on one agent may indicate your config is naturally          │
│    effective against that architecture — or that you're over-indexing            │
│    on a single opponent's weakness.                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### The Defensive Framing

The scouting report's language is carefully neutral-to-defensive:

- *"Your config stressed these elements"* — factual, not inviting optimization
- *"Your contribution to their cluster signal"* — awareness, not encouragement
- *"A high footprint may indicate you're over-indexing"* — warning against accidental poisoning of your *own* strategy diversity, not encouraging intentional poisoning of the opponent

**The design intent:** Give the player the *information* to understand diagnostic warfare without providing *tools* to wage it. The player who reads the scouting report and thinks *"I should increase my footprint on RELAY-C"* is making a strategic choice outside the system's encouragement. The player who reads it and thinks *"I'm accidentally over-targeting RELAY-C, I should diversify"* is using it as intended.

**This is a deliberate ambiguity.** The tool is a mirror — the player's reflection depends on their intent.

### Sensory Design

The Scouting Report panel uses a muted, informational palette — slate blue headers, light gray bars, no pulsing or animation. Clinical. A doctor's report, not a weapon targeting system. The utilization bars fill smoothly with no dramatic color transitions — they're data, not warnings. The "contribution to cluster signal" label uses size rather than color to indicate magnitude: MODERATE in standard 12px type, HIGH in bold 14px, LOW in light 10px italic. No red. No green. No excitement. Just information.

---

## Option D: The Arms Race Paradigm — Offensive AND Defensive Tools Co-Evolving

### The Concept

The game provides BOTH offensive poisoning tools AND enhanced defensive countermeasures, creating an explicit arms race between diagnostic attackers and defenders. This is the most complex option and treats diagnostic warfare as a first-class competitive dimension.

### The Arms Race Layers

**Layer 1: Base Diagnostics** (Missions 1-7)
Career analysis, cluster detection, match-source breakdown. The player learns the system as a self-improvement tool.

**Layer 2: Defensive Awareness** (Mission 8+, competitive mode)
Adversarial tagging (4.69e-ii), concentration caps (4.69e-iii), compound detection (4.69e-iii-a). The player learns to protect their diagnostics.

**Layer 3: Offensive Capability** (unlocked after first adversarial tag)
The Adversarial Lab (Option A). Once the player has experienced adversarial targeting *and* used defensive tools to counter it, the offensive tools unlock. The narrative framing: *"You've learned to see the attack. Now learn to wield it."*

**Layer 4: Meta-Defensive Counter-Poisoning Detection** (unlocked after first poison config)
A new defensive layer specifically designed to detect configs that are optimized for diagnostic disruption rather than match winning. The career analysis adds a new metric: **Diagnostic Intent Score** — an estimate of whether the opponent's config was designed to win or designed to corrupt.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  DIAGNOSTIC INTENT ANALYSIS                                                    │
│                                                                                 │
│  Match vs. NebulaFang — Season 14, Match 22                                    │
│                                                                                 │
│  NebulaFang's config appears optimized for:                                     │
│  ┌──────────────────────────────────────────────────────────┐                   │
│  │ WINNING          ██████████████░░░░░░░░░░  62%          │                   │
│  │ DISRUPTION       ████████░░░░░░░░░░░░░░░░  38%          │                   │
│  └──────────────────────────────────────────────────────────┘                   │
│                                                                                 │
│  Evidence:                                                                      │
│  • 3 agents positioned at perception-edge of your RELAY-C                       │
│    (consistent with stress testing, inconsistent with tactical advantage)        │
│  • Signal rate on channel alpha-7 = 94% of your buffer capacity                │
│    (calibrated to fill, not overflow — diagnostic stress, not combat attack)    │
│  • STRIKER positioning sub-optimal for combat but maximizes RELAY-C             │
│    context allocation decisions per tick                                         │
│                                                                                 │
│  ⚠ This opponent may be running a diagnostic disruption config.                │
│    Consider excluding this match from career analysis.                          │
│    [Exclude Match]  [Tag Opponent as Diagnostic Attacker]  [Dismiss]            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**The Diagnostic Intent Score** is computed by analyzing the opponent's config for patterns that are consistent with diagnostic disruption but inconsistent with match optimization:

1. **Position inefficiency:** Agents positioned at perception boundaries rather than tactically optimal positions (stresses context allocation without combat advantage)
2. **Signal calibration:** Signal rates that are suspiciously close to buffer capacity limits (fills the buffer without overflowing — diagnostic stress, not tactical pressure)
3. **Element spread:** Config that evenly stresses 3+ elements of a single opponent agent (consistent with cluster generation, inconsistent with focused exploitation of one weakness)
4. **Win rate anomaly:** Config whose match-level win rate is significantly lower than expected given its element-level pressure (it's hurting the opponent's agents but not converting pressure to wins)

### The Escalation Spiral

The arms race creates a recursive escalation:

1. Player A runs career analysis → finds structural flaw → fixes it
2. Player B (observing A's fix) designs a poison config targeting the fix
3. Player A's career analysis shows false cluster → A uses adversarial detection → tags B
4. Player B learns about tagging → modifies poison to be subtler (lower concentration per match, spread across more matches)
5. Player A uses compound detection → identifies B's new pattern
6. Player B adds secondary poison targeting A's SCOUT-D to distract from the RELAY-C poison
7. Player A uses Diagnostic Intent Analysis → identifies B's config as optimized for disruption
8. Player B designs a config that is *genuinely good* at both winning AND diagnostic disruption (the holy grail — found at the intersection of exploitation and poisoning)

**Step 8 is the design goal.** The escalation spiral should eventually produce configs that are BOTH competitively strong AND diagnostically disruptive. The arms race shouldn't be a distraction from core gameplay — it should be an additional axis of optimization that rewards the deepest understanding of the system.

### Sensory Design

The arms race progression has an explicit visual escalation. Layer 1 diagnostics are clean and clinical (standard workbench palette). Layer 2 defensive tools add amber warnings and shield iconography. Layer 3 offensive tools introduce the toxic green / deep navy palette of the Adversarial Lab. Layer 4 meta-defense introduces a new color — deep violet — signaling a higher order of analysis.

The Diagnostic Intent Score panel uses a split-bar visualization: the blue-to-green gradient from Option A's trade-off curve, but now showing the *opponent's* balance. When the disruption percentage exceeds 50%, the panel border shifts to violet and the evidence list pulses slowly — the system is telling you: *this opponent is not playing to win. They are playing to corrupt your intelligence.*

---

## Ethical and Design Considerations

### The Toxicity Question

Explicit diagnostic sabotage tools risk creating a toxic competitive environment. Players who lose to poisoning configs may feel cheated — not because they lost the match (they didn't — poison configs are *weaker*), but because their long-term improvement path was corrupted.

**The counterargument:** If the career analysis system is worth protecting, the act of protecting it (and attacking it) is a legitimate competitive dimension. Real-world cybersecurity has the same dynamic: offense and defense co-evolve. The game's educational goal is to teach agentic system design — and adversarial robustness IS part of agentic system design.

**Design recommendation:** Option C (Scouting Report) or Option D (Arms Race) are the strongest choices. Option A (explicit tools with no counter) is the most dangerous — it creates an asymmetry where attackers have tools but defenders don't have tools *specific to* counter-poisoning detection. Option B (pure emergence) is elegant but may frustrate the player base with invisible, unexplainable diagnostic pollution.

### The "Just Git Gud" Problem

If diagnostic sabotage exists, players whose diagnostics are corrupted may be told to "just get better at using the defensive tools." This is technically true but socially corrosive — it shifts the burden of adversarial robustness onto the victim.

**Design mitigation:** The game should provide **opt-out affordances**. A player who doesn't want to engage with diagnostic warfare should be able to:
1. Exclude all matches against tagged opponents from career analysis (existing tool)
2. Use the "structural only" filter that excludes matches where the opponent's Diagnostic Intent Score exceeds a threshold (Option D tool)
3. Run career analysis against *only* standardized AI opponents (a PvE baseline that can't be poisoned)

### The Spectator Value

Diagnostic warfare is **incredible spectator content.** The TikTok clip writes itself: a streamer opens their career analysis, sees the cluster flag fire on RELAY-C, does the match-source breakdown, discovers the adversarial targeting, traces it to a specific opponent, opens the Adversarial Lab to design a counter-poison, and the audience goes wild.

The arms race dimension adds commentary depth: *"OhnoRobots just tagged CyberPulse as adversarial, but look — CyberPulse's poison config is also their highest win-rate config against OhnoRobots. Is it actually poisoning or is it just good strategy? The intent analysis says 62% winning, 38% disruption — it's a hybrid! OhnoRobots can't exclude those matches without losing legitimate diagnostic data!"*

---

## Player Journeys

### Journey: Kai, 28, Diamond-Ranked Competitive Player

**Context:** Season 14, 47 matches played. Kai has been running the same core agent suite for three seasons, iterating incrementally. They just ran career analysis and were confused — RELAY-C clustered again, even after last season's redesign. They suspect NebulaFang, a rival in their bracket. Playing on PC, 27-inch monitor, dark room, competitive focus.

**Minute 0:00 — The Suspicion**
Kai stares at the career analysis result. RELAY-C: 3 elements clustered, N=4, combined coverage 61%. The match-source breakdown is open. NebulaFang: 44%. IronPulse99: 22%. Others: 34%. The ⚠ icon glows amber next to NebulaFang's bar. Kai's jaw tightens. They tagged NebulaFang as adversarial last season after the first poisoning incident. The tag suppressed NebulaFang's contribution. But they un-tagged after three matches because NebulaFang's config had changed and seemed legitimate.

"They're back at it," Kai mutters. They hover over NebulaFang's bar. The tooltip shows: *"16 matches, 44% cluster coverage. Match share: 24%. Concentration ratio: 1.83×."* Well above the auto-cap threshold. The orange ⚡ icon offers a cap.

But Kai doesn't want to just defend. They want to fight back.

**Minute 0:45 — Opening the Adversarial Lab**
Kai clicks the [Adversarial Lab] tab in the workbench. The screen shifts — the standard charcoal background darkens to deep navy. A split panel appears. Left: their current config. Right: a target selector showing their recent opponents, sorted by match frequency.

Kai selects NebulaFang. The right panel populates with NebulaFang's known agent architecture — reconstructed from match replays. RELAY-B, SCOUT-A, STRIKER-D, COMMAND-X. Each agent shows its known elements (skills, rules, hooks, context config) in a collapsed tree.

**Minute 1:30 — Selecting Poisoning Targets**
Kai expands NebulaFang's RELAY-B. It has a 6-slot context buffer with LRU eviction and a fallback filter tuned to drop signals older than 3 ticks. Kai thinks: *"If I send signals at exactly the rate that keeps their buffer at 5/6 slots, the fallback filter will fire constantly but never actually drop critical signals. Their career analysis will show the fallback filter as a chronic runner-up — always almost-failing."*

They check the box next to "RELAY-B: fallback filter" in the Poisoning Targets panel. Then "RELAY-B: context buffer utilization." The simulated opponent diagnostics on the right update immediately — the cluster impact bar for RELAY-B jumps from 12% to 34%.

**Minute 2:15 — Reading the Trade-Off Curve**
The trade-off curve appears below the config panel. Kai's current config sits at the "balanced" point: 52% win rate, 18% diagnostic impact. They drag the slider rightward. At 40% diagnostic impact, their win rate drops to 47%. At 60%, it drops to 41%. At 80%, it's down to 35%.

Kai stops at 45% diagnostic impact, 48% win rate. A four-point win rate sacrifice for 2.5× the diagnostic disruption. The cost callout reads: *"This config sacrifices 4% win rate to increase RELAY-B cluster probability from 22% to 67%. Payoff horizon: 8-12 matches."*

"Twelve matches," Kai says. "If I play NebulaFang twice a week, that's six weeks before their career analysis is fully corrupted."

**Minute 3:00 — The Moral Moment**
Kai pauses. The ethical warning at the bottom reads: *"This config is optimized for diagnostic disruption, not match winning. Win rate vs. NebulaFang: 48% (down from 52%)."* They look at the leaderboard sidebar. They're 3rd in the bracket. NebulaFang is 1st. A 4-point win rate drop means losing more matches against the player they need to beat.

But if NebulaFang spends the next two seasons chasing a phantom RELAY-B problem, they'll waste optimization cycles on the wrong thing. The long game favors Kai.

They click [Apply Poisoning Config]. The left panel's config cards sprout small ☠ icons on the modified agents. The workbench border glows toxic green for a moment, then fades to a thin green accent line — a persistent reminder that this is a poisoning config.

**Minute 3:30 — Queue and Commit**
Kai drags the modified config to their production queue. It sits between their standard anti-NebulaFang config and their generalist config. They label it "NF-POISON-v1" and set a match condition: *"Use against NebulaFang when bracket standing delta ≤ 2 ranks."* If they're close in ranking, the poison is worth the win-rate cost. If Kai has a comfortable lead, they'll switch to the standard config.

They hit [EXECUTE]. The sealed watch begins. The poisoning config deploys. In the match, Kai's SCOUT sends signals at the calibrated rate. NebulaFang's RELAY-B buffer hovers at 5/6. The fallback filter fires 14 times in 30 ticks. NebulaFang wins the match — their combat config is still strong. But in their debrief, the diagnostic footprint panel would show (if they could see it): RELAY-B fallback filter stress at 82%.

**Minute 8:00 — Debrief and Calibration**
In the Inspector, Kai scrubs to the ticks where NebulaFang's RELAY-B buffer was most stressed. They watch the signal flow. The calibration was slightly off — the buffer hit 6/6 in ticks 12 and 17, which means the overflow actually *helped* NebulaFang's analysis by showing a genuine failure, not a false almost-failure. Kai makes a note: reduce signal rate by 1 per 5 ticks.

They return to the Adversarial Lab, adjust, and save "NF-POISON-v2."

**UI Annotations:**
- Adversarial Lab tab: Navy-background panel, right side of workbench, replaces blueprint editor when active
- Poisoning Targets: Checkbox list of opponent agent elements, each with a simulated cluster impact bar
- Trade-off curve: Interactive draggable slider on a concave curve, blue-to-green gradient
- Cost callout: Fixed bottom bar, amber text, always visible, auto-updates with slider
- ☠ icon: Small, subtle, appears on agent card corner when agent has poisoning modifications
- Config label: Editable text field in production queue with [POISON] prefix suggestion

---

### Journey: Marta, 42, Casual Competitive Player (Option C — Scouting Report)

**Context:** Season 8, Marta's first competitive season after completing the campaign. She's been losing to the same three players and wants to understand why. She doesn't care about "meta-gaming" — she just wants to get better. Playing on a laptop, dining table, glass of wine, evening session.

**Minute 0:00 — Post-Match Debrief**
Marta just lost to CrystalViper for the fourth time this week. She's in the Inspector phase, scrolling through her diagnostic panel. SCOUT-B struggled — buffer overflowed 8 times. She's seen this before. She's about to click [Redesign SCOUT-B] when she notices a new section at the bottom of the panel: **YOUR DIAGNOSTIC FOOTPRINT**.

She scrolls down. The panel shows:

```
Your config stressed CrystalViper's agents:
  STRIKER-A: Context buffer — 71% utilization (HIGH)
  STRIKER-A: Priority queue — 44% reorder rate (MODERATE)
  RELAY-D:   Signal routing — 28% suboptimal (LOW)
```

*"Huh,"* Marta thinks. *"I didn't know I was stressing their STRIKER-A that much."*

**Minute 0:30 — The Light Bulb**
Marta reads the info tooltip: *"A high footprint on one agent may indicate your config is naturally effective against that architecture — or that you're over-indexing on a single opponent's weakness."*

She processes this. Her config is *accidentally* good at stressing CrystalViper's STRIKER-A context buffer. But she keeps losing. Why?

She scrolls up to her own diagnostic. SCOUT-B overflow. Then back to the footprint. She's pressuring their STRIKER-A but her SCOUT-B can't survive long enough to benefit. The insight clicks: *"If I fix SCOUT-B's buffer, the pressure I'm already putting on their STRIKER-A might actually convert to wins."*

**Minute 1:00 — Accidental Strategy**
Marta realizes the Scouting Report just helped her understand her *own* config's competitive profile. She didn't need offensive tools. She needed to see how her config interacts with the opponent's architecture — which tells her where to invest her improvement effort.

She clicks [Redesign SCOUT-B] and starts working on the buffer config. No poisoning intent. No adversarial strategy. Just better self-knowledge.

**Minute 5:00 — The Honest Win**
Three matches later, Marta's SCOUT-B survives 40% longer. Her natural pressure on CrystalViper's STRIKER-A starts converting. She wins her first match against CrystalViper. The debrief shows the Scouting Report again: STRIKER-A stress is now 89%. CrystalViper will see STRIKER-A clustering in their career analysis — and it's legitimate. Marta's config genuinely exploits that weakness. There's no poisoning. The diagnostic signal is real.

**UI Annotations:**
- Diagnostic Footprint panel: Muted slate blue, bottom of Inspector screen, collapsed by default
- Stress bars: Light gray fill, no color gradients, no animation
- Contribution labels: Size-differentiated text (HIGH in 14px bold, MODERATE in 12px regular, LOW in 10px italic)
- Info tooltip: Light blue ⓘ icon, 200px popover on hover, neutral informational language

---

### Journey: Dex, 16, Streamer and Content Creator (Option D — Arms Race)

**Context:** Season 20, Dex is a top-50 player who streams 4 hours/day. Their audience loves the "detective" moments when Dex discovers adversarial targeting. Today's stream title: "WHO IS POISONING MY RELAY? (Detective Mode)". 14,000 live viewers. Playing on PC with dual monitors — game on left, chat/OBS on right.

**Minute 0:00 — The Setup**
Dex opens career analysis on stream. "Chat, let's see who's been messing with our diagnostics this week." They click [Run Career Analysis]. The loading bar fills — eight seconds for a 200-match history. The results populate.

RELAY-C: 4 elements clustered, N=3 threshold. Combined coverage: 72%. The audience knows what this means — the emotes flood with 🔍 and ☠.

**Minute 0:20 — The Match-Source Breakdown**
Dex clicks RELAY-C's cluster. The match-source breakdown expands. Three opponents above 20%: GhostFrame (28%), StratusLayer (24%), VoidKnot (20%). "Chat, compound check time." They hover over the group — the compound adversarial detection triggers. The coalition warning appears: **Compound Score: 1.87× (GhostFrame + StratusLayer + VoidKnot). Match share: 38%, Cluster coverage: 72%.**

"ONE-POINT-EIGHT-SEVEN TIMES. Chat, these three are a TEAM." The viewer count jumps to 16,000. 🚨 emotes everywhere.

**Minute 0:45 — The Diagnostic Intent Analysis**
Dex opens the Diagnostic Intent Analysis for the most recent match against GhostFrame. The split bar appears:

```
WINNING:    ████████████████░░░░░░  58%
DISRUPTION: ██████████░░░░░░░░░░░░  42%
```

"Fifty-eight / forty-two. It's a hybrid, chat. GhostFrame's config is genuinely good AND they're using it to poison us. That's the hardest one to counter." Dex scrolls through the evidence list. "Look — three agents at perception edge. Signal rate at 94% buffer capacity. They calibrated this PERFECTLY."

**Minute 1:30 — The Counter-Attack**
"Okay chat, you know what time it is." Dex opens the Adversarial Lab. The screen shifts to the deep navy palette. Chat explodes: ☠☠☠☠☠.

"We're going after GhostFrame's COMMAND-X. Their command agent has a 4-slot buffer with priority eviction — smallest buffer in their lineup. If we send mixed signals on their command channel, the eviction priority will churn constantly. That's going to light up their career analysis like a Christmas tree."

Dex selects COMMAND-X as the target. Checks "context buffer churn" and "eviction priority stress." The simulated cluster impact jumps to 56%. The trade-off curve shows a 3% win-rate cost.

"THREE PERCENT COST for fifty-six percent cluster impact? Chat, that's FREE. GhostFrame is going to spend the next season redesigning their command agent for a problem that doesn't exist."

**Minute 2:30 — The Double Bluff**
Dex pauses. "Wait. Wait wait wait." They zoom out. "What if GhostFrame EXPECTS us to counter-poison? What if their COMMAND-X buffer is actually fine and they made it look vulnerable? What if the diagnostic disruption we see is... designed to trigger our Adversarial Lab into poisoning a non-existent weakness?"

Chat: 🤯🤯🤯

"They could be running a BAIT config. Make their COMMAND-X look weak so we waste our poison on it, while their real vulnerability is... " Dex opens GhostFrame's match replays. "... SCOUT-B. Look. SCOUT-B has a 2-slot buffer. Two slots! That's the real target. COMMAND-X is the decoy."

**Minute 4:00 — The Meta-Meta Play**
Dex redesigns the poisoning config. Target: SCOUT-B, not COMMAND-X. But they add a small amount of COMMAND-X stress as misdirection — make GhostFrame think the poison is working on the decoy.

"We're triple-layered now, chat. We're poisoning their SCOUT-B while making it LOOK like we're poisoning their COMMAND-X. Their Diagnostic Intent Analysis will read our config as targeting COMMAND-X. But the real diagnostic damage is on SCOUT-B. They'll cap us for COMMAND-X disruption and completely miss the SCOUT-B corruption."

The production queue now has: `GF-COUNTERPOIS-v1 (target: SCOUT-B / decoy: COMMAND-X)`.

**Minute 5:00 — The Clip**
Dex hits [EXECUTE]. The sealed watch begins. GhostFrame's SCOUT-B buffer fills to 2/2 six times in the first ten ticks — overflow city. But COMMAND-X also shows moderate stress, exactly as planned. The misdirection layer is working.

Dex loses the match by 3 ticks. "Doesn't matter, chat. We won the diagnostic war. Check back in two weeks when GhostFrame's career analysis tells them to redesign COMMAND-X while their SCOUT-B quietly rots."

The clip — Dex's face when they realize GhostFrame might be running a bait config, the zoom-in on the SCOUT-B 2-slot buffer, the chat explosion — gets 400,000 views on TikTok in 48 hours.

**UI Annotations:**
- Diagnostic Intent Analysis: Violet-bordered panel, split bar with blue/green gradient, evidence list below
- Adversarial Lab: Deep navy background, toxic green accents, target selector with opponent agent tree
- Compound Score: Large bold number in the coalition warning panel, with × suffix
- Production queue labels: Editable, supports custom naming, [POISON] prefix in faded green
- Sealed watch during poison config: No special visual — the poisoning is invisible to the opponent. The player watches their agents' stress patterns unfold and can only hope the calibration was right.

---

## Interaction Effects

### With Adversarial Tagging (4.69e-ii)
Counter-poisoning creates a **reason to not tag.** If a player tags an opponent as adversarial and excludes their matches, the opponent's poison has failed. But the tagger has also lost legitimate diagnostic data from those matches. Counter-poisoning creates pressure to keep matches included (to maintain sample size) while also making inclusion risky (the data is corrupted). This tension is the design's equilibrium point.

### With Compound Detection (4.69e-iii-a)
Compound detection identifies coalitions. Counter-poisoning against coalitions requires coordinating counter-poison across multiple configs — one for each coalition member — which is combinatorially expensive. This naturally limits counter-poisoning against teams to the most dedicated players.

### With Necropsy Culture (7.10)
If the community practices shared diagnostic analysis ("necropsy culture"), counter-poisoning becomes harder to hide. When multiple players analyze the same opponent's config and compare notes, poisoning intentions surface faster. Necropsy culture is a natural immune system against diagnostic sabotage.

### With Career Minimum Fix (4.59)
If career analysis recommends a minimum fix and the player implements it, but the recommendation was driven by poisoned diagnostic data, the fix addresses a phantom problem. The player may actually *degrade* their config. This is the most destructive outcome of successful poisoning — the opponent doesn't just waste the player's analytical time, they cause the player to make bad architectural decisions.

### With Per-Agent Threshold Override (4.69j)
A player who knows they're being targeted can set a higher cluster threshold for the targeted agent — requiring more evidence before the flag fires. This is a simple but effective counter: raise the bar so the poisoning signal doesn't clear it. The trade-off: a higher threshold also means missing genuine structural problems.

---

## Comparable Games / Media

### Poker: Meta-game and Leveling
Counter-poisoning is structurally identical to multi-level thinking in poker. "I think they think I think..." — the recursion of reading your opponent reading you reading them. The Adversarial Lab's trade-off curve is the poker equivalent of "should I bluff here?" — a calculated risk that sacrifices expected value for information advantage.

### Spy vs. Spy: The Asymmetric Mirror
The classic MAD Magazine comic (and game) where two spies set traps for each other. Counter-poisoning has the same comedic escalation — each layer of counter-strategy creates a new layer of meta-counter-strategy. The game should embrace this humor rather than treating diagnostic warfare as grim and serious.

### Cybersecurity Red Team / Blue Team
The arms race paradigm (Option D) maps directly to real-world cybersecurity exercises. Red team (offensive, poisoning) vs. blue team (defensive, detection). The game's educational goal explicitly includes adversarial robustness — counter-poisoning is the mechanic that teaches it.

### Competitive Pokemon: Metagame Mind Games
In competitive Pokemon, team composition is hidden until battle. Players design teams to counter the expected meta, including deliberately unusual picks meant to confuse opponents' post-match analysis. The "diagnostic sabotage" of building a Pokemon team that *looks* like it does one thing but actually does another — luring the opponent into a misread that persists across multiple matches in a series — is exactly the mechanic Robot Uprising is formalizing.

---

## Strengths and Weaknesses by Option

| | Option A (Lab) | Option B (Implicit) | Option C (Scouting) | Option D (Arms Race) |
|---|---|---|---|---|
| **Depth** | High — explicit tools enable deep optimization | Medium — discovery is self-limiting | Medium — information without tools | Very High — recursive meta-levels |
| **Accessibility** | Low — requires understanding both your and opponent's diagnostics | Very Low — requires external tooling/community | High — just reading a panel | Low — each layer requires mastering the previous |
| **Toxicity risk** | High — explicit sabotage tools | Low — hard to do, unclear if intentional | Very Low — defensive framing | Medium — arms race has natural checks |
| **Spectator value** | High — visible strategic decisions | Low — invisible to observers | Medium — scouting report moments | Very High — the detective/counter narrative |
| **Educational value** | High — teaches adversarial robustness | Low — not legible as a lesson | Medium — teaches self-awareness | Very High — teaches the full security cycle |
| **Implementation cost** | Medium — one new panel | Zero — nothing to build | Low — one read-only panel | Very High — four layers of interlocking systems |

---

## New Aspects Discovered

During this exploration, the following new aspects emerged for addition to the frontier:

1. **4.69e-iv-a — Poison config templates and sharing:** community-created and shared poisoning templates ("here's a config that corrupts any LRU-based relay buffer"); the modding/sharing implications; interaction with necropsy culture (7.10)
2. **4.69e-iv-b — Diagnostic Intent Score false positive analysis:** when a config is flagged as "optimized for disruption" but the player genuinely just built a weird config that happens to stress unusual elements; the false accusation problem; appeal/explanation affordance
3. **4.69e-iv-c — Bait config as meta-defensive strategy:** intentionally making one agent look vulnerable to lure opponent's poison toward a decoy; "poisoning the poisoner's target selection"; interaction with the Arms Race Layer 4
4. **4.69e-iv-d — Win rate sacrifice budget as a competitive resource:** formalizing the concept of "I can afford to lose X% win rate for diagnostic disruption" as a seasonal resource allocation; budget planning for diagnostic warfare across a season; interaction with ELO/ranking systems
5. **4.69e-iv-e — Cross-opponent poison coordination:** designing different configs to stress the same element of the same opponent but via different attack vectors; distributed poisoning that evades single-config detection; interaction with compound detection from the opponent's perspective
