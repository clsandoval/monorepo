# Counterfactual History as Config Evolution Record

**Aspect:** 4.38 — Preserving all forks the player ran against a given config as a version-history artifact ("you tested 12 counterfactuals against v3.2, here are the ones that worked"); this history as a shareable necropsy artifact showing the diagnostic work done before landing on v3.3; interaction with 7.10 config necropsy culture and 4.23 replay annotated export.

**Parent:** 4.20 — Counterfactual Simulation; 4.37 — Fork-and-Deploy Shortcut
**Siblings:** 4.39 — Adversarial counterfactual mode; 4.40 — First-viable-fix vs. minimum-fix toggle; 4.23 — Replay annotated export format
**Related:** 7.10 — Config necropsy culture; 4.36 — Multi-Scenario MFE; 1.06c-ext-B — Config version control as first-class infrastructure; 8.09 — Diagnostic layer as teaching mechanic

---

## The Core Problem

The Minimum Fix Explorer (4.20) produces a result. The player sees three candidate fixes, picks one, applies it, and deploys. The result of that deployment — better, worse, unchanged — becomes the next data point.

But all the *other* experiments vanish. The 127 candidate forks the explorer tested. The 3 that would have won. The 2 the player manually tested before running the explorer. The 1 the player ran at tick 41 instead of tick 34 as an experiment. The manual fork where the player tried changing the routing and it *didn't* flip the outcome — which told them routing wasn't the problem, which pointed them toward buffer size.

That is diagnostic work. Invisible, gone.

**The config evolution record solves this.** Every counterfactual the player runs — manual forks, explorer results, dismissed candidates — is preserved as a history entry on the config version it was run against. Not deployed, not active — just *remembered*.

The history shows the **reasoning path** from config v3.2 to v3.3:

```
v3.2 → Counterfactual Session: Mission 7, 2026-03-14
  ├── Fork A: RELAY-C buffer 3→4     [✓ outcome flipped — APPLIED → becomes v3.3]
  ├── Fork B: SCOUT-A filter +RETREAT [✓ outcome flipped — not applied]
  ├── Fork C: COMMAND hook reroute   [✓ outcome flipped — not applied]
  ├── Fork D: RELAY-C rule reorder   [✗ outcome unchanged — dead end]
  ├── Fork E: STRIKER buffer 4→5     [✗ outcome unchanged — dead end]
  └── Manual Fork (tick 41): SCOUT-A skill swap [✗ wrong fork point]
```

This is the **diagnostic journey made legible**. The player can see not just what changed but *why it changed* — what was tried, what failed, what the alternatives were.

When shared with another player as a necropsy artifact, this history answers: "How did you figure out to change the relay buffer?" Answer: "I ran 6 forks. Three would have worked. I picked the buffer change because I'd already noticed the relay was noisy in earlier matches — the other two fixes were compensating for the symptom, not addressing the cause."

That's a professional post-mortem. The game made it possible to produce one.

---

## The Three Sub-Systems

### Sub-System 1: Session History (Per-Config, Per-Mission)

Every time the player opens the Counterfactual panel in a debrief for a specific config version and mission, a **session entry** is created automatically. It persists whether or not the player applies any changes.

The session entry records:
- Which config version was active at debrief time (e.g., v3.2)
- Which mission/match was being analyzed
- The timestamp of the session
- Every fork that was run during the session, in order

Forks within a session are recorded with:
- The fork point tick
- The config element changed (agent, field, before/after)
- The outcome (✓ flip / ✗ no flip / — partial improvement)
- The source (manual fork, explorer candidate, explorer-selected-result)
- Whether the fork was applied (and became the next config version)

Sessions are grouped by config version. You can see: "While running v3.2, I had 4 debrief sessions. Here are the forks I ran in each."

### Sub-System 2: Config Evolution Timeline

At the macro level, the history becomes a **branching timeline of config versions**, each version annotated with its origin:

```
v1.0 ──(manual edit)──> v1.1 ──(manual edit)──> v2.0
                                                    │
                                 (explorer applied)─┘
v2.0 ──(fork+deploy)──> v2.1 ──(manual edit)──> v3.0
                                                    │
                                 (explorer applied)─┘
v3.0 ──(fork+deploy)──> v3.1 ──(fork+deploy)──> v3.2
                                                    │
                            (counterfactual session)─┤
                                                    ├── Fork A [applied → v3.3]
                                                    ├── Fork B [not applied]
                                                    └── Fork C [not applied]
v3.2 ──(fork+deploy)──> v3.3
```

The player can navigate this tree. Clicking any version shows the session history that produced it. Clicking any fork shows the ghost overlay for that fork.

This is a **git log for robot configurations**. Every change has a reason. Every reason is traceable to a simulation.

### Sub-System 3: The Necropsy Export

A config evolution record can be exported as a **necropsy package**: a sharable file (or URL, in web-based mode) containing the full history tree with ghost overlay data for the key forks.

The export is designed for community sharing. Another player can:
- View the full history in their own game client
- Replay any ghost overlay from the export
- See the dead-end forks (what was tried and failed)
- Import a specific config version from the history (with attribution: "imported v3.2 from [player] necropsy")

This is the infrastructure for **config necropsy culture** (7.10) — the community practice of high-Elo players sharing their diagnostic reasoning, not just their final configs.

---

## Mechanical Rules

### What Gets Recorded Automatically

**Always recorded:**
- All explorer candidate forks (even the ones that didn't flip the outcome, even the ones the player never clicked on in the results list)
- Manual forks the player explicitly ran by clicking "Fork here" and running a simulation
- The fork-and-deploy action (which fork was applied, which version it produced)

**Recorded with a delay (lazy evaluation):**
- Explorer sessions start recording when the player opens the Fork Panel, not when the mission ends
- If the player opens the debrief, ignores the Fork Panel, and exits, no session entry is created
- This prevents noise from players who view the debrief without engaging the counterfactual system

**Not recorded:**
- Scenarios where the player opened a debrief but didn't run any forks
- Missions that ended without a debrief (e.g., early quit)
- The opponent's config analysis (only the player's config is tracked)

### Storage Model

The history is stored locally (no backend). The full history for a typical campaign (~50 missions, ~5 debrief sessions/mission, ~3 forks/session) is approximately:
- 50 × 5 × 3 = 750 fork records
- Each fork record: ~2KB (fork tick, config delta, outcome, ghost overlay snapshot at fork point)
- Total: ~1.5MB

This is comfortably within browser localStorage limits. The ghost overlay replay for any fork requires the match state at the fork tick, which is stored as a snapshot at session time.

**Retention policy:** Session history is retained indefinitely. The player can manually archive (collapse to summary) or delete old sessions. Archiving reduces the entry to: "Session: 3 forks, 2 wins, 1 applied" without storing individual ghost overlays.

### Conflict Handling: Same Element, Multiple Forks

If the player runs two forks that both change RELAY-C's buffer — once to 4 and once to 5 — both are recorded as distinct experiments with distinct outcomes. The history shows: "Buffer 3→4: ✓ flip. Buffer 3→5: ✓ flip." This is informative: both buffer sizes would have worked, but one is a smaller change. The player can reason about which is the "correct" fix from the history alone.

---

## What the UI Looks Like

### The History Panel Location

The counterfactual history is accessible from two entry points:

1. **In the debrief screen:** A tab in the left panel (alongside Signal Genealogy and EDT Timeline) labeled "History" with a clock/branch icon. This shows the history for the current config version against the current mission.

2. **In the workbench:** A "Config History" button in the version control section (top-right of the workbench canvas). This shows the full config evolution timeline — all versions, all sessions.

### The Per-Version Session View (Debrief Panel)

The History tab in the debrief shows:

```
Config v3.2 — Mission 7 debrief sessions

Session 1 — 2026-03-12 (2 forks)
  [✗] Fork A: SCOUT-A filter +RETREAT (manual, tick 34)
  [✗] Fork B: RELAY-C rule reorder (explorer, tick 34)

Session 2 — 2026-03-14 (6 forks, 3 wins, 1 applied)
  [✓] Fork C: RELAY-C buffer 3→4 (explorer, tick 34) ← APPLIED → v3.3
  [✓] Fork D: SCOUT-A filter +RETREAT (explorer, tick 34)
  [✓] Fork E: COMMAND hook reroute (explorer, tick 34)
  [✗] Fork F: RELAY-C rule reorder (explorer, tick 34)
  [✗] Fork G: STRIKER buffer 4→5 (explorer, tick 34)
  [✗] Fork H: manual fork at tick 41 — SCOUT-A skill swap (wrong fork point)
```

Each fork row is clickable. Clicking a row:
1. Loads the ghost overlay for that fork into the main debrief view
2. Highlights the changed config element in the agent inspector with a blue glow
3. Shows the outcome status in the fork timeline header

The **[✓] marks** are green. The **[✗] marks** are dark grey (not red — they're informational, not errors). The **← APPLIED** annotation is bright teal, showing which fork became the next config version.

Hovering a session header shows a compact summary: "3 winning forks found, 1 applied to v3.3 on 2026-03-14."

### The Full Config Evolution Timeline (Workbench View)

A separate panel in the workbench shows the full version tree. Visual language:

- Each config version is a **node**: dark circle with the version number (v3.2), sized proportionally to how many sessions were run against it (more sessions = larger node)
- Connections between nodes are labeled: "Manual edit (3 fields)" or "Explorer applied: RELAY-C buffer +1"
- Nodes with session history have a small **history indicator**: a clock icon with a number (how many sessions)
- The current active version is highlighted with a bright border
- Dead-end branches (versions that were created but never built on — abandoned experiments) are shown with reduced opacity

Clicking a version node:
1. Expands the session list for that version
2. Highlights that version's config in the workbench inspector (so the player can see what it contained)

The tree can grow large. A collapse/filter option: "Show only applied versions" reduces the tree to the mainline evolution, hiding dead-end branches.

### The Necropsy Export Dialog

Accessible from the workbench history panel via a "Share" button. Opens a modal:

```
Export Config Necropsy
──────────────────────

Config: Robot Army v3.3 (Mission 7 campaign build)
Versions included: v3.0 → v3.3 (4 versions, 8 sessions)
Ghost overlays included: 14 of 22 forks (8 dead-ends excluded by default)

□ Include dead-end forks (adds 500KB)
□ Include full match replay data (adds 2MB per session)
□ Add personal notes (optional text field)

[Export as file] [Copy shareable link]
```

The shareable link encodes the history in a compressed URL-safe format. Recipients can paste it in their own game client's "Import Necropsy" dialog to view the full history tree.

---

## Player Journeys

#### Journey: Isabel, 38, Software Engineering Manager (Power Diagnostic User)

**Context:** Isabel has 150 hours. She's been building the same core army architecture for 3 weeks across 4 config versions. Last session she lost a Gauntlet run that felt like it revealed a recurring pattern — the same kind of relay saturation failure she'd seen in v2.1 and fixed with a buffer increase. She suspects her fix in v2.1 was treating a symptom, not the cause, and the same root cause has resurfaced in v3.2.

**Minute 0:00 — Opening Config History**

Isabel opens the workbench. She navigates to the Config History panel and looks at the full version tree. She wants to compare v2.1 and v3.2 sessions to see if the same failure mode appears in both.

She sees:
- v2.1 (3 sessions): The annotation shows "Explorer applied: RELAY-C buffer 2→3." She clicks v2.1's history. Session data: 4 forks, 1 winner (the buffer change), 3 dead ends. The dead ends: hook reroutes, rule reorders. The buffer increase was the only winning fork.
- v3.2 (2 sessions, current): The most recent session has 6 forks. 3 winners. She can see the applied fix: "RELAY-C buffer 3→4." Same element, same agent, same type of fix.

She stares at this. She's increased RELAY-C's buffer twice now. v2.1: 2→3. v3.2: 3→4. Each time it worked. But the buffer is growing. At v5.0 will she be at buffer size 8?

**Minute 1:30 — The Pattern Recognition**

She opens both ghost overlays side by side (the game allows comparing two archived forks). In the v2.1 loss and the v3.2 loss, RELAY-C saturates at roughly the same tick — around tick 34–38 in both cases. But the match tempos are different: v2.1 missions were shorter, v3.2 missions are longer. The saturation point is *proportional* to match length.

The buffer isn't too small. The *eviction policy* is wrong. She's keeping the wrong signals. Every time she increases the buffer, she's just delaying the moment the wrong signals fill it.

She navigates to RELAY-C's context config and looks at the eviction priority order. Signals are being kept in priority order: THREAT > TERRAIN > COMMS > ORDERS. But ORDERS are what the relay actually needs to be responsive — they're the most actionable. COMMS are informational, nice-to-have. The relay is evicting ORDERS to keep COMMS.

This is the root cause. It's been causing failures for two config generations. The counterfactual history made it visible by showing her she'd solved the same symptom twice with the same band-aid.

**Minute 3:00 — The Real Fix**

She manually edits RELAY-C's eviction priority: ORDERS > THREAT > COMMS > TERRAIN. She doesn't run this through the explorer — she's confident in the diagnosis. She creates v3.3 with a note: "Fixed eviction priority — root cause of relay saturation across v2.1 and v3.2 buffer increases."

She saves the note to the session history. Future Isabel — or any player she shares this with — will see: "Fixed root cause. Prior sessions showed symptom treatment (buffer increases) in v2.1 and v3.2. Root cause was eviction priority order."

**What the game taught her:** Config version history isn't just for undoing mistakes. It's a diagnostic instrument across time. The same failure reappearing in similar form across config generations is a signal that you've been treating symptoms. The history made the pattern visible.

**UI Annotations:**
- **Config History panel**: 280px right panel in the workbench, scrollable tree. Click to expand any version. Clicking a session expands fork rows within it.
- **Side-by-side ghost overlay comparison**: Activated by Ctrl+clicking two fork rows in the history panel. The debrief screen splits vertically: left shows fork from v2.1 session, right shows fork from v3.2 session. Both play simultaneously.
- **Pattern highlight**: When the same agent appears as the changed element in two or more applied fixes across different config versions, the workbench highlights that agent's card with a soft amber pulse and shows a tooltip: "This agent has been modified in 2 previous applied fixes. Consider reviewing its architecture."
- **Session note field**: A 120-character text field that appears at the bottom of each session entry. Optional. Persists in the history. Visible in necropsy exports.

---

#### Journey: Diego, 19, University Student (First History Interaction)

**Context:** Diego has 22 hours. He just applied a fix via fork-and-deploy and it worked — his pass rate jumped from 68 to 84. He's looking at the debrief for the new version (v1.3) and notices the "History" tab in the left panel for the first time.

**Minute 0:00 — Discovering the History Tab**

Diego clicks "History" without knowing what it is. He sees:

```
Config v1.2 — Mission 4 debrief sessions

Session 1 — 2026-03-10 (4 forks, 1 applied)
  [✓] RELAY buffer 2→3 (explorer) ← APPLIED → v1.3
  [✓] SCOUT filter +RETREAT (explorer)
  [✗] COMMAND hook reroute (explorer)
  [✗] SCOUT rule reorder (manual)
```

He's confused by the [✓] on SCOUT filter +RETREAT. "That would have worked too? Why didn't I pick it?"

He clicks that row. The ghost overlay loads: SCOUT-A catches the RETREAT signal, disengages early, flanks from the right, wins at tick 48. Clean win.

He clicks the RELAY buffer fork (the one he applied). This one: RELAY catches the signal it was losing, fires the hook in time, striker gets the data and flanks left, wins at tick 56.

**Minute 1:30 — The Fork Road**

Two different wins. Same mission. Different mechanisms. He hadn't seen this before — that there were multiple valid solutions and he'd picked one somewhat arbitrarily. The SCOUT filter fix won *faster* (tick 48 vs. tick 56) because it fixed the problem earlier in the signal chain.

He writes a mental note: *If I'd used the SCOUT fix, my army would be doing something different. The relay buffer fix made the relay more resilient. The SCOUT filter fix made the scout more perceptive. These are different architectures.*

He wonders: should he apply the SCOUT fix too, on top of the relay buffer change? He opens the fork-and-deploy from that row. A note appears: "This fix was generated against v1.2. Your active config is v1.3. You can test this change against v1.3 by running a new fork from Mission 4's debrief."

He does it. He re-runs Mission 4 with v1.3. The explorer now finds the SCOUT fix no longer relevant — v1.3's improved relay has changed the causal chain enough that the scout's RETREAT filter is no longer the bottleneck. Adding it might still help marginally, but it's no longer a single-element fix.

**What the game taught him:** Solutions are specific to configurations. A fix that was valid against v1.2 may not be the right fix for v1.3. The history shows him the forks in the road — not to make him second-guess the path he took, but to make the *existence of other paths* visible. A more experienced player might revisit those paths. For now, he moves forward, but he knows the forks are there.

**UI Annotations:**
- **Stale fork warning**: When a player attempts to apply a fork from a history entry against an old config version, the game shows: "This fork was run against v1.2. Your active config is v1.3. Results may differ. Run a new fork from the current debrief instead?" with options "Run new fork" and "View this old fork anyway (read only)."
- **History tab discovery**: A subtle amber pulsing dot on the History tab appears for the first 5 times a session is created (tutorial breadcrumb). Clicking dismisses the breadcrumb permanently.
- **Ghost overlay playback for archived forks**: Full fidelity. The state snapshot captured at session time allows replaying the fork from the exact recorded state. No re-simulation required.

---

#### Journey: Priya, 33, Content Creator (Necropsy Packaging)

**Context:** Priya runs a YouTube series called "Config Autopsies." She does deep-dives on how she built specific armies, showing the reasoning at each step. She's building a video on her Mission 7 army — the one that took her from 42/100 to 98/100 over 6 config versions. She's going to export her necropsy package and walk viewers through the full diagnostic history.

**Minute 0:00 — Opening the Necropsy Export**

Priya opens the workbench Config History. She looks at the full version tree: v1.0 through v6.2. Six versions, 14 sessions, 47 forks. The tree is dense but readable — she can see the main branch (applied versions) and the side branches (versions that were abandoned after a few sessions with no improvement).

She clicks "Share" in the top-right of the history panel. The export dialog opens. She makes choices:
- Include dead-end forks: YES (she wants viewers to see the wrong turns)
- Include full match replay data: NO (too large, she'll screenshot the ghost overlays)
- Personal notes: YES (she's added notes to most sessions)

File size: 3.2MB. She exports.

**Minute 2:00 — Recording Setup**

In her recording setup, she can pull up the necropsy history on one monitor while recording her commentary on the other. She screen-records the version tree navigation and zooms into individual sessions.

"OK, so this is the full history of my Mission 7 config. This node here — v2.1 — is where I wasted a week. Watch this. I ran 8 forks against v2.1 and only two of them flipped the outcome, and I applied the worse one. Here's the better fix I didn't apply."

She clicks the unapplied winning fork. Ghost overlay loads. Her chat and later her viewers watch: the unapplied fix would have won faster and more robustly. But she applied the weaker fix.

"Why did I apply the weaker one? Looking back at my notes: I wrote 'feels fragile, try buffer first.' I was worried the better fix was too clever and would break on other missions. I was conservative. And look — v2.1 only lasted 3 sessions before I had to abandon it anyway. The 'safer' fix wasn't actually safer."

**Minute 4:00 — The Necropsy Narrative**

She uses the history to tell a story: the false paths, the retracements, the moment in v3.2 where she finally understood the root cause (the eviction priority insight). The history is the narrative structure of her video.

"The game gives you a perfect record of your thinking. Not just what you built — why you built it. Every wrong fork, every abandoned hypothesis. That's what makes config necropsy videos actually interesting — you see the confusion, not just the solution."

She shares the necropsy package in the video description. Other players import it into their own game clients to follow along.

**What the game enabled:** The necropsy export transforms a solo diagnostic process into a community artifact. The history makes expertise legible — not as a finished configuration but as a *process*. Watching an expert's wrong turns is educational in a way that watching only the final correct answer cannot be.

**UI Annotations:**
- **Export dialog**: Clean modal with three toggle options and a real-time file size indicator. The size updates as toggles change. "Copy shareable link" encodes the full history in a URL-safe compressed format (no file download required for sharing).
- **Import flow**: Players receiving a necropsy link open it in-game via "File > Import Necropsy." The history loads in a read-only view with the original player's name shown in the history panel header. Players can browse all sessions, replay all forks, but cannot directly apply changes from another player's history to their own config (they must manually copy the change).
- **Attribution in imported versions**: If a player imports a config version from a necropsy, the workbench shows: "Imported from [player]'s necropsy, v3.2 (Mission 7, 2026-03-14)." The attribution persists in the player's own version history.

---

#### Journey: Samir, 28, Competitive Player (History as Red-Team Intelligence)

**Context:** Samir is in Gauntlet ranked mode. He's been matched against the same opponent (handle: "Hexapede") three times. Each time, Hexapede beats him with a different variation of the same flanking architecture. Samir suspects Hexapede's config is iterating faster than his own. He wants to build a counter-strategy.

**Minute 0:00 — Requesting a Necropsy**

After Samir's third loss to Hexapede, the Gauntlet match debrief offers a new option he's never seen before: "Hexapede has shared a public necropsy for this config version." (Hexapede opted into making their history public — a community setting for high-Elo players who want to share their process.)

Samir opens the imported necropsy. He sees Hexapede's version tree. He reads the session notes. Hexapede's history shows: 3 sessions, 7 forks, 2 applied. The second applied fix: "Counter Samir-type builds — raised fidelity threshold to catch FLANKER signals early." Hexapede was explicitly iterating *against Samir's architecture class*.

**Minute 2:00 — Counter-Planning**

Now Samir knows: Hexapede identified his FLANKER signal approach as the attack vector and built a specific counter. The counter is in the history — he can see the fork that created it, the ghost overlay showing how it defeats his approach.

He studies the ghost overlay. Hexapede's scout detects FLANKER signals two ticks earlier than Samir expected, giving the defender enough time to reposition. The countermeasure is the fidelity threshold — set higher specifically to catch FLANKER signals at range.

Samir's response: he needs to suppress the FLANKER signal from his scouts until the last moment, using a signal-delay tactic — holding the flank signal in buffer until the defender's scout window closes. He forks his own config and tests it against a custom scenario designed to mimic Hexapede's detection window.

**Minute 5:00 — The Meta-Loop**

By viewing Hexapede's necropsy, Samir entered a **strategic meta-loop**: Hexapede iterated against him → made history public → Samir studied it → Samir adapted → Samir's new config becomes the next data point in Hexapede's debrief sessions.

Each player's history is intelligence for the other. In a community where necropsy sharing is common (7.10), high-Elo play becomes a documented arms race: each iteration traceable, each counter-strategy visible in the public record.

**What the game enabled:** Asymmetric information games (poker, StarCraft, competitive fighting games) derive tension from hidden information. In Robot Uprising's Gauntlet mode, the necropsy system creates *publicly available* historical information — but only visible *after* the fact. You can see why your opponent adapted their config after the match, which informs your next iteration. The secrecy is during the match; the transparency is in the meta-game afterward. This mirrors how professional teams analyze game film after matches.

**UI Annotations:**
- **Public necropsy opt-in**: A toggle in Gauntlet settings: "Share my config history with matched opponents after matches." Default: off. High-Elo players who opt in gain community reputation (a "transparent player" badge visible in Gauntlet profiles).
- **Opponent necropsy prompt in debrief**: If an opponent has opted in and their current config version has a public necropsy, a "View opponent's history" button appears in the debrief screen (after match resolution). Opening it is optional.
- **Highlighted player references in opponent necropsy**: If an opponent's session notes mention "counter [player's handle]" or if the explorations were clearly run against the player's architecture class, the game highlights those entries in the imported view.

---

## Strengths

**Makes expertise legible as process, not result.** The final winning config is hard to learn from in isolation — you see the answer but not the reasoning. The counterfactual history exposes the reasoning: what was tried, what failed, why the winning fix was picked over the alternatives. This is genuinely educational in a way that config sharing alone cannot be.

**Turns dead ends into data.** A fork that didn't flip the outcome is still information — it tells you that element wasn't load-bearing for this match. Without the history, those experiments are invisible. With it, the player can see: "I tried 8 different changes to RELAY-C and only the buffer change worked. That tells me the relay's problem is capacity, not policy." The dead ends constrain the hypothesis space.

**Creates self-continuity across sessions.** Players who return after a week can open their history and reconstruct where they were: "I was investigating the RELAY-C saturation problem. I tested 3 things. None of them fully worked. Pick up from here." Without the history, returning players start each session by re-diagnosing from scratch.

**Infrastructure for necropsy culture.** Config necropsy culture (7.10) can't exist without the artifacts to share. The export format makes the diagnostic journey portable — importable, viewable, navigable by recipients. This is the raw infrastructure for a community practice that transforms expertise sharing from "here's my final config" to "here's how I got there."

**Reveals recurring failure patterns.** A player who fixes the same element across multiple config versions, as Isabel discovered, is treating a symptom. The history makes that pattern visible in a way that memory alone cannot. The game is doing for config analysis what a good monitoring dashboard does for production incidents: not just showing you what happened, but showing you *when you've seen this before*.

**Low storage cost, high informational value.** ~2KB per fork record. The full history of a 50-hour player is under 5MB. This is genuinely lightweight for the value it provides.

---

## Weaknesses

**Risk of overwhelm for new players.** A history panel showing 47 forks across 14 sessions is dense. New players don't need to see this — they barely understand why there's more than one config version. The history panel should be progressive: hidden during the first 5 missions, introduced when the player has had enough sessions to have something worth reviewing. Showing an empty history panel to a new player is confusing; showing a packed one without explanation is worse.

**The stale fork problem.** Forks run against v1.2 are not valid experiments for v3.2. If a player browses their history and tries to apply a fix from a much earlier version against a fundamentally different current config, the result is unpredictable. The stale fork warning (shown in Diego's journey) handles this but adds friction. The game should make staleness visible at a glance: forks older than 2 config versions should be visually dimmed in the history panel.

**Necropsy export may disincentivize iteration.** If the community values necropsy exports heavily, some players may feel pressure to document their process or post cleaner histories. This creates the same dynamic as public GitHub histories — performative commits, cleaned-up "educational" builds rather than genuinely exploratory ones. The game should not rank or rate necropsies by complexity or "quality" — they're all valid, and purity spirals would harm exploratory play.

**Storage across many campaigns.** A player who plays for 500 hours across multiple campaigns could accumulate a large history file. The retention policy (archive old sessions to summaries) helps, but the game needs to make this management easy and not punishing. The player should never feel like they're losing important data; archive should always be reversible.

**No search.** In a history with 50+ forks, finding "the time I changed SCOUT-A's filter three versions ago" requires scrolling. A search function (filter by agent name, filter by element type, filter by outcome) is not in the initial scope described here but becomes essential for power users.

**The "public necropsy" social dynamics.** High-Elo players sharing histories creates an unequal information environment: players who opt in become more readable to opponents. This is an intentional design choice (it creates the meta-loop Samir exploits) but may deter competitive players from sharing. The game should communicate clearly: sharing is a community act, not a strategic disadvantage (your opponents are already in the next config version anyway).

---

## Interaction Effects

### Counterfactual History + Fork-and-Deploy (4.37)
Fork-and-deploy is the write path for the history. Every "apply" action via the explorer creates both a new config version AND a history entry. The history records why that version exists. Without 4.37's annotation mechanism, the history would still exist but would lack the human-readable "why" layer. Option E of fork-and-deploy (deferred apply with annotation) feeds directly into the session notes field of the history.

### Counterfactual History + Replay Annotated Export (4.23)
4.23 concerns the shareable debrief artifact for a *single match* — the annotations, timestamps, and the ghost overlay for that match. 4.38 concerns the shareable artifact for a *config evolution* — the full diagnostic journey across many matches. They're complementary layers: 4.23 is a single-match layer, 4.38 is the multi-match layer. An export of a necropsy (4.38) could embed the annotated replay (4.23) for each key match in the history — the full picture.

### Counterfactual History + Config Necropsy Culture (7.10)
4.38 is the infrastructure that makes 7.10 possible as a community practice. Without 4.38's exportable history, necropsy culture would be informal — players describing their process in words and screenshots. With 4.38, necropsies are navigable, replayable, interactive. The community practice 7.10 describes depends on this artifact existing.

### Counterfactual History + Signal Genealogy (4.16)
The history shows *which element was changed* across forks. The signal genealogy shows *what that element actually did* in the match. Together, they answer the full question: "RELAY-C's buffer size was changed in v2.1 and v3.2 because RELAY-C consistently ran out of capacity at tick 34–38, as shown in the genealogy data for both sessions." The two systems are complementary diagnostic layers: history shows the iterative reasoning, genealogy shows the causal detail.

### Counterfactual History + Multi-Scenario MFE (4.36)
MSMFE sessions run many forks simultaneously against a distribution of scenarios. All of these forks should appear in the session history — but they're numerous (up to 150+ candidates per MSMFE run). The history should collapse MSMFE results to a summary row: "MSMFE session: 142 candidates tested, 3 solutions found, 1 applied." Expanding that row shows the three winning candidates (not all 142 dead ends, which would be noise). Dead-end MSMFE candidates are archived at collection time; they can be accessed if the player explicitly requests "show all MSMFE candidates" but are not shown by default.

### Counterfactual History + Deterministic Execution (2.00a)
The history is only navigable because execution is deterministic. A fork from 3 sessions ago can be replayed because the state snapshot + the config change + the seeded RNG produces the exact same simulation every time. If execution were probabilistic (LLM-native, 2.00d), archived ghost overlays would be unreplayable — the simulation would diverge. Counterfactual history, like the explorer itself, is architecturally coupled to the deterministic model.

### Counterfactual History + Adversarial Counterfactual Mode (4.39)
4.39 explores running the explorer against the opponent's config rather than the player's. The adversarial results could also be recorded in the history — as a separate sub-section under each session: "Player forks: 6 (standard), Adversarial forks: 3 (run on opponent's config in red-team mode)." The history would show the full picture: what changes to my config would have helped, and what changes to the opponent's config would have hurt me more. The red-team sessions are only available in Gauntlet mode and only after match resolution (same gate as 4.39).

---

## Comparable Games and Media

### Git: Version Control as History Infrastructure
Git is the canonical comparable. Every commit has a message, a parent, a diff. The full history of a repository tells the story of how the code evolved: what was tried, what was reverted, what finally stuck. Robot Uprising's config history is git for agent configurations — same branching model, same diff concept, same notion of "the history is documentation."

The key difference: git is manual (you write the commit message). Robot Uprising's history is automatic (the game records forks as you run them). The game automates the boring part of documentation — capture — and leaves the optional part (notes, sharing) to the player.

**What transfers:** The mental model of "main branch vs. experimental branches" maps directly to "active config vs. fork experiments." The concept of a commit message as "why this change was made" maps to session notes. Players who know git will feel instant recognition.

### Chess.com and Lichess: Post-Game Analysis Persistence
After a chess game, your analysis is saved. You can return to a game from weeks ago, see the moves you analyzed, the variations you explored, the positions the engine evaluated. The analysis doesn't evaporate when you close the tab.

Robot Uprising's counterfactual history does the same for debrief sessions. The diagnostic work persists. The player can return to a 3-week-old debrief and see what they were investigating.

**What transfers:** The "my analysis of past games" concept. The archive as personal skill record.

### Factorio: Blueprint Book as Iteration Archive
Experienced Factorio players maintain blueprint books — not just final factory layouts but also intermediate designs, failed experiments, and designs that worked for one factory configuration but not another. The blueprint book is an informal version history. Robot Uprising formalizes this: the automatic history is what the Factorio player maintains manually in their blueprint book.

**What transfers:** The value of preserving exploratory designs. The "this didn't work but here's why" annotation as professional practice.

### Incident Response: Postmortem Action Items Tracking
Every professional incident postmortem produces action items: "Add alerting for X," "Fix the timeout in Y," "Clarify runbook for Z." Over time, the same action items recur across postmortems — teams that don't fix the root cause keep writing the same item. Counterfactual history makes the "same fix applied twice" pattern visible in robot configs. It's the same diagnostic insight that mature SRE teams apply to their postmortem databases: "We've seen this before. We treated the symptom. Here's the root cause."

**What transfers:** The idea that recurring symptoms in a history are signals of unaddressed root causes.

### Speedrunning: The Full TAS History vs. The Final Run
A TAS (tool-assisted speedrun) produces a final record-breaking run, but the full speedrunning channel often shows the *process*: the many attempts, the discoveries, the wrong optimizations that were discarded. The final run without the context of the failed attempts is impressive. The failed attempts with the final run are *instructional* — the viewer understands why each trick is necessary because they've seen what happens without it.

Robot Uprising's necropsy export creates the same layered narrative: the final winning config is the TAS submission, and the full history is the "making of" content.

**What transfers:** The value of showing process alongside result for educational content.

---

## Sensory Description

**The History Tab in the Debrief**
The History tab sits in the same left panel as Signal Genealogy. Its icon: a small branching-tree shape — two lines diverging from a root, like a Y rotated 90 degrees. The icon glows softly amber when there's a session with unapplied winning forks (nudging the player to revisit alternatives). It's static when all relevant sessions have been reviewed.

When the tab opens, session entries expand with a gentle accordion animation — 200ms, easing out, like cards being laid on a table one at a time. Each session header has a timestamp in small text and a compact stat line: "6 forks · 3 wins · 1 applied."

**Fork Row Visual Hierarchy**
Within a session, fork rows use a consistent set of icons:
- [✓] green checkmark: outcome flipped
- [✗] grey X: outcome unchanged
- [→] teal arrow: this fork was applied (becomes the next config version)
- [~] amber tilde: partial improvement (outcome not fully flipped but win rate improved)

The colors aren't loud — they're muted, professional, like a code review approval system. The history panel feels like audit infrastructure, not game UI.

**The Config Evolution Timeline**
In the workbench view, config version nodes are arranged on a horizontal timeline, left to right, oldest to newest. The active version has a bright white border; historical versions have dim grey borders that brighten on hover. Connecting lines between nodes vary in weight: a heavy line for "applied via explorer" (strong causal connection), a thin line for "manual edit" (player chose to change something). Dead-end branches hang below the main line, slightly lower, like footnotes.

The entire history, even a dense one, fits in a 400×200px viewport with scroll — it's designed to be readable as a landscape, not overwhelming as a chart.

**Exporting a Necropsy**
The export dialog has a soft shimmer animation on the file size indicator as options toggle — the number updates in place with a brief numeric counter spin. The "Export" button has the same teal color as session history elements — consistent visual language: teal means "record/history," amber means "action/recommendation," green means "success/applied."

When the file exports, a brief particle animation plays: small document-shaped icons scatter from the button position upward and fade — like pages flying from a book. This takes 600ms and is entirely skippable (it respects reduced-motion settings). The sound: a single mid-register synthetic "click" followed by a soft paper-shuffle texture, 300ms. The combination sounds like a file being sealed and handed over.

**Importing a Shared Necropsy**
When a player imports someone else's necropsy, the history panel opens with the original player's name in the header: "Config history — [player handle]'s Army v3.3." All entries are marked [read-only] with a soft grey border instead of the normally-clickable amber. The ghost overlays are fully replayable. A persistent "This is imported history" banner sits at the top of the panel — always visible, never dismissable, so the player never confuses someone else's diagnostic journey for their own.

---

## The TikTok Clip

**15-second scenario:** The screen opens on a workbench config evolution tree — six nodes connected in a branching structure. The player expands node v2.1. A session unfolds: 8 fork rows, mix of green checkmarks and grey X's. The player clicks a grey-X dead-end fork. Ghost overlay loads: two battlefield timelines, grey loss and grey loss — neither fork flipped the outcome. Text overlay: "I tried this 8 times in two versions. Never worked."

Cut to the applied fork row for v3.2: the player clicks it. Ghost overlay: grey loss, full-color win. The caption reads: "The fix that finally worked."

Pull back to the full version tree. Six versions. 14 sessions. 47 experiments. Text overlay: "This is my entire diagnostic history. Every wrong turn. Every dead end. Every fix that worked."

Final text: "Robot Uprising remembers every experiment you ever ran."

**Why this clip works:**
1. The volume of the history (47 experiments) communicates depth without showing all of it
2. The dead-end session is honest — most experiments fail, and the game shows that
3. "The game remembers" is a striking capability claim — most games forget everything you don't explicitly save
4. The contrast between the grey/grey dead end and the grey/color applied fix is visually immediate
5. "Every wrong turn" resonates with the diagnostic frustration players recognize from real engineering

---

## Discovered Aspects

**4.49 — Cross-mission pattern detection in config history:** After a player has accumulated history across 5+ missions, the game analyzes whether the same element (same agent, same field type) appears as the applied fix in multiple separate missions — surfacing "you've changed RELAY-C's buffer in 3 different missions" as a career-level architectural debt signal; the distinction between "this element needed tuning for this mission" vs. "this element has a structural weakness that keeps manifesting"; interaction with 4.25 EDT trajectory and 4.38.

**4.50 — History-diff view for config versions:** A dedicated "compare versions" screen that shows, for any two config versions (e.g., v2.1 vs. v3.2), a side-by-side diff of every field that changed, with annotations for which changes came from explorer-applied fixes vs. manual edits; styled like a code diff (red for removed, green for added) but with readable field names and agents; interaction with 4.23 replay export and 7.10 necropsy culture.

**4.51 — "Hypothesis tracking" in session notes:** Instead of a freeform note field, the session note form asks structured questions: "What were you investigating?" / "What hypothesis did you test?" / "What was surprising about the result?" — creating structured diagnostic records rather than unstructured memoes; the structured format makes history searchable and helps the necropsy export tell a cleaner story; tension between structure (aids search, aids sharing) and freeform (lower friction).

**4.52 — Necropsy import as config scaffold:** When importing another player's necropsy, the player could optionally "start from" one of the imported config versions as their own v1.0 baseline, with full attribution in their own history — a "fork this player's config" mechanic that creates explicit lineage in the community; interaction with 7.10 necropsy culture and competitive balance concerns (high-Elo configs shouldn't trivially bootstrap low-Elo players).

**4.53 — Dead-end fork archive as negative training data:** For players who want to understand their own mental models, a "what I was wrong about" view that shows only the dead-end forks across the full history — the hypotheses that were tested and failed; the dead ends as a map of the player's misconceptions at the time; "what I believed that turned out to be false" as a distinct diagnostic artifact.
