# Adversarial Multi-Cluster Poisoning

**Aspect:** 4.69e — Adversarial multi-cluster poisoning: opponent config design strategy that stresses 3+ elements of the same target agent across all match types, deliberately triggering the player's cluster flag to mislead them into an unnecessary redesign; counter-design distinguishes "clustered across all opponents" (structural) from "clustered against specific opponent" (adversarial).

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69b — Combined agent coverage score display; 4.69c — Agent redesign mode; 4.69d — Multi-cluster persistence tracking
**Related:** 4.65 — Pre-ranking adversarial surface; 4.49 — Cross-mission pattern detection; 4.57 — Threat model report; 4.59 — Career minimum fix; multiplayer/competitive-* (PvP competitive design); 7.10 — Necropsy culture

---

## The Core Concept

The multi-cluster detection system (4.69) fires when the same agent appears in 3+ distinct runner-up slots in a career analysis result. Its premise is: when many elements of one agent keep surfacing as fix candidates, that agent probably has a structural problem, not just element-level bugs. The player should consider a holistic redesign rather than whack-a-mole patching.

**This premise has an adversarial attack surface.**

In competitive PvP play, an opponent who understands the career analysis system can deliberately engineer a config that puts exactly the right kind of stress on exactly the right agent in the player's roster. Not to win matches outright — but to *poison the player's diagnostic feedback loop*. If the opponent can force RELAY-C's context buffer, fallback filter, and priority queue to be the primary failure points in every match, the career analysis will flag RELAY-C as a multi-cluster candidate — even when RELAY-C has no structural problem. RELAY-C is just the agent this specific opponent has optimized to defeat.

The player who naively reads the cluster flag and enters redesign mode has been deceived. They will spend time rebuilding an agent that was fine. Their config will be destabilized. They may over-tune RELAY-C to survive the one opponent who targets it, inadvertently weakening it against everyone else. The opponent has performed a **diagnostic poisoning attack**: exploiting the player's trust in their own analytical tools.

This is not a bug — it is a deliberate and sophisticated PvP strategy. It rewards deep system knowledge: the attacker must understand how career analysis works, which agents in the target's roster are likely their "trusted" agents, and how to craft a config that generates a specific failure signature rather than simply winning.

**The Information Asymmetry Problem:**

The poisoning attack works because career analysis aggregates matches by default. If the player runs career analysis over their last 45 matches, and 20 of those matches were against the poisoning opponent, the opponent's targeted stress on RELAY-C will dominate the candidate pool — even if RELAY-C performs perfectly against every other opponent. The cluster flag has no visibility into *which opponent* caused which candidate entry. It only sees the aggregate.

This is the adversarial version of a **selection bias attack**: the attacker shapes the sample the diagnostic is computed over, not the underlying truth about the config.

---

## The Adversarial Design Space

### Attack Vector 1 — The Direct Targeting Approach

The simplest form: the opponent builds their config to specifically exploit 3–5 distinct weaknesses of a target agent simultaneously.

**Concrete example:** The player's RELAY-C has:
- Context buffer size: 80 slots (adequate for normal play)
- Fallback filter: depth=2 (conservative)
- Priority queue depth: 3 (standard)
- Hook broadcast radius: 40m (mid-range)

The opponent's config generates:
- **High-frequency signal floods** that overflow RELAY-C's 80-slot buffer → buffer size becomes a fix candidate
- **Multi-source fallback demands** that saturate the depth=2 fallback filter → fallback filter becomes a fix candidate
- **Priority queue storms** that overwhelm depth=3 → queue depth becomes a fix candidate

Each of these stresses targets a different element of RELAY-C. The opponent doesn't necessarily win by doing this — they might actually win easier by simply attacking RELAY-C directly. But the poisoning config is designed to *create a loss signature* that looks like RELAY-C has architectural problems, not like the opponent found its weaknesses.

### Attack Vector 2 — The Asymmetric Coverage Attack

A more sophisticated form: the opponent's config is designed so that matches played against them produce *disproportionately high coverage* in the cluster candidates, while the player's other matches produce lower coverage across diverse agents.

If the player runs career analysis over 45 matches (20 vs. the poisoning opponent + 25 vs. others), the poisoning opponent's matches might generate coverage numbers like:
- RELAY-C context buffer: **38%** (driven almost entirely by the 20 poisoning matches)
- RELAY-C fallback filter: **25%** (same source)
- RELAY-C priority queue: **18%** (same source)

Meanwhile, the 25 other matches distribute coverage across many agents. The multi-cluster flag fires: 3 of the top-5 candidates are RELAY-C entries. But the root cause is not RELAY-C's architecture — it's one opponent who deliberately targeted it.

The **combined cluster coverage** (71% if all three are fixed) looks alarming. But if the player fixed all three RELAY-C elements and then played 20 matches against the same poisoning opponent again, RELAY-C would still cluster — because the opponent's config is designed to beat RELAY-C regardless of its specific parameter values.

### Attack Vector 3 — The Persistent Offender Fabrication

The most patient form of attack: the poisoning opponent appears repeatedly in the player's match schedule (in competitive ladder play, the same opponents can recur). Over multiple career analyses, RELAY-C keeps triggering the cluster flag — not because RELAY-C is structurally weak, but because this opponent always causes it to fail. The player sees RELAY-C's persistence counter tick up: 1 cluster event, then 2, then 3. The persistent offender badge (4.69d) appears. The game suggests a holistic redesign with escalating urgency.

The player rebuilds RELAY-C entirely. They test the new version against their full opponent pool. Coverage drops to 18% — the redesign worked! But the poisoning opponent is still in the ladder. When they face this opponent again, the new RELAY-C fails in new places — and the cluster cycle begins again for the redesigned agent.

The attacker has generated not just one unnecessary redesign, but a cycle of unnecessary redesigns. Each redesign costs time, introduces instability, and creates fresh vulnerability windows as the new agent is calibrated to its new design. The player chases a ghost.

---

## The Counter-Design: Structural vs. Adversarial Disambiguation

The counter-design is a **match-scope decomposition** of the career analysis: segment the cluster candidates by which opponent (or opponent class) generated them, and surface this segmentation visually in the cluster flag.

### The Match-Source Breakdown

When the multi-cluster flag fires, the Agent Audit panel (4.69) gains a new section: **Match-Source Breakdown**.

```
┌─────────────────────────────────────────────────────────────────────┐
│  RELAY-C — Agent Audit                                    [Close X] │
├─────────────────────────────────────────────────────────────────────┤
│  MULTI-CLUSTER MEMBERS (3 elements, combined coverage: 71%)         │
│                                                                     │
│  ① context buffer size      Coverage: 62%  (28/45 matches)         │
│  ② fallback filter          Coverage: 24%  (11/45 matches)         │
│  ③ priority queue depth     Coverage: 17%   (8/45 matches)         │
├─────────────────────────────────────────────────────────────────────┤
│  MATCH-SOURCE BREAKDOWN                           [▾ Show detail]   │
│                                                                     │
│  vs. [Opponent X — "NebulaFang"]    ████████████████░░ 38pp         │
│  vs. All others (25 opponents)      ███░░░░░░░░░░░░░░ 11pp          │
│                                                                     │
│  ⚠ 78% of this cluster's coverage comes from one opponent.         │
│    This may be adversarial targeting rather than a structural flaw. │
│                                                                     │
│  [View opponent config →]  [Analyze targeting pattern →]           │
├─────────────────────────────────────────────────────────────────────┤
│  POSSIBLE ROOT CAUSES:                                              │
│  • Adversarial targeting (high confidence): NebulaFang's config     │
│    generates coordinated stress on 3 distinct RELAY-C parameters.   │
│    Your RELAY-C performs well against other opponents.              │
│  • Buffer cascade (low confidence): size/filter/queue dependency.   │
├─────────────────────────────────────────────────────────────────────┤
│  [Counter NebulaFang's Strategy →]  [Dismiss — RELAY-C is fine]    │
└─────────────────────────────────────────────────────────────────────┘
```

The key metrics:
- **Per-opponent coverage contribution**: how much of the cluster's combined coverage comes from each opponent
- **Concentration warning**: if ≥60% of combined coverage comes from one opponent, the system surfaces the adversarial targeting hypothesis
- **Structural vs. adversarial root cause ranking**: root causes are re-ordered when adversarial evidence is strong; "adversarial targeting" moves to top

### The Structural vs. Adversarial Threshold

The disambiguation logic needs a threshold for "concentration that suggests adversarial targeting":

**Uniform distribution baseline:** If 45 matches are distributed across 20 opponents, each opponent contributes ~5% of coverage by default. An opponent contributing 40% of coverage is 8x the expected contribution. This is highly suspicious.

**Concentration ratio formula:**
```
concentration_ratio = opponent_coverage_contribution / expected_contribution
expected_contribution = cluster_combined_coverage / num_opponents_in_window

if concentration_ratio > 5x: adversarial flag HIGH
if concentration_ratio > 3x: adversarial flag MEDIUM
if concentration_ratio < 2x: likely structural (distributed causation)
```

**Design option:** Make the concentration threshold configurable alongside the main cluster threshold. Players who are in dense competitive ladders (many matches vs. few opponents) will have naturally higher concentration ratios — the threshold should be higher for them to avoid false adversarial flags on legitimate structural problems.

### The Counter-Play View

When adversarial targeting is flagged, the player gains access to two new actions:

**[View opponent config →]:** Opens the opponent inspector, showing the opponent's config at a read-only level. Which agents they run, their hook wiring topology, their known strats. The player can see the coordinated targeting: "NebulaFang runs a DISRUPTOR-DELTA with three skills specifically designed to overflow relay-type agents."

**[Analyze targeting pattern →]:** Runs a reverse-analysis — instead of "what's wrong with my RELAY-C," asks "what would I need to change about RELAY-C to specifically neutralize NebulaFang's targeting strategy?" This is a targeted hardening analysis, not a holistic redesign. The output is a short list: "Make RELAY-C's buffer immune to NebulaFang's flood volume by sizing it to X. Do not change fallback filter depth — NebulaFang's depth attack is a deliberate trap."

**[Counter NebulaFang's Strategy →]:** Shortcut to the Threat Model Report (4.57) with NebulaFang's config pre-loaded as the focus threat. The player shifts from "is RELAY-C broken?" to "how do I defeat NebulaFang's specific targeting strategy?" — a completely different cognitive frame.

---

## Design Options

### Option A — Opponent Attribution in Agent Audit (Recommended)

The agent audit panel (as described above) gains the Match-Source Breakdown section. Adversarial concentration is flagged when one opponent contributes ≥60% of cluster coverage. The flag shows the concentration data prominently and offers the counter-play actions.

**Strengths:** Players see the adversarial/structural distinction exactly where they need it — when they're actively reading the diagnostic. Doesn't require a separate screen or workflow. Naturally integrates with existing cluster analysis.

**Weaknesses:** Adds complexity to an already dense audit panel. Players who don't understand the concentration ratio may be confused by the percentage breakdown. Some players will ignore the "adversarial targeting" hypothesis and still redesign RELAY-C unnecessarily — the warning is informational, not blocking.

---

### Option B — Career Analysis Scope Filter

Before running career analysis, the player can filter the match scope by opponent:

```
Career Analysis — Match Scope
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze last:  [20 matches]  [45 matches]  [Full career]

Opponent filter:
  ● All opponents
  ○ Exclude specific opponent: [NebulaFang ×]  [Add →]
  ○ Analyze vs. specific opponent only

[Run Career Analysis →]
```

By excluding NebulaFang from the analysis scope, the player gets a "true structural picture" of their config — one that is not poisoned by the adversarial matchups. They can then run a *second* career analysis with NebulaFang-only scope to see the targeted problem in isolation.

**Strengths:** Surgical and powerful. The player who suspects poisoning can definitively test the hypothesis by comparing "all opponents" vs. "all opponents except NebulaFang." If the cluster disappears when NebulaFang is excluded, the structural problem doesn't exist — it's adversarial.

**Weaknesses:** Requires the player to already suspect adversarial targeting before they can use this tool. Doesn't help with first exposure (when the player has no reason to suspect anything). Adds a filter UI to career analysis setup that most players will ignore. The player might accidentally exclude a legitimate opponent whose config happens to stress the same agent for genuine reasons.

---

### Option C — Automatic Poisoning Detection Report

A periodic system-level analysis that scans the player's career analysis history for poisoning patterns — without requiring the player to ask. When it detects that one opponent is responsible for >60% of a cluster candidate's coverage across the last 5 career analyses, it generates a proactive report:

```
⚠ Possible Diagnostic Interference Detected

RELAY-C has triggered multi-cluster in your last 3 career analyses.
Analysis shows 74% of the cluster's combined coverage originates from
matches against NebulaFang (8 matches). In matches against other
opponents (37 matches), RELAY-C does not cluster.

This pattern suggests adversarial targeting, not structural weakness.
RELAY-C may not need redesigning. NebulaFang may have a counter-strategy
tailored to your relay architecture.

[View NebulaFang's targeting pattern →]
[Dismiss — I still want to redesign RELAY-C]
```

This report fires between sessions (not during career analysis) — it appears as a notification in the season health dashboard the next time the player opens the game.

**Strengths:** Proactive — the player doesn't need to know the attack is happening. Works even against slow, patient poisoning (the Persistent Offender Fabrication pattern). Surfaces the threat framing: "this is a PvP intelligence problem, not a config maintenance problem."

**Weaknesses:** Requires multiple career analysis cycles to detect the pattern (can't flag on first exposure). The "possible" framing (not confirmed) means some players will dismiss the report and redesign anyway. Generating proactive reports requires a longitudinal data store and correlation logic — moderate engineering complexity.

---

### Option D — The Poisoning Score as a Meta-Game Layer

Make adversarial poisoning a first-class meta-game mechanic with an explicit "poisoning score" — a measure of how effectively an opponent has distorted the player's diagnostic data.

```
Opponent Intelligence Card: NebulaFang
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Win rate vs. you:    64%
Targeting efficiency: HIGH (67% of your cluster coverage in last 20 matches)
Diagnostic poisoning: ACTIVE (RELAY-C persistent offender flag fabricated)
Threat model:        Coordinated multi-element attack on relay-class agents
```

The opponent intelligence card appears in the threat model report and the season health dashboard. Poisoning efficiency is shown as a stat alongside win rate. This framing makes adversarial poisoning explicitly legible as a competitive tactic — not a bug, a feature. The most skilled opponents are not just winning — they're winning by manipulating the player's diagnostic environment.

**Strengths:** Teaches information warfare as an explicit game concept. Makes the meta-game legible. Rewards players who learn to detect and counter poisoning strategies. Creates rich PvP depth: some players specialize in poisoning; others specialize in detection.

**Weaknesses:** Requires a substantial meta-game investment. Some players (casual, PvE-focused) may find "your opponent is manipulating your diagnostics" overwhelming or unfair-feeling. The "poisoning" framing has adversarial connotations that might read as frustrating rather than interesting.

---

## Player Journeys

### Journey: Hana, 26, Competitive Gauntlet Player — First Encounter With Poisoning

**Context:** Hana is a 200-hour veteran. She's in Season 4, Gauntlet mode. She's been climbing the competitive ladder for two months. Recently she's been matched against NebulaFang five times — losing 4 of 5. She just ran her Season 4 career analysis after match 185.

**Minute 0:00 — The Familiar Cluster Flag**

The career analysis panel loads. The amber banner slides in:

> ⚠ RELAY-C appears in 3 of your top 5 candidates.

Hana has seen this before. She's redesigned RELAY-C twice in her career. She clicks [View Agent Audit] automatically.

The audit loads. She reads the cluster members: context buffer (51%), fallback filter (28%), priority queue (19%). Combined coverage: 72%. She reads the root cause section. "Role drift: RELAY-C v4.1 has not been updated since Match 150." Plausible. She redesigned RELAY-C in match 150 specifically because of a similar cluster event.

She frowns. She redesigned it 35 matches ago and it's already in a cluster again? That's fast.

**Minute 0:45 — The Match-Source Breakdown**

She notices a new section below root causes: "MATCH-SOURCE BREAKDOWN." She's never paid attention to it before.

```
vs. [NebulaFang]             ██████████████████ 56pp
vs. All others (19 opponents) ████░░░░░░░░░░░░░░ 16pp

⚠ 78% of this cluster's coverage comes from one opponent.
  This may be adversarial targeting rather than a structural flaw.
```

Hana stops. She reads the line again. *78% from one opponent.* She's played 5 matches against NebulaFang and they account for 78% of RELAY-C's cluster coverage? She runs the math in her head: 5 matches out of 40, but 78% of the diagnostic signal.

She hovers over the `[?]` info icon next to "adversarial targeting." The tooltip reads: "When most of a cluster's coverage comes from one opponent, it may indicate that opponent's config is designed to stress specific elements of your agent. Your agent may not be structurally weak — it may be specifically targeted."

The word "designed" hits her. She looks at NebulaFang's match history. She lost 4 of 5. She'd attributed this to her own config problems — RELAY-C's cluster flag seemed to confirm it. But now she wonders: what if NebulaFang isn't better than her? What if NebulaFang has specifically studied her config?

**Minute 1:30 — The Pivot**

She clicks `[View opponent config →]`. The opponent inspector opens, showing NebulaFang's public agent topology. She sees: DISRUPTOR-DELTA with skills tagged "signal-flood" and "relay-overflow-cascade." COMMAND-ECHO with a hook labeled "synchronized-burst-on-relay-detect."

These are not generic skills. They are specifically named for relay-type agents. NebulaFang didn't just get lucky winning those 5 matches — they built a config that targets relays.

Hana's frame shifts entirely. RELAY-C is not broken. NebulaFang is hunting relays.

**Minute 2:30 — The Counter-Play**

She clicks `[Analyze targeting pattern →]`. The targeting analysis runs for 2 seconds. The output:

```
NebulaFang Targeting Analysis — RELAY-C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NebulaFang generates 3 coordinated stresses:
① Signal flood volume: 340 signals/tick vs. RELAY-C's buffer of 80 → overflow 98% of matches
② Multi-source fallback demand: 6 simultaneous fallback triggers vs. depth=2 → saturation 87% of matches
③ Priority injection: COMMAND-ECHO injects high-priority ghost signals to fill queue → depth=3 overwhelmed 79% of matches

Counter-hardening targets (do NOT redesign RELAY-C's entire architecture):
• Buffer size: 80→160 (neutralizes flood volume)
• Fallback depth: 2→4 (absorbs multi-source pressure)
• Queue depth: 3→5 (absorbs ghost signal injection)

⚠ These changes harden against NebulaFang specifically. They will marginally
  reduce RELAY-C's performance in low-signal environments. Consider making
  these changes match-conditional (see 4.XX — Conditional Profiles).
```

Hana reads this carefully. The game is not telling her to redesign RELAY-C. It's telling her *exactly what NebulaFang is doing* and *exactly what to change to neutralize it* — three parameter adjustments, not a full architectural overhaul.

She applies the three targeted changes. She requests a match against NebulaFang.

**Minute 12:00 — Vindication**

She wins 2 of the next 3 matches against NebulaFang. After the third match, she runs a quick career analysis (scoped to "last 10 matches only"). The RELAY-C cluster is gone — the fix addresses the specific targeting strategy without making RELAY-C worse elsewhere.

The next time she faces NebulaFang, she knows: they'll adapt. This is arms race territory now.

**What Hana Found Valuable:**
- The Match-Source Breakdown revealing 78% concentration from one opponent — she never would have checked this without the UI surfacing it
- The naming of the adversarial tactic: "adversarial targeting" gave her language to frame what was happening
- The targeting analysis giving specific counter-hardening targets rather than a redesign recommendation
- The warning that counter-hardening is opponent-specific (marginal performance impact elsewhere)

**UI Annotations:**
- Match-Source Breakdown: bar chart with per-opponent contributions, sorted by contribution descending; the top-contributor bar has a distinct amber outline when concentration exceeds 60%; opponent name shown as username with a shield icon if they have a "known adversarial" designation in the threat model
- Concentration warning: appears below the bar chart as a 1-line highlighted text row (amber background, small font); shows both the percentage and the numerical framing ("78% of coverage — 8pp from NebulaFang vs. 2pp from average opponent")
- `[Analyze targeting pattern →]` button: appears only when adversarial flag is HIGH or MEDIUM; uses a threat-model visual language (orange-red spectrum) rather than the standard amber cluster language

---

### Journey: Ben, 19, Mid-Ladder Casual — Unaware Victim of Poisoning

**Context:** Ben has been playing for 3 months. He's in competitive play but not deeply analyzing his opponents. He's been facing a player called IRON_VEIL repeatedly in the ladder. He's lost 5 of 6 matches to IRON_VEIL and accepted that RELAY-PRIME is a "bad agent."

He just ran his third career analysis of Season 3. RELAY-PRIME has triggered the multi-cluster flag in all three. The persistent offender badge (4.69d) appeared after the second career analysis. He's already entered redesign mode once and spent 40 minutes rebuilding RELAY-PRIME. But in the third career analysis, RELAY-PRIME has clustered again.

**Minute 0:00 — Frustrated at His Own Config**

Ben opens the agent audit for RELAY-PRIME. He sees the cluster members. He sees the persistent offender status (3 cluster events since last redesign — wait, that's wrong, he DID redesign it). He looks more carefully: "3 cluster events since RELAY-PRIME v4.0 (redesigned Match 67)." He just redesigned it at match 67. He's at match 89. 22 matches after the redesign and it's already a "persistent offender" again?

He feels frustrated. He thinks: *I redesigned this wrong. I'll have to do it again.*

**Minute 0:30 — The Breakdown He Almost Missed**

He starts reading the agent audit quickly, looking for the [Redesign RELAY-PRIME →] button. His eye catches the Match-Source Breakdown section.

```
vs. [IRON_VEIL]              ███████████████████ 61pp
vs. All others (14 opponents) ████░░░░░░░░░░░░░░░ 17pp

⚠ 78% of this cluster's coverage comes from one opponent.
  This may be adversarial targeting rather than a structural flaw.
```

Ben reads it slowly. He's never seen this section before. He hovers over `[?]`. He reads the tooltip.

He looks at the opponent name: IRON_VEIL. That's the player he's been losing to repeatedly. He didn't know that was relevant to his career analysis.

He sits back. He thinks: *I redesigned RELAY-PRIME because of IRON_VEIL?*

**Minute 1:00 — Realization Without Vocabulary**

Ben doesn't fully understand adversarial targeting as a competitive concept. He's never thought about opponents deliberately designing configs to trigger his diagnostic system. But he understands the simpler framing: IRON_VEIL beats RELAY-PRIME specifically. If he removes IRON_VEIL's matches from the analysis, RELAY-PRIME might not be a problem.

He doesn't know how to do this through the UI. He clicks `[View opponent config →]` and sees IRON_VEIL's agent topology. He doesn't know how to read it — the skills and hooks are named things he doesn't recognize.

He clicks `[Analyze targeting pattern →]`. The analysis produces the counter-hardening list (as in Hana's journey, tailored to RELAY-PRIME and IRON_VEIL's specific tools).

Ben reads the output. He sees three parameter changes with numbers. This he can do — it's simpler than a full redesign.

He applies the three changes. He queues a match against IRON_VEIL.

**Minute 25:00 — Mixed Results**

He loses the match against IRON_VEIL. He wins the next one. Then loses again. His match record vs. IRON_VEIL shifts from 1/6 to 3/8 — better, but IRON_VEIL has adapted.

But in the next career analysis, the cluster flag does NOT fire for RELAY-PRIME. For the first time in Season 3, RELAY-PRIME is not in the top-5 candidates. The #1 candidate is now STRIKER-KAPPA. Ben applies that fix. This is the first career analysis session where he feels like he's making *real* progress — addressing a different problem rather than spinning on the same agent.

**What Ben Needed:**
- Plain-language explanation of "adversarial targeting" — he needed "IRON_VEIL is specifically designed to beat agents like RELAY-PRIME" not "78% concentration ratio"
- The counter-hardening list was crucial — it let him act without a full redesign, which is what he would have defaulted to
- A one-sentence summary: "Before rebuilding RELAY-PRIME, try these three targeted changes to neutralize IRON_VEIL's strategy"

**What Would Have Lost Ben:**
- If the Match-Source Breakdown only showed as an advanced section (collapsed by default), he might have missed it entirely
- If the adversarial flag spoke in competitive meta-game language he didn't have context for

**UI Annotations:**
- Match-Source Breakdown placement: default **expanded** in agent audit; collapsible but not hidden; the adversarial concentration bar is visually prominent (full-width bar chart, not a small inline indicator)
- Plain-language adversarial flag text (vs. Hana's version): "78% of this cluster was caused by your matches against IRON_VEIL. RELAY-PRIME may be fine against other opponents — IRON_VEIL may be specifically targeting it." (Experience-level-gated language simplification.)
- "Before redesigning" advisory: a new one-line text above the action buttons when adversarial flag is present: "Before redesigning — consider targeted hardening specific to IRON_VEIL." De-emphasizes [Redesign RELAY-PRIME →] and foregrounds [Analyze targeting pattern →].

---

### Journey: Rin, 32, Expert Competitor — Poison Detected, Counter-Poison Deployed

**Context:** Rin has 500 hours. She's in the top 50 of the competitive Gauntlet. She's not only aware of adversarial poisoning as a tactic — she has deployed it herself against opponents. She's currently investigating whether her current opponent, VOLTFORM_7, is attempting a poisoning attack against her.

She's noticed an unusual pattern: SCOUT-ALPHA keeps appearing in her career analyses, but only in the last 3 weeks since she started matching against VOLTFORM_7 in the upper ladder. Before that, SCOUT-ALPHA was one of her most stable agents — it never clustered.

**Minute 0:00 — The Pre-Analysis Check**

Before running career analysis, Rin uses the career analysis scope filter (Option B). She runs *two* career analyses:

1. **Full scope (45 matches):** SCOUT-ALPHA clusters with 3 entries, combined coverage 44%.
2. **Excluding VOLTFORM_7 (38 matches):** SCOUT-ALPHA — zero cluster entries. Not in top 10 candidates at all.

The difference is stark. When she removes VOLTFORM_7's 7 matches from the 45-match window, SCOUT-ALPHA disappears entirely from the diagnostic. The cluster is 100% caused by VOLTFORM_7.

**Minute 1:00 — The Reverse Analysis**

Rin opens VOLTFORM_7's opponent config. She examines it carefully. She's experienced enough to read the hook topology. She sees the pattern: VOLTFORM_7 runs a GHOST_RELAY agent with three staggered signal injection skills, all timed to create simultaneous pressure on the exact dimensions SCOUT-ALPHA is most sensitive to.

She recognizes the signature: this is not a general-purpose config. VOLTFORM_7 has specifically analyzed her SCOUT-ALPHA from their previous matches and built a counter-agent designed to generate a SCOUT-ALPHA cluster signature.

**The admiration moment:** Rin feels a flash of respect. This is a high-level play. VOLTFORM_7 didn't just build a better config — they built a *meta-game trap*. They expected her to see the cluster flag and redesign SCOUT-ALPHA, creating instability in one of her most reliable agents.

**Minute 2:00 — The Counter-Poison Decision**

Rin faces three options:

1. **Neutralize the targeting:** Apply targeted hardening to SCOUT-ALPHA to make it immune to VOLTFORM_7's specific stresses. This removes the poisoning attack's effectiveness without redesigning.

2. **Ignore the poisoning:** Keep SCOUT-ALPHA exactly as is, accept some losses against VOLTFORM_7, and focus career analysis on real structural problems. This calls the bluff — VOLTFORM_7's poisoning config might not actually WIN matches, it might just generate misleading diagnostics.

3. **Counter-poison VOLTFORM_7:** Study what agent in VOLTFORM_7's roster is most likely targeted-as-reliable, and design a config that stresses it in a similar way. Turn the meta-game trap back on the attacker.

Rin chooses option 2. She checks VOLTFORM_7's actual win rate against her: 3/5. They're *barely* beating her with the poisoning config. The poisoning attack is primarily diagnostic, not mechanical. If she ignores the cluster flag for SCOUT-ALPHA and keeps optimizing for the actual structural issues in her config (STRIKER-OMEGA's hook timing, RELAY-GAMMA's buffer sizing), she'll improve faster than VOLTFORM_7 expects.

**Minute 5:00 — Flagging for Future Analysis**

Rin adds VOLTFORM_7 to her "known adversarial opponents" list in the threat model report. In future career analyses, VOLTFORM_7's matches are *automatically annotated* as potentially adversarial — their contribution to any cluster flag is shown in a distinct color (orange rather than amber) and weighted differently in the structural vs. adversarial root cause ranking.

She also sets a per-opponent threshold override (4.69j) for VOLTFORM_7: "Do not fire cluster flag from matches against VOLTFORM_7 unless concentration drops below 50%." This prevents future poisoning events from surfacing as false cluster flags.

**Minute 12:00 — The Outcome**

Rin faces VOLTFORM_7 four more times. She wins 3 of 4. The poisoning strategy is ineffective against a player who recognized it. VOLTFORM_7 adapts: their config shifts away from the SCOUT-ALPHA targeting and toward a more general attacking strategy. Rin runs career analysis with VOLTFORM_7 excluded. She sees SCOUT-ALPHA is still not in the top-10 candidates. Her config is structurally sound.

The career analysis with VOLTFORM_7 included now shows SCOUT-ALPHA at position #4, no cluster. The targeted hardening VOLTFORM_7 was provoking a cluster is no longer triggering because VOLTFORM_7 adapted away from the triple-stress approach.

**What Rin Used:**
- Scope filter (exclude opponent) to isolate the poisoning signal immediately
- Opponent config inspection to confirm the intentional targeting pattern
- Per-opponent threshold override to suppress future false flags
- Threat model integration to annotate VOLTFORM_7 as adversarially-relevant for all future analyses

**What Rin Represents as a Player Archetype:**
Rin is the player who has internalized the full meta-game. She uses the diagnostic system not just as a self-diagnostic tool but as an opponent intelligence layer. She understands that career analysis is a *model of her config's performance* — and that models can be poisoned. This is the highest-level expression of the game's core teaching: managing information systems means managing the quality of your information, including attacks on that quality.

**UI Annotations:**
- Known adversarial opponent flag: a shield icon with a crack (adversarial designation) next to the opponent name in the match-source breakdown; clicking the icon opens the opponent intelligence card
- Per-opponent threshold override in match-source breakdown: a subtle gear icon [⚙] to the right of each opponent row in the breakdown; clicking opens inline threshold override control; "Suppress cluster contributions from this opponent unless concentration ≥ [X%]"
- Adversarial annotation color scheme: VOLTFORM_7's bar in the match-source breakdown is orange (not amber); the flag text uses "adversarial targeting (confirmed)" language rather than "may be adversarial targeting"; confidence level is surfaced as a label on the concentration warning

---

## Strengths and Weaknesses

**Strengths:**
- Introduces a genuine meta-game dimension that rewards deep system knowledge — understanding both how career analysis works AND how opponents can exploit it
- Creates the adversarial targeting dynamic as a first-class competitive strategy, adding depth to PvP that pure mechanical builds cannot achieve
- The disambiguation counter-design teaches information hygiene as a game skill: "where does your data come from, and does the source have an incentive to distort it?" — directly transferable to real-world data analysis
- Multiple response options (neutralize/ignore/counter-poison) create interesting strategic decisions that don't have a single right answer
- The player who learns to detect poisoning becomes a harder target, which itself creates positive selection pressure in the competitive ecosystem

**Weaknesses:**
- Requires PvP mode to be meaningful — the adversarial poisoning mechanic is irrelevant in PvE play; the UI elements become dead weight for players who never engage competitively
- The concentration ratio threshold is a fragile heuristic: in small competitive ecosystems (fewer opponents), natural concentration from repeated matchups can look like adversarial targeting; high match counts against frequent opponents (good rivals) may be misidentified
- Adding "adversarial targeting" as a root cause hypothesis may create paranoia in players who see it fire on legitimate structural problems: "is my real cluster being dismissed because the game thinks it's adversarial?"
- The counter-poisoning path (Rin's option 3) could create toxic competitive dynamics — a race to design configs that maximize diagnostic damage rather than win rate
- Requires significant opponent intelligence data to be reliable — thin data (< 5 matches vs. an opponent) will produce noisy concentration numbers that may mislead the disambiguation logic

---

## Interaction Effects

### With 4.57 — Threat Model Report

The threat model report (which analyzes which opponents pose which strategic threats) becomes the natural home for adversarial targeting intelligence. An opponent who has generated a poisoning event should appear in the threat model with a specific adversarial profile: their known targeting strategies, which of the player's agents they focus on, their historical poisoning success rate. The threat model and career analysis become two layers of the same intelligence system: threat model tells you *who* is dangerous, career analysis tells you *what damage they've done to your diagnostic environment*.

### With 4.49 — Cross-Mission Pattern Detection

Cross-mission pattern detection looks across match types (Ambush, Escort, Control). Adversarial poisoning attacks typically concentrate stress on one agent across ALL match types — the opponent builds a config that targets RELAY-C in every scenario type to maximize career analysis coverage. This creates a distinctive cross-mission signature: the same agent failing across ALL mission types, but only against one opponent.

If cross-mission detection flags RELAY-C as "failing across all mission types" AND the match-source breakdown shows 70%+ concentration from one opponent, the combined signal is very strong: "RELAY-C appears to fail universally, but only against this opponent — almost certainly adversarial targeting, not universal structural weakness." The combined signal should elevate the adversarial confidence from MEDIUM to HIGH.

### With 4.69d — Multi-Cluster Persistence Tracking

The persistence tracking system (4.69d) is particularly vulnerable to patient poisoning attacks. An opponent who appears repeatedly in the competitive ladder can drive the persistent offender badge by generating a cluster in every career analysis window. The Persistent Offender Fabrication attack (described above) is explicitly enabled by persistence tracking's reliance on historical career analysis events.

**Counter-design:** Persistence tracking should track the *match-source breakdown* of each cluster event, not just the event occurrence. If all 3 persistent cluster events have 70%+ concentration from the same opponent, the persistence tracking system should annotate the persistent offender badge with "adversarial origin suspected" — adjusting the escalating urgency language accordingly.

### With 4.69a — Multi-Cluster Threshold Configurability

In competitive play, the optimal threshold configuration changes based on the adversarial environment. A player facing many poisoning opponents should use *higher* thresholds (N=4 or N=5) to suppress the false positives generated by adversarial targeting — the poisoning attacks often generate clusters at exactly the N=3 threshold (targeting precisely 3 elements, not 2 or 4). A player in a trustworthy opponent pool can use lower thresholds safely.

This creates a metagame-aware threshold calibration problem: the right threshold is not just a function of config complexity but also a function of the competitive environment's adversarial density. The adaptive auto-calibration system (Axis 4 of 4.69a) should factor in adversarial poisoning detection frequency as an input.

### With 4.72 — Debt-Free Season Achievement

The debt-free season achievement (no single element responsible for >20% of losses) is vulnerable to poisoning: an opponent can deliberately engineer match results where one of the player's elements is the marginal failure point in 30%+ of matches, blocking the achievement. This is a more direct form of adversarial interference than the cluster flag — it attacks the achievement condition directly rather than the diagnostic tool.

Counter-design: the debt-free check should be computable scoped to "all opponents excluding flagged adversarial opponents," allowing the player to evaluate whether they'd be debt-free if not for specific targeted attacks. This preserves the achievement's integrity for players who face adversarial opponents.

### With Multiplayer/Competitive Design (Long-Range)

The existence of adversarial poisoning as a documented mechanic opens up a rich competitive meta-game design space:
- **Specialist roles:** Some players specialize in building poisoning configs rather than win-rate configs; they occupy a "disruptor" archetype in the competitive ecosystem
- **Counter-intelligence rankings:** Leaderboards that track not just win rate but "adversarial poisoning score" (how many opponents have cluster flags attributable to your config) and "adversarial resistance score" (how rarely your own cluster flags are adversarially sourced)
- **Patch response dynamics:** If a common poisoning strategy is identified, the dev team can adjust the match-source breakdown threshold or cross-mission attribution logic to reduce its effectiveness without changing the underlying mechanic
- **Community disclosure:** Players sharing known poisoning configs in community forums ("this is VOLTFORM_7's GHOST_RELAY targeting template — here's how to counter-harden")

---

## Comparable Games / Media

### Poker — Information Warfare and Table Image Management

Adversarial multi-cluster poisoning is structurally identical to bluffing in poker at the meta-game level. A skilled poker player does not just play their cards — they manage their *opponent's model of them*. Showing down bluffs, making calculated losing plays to build a false table image, placing bets that generate misleading inference. Robot Uprising's poisoning mechanic is this: the opponent is not just playing to win matches, they're playing to manipulate the player's self-diagnostic model.

The counter-detection is equivalent to "range awareness" — a skilled poker player doesn't react to single hands but models the distribution of opponent behaviors. The match-source breakdown is range awareness: not "this cluster happened" but "where does the cluster signal come from, and does that source have an adversarial incentive?"

### Starcraft II — Proxy Strategies as Diagnostic Misdirection

In StarCraft II, players use proxy buildings (constructing supply depots or barracks in unusual locations) partly to mislead scouting. A proxy barracks near the opponent's base might suggest an early rush — the opponent may over-invest in early defenses at the cost of their main build. The proxy is not always the real attack; sometimes it's a *map of the enemy's attention* that makes the real attack work.

Poisoning config design works the same way: the poisoning config is not necessarily the opponent's strongest build. It's a tool for shaping the player's attention — "look at RELAY-C, not STRIKER-OMEGA" — so that the real attack (when the opponent switches to a STRIKER-OMEGA targeting build) finds the player unprepared.

### Magic: The Gathering — Sideboard as Counter-Information Layer

In competitive MTG, the sideboard is a 15-card reserve that players swap in between games of a best-of-3 match. Sideboard strategy involves reading what the opponent's deck told you about their strategy in game 1, then adjusting in ways the opponent doesn't expect. Advanced sideboard play includes "bringing in cards that look like they counter the opponent's deck but actually counter their sideboard adjustments" — a second-order information game.

Robot Uprising's adversarial poisoning is the career-analysis equivalent of sideboard strategy: the poisoning opponent designs their "game 1" config to generate specific diagnostic data about the player's config, then adjusts for "game 2+" based on how the player responded. The match-source breakdown is the player's tool for recognizing that "game 1" was an intelligence-gathering exercise.

### Gladiabots — Direct Analog (Without Poisoning)

Gladiabots is the closest direct analog: players program robots with behavior trees and fight them in auto-combat arenas. The post-match analysis shows which nodes in the behavior tree were active during failures. There is no adversarial diagnostic poisoning in Gladiabots because there is no career analysis layer — but the design space exists. A Gladiabots player who builds a config specifically designed to activate the opponent's failure nodes rather than win outright would be performing the same attack.

### Software Security — Adversarial Machine Learning / Data Poisoning

The mechanism is identical to adversarial machine learning attacks: an attacker manipulates the training data (in this case, the match results that career analysis uses) to cause the model (career analysis) to produce incorrect outputs (false cluster flags). Data poisoning in ML is an active research area precisely because "the model learns from data you can influence" is a fundamental vulnerability.

The counter-design (match-source breakdown, adversarial concentration detection) is analogous to robust statistics techniques in ML: rather than treating all data points equally, weight data by source credibility and detect anomalous source distributions.

---

## Sensory Description

**What the concentration warning looks like:**

The match-source breakdown bar chart appears below the POSSIBLE ROOT CAUSES section in the agent audit panel. Each opponent who contributed to the cluster is a horizontal bar, the width representing their coverage contribution. The top contributor's bar — in the adversarial poisoning case, the poisoning opponent — is noticeably wider than all others, pressing against the right edge of the chart area. If concentration exceeds 60%, the bar for that opponent shifts color: from standard amber (cluster color) to a deeper warning orange. A small target reticle icon (⊕) appears at the right end of their bar — the game's visual shorthand for "this opponent is targeting you."

The concentration warning text is rendered in a separated box below the chart, with a thin orange border (vs. the standard amber for cluster members). It reads in two lines: "78% of this cluster's coverage comes from one opponent." / "This may be adversarial targeting, not a structural flaw." The word "adversarial" is rendered in slightly heavier font — not bold, but weighted enough to stand out on a scan.

**What the targeting analysis looks like:**

The `[Analyze targeting pattern →]` button uses the same visual language as the threat model report: a shield icon with an inward-pointing arrow. Clicking it triggers a 1.5-second analysis animation — the opponent's config topology briefly appears as a ghostly overlay on the agent audit panel, with highlighted connections showing which of their agents are targeting which of the player's agent's elements. The connections pulse once in orange, then resolve into the output text panel.

The output uses a different typographic treatment from normal root-cause hypotheses: a header "TARGETING ANALYSIS — [OPPONENT NAME]", followed by numbered stress vectors (each with a small red arrow icon), followed by "COUNTER-HARDENING TARGETS" with green shield icons on each item. The visual language distinguishes "what they're doing to you" (red, threat) from "what you can do about it" (green, defense).

**What it sounds like:**

When the adversarial concentration warning appears, the standard cluster banner sound (a soft two-tone minor third chime) is replaced by a slightly different variation — the same two notes, but with an added dissonant third tone that creates a chord with mild tension, implying that something is not quite right. The tension tone fades quickly (800ms decay) — the feeling is not alarm, but "pay attention here." In the targeting analysis result, each stress vector is accompanied by a soft descending tone as it appears, creating a cascade of falling notes that reads as "these attacks are landing on you." The counter-hardening items appear with short ascending tones — the counter-narrative.

---

## The TikTok Clip

A player runs career analysis. The cluster flag fires on RELAY-C — 3 of 5 candidates. Standard stuff. They click [View Agent Audit]. Then they scroll down. They see the bar chart. One opponent's bar is almost the full width. They read "78% of this cluster." They say out loud: "Wait — that's all from one guy?" They click [Analyze targeting pattern →]. The ghostly overlay appears showing the opponent's config targeting lines. They read the stress vectors. They say: "They designed their entire config to mess with MY diagnostic system?" The chat erupts. Title: "Someone has been sabotaging my career analysis for 3 weeks and I never noticed." This clip transmits the metagame depth: the game is not just strategy, it's information warfare.

---

## Newly Discovered Aspects

- **4.69e-i — Match-scope filter UI design:** Full design of the career analysis scope filter — how the player selects opponents to include/exclude, what the UI looks like, how filtered analyses are labeled and archived vs. full-scope analyses; interaction with career analysis history log.

- **4.69e-ii — Known adversarial opponent tagging:** UI for adding an opponent to the "known adversarial" list from within the career analysis agent audit; how the tag persists across sessions; what changes in career analysis behavior when an opponent is tagged (automatic annotation, separate tracking); how to remove a tag.

- **4.69e-iii — Per-opponent threshold override in competitive contexts:** (See 4.69j — Per-agent threshold override for the per-agent version.) The per-opponent version: suppressing cluster contributions from specific opponents below a concentration threshold; interaction with match-source breakdown display.

- **4.69e-iv — Counter-poisoning config design:** full design of the player's ability to intentionally design a config that generates misleading cluster signals in an opponent's career analysis; this is the offensive version of the mechanic; ethical/design considerations around including explicit "diagnostic sabotage" as a player intent.

- **4.69e-v — Adversarial density as a career season metric:** tracking how many of the player's matches in a given season were adversarially targeted (matched against confirmed poisoning configs); "adversarial pressure" as a context variable in season health; adjusting season health thresholds for high-adversarial-pressure seasons.

- **4.69e-vi — Concentration threshold calibration for dense opponent pools:** the problem of false adversarial detection in small competitive ladders where players naturally match against the same opponents repeatedly; graduated concentration thresholds based on opponent pool size; "expected concentration at N matches" as a contextual denominator.

- **4.69m — Match-set scope label on combined coverage:** (Note: This aspect was already discovered and added to the frontier in 4.69m. Cross-reference confirmed — the adversarial poisoning exploration independently validates this gap in the existing design.)
