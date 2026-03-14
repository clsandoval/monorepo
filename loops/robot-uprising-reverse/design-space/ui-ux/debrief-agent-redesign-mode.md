# Agent Redesign Mode as a Dedicated Workbench State

**Aspect:** 4.69c — Agent redesign mode as a dedicated workbench state: full design of the isolated redesign sandbox — how the player enters, what UI affordances are available, how changes are staged vs. committed, how the simulation differs from normal workbench operation.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69b — Combined agent coverage score display; 4.69d — Multi-cluster persistence tracking
**Related:** 4.36 — Multi-scenario fix explorer; 4.37 — Fork-and-deploy shortcut; 4.38 — Counterfactual history; 4.60 — Search budget as player resource; 4.68 — Coverage percentage as season health

---

## The Core Concept

When the player clicks `[Redesign RELAY-C →]` from the multi-cluster detection panel, they do not simply open the workbench with RELAY-C selected. They enter a **dedicated workbench state** — a first-class mode with its own visual identity, its own rules about what can be edited, its own simulation sandbox, and its own commit/discard lifecycle.

The distinction matters. Normal workbench editing touches a live config: changes take effect immediately (or on the next match deployment). Redesign mode is a **sandbox**: changes are staged, not applied. The player can tear RELAY-C apart and rebuild it from nothing without affecting the config that is currently scheduled to play in three hours. They can test the new design in simulation, review the diff against the current design, and only commit when they are satisfied.

This creates a qualitatively different feeling: **architecture mode vs. maintenance mode.** Normal workbench editing is maintenance — adjust a parameter, apply the fix, run the next match. Redesign mode is architecture — rethink the agent's fundamental role, purpose, and internal logic. The mode boundary signals to the player: you are doing a different kind of work now.

---

## Entry Points

### Entry 1 — From Multi-Cluster Detection (Primary Path)

The most common entry point. The career analysis panel surfaces a cluster flag on RELAY-C. The player clicks `[View Agent Audit →]`, reads the combined coverage (+9pp), reads the root cause hypothesis (role drift), and clicks `[Redesign RELAY-C →]`. Redesign mode opens with RELAY-C selected as the focal agent. The cluster members (the three elements that triggered the flag) are pre-highlighted in the redesign workspace — the player's attention is already pointed at the problem areas.

**Handoff state:** The cluster's match attribution data is passed into redesign mode's simulation environment, so stress tests are pre-populated with the specific matches where cluster members failed. The player doesn't have to set up test scenarios — they inherit the diagnostic context that triggered the redesign.

### Entry 2 — From Agent Inspector (Proactive Path)

In the normal workbench, every agent has an inspector panel (name, version, role, stats). At the bottom of the inspector: `[Redesign This Agent →]`. This entry point doesn't require a cluster flag. The player can choose to enter redesign mode at any time — before a cluster fires, after a redesign, as a proactive investment in a new agent.

**Handoff state:** No pre-populated stress tests. The simulation environment starts empty, and the player builds their own test scenarios. A panel suggests: "No cluster history for this agent — run scenarios to stress-test your redesign."

### Entry 3 — From Season Health Dashboard (Debt-Driven Path)

The season health dashboard shows per-agent structural debt. An agent with multiple cluster events has a debt badge: `⚠ RELAY-C — 3 cluster events / 2 sessions`. Clicking the badge opens a compressed agent audit inline in the dashboard, with a `[Enter Redesign Mode →]` button. This path allows the player to action structural debt from the strategic overview view, without first running a career analysis.

**Handoff state:** Cluster history (which elements have fired across multiple analyses) is passed into the redesign workspace. The player sees a timeline of cluster events for this agent above their workspace.

### Entry 4 — From Career Analysis Candidate List (Quick-Entry Path)

Right-clicking any entry in the career analysis runner-up list reveals a context menu including `[Open Agent in Redesign Mode →]`. This is a fast path for players who want to jump into redesign directly from the candidate list without going through the full agent audit flow.

**Handoff state:** The single selected candidate element is pre-highlighted in the redesign workspace (no cluster context). This is a light-touch entry — the player gets the isolation sandbox without the full diagnostic handoff.

---

## The Four Redesign Mode Variants

### Variant 1 — Spotlight Mode (Recommended Default)

The focal agent is fully editable. All other agents are visible in the agent roster (sidebar), grayed to 40% opacity and locked — the player can hover to inspect them (read-only) but cannot edit them. The battlefield Pixi canvas shows RELAY-C's territorial range, hook connections, and signal flow paths; other agents' canvases are dimmed. A coral header strip across the top of the screen reads `REDESIGN MODE — RELAY-C`.

**Rationale:** Other agents remain visible because redesign decisions often require understanding dependencies. When rebuilding RELAY-C's context buffer, the player needs to know what COMMAND-A expects from RELAY-C's output — information only accessible by peeking at COMMAND-A's config. Spotlight mode allows this peeking without enabling accidental edits.

**The coral border:** All RELAY-C config elements in redesign mode are rendered with a soft coral (#FF6B6B) border instead of the standard teal (#4ECDC4). This is persistent throughout the session. The player can never forget they are in a sandbox — every element they touch is visually tagged as staged, not live.

### Variant 2 — Cocoon Mode (Deep Focus Option)

All other agents are hidden. The workspace shows only RELAY-C. The roster sidebar collapses. The battlefield canvas shows only RELAY-C's range and signal outputs. Nothing else exists.

**When to use:** When the focal agent's redesign is structurally independent — no hooks into or out of other agents, no signal dependencies. Useful early in a career when agents are simple and isolated. Useful for players who are easily distracted and want zero visual noise.

**When NOT to use:** When RELAY-C has hooks that receive signals from SCOUT-A and sends compressed signals to COMMAND-A. Rebuilding RELAY-C in a vacuum risks introducing incompatibilities with its neighbors. Cocoon mode should warn the player if the focal agent has more than 2 active hook connections: "RELAY-C has 3 active hooks to other agents. Consider Spotlight mode to see dependencies while redesigning."

### Variant 3 — Paired Mode (Collaborative Redesign Option)

Two agents are editable simultaneously. The player selects a second agent to "unlock" from the grayed roster — the second agent becomes co-editable with full coral-border treatment. The simulation runs the staged configs of both focal agents simultaneously, so changes to RELAY-C and COMMAND-A can be tested together before either is committed.

**When to use:** When a dependency gap is the root cause — RELAY-C's output profile changed and COMMAND-A's attention filters need simultaneous retuning. Fixing one without fixing the other produces a half-broken state. Paired mode allows joint redesign with a joint commit ("deploy both").

**Entry path:** After entering Redesign Mode, a panel offers: `[Add Second Agent →]`. Clicking reveals the agent roster — the player selects COMMAND-A. COMMAND-A enters the sandbox alongside RELAY-C. The header updates: `REDESIGN MODE — RELAY-C + COMMAND-A`.

**Commit behavior:** The paired commit applies both staged configs atomically. If the player commits only one agent (partial commit), the system warns: "RELAY-C and COMMAND-A are co-edited — deploying RELAY-C alone may break COMMAND-A's dependency on the new signal profile. Deploy both or discard changes to COMMAND-A."

### Variant 4 — Template-Seeded Mode (Guided Redesign Option)

Instead of starting from the current config (and iterating from there), the player selects a **role template** — a pre-built config skeleton for a defined agent role. Templates include: short-range relay, long-range relay, 3-hop relay, proximity scout, deep scout, command hub, strike controller, etc.

When a template is selected, it pre-populates the redesign workspace with canonical parameters: buffer size, priority queue depth, hook topology, and signal filter presets appropriate for that role. The player can then customize on top of the template rather than reasoning from first principles.

**When to use:** When role drift is the root cause. The player knows RELAY-C has drifted from single-hop to three-hop relay — the 3-hop relay template sets appropriate defaults immediately. The player doesn't need to figure out what buffer size a 3-hop relay should have; the template starts them in the right neighborhood.

**Risk:** Templates create homogenization pressure. If all 3-hop relay agents use the same template as a starting point, they converge toward similar configs and the diversity of emergent strategies shrinks. Templates should be presented as "starting points" not "correct answers" — their parameters should visibly differ from the live config to encourage further customization rather than accepting defaults wholesale.

---

## Staging vs. Committing

### The Staged Config Diff View

At all times in redesign mode, a collapsible "STAGED CHANGES" panel is accessible (toggle with keyboard shortcut or by clicking the panel header). The diff shows:

```
STAGED CHANGES — RELAY-C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
context buffer size     80 slots → 120 slots    ↑ +50%
fallback filter depth   2        → 4            ↑ +100%
priority queue depth    3        → 5            ↑ +67%
hook: receive_signal    enabled  → enabled      (unchanged)
hook: relay_to_cmd      enabled  → enabled      (unchanged)
agent role tag          single-hop-relay → 3-hop-relay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 parameters changed / 6 parameters total
[Commit and Deploy →]  [Save Draft]  [Discard All Changes]
```

The diff renders changed parameters in coral text, unchanged in gray. The counts ("3 changed / 6 total") give the player a scope signal before committing.

**What the diff does NOT show:** downstream effects. Changing the priority queue depth in RELAY-C may improve RELAY-C's behavior but introduce a new bottleneck for COMMAND-A. The diff is a first-order view of what changed in the focal agent — not a transitive impact analysis. The player is expected to test before committing to surface transitive effects.

### The Save Draft Mechanic

The player can save a redesign as a named draft without committing it:

```
SAVE DRAFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Draft name: relay-c-3hop-v2
Notes: rebuilt for 3-hop role, enlarged buffer
Created: Session 5, Match 190
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Save]
```

Drafts are accessible from the workbench homepage: "Saved Redesign Drafts (2)." The player can return to a draft in a future session, continuing from where they left off. Drafts can also be shared with other players (asynchronous design exchange — see multiplayer/asynchronous-redesign-sharing.md).

**The multi-session redesign workflow:** Major architectural work can take multiple sessions. A player might spend session 1 analyzing the problem (running stress tests, reading the cluster history), session 2 building the redesign, and session 3 testing and committing. The draft system makes this natural rather than forcing the player to commit (or discard) within a single session.

### Commit and Deploy

Committing applies the staged config to the live deployment queue. The commit action shows a final confirmation dialog:

```
COMMIT REDESIGN — RELAY-C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are replacing RELAY-C v3.2 with RELAY-C v4.0
3 parameters changed from the live config.

This will take effect in your next deployed match.
Your match history and career statistics will record
this as "RELAY-C redesign — session 5."

For comparison: counterfactual history will track
what would have happened if you had kept v3.2.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Confirm Deploy →]  [Return to Redesign]
```

The mention of counterfactual history in the confirmation dialog is intentional: the player is reminded that the outcome of this redesign will be measurable against the alternative (keeping v3.2). This sets up the "learning loop close" that appears after 20+ matches with the new config (see 4.38 — Counterfactual History).

---

## Simulation in Redesign Mode

### How It Differs from Normal Workbench Simulation

In normal workbench simulation, the player runs a selected scenario against the live config (all agents at their current settings). The result is a real simulated battle that plays out on the battlefield canvas.

In redesign mode simulation, the player runs scenarios against a **hybrid config**: the focal agent (RELAY-C) uses the **staged** config; all other agents use the **live** config. This hybrid is the only way to meaningfully test a redesigned agent in context — running it with all-live agents tests whether the new RELAY-C integrates with the rest of the config that will actually be deployed alongside it.

The simulation panel in redesign mode shows a comparison header:

```
Simulation: RELAY-C Redesign Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Config: RELAY-C v4.0 (staged) + all others v3.x (live)
Scenario: Dense Formation Attack — 3 waves
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Run Simulation →]  [Run Side-by-Side →]
```

The `[Run Side-by-Side →]` option is the redesign mode's signature affordance: it runs the same scenario twice in parallel — once with the staged config and once with the live config — and shows the results split-screen. The player sees both RELAY-C behaviors play out simultaneously.

### Stress Test Scenarios

When redesign mode is entered from the multi-cluster detection path, the simulation panel is pre-populated with **stress test scenarios** derived from the cluster members' failure matches:

```
STRESS TEST SCENARIOS (from cluster analysis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● 3-Hop Dense Formation (failed in 8/10 cluster failures)  [Run →]
● Rapid Signal Burst — High Volume (failed in 6/10)        [Run →]
● Command Hub Overload (failed in 5/10)                    [Run →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are the scenarios where RELAY-C's clustered elements most often failed.
A good redesign should pass all three.
```

The stress test scenarios are automatically generated by finding the 3–5 match scenarios from the career analysis window where the greatest number of cluster members failed simultaneously. These represent RELAY-C's worst-case scenarios — the redesign must specifically address them.

A "pass/fail" indicator runs during simulation: if the redesigned RELAY-C would have changed the outcome of a stress test scenario (from loss to win, or from marginal to decisive win), the scenario lights up green. If the redesigned config doesn't improve the outcome, the scenario stays amber or red.

```
STRESS TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 3-Hop Dense Formation        PASS (was: loss — now: win)
✅ Rapid Signal Burst           PASS (was: marginal — now: decisive)
⚠  Command Hub Overload        PARTIAL (loss remains — not addressable by RELAY-C alone)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2/3 stress tests pass. Command Hub Overload may require COMMAND-A adjustment.
```

The "Command Hub Overload" partial result prompts the player to consider: should COMMAND-A also be redesigned (enter Paired Mode)? The simulation surface this organically, without prescribing an action.

---

## Player Journeys

### Journey: Marcus, 35, Product Manager — First Redesign, Discovering the Isolation

**Context:** Marcus is in Season 2, Match 190. He has just clicked `[Redesign RELAY-C →]` from the multi-cluster detection panel for the first time. He has never entered redesign mode before. He is nervous about "breaking something."

**Minute 0:00 — Entering Redesign Mode**

The transition from the career analysis panel to redesign mode is deliberate and theatrical. The career analysis panel fades out. The workbench loads — but differently than normal. The coral header strip appears across the top: `REDESIGN MODE — RELAY-C`. All other agents in the sidebar are visibly grayed.

Marcus's first reaction: "Why are all the other agents greyed out?" He hovers over SCOUT-A (grayed). A tooltip: "SCOUT-A is locked during RELAY-C's redesign. You can inspect SCOUT-A's config but not edit it. [Click to inspect →]"

He exhales. He can't accidentally break SCOUT-A. Relief.

**Minute 0:30 — Exploring RELAY-C's Config**

Marcus clicks on RELAY-C in the roster. The workbench panel expands — RELAY-C's full config is visible. Every element has a coral border he's never seen before. He notices the "STAGED CHANGES" toggle in the lower right of the panel. He opens it. It shows 0 changes (he hasn't edited anything yet). "Clean start," he thinks.

He sees the STRESS TEST SCENARIOS panel below the workbench: three pre-populated scenarios from the cluster analysis. He clicks `[Run →]` on the "3-Hop Dense Formation" scenario.

**Minute 0:45 — First Simulation**

The battlefield canvas runs the simulation. The other agents are dim — only RELAY-C's signals are actively visible, glowing coral instead of their usual colors. The simulation completes. RELAY-C fails at the third signal hop — the buffer fills before the third relay can execute.

Marcus watches the buffer visualization: the vertical thermometer on RELAY-C's portrait flashes red exactly at the third hop. He sees the problem in real time. The buffer is too small for three hops.

**Minute 2:00 — Editing**

He increases the buffer size: 80 → 120. The staged changes panel updates: "1 change (context buffer size: 80 → 120)." He re-runs the simulation. The buffer stays in amber at the third hop — full but not overflowing. Pass.

He increases the priority queue depth: 3 → 5. Staged changes: 2. Re-runs. The "Rapid Signal Burst" scenario now passes too.

**Minute 8:00 — The Diff Review**

He opens the diff view. Three changes. He reads each one: buffer up 50%, filter depth up 100%, queue depth up 67%. He looks at the numbers and whispers: "I made RELAY-C bigger for the bigger job."

He clicks `[Commit and Deploy →]`. The confirmation dialog appears. He reads: "counterfactual history will track what would have happened if you had kept v3.2." He didn't know this. He clicks Confirm.

**Minute 8:30 — Exit**

Redesign mode exits. The workbench returns to its normal state: other agents ungray, coral borders disappear, teal returns. A brief animation: RELAY-C's portrait gets a version badge — "v4.0" — and pulses gently teal for 1 second.

Marcus feels like he did surgery. Clean, deliberate, reversible (he can check the counterfactual later). Nothing was accidentally broken.

**UI Annotations:**
- Grayed agents: 40% opacity, locked icon (🔒) on hover; click to open read-only inspector
- Coral border: 2px solid coral (#FF6B6B) on every editable element in RELAY-C's config; persistent throughout mode
- Stress test panel: pre-populated automatically; located below the staged changes panel in the right column; collapsible
- Simulation canvas: other agents rendered at 30% opacity; RELAY-C's signals rendered in coral; buffer visualization enlarged (40% taller than normal portrait) and center-positioned
- Version badge: appears on RELAY-C portrait when commit is confirmed; shows "v4.0" in a small pill badge, pulsing teal for 1 second then settling

---

### Journey: Priya, 30, Software Engineer — Paired Mode Redesign for RELAY-C + COMMAND-A

**Context:** Priya is in Season 4 Gauntlet. After the RELAY-C redesign (which passed stress tests but produced a "Command Hub Overload partial" result), she re-enters redesign mode in Paired Mode to redesign both RELAY-C and COMMAND-A simultaneously. She understands the dependency: COMMAND-A's attention filters are calibrated for the old RELAY-C output profile; the new RELAY-C sends different signals.

**Minute 0:00 — Entering Paired Mode**

She enters redesign mode with RELAY-C (the redesigned v4.0) as the focal agent. She clicks `[Add Second Agent →]` and selects COMMAND-A. The header updates: `REDESIGN MODE — RELAY-C + COMMAND-A`. Both agents have coral borders. The roster shows all other agents grayed, with two agents highlighted.

**Minute 0:30 — Mapping the Signal Dependency**

She opens the signal flow view — a canvas overlay showing the active hook connections between all agents in the config. With RELAY-C and COMMAND-A in Paired Mode, the signal flow between them is rendered prominently: a thick coral arrow from RELAY-C's output hook to COMMAND-A's receive hook. Signal type: "compressed_relay_signal, priority_weighted."

Priya inspects RELAY-C v4.0's output profile: it now produces priority-weighted compressed signals with higher volume (larger buffer = more signals forwarded). She looks at COMMAND-A's attention filter: set to accept "compressed_relay_signal, depth: 2." But RELAY-C v4.0 produces depth-4 signals. The filter is set to depth 2 — it will drop the extra depth and lose half the information RELAY-C is now producing.

**Minute 2:00 — Updating COMMAND-A**

She edits COMMAND-A's attention filter: depth 2 → depth 4, matching RELAY-C's new output. Staged changes panel: "RELAY-C: 0 changes (already staged from prior redesign). COMMAND-A: 1 change (attention filter depth: 2 → 4)."

She runs the "Command Hub Overload" stress test in side-by-side mode: old config (RELAY-C v3.2 + COMMAND-A with depth-2 filter) vs. staged config (RELAY-C v4.0 + COMMAND-A with depth-4 filter).

The side-by-side runs. Old config: overload at 12 seconds. New config: no overload, mission completes.

**Minute 4:00 — Paired Commit**

She opens the diff view for both agents:

```
RELAY-C: 0 changes from staged config (committed in last session)
COMMAND-A: 1 change (attention filter depth: 2 → 4)
```

She clicks `[Commit Both →]`. The confirmation dialog notes: "Deploying changes to COMMAND-A only. RELAY-C was already committed. Do you want to re-commit RELAY-C with the combined config for counterfactual tracking purposes?" She chooses yes — so the counterfactual baseline is "old RELAY-C v3.2 + old COMMAND-A" vs. "RELAY-C v4.0 + COMMAND-A v2.1."

**What Priya Found Valuable:**
- The signal flow overlay in Paired Mode — she didn't have to mentally reconstruct the dependency, the game visualized it
- Side-by-side simulation showing both configs simultaneously — the comparison made the fix's value immediately legible
- The counterfactual tracking of the paired commit as a combined baseline

**What Priya Would Want (Feature Requests):**
- "Auto-detect dependency partners" — when entering redesign mode on RELAY-C, the system suggests "COMMAND-A depends on RELAY-C's output — add it to Paired Mode?" based on hook topology analysis
- A "dependency map" panel showing all agents that would need attention if RELAY-C's output profile changes

**UI Annotations:**
- Signal flow overlay: accessed via toolbar icon (graph symbol); shows all active hook connections as directed arrows; in Paired Mode, connections between the two focal agents are rendered thick coral, connections to/from other agents are thin gray
- Side-by-side simulation: split-screen canvas, each half labeled "LIVE CONFIG" and "STAGED CONFIG"; synchronized timeline, same seed, same enemy positions; outcome badges ("Pass/Fail/Partial") appear at simulation completion

---

### Journey: Soren, 17, Student — Template-Seeded Redesign Saves a Confused First Timer

**Context:** Soren is in Season 2, Match 140. He clicked `[Redesign SCOUT-A →]` from the multi-cluster detection panel. He's never done a holistic redesign. He opens the redesign workspace and sees SCOUT-A's config — twelve parameters, terms he doesn't know (eviction policy, signal_type mask, depth_limit). He is immediately overwhelmed.

**Minute 0:00 — Panic**

The redesign workspace opens. SCOUT-A's config is displayed. Soren reads the first parameter: "eviction_policy: FIFO_weight_2." He has no idea what FIFO means or what weight-2 means.

He freezes. There are twelve parameters. He doesn't know what any of them do. He has no idea where to start.

**Minute 0:20 — The Template Prompt**

A gentle hint card appears in the lower-right of the workspace — it wasn't there before, it appeared after 15 seconds of inactivity:

> **Not sure where to start?**
> SCOUT-A's role is "Long-Range Scout." There's a template designed for this role.
> Templates set up the key parameters for you — then you customize.
> `[Start from Long-Range Scout Template →]`  `[I'll build from scratch]`

Soren clicks `[Start from Long-Range Scout Template →]`.

**Minute 0:30 — Template Applied**

The workspace fills with the template config. The diff panel shows: "7 of 12 parameters changed from current config." A new annotation appears next to each changed parameter: a small tag in light blue — "Template value." Parameters the template left unchanged are tagged "Current value."

The template changed: signal range (short → long), buffer size (60 → 90), eviction policy (FIFO_weight_2 → PRIORITY_recency), depth limit (2 → 4), and three hook thresholds.

Soren reads the "eviction policy" line now: "PRIORITY_recency." A tooltip on hover: "When the buffer fills, older signals are evicted first. This keeps SCOUT-A's working memory fresh with recent observations." He understands that. It makes sense for a scout — you want recent information, not old information.

**Minute 2:00 — Running the Stress Test**

He runs the stress test "Long-Range Scout Failure — Signal Loss at Range." Old config: SCOUT-A fails at range 4 (signal lost). Template config: SCOUT-A reaches range 6 before signal degradation.

He clicks `[Commit and Deploy →]`.

**What Soren Found Valuable:**
- The 15-second inactivity prompt — it appeared exactly when he was frozen, not immediately (which would have felt patronizing)
- The template pre-populated the config but left him in the driver's seat — he could have ignored the template and built from scratch
- The "Template value" / "Current value" tags on each parameter — they showed which parameters changed and gave him a reading comprehension scaffold
- The stress test immediately showed improvement — he got the win even though he didn't fully understand what he changed

**What Would Have Lost Soren:**
- A blank redesign workspace with no guidance
- A template that pre-populated everything and auto-committed (no opportunity to learn)
- Tooltips that define terms in more technical language than the parameter name itself

**UI Annotations:**
- Inactivity hint card: triggers after 15 seconds of no edits in the redesign workspace; fires only on the player's first 3 redesigns; position: lower right, 320px wide, soft white background with a subtle coral left border; dismiss button clears without action
- Template tag badges: small pill labels "Template" (light blue) and "Current" (gray) appear inline on the right of each parameter row when a template has been applied; toggle-able (the player can hide them once familiar)
- Template selector panel: lists all templates as named cards with a brief description and a match-count stat ("Used by 847 players in your match history range"); searchable; a "Custom (blank)" option is always first in the list

---

## Strengths and Weaknesses

### Strengths

- **Prevents destructive editing.** The staged config model means a player who makes a catastrophic mistake (deletes the wrong hook, sets a buffer to 0) can always discard and restart. No match will be played with a broken config because the player forgot to revert a change.
- **The side-by-side simulation is uniquely powerful.** No other workbench affordance shows the counterfactual — "here is what your current config does, here is what your redesign does, simultaneously, in the same scenario." This makes the value of a redesign legible in a way that element-by-element fixes never can.
- **Isolates cognitive load.** The player thinks about one agent's architecture at a time. The grayed-out other agents don't disappear — they provide context — but they can't be accidentally edited. The redesign session is a bounded problem.
- **Paired Mode handles the real-world case.** In practice, many agent redesigns require coordinated changes across two agents. Forcing the player to redesign one at a time and then manually check compatibility is error-prone. Paired Mode treats the dependency as a first-class design constraint.
- **Templates lower the floor without capping the ceiling.** A beginner gets a functioning config immediately. A veteran ignores the template and builds from scratch. The same mode serves both.

### Weaknesses

- **The sandbox can create false confidence.** Stress tests are derived from past failures — they test known failure modes. A redesign might pass all stress tests and still fail in the next match due to an untested scenario type. The "pass 3/3 stress tests" signal may cause the player to over-commit without sufficient real-match validation.
- **Paired Mode's paired commit creates complexity.** If the player commits RELAY-C and COMMAND-A atomically, what happens when the post-deploy analysis shows RELAY-C improved but COMMAND-A degraded? Which agent do they iterate on? The joint commit makes attribution harder. An "atomic paired commit" vs. "sequential paired commit" (RELAY-C first, test, then COMMAND-A) design question is non-trivial.
- **The draft save system may cause confusion.** Players who save a draft and return in session 6 may not remember the context of the redesign: "why did I start redesigning RELAY-C? What was the cluster flag that triggered this?" The draft must include a "context snapshot" — the cluster analysis result that preceded it — to rehydrate the player's intent.
- **Template homogenization risk.** If the top-5 most popular templates become the de facto "correct" configs for each role, the strategic depth of the game narrows. Template usage should be tracked; if >60% of players use the same template for a role, the template should be revised or new emergent strategies should be highlighted to break the monoculture.

---

## Interaction Effects

### With 4.37 — Fork-and-Deploy

Fork-and-deploy creates a copy of an agent config and runs both the original and the copy in parallel matches. Redesign mode's staged config is semantically similar — a copy of the agent config that exists alongside the live version. The interaction: after completing a redesign and committing, the player could use fork-and-deploy to run the old config (RELAY-C v3.2) and the new config (v4.0) head-to-head in a controlled experiment, rather than relying on the counterfactual projection. This is stronger evidence than the counterfactual (real matches vs. simulated counterfactual) but requires more matches.

### With 4.38 — Counterfactual History

The counterfactual history system is set up at commit time (the commit dialog explicitly mentions it). After 20+ matches with the new config, the counterfactual history panel shows: "if you had kept RELAY-C v3.2 and applied element-by-element fixes, estimated outcome: X% win rate. Actual outcome with v4.0 redesign: Y% win rate." This closes the learning loop that the redesign opened.

### With 4.60 — Search Budget as Player Resource

If redesign mode simulations cost search budget, entering redesign mode is a meaningful resource decision. The stress test scenarios (3 pre-populated runs) consume 3 budget units. The side-by-side simulation consumes 2. A player with a depleted budget who needs to redesign before a Gauntlet match is in genuine tension: spend the budget on simulations (validate the redesign) or save it for career analysis (diagnose other problems). Redesign mode becomes a budget sink only when it's misused as a testing ground for speculative changes — deliberate, targeted redesigns (informed by the cluster analysis) should require fewer simulation runs.

### With 4.69d — Multi-Cluster Persistence Tracking

After committing a redesign, the multi-cluster persistence tracker notes: "RELAY-C redesigned session 5, match 190." The next career analysis checks whether RELAY-C appears in the cluster again. If it does — if the redesign didn't address the structural root cause — the persistence tracker records a "redesign failure" event. After two redesign failures for the same agent, the tracker flags the agent as a "persistent structural problem" and the next redesign-mode entry offers: "RELAY-C has been redesigned twice without resolving its cluster pattern. Consider Paired Mode with its 2 dependency agents, or consult the career analysis longitudinal view."

---

## Comparable Games / Media

### Factorio — Blueprint Mode

Factorio blueprints allow the player to save and copy factory layouts without affecting the live factory. A blueprint is a staged config: the player designs in blueprint space, then deploys to real space. Redesign mode is Factorio's blueprint system applied to agent configs: design in the sandbox, deploy to the live config. The analogy is almost exact, except Factorio blueprints have no simulation — you can't test a blueprint against a production scenario before building it. Robot Uprising's redesign mode adds the simulation layer Factorio lacks.

### Vim / Git — Staging Before Commit

The "staging vs. committing" model is directly from software version control. In Git, changes are unstaged (working tree), staged (index), and committed (HEAD). Redesign mode stages changes to an agent config before committing them to the live deployment. The vocabulary is intentional: "staged changes," "commit," "discard" — all Git terms. Players with software backgrounds will recognize this immediately and feel at home. Players without software backgrounds encounter these concepts in a context where the motivation is obvious (you don't want to accidentally deploy a broken config), making the vocabulary approachable.

### Figma / Sketch — Component Isolation Mode

Design tools allow designers to enter "component editing mode" — double-click a component to edit it in isolation, other layers grayed out. Changes to the component are reflected everywhere the component is used. Redesign mode is this same pattern: isolate the agent component, edit it in a clear-headed focused state, commit the changes back to the system. The visual treatment (other elements grayed, focal element fully lit) maps directly to Figma's component editing experience.

### Kerbal Space Program — VAB vs. Launch

KSP's Vehicle Assembly Building (VAB) is a staged design environment: the player builds a rocket in the VAB and launches it only when ready. The launch is irreversible — the rocket either works or it doesn't. KSP's design philosophy is "test in the VAB before committing to the launch." Robot Uprising's redesign mode is the VAB: an environment for iterative, reversible design before the commit. The main workbench is the launch — once you deploy, the config is live and the next match is running.

---

## Sensory Description

**The transition into redesign mode:**

When the player clicks `[Redesign RELAY-C →]`, the transition is deliberate — not a simple page swap. The career analysis panel fades to black over 300ms. A beat of silence (0.5 seconds). Then the redesign workbench fades in, fully formed, over 400ms. The transition is theatrical by design: you are entering a different space.

The workbench is almost identical to the normal workbench — same layout, same panels, same agent roster — but the color palette has shifted. Where normal mode uses teal (#4ECDC4) as its primary accent, redesign mode uses coral (#FF6B6B). Every editable element in RELAY-C's config has a coral border. The header strip at the top of the screen reads `REDESIGN MODE — RELAY-C` in small caps, coral text on a near-white background. The coral header is thin (24px) and persistent — it never goes away during the redesign session.

The grayed agents in the roster are rendered with a desaturated texture: their portraits lose color (converted to near-grayscale), their health bars disappear (replaced by dim outlines), their hover states mute to a soft gray glow rather than the usual blue pulse. They are visible but clearly Not The Point.

**The simulation in redesign mode:**

When a stress test simulation runs, the Pixi battlefield canvas shows only RELAY-C's signals — rendered in coral instead of teal. Enemy signals render normally. All other allied agents move and react but their signals are invisible (no lines drawn). The focus is entirely on RELAY-C's information throughput: how many signals it receives, how many it processes, where the buffer thermometer reads.

The side-by-side simulation splits the canvas with a thin white divider line. Left half: "LIVE CONFIG" in small gray text at the top. Right half: "STAGED CONFIG" in coral text. Both battlefields run in perfect synchrony — same enemies, same tick, same seed. If a unit dies in the live config but survives in the staged config, the divergence is immediately legible: one battlefield has a unit alive that the other has lost.

**Audio:**

The transition into redesign mode plays a soft descending three-note motif — a major third resolving down — suggesting a "stepping inward." The ambient soundtrack in redesign mode is quieter and lower than normal: the battle-ready percussion drops out, replaced by a sparse ambient drone with a single held string note. The mood is contemplative, not urgent. You are building, not fighting.

When the player commits a redesign, the confirmation sound is a two-note ascending fifth — the same interval as the transition's descent, reversed: "stepping outward again." The workbench ambient fades back to the normal operating music. The coral header disappears. The teal returns. The session is complete.

---

## The TikTok Clip

A player is in redesign mode. They are narrating. The coral header is visible: "REDESIGN MODE — RELAY-C." They run the side-by-side simulation. Left half: RELAY-C fails at the third hop — the buffer turns red, the signal drops. Right half: the redesigned RELAY-C handles all three hops, the buffer stays amber, the mission completes. The player says nothing for two seconds. Then: "That's it. That's the fix." They click `[Commit and Deploy →]`. The transition plays: coral fades, teal returns, RELAY-C's portrait gets the "v4.0" badge. The clip title: "The moment I stopped patching and started building." The clip transmits: the game has a *mode* for deep work. The design acknowledges that some problems require architecture, not maintenance.

---

## Newly Discovered Aspects

- **4.69c-i — Draft context snapshot**: redesign mode drafts must store the career analysis result (the cluster flag, the combined coverage, the root cause hypotheses) that preceded the redesign; "redesign intent" captured at session start and available when reopening the draft in a future session; prevents the "why was I rebuilding this?" confusion on session resumption
- **4.69c-ii — Auto-suggest Paired Mode partners**: when entering redesign mode on an agent with ≥2 active hook connections, the system analyzes hook topology and suggests: "COMMAND-A receives signals from RELAY-C — consider adding it to Paired Mode"; one-tap accept or dismiss; triggered only on redesigns where the focal agent's output hooks connect directly to another agent's input hooks
- **4.69c-iii — Template monoculture prevention**: if >60% of players in a similar career range use the same template for a given role, the template is flagged internally as a "monoculture template"; the game highlights alternative templates and recent emergent configs from the player population when the monoculture template is selected
- **4.69c-iv — Redesign mode for newly created agents**: new agents (built from scratch, not redesigned from an existing agent) should have their own onboarding variant of redesign mode — the "first build" experience, where stress tests are replaced by role-validating tutorials and templates are foregrounded as the default path
- **4.69c-v — Simulation seed persistence**: the stress test scenarios in redesign mode use a fixed seed (derived from the real matches that failed in the cluster analysis); the player can unlock the seed and randomize it to test the redesign's robustness against unseen scenario variants; "seed lock/unlock" as a simulation difficulty setting within redesign mode
