# Threshold Preset Profiles per Config Phase

**Aspect:** 4.69h — Threshold preset profiles per config phase: different multi-cluster thresholds for different career phases (early season N=4 to avoid noise; late season N=2 to catch architectural drift before finals); a "phase-aware" threshold that auto-shifts as the season progresses.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69g — Agent cluster career stats
**Related:** 4.25 — EDT trajectory as career metric; 4.68 — Coverage percentage as season health; campaign progression system; 4.69d — Multi-cluster persistence tracking

---

## The Core Problem

The multi-cluster threshold (N) is currently a static number. The player picks N=3 and it stays N=3 whether they are in Match 5 of a fresh season or Match 280 grinding toward a Gauntlet finals berth. But the *meaning* of a multi-cluster event changes dramatically depending on where the player is in their season arc.

**Early season (Matches 1-40): everything clusters.** The player is building new agents, experimenting with roles, iterating on context buffer sizes. Their config is in flux. Multi-cluster events at this stage are almost always noise: every agent has problems because no agent is finished yet. A threshold of N=3 fires constantly because the entire config is underdeveloped. The player learns to dismiss the flag reflexively. By the time the flag becomes meaningful (Match 80+), they have already trained themselves to ignore it.

**Mid-season (Matches 40-150): the signal window.** The player's config has stabilized. Agents have differentiated roles. When RELAY-C appears in 3 of the top 10 candidates now, it genuinely means RELAY-C has a structural problem. This is where N=3 earns its keep. But the player who was conditioned to dismiss the flag in Matches 1-40 may continue dismissing through the signal window.

**Late season (Matches 150+): precision matters.** The player is heading toward Gauntlet qualifiers or season-end evaluations. Their config should be robust. Even a 2-entry cluster from a single agent is a signal worth examining — it could indicate the early stages of architectural drift that will compound into a liability during the high-pressure finals bracket. The threshold should arguably *lower* as the season progresses, because the stakes of missing a structural problem increase while the baseline noise of config instability decreases.

**The fundamental tension:** a static threshold cannot serve all three phases simultaneously. The threshold that prevents early-season noise (N=4) misses late-season drift. The threshold that catches late-season drift (N=2) drowns the player in early-season false positives. And the "compromise" setting (N=3) is a compromise — it is mediocre at both ends.

Phase-aware threshold presets solve this by making the threshold a function of time, not just a fixed preference. The game says: "I know where you are in your season, and I will calibrate my diagnostic sensitivity accordingly."

---

## The Design

### The Season Phase Model

The game divides a season into three named phases. These phases are not arbitrary time windows — they are defined by observable player behavior milestones:

```
Phase 1: FOUNDRY        Matches 1–40 (or until 80% of roster slots are filled)
Phase 2: FORGE          Matches 41–150 (or until the player's coverage trend
                         shows 3+ consecutive declines)
Phase 3: PROVING GROUND Matches 151+ (or once the player enters Gauntlet
                         qualifying bracket)
```

The phase boundaries shift based on player behavior, not just match count. A player who fills all roster slots by Match 15 exits FOUNDRY early. A player who enters Gauntlet at Match 120 enters PROVING GROUND early. The match-count ranges are defaults for players whose behavior does not trigger early transitions.

### The Phase-Aware Threshold Profile

Each phase carries a default multi-cluster threshold:

| Phase | Default N | Rationale |
|-------|-----------|-----------|
| FOUNDRY | N=4 | Suppress noise during config construction. Only fire when clustering is extreme (4+ entries = 40% of top-10 pool). |
| FORGE | N=3 | Standard diagnostic sensitivity. The config is stable enough for structural diagnosis. |
| PROVING GROUND | N=2 | Maximum sensitivity. Catch drift early before it compounds in high-stakes matches. |

The profile is displayed in the Career Analysis settings panel as a named configuration:

```
Multi-cluster detection mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ● Season Profile   (auto-adjusts by phase)
  ○ Fixed threshold   (same N all season)

  Current phase: FORGE (Match 87)
  Active threshold: 3+ appearances

  ┌────────────────────────────────────────────┐
  │  FOUNDRY ───── FORGE ───── PROVING GROUND  │
  │   N=4           N=3●          N=2          │
  │  (M1-40)       (M41-150)    (M151+)        │
  └────────────────────────────────────────────┘

  Phase transitions are based on match count and behavior milestones.
  [Customize phase thresholds →]
```

The visual centerpiece is the **Phase Timeline** — a horizontal bar divided into three labeled segments. The player's current position is marked with a filled dot on the timeline, showing them exactly where they are and what threshold is active. The upcoming phase boundary is visible ahead, creating anticipation: "In 63 matches, my threshold drops to N=2."

### The Customizable Profile

Players can override the default thresholds for each phase:

```
Customize phase thresholds
━━━━━━━━━━━━━━━━━━━━━━━━━━
  FOUNDRY:         [3] [4●] [5] [Off]
  FORGE:           [2] [3●] [4] [Off]
  PROVING GROUND:  [2●] [3] [4] [Off]

  [Reset to defaults]
```

Each phase has its own threshold selector. The current-phase selector is highlighted with a subtle border glow to indicate "this is what is active right now." The selectors are pill buttons — compact, one-tap, visually distinct from each other.

A player might set FOUNDRY to Off (no flags during construction), FORGE to N=3, and PROVING GROUND to N=2. Or a competitive player might set all three to N=2 — effectively disabling the phase system and running at maximum sensitivity the entire season. The system accommodates both playstyles without judgment.

### Phase Transition Notification

When the player crosses a phase boundary, a brief in-context notification appears at the top of the next career analysis result:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase transition: FOUNDRY → FORGE
Multi-cluster sensitivity increased: 4+ → 3+ appearances
Your config has stabilized enough for structural diagnostics.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This notification is not a modal — it is a banner that sits above the career analysis results and fades after 10 seconds (or on scroll). It exists to prevent confusion: the player who has been running at N=4 for 40 matches suddenly sees a cluster flag for the first time. Without the phase transition notification, they might think something broke. With it, they understand: the game recalibrated its sensitivity because their season has progressed.

### Behavior-Triggered Transitions

The match-count boundaries are fallbacks. The actual phase transitions are triggered by behavior signals:

**FOUNDRY -> FORGE transition triggers (first to fire wins):**
- 80% of available roster slots are filled with deployed agents
- The player has run 3+ career analyses
- Match count reaches 40
- The player's coverage trend shows its first decline (indicating the config is stabilizing)

**FORGE -> PROVING GROUND transition triggers:**
- The player enters Gauntlet qualifying bracket
- Match count reaches 150
- The player achieves their first "debt-free" run (coverage < 20%)
- The player's eEDT (30-match rolling average) exceeds 0.45 for 10+ consecutive matches

These triggers are logged in the season timeline. The player can inspect why a transition fired:

```
Phase transition log
━━━━━━━━━━━━━━━━━━━
Match 34: FOUNDRY → FORGE
  Trigger: 80% roster slots filled (8/10 deployed)
  Match-count default would have fired at Match 40

Match 142: FORGE → PROVING GROUND
  Trigger: Entered Gauntlet qualifying bracket
  Match-count default would have fired at Match 150
```

---

## Player Journeys

#### Journey: Dani, 23, Former League of Legends player

**Context:** Dani is starting Season 3 fresh. She reset her roster after a rough Season 2 Gauntlet run and is rebuilding from scratch. She has experience with multi-cluster detection and knows it tends to fire constantly during her early-season builds. Last season she set the threshold to N=4 manually and forgot to change it back before Gauntlet, missing a critical RELAY-B drift.

**Minute 0:00 — Season Start, Match 1**
Dani opens her career analysis settings before running her first match. She sees a new option she has not encountered before: "Season Profile (auto-adjusts by phase)." The Phase Timeline shows three segments. She is at the very start of FOUNDRY. Active threshold: N=4.

She hovers over the timeline. A tooltip reads: "Your threshold will decrease as your season progresses. FOUNDRY (N=4) suppresses noise while you build. FORGE (N=3) enables structural diagnostics. PROVING GROUND (N=2) catches late-season drift."

She selects "Season Profile" and starts playing.

**Minute 12:00 — Match 18, Career Analysis Run #2**
Dani runs career analysis. She has 4 agents deployed, all rough drafts. The candidate list shows RELAY-A appearing in 3 of the top 10. Under a fixed N=3, this would flag. Under the FOUNDRY phase (N=4), no flag fires.

She notices the absence of the flag. In Season 2, she would have seen the amber banner here and dismissed it with annoyance. The absence feels clean. She applies the top fix and keeps building.

At the bottom of the career analysis panel, a subtle note reads: "1 cluster suppressed by FOUNDRY phase threshold (N=4). Switch to FORGE sensitivity to see it." She ignores this — she is building, not diagnosing.

**Minute 45:00 — Match 36, Phase Transition**
Dani has deployed her 8th agent, filling 80% of her 10-slot roster. She runs career analysis. A new banner appears at the top of the results:

```
Phase transition: FOUNDRY → FORGE
Multi-cluster sensitivity increased: 4+ → 3+ appearances
```

Below the banner, the career analysis results load. For the first time this season, a multi-cluster flag fires:

```
RELAY-A appears in 3 of your top 10 candidates.
```

Dani does not dismiss it reflexively. She has not been conditioned to ignore the flag this season — it has been silent for 36 matches. The flag feels *new* even though she has seen it many times before. The FOUNDRY phase protected the flag's credibility.

She clicks View Agent Audit. RELAY-A was her first draft agent, built at Match 2. It has not been touched since. The root cause reads: "Role drift: RELAY-A was designed for 2-agent relay chains. Current config uses 4-agent relay chains. All three clustered elements are downstream of the original chain-length assumption."

She clicks Redesign. This is the first redesign of Season 3 — and it feels intentional, not reactive.

**Minute 90:00 — Match 148, Second Phase Transition**
Dani enters Gauntlet qualifying at Match 148. A phase transition notification fires: FORGE to PROVING GROUND. Threshold drops to N=2. She sees this and thinks: "Good. I want to catch everything before the bracket starts."

Over the next 15 matches, N=2 fires twice. Both are legitimate early-drift signals on COMMAND-B and STRIKER-D. She catches them before her first Gauntlet match. In Season 2, she would have missed both — her static N=4 would not have flagged either one.

**What Dani experienced:** The phase system preserved the flag's credibility by silencing it during the FOUNDRY phase, then activated it at the moment her config was stable enough for the signal to matter. The PROVING GROUND drop to N=2 caught drift that Season 2's static threshold missed.

---

#### Journey: Hiroshi, 41, Civil engineer, methodical optimizer

**Context:** Hiroshi is midway through Season 4, Match 95. He has been using the Season Profile since it was introduced. He likes the phase system conceptually but disagrees with the default PROVING GROUND threshold of N=2 — he finds it too aggressive for his 14-agent config. He wants to customize the profile.

**Minute 0:00 — Opening Settings**
Hiroshi opens Career Analysis settings. The Phase Timeline shows him in FORGE, N=3 active. He clicks [Customize phase thresholds]. The three-row selector appears.

He changes PROVING GROUND from N=2 to N=3. He reasons: "With 14 agents, 2 appearances in the top 10 is expected variance. I want N=3 even in the final phase."

The Phase Timeline updates. The third segment now reads "N=3" instead of "N=2." A subtle annotation appears below the timeline: "Custom profile active. Your PROVING GROUND threshold differs from the default." The annotation is informational, not judgmental — it does not say "warning" or suggest the default is better.

**Minute 8:00 — Career Analysis Run #7**
Career analysis runs. No multi-cluster flag. The candidate list shows SCOUT-C appearing twice in the top 10. At the default N=2 for PROVING GROUND, this would flag in 56 matches when Hiroshi enters that phase. At his customized N=3, it will not.

He is comfortable with this trade-off. He has a different diagnostic habit: he manually scans the candidate list for agent name repetitions every career analysis, regardless of the flag. The flag is a backup for him, not a primary signal.

**Minute 30:00 — Match 155, Entering PROVING GROUND**
The phase transition fires. Hiroshi sees the notification: "Multi-cluster sensitivity: 3+ appearances (custom)." The word "custom" reminds him that he overrode the default. He does not change it.

Over 40 matches in PROVING GROUND, no multi-cluster flag fires. Hiroshi's manual scanning catches one instance of RELAY-D appearing twice — he investigates manually and finds it is noise (RELAY-D was recently updated, and the two candidate entries are both minor parameter tweaks from the update). He is satisfied that N=3 was the right choice for his config density.

**Minute 55:00 — Post-Season Review**
After the season ends, Hiroshi opens his phase transition log. He reads:

```
Season 4 Phase Transition Log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Match 1-38: FOUNDRY (N=4)
  Clusters suppressed: 6
Match 38-155: FORGE (N=3)
  Clusters flagged: 2 (RELAY-A Match 72, COMMAND-B Match 118)
  Clusters suppressed at N=2: 4 (would have flagged at default PROVING GROUND)
Match 155-290: PROVING GROUND (N=3, custom)
  Clusters flagged: 0
  Clusters suppressed at N=2: 3 (would have flagged at default)
```

He sees the "clusters suppressed at N=2" count. Three clusters would have fired in PROVING GROUND under the default setting. Were any of them real? He clicks the suppressed entries to inspect them. Two were noise (recently-updated agents). One was a genuine STRIKER-E drift that he caught manually at Match 230 and fixed then.

He considers: would catching STRIKER-E 10 matches earlier (when the N=2 flag would have fired at Match 220) have mattered? He checks the match log. He lost 2 of 10 Gauntlet matches in that window where STRIKER-E was drifting. Those 2 losses did not eliminate him from the bracket. He decides N=3 was acceptable for this season.

**What Hiroshi experienced:** The customizable profile let him tailor the phase system to his config density without losing the phase-progression concept entirely. The post-season log gave him retrospective evidence to evaluate his choice.

---

#### Journey: Tomas, 15, Speedrunner archetype, plays in 2-hour bursts

**Context:** Tomas plays aggressively. He burns through 20 matches per session, runs career analysis every 15 matches, and tries to reach Gauntlet qualifying by Match 80. He has never used the Season Profile — he runs a fixed N=2 threshold because he wants maximum diagnostic sensitivity at all times. He discovers the Season Profile in a settings menu update.

**Minute 0:00 — Discovering Season Profile**
Tomas opens settings and sees "Season Profile (auto-adjusts by phase)." He reads the Phase Timeline. FOUNDRY: N=4. He laughs. "N=4? I want N=2. Why would I ever want less sensitivity?"

He leaves the setting on "Fixed threshold" at N=2 and returns to playing.

**Minute 15:00 — Match 12, The Noise Problem**
Tomas runs his first career analysis of the season. He has 6 agents deployed. Multi-cluster flags fire for RELAY-B (2 entries), SCOUT-A (2 entries), and STRIKER-C (2 entries). Three flags simultaneously. He dismisses all three without reading them.

He runs 15 more matches. Career analysis again. Four flags this time. He dismisses all four.

**Minute 35:00 — Match 42, The Real Signal Buried**
Career analysis. Three flags fire. One of them is RELAY-B with 4 entries in the top 10 — a genuine catastrophic cluster. But Tomas has been dismissing flags for 30 matches. He dismisses all three without distinguishing the 4-entry cluster from the 2-entry noise.

He applies the #1 fix (RELAY-B context buffer, 58% coverage). He does not redesign. Over the next 30 matches, RELAY-B continues to degrade. His Gauntlet qualifying run fails partly because RELAY-B's structural weakness was never addressed.

**Minute 60:00 — Post-Gauntlet Reflection**
After his elimination, Tomas opens the career analysis history. He sees that RELAY-B triggered multi-cluster in 6 consecutive career analyses, escalating from 2 entries to 5 entries. He dismissed every one.

He wonders: would the Season Profile have helped? He opens settings and reads the FOUNDRY description: "N=4 suppresses noise while you build." If he had been on Season Profile, the first 3 career analyses (during FOUNDRY) would not have flagged the 2-entry noise. When FORGE activated at Match 34 (he filled 80% of his roster at Match 31), the N=3 threshold would have started flagging. And at that point, RELAY-B had already accumulated 3 entries — the first FORGE flag would have been the real signal, not buried in noise.

He switches to Season Profile for Season 5. He customizes it: FOUNDRY=Off (he does not want any flags while building), FORGE=N=3, PROVING GROUND=N=2. This gives him complete silence during construction, standard diagnostics during refinement, and his preferred hyper-sensitivity for Gauntlet prep.

**What Tomas learned:** Fixed N=2 created a boy-who-cried-wolf problem. The phase system would have preserved the flag's signal by silencing it during the high-noise FOUNDRY period, making the first real flag in FORGE impossible to ignore because it would have been the first flag of the season.

---

## Strengths and Weaknesses

**Strengths:**

- **Solves the notification fatigue bootstrap problem.** The most damaging outcome of multi-cluster detection is not that the flag fires too rarely — it is that the flag fires too often during early season, conditions the player to dismiss reflexively, and then fails to interrupt when the signal is real. Phase-aware thresholds prevent the conditioning loop from forming.
- **Teaches season arc implicitly.** The phase names (FOUNDRY, FORGE, PROVING GROUND) communicate that a season has structure — building, then refining, then stress-testing. New players absorb this arc just by reading the Phase Timeline, even if they never think explicitly about season pacing.
- **Behavior-triggered transitions are legible.** Because the transitions are triggered by observable milestones (roster fill, Gauntlet entry, coverage decline), the player can reason about *why* the transition happened. It is not arbitrary.
- **Customization preserves agency.** The player can override any phase threshold, disable the system entirely, or set all phases to the same value. The system is opinionated by default but deferential to player preference.
- **The post-season transition log is a career artifact.** The log of "clusters suppressed at lower thresholds" gives the player retrospective evidence to evaluate their threshold choices, creating a feedback loop on diagnostic calibration itself.

**Weaknesses:**

- **Added complexity in an already complex settings space.** Multi-cluster detection already has threshold configurability (4.69a), candidate pool size, suppression logic, and persistence tracking. Adding a three-phase profile with customizable per-phase thresholds adds a 3x multiplier to the parameter space. Most players will never touch the customization and will run the defaults — which is fine, but the settings panel becomes denser for those who do explore.
- **Phase boundary disputes.** A player who fills 80% of roster slots at Match 12 (because they rapidly deploy rough agents) enters FORGE extremely early, possibly before any agent is ready for structural diagnosis. The behavior triggers can misfire when player tempo deviates from the expected arc. The match-count fallback mitigates this but introduces a hidden "minimum phase duration" that may confuse speed players.
- **The FOUNDRY phase may suppress genuinely useful early signals.** A player who builds one agent carefully and deploys it fully-realized at Match 5 would benefit from N=2 sensitivity on that one agent immediately. But the FOUNDRY phase sets N=4, silencing the flag. The phase system optimizes for the median new-season experience, not the exceptional one.
- **Three phases may not be enough.** A player might want FOUNDRY -> FORGE -> REFINEMENT -> PROVING GROUND, with a fourth phase between mid-season stability and Gauntlet prep. The three-phase model is a simplification that may need expansion as the campaign system matures.

---

## Interaction Effects

### With 4.69a — Multi-Cluster Threshold Configurability

The phase profile system is an extension of 4.69a, not a replacement. A player on "Fixed threshold" (the 4.69a design) ignores the phase system entirely. A player on "Season Profile" uses phase-aware thresholds that internally map to the same N values that 4.69a defines. The two systems share the same underlying threshold mechanic — the phase profile is a *scheduling layer* on top of the threshold configurability.

The settings panel must present these as a clean either/or: "Season Profile" vs. "Fixed threshold." The player should never have to set both a fixed threshold AND per-phase thresholds simultaneously.

### With 4.69g — Agent Cluster Career Stats

Agent cluster career stats track per-agent multi-cluster frequency over the player's career. The phase system adds context to these stats: a cluster event during FOUNDRY (high threshold) is more significant than a cluster event during PROVING GROUND (low threshold), because the high-threshold event means the clustering was severe enough to break through a lenient filter. The career stats display should annotate each cluster event with the phase and threshold active at the time:

```
RELAY-C cluster history:
  Match 22 — FOUNDRY (N=4), 4 entries  ← severe
  Match 78 — FORGE (N=3), 3 entries    ← standard
  Match 195 — PROVING GROUND (N=2), 2 entries  ← early catch
```

### With 4.25 — EDT Trajectory

The EDT trajectory (30-match rolling average) is one of the behavior triggers for the FORGE -> PROVING GROUND transition (eEDT > 0.45 for 10+ consecutive matches). This creates a feedback loop: as the player's architectures improve (higher eEDT), the game increases diagnostic sensitivity (lower threshold), which catches problems earlier, which helps maintain the improved eEDT. The phase system and the EDT trajectory form a positive reinforcement cycle.

### With 4.68 — Coverage Percentage as Season Health

The coverage trend is a behavior trigger for the FOUNDRY -> FORGE transition (first coverage decline = config is stabilizing). This means the coverage trend and the phase system are mechanically linked. A player who watches their coverage sparkline can predict when the phase transition will fire, creating a moment of anticipation: "My coverage dropped for the second time — I should be entering FORGE soon."

### With Campaign Progression System

For players in campaign mode (not free-play), the season phases may align with campaign chapter boundaries. If the campaign has a three-act structure, the phase names could map to acts: FOUNDRY = Act 1 (setup), FORGE = Act 2 (rising action), PROVING GROUND = Act 3 (climax). This creates a structural resonance between the narrative arc and the diagnostic arc — the game's diagnostic tools tighten as the stakes rise, matching the dramatic pacing.

---

## Comparable Games/Media

**Chess.com Accuracy by Time Control.** Chess.com's accuracy metric behaves differently in bullet (1 minute), blitz (5 minutes), and rapid (15 minutes) games. The engine evaluation accounts for the time pressure the player was under. A 78% accuracy in bullet is more impressive than a 78% accuracy in rapid. The phase-aware threshold has the same spirit: the "meaning" of a cluster event depends on the temporal context (early season vs. late season), so the system adjusts its evaluation criteria accordingly.

**Ironman Mode in Paradox Grand Strategy Games.** Paradox games (Crusader Kings, Europa Universalis) have a concept where save-scumming is disabled, forcing the player to live with consequences. The PROVING GROUND phase has a similar escalation of commitment: as the season progresses, the diagnostic tools become more aggressive, and the player can no longer ignore structural problems by dismissing flags. The game tightens the feedback loop as stakes rise.

**Monitoring Alert Severity Escalation (PagerDuty).** In SRE practice, alert severity escalates over time. A warning that persists for 30 minutes becomes a page. A page that persists for 2 hours becomes a critical incident. The phase-aware threshold follows the same pattern: early-season problems are "informational" (suppressed at N=4), mid-season problems are "warnings" (flagged at N=3), late-season problems are "critical" (flagged aggressively at N=2). The escalation communicates urgency through timing.

**Training Periodization in Athletic Coaching.** In sports science, training is divided into phases: base-building (volume), intensification (intensity), and peaking (competition preparation). Each phase has different diagnostic thresholds for fatigue and injury risk. During base-building, mild soreness is ignored. During peaking, any signal of overtraining triggers immediate intervention. The FOUNDRY/FORGE/PROVING GROUND phases mirror this periodization — different phases require different diagnostic sensitivity because the cost of missing a problem varies by phase.

---

## Sensory Description

### The Phase Timeline

The Phase Timeline is a horizontal bar spanning the full width of the settings card, approximately 280px wide and 48px tall. It is divided into three segments of unequal width: FOUNDRY occupies roughly 20% of the bar (reflecting its shorter duration), FORGE occupies roughly 50%, and PROVING GROUND occupies roughly 30%.

Each segment has a distinct background color gradient:
- **FOUNDRY:** A cool steel blue (#4A6B8A) fading to a slightly warmer blue-gray. The color evokes raw material — unfinished, potential-rich, not yet shaped.
- **FORGE:** A warm amber-orange (#C4853A) — the same amber palette used by the multi-cluster flag itself, creating a visual connection between "this is the phase where flags matter" and the flag color.
- **PROVING GROUND:** A deep crimson-bronze (#8B3A3A) that conveys weight and consequence. Not alarming, but serious — the visual equivalent of a room where important decisions happen.

The player's current position is marked by a white dot with a subtle drop shadow, positioned proportionally along the timeline based on match count within the current phase. The dot pulses gently (1.2-second sine wave, 10% opacity variation) to draw the eye without demanding attention. A thin vertical line extends from the dot down to a small label showing the current match number and active threshold: "M87 / N=3."

The phase boundaries are marked by thin white vertical lines with small diamond-shaped junction marks where the segments meet. When the player approaches a phase boundary (within 5 matches of the transition), the upcoming junction mark begins to glow — a slow pulse in the color of the upcoming phase, signaling the impending transition.

### Phase Transition Moment

When a phase transition fires, the Phase Timeline animates. The junction diamond between the old and new phases expands briefly (200ms) to twice its size, emits a circular ripple in the new phase's color, then contracts back. The white position dot slides smoothly to the start of the new segment over 400ms. The old segment's color desaturates slightly (10% desaturation) as if receding into the past.

Simultaneously, the transition banner fades in from the top of the career analysis panel over 300ms. The banner's background color matches the new phase: amber for FORGE, crimson-bronze for PROVING GROUND. The text is white, clean, sans-serif. The banner holds for 10 seconds, then fades to 30% opacity and remains as a thin collapsed strip at the top of the panel until the player scrolls or dismisses.

### Audio

The phase transition produces a distinctive audio signature — a three-note ascending chord.

**FOUNDRY -> FORGE:** The notes are D4, F#4, A4 (D major triad) — warm, constructive, like a forge igniting. The attack is soft (piano), the sustain is moderate (600ms per note), and the notes overlap into a chord. This is the "your config is ready for diagnosis" sound.

**FORGE -> PROVING GROUND:** The notes are A3, C#4, E4 (A major, lower register) — deeper, weightier, with a subtle sub-bass undertone that vibrates on headphones. The sustain is longer (800ms per note). This is the "stakes are rising" sound.

Both transition sounds are mixed at 60% of the multi-cluster flag chime volume — present but not dominant. They should feel like a new section of music beginning, not an alarm.

The FOUNDRY phase has no ambient audio contribution to the career analysis panel. During FORGE, the career analysis ambient gains a subtle warm harmonic layer — barely audible, but creating a slightly more "active" diagnostic atmosphere. During PROVING GROUND, the harmonic layer shifts to a minor key and adds a low-frequency pulse (one beat every 4 seconds, 30% volume) that creates a sense of measured urgency — a metronome of consequence.

### The Settings Panel Feel

The [Customize phase thresholds] expander opens with a gentle accordion animation (250ms). The three rows of threshold selectors appear stacked vertically, each row labeled with the phase name in the phase's color. The pill buttons within each row are small (32px wide, 24px tall), compact enough that all four options (N=2, N=3, N=4, Off) fit on a single line. Tapping a pill produces a short haptic click (30ms) and the pill's background fills with the phase's color. The transition between pills is a 150ms cross-fade — the old pill empties, the new pill fills.

When the player overrides a default, the phase name label gains a small "(custom)" suffix in italicized lighter text. This is not a warning — it is a bookmark. It tells the player "you changed this" without suggesting they should change it back.

---

## The TikTok Clip

A player narrates their screen. "Season 6. I just started. Look at this — no cluster flags. The game knows I'm building." They speed through 35 matches in a montage. The Phase Timeline dot crawls forward. Then the junction diamond starts glowing amber. "Here it comes." The transition banner drops: "FOUNDRY to FORGE. Sensitivity increased." They run career analysis. For the first time all season, an amber cluster flag fires. "There it is. RELAY-B, 3 entries." They pause. "This is the first flag of the season. It's real." They click View Agent Audit. The root cause reads "Role drift since Match 4." They click Redesign. Cut to the coverage trend after 30 matches: the sparkline drops sharply. "One redesign. Coverage went from 48% to 19%." The text overlay reads: "The game waited until it mattered."

The virality is in the patience. The game *could* have flagged RELAY-B at Match 8. It deliberately waited until Match 36, when the player's config was stable enough for the signal to mean something. The game respects your time. That's the clip.

---

## New Aspects Discovered

- **4.69m — Phase-conditional suppression log:** A detailed log of every cluster event that was suppressed due to the phase threshold, with retroactive analysis of which suppressed events would have been genuine signals. Allows post-season review of whether the phase thresholds were calibrated correctly.
- **4.69n — Custom phase boundary placement:** Allowing the player to move the phase boundaries (e.g., FOUNDRY ends at Match 20 instead of Match 40) in addition to customizing the per-phase thresholds. Full control over both the timing and the sensitivity of each phase.
- **4.69o — Phase-aware cluster persistence decay:** Multi-cluster persistence tracking (4.69d) could decay differently by phase. A cluster event during FOUNDRY decays from the persistence counter faster than a cluster event during PROVING GROUND, reflecting the different significance levels.
- **4.69p — Cross-season phase profile learning:** The game analyzes the player's threshold choices and cluster dismissal rates across multiple seasons and recommends a personalized phase profile for the next season. "Last season you dismissed 80% of FOUNDRY flags. Recommend FOUNDRY=Off for Season 7."
