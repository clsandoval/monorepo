# Per-Agent Threshold Override

**Aspect:** 4.69j — Per-agent threshold override: letting the player set a specific threshold for a specific agent ("always flag RELAY-C at N=2, even if global threshold is N=4"); pinning diagnostic sensitivity on known problem agents; UI for managing per-agent overrides in the workbench agent inspector.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69d — Multi-cluster persistence tracking; 4.69h — Phase presets
**Related:** 4.69b — Combined agent coverage score display; 4.69c — Agent redesign mode; 4.69e — Adversarial multi-cluster poisoning; 4.69g — Agent cluster as a unit of analysis in career stats; 4.68 — Coverage percentage as season health

---

## The Core Problem

The global threshold (4.69a) lets the player calibrate their diagnostic sensitivity across their entire roster. Set N=3, and every agent is held to the same standard. This is elegant as a default, but it collides with a pattern that emerges in intermediate-to-advanced play: **the player knows which agents are structurally fragile and which are rock-solid, and wants different diagnostic attention for each.**

Consider a player with 14 agents. Eleven of them were carefully designed, tested, and refined over 80+ matches. Three of them — RELAY-C, BUFFER-D, and SCOUT-F — are legacy agents from Season 1 that the player has been "meaning to redesign" but keeps patching instead. The player sets the global threshold to N=4 because their 11 solid agents produce occasional 3-entry clusters that are noise — random variation from a well-functioning architecture. But RELAY-C at N=4 means the player won't be warned about RELAY-C's clustering until it dominates four candidate slots, by which point the problem is severe.

What the player actually wants:

- **RELAY-C:** Flag at N=2. I know this agent is fragile. I want to see every cluster event, no matter how small, so I can decide when to finally commit to the redesign.
- **BUFFER-D:** Flag at N=3. It's aging but not critical. Standard sensitivity is fine.
- **SCOUT-F:** Flag at N=2. Same as RELAY-C — legacy agent, structural debt accumulating.
- **Everything else:** Use the global threshold of N=4. These agents are solid; don't interrupt me with noise.

This is not an unusual configuration. It is the natural state of any system that has been running long enough to accumulate technical debt unevenly. Some components are clean. Some components are known liabilities. The monitoring sensitivity should reflect this knowledge.

**The deeper design question:** should the game even let you pin heightened sensitivity on specific agents? There is a pedagogical argument against it. If the game's diagnostic tools teach "think about your whole architecture," per-agent overrides let the player avoid that lesson by saying "I already know where the problems are — just watch those." The player who pins N=2 on RELAY-C might never discover that STRIKER-B has quietly drifted into structural debt, because STRIKER-B is sitting at the global N=4 threshold and its 3-entry clusters are invisible.

But the counter-argument is stronger: **the player who pins N=2 on RELAY-C is demonstrating exactly the kind of architectural awareness the diagnostic system is designed to cultivate.** They have identified a fragile agent. They have consciously decided to monitor it closely. They are using the diagnostic tool as engineers use monitoring dashboards — with per-service alert thresholds calibrated to known risk profiles. This is the highest-fidelity use of the system.

The risk is real but manageable: the system can surface "unmonitored agents" — agents that have no override and haven't triggered a cluster event in N career analyses — as a separate, low-priority signal. The per-agent override doesn't blind the player; it sharpens their focus.

---

## The Design

### Data Model

Each agent in the player's roster gains an optional `cluster_threshold_override` field:

```
Agent: RELAY-C
  cluster_threshold_override: 2        // null = use global
  override_set_at: Career Analysis #8  // when the player pinned this
  override_reason: "legacy agent"      // optional player-entered note
```

When the multi-cluster detection algorithm runs, it checks each agent's override before falling back to the global threshold:

```
for agent, entries in clusters.items():
    effective_threshold = agent.cluster_threshold_override or global_threshold
    if len(entries) >= effective_threshold:
        flag_multi_cluster(agent, entries, effective_threshold)
```

The effective threshold is displayed alongside the flag when it fires, so the player always knows which threshold triggered:

```
⚠ RELAY-C appears in 2 of your top 10 candidates.
  Threshold: N=2 (per-agent override — global is N=4)
```

### Setting an Override: Three Entry Points

**Entry Point 1 — From the Cluster Flag Dismiss Flow**

When a multi-cluster flag fires and the player interacts with it, the dismiss flow (already designed in 4.69a) gains a new option:

```
⚠ RELAY-C appears in 3 of your top 10 candidates.
  [View Agent Audit →]  [Dismiss — continue element-by-element]

  ← Adjust sensitivity for RELAY-C specifically:
     [Pin at N=2]  [Pin at N=3]  [Use global (N=4)]  [Never flag]
```

The "Pin at N=X" buttons are pill-shaped toggles. The currently active setting (whether inherited from global or already overridden) is highlighted. Tapping a different pill changes the override immediately. A brief confirmation appears inline: "RELAY-C will now flag at 2+ appearances."

This is the highest-intent entry point. The player has just seen a cluster flag on a specific agent and is making an informed decision about that agent's sensitivity. The control is contextual and low-friction.

**Entry Point 2 — From the Agent Inspector in the Workbench**

The workbench agent inspector (the panel that shows an agent's configuration, health, and history) gains a new section: **Diagnostic Sensitivity.**

```
┌─────────────────────────────────────────────────────────────┐
│  RELAY-C — Agent Inspector                          [Close] │
├─────────────────────────────────────────────────────────────┤
│  Role: Mid-range relay, signal compression                  │
│  Version: v3.2 (unchanged 43 matches)                       │
│  Last redesign: Season 1, Match 12                          │
├─────────────────────────────────────────────────────────────┤
│  DIAGNOSTIC SENSITIVITY                                     │
│  ─────────────────────────────────                          │
│  Multi-cluster threshold:                                   │
│    ○ 2+ appearances   (hyper-sensitive)                     │
│    ● 3+ appearances   (overridden — global is N=4)         │
│    ○ 4+ appearances   (use global)                         │
│    ○ Never flag                                             │
│                                                             │
│  Override set: Career Analysis #8                           │
│  Note: "aging relay, watch for drift"         [Edit note]   │
│                                                             │
│  [Clear override — use global threshold]                    │
├─────────────────────────────────────────────────────────────┤
│  CLUSTER HISTORY (since last redesign)                      │
│  ─────────────────────────────────────                      │
│  Run 4 (M100–M130):  3 entries, 64% combined   [Dismissed] │
│  Run 6 (M165–M195):  4 entries, 71% combined   [Pending]   │
│  Persistent offender: YES (2 events since v3.2)             │
└─────────────────────────────────────────────────────────────┘
```

The Diagnostic Sensitivity section is positioned below the agent's core stats (role, version, last redesign) and above the Cluster History log (4.69d). This placement creates a natural reading flow: the player sees the agent's identity, then its monitoring sensitivity, then its diagnostic history. The override radio group uses the same visual language as the global threshold selector in the Career Analysis settings — same pill shapes, same labeling convention ("2+ appearances"), same descriptive parentheticals.

The "Note" field is a free-text area (max 80 characters) where the player can record why they set the override. This is optional but valuable: it creates a breadcrumb for the player's future self. A player who returns to this panel three weeks later and sees "aging relay, watch for drift" immediately recalls the diagnostic reasoning.

**Entry Point 3 — From the Override Management Panel**

A new section in the Career Analysis settings panel: **Per-Agent Overrides.** This panel shows all agents that currently have overrides, in a compact list:

```
Career Analysis Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Global threshold: 4+ appearances (Focused)

Per-Agent Overrides                             [+ Add Override]
─────────────────────────────────────
  RELAY-C      N=2  "aging relay, watch for drift"    [Edit] [×]
  SCOUT-F      N=2  "legacy scout, pre-season 2"      [Edit] [×]
  BUFFER-D     N=3  (no note)                          [Edit] [×]

  3 agents overridden. 11 agents using global (N=4).

Unmonitored agents (no cluster event in 5+ runs):
  STRIKER-B, COMMAND-A
  These agents haven't triggered a cluster flag recently.
  Consider adding a temporary override if you haven't
  reviewed them lately.                    [Pin both at N=3 →]
```

The override list is sorted by threshold (lowest first — the agents the player is watching most closely appear at the top). Each row shows the agent name, its override threshold, the player's note (if any), and edit/remove controls.

The **Unmonitored Agents** section at the bottom is a soft nudge, not a warning. It lists agents that have neither an override nor a recent cluster event. This catches the blind spot that per-agent overrides create: the player is focused on RELAY-C and SCOUT-F and has forgotten about STRIKER-B, which has quietly been accumulating structural problems below the global N=4 radar. The "Pin both at N=3" shortcut lets the player add monitoring in one tap without navigating to each agent's inspector.

### The [+ Add Override] Flow

Clicking [+ Add Override] opens an agent picker — a scrollable list of all agents in the roster, each showing its current effective threshold and a one-line status:

```
Add Per-Agent Override
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Select an agent:

  RELAY-C       N=2 (overridden)          [already set]
  SCOUT-F       N=2 (overridden)          [already set]
  BUFFER-D      N=3 (overridden)          [already set]
  STRIKER-B     N=4 (global)    ⚪ no recent clusters
  COMMAND-A     N=4 (global)    ⚪ no recent clusters
  SCOUT-A       N=4 (global)    🟡 1 cluster in last 5 runs
  STRIKER-C     N=4 (global)    ⚪ no recent clusters
  ...

  [Cancel]
```

Agents with recent cluster events are marked with a small amber dot. Agents already overridden show "[already set]" and cannot be re-selected (the player should edit existing overrides via the Edit button on the override list).

Selecting an agent opens a threshold picker inline:

```
  SCOUT-A — Set override threshold:
    [2+]  [3+]  [4+ (global)]  [Never flag]
    Note: ___________________________________
    [Save Override]  [Cancel]
```

The flow is two taps: select agent, select threshold. Optional third step: add a note. The entire interaction takes under 5 seconds for a player who knows what they want.

### Override Lifecycle and Expiration

Overrides persist until one of three events:

1. **Manual removal** — the player clicks [x] on the override or selects "Clear override" in the agent inspector.
2. **Agent redesign** — when the player commits a full redesign of an agent (entering and exiting Redesign Mode with changes deployed), all overrides on that agent are cleared. The rationale: the agent has been rebuilt, so the diagnostic sensitivity pinned to the old version is no longer meaningful. A toast confirms: "RELAY-C redesigned. Per-agent threshold override cleared. Using global threshold (N=4)."
3. **Override expiration (optional)** — an advanced setting that allows overrides to expire after N career analysis runs without a cluster event. If the player sets RELAY-C to N=2 and RELAY-C doesn't cluster in 5 consecutive career analyses, the override may have served its purpose. An expiration banner appears: "RELAY-C hasn't clustered at N=2 for 5 career analyses. Keep override? [Keep] [Clear]" This prevents stale overrides from accumulating indefinitely.

The redesign-clears-override behavior is important. It closes a loop: the player pinned heightened sensitivity on RELAY-C because they knew it was fragile. They finally redesigned it. The override is no longer relevant to the rebuilt agent. If the rebuilt agent develops new structural problems, the normal global threshold catches them, and the player can set a new override if warranted.

---

## Player Journeys

### Journey 1: Kenta, 31, Systems Engineer — Pinning Sensitivity on a Known Problem

**Context:** Kenta is in Season 3, match 220. He runs 16 agents. His global threshold is N=4 (he raised it from the default N=3 in Season 2 because his large roster was generating too many 3-entry clusters on healthy agents). But he knows RELAY-C is aging — it was designed in Season 1 and has been patched 6 times without a full redesign. He wants to watch it closely without lowering his global threshold.

**Minute 0:00 — Career Analysis Run #14**

Kenta opens career analysis. Results load. No multi-cluster flags fire — his global N=4 threshold is quiet today. He reads the candidate list:

```
#1  RELAY-C context buffer     48%  [Apply Fix →]
#2  RELAY-C fallback filter    29%  [Apply Fix →]
#3  SCOUT-A hook threshold     22%  [Apply Fix →]
#4  STRIKER-B patrol radius    15%  [Apply Fix →]
#5  RELAY-C priority queue     14%  [Apply Fix →]
```

RELAY-C occupies 3 of the top 5 slots. At the old N=3 global threshold, this would have fired. At his current N=4, silence. He knows this is a cluster. He wants to be told about it next time without having to visually scan the list himself.

He clicks on RELAY-C's name in the candidate list. The agent inspector panel slides in from the right. He scrolls to the Diagnostic Sensitivity section. It shows: "Multi-cluster threshold: 4+ appearances (global)."

He taps the N=2 radio button. The button snaps into position with a short 50ms haptic pulse. The label updates: "2+ appearances (overridden — global is N=4)." A note field appears below. He types: "legacy relay, 6 patches no redesign." He taps Save.

A brief confirmation toast slides up from the bottom of the screen: "RELAY-C will now flag at 2+ appearances." The toast is teal with white text, 40px tall, visible for 2 seconds before fading.

**Minute 0:45 — Back to the Career Analysis**

Kenta returns to the career analysis results. The panel now shows a retroactive annotation — the cluster detection has re-evaluated with the new override:

```
⚠ RELAY-C appears in 3 of your top 10 candidates.
  Threshold: N=2 (per-agent override, just set)
  [View Agent Audit →]  [Dismiss]
```

The flag materialized after the override was set. The system retroactively applied the new threshold to the current career analysis result. Kenta now has the diagnostic prompt he wanted. He clicks [View Agent Audit] and reads the combined coverage: 72%. He notes it in his mental queue. Not today — he has a competitive match in 2 hours — but this season, RELAY-C gets rebuilt.

**Minute 1:30 — Override Management**

Later that session, Kenta opens Career Analysis Settings. He sees the Per-Agent Overrides section. RELAY-C is listed at N=2. He also notices the "Unmonitored agents" section: BUFFER-D and COMMAND-A haven't triggered any cluster events in the last 6 career analyses. He pauses. BUFFER-D is another Season 1 agent. He taps [Pin both at N=3]. Both agents gain overrides instantly.

His override panel now shows:
```
  RELAY-C      N=2  "legacy relay, 6 patches no redesign"
  BUFFER-D     N=3  (auto-pinned from unmonitored suggestion)
  COMMAND-A    N=3  (auto-pinned from unmonitored suggestion)
```

He feels in control. The monitoring reflects his mental model of his roster.

**UI Annotations:**
- The retroactive flag (cluster re-evaluation after override set) fires only if the player is still viewing the same career analysis result. If they have navigated away, the new threshold applies starting at the next career analysis run.
- The confirmation toast uses a teal background to distinguish it from the amber of cluster flags. Teal = configuration change confirmed. Amber = diagnostic event.
- The "auto-pinned from unmonitored suggestion" note is system-generated, not player-written, and displayed in italic gray to distinguish it from player notes.

---

### Journey 2: Amara, 22, Competitive Player — Override Cleared by Redesign

**Context:** Amara is in Season 4, Gauntlet mode. She has had RELAY-C pinned at N=2 for two full seasons. In that time, RELAY-C has triggered the cluster flag 7 times — every career analysis, without fail. She has been applying batch fixes each time, deferring the redesign because she was mid-competition. The season just ended. She is now in the interseason workshop period. It is time.

**Minute 0:00 — Entering Redesign Mode**

Amara opens the workbench agent inspector for RELAY-C. The Diagnostic Sensitivity section shows:

```
Multi-cluster threshold: 2+ appearances (overridden)
Override set: Career Analysis #8 (Season 2, Match 220)
Note: "legacy relay, 6 patches no redesign"
Cluster events since override: 7
```

Seven cluster events. She's been staring at this number for two seasons. She clicks [Redesign RELAY-C]. The workbench enters redesign mode — the battlefield fades to dark gray, the coral modal header strip appears: "REDESIGN MODE — RELAY-C ISOLATED."

She spends 25 minutes splitting RELAY-C into two agents: RELAY-C-SHORT (close-range compression, small buffer, fast fallback) and RELAY-C-LONG (3-hop relay chains, large buffer, deep priority queue, aggressive filter). She configures each from scratch rather than inheriting the old parameters.

**Minute 25:00 — Deploying the Redesign**

Amara clicks [Deploy Redesign]. A confirmation dialog appears:

```
Deploy RELAY-C Redesign
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Changes:
  RELAY-C → split into RELAY-C-SHORT + RELAY-C-LONG
  2 new agents created, 1 retired

Per-agent override on RELAY-C will be cleared.
  RELAY-C-SHORT: will use global threshold (N=4)
  RELAY-C-LONG:  will use global threshold (N=4)

  [Deploy]  [Cancel]
```

The dialog explicitly tells her the override will be cleared. She reads it and thinks: good. The override was for the old RELAY-C. The new agents start fresh. If either of them develops structural problems, the global threshold will catch it — or she can pin a new override later.

She clicks [Deploy]. The redesign commits. A brief animation: RELAY-C's portrait in the agent roster splits into two, each half sliding apart and resolving into RELAY-C-SHORT and RELAY-C-LONG with new portraits. The roster re-sorts. The override management panel updates: RELAY-C is gone from the list.

**Minute 26:00 — First Career Analysis Post-Redesign**

Amara runs 20 matches with the new agents. Career analysis loads. No cluster flags on either new agent. The candidate list is distributed across 8 different agents. The roster feels balanced for the first time in two seasons.

She opens the override management panel. It now shows:

```
Per-Agent Overrides
─────────────────────────────────────
  BUFFER-D     N=3  "Season 1 holdover"               [Edit] [×]
  SCOUT-F      N=2  "broken hook architecture"          [Edit] [×]

  2 agents overridden. 14 agents using global (N=4).

  No unmonitored agents.
```

RELAY-C is gone. The override lifecycle is complete.

**UI Annotations:**
- The deploy confirmation dialog lists the override clearance as a discrete line item, not buried in fine print. The player should never be surprised that a redesign clears their override.
- The agent split animation (portrait splitting into two) takes 600ms. Each half scales down to 60% of the original portrait size, slides apart, then resolves. The resolution involves a brief 200ms shimmer effect — the portrait pixels scatter and reassemble into the new agent's face.
- Post-redesign, the cluster history for the retired RELAY-C is archived (visible in Career Stats under "Retired Agents") but not displayed in the active inspector.

---

### Journey 3: Felix, 19, Casual Player — Discovering Overrides Through the Unmonitored Nudge

**Context:** Felix has been playing for 4 months. He uses the default global threshold of N=3 and has never touched the Career Analysis settings. He doesn't know per-agent overrides exist. He has 9 agents. His config is moderately differentiated — some agents are well-designed, others are inherited from early missions and never rebuilt.

**Minute 0:00 — Career Analysis Run #9**

Felix opens career analysis. Results load. No multi-cluster flags. He applies the #1 fix (SCOUT-A context buffer, 34% coverage). Normal session. He closes the panel.

**Minute 0:05 — Wandering into Settings**

Felix opens the Career Analysis settings panel for the first time — he's curious about the threshold after hearing a streamer mention it. He reads the global threshold: "3+ appearances (Standard)." Below it, he sees the Per-Agent Overrides section:

```
Per-Agent Overrides                             [+ Add Override]
─────────────────────────────────────
  (no overrides set)

Unmonitored agents (no cluster event in 5+ runs):
  RELAY-B, COMMAND-C, STRIKER-A
  These agents haven't triggered a cluster flag recently.
  Consider adding a temporary override if you haven't
  reviewed them lately.                    [Pin all at N=2 →]
```

Felix reads the unmonitored section. He doesn't know what "pinning" means in this context. But he recognizes the agent names — RELAY-B and COMMAND-C are both from Mission 3, early in his playthrough. He hasn't touched them since.

He taps [Pin all at N=2]. Three overrides are created instantly. A brief explanation toast: "These agents will now flag at 2+ cluster appearances. You'll be notified sooner if they develop structural problems."

**Minute 0:20 — The Override Pays Off (Career Analysis Run #10)**

Felix runs career analysis 20 matches later. A flag fires:

```
⚠ COMMAND-C appears in 2 of your top 10 candidates.
  Threshold: N=2 (per-agent override)
  [View Agent Audit →]  [Dismiss]
```

Without the override, this would have been invisible — COMMAND-C had only 2 entries, below the global N=3 threshold. Felix clicks [View Agent Audit]. He reads the root cause: "Role drift — COMMAND-C was designed for 2-agent coordination in Mission 3. Current config has 9 agents with complex relay chains. COMMAND-C's coordination logic is undersized."

Felix didn't know his Mission 3 agent was outdated. He hadn't noticed because COMMAND-C never appeared at position #1 in career analysis — its individual elements were always slightly below the top candidates. The per-agent override surfaced a problem that the global threshold had been hiding.

He clicks [Redesign COMMAND-C]. The override clears on deploy. He now understands the system.

**Minute 10:00 — Self-Directed Override Management**

After the COMMAND-C redesign, Felix returns to the override panel. RELAY-B and STRIKER-A are still pinned at N=2. Neither has triggered a cluster event yet. He decides to keep them pinned — he wants the early warning on his other legacy agents too.

He also notices that the override panel now shows "1 agent overridden. 8 agents using global." He realizes he can use overrides selectively. He is beginning to think about his roster in terms of risk profiles — some agents need close monitoring, others are stable.

**UI Annotations:**
- The "Pin all at N=2" shortcut in the unmonitored section creates overrides with the system-generated note "(auto-pinned from unmonitored suggestion)" in italic gray. Felix can edit or clear these notes later.
- The explanation toast ("These agents will now flag at 2+ cluster appearances...") is longer than the standard confirmation toast (3 seconds instead of 2) because this is a first-time interaction. The extra second gives the casual player time to read.
- The cluster flag card includes the parenthetical "(per-agent override)" next to the threshold to distinguish it from global-threshold flags. This parenthetical is styled in smaller text, medium gray, to avoid cluttering the primary message.

---

### Journey 4: Diya, 40, Returning Player — Override Archaeology

**Context:** Diya played heavily in Seasons 1-3, set up several per-agent overrides, then took a 2-month break. She's returning to her save file in Season 4. Her override panel shows 5 overrides she barely remembers setting. She needs to understand what she was thinking.

**Minute 0:00 — Returning to the Override Panel**

Diya opens Career Analysis Settings. The override panel shows:

```
Per-Agent Overrides                             [+ Add Override]
─────────────────────────────────────
  RELAY-C      N=2  "legacy relay, structural debt"    [Edit] [×]
  SCOUT-F      N=2  "pre-season 2 design"              [Edit] [×]
  BUFFER-D     N=3  (no note)                          [Edit] [×]
  COMMAND-A    N=3  (auto-pinned)                       [Edit] [×]
  STRIKER-E    N=2  "adversarial weakness, see S2 G7"  [Edit] [×]

  5 agents overridden. 9 agents using global (N=4).
```

She reads the notes. "Legacy relay, structural debt" — she remembers RELAY-C. "Pre-season 2 design" — SCOUT-F, yes. "Adversarial weakness, see S2 G7" — she has no idea what S2 G7 refers to.

She clicks [Edit] on STRIKER-E. The agent inspector opens. The cluster history shows STRIKER-E triggered once, in Career Analysis Run #6 (Season 2, Match 180), with a combined coverage of 41%. The note says "adversarial weakness, see S2 G7" — she was referencing a specific Gauntlet match where an opponent exploited STRIKER-E's patrol radius. But that was before the redesign she did in Season 3, Match 250.

Wait. STRIKER-E was redesigned in Season 3. Why does it still have an override? She checks: the redesign happened, but it was a parameter-level change (she adjusted patrol radius and hook threshold), not a full Redesign Mode commit. The system only clears overrides on full Redesign Mode deploys — parameter-level changes via "Apply Fix" don't count.

She decides the override is stale. She clicks [x] to remove it. The override is cleared. STRIKER-E returns to the global threshold.

She reviews the remaining 4 overrides, clearing COMMAND-A (also stale — it was auto-pinned and she never investigated it). She keeps RELAY-C, SCOUT-F, and BUFFER-D.

**UI Annotations:**
- The note field is the critical returning-player affordance. Without notes, 5 overrides on a 2-month-old save file are opaque. The system-generated "(auto-pinned)" note is less helpful than player-written notes but better than nothing.
- Override age is not displayed explicitly but could be inferred from the "Override set: Career Analysis #N" line in the agent inspector. A future enhancement could show "Override active for 4 career analyses / 2 months" as a staleness signal.
- The distinction between "parameter-level fix" and "Redesign Mode commit" for override clearing is important. The system should display a tooltip the first time a player expects a parameter fix to clear an override: "Per-agent overrides are cleared when you use Redesign Mode, not when you apply individual fixes."

---

## Strengths and Weaknesses

**Strengths:**

- **Reflects real engineering practice.** Per-service alert thresholds are standard in production monitoring (Datadog, PagerDuty, Grafana). The player who uses per-agent overrides is practicing the same skill: calibrating diagnostic sensitivity to known risk profiles. This reinforces the game's identity as "engineering simulator disguised as tactics game."
- **Resolves the global-threshold compromise.** Without overrides, the player must choose one threshold that works tolerably for all agents. With overrides, the player gets precision where they need it and quiet where they don't.
- **Three entry points prevent discoverability failure.** A player might find overrides through the dismiss flow (contextual), the agent inspector (exploratory), or the settings panel (deliberate). Each path serves a different player intent.
- **The unmonitored agents nudge closes the blind spot.** The biggest risk of per-agent overrides — focusing on known problems while unknown problems accumulate — is addressed by the system proactively surfacing agents that haven't been examined.
- **Override notes create a player-authored diagnostic history.** The free-text note field turns the override panel into a living document of the player's architectural reasoning. This has value beyond the override itself: the player is articulating their mental model of their roster.

**Weaknesses:**

- **Complexity creep.** Per-agent overrides add a layer of configuration on top of the global threshold, which is already on top of the base multi-cluster detection system. For a player who has never opened the settings panel, the override management panel is intimidating. The mitigation (contextual entry through dismiss flow) helps, but the feature's full power is only accessible through the settings panel.
- **Stale override accumulation.** Players who set overrides and forget about them will accumulate configuration debris. The override expiration system (5 career analyses without a cluster event) mitigates this, but expiration banners are themselves a form of interruption. The player who returns after 2 months faces archaeology, not configuration.
- **Redesign-clears-override can surprise.** A player who carefully pinned N=2 on an agent, then enters Redesign Mode, may not expect the override to vanish on deploy. The deploy confirmation dialog discloses this, but the player may not read it carefully in the excitement of completing a redesign. Mitigation: the post-deploy toast explicitly states "Per-agent override cleared."
- **False sense of coverage.** A player with 5 overrides might think "I'm monitoring my whole roster" when they're actually monitoring 5 agents out of 14. The unmonitored agents section helps, but the player who doesn't open the settings panel won't see it.

---

## Interaction Effects

### With 4.69a — Threshold Configurability (Global)

Per-agent overrides are a strict superset of the global threshold. The global threshold becomes the default for agents without overrides. This creates a natural workflow: set the global threshold to match your "average agent" sensitivity, then pin overrides on outliers. The two features are co-dependent — without the global threshold, the player would need to set overrides on every agent individually. Without overrides, the global threshold forces a one-size-fits-all compromise.

The settings panel should display the relationship explicitly: "Global threshold: N=4. 3 agents overridden. 11 agents using global." This framing positions the global threshold as the base layer and overrides as exceptions.

### With 4.69d — Persistence Tracking

Persistence tracking records how many times an agent has clustered across career analyses. Per-agent overrides change the sensitivity of that tracking — an agent pinned at N=2 will accumulate persistence events faster than one at the global N=4. The persistence log should record the threshold that was active when each event fired, so the player can reason about the data:

```
RELAY-C Cluster History
  Run 8:  2 entries (threshold: N=2, override)     [Dismissed]
  Run 10: 3 entries (threshold: N=2, override)     [Applied All]
  Run 12: 2 entries (threshold: N=2, override)     [Dismissed]
```

A player reviewing this log should understand: "RELAY-C's cluster events are firing because I set a sensitive override, not because the clusters are necessarily severe." The threshold annotation on each event provides that context.

### With 4.69h — Phase Presets

Phase presets allow the player to set different thresholds for different career phases (early season vs. late season). Per-agent overrides interact with phase presets in a priority hierarchy: **per-agent override > phase preset > global threshold.** If a phase preset says "N=2 in early season" but the player has RELAY-C pinned at N=4 (they know RELAY-C is noisy early on), the per-agent override wins.

This creates a three-tier system that may be too complex for most players. The recommended simplification: phase presets affect the global threshold only, and per-agent overrides are absolute. The settings panel should show: "Phase preset (Early Season): N=2 global. RELAY-C: N=4 (per-agent override, supersedes phase)."

### With 4.69e — Adversarial Multi-Cluster Poisoning

An opponent who deliberately stresses three elements of the same target agent can trigger a false multi-cluster flag. Per-agent overrides amplify this risk: if the player has pinned N=2 on an agent they're already anxious about, an adversarial opponent who produces even a 2-entry cluster on that agent will trigger a flag. The player is primed to interpret the flag as genuine structural debt (they set the override because they believed the agent was fragile), when in reality the clustering was adversarially induced.

Mitigation: when a per-agent override flag fires, the system should annotate whether the clustered entries are concentrated against a specific opponent: "2 of 2 cluster entries occurred in matches against [Opponent X]. Consider whether this agent is being targeted rather than structurally weak."

### With 4.68 — Coverage Percentage as Season Health

Per-agent overrides create a richer signal for season health trending. The season health dashboard could show per-agent coverage trends alongside override status: "RELAY-C: coverage flat at 62% for 3 career analyses (override: N=2, flagging consistently)." This tells the player: "you're watching RELAY-C closely and it's not improving — the override is working as a diagnostic, but the underlying problem persists."

---

## Comparable Games/Media

**Grafana / Datadog Alert Rules.** Production monitoring dashboards allow per-service alert thresholds as a core feature. A team might set the default CPU alert at 80% but pin their payment service at 60% because payment latency is business-critical. Robot Uprising's per-agent override is the same pattern: the player is the SRE, the agents are services, the cluster threshold is the alert sensitivity. The Override Management Panel is directly analogous to an alert rules page in Grafana — a list of overrides, each with a target, a threshold, and a note.

**Paradox Grand Strategy — Province/Region Alerting.** In Crusader Kings III and Europa Universalis IV, players can set per-province alerts (e.g., "notify me when this province's unrest exceeds 3"). The mechanic serves the same function: the player has global notification settings but can pin heightened attention on specific territories they know are volatile. The UX challenge is identical — managing a growing list of per-entity overrides without the list becoming unwieldy.

**IDE Lint Suppression / Per-File Config.** In software development, linting tools allow per-file or per-line severity overrides (e.g., `// eslint-disable-next-line no-unused-vars`). The player who pins N=2 on RELAY-C is doing the reverse of lint suppression — they're *increasing* sensitivity rather than decreasing it — but the mechanism is the same: a per-entity override of a global rule, with an optional annotation explaining why.

**XCOM 2 — Soldier Monitoring.** Experienced XCOM 2 players mentally track which soldiers are "fragile" (low will, high fatigue, undesirable traits) and pay extra attention to them in mission deployment. The game doesn't formalize this monitoring — the player carries it in their head. Robot Uprising's per-agent override externalizes this mental tracking, making it a first-class game mechanic rather than an unassisted player habit.

---

## Sensory Description

**The Override Radio Group** feels tactile. Each radio button is a rounded pill, 36px wide, spaced 8px apart in a horizontal row. The currently active pill has a white background with a 2px teal border and a teal dot in the center. Inactive pills are medium gray with a 1px border. When the player taps a new pill, the transition is a 120ms spring animation: the old pill's teal border fades to gray over 80ms; the new pill's border blooms from gray to teal with a slight overshoot (the border widens to 3px then settles to 2px). On mobile, a 40ms haptic tap fires on selection — a single, clean click, like a physical toggle switch engaging.

**The Override Management Panel** has a quiet visual language. The background is the same cool gray as the Career Analysis settings panel. Override rows are displayed in cards with a 1px border, 8px padding, and a subtle left-edge color bar — teal for N=2 overrides, amber for N=3, medium gray for N=4 (global). The color bar is 4px wide and runs the full height of the card. This creates an instant visual hierarchy: the most sensitive overrides (teal, N=2) catch the eye first; the standard overrides (gray, N=4) recede.

**The Unmonitored Agents section** has a different visual treatment from the override list. It sits below a thin 1px divider. The background is a barely perceptible warm amber tint (5% opacity amber over the base gray) — a visual whisper that says "pay attention here, but don't panic." The agent names listed as unmonitored are displayed in slightly smaller text (13px vs. the override list's 14px), with a hollow circle icon (unfilled, gray stroke) to the left of each name — the opposite of the filled teal dot that marks overridden agents.

**The Retroactive Flag** — when the player sets an override and the current career analysis result retroactively fires a cluster flag — enters with a distinctive animation. Instead of the standard right-slide that cluster flags use, the retroactive flag fades in from 0% to 100% opacity over 400ms, accompanied by a soft chime pitched one half-step higher than the standard cluster chime (D to F-sharp instead of D to F). The slightly different pitch signals: "this isn't a new diagnostic event — it's a recalculation of existing data under a new rule." The player who has heard the standard cluster chime before will register the difference subconsciously.

**Audio for Override Confirmation.** When the player saves a new override (from any entry point), a brief two-note confirmation sound plays: a soft click followed by a descending perfect fifth (C to F, low register). The descending interval is deliberately different from the ascending interval of the cluster flag chime — overrides are about setting a watch, not about receiving a warning. The sound is calm, authoritative, final: "this is configured now."

**The Override Cleared on Redesign** moment has its own audio signature. When the deploy confirmation fires and the override is cleared, the standard redesign deploy sound (a bright ascending arpeggio) plays first, followed by a quiet single tone that decays over 800ms — the sound of something being put down gently. The override was a burden the player was carrying. The redesign resolved it. The tone says: "you can stop watching now."

---

## New Aspects Discovered

- **4.69m — Override templates for roster archetypes:** Named override profiles ("Legacy Watch," "Adversarial Defense," "Pre-Redesign Audit") that apply a set of per-agent overrides in one action. A player who has identified 4 legacy agents can apply "Legacy Watch" (N=2 on all four) instead of setting each individually. Templates can be shared in the community.
- **4.69n — Override-triggered auto-audit:** When a per-agent override fires for the Nth consecutive career analysis (configurable, default 3), the system automatically opens the Agent Audit panel instead of showing the standard cluster flag card. The player has been warned enough — now the system escalates to the full diagnostic view without requiring a click.
- **4.69o — Cross-agent override correlation:** When two or more overridden agents cluster simultaneously, a special compound flag fires: "RELAY-C and SCOUT-F both clustered this run. Both are overridden at N=2. These agents may share a common structural dependency." This detects inter-agent architectural problems that per-agent monitoring alone cannot surface.
