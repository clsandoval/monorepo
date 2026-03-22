# Combined Coverage Minimum as Secondary Threshold Gate

**Aspect:** 4.69i — Combined coverage minimum as secondary threshold gate: requiring BOTH N=3 appearances AND combined coverage >=30% before the cluster flag fires; prevents low-coverage clusters from generating noise; two-axis threshold specification design.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69b — Combined agent coverage score display; 4.69h — Threshold preset profiles per config phase
**Related:** 4.69d — Multi-cluster persistence tracking; 4.68 — Coverage percentage as season health; 4.59 — Career minimum fix; 4.36 — Multi-scenario fix explorer

---

## The Core Problem

The multi-cluster detection system (4.69) fires when the same agent appears in N or more distinct runner-up candidate slots. The threshold configurability system (4.69a) lets the player set N to 2, 3, or 4. But there is a class of cluster event that passes the appearance threshold while carrying almost no diagnostic value: the **low-coverage cluster**.

Consider this career analysis result:

```
Career Analysis (M200-M245, 45 matches analyzed)
---
#1   RELAY-C context buffer     62%   (28/45)   [Apply Fix ->]
#2   SCOUT-A hook threshold     31%   (14/45)   [Apply Fix ->]
#3   STRIKER-B patrol radius    18%    (8/45)   [Apply Fix ->]
#4   RELAY-C fallback filter     6%    (3/45)   [Apply Fix ->]
#5   COMMAND-D priority depth    5%    (2/45)   [Apply Fix ->]
#6   RELAY-C priority queue      4%    (2/45)   [Apply Fix ->]
#7   SCOUT-A buffer window       3%    (1/45)   [Apply Fix ->]
#8   RELAY-C timing offset       2%    (1/45)   [Apply Fix ->]
#9   STRIKER-B fallback rule     2%    (1/45)   [Apply Fix ->]
#10  COMMAND-D response delay    1%    (1/45)   [Apply Fix ->]
```

RELAY-C appears in positions 1, 4, 6, and 8. That is four appearances in the top 10 -- the flag fires at N=3 (and even at N=4). The system dutifully raises the amber banner: "RELAY-C appears in 4 of your top 10 candidates. This agent may have a structural problem."

But look at the *coverage*. Position #1 (context buffer) covers 62%. Positions #4, #6, and #8 together cover 6%, 4%, and 2%. The combined coverage of the full cluster is approximately 66% (the tail entries overlap almost entirely with the top entry's match set). The *incremental* coverage from the three tail entries beyond #1 is about 4 percentage points.

This is not a structural problem. This is a dominant single fix with a long tail of noise entries from the same agent. The player who applies the #1 fix will capture almost all recoverable value. The three tail entries are statistical echoes -- minor parameter variations that co-occur with the real problem but do not independently drive outcomes. The cluster flag, by treating all four appearances equally, has generated a false positive: it is diagnosing "architectural debt" where the real situation is "one clear fix plus noise."

The core design question: **how do you prevent cluster flags from firing on low-coverage tails?**

The answer is a two-axis threshold: the flag requires BOTH a minimum number of appearances (the existing N threshold) AND a minimum combined coverage percentage before it fires. The combined coverage gate filters out clusters where the tail entries are noise, while preserving flags for clusters where multiple entries each carry meaningful weight.

---

## The Design

### The Two-Axis Gate

The cluster flag fires when two conditions are jointly satisfied:

```
Condition 1 (Appearance gate):   cluster_size >= N_threshold
Condition 2 (Coverage gate):     combined_cluster_coverage >= C_threshold
```

Both conditions must be true. If either fails, the flag is suppressed.

The default configuration:

```
N_threshold = 3     (agent must appear in 3+ candidate slots)
C_threshold = 30%   (combined coverage of all cluster entries >= 30%)
```

Under this configuration, RELAY-C in the example above would NOT fire: it has 4 appearances (passes Condition 1 at N=3) but its combined cluster coverage is ~66% (passes Condition 2). Wait -- 66% passes. Let me use a better example to illustrate the gate's function.

Suppose instead:

```
#1   SCOUT-A hook threshold     44%   (20/45)
#2   RELAY-C context buffer     12%    (5/45)
#3   STRIKER-B patrol radius     9%    (4/45)
#4   RELAY-C fallback filter     8%    (4/45)
#5   COMMAND-D priority depth    7%    (3/45)
#6   RELAY-C priority queue      6%    (3/45)
#7   SCOUT-A buffer window       5%    (2/45)
#8   RELAY-C timing offset       4%    (2/45)
#9   STRIKER-B fallback rule     3%    (1/45)
#10  COMMAND-D response delay    2%    (1/45)
```

RELAY-C appears in positions 2, 4, 6, and 8. Four appearances -- Condition 1 passes at N=3. But the combined cluster coverage: the union of matches improved by any RELAY-C fix is approximately 22% (the entries overlap heavily on the same 7-8 matches). Condition 2 fails: 22% < 30%.

The flag does not fire. The player sees a clean career analysis result. The top fix is SCOUT-A hook threshold at 44%. That is the real signal. RELAY-C's four entries are noise from a secondary agent with limited impact on overall outcomes.

### Why Combined Coverage, Not Individual Coverage

An alternative design would gate on the *individual coverage of the tail entries* rather than the combined coverage: "only flag if each cluster entry has at least X% coverage." This approach is worse for three reasons:

1. **It ignores the asymmetric case.** A cluster with entries at 62%, 24%, and 17% has a dominant entry and two meaningful secondaries. The tail entries individually are above any reasonable per-entry threshold (say 10%). But a cluster with entries at 62%, 3%, and 2% has a dominant entry and two noise entries. Per-entry gating at 10% would correctly suppress the second cluster -- but it would also suppress a cluster with entries at 15%, 14%, and 13%, which is the most architecturally interesting case (three equally-weighted symptoms pointing at the same agent). Combined coverage captures the *total weight* of the cluster, which is what the player needs to decide whether a holistic redesign is worth their time.

2. **It creates a cliff at the per-entry threshold.** A cluster with entries at 11%, 11%, and 9% would flag (two entries above 10%) or not (one below 10%), depending on exactly where the per-entry threshold sits. Small random variation in the coverage of individual entries would cause the flag to flicker on and off across career analyses. Combined coverage smooths this by aggregating across all entries.

3. **It doesn't correspond to the player's decision.** The player's question is not "is each individual fix worth doing?" (that is already answered by the ranked list). The player's question is "is a *holistic redesign* worth doing?" That question is answered by the total coverage of the cluster, not by the coverage of each individual entry.

### The Coverage Computation

The combined coverage calculation is the same union computation described in 4.69b: take the match-attribution sets for all cluster entries, compute their set union, divide by total analyzed matches.

```
RELAY-C cluster entries:
  context buffer  -> matches {3, 5, 8, 12, 14}            (5 matches)
  fallback filter -> matches {3, 5, 9}                     (3 matches)
  priority queue  -> matches {5, 8, 15}                    (3 matches)
  timing offset   -> matches {5, 12}                       (2 matches)

Union:              matches {3, 5, 8, 9, 12, 14, 15}      (7 matches)
Combined coverage:  7 / 45 = 15.6%

Gate check:  15.6% < 30%  -->  Flag suppressed.
```

The computation is a by-product of the pre-computed attribution data (see 4.69b Option 1 -- eager pre-computation). If the game uses eager pre-computation, the coverage gate adds zero latency: the combined coverage number is already available at the moment the cluster is detected. If the game uses on-demand computation (4.69b Option 2), the coverage gate requires computing the combined coverage *before* deciding whether to show the flag -- which forces a hybrid approach: the appearance gate is checked first (cheap), and if it passes, the combined coverage is computed (fast but not free) to determine whether the coverage gate also passes.

### The Suppression Notice

When the appearance gate passes but the coverage gate fails, the system suppresses the flag. The question: does the player know the flag was suppressed?

**Option A -- Silent suppression.** The flag simply doesn't appear. The player sees a clean career analysis result. They never know a cluster was detected and dismissed. This is the lowest-friction option but creates a transparency gap: a player who later learns about combined coverage gating may wonder how many times the system suppressed flags without telling them.

**Option B -- Annotation-level disclosure.** A small annotation appears at the bottom of the career analysis panel:

```
i  1 cluster suppressed (RELAY-C, 4 entries, combined coverage 22% < 30% threshold)
   [Show anyway ->]
```

The annotation is visually subordinate -- gray text, 12px, collapsible. It tells the player that a cluster existed but fell below the coverage gate. The `[Show anyway]` link surfaces the full flag and audit if the player wants to investigate regardless.

**Option C -- Dimmed flag.** The cluster flag appears but is visually dimmed -- the amber banner renders at 30% opacity, with text reading "RELAY-C cluster detected (4 entries) -- combined coverage 22%, below 30% threshold. Suppressed." The flag is visible but clearly marked as below threshold. No action buttons are shown until the player expands it.

**Recommended: Option B.** Silent suppression (Option A) is too opaque for a game that teaches diagnostic reasoning. Dimmed flags (Option C) are noisy -- they still occupy visual space and require the player to parse "why is this faded?" before moving on. The annotation-level disclosure (Option B) is minimal, findable, and preserves the player's ability to override.

### The Two-Axis Settings UI

The threshold settings panel (4.69a) gains a second row:

```
Multi-cluster detection
----------------------------------------------

Appearance threshold
  Same agent must appear in:
  ( ) 2+ candidates   (most sensitive)
  (*) 3+ candidates   (default)
  ( ) 4+ candidates   (less interruption)
  ( ) Off

Coverage threshold                              [NEW]
  Combined cluster coverage must reach:
  ( ) Any              (no minimum)
  (*) 30%+             (default -- filters noise clusters)
  ( ) 50%+             (only flag high-impact clusters)
  ( ) Custom: [___]%

  Current: flag fires when same agent appears 3+ times
  AND combined coverage >= 30%.
----------------------------------------------
```

The two thresholds are displayed as independent controls in the same card. The summary line at the bottom synthesizes both into a single readable sentence: "flag fires when same agent appears 3+ times AND combined coverage >= 30%." This synthesis is critical -- the player should never have to mentally compose the two thresholds. The sentence does it for them.

### Named Presets for Two-Axis Configurations

Exposing two independent thresholds creates a 2D parameter space that most players should not navigate manually. Named presets collapse this space into 4-5 curated configurations:

```
Multi-cluster detection mode
----------------------------------------------
  ( ) Vigilant         N=2, C>=20%    Catch everything early
  (*) Standard         N=3, C>=30%    Flag clear clusters  [DEFAULT]
  ( ) Precision        N=3, C>=50%    Only high-impact clusters
  ( ) Expert           N=4, C>=40%    Minimal interruption
  ( ) Custom           N=[_], C>=[_]% Set your own thresholds
----------------------------------------------
```

Each preset has a name, the two threshold values shown parenthetically, and a one-line description. The "Custom" option expands the full two-axis control described above.

The preset names carry meaning:
- **Vigilant** fires often with a low coverage bar -- for players who want early warning and will triage manually.
- **Standard** is the recommended default -- meaningful appearance count with a coverage floor that filters noise.
- **Precision** keeps the same N=3 appearance count but raises the coverage bar to 50% -- only clusters where the agent is responsible for at least half the analyzed problem space.
- **Expert** raises both bars -- minimal interruption, fires only when a single agent dominates the candidate pool at high coverage.

---

## Player Journeys

### Journey: Yuki, 16, Speed-runner / Optimizer -- The Coverage Gate Saves Her Sanity

**Context:** Yuki is the player from the 4.69a exploration who set her threshold to N=2 and then got overwhelmed by false positives. She has since raised N to 3, but she still encounters clusters that feel like noise. She runs a 20-agent config in Season 3, match 130. She runs career analyses every 15 matches. Her last four career analyses each flagged a different agent with 3 entries in the top 10 -- but in every case, the combined coverage of the cluster was under 20%. She applied the top fix each time and the cluster vanished. The flags were noise: an artifact of having many agents, each of which will randomly produce 3 tail entries in a sufficiently large candidate pool.

**Minute 0:00 -- Career Analysis Run #14**

Yuki clicks "Run Career Analysis." The spinner runs for 4 seconds. The result panel loads. She braces for the amber banner.

No banner appears.

She checks the candidate list:

```
#1   COMMAND-D priority depth    48%   (22/45)   [Apply Fix ->]
#2   SCOUT-A hook threshold      29%   (13/45)   [Apply Fix ->]
#3   RELAY-C context buffer      11%    (5/45)   [Apply Fix ->]
#4   RELAY-C fallback filter      7%    (3/45)   [Apply Fix ->]
#5   STRIKER-B patrol radius      6%    (3/45)   [Apply Fix ->]
#6   RELAY-C priority queue       5%    (2/45)   [Apply Fix ->]
#7   COMMAND-D response delay     4%    (2/45)   [Apply Fix ->]
#8   SCOUT-A buffer window        3%    (1/45)   [Apply Fix ->]
#9   RELAY-C timing offset        2%    (1/45)   [Apply Fix ->]
#10  STRIKER-B fallback rule      1%    (1/45)   [Apply Fix ->]
```

RELAY-C appears in positions 3, 4, 6, and 9. Four entries. That would have fired at N=3. But the amber banner didn't appear.

She looks for the suppression annotation. At the bottom of the panel, small gray text:

```
i  1 cluster suppressed (RELAY-C, 4 entries, combined coverage 19% < 30% threshold)
   [Show anyway ->]
```

Yuki reads it. Combined coverage 19%. She knows what that means now -- fixing all four RELAY-C entries would only improve 19% of her analyzed matches. The real signal is COMMAND-D at 48% and SCOUT-A at 29%. RELAY-C's four entries are noise.

She doesn't click "Show anyway." She applies fix #1 (COMMAND-D priority depth). The career analysis panel closes. She runs 15 more matches.

**Minute 0:45 -- The Next Run**

Career analysis #15. The banner fires this time:

```
! SCOUT-A multi-cluster detected
  3 elements -- combined coverage: 41%
  (vs. 29% from top fix alone -- +12pp architectural upside)
  [View Agent Audit ->]  [Skip -- apply #1 fix]
```

SCOUT-A has 3 entries in the top 10 with combined coverage 41%. Both gates pass: 3 >= 3 (appearance) and 41% >= 30% (coverage). Yuki reads the +12pp incremental. That is meaningful. She opens the audit.

The root cause section reads: "Dependency gap: SCOUT-A's attention filters are tuned for the signal profile RELAY-C was producing before Match 110. RELAY-C was rebuilt at Match 115. SCOUT-A has not been retuned."

Yuki's eyes narrow. She rebuilt RELAY-C 15 matches ago and didn't retune SCOUT-A. Classic cascading dependency. She clicks [Redesign SCOUT-A].

**Minute 12:00 -- Reflection**

After the redesign, Yuki thinks about the two-axis gate. The previous four career analyses all produced clusters that failed the coverage gate -- they were noise, and the coverage threshold correctly suppressed them. This career analysis produced a cluster that passed both gates -- it was real, and the flag correctly fired. The two-axis system caught the signal and filtered the noise.

She considers lowering her coverage threshold to 25% to catch slightly weaker clusters earlier. She opens settings, sees the preset labeled "Vigilant (N=2, C>=20%)" and thinks about switching. But 20% is too low -- she'd get the same noise problem. She switches to Custom and sets N=3, C>=25%.

**UI Annotations:**
- Suppression annotation uses a monospace `i` icon (not a warning triangle) to distinguish it from active flags. The gray text sits flush with the bottom edge of the career analysis panel, above the action buttons.
- The `[Show anyway]` link is a text-only affordance, no button chrome, further reducing its visual weight. Tapping it inserts the full flag card above the candidate list with a 200ms fade-in -- the flag renders identically to a normal flag except for a small "below threshold" label in the header.
- The coverage threshold value ("19% < 30%") is shown in the annotation so the player can immediately evaluate whether the suppression was correct without opening settings.

---

### Journey: Marcus, 34, Competitive RTS Player -- Tuning the Coverage Axis for Gauntlet Season

**Context:** Marcus is preparing for Gauntlet Season 5. He runs 16 agents. He has used the default Standard preset (N=3, C>=30%) for two seasons. He is now in a pre-Gauntlet tuning phase where he runs rapid career analyses every 10 matches to identify and fix problems before the competitive window opens.

**Minute 0:00 -- Pre-Gauntlet Career Analysis Sprint**

Marcus runs career analysis. The result loads. No flag. He checks the suppression annotation:

```
i  2 clusters suppressed
   RELAY-C: 3 entries, combined coverage 27% (< 30%)
   STRIKER-B: 3 entries, combined coverage 24% (< 30%)
   [Show details ->]
```

Two clusters, both just below the 30% threshold. Marcus thinks: in competitive Gauntlet, even 27% coverage from a structural problem is too much. A 27% structural issue means more than a quarter of his matches are being affected by an agent that needs holistic work. The 30% threshold is calibrated for season play, not for pre-tournament tuning.

He opens settings. He doesn't want to permanently lower the threshold -- after the Gauntlet, he'll want the noise filtering back. He checks if there's a phase-aware option (4.69h). There isn't one yet, but he sees the Custom option.

He sets N=3, C>=20%. The suppression annotation disappears. Two amber banners appear:

```
! RELAY-C multi-cluster detected
  3 elements -- combined coverage: 27%
  [View Agent Audit ->]

! STRIKER-B multi-cluster detected
  3 elements -- combined coverage: 24%
  [View Agent Audit ->]
```

He opens both audits in sequence. RELAY-C's root cause: "Buffer cascade -- small buffer forces conservative filter settings downstream." STRIKER-B's root cause: "Role drift -- patrol parameters tuned for open-field missions, current rotation is 60% urban."

He spends 25 minutes redesigning both agents. He deploys and runs 10 matches. Next career analysis: no clusters above 20%. Clean.

He resets his coverage threshold to 30% before the Gauntlet begins, keeping the noise floor higher during competitive play when he doesn't want diagnostic interruptions.

**Minute 30:00 -- The Gauntlet Begins**

During the Gauntlet's first 40 matches, one career analysis fires a cluster flag: COMMAND-D, 3 entries, combined coverage 38%. Both gates pass comfortably. Marcus opens the audit, reads the root cause ("dependency gap -- COMMAND-D hasn't been retuned since SCOUT-A v2.1"), and applies all three fixes. He doesn't redesign mid-tournament -- 38% combined is meaningful but the +8pp over the top fix alone doesn't justify the risk of an untested redesign in competition.

After the Gauntlet, he redesigns COMMAND-D. He notes that the two-axis gate performed correctly in both phases: it let through the pre-tournament clusters when he lowered the bar, and it correctly flagged the mid-tournament cluster without noise.

**UI Annotations:**
- When the player changes the coverage threshold, any currently-suppressed clusters are immediately re-evaluated. If the new threshold would un-suppress them, the flags appear with a 300ms slide-in animation from the right, sequenced 150ms apart if multiple flags appear simultaneously. This immediate re-evaluation feels responsive -- the player changes the threshold and instantly sees the consequence.
- The settings panel shows a "recently suppressed" counter next to the coverage threshold control: "Coverage threshold: 30% (2 clusters recently suppressed)." This counter helps the player gauge whether lowering the threshold would produce flags. If the counter is 0, lowering the threshold would change nothing.
- When the player restores the threshold to a higher value, a confirmation toast appears: "Coverage threshold raised to 30%. Clusters below this coverage will be suppressed in future analyses."

---

### Journey: Tomoko, 22, First-Time Player -- The Invisible Safety Net

**Context:** Tomoko is 20 matches into her first season. She has 4 agents, all loosely configured. She has run two career analyses. She has never seen a multi-cluster flag because the coverage gate has been silently suppressing every cluster her underdeveloped config produces.

**Minute 0:00 -- Career Analysis Run #3**

Tomoko clicks "Run Career Analysis." Results load:

```
#1   RELAY-C context buffer    34%   (10/30)   [Apply Fix ->]
#2   SCOUT-A hook threshold    28%    (8/30)   [Apply Fix ->]
#3   RELAY-C fallback filter   22%    (7/30)   [Apply Fix ->]
#4   SCOUT-A buffer window     18%    (5/30)   [Apply Fix ->]
#5   RELAY-C priority queue    15%    (4/30)   [Apply Fix ->]
```

Every agent appears multiple times. Without the coverage gate, the system would fire two multi-cluster flags (RELAY-C at 3 entries, SCOUT-A at 2 entries with N=2). With the default Standard gate (N=3, C>=30%), only RELAY-C is checked. RELAY-C has 3 entries with combined coverage approximately 52% (high overlap in the match sets).

The flag fires. Combined coverage 52% > 30%. Appearance count 3 >= 3. Both gates pass.

But wait -- is this the right moment for a first-time player to encounter multi-cluster detection? Tomoko's RELAY-C cluster isn't structural debt. It's the natural result of having an underdeveloped agent in a small config. Every agent in a 4-agent config will dominate the candidate list because there aren't enough agents to distribute the problem space.

**Minute 0:10 -- The Flag Fires (Correctly? Debatably.)**

The amber banner appears:

```
! RELAY-C multi-cluster detected
  3 elements -- combined coverage: 52%
  [View Agent Audit ->]  [Skip -- apply #1 fix]
```

Tomoko reads it. "Multi-cluster detected." She doesn't know what this means. She clicks [View Agent Audit]. The audit opens. She sees the combined coverage number (52%) and the root cause hypotheses. The first hypothesis reads: "Agent design last updated Match 1. Configuration is initial default and has not been revised."

She reads: "has not been revised." She hasn't revised *any* agent. They're all initial defaults. The root cause is correct -- but it is correct for every agent in her config. The flag is technically accurate and practically unhelpful: it tells a new player that their new agents are new.

She clicks [Dismiss]. She applies fix #1 (RELAY-C context buffer). She plays on.

**Minute 5:00 -- The Silent Wins**

Over the next 30 matches, Tomoko's config differentiates. She rebuilds SCOUT-A completely (the tutorial guides her through it). She adds two more agents. Her next career analysis: RELAY-C still appears 3 times, but the combined coverage has dropped to 26%. The coverage gate suppresses the flag. Tomoko sees a clean result list and applies the top fix.

The coverage gate has become her silent protector: as her config matures and the cluster's combined coverage drops (because other agents are now capturing more of the problem space), the flag naturally suppresses. She won't see another multi-cluster flag until a cluster genuinely represents a structural problem -- not just a new-player artifact.

**Minute 40:00 -- Season 2, The Real Cluster**

60 matches later, Tomoko has 7 agents. She runs career analysis. RELAY-C appears 3 times with combined coverage 44%. The flag fires. This time, the root cause reads: "Role drift -- RELAY-C has been used as both short-range relay and long-range scout since Match 35. These roles require conflicting parameter sets."

She reads "conflicting parameter sets." That clicks -- she has been assigning RELAY-C to contradictory tasks. She opens the redesign mode and splits RELAY-C into two agents.

The flag was silent for 40 matches while her config was immature. It fired when the cluster became architecturally meaningful. The coverage gate acted as a maturity filter.

**UI Annotations:**
- For players with < 30 matches, the suppression annotation is hidden entirely. A new player does not benefit from knowing that clusters were suppressed -- the concept requires understanding what clusters are and why they matter. The annotation becomes visible after the player's first non-suppressed cluster event (they have now seen a real flag and understand the concept).
- The root cause generator includes a "new agent" hypothesis only for agents that have never been redesigned. This hypothesis is phrased gently: "This agent uses its original configuration. Reviewing its settings may help." It does not use the word "structural" for configs that have never been revised -- the concept of structural debt only applies to configs that have been patched rather than rebuilt.

---

## Strengths and Weaknesses

**Strengths:**

- Eliminates the largest class of false positives in multi-cluster detection: the low-coverage tail cluster where one dominant entry is accompanied by statistically irrelevant echoes of the same agent name. The coverage gate filters these without the player needing to manually evaluate whether each cluster is meaningful.
- Creates a natural maturity filter for new players. Underdeveloped configs produce many low-coverage clusters; the coverage gate suppresses them silently, letting the flag fire only when the player's config has enough differentiation for a cluster to carry architectural meaning.
- The two-axis specification is composable: appearance threshold and coverage threshold can be tuned independently, and named presets collapse the 2D space into 4-5 ergonomic options. Players who never open settings get the correct default. Players who want precision can access both axes.
- The suppression annotation (Option B) preserves diagnostic transparency without adding noise. The player who wants to know whether clusters were suppressed can check the bottom of the panel. The player who doesn't care sees a clean result.
- Pre-tournament tuning becomes a deliberate act: lower the coverage threshold before the Gauntlet, raise it afterward. The two-axis system lets the player express "I want more diagnostic sensitivity right now" without permanently changing their noise floor.

**Weaknesses:**

- Adds a second threshold parameter that the player must understand (or trust the preset to handle). The cognitive load of "what is combined coverage?" on top of "what is multi-cluster detection?" is non-trivial. The first time a player encounters the suppression annotation ("combined coverage 22% < 30% threshold"), they must understand three concepts: clusters, combined coverage, and the threshold. This is a steep vocabulary ramp.
- The 30% default is a designer assertion, not a derived value. Why 30% and not 25% or 35%? The answer is that 30% represents "roughly a third of the analyzed match space is affected by this agent's cluster" -- a round, legible number. But the threshold will feel arbitrary to players who encounter it. Named presets partially mask this arbitrariness behind curated labels, but a player who opens Custom mode will confront the raw number.
- The coverage gate can suppress a genuine architectural problem in its early stages. A cluster with 3 entries and 28% combined coverage is below the 30% threshold -- but it may be a structural issue that will grow to 45% over the next 20 matches. By the time it passes the gate, the player has applied element-level fixes for 20 matches, deepening the whack-a-mole habit the flag was designed to interrupt. The coverage gate trades false negatives for false positive reduction.
- The interaction between the coverage gate and the candidate pool size creates a three-dimensional parameter space (N, C, pool size) that the UI must collapse into a manageable interface. Named presets handle this, but "Custom" mode could expose a confusing control surface.
- The pre-computation requirement for the coverage gate means the career analysis engine must always compute combined coverage for detected clusters, even though most clusters will be suppressed. This is a performance cost paid on every career analysis run, not just when the flag fires. (See 4.69b for the eager vs. on-demand tradeoff -- the coverage gate effectively forces the eager approach, since the gate must be evaluated before the UI renders.)

---

## Interaction Effects

### With 4.69a -- Multi-Cluster Threshold Configurability

The coverage threshold is the second axis of the configuration described in 4.69a. The two axes are orthogonal: N controls how many times an agent must appear; C controls how much of the match space that cluster must cover. A player on N=2 (hyper-sensitive) with C>=30% will see fewer false positives than N=2 alone -- the coverage gate filters out the 2-entry clusters that cover 12% of matches. A player on N=4 with C>=any has effectively disabled the coverage gate -- four appearances is already a strong enough signal that coverage filtering is redundant.

The interaction creates a natural hierarchy: at low N, the coverage gate does heavy lifting (most of the filtering); at high N, the coverage gate is nearly inactive. This means the coverage threshold matters most for N=2 and N=3 players, and least for N=4+ players. The UI should reflect this: when the player selects N=4, the coverage threshold control could dim slightly or show a note: "At this appearance threshold, most detected clusters will exceed the coverage minimum."

### With 4.69b -- Combined Agent Coverage Score Display

The combined coverage display (4.69b) and the combined coverage gate (4.69i) share the same underlying computation. The coverage gate uses the combined coverage number as a *filter input*; the coverage display uses it as a *player-facing output*. When the gate suppresses a flag, the coverage number appears in the suppression annotation. When the gate passes and the flag fires, the coverage number appears in the flag header. The same number serves dual purposes: gating and display.

This dual use creates a design constraint: the combined coverage number must be computed eagerly (before the flag renders) regardless of whether the display would use on-demand computation. The coverage gate eliminates Option 2 (lazy on-demand) from 4.69b's design space -- or at least requires a hybrid where the gate computation is eager but the full display in the audit panel is optional.

### With 4.69h -- Threshold Preset Profiles Per Config Phase

Phase-aware presets (4.69h) interact with the two-axis gate by allowing different (N, C) pairs for different career phases. A pre-tournament phase might use (N=2, C>=20%) for maximum sensitivity. A mid-tournament phase might use (N=3, C>=40%) for minimum noise. The phase transitions automatically adjust both thresholds. This makes the two-axis system more powerful (phase-appropriate calibration) but also more complex (the player must understand that phase transitions change *two* settings, not one).

### With 4.69d -- Multi-Cluster Persistence Tracking

Persistence tracking records how many times each agent has triggered multi-cluster across career analyses. The coverage gate affects which clusters count toward persistence: only clusters that pass both gates increment the persistence counter. A cluster that fires at N=3 but is suppressed at C<30% does NOT increment RELAY-C's persistence score. This is by design -- a low-coverage cluster shouldn't count as a "persistent structural problem." But it means that an agent with a gradually growing problem (coverage increasing from 20% to 25% to 28% to 32% across four analyses) will have zero persistence history until the fourth analysis, when it suddenly appears as a new concern with no track record.

The fix: track *suppressed* clusters in a secondary persistence log. The persistence panel could show: "RELAY-C: 1 flagged cluster, 3 suppressed clusters (trending: 20% -> 25% -> 28% -> 32%)." The suppressed cluster trend tells the player: this agent has been near the threshold for three analyses and just crossed it. The structural issue is not new -- it's been developing.

### With 4.59 -- Career Minimum Fix

The career minimum fix finds the single best config change. The multi-cluster flag interrupts this framing to suggest holistic thinking. The coverage gate ensures the interruption only happens when the holistic perspective is worth the player's time. If the combined coverage of a cluster is 18%, the holistic perspective is not worth pursuing -- the top fix captures most of the value. The coverage gate protects the career minimum fix's primacy for low-impact clusters while allowing the multi-cluster flag to override for high-impact ones.

---

## Comparable Games / Media

### Grafana Alerting -- Composite Alert Rules

Grafana supports composite alert conditions: "fire alert when CPU > 80% AND memory > 70%." Both conditions must be true. This is the direct analog of the two-axis gate: one threshold measures frequency (how often does the agent appear?), the other measures magnitude (how much of the problem space is affected?). SRE teams use composite rules to avoid waking up engineers for high-frequency, low-impact events -- exactly the false positive class the coverage gate eliminates.

### Factorio -- Logistics Network Threshold Pairs

Factorio's logistics network allows setting both a "request threshold" (how many items to request) and a "trash threshold" (when to return items). These are two-axis controls on the same system: request controls *when to pull*, trash controls *when to push*. Players who set only one get reasonable behavior. Players who tune both get precise control. The parallel to the cluster gate is structural: the appearance threshold controls *when to detect*, the coverage threshold controls *when to act on detection*.

### Hearthstone Deck Trackers -- Win Rate Minimum for Card Recommendations

Third-party Hearthstone trackers like HSReplay only surface card swap recommendations when the card in question has been drawn in at least N games AND has a win rate impact of at least X percentage points. Cards drawn only twice or with marginal impact are filtered from recommendations. This is a two-axis gate identical in spirit to the combined coverage minimum: frequency of observation (N games) and magnitude of impact (X percentage points) must both exceed thresholds before a recommendation surfaces.

### Medical Diagnostics -- Sensitivity/Specificity Tradeoff

The two-axis threshold is a sensitivity/specificity dial. The appearance threshold (N) controls sensitivity: lower N catches more clusters but includes more noise. The coverage threshold (C) controls specificity: higher C ensures flagged clusters are clinically significant. The named presets are analogous to medical screening protocols that set different sensitivity/specificity tradeoffs for different populations (routine screening vs. diagnostic follow-up).

---

## Sensory Description

**The suppression annotation:**

The suppression annotation sits at the bottom of the career analysis panel, flush with the lower edge, in a single line of 12px text rendered in medium gray (#9CA3AF). The text begins with a lowercase "i" in a circle -- a hairline-weight info icon, not a warning icon. The icon is the same gray as the text, not amber. The annotation does not draw the eye; it is discoverable by players who scan the full panel, invisible to players who focus on the candidate list. When the player hovers over the annotation (desktop) or taps it (mobile), it expands to show the full suppression details: agent name, entry count, combined coverage, and the threshold it fell below. The expansion is a 150ms vertical unfold, revealing one or two additional lines of text. The `[Show anyway]` link appears at the end of the expanded annotation, underlined, in the same gray -- a text link, not a button.

**The coverage threshold in the settings panel:**

The coverage threshold control sits directly below the appearance threshold radio buttons, separated by a thin 1px divider in light gray (#E5E7EB). The divider says "these are two settings" without creating visual distance. The coverage options use the same radio button style as the appearance options -- consistent material, consistent interaction. When the player selects a coverage threshold, the summary sentence at the bottom of the card updates with a 200ms cross-dissolve: the old sentence fades to 0% opacity over 100ms while the new sentence fades in from 0% over the next 100ms. The sentence always reads as a single conjunction: "flag fires when same agent appears [N]+ times AND combined coverage >= [C]%."

**The named presets:**

Each preset option in the radio group is rendered as a card-style row, 48px tall, with the preset name on the left in 14px semi-bold, the threshold values in 12px regular weight to the right of the name, and the one-line description below in 12px italic gray. The selected preset has an amber left-border accent (3px wide, amber #FFB347) that replaces the default transparent border. The amber accent visually links the preset selection to the amber cluster flags -- the same color vocabulary used in the diagnostic system itself. Switching presets triggers the left-border accent sliding from the old preset to the new one with a 200ms ease-out transition, creating a smooth "selection migration" rather than an instant jump.

**Audio for suppression:**

When a cluster is suppressed by the coverage gate, no audio cue plays. Silence is the correct sound for suppression -- the absence of the cluster chime (the rising minor-third D-to-F described in 4.69) tells the player with trained ears that no cluster was detected. The suppression annotation is purely visual. If the player clicks `[Show anyway]` and the suppressed flag expands, the cluster chime plays at 60% volume -- quieter than a normal flag, signaling "this is below threshold but here it is." The reduced volume creates a sensory distinction between genuine flags (full volume chime) and overridden suppressions (muted chime).

**The moment of re-evaluation:**

When the player changes the coverage threshold in settings and a suppressed cluster is re-evaluated and un-suppressed, the flag card enters from the right with the standard 200ms easing curve and the cluster chime plays at full volume. The transition from suppression to active flag is immediate and unmistakable: the annotation at the bottom of the panel dissolves (it is no longer suppressed), and the amber banner appears at the top. The player's threshold change has materialized a diagnostic that was previously invisible. The visual and audio weight of this moment -- a flag appearing from nothing -- reinforces that the threshold is a real lever with real consequences. The player has just pulled a diagnostic out of the noise floor by adjusting their instrument's sensitivity.

---

## New Aspects Discovered

- **4.69m -- Suppressed cluster trend tracking:** tracking the combined coverage of suppressed clusters across career analyses to detect gradually growing problems that approach the coverage threshold from below. The "near-threshold trend" as an early warning within the early warning system. Interaction with 4.69d persistence tracking.
- **4.69n -- Coverage gate auto-suggestion based on config maturity:** the system monitors the player's false positive rate (how often they dismiss flags without acting) and suggests coverage threshold adjustments. "You've dismissed 3 of your last 4 cluster flags. Consider raising the coverage threshold to 40%." The inverse of 4.69a's auto-calibration, applied to the second axis.
- **4.69o -- Composite gate visualization in the candidate list:** rendering the two-axis gate status directly on each cluster in the candidate list -- a small badge showing "3 entries / 41% combined" next to the cluster bracket, with the badge turning amber when both gates pass and staying gray when one fails. Visual shorthand for the two-axis evaluation without requiring the player to read the suppression annotation.
- **4.69p -- Coverage gate interaction with cross-mission pattern detection:** lowering the effective coverage threshold when cross-mission pattern detection (4.49) also flags the same agent. A cluster at 25% combined coverage that also appears in cross-mission data has stronger evidence than coverage alone suggests. Composite evidence scoring across detection systems.
