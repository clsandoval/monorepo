# Design Exploration: Narrative-Mechanical Integration — The Workbench as Battlefield

**Origin:** Derived from EXAPUNKS analysis (1.04). The phage in EXAPUNKS was body horror that only existed in text — the workbench was never mechanically corrupted, never visually degraded, never invaded by the disease that was supposedly destroying Moss. This is the gap. This document explores how Robot Uprising could close it.

**Core Question:** How can narrative stakes — enemy attack, operational damage, systemic stress — be expressed *directly in the workbench interface* so the player experiences the stakes mechanically, not just narratively?

**Related Frontier Aspects:** 1.04b (diegetic tutorial documents), 1.04c (spawn semantics), 1.04d (blocking vs. queued hooks), 2.12 (deception signals), 4.07 (information overload visualization)

---

## The EXAPUNKS Failure Mode (and What It Teaches Us)

In EXAPUNKS, the phage gradually converts Moss's biological tissue into non-functional computer components. By mid-game, Moss has partially converted hands, a degraded eye, and failing memory. The game describes this in:
- Flavor text in loading screens
- EMBER-2 and Ghast dialogue
- Zine entries in Trash World News

But when you open the EXAPUNKS workbench after any of these revelations, the editor is pristine. Your code is exactly where you left it. The registers in the visualization are clear. The network diagram is crisp. Nothing in Moss's claimed physical degradation touches your ability to write programs.

This is the EXAPUNKS Design Sin: **narrative horror that doesn't invade the mechanics**. The story says your body is deteriorating but the game trusts you to feel that without showing you. Players repeatedly cited this as the single biggest missed opportunity.

The lesson: **if the narrative says something is corrupted, the workbench must show it corrupted.** Not in flavor text. In the actual interface the player interacts with.

Robot Uprising has three specific opportunities to correct this — three distinct ways enemy/environmental forces can mechanically invade the planning space:

---

## Option A: Corrupted Configurations — "The Sabotage Problem"

### What It Is

Between missions — or after specific in-mission events — enemy agents access your workbench data and corrupt it. When you open the plan phase for the next mission, some of your agent configurations have been tampered with:

- A skill slot shows a skill you didn't assign, with a red border and a faint "FOREIGN" watermark
- A rule in your ordered priority list has been silently reordered — but highlighted in orange to indicate the change
- A hook trigger condition has been altered: "when ally_health < 20" has become "when ally_health < 80" — a subtle change that would cause wildly different behavior
- A context filter has been disabled, meaning the agent will now accept ALL signal types (information overload vector)

The player's job before deploying is to **audit their configs for tampering**. This is the mechanic: detection, not just configuration.

### Mechanical Specifics

**Corruption Severity Levels:**

1. **Visible corruption (Easy):** Corrupted elements are clearly red/orange. A "Config Integrity" indicator on the workbench header shows "3 issues detected." The player clicks the indicator, gets a list, fixes each one. Takes 30 seconds. Teaches vigilance.

2. **Subtle corruption (Medium):** Changes are made within valid ranges. The rule still looks valid. The hook condition is still syntactically correct. The player must *remember* their previous setup and notice discrepancies. A visual diff mode exists (toggle to see "previous vs. current") but has a cost — using it consumes time in a timed preparation phase.

3. **Deep corruption (Hard):** A foreign skill has been inserted with a legitimate-looking name — "relay_v2" instead of "relay." Its behavior is subtly different: it relays messages but also copies them to an enemy node. The player must recognize an unknown skill name and investigate. Investigation costs time.

**The Audit Workflow:**

```
1. Open workbench after a story beat where "the network was breached"
2. Header bar shows: [INTEGRITY: 87%] in amber — not full red, just subtly wrong
3. Player clicks the integrity indicator
4. Config diff overlay appears — shows current state, highlights 3 changes in orange
5. Each changed element has: "MODIFIED AT 03:17:22" and a [REVERT] button
6. Player reverts all three, integrity goes to [100%] — green
7. Player notices one more thing looks wrong but isn't flagged:
   a skill icon has changed color slightly — "flank_v2" vs. "flank"
   They hover it — tooltip says "skill source: UNKNOWN"
   They remove it, replace with their known skill — fourth corruption caught
```

**When Corruption Isn't Caught:**

If a player deploys with corrupted configs, the mission runs. The corrupted element activates as designed by the enemy. A scout starts patrolling toward enemy territory instead of allied. A hook fires at the wrong threshold and triggers an early-abort routine. The debrief reveals the source: "FOREIGN HOOK ACTIVATED AT TICK 47. AGENT BETA RETREATED DUE TO INJECTED RULE."

This is **diagnosis as reward.** The debrief becomes a puzzle in itself: why did that agent do that? The answer is in the corruption log.

---

## Option B: Degraded Buffers — "The Entropy Problem"

### What It Is

Agents sustain operational damage — from EMP attacks, from signal jamming, from prolonged field deployment — and this is expressed as literal buffer degradation. When you open an agent's context config after a damage event:

- Some buffer slots are permanently grayed out — "burned," showing a faint spark icon
- The total capacity number has decreased from 8 slots to 6 slots, with the 2 lost slots shown as dark craters at the bottom of the buffer visualization
- A filter that was active now has a "DEGRADED — 60% reliability" label, meaning signals that match the filter are only kept 60% of the time
- An eviction rule now has a small "INTERFERENCE" tag — it fires correctly most of the time but occasionally misfires

The player must **work around degradation.** They can't restore burned slots (narrative constraint: the agent sustained damage). They must redesign their configuration to operate with reduced capacity.

### The Degradation Spectrum

**Partial Degradation (Mild):** 2 of 8 slots burned. The agent is still mostly functional. A skilled player compensates by tightening their filters — keeping only the most critical signal types. The constraint is an interesting design pressure: what's the minimum information an agent needs to function?

**Heavy Degradation (Severe):** 4 of 8 slots burned, plus one filter degraded to 40% reliability. The agent is unreliable. The player must either retire this agent, assign it to a low-stakes role, or attempt a repair (if the campaign has a repair mechanic).

**Cascading Degradation (Crisis):** An EMP event hits mid-battle. During execution, three agents each lose 2 buffer slots *in real time.* The visualization shows buffer bars flickering and shrinking. Slots blink out. The agents' behavior becomes erratic because their working memory just shrank under load. The player watches in horror as their carefully tuned configurations degrade live.

### Visual Language of Degradation

The buffer visualization (already proposed elsewhere as a vertical thermometer or horizontal stack) gains new states:

- **Healthy slot:** Clean blue line, bright when occupied, dim when empty
- **Burned slot:** Dark gray, slightly textured (static pattern), no longer functions. Occupies space visually to remind you of what was lost
- **Degraded slot:** Amber colored, faint flicker animation on a 3-second interval — unreliable, sometimes functions, sometimes drops
- **Slot in repair:** Green pulsing — recovering over time, will be functional in N ticks
- **Foreign-occupied slot:** Red tint — this slot is being held by an enemy-injected memory entry that eviction can't dislodge without a specific "flush" action

The **total buffer display** becomes a health bar metaphor the player develops strong feelings about. Losing slots feels like losing HP. Watching an agent lose 2 slots to an EMP during execution creates visceral dread.

---

## Option C: Enemy-Injected Hooks — "The Trojan Horse Problem"

### What It Is

Enemy intelligence units don't just attack your agents physically — they compromise your hook network. Before battle, the player's hook visualization shows their wiring between agents. After a narrative event where "enemy code was detected in your network," the hook visualization shows additional wires — foreign hooks — drawn in red:

- A scout's hook that triggers "relay message to command" now ALSO triggers "relay message to ENEMY_LISTENER_7"
- A striker's "engage on flank signal" hook has been intercepted — it now fires 3 ticks late (the signal is delayed by an enemy buffer node)
- A relay agent's "compress and forward" hook has been silently replaced with "compress, log, forward" — it still does its job but is now copying everything to an enemy registry

The player must **diagnose and purge** before deployment. The hook editor, normally showing clean connections, now has a "foreign elements" overlay mode that highlights injected wires in red.

### Hook Intrusion Varieties

**Passive Eavesdropping:** An enemy hook passively receives copies of signals that pass through a compromised relay node. Doesn't affect behavior — purely intelligence gathering. The player might not notice (it's invisible unless they check the hook inspector), but the consequence plays out in later missions: the enemy knows their strategy.

**Active Delay Injection:** Enemy code inserts a delay node into a hook chain. A signal that should reach the striker at tick 5 now arrives at tick 8. The player's timing-sensitive combos break. In the debrief: "HOOK CHAIN ALPHA → BETA → STRIKER delayed by 3 ticks at relay node. Foreign delay element detected post-execution."

**Redirect Injection:** The most dangerous — an enemy hook reroutes a critical signal. "When scout detects high-value target → signal striker to flank" becomes "when scout detects high-value target → signal striker to RETREAT." The player sets up a flanking maneuver; in execution, the striker retreats from the fight. The debrief shows the redirect.

**False Positive Injection:** Enemy code periodically fires a hook trigger that shouldn't fire. "When ally under attack → all units converge" suddenly fires every 30 ticks regardless of ally status — every activation costs buffer capacity and interrupts ongoing behaviors.

### The Counter-Intrusion Mechanic

Players can equip "intrusion detection" skills on specific agents — these agents periodically audit the hook network and flag foreign elements. An agent with this skill shows a small shield icon during execution; when it detects a foreign hook, it can fire an alert signal that the player sees as a real-time notification during execution: [FOREIGN HOOK DETECTED: RELAY → ENEMY_NODE_12. PURGING.]

The strategic question: is the cost of dedicating buffer space to intrusion detection worth the protection against enemy hook injection?

---

## Player Journeys

### Journey: Mara, 31, Security Engineer

**Context:** Mission 8. The game has just introduced hook injection as a mechanic. Mara's configuration got compromised in the last mission because she didn't check the integrity indicator. The debrief showed that her command agent had been relaying targeting data to an enemy listener. She's determined not to let that happen again.

**Minute 0:00 — Workbench Opens**
Mara sees the workbench after the mission briefing: "Enemy infiltrators compromised your network during the previous operation. Audit all configurations before deployment."

The workbench header shows: **[INTEGRITY: 76%]** in amber. Below it, in small text: "4 issues detected. Click to review."

Mara clicks the indicator immediately. She's been burned before.

A diff overlay slides in from the right — a translucent panel showing her agent roster in a list. Each agent has a small icon: green checkmark, or amber triangle. Three agents have triangles.

**Minute 0:30 — Auditing SCOUT-1**
She clicks SCOUT-1. The config view opens with changes highlighted in orange. Her "patrol radius: 40m" rule has been changed to "patrol radius: 140m" — a subtle but devastating change that would send the scout far out of coordination range.

She hovers the orange highlight: tooltip reads "MODIFIED: tick 847, session prior. Original value: 40m."

She clicks [REVERT]. The value snaps back. She sees the scout's patrol circle on the minimap shrink back to normal.

"Sneaky," she mutters.

**Minute 1:15 — The Hook Injection**
RELAY-2's config shows a foreign hook in red: an outgoing wire that wasn't there before. Her hook visualization normally shows 3 wires from RELAY-2; now it shows 4. The fourth goes to a node labeled "UNKNOWN — EXTERNAL."

She right-clicks the foreign hook wire. Options appear: [TRACE SOURCE] [PURGE] [MONITOR].

She selects [TRACE SOURCE]. A mini-analysis runs: "Source: enemy signal hub. Purpose: receive copies of all relay traffic. Forwarding to enemy command. NON-DISRUPTIVE — will not affect your operations but reveals strategy."

Interesting. She hesitates. The hook won't break her mission — the enemy is just listening. She considers leaving it active and feeding them false information. But she hasn't unlocked that mechanic yet.

She purges it.

**Minute 2:00 — The Hidden Corruption**
Three issues fixed. Integrity shows [94%]. She expected 100%.

She goes looking. One agent's config looks fine at first glance. She switches to the hook editor and carefully traces each wire. The "compress and forward" hook on RELAY-3 looks normal — correct trigger, correct target. But she hovers it and sees: "Signal copies enabled: YES." That wasn't her setting. That's a passive eavesdrop embedded in the hook metadata rather than as a visible wire.

She right-clicks, finds [DISABLE SIGNAL COPYING]. Integrity jumps to [100%].

She exhales. Four corruptions in a row. She clicks [DEPLOY].

**Minute 2:30 — Mission Execution**
The mission runs clean. Her flanking maneuver fires as designed. No delayed hooks, no misfiring triggers. At the debrief: "0 foreign elements detected during execution. Full config integrity maintained."

A new achievement pops: **Clean Run — deploy and execute with 100% config integrity maintained throughout.**

She doesn't feel like she solved a puzzle. She feels like she didn't get fooled. The distinction matters.

**UI Annotations:**
- **Integrity indicator:** Top-left of workbench header, always visible. Green = 100%, amber = issues detected with count, red = critical/deployment blocked. Clicking opens the diff overlay.
- **Diff overlay panel:** Slides in from right, covers 30% of screen. List of agents with change counts. Click agent to expand. Each change shows [before → after] with timestamp and [REVERT] button.
- **Foreign hook wires:** Red in hook visualization, animated with slight shimmer. Right-click menu with trace/purge/monitor options.
- **Hook metadata corruption:** Not visually obvious by default. Requires hovering hooks to check metadata. Advanced layer for players who look carefully.

---

### Journey: Devon, 17, First Playthrough

**Context:** Mission 12. Devon is still learning. They don't fully understand hooks yet — they've been mostly using the default hook presets. They haven't noticed the integrity indicator before.

**Minute 0:00 — Workbench Opens**
Devon opens the workbench and immediately starts tweaking their striker's attack skills. They want to add a new skill they just unlocked. The integrity indicator says [INTEGRITY: 88%] in amber. Devon sees it but doesn't know what it means.

They hover it. Tooltip: "3 configuration changes detected since last session. Click to review." Devon doesn't find this alarming — "changes since last session" sounds like autosave. They dismiss it and keep working.

**Minute 0:45 — Deployment**
Devon hits deploy.

**Minute 1:00 — Execution Chaos**
The mission starts. Devon watches the execution view. The scouting phase looks fine. Then the flanking signal fires — but instead of the striker moving to flank, it moves toward enemy HQ directly. That's not the flank position. That's a suicide run.

Devon watches in confusion as their striker walks into 3 enemies and gets destroyed.

**Minute 1:30 — The Debrief Teaches**
Debrief screen. Devon clicks on the striker's behavior log. The timeline shows: at tick 34, the striker received "FLANK" signal. But the hook that should trigger "move to flank position: NE grid" instead triggered "move to grid: enemy HQ." The hook's target was modified.

A callout box appears: "⚠ FOREIGN HOOK ACTIVE: Hook on STRIKER-1 was modified between sessions. The trigger condition was correct but the destination was replaced. This is an enemy hook injection. See: Enemy Infiltration Guide."

A tutorial pop-up appears for the first time: **"Enemy forces can modify your agent configurations between missions. Before deployment, always check the Integrity Indicator in the workbench header."**

Devon now understands what that amber indicator was.

**Minute 2:00 — The Lesson Sticks**
Devon restarts the mission. This time they click the integrity indicator first. They find the hook injection. They see exactly what was changed. They revert it. They deploy.

The striker flanks correctly. The mission proceeds.

Devon will check the integrity indicator before every deployment from this point forward. The lesson was delivered through failure, not instruction.

**UI Annotations:**
- **Integrity indicator on first encounter:** Amber, not red — it doesn't block deployment. This is intentional; the game lets new players fail once so the mechanic becomes memorable.
- **Debrief callout box:** First-time corruption detection triggers a tutorial box directly in the debrief timeline, pointing at the relevant tick. Non-intrusive but hard to miss.
- **Tutorial pop-up:** Appears exactly once, triggered by first-time foreign hook detection in debrief. Never appears again.

---

### Journey: Kwame, 44, Ex-Systems Administrator, Hardcore Player

**Context:** Mission 23, New Game+. Kwame has completed the campaign once. In NG+, enemy infiltration is more sophisticated — deep corruption, multiple simultaneous intrusions, time-limited preparation phases. He's playing to optimize.

**Minute 0:00 — Preparation Phase Starts**
A timer appears: 8:00 remaining in prep phase. This mission is a high-priority assault; the enemy knows it's coming.

The integrity indicator immediately shows [INTEGRITY: 51%] — deep amber bleeding toward red. The text: "11 issues detected."

Kwame doesn't panic. He's been here before.

**Minute 0:15 — Triage**
He opens the diff overlay. 11 changes across 6 agents. He quickly categorizes:
- 4 changes are in non-critical agents (logistics support units) — he'll get to these last
- 3 changes are in the hook network — priority, these affect coordination
- 2 changes are in COMMAND's skills — highest priority, could affect the entire architecture
- 2 changes are in the striker's rules — time-sensitive

He clicks COMMAND first.

**Minute 0:45 — The Deep Fake**
COMMAND's skills panel shows a new skill: "relay_priority_v2." Kwame doesn't recognize the "v2" suffix from his own loadout. He hovers it: "Skill source: UNKNOWN. Behavior: relay priority signals to all subordinate agents."

He compares it to his installed "relay_priority" skill. The names are nearly identical. The tooltip descriptions are nearly identical. The icon is slightly different — a very subtle difference in the connectivity diagram within the icon.

He switches to skill source inspector mode (a toggle he uses habitually). This shows a column next to each skill: "Source: LIBRARY / EQUIPPED / FOREIGN."

"relay_priority_v2" shows: **FOREIGN**.

He removes it. The slot that had the foreign skill is now empty. He re-adds his legitimate relay_priority skill. Two down.

**Minute 2:30 — Hook Archaeology**
The hook visualization for his full army is complex — 15 agents, 40+ hook connections. Enemy-injected hooks appear in red but there are 3 of them, and one is cleverly spliced into the middle of a legitimate 5-hop chain: legitimate → legitimate → FOREIGN → legitimate → legitimate.

Kwame traces the chain manually. He finds the foreign node is a passive listener (not a redirector) — the enemy wants intelligence on this chain's activation pattern. He has a choice: purge it (safe), or leave it and route false signals through this chain to mislead the enemy.

He's played enough NG+ to know the enemy adapts. If he leaves it, the enemy gets accurate intel and will preposition units. He purges.

**Minute 6:00 — Timer Stress**
With 2 minutes left, 9 of 11 issues cleared. Two remaining in the logistics units. Kwame does a risk assessment: will corrupted logistics units break the mission? One has a modified patrol route — minor. The other has a foreign hook that fires a "call for support" signal from an unexpected trigger — this could waste a key response, medium risk.

He quickly reverts the support hook. Leaves the patrol route corruption — it'll just mean slightly inefficient logistics but won't affect the core mission.

Timer hits 0. He deploys with [INTEGRITY: 96%].

**Minute 6:30 — Mission**
The logistics unit with the modified patrol route causes minor inefficiency but nothing catastrophic. The debrief notes it: "LOGISTICS-4: patrol corruption not purged, 8% efficiency reduction."

Kwame accepts this. He made a deliberate triage decision. That's the feeling he came for: not perfection, but competent risk management under time pressure.

**UI Annotations:**
- **Prep phase timer:** Visible in upper right of workbench header. Counts down during plan phase in timed missions. Adds time pressure to audit without being punishing on normal difficulty (only appears in NG+ and specific story missions).
- **Skill source inspector:** A toggle in the workbench toolbar that adds a "Source" column to the skills panel. Default: off. Advanced players use it habitually.
- **Foreign skill icon difference:** Very subtle (icon art slightly different), designed to be noticeable on close inspection, missable on cursory review. The detection skill level scales with attention.
- **Triage logic:** The diff overlay can be sorted by "impact level" (high/medium/low/unknown). Kwame uses this sort to prioritize. Impact level is estimated by the game's analysis of how the change would affect behavior.

---

## Strengths of This Mechanic

**1. Narrative becomes mechanical reality.** If the story says "you were compromised," the workbench proves it. The horror is in the interface, not in dialogue. A player who sees a foreign hook in their carefully tuned configuration feels genuine violation.

**2. Creates a new skill: detection.** Most strategy games test configuration skill. This mechanic tests *auditing skill* — noticing what's wrong, recognizing what doesn't belong. This is a real and transferable skill (it's essentially code review and anomaly detection).

**3. The debrief becomes essential.** When a corruption slips through, the debrief must show exactly what happened and why. This makes the debrief a primary teaching tool, not a bonus screen.

**4. Scales naturally.** Easy difficulty: all corruptions highlighted, revert is automatic. Medium: corruptions shown but manual revert required. Hard: some corruptions hidden in metadata. Expert: time-limited preparation, some corruptions designed to mimic legitimate entries.

**5. The TikTok clip:** A player opens their workbench, sees red wires everywhere, traces one to an enemy-controlled node. They look at the enemy's configuration on the map. They realize: the enemy was listening to their command chain this whole time. They forward false information through the intercepted hook. The enemy repositions. The player flanks from a completely unexpected direction. 15 seconds. Viral.

---

## Weaknesses

**1. Can feel punishing if detection is too hard.** If players regularly miss corruptions and fail missions due to mechanics they didn't understand, frustration replaces engagement. The solution: first-time failures are always followed by a debrief callout that explains exactly what happened. The mechanic teaches through failure rather than requiring mastery before play.

**2. Adds overhead to every plan phase.** Players who are already managing complex configurations now have a mandatory audit step. On easy difficulties, this should be quick and clearly scoped. On hard, it becomes a strategic mini-game in itself. The difficulty curve here is separate from the main mechanical difficulty curve.

**3. The "perfect configuration" problem.** If players build the same optimized config every mission, corruption becomes an annoying mandatory detour rather than an interesting challenge. The solution: give each agent a visual "fingerprint" (color, icon, identifier) that the player develops recognition for. Corruption of a familiar fingerprint is immediately noticeable. New players build this recognition over the first several missions.

**4. Risk of feeling arbitrary.** If corruption events aren't telegraphed by narrative (an enemy network intrusion event), they feel random. The game must clearly communicate: "this happened during/after event X." Players need causality to engage meaningfully with the mechanic.

---

## Interaction Effects

**With the tutorial system (5.00):** The first integrity violation should happen in a guided context — a specific tutorial mission where the game introduces the concept with explicit scaffolding. Introducing it in free play is too high a cognitive load.

**With the debrief mechanic (4.04a / "Debrief as Debugger"):** Every foreign element that activates during execution must be flagged in the debrief timeline with a distinctive marker. This is not optional — if the debrief doesn't show it clearly, the mechanic produces confusion rather than learning.

**With the buffer visualization (4.03):** Burned buffer slots (from degraded buffers) should use a consistent visual language with corrupted configuration elements — a dark, slightly textured "dead" state. The vocabulary of "damage to your system" should be visually unified.

**With command agents (3.17/3.18):** A command agent with "intrusion detection" skills running audits on subordinates during execution is the meta-level version of this mechanic. The command agent becomes the immune system of the robot army.

**With the combo system (4.05):** A discovery moment where the player uses a detected enemy hook against them — leaving it active, routing deceptive signals through it — should be a named, celebrated combo: "DISINFORMATION MANEUVER" or "HOOK JUDO." The game should notice when the player counter-exploits injected infrastructure.

**With information warfare signals (2.12):** Enemy-injected hooks and enemy deception signals are two sides of the same coin. An injected hook *receives* your data; a deception signal *sends* false data to you. Together they form a full enemy intelligence doctrine that the player must recognize and counter.

---

## Comparable Games and Media

**Hacknet (2015):** A hacking game that corrupts your terminal as malware spreads. File system entries change, programs disappear, screen artifacts appear. The horror of a compromised system is visual — you see it happening. Most direct analog: Hacknet demonstrates that UI degradation can be frightening and engaging rather than just frustrating. The key is transparency (you can always see and understand what's wrong).

**Dead Space (2008):** A horror game where the HUD is diegetically part of the protagonist's suit — armor damage is visible on your resource displays, damaged suit systems show visual glitches. "The interface is the body." When your suit takes damage, your UI takes damage. Robot Uprising can adopt this: the workbench is the player's consciousness interface to their robots; compromised robots show as compromised UI.

**Alien: Isolation (2014):** Motion tracker corruption mechanic — as the android threat level rises, your reliable motion tracker becomes unreliable. Starts showing ghost signals, delays updates, briefly goes dark. The player must continue navigating using a tool that's become untrustworthy. The lesson: degraded tools are scarier than no tools.

**FTL: Faster Than Light (2012):** Weapon systems and shield systems take damage during combat. When a system is damaged, its effectiveness degrades proportionally. When it's destroyed, its ability disappears until repaired. The player must triage: repair weapons now, or patch the hull? FTL normalizes "your tools take damage and must be managed." The closest existing game to Robot Uprising's degraded buffer mechanic.

**Keep Talking and Nobody Explodes (2015):** Time pressure makes UI reading stressful — the bomb is counting down while you're scanning for the correct wire. The stress is not in the complexity of the task but in the time constraint. Robot Uprising's timed prep phase borrows this stress vector.

**Receiver 2 (2020):** Guns can malfunction. Misfires, jams, failures. The player must diagnose and clear each malfunction manually. The mechanic teaches gun safety as a mechanical process. Analogously: agent misconfiguration causes specific, diagnosable failures that the player must learn to recognize.

**Bloodborne (2015):** Corruption spreads through the world as the player progresses — NPCs go mad, areas transform, the sky changes. The "bad ending" is a world fully consumed by the Great Ones. The "insanity" of the world is expressed visually, not just textually. The player *sees* their world being corrupted as a consequence of their actions.

**Papers Please (2013):** A bureaucratic process game where small discrepancies in documents are the entire puzzle. The player trains their eye to notice what's wrong. Robot Uprising's hidden corruption mechanic borrows this — can you spot the one modified rule value among twenty correct ones?

---

## Sensory Description

### The Corrupted Config

You open the workbench after a mission briefing that mentioned a network breach. The header bar — normally a clean dark gray — has a single line of amber text at its left edge: **"INTEGRITY 76% — 4 issues"**. Not an alarm. A fact. The same tone as "BATTERY 76%."

You click it.

The diff overlay slides in from the right. It's built like a diff in a code editor — red lines where values were changed, a right-side column showing new values. But it's not code, it's your scouts' rules. Rule 3 for SCOUT-A shows a red line through it: *patrol_radius: 40m*, and below it in green: *patrol_radius: 140m*. The diff format is clinical. Familiar. It looks like a merge conflict.

The moment you click [REVERT], a satisfying small animation: the line goes from green back to clean white, and the 76% ticks up to 80%. Each revert is +% of integrity. You're climbing back to 100%.

But the foreign hook is different. It doesn't appear in the diff panel — it's not a change to existing config. It's a *new element* that wasn't there before. You find it because the hook visualization has a red wire you don't recognize, thin and pulsing with a different rhythm than your hooks (your hooks are steady; the foreign hook pulses slightly, like a heartbeat that isn't yours).

You right-click it. The context menu appears with the sound of a soft click, like picking a lock. The option [PURGE] glows slightly. You click it. The red wire retracts — a quick, snapping-cord animation — and disappears. Your hook visualization is clean again.

Integrity: **100%**. The header bar goes from amber back to white. You exhale.

### The Burned Buffer

After an EMP event mid-battle, you return to the plan phase for the next mission and open the agent that took the hit. The buffer visualization on the right side of the inspector is normally 8 clean horizontal lines — bright when occupied, dim when empty, with the most recent entry glowing softly at the top.

Now it shows 6 lines and 2 black rectangles below them. The black rectangles aren't empty — they're *burned*. Each has a tiny spark icon in the left corner, static and unmoving, like a blown fuse indicator. They don't respond to hover. They don't animate. They're just dead.

The total capacity readout says **6/8 — 2 slots permanently degraded.** It doesn't say "lost" or "destroyed." It says "degraded" — which is worse somehow. They're still there. Still visible. A reminder.

You can still configure the agent. But you keep looking at those two dead slots, doing the math. Six is still workable. You retighten your filters — cut terrain data entirely, keep only threat signals and orders. Six is enough if you're careful.

The sound: when the EMP hits during execution, the buffer bar for affected agents makes a brief static burst — a crackling, digital noise — and then slots visibly pop dark one by one, fast, like a string of lights going out. In the relative silence of the execution phase, those pops are loud.

---

## Newly Discovered Aspects for the Frontier

This exploration reveals additional aspects worth deep diving:

1. **4.10 — Config integrity as a resource system**: the "integrity" percentage as a persistent resource that the player manages across sessions — some missions degrade it more, some repair actions restore it; trade-off between speed and thoroughness of pre-mission audits

2. **5.14 — Detection skills as complexity gate**: the "intrusion detection" skill as a tool that reveals hidden mechanics to advanced players without overwhelming beginners; a mechanic that scales with player sophistication

3. **2.16 — Counter-intelligence as offensive mechanic**: deliberately leaving enemy-injected hooks active and routing deceptive signals through them; the "hook judo" combo; how the game scaffolds this discovery

4. **4.11 — The "foreign fingerprint" visual language**: how to make enemy-modified elements visually distinct from player-modified elements vs. system-default elements; three-way visual vocabulary (mine / default / enemy) that must be immediately parseable

5. **6.10 — Sound design for corruption detection**: the audio vocabulary of integrity violations — what does a foreign hook sound like when detected, what does a revert sound like, what does mid-execution corruption sound like

---

## Sources

- EXAPUNKS analysis (this repository: `zachtronics-exapunks.md`) — primary reference for the gap this mechanic closes
- Hacknet (2015) — Team Fractal Alligator — direct analog for UI-level corruption as horror
- FTL: Faster Than Light (2012) — Subset Games — system damage and triage model
- Dead Space (2008) — EA Redwood Shores — diegetic health UI (armor as HUD)
- Alien: Isolation (2014) — Creative Assembly — degraded tool reliability as fear mechanic
- Papers, Please (2013) — Lucas Pope — discrepancy detection as core loop
- Receiver 2 (2020) — Wolfire Games — mechanical failure requiring active diagnosis
