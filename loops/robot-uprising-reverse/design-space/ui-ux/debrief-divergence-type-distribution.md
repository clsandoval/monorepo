# Divergence Type Distribution as Career Stat

**Aspect:** 4.82 — Displaying the breakdown of which scenario types caused divergence in history (Symptom-Before-Cause, Recency Bias, Volatility False Signal, Magnitude Gap); reflects the player's architectural habits; available in the profile view alongside EDT trajectory (4.25).

**Parent:** 4.61 — QUICK vs. THOROUGH explainer
**Siblings:** 4.78 — Divergence frequency; 4.81 — Consistent divergence flag; 4.83 — Divergence trend over time
**Related:** 4.25 — EDT trajectory; 4.64 — Pre-ranking accuracy stat; 4.88 — Adaptive weight suggestion; 4.63 — Player-configurable pre-ranking weights; 7.12 — Community-visible EDT distributions per config archetype

---

## Core Problem

Every time QUICK and THOROUGH diverge, the game already classifies the divergence into one of four scenario types (4.61): Symptom-Before-Cause, Recency Bias, Volatility False Signal, and Magnitude Gap. That classification is shown once, in the explainer card, and then forgotten. The data evaporates. No accumulation, no memory, no pattern.

But divergence type distribution is not random noise. It is a fingerprint of how a player builds. A player who chains long relay paths generates Symptom-Before-Cause divergences because their architecture has deep causal stacks — the pre-ranking heuristic sees the downstream reactor, misses the upstream source. A player who iterates rapidly across sessions, touching three elements per session, generates Recency Bias divergences because the heuristic's "recently modified" signal fires on everything they touched — and most of what they touched was fine.

The distribution is a mirror. A player whose divergence history is 60% Symptom-Before-Cause is a different kind of architect than a player whose history is 55% Volatility False Signal. The first builds deep. The second builds reactive. Neither is wrong. But both would benefit from seeing the pattern — because the pattern tells them where their pre-ranking heuristic is systematically fooled, and therefore where they should distrust QUICK mode and verify with THOROUGH.

The question is: where does this mirror live, what does it look like, and what does a player do when they look into it?

---

## Design

### The Four Types and What They Reveal

Each divergence type, accumulated over 30+ sessions, becomes a statement about architectural style:

**Symptom-Before-Cause (SBC)** — The pre-ranking surfaced a downstream element that was reacting to a failure, not causing it. High SBC frequency means the player builds architectures with long causal chains — signal flows through multiple relays, buffers, and processors before producing visible behavior. The heuristic sees the visible behavior, misses the origin. Accumulated SBC divergences say: *your architecture has depth. Your surface elements are responsive. The heuristic reads the surface.*

**Recency Bias (RB)** — The pre-ranking blamed a recently-modified element that was coincidentally active. High RB frequency means the player modifies their config frequently across sessions, touching multiple elements per iteration. The heuristic's recency signal fires on many candidates, increasing false positive rate. Accumulated RB divergences say: *you iterate fast. Your recent-change footprint is large. The heuristic cannot distinguish your intentional changes from your incidental ones.*

**Volatility False Signal (VFS)** — The pre-ranking blamed a high-state-count element that was adapting correctly. High VFS frequency means the player builds reactive, state-heavy elements — context buffers with many modes, scouts that switch behavior frequently, relays that oscillate based on conditions. These elements look noisy to the heuristic. Accumulated VFS divergences say: *you build reactive components. Your elements are supposed to be volatile. The heuristic mistakes responsiveness for brokenness.*

**Magnitude Gap (MG)** — The pre-ranking found the right element but the wrong fix magnitude. High MG frequency is the least diagnostic — it means the heuristic is directionally correct but overshooting. Accumulated MG divergences say: *your architecture is legible to the heuristic. The pre-ranking generally understands your config. It just finds the sledgehammer before the scalpel.*

### The Visualization: The Divergence Compass

The divergence type distribution appears as a four-quadrant radial chart — a diamond shape, not a pie chart. The four axes:

```
                    SBC
                     |
                     |
          VFS -------+------- RB
                     |
                     |
                    MG
```

Each axis extends from center to edge, scaled by percentage. The player's distribution is drawn as a filled shape connecting the four axis values. A perfectly even distribution (25% each) would produce a regular diamond. A player dominated by one type produces a spike — the diamond collapses into a needle pointing toward their dominant divergence.

The shape is named. The game generates a two-word label based on the dominant type:

| Dominant type (>40%) | Shape label |
|---|---|
| SBC | **Deep Builder** |
| RB | **Fast Iterator** |
| VFS | **Reactive Designer** |
| MG | **Clear Architect** |
| No dominant (all <35%) | **Balanced Profile** |

The label appears below the diamond in small caps. It is descriptive, not evaluative. No type is better than another. The label is a name for how the player's pre-ranking heuristic fails — which is, indirectly, a name for how the player builds.

### Profile Placement

The Divergence Compass sits in the player profile's extended statistics panel, below the eEDT spark-line (4.25) and beside the pre-ranking accuracy percentage (4.64). The three stats form a diagnostic triptych:

```
┌────────────────────────────────────────────────────────────┐
│  eEDT (30): 0.47  ↑0.06                                   │
│  [spark-line: 90 matches of EDT dots with bezier overlay]  │
│                                                            │
│  ┌─────────────────────┐  ┌────────────────────────────┐   │
│  │ Pre-ranking Accuracy │  │ Divergence Profile          │   │
│  │       71%            │  │         SBC                 │   │
│  │   (27/38 sessions)   │  │          ▲                  │   │
│  │                      │  │    VFS ──◆── RB             │   │
│  │                      │  │          ▼                  │   │
│  │                      │  │         MG                  │   │
│  │                      │  │   "Deep Builder"            │   │
│  └─────────────────────┘  └────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

The triptych reads left to right as a sentence: *How contested are your matches? How often is your heuristic right? When it's wrong, why?*

### Unlock Threshold

The Divergence Compass requires 15+ divergence events to display. Since divergence happens roughly one session in four (4.61), and sessions with both QUICK and THOROUGH runs are a subset of all sessions, a typical player accumulates 15 divergences after approximately 60-80 sessions. This is intentionally late — the stat is for players deep enough in the game to understand what pre-ranking means, what divergence means, and why the distribution matters. Premature exposure would produce confusion, not insight.

Before 15 divergences, the profile shows a placeholder:

```
Divergence Profile
[locked — 9/15 divergences recorded]
```

The lock counter uses a faint outline of the diamond shape behind the fraction, a ghost of the chart-to-come. Players see the shape before they can fill it.

### Hover Detail: The Divergence Log

Hovering over the Divergence Compass expands a tooltip with the raw counts and most recent example of each type:

```
Symptom-Before-Cause:    12  (41%)  — last: Session #147, Scout-B / Relay-C
Recency Bias:             8  (28%)  — last: Session #139, Buffer-A / Processor-D
Volatility False Signal:  5  (17%)  — last: Session #144, Context-E / Relay-F
Magnitude Gap:            4  (14%)  — last: Session #151, Scout-B (+3 vs +1)
                         ──
Total divergences:       29
```

The "last" reference is clickable — it opens the archived explainer card from that session's Fix Explorer, allowing the player to revisit the specific divergence in context. This connects the career stat back to individual diagnostic moments. The stat is not abstract; every number in it links to a concrete memory.

### Temporal View: Distribution Shift Over Time

An optional toggle (gear icon on the Compass) switches to a stacked area chart showing how the four-type distribution has shifted over the player's career. The x-axis is session count (or time). The y-axis is percentage. Four colored bands stack to 100%.

This view answers: *Is my divergence profile changing?* A player who was 55% Recency Bias early on (fast iterator, new to the game, modifying everything) but who has settled to 20% Recency Bias and 45% SBC has matured — they iterate less, build deeper, and the heuristic now fails for architectural reasons rather than iteration-speed reasons. The stacked area chart makes this arc visible.

The temporal view is available only after 30+ divergences (approximately 120-160 sessions). The unlock is silent — the gear icon simply appears when enough data exists.

---

## Player Journeys

### Journey 1: Tomoko Discovers Her Needle

TOMOKO (28, software engineer, 94 Gauntlet sessions, eEDT 0.51) opens her profile after a losing streak. Her pre-ranking accuracy has dropped from 74% to 62% over the last 20 sessions. She's been running THOROUGH more often because QUICK keeps being wrong. She is frustrated but methodical.

She notices the Divergence Compass has unlocked — she hadn't checked in a while. The diamond is dramatically elongated upward: 52% Symptom-Before-Cause, 21% Recency Bias, 18% Volatility False Signal, 9% Magnitude Gap.

                              TOMOKO
                    (staring at the diamond on her profile)
          That's not a diamond. That's a spike.

She hovers. Twelve of her 23 divergences are SBC. She clicks the most recent one: Session #88, where QUICK blamed her scout cluster's reaction pattern and THOROUGH found a buffer timing issue two layers upstream.

She clicks three more SBC entries. Every one of them is the same story: the pre-ranking finds the element that was visibly struggling, THOROUGH finds the element that caused the struggle. The failing element is always downstream. The actual fix is always upstream.

                              TOMOKO
                    (leaning back, arms crossed)
          It's not that my pre-ranking is broken.
          It's that I build deep and the heuristic reads shallow.

She opens her config editor. Her relay chain is six elements deep in places. Signal flows through four processing stages before reaching a decision point. Of course the pre-ranking surfaces the decision point — it's the loudest thing on the board at pivot time. The root cause is always the second or third relay in the chain, where a timing constraint silently failed.

She considers two responses: flatten her architecture (fewer layers, heuristic reads better) or adjust her pre-ranking weights to deprioritize "active at pivot" and increase "upstream causal distance." She opens the configurable weights panel (4.63). She finds the "causal depth" weight slider. She moves it from 0.3 to 0.6.

Next session: QUICK finds the correct element for the first time in four sessions. She exhales.

                              TOMOKO
          The compass told me where I was blind.
          The weights let me correct the lens.

---

### Journey 2: Rafael and the Recency Trap

RAFAEL (19, college student, 42 Gauntlet sessions, eEDT 0.33) plays in intense bursts — four sessions in a night, modifying three elements per session. His Divergence Compass just unlocked at 15 divergences. He reads the label: **Fast Iterator.**

His distribution: 13% SBC, 53% Recency Bias, 20% VFS, 14% MG.

He does not understand what Recency Bias means in this context. He hovers over the RB segment. The tooltip says:

                              TOOLTIP TEXT
          Recency Bias: QUICK blamed a recently-modified element
          that turned out not to be the root cause. High frequency
          suggests your pre-ranking's recency signal fires often
          because you modify many elements between sessions.

Rafael clicks through his eight RB divergences. In six of them, the element QUICK blamed was something he had tweaked in his previous session. In five of those six, the actual minimum fix was an element he hadn't touched in weeks.

                              RAFAEL
                    (scrolling through the divergence log)
          So every time I tweak my scouts, the game thinks
          my scouts are the problem next time?

He pauses. He opens his session history. He can see the pattern now: he tweaks Scout-A, Scout-B, and Buffer-C in session 31. In session 32, QUICK blames Scout-A for a new issue. THOROUGH finds the issue is in Relay-D, untouched since session 12. QUICK was pattern-matching on his edit history, not on causal structure.

                              RAFAEL
          I need to stop touching everything.
          Or at least... stop trusting QUICK right after I do.

He develops a new habit: after any session where he modifies more than two elements, he runs THOROUGH on the next session regardless of QUICK's confidence. His pre-ranking accuracy climbs from 58% to 69% over the following month. His RB percentage drops from 53% to 34%.

The Divergence Compass shape broadens. The needle retracts. The label changes from "Fast Iterator" to "Balanced Profile." Rafael screenshots both shapes and posts them to his clan's Discord.

                              RAFAEL
                    (typing the Discord message)
          "before and after learning to stop blaming my last edit"

---

### Journey 3: Mei-Ling and the Volatility Architecture

MEI-LING (35, data scientist, 210 Gauntlet sessions, eEDT 0.61) builds the most reactive architectures in her rank bracket. Her scouts have eight distinct behavior modes. Her context buffers switch states every three ticks. Her config is alive with oscillation — by design.

Her Divergence Compass has been stable for months: 15% SBC, 12% RB, 58% Volatility False Signal, 15% MG. Label: **Reactive Designer.**

She knows exactly why. Her elements are supposed to be volatile. A scout that cycles through eight states during a match is not broken — it is reading the battlefield and responding. But the pre-ranking's volatility signal sees "22 distinct states" and screams "this is the problem element!" It is wrong 58% of the time that it diverges, and the reason is always the same: it mistook responsiveness for malfunction.

                              MEI-LING
                    (in a config necropsy stream, pointing at her Compass)
          My VFS percentage is my badge of honor.
          It means the heuristic can't read my architecture.
          It means my architecture is too alive for pattern-matching.

She toggles the temporal view. The stacked area chart shows her VFS percentage has been climbing — from 35% at session 60 to 58% now. This tracks perfectly with her architectural evolution: she added more reactive elements over time, and each addition increased the false signal rate.

She zooms in on a period where VFS dropped briefly — sessions 140-160. She remembers: she simplified her scout behavior from eight modes to five during that stretch, trying a cleaner design. The heuristic got more accurate. VFS dropped. She went back to eight modes because the five-mode version lost more matches. VFS climbed again.

                              MEI-LING
          The temporal chart literally shows me trying
          to be simple and failing. The architecture
          wanted to be complex. The heuristic pays the tax.

She has long since adjusted her pre-ranking weights (4.63): volatility weight set to 0.1 (near zero). She almost never trusts QUICK. Her pre-ranking accuracy stat reads 54% — low by population standards, but she doesn't care. She knows the 46% failure rate is the cost of building reactive systems, and she has made peace with it.

A viewer in her stream asks: "Doesn't it bother you that QUICK is useless for your playstyle?"

                              MEI-LING
          QUICK isn't useless. It's a filter.
          When QUICK and THOROUGH agree on my config,
          that fix is almost certainly correct — because
          even the heuristic could see it. Those are the
          obvious problems. I fix those fast and move on
          to the subtle ones.

---

## Strengths

**Transforms diagnostic noise into identity signal.** Individual divergence events are ephemeral — a player sees the explainer card, learns from it, moves on. But the accumulated distribution persists on the profile as a character trait. A player with 55% SBC is a "deep builder" not because the game told them so, but because 55 sessions of divergence data converged on that shape. The identity emerges from the data, not from a quiz or a self-report.

**Creates a feedback loop with configurable weights (4.63).** The Compass tells you where the heuristic fails for your architecture. The configurable weights let you compensate. The Compass then tracks whether your compensation worked. This is a closed diagnostic loop — a calibration cycle between the player and their tooling. No other game offers this: tuning your debugging tool and watching the tuning's effectiveness tracked over your career.

**Enables architectural self-awareness.** Most players do not know what kind of architect they are until the Compass names it. "Fast Iterator" is not a label the player chose — it is what 53% Recency Bias looks like when accumulated. The label is discovered, not assigned. This produces a different kind of self-knowledge than a personality quiz — it is earned through play, not stated in advance.

**Differentiates profiles in the community layer.** When players browse workshop configs or view opponent profiles, the Divergence Compass shape is immediately legible as "what kind of architect is this person." A Deep Builder's spike looks different from a Reactive Designer's spike. Community members develop intuitions about what each shape means for how a config will play. The shape becomes a visual shorthand for architectural philosophy.

**Temporal view reveals growth arcs.** The stacked area chart is the only place in the game where a player can watch their architectural habits evolve over months. The shift from Recency Bias to SBC represents a real maturation — from frantic iteration to deep construction. The shift from high VFS to balanced represents a simplification. These arcs are not visible in any other stat.

---

## Weaknesses

**Requires THOROUGH usage to accumulate data.** The Divergence Compass only tracks sessions where both QUICK and THOROUGH were run. Players who never use THOROUGH — whether because they trust QUICK, because they don't want to wait 30 seconds, or because they don't understand the distinction — will never accumulate divergence data. The stat is invisible to casual players. This may be acceptable (the stat is for deep players) or it may be a lost opportunity (casual players might benefit most from seeing their patterns).

**Classification accuracy of the four types.** The game must automatically classify each divergence into one of four types. This classification relies on causal analysis of the replay data — determining whether element A was "downstream of" element B, whether the recency signal was the dominant factor, whether volatility was adaptive or malfunctional. These classifications may be wrong. A misclassified divergence contaminates the distribution. If classification accuracy is below 85%, the Compass shape becomes noisy enough that the labels are unreliable. The classification algorithm is load-bearing infrastructure that is never shown to the player.

**The labels can become identities players defend rather than diagnose.** A player who identifies as a "Reactive Designer" may resist simplifying their architecture because the label feels good, even when simplification would improve their win rate. The label was designed to be descriptive, but players convert descriptions into aspirations. Mitigation: the temporal view shows that labels change over time, normalizing the idea that your divergence profile is a snapshot, not a permanent trait.

**Small sample sizes produce misleading shapes.** At the 15-divergence unlock threshold, a player with 7 SBC, 4 RB, 3 VFS, and 1 MG shows a strong SBC spike — but removing two SBC events and adding two RB events would dramatically change the shape. The diamond is volatile at low sample sizes. Mitigation: show confidence intervals on the axes at low counts (faded uncertainty bands around each axis value that shrink as sample size grows). Cost: visual complexity. Tradeoff: maybe the uncertainty bands only appear on hover.

**Does not distinguish between divergences that mattered and divergences that didn't.** Some divergences are consequential — the player applied the QUICK fix, it didn't work, they went back and ran THOROUGH. Other divergences are academic — the player always planned to run THOROUGH and the QUICK result was never applied. The Compass treats all divergences equally. A weighted version (that counts applied-wrong-fix divergences more heavily) would be more useful but harder to track.

---

## Interaction Effects

**With 4.25 (EDT trajectory):** The Divergence Compass sits directly below the eEDT spark-line. Together, they answer two complementary questions: "How contested are your matches?" (eEDT) and "What kind of architectural thinking produces those matches?" (Divergence Compass). A player whose eEDT is rising AND whose Compass is shifting from RB-dominant to SBC-dominant is undergoing a specific kind of growth: from frantic iteration toward deep, layered architecture. The two stats tell a richer story together than either tells alone.

**With 4.88 (Adaptive weight suggestion):** If the game can suggest pre-ranking weight adjustments based on divergence patterns (4.88), then the Compass becomes the input surface for those suggestions. A player with 55% VFS would see a suggestion: "Your volatility weight is 0.5. Consider reducing to 0.2 — your reactive elements generate false signals." The suggestion is grounded in the Compass data, not in abstract recommendation. The Compass provides the diagnosis; the adaptive suggestion provides the prescription.

**With 4.81 (Consistent divergence flag):** When a player's divergence frequency exceeds a threshold (4.78) AND the distribution is heavily skewed toward one type (4.81 triggers the consistent divergence flag), the Compass shape is the visual explanation for the flag. The flag says "your pre-ranking is consistently failing." The Compass says "here's why — you're a Deep Builder and the heuristic can't read depth." The flag is the alert; the Compass is the diagnosis.

**With 4.63 (Player-configurable pre-ranking weights):** The Compass creates a feedback loop. The player reads their Compass. They adjust weights in response. The adjusted weights change which future divergences occur (and which type they are). Over time, the Compass shape shifts. The player has calibrated their heuristic, and the Compass records the calibration's effect. This is the full loop: observe pattern, adjust tool, observe pattern change.

**With 7.12 (Community-visible EDT distributions per config archetype):** If the community develops archetype labels for configs (relay-chain, scout-rush, hybrid reactive), then community-level Divergence Compass averages per archetype would be diagnostic of the heuristic's architectural biases. "Relay-chain archetype average Compass: 48% SBC" confirms that the heuristic systematically struggles with depth. This is useful both for individual players (benchmarking their Compass against their archetype) and for the dev team (identifying which architectural styles the heuristic serves poorly).

---

## Comparable Games and Media

**Overwatch 2 hero damage composition charts.** After a competitive season, Overwatch 2 shows players a breakdown of their damage dealt by type (barrier, hero, healing). The composition reveals playstyle — a Reinhardt who deals 60% barrier damage plays differently from one who deals 60% hero damage. The Divergence Compass serves the same function: it decomposes a single metric (divergence count) into typed components that reveal strategy. Key difference: Overwatch's charts are about what the player did; the Compass is about where the player's tooling failed. The diagnosis is one layer more meta.

**League of Legends death heatmaps (third-party tools).** Tools like op.gg track where on the map a player dies most often. The spatial distribution of deaths reveals habits — overextending in top lane, getting caught at river objectives. The Divergence Compass is a conceptual heatmap: not where you die, but where your diagnostic heuristic dies. Both tools reveal blind spots through accumulated pattern, not through any single event.

**Chess.com opening accuracy by phase.** Chess.com breaks accuracy into opening, middlegame, and endgame phases. A player might have 92% opening accuracy but 64% endgame accuracy — revealing exactly where their chess knowledge thins out. The Divergence Compass similarly decomposes a player's diagnostic capability into typed failure modes, each corresponding to a different architectural habit. Both systems say: "You're good at this kind of thinking. You're weak at that kind."

**Factorio production statistics over time.** Factorio's production graphs show item throughput over the lifetime of a factory. The stacked area chart format — with multiple production lines filling a percentage view — is directly analogous to the Compass's temporal view. Factorio players use production graphs to identify bottlenecks and trace factory evolution. Robot Uprising players use the temporal divergence chart to identify diagnostic bottlenecks and trace architectural evolution. The visual language is the same: colored bands, shifting over time, telling a story about what changed.

**Software engineering code review feedback categories.** Some engineering teams categorize code review feedback (style, logic, performance, security) and track a developer's feedback distribution over time. A developer who receives 70% "logic" feedback builds differently from one who receives 70% "performance" feedback. The categorization is diagnostic, not punitive — it reveals what kind of mistakes a developer's mental model produces. The Divergence Compass is the same pattern applied to a game: what kind of mistakes does your architecture produce in the heuristic?

---

## Sensory Description

The Divergence Compass is drawn as a wire-frame diamond — four thin lines extending from center to axis label, with the player's distribution rendered as a filled polygon connecting the four axis values. The fill is a translucent gradient: deep teal at center, fading to near-transparent at the edges. The polygon's edges are slightly rounded — not sharp corners, but soft bezier curves — giving the shape an organic, almost biological quality. It looks like a cell under a microscope, not a bar chart.

Each axis label is set in the same monospace typeface as the Fix Explorer's diagnostic text: SBC at top, RB at right, MG at bottom, VFS at left. The labels are rendered in 60% opacity white, barely there, letting the shape dominate. The dominant axis — whichever has the highest percentage — has its label at full opacity and slightly larger, a 1.2x scale bump that the eye catches without conscious registration.

The shape label ("Deep Builder," "Fast Iterator," etc.) appears centered below the diamond in small caps, letterspaced 0.12em, the same treatment as the eEDT coaching text. It is not bold. It is not colored. It sits in the same off-white as the axis labels, present but unhurried.

When the Compass first unlocks at 15 divergences, the animation is quiet. The four axis lines draw outward from center over 0.8 seconds — thin strokes extending like compass needles finding north. Then the polygon fills in, vertices appearing one by one at their axis positions, the filled shape materializing as the last vertex connects. The fill color fades in over 0.5 seconds. The shape label types itself letter by letter, 40ms per character. Total animation: 2.3 seconds. No sound. The silence is deliberate — this is a mirror, not a reward. You are being shown something about yourself. The game does not applaud.

Hovering over the diamond causes the polygon edges to glow faintly — the same teal as the fill, but at 90% opacity, a 2px stroke that pulses once and holds. The tooltip slides in from the right: raw counts, percentages, last-session references. The tooltip text is left-aligned, tabular, clinical. It uses the diagnostic register, not the narrative register. Numbers, not adjectives.

The temporal view, when toggled, replaces the diamond with a stacked area chart that shares the same color vocabulary: SBC is rendered in a muted copper (warm, depth-coded), RB in a pale gold (recent, bright), VFS in an electric teal (reactive, alive), MG in a cool grey (neutral, benign). The four colors are chosen to be distinguishable in both full-color and deuteranopia-simulated views. The bands flow left to right across the player's session history, with the most recent sessions at the right edge. The transition from diamond to stacked chart is a morph animation — the diamond's four vertices stretch and flatten into the chart's four bands over 0.6 seconds. The shape does not disappear and reappear; it transforms. The player watches their summary become their history.

---

## Discovered New Aspects

- **4.83 — Divergence type trend alerts:** When a player's dominant divergence type shifts by more than 15 percentage points over a 20-divergence window, surface a notification: "Your divergence profile is shifting toward [new type]." Does this help or overnotify?
- **4.84 — Archetype-benchmarked Compass overlay:** Show the player's Compass shape overlaid with the average Compass shape for their config archetype. The gap between personal and archetype average reveals whether their divergence pattern is typical or unusual for their style.
- **4.85 — Divergence type as matchmaking signal:** If a player's dominant divergence type predicts which opponents cause the most divergence, should matchmaking consider divergence profiles when pairing players for diagnostic richness?
- **4.86 — Community Compass gallery:** A browsable gallery of Compass shapes from top-ranked players, sortable by archetype. Lets players see what "elite Deep Builder" looks like vs. "elite Reactive Designer" and whether the shapes converge at high ranks.
- **4.87 — Divergence classification confidence display:** Show the classification algorithm's confidence for each divergence event (e.g., "SBC — 91% confidence"). Lets players flag low-confidence classifications for review, improving the underlying algorithm through player feedback.
