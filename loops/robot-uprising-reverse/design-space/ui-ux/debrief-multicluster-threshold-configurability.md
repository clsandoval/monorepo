# Multi-Cluster Threshold Configurability

**Aspect:** 4.69a — Multi-cluster threshold configurability: letting players set whether 2+, 3+, or 4+ appearances triggers the flag; accessibility consideration (2+ fires constantly for new players with concentrated configs); expert mode consideration (4+ threshold for players who want less interruption)

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined agent coverage score display; 4.69c — Agent redesign mode; 4.69d — Multi-cluster persistence tracking; 4.69e — Adversarial multi-cluster poisoning
**Related:** 4.59 — Career minimum fix; 4.68 — Coverage percentage as season health; 4.49 — Cross-mission pattern detection; 4.36 — Multi-scenario fix explorer

---

## The Core Problem

The multi-cluster detection flag fires when the same agent name appears in `N` or more distinct runner-up candidate slots in a career analysis result. The parent design (4.69) defaults to N=3. But this is a single number answering a population of players with wildly different needs.

**Why 3 might be wrong:**

For a new player who has built four agents total and only partially differentiated their roles, it is normal for RELAY-C to appear in positions 1, 2, and 3 of the candidate list — not because there is an architectural problem, but because the player's *entire config is underdeveloped*. Every agent is suboptimal. Every agent could produce a multi-cluster event. At threshold=3, the flag fires constantly. The warning loses meaning: if every career analysis produces four multi-cluster flags (one per agent), the flag teaches nothing except that everything is wrong, which paralyzes rather than directs.

For a Factorio-veteran player running 12-agent configs with careful role segmentation, a 3-entry cluster is genuinely significant — it means a well-designed agent is degrading, and they should know immediately. For this player, the threshold should arguably be *lower*, not higher — even 2 entries pointing at the same agent is a signal worth examining.

For an expert player with a near-optimal config running 50+ agents, a single agent appearing twice is expected noise (two elements of any large agent will occasionally surface in a large candidate pool). For them, the threshold should be *higher* — 4 or 5 — to avoid constant false positives.

**The threshold is a personalization parameter, not a balance parameter.** It does not make the game harder or easier. It calibrates the *signal-to-noise ratio* of a diagnostic tool for a specific player's config complexity and attention tolerance.

---

## The Threshold Design Space

### Axis 1: The Threshold Value (N)

The threshold N is the primary lever. The design space has four natural values:

**N=2 (Hyper-sensitive)**
Any time the same agent name appears in two candidate slots, the flag fires.

*Who this serves:* Players with mid-sized, well-segmented configs who want to catch problems early. Also useful for players who have deliberately set a "no repeat agents" goal for their architecture — they want to be notified the moment two candidates point at the same agent, as a discipline check.

*Who this punishes:* New players with 3-4 undifferentiated agents. Every career analysis fires multiple flags. The flag becomes background noise.

*False positive rate:* High. In a candidate list of 10 where 4 agents each appear ~2.5 times on average, almost every run will flag every agent.

*Flavor:* The compulsive engineer's setting. "Tell me everything. I'll decide what matters."

---

**N=3 (Default — Recommended)**
The same agent must appear in three or more distinct slots before flagging.

*Who this serves:* Mid-complexity configs (5–12 agents), moderate session lengths (30–60 matches between career analyses). The 3-entry cluster is a genuine architectural signal without being daily noise.

*False positive rate:* Low-moderate. In a 10-candidate pool with 6 agents, random distribution yields ~0.5 expected agents with 3+ appearances. When a real cluster exists (6 entries from one agent), the gap is obvious.

*Flavor:* The balanced diagnostic. Opinionated but not shouting.

---

**N=4 (Expert — Reduced Interruption)**
Four or more appearances before flagging.

*Who this serves:* Players with 15+ agents, highly segmented roles, running configs refined over 100+ matches. For them, 3 appearances from one agent in a 10-candidate pool is less alarming — it may just mean that agent is most active in the current mission rotation. They need the bar higher to avoid constant false alerts.

*Who this punishes:* Players who are actually building pathological configs but won't be warned until it's severe. A player with N=4 might work around the same RELAY-C problem through 4+ career analyses before the flag appears.

*Flavor:* The "I know what I'm doing — don't interrupt me unless it's serious" setting.

---

**N=5+ (Silence)**
Effectively disabling the detection for all but catastrophically clustered configs.

*Who this serves:* Players who explicitly don't want holistic prompts — they prefer to work element-by-element by choice. May represent a valid playstyle: the "whack-a-mole incrementalist" who prefers never having to think about agent-level architecture.

*Design tension:* Does the game have an obligation to interrupt this player? If the flag is opt-out, the game implicitly endorses ignoring architecture. If the flag is forced (non-configurable), the game prescribes one diagnostic frame. The configuration option resolves this tension by making the threshold a player choice rather than a design mandate.

---

### Axis 2: The Candidate Pool Size (Top-N Window)

The threshold interacts with the size of the candidate list being scanned. If the pool is top-5 candidates and threshold=3, you need 60% of your candidates to point at one agent — a very concentrated result. If the pool is top-20 and threshold=3, 15% concentration triggers the flag — much noisier.

The recommended configuration:
- Top-10 candidates, threshold=3: ~30% concentration required. Meaningful without being hypersensitive.
- Top-5 candidates, threshold=3: ~60% concentration required. Only fires in severe cases.
- Top-20 candidates, threshold=3: ~15% concentration required. Fires frequently.

**Design option:** make the candidate pool size also configurable, independently of the threshold. A player might want "top-20 candidates, threshold=5" to get a large diagnostic picture while only flagging when one agent dominates the top 20. Or "top-5 candidates, threshold=2" for a tight, high-signal indicator of immediate problems.

This creates a 2D parameter space. The UI must not expose this as two independent numbers (cognitive overload), but can present named presets that map to specific (pool, threshold) pairs.

---

### Axis 3: The Flag Scope

**Per-career-analysis (default):** Flag fires once per career analysis run, based on the candidates in *that* run. Resets after each run.

**Cumulative:** Track how many times each agent has clustered across *all* career analysis runs. The flag fires when cumulative appearances across runs exceed a threshold. This detects the "gradually degrading agent" that never quite hits 3 in any single run but consistently appears 2+ times every run. Related to 4.69d (multi-cluster persistence tracking).

**Rolling window:** Track the last N career analysis runs. Flag fires when an agent has clustered in 2 out of the last 3 runs, or 3 out of the last 5. More sophisticated than per-run, less demanding than cumulative.

The default should be per-career-analysis (simplest). Cumulative and rolling-window are advanced options for players who want longitudinal sensitivity.

---

### Axis 4: The Auto-Calibration Option

Rather than requiring the player to choose a threshold, offer **adaptive threshold**: the system calibrates based on the player's current config complexity.

```
Config complexity   Inferred threshold
1–4 agents         N=4  (sparse configs have noisy candidates)
5–8 agents         N=3  (default range)
9–14 agents        N=3  (still manageable)
15–24 agents       N=3  (possible, but some segmentation expected)
25+ agents         N=4  (high segmentation; 3-entry cluster less remarkable)
```

The auto-calibration updates when the player adds or removes agents from their roster. The player sees the inferred threshold in the settings panel and can override it at any time.

**Benefit:** The right default exists without requiring the player to think about it. The calibration table is legible (the player can read "your config has 22 agents, so threshold is 4").

**Risk:** The calibration table implies that agent count is a proxy for architectural quality, which is false. A player with 30 highly-specialized agents might legitimately want N=3. A player with 5 extremely broad agents might need N=2. Config complexity is not just agent count.

---

## The Settings UI

### Option A — Simple Threshold Slider

A single horizontal slider in the Career Analysis settings panel, labeled "Multi-cluster sensitivity."

```
Career Analysis Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Multi-cluster detection threshold
─────────────────────────────────
Fires when the same agent appears in:
  ○ 2+ candidates   (most sensitive)
  ● 3+ candidates   (default)
  ○ 4+ candidates   (less interruption)
  ○ Off             (disable flag)

  Current setting fires when one agent holds ≥30% of
  the top-10 candidate pool.
```

A radio button group with four labeled options. The selected option shows a contextual description of what it means in terms of percentage concentration (30% for N=3, top-10 pool). This description gives the player a concrete mental model without requiring them to do math.

**Visual treatment:** The options are spaced with adequate tap targets. The "Off" option sits slightly apart from the 2/3/4 group, separated by a thin divider, signaling that "Off" is a different kind of choice (opt-out rather than calibration).

**Animation:** When the player changes the setting, the description line fades to the new description with a 200ms cross-dissolve. Not distracting, but confirms the change registered.

---

### Option B — Contextual Recommendation Banner

The settings panel shows the slider, but also analyzes the player's current config and offers a contextual recommendation:

```
Multi-cluster detection threshold
─────────────────────────────────
Your config: 11 agents, 3 match types, 62 matches since last redesign

  ○ 2+ candidates
  ● 3+ candidates   ← Recommended for your config
  ○ 4+ candidates
  ○ Off

  [Why this recommendation?]
```

Expanding the "Why?" shows: "Your config has 11 agents with distinct roles. At this complexity, 3+ appearances in a top-10 candidate list represents meaningful clustering (~30% concentration) without generating false positives on normal variation."

**Benefit:** The player learns what their config complexity implies without needing a tutorial about threshold selection.

**Risk:** The recommendation system can become another feature the player trusts blindly. "The game recommended N=3 so I left it there" is fine, but the player is now dependent on a system they don't understand.

---

### Option C — Named Presets

Instead of numeric thresholds, offer named operational modes:

```
Multi-cluster detection mode
─────────────────────────────
  ○ Vigilant        Watch for early clustering; fires at 2+ appearances
  ● Standard        Flag clear clustering; fires at 3+ appearances [DEFAULT]
  ○ Focused         Interrupt less; fires at 4+ appearances
  ○ Silent          Never flag agent clusters
```

The names evoke a stance rather than a number. "Vigilant" communicates intent (the player *wants* to be interrupted). "Silent" is a deliberate choice, not just "Off."

**Benefit:** Easier to choose by personality/playstyle than by understanding what N=3 means. Players pick based on how they want to feel, not what they know about threshold mechanics.

**Risk:** The number is hidden. A player who later encounters "my threshold is 3" in documentation doesn't know if they're on "Standard" or "Focused." Preset names can diverge from their numeric semantics in the player's mental model.

**Best hybrid:** Named presets with the numeric N value shown parenthetically: "Standard (3+ appearances)." The name drives the choice; the number confirms it.

---

### Option D — The In-Context Setting (Dismiss Flow)

Don't put threshold configuration in a settings panel. Instead, when the multi-cluster flag fires and the player dismisses it, offer a contextual nudge:

```
[Dismiss — continue element-by-element]

  ← Fire this warning less often? Change threshold: [2+] [3+] [4+] [Off]
```

The threshold control lives inside the dismiss action. The player who repeatedly dismisses the flag can adjust it without leaving the debrief screen. The player who never dismisses it (they always read the flag) is never shown the control and doesn't have to think about it.

**Benefit:** The setting is surfaced at the moment of highest relevance (the player just saw a flag they found unhelpful). Contextual placement reduces the cognitive cost of the decision. The player doesn't need to find a settings panel.

**Risk:** Players who want to *lower* the threshold (make it fire more) never see this UI (they never dismiss). The in-context setting is biased toward raising the threshold, not lowering it.

**Resolution:** Pair the in-context dismiss control with a complementary "Fire this earlier" link inside the Agent Audit view (for players who read the audit and want even earlier warnings).

---

## Player Journeys

### Journey: Priya, 29, First-time strategy game player

**Context:** Priya is 8 matches into her first season. She has built 3 agents: SCOUT-1 (looks around), RELAY-2 (passes messages), STRIKER-3 (attacks). She hasn't differentiated them much — all three use similar context buffer sizes and identical hook structures. She just ran her first career analysis after 30 matches.

**Minute 0:00 — The Flag Explosion**
The career analysis result panel loads. Before she can read the candidate list, two multi-cluster flags fire simultaneously:

```
⚠ RELAY-2 appears in 4 of your top 5 candidates
⚠ SCOUT-1 appears in 3 of your top 5 candidates
```

The candidate list itself is almost entirely RELAY-2 and SCOUT-1 entries. The flags overlap visually. One of them has a dismiss button labeled "continue element-by-element." The other one is partially behind the first modal.

Priya stares at the screen. She presses Escape. One flag closes. The other stays up. She presses Escape again. Now the career analysis result is visible but covered in cluster brackets — RELAY-2 clusters connecting rows 1, 2, 4, 5; SCOUT-1 clusters connecting rows 3, 6, 7.

She clicks [Apply Fix] on row 1 (RELAY-2 context buffer). She doesn't know what a multi-cluster is. She figures the game will tell her when she actually needs to care.

She plays 30 more matches. Runs career analysis again. Same two flags. She has learned nothing because the signal was noise from match 1.

**Minute 15:00 — Twenty Matches Later**
After seeing the same flags four career-analysis runs in a row, Priya clicks "Why this warning?" on the RELAY-2 flag. She reads: "RELAY-2 appears in 4 of your top 5 candidates. Individual fixes address symptoms. This agent may have a structural problem."

Priya thinks: "What does structural mean? My agents are fine. I just built them." She dismisses the flag, but this time she notices the "Fire this warning less often?" nudge at the bottom of the dismiss action. She taps [4+]. The threshold rises to N=4.

The next career analysis: no multi-cluster flags. Just a clean ranked list. She applies the top fix. The game feels calmer. She doesn't yet understand what she silenced.

**Minute 45:00 — The Missing Warning**
Three sessions later, Priya has rebuilt SCOUT-1 twice and expanded to 5 agents. Her config is now actually more differentiated. She runs career analysis. RELAY-2 appears in 5 of the top 8 candidates — a genuine architectural cluster. But her threshold is N=4, and 5 appearances in a top-8 pool fires N=4. The flag appears again.

This time, something is different. The candidate list is *not* full of noise entries from every agent. It's specifically RELAY-2. She reads the audit. "RELAY-2 last redesigned Match 8. Role has expanded from single-hop relay to 3-hop relay since Season 2 began." She realizes: this agent is actually too old for her current setup. She clicks Redesign.

After the redesign, she runs 30 matches. Coverage drops from 61% to 22%. That's the real signal — the number meant something this time.

**What Priya needed:** A graduated onboarding that suppressed multi-cluster flags until her config had enough differentiation for the signal to be meaningful. The threshold configurability helped, but she arrived at the right setting through frustration, not design.

**UI Annotations:**
- **Multi-cluster flag positioning:** Flags stack vertically when multiple fire simultaneously. Each flag occupies its own card; scroll the card stack rather than overlapping.
- **Dismiss nudge:** The "Fire this warning less often?" link lives in the footer of each flag card, visually subordinate (gray, 12px font). It should be findable without being prominent — it's for frustrated players, not curious ones.
- **Threshold selector in dismiss:** [2+] [3+] [4+] [Off] as pill-style buttons inside the dismiss flow. The current threshold is visually active (white background). Tapping a different pill updates immediately with a subtle haptic click.

---

### Journey: Marcus, 34, Competitive RTS player (former SC2 Diamond)

**Context:** Marcus is in Season 3, match 95. He runs 16 agents across 4 operational roles. His config is aggressively segmented — he reads every career analysis result carefully and has never left a fix unapplied for more than 10 matches. The default threshold of N=3 fires for him about once every four career analyses.

**Minute 0:00 — Career Analysis Run #11**
Marcus opens career analysis. Results load. No multi-cluster flag. He reads the candidate list:

```
#1  RELAY-C context buffer    62%  [Apply Fix →]
#2  SCOUT-A hook threshold    31%  [Apply Fix →]
#3  RELAY-C fallback filter   24%  [Apply Fix →]
#4  STRIKER-B patrol radius   18%  [Apply Fix →]
#5  RELAY-C priority queue    17%  [Apply Fix →]
```

He notices RELAY-C appears in 3 of 5 candidates. The threshold is N=3. He expects the flag to fire. It didn't. He scrolls: the career analysis is showing top-5 results by default. He knows the flag checks top-10. The flag didn't fire because #6–10 don't include another RELAY-C entry. He had exactly 3 RELAY-C entries in the top-10 pool — just at threshold.

He makes a mental note. He applies fix #1 (RELAY-C context buffer). He runs 30 matches.

**Minute 8:00 — Career Analysis Run #12**
Results load. The multi-cluster flag fires:

```
⚠ RELAY-C appears in 3 of your top 10 candidates.
```

Marcus thinks: "I knew this was coming." He clicks [View Agent Audit]. The audit shows the three entries and the combined cluster coverage (71%). He reads the root cause hypotheses. He selects "Role drift" — RELAY-C was built before he expanded his config from 8 to 16 agents. Its role is now ambiguous.

He clicks [Redesign RELAY-C]. He spends 12 minutes in the redesign sandbox, splitting RELAY-C into two specialized agents: RELAY-C-SHORT (close range) and RELAY-C-LONG (3-hop chains). He deploys.

**Minute 22:00 — The Threshold Thought**
After the redesign, Marcus thinks about his threshold. N=3 fired exactly when it should have. But he realizes: with 16 agents, a 3-entry cluster in the top 10 is somewhat normal. In a large candidate pool, each agent might appear once or twice by random variation. He opens settings.

He reads the current setting: "3+ candidates (fires when one agent holds ≥30% of the top-10 candidate pool)." He thinks: with 16 agents, the expected appearances per agent per top-10 pool is 10/16 = 0.625 entries. Three appearances = ~5x expected. That's meaningful even with a large config.

He keeps N=3. But he notices the tooltip says "top-10 pool" — he wonders if he could change the pool size to top-15 to get a larger diagnostic picture. The setting doesn't offer this directly. He files a mental request: "I want N=3 but checking the top-15 candidates."

**UI Annotations:**
- **Threshold description with math:** The contextual description shows the concentration percentage ("≥30% of the top-10 candidate pool") so that experienced players can verify the threshold matches their intuition. For N=3, top-10: 30%. For N=4, top-10: 40%.
- **Pool size link:** A subtle `[advanced]` link beneath the threshold selector expands an inline secondary control for candidate pool size (5, 10, 15, 20). Default: 10. The interaction is explicit enough that casual players don't encounter it; curious players can find it.
- **Agent audit opening animation:** The [View Agent Audit] tap slides the main career analysis panel left, bringing an agent-centric panel in from the right. The bracketed cluster entries visually travel with the animation — they lift off the main panel and settle into their positions in the audit panel, drawing the eye from one view to the other.

---

### Journey: Yuki, 16, Speed-runner / optimizer archetype

**Context:** Yuki plays Robot Uprising like a Zachtronics game — she optimizes aggressively, never applies a fix without reading the full candidate list, and has set her career analysis to run every 20 matches (more frequent than the default every-30). She is on Season 2, match 45. Her threshold is N=2 — she changed it in her first session after reading the tooltip and deciding "I want to know immediately when anything clusters."

**Minute 0:00 — The Early Warning System**
Career analysis runs. No multi-cluster flag. Yuki reads:

```
#1  RELAY-C context buffer   44%  [Apply Fix →]
#2  RELAY-C fallback filter  22%  [Apply Fix →]
#3  SCOUT-A hook threshold   18%  [Apply Fix →]
#4  RELAY-C priority queue   14%  [Apply Fix →]
```

Wait — no flag? She has N=2. RELAY-C appears in positions 1, 2, 4. That's 3 appearances. She checks settings. Her threshold is N=2. The flag should have fired at positions 1+2.

She reads the UI more carefully. There is a small annotation at the bottom of the career analysis panel:

```
ⓘ RELAY-C cluster detected (3 entries) — flag suppressed this run
  Reason: You applied a RELAY-C fix in the last 10 matches.
  Recent fixes are excluded from cluster detection to avoid repeat flags.
  [Override suppression →]
```

Yuki did apply a fix to RELAY-C's context buffer 8 matches ago. The system is suppressing the cluster flag because it thinks the recent fix might resolve the cluster. She doesn't want this behavior — she wants the flag regardless of recent fixes. She clicks [Override suppression]. The flag fires. She reads the audit.

She learns something she didn't know: the suppression logic exists (it's a separate design knob — see 4.69 suppression semantics). She opens settings and disables suppression: "Fire cluster flag even after recent fixes."

**Minute 10:00 — N=2 in Practice**
Over the next five career analyses, Yuki's N=2 threshold fires at every single run. Usually RELAY-C or SCOUT-A clusters with 2 entries. She reviews each one, reads the root cause section, and either confirms "I know about this, it's not structural" or acts on it.

She has developed a personal judgment system: if the combined cluster coverage of 2 entries is less than 30%, she dismisses. If it's more than 30%, she investigates. She has essentially built a second-order threshold: N=2 fires the flag; 30% combined coverage determines if she acts.

She wonders if the game could let her set *both* thresholds — "N=2 appearances required AND combined coverage ≥30% to flag." This would be the precision she wants. She files this as a feature request in her head.

**Minute 20:00 — The False Positive Pattern**
In season 3, Yuki's config expands to 20 agents. N=2 now fires almost every career analysis. She hits a run with 4 simultaneous cluster flags — all with 2-entry clusters and low combined coverage. The flags are all noise. She spends 3 minutes dismissing them.

She changes her threshold to N=3. The frequency drops to once every 5 career analyses. She's lost some early-warning sensitivity, but the signal quality improved. She understands now: the right threshold is a function of config size. She wants the game to tell her when to adjust.

**UI Annotations:**
- **Cluster suppression logic disclosure:** The "flag suppressed — reason: recent fix" notice appears as a collapsible annotation below the candidate list (not a modal). It is unobtrusive but findable. The `[Override suppression →]` link triggers the full flag inline.
- **Combined coverage as primary sorting key:** In the N=2 world, the cluster flag fires with 2 entries often. The combined cluster coverage is shown prominently in the flag card header, replacing the default header text. Instead of "⚠ RELAY-C appears in 2 candidates," it reads "⚠ RELAY-C cluster: combined coverage 38%." This lets Yuki triage immediately.
- **Threshold auto-suggestion:** After 3 consecutive career analyses where all flagged clusters had combined coverage <25%, a one-time banner appears: "Low-coverage clusters are firing frequently. Consider raising your threshold to 3+ appearances." A single-tap accept updates the threshold.

---

## Interaction Effects

### With 4.69b — Combined Agent Coverage Score Display
Threshold configurability and combined coverage display are co-dependent. At N=2, combined coverage is the tiebreaker — two entries clustering only means something if their combined coverage is notable. The combined coverage display (4.69b) becomes more important as the threshold lowers; at N=4, combined coverage is almost redundant (four entries clustering is already alarming regardless of the combined percentage).

The recommended pairing: **lower thresholds require more prominent combined coverage display**; **higher thresholds can de-emphasize combined coverage** (the threshold itself already filters).

### With 4.69c — Agent Redesign Mode
The threshold determines how often the player arrives at the redesign mode entry point. A player on N=2 will enter redesign mode far more frequently — the redesign mode UI must therefore handle "spurious redesign" gracefully: a player who opens redesign mode, looks around, decides nothing structural is wrong, and closes without making changes. The mode should have a lightweight exit path ("no changes — return to results") that doesn't feel like failure.

### With 4.69d — Multi-Cluster Persistence Tracking
Persistence tracking asks: "How many times has this agent clustered across career analyses?" If the player has N=4, persistence tracking starts from a high bar. An agent that clusters once at N=4 is already a strong signal; persisting twice is critical. If the player has N=2, persistence tracking becomes extremely noisy — every agent will accumulate persistence counts quickly. The persistence display (4.69d) should show "clusters since last redesign," not lifetime count, to avoid the N=2 player seeing all agents with persistence scores in the double digits.

### With 4.68 — Coverage Percentage as Season Health
The season health trend tracks top-candidate coverage percentages over time. But the multi-cluster flag's threshold affects whether the player acts on architectural problems or ignores them. A player on N=4 who is actually building pathological configs will not be interrupted — they will apply element-level fixes repeatedly, and their coverage percentage trend may flatten rather than decline (element fixes improve coverage somewhat, but don't fix architecture). The season health trend becomes an indirect indicator of whether the player's threshold calibration is appropriate: a flat or rising coverage trend while the player has a high threshold is a signal the threshold may be set too permissively.

### With 4.49 — Cross-Mission Pattern Detection
Cross-mission pattern detection (4.49) identifies which agents degrade across different mission types. Multi-cluster detection identifies which agents have multiple candidate entries in a single career analysis. The two systems can fire simultaneously, and when they do, the combined signal is strong:

> RELAY-C: multi-cluster (3 entries) AND cross-mission pattern (degrades on Ambush missions)

This combined flag says: "not only does this agent have multiple symptoms, but one of those symptoms is mission-specific." This narrows the root cause from "structural" to "structural + mission-conditional." The threshold for combined flags should arguably be lower than for either flag alone — if both systems flag the same agent, the evidence is stronger.

Design question: should the game automatically lower the effective threshold when cross-mission pattern detection also fires? E.g., the player has N=4, but when a cross-mission pattern exists, the effective threshold becomes N=3 for that agent?

---

## Sensory Description

The threshold control in the settings panel feels like a physical dial with four indexed positions. The selector snaps between options with a satisfying mechanical click (a short 50ms haptic on mobile; a visual spring-bounce on desktop where the radio button visually compresses and releases). Changing the threshold doesn't restart or recalculate anything — it takes effect at the *next* career analysis run. There is no feedback that the change happened except the radio button state change, which feels intentionally calm: this is a preference, not an action.

When the multi-cluster flag fires, the flag card enters from the right with a 200ms easing curve, settling to rest with a slight overshoot — the card bounces once, drawing the eye without demanding action. The cluster bracket on the candidate list is rendered in amber: warm, cautionary, not alarming. The three clustered rows pulse once in synchrony when the flag appears, then return to normal color. The connection bracket between them is a thin amber line, like a highlight marker on paper.

At N=2, the ambient color of the career analysis panel tilts slightly warmer (the panel background shifts from cool gray to a faint amber tint) during runs when a cluster is present. At N=4, the flag arrives calmly, without color shift. The threshold setting doesn't just change when the flag appears — it subtly changes the emotional register of the career analysis experience.

The threshold selector itself is small — a 4-option radio group fitting in a single card. The card has a rounded rectangular border in the same material style as agent cards in the workbench. The "Off" option has a slightly different background — a faint striped pattern, like a caution zone — to communicate that disabling the flag is a deliberate divergence from the default, not just another calibration choice.

---

## The TikTok Clip

The player's career analysis loads. Three rows in the top-5 candidate list are bracketed in amber. A flag card slides in: "RELAY-C appears in 3 candidates. Individual fixes won't resolve this." The player hovers over the flag, then clicks [View Agent Audit]. The audit panel slides in, showing RELAY-C's entire history. The root cause reads: "Role has drifted from single-hop to 3-hop relay over 80 matches without redesign." The player clicks [Redesign RELAY-C]. The workbench opens, RELAY-C isolated in the center, everything else grayed out. The player splits it into two agents in 90 seconds. They deploy. The next career analysis loads. No cluster flags. Top candidate coverage: 19%. The downward trend on the sparkline makes a new low. The screen shows a small trophy: "First architectural overhaul." The clip loops here.

The 15 seconds: amber flag → root cause revealed → split into two agents → coverage drops → trophy. *That* is what "structural diagnosis" feels like in a game.

---

## Strengths and Weaknesses

**Strengths:**
- Resolves the core tension between accessibility (N=2 fires too often) and expert UX (N=3 fires too rarely for large configs)
- Makes the player an active participant in calibrating their diagnostic experience, reinforcing the "you are an engineer managing information systems" identity
- The in-context dismiss nudge is elegant: the right place to configure "fire less often" is at the moment you're dismissing a flag you found unhelpful
- Named presets (Option C) lower the cognitive cost of choosing without removing the personalization
- The adaptive auto-calibration (based on agent count) handles the common case without requiring configuration from most players

**Weaknesses:**
- Adds a setting the player has to find, understand, and maintain — settings accumulate friction
- A player who sets N=4 and misses a genuine architectural problem may blame the game for not warning them, even though they opted into reduced sensitivity
- The interaction with the candidate pool size (top-5 vs. top-10 vs. top-20) creates a hidden 2D parameter space that the simplified UI hides but can't fully resolve
- Auto-calibration based on agent count is a proxy for config complexity, not a direct measure — it will misfire for players with unusual configs

---

## Comparable Systems

**Alerts in monitoring dashboards (Grafana, Datadog):** Alert thresholds in observability platforms are the direct analog. The pattern "set threshold, configure sensitivity, get notified when exceeded" is mature SRE practice. Robot Uprising is literally teaching the same skill: threshold calibration, signal-to-noise tuning, suppression windows. The career analysis settings panel could feel like configuring an alerting rule.

**Notification fatigue in social apps:** The reason users turn off notifications on apps is exactly the "N=2 fires constantly" problem. The psychology of notification fatigue is well-documented: once a user learns to dismiss a notification type reflexively, that notification channel is dead. The in-context dismiss nudge is the game's defense against notification fatigue: rather than the player globally silencing the flag (which they'd do if dismissal required navigating to a settings panel), they calibrate at the moment of maximum relevance.

**Zachtronics histograms:** The histogram in Opus Magnum that shows your solution's efficiency vs. other players' solutions is a form of threshold display — players set their own internal bar ("I want to be in the top 20%") rather than the game prescribing one. Multi-cluster threshold configurability has the same spirit: the game provides the diagnostic tool; the player calibrates what "flagworthy" means for them.

---

## New Aspects Discovered

- **4.69h — Threshold preset profiles per config phase:** allowing the player to set different thresholds for different career phases (early season: N=4 to avoid noise from developing configs; late season: N=2 to catch architectural drift before finals). A "phase-aware" threshold that auto-shifts as the season progresses.
- **4.69i — Combined coverage minimum as secondary threshold gate:** requiring BOTH N=3 appearances AND combined coverage ≥30% before flagging — prevents low-coverage clusters from generating noise. Two-axis threshold specification.
- **4.69j — Per-agent threshold override:** allowing the player to set a specific threshold for a specific agent: "Always flag RELAY-C at N=2, even if global threshold is N=4." Pinning diagnostic sensitivity on known problem agents.
- **4.69k — Cluster flag history in career analysis log:** a log of every time the cluster flag fired in the player's career, with the threshold active at that time and the player's response (dismissed/redesigned/applied-all). The "diagnostic history" as a record of player judgment over time.
- **4.69l — Threshold recommendation engine:** an engine that analyzes the player's last 5 career analyses and recommends a threshold adjustment based on false positive rate and flag dismissal frequency. "You dismissed 4 of the last 5 cluster flags without acting. Recommend raising threshold to 4+."
