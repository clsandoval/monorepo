# 4.101 — The Dutiful Ghost: Honest Decoy Poisoning

**Aspect:** 4.101 — The "honest decoy" variant of pre-ranking poisoning: the canary is also a genuine strategic element — it serves a real purpose AND scores high on pre-ranking signals; attacking it produces real (if marginal) improvement, satisfying the attacker; the real vulnerability remains hidden; the highest form of poisoning because the deception is indistinguishable from genuine architecture; the attacker who achieves this doesn't lose anything from the canary being attacked

**Parent:** 4.65 — Pre-ranking adversarial surface (pre-ranking poisoning); 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.66 — Signal genealogy as pre-ranking source; 4.67 — Probe hook suggestion from transparency panel; 4.63 — Player-configurable pre-ranking weights; 4.69 — Agent multi-cluster detection
**Related:** 4.39 — Adversarial counterfactual mode; 4.60 — Search budget as resource; 4.58 — Pre-ranking transparency panel; 4.59 — Career minimum fix; 4.57 — Threat model report; 5.14e — Fidelity spoofing campaign arc; 7.10 — Necropsy culture; 2.12 — Deception signals; 4.15 — Probe hooks; 4.55 — Career adversarial analysis

---

## The Core Concept

In aspect 4.65, we established the foundations of pre-ranking poisoning: engineering a decoy element — a canary — that scores high on pivot-tick activity, recency, and volatility to mislead an opponent's adversarial diagnostic. The canary absorbs the diagnostic attention. The real vulnerability hides behind low scores. The opponent wastes compute budget and design iterations chasing the wrong element.

That original poisoning model has a structural weakness: the canary is a parasite. It consumes config complexity — rules, hooks, buffer slots — to produce signals that *look* important but *are not*. Every rule spent on a dedicated decoy is a rule that cannot strengthen the actual strategic architecture. The canary is dead weight that the attacker carries for the sole purpose of misdirection. A sophisticated defender who runs THOROUGH mode and sorts by attack decisiveness (not rank score) will find that the canary's "minimum fix" produces a marginal outcome change compared to the real vulnerability's fix. The decisiveness gap between the canary and the real vulnerability is the fingerprint of a hollow decoy. The canary is a liar, and the lie has a shape.

The **Dutiful Ghost** is the elimination of that fingerprint.

An honest decoy is a config element that serves a genuine strategic purpose, contributes real value to the architecture, and *happens* to score high on all three pre-ranking signals because its genuine function requires high activity, frequent modification, and complex state transitions. Attacking the honest decoy produces real improvement — a measurable, non-trivial gain for the attacker. The THOROUGH mode minimum fix points at the honest decoy and the fix *works*. The decisiveness ranking places the honest decoy at or near the top because the honest decoy is a real vulnerability. It is just not the *deepest* vulnerability.

The distinction is the difference between a locked front door and a locked front door with a guard dog. The classic canary is a cardboard cutout of a guard dog — it fools someone glancing through the window, but anyone who walks up and pushes it over discovers the deception. The Dutiful Ghost is a real guard dog. It bites. Defeating it is a genuine accomplishment. The attacker who defeats the guard dog feels they have breached the perimeter. They do not realize the house has a second perimeter they have not yet seen.

### Why This Is the Highest Form

Three properties make the Dutiful Ghost the pinnacle of pre-ranking poisoning:

**1. Zero config waste.** The element is doing real work. It is not a decoy allocated from the config budget — it is a productive member of the architecture that has been *positioned* so that its productive work generates high diagnostic signals. The attacker pays nothing for the misdirection. Every rule on the Dutiful Ghost earns its keep.

**2. Unfalsifiable under single-element analysis.** When the opponent runs THOROUGH mode and finds that the honest decoy's fix produces a real outcome improvement, every diagnostic tool confirms: "This is a real vulnerability." The decisiveness ranking is high. The coverage contribution is real. The career analysis shows the honest decoy as a recurring fix candidate across multiple matches, because it *is* a recurring fix candidate — it genuinely fails under pressure. The attacker cannot distinguish a Dutiful Ghost from a standard architectural weakness because there is no structural difference. The Ghost *is* a weakness. It is simply not the most important one.

**3. The attacker is satisfied.** This is the psychological keystone. A classic canary eventually frustrates the attacker — they design three counters to the canary, none work, they begin to suspect poisoning (as Marcus discovered in 4.65). But a counter to the Dutiful Ghost *does* work. The attacker patches the honest decoy, their win rate against the poisoner improves by 3-5%, and they feel progress. They have no reason to dig deeper. The improvement is not a phantom — it is real. The attacker stops looking because the diagnostic loop closed: identify weakness, design counter, observe improvement. There is no "bewildering loss" moment. There is only a quiet plateau where the attacker's win rate stabilizes at 48% instead of 45%, and they attribute the remaining gap to skill differential rather than a hidden second vulnerability.

### The Design Philosophy

The Dutiful Ghost teaches a lesson that extends far beyond the game: **the most dangerous deception is the one that contains truth**. A lie wrapped in truth is harder to detect than a pure lie, because every verification step returns "correct." The attacker's diagnostic tools are not malfunctioning. The pre-ranking is not wrong. The THOROUGH analysis is not deceived. Every system is reporting the truth — the honest decoy is a real vulnerability. The deception is not in what the tools say, but in what the attacker *stops asking* once they hear the first true answer.

This maps to real-world security: the most sophisticated honeypots are production servers running real services with real (but non-critical) data. The penetration tester who compromises the honeypot finds real credentials, real databases, real network traffic. Everything checks out. The only thing missing is the critical asset — which lives somewhere the tester never reaches, because they already found what they were looking for.

In machine learning adversarial robustness: the most effective adversarial examples are not random noise that fools the classifier — they are examples that are *almost correct*, belonging to a plausible adjacent class, so that the misclassification seems natural rather than adversarial.

In competitive game design: the Dutiful Ghost is the equivalent of a chess player who offers a genuine sacrifice — a real piece with real board value — to draw the opponent's attention and tempo, while the actual mating combination develops on the opposite flank. The sacrifice is not a bluff. The opponent who takes it gains material. But the initiative has shifted.

---

## The Construction: How to Build a Dutiful Ghost

The technical challenge is positioning a genuinely useful element so that its natural function coincides with high pre-ranking signals. This is harder than building a hollow canary, because the element must satisfy two orthogonal criteria simultaneously: strategic utility and diagnostic conspicuousness.

### The Ideal Candidate: The Expendable Relay

The most natural Dutiful Ghost is a **secondary relay** that handles a real but non-critical signal path. Consider an architecture with two striker chains:

- **Primary chain**: SCOUT-A -> RELAY-CORE -> STRIKER-MAIN. This is the kill chain. RELAY-CORE operates in the pre-pivot window, routes the decisive signal, and is the real vulnerability. It has 2 rules, was configured once (12 sessions ago), produces 3 states per match, and is active at ticks 15-22 (before the typical pivot at tick 45-55). Pre-ranking score: ~0.06.

- **Secondary chain**: SCOUT-B -> RELAY-VIGIL -> STRIKER-FLANK. This is the flanking chain. It handles targets of opportunity, cleanup after the primary strike succeeds, and adaptations when the primary chain's signal degrades. RELAY-VIGIL is the Dutiful Ghost.

RELAY-VIGIL's natural function requires:
- **High pivot-tick activity**: The flanking chain activates *after* the primary chain's outcome is determined — precisely at the pivot tick, when the match outcome crystallizes and the flanking striker must decide whether to pursue, reposition, or consolidate. RELAY-VIGIL is genuinely busy at the pivot tick because that is when its job begins.
- **High volatility**: The flanking chain handles diverse signal conditions — enemy retreats, friendly losses, terrain changes, target priority shifts. RELAY-VIGIL's rules must handle all of these cases, producing many distinct states per match. 15-20 distinct states is natural for a well-designed flanking relay.
- **High recency**: The flanking chain is the part of the architecture the player adjusts most frequently, because it handles edge cases and adaptation. Each new opponent in the Gauntlet season reveals a new flanking scenario. The player tunes RELAY-VIGIL before each match. This is genuine optimization, not artificial recency inflation.

The result: RELAY-VIGIL scores 0.85+ on pre-ranking because its legitimate function produces exactly the signals the pre-ranking values. Attacking RELAY-VIGIL produces real improvement — the flanking chain handles 15-20% of the architecture's effectiveness, so countering it yields measurable gains. But the primary chain (RELAY-CORE) remains intact, and the attacker who neutralizes flanking does not realize the primary kill chain is the deeper threat.

### The Cost Structure

The Dutiful Ghost has no direct config cost — the element would exist regardless of the poisoning intent. The only cost is the *positioning constraint*: the architect must design the architecture so that the secondary chain's natural function produces high diagnostic signals, and the primary chain's function produces low diagnostic signals. This constrains the primary chain's design:

- RELAY-CORE must be simple (few rules, low volatility)
- RELAY-CORE must operate in the pre-pivot window (low pivot-tick activity)
- RELAY-CORE must be stable across sessions (low recency)

These constraints are non-trivial. A primary kill chain that only works with 2 rules and no recent modifications is harder to optimize than one with 8 rules and frequent tuning. The Dutiful Ghost architect accepts a ceiling on primary chain complexity in exchange for permanent diagnostic camouflage.

### The Emergent Property: Unintentional Ghosts

The most interesting design implication: many architectures contain unintentional Dutiful Ghosts. Any config where the most actively maintained, highest-volatility element is *not* the element responsible for the match outcome contains a natural honest decoy. The player who builds a complex flanking relay and a simple kill chain has inadvertently created a Ghost. They may not realize it until an opponent's adversarial analysis consistently targets the flanking relay while the kill chain goes undetected.

This means the game can surface the concept organically: a player who notices that opponents never counter their kill chain — despite consistently losing to it — may realize that their flanking relay is absorbing diagnostic attention. The discovery of the Dutiful Ghost is not "I built a decoy" but "I realized my architecture naturally misleads diagnostics." The insight is architectural, not adversarial. The adversarial application follows.

---

## Player Journeys

---

#### Journey: Reina, 31, Systems Engineer, Gauntlet Season 6 — "The Architect's Epiphany"

**Context:** Reina is 200+ hours into Robot Uprising, ranked 12th on the Manila Ladder. She has been running the same core architecture for three seasons with incremental refinements. Her primary kill chain is a tight two-element relay-striker pair (RELAY-ORIGIN -> STRIKER-APEX) that has never appeared in any opponent's adversarial analysis results, as far as she can tell from match outcomes. Her flanking relay (RELAY-MONSOON) is a sprawling 11-rule element that she tunes every session. She has never thought of RELAY-MONSOON as a decoy. She is about to.

**Minute 0:00 — The Pattern Recognition**

Season 6, Match 3 debrief. Reina opens the Career Adversarial Analysis for the season. She has a habit of checking the **"Fix Candidate Frequency" histogram** — which elements opponents are most likely countering based on their post-match config changes. The histogram shows:

```
RELAY-MONSOON  ████████████████████ 14 matches
STRIKER-FLANK  ██████              4 matches
SCOUT-DRIFT    ███                 2 matches
RELAY-ORIGIN   ░                   0 matches
STRIKER-APEX   ░                   0 matches
```

Fourteen matches. Every opponent who ran adversarial analysis against her config landed on RELAY-MONSOON. Zero landed on RELAY-ORIGIN or STRIKER-APEX.

She has seen this histogram before. She has never *thought* about it before. Today, for the first time, the zero next to RELAY-ORIGIN registers as significant.

She opens her session notes and types: *"RELAY-ORIGIN has never been targeted. Not once. Three seasons. Is it invisible?"*

**Minute 1:30 — The Self-Diagnostic**

She runs adversarial counterfactual mode on her *own* config — something she has not done in months, because she knows her architecture well. She runs QUICK mode against her Season 6 Match 2 result.

Result: *"FIRST VIABLE FIX: Your RELAY-MONSOON — hook threshold: 0.6 -> 0.4. This would improve signal propagation timing for flanking targets by 3 ticks, increasing flank strike success from 61% to 74%."*

RELAY-MONSOON. Even the diagnostic she runs on herself surfaces MONSOON, not ORIGIN. She opens the transparency drawer:

```
RELAY-MONSOON: pivot-activity 0.91, recency 0.88, volatility 0.84
  Score: 0.88 — Rank 1 of 14 elements

RELAY-ORIGIN:  pivot-activity 0.11, recency 0.02, volatility 0.09
  Score: 0.07 — Rank 13 of 14 elements
```

The gap is enormous. MONSOON is the loudest element in her config. ORIGIN is nearly silent. And ORIGIN is the element that wins her matches.

She stares at this for a long time.

**Minute 3:00 — The Realization**

She pulls up the THOROUGH mode result and sorts by attack decisiveness. RELAY-MONSOON is rank 1. Its fix produces a real 13% improvement in flanking effectiveness. It is a genuine vulnerability.

But she scrolls down. RELAY-ORIGIN is rank 11 by decisiveness. Its fix: *"RELAY-ORIGIN — buffer priority: signal age -> signal fidelity. This would redirect the primary kill chain to favor high-fidelity signals over recent signals, improving primary strike timing by 1.8 ticks."*

She calculates. The primary kill chain fires in 78% of her wins. A 1.8-tick timing improvement on the primary chain is worth approximately 6% win rate against competent opponents. The flanking improvement from fixing MONSOON is worth approximately 2% win rate (flanking only activates in 22% of wins, and the 13% improvement applies only to that subset).

RELAY-ORIGIN's fix is three times more valuable than RELAY-MONSOON's. But RELAY-ORIGIN is ranked 13th by pre-ranking and 11th by decisiveness. No automated analysis would surface it first.

She writes: *"RELAY-MONSOON is a Dutiful Ghost. I didn't build it as a decoy. It's a real element doing real work. But its natural function generates exactly the diagnostic signals that attract attention, and RELAY-ORIGIN's natural function generates none. My architecture has been self-camouflaging for three seasons and I didn't know."*

**Minute 5:00 — The Deliberate Refinement**

Reina decides not to fix RELAY-ORIGIN. Instead, she examines whether she can deepen the effect deliberately. She checks: what if she moves one of RELAY-ORIGIN's two rules to a pre-pivot-window trigger, reducing its already low pivot-activity score? She simulates. RELAY-ORIGIN now fires at tick 14-18 exclusively, well before the typical pivot window at tick 45-55. Its pivot-activity score drops from 0.11 to 0.03. The architectural effect is negligible — the kill chain signal still arrives at STRIKER-APEX in time.

She adds a third rule to RELAY-MONSOON: a conditional that handles a rare edge case she has been meaning to address anyway. The new rule increases MONSOON's volatility by 2 states per match. Real work. Real improvement. And it widens the diagnostic gap between MONSOON and ORIGIN.

She writes: *"The Dutiful Ghost was accidental. I'm now maintaining it deliberately. The key insight: I'm not adding fake work. I'm arranging real work so that the noisy part is visible and the quiet part is hidden. There is nothing to detect because there is no deception — only architecture."*

**UI Annotations:**
- **Fix Candidate Frequency histogram**: Career Analysis panel, "Opponent Response" tab. Horizontal bar chart. Each bar represents an element, length proportional to the number of matches where opponents' post-match changes targeted that element (inferred from config diffs). Elements with zero targeting are shown as a thin grey line — present but trivially small. No special highlighting for the zero-count elements — the player must notice the absence herself.
- **Self-diagnostic adversarial mode**: Same interface as opponent adversarial analysis, but the player selects "Analyze: My Config" from the target dropdown. The result format is identical. No visual distinction between self-analysis and opponent-analysis — the same tools, the same transparency drawer, the same pre-ranking.
- **Decisiveness sort**: THOROUGH mode result list, sort dropdown. "Attack decisiveness" sorts by the magnitude of outcome change the fix produces, not by pre-ranking score. A small delta-arrow icon next to each candidate shows the win-probability shift. RELAY-MONSOON shows "+2.1pp" in amber; RELAY-ORIGIN shows "+6.4pp" in amber. The numbers are visible but the player must actively sort to see them.

---

#### Journey: Dante, 26, Competitive Streamer, Season 7 — "The Wall He Cannot Climb"

**Context:** Dante streams his Gauntlet matches on Twitch. He is ranked 22nd, climbing aggressively. He has lost 5 of his last 7 matches against a player called "quietwater" (rank 8). His stream audience has been following the rivalry. Dante runs adversarial analysis religiously after every loss. He has built counters. They work — his win rate against quietwater improved from 15% to 35% after targeting their most prominent element. But 35% is not enough. He cannot break through.

**Minute 0:00 — The Plateau**

Post-match debrief, Loss #6 to quietwater. EDT 0.71 — a close loss. Dante opens adversarial QUICK mode on stream. His chat knows the drill.

```
FIRST VIABLE FIX: quietwater's RELAY-TIDECALLER
  hook response time: 3 ticks -> 2 ticks
  Impact: Your striker receives flanking signal 1 tick earlier,
  enabling engagement at tick 48 instead of tick 49.
  Estimated outcome shift: +4.2pp
```

RELAY-TIDECALLER. Again. Dante has seen this element in every adversarial analysis for seven matches. His chat types: `TIDECALLER DIFF` and `JUST COUNTER IT 4HEAD`.

Dante has already countered TIDECALLER. His v7.3 config includes a hook filter that specifically rejects TIDECALLER-originated signals with fidelity below 0.6, a timing buffer that delays action on TIDECALLER-adjacent signals by 1 tick (to account for TIDECALLER's high-speed relay), and a flanking rule that deprioritizes targets flagged by TIDECALLER's scout chain.

These counters work. Before v7.1 (pre-counter), his win rate against quietwater was 15%. After v7.3, it's 35%. A 20-point improvement. Real. Measurable. The problem is that 35% is not 50%.

**Minute 1:30 — The Budget Decision**

Dante runs THOROUGH mode. 53-second computation. He watches the progress bar on stream while his chat speculates.

```
MINIMUM FIX: quietwater's RELAY-TIDECALLER
  buffer compression: lossy -> lossless
  Impact: Eliminates fidelity degradation in flanking signal path.
  Estimated outcome shift: +5.1pp
```

THOROUGH confirms QUICK. TIDECALLER is the minimum fix. The outcome shift is real — 5.1 percentage points. Not phantom. Not a hollow canary. This is a genuine vulnerability in quietwater's architecture. Every diagnostic tool agrees.

Dante opens the decisiveness sort. TIDECALLER is rank 1 by decisiveness. Rank 2 is a scout element with +2.8pp. Rank 3 is a rule priority with +1.9pp. Everything after rank 1 is small.

He says on stream: "TIDECALLER is definitely the weakness. Every tool says so. My counters are working — I went from 15 to 35. But I'm stuck at 35. There has to be something else."

Chat: `MAYBE YOURE JUST WORSE LMAO`

**Minute 3:00 — The Multi-Match Audit**

Dante opens Career Adversarial Analysis, filtered to quietwater only (using the opponent filter from 4.59). Seven matches. He checks the **pre-ranking accuracy stat** (from 4.64):

```
Pre-ranking accuracy vs. quietwater: 86%
  (QUICK and THOROUGH agree in 6 of 7 matches)
```

86% accuracy. High. The pre-ranking is not being fooled — QUICK and THOROUGH agree almost every time. This is *not* the classic canary pattern from Marcus's journey (4.65), where QUICK and THOROUGH diverge and the pre-ranking accuracy drops below 40%. Dante's diagnostic tools are not being deceived. They are reporting accurately. TIDECALLER is the real vulnerability.

He says: "86% pre-ranking accuracy. This isn't poisoning. TIDECALLER is real. So why can't I break 35%?"

**Minute 4:30 — The Question He Does Not Ask**

Dante closes the debrief and queues his next match. He designs v7.4, which further optimizes his TIDECALLER counter. He does not ask the question that would unlock the next level: "If TIDECALLER is a real vulnerability worth +5pp, and I've already countered it for +20pp of improvement, why is there still a +5pp fix available? Am I countering TIDECALLER or am I running on a treadmill?"

The answer — which Dante will not discover for another three sessions — is that quietwater rebuilds RELAY-TIDECALLER between matches. Each season match, TIDECALLER has a slightly different configuration. It is not a static vulnerability that Dante is failing to counter — it is a *regenerating* vulnerability that quietwater actively maintains. TIDECALLER always has a real weakness because quietwater ensures it does. The weakness shifts: compression rate this match, hook timing next match, buffer priority the match after. Dante's specific counters work against the specific vulnerability they target, but by the next match, TIDECALLER has a *new* specific vulnerability.

Meanwhile, quietwater's real strategic core — a two-rule dispatch element called SIGNAL-ROOT that operates at tick 8-12, thirteen ticks before the earliest pivot window Dante has ever observed — remains unchanged across all seven matches. It was configured once, in Season 5. It has never appeared in any adversarial analysis. Its pre-ranking score against Dante is 0.02. It is the element responsible for quietwater's 65% win rate against Dante. It is the reason the primary striker always has positional advantage by tick 20.

SIGNAL-ROOT is the Dutiful Ghost's protected asset. TIDECALLER is the Ghost — real, valuable, honestly vulnerable, and endlessly renewable.

**Minute 6:00 — Three Sessions Later: The Breakthrough**

Dante is reviewing his match recordings for a YouTube video. He is watching six replays side-by-side at 4x speed, looking for a highlight reel. He notices something he has never noticed in debrief: in every single match, quietwater's striker reaches the center control tile by tick 22. Every match. Regardless of what TIDECALLER does. Regardless of Dante's counters.

He pauses the replays. He opens the signal genealogy view (4.16) for one match and traces the striker's movement decision at tick 20 backward. The signal chain: STRIKER-WAVE received a MOVE_TO_CENTER signal at tick 19 from RELAY-MID, which received it at tick 16 from SIGNAL-ROOT, which generated it at tick 8 based on a single rule: `IF tick < 10 AND buffer_has(SPAWN_POSITION) THEN broadcast(MOVE_TO_CENTER, priority: CRITICAL)`.

One rule. Tick 8. Never modified. The entire positional advantage that quietwater maintains across every match — the advantage that Dante's TIDECALLER counters cannot touch — originates from a single rule that fires in the first ten ticks and never fires again.

Dante says, on stream: "It's not TIDECALLER. It was never TIDECALLER. There's a thing called SIGNAL-ROOT that fires once at the start of the match and sets up everything. TIDECALLER is real but it's a sideshow. The main event happens before I'm even looking."

Chat erupts. Someone clips it. The clip title: "DANTE FINDS THE GHOST."

**UI Annotations:**
- **Pre-ranking accuracy stat (vs. specific opponent)**: Career Analysis, opponent-filtered view. Displayed as a percentage badge next to the opponent's name. High accuracy (>70%) renders in cool blue — "the diagnostics are working." The irony: high diagnostic accuracy against a Dutiful Ghost architect is expected, because the diagnostics *are* correct about the honest decoy. The stat provides false reassurance.
- **Signal genealogy trace**: Act 2, signal flow overlay, click any action to trace backward through the relay chain. Renders as a highlighted path on the board — colored lines connecting the originating element through each relay to the acting unit. The originating element pulses once when the trace reaches it. For SIGNAL-ROOT, the trace reaches back to tick 8 and the pulse is a single, faint ripple — easy to miss if the player is focused on the pivot window at tick 45+.
- **Side-by-side replay**: Available from the Match History screen. Select up to 6 matches, click "Compare Replays." Matches play synchronized, each in a small tile. Unit positions render as colored dots. The pattern — quietwater's striker reaching center by tick 22 in every tile — is visible only in the aggregate, not in any individual replay.

---

#### Journey: Amara, 40, Security Consultant, Campaign Chapter 5 — "The Lesson That Transfers"

**Context:** Amara is 90 hours in, mid-campaign. She has just completed Mission 12, where the enemy used fidelity spoofing (from 5.14e) to inject false signals on her command channel. She built a defense-in-depth architecture with source-checking rules and per-channel thresholds. Now she is entering the first Gauntlet season. She has never played against humans. Her campaign config is well-designed but untested against adversarial intelligence.

**Minute 0:00 — The First Human Opponent**

Gauntlet Season 1, Match 1. Amara deploys her campaign config with minor adjustments. Her opponent is ranked 45th — a mid-tier player. The match runs. Amara wins, EDT 0.29. A decisive victory. Her campaign architecture is strong.

She opens Act 2 debrief and runs adversarial counterfactual on the opponent's config. She is curious — this is her first human opponent.

```
FIRST VIABLE FIX: Opponent's RELAY-BACKBURN
  rule priority: swap Rule 2 and Rule 3
  Impact: Signal routing improves for flanking scenarios.
  Estimated outcome shift: +3.7pp
```

She inspects the transparency drawer. RELAY-BACKBURN has high pivot-activity (0.78), moderate recency (0.45), high volatility (0.71). It looks like a real vulnerability. She files it away.

**Minute 2:00 — The Security Consultant's Instinct**

Something nags at Amara. In her professional work, she audits enterprise security systems. She has seen this pattern before: a penetration test that finds the first vulnerability and stops. The client fixes it, feels safe, and the red team walks through the *next* vulnerability six months later.

She runs THOROUGH mode. Same result: RELAY-BACKBURN. She opens the full candidate list and reads all 89 candidates, top to bottom. She is not looking for a specific element. She is looking for the *absence of a pattern*.

At rank 74:

```
74. DISPATCH-ANCHOR  pivot-activity: 0.04 · recency: 0.00 · volatility: 0.06 · score: 0.03
```

Recency: 0.00. This element has not been modified since the config was created. In Amara's professional experience, the component that has "never been touched" is either perfectly designed or the component nobody wants to touch because it's load-bearing and fragile.

She opens the signal genealogy for the opponent's primary striker action at the pivot tick and traces backward. The chain passes through three relays before reaching DISPATCH-ANCHOR at tick 11. DISPATCH-ANCHOR has one rule. It fires once. It sets up the entire positional framework for the match.

Amara writes: *"Opponent's architecture has a two-tier structure. RELAY-BACKBURN is the visible machinery — active, volatile, recently tuned, genuinely vulnerable. DISPATCH-ANCHOR is the foundation — silent, static, never modified, and responsible for the early positioning that makes everything else work. If I were doing a red team engagement, BACKBURN is the finding in the report, and ANCHOR is the finding I would have missed if I followed the automated scan results."*

She designs her Match 2 config to counter DISPATCH-ANCHOR: a fast-strike rule that disrupts the opponent's early positioning before tick 15. She wins Match 2 by a wider margin.

**Minute 5:00 — The Transfer Moment**

After Match 2, Amara opens her session notes and writes something she has never written in a game journal before:

*"The pre-ranking heuristic in this game operates the same way an automated vulnerability scanner operates in enterprise security. It looks for observable indicators: activity at critical moments, recent changes, complex behavior. These indicators correlate with real vulnerabilities. But they are heuristics, not ground truth. A well-designed architecture — whether a network or a game config — can naturally produce high indicator scores on non-critical components and low scores on critical ones. Not through deception, but through design.*

*The honest decoy is not an exploit. It is an emergent property of good layered architecture. The visible layer is complex because it handles complexity. The foundation layer is simple because it was designed once and designed correctly. Any scanning system that weights activity and complexity will surface the visible layer first. The foundation remains hidden not because it is concealed, but because simplicity does not trigger alarms.*

*This is why I tell clients that automated scans are necessary but never sufficient. The scan finds the RELAY-BACKBURN. The adversary finds the DISPATCH-ANCHOR."*

She closes her notes and queues Match 3. For the first time, she understands why the game's diagnostic tools are designed to be transparent, gameable, and imperfect. They are not flawed. They are a mirror for the tools she uses professionally — tools that work well enough to be trusted and poorly enough to be exploited.

**UI Annotations:**
- **Full candidate list scroll**: THOROUGH mode result panel, below the top-3 summary, a collapsed section: "All 89 candidates [+]". Expands to a scrollable table. No visual emphasis on any row. The table is deliberately flat — no heatmap coloring, no bold text, no icons. Every candidate looks equally mundane. The design forces the player to read the data, not scan for visual cues.
- **Recency: 0.00 display**: In the candidate table, recency of 0.00 renders as "0.00" in the same font weight and color as any other value. No special treatment. The player must recognize the significance of "never modified" from context, not from the UI.
- **Signal genealogy backward trace**: Same as Dante's journey. The trace highlights the chain from the pivot-tick action backward through relays. When the chain reaches an element that fired before tick 15, the trace line color shifts from bright cyan to a muted steel grey — the visual language for "this happened a long time ago relative to the outcome." The color shift is subtle, not alarming. It does not say "look here." It says "this is old." The player who notices the old signal and investigates it is performing the analytical work the game rewards.

---

## Strengths

**Emergent rather than engineered.** The Dutiful Ghost can arise naturally in well-designed architectures, which means the concept rewards good design thinking, not just adversarial trickery. A player who builds clean layered architecture discovers they have a Ghost without intending one.

**Resistant to automated detection.** Because the honest decoy is a genuine vulnerability, no automated system can flag it as a decoy. There is no metric that distinguishes "real vulnerability that is also the most important" from "real vulnerability that is not the most important." The distinction requires strategic judgment, not computation.

**Psychologically satisfying for both sides.** The attacker feels progress (real improvement from countering the Ghost). The defender feels secure (the core architecture is untouched). Both players are having a genuine competitive experience. The deception does not produce frustration — it produces a plateau that feels like a skill ceiling rather than a trick.

**Teaches transferable security intuition.** The honest decoy maps directly to real-world defense-in-depth, honeypot architecture, and the limits of automated vulnerability scanning. Players who internalize the concept carry it into professional security, systems design, and adversarial reasoning.

**Infinite meta-game depth.** Once both players understand the concept, the question becomes: "Is my opponent's most prominent vulnerability their Dutiful Ghost or their actual weakness?" This is undecidable without deep structural analysis, which creates an irreducible skill gap between players who can perform that analysis and players who rely on automated diagnostics.

## Weaknesses

**High skill floor.** The deliberate construction of a Dutiful Ghost requires simultaneous optimization of strategic effectiveness and diagnostic signal profile. Most players will not reach this level of architectural thinking. The concept may exist primarily in the top 5% of competitive play.

**Career analysis erosion.** Over many matches, an opponent who consistently counters the Ghost and observes that their win rate plateaus at a specific value may infer the existence of a deeper vulnerability through statistical analysis rather than diagnostic tools. The Ghost's protection degrades over long competitive relationships.

**Multi-element analysis vulnerability.** The Ghost protects against single-element diagnostic analysis. An opponent who runs multi-element combinatorial analysis (asking "what *combination* of changes produces the largest improvement?") may discover that GHOST_FIX + CORE_FIX >> GHOST_FIX alone, revealing that the Ghost is not the deepest vulnerability. This requires large compute budgets but is not impossible.

**Risk of self-deception.** A player who believes their architecture contains a Dutiful Ghost may be wrong — the visible vulnerability may genuinely be the most important one, and the "hidden core" may be less critical than the player believes. The Dutiful Ghost concept can become a rationalization for not fixing real problems.

---

## Interaction Effects

**With pre-ranking configurable weights (4.63):** Configurable weights are the primary counter-tool against hollow canaries. Against Dutiful Ghosts, they are ineffective — the Ghost scores high on pre-ranking signals because its genuine function produces those signals. Reducing volatility weight or zeroing recency does not move the Ghost down the candidate list significantly, because the Ghost's pivot-activity score is also legitimately high. The configurable weights feature, which was designed as the player's defense against poisoning, encounters its limit against honest decoys.

**With THOROUGH mode and search budget (4.60):** THOROUGH mode confirms the Ghost as a real vulnerability, consuming compute budget without surfacing the deeper weakness. This is the intended interaction — the Ghost wastes the opponent's most expensive diagnostic tool by giving it a truthful but incomplete answer. The opponent must go beyond THOROUGH's default output (minimum fix) to the decisiveness ranking, and then further to multi-element analysis.

**With adversarial multi-cluster poisoning (4.69e):** A Dutiful Ghost can trigger multi-cluster detection if it has enough elements (3+ distinct parameters as fix candidates). The match-source breakdown (4.69e) will not flag this as adversarial targeting, because the Ghost's vulnerabilities appear across multiple opponents — it is genuinely weak, just not critically so. The multi-cluster flag actually *reinforces* the Ghost's camouflage by suggesting a structural problem in the Ghost element rather than a hidden vulnerability elsewhere.

**With config necropsy culture (7.10):** When a Dutiful Ghost architect's config is shared in the community necropsy format, readers will naturally focus on the Ghost element (the most complex, most active element in the config). The real core — the simple, quiet element — will be overlooked in community analysis for the same reasons it is overlooked in automated analysis. The necropsy culture amplifies the Ghost's effect across the entire player community.

**With career adversarial analysis (4.59):** Over 20+ matches against the same Ghost architect, career analysis reveals a pattern: countering the Ghost produces diminishing returns. The coverage percentage for Ghost-related fixes rises but win rate improvement plateaus. A player who tracks the *marginal return per fix* across their career history may notice: "Each TIDECALLER counter gives me less improvement than the last. Something else is the bottleneck." This is the statistical crack in the Ghost's armor.

---

## Comparable Games and Media

**Chess — The Poisoned Pawn Variation (Najdorf Sicilian, 6.Bg5).** White offers the b2 pawn. Black can capture it for real material gain. The pawn is not a bluff — it is a real pawn worth a real point. But capturing it costs Black tempo and exposes the queen to harassment. The *real* advantage White gains is development and initiative on the opposite wing. The pawn is an honest sacrifice: genuinely valuable, genuinely capturable, and genuinely a distraction from the main strategic idea.

**Cybersecurity — Production Honeypots.** A production honeypot runs real services with real data. An attacker who compromises it finds real credentials and real network traffic. The honeypot is not fake — it is a real server doing real work. It simply is not the server that holds the crown jewels. The distinction between "real server I compromised" and "the server I should have compromised" is invisible from inside the honeypot.

**Poker — The Value Bet That Is Also a Bluff.** In advanced poker, a bet can simultaneously extract value from worse hands *and* represent a bluff to better hands. The opponent who calls is paying the value bet. The opponent who folds is respecting the bluff. Both responses are rational. The bet works because it contains truth: the hand is genuinely strong enough to bet for value. The deceptive layer — that the bettor would also bet this way with a bluff — is invisible because the truthful layer is sufficient to explain the action.

**StarCraft II — The Functional Proxy.** A proxy barracks is a building placed aggressively near the opponent's base. A standard proxy is a pure aggression play — all-in, do-or-die. But a *functional* proxy is one that produces units contributing to a genuine attack while the real strategy (a hidden expansion at home) develops unseen. The opponent who scouts the proxy and defends against aggression has made the correct defensive response to a real threat. They simply do not realize the aggression was the secondary plan.

**The Wire (TV) — Hamsterdam.** Major Colvin creates an unofficial drug tolerance zone. The open-air drug markets in Hamsterdam are real — real drugs, real dealers, real transactions. But the *purpose* of Hamsterdam is to move visible drug activity away from the residential neighborhoods, improving quality of life and crime statistics in the rest of the district. The drug markets are not fake. They are real activity that has been positioned to draw attention (from media, from police brass, from the community) away from the quieter structural changes Colvin is making elsewhere.

---

## Sensory Description

The Dutiful Ghost has no unique visual identity, and this is the point.

In the workbench, the Ghost element looks like any other relay — a rectangular node in the config graph, connected by hook lines to its upstream scouts and downstream strikers. Its 11 rules render as a tall column of condition-action pairs, each with properly configured thresholds and priorities. The node pulses faintly during match simulation, showing signal traffic flowing through it. The pulse rhythm is fast and irregular — the visual language of a busy, important element.

The hidden core looks equally unremarkable. A small rectangular node. Two rules. Two hook connections. During match simulation, it pulses once — a single, steady flash at tick 8 — and then goes dark for the rest of the match. The signal it emits travels through the relay chain as a thin colored line that fades within a few ticks, absorbed into the broader signal traffic. By tick 20, the core's contribution is invisible in the signal flow overlay, blended into the aggregate traffic that the Ghost element processes loudly and conspicuously.

In the transparency drawer during adversarial analysis, the Ghost's entry fills the screen. Three progress bars — pivot-activity, recency, volatility — all rendered in saturated amber, reaching 80-90% of their maximum. The rank score renders as a bold number: 0.88. Below it, the core's entry is a thin row with three nearly empty progress bars, rendered in pale grey. Score: 0.07. The visual hierarchy screams: the Ghost is important, the core is not.

The sound design reinforces this. During sealed replay, the Ghost element produces a continuous low hum — the audio signature of sustained signal processing. When the Ghost fires a hook, a brief chime plays, one of a dozen that occur each second during the mid-match phase. The core element produces one sound in the entire match: a deep, resonant tone at tick 8, like a temple bell struck once. The tone decays over 3 seconds, masked by the battle's rising ambient noise. By tick 12, it is inaudible. The most important sound in the match is the one that plays once and disappears.

On the isometric grid, the effect of the Ghost is visible: the flanking striker repositions frequently, engaging targets of opportunity, sometimes succeeding, sometimes failing. The movements are dynamic and engaging to watch. The effect of the core is invisible: the primary striker is *already in position* by tick 22. It does not reposition dramatically because it was positioned correctly from the start. The most powerful strategic advantage in the match manifests as an absence of visible activity — the primary striker simply being in the right place, without the dramatic repositioning that draws the eye.

The Dutiful Ghost's sensory signature is everywhere. The hidden core's sensory signature is nowhere. The architecture is honest about both.
